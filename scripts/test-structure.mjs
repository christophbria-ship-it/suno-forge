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
window.eval(structureApp);
document.dispatchEvent(new window.Event("DOMContentLoaded", { bubbles: true }));
await new Promise(resolve => setTimeout(resolve, 20));

document.getElementById("structurePageBtn").click();
await new Promise(resolve => setTimeout(resolve, 20));
const structurePage = document.getElementById("structurePage");
const sectionDrawer = structurePage.querySelector(".section-drawer");
const tagDrawer = structurePage.querySelector(".tag-drawer");

assert.equal(structurePage.hidden, false, "Structure should open from Page 3.");
assert.equal(document.querySelectorAll(".song-section").length, 9, "The normal nine-section song layout should stay intact.");
assert.equal(document.querySelectorAll(".song-section.active").length, 1, "Only one writing section should be active at a time.");
assert.equal(sectionDrawer.open, false, "Add Section should start closed on a phone.");
assert.equal(tagDrawer.open, false, "Bracket Tags should start closed on a phone.");

sectionDrawer.open = true;
sectionDrawer.dispatchEvent(new window.Event("toggle"));
tagDrawer.open = true;
tagDrawer.dispatchEvent(new window.Event("toggle"));
assert.equal(sectionDrawer.open, false, "Opening Bracket Tags should close Add Section.");
assert.equal(tagDrawer.open, true);

tagDrawer.open = false;
sectionDrawer.open = true;
sectionDrawer.dispatchEvent(new window.Event("toggle"));
document.querySelector(".basic-section-button").click();
await new Promise(resolve => setTimeout(resolve, 20));
assert.equal(document.querySelectorAll(".song-section").length, 10, "Tapping a section choice should add it.");
assert.equal(sectionDrawer.open, false, "The section chooser should close after adding on a phone.");

tagDrawer.open = true;
tagDrawer.dispatchEvent(new window.Event("toggle"));
const firstTag = document.querySelector(".structure-meta-button");
const insertedTag = firstTag.textContent;
firstTag.click();
await new Promise(resolve => setTimeout(resolve, 20));
assert.equal(tagDrawer.open, false, "The bracket-tag chooser should close after inserting on a phone.");
assert.match(document.querySelector(".song-section.active .section-lyrics").value, new RegExp(insertedTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

const inactiveLabel = document.querySelector(".song-section:not(.active) .section-label");
inactiveLabel.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
assert.equal(inactiveLabel.closest(".song-section").classList.contains("active"), true, "A section title should open that one writing area.");
assert.equal(document.querySelectorAll(".song-section.active").length, 1);

document.getElementById("copyForSunoBtn").click();
await new Promise(resolve => setTimeout(resolve, 10));
assert.ok(copied.at(-1)?.includes(insertedTag), "Copy for Suno should preserve the inserted bracket tag.");

assert.match(structureCss, /\.song-section:not\(\.active\)\s*>\s*\.section-lyrics\s*\{[\s\S]*display:\s*none/i);
assert.match(structureCss, /\.song-section:not\(\.active\)\s+\.section-delete-button\s*\{[\s\S]*display:\s*none/i);
assert.match(structureCss, /--structure-accent:\s*#a7b9a4/i);
assert.match(structureCss, /font-family:\s*system-ui/i);
assert.equal(errors.length, 0, `Structure runtime errors: ${errors.map(error => error.message).join(" | ")}`);

console.log("Structure checks passed: calm single workspace, one active editor, exclusive drawers, section add, bracket insert, copy, and phone-safe behavior.");
