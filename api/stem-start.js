import {
  STEM_LIMITS,
  STEM_MODELS,
  cleanTarget,
  isAllowedBlobUrl,
  rateLimitPredictionStart,
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

  const limited = rateLimitPredictionStart(req);
  if (!limited.ok) return sendJson(res, limited.status, { error: limited.error });

  const body = readJsonBody(req);
  const audioUrl = String(body.audioUrl || "").trim();
  const target = cleanTarget(body.target);
  const quality = Object.hasOwn(STEM_MODELS, body.quality) ? body.quality : "best";
  const predictSpans = Boolean(body.predictSpans);

  if (!isAllowedBlobUrl(audioUrl)) {
    return sendJson(res, 400, { error: "The audio file must be uploaded through Forge before processing." });
  }
  if (!target || target.length < 2) {
    return sendJson(res, 400, { error: "Choose or describe the instrument or sound to remove." });
  }

  try {
    const model = STEM_MODELS[quality];
    const prediction = await replicateRequest("/predictions", {
      method: "POST",
      headers: { "Cancel-After": STEM_LIMITS.predictionDeadline },
      body: JSON.stringify({
        version: model.version,
        input: {
          audio: audioUrl,
          description: target,
          use_span_prompting: false,
          span_anchors: "[]",
          predict_spans: predictSpans,
          output_residual: true
        }
      })
    });

    return sendJson(res, 202, {
      id: prediction.id,
      status: prediction.status,
      model: model.label,
      target,
      createdAt: prediction.created_at || new Date().toISOString(),
      urls: { web: prediction.urls?.web || null }
    });
  } catch (error) {
    return sendJson(res, error?.status || 500, {
      error: error?.message || "The stem separation job could not be started."
    });
  }
}
