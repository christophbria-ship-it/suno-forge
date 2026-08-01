"use strict";

(() => {
  const STEPS = [
    {
      name: "Brief",
      title: "Describe the song",
      copy: "Say what you want to make. Forge will turn it into a workable starting point.",
      next: "Sound",
      action: "Shape the Sound"
    },
    {
      name: "Sound",
      title: "Shape the sound",
      copy: "Keep the suggested direction, or adjust only the parts that matter to you.",
      next: "Write",
      action: "Write the Song"
    },
    {
      name: "Write",
      title: "Make it yours",
      copy: "Generate a draft, edit anything, and keep moving when the song feels right.",
      next: "Export",
      action: "Prepare for Suno"
    },
    {
      name: "Export",
      title: "Move it into Suno",
      copy: "Copy Style first, then Lyrics. Each goes into its matching Suno box.",
      next: "",
      action: ""
    }
  ];

  let renderTimer = null;

  function tabs() {
    return [...document.querySelectorAll(".v5-mode-tab")];
  }

  function stepIndexForTab(tab) {
    const label = String(tab?.textContent || "").trim().toLowerCase();
    if (label === "song") return 2;
    return STEPS.findIndex((step) => step.name.toLowerCase() === label);
  }

  function activeStepIndex() {
    const list = tabs();
    const active = list.find((tab) => tab.classList.contains("active"));
    const index = stepIndexForTab(active);
    return index >= 0 ? index : 0;
  }

  function visiblePanel() {
    return [...document.querySelectorAll(".v5-panel")].find((panel) => {
      if (panel.hidden || panel.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(panel);
      return style.display !== "none" && style.visibility !== "hidden";
    }) || null;
  }

  function tabForStep(name) {
    const target = name === "Write" ? /^(?:write|song)$/i : new RegExp(`^${name}$`, "i");
    return tabs().find((tab) => target.test(String(tab.textContent || "").trim())) || null;
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
    window.setTimeout(() => toast.classList.remove("show"), 1700);
  }

  function ensureStyles() {
    if (document.getElementById("v5-quick-path-style")) return;
    const style = document.createElement("style");
    style.id = "v5-quick-path-style";
    style.textContent = `
      .v5-quick-path{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;align-items:center!important;gap:14px!important;margin:0 0 18px!important;padding:14px 15px!important;border:1px solid #e5e0d9!important;border-radius:18px!important;background:rgba(255,255,255,.94)!important;box-shadow:0 10px 30px rgba(37,31,25,.055)!important;backdrop-filter:blur(12px)!important}
      .v5-quick-path-progress{display:grid!important;place-items:center!important;width:42px!important;height:42px!important;border:1px solid #f1b58f!important;border-radius:50%!important;background:#fff7f1!important;color:#d95d16!important;font-size:.68rem!important;font-weight:900!important;letter-spacing:.03em!important;white-space:nowrap!important}
      .v5-quick-path-copy{min-width:0!important}
      .v5-quick-path-copy span{display:block!important;margin-bottom:3px!important;color:#f56f1f!important;font-size:.62rem!important;font-weight:850!important;letter-spacing:.11em!important;text-transform:uppercase!important}
      .v5-quick-path-copy strong{display:block!important;margin-bottom:3px!important;color:#171717!important;font-size:.98rem!important;line-height:1.2!important}
      .v5-quick-path-copy p{margin:0!important;color:#6f6d73!important;font-size:.76rem!important;line-height:1.45!important}
      .v5-quick-path-next{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-height:42px!important;padding:10px 13px!important;border:1px solid #f56f1f!important;border-radius:13px!important;background:#f56f1f!important;color:#fff!important;font-size:.74rem!important;font-weight:850!important;white-space:nowrap!important}
      .v5-quick-path-next::after{content:"→"!important;font-size:1rem!important;line-height:1!important}
      .v5-quick-path[data-last='true']{grid-template-columns:auto minmax(0,1fr)!important}
      .v5-quick-path[data-last='true'] .v5-quick-path-next{display:none!important}
      @media(max-width:620px){.v5-quick-path{grid-template-columns:auto minmax(0,1fr)!important}.v5-quick-path-next{grid-column:1 / -1!important;width:100%!important}.v5-quick-path[data-last='true']{grid-template-columns:auto minmax(0,1fr)!important}}
    `;
    document.head.appendChild(style);
  }

  function renderGuide() {
    const panel = visiblePanel();
    if (!panel) return;
    ensureStyles();

    const index = activeStepIndex();
    const step = STEPS[index] || STEPS[0];
    document.querySelectorAll(".v5-quick-path").forEach((guide) => {
      if (!panel.contains(guide)) guide.remove();
    });

    let guide = panel.querySelector(":scope > .v5-quick-path");
    if (!guide) {
      guide = document.createElement("section");
      guide.className = "v5-quick-path";
      guide.setAttribute("aria-label", "Quick path guidance");
      guide.innerHTML = `
        <div class="v5-quick-path-progress" aria-hidden="true"></div>
        <div class="v5-quick-path-copy">
          <span></span>
          <strong></strong>
          <p></p>
        </div>
        <button type="button" class="v5-quick-path-next"></button>`;
      panel.prepend(guide);

      guide.querySelector(".v5-quick-path-next").addEventListener("click", () => {
        const nextName = guide.dataset.next;
        if (!nextName) return;
        const nextTab = tabForStep(nextName);
        if (!nextTab) {
          notify("The next step is unavailable.");
          return;
        }
        nextTab.click();
        window.setTimeout(() => {
          document.querySelector(".v5-mode-tabs")?.scrollIntoView({ block: "start", behavior: "smooth" });
          renderGuide();
        }, 70);
      });
    }

    guide.dataset.next = step.next;
    guide.dataset.last = String(!step.next);
    guide.querySelector(".v5-quick-path-progress").textContent = `${index + 1}/4`;
    guide.querySelector(".v5-quick-path-copy span").textContent = `Step ${index + 1} of 4`;
    guide.querySelector(".v5-quick-path-copy strong").textContent = step.title;
    guide.querySelector(".v5-quick-path-copy p").textContent = step.copy;
    guide.querySelector(".v5-quick-path-next").textContent = step.action;
  }

  function scheduleRender(delay = 50) {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderGuide, delay);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest(".v5-mode-tab")) scheduleRender(80);
  }, true);

  const observer = new MutationObserver(() => scheduleRender(55));

  function init() {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    scheduleRender(220);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
