"use strict";

(() => {
  const STORAGE_KEY = "forgeGeneratorTabV42";
  const TAB_NAMES = ["build", "write", "export", "saved"];
  const tabButtons = new Map();
  const panels = new Map();

  function el(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function directCard(selector) {
    return document.querySelector(selector)?.closest("section.card") || null;
  }

  function switchTab(name, scroll = true) {
    const next = TAB_NAMES.includes(name) ? name : "build";
    tabButtons.forEach((button, key) => {
      const active = key === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel, key) => {
      panel.classList.toggle("generator-panel-hidden", key !== next);
    });
    localStorage.setItem(STORAGE_KEY, next);
    if (scroll) {
      const generator = document.getElementById("generatorWorkspace");
      const top = generator ? generator.getBoundingClientRect().top + window.scrollY - 124 : 0;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }

  function makePanel(name) {
    const panel = el("section", "generator-panel");
    panel.dataset.generatorPanel = name;
    panels.set(name, panel);
    return panel;
  }

  function makeAccordion(card, label, open = false) {
    if (!card || card.dataset.compactAccordion === "ready") return;
    const heading = [...card.children].find((child) => child.classList?.contains("section-heading") || child.classList?.contains("intelligence-heading"));
    if (!heading) return;

    card.dataset.compactAccordion = "ready";
    card.classList.add("compact-accordion-card");

    const body = el("div", "compact-accordion-body");
    [...card.children].forEach((child) => {
      if (child !== heading) body.appendChild(child);
    });
    card.appendChild(body);

    const toggle = el("button", "compact-accordion-toggle", open ? "Hide" : "Open");
    toggle.type = "button";
    toggle.setAttribute("aria-label", `${open ? "Collapse" : "Open"} ${label}`);
    toggle.setAttribute("aria-expanded", String(open));
    body.hidden = !open;
    card.classList.toggle("compact-collapsed", !open);

    toggle.addEventListener("click", () => {
      const nextOpen = body.hidden;
      body.hidden = !nextOpen;
      card.classList.toggle("compact-collapsed", !nextOpen);
      toggle.textContent = nextOpen ? "Hide" : "Open";
      toggle.setAttribute("aria-expanded", String(nextOpen));
      toggle.setAttribute("aria-label", `${nextOpen ? "Collapse" : "Open"} ${label}`);
    });
    heading.appendChild(toggle);
  }

  function installOneOpenCategoryRule(generator) {
    generator.addEventListener("click", (event) => {
      const header = event.target.closest(".category-header");
      if (!header || !generator.contains(header)) return;
      if (typeof collapsedCategories === "undefined" || typeof DATA === "undefined") return;
      if (document.getElementById("tagSearch")?.value.trim()) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      const name = header.querySelector("strong")?.textContent;
      if (!name) return;
      const wasOpen = header.getAttribute("aria-expanded") === "true";
      Object.keys(DATA.categories).forEach((category) => collapsedCategories.add(category));
      if (!wasOpen) collapsedCategories.delete(name);
      renderCategories("");
    }, true);

    generator.addEventListener("click", (event) => {
      const shortcut = event.target.closest(".category-shortcut");
      if (!shortcut || typeof collapsedCategories === "undefined" || typeof DATA === "undefined") return;
      const name = shortcut.querySelector("strong")?.textContent;
      if (!name) return;
      Object.keys(DATA.categories).forEach((category) => collapsedCategories.add(category));
      collapsedCategories.delete(name);
    }, true);
  }

  function installSearchBehavior() {
    const search = document.getElementById("tagSearch");
    const results = document.getElementById("directTagResults");
    if (!search || !results) return;
    const sync = () => {
      results.hidden = !search.value.trim();
    };
    search.addEventListener("input", sync);
    search.addEventListener("focus", sync);
    search.addEventListener("search", sync);
    sync();
  }

  function installWritingMenu() {
    const grid = document.querySelector(".ai-action-grid");
    const generate = document.getElementById("generateLyricsBtn");
    if (!grid || !generate || document.getElementById("compactWritingActions")) return;

    const shell = el("div", "compact-writing-actions");
    shell.id = "compactWritingActions";
    const primary = el("div", "compact-writing-primary");
    primary.appendChild(generate);

    const details = document.createElement("details");
    details.className = "compact-writing-more";
    const summary = document.createElement("summary");
    summary.textContent = "More writing tools";
    const tools = el("div", "compact-writing-tool-grid");
    [...grid.querySelectorAll("button")].forEach((button) => tools.appendChild(button));
    details.append(summary, tools);
    shell.append(primary, details);
    grid.replaceWith(shell);
  }

  function installFullscreenLyrics() {
    const textarea = document.getElementById("lyricsInput");
    const field = textarea?.closest("label.field");
    const title = field?.querySelector(":scope > span");
    if (!textarea || !field || !title || document.getElementById("lyricsFullscreenBtn")) return;

    const row = el("div", "lyrics-editor-heading");
    const button = el("button", "text-button", "Full screen");
    button.id = "lyricsFullscreenBtn";
    button.type = "button";
    title.replaceWith(row);
    row.append(title, button);

    const close = () => {
      field.classList.remove("lyrics-fullscreen");
      document.body.classList.remove("lyrics-fullscreen-open");
      button.textContent = "Full screen";
    };

    button.addEventListener("click", () => {
      const opening = !field.classList.contains("lyrics-fullscreen");
      if (!opening) {
        close();
        return;
      }
      field.classList.add("lyrics-fullscreen");
      document.body.classList.add("lyrics-fullscreen-open");
      button.textContent = "Done";
      textarea.focus();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && field.classList.contains("lyrics-fullscreen")) close();
    });
  }

  function installGeneratorTabs() {
    const generator = document.getElementById("generatorWorkspace");
    if (!generator || document.getElementById("generatorModeTabs")) return false;

    const originalCards = [...generator.children].filter((node) => node.matches?.("section.card"));
    const tabs = el("nav", "generator-mode-tabs");
    tabs.id = "generatorModeTabs";
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Prompt generator sections");

    const labels = {
      build: "Build",
      write: "Write",
      export: "Export",
      saved: "Saved"
    };

    TAB_NAMES.forEach((name) => {
      const button = el("button", "generator-mode-tab", labels[name]);
      button.type = "button";
      button.dataset.generatorTab = name;
      button.setAttribute("role", "tab");
      button.addEventListener("click", () => switchTab(name));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const index = TAB_NAMES.indexOf(name);
        const next = TAB_NAMES[(index + direction + TAB_NAMES.length) % TAB_NAMES.length];
        switchTab(next, false);
        tabButtons.get(next)?.focus();
      });
      tabButtons.set(name, button);
      tabs.appendChild(button);
    });

    const build = makePanel("build");
    const write = makePanel("write");
    const output = makePanel("export");
    const saved = makePanel("saved");

    const hero = generator.querySelector(":scope > section.hero");
    const recipeCard = directCard("#recipeGrid");
    const paletteCard = directCard("#tagSearch");
    const trackCard = directCard("#bpmRange");
    const structureCard = directCard("#structureList");
    const writingCard = directCard("#lyricsInput");
    const outputCard = directCard("#promptOutput");
    const savedCard = directCard("#presetList");
    const styleCard = document.getElementById("styleDirectionCard");
    const hybridCard = document.getElementById("hybridLab");
    const intelligenceCard = document.getElementById("musicIntelligenceCard");

    paletteCard?.classList.add("sound-palette-card");
    recipeCard?.classList.add("compact-recipes-card");
    outputCard?.classList.add("compact-export-card");

    [hero, recipeCard, paletteCard, hybridCard, intelligenceCard, trackCard, styleCard].filter(Boolean).forEach((card) => build.appendChild(card));
    [writingCard, structureCard].filter(Boolean).forEach((card) => write.appendChild(card));
    if (outputCard) output.appendChild(outputCard);
    if (savedCard) saved.appendChild(savedCard);

    const assigned = new Set([hero, recipeCard, paletteCard, hybridCard, intelligenceCard, trackCard, styleCard, writingCard, structureCard, outputCard, savedCard].filter(Boolean));
    originalCards.filter((card) => !assigned.has(card)).forEach((card) => build.appendChild(card));

    generator.prepend(tabs);
    generator.append(build, write, output, saved);

    makeAccordion(hybridCard, "Hybrid Lab", false);
    makeAccordion(intelligenceCard, "Music Intelligence", false);
    makeAccordion(trackCard, "Advanced Track Controls", false);
    makeAccordion(styleCard, "AI Style Direction", false);
    makeAccordion(structureCard, "Song Structure", false);

    installOneOpenCategoryRule(generator);
    installSearchBehavior();
    installWritingMenu();
    installFullscreenLyrics();

    document.getElementById("forgePromptBtn")?.addEventListener("click", () => {
      window.setTimeout(() => switchTab("export"), 80);
    });

    switchTab(localStorage.getItem(STORAGE_KEY) || "build", false);
    document.documentElement.dataset.forgeV42 = "ready";
    return true;
  }

  function init() {
    if (document.documentElement.dataset.forgeV42 === "ready") return;
    if (!installGeneratorTabs()) window.setTimeout(init, 80);
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once: true });
})();
