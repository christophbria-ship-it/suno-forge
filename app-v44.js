"use strict";

(() => {
  const CATEGORY_DESCRIPTIONS = Object.freeze({
    Genre: "Sets the main musical style.",
    Mood: "Sets the emotional tone.",
    Era: "Adds a period-inspired character.",
    Instruments: "Adds this instrument or sound source.",
    Vocals: "Sets the voice type or vocal character.",
    "Vocal Delivery": "Controls how the lead vocal is performed.",
    "Vocal Range & Register": "Guides the vocal pitch range and register.",
    "Vocal Arrangement": "Controls how vocal parts are organized.",
    "Harmony & Choir": "Shapes harmonies, backing voices, or choir parts.",
    "Rhythm & Groove": "Sets the rhythmic feel and groove.",
    Production: "Shapes the production approach.",
    "Mix & Master": "Shapes the final mix and master.",
    Effects: "Adds this audio effect or processing character.",
    "Recording Space": "Places the sound in this type of space.",
    Performance: "Guides how the parts are performed.",
    Arrangement: "Shapes how the song develops and is organized.",
    "Texture & Atmosphere": "Adds this texture or atmosphere.",
    Key: "Sets the musical key."
  });

  function describeTag(tag, categories) {
    const category = categories.find((name) => CATEGORY_DESCRIPTIONS[name]);
    if (!category) return "Adds this direction to the generated style.";

    const clean = String(tag || "").trim();
    const lower = clean.toLowerCase();
    if (category === "Instruments") return `Adds ${lower} to the arrangement.`;
    if (category === "Mood") return `Creates a ${lower} emotional tone.`;
    if (category === "Era") return `Gives the track a ${lower} period character.`;
    if (category === "Rhythm & Groove") return `Pushes the groove toward ${lower}.`;
    if (category === "Texture & Atmosphere") return `Adds a ${lower} texture or atmosphere.`;
    if (category === "Recording Space") return `Places the sound in a ${lower} space.`;
    if (category === "Key") return `Sets the song in ${clean}.`;
    return CATEGORY_DESCRIPTIONS[category];
  }

  function parseCategories(text) {
    return String(text || "")
      .split(" · ")
      .map((value) => value.trim())
      .filter(Boolean);
  }

  function decorateDirectResults() {
    document.querySelectorAll(".direct-tag-result").forEach((button) => {
      if (button.dataset.forgeDescription === "ready") return;
      const name = button.querySelector("strong");
      const meta = button.querySelector("small");
      if (!name || !meta) return;

      const categories = parseCategories(meta.textContent);
      const description = describeTag(name.textContent, categories);
      meta.textContent = "";

      const categoryLine = document.createElement("span");
      categoryLine.className = "tag-result-category";
      categoryLine.textContent = categories.join(" · ") || "Tag";

      const descriptionLine = document.createElement("span");
      descriptionLine.className = "tag-result-description";
      descriptionLine.textContent = description;

      meta.append(categoryLine, descriptionLine);
      button.title = `${name.textContent}: ${description}`;
      button.setAttribute("aria-label", `${name.textContent}. ${description}`);
      button.dataset.forgeDescription = "ready";
    });
  }

  function decorateCategoryButtons() {
    document.querySelectorAll(".category").forEach((section) => {
      const category = section.querySelector(".category-header strong")?.textContent?.trim() || "";
      section.querySelectorAll(".tag-button").forEach((button) => {
        const description = describeTag(button.textContent, [category]);
        button.title = `${button.textContent}: ${description}`;
        button.setAttribute("aria-label", `${button.textContent}. ${description}`);
      });
    });
  }

  function installTagDescriptions() {
    const directResults = document.getElementById("directTagResults");
    const categoryList = document.getElementById("categoryList");

    if (directResults) {
      new MutationObserver(decorateDirectResults).observe(directResults, { childList: true, subtree: true });
      decorateDirectResults();
    }

    if (categoryList) {
      new MutationObserver(decorateCategoryButtons).observe(categoryList, { childList: true, subtree: true });
      decorateCategoryButtons();
    }
  }

  function clearStyleOutput() {
    const output = document.getElementById("promptOutput");
    if (!output) return;
    if (!String(state.output || "").trim() && !output.value.trim()) {
      showToast("Style box is already clear");
      return;
    }

    snapshot();
    state.output = "";
    state.favorite = false;
    output.value = "";
    if (els.favoriteBtn) els.favoriteBtn.textContent = "Favorite";
    saveAll({ immediate: true });
    showToast("Style cleared; build and writing kept");
    output.focus();
  }

  function installClearStyleButton() {
    const output = document.getElementById("promptOutput");
    const card = output?.closest(".output-card");
    const heading = card?.querySelector(".section-heading");
    const copyButton = document.getElementById("copyPromptBtn");
    if (!output || !card || !heading || !copyButton || document.getElementById("clearStyleBtn")) return false;

    const actions = document.createElement("div");
    actions.className = "output-heading-actions";

    const clearButton = document.createElement("button");
    clearButton.id = "clearStyleBtn";
    clearButton.type = "button";
    clearButton.className = "text-button clear-output-button";
    clearButton.textContent = "Clear Style";
    clearButton.title = "Clear only the generated Style box. Tags, controls, lyrics, presets, and history stay intact.";
    clearButton.addEventListener("click", clearStyleOutput);

    copyButton.insertAdjacentElement("beforebegin", actions);
    actions.append(copyButton, clearButton);
    output.placeholder = "Build a Suno Style prompt here. Clear Style empties only this box.";
    return true;
  }

  function clarifyDestructiveControls() {
    const reset = document.getElementById("resetBtn");
    const clearWriting = document.getElementById("clearLyricsBtn");
    const clearTags = document.getElementById("clearSelectionsBtn");

    if (reset) {
      reset.textContent = "New Workspace";
      reset.title = "Reset the current workspace. Saved presets and history remain.";
    }
    if (clearWriting) {
      clearWriting.title = "Clear the song idea, AI direction, lyrics, and their generated output. Tags remain.";
    }
    if (clearTags) {
      clearTags.title = "Remove selected tags only.";
    }
  }

  function updateVersion() {
    document.title = "Forge Studio v4.4";
    const hero = document.querySelector("#generatorWorkspace .hero") || document.querySelector(".hero");
    const eyebrow = hero?.querySelector(".eyebrow");
    if (eyebrow) eyebrow.textContent = "FORGE STUDIO V4.4";
  }

  function init() {
    if (document.documentElement.dataset.forgeV44 === "ready") return;
    if (document.documentElement.dataset.forgeV43 !== "ready") {
      window.setTimeout(init, 80);
      return;
    }
    if (!installClearStyleButton()) {
      window.setTimeout(init, 80);
      return;
    }

    clarifyDestructiveControls();
    installTagDescriptions();
    updateVersion();
    document.documentElement.dataset.forgeV44 = "ready";
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once: true });
})();
