import { STEM_LIMITS, sendJson, stemServicesConfigured } from "../lib/stem-server.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const services = stemServicesConfigured();
  return sendJson(res, 200, {
    ready: Object.values(services).every(Boolean),
    services,
    maxFileBytes: STEM_LIMITS.maxFileBytes,
    acceptedTypes: [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/flac",
      "audio/x-flac",
      "audio/mp4",
      "audio/m4a",
      "audio/aac",
      "audio/ogg"
    ]
  });
}
