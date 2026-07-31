"use strict";

(() => {
  const DRAFT_KEY = "forgeStartingPromptV5";
  let pendingAdvance = null;

  function briefInput() {
    return document.querySelector(".v5-brief-field textarea, .v5-brief-card textarea");
  }

  function soundTab() {
    return [...document.querySelectorAll(".v5-mode-tab")].find((tab) => /^sound$/i.test(tab.textContent.trim()))
      || document.querySelectorAll(".v5-mode-tab")[1]
      || null;
  }

  function visiblePanel() {
    return [...document.querySelectorAll(".v5-panel")].find((panel) => {
      if (panel.hidden || panel.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(panel);
      return style.display !== "none" && style.visibility !== "hidden";
    }) || null;
  }

  function buildFailed() {
    const errorPanel = document.getElementById("errorPanel");
    if (errorPanel && !errorPanel.classList.contains("hidden")) return true;
    const toast = document.getElementById("toast");
    const message = toast?.classList.contains("show") ? toast.textContent.trim() : "";
    return /error|failed|could not|required|describe/i.test(message);
  }

  function notify(message) {
    if (typeof showToast === "function") {
      showToast(message);
      return;
    }
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function storedDraft() {
    try {
      return String(localStorage.getItem(DRAFT_KEY) || "").trim();
    } catch {
      return "";
    }
  }

  function saveDraft(value) {
    try {
      const draft = String(value || "").trim();
      if (draft) localStorage.setItem(DRAFT_KEY, draft);
      else localStorage.removeItem(DRAFT_KEY);
    } catch {
      // The draft still works for the current session when storage is unavailable.
    }
  }

  function selectedTags() {
    try {
      if (typeof state !== "undefined" && Array.isArray(state.selectedTags)) {
        return [...new Set(state.selectedTags.map(String).filter(Boolean))];
      }
    } catch {
      // Fall back to the rendered chips below.
    }
    return [...new Set(
      [...document.querySelectorAll(".v5-stack-chip-name, .selected-tags [data-tag], #selectedTags .tag-chip")]
        .map((node) => String(node.textContent || node.dataset?.tag || "").trim())
        .filter(Boolean)
    )];
  }

  function selectedText(id) {
    const control = document.getElementById(id);
    if (!control) return "";
    if (control instanceof HTMLSelectElement) {
      return String(control.selectedOptions[0]?.textContent || control.value || "").trim();
    }
    return String(control.value || "").trim();
  }

  function structureLabels() {
    return [...new Set(
      [...document.querySelectorAll(".v5-timeline-section strong, #structureList [data-section-name], #structureList .structure-name")]
        .map((node) => String(node.textContent || node.dataset?.sectionName || "").trim())
        .filter(Boolean)
    )].slice(0, 10);
  }

  function cleanBrief(value) {
    return String(value || "").trim().replace(/[\s.]+$/, "");
  }

  function buildStartingDraft(brief) {
    const idea = cleanBrief(brief);
    const tags = selectedTags().slice(0, 14);
    const bpm = selectedText("bpmRange");
    const energy = selectedText("energySelect");
    const length = selectedText("lengthSelect");
    const structure = structureLabels();
    const parts = [`Create a song centered on this idea: ${idea}.`];

    if (tags.length) parts.push(`Sound palette: ${tags.join(", ")}.`);

    const movement = [];
    if (bpm) movement.push(`around ${bpm} BPM`);
    if (energy) movement.push(`${energy.toLowerCase()} energy`);
    if (length) movement.push(`a ${length.toLowerCase()} form`);
    if (movement.length) parts.push(`Direction: ${movement.join(", ")}.`);

    if (structure.length) parts.push(`Suggested structure: ${structure.join(" → ")}.`);

    parts.push("Keep the arrangement cohesive, let each section develop the story, make the chorus feel earned, and finish with a clear emotional resolution.");
    return parts.join(" ");
  }

  function ensureDraftStyle() {
    if (document.getElementById("v5-starting-prompt-style")) return;
    const style = document.createElement("style");
    style.id = "v5-starting-prompt-style";
    style.textContent = `
      .v5-starting-prompt-card{margin-bottom:22px!important;padding:22px!important;border:1px solid #e4dfd8!important;border-radius:22px!important;background:#fff!important;box-shadow:0 16px 46px rgba(37,31,25,.07)!important}
      .v5-starting-prompt-card .v5-starting-prompt-kicker{display:block!important;margin-bottom:7px!important;color:#f56f1f!important;font-size:.66rem!important;font-weight:850!important;letter-spacing:.11em!important;text-transform:uppercase!important}
      .v5-starting-prompt-card h2{margin:0 0 8px!important;color:#161616!important;font-size:1.35rem!important;line-height:1.1!important}
      .v5-starting-prompt-card p{margin:0 0 16px!important;color:#6f6d73!important;font-size:.8rem!important;line-height:1.5!important}
      .v5-starting-prompt-card textarea{width:100%!important;min-height:170px!important;padding:15px!important;border:1px solid #dedbe1!important;border-radius:15px!important;background:#f0eef2!important;color:#171717!important;font:inherit!important;line-height:1.55!important;resize:vertical!important;box-sizing:border-box!important}
      .v5-starting-prompt-card textarea:focus{border-color:#f56f1f!important;outline:3px solid rgba(245,111,31,.14)!important}
      .v5-starting-prompt-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;margin-top:12px!important}
      .v5-starting-prompt-actions button{min-height:46px!important;padding:10px 12px!important;border:1px solid #d8d5d0!important;border-radius:13px!important;background:#fff!important;color:#1c1c1c!important;font-size:.76rem!important;font-weight:800!important}
      .v5-starting-prompt-actions .v5-use-prompt{border-color:#f56f1f!important;background:#f56f1f!important;color:#fff!important}
      @media(max-width:420px){.v5-starting-prompt-actions{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
  }

  async function copyText(value) {
    const text = String(value || "").trim();
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand("copy");
      helper.remove();
      return copied;
    }
  }

  function renderDraft(draft = storedDraft()) {
    const text = String(draft || "").trim();
    if (!text) return;
    const tab = soundTab();
    if (!tab?.classList.contains("active")) return;
    const panel = visiblePanel();
    if (!panel) return;

    ensureDraftStyle();
    let card = panel.querySelector(".v5-starting-prompt-card");
    if (!card) {
      card = document.createElement("section");
      card.className = "card v5-starting-prompt-card";
      card.innerHTML = `
        <span class="v5-starting-prompt-kicker">Loose draft</span>
        <h2>Your starting prompt</h2>
        <p>Use this now, edit it directly, or refine the sound controls below and refresh the draft.</p>
        <textarea aria-label="Editable starting prompt" spellcheck="true"></textarea>
        <div class="v5-starting-prompt-actions">
          <button type="button" class="v5-refresh-prompt">Refresh from Choices</button>
          <button type="button" class="v5-use-prompt">Copy & Use Now</button>
        </div>`;
      panel.prepend(card);

      const textarea = card.querySelector("textarea");
      textarea.addEventListener("input", () => saveDraft(textarea.value));
      card.querySelector(".v5-refresh-prompt").addEventListener("click", () => {
        const input = briefInput();
        if (!input?.value.trim()) {
          notify("Add a song description first.");
          return;
        }
        const refreshed = buildStartingDraft(input.value);
        textarea.value = refreshed;
        saveDraft(refreshed);
        notify("Starting prompt refreshed.");
      });
      card.querySelector(".v5-use-prompt").addEventListener("click", async () => {
        const copied = await copyText(textarea.value);
        notify(copied ? "Starting prompt copied. Ready to use." : "Prompt could not be copied.");
      });
    }

    const textarea = card.querySelector("textarea");
    if (textarea && textarea.value !== text) textarea.value = text;
  }

  function advanceToSound(draft) {
    const tab = soundTab();
    if (!tab) return;
    if (!tab.classList.contains("active")) tab.click();
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        renderDraft(draft);
        document.querySelector(".v5-mode-tabs")?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    });
    notify("Starting prompt built. Use it now or shape the sound.");
  }

  function waitForBuild(button, brief) {
    if (pendingAdvance) window.clearInterval(pendingAdvance);
    const started = Date.now();
    pendingAdvance = window.setInterval(() => {
      if (buildFailed()) {
        window.clearInterval(pendingAdvance);
        pendingAdvance = null;
        return;
      }
      if (!button.isConnected || Date.now() - started > 5000) {
        window.clearInterval(pendingAdvance);
        pendingAdvance = null;
        return;
      }
      if (!button.disabled && Date.now() - started >= 250) {
        window.clearInterval(pendingAdvance);
        pendingAdvance = null;
        const draft = buildStartingDraft(brief);
        saveDraft(draft);
        advanceToSound(draft);
      }
    }, 100);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".v5-primary-hero");
    if (button && /build my starting point/i.test(button.textContent)) {
      const input = briefInput();
      if (!input || !input.value.trim()) return;
      waitForBuild(button, input.value.trim());
      return;
    }

    const tab = event.target.closest(".v5-mode-tab");
    if (tab && /^sound$/i.test(tab.textContent.trim())) {
      window.setTimeout(() => renderDraft(), 80);
      return;
    }

    if (event.target.closest("#resetBtn, [data-clear-action='reset']")) {
      saveDraft("");
      document.querySelector(".v5-starting-prompt-card")?.remove();
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(() => renderDraft(), 250), { once: true });
  } else {
    window.setTimeout(() => renderDraft(), 250);
  }
})();
