"use strict";

(() => {
  const READY = "ready";
  const ACCESS_KEY = "forgeStemAccessCodeV4";
  const STEP_COPY = [
    { title: "Choose a song", copy: "Select one audio file from your phone." },
    { title: "Choose what to separate", copy: "Pick the vocal or instrument you want as a clean stem." },
    { title: "Review and separate", copy: "Save the private access code once, then start the separation." },
    { title: "Processing and download", copy: "Keep this page open until both files are ready." }
  ];

  let installQueued = false;

  function node(tag, className = "", text = "") {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text) item.textContent = text;
    return item;
  }

  function coreVisible(item) {
    return Boolean(item) && !item.classList.contains("workspace-hidden");
  }

  function storedAccessCode() {
    try {
      return String(localStorage.getItem(ACCESS_KEY) || "").trim();
    } catch {
      return "";
    }
  }

  function setText(item, value) {
    if (item && item.textContent !== value) item.textContent = value;
  }

  function cleanGlobalChrome() {
    document.body.classList.add("forge-final");
    document.documentElement.dataset.forgeFinal = READY;
    document.title = "Forge Studio";

    const brand = document.querySelector(".topbar .brand-block");
    if (brand && brand.dataset.finalBrand !== READY) {
      brand.dataset.finalBrand = READY;
      brand.replaceChildren(node("strong", "forge-final-brand", "FORGE STUDIO"));
    }

    const tools = document.querySelector(".v5-tools-button");
    if (tools) {
      setText(tools, "Tools");
      tools.setAttribute("aria-label", "Open tools");
    }

    const ai = document.getElementById("forgeAiSettingsBtn");
    if (ai) {
      ai.dataset.fullStatus = ai.textContent.trim();
      setText(ai, "AI");
      ai.setAttribute("aria-label", "Open AI connection settings");
    }

    const clear = document.getElementById("forgeClearBtn");
    if (clear) clear.setAttribute("aria-label", "Clear or reset part of the project");

    const returnButton = document.querySelector(".v5-return-studio");
    if (returnButton) {
      setText(returnButton, "Studio");
      returnButton.setAttribute("aria-label", "Return to Studio");
    }

    document.querySelectorAll("section.card").forEach((card) => {
      const useful = card.querySelector("button,input,select,textarea,a,[role='status'],h1,h2,h3,p,summary");
      card.classList.toggle("forge-empty-card", !useful);
    });
  }

  function cleanPromptStudio() {
    const panels = [...document.querySelectorAll(".v5-panel[data-v5-panel]")];
    panels.forEach((panel) => panel.classList.add("v6-focused-panel"));

    const tabs = document.querySelector(".v5-mode-tabs");
    if (tabs) tabs.setAttribute("aria-label", "Forge workflow");

    document.querySelectorAll(".v5-clean-disclosure > summary").forEach((summary) => {
      summary.setAttribute("aria-expanded", String(summary.parentElement?.open));
    });

    const aiShell = document.getElementById("forgeAiDraftAction");
    if (aiShell) {
      aiShell.querySelector("p")?.classList.add("v6-ai-summary");
      const action = aiShell.querySelector("[data-ai-draft-action]");
      if (action && /generate full draft/i.test(action.textContent)) setText(action, "Generate Draft");
    }

    const buildDock = document.querySelector(".v5-build-dock");
    if (buildDock) {
      const primary = buildDock.querySelector(".primary-button");
      if (primary && /build|export/i.test(primary.textContent)) setText(primary, "Build Export");
    }

    document.querySelectorAll(".v5-panel > section.card").forEach((card) => {
      if (card.classList.contains("v5-quick-path")) return;
      card.classList.add("v6-studio-card");
    });
  }

  function installStemFocus() {
    const workspace = document.getElementById("stemWorkspace");
    if (!workspace) return false;
    if (workspace.dataset.finalStem === READY) {
      workspace._forgeSync?.();
      return true;
    }

    const cards = [...workspace.children].filter((item) => item.matches("section.card"));
    if (cards.length < 8) return false;

    const [hero, setup, upload, target, settings, progress, results, history] = cards;
    workspace.dataset.finalStem = READY;
    workspace.classList.add("stem-focus-workspace", "stem-final-workspace");

    hero.classList.add("stem-focus-hero");
    setText(hero.querySelector("h2"), "Stem Separator");
    setText(hero.querySelector(".muted"), "Upload a song, choose one sound, and download the clean stem plus the remainder.");
    hero.querySelector(".stem-flow")?.remove();

    setup.classList.add("stem-setup-compact");
    setText(setup.querySelector("h2"), "System status");
    const setupList = setup.querySelector(".stem-setup-list");
    if (setupList) setupList.hidden = true;

    let setupDetails = setup.querySelector(".stem-setup-details");
    if (!setupDetails) {
      setupDetails = node("button", "text-button stem-setup-details", "Details");
      setupDetails.type = "button";
      setupDetails.setAttribute("aria-expanded", "false");
      setup.querySelector(".section-heading")?.appendChild(setupDetails);
      setupDetails.addEventListener("click", () => {
        if (!setupList) return;
        const opening = setupList.hidden;
        setupList.hidden = !opening;
        setText(setupDetails, opening ? "Hide" : "Details");
        setupDetails.setAttribute("aria-expanded", String(opening));
      });
    }

    const flowHeader = node("section", "stem-flow-header");
    flowHeader.setAttribute("aria-live", "polite");
    flowHeader.innerHTML = `
      <button type="button" class="stem-flow-back">Back</button>
      <div class="stem-flow-copy">
        <span class="stem-flow-kicker"></span>
        <strong class="stem-flow-title"></strong>
        <p class="stem-flow-description"></p>
      </div>
      <span class="stem-system-state">Ready</span>
      <div class="stem-flow-meter" aria-hidden="true"><span></span></div>`;
    setup.insertAdjacentElement("afterend", flowHeader);

    const backButton = flowHeader.querySelector(".stem-flow-back");
    const kicker = flowHeader.querySelector(".stem-flow-kicker");
    const flowTitle = flowHeader.querySelector(".stem-flow-title");
    const flowDescription = flowHeader.querySelector(".stem-flow-description");
    const systemState = flowHeader.querySelector(".stem-system-state");
    const meter = flowHeader.querySelector(".stem-flow-meter span");

    upload.dataset.stemStep = "1";
    target.dataset.stemStep = "2";
    settings.dataset.stemStep = "3";
    progress.dataset.stemStep = "4";
    results.dataset.stemStep = "4";
    [upload, target, settings, progress, results].forEach((card) => card.classList.add("stem-focus-step-panel"));

    setText(upload.querySelector("h2"), "Choose a Song");
    setText(target.querySelector("h2"), "Choose a Sound");
    setText(settings.querySelector("h2"), "Separate the Stem");

    const targetButtons = [...target.querySelectorAll(".stem-target")];
    targetButtons.forEach((button, index) => {
      if (index >= 6) button.classList.add("stem-extra-target");
    });
    if (targetButtons.length > 6 && !target.querySelector(".stem-more-targets")) {
      const reveal = node("button", "text-button stem-more-targets", "More choices");
      reveal.type = "button";
      reveal.setAttribute("aria-expanded", "false");
      target.querySelector(".stem-target-grid")?.insertAdjacentElement("afterend", reveal);
      reveal.addEventListener("click", () => {
        const showing = target.classList.toggle("show-all-targets");
        setText(reveal, showing ? "Fewer choices" : "More choices");
        reveal.setAttribute("aria-expanded", String(showing));
      });
    }

    const controlGrid = settings.querySelector(".stem-control-grid");
    const accessRow = controlGrid?.querySelector(".stem-access-row") || null;
    let accessError = settings.querySelector(".stem-inline-error");
    if (!accessError) {
      accessError = node("p", "stem-inline-error");
      accessError.hidden = true;
      settings.querySelector(".stem-run-button")?.insertAdjacentElement("beforebegin", accessError);
    }

    if (controlGrid && !controlGrid.querySelector(".stem-advanced-settings")) {
      const children = [...controlGrid.children];
      const advancedItems = children.filter((item) => item !== accessRow);
      if (advancedItems.length) {
        const advanced = node("details", "stem-advanced-settings");
        const summary = node("summary", "", "Advanced quality settings");
        const body = node("div", "stem-advanced-settings-body");
        advancedItems.forEach((item) => body.appendChild(item));
        advanced.append(summary, body);
        controlGrid.appendChild(advanced);
      }
      if (accessRow) controlGrid.prepend(accessRow);
    }

    const accessInput = accessRow?.querySelector("input") || null;
    const saveAccessButton = accessRow?.querySelector("button") || null;
    if (accessRow && !accessRow.querySelector(".stem-access-status")) {
      const statusRow = node("div", "stem-access-status");
      const statusCopy = node("span", "", "Access code saved on this device.");
      const change = node("button", "text-button stem-access-change", "Change");
      change.type = "button";
      change.addEventListener("click", () => {
        accessRow.classList.remove("access-saved");
        window.setTimeout(() => accessInput?.focus(), 30);
      });
      statusRow.append(statusCopy, change);
      accessRow.appendChild(statusRow);
    }

    if (accessInput) {
      accessInput.setAttribute("autocomplete", "off");
      accessInput.setAttribute("spellcheck", "false");
      accessInput.setAttribute("placeholder", "Private stem access code");
      accessInput.addEventListener("input", () => {
        accessRow?.classList.remove("access-saved");
        accessError.hidden = true;
      });
    }
    if (saveAccessButton) setText(saveAccessButton, "Save Code");

    const spanPrompting = settings.querySelector('input[type="checkbox"]');
    if (spanPrompting) spanPrompting.checked = true;

    const runButton = settings.querySelector(".stem-run-button");
    if (runButton) setText(runButton, "Separate Stem");

    let historyDetails = workspace.querySelector(".stem-history-disclosure");
    if (!historyDetails) {
      historyDetails = node("details", "stem-history-disclosure");
      const historySummary = node("summary", "", "Recent Jobs");
      history.replaceWith(historyDetails);
      historyDetails.append(historySummary, history);
    }

    let currentStep = 1;
    let syncing = false;
    let ignoreStaleAccessFailure = false;

    function engineReady() {
      return setup.classList.contains("ready") || setup.classList.contains("engine-ready");
    }

    function fileChosen() {
      const input = upload.querySelector('input[type="file"]');
      return Boolean(input?.files?.length || workspace.querySelector(".stem-file-meta:not(.workspace-hidden)"));
    }

    function clearInlineError() {
      accessError.hidden = true;
      accessError.textContent = "";
    }

    function showAccessError(message) {
      accessError.textContent = message || "Enter the private access code, tap Save Code, then try again.";
      accessError.hidden = false;
      accessRow?.classList.remove("access-saved");
      window.setTimeout(() => accessInput?.focus(), 50);
    }

    function failedForAccess() {
      if (ignoreStaleAccessFailure) return false;
      const text = `${progress.textContent} ${results.textContent}`.toLowerCase();
      return text.includes("enter and save the private stem access code") || text.includes("incorrect forge stem access code");
    }

    function showStep(step, { scroll = false } = {}) {
      currentStep = Math.max(1, Math.min(4, Number(step) || 1));
      const info = STEP_COPY[currentStep - 1];
      setText(kicker, `Step ${currentStep} of 4`);
      setText(flowTitle, info.title);
      setText(flowDescription, info.copy);
      backButton.hidden = currentStep === 1;
      meter.style.width = `${currentStep * 25}%`;

      upload.hidden = currentStep !== 1;
      target.hidden = currentStep !== 2;
      settings.hidden = currentStep !== 3;

      const finalActive = currentStep === 4;
      const progressVisible = coreVisible(progress) && !failedForAccess();
      const resultsVisible = coreVisible(results);
      progress.hidden = !finalActive || !progressVisible;
      results.hidden = !finalActive || !resultsVisible;

      setup.hidden = engineReady();
      setText(systemState, engineReady() ? "Ready" : "Setup needed");
      systemState.dataset.state = engineReady() ? "ready" : "warning";
      flowHeader.classList.toggle("system-blocked", !engineReady());

      if (accessRow) accessRow.classList.toggle("access-saved", Boolean(storedAccessCode()));
      if (scroll) flowHeader.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function syncState() {
      if (syncing) return;
      syncing = true;
      try {
        const ready = engineReady();
        setup.classList.toggle("engine-ready", ready);
        setup.hidden = ready;

        if (failedForAccess()) {
          showAccessError("Save the private access code before starting the separation.");
          showStep(3);
        } else if (coreVisible(results) || coreVisible(progress)) {
          showStep(4);
        } else if (!fileChosen()) {
          showStep(1);
        } else if (currentStep === 1) {
          showStep(2);
        } else {
          showStep(currentStep);
        }
      } finally {
        syncing = false;
      }
    }

    backButton.addEventListener("click", () => {
      clearInlineError();
      showStep(Math.max(1, currentStep - 1), { scroll: true });
    });

    const fileInput = upload.querySelector('input[type="file"]');
    fileInput?.addEventListener("change", () => {
      clearInlineError();
      ignoreStaleAccessFailure = true;
      if (fileInput.files?.length) window.setTimeout(() => showStep(2, { scroll: true }), 120);
    });

    targetButtons.forEach((button) => {
      button.addEventListener("click", () => {
        clearInlineError();
        ignoreStaleAccessFailure = true;
        window.setTimeout(() => showStep(3, { scroll: true }), 80);
      });
    });

    const customTarget = target.querySelector('input[type="text"]');
    customTarget?.addEventListener("change", () => {
      if (customTarget.value.trim()) {
        ignoreStaleAccessFailure = true;
        showStep(3, { scroll: true });
      }
    });

    saveAccessButton?.addEventListener("click", () => {
      window.setTimeout(() => {
        const saved = Boolean(storedAccessCode());
        accessRow?.classList.toggle("access-saved", saved);
        if (saved) {
          ignoreStaleAccessFailure = true;
          clearInlineError();
        }
      }, 80);
    });

    runButton?.addEventListener("click", (event) => {
      if (!storedAccessCode()) {
        event.preventDefault();
        event.stopImmediatePropagation();
        showAccessError("Enter the private access code and tap Save Code first.");
        showStep(3, { scroll: true });
        return;
      }
      clearInlineError();
      ignoreStaleAccessFailure = true;
      if (!runButton.disabled) window.setTimeout(() => showStep(4, { scroll: true }), 100);
      window.setTimeout(() => {
        ignoreStaleAccessFailure = false;
        syncState();
      }, 1800);
    }, true);

    results.querySelector("button")?.addEventListener("click", () => {
      clearInlineError();
      window.setTimeout(() => showStep(1, { scroll: true }), 50);
    });

    const observer = new MutationObserver(() => window.requestAnimationFrame(syncState));
    observer.observe(workspace, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "hidden"]
    });

    workspace._forgeSync = syncState;
    const initialStep = coreVisible(results) || coreVisible(progress) ? 4 : (fileChosen() ? 2 : 1);
    showStep(initialStep);
    syncState();
    return true;
  }

  function install() {
    installQueued = false;
    cleanGlobalChrome();
    cleanPromptStudio();
    installStemFocus();
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
