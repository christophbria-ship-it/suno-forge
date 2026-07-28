import {
  cleanPredictionId,
  readJsonBody,
  replicateRequest,
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

  const body = readJsonBody(req);
  const id = cleanPredictionId(body.id);
  if (!id) return sendJson(res, 400, { error: "Invalid stem job ID." });

  try {
    const prediction = await replicateRequest(`/predictions/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({})
    });
    return sendJson(res, 200, { id: prediction.id, status: prediction.status });
  } catch (error) {
    return sendJson(res, error?.status || 500, {
      error: error?.message || "The stem job could not be canceled."
    });
  }
}
