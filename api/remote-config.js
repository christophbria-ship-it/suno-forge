import {
  REMOTE_DEFAULTS,
  REMOTE_NAMES,
  remoteServicesConfigured,
  sendJson
} from "../lib/remote-server.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
  const services = remoteServicesConfigured();
  return sendJson(res, 200, {
    ready: Object.values(services).every(Boolean),
    services,
    region: REMOTE_DEFAULTS.region,
    size: REMOTE_DEFAULTS.size,
    estimatedHourlyUsd: REMOTE_DEFAULTS.estimatedHourlyUsd,
    estimatedVolumeMonthlyUsd: REMOTE_DEFAULTS.estimatedVolumeMonthlyUsd,
    names: REMOTE_NAMES,
    requiresTailscaleOnPhone: true
  });
}
