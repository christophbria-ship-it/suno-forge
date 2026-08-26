import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const html = fs.readFileSync("index.html", "utf8");
const sources = ["data.js", "data-additions.js", "prompt-app.js", "tag-descriptions.js", "v10-features.js"]
  .map(file => [file, fs.readFileSync(file, "utf8")]);
const reportedErrors = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", error => reportedErrors.push(error));
virtualConsole.on("error", error => reportedErrors.push(error));

const dom = new JSDOM(html, {
  url: "https://the-simplist.test/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole
});
const { window } = dom;
const { document } = window;
window.confirm = () => true;

if (window.HTMLDialogElement) {
  window.HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  window.HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new window.Event("close"));
  };
}

for (const [file, source] of sources) {
  const exposeData = file === "data.js" ? "\nwindow.DATA = DATA;" : "";
  window.eval(`${source}${exposeData}\n//# sourceURL=${file}`);
}
document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
await wait(120);
assert.equal(reportedErrors.length, 0, `Initialization errors: ${reportedErrors.map(error => error.message).join(" | ")}`);
assert.match(document.getElementById("libraryStats").textContent, /1,962 tags/);

const vocalizedHeader = [...document.querySelectorAll(".family-card-header")]
  .find(node => node.textContent.includes("Vocalized & Harmony"));
assert.ok(vocalizedHeader, "The Vocalized & Harmony family must be available.");
vocalizedHeader.click();
await wait(120);

const cards = [...document.querySelectorAll("#expandedTagGrid .v10-tag")];
assert.equal(cards.length, 26, "All 26 Vocalized & Harmony choices should render with descriptions.");
const descriptions = cards.map(card => card.querySelector(".tag-description")?.textContent || "");
assert.ok(descriptions.every(Boolean), "Every enlarged tag card needs a description.");
assert.ok(descriptions.every(description => !/recognizable sound and feel of/i.test(description)), "The old placeholder sentence must not render.");

const aCappella = document.querySelector('#expandedTagGrid [data-name="A Cappella"] .tag-description');
const barbershop = document.querySelector('#expandedTagGrid [data-name="Barbershop"] .tag-description');
assert.match(aCappella?.textContent || "", /voices.+no instruments/i);
assert.match(barbershop?.textContent || "", /four close vocal parts.+ringing chords/i);

document.getElementById("familyDialog").close();
const categoryLabels = {
  "Vocal Delivery": "Delivery",
  "Vocal Range & Register": "Vocal Range",
  "Vocal Arrangement": "Vocal Arrange",
  "Harmony & Choir": "Harmony",
  "Rhythm & Groove": "Groove",
  "Mix & Master": "Mix",
  "Recording Space": "Space",
  "Texture & Atmosphere": "Texture"
};

let renderedTagCount = 0;
for (const category of Object.keys(window.DATA.categories)) {
  const label = categoryLabels[category] || category;
  const categoryButton = [...document.querySelectorAll(".category-tab,.optional-category-button")]
    .find(button => button.querySelector("span,strong")?.textContent.trim() === label);
  assert.ok(categoryButton, `${category} must have a category control.`);
  categoryButton.click();
  await wait(80);
  assert.equal(document.getElementById("activeCategoryTitle").textContent.trim(), category);

  const familyHeaders = [...document.querySelectorAll(".family-card-header")];
  assert.ok(familyHeaders.length > 0, `${category} must render at least one family.`);
  let categoryTagCount = 0;
  for (const familyHeader of familyHeaders) {
    familyHeader.click();
    await wait(55);

    const categoryCards = [...document.querySelectorAll("#expandedTagGrid .expanded-tag-button")];
    assert.ok(categoryCards.length > 0, `${category} must render enlarged tag cards.`);
    categoryTagCount += categoryCards.length;
    for (const card of categoryCards) {
      const name = card.querySelector("strong")?.textContent.trim() || card.dataset.name || "unknown tag";
      const description = card.querySelector(".tag-description")?.textContent.trim() || "";
      const expected = window.describeSimplistTag(name, category);
      assert.ok(description, `${category} / ${name} must show its description in the interface.`);
      assert.ok(description.length >= 45, `${category} / ${name} must show a meaningful audible description.`);
      assert.notEqual(description.toLowerCase(), name.toLowerCase(), `${category} / ${name} must not repeat its tag name as the description.`);
      assert.equal(description, expected, `${category} / ${name} must receive the description for its actual category.`);
    }
    document.getElementById("familyDialog").close();
    await wait(20);
  }
  assert.equal(categoryTagCount, window.DATA.categories[category].length, `${category} must show every tag with a description.`);
  renderedTagCount += categoryTagCount;
}

const instrumentsButton = [...document.querySelectorAll(".category-tab")]
  .find(button => button.querySelector("span")?.textContent.trim() === "Instruments");
assert.ok(instrumentsButton, "Instruments must remain available for the custom-tag test.");
instrumentsButton.click();
await wait(80);
document.querySelector(".family-card-header").click();
await wait(80);

const addDetails = document.querySelector(".dialog-family-add");
assert.ok(addDetails, "Every enlarged family must include an Add control.");
addDetails.open = true;
await wait(100);
assert.equal(document.querySelector(".dialog-family-add"), addDetails, "Opening Add must not rebuild the custom-tag form.");
assert.equal(addDetails.open, true, "The custom-tag form must stay open while the user types.");

const customName = "Glass Harmonica Swell";
const customDescription = "A rubbed glass tone blooms with a pure singing sustain, watery shimmer, and an eerie floating attack.";
const customInputs = addDetails.querySelectorAll("input");
customInputs[0].value = customName;
customInputs[1].value = customDescription;
[...addDetails.querySelectorAll("button")].find(button => button.textContent.trim() === "Save").click();
await wait(80);

const customCard = document.querySelector(`#expandedTagGrid [data-name="${customName}"]`);
assert.ok(customCard, "Saving must add the custom tag to the open family.");
assert.equal(customCard.querySelector(".tag-description")?.textContent.trim(), customDescription);
assert.equal(addDetails.open, false, "The form should close only after a successful save.");
assert.match(window.localStorage.getItem("simplist-v10-custom-family-tags") || "", /Glass Harmonica Swell/);
customCard.click();
assert.match(document.getElementById("styleOutput").value, /Glass Harmonica Swell/);
assert.match(window.localStorage.getItem("sunoForgeTagStudioV4") || "", /Glass Harmonica Swell/, "The active custom tag must survive reopening the app.");
await wait(80);
const builtInInstrument = [...document.querySelectorAll("#expandedTagGrid .expanded-tag-button")]
  .find(card => card.dataset.v10Custom !== "1");
builtInInstrument.click();
await wait(120);
assert.match(document.getElementById("styleOutput").value, /Glass Harmonica Swell/, "Later built-in choices must not erase the custom tag.");
document.getElementById("familyDialog").close();

assert.equal(renderedTagCount, 1962, "The interface must render descriptions for all 1,962 tags.");
assert.equal(document.querySelectorAll(".extra-category-block").length, 0, "Optional categories must not be duplicated in the main rail.");
assert.equal(document.querySelectorAll("#optionalCategoryGrid .optional-category-button").length, 13, "All optional categories must remain inside the single Extra / Optional dialog.");
assert.equal(document.getElementById("optionsBtn").hidden, false, "The single Extra / Optional control must stay available.");
assert.equal(reportedErrors.length, 0, `Runtime errors: ${reportedErrors.map(error => error.message).join(" | ")}`);

console.log("Description UI check passed: every category shows audible tag explanations and preserves existing controls.");
window.close();
