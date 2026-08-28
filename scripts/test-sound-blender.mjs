import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const read = file => fs.readFileSync(file, "utf8");
const html = read("index.html");
const sources = {
  data: read("data.js"),
  additions: read("data-additions.js"),
  descriptions: read("tag-descriptions.js"),
  prompt: read("prompt-app.js"),
  structureData: read("structure-data.js"),
  profiles: read("sound-profiles.js"),
  ninetiesProfiles: read("sound-profiles-1990s.js"),
  structure: read("structure-app.js"),
  blender: read("sound-blender.js")
};

const reportedErrors = [];
const copied = [];
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
window.prompt = () => null;
window.matchMedia = query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent() { return true; }
});
window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
window.CSS = window.CSS || {};
window.CSS.escape = window.CSS.escape || (value => String(value).replace(/"/g, "\\\""));
document.execCommand = () => true;
Object.defineProperty(window.navigator, "clipboard", {
  configurable: true,
  value: { async writeText(value) { copied.push(value); } }
});

if (window.HTMLDialogElement) {
  window.HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute("open", ""); };
  window.HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new window.Event("close"));
  };
}

window.eval(`${sources.data}\n${sources.additions}\nwindow.DATA = DATA;`);
window.eval(sources.descriptions);
window.eval(sources.prompt);
window.eval(sources.structureData);
window.eval(sources.profiles);
window.eval(sources.ninetiesProfiles);
window.eval(sources.structure);
window.eval(sources.blender);
document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
await new Promise(resolve => setTimeout(resolve, 40));

const click = id => {
  const node = typeof id === "string" ? document.getElementById(id) : id;
  assert.ok(node, `Expected ${id} to exist.`);
  node.click();
};
const input = (id, value) => {
  const node = document.getElementById(id);
  node.value = value;
  node.dispatchEvent(new window.Event("input", { bubbles: true }));
};
const choose = (id, value) => {
  const node = document.getElementById(id);
  node.value = value;
  node.dispatchEvent(new window.Event("change", { bubbles: true }));
};
const setReference = (slot, name, focus) => {
  input(`soundReference${slot}`, name);
  choose(`soundFocus${slot}`, focus);
};
const build = () => click("buildSoundBlendBtn");

assert.equal(document.querySelectorAll(".page-switch-button").length, 3, "Sound, Blend, and Structure should be the only three pages.");
assert.deepEqual(
  [...document.querySelectorAll(".page-switch-button")].map(button => button.textContent.trim()),
  ["1 · Sound", "2 · Blend", "3 · Structure"]
);
assert.equal(document.getElementById("workspace").hidden, false);
click("blendPageBtn");
assert.equal(document.getElementById("blendPage").hidden, false, "Blend page should open from the top switcher.");
assert.equal(document.getElementById("workspace").hidden, true);
assert.equal(document.getElementById("clearAllBtn").hidden, true, "Sound-only Clear should not confuse the Blend page.");
assert.match(document.getElementById("soundProfileCount").textContent, /named profiles/);
assert.ok(parseInt(document.getElementById("soundProfileCount").textContent, 10) >= 250, "The expanded named library should be loaded.");

document.getElementById("ninetiesSoundDetails").open = true;
assert.equal(document.getElementById("ninetiesGenreFilter").options.length, 15, "All 14 genre groups plus the complete 1990s view should be available.");
assert.equal(document.querySelectorAll(".nineties-sound-button").length, 222, "The complete 1990s browser should show every profile.");
choose("ninetiesGenreFilter", "Hip-Hop");
assert.equal(document.querySelectorAll(".nineties-sound-button").length, 26, "Hip-Hop should expose its complete 1990s selection.");
assert.equal(document.getElementById("ninetiesSoundCount").textContent, "26 sounds");
const tupacButton = [...document.querySelectorAll(".nineties-sound-button")]
  .find(button => button.querySelector("strong")?.textContent === "2Pac");
assert.ok(tupacButton, "2Pac should be browsable under 1990s Hip-Hop.");
click(tupacButton);
assert.equal(document.getElementById("soundReference1").value, "2Pac", "Tapping a 1990s sound should fill Sound 1.");
assert.match(document.getElementById("soundReferenceStatus1").textContent, /1990s pick/i);
input("soundReference1", "");
input("soundReference2", "");
choose("ninetiesGenreFilter", "Country");
assert.ok([...document.querySelectorAll(".nineties-sound-button strong")].some(node => node.textContent === "Garth Brooks"));

