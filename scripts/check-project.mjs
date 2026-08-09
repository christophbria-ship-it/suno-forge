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

const requiredIds = [
  "mainCategoryTabs", "optionsBtn", "activeCategoryTitle", "categorySelectionStatus",
  "familyBoard", "activeFamilyTitle", "previousPageBtn", "pageStatus", "nextPageBtn",
  "tagGrid", "stylePanel", "styleOutput", "characterCount", "copyPromptBtn",
  "optionsDialog", "optionalCategoryGrid", "toast"
];
const missingIds = requiredIds.filter(id => !ids.includes(id));
if (missingIds.length) fail(`Missing required UI ids: ${missingIds.join(", ")}`);

for (const removedId of ["briefInput", "recipeRow", "bpmRange", "promptOutput", "presetList", "historyList"]) {
  if (ids.includes(removedId)) fail(`Removed workflow control is still present: ${removedId}`);
}

if (!html.includes('role="tablist"')) fail("Main category navigation is missing tab semantics.");
if (!html.includes('class="skip-link"')) fail("Missing skip link.");
if (/\son(?:click|change|input)=/i.test(html)) fail("Inline event handlers are not allowed.");
if (!html.includes('name="promptSize" value="focused"')) fail("Focused mode is missing.");
if (!html.includes('name="promptSize" value="extended"')) fail("1,000-character mode is missing.");

if (!css.includes("overflow: hidden")) fail("No-scroll layout guard is missing.");
if (/overflow-(?:x|y):\s*(?:auto|scroll)|overflow:\s*(?:auto|scroll)/.test(css)) {
  fail("The interface reintroduced a scrolling region.");
}
if (!css.includes("@media (prefers-reduced-motion: reduce)")) fail("Reduced-motion support is missing.");
if (!css.includes(":focus-visible")) fail("Visible keyboard focus styles are missing.");
if (!css.includes("-webkit-text-size-adjust: 100%")) fail("Mobile text sizing guard is missing.");

const localAssets = new Set(
  [...html.matchAll(/(?:src|href)="\/([^"#?]+)(?:\?[^"]*)?"/g)]
    .map(match => match[1])
    .filter(Boolean)
);
for (const asset of localAssets) {
  if (!fs.existsSync(path.join(root, asset))) fail(`HTML references missing asset: ${asset}`);
}

if (manifest.start_url !== "/") fail("Manifest start URL must open the tag studio.");
if (manifest.theme_color !== "#f3ede4" || manifest.background_color !== "#f3ede4") {
  fail("Manifest colors do not match the light off-white canvas.");
}
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
if (!worker.includes("tag-studio-v4")) fail("Service worker cache was not refreshed for v4.");

const context = {};
vm.createContext(context);
vm.runInContext(`${dataSource}\nglobalThis.__FORGE_DATA__ = DATA;`, context, {
  filename: "data.js",
  timeout: 2000
});
const categories = context.__FORGE_DATA__?.categories;
if (!categories) fail("Sound library did not load.");
const categoryNames = Object.keys(categories);
const tagCount = Object.values(categories).reduce((total, tags) => total + tags.length, 0);
if (categoryNames.length !== 20) fail(`Expected 20 categories, found ${categoryNames.length}.`);
if (tagCount !== 1940) fail(`Expected 1,940 tags, found ${tagCount}.`);
if (categories.Genre.length !== 569) fail(`Expected 569 genres, found ${categories.Genre.length}.`);
if (categories.Instruments.length !== 523) fail(`Expected 523 instruments, found ${categories.Instruments.length}.`);

for (const category of [
  "Genre", "Mood", "Vocals", "Vocal Delivery", "Vocal Range & Register", "Instruments", "Production"
]) {
  if (!app.includes(`"${category}"`)) fail(`Main category is missing from app logic: ${category}`);
}
if (!app.includes("EXTENDED_CHARACTER_LIMIT = 1000")) fail("The 1,000-character ceiling is missing.");
if (!app.includes("FOCUSED_LIMIT = 2")) fail("The two-per-category focused limit is missing.");
if (!app.includes("family grouping lost or duplicated tags")) fail("Runtime tag-integrity guard is missing.");

console.log(`Project checks passed: ${ids.length} unique UI ids, ${categoryNames.length} categories, all ${tagCount} source entries preserved.`);
