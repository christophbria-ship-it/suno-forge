"use strict";

(() => {
  const STEPS = [
    {
      name: "Brief",
      title: "Describe the song",
      copy: "Start with the situation, emotion, or story. Keep it simple and specific.",
      next: "Sound",
      action: "Continue to Sound"
    },
    {
      name: "Sound",
      title: "Shape the sound",
      copy: "Choose the production direction. Advanced choices stay out of the way until needed.",
      next: "Write",
      action: "Continue to Write"
    },
    {
      name: "Write",
      title: "Write and refine",
      copy: "Generate or edit the lyrics. Nothing is replaced until you approve it.",
      next: "Export",
      action: "Continue to Export"
    },
    {
      name: "Export",
      title: "Copy the finished parts",
      copy: "Copy Style and Lyrics into their matching Suno fields.",
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
    const active = tabs().find((tab) => tab.classList.contains("active"));
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

  function moveToStep(name) {
    const tab = tabForStep(name);
    if (!tab) return;
    tab.click();
    window.setTimeout(() => {
      document.querySelector(".v5-mode-tabs")?.scrollIntoView({ block: "start", behavior: "smooth" });
      renderGuide();
    }, 70);
  }

  function createGuide(panel) {
    const guide = document.createElement("section");
    guide.className = "v5-quick-path";
    guide.setAttribute("aria-label", "Current workflow step");
    guide.innerHTML = `
      <button type="button" class="v5-quick-path-back" aria-label="Go to previous step">Back</button>
      <div class="v5-quick-path-copy">
        <span></span>
        <strong></strong>
        <p></p>
      </div>
      <button type="button" class="v5-quick-path-next"></button>`;

    guide.querySelector(".v5-quick-path-back").addEventListener("click", () => {
      const previous = guide.dataset.previous;
      if (previous) moveToStep(previous);
    });

    guide.querySelector(".v5-quick-path-next").addEventListener("click", () => {
      const next = guide.dataset.next;
      if (next) moveToStep(next);
    });

    panel.prepend(guide);
    return guide;
  }

  function renderGuide() {
    const panel = visiblePanel();
    if (!panel) return;

    const index = activeStepIndex();
    const step = STEPS[index] || STEPS[0];
    const previous = index > 0 ? STEPS[index - 1].name : "";

    document.querySelectorAll(".v5-quick-path").forEach((guide) => {
      if (!panel.contains(guide)) guide.remove();
    });

    let guide = panel.querySelector(":scope > .v5-quick-path");
    if (!guide) guide = createGuide(panel);

    guide.dataset.previous = previous;
    guide.dataset.next = step.next;
    guide.dataset.first = String(index === 0);
    guide.dataset.last = String(!step.next);
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

  function init() {
    const observer = new MutationObserver(() => scheduleRender(55));
    observer.observe(document.documentElement, { childList: true, subtree: true });
    scheduleRender(220);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
