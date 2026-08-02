import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

const encoded = readFileSync(new URL("../app-v5-core.txt", import.meta.url), "utf8").replace(/\s+/g, "");
const source = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
const queries = [
  "/api/generate-lyrics",
  "runSectionAI",
  "buildSongPanel",
  "buildGenerationPayload",
  "lyricsInput",
  "Generate Draft",
  "Generate Lyrics",
  "Write the Song",
  "local writer"
];

for (const query of queries) {
  console.log(`\n===== ${query} =====`);
  const lower = source.toLowerCase();
  const needle = query.toLowerCase();
  let index = 0;
  let count = 0;
  while ((index = lower.indexOf(needle, index)) !== -1 && count < 12) {
    console.log(source.slice(Math.max(0, index - 1200), Math.min(source.length, index + query.length + 2200)));
    console.log("---");
    index += needle.length;
    count += 1;
  }
}
