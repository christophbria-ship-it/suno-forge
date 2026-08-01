"use strict";

(() => {
  const HIDDEN_CLASSES = [
    "v5-legacy-panel",
    "v5-legacy-hero",
    "v5-legacy-output",
    "v5-panel-hidden",
    "workspace-hidden"
  ];
  let scheduled = false;

  function ensureStyle() {
    if (document.getElementById("v5-disclosure-fix-style")) return;
    const style = document.createElement("style");
    style.id = "v5-disclosure-fix-style";
    style.textContent = `
      body.forge-v5-clean{overflow-x:hidden!important}
      body.forge-v5-clean .v5-panel{min-width:0!important;max-width:100%!important}
      .v5-clean-disclosure{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
      .v5-clean-disclosure>summary{min-width:0!important;box-sizing:border-box!important}
      .v5-clean-disclosure[open]>.v5-clean-disclosure-content{display:block!important;visibility:visible!important;opacity:1!important;max-height:none!important;overflow:visible!important}
    `;
    document.head.appendChild(style);
  }

  function contentFor(details) {
    return [...details.children].find((child) => child.tagName !== "SUMMARY") || null;
  }

  function unlock(details) {
    if (!details?.open) return;
    const content = contentFor(details);
    if (!content) return;

    content.classList.add("v5-clean-disclosure-content");
    HIDDEN_CLASSES.forEach((name) => content.classList.remove(name));
    content.hidden = false;
    content.removeAttribute("aria-hidden");
    if (content.style.display === "none") content.style.removeProperty("display");

    const summary = details.querySelector(":scope > summary");
    summary?.setAttribute("aria-expanded", "true");
  }

  function prepare(details) {
    if (!(details instanceof HTMLDetailsElement)) return;
    const content = contentFor(details);
    if (content) content.classList.add("v5-clean-disclosure-content");

    const summary = details.querySelector(":scope > summary");
    summary?.setAttribute("aria-expanded", String(details.open));

    if (details.dataset.disclosureFix !== "ready") {
      details.dataset.disclosureFix = "ready";
      details.addEventListener("toggle", () => {
        summary?.setAttribute("aria-expanded", String(details.open));
        unlock(details);
      });
    }

    unlock(details);
  }

  function repair() {
    scheduled = false;
    ensureStyle();
    document.querySelectorAll(".v5-clean-disclosure").forEach(prepare);
  }

  function scheduleRepair() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(repair);
  }

  function init() {
    repair();
    const observer = new MutationObserver(scheduleRepair);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden", "open"]
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest(".v5-clean-disclosure > summary")) scheduleRepair();
    }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
