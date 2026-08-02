import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const encoded = readFileSync(new URL("../app-v5-core.txt", import.meta.url), "utf8").replace(/\s+/g, "");
const source = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
const queries = [
  "/api/generate-lyrics",
  "generateLyrics",
  "generate lyrics",
  "write-section",
  "async function",
  "fetch("
];

for (const query of queries) {
  console.log(`\n===== ${query} =====`);
  const lower = source.toLowerCase();
  const needle = query.toLowerCase();
  let index = 0;
  let count = 0;
  while ((index = lower.indexOf(needle, index)) !== -1 && count < 12) {
    console.log(source.slice(Math.max(0, index - 900), Math.min(source.length, index + query.length + 1500)));
    console.log("---");
    index += needle.length;
    count += 1;
  }
}
