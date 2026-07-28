import { del } from "@vercel/blob";
import {
  isAllowedBlobUrl,
  readJsonBody,
  sendJson,
  verifyStemAccess
} from "../lib/stem-server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const access = verifyStemAccess(req);
  if (!access.ok) return sendJson(res, access.status, { error: access.error });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return sendJson(res, 503, { error: "BLOB_READ_WRITE_TOKEN is not configured on the server." });
  }

  const body = readJsonBody(req);
  const audioUrl = String(body.audioUrl || "").trim();
  if (!isAllowedBlobUrl(audioUrl)) {
    return sendJson(res, 400, { error: "Invalid Forge upload URL." });
  }

  try {
    await del(audioUrl);
    return sendJson(res, 200, { deleted: true });
  } catch (error) {
    return sendJson(res, 500, { error: error?.message || "The uploaded audio could not be deleted." });
  }
}
