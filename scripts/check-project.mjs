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
const blenderCss = read("sound-blender.css");
const blenderApp = read("sound-blender.js");
const soundProfiles = read("sound-profiles.js");
const ninetiesProfiles = read("sound-profiles-1990s.js");
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
  "optionsDialog", "optionalCategoryGrid", "toast", "blendPage", "blendPageBtn",
  "soundReference1", "soundFocus1", "soundReference2", "soundFocus2",
  "soundBlendResult", "addBlendToPromptBtn", "replacePromptWithBlendBtn",
  "customSoundForm", "customSoundDescription", "ninetiesSoundDetails",
  "ninetiesGenreFilter", "ninetiesSoundCount", "ninetiesSoundGrid"
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
if (!worker.includes("simplist-v23-20260828-1990s-sounds")) fail("Service worker cache was not refreshed for the 1990s sound release.");
if (!html.includes('/tag-descriptions.js?v=11.2.0')) fail("The sound-description engine is not loaded.");
if (!worker.includes('/tag-descriptions.js?v=11.2.0')) fail("The sound-description engine is missing from the offline app shell.");
if (!html.includes('/prompt-app.js?v=11.6.0')) fail("The Sound Blender prompt bridge is not loaded.");
if (!html.includes('/v10-features.js?v=11.5.0')) fail("The matching custom-tag helpers are not loaded.");
if (!html.includes('/v11-layout.css?v=11.4.0')) fail("The latest v11 layout stylesheet is missing.");
if (!html.includes('/mobile-v12.css?v=12.2.0')) fail("The true mobile layout stylesheet is not loaded last.");
if (!worker.includes('/mobile-v12.css?v=12.2.0')) fail("The true mobile layout is missing from the offline app shell.");
if (!html.includes('/sound-blender.css?v=1.1.0') || !worker.includes('/sound-blender.css?v=1.1.0')) fail("The Sound Blender styling is not loaded and cached.");
if (!html.includes('/sound-profiles.js?v=1.0.0') || !worker.includes('/sound-profiles.js?v=1.0.0')) fail("The named sound profiles are not loaded and cached.");
if (!html.includes('/sound-profiles-1990s.js?v=1.0.0') || !worker.includes('/sound-profiles-1990s.js?v=1.0.0')) fail("The 1990s sound profiles are not loaded and cached.");
if (!html.includes('/sound-blender.js?v=1.1.0') || !worker.includes('/sound-blender.js?v=1.1.0')) fail("The Sound Blender behavior is not loaded and cached.");
if (!html.includes('/structure-app.js?v=5.3.0')) fail("The three-page navigation is not loaded.");
if (html.indexOf('/sound-blender.css?v=1.1.0') < html.indexOf('/mobile-v12.css?v=12.2.0')) fail("The Sound Blender mobile overrides must load last.");
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
if (!blenderCss.includes("repeat(3, minmax(0, 1fr))")) fail("The three builder pages do not fit the page switcher.");
if (!blenderCss.includes("@media (max-width: 390px)")) fail("The Sound Blender lacks its narrow-phone fallback.");
if (!blenderCss.includes("overflow: visible !important")) fail("The Sound Blender cannot join normal phone scrolling.");
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

const profileContext = {};
vm.createContext(profileContext);
vm.runInContext(soundProfiles, profileContext, { filename: "sound-profiles.js", timeout: 2000 });
vm.runInContext(ninetiesProfiles, profileContext, { filename: "sound-profiles-1990s.js", timeout: 2000 });
const namedProfiles = profileContext.SIMPLIST_SOUND_PROFILES;
if (!Array.isArray(namedProfiles) || namedProfiles.length < 250) fail("The named Sound Blender library is missing its full 1990s expansion.");
for (const requiredName of [
  "John Frusciante", "Chris Cornell", "Beck", "Soundgarden", "Rick Rubin",
  "Michael Jackson", "Pearl Jam", "Metallica", "2Pac", "Mariah Carey",
  "Garth Brooks", "Daft Punk", "Green Day", "Selena", "Sade", "Kirk Franklin"
]) {
  if (!namedProfiles.some(profile => profile.name === requiredName)) fail(`Missing required sound profile: ${requiredName}`);
}
const ninetiesNamed = namedProfiles.filter(profile => profile.era === "1990s");
if (ninetiesNamed.length < 220) fail(`Expected at least 220 popular 1990s sounds, found ${ninetiesNamed.length}.`);
const ninetiesGenres = [...new Set(ninetiesNamed.flatMap(profile => profile.genres || []))];
if (ninetiesGenres.length !== 14) fail(`Expected 14 broad 1990s genre groups, found ${ninetiesGenres.length}.`);
for (const profile of ninetiesNamed) {
  if (!profile.genres?.length) fail(`1990s profile is missing a genre: ${profile.name}`);
  const descriptions = Object.values(profile.parts || {});
  if (!descriptions.length || descriptions.some(value => String(value).trim().length < 45)) {
    fail(`1990s profile lacks a substantial audible description: ${profile.name}`);
  }
}
const normalizedNames = namedProfiles.map(profile => String(profile.name).toLowerCase());
if (new Set(normalizedNames).size !== normalizedNames.length) fail("Named sound profiles contain duplicate names.");
if (!blenderApp.includes("simplist:apply-sound-blend")) fail("Sound Blender cannot send its result to the existing prompt.");
if (!blenderApp.includes("simplistSoundBlenderProfilesV1")) fail("Custom sound profiles are not persisted.");
if (!blenderApp.includes("withoutNames")) fail("Reference names are not removed from generated wording.");
if (!blenderApp.includes("renderNinetiesBrowser")) fail("The browsable 1990s sound library is not connected to the Blender.");

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
