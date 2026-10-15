import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { createServer } from "node:net";
import puppeteer from "puppeteer-core";

const artifacts = process.env.ARTIFACT_DIR || "/opt/cursor/artifacts";
mkdirSync(artifacts, { recursive: true });

const port = await new Promise((resolve, reject) => {
  const probe = createServer();
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    probe.close(() => resolve(typeof address === "object" ? address.port : 0));
  });
  probe.on("error", reject);
});

const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
  stdio: "ignore"
});
const base = `http://127.0.0.1:${port}/`;
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.ok) return;
    } catch {
      // The static server is still starting.
    }
    await sleep(100);
  }
  throw new Error("The local app server did not start.");
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-dev-shm-usage"]
});

function track(page) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("dialog", dialog => dialog.accept());
  return errors;
}

async function openApp(width, height) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  const errors = track(page);
  await page.setViewport({ width, height, isMobile: width < 500, hasTouch: width < 500 });
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForFunction(() => /Step 1/.test(document.getElementById("libraryStats")?.textContent || ""));
  return { page, errors, context };
}

function assertNoHorizontalScroll(measure, label) {
  assert.ok(measure.overflowX <= 1, `${label} has horizontal overflow of ${measure.overflowX}px`);
  assert.equal(measure.offscreen.length, 0, `${label} controls leave the screen: ${JSON.stringify(measure.offscreen)}`);
}

