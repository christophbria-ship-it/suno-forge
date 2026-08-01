"use strict";

(() => {
  let renderTimer = null;

  function notify(message) {
    if (typeof showToast === "function") {
      showToast(message);
      return;
    }
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1900);
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

  function exportTab() {
    return [...document.querySelectorAll(".v5-mode-tab")].find((tab) => /^export$/i.test(tab.textContent.trim())) || null;
  }

  function visiblePanel() {
    return [...document.querySelectorAll(".v5-panel")].find((panel) => {
      if (panel.hidden || panel.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(panel);
      return style.display !== "none" && style.visibility !== "hidden";
    }) || null;
  }

  function isExportOpen() {
    return Boolean(exportTab()?.classList.contains("active"));
  }

  function currentState() {
    try {
      if (typeof state !== "undefined" && state) return state;
    } catch {
      // Fall back to the rendered controls.
    }
    return null;
  }

  function controlValue(id) {
    const control = document.getElementById(id);
    if (!control) return "";
    return String(control.value || "").trim();
  }

  function selectedTags() {
    const project = currentState();
    if (Array.isArray(project?.selectedTags)) {
      return [...new Set(project.selectedTags.map(String).map((tag) => tag.trim()).filter(Boolean))];
    }
    return [...new Set(
      [...document.querySelectorAll(".v5-stack-chip-name, #selectedTags .selected-chip, #selectedTags [data-tag]")]
        .map((node) => String(node.dataset?.tag || node.textContent || "").replace(/\s*[×x]\s*$/, "").trim())
        .filter(Boolean)
    )];
  }

  function structureLabels() {
    const project = currentState();
    if (Array.isArray(project?.structure)) return project.structure.map(String).filter(Boolean);
    return [...document.querySelectorAll("#structureList select")]
      .map((select) => String(select.value || "").trim())
      .filter(Boolean);
  }

  function buildStyleExport() {
    const project = currentState();
    const tags = selectedTags();
    const bpm = String(project?.bpm || controlValue("bpmRange") || "").trim();
    const energy = String(project?.energy || controlValue("energySelect") || "").trim();
    const length = String(project?.length || controlValue("lengthSelect") || "").trim();
    const direction = String(project?.customInstructions || document.getElementById("customInstructions")?.value || "").trim();
    const structure = structureLabels();
    const parts = [];

    if (tags.length) parts.push(tags.join(", "));
    if (bpm) parts.push(`${bpm} BPM`);
    if (energy) parts.push(`${energy} energy`);
    if (length) parts.push(`${length} song length`);
    if (structure.length) parts.push(`structure: ${structure.join(" → ")}`);

    let style = parts.join(", ");
    if (style) style += ".";
    if (direction) style += `${style ? " " : ""}${direction}`;
    return style.trim();
  }

  function buildLyricsExport() {
    const project = currentState();
    return String(document.getElementById("lyricsInput")?.value || project?.lyrics || "").trim();
  }

  function ensureStyles() {
    if (document.getElementById("v5-suno-export-style")) return;
    const style = document.createElement("style");
    style.id = "v5-suno-export-style";
    style.textContent = `
      .v5-suno-export{display:grid!important;gap:16px!important;margin-bottom:22px!important}
      .v5-suno-export-intro{padding:18px 20px!important;border:1px solid #e4dfd8!important;border-radius:19px!important;background:#fff!important}
      .v5-suno-export-intro span,.v5-suno-copy-unit .v5-suno-step{display:block!important;margin-bottom:6px!important;color:#f56f1f!important;font-size:.66rem!important;font-weight:850!important;letter-spacing:.11em!important;text-transform:uppercase!important}
      .v5-suno-export-intro h2,.v5-suno-copy-unit h2{margin:0 0 7px!important;color:#171717!important;font-size:1.28rem!important;line-height:1.15!important}
      .v5-suno-export-intro p,.v5-suno-copy-unit p{margin:0!important;color:#6f6d73!important;font-size:.8rem!important;line-height:1.5!important}
      .v5-suno-export-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:14px!important}
      .v5-suno-copy-unit{display:flex!important;flex-direction:column!important;min-width:0!important;padding:18px!important;border:1px solid #e4dfd8!important;border-radius:19px!important;background:#fff!important;box-shadow:0 12px 34px rgba(37,31,25,.055)!important}
      .v5-suno-copy-unit textarea{width:100%!important;min-height:190px!important;margin:14px 0 12px!important;padding:14px!important;border:1px solid #dedbe1!important;border-radius:14px!important;background:#f0eef2!important;color:#171717!important;font:inherit!important;font-size:.78rem!important;line-height:1.5!important;resize:vertical!important;box-sizing:border-box!important}
      .v5-suno-copy-unit button{min-height:48px!important;margin-top:auto!important;padding:11px 14px!important;border:1px solid #f56f1f!important;border-radius:13px!important;background:#f56f1f!important;color:#fff!important;font-size:.8rem!important;font-weight:850!important}
      .v5-suno-copy-unit button:disabled{border-color:#d7d4d0!important;background:#d7d4d0!important;color:#777!important}
      .v5-suno-backup{padding:4px 2px!important;color:#6f6d73!important;font-size:.76rem!important}
      .v5-suno-backup summary{cursor:pointer!important;font-weight:800!important}
      .v5-suno-backup button{width:100%!important;min-height:44px!important;margin-top:10px!important;border:1px solid #d8d5d0!important;border-radius:12px!important;background:#fff!important;color:#222!important;font-weight:800!important}
      .v5-export-everything-legacy{display:none!important}
      @media(max-width:720px){.v5-suno-export-grid{grid-template-columns:1fr!important}.v5-suno-copy-unit textarea{min-height:170px!important}}
    `;
    document.head.appendChild(style);
  }

  function downgradeCombinedButton(panel) {
    [...panel.querySelectorAll("button")].forEach((button) => {
      if (!/^(?:copy|export) everything$/i.test(button.textContent.trim())) return;
      if (button.closest(".v5-suno-export")) return;
      button.classList.add("v5-export-everything-legacy");
      button.setAttribute("aria-hidden", "true");
      button.tabIndex = -1;
    });
  }

  function updateCard(card) {
    const styleText = buildStyleExport();
    const lyricsText = buildLyricsExport();
    const styleBox = card.querySelector("[data-suno-output='style']");
    const lyricsBox = card.querySelector("[data-suno-output='lyrics']");
    const styleButton = card.querySelector("[data-copy-suno='style']");
    const lyricsButton = card.querySelector("[data-copy-suno='lyrics']");
    const allButton = card.querySelector("[data-copy-suno='all']");

    if (styleBox && styleBox.value !== styleText) styleBox.value = styleText;
    if (lyricsBox && lyricsBox.value !== lyricsText) lyricsBox.value = lyricsText;
    if (styleButton) styleButton.disabled = !styleText;
    if (lyricsButton) lyricsButton.disabled = !lyricsText;
    if (allButton) allButton.disabled = !styleText && !lyricsText;
  }

  function renderExport() {
    if (!isExportOpen()) return;
    const panel = visiblePanel();
    if (!panel) return;
    ensureStyles();
    downgradeCombinedButton(panel);

    let card = panel.querySelector(".v5-suno-export");
    if (!card) {
      card = document.createElement("section");
      card.className = "v5-suno-export";
      card.innerHTML = `
        <div class="v5-suno-export-intro">
          <span>SUNO EXPORT</span>
          <h2>Copy each field separately</h2>
          <p>Your phone clipboard holds one item at a time. Copy Style first, paste it into Suno, then return and copy Lyrics.</p>
        </div>
        <div class="v5-suno-export-grid">
          <section class="v5-suno-copy-unit">
            <span class="v5-suno-step">STEP 1</span>
            <h2>Style</h2>
            <p>Paste only this into Suno's Style box.</p>
            <textarea data-suno-output="style" readonly aria-label="Style export"></textarea>
            <button type="button" data-copy-suno="style">Copy Style</button>
          </section>
          <section class="v5-suno-copy-unit">
            <span class="v5-suno-step">STEP 2</span>
            <h2>Lyrics</h2>
            <p>After pasting Style, return here and copy this into Suno's Lyrics box.</p>
            <textarea data-suno-output="lyrics" readonly aria-label="Lyrics export"></textarea>
            <button type="button" data-copy-suno="lyrics">Copy Lyrics</button>
          </section>
        </div>
        <details class="v5-suno-backup">
          <summary>Combined backup export</summary>
          <button type="button" data-copy-suno="all">Copy Everything (optional)</button>
        </details>`;
      panel.prepend(card);

      card.addEventListener("click", async (event) => {
        const action = event.target.closest("[data-copy-suno]")?.dataset.copySuno;
        if (!action) return;
        const styleText = card.querySelector("[data-suno-output='style']")?.value.trim() || "";
        const lyricsText = card.querySelector("[data-suno-output='lyrics']")?.value.trim() || "";
        let value = "";
        let success = "";
        if (action === "style") {
          value = styleText;
          success = "Style copied. Paste it into Suno's Style box.";
        } else if (action === "lyrics") {
          value = lyricsText;
          success = "Lyrics copied. Paste them into Suno's Lyrics box.";
        } else {
          value = [styleText && `STYLE:\n${styleText}`, lyricsText && `LYRICS:\n${lyricsText}`].filter(Boolean).join("\n\n");
          success = "Combined backup copied.";
        }
        const copied = await copyText(value);
        notify(copied ? success : "That field could not be copied.");
      });
    }

    updateCard(card);
  }

  function scheduleRender(delay = 60) {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderExport, delay);
  }

  document.addEventListener("click", (event) => {
    const tab = event.target.closest(".v5-mode-tab");
    if (tab && /^export$/i.test(tab.textContent.trim())) scheduleRender(90);
  }, true);

  document.addEventListener("input", () => {
    if (isExportOpen()) scheduleRender(30);
  }, true);

  document.addEventListener("change", () => {
    if (isExportOpen()) scheduleRender(30);
  }, true);

  const observer = new MutationObserver(() => {
    if (isExportOpen()) scheduleRender(50);
  });

  function init() {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    scheduleRender(250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
