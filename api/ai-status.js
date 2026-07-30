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

async function verifyKey(key) {
  if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(key)) return { valid: false, status: 401, error: "Invalid key format." };
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(12_000)
    });
    if (!response.ok) return { valid: false, status: response.status === 401 ? 401 : 502, error: "OpenAI rejected the key." };
    return { valid: true, status: 200 };
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return { valid: false, status: timedOut ? 504 : 502, error: timedOut ? "Key check timed out." : "Could not reach OpenAI." };
  }
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  const serverKey = String(process.env.OPENAI_API_KEY || "").trim();
  const serverConfigured = Boolean(serverKey);

  if (req.method === "GET" && String(req.query?.verify || "") !== "1") {
    return json(res, 200, { serverConfigured, clientKeySupported: true });
  }

  if (rateLimited(getIp(req))) return json(res, 429, { valid: false, error: "Too many checks. Wait one minute." });
  const key = req.method === "GET" ? serverKey : String(req.headers["x-forge-openai-key"] || "").trim();
  if (!key) return json(res, 503, { valid: false, serverConfigured, error: "No API key is configured." });

  const result = await verifyKey(key);
  return json(res, result.status, {
    valid: result.valid,
    serverConfigured,
    source: req.method === "GET" ? "server" : "device",
    ...(result.error ? { error: result.error } : {})
  });
}
