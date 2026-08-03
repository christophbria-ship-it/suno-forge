"use strict";

(() => {
  const READY = "ready";
  const ACCESS_KEY = "forgeStemAccessCodeV4";
  let installQueued = false;

  function node(tag, className = "", text = "") {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text) item.textContent = text;
    return item;
  }

  function isHidden(item) {
    return !item || item.hidden || item.classList.contains("workspace-hidden");
  }

  function installStemFocus() {
    const workspace = document.getElementById("stemWorkspace");
    if (!workspace || workspace.dataset.focusUi === READY) return false;

    const cards = [...workspace.children].filter((item) => item.matches("section.card"));
    if (cards.length < 8) return false;

    const [hero, setup, upload, target, settings, progress, results, history] = cards;
    workspace.dataset.focusUi = READY;
    workspace.classList.add("stem-focus-workspace");

    hero.classList.add("stem-focus-hero");
    const heroTitle = hero.querySelector("h2");
    const heroCopy = hero.querySelector(".muted");
    if (heroTitle) heroTitle.textContent = "Separate one clean stem at a time.";
    if (heroCopy) heroCopy.textContent = "Upload a song, choose the sound, process it, then download both files.";
    hero.querySelector(".stem-flow")?.remove();

    setup.classList.add("stem-setup-compact");
    const setupHeading = setup.querySelector(".section-heading");
    const setupTitle = setupHeading?.querySelector("h2");
    if (setupTitle) setupTitle.textContent = "Stem engine";
    const setupDetailsButton = node("button", "text-button stem-setup-details", "Details");
    setupDetailsButton.type = "button";
    setupDetailsButton.setAttribute("aria-expanded", "false");
    setupHeading?.appendChild(setupDetailsButton);
    const setupList = setup.querySelector(".stem-setup-list");
    if (setupList) setupList.hidden = true;
    setupDetailsButton.addEventListener("click", () => {
      if (!setupList) return;
      const opening = setupList.hidden;
      setupList.hidden = !opening;
      setupDetailsButton.textContent = opening ? "Hide" : "Details";
      setupDetailsButton.setAttribute("aria-expanded", String(opening));
    });

    const stepBar = node("nav", "stem-focus-steps");
    stepBar.setAttribute("aria-label", "Stem separation progress");
    const stepLabels = ["Upload", "Target", "Separate", "Download"];
    const stepButtons = stepLabels.map((label, index) => {
      const button = node("button", "stem-focus-step-button", `${index + 1} ${label}`);
      button.type = "button";
      button.dataset.step = String(index + 1);
      stepBar.appendChild(button);
      return button;
    });
    setup.insertAdjacentElement("afterend", stepBar);

    upload.dataset.stemStep = "1";
    target.dataset.stemStep = "2";
    settings.dataset.stemStep = "3";
    progress.dataset.stemStep = "4";
    results.dataset.stemStep = "4";
    [upload, target, settings, progress, results].forEach((card) => card.classList.add("stem-focus-step-panel"));

    const primaryTargets = 6;
    const targetButtons = [...target.querySelectorAll(".stem-target")];
    targetButtons.forEach((button, index) => {
      if (index >= primaryTargets) button.classList.add("stem-extra-target");
    });
    if (targetButtons.length > primaryTargets) {
      const reveal = node("button", "text-button stem-more-targets", "More instruments");
      reveal.type = "button";
      reveal.setAttribute("aria-expanded", "false");
      target.querySelector(".stem-target-grid")?.insertAdjacentElement("afterend", reveal);
      reveal.addEventListener("click", () => {
        const showing = target.classList.toggle("show-all-targets");
        reveal.textContent = showing ? "Fewer instruments" : "More instruments";
        reveal.setAttribute("aria-expanded", String(showing));
      });
    }

    const controlGrid = settings.querySelector(".stem-control-grid");
    if (controlGrid) {
      const children = [...controlGrid.children];
      const accessRow = children.find((item) => item.classList.contains("stem-access-row"));
      const advancedItems = children.filter((item) => item !== accessRow);
      if (advancedItems.length) {
        const advanced = node("details", "stem-advanced-settings");
        const summary = node("summary", "", "Advanced quality settings");
        const body = node("div", "stem-advanced-settings-body");
        advancedItems.forEach((item) => body.appendChild(item));
        advanced.append(summary, body);
        controlGrid.prepend(advanced);
      }
      if (accessRow) {
        const saved = Boolean(localStorage.getItem(ACCESS_KEY));
        accessRow.classList.toggle("access-saved", saved);
        const accessInput = accessRow.querySelector("input");
        const saveButton = accessRow.querySelector("button");
        saveButton?.addEventListener("click", () => {
          window.setTimeout(() => accessRow.classList.toggle("access-saved", Boolean(localStorage.getItem(ACCESS_KEY))), 0);
        });
        accessInput?.addEventListener("input", () => accessRow.classList.remove("access-saved"));
      }
    }

    const historyDetails = node("details", "stem-history-disclosure");
    const historySummary = node("summary", "", "Recent stem jobs");
    history.replaceWith(historyDetails);
    historyDetails.append(historySummary, history);

    let currentStep = 1;
    function showStep(step, { scroll = false } = {}) {
      currentStep = Math.max(1, Math.min(4, Number(step) || 1));
      [upload, target, settings].forEach((panel) => {
        panel.hidden = Number(panel.dataset.stemStep) !== currentStep;
      });
      const finalActive = currentStep === 4;
      progress.hidden = !finalActive || isHidden(progress);
      results.hidden = !finalActive || isHidden(results);
      stepButtons.forEach((button, index) => {
        const number = index + 1;
        button.classList.toggle("active", number === currentStep);
        button.classList.toggle("complete", number < currentStep);
        button.setAttribute("aria-current", number === currentStep ? "step" : "false");
      });
      if (scroll) stepBar.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    stepButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const requested = Number(button.dataset.step);
        if (requested === 2 && !workspace.querySelector(".stem-file-meta:not(.workspace-hidden)")) return;
        if (requested === 4 && isHidden(progress) && isHidden(results)) return;
        showStep(requested, { scroll: true });
      });
    });

    const fileInput = upload.querySelector('input[type="file"]');
    fileInput?.addEventListener("change", () => {
      if (fileInput.files?.length) window.setTimeout(() => showStep(2, { scroll: true }), 120);
    });

    targetButtons.forEach((button) => {
      button.addEventListener("click", () => window.setTimeout(() => showStep(3, { scroll: true }), 80));
    });

    const customTarget = target.querySelector('input[type="text"]');
    customTarget?.addEventListener("change", () => {
      if (customTarget.value.trim()) showStep(3, { scroll: true });
    });

    const runButton = settings.querySelector(".stem-run-button");
    runButton?.addEventListener("click", () => {
      if (!runButton.disabled) window.setTimeout(() => showStep(4, { scroll: true }), 100);
    });

    const newJob = results.querySelector("button");
    newJob?.addEventListener("click", () => window.setTimeout(() => showStep(1, { scroll: true }), 50));

    const stateObserver = new MutationObserver(() => {
      if (!isHidden(results)) showStep(4);
      else if (!isHidden(progress)) showStep(4);
      progress.hidden = currentStep !== 4 || isHidden(progress);
      results.hidden = currentStep !== 4 || isHidden(results);

      const ready = setup.classList.contains("ready");
      setup.classList.toggle("engine-ready", ready);
      const message = setup.querySelector(".helper-text");
      if (message && !ready) message.textContent = "Stem processing is offline until its three private server settings are connected.";
      if (message && ready) message.textContent = "Stem processing is ready.";
    });
    stateObserver.observe(workspace, { subtree: true, attributes: true, attributeFilter: ["class"] });

    const initialStep = !isHidden(results) || !isHidden(progress)
      ? 4
      : (workspace.querySelector(".stem-file-meta:not(.workspace-hidden)") ? 2 : 1);
    showStep(initialStep);
    stateObserver.takeRecords();
    setup.classList.toggle("engine-ready", setup.classList.contains("ready"));
    return true;
  }

  function reduceGeneratorClutter() {
    const panels = [...document.querySelectorAll('[data-v5-panel]')];
    panels.forEach((panel) => panel.classList.add("v6-focused-panel"));

    const aiShell = document.getElementById("forgeAiDraftAction");
    if (aiShell) {
      aiShell.querySelector("p")?.classList.add("v6-ai-summary");
    }
  }

  function install() {
    installQueued = false;
    installStemFocus();
    reduceGeneratorClutter();
    document.documentElement.dataset.forgeFocus = READY;
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
