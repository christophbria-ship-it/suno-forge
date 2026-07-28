import {
  REMOTE_DEFAULTS,
  REMOTE_NAMES,
  cleanDropletId,
  createRemoteDroplet,
  digitalOceanRequest,
  dropletPublicIpv4,
  ensureProfileVolume,
  ensureRemoteTag,
  listRemoteDroplets,
  readJsonBody,
  remoteServicesConfigured,
  remoteSessionUrl,
  sendJson,
  verifyRemoteAccess
} from "../lib/remote-server.js";

let lastStartAt = 0;

function requireMethod(req, res, method) {
  if (req.method === method) return true;
  res.setHeader("Allow", method);
  sendJson(res, 405, { error: "Method not allowed." });
  return false;
}

async function handleConfig(req, res) {
  if (!requireMethod(req, res, "GET")) return;
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

async function handleStatus(req, res) {
  if (!requireMethod(req, res, "GET")) return;
  const access = verifyRemoteAccess(req);
  if (!access.ok) return sendJson(res, access.status, { error: access.error });

  try {
    const droplets = await listRemoteDroplets();
    const droplet = droplets[0] || null;
    if (!droplet) {
      return sendJson(res, 200, {
        exists: false,
        status: "stopped",
        ready: false,
        sessionUrl: remoteSessionUrl()
      });
    }

    const ageMs = Date.now() - Date.parse(droplet.created_at || new Date().toISOString());
    const active = droplet.status === "active";
    return sendJson(res, 200, {
      exists: true,
      id: droplet.id,
      status: droplet.status,
      ready: active && ageMs >= 120_000,
      bootSeconds: Math.max(0, Math.round(ageMs / 1000)),
      sessionUrl: remoteSessionUrl(),
      publicIpv4: dropletPublicIpv4(droplet),
      createdAt: droplet.created_at || null
    });
  } catch (error) {
    return sendJson(res, error?.status || 500, {
      error: error?.message || "Studio Remote status could not be loaded."
    });
  }
}

async function handleStart(req, res) {
  if (!requireMethod(req, res, "POST")) return;
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
    const active = existing.find((item) => ["new", "active", "off"].includes(item.status));
    if (active) {
      if (active.status === "off") {
        await digitalOceanRequest(`/droplets/${active.id}/actions`, {
          method: "POST",
          body: JSON.stringify({ type: "power_on" })
        });
      }
      return sendJson(res, 200, {
        id: active.id,
        status: active.status === "off" ? "new" : active.status,
        createdAt: active.created_at || null,
        sessionUrl: remoteSessionUrl(),
        region: REMOTE_DEFAULTS.region,
        reused: true,
        poweredOn: active.status === "off"
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

async function handleStop(req, res) {
  if (!requireMethod(req, res, "POST")) return;
  const body = readJsonBody(req);
  const access = verifyRemoteAccess(req, body.accessCode);
  if (!access.ok) return sendJson(res, access.status, { error: access.error });

  try {
    const droplets = await listRemoteDroplets();
    const requestedId = cleanDropletId(body.id);
    const targets = requestedId
      ? droplets.filter((item) => item.id === requestedId)
      : droplets;

    for (const droplet of targets) {
      await digitalOceanRequest(`/droplets/${droplet.id}`, { method: "DELETE" });
    }

    return sendJson(res, 200, {
      stopped: true,
      deletedDroplets: targets.map((item) => item.id),
      profilePreserved: true
    });
  } catch (error) {
    return sendJson(res, error?.status || 500, {
      error: error?.message || "Studio Remote could not be stopped."
    });
  }
}

export default async function handler(req, res) {
  const action = String(req.query?.action || "config").trim().toLowerCase();
  if (action === "config") return handleConfig(req, res);
  if (action === "status") return handleStatus(req, res);
  if (action === "start") return handleStart(req, res);
  if (action === "stop") return handleStop(req, res);
  return sendJson(res, 404, { error: "Unknown Studio Remote action." });
}
