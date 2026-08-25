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
assert.equal(document.querySelectorAll(".extra-category-list .optional-category-button").length, 13, "The existing optional-category rail behavior must remain intact.");
assert.equal(reportedErrors.length, 0, `Runtime errors: ${reportedErrors.map(error => error.message).join(" | ")}`);

console.log("Description UI check passed: the live card layer shows 26 distinct Vocalized & Harmony explanations and preserves existing controls.");
window.close();
