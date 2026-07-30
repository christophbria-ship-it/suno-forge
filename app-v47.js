"use strict";

(() => {
  const READY = "ready";
  let refinementQueued = false;

  function text(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function installBrandLockup() {
    const block = document.querySelector(".topbar .brand-block");
    if (!block || block.dataset.forgeV47 === READY) return;

    const mark = document.createElement("span");
    mark.className = "forge-brand-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "F";

    const copy = document.createElement("span");
    copy.className = "forge-brand-copy";

    const product = document.createElement("span");
    product.className = "forge-brand-name";
    product.textContent = "Forge";

    const descriptor = document.createElement("span");
    descriptor.className = "forge-brand-descriptor";
    descriptor.textContent = "Creative audio workstation";

    copy.append(product, descriptor);
    block.replaceChildren(mark, copy);
    block.dataset.forgeV47 = READY;
  }

  function refineWorkspaceTabs() {
    document.querySelectorAll(".workspace-tab").forEach((button) => {
      const label = button.textContent.trim();
      if (/remove instrument|stem remover/i.test(label)) text(button, "Stem Remover");
      else if (/^generator$/i.test(label)) text(button, "Prompt Studio");
      else if (/remote/i.test(label)) text(button, "Remote GPU");
      button.title = button.textContent.trim();
    });
  }

  function refineHeaderControls() {
    const shuffle = document.getElementById("randomizeBtn");
    if (shuffle) {
      text(shuffle, "↻");
      shuffle.title = "Shuffle track settings";
      shuffle.setAttribute("aria-label", "Shuffle track settings");
    }

    const install = document.getElementById("installBtn");
    if (install) {
      text(install, "+");
      install.title = "Install Forge on this device";
      install.setAttribute("aria-label", "Install Forge on this device");
    }

    const save = document.getElementById("saveBadge");
    if (save) save.title = "Workspace changes save automatically on this device";

    const status = document.getElementById("statusBadge");
    if (status) status.title = "Forge system status";
  }

  function refineHero() {
    const hero = document.querySelector("#generatorWorkspace .hero") || document.querySelector(".hero");
    if (!hero) return;

    text(hero.querySelector(".eyebrow"), "FORGE STUDIO · V4.7");
    text(hero.querySelector("h2"), "Shape the sound. Write the song. Export cleanly.");
    text(
      hero.querySelector(".muted"),
      "A focused workspace for sound design, AI-assisted writing, Suno-ready exports, stem tools, and repeatable creative workflows."
    );

    const forgeButton = document.getElementById("forgePromptBtn");
    if (forgeButton) {
      text(forgeButton, "Build Prompt");
      forgeButton.title = "Build the final prompt from the current workspace";
    }
  }

  function categoryData(name) {
    const tags = typeof DATA !== "undefined" ? DATA.categories?.[name] : undefined;
    const selected = typeof state !== "undefined" && Array.isArray(state.selectedTags) ? state.selectedTags : [];
    return {
      total: Array.isArray(tags) ? tags.length : 0,
      selected: Array.isArray(tags) ? tags.filter((tag) => selected.includes(tag)).length : 0
    };
  }

  function refineCategories() {
    document.querySelectorAll(".category").forEach((section) => {
      const header = section.querySelector(":scope > .category-header");
      const nameNode = header?.querySelector("strong");
      const meta = header?.querySelector("span");
      const name = nameNode?.textContent?.trim();
      if (!header || !name || !meta) return;

      const info = categoryData(name);
      const label = info.selected
        ? `${info.selected} selected · ${info.total} options`
        : `${info.total} options`;

      text(meta, label);
      section.classList.toggle("has-selection", info.selected > 0);
      header.classList.toggle("has-selection", info.selected > 0);
      header.setAttribute("aria-label", `${name}. ${label}. ${header.getAttribute("aria-expanded") === "true" ? "Open" : "Closed"}.`);
      header.title = info.selected ? `${info.selected} selected in ${name}` : `Open ${name}`;
    });
  }

  function refineTagButtons() {
    document.querySelectorAll(".tag-button, .direct-tag-result").forEach((button) => {
      const selected = button.classList.contains("selected");
      button.setAttribute("aria-pressed", String(selected));
      button.dataset.selectionState = selected ? "selected" : "available";
    });

    document.querySelectorAll(".selected-chip").forEach((button) => {
      const tag = button.textContent.replace(/\s*[×x]\s*$/, "").trim();
      if (tag) {
        button.setAttribute("aria-label", `Remove ${tag}`);
        button.title = `Remove ${tag}`;
      }
    });
  }

  function refineAccordions() {
    document.querySelectorAll(".compact-accordion-toggle").forEach((button) => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      text(button, expanded ? "Close" : "Open");
    });

    document.querySelectorAll("section.card").forEach((card) => {
      card.dataset.forgeSurface = READY;
    });
  }

  function refineOutputActions() {
    const copyPrompt = document.getElementById("copyPromptBtn");
    if (copyPrompt) copyPrompt.title = "Copy the current prompt";

    const clearStyle = document.getElementById("clearStyleBtn");
    if (clearStyle) clearStyle.title = "Clear only the generated style prompt";

    const reset = document.getElementById("resetBtn");
    if (reset) text(reset, "New Workspace");
  }

  function runRefinement() {
    refinementQueued = false;
    installBrandLockup();
    refineWorkspaceTabs();
    refineHeaderControls();
    refineHero();
    refineCategories();
    refineTagButtons();
    refineAccordions();
    refineOutputActions();
  }

  function scheduleRefinement() {
    if (refinementQueued) return;
    refinementQueued = true;
    requestAnimationFrame(runRefinement);
  }

  function loadV5Assets() {
    if (!document.querySelector('link[data-forge-v5="style"]')) {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = "style-v5.css?v=5.0.0";
      style.dataset.forgeV5 = "style";
      document.head.appendChild(style);
    }
    if (!document.querySelector('script[data-forge-v5="app"]')) {
      const script = document.createElement("script");
      script.src = "app-v5.js?v=5.0.0";
      script.async = false;
      script.dataset.forgeV5 = "app";
      document.body.appendChild(script);
    }
  }

  function updateVersion() {
    document.title = "Forge Studio";
    document.documentElement.dataset.forgeV47 = READY;
    document.body.classList.add("forge-polished");
  }

  function init() {
    if (document.documentElement.dataset.forgeV47 === READY) return;
    if (document.documentElement.dataset.forgeV46 !== READY) {
      window.setTimeout(init, 80);
      return;
    }

    runRefinement();

    const observer = new MutationObserver(scheduleRefinement);
    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener("click", (event) => {
      if (event.target.closest(".category-header, .tag-button, .direct-tag-result, .compact-accordion-toggle")) {
        window.setTimeout(scheduleRefinement, 0);
      }
    }, true);

    updateVersion();
    loadV5Assets();
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once: true });
})();
