"use strict";

(() => {
  async function requestLyricsV341(action) {
    const response = await fetch("/api/generate-lyrics-v341", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildGenerationPayload(action))
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Lyrics request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    if (!data.lyrics || typeof data.lyrics !== "string") {
      throw new Error("The server returned no lyrics.");
    }

    return {
      lyrics: data.lyrics.trim(),
      tagCount: Number.isFinite(Number(data.tagCount)) ? Number(data.tagCount) : 0
    };
  }

  function installV341() {
    if (document.documentElement.dataset.forgeV341 === "ready") return;
    document.documentElement.dataset.forgeV341 = "ready";

    requestLyrics = requestLyricsV341;
    document.title = "Forge Studio v3.4.1";

    const hero = document.querySelector(".hero");
    const eyebrow = hero?.querySelector(".eyebrow");
    const muted = hero?.querySelector(".muted");
    if (eyebrow) eyebrow.textContent = "FORGE STUDIO V3.4.1";
    if (muted) {
      muted.textContent = "Suno-ready exports, weighted music intelligence, and a lyric-quality guard that blocks repeated bookkeeping metaphors and stale AI phrasing.";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installV341, { once: true });
  } else {
    installV341();
  }
})();
