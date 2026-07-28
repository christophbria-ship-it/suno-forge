"use strict";

(() => {
  function initV351() {
    if (document.documentElement.dataset.forgeV351 === "ready") return;
    if (typeof requestLyrics !== "function" || typeof buildGenerationPayload !== "function") {
      window.setTimeout(initV351, 40);
      return;
    }

    document.documentElement.dataset.forgeV351 = "ready";

    requestLyrics = async function requestLyricsV351(action) {
      const response = await fetch("/api/generate-lyrics-v351", {
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
        tagCount: Number.isFinite(Number(data.tagCount)) ? Number(data.tagCount) : 0,
        qualityPass: Boolean(data.qualityPass)
      };
    };

    document.title = "Forge Studio v3.5.1";
    const hero = document.querySelector(".hero");
    const eyebrow = hero?.querySelector(".eyebrow");
    const muted = hero?.querySelector(".muted");
    if (eyebrow) eyebrow.textContent = "FORGE STUDIO V3.5.1";
    if (muted) {
      muted.textContent = "Suno-ready exports, weighted music intelligence, and stricter lyric direction with dry 1990s alternative writing, blunt language, and a de-poeticizing quality pass.";
    }
  }

  if (document.readyState === "complete") initV351();
  else window.addEventListener("load", initV351, { once: true });
})();
