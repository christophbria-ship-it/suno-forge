import { readFileSync, writeFileSync } from "node:fs";
import { gunzipSync, gzipSync } from "node:zlib";

const path = new URL("../app-v5-core.txt", import.meta.url);
const encoded = readFileSync(path, "utf8").replace(/\s+/g, "");
let source = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");

const replacements = [
  {
    old: '[/female|woman|alto|soprano/, ["Female Vocal", "Alto"]]',
    next: '[/\\b(?:female|woman|alto|soprano)\\b/, ["Female Vocal", "Alto"]]'
  },
  {
    old: '[/male|man|baritone|tenor/, ["Male Vocal", "Baritone"]]',
    next: '[/\\b(?:male|man|baritone|tenor)\\b/, ["Male Vocal", "Baritone"]]'
  }
];

for (const { old, next } of replacements) {
  if (source.includes(old)) source = source.replace(old, next);
  if (!source.includes(next)) throw new Error(`Forge V5 core patch target is missing: ${next}`);
}

if (source.includes('[/male|man|baritone|tenor/')) {
  throw new Error("Unsafe Forge V5 male-vocal parser remains after patch.");
}

for (const match of source.matchAll(/\.slice\([^)]*\)/g)) {
  const start = Math.max(0, match.index - 180);
  const end = Math.min(source.length, match.index + match[0].length + 180);
  console.log(`V5_SLICE_CONTEXT: ${source.slice(start, end).replace(/\s+/g, " ")}`);
}

const patched = gzipSync(Buffer.from(source, "utf8"), { level: 9 }).toString("base64");
writeFileSync(path, `${patched}\n`, "utf8");
console.log("Forge V5 core parser patch applied.");
