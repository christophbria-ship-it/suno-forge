import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const html = fs.readFileSync("index.html", "utf8");
const dataSource = fs.readFileSync("data.js", "utf8");
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
const byText = (selector, text) => [...document.querySelectorAll(selector)]
  .find(node => node.textContent.includes(text));

window.eval(dataSource + "\nwindow.DATA = DATA;");
window.eval(appSource);
document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
await wait(30);

assert.equal(reportedErrors.length, 0, `Initialization errors: ${reportedErrors.map(error => error.message).join(" | ")}`);
assert.match(document.getElementById("libraryStats").textContent, /1,940 tags/);
assert.match(document.getElementById("libraryStats").textContent, /20 categories/);
assert.match(document.getElementById("libraryStats").textContent, /nothing removed/);
assert.equal(document.querySelectorAll("#mainCategoryTabs .category-tab").length, 7, "Seven Suno-focused categories should stay on the main rail.");
assert.equal(document.querySelectorAll("#optionalCategoryGrid .optional-category-button").length, 13, "All remaining categories should stay in Options.");
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Genre");

const genreFamilies = [...document.querySelectorAll("#familyBoard .family-button")];
assert.equal(genreFamilies.length, 16, "Genre should show all reorganized musical families at once.");
assert.match(genreFamilies[0].textContent, /Vocalized & Harmony/);
assert.match(document.getElementById("familySummary").textContent, /569 total choices/);
assert.ok(byText("#tagGrid .tag-button", "A Cappella"), "Vocalized genres should include A Cappella.");
assert.ok(byText("#tagGrid .tag-button", "Barbershop"), "Vocalized genres should include Barbershop.");
assert.ok(byText("#tagGrid .tag-button", "Doo-Wop"), "Vocalized genres should include Doo-Wop.");

click(byText("#tagGrid .tag-button", "A Cappella"));
click(byText("#tagGrid .tag-button", "Barbershop"));
assert.equal(document.getElementById("categorySelectionStatus").textContent, "2 / 2 selected");
assert.match(document.getElementById("styleOutput").value, /A Cappella, Barbershop/);
assert.ok([...document.querySelectorAll("#tagGrid .tag-button")].filter(button => button.getAttribute("aria-pressed") === "false").every(button => button.disabled));

await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Mood", "Focused mode should advance after two choices.");
assert.equal(document.querySelectorAll("#familyBoard .family-button").length, 5, "Mood should be organized from mellow to extreme.");
assert.match(document.querySelector("#familyBoard .family-button").textContent, /Mellow & Gentle/);

const firstMood = document.querySelector("#tagGrid .tag-button");
const firstMoodName = firstMood.textContent;
click(firstMood);
click([...document.querySelectorAll("#tagGrid .tag-button")].find(button => button.textContent !== firstMoodName));
await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Vocals");

click(document.getElementById("optionsBtn"));
assert.equal(document.getElementById("optionsDialog").open, true, "Options should open as a compact dialog.");
click(byText("#optionalCategoryGrid .optional-category-button", "Effects"));
assert.equal(document.getElementById("optionsDialog").open, false);
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Effects");
assert.match(document.getElementById("optionsActiveLabel").textContent, /Effects/);
assert.match(document.getElementById("familySummary").textContent, /62 total choices/);

const extended = document.querySelector('input[name="promptSize"][value="extended"]');
extended.checked = true;
extended.dispatchEvent(new window.Event("change", { bubbles: true }));
assert.match(document.getElementById("characterCount").textContent, /\/ 1000/);

const activeBeforeExtendedChoices = document.getElementById("activeCategoryTitle").textContent;
const firstThreeEffects = [...document.querySelectorAll("#tagGrid .tag-button")].slice(0, 3);
firstThreeEffects.forEach(click);
await wait(720);
assert.equal(document.getElementById("activeCategoryTitle").textContent, activeBeforeExtendedChoices, "1,000-character mode must stay on the active category.");
assert.ok(document.getElementById("styleOutput").value.split(", ").length >= 7, "Extended mode should allow more than two tags in a category.");

let safety = 0;
while (safety++ < 30) {
  let candidate = [...document.querySelectorAll("#tagGrid .tag-button")]
    .find(button => button.getAttribute("aria-pressed") === "false" && !button.disabled);
  if (candidate) {
    click(candidate);
    continue;
  }
  const next = document.getElementById("nextPageBtn");
  if (next.disabled) break;
  click(next);
}
assert.ok(document.getElementById("styleOutput").value.length <= 1000, "Extended mode must never exceed 1,000 characters.");

click(document.getElementById("copyPromptBtn"));
await wait(10);
assert.equal(copied.at(-1), document.getElementById("styleOutput").value, "Copy should use the exact Suno style string.");

click(document.getElementById("mobileStyleBtn"));
assert.equal(document.getElementById("stylePanel").classList.contains("open"), true);
click(document.getElementById("closeStyleBtn"));
assert.equal(document.getElementById("stylePanel").classList.contains("open"), false);

click(document.getElementById("clearAllBtn"));
assert.equal(document.getElementById("styleOutput").value, "");
assert.equal(document.getElementById("activeCategoryTitle").textContent, "Genre");
assert.ok(window.localStorage.getItem("sunoForgeTagStudioV4"), "The simplified project should save locally.");

assert.equal(reportedErrors.length, 0, `Runtime errors: ${reportedErrors.map(error => error.message).join(" | ")}`);
console.log("UI checks passed: full tag families, focused auto-advance, Options, pagination, 1,000-character mode, copy, and clear.");
