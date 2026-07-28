import { handleUpload } from "@vercel/blob/client";
import { STEM_LIMITS, readJsonBody, sendJson, verifyStemAccess } from "../lib/stem-server.js";

const AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/m4a",
  "audio/aac",
  "audio/ogg",
  "application/octet-stream"
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return sendJson(res, 503, { error: "BLOB_READ_WRITE_TOKEN is not configured on the server." });
  }

  const body = readJsonBody(req);

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload = {};
        try {
          payload = JSON.parse(clientPayload || "{}");
        } catch {
          payload = {};
        }

        const access = verifyStemAccess(req, payload.accessCode);
        if (!access.ok) throw new Error(access.error);

        const cleanPath = String(pathname || "");
        if (!cleanPath.startsWith("forge-stems/input/")) {
          throw new Error("Invalid stem upload path.");
        }

        return {
          allowedContentTypes: AUDIO_TYPES,
          maximumSizeInBytes: STEM_LIMITS.maxFileBytes,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ purpose: "forge-stem-input" })
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("Forge stem upload completed", blob.pathname, blob.contentType);
      }
    });

    return sendJson(res, 200, result);
  } catch (error) {
    return sendJson(res, 400, { error: error?.message || "Audio upload authorization failed." });
  }
}