setReference(1, "John Frusciante", "Guitar");
setReference(2, "Chris Cornell", "Vocals");
build();
let result = document.getElementById("soundBlendResult").value;
assert.match(result, /glassy clean single-coil tone/i);
assert.match(result, /powerful smoky baritone-to-tenor/i);
assert.doesNotMatch(result, /John|Frusciante|Chris|Cornell/i, "Named references must not leak into Suno wording.");
assert.equal(document.getElementById("addBlendToPromptBtn").disabled, false);

click("addBlendToPromptBtn");
assert.equal(document.getElementById("workspace").hidden, false, "Adding a blend should return to the Sound page.");
assert.equal(document.getElementById("styleOutput").value, result, "The exact editable result should be added to the main prompt.");

click("blendPageBtn");
setReference(1, "Chris Cornell", "Vocals");
setReference(2, "Beck", "Vocals");
build();
result = document.getElementById("soundBlendResult").value;
assert.match(result, /^Vocal sound blends/i);
assert.match(result, /anguished belts/i);
assert.match(result, /dry nasal talk-singing/i);
assert.doesNotMatch(result, /Chris|Cornell|Beck/i);
click("replacePromptWithBlendBtn");
assert.equal(document.getElementById("styleOutput").value, result, "Replace should remove the old prompt and use only the new blend.");

click("blendPageBtn");
setReference(1, "Acoustic Guitar", "Auto");
input("soundReference2", "");
build();
result = document.getElementById("soundBlendResult").value;
assert.ok(result.length > 70, "Any existing sound-library tag should produce its real audible description.");
assert.match(result, /^Guitar:/);

setReference(1, "Michael Jackson", "Full Sound");
setReference(2, "Metallica", "Full Sound");
build();
result = document.getElementById("soundBlendResult").value;
assert.match(result, /precision pop-funk/i);
assert.match(result, /massive heavy metal/i);
assert.match(result, /^Overall sound blends /);
assert.doesNotMatch(result, /sound sound/i);
assert.doesNotMatch(result, /Michael|Jackson|Metallica/i, "New 1990s references must also stay out of Suno wording.");

document.getElementById("customSoundDetails").open = true;
input("customSoundName", "Moon Glass Harp");
choose("customSoundType", "Instrument");
choose("customSoundFocus", "Auto");
input("customSoundDescription", "Moon Glass Harp makes a glassy struck tone with a short bell-like attack and a long trembling metallic decay.");
click("saveCustomSoundBtn");
assert.match(document.getElementById("customSoundStatus").textContent, /saved/i);
assert.match(window.localStorage.getItem("simplistSoundBlenderProfilesV1"), /Moon Glass Harp/);
input("soundReference2", "");
build();
result = document.getElementById("soundBlendResult").value;
assert.match(result, /glassy struck tone/i);
assert.doesNotMatch(result, /Moon Glass Harp/i, "Custom reference names must also be removed from output.");

input("soundReference1", "Definitely Unknown Music Person");
build();
assert.equal(document.getElementById("customSoundDetails").open, true, "An unknown sound should lead to the honest save-a-sound path.");
assert.match(document.getElementById("soundBlendMessage").textContent, /could not build/i);

input("soundReference1", "Beck");
choose("soundFocus1", "Full Sound");
input("soundReference2", "");
build();
click("copySoundBlendBtn");
await new Promise(resolve => setTimeout(resolve, 5));
assert.equal(copied.at(-1), document.getElementById("soundBlendResult").value);

click("structurePageBtn");
assert.equal(document.getElementById("structurePage").hidden, false);
assert.equal(document.getElementById("blendPage").hidden, true);
assert.match(document.getElementById("libraryStats").textContent, /Page 3/);

assert.equal(reportedErrors.length, 0, `Runtime errors: ${reportedErrors.map(error => error.message).join(" | ")}`);
console.log("Sound Blender checks passed: named lookup, part focus, two-way blending, name removal, prompt add/replace, library tags, custom sounds, copy, and three-page navigation.");
