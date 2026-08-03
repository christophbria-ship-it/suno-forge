"use strict";

(() => {
  const KEY_STORAGE = "forgeOpenAIKeyV5";
  const STATUS_TTL = 60_000;
  const TRANSIENT = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
  let installQueued = false;
  let running = false;
  let lastStatusAt = 0;
  let lastStatus = "unknown";

  function projectState() {
    try {
      return typeof state !== "undefined" && state ? state : null;
    } catch {
      return null;
    }
  }

  function storedKey() {
    try {
      return String(localStorage.getItem(KEY_STORAGE) || "").trim();
    } catch {
      return "";
    }
  }

  function currentLyrics() {
    const project = projectState();
    return String(project?.lyrics || document.getElementById("lyricsInput")?.value || "").trim();
  }

  function writePanel() {
    return document.querySelector('[data-v5-panel="song"]') || null;
  }

  function writeTab() {
    return [...document.querySelectorAll(".v5-mode-tab")]
      .find((button) => /^write$/i.test(button.textContent.trim())) || null;
  }

  function notify(message) {
    if (typeof showToast === "function") return showToast(message);
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2000);
  }

  function buildPayload(action) {
    const project = projectState() || {};
    return {
      action,
      songIdea: String(project.songIdea || "").trim(),
      selectedTags: Array.isArray(project.selectedTags) ? project.selectedTags : [],
      structure: Array.isArray(project.structure) ? project.structure : [],
      previousLyrics: currentLyrics(),
      customInstructions: String(project.customInstructions || "").trim(),
      platform: String(project.platform || project.targetPlatform || "Universal"),
      bpm: project.bpm,
      energy: project.energy,
      length: project.length,
      perspective: project.perspective,
      rhymeMode: project.rhymeMode,
      density: project.density,
      language: project.language
    };
  }

  function saveAcceptedLyrics(lyrics, action) {
    const project = projectState();
    if (!project) throw new Error("The current project is unavailable.");
    if (typeof snapshot === "function") snapshot();
    project.lyrics = lyrics;
    project.lastGeneratedLyrics = lyrics;
    project.lastAiAction = action;
    project.output = "";
    project.favorite = false;

    const legacy = document.getElementById("lyricsInput");
    if (legacy) legacy.value = lyrics;
    if (typeof saveAll === "function") saveAll({ immediate: true });
    if (typeof syncControls === "function") syncControls(false);
    writeTab()?.click();
    document.dispatchEvent(new CustomEvent("forge:state-change", { detail: { source: "whole-song-ai" } }));
  }

  function ensureStyles() {
    if (document.getElementById("v5-ai-draft-style")) return;
    const style = document.createElement("style");
    style.id = "v5-ai-draft-style";
    style.textContent = `
      .v5-ai-draft-action{display:grid!important;gap:14px!important;padding:20px!important;border:1px solid #dfdad3!important;border-radius:20px!important;background:#fff!important;box-shadow:0 12px 34px rgba(37,31,25,.055)!important}
      .v5-ai-draft-heading span{display:block!important;margin-bottom:5px!important;color:#f26b21!important;font-size:.66rem!important;font-weight:850!important;letter-spacing:.11em!important;text-transform:uppercase!important}
      .v5-ai-draft-heading h2{margin:0 0 6px!important;color:#171717!important;font-size:1.25rem!important;line-height:1.15!important}
      .v5-ai-draft-heading p,.v5-ai-draft-status{margin:0!important;color:#6f6d73!important;font-size:.8rem!important;line-height:1.48!important}
      .v5-ai-draft-action>button{width:100%!important;min-height:54px!important;border:0!important;border-radius:14px!important;background:#f26b21!important;color:#fff!important;font-size:.86rem!important;font-weight:850!important}
      .v5-ai-draft-action>button:disabled{background:#cfcac4!important;color:#666!important}
      .v5-ai-draft-status[data-state="error"]{color:#a53b2a!important}
      .v5-ai-draft-status[data-state="success"]{color:#256b43!important}
      .v5-ai-draft-status[data-state="busy"]{color:#82501d!important}
      .v5-ai-draft-preview{display:grid!important;gap:12px!important;padding-top:4px!important}
      .v5-ai-draft-preview>span{color:#f26b21!important;font-size:.66rem!important;font-weight:850!important;letter-spacing:.11em!important;text-transform:uppercase!important}
      .v5-ai-draft-preview textarea{width:100%!important;min-height:260px!important;padding:14px!important;border:1px solid #dedbe1!important;border-radius:14px!important;background:#f7f5f2!important;color:#171717!important;font:inherit!important;font-size:.79rem!important;line-height:1.55!important;resize:vertical!important;box-sizing:border-box!important}
      .v5-ai-draft-preview-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}
      .v5-ai-draft-preview-actions button{min-height:46px!important;border:1px solid #d8d5d0!important;border-radius:12px!important;background:#fff!important;color:#222!important;font-weight:800!important}
      .v5-ai-draft-preview-actions button:first-child{border-color:#f26b21!important;background:#f26b21!important;color:#fff!important}
      @media(max-width:520px){.v5-ai-draft-preview-actions{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
  }

  function previewResult(shell, lyrics, action) {
    let preview = shell.querySelector(".v5-ai-draft-preview");
    if (!preview) {
      preview = document.createElement("div");
      preview.className = "v5-ai-draft-preview";
      shell.appendChild(preview);
    }
    preview.replaceChildren();

    const label = document.createElement("span");
    label.textContent = "AI PREVIEW";
    const textarea = document.createElement("textarea");
    textarea.value = lyrics;
    textarea.setAttribute("aria-label", "AI lyric draft preview");
    const actions = document.createElement("div");
    actions.className = "v5-ai-draft-preview-actions";
    const accept = document.createElement("button");
    accept.type = "button";
    accept.textContent = "Use This Draft";
    const keep = document.createElement("button");
    keep.type = "button";
    keep.textContent = "Keep Current Lyrics";

    accept.addEventListener("click", () => {
      const value = textarea.value.trim();
      if (!value) return notify("The AI preview is empty.");
      saveAcceptedLyrics(value, action);
      notify("AI draft added");
    });
    keep.addEventListener("click", () => {
      preview.remove();
      const status = shell.querySelector(".v5-ai-draft-status");
      status.textContent = "Current lyrics kept.";
      status.dataset.state = "neutral";
    });

    actions.append(accept, keep);
    preview.append(label, textarea, actions);
  }

  async function fetchJson(url, options = {}, timeoutMs = 55_000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      return { response, data };
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("The AI request timed out. Nothing was changed.");
      throw error;
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function requestLyrics(payload) {
    const headers = { "Content-Type": "application/json" };
    const key = storedKey();
    if (key) headers["x-forge-openai-key"] = key;

    let lastError;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const { response, data } = await fetchJson("/api/generate-lyrics-v5", {
          method: "POST",
          headers,
          body: JSON.stringify(payload)
        });
        if (response.ok && typeof data.lyrics === "string" && data.lyrics.trim()) return data.lyrics.trim();
        const error = new Error(data.error || `AI request failed (${response.status}).`);
        error.status = response.status;
        throw error;
      } catch (error) {
        lastError = error;
        const status = Number(error?.status) || 0;
        const retry = attempt === 0 && (status === 0 || TRANSIENT.has(status));
        if (!retry) break;
        await new Promise((resolve) => window.setTimeout(resolve, status === 429 ? 1400 : 650));
      }
    }
    throw lastError || new Error("AI could not finish. Nothing was changed.");
  }

  async function verifyConnection(force = false) {
    if (!force && Date.now() - lastStatusAt < STATUS_TTL) return lastStatus;
    const key = storedKey();
    try {
      const { response, data } = key
        ? await fetchJson("/api/ai-status", { method: "POST", headers: { "x-forge-openai-key": key } }, 15_000)
        : await fetchJson("/api/ai-status?verify=1", {}, 15_000);
      lastStatus = response.ok && data.valid ? "ready" : "offline";
    } catch {
      lastStatus = "offline";
    }
    lastStatusAt = Date.now();
    return lastStatus;
  }

  async function runWholeSongAI(shell) {
    if (running) return;
    const button = shell.querySelector("[data-ai-draft-action]");
    const status = shell.querySelector(".v5-ai-draft-status");
    const existing = currentLyrics();
    const action = existing ? "regenerate" : "generate";

    running = true;
    button.disabled = true;
    button.textContent = existing ? "Writing a New Draft…" : "Writing Your Draft…";
    status.textContent = "Checking the AI connection…";
    status.dataset.state = "busy";

    try {
      const ready = await verifyConnection(true);
      if (ready !== "ready") {
        status.textContent = "AI is not connected. Tap AI at the top, save a valid API key, then retry.";
        status.dataset.state = "error";
        document.getElementById("forgeAiSettingsBtn")?.click();
        return;
      }
      status.textContent = "Writing from your brief, sound choices, and structure…";
      const lyrics = await requestLyrics(buildPayload(action));
      previewResult(shell, lyrics, action);
      status.textContent = "Draft ready. Review it before replacing your current lyrics.";
      status.dataset.state = "success";
    } catch (error) {
      status.textContent = `${error.message || "AI could not finish."} Your current lyrics were not changed.`;
      status.dataset.state = "error";
    } finally {
      running = false;
      button.disabled = false;
      button.textContent = currentLyrics() ? "Rewrite Full Draft with AI" : "Generate Full Draft with AI";
    }
  }

  async function refreshStatus(shell) {
    const status = shell.querySelector(".v5-ai-draft-status");
    status.textContent = "Checking AI…";
    status.dataset.state = "busy";
    const ready = await verifyConnection(true);
    status.textContent = ready === "ready"
      ? "AI connection verified. Your lyrics stay untouched until you accept a preview."
      : "AI is offline. Tap AI at the top to connect and test a key.";
    status.dataset.state = ready === "ready" ? "success" : "error";
  }

  function install() {
    installQueued = false;
    ensureStyles();
    const panel = writePanel();
    if (!panel) return;

    let shell = document.getElementById("forgeAiDraftAction");
    if (!shell) {
      shell = document.createElement("section");
      shell.id = "forgeAiDraftAction";
      shell.className = "v5-ai-draft-action";
      shell.innerHTML = `
        <div class="v5-ai-draft-heading">
          <span>AI WRITER</span>
          <h2>Build the full lyric draft</h2>
          <p>One verified action. You approve the preview before Forge replaces anything.</p>
        </div>
        <button type="button" data-ai-draft-action>Generate Full Draft with AI</button>
        <p class="v5-ai-draft-status" role="status">Checking AI…</p>`;
      const guide = panel.querySelector(":scope > .v5-quick-path");
      if (guide) guide.insertAdjacentElement("afterend", shell);
      else panel.prepend(shell);
      shell.querySelector("[data-ai-draft-action]").addEventListener("click", () => runWholeSongAI(shell));
      refreshStatus(shell);
    } else if (shell.parentElement !== panel) {
      panel.prepend(shell);
    }

    const button = shell.querySelector("[data-ai-draft-action]");
    if (!running && button) button.textContent = currentLyrics() ? "Rewrite Full Draft with AI" : "Generate Full Draft with AI";

    const advanced = [...panel.querySelectorAll("button")].find((item) => /^whole-song ai$/i.test(item.textContent.trim()));
    if (advanced) {
      advanced.textContent = "More AI Tools";
      advanced.title = "Open advanced writing controls";
    }
  }

  function queueInstall() {
    if (installQueued) return;
    installQueued = true;
    window.requestAnimationFrame(install);
  }

  function init() {
    install();
    const observer = new MutationObserver(queueInstall);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener("storage", (event) => {
      if (event.key === KEY_STORAGE) {
        lastStatusAt = 0;
        const shell = document.getElementById("forgeAiDraftAction");
        if (shell) refreshStatus(shell);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
