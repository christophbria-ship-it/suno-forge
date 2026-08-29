import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM, VirtualConsole } from "jsdom";

const html = fs.readFileSync("index.html", "utf8");
const structureData = fs.readFileSync("structure-data.js", "utf8");
const structureApp = fs.readFileSync("structure-app.js", "utf8");
const structureCss = fs.readFileSync("structure-clean.css", "utf8");
const errors = [];
const copied = [];
const virtualConsole = new VirtualConsole();
virtualConsole.on("jsdomError", error => errors.push(error));
virtualConsole.on("error", error => errors.push(error));

const dom = new JSDOM(html, {
  url: "https://the-simplist.test/",
  runScripts: "outside-only",
  pretendToBeVisual: true,
  virtualConsole
});
const { window } = dom;
const { document } = window;
const settle = (milliseconds = 20) => new Promise(resolve => setTimeout(resolve, milliseconds));

window.matchMedia = query => ({
  matches: /max-width:\s*720px/.test(query),
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {}
});
window.confirm = () => true;
window.prompt = () => "Custom Part";
window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
window.CSS = window.CSS || {};
window.CSS.escape = window.CSS.escape || (value => String(value).replace(/"/g, "\\\""));
document.execCommand = () => true;
Object.defineProperty(window.navigator, "clipboard", {
  configurable: true,
  value: { async writeText(value) { copied.push(value); } }
});

window.eval(structureData);
const expectedFamilyCount = window.eval("STRUCTURE_LIBRARY.families.length");
const expectedTagCount = window.eval("STRUCTURE_LIBRARY.families.reduce((total, family) => total + family.tags.length, 0)");
window.eval(structureApp);
document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
await settle();

document.getElementById("structurePageBtn").click();
await settle();
const structurePage = document.getElementById("structurePage");
const sectionDrawer = structurePage.querySelector(".section-drawer");
const tagDrawer = structurePage.querySelector(".tag-drawer");

assert.equal(structurePage.hidden, false, "Structure should open from Page 3.");
assert.equal(document.querySelectorAll(".song-section").length, 9, "The normal nine-section song layout should stay intact.");
assert.equal(document.querySelectorAll(".section-lyrics").length, 9, "Every lyric writing box should remain in the page.");
assert.equal(document.querySelectorAll(".section-drag-handle").length, 9, "Every section should retain its drag handle.");
assert.equal(document.querySelectorAll(".section-move-button").length, 18, "Every section should retain both move controls.");
assert.equal(document.querySelectorAll(".section-delete-button").length, 9, "Every section should retain its delete control.");
assert.equal(sectionDrawer.open, false, "Add / Move Sections should start closed on a phone.");
assert.equal(tagDrawer.open, true, "The full bracket-tag library should open by default on a phone.");
assert.equal(document.querySelectorAll(".structure-tag-card").length, expectedFamilyCount, "Every bracket-tag family should render.");
assert.equal(expectedFamilyCount, 8, "The complete bracket library should retain all eight families.");
assert.equal(document.querySelectorAll(".structure-meta-button").length, expectedTagCount, "Every built-in bracket tag should render.");
assert.equal(expectedTagCount, 183, "The complete bracket library should retain all 183 built-in tags.");

sectionDrawer.open = true;
sectionDrawer.dispatchEvent(new window.Event("toggle"));
await settle(5);
assert.equal(sectionDrawer.open, true);
assert.equal(tagDrawer.open, false, "Opening Add / Move Sections should close Bracket Tags.");

tagDrawer.open = true;
tagDrawer.dispatchEvent(new window.Event("toggle"));
await settle(5);
assert.equal(sectionDrawer.open, false, "Reopening Bracket Tags should close Add / Move Sections.");
assert.equal(tagDrawer.open, true);

const firstTag = document.querySelector(".structure-meta-button");
const insertedTag = firstTag.textContent;
firstTag.click();
await settle();
assert.equal(tagDrawer.open, true, "The bracket-tag library should stay open after an insertion.");
assert.match(
  document.querySelector(".song-section.active .section-lyrics").value,
  new RegExp(insertedTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
);

sectionDrawer.open = true;
sectionDrawer.dispatchEvent(new window.Event("toggle"));
await settle(5);
document.querySelector(".basic-section-button").click();
await settle();
assert.equal(document.querySelectorAll(".song-section").length, 10, "Tapping a section choice should add it.");
assert.equal(sectionDrawer.open, false, "The Add / Move Sections panel should close after adding on a phone.");
assert.equal(tagDrawer.open, true, "The bracket library should return after adding a section.");
assert.equal(document.querySelectorAll(".section-lyrics").length, 10, "The new section should include its expanded writing box.");

document.getElementById("copyForSunoBtn").click();
await settle(10);
assert.ok(copied.at(-1)?.includes(insertedTag), "Copy for Suno should preserve the inserted bracket tag.");

assert.match(structureCss, /--structure-canvas:\s*#2b160c/i);
assert.match(structureCss, /--structure-accent-strong:\s*#f1d29c/i);
assert.match(structureCss, /\.structure-tag-boxes\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/i);
assert.match(structureCss, /\.structure-page \.song-section > \.section-lyrics\s*\{[\s\S]*display:\s*block/i);
assert.doesNotMatch(structureCss, /\.song-section:not\(\.active\)/i, "No writing section may be hidden just because it is inactive.");
assert.match(html, /class="structure-tool-drawer tag-drawer" open/);
assert.match(html, /\[ \] BRACKET TAGS — TAP TO OPEN/);
assert.equal(errors.length, 0, `Structure runtime errors: ${errors.map(error => error.message).join(" | ")}`);

console.log("Structure checks passed: reference layout, 8 families, all 183 bracket tags, expanded lyric boxes, exclusive drawers, insertion, section add, and copy.");