await waitForServer();
try {

const desktop = await openApp(1280, 800);
const { page } = desktop;

const loaded = await page.evaluate(() => ({
  steps: [...document.querySelectorAll(".page-switch-button")].map(button => button.textContent.trim()),
  brief: document.getElementById("briefPage").hidden,
  tempo: document.getElementById("tempoValue").textContent.trim(),
  prompt: document.getElementById("styleOutput").value,
  selected: [...document.querySelectorAll("[aria-pressed='true']")].map(button => button.dataset.tag)
}));
assert.deepEqual(loaded.steps, ["1 · Brief", "2 · Sound", "3 · Shape", "4 · Export"]);
assert.equal(loaded.brief, false);
assert.equal(loaded.tempo, "120 BPM");
assert.equal(loaded.prompt, "");
assert.deepEqual(loaded.selected, []);
await page.screenshot({ path: `${artifacts}/desktop-brief.png` });

await page.type("#styleOutput", "handmade night drive");
await page.$eval("#tempoRange", input => {
  input.value = "96";
  input.dispatchEvent(new Event("input", { bubbles: true }));
});
await page.waitForFunction(() => document.getElementById("tempoValue").textContent.includes("96"));
assert.match(await page.$eval("#styleOutput", node => node.value), /handmade night drive/);
assert.match(await page.$eval("#styleOutput", node => node.value), /96 BPM/);

await page.click("#soundPageBtn");
await page.waitForFunction(() => document.getElementById("workspace").hidden === false);
const soundLayout = await page.evaluate(() => {
  const panel = document.getElementById("stylePanel").getBoundingClientRect();
  const output = document.getElementById("styleOutput").getBoundingClientRect();
  const appalachian = [...document.querySelectorAll("[data-tag='Appalachian'],[data-tag='Appalachian Folk']")]
    .filter(button => button.getAttribute("aria-pressed") === "true")
    .map(button => button.dataset.tag);
  return {
    panelLeft: Math.round(panel.left),
    outputLeft: Math.round(output.left),
    outputRight: Math.round(output.right),
    panelRight: Math.round(panel.right),
    appalachian
  };
});
assert.deepEqual(soundLayout.appalachian, []);
assert.ok(soundLayout.outputLeft < soundLayout.panelLeft + 80, "The prompt box should span the prompt panel instead of sitting in a right column.");
assert.ok(soundLayout.outputRight > soundLayout.panelRight - 40, "The prompt box should reach the panel's right edge.");

await page.evaluate(() => document.querySelector("#familyBoard .family-card-header").click());
await page.waitForSelector("#familyDialog[open] .dialog-family-add");
await page.evaluate(() => {
  document.querySelector(".dialog-family-add").open = true;
});
await page.focus(".dialog-family-add input");
await page.type(".dialog-family-add input", "Night Radio");
await page.setViewport({ width: 1100, height: 700 });
await sleep(150);
const customForm = await page.evaluate(() => ({
  dialog: document.getElementById("familyDialog").open,
  details: document.querySelector(".dialog-family-add").open,
  value: document.querySelector(".dialog-family-add input").value
}));
assert.equal(customForm.dialog, true, "The custom-entry dialog should stay open.");
assert.equal(customForm.details, true, "The custom-entry form should stay open while typing.");
assert.equal(customForm.value, "Night Radio");
await page.setViewport({ width: 1280, height: 800 });
await page.evaluate(() => document.getElementById("familyDialog").close());

const genrePicks = await page.evaluate(() => {
  const buttons = [...document.querySelectorAll("#familyBoard .wall-tag-button")].slice(0, 2);
  buttons.forEach(button => button.click());
  return buttons.map(button => button.dataset.tag);
});
await page.waitForFunction(() => document.getElementById("activeCategoryTitle").textContent === "Era");
await page.evaluate(() => {
  [...document.querySelectorAll("#familyBoard .wall-tag-button")].slice(0, 2).forEach(button => button.click());
});
await page.waitForFunction(() => document.getElementById("activeCategoryTitle").textContent === "Mood/Emotion");

await page.evaluate(() => {
  document.querySelector("#mainCategoryTabs .category-tab").click();
});
await page.waitForFunction(() => document.getElementById("activeCategoryTitle").textContent === "Genre");
const descriptions = await page.evaluate(() => {
  document.querySelector("#familyBoard .family-card-header").click();
  return [...document.querySelectorAll("#expandedTagGrid .tag-description")].map(node => node.textContent.trim());
});
assert.ok(descriptions.length > 5, "Opened families should show their tags.");
assert.ok(descriptions.every(text => text.length >= 45), "Every visible tag needs its audible description.");
await page.evaluate(() => document.getElementById("familyDialog").close());

await page.evaluate(() => {
  [...document.querySelectorAll("#mainCategoryTabs .category-tab")]
    .find(button => button.querySelector("span")?.textContent.trim() === "Instruments")
    .click();
});
await page.waitForFunction(() => document.getElementById("activeCategoryTitle").textContent === "Instruments");
const families = await page.evaluate(() => [...document.querySelectorAll("#familyBoard .family-card-header strong")].map(node => node.textContent));
for (const expected of [/Guitar/i, /Strings/i, /Electronic/i, /Drums/i]) {
  assert.ok(families.some(label => expected.test(label)), `Instrument subgroup missing: ${expected}`);
}
const instrumentTags = await page.evaluate(() => document.querySelectorAll("#familyBoard .wall-tag-button").length);
assert.equal(instrumentTags, 532);

const optionLabels = await page.evaluate(() => {
  document.getElementById("optionsBtn").click();
  return [...document.querySelectorAll("#optionalCategoryGrid .optional-category-button strong")].map(node => node.textContent.trim());
});
assert.equal(new Set(optionLabels).size, optionLabels.length, "Optional categories must not be duplicated.");
assert.equal(optionLabels.length, 11);
await page.evaluate(() => document.getElementById("optionsDialog").close());

const genreLabels = await page.evaluate(() => {
  [...document.querySelectorAll("#mainCategoryTabs .category-tab")]
    .find(button => button.querySelector("span")?.textContent.trim() === "Genre")
    .click();
  const names = [...document.querySelectorAll("#familyBoard .wall-tag-button")].map(button => button.dataset.tag);
  return names;
});
assert.equal(new Set(genreLabels).size, genreLabels.length, "Genre choices must not be duplicated.");

await page.click("#structurePageBtn");
await page.waitForSelector("#structurePage:not([hidden])");
await page.type(".song-section.active .section-lyrics", "keep this lyric line");
await page.click("#exportPageBtn");
await page.waitForFunction(() => document.getElementById("exportPage").hidden === false);
const exported = await page.evaluate(() => ({
  style: document.getElementById("styleOutput").value,
  lyrics: document.getElementById("exportLyrics").value,
  tempo: document.getElementById("tempoValue").textContent.trim()
}));
assert.match(exported.style, /handmade night drive/);
assert.match(exported.style, /96 BPM/);
for (const tag of genrePicks) assert.match(exported.style, new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
const styleTokens = exported.style.split(",").map(token => token.trim().toLowerCase()).filter(Boolean);
assert.equal(new Set(styleTokens).size, styleTokens.length, `Export repeated a selection: ${exported.style}`);
assert.match(exported.lyrics, /keep this lyric line/);
assert.equal(exported.tempo, "96 BPM");
await page.screenshot({ path: `${artifacts}/desktop-export.png` });

await page.reload({ waitUntil: "domcontentloaded" });
await page.waitForFunction(() => /Step 4/.test(document.getElementById("libraryStats")?.textContent || ""));
const restored = await page.evaluate(() => ({
  style: document.getElementById("styleOutput").value,
  lyrics: document.getElementById("exportLyrics").value,
  tempo: document.getElementById("tempoValue").textContent.trim()
}));
assert.match(restored.style, /handmade night drive/);
assert.match(restored.style, /96 BPM/);
assert.match(restored.lyrics, /keep this lyric line/);
assert.equal(restored.tempo, "96 BPM");

await page.click("#soundPageBtn");
await page.click("#clearAllBtn");
await page.waitForFunction(() => document.getElementById("styleOutput").value === "");
const cleared = await page.evaluate(() => ({
  title: document.getElementById("activeCategoryTitle").textContent,
  tempo: document.getElementById("tempoValue").textContent.trim(),
  pressed: document.querySelectorAll("[aria-pressed='true']").length
}));
assert.equal(cleared.title, "Genre");
assert.equal(cleared.tempo, "120 BPM");
assert.equal(cleared.pressed, 0);

await page.evaluate(() => {
  const extended = document.querySelector('input[name="promptSize"][value="extended"]');
  extended.checked = true;
  extended.dispatchEvent(new Event("change", { bubbles: true }));
});
await page.evaluate(() => {
  const buttons = [...document.querySelectorAll("#familyBoard .wall-tag-button")].slice(0, 30);
  buttons.forEach(button => button.click());
});
const limited = await page.$eval("#styleOutput", node => node.value.length);
assert.ok(limited <= 1000, `Prompt exceeded 1,000 characters: ${limited}`);
assert.match(await page.$eval("#characterCount", node => node.textContent), /\/ 1000/);

await page.screenshot({ path: `${artifacts}/desktop-sound.png` });
assert.equal(desktop.errors.length, 0, desktop.errors.join("\n"));
await page.close();
await desktop.context.close();

const mobile = await openApp(360, 740);
for (const step of ["#briefPageBtn", "#soundPageBtn", "#blendPageBtn", "#structurePageBtn", "#exportPageBtn"]) {
  await mobile.page.click(step);
  await sleep(80);
  const measure = await mobile.page.evaluate(() => {
    const root = document.documentElement;
    const offscreen = [...document.querySelectorAll("button,input,textarea,select,output,summary")]
      .filter(element => {
        const box = element.getBoundingClientRect();
        if (box.width < 2 || box.height < 2) return false;
        if (element.closest("[hidden]")) return false;
        return box.left < -1 || box.right > window.innerWidth + 1;
      })
      .slice(0, 8)
      .map(element => ({
        id: element.id,
        text: (element.innerText || element.value || "").slice(0, 40),
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right)
      }));
    const clear = document.getElementById("clearAllBtn").getBoundingClientRect();
    return {
      overflowX: root.scrollWidth - root.clientWidth,
      offscreen,
      clear: { left: clear.left, right: clear.right, top: clear.top, width: clear.width, hidden: document.getElementById("clearAllBtn").hidden }
    };
  });
  assertNoHorizontalScroll(measure, step);
  assert.equal(measure.clear.hidden, false, `Clear is hidden on ${step}`);
  assert.ok(measure.clear.width > 40 && measure.clear.right <= 361, `Clear is off-screen on ${step}`);
}
const tempoVisible = await mobile.page.evaluate(() => {
  document.getElementById("briefPageBtn").click();
  const output = document.getElementById("tempoValue").getBoundingClientRect();
  const prompt = document.getElementById("styleOutput").getBoundingClientRect();
  return {
    tempo: document.getElementById("tempoValue").textContent.trim(),
    tempoWidth: output.width,
    tempoRight: output.right,
    promptWidth: prompt.width
  };
});
assert.equal(tempoVisible.tempo, "120 BPM");
assert.ok(tempoVisible.tempoWidth > 40 && tempoVisible.tempoRight <= 361, "Tempo value is off-screen on a 360px screen.");
assert.ok(tempoVisible.promptWidth > 200, "The prompt box is too narrow on a 360px screen.");
await mobile.page.screenshot({ path: `${artifacts}/mobile-360.png`, fullPage: true });
assert.equal(mobile.errors.length, 0, mobile.errors.join("\n"));
await mobile.page.close();
await mobile.context.close();

console.log("Workflow browser checks passed: four steps, descriptions, persistence, limits, clear, tempo value, export, and 360px layout.");
} finally {
  await browser.close();
  server.kill();
}
