import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const html = fs.readFileSync("index.html", "utf8");
const dataSource = fs.readFileSync("data.js", "utf8");
const appSource = fs.readFileSync("prompt-app.js", "utf8");
const reportedErrors = [];
const virtualConsole = new VirtualConsole();

virtualConsole.on("jsdomError", error => reportedErrors.push(error));
virtualConsole.on("error", error => reportedErrors.push(error));

const dom = new JSDOM(html, {
  url: "https://suno-forge.test/#brief",
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole
});

const { window } = dom;
const { document } = window;

window.matchMedia = query => ({
  matches: query.includes("prefers-reduced-motion") ? false : false,
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent() {
    return true;
  }
});

window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
window.CSS ??= {};
window.CSS.escape = value => String(value).replace(/[\\"']/g, "\\$&");
window.confirm = () => true;

if (window.HTMLDialogElement) {
  window.HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  window.HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
  };
}
window.HTMLFormElement.prototype.requestSubmit = function requestSubmit() {};

Object.defineProperty(window.navigator, "clipboard", {
  configurable: true,
  value: {
    async writeText() {}
  }
});

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const input = (node, value) => {
  node.value = value;
  node.dispatchEvent(new window.Event("input", { bubbles: true }));
};
const click = node => {
  assert.ok(node, "Expected a clickable element.");
  node.click();
};

window.eval(dataSource + "\nwindow.DATA = DATA;");
window.eval(appSource);
document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
await wait(20);

assert.equal(document.querySelectorAll(".recipe-card").length, 6, "All starter recipes should render.");
assert.equal(document.querySelectorAll(".category").length, 20, "Every sound category should render.");
assert.equal(document.querySelectorAll(".category-grid").length, 0, "Sound options should load lazily.");

const recipeExpectations = [
  ["Appalachian folk", "82 BPM"],
  ["alternative rock", "112 BPM"],
  ["dark cinematic", "76 BPM"],
  ["Modern soul", "92 BPM"],
  ["outlaw country", "126 BPM"],
  ["post-punk", "132 BPM"]
];
const recipeButtons = [...document.querySelectorAll(".recipe-card")];
recipeButtons.forEach((button, index) => {
  click(button);
  assert.match(document.getElementById("briefInput").value, new RegExp(recipeExpectations[index][0], "i"));
  assert.equal(document.getElementById("bpmOutput").textContent, recipeExpectations[index][1]);
  assert.equal(document.getElementById("recipeSelect").value, String(index));
  assert.equal(button.getAttribute("aria-pressed"), "true");
});

const recipeSelect = document.getElementById("recipeSelect");
const briefBeforeEmptyChoice = document.getElementById("briefInput").value;
recipeSelect.value = "";
recipeSelect.dispatchEvent(new window.Event("change", { bubbles: true }));
assert.equal(document.getElementById("briefInput").value, briefBeforeEmptyChoice);

recipeSelect.value = "1";
recipeSelect.dispatchEvent(new window.Event("change", { bubbles: true }));
assert.match(document.getElementById("briefInput").value, /alternative rock/i);
assert.equal(document.getElementById("bpmOutput").textContent, "112 BPM");

click(recipeButtons[0]);
assert.match(document.getElementById("briefInput").value, /Appalachian folk/i);
assert.equal(document.getElementById("selectedCount").textContent, "8 selected");
assert.equal(document.getElementById("bpmOutput").textContent, "82 BPM");

click(document.querySelector('#panel-brief [data-go="sound"]'));
assert.equal(document.getElementById("panel-brief").hidden, true);
assert.equal(document.getElementById("panel-sound").hidden, false);
assert.equal(window.location.hash, "#sound");

const search = document.getElementById("tagSearch");
input(search, "grunge");
const searchResults = document.getElementById("searchResults");
assert.equal(searchResults.hidden, false);
assert.ok(searchResults.querySelectorAll("button").length >= 1, "Sound search should return matching tags.");

const quickPick = document.querySelector("#quickPickGrid [data-tag]");
const selectedBeforeQuickPick = Number(document.getElementById("selectedCount").textContent.match(/\d+/)?.[0]);
click(quickPick);
const selectedAfterQuickPick = Number(document.getElementById("selectedCount").textContent.match(/\d+/)?.[0]);
assert.notEqual(selectedAfterQuickPick, selectedBeforeQuickPick, "Quick picks should toggle sound choices.");

const categoryJump = document.getElementById("categoryJump");
const firstCategoryOption = categoryJump.querySelector("option:nth-child(2)");
categoryJump.value = firstCategoryOption.value;
categoryJump.dispatchEvent(new window.Event("change", { bubbles: true }));
assert.equal(document.getElementById(firstCategoryOption.value).open, true);
assert.ok(document.getElementById(firstCategoryOption.value).querySelector(".category-grid"));

click(document.querySelector('#panel-sound [data-go="shape"]'));
input(document.getElementById("bpmRange"), "95");
input(
  document.getElementById("productionInput"),
  "Close vocal, narrow verses, live drums entering late, then a wide final chorus."
);
input(document.getElementById("excludeInput"), "glossy pop polish, EDM drops");

const compactMode = document.querySelector('input[name="promptMode"][value="compact"]');
compactMode.checked = true;
compactMode.dispatchEvent(new window.Event("change", { bubbles: true }));

const limit = document.getElementById("limitSelect");
limit.value = "600";
limit.dispatchEvent(new window.Event("input", { bubbles: true }));

click(document.querySelector('#panel-shape [data-go="export"]'));
const output = document.getElementById("promptOutput").value;
assert.match(output, /Track: 95 BPM/);
assert.match(output, /Creative direction:/);
assert.ok(output.length <= 600, "The generated prompt must respect the selected character limit.");
assert.doesNotMatch(output, /Avoid:/, "Exclude Styles should stay out of the style prompt.");
assert.match(document.getElementById("excludePreview").textContent, /glossy pop polish/);
assert.equal(document.getElementById("copyExcludeBtn").disabled, false);
assert.ok(Number(document.getElementById("qualityScore").textContent) >= 65);

input(document.getElementById("promptOutput"), "A manually edited studio prompt.");
assert.equal(document.getElementById("promptCount").textContent, "32 / 600");
assert.match(document.getElementById("outputStatus").textContent, /Manual edits saved/);

input(document.getElementById("presetNameInput"), "Test preset");
click(document.getElementById("savePresetBtn"));
assert.equal(document.getElementById("savedCount").textContent, "1");
assert.equal(document.querySelectorAll("#presetList .saved-item").length, 1);

click(document.getElementById("newProjectBtn"));
assert.equal(document.getElementById("resetDialog").hasAttribute("open"), true);
click(document.getElementById("confirmResetBtn"));
assert.equal(document.getElementById("briefInput").value, "");
assert.equal(document.getElementById("selectedCount").textContent, "0 selected");
assert.equal(document.getElementById("panel-brief").hidden, false);

await wait(240);
const saved = JSON.parse(window.localStorage.getItem("sunoForgeProjectV3"));
assert.equal(saved.brief, "");
assert.deepEqual(saved.selected, []);

assert.deepEqual(
  reportedErrors,
  [],
  "Browser simulation errors: " + reportedErrors.map(error => error.message).join("; ")
);

console.log("UI flow passed: recipe → sound search → production → export → edit → preset → reset.");
dom.window.close();
