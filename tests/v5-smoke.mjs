import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import vm from "node:vm";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const index = read("index.html");
const finish = read("app-v5-finish.js");
const finishCss = read("style-v5-finish.css");
const clear = read("app-v5-clear.js");
const clean = read("app-v5-clean.js");
const cleanCss = read("style-v5-clean.css");
const flow = read("app-v5-flow.js");
const splitExport = read("app-v5-export.js");
const guide = read("app-v5-guide.js");
const disclosure = read("app-v5-disclosure.js");
const aiActions = read("app-v5-ai-actions.js");
const serviceWorker = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const api = read("api/generate-lyrics-v5.js");
const statusApi = read("api/ai-status.js");
const encodedCore = read("app-v5-core.txt").replace(/\s+/g, "");
const core = gunzipSync(Buffer.from(encodedCore, "base64")).toString("utf8");

assert.match(index, /FORGE STUDIO V5/);
assert.match(index, /style-v5\.css\?v=5\.0\.3/);
assert.match(index, /style-v5-finish\.css\?v=5\.0\.3/);
assert.match(index, /app-v5-finish\.js\?v=5\.0\.3/);
assert.match(index, /app-v5-clear\.js\?v=5\.0\.5/);
assert.ok(index.indexOf("app-v5-finish.js") < index.indexOf("app-v47.js"), "AI bridge must load before V5 startup");
assert.doesNotMatch(index, /forge-studio-(?:one-mu|v48|v5-)[^"']*\.vercel\.app/i);

const localAssets = [...index.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)]
  .map((match) => match[1])
  .filter((value) => !/^(?:https?:|data:|#)/.test(value));
for (const asset of localAssets) {
  const path = asset.replace(/^\//, "");
  assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `Missing local asset: ${asset}`);
}

assert.match(finish, /forgeOpenAIKeyV5/);
assert.match(finish, /\/api\/generate-lyrics-v5/);
assert.match(finish, /\/api\/ai-status/);
assert.match(finish, /serviceWorker\.register/);
assert.doesNotMatch(finish, /console\.(?:log|info)\([^\n]*key/i);
assert.match(finishCss, /v5-ai-dialog/);
assert.match(finishCss, /v5-ai-settings-button/);

assert.match(clear, /style-v5-clean\.css\?v=5\.2\.0/);
assert.match(clear, /app-v5-clean\.js\?v=5\.2\.0/);
assert.match(clear, /app-v5-flow\.js\?v=5\.2\.2/);
assert.match(clear, /app-v5-export\.js\?v=5\.2\.3/);
assert.match(clear, /app-v5-guide\.js\?v=5\.2\.4/);
assert.match(clear, /app-v5-disclosure\.js\?v=5\.2\.6/);
assert.match(clear, /app-v5-ai-actions\.js\?v=5\.2\.7/);
assert.match(clear, /Clear Sound/);
assert.match(clear, /state\.output = ""/);
assert.doesNotMatch(clear, /if \(typeof syncControls === "function"\) syncControls\(false\);/);
assert.match(clean, /What do you want to make\?/);
assert.match(clean, /Build My Starting Point/);
assert.match(clean, /More options/);
assert.match(clean, /More sound controls/);
assert.match(clean, /v5-clean-picker-results/);
assert.match(clean, /Add Selection/);
assert.match(clean, /tagsForPicker/);
assert.match(clean, /slice\(0, 500\)/);
assert.match(clean, /Browse the full sound library/);
assert.match(clean, /Advanced track controls/);
assert.match(cleanCss, /--clean-bg:#f7f6f3/);
assert.match(cleanCss, /forge-v5-clean/);
assert.match(cleanCss, /v5-clean-primary-task/);
assert.match(cleanCss, /v5-clean-inline-disclosure/);
assert.match(cleanCss, /v5-clean-sound-more/);
assert.match(cleanCss, /v5-clean-picker-row/);
assert.match(cleanCss, /v5-build-dock\{display:none!important\}/);

assert.match(flow, /Your starting prompt/);
assert.match(flow, /Copy & Use Now/);
assert.match(splitExport, /Copy each field separately/);
assert.match(splitExport, /Copy Style/);
assert.match(splitExport, /Copy Lyrics/);
assert.match(splitExport, /Copy Everything \(optional\)/);
assert.match(splitExport, /data-suno-output="style"/);
assert.match(splitExport, /data-suno-output="lyrics"/);
assert.match(splitExport, /Paste only this into Suno's Style box/);
assert.match(splitExport, /Paste them into Suno's Lyrics box/);
const styleFunction = splitExport.match(/function buildStyleExport\(\) \{([\s\S]*?)\n  \}\n\n  function buildLyricsExport/)?.[1] || "";
assert.ok(styleFunction, "Style export function must be present");
assert.doesNotMatch(styleFunction, /lyrics/i, "Style export must not include lyrics");

assert.match(guide, /v5-quick-path/);
assert.match(guide, /Shape the Sound/);
assert.match(guide, /Write the Song/);
assert.match(guide, /Prepare for Suno/);
assert.match(guide, /Copy Style first, then Lyrics/);
assert.match(guide, /Step \$\{index \+ 1\} of 4/);
assert.doesNotMatch(guide, /tutorial|tour|modal/i);

assert.match(disclosure, /start from a recipe/i);
assert.match(disclosure, /browse the full sound library/i);
assert.match(disclosure, /advanced track controls/i);
assert.match(disclosure, /projects and history/i);
assert.match(disclosure, /panel: "brief"/);
assert.match(disclosure, /panel: "sound"/);
assert.match(disclosure, /panel: "tools"/);
assert.match(disclosure, /v5-clean-disclosure-tools-only/);
assert.match(disclosure, /moveToCorrectPanel/);
assert.match(disclosure, /panel\.appendChild\(content\)/);
assert.match(disclosure, /details\.remove\(\)/);
assert.match(disclosure, /data-forge-v5/);
assert.match(disclosure, /aria-expanded/);
assert.doesNotMatch(disclosure, /HIDDEN_CLASSES/);
assert.doesNotMatch(disclosure, /classList\.remove\("v5-panel-hidden"\)/);

assert.match(aiActions, /Generate Full Draft with AI/);
assert.match(aiActions, /Rewrite Full Draft with AI/);
assert.match(aiActions, /\/api\/generate-lyrics-v5/);
assert.match(aiActions, /AI PREVIEW/);
assert.match(aiActions, /Use This Draft/);
assert.match(aiActions, /Keep Current Lyrics/);
assert.match(aiActions, /Your current lyrics were not changed/);
assert.match(aiActions, /AI connection settings/);
assert.match(aiActions, /saveAcceptedLyrics/);
assert.match(aiActions, /snapshot/);
assert.match(aiActions, /saveAll/);
assert.match(aiActions, /forge:state-change/);
assert.doesNotMatch(aiActions, /console\.(?:log|info)\([^\n]*key/i);

assert.match(api, /https:\/\/api\.openai\.com\/v1\/responses/);
assert.match(api, /gpt-5-mini/);
assert.match(api, /x-forge-openai-key/);
assert.match(api, /store:\s*false/);
assert.match(statusApi, /https:\/\/api\.openai\.com\/v1\/models/);
assert.match(statusApi, /x-forge-openai-key/);

assert.match(serviceWorker, /forge-v5-20260801h/);
assert.match(serviceWorker, /style-v5-finish\.css/);
assert.match(serviceWorker, /app-v5-finish\.js/);
assert.match(serviceWorker, /style-v5-clean\.css/);
assert.match(serviceWorker, /app-v5-clean\.js/);
assert.match(serviceWorker, /app-v5-flow\.js/);
assert.match(serviceWorker, /app-v5-export\.js/);
assert.match(serviceWorker, /app-v5-guide\.js/);
assert.match(serviceWorker, /app-v5-disclosure\.js/);
assert.match(serviceWorker, /app-v5-ai-actions\.js/);
assert.match(serviceWorker, /pathname\.startsWith\("\/api\/"\)/);
assert.equal(manifest.name, "Forge Studio v5");
assert.equal(manifest.display, "standalone");

new vm.Script(core, { filename: "app-v5-core.js" });
new vm.Script(flow, { filename: "app-v5-flow.js" });
new vm.Script(splitExport, { filename: "app-v5-export.js" });
new vm.Script(guide, { filename: "app-v5-guide.js" });
new vm.Script(disclosure, { filename: "app-v5-disclosure.js" });
new vm.Script(aiActions, { filename: "app-v5-ai-actions.js" });
for (const expected of ["Brief", "Sound", "Song", "Export", "v5-build-dock", "v5-sound-stack", "v5-lyrics-sections", "COPY EVERYTHING"]) {
  assert.ok(core.includes(expected), `V5 core missing required feature marker: ${expected}`);
}
assert.match(core, /nodes\.panels\.brief\.appendChild\(recipeCard\)/);
assert.match(core, /nodes\.panels\.sound\.appendChild\(palette\)/);
assert.match(core, /nodes\.panels\.sound\.appendChild\(track\)/);
assert.match(core, /makeSheet\("Presets & History"\)/);
assert.match(core, /fetch\("\/api\/generate-lyrics-v5"/);
assert.doesNotMatch(core, /fetch\("\/api\/generate-lyrics-v35"/);
assert.doesNotMatch(core, /forge-studio-(?:one-mu|v48)\.vercel\.app/i);
assert.ok(core.includes('[/\\b(?:female|woman|alto|soprano)\\b/, ["Female Vocal", "Alto"]]'), "Female vocal parser must use word boundaries");
assert.ok(core.includes('[/\\b(?:male|man|baritone|tenor)\\b/, ["Male Vocal", "Baritone"]]'), "Male vocal parser must use word boundaries");
assert.ok(!core.includes('[/male|man|baritone|tenor/'), "Unsafe male-vocal substring matcher must not return");
assert.ok(!core.includes('.slice(0, 120).forEach((tag) => {'), "Sound picker must not truncate the genre library");
assert.ok(core.includes('options.filter((tag) => !query || tag.toLowerCase().includes(query)).forEach((tag) => {'), "Sound picker must render every matching option");

console.log(`Forge V5.2 smoke checks passed: ${localAssets.length} indexed assets, ${core.length} bytes of validated core source.`);
