import {
  cleanDropletId,
  digitalOceanRequest,
  listRemoteDroplets,
  readJsonBody,
  sendJson,
  verifyRemoteAccess
} from "../lib/remote-server.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }
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
