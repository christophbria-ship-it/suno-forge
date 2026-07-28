import crypto from "node:crypto";

const DO_API = "https://api.digitalocean.com/v2";
const REMOTE_TAG = "forge-studio-remote";
const REMOTE_DROPLET_NAME = "forge-studio-remote";
const REMOTE_VOLUME_NAME = "forge-studio-profile";

export const REMOTE_DEFAULTS = Object.freeze({
  region: process.env.REMOTE_REGION || "sfo3",
  size: process.env.REMOTE_SIZE || "s-2vcpu-4gb",
  image: process.env.REMOTE_IMAGE || "ubuntu-24-04-x64",
  volumeGb: Math.max(10, Math.min(100, Number(process.env.REMOTE_VOLUME_GB) || 10)),
  estimatedHourlyUsd: Number(process.env.REMOTE_HOURLY_USD) || 0.03571,
  estimatedVolumeMonthlyUsd: Number(process.env.REMOTE_VOLUME_MONTHLY_USD) || 1
});

export function sendJson(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function readJsonBody(req) {
  if (!req?.body) return {};
  if (typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (!left.length || left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function verifyRemoteAccess(req, fallbackCode = "") {
  const expected = String(process.env.REMOTE_ACCESS_CODE || "").trim();
  if (!expected) {
    return { ok: false, status: 503, error: "REMOTE_ACCESS_CODE is not configured on the server." };
  }
  const provided = String(
    fallbackCode ||
    req?.headers?.["x-forge-remote-key"] ||
    req?.headers?.["X-Forge-Remote-Key"] ||
    ""
  ).trim();
  if (!safeEqual(provided, expected)) {
    return { ok: false, status: 401, error: "Invalid Studio Remote access code." };
  }
  return { ok: true };
}

export function remoteServicesConfigured() {
  return {
    accessCode: Boolean(process.env.REMOTE_ACCESS_CODE),
    digitalOcean: Boolean(process.env.DIGITALOCEAN_TOKEN),
    tailscale: Boolean(process.env.TAILSCALE_AUTH_KEY)
  };
}

export async function digitalOceanRequest(path, options = {}) {
  const token = String(process.env.DIGITALOCEAN_TOKEN || "").trim();
  if (!token) {
    const error = new Error("DIGITALOCEAN_TOKEN is not configured.");
    error.status = 503;
    throw error;
  }
  const response = await fetch(`${DO_API}${path}`, {
    ...options,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    signal: options.signal || AbortSignal.timeout(25_000)
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text || "Invalid DigitalOcean response." };
  }
  if (!response.ok) {
    const error = new Error(data?.message || data?.id || `DigitalOcean request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function ensureRemoteTag() {
  try {
    await digitalOceanRequest(`/tags/${encodeURIComponent(REMOTE_TAG)}`, { method: "GET" });
    return;
  } catch (error) {
    if (error?.status !== 404) throw error;
  }
  await digitalOceanRequest("/tags", {
    method: "POST",
    body: JSON.stringify({ name: REMOTE_TAG })
  });
}

export async function listRemoteDroplets() {
  const data = await digitalOceanRequest(`/droplets?tag_name=${encodeURIComponent(REMOTE_TAG)}&per_page=20`, {
    method: "GET"
  });
  return Array.isArray(data.droplets) ? data.droplets : [];
}

export async function findProfileVolume() {
  const data = await digitalOceanRequest(
    `/volumes?name=${encodeURIComponent(REMOTE_VOLUME_NAME)}&region=${encodeURIComponent(REMOTE_DEFAULTS.region)}&per_page=20`,
    { method: "GET" }
  );
  return Array.isArray(data.volumes) ? data.volumes[0] || null : null;
}

export async function ensureProfileVolume() {
  const existing = await findProfileVolume();
  if (existing) return existing;
  const data = await digitalOceanRequest("/volumes", {
    method: "POST",
    body: JSON.stringify({
      size_gigabytes: REMOTE_DEFAULTS.volumeGb,
      name: REMOTE_VOLUME_NAME,
      description: "Persistent Chrome profile for Forge Studio Remote",
      region: REMOTE_DEFAULTS.region,
      filesystem_type: "ext4",
      filesystem_label: "forgeprofile",
      tags: [REMOTE_TAG]
    })
  });
  return data.volume;
}

function shellQuote(value) {
  return `'${String(value || "").replace(/'/g, `'\"'\"'`)}'`;
}

export function buildCloudInit() {
  const tailscaleKey = String(process.env.TAILSCALE_AUTH_KEY || "").trim();
  const browserPassword = String(process.env.REMOTE_BROWSER_PASSWORD || process.env.REMOTE_ACCESS_CODE || "").trim();
  const timezone = String(process.env.REMOTE_TIMEZONE || "America/Los_Angeles").trim();
  const chromeStart = String(process.env.REMOTE_START_URL || "https://suno.com/studio").trim();

  const bootstrap = `#!/usr/bin/env bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl docker.io ufw
systemctl enable --now docker

mkdir -p /mnt/forge-studio-profile
DEVICE=/dev/disk/by-id/scsi-0DO_Volume_${REMOTE_VOLUME_NAME}
for i in $(seq 1 60); do
  [ -e "$DEVICE" ] && break
  sleep 2
done
if ! blkid "$DEVICE" >/dev/null 2>&1; then
  mkfs.ext4 -F "$DEVICE"
fi
mount "$DEVICE" /mnt/forge-studio-profile
grep -q "$DEVICE" /etc/fstab || echo "$DEVICE /mnt/forge-studio-profile ext4 defaults,nofail,discard 0 2" >> /etc/fstab
mkdir -p /mnt/forge-studio-profile/chromium /mnt/forge-studio-profile/tailscale
chown -R 1000:1000 /mnt/forge-studio-profile/chromium

curl -fsSL https://tailscale.com/install.sh | sh
systemctl stop tailscaled || true
mkdir -p /var/lib/tailscale
mount --bind /mnt/forge-studio-profile/tailscale /var/lib/tailscale
grep -q "/var/lib/tailscale none bind" /etc/fstab || echo "/mnt/forge-studio-profile/tailscale /var/lib/tailscale none bind 0 0" >> /etc/fstab
systemctl start tailscaled
for i in $(seq 1 30); do
  tailscale status >/dev/null 2>&1 && break
  tailscale up --auth-key=${shellQuote(tailscaleKey)} --hostname=forge-studio-remote --accept-dns=true && break
  sleep 2
done

TS_IP=$(tailscale ip -4 | head -n1)
docker rm -f forge-studio-chrome >/dev/null 2>&1 || true
docker run -d \
  --name forge-studio-chrome \
  --restart unless-stopped \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=${shellQuote(timezone)} \
  -e CUSTOM_USER=forge \
  -e PASSWORD=${shellQuote(browserPassword)} \
  -e TITLE='Forge Studio Remote' \
  -e CHROME_CLI=${shellQuote(`${chromeStart} --start-maximized --disable-features=TranslateUI`)} \
  -p "$TS_IP:3001:3001" \
  -v /mnt/forge-studio-profile/chromium:/config \
  --shm-size=2gb \
  lscr.io/linuxserver/chromium:latest

ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow in on tailscale0 to any port 3001 proto tcp
ufw --force enable
`;

  return `#cloud-config
package_update: false
write_files:
  - path: /usr/local/sbin/forge-studio-bootstrap
    permissions: "0700"
    encoding: b64
    content: ${Buffer.from(bootstrap).toString("base64")}
runcmd:
  - ["/usr/local/sbin/forge-studio-bootstrap"]
`;
}

export async function createRemoteDroplet(volumeId) {
  const data = await digitalOceanRequest("/droplets", {
    method: "POST",
    body: JSON.stringify({
      name: REMOTE_DROPLET_NAME,
      region: REMOTE_DEFAULTS.region,
      size: REMOTE_DEFAULTS.size,
      image: REMOTE_DEFAULTS.image,
      monitoring: true,
      ipv6: true,
      tags: [REMOTE_TAG],
      volumes: [volumeId],
      user_data: buildCloudInit()
    })
  });
  return data.droplet;
}

export function dropletPublicIpv4(droplet) {
  const networks = droplet?.networks?.v4 || [];
  return networks.find((item) => item.type === "public")?.ip_address || "";
}

export function remoteSessionUrl() {
  return String(process.env.REMOTE_SESSION_URL || "https://forge-studio-remote:3001/").trim();
}

export function cleanDropletId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : 0;
}

export const REMOTE_NAMES = Object.freeze({
  tag: REMOTE_TAG,
  droplet: REMOTE_DROPLET_NAME,
  volume: REMOTE_VOLUME_NAME
});
