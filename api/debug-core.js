import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const QUERIES = [
  "recipeGrid",
  "categoryList",
  "bpmRange",
  "presetList",
  "v5-panel-hidden",
  "workspace-hidden",
  "function setMode",
  "nodes.panels"
];

export default function handler(_request, response) {
  const encoded = readFileSync(new URL("../app-v5-core.txt", import.meta.url), "utf8").replace(/\s+/g, "");
  const source = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
  const lower = source.toLowerCase();
  const results = {};

  for (const query of QUERIES) {
    const needle = query.toLowerCase();
    const snippets = [];
    let index = 0;
    while ((index = lower.indexOf(needle, index)) !== -1 && snippets.length < 12) {
      snippets.push(source.slice(Math.max(0, index - 700), Math.min(source.length, index + query.length + 1300)));
      index += needle.length;
    }
    results[query] = snippets;
  }

  response.setHeader("Cache-Control", "no-store");
  response.status(200).json(results);
}
