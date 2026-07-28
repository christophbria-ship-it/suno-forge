import {
  REMOTE_DEFAULTS,
  createRemoteDroplet,
  ensureProfileVolume,
  ensureRemoteTag,
  listRemoteDroplets,
  readJsonBody,
  remoteSessionUrl,
  remoteServicesConfigured,
  sendJson,
  verifyRemoteAccess
} from "../lib/remote-server.js";

let lastStartAt = 0;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
  const body = readJsonBody(req);
  const access = verifyRemoteAccess(req, body.accessCode);
  if (!access.ok) return sendJson(res, access.status, { error: access.error });

  const services = remoteServicesConfigured();
  if (!Object.values(services).every(Boolean)) {
    return sendJson(res, 503, { error: "Studio Remote server settings are incomplete.", services });
  }

  const now = Date.now();
  if (now - lastStartAt < 30_000) {
    return sendJson(res, 429, { error: "A Studio Remote start was requested recently. Wait 30 seconds and check status." });
  }
  lastStartAt = now;

  try {
    await ensureRemoteTag();
    const existing = await listRemoteDroplets();
    const active = existing.find((item) => ["new", "active", "off", "archive"].includes(item.status));
    if (active) {
      return sendJson(res, 200, {
        id: active.id,
        status: active.status,
        createdAt: active.created_at || null,
        sessionUrl: remoteSessionUrl(),
        region: REMOTE_DEFAULTS.region,
        reused: true
      });
    }

    const volume = await ensureProfileVolume();
    const droplet = await createRemoteDroplet(volume.id);
    return sendJson(res, 202, {
      id: droplet.id,
      status: droplet.status,
      createdAt: droplet.created_at || new Date().toISOString(),
      sessionUrl: remoteSessionUrl(),
      region: REMOTE_DEFAULTS.region,
      volumeId: volume.id,
      reused: false
    });
  } catch (error) {
    return sendJson(res, error?.status || 500, {
      error: error?.message || "Studio Remote could not be started."
    });
  }
}
