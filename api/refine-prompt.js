const WINDOW_MS = 60_000;
const LIMIT = 12;
const requests = new Map();

function json(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function clean(value, maximum) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

function getIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter(time => now - time < WINDOW_MS);
  if (recent.length >= LIMIT) {
    requests.set(ip, recent);
    return true;
  }
  recent.push(now);
  requests.set(ip, recent);
  return false;
}

function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  const chunks = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) return json(res, 503, { error: "Prompt AI is not configured. The local Forge generator still works." });
  if (rateLimited(getIp(req))) return json(res, 429, { error: "Too many prompt-refinement requests. Wait one minute." });

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return json(res, 400, { error: "Request body must be valid JSON." });
  }

  const prompt = clean(body.prompt, 5000);
  const direction = clean(body.direction, 300);
  const limit = Math.max(0, Math.min(5000, Number(body.limit) || 0));
  if (!prompt) return json(res, 400, { error: "Build a prompt before using Prompt AI." });

  const instructions = [
    "Refine a music-production prompt for a generative music platform.",
    "Do not write lyrics, song titles, explanations, analysis, or markdown.",
    "Preserve the user's genres, instruments, vocal direction, mood, arrangement, production details, and exclusions.",
    "Remove repetition and vague filler. Make the prompt specific, professional, and easy for a music model to follow.",
    limit ? `The final response must be no longer than ${limit} characters.` : "",
    direction ? `User refinement direction: ${direction}` : ""
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(25_000),
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        instructions,
        input: prompt,
        max_output_tokens: 900,
        store: false
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json(res, response.status, { error: data?.error?.message || `Prompt AI failed (${response.status}).` });
    }

    let result = extractText(data);
    if (!result) return json(res, 502, { error: "Prompt AI returned an empty result." });
    if (limit && result.length > limit) result = result.slice(0, limit).trimEnd();

    return json(res, 200, { prompt: result });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return json(res, timedOut ? 504 : 500, {
      error: timedOut ? "Prompt AI timed out. The local generator was not changed." : "Prompt AI is temporarily unavailable."
    });
  }
}
