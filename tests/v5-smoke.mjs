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

assert.match(api, /https:\/\/api\.openai\.com\/v1\/responses/);
assert.match(api, /gpt-5-mini/);
assert.match(api, /x-forge-openai-key/);
assert.match(api, /store:\s*false/);
assert.match(statusApi, /https:\/\/api\.openai\.com\/v1\/models/);
assert.match(statusApi, /x-forge-openai-key/);

assert.match(serviceWorker, /forge-v5-20260731c/);
assert.match(serviceWorker, /style-v5-finish\.css/);
assert.match(serviceWorker, /app-v5-finish\.js/);
assert.match(serviceWorker, /style-v5-clean\.css/);
assert.match(serviceWorker, /app-v5-clean\.js/);
assert.match(serviceWorker, /pathname\.startsWith\("\/api\/"\)/);
assert.equal(manifest.name, "Forge Studio v5");
assert.equal(manifest.display, "standalone");

new vm.Script(core, { filename: "app-v5-core.js" });
for (const expected of ["Brief", "Sound", "Song", "Export", "v5-build-dock", "v5-sound-stack", "v5-lyrics-sections", "COPY EVERYTHING"]) {
  assert.ok(core.includes(expected), `V5 core missing required feature marker: ${expected}`);
}
assert.doesNotMatch(core, /forge-studio-(?:one-mu|v48)\.vercel\.app/i);
assert.ok(core.includes('[/\\b(?:female|woman|alto|soprano)\\b/, ["Female Vocal", "Alto"]]'), "Female vocal parser must use word boundaries");
assert.ok(core.includes('[/\\b(?:male|man|baritone|tenor)\\b/, ["Male Vocal", "Baritone"]]'), "Male vocal parser must use word boundaries");
assert.ok(!core.includes('[/male|man|baritone|tenor/'), "Unsafe male-vocal substring matcher must not return");
assert.ok(!core.includes('.slice(0, 120).forEach((tag) => {'), "Sound picker must not truncate the genre library");
assert.ok(core.includes('options.filter((tag) => !query || tag.toLowerCase().includes(query)).forEach((tag) => {'), "Sound picker must render every matching option");

console.log(`Forge V5.2 smoke checks passed: ${localAssets.length} indexed assets, ${core.length} bytes of validated core source.`);
