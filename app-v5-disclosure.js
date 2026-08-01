"use strict";

(() => {
  const RULES = [
    { match: /start from a recipe/i, panel: "brief" },
    { match: /browse the full sound library/i, panel: "sound" },
    { match: /advanced track controls/i, panel: "sound" },
    { match: /projects and history/i, panel: "tools" }
  ];
  let scheduled = false;

  function ensureStyle() {
    if (document.getElementById("v5-disclosure-integrity-style")) return;
    const style = document.createElement("style");
    style.id = "v5-disclosure-integrity-style";
    style.textContent = `
      body.forge-v5-clean{overflow-x:hidden!important}
      body.forge-v5-clean .v5-panel{min-width:0!important;max-width:100%!important}
      .v5-clean-disclosure{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
      .v5-clean-disclosure>summary{min-width:0!important;box-sizing:border-box!important}
      .v5-clean-disclosure-tools-only{display:none!important}
    `;
    document.head.appendChild(style);
  }

  function directContent(details) {
    return [...details.children].find((child) => child.tagName !== "SUMMARY") || null;
  }

  function summaryLabel(details) {
    return details.querySelector(":scope > summary")?.textContent?.trim() || "";
  }

  function ruleFor(details) {
    const label = summaryLabel(details);
    return RULES.find((rule) => rule.match.test(label)) || null;
  }

  function setExpanded(details) {
    details.querySelector(":scope > summary")?.setAttribute("aria-expanded", String(details.open));
  }

  function targetPanel(name) {
    return document.querySelector(`.v5-panel[data-v5-panel="${name}"]`);
  }

  function moveToCorrectPanel(details, content, panelName) {
    const panel = targetPanel(panelName);
    if (!panel) return false;
    panel.appendChild(content);
    details.remove();
    return true;
  }

  function repairDetails(details) {
    if (!(details instanceof HTMLDetailsElement)) return;

    const rule = ruleFor(details);
    const content = directContent(details);

    if (!rule) {
      if (!content) details.remove();
      return;
    }

    if (rule.panel === "tools") {
      if (!content) {
        details.remove();
        return;
      }
      details.classList.add("v5-clean-disclosure-tools-only");
      details.hidden = true;
      details.dataset.forgeDisclosure = "tools";
      return;
    }

    if (!content) {
      details.remove();
      return;
    }

    const actualPanel = details.closest(".v5-panel")?.dataset.v5Panel || "";
    if (actualPanel !== rule.panel) {
      moveToCorrectPanel(details, content, rule.panel);
      return;
    }

    details.hidden = false;
    details.classList.remove("v5-clean-disclosure-tools-only");
    details.dataset.forgeDisclosure = rule.panel;
    setExpanded(details);

    if (details.dataset.disclosureIntegrity !== "ready") {
      details.dataset.disclosureIntegrity = "ready";
      details.addEventListener("toggle", () => setExpanded(details));
    }
  }

  function repair() {
    scheduled = false;
    ensureStyle();
    if (document.documentElement.dataset.forgeV5 !== "ready") return;
    document.querySelectorAll(".v5-clean-disclosure").forEach(repairDetails);
  }

  function scheduleRepair() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(repair);
  }

  function init() {
    repair();
    window.setTimeout(scheduleRepair, 120);
    window.setTimeout(scheduleRepair, 360);
    const observer = new MutationObserver(scheduleRepair);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "open", "hidden", "data-forge-v5"]
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
