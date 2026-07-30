"use strict";

(() => {
  const STORAGE_KEY = "forgeOpenAIKeyV5";
  const READY = "ready";
  const nativeFetch = window.fetch.bind(window);
  let status = "local";
  let controlsInstalled = false;

  function getStoredKey() {
    try {
      return String(localStorage.getItem(STORAGE_KEY) || "").trim();
    } catch {
      return "";
    }
  }

  function setStoredKey(value) {
    const key = String(value || "").trim();
    try {
      if (key) localStorage.setItem(STORAGE_KEY, key);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      return false;
    }
    return true;
  }

  function isLyricsRequest(url) {
    try {
      const parsed = new URL(url, location.href);
      return parsed.origin === location.origin && /^\/api\/generate-lyrics(?:-[a-z0-9]+)?$/i.test(parsed.pathname);
    } catch {
      return false;
    }
  }

  function patchedUrl(url) {
    const parsed = new URL(url, location.href);
    parsed.pathname = "/api/generate-lyrics-v5";
    return parsed.toString();
  }

  window.fetch = function forgeFetch(input, init = {}) {
    const sourceUrl = typeof input === "string" || input instanceof URL ? String(input) : input?.url;
    if (!sourceUrl || !isLyricsRequest(sourceUrl)) return nativeFetch(input, init);

    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    new Headers(init.headers || {}).forEach((value, name) => headers.set(name, value));
    const key = getStoredKey();
    if (key) headers.set("x-forge-openai-key", key);

    if (input instanceof Request) {
      const request = new Request(patchedUrl(sourceUrl), input);
      return nativeFetch(request, { ...init, headers });
    }
    return nativeFetch(patchedUrl(sourceUrl), { ...init, headers });
  };

  function ensureV5Assets() {
    if (!document.querySelector('link[data-forge-v5="style"], link[href*="style-v5.css"]')) {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "style-v5.css?v=5.0.3";
      style.dataset.forgeV5 = "style";
      document.head.appendChild(style);
    }
    if (!document.querySelector('link[href*="style-v5-finish.css"]')) {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "style-v5-finish.css?v=5.0.3";
      document.head.appendChild(style);
    }
    window.setTimeout(() => {
      if (document.documentElement.dataset.forgeV5 === READY) return;
      if (document.querySelector('script[data-forge-v5="app"], script[src*="app-v5.js"]')) return;
      const script = document.createElement("script");
      script.src = "app-v5.js?v=5.0.3";
      script.async = false;
      script.dataset.forgeV5 = "app";
      document.body.appendChild(script);
    }, 1200);
  }

  function buttonLabel() {
    if (status === "checking") return "AI Checking";
    if (status === "ready") return "AI Ready";
    if (status === "invalid") return "AI Key Error";
    return "AI Local";
  }

  function updateButton() {
    const button = document.getElementById("forgeAiSettingsBtn");
    if (!button) return;
    button.textContent = buttonLabel();
    button.dataset.aiStatus = status;
    button.title = status === "ready"
      ? "Remote AI is available"
      : "Local lyric tools remain available. Tap to connect an OpenAI API key.";
  }

  async function checkAiStatus({ validateKey = false } = {}) {
    status = "checking";
    updateButton();
    const key = getStoredKey();
    try {
      const response = await nativeFetch("/api/ai-status", {
        method: validateKey && key ? "POST" : "GET",
        headers: key ? { "x-forge-openai-key": key } : undefined,
        cache: "no-store"
      });
      const data = await response.json().catch(() => ({}));
      if (validateKey && key) status = response.ok && data.valid ? "ready" : "invalid";
      else status = data.serverConfigured || key ? "ready" : "local";
    } catch {
      status = key ? "ready" : "local";
    }
    updateButton();
    return status;
  }

  function buildDialog() {
    if (document.getElementById("forgeAiDialog")) return document.getElementById("forgeAiDialog");
    const dialog = document.createElement("dialog");
    dialog.id = "forgeAiDialog";
    dialog.className = "v5-ai-dialog";
    dialog.innerHTML = `
      <form method="dialog" class="v5-ai-dialog-shell">
        <div class="v5-ai-dialog-header">
          <div>
            <span>FORGE AI</span>
            <h2>Connect remote lyric tools</h2>
          </div>
          <button value="cancel" type="submit" aria-label="Close">×</button>
        </div>
        <p class="v5-ai-copy">Forge works without a key using its local writer. Add an OpenAI API key for remote section writing, rewrites, polish, continuations, and hook generation.</p>
        <label class="v5-ai-field">
          <span>OpenAI API key</span>
          <div>
            <input id="forgeAiKeyInput" type="password" inputmode="text" autocomplete="off" spellcheck="false" placeholder="sk-proj-…">
            <button id="forgeAiRevealBtn" type="button">Show</button>
          </div>
        </label>
        <p class="v5-ai-security">Stored only in this browser. Sent only to Forge's same-origin serverless proxy and OpenAI when an AI action runs.</p>
        <div id="forgeAiDialogStatus" class="v5-ai-dialog-status" role="status"></div>
        <div class="v5-ai-actions">
          <button id="forgeAiRemoveBtn" type="button">Remove Key</button>
          <button id="forgeAiSaveBtn" class="primary-button" type="button">Save & Test</button>
        </div>
      </form>`;
    document.body.appendChild(dialog);

    const input = dialog.querySelector("#forgeAiKeyInput");
    const reveal = dialog.querySelector("#forgeAiRevealBtn");
    const save = dialog.querySelector("#forgeAiSaveBtn");
    const remove = dialog.querySelector("#forgeAiRemoveBtn");
    const message = dialog.querySelector("#forgeAiDialogStatus");

    reveal.addEventListener("click", () => {
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      reveal.textContent = showing ? "Show" : "Hide";
    });

    save.addEventListener("click", async () => {
      const key = input.value.trim();
      if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(key)) {
        message.textContent = "Enter a complete OpenAI API key.";
        message.dataset.state = "error";
        return;
      }
      save.disabled = true;
      message.textContent = "Testing key…";
      message.dataset.state = "busy";
      setStoredKey(key);
      const result = await checkAiStatus({ validateKey: true });
      save.disabled = false;
      if (result === "ready") {
        message.textContent = "Remote AI connected.";
        message.dataset.state = "success";
        window.setTimeout(() => dialog.close(), 500);
      } else {
        message.textContent = "The key could not be verified. Local tools still work.";
        message.dataset.state = "error";
      }
    });

    remove.addEventListener("click", () => {
      setStoredKey("");
      input.value = "";
      status = "local";
      updateButton();
      message.textContent = "Key removed. Forge will use local lyric tools.";
      message.dataset.state = "success";
    });

    dialog.addEventListener("close", () => {
      input.type = "password";
      reveal.textContent = "Show";
    });
    return dialog;
  }

  function openDialog() {
    const dialog = buildDialog();
    const input = dialog.querySelector("#forgeAiKeyInput");
    const message = dialog.querySelector("#forgeAiDialogStatus");
    input.value = getStoredKey();
    message.textContent = status === "ready" ? "Remote AI is connected." : "Local mode is active.";
    message.dataset.state = status === "ready" ? "success" : "neutral";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    window.setTimeout(() => input.focus(), 50);
  }

  function installControls() {
    if (controlsInstalled && document.getElementById("forgeAiSettingsBtn")) return true;
    const actions = document.querySelector(".topbar .header-actions") || document.querySelector(".topbar");
    if (!actions) return false;
    let button = document.getElementById("forgeAiSettingsBtn");
    if (!button) {
      button = document.createElement("button");
      button.id = "forgeAiSettingsBtn";
      button.type = "button";
      button.className = "v5-ai-settings-button";
      button.addEventListener("click", openDialog);
      actions.appendChild(button);
    }
    controlsInstalled = true;
    updateButton();
    return true;
  }

  function removeLegacyRandomizer() {
    const randomizer = document.getElementById("randomizeBtn");
    if (randomizer) randomizer.remove();
  }

  function installErrorBoundary() {
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Forge unhandled rejection", event.reason);
    });
    window.addEventListener("error", (event) => {
      console.error("Forge runtime error", event.error || event.message);
    });
  }

  function init() {
    ensureV5Assets();
    installErrorBoundary();
    removeLegacyRandomizer();
    installControls();
    checkAiStatus();

    const observer = new MutationObserver(() => {
      removeLegacyRandomizer();
      installControls();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}), { once: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
