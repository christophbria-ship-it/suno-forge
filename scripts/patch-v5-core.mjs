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
  },
  {
    old: 'options.filter((tag) => !query || tag.toLowerCase().includes(query)).slice(0, 120).forEach((tag) => {',
    next: 'options.filter((tag) => !query || tag.toLowerCase().includes(query)).forEach((tag) => {'
  },
  {
    old: 'fetch("/api/generate-lyrics-v35"',
    next: 'fetch("/api/generate-lyrics-v5"'
  }
];

for (const { old, next } of replacements) {
  if (source.includes(old)) source = source.split(old).join(next);
  if (!source.includes(next)) throw new Error(`Forge V5 core patch target is missing: ${next}`);
}

if (source.includes('[/male|man|baritone|tenor/')) {
  throw new Error("Unsafe Forge V5 male-vocal parser remains after patch.");
}
if (source.includes('.slice(0, 120).forEach((tag) => {')) {
  throw new Error("Forge V5 picker still truncates the sound library.");
}
if (source.includes('fetch("/api/generate-lyrics-v35"')) {
  throw new Error("Forge V5 section AI still uses the obsolete endpoint.");
}

const patched = gzipSync(Buffer.from(source, "utf8"), { level: 9 }).toString("base64");
writeFileSync(path, `${patched}\n`, "utf8");
console.log("Forge V5 core patches applied: vocal parsing, complete sound library, and direct AI routing.");
