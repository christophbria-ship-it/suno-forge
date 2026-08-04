import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import vm from "node:vm";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const index = read("index.html");
const finish = read("app-v5-finish.js");
const clear = read("app-v5-clear.js");
const clean = read("app-v5-clean.js");
const flow = read("app-v5-flow.js");
const splitExport = read("app-v5-export.js");
const guide = read("app-v5-guide.js");
const disclosure = read("app-v5-disclosure.js");
const aiActions = read("app-v5-ai-actions.js");
const finalFocus = read("app-v6-focus.js");
const finalCss = read("style-v6-focus.css");
const launcher = read("app-v47.js");
const serviceWorker = read("sw.js");
const manifest = JSON.parse(read("manifest.webmanifest"));
const apiV5 = read("api/generate-lyrics-v5.js");
const api = read("api/generate-lyrics-v6.js");
const statusApi = read("api/ai-status.js");
const encodedCore = read("app-v5-core.txt").replace(/\s+/g, "");
const core = gunzipSync(Buffer.from(encodedCore, "base64")).toString("utf8");

const localAssets = [...index.matchAll(/(?:href|src)="([^"?#]+)(?:[?#][^"]*)?"/g)]
  .map((match) => match[1])
  .filter((value) => !/^(?:https?:|data:|#)/.test(value));
for (const asset of localAssets) {
  const path = asset.replace(/^\//, "");
  assert.ok(existsSync(new URL(`../${path}`, import.meta.url)), `Missing local asset: ${asset}`);
}

assert.match(index, /FORGE STUDIO V5/);
assert.ok(index.indexOf("app-v5-finish.js") < index.indexOf("app-v47.js"), "AI bridge must load before the focused interface");
assert.doesNotMatch(index, /forge-studio-(?:one-mu|v48|v5-)[^"']*\.vercel\.app/i);

assert.match(finish, /forgeOpenAIKeyV5/);
assert.match(finish, /\/api\/generate-lyrics-v5/);
assert.match(finish, /\/api\/ai-status/);
assert.doesNotMatch(finish, /console\.(?:log|info)\([^\n]*key/i);

assert.match(clear, /style-v5-clean\.css/);
assert.match(clear, /app-v5-guide\.js/);
assert.match(clear, /Clear Sound/);
assert.match(clean, /What do you want to make\?/);
assert.match(clean, /Browse the full sound library/);
assert.match(clean, /Advanced track controls/);
assert.match(flow, /Your starting prompt/);
assert.match(flow, /Copy & Use Now/);

assert.match(splitExport, /Copy Style/);
assert.match(splitExport, /Copy Lyrics/);
assert.match(splitExport, /Copy Everything \(optional\)/);
const styleFunction = splitExport.match(/function buildStyleExport\(\) \{([\s\S]*?)\n  \}\n\n  function buildLyricsExport/)?.[1] || "";
assert.ok(styleFunction, "Style export function must be present");
assert.doesNotMatch(styleFunction, /lyrics/i, "Style export must not include lyrics");

assert.match(guide, /Step \$\{index \+ 1\} of 4/);
assert.match(guide, /Continue to Sound/);
assert.match(guide, /Continue to Write/);
assert.match(guide, /Continue to Export/);
assert.match(guide, /v5-quick-path-back/);
assert.doesNotMatch(guide, /tutorial|tour|modal/i);

assert.match(disclosure, /start from a recipe/i);
assert.match(disclosure, /browse the full sound library/i);
assert.match(disclosure, /advanced track controls/i);
assert.match(disclosure, /projects and history/i);
assert.match(disclosure, /aria-expanded/);

assert.match(aiActions, /Generate Full Draft with AI/);
assert.match(aiActions, /AI PREVIEW/);
assert.match(aiActions, /Use This Draft/);
assert.match(aiActions, /Keep Current Lyrics/);
assert.match(aiActions, /Your current lyrics were not changed/);
assert.doesNotMatch(aiActions, /console\.(?:log|info)\([^\n]*key/i);

assert.match(finalFocus, /Stem Separator/);
assert.match(finalFocus, /stem-flow-header/);
assert.match(finalFocus, /Step \$\{currentStep\} of 4/);
assert.match(finalFocus, /Save the private access code before starting the separation/);
assert.match(finalFocus, /event\.stopImmediatePropagation\(\)/);
assert.match(finalFocus, /forge-final/);
assert.doesNotMatch(finalFocus, /stem-focus-steps/);
assert.doesNotMatch(finalFocus, /stepButtons/);

assert.match(finalCss, /Forge Studio final interface pass/);
assert.match(finalCss, /\.stem-flow-header/);
assert.match(finalCss, /\.stem-inline-error/);
assert.match(finalCss, /\.v5-quick-path-back/);
assert.match(finalCss, /\.v5-dock-status\s*\{[\s\S]*display:\s*none/);

assert.match(launcher, /style-v6-focus\.css\?v=6\.1\.0/);
assert.match(launcher, /app-v6-focus\.js\?v=6\.1\.0/);
assert.match(serviceWorker, /forge-v6-20260803-final/);
assert.match(serviceWorker, /style-v6-focus\.css/);
assert.match(serviceWorker, /app-v6-focus\.js/);
assert.match(serviceWorker, /pathname\.startsWith\("\/api\/"\)/);

assert.match(apiV5, /generate-lyrics-v6\.js/);
assert.match(api, /https:\/\/api\.openai\.com\/v1\/responses/);
assert.match(api, /x-forge-openai-key/);
assert.match(api, /store:\s*false/);
assert.match(statusApi, /https:\/\/api\.openai\.com\/v1\/models/);
assert.equal(manifest.display, "standalone");

for (const [name, source] of [
  ["app-v5-core.js", core],
  ["app-v5-flow.js", flow],
  ["app-v5-export.js", splitExport],
  ["app-v5-guide.js", guide],
  ["app-v5-disclosure.js", disclosure],
  ["app-v5-ai-actions.js", aiActions],
  ["app-v6-focus.js", finalFocus]
]) {
  new vm.Script(source, { filename: name });
}

for (const expected of ["Brief", "Sound", "Song", "Export", "v5-build-dock", "v5-sound-stack", "v5-lyrics-sections", "COPY EVERYTHING"]) {
  assert.ok(core.includes(expected), `V5 core missing required feature marker: ${expected}`);
}
assert.match(core, /fetch\("\/api\/generate-lyrics-v5"/);
assert.doesNotMatch(core, /fetch\("\/api\/generate-lyrics-v35"/);
assert.doesNotMatch(core, /forge-studio-(?:one-mu|v48)\.vercel\.app/i);

console.log(`Forge final smoke checks passed: ${localAssets.length} indexed assets and ${core.length} bytes of validated core source.`);
