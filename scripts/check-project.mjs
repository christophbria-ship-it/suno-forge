import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const fail = message => {
  throw new Error(message);
};

const html = read("index.html");
const app = read("prompt-app.js");
const css = read("prompt-style.css");
const latestLayout = read("v11-layout.css");
const mobileLayout = read("mobile-v12.css");
const worker = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const dataSource = read("data.js");

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length) fail(`Duplicate HTML ids: ${[...new Set(duplicateIds)].join(", ")}`);

const requiredIds = [
  "mainCategoryTabs", "optionsBtn", "activeCategoryTitle", "categorySelectionStatus",
  "familyViewport", "familyBoard", "stylePanel", "styleOutput", "characterCount",
  "copyPromptBtn", "familyDialog", "expandedFamilyTitle", "expandedTagGrid",
  "optionsDialog", "optionalCategoryGrid", "toast"
];
const missingIds = requiredIds.filter(id => !ids.includes(id));
if (missingIds.length) fail(`Missing required UI ids: ${missingIds.join(", ")}`);

for (const removedId of [
  "briefInput", "recipeRow", "bpmRange", "promptOutput", "presetList", "historyList",
  "previousPageBtn", "nextPageBtn", "pageStatus", "tagGrid", "tagPageNote"
]) {
  if (ids.includes(removedId)) fail(`Removed workflow control is still present: ${removedId}`);
}

if (!html.includes('role="tablist"')) fail("Main category navigation is missing tab semantics.");
if (!html.includes('class="skip-link"')) fail("Missing skip link.");
if (/\son(?:click|change|input)=/i.test(html)) fail("Inline event handlers are not allowed.");
if (!html.includes('name="promptSize" value="focused"')) fail("Focused mode is missing.");
if (!html.includes('name="promptSize" value="extended"')) fail("1,000-character mode is missing.");

