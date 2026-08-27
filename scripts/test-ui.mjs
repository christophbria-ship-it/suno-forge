import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const html = fs.readFileSync("index.html", "utf8");
const dataSource = fs.readFileSync("data.js", "utf8");
const descriptionSource = fs.readFileSync("tag-descriptions.js", "utf8");
const appSource = fs.readFileSync("prompt-app.js", "utf8");
const reportedErrors = [];
const copied = [];
const virtualConsole = new VirtualConsole();

virtualConsole.on("jsdomError", error => reportedErrors.push(error));
virtualConsole.on("error", error => reportedErrors.push(error));

const dom = new JSDOM(html, {
  url: "https://suno-forge.test/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole
});

const { window } = dom;
const { document } = window;

Object.defineProperty(window, "innerWidth", { configurable: true, value: 1024 });
Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });
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

Object.defineProperty(window.navigator, "clipboard", {
  configurable: true,
  value: {
    async writeText(value) {
      copied.push(value);
    }
  }
});

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const click = node => {
  assert.ok(node, "Expected a clickable element.");
  node.click();
};
const byText = (selector, text, exact = false) => [...document.querySelectorAll(selector)]
  .find(node => {
    const value = node.dataset?.tag || node.querySelector("strong")?.textContent.trim() || node.textContent.trim();
    return exact ? value === text : value.includes(text);
  });

window.eval(dataSource + "\nwindow.DATA = DATA;");
window.eval(descriptionSource);
window.eval(appSource);
document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
await wait(30);

assert.equal(reportedErrors.length, 0, `Initialization errors: ${reportedErrors.map(error => error.message).join(" | ")}`);
assert.match(document.getElementById("libraryStats").textContent, /1,941 tags/);
assert.match(document.getElementById("libraryStats").textContent, /20 categories/);
assert.match(document.getElementById("libraryStats").textContent, /nothing removed/);
assert.equal(document.querySelectorAll("#mainCategoryTabs .category-tab").length, 7, "Seven Suno-focused categories should stay on the main rail.");
assert.deepEqual(
  [...document.querySelectorAll("#mainCategoryTabs .category-tab span")].map(node => node.textContent.trim()),
  [
    "Genre",
    "Era",
    "Mood/Emotion",
    "Tempo/Groove",
    "Instruments",
    "Vocal Style/Delivery",
    "Production/Sound Quality"
  ],
  "The main rail must use the agreed seven tags in the agreed order."
);
assert.equal(document.querySelectorAll("#optionalCategoryGrid .optional-category-button").length, 11, "Only the eleven remaining categories should stay in Options.");
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Genre");
assert.equal(document.getElementById("previousPageBtn"), null, "Page-turning controls must be gone.");
assert.equal(document.getElementById("nextPageBtn"), null, "Page-turning controls must be gone.");

const genreFamilies = [...document.querySelectorAll("#familyBoard .family-card")];
assert.equal(genreFamilies.length, 16, "All Genre family boxes should be visible together.");
assert.match(genreFamilies[0].textContent, /Vocalized & Harmony/);
assert.match(document.getElementById("familySummary").textContent, /all 570 choices/);
assert.equal(document.querySelectorAll("#familyBoard .wall-tag-button").length, 570, "Every Genre choice should be rendered at once.");
assert.ok(byText("#familyBoard .wall-tag-button", "Acoustic", true), "The standalone Acoustic genre should be visible.");
assert.ok(byText("#familyBoard .wall-tag-button", "A Cappella", true));
assert.ok(byText("#familyBoard .wall-tag-button", "Barbershop", true));
assert.ok(byText("#familyBoard .wall-tag-button", "Doo-Wop", true));

click(byText("#familyBoard .family-card-header", "Vocalized & Harmony"));
assert.equal(document.getElementById("familyDialog").open, true, "A family should enlarge over the same screen.");
assert.match(document.getElementById("expandedFamilyTitle").textContent, /Vocalized & Harmony/);
assert.equal(document.querySelectorAll("#expandedTagGrid .expanded-tag-button").length, 26);

click(byText("#expandedTagGrid .expanded-tag-button", "A Cappella", true));
click(byText("#expandedTagGrid .expanded-tag-button", "Barbershop", true));
assert.equal(document.getElementById("categorySelectionStatus").textContent, "2 / 2 selected");
assert.match(document.getElementById("styleOutput").value, /A Cappella, Barbershop/);
assert.ok([...document.querySelectorAll("#familyBoard .wall-tag-button")]
  .filter(button => button.getAttribute("aria-pressed") === "false")
  .every(button => button.disabled));

await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Era", "Focused mode should advance to Era after Genre.");
assert.equal(document.getElementById("familyDialog").open, false, "The enlarged family should close when the next main category opens.");
assert.equal(document.querySelectorAll("#familyBoard .family-card").length, 5, "Era should show all five chronological family boxes.");
assert.equal(document.querySelectorAll("#familyBoard .wall-tag-button").length, 30, "Every Era choice should be rendered at once.");

