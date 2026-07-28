import crypto from "node:crypto";

export const STEM_MODELS = Object.freeze({
  fast: {
    label: "SAM Audio Base",
    version: "geopti/sam-audio-base:b84861ae9b787409ef92927b5a07704fda87a0a7762e9bb7b09c517357eadb53"
  },
  best: {
    label: "SAM Audio Large",
    version: "geopti/sam-audio-large:d8a8a4fcdcbf0bdc863f6d98cd2117ec0bc02224b576c7b98b2a009a8a1f83fa"
  }
});

export const STEM_LIMITS = Object.freeze({
  maxFileBytes: 100 * 1024 * 1024,
  maxTargetLength: 120,
  pollSeconds: 2,
  predictionDeadline: "15m"
});

const predictionStarts = new Map();

export function sendJson(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function getIp(req) {
  const forwarded = req.headers?.["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

export function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return {};
    }
  }
  return {};
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

export function stemAccessConfigured() {
  return Boolean(process.env.STEM_ACCESS_CODE);
}

export function verifyStemAccess(req, suppliedCode = "") {
  const expected = process.env.STEM_ACCESS_CODE;
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "STEM_ACCESS_CODE is not configured on the server."
    };
  }

  const headerCode = req.headers?.["x-forge-stem-key"];
  const provided = String(Array.isArray(headerCode) ? headerCode[0] : headerCode || suppliedCode || "");
  if (!safeEqual(expected, provided)) {
    return { ok: false, status: 401, error: "Incorrect Forge stem access code." };
  }
  return { ok: true };
}

export function stemServicesConfigured() {
  return {
    accessCode: stemAccessConfigured(),
    blob: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    replicate: Boolean(process.env.REPLICATE_API_TOKEN)
  };
}

export function rateLimitPredictionStart(req) {
  const ip = getIp(req);
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const recent = (predictionStarts.get(ip) || []).filter((time) => now - time < windowMs);
  if (recent.length >= 4) {
    predictionStarts.set(ip, recent);
    return {
      ok: false,
      status: 429,
      error: "Four stem jobs have already been started from this connection in the past hour."
    };
  }
  recent.push(now);
  predictionStarts.set(ip, recent);
  return { ok: true };
}

export function cleanTarget(value) {
  return String(value || "")
    .replace(/[<>\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, STEM_LIMITS.maxTargetLength);
}

export function cleanPredictionId(value) {
  const id = String(value || "").trim();
  return /^[a-z0-9]{10,80}$/i.test(id) ? id : "";
}

export function isAllowedBlobUrl(value) {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol !== "https:") return false;
    return url.hostname === "blob.vercel-storage.com" || url.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function isAllowedReplicateOutput(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" && (
      url.hostname === "replicate.delivery" ||
      url.hostname.endsWith(".replicate.delivery") ||
      url.hostname === "stream.replicate.com"
    );
  } catch {
    return false;
  }
}

export async function replicateRequest(path, options = {}) {
  if (!process.env.REPLICATE_API_TOKEN) {
    const error = new Error("REPLICATE_API_TOKEN is not configured on the server.");
    error.status = 503;
    throw error;
  }

  const response = await fetch(`https://api.replicate.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.detail || data?.error || `Replicate request failed (${response.status}).`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}
