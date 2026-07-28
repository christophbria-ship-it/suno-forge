import {
  cleanPredictionId,
  isAllowedReplicateOutput,
  replicateRequest,
  sendJson,
  verifyStemAccess
} from "../lib/stem-server.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const access = verifyStemAccess(req);
  if (!access.ok) return sendJson(res, access.status, { error: access.error });

  const id = cleanPredictionId(req.query?.id);
  if (!id) return sendJson(res, 400, { error: "Invalid stem job ID." });

  try {
    const prediction = await replicateRequest(`/predictions/${id}`, { method: "GET" });
    const output = Array.isArray(prediction.output)
      ? prediction.output.filter((item) => typeof item === "string" && isAllowedReplicateOutput(item))
      : [];

    const result = {
      id: prediction.id,
      status: prediction.status,
      error: prediction.error || null,
      createdAt: prediction.created_at || null,
      startedAt: prediction.started_at || null,
      completedAt: prediction.completed_at || null,
      progress: prediction.status === "succeeded" ? 100 : prediction.status === "processing" ? 68 : prediction.status === "starting" ? 28 : 0,
      targetUrl: null,
      residualUrl: null,
      metrics: prediction.metrics || null
    };

    if (prediction.status === "succeeded") {
      result.targetUrl = output[0] || null;
      result.residualUrl = output[1] || null;
      if (!result.residualUrl) {
        result.error = "The separation model did not return the residual mix.";
      }
    }

    return sendJson(res, 200, result);
  } catch (error) {
    return sendJson(res, error?.status || 500, {
      error: error?.message || "The stem job status could not be loaded."
    });
  }
}
