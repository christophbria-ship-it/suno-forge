import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import vm from "node:vm";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const index = read("index.html");
const finish = read("app-v5-finish.js");
const finishCss = read("style-v5-finish.css");
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

assert.match(api, /https:\/\/api\.openai\.com\/v1\/responses/);
assert.match(api, /gpt-5-mini/);
assert.match(api, /x-forge-openai-key/);
assert.match(api, /store:\s*false/);
assert.match(statusApi, /https:\/\/api\.openai\.com\/v1\/models/);
assert.match(statusApi, /x-forge-openai-key/);

assert.match(serviceWorker, /style-v5-finish\.css/);
assert.match(serviceWorker, /app-v5-finish\.js/);
assert.match(serviceWorker, /pathname\.startsWith\("\/api\/"\)/);
assert.equal(manifest.name, "Forge Studio v5");
assert.equal(manifest.display, "standalone");

new vm.Script(core, { filename: "app-v5-core.js" });
for (const expected of ["Brief", "Sound", "Song", "Export", "v5-build-dock", "v5-sound-stack", "v5-lyrics-sections", "COPY EVERYTHING"]) {
  assert.ok(core.includes(expected), `V5 core missing required feature marker: ${expected}`);
}
assert.doesNotMatch(core, /forge-studio-(?:one-mu|v48)\.vercel\.app/i);

for (const term of ["female", "male", "Female Vocal", "Male Vocal"]) {
  const index = core.indexOf(term);
  if (index >= 0) console.log(`V5_PARSER_${term.replace(/\W+/g, "_").toUpperCase()}: ${core.slice(Math.max(0, index - 220), index + 320).replace(/\s+/g, " ")}`);
}
console.log(`Forge V5 smoke checks passed: ${localAssets.length} local assets, ${core.length} bytes of validated core source.`);