const eraNames = [...document.querySelectorAll("#familyBoard .wall-tag-button")].slice(0, 2).map(button => button.dataset.tag);
eraNames.forEach(name => click(byText("#familyBoard .wall-tag-button", name, true)));
await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Mood/Emotion");
assert.equal(document.querySelectorAll("#familyBoard .family-card").length, 5, "Mood should show all five mellow-to-extreme boxes.");
assert.equal(document.querySelectorAll("#familyBoard .wall-tag-button").length, 70, "Every Mood choice should be rendered at once.");
assert.match(document.querySelector("#familyBoard .family-card").textContent, /Mellow & Gentle/);

const firstMoodName = document.querySelector("#familyBoard .wall-tag-button").dataset.tag;
click(byText("#familyBoard .wall-tag-button", firstMoodName, true));
click([...document.querySelectorAll("#familyBoard .wall-tag-button")].find(button => button.dataset.tag !== firstMoodName));
await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Tempo/Groove");
assert.equal(document.querySelectorAll("#familyBoard .family-card").length, 5);
assert.equal(document.querySelectorAll("#familyBoard .wall-tag-button").length, 50);

const grooveNames = [...document.querySelectorAll("#familyBoard .wall-tag-button")].slice(0, 2).map(button => button.dataset.tag);
grooveNames.forEach(name => click(byText("#familyBoard .wall-tag-button", name, true)));
await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Instruments");
assert.equal(document.querySelectorAll("#familyBoard .wall-tag-button").length, 523);

click(byText("#familyBoard .wall-tag-button", "Acoustic Guitar", true));
click(byText("#familyBoard .wall-tag-button", "Electric Guitar", true));
await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Vocal Style/Delivery");
assert.equal(document.querySelectorAll("#familyBoard .family-card").length, 13, "All vocal style, delivery, and range families should share one main section.");
assert.equal(document.querySelectorAll("#familyBoard .wall-tag-button").length, 132, "No vocal choices should be lost when the three old steps are combined.");
assert.match(document.getElementById("familySummary").textContent, /all 132 choices/);

click(byText("#familyBoard .wall-tag-button", "Male Vocal", true));
click(byText("#familyBoard .wall-tag-button", "Close-Mic Vocal", true));
await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Production/Sound Quality");
assert.equal(document.querySelectorAll("#familyBoard .wall-tag-button").length, 62);

const productionNames = [...document.querySelectorAll("#familyBoard .wall-tag-button")].slice(0, 2).map(button => button.dataset.tag);
productionNames.forEach(name => click(byText("#familyBoard .wall-tag-button", name, true)));
await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Production/Sound Quality", "The final main step should stay open after two choices.");

click(document.getElementById("optionsBtn"));
assert.equal(document.getElementById("optionsDialog").open, true, "Options should open as a compact dialog.");
click(byText("#optionalCategoryGrid .optional-category-button", "Effects"));
assert.equal(document.getElementById("optionsDialog").open, false);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Effects");
assert.match(document.getElementById("optionsActiveLabel").textContent, /Effects/);
assert.match(document.getElementById("familySummary").textContent, /all 62 choices/);
assert.equal(document.querySelectorAll("#familyBoard .wall-tag-button").length, 62, "Every Effects choice should be rendered at once.");

const extended = document.querySelector('input[name="promptSize"][value="extended"]');
extended.checked = true;
extended.dispatchEvent(new window.Event("change", { bubbles: true }));
assert.match(document.getElementById("characterCount").textContent, /\/ 1000/);

const activeBeforeExtendedChoices = document.getElementById("activeCategoryTitle").textContent;
const effectNames = [...document.querySelectorAll("#familyBoard .wall-tag-button")].slice(0, 3).map(button => button.dataset.tag);
effectNames.forEach(name => click(byText("#familyBoard .wall-tag-button", name, true)));
await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, activeBeforeExtendedChoices, "1,000-character mode must stay on the active category.");
assert.ok(document.getElementById("styleOutput").value.split(", ").length >= 7, "Extended mode should allow more than two tags in a category.");

let safety = 0;
while (safety++ < 30) {
  const candidate = [...document.querySelectorAll("#familyBoard .wall-tag-button")]
    .find(button => button.getAttribute("aria-pressed") === "false" && !button.disabled);
  if (!candidate) break;
  click(candidate);
}
assert.ok(document.getElementById("styleOutput").value.length <= 1000, "Extended mode must never exceed 1,000 characters.");

click(document.getElementById("copyPromptBtn"));
await wait(10);
assert.equal(copied.at(-1), document.getElementById("styleOutput").value, "Copy should use the exact Suno style string.");

const tagWorkspace = document.getElementById("tagWorkspace");
const stylePanel = document.getElementById("stylePanel");
assert.ok(tagWorkspace.compareDocumentPosition(stylePanel) & window.Node.DOCUMENT_POSITION_FOLLOWING, "Style should sit after the tag wall.");
assert.equal(document.getElementById("mobileStyleBtn"), null, "Style should no longer hide in a phone drawer.");

click(document.getElementById("clearAllBtn"));
assert.equal(document.getElementById("styleOutput").value, "");
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Genre");
assert.ok(window.localStorage.getItem("sunoForgeTagStudioV4"), "The tag studio should save locally.");

assert.equal(reportedErrors.length, 0, `Runtime errors: ${reportedErrors.map(error => error.message).join(" | ")}`);
console.log("UI checks passed: all-at-once tag walls, family enlargement, Focused auto-advance, Options, 1,000-character mode, copy, and clear.");
