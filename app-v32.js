"use strict";

(() => {
  const V32 = window.FORGE_V32 || { version: "3.2.0", featuredCategories: [], baroqueRecipes: [] };

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[+&/_,.-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function buildTagIndex() {
    const byTag = new Map();
    Object.entries(DATA.categories).forEach(([category, tags]) => {
      tags.forEach((tag) => {
        if (!byTag.has(tag)) byTag.set(tag, new Set());
        byTag.get(tag).add(category);
      });
    });

    return [...byTag.entries()].map(([tag, categories]) => ({
      tag,
      categories: [...categories],
      search: normalize(`${tag} ${[...categories].join(" ")}`)
    }));
  }

  function scoreMatch(item, query, tokens) {
    const tag = normalize(item.tag);
    let score = 0;
    if (tag === query) score += 100;
    if (tag.startsWith(query)) score += 50;
    if (tag.includes(query)) score += 30;
    tokens.forEach((token) => {
      if (tag.startsWith(token)) score += 12;
      else if (tag.includes(token)) score += 7;
      else if (item.search.includes(token)) score += 3;
    });
    if (state.selectedTags.includes(item.tag)) score += 2;
    return score;
  }

  function updateVersionLabels() {
    document.title = "Forge Studio v3.2";
    const hero = document.querySelector(".hero");
    if (hero) {
      const eyebrow = hero.querySelector(".eyebrow");
      const muted = hero.querySelector(".muted");
      if (eyebrow) eyebrow.textContent = "FORGE STUDIO V3.2";
      if (muted) {
        muted.textContent = "Fast tag search, visible music categories, any-genre hybrid building, advanced vocal arrangements, AI drafting, presets, and mobile-first editing.";
      }
    }
  }

  function installStyleDirectionCard() {
    const textarea = document.getElementById("customInstructions");
    const writingCard = textarea?.closest(".writing-card");
    const oldLabel = textarea?.closest("label");
    if (!textarea || !writingCard || !oldLabel || document.getElementById("styleDirectionCard")) return;

    const oldHeading = writingCard.querySelector("h2");
    if (oldHeading) oldHeading.textContent = "Lyrics & Story";
    const clearButton = document.getElementById("clearLyricsBtn");
    if (clearButton) clearButton.textContent = "Clear Writing";

    const card = createElement("section", "card style-direction-card");
    card.id = "styleDirectionCard";

    const heading = createElement("div", "section-heading");
    const headingText = createElement("div");
    headingText.append(
      createElement("p", "eyebrow", "STYLE DESIGN"),
      createElement("h2", "", "AI Style Direction")
    );
    heading.appendChild(headingText);

    const helper = createElement(
      "p",
      "helper-text no-min-height",
      "This is not a second lyrics box. Use it to direct the arrangement, vocal behavior, dynamics, and how selected tags should interact."
    );

    const labelTitle = oldLabel.querySelector("span");
    if (labelTitle) labelTitle.textContent = "Production and arrangement instructions";
    textarea.rows = 5;
    textarea.placeholder = "Examples: Baroque counterpoint drives the verses; darkwave pulse underneath; choir enters only in the final chorus; keep the lead intimate; no modern slang.";

    const presetTitle = createElement("p", "mini-label", "Quick directions");
    const presetRow = createElement("div", "style-preset-row");
    const presets = [
      "Build slowly, then make the final chorus enormous.",
      "Keep the verses intimate and the chorus wide.",
      "Use interlocking counterpoint without overcrowding the lead.",
      "Let the choir enter only near the end.",
      "Make every selected tag audible as a deliberate part of the arrangement.",
      "Keep the production raw, human, and dynamically varied."
    ];

    presets.forEach((text) => {
      const button = createElement("button", "style-preset-button", text);
      button.type = "button";
      button.addEventListener("click", () => {
        const current = textarea.value.trim();
        if (!normalize(current).includes(normalize(text))) {
          textarea.value = [current, text].filter(Boolean).join("\n");
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
        }
        textarea.focus();
      });
      presetRow.appendChild(button);
    });

    oldLabel.remove();
    card.append(heading, helper, oldLabel, presetTitle, presetRow);
    writingCard.parentNode.insertBefore(card, writingCard);
  }

  function installTagStudio() {
    const search = document.getElementById("tagSearch");
    const categoryList = document.getElementById("categoryList");
    const tagCard = search?.closest("section.card");
    if (!search || !categoryList || !tagCard || document.getElementById("directTagResults")) return;

    const heading = tagCard.querySelector("h2");
    if (heading) heading.textContent = "Choose Genres, Instruments & Vocals";

    search.placeholder = "Try: baroque+darkwave, violin, choir, glam rock...";
    search.setAttribute("aria-label", "Search all music tags");

    const helper = createElement(
      "p",
      "helper-text no-min-height tag-help",
      "Tap a category to browse it, or type above. Search results appear immediately below the box."
    );

    const shortcuts = createElement("div", "category-shortcuts");
    shortcuts.id = "categoryShortcuts";

    const directResults = createElement("div", "direct-tag-results");
    directResults.id = "directTagResults";
    directResults.setAttribute("aria-live", "polite");

    const index = buildTagIndex();

    function renderDirectResults() {
      const query = normalize(search.value);
      directResults.innerHTML = "";

      if (!query) {
        const empty = createElement(
          "div",
          "tag-search-hint",
          "Search all tags here, or open a category below. Selected tags appear above the category list."
        );
        directResults.appendChild(empty);
        return;
      }

      const tokens = query.split(" ").filter(Boolean);
      const matches = index
        .filter((item) => tokens.every((token) => item.search.includes(token)))
        .map((item) => ({ ...item, score: scoreMatch(item, query, tokens) }))
        .sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag))
        .slice(0, 80);

      const summary = createElement(
        "div",
        "tag-result-summary",
        matches.length
          ? `${matches.length}${matches.length === 80 ? "+" : ""} matching tags — tap any result to select it`
          : `No tags match “${search.value.trim()}”`
      );
      directResults.appendChild(summary);

      if (!matches.length) return;

      const grid = createElement("div", "direct-tag-grid");
      matches.forEach((item) => {
        const button = createElement("button", "direct-tag-result");
        button.type = "button";
        button.classList.toggle("selected", state.selectedTags.includes(item.tag));

        const name = createElement("strong", "", item.tag);
        const category = createElement("small", "", item.categories.join(" · "));
        button.append(name, category);

        button.addEventListener("click", () => {
          toggleTag(item.tag);
          renderDirectResults();
        });
        grid.appendChild(button);
      });

      directResults.appendChild(grid);
    }

    V32.featuredCategories.forEach((name) => {
      const tags = DATA.categories[name];
      if (!Array.isArray(tags)) return;
      const button = createElement("button", "category-shortcut");
      button.type = "button";
      button.innerHTML = `<strong>${escapeHtml(name)}</strong><span>${tags.length}</span>`;
      button.addEventListener("click", () => {
        search.value = "";
        collapsedCategories.delete(name);
        renderCategories("");
        renderDirectResults();

        requestAnimationFrame(() => {
          const headers = [...document.querySelectorAll(".category-header")];
          const target = headers.find((header) => header.querySelector("strong")?.textContent === name);
          target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
      shortcuts.appendChild(button);
    });

    const searchLabel = search.closest("label");
    tagCard.insertBefore(helper, searchLabel);
    tagCard.insertBefore(shortcuts, searchLabel);
    searchLabel.insertAdjacentElement("afterend", directResults);

    search.addEventListener("input", renderDirectResults);
    search.addEventListener("focus", renderDirectResults);

    const selectedTags = document.getElementById("selectedTags");
    if (selectedTags) {
      new MutationObserver(renderDirectResults).observe(selectedTags, { childList: true });
    }

    renderDirectResults();
  }

  function appendStyleDirection(text) {
    const textarea = document.getElementById("customInstructions");
    if (!textarea) return;
    const current = textarea.value.trim();
    if (!normalize(current).includes(normalize(text))) {
      textarea.value = [current, text].filter(Boolean).join("\n");
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function applyFullRecipe(recipe) {
    snapshot();
    state.selectedTags = unique(recipe.tags).slice(0, 100);
    state.bpm = recipe.bpm;
    state.energy = recipe.energy;
    state.perspective = recipe.perspective || state.perspective;
    state.rhymeMode = recipe.rhymeMode || state.rhymeMode;
    state.density = recipe.density || state.density;
    state.customInstructions = recipe.direction || state.customInstructions;
    if (Array.isArray(recipe.structure)) {
      const structure = recipe.structure.filter((part) => DATA.structureOptions.includes(part)).slice(0, 24);
      if (structure.length) state.structure = structure;
    }
    state.output = "";
    state.favorite = false;
    saveAll({ immediate: true });
    syncControls(false);
    showToast(`${recipe.name} loaded`);
  }

  function installHybridLab() {
    const search = document.getElementById("tagSearch");
    const tagCard = search?.closest("section.card");
    if (!tagCard || document.getElementById("hybridLab")) return;

    const card = createElement("section", "card hybrid-lab");
    card.id = "hybridLab";

    const heading = createElement("div", "section-heading");
    const headingText = createElement("div");
    headingText.append(
      createElement("p", "eyebrow", "HYBRID LAB"),
      createElement("h2", "", "Blend Any Two Genres")
    );
    heading.appendChild(headingText);

    const helper = createElement(
      "p",
      "helper-text no-min-height",
      "Choose any two genres. Forge selects both, adds a matching hybrid tag when one exists, and writes a clear style instruction for the AI."
    );

    const controls = createElement("div", "hybrid-controls");
    const firstLabel = createElement("label", "field");
    firstLabel.appendChild(createElement("span", "", "Main style"));
    const first = document.createElement("select");
    first.id = "hybridPrimary";
    firstLabel.appendChild(first);

    const secondLabel = createElement("label", "field");
    secondLabel.appendChild(createElement("span", "", "Blend with"));
    const second = document.createElement("select");
    second.id = "hybridPartner";
    secondLabel.appendChild(second);

    const genres = unique(DATA.categories.Genre).sort((a, b) => a.localeCompare(b));
    genres.forEach((genre) => {
      const optionOne = document.createElement("option");
      optionOne.value = genre;
      optionOne.textContent = genre;
      optionOne.selected = genre === "Baroque";
      first.appendChild(optionOne);

      const optionTwo = document.createElement("option");
      optionTwo.value = genre;
      optionTwo.textContent = genre;
      optionTwo.selected = genre === "Darkwave";
      second.appendChild(optionTwo);
    });

    const actionRow = createElement("div", "hybrid-action-row");
    const swap = createElement("button", "text-button", "Swap");
    swap.type = "button";
    swap.addEventListener("click", () => {
      const value = first.value;
      first.value = second.value;
      second.value = value;
    });

    const add = createElement("button", "primary-button hybrid-add-button", "Add Hybrid");
    add.type = "button";

    const status = createElement("p", "hybrid-status", "Ready for Baroque + Darkwave.");
    status.id = "hybridStatus";

    add.addEventListener("click", () => {
      const primary = first.value;
      const partner = second.value;
      if (!primary || !partner) return;
      if (primary === partner) {
        status.textContent = "Choose two different genres.";
        return;
      }

      const normalizedCandidates = [
        normalize(`${primary} ${partner}`),
        normalize(`${partner} ${primary}`)
      ];
      const exactHybrid = DATA.categories.Genre.find((tag) => normalizedCandidates.includes(normalize(tag)));
      const additions = unique([primary, partner, exactHybrid].filter(Boolean));
      const combined = unique([...state.selectedTags, ...additions]);

      if (combined.length > 100) {
        showToast("100-tag selection limit reached");
        return;
      }

      snapshot();
      state.selectedTags = combined;
      state.output = "";
      state.favorite = false;
      saveAll();
      syncControls(false);

      appendStyleDirection(
        `Create a deliberate ${primary} + ${partner} hybrid. Give both styles a clear role in the arrangement, pacing, and vocal behavior without naming music styles or instruments inside the lyrics.`
      );

      status.textContent = exactHybrid
        ? `${primary} + ${partner} added with ${exactHybrid}.`
        : `${primary} + ${partner} added.`;
      showToast("Hybrid added");
    });

    actionRow.append(swap, add);
    controls.append(firstLabel, secondLabel);
    card.append(heading, helper, controls, actionRow, status);

    const recipeHeading = createElement("div", "baroque-lab-heading");
    recipeHeading.append(
      createElement("p", "mini-label", "Baroque hybrid recipes"),
      createElement("p", "helper-text no-min-height", "One tap loads tags, tempo, structure, and AI style direction.")
    );

    const recipeGrid = createElement("div", "baroque-recipe-grid");
    V32.baroqueRecipes.forEach((recipe) => {
      const button = createElement("button", "baroque-recipe-button");
      button.type = "button";
      button.append(
        createElement("strong", "", recipe.name),
        createElement("span", "", recipe.description)
      );
      button.addEventListener("click", () => {
        applyFullRecipe(recipe);
        status.textContent = `${recipe.name} loaded.`;
      });
      recipeGrid.appendChild(button);
    });

    card.append(recipeHeading, recipeGrid);
    tagCard.insertAdjacentElement("afterend", card);
  }

  function installPromptShortcut() {
    const output = document.getElementById("promptOutput");
    const outputCard = output?.closest(".output-card");
    if (!output || !outputCard || document.getElementById("forgeAndCopyBtn")) return;

    output.placeholder = "Tap “Forge & Copy Prompt” to build the final style prompt and copy it to your clipboard.";

    const helper = createElement(
      "p",
      "helper-text no-min-height prompt-helper",
      "This box is the final prompt. It combines every selected tag, track controls, structure, style direction, and lyrics."
    );

    const button = createElement("button", "primary-button forge-copy-button", "Forge & Copy Prompt");
    button.id = "forgeAndCopyBtn";
    button.type = "button";
    button.addEventListener("click", async () => {
      forgePrompt();
      await copyText(state.output, "Prompt forged and copied");
    });

    const formatField = outputCard.querySelector(".prompt-format-field");
    formatField?.insertAdjacentElement("beforebegin", helper);
    output.insertAdjacentElement("beforebegin", button);
  }

  function initV32() {
    if (document.documentElement.dataset.forgeV32 === "ready") return;
    document.documentElement.dataset.forgeV32 = "ready";
    updateVersionLabels();
    installStyleDirectionCard();
    installTagStudio();
    installHybridLab();
    installPromptShortcut();
  }

  document.addEventListener("DOMContentLoaded", initV32);
})();