if (!css.includes("overflow: hidden")) fail("Desktop no-scroll layout guard is missing.");
if (!mobileLayout.includes("overflow-y: auto !important")) fail("The true mobile page does not restore vertical scrolling.");
if (!mobileLayout.includes("overflow-x: hidden !important")) fail("The true mobile page does not prevent horizontal overflow.");
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
if (manifest.theme_color !== "#21130d" || manifest.background_color !== "#21130d") {
  fail("Manifest colors do not match the dark prompt-box canvas.");
}
for (const icon of manifest.icons || []) {
  const local = String(icon.src || "").replace(/^\//, "").split("?")[0];
  if (!local || !fs.existsSync(path.join(root, local))) fail(`Manifest icon is missing: ${icon.src}`);
}

const shellMatch = worker.match(/const APP_SHELL\s*=\s*\[([\s\S]*?)\];/);
if (!shellMatch) fail("Service worker app shell is missing.");
const shellAssets = [...shellMatch[1].matchAll(/"([^"]+)"/g)].map(match => match[1]);
for (const asset of shellAssets) {
  if (asset === "/") continue;
  const local = asset.replace(/^\//, "").split("?")[0];
  if (!fs.existsSync(path.join(root, local))) fail(`Service worker caches missing asset: ${asset}`);
}
if (!worker.includes("simplist-v21-20260827-better-seven-polish")) fail("Service worker cache was not refreshed for the polished seven-main-tag release.");
if (!html.includes('/tag-descriptions.js?v=11.2.0')) fail("The sound-description engine is not loaded.");
if (!worker.includes('/tag-descriptions.js?v=11.2.0')) fail("The sound-description engine is missing from the offline app shell.");
if (!html.includes('/prompt-app.js?v=11.5.0')) fail("The seven-main-tag prompt interface is not loaded.");
if (!html.includes('/v10-features.js?v=11.5.0')) fail("The matching custom-tag helpers are not loaded.");
if (!html.includes('/v11-layout.css?v=11.4.0')) fail("The latest v11 layout stylesheet is missing.");
if (!html.includes('/mobile-v12.css?v=12.2.0')) fail("The true mobile layout stylesheet is not loaded last.");
if (!worker.includes('/mobile-v12.css?v=12.2.0')) fail("The true mobile layout is missing from the offline app shell.");
if (!latestLayout.includes("grid-row: 2 !important")) fail("The prompt panel is not assigned to the bottom row.");
if (!latestLayout.includes("--canvas: #21130d")) fail("The app canvas does not match the prompt-box brown.");
if (!latestLayout.includes("--interface-text: #ffffff")) fail("The interface text is not plain white.");
if (!latestLayout.includes('font-family: Georgia, "Times New Roman", serif !important')) fail("The interface typography does not match the logo serif.");
if (!mobileLayout.includes("#nl-badge-frame")) fail("The production badge can still cover app controls.");
if (!mobileLayout.includes("grid-template-columns: repeat(2, minmax(0, 1fr))")) fail("Mobile controls do not have a readable two-column layout.");
if (!mobileLayout.includes("@media (max-width: 350px)")) fail("The narrowest supported phone layout is missing.");
if (!mobileLayout.includes("grid-template-columns: minmax(0, 1fr) !important")) fail("The 320px single-column fallback is missing.");
if (!mobileLayout.includes("overflow-wrap: break-word")) fail("Long main-category labels can overflow narrow screens.");
if (!mobileLayout.includes(".category-tabs .category-tab:last-child")) fail("The longest seventh main tag does not receive a full mobile row.");
if (!mobileLayout.includes(".options-button") || !mobileLayout.includes("display: grid !important")) fail("Extra / Optional is not restored as one control.");
if (!mobileLayout.includes("#optionsDialog[open]")) fail("The Extra / Optional dialog cannot become visible.");
if (!html.includes("simplist-logo-approved-reference.jpg?v=12.0.0")) fail("The approved logo reference is not displayed.");
if (html.includes("simplist-logo-small.svg")) fail("The substitute logo is still referenced by the interface.");
if (worker.includes("simplist-logo-small.svg")) fail("The substitute logo is still cached for the interface.");
const logoHash = crypto.createHash("sha256")
  .update(fs.readFileSync(path.join(root, "simplist-logo-approved-reference.jpg")))
  .digest("hex");
if (logoHash !== "8d0efc881013c22f714e0fda823027a1ba8ce0df36d784da2f286d94f864b3fa") {
  fail("The approved logo reference pixels changed.");
}

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
if (tagCount !== 1941) fail(`Expected 1,941 tags, found ${tagCount}.`);
if (categories.Genre.length !== 570) fail(`Expected 570 genres, found ${categories.Genre.length}.`);
if (categories.Instruments.length !== 523) fail(`Expected 523 instruments, found ${categories.Instruments.length}.`);
if (!categories.Genre.includes("Acoustic")) fail("The standalone Acoustic genre is missing.");

const mainConfig = app.match(/const MAIN_CATEGORY_CONFIG\s*=\s*\[([\s\S]*?)\n\s*\];/)?.[1] || "";
const expectedMainCategories = [
  "Genre",
  "Era",
  "Mood/Emotion",
  "Tempo/Groove",
  "Instruments",
  "Vocal Style/Delivery",
  "Production/Sound Quality"
];
let previousMainPosition = -1;
for (const category of expectedMainCategories) {
  const position = mainConfig.indexOf(`label: "${category}"`);
  if (position < 0) fail(`Main category is missing from app logic: ${category}`);
  if (position <= previousMainPosition) fail(`Main category is out of order: ${category}`);
  previousMainPosition = position;
}
if (!mainConfig.includes('sources: ["Vocals", "Vocal Delivery", "Vocal Range & Register"]')) {
  fail("The three vocal libraries are not combined behind Vocal Style/Delivery.");
}
if (!app.includes("EXTENDED_CHARACTER_LIMIT = 1000")) fail("The 1,000-character ceiling is missing.");
if (!app.includes("FOCUSED_LIMIT = 2")) fail("The two-per-category focused limit is missing.");
if (!app.includes("family grouping lost or duplicated tags")) fail("Runtime tag-integrity guard is missing.");
if (!app.includes("renderFamilyWall")) fail("The one-screen family wall is missing.");
if (/\bpageIndex\b|renderTagPage|previousPageBtn|nextPageBtn/.test(app)) fail("Page-turning logic is still present.");

console.log(`Project checks passed: ${ids.length} unique UI ids, ${categoryNames.length} categories, all ${tagCount} source entries preserved.`);
