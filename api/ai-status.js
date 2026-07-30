const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
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
  if (recent.length >= RATE_LIMIT) return true;
  recent.push(now);
  requests.set(ip, recent);
  return false;
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  const serverConfigured = Boolean(process.env.OPENAI_API_KEY);
  if (req.method === "GET") {
    return json(res, 200, { serverConfigured, clientKeySupported: true });
  }

  if (rateLimited(getIp(req))) return json(res, 429, { valid: false, error: "Too many checks. Wait one minute." });
  const key = String(req.headers["x-forge-openai-key"] || "").trim();
  if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(key)) return json(res, 401, { valid: false, error: "Invalid key format." });

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(12_000)
    });
    if (!response.ok) return json(res, response.status === 401 ? 401 : 502, { valid: false, error: "OpenAI rejected the key." });
    return json(res, 200, { valid: true, serverConfigured });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return json(res, timedOut ? 504 : 502, { valid: false, error: timedOut ? "Key check timed out." : "Could not reach OpenAI." });
  }
}
