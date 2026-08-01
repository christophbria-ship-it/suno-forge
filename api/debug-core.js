import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";

export default function handler(request, response) {
  const query = String(request.query?.q || "").trim();
  if (!query || query.length > 80) {
    response.status(400).json({ error: "Provide a short q parameter." });
    return;
  }

  const encoded = readFileSync(new URL("../app-v5-core.txt", import.meta.url), "utf8").replace(/\s+/g, "");
  const source = gunzipSync(Buffer.from(encoded, "base64")).toString("utf8");
  const lower = source.toLowerCase();
  const needle = query.toLowerCase();
  const snippets = [];
  let index = 0;

  while ((index = lower.indexOf(needle, index)) !== -1 && snippets.length < 20) {
    snippets.push(source.slice(Math.max(0, index - 500), Math.min(source.length, index + query.length + 900)));
    index += needle.length;
  }

  response.setHeader("Cache-Control", "no-store");
  response.status(200).json({ query, count: snippets.length, snippets });
}
