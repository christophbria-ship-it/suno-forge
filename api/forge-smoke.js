import generateLyricsV5 from "./generate-lyrics-v5.js";

const TOKEN = "Esvttqdi1T-gOnNtyKEYWzi9BoXowUEQ";

function send(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== "GET" || String(req.query?.token || "") !== TOKEN) {
    return send(res, 404, { ok: false });
  }

  let capturedStatus = 200;
  let capturedBody = "";
  const capture = {
    status(code) {
      capturedStatus = code;
      return this;
    },
    setHeader() {
      return this;
    },
    end(value = "") {
      capturedBody = String(value);
      return this;
    }
  };

  await generateLyricsV5({
    method: "POST",
    headers: { "x-forwarded-for": `forge-smoke-${Date.now()}` },
    body: {
      action: "write-section",
      songIdea: "A woman quietly leaves a controlling relationship before sunrise.",
      selectedTags: ["Appalachian Folk", "Dark Folk", "Intimate", "Female Vocal", "Fiddle"],
      structure: ["Verse", "Chorus"],
      sectionName: "Verse",
      sectionLyrics: "",
      bpm: 82,
      energy: "low",
      length: "short",
      perspective: "first person",
      rhymeMode: "natural",
      density: "sparse",
      language: "English"
    }
  }, capture);

  let payload = {};
  try {
    payload = JSON.parse(capturedBody || "{}");
  } catch {
    payload = {};
  }

  const lyrics = typeof payload.lyrics === "string" ? payload.lyrics.trim() : "";
  return send(res, capturedStatus === 200 && lyrics ? 200 : 502, {
    ok: capturedStatus === 200 && lyrics.length > 0,
    handlerStatus: capturedStatus,
    source: payload.source || null,
    model: payload.model || null,
    hasLyrics: lyrics.length > 0,
    sectionLabels: (lyrics.match(/^\s*\[[^\]]+\]\s*$/gm) || []).length,
    lineCount: lyrics.split(/\r?\n/).filter((line) => line.trim() && !/^\s*\[[^\]]+\]\s*$/.test(line)).length
  });
}
