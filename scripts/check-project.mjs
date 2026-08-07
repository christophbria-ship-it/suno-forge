import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const fail = message => {
  throw new Error(message);
};

const html = read("index.html");
const app = read("prompt-app.js");
const css = read("prompt-style.css");
const worker = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const dataSource = read("data.js");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length) fail(`Duplicate HTML ids: ${[...new Set(duplicateIds)].join(", ")}`);

const requiredIdsBlock = app.match(/function cacheNodes\(\)\s*\{[\s\S]*?\[([\s\S]*?)\]\.forEach/);
if (!requiredIdsBlock) fail("Could not inspect the UI node registry.");
const requiredIds = [...requiredIdsBlock[1].matchAll(/"([^"]+)"/g)].map(match => match[1]);
const missingIds = requiredIds.filter(id => !ids.includes(id));
if (missingIds.length) fail(`JavaScript expects missing HTML ids: ${missingIds.join(", ")}`);

for (const step of ["brief", "sound", "shape", "export"]) {
  if (!html.includes(`data-step="${step}"`)) fail(`Missing ${step} step tab.`);
  if (!html.includes(`data-panel="${step}"`)) fail(`Missing ${step} step panel.`);
}

if (!html.includes('role="tablist"') || !html.includes('role="tabpanel"')) {
  fail("Step navigation is missing tab accessibility roles.");
}
if (!html.includes('class="skip-link"')) fail("Missing skip link.");
if (/\son(?:click|change|input)=/i.test(html)) fail("Inline event handlers are not allowed.");
if (!css.includes("@media (prefers-reduced-motion: reduce)")) {
  fail("Reduced-motion support is missing.");
}
if (!css.includes(":focus-visible")) fail("Visible keyboard focus styles are missing.");
if (!css.includes("-webkit-text-size-adjust: 100%")) {
  fail("Mobile text sizing guard is missing.");
}
if (/min-width:\s*420px/.test(css)) {
  fail("Mobile navigation can force the page wider than the viewport.");
}

const localAssets = new Set(
  [...html.matchAll(/(?:src|href)="\/([^"#?]+)(?:\?[^"]*)?"/g)]
    .map(match => match[1])
    .filter(Boolean)
);
for (const asset of localAssets) {
  if (!fs.existsSync(path.join(root, asset))) fail(`HTML references missing asset: ${asset}`);
}

if (manifest.start_url !== "/#brief") fail("Manifest start URL does not open the Brief step.");
for (const icon of manifest.icons || []) {
  const local = String(icon.src || "").replace(/^\//, "");
  if (!local || !fs.existsSync(path.join(root, local))) fail(`Manifest icon is missing: ${icon.src}`);
}

const shellMatch = worker.match(/const APP_SHELL = \[([\s\S]*?)\];/);
if (!shellMatch) fail("Service worker app shell is missing.");
const shellAssets = [...shellMatch[1].matchAll(/"([^"]+)"/g)].map(match => match[1]);
for (const asset of shellAssets) {
  if (asset === "/") continue;
  const local = asset.replace(/^\//, "").split("?")[0];
  if (!fs.existsSync(path.join(root, local))) fail(`Service worker caches missing asset: ${asset}`);
}

const context = {
  document: {
    readyState: "loading",
    addEventListener() {}
  },
  console: {
    log() {},
    warn() {},
    error() {}
  }
};
vm.createContext(context);
vm.runInContext(`${dataSource}\nglobalThis.__FORGE_DATA__ = DATA;`, context, {
  filename: "data.js",
  timeout: 2000
});
const categories = context.__FORGE_DATA__?.categories;
if (!categories || Object.keys(categories).length < 10) fail("Sound library did not load.");
const tagCount = Object.values(categories)
  .filter(Array.isArray)
  .reduce((total, tags) => total + tags.length, 0);
if (tagCount < 500) fail(`Sound library is unexpectedly small: ${tagCount} tags.`);

if (html.includes("v=2.1.0") || worker.includes("v=2.1.0")) {
  fail("Old asset version remains in the app shell.");
}

console.log(`Project checks passed: ${ids.length} unique UI ids, ${Object.keys(categories).length} sound categories, ${tagCount} sound options.`);
