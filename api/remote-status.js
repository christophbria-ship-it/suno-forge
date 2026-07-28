import {
  dropletPublicIpv4,
  listRemoteDroplets,
  remoteSessionUrl,
  sendJson,
  verifyRemoteAccess
} from "../lib/remote-server.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
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
      ready: active && ageMs >= 75_000,
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
