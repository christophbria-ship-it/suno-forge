# Forge Studio v4.1 Studio Remote Setup

Forge Studio Remote runs the real desktop Suno Studio in a temporary cloud browser computer. Forge creates the computer only when requested, keeps the browser profile on a small persistent volume, and deletes the compute instance when the user taps **Stop and Stop Billing**.

## Architecture

1. Forge calls the DigitalOcean API from protected Vercel functions.
2. DigitalOcean creates a 4 GB Ubuntu Droplet in `sfo3` by default.
3. A persistent 10 GB volume stores Chromium settings, downloads, Suno login state, and the Tailscale machine identity.
4. Cloud-init installs Docker and Tailscale, then launches LinuxServer Chromium over KasmVNC.
5. Chromium is bound only to the private Tailscale address on HTTPS port 3001.
6. The phone reaches the session through the Tailscale Android app.
7. Stopping the session destroys the Droplet but preserves the profile volume.

## Accounts required

- DigitalOcean account with billing enabled.
- Free Tailscale personal account.
- Tailscale Android app installed and signed into the same tailnet.
- Suno Premier for Suno Studio access.

## Vercel environment variables

Add these to both Preview and Production:

- `REMOTE_ACCESS_CODE` — a private code chosen by the Forge owner. This also becomes the remote browser password unless `REMOTE_BROWSER_PASSWORD` is provided.
- `DIGITALOCEAN_TOKEN` — DigitalOcean personal access token. Use custom scopes for Droplet read/create/delete, Volume read/create, and Tag read/create.
- `TAILSCALE_AUTH_KEY` — reusable, pre-approved Tailscale auth key. The Tailscale state is kept on the profile volume, so the node retains the stable `forge-studio-remote` identity between sessions.

Optional:

- `REMOTE_BROWSER_PASSWORD` — separate password for the remote Chromium login.
- `REMOTE_REGION` — defaults to `sfo3`.
- `REMOTE_SIZE` — defaults to `s-2vcpu-4gb`.
- `REMOTE_IMAGE` — defaults to `ubuntu-24-04-x64`.
- `REMOTE_VOLUME_GB` — defaults to `10`.
- `REMOTE_TIMEZONE` — defaults to `America/Los_Angeles`.
- `REMOTE_START_URL` — defaults to `https://suno.com/studio`.
- `REMOTE_SESSION_URL` — defaults to `https://forge-studio-remote:3001/`.
- `REMOTE_HOURLY_USD` — displayed estimate; defaults to `0.03571`.
- `REMOTE_VOLUME_MONTHLY_USD` — displayed estimate; defaults to `1`.

Redeploy `main` after variables are saved.

## First phone session

1. Install Tailscale from Google Play.
2. Sign in and leave Tailscale connected.
3. Open Forge and select **Studio Remote**.
4. Save the `REMOTE_ACCESS_CODE`.
5. Tap **Start Studio Computer**.
6. Wait until Forge reports **Studio Ready**.
7. Tap **Open Suno Studio**.
8. Accept the one-time self-signed certificate warning if Android Chrome displays it.
9. Enter browser username `forge` and the remote access code.
10. Sign into Suno inside the remote Chromium window.
11. Work in landscape mode.
12. Return to Forge and tap **Stop and Stop Billing**.

## Cost behavior

The default DigitalOcean compute size is billed only while the Droplet exists. The persistent profile volume remains and is billed separately. Forge destroys the Droplet on stop and leaves the profile volume intact.

## Security notes

- The Chromium port is bound only to the Tailscale IP, not the public Droplet IP.
- Vercel remote-control routes require the private access code.
- DigitalOcean and Tailscale tokens remain server-side.
- The remote browser container has broad control over its isolated cloud host. Do not expose its port publicly.
- Rotate provider tokens if they are ever pasted into chat, screenshots, client-side code, or a public repository.
