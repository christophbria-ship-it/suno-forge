const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 8;
const requests = new Map();

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function getIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    requests.set(ip, recent);
    return true;
  }
  recent.push(now);
  requests.set(ip, recent);
  return false;
}

function cleanString(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanArray(value, maxItems, maxLength) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text.trim();
    }
  }
  return "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return json(res, 503, { error: "OPENAI_API_KEY is not configured on the server." });
  }

  const ip = getIp(req);
  if (rateLimited(ip)) {
    return json(res, 429, { error: "Too many lyric requests. Wait one minute and try again." });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return json(res, 400, { error: "Request body must be valid JSON." });
  }

  const songIdea = cleanString(body.songIdea, 500);
  const selectedTags = cleanArray(body.selectedTags, 24, 60);
  const structure = cleanArray(body.structure, 20, 40);
  const previousLyrics = cleanString(body.previousLyrics, 6000);
  const bpm = Math.min(220, Math.max(50, Number(body.bpm) || 120));
  const energy = cleanString(body.energy, 30) || "medium";
  const length = cleanString(body.length, 30) || "standard";

  const prompt = `Write a complete original song lyric draft for a mobile songwriting app.

Song idea: ${songIdea || "Create a grounded story from the selected style."}
Style tags: ${selectedTags.join(", ") || "No specific tags"}
Tempo: ${bpm} BPM
Energy: ${energy}
Length: ${length}
Required structure: ${structure.join(" -> ") || "Verse -> Chorus -> Verse -> Chorus -> Bridge -> Chorus"}

Rules:
- Follow the structure exactly and label each section in square brackets.
- Use concrete, believable details: objects, places, actions, overheard phrases, physical consequences.
- Avoid generic motivational language, vague cosmic imagery, "fire in my veins," "broken wings," "rise above," and other stock clichés.
- Do not imitate or mention any living artist or copyrighted song.
- Match the language tag if one is selected; otherwise write in English.
- Keep choruses memorable without repeating the song idea word-for-word every line.
- Vary line length naturally. Rhyme only when it feels earned.
- Output lyrics only, with no explanation or markdown fence.
${previousLyrics ? `- Make this substantially different from the previous draft below:\n${previousLyrics}` : ""}`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        instructions: "You are a disciplined songwriter. Produce specific, human, non-cliché lyrics that obey the requested structure.",
        input: prompt,
        max_output_tokens: 2200,
        store: false
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || `OpenAI request failed (${response.status}).`;
      return json(res, response.status, { error: message });
    }

    const lyrics = extractOutputText(data);
    if (!lyrics) return json(res, 502, { error: "The model returned an empty lyric draft." });
    return json(res, 200, { lyrics });
  } catch (error) {
    return json(res, 500, { error: error?.message || "Unexpected server error." });
  }
}
