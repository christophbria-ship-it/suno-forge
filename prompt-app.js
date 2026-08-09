"use strict";

(() => {
  const STORAGE_KEY = "sunoForgeProjectV3";
  const HISTORY_KEY = "sunoForgeHistoryV3";
  const PRESET_KEY = "sunoForgePresetsV3";
  const LEGACY_STORAGE_KEY = "forgePromptGeneratorV2";
  const LEGACY_HISTORY_KEY = "forgePromptHistoryV2";
  const LEGACY_PRESET_KEY = "forgePromptPresetsV2";
  const MAX_SELECTED = 100;
  const STEP_ORDER = ["brief", "sound", "shape", "export"];

  const RECIPES = [
    {
      name: "Dark Appalachian",
      description: "Weathered folk, close vocals, and a defiant final lift.",
      brief: "Dark Appalachian folk about finally leaving, intimate weathered vocal, restrained verses, and a defiant final chorus.",
      tags: ["Appalachian Folk", "Dark Folk", "Banjo", "Fiddle", "Upright Bass", "Raspy Vocals", "Haunting", "Defiant"],
      bpm: 82,
      energy: "medium",
      key: "D",
      mode: "minor",
      production: "Dry close-mic vocal, sparse verses, natural room sound, heavier live drums and stacked harmony only in the final chorus."
    },
    {
      name: "Raw Grunge",
      description: "Loud-soft dynamics, dirty guitars, and honest tension.",
      brief: "Unpolished alternative rock with tense verses and a violent emotional release in the chorus.",
      tags: ["Grunge", "Alternative Rock", "Distorted Guitar", "Bass Guitar", "Live Drums", "Raw Vocals", "Gritty", "Angry"],
      bpm: 112,
      energy: "high",
      key: "E",
      mode: "minor",
      production: "Loose live-band feel, dirty guitar layers, audible pick attack, restrained verse mix, wide explosive chorus without glossy polish."
    },
    {
      name: "Cinematic Fallout",
      description: "A near-silent opening that grows to full-scale impact.",
      brief: "A dark cinematic track that starts almost empty and becomes enormous without turning into trailer-music cliché.",
      tags: ["Film Score", "Cinematic Rock", "String Ensemble", "Toms", "Piano", "Apocalyptic", "Powerful", "Haunting"],
      bpm: 76,
      energy: "explosive",
      key: "C",
      mode: "minor",
      production: "Slow dynamic escalation, low strings and piano first, percussion enters late, final section reaches full scale then cuts to a bare ending."
    },
    {
      name: "Soul Pressure",
      description: "A tight pocket, worn keys, and an intimate lead vocal.",
      brief: "Modern soul with a tight pocket, restrained confidence, and a vocal that sounds close enough to touch.",
      tags: ["Neo-Soul", "Alternative R&B", "Rhodes", "Bass Guitar", "Live Drums", "Soulful Vocals", "Intimate", "Confident"],
      bpm: 92,
      energy: "medium",
      key: "F",
      mode: "minor",
      production: "Warm bass-forward mix, human drum timing, Rhodes chords with space, intimate lead vocal, selective harmony stacks on the hook."
    },
    {
      name: "Outlaw Drive",
      description: "Fast, rough country with momentum and no radio gloss.",
      brief: "Hard-driving outlaw country with grit, momentum, and no polished radio-country sheen.",
      tags: ["Outlaw Country", "Country Rock", "Electric Guitar", "Pedal Steel", "Bass Guitar", "Live Drums", "Raspy Vocals", "Reckless"],
      bpm: 126,
      energy: "high",
      key: "A",
      mode: "mixolydian",
      production: "Live room character, sharp snare, overdriven rhythm guitar, short pedal-steel answers, rough lead vocal and a big gang-vocal final hook."
    },
    {
      name: "Cold Post-Punk",
      description: "Nervous bass motion, clipped guitar, and emotional distance.",
      brief: "Minimal post-punk with a nervous pulse, detached vocal, and an atmosphere that never fully opens up.",
      tags: ["Post-Punk", "New Wave", "Bass Guitar", "Clean Electric Guitar", "Analog Synth", "Detached Delivery", "Cold", "Tense"],
      bpm: 132,
      energy: "medium",
      key: "B",
      mode: "minor",
      production: "Bass-led arrangement, dry drums, clipped guitar, narrow synth layer, emotionally restrained vocal, no oversized chorus."
    }
  ];

  const STRUCTURES = [
    ["Direct", "Intro > Verse > Chorus > Verse > Chorus > Bridge > Final Chorus > Outro"],
    ["Slow Burn", "Intro > Verse > Verse > Pre-Chorus > Chorus > Bridge > Final Chorus > Outro"],
    ["No Chorus", "Intro > Verse > Verse > Instrumental Break > Verse > Climax > Outro"],
    ["Short", "Intro > Verse > Chorus > Verse > Final Chorus"],
    ["Epic", "Intro > Verse > Pre-Chorus > Chorus > Verse > Pre-Chorus > Chorus > Bridge > Breakdown > Final Chorus > Outro"]
  ];

  const QUICK_PICKS = {
    Style: ["Indie Pop", "Neo-Soul", "Outlaw Country", "Post-Punk", "Hip-Hop", "Film Score"],
    Mood: ["Intimate", "Dark", "Uplifting", "Haunting", "Defiant", "Energetic"],
    Instruments: ["Acoustic Guitar", "Electric Guitar", "Piano", "Live Drums", "Analog Synth", "808 Bass"],
    Vocals: ["Raspy Vocals", "Airy Vocals", "Soulful Vocals", "Rap Vocals", "Raw Vocals", "Instrumental"],
    Production: ["Raw Production", "Warm Analog", "Wide Stereo", "Dry Mix", "Tape Saturation", "Lo-Fi"]
  };

  const CATEGORY_LABELS = {
    Genre: "Style",
    Mood: "Mood",
    Instruments: "Instruments",
    Vocals: "Vocals",
    "Vocal Delivery": "Vocal delivery",
    "Vocal Range & Register": "Vocal register",
    "Vocal Arrangement": "Vocal arrangement",
    "Harmony & Choir": "Harmony and choir",
    "Rhythm & Groove": "Rhythm and groove",
    Production: "Production",
    "Mix & Master": "Mix",
    Effects: "Effects",
    Era: "Era",
    Language: "Language",
    Writing: "Writing",
    Arrangement: "Arrangement",
    Performance: "Performance",
    "Recording Space": "Recording space",
    "Texture & Atmosphere": "Texture and atmosphere"
  };

  const CATEGORY_ORDER = [
    "Vocals",
    "Vocal Delivery",
    "Vocal Range & Register",
    "Vocal Arrangement",
    "Harmony & Choir",
    "Instruments",
    "Rhythm & Groove",
    "Production",
    "Mix & Master",
    "Effects",
    "Era",
    "Language",
    "Writing",
    "Arrangement",
    "Performance",
    "Recording Space",
    "Texture & Atmosphere"
  ];

  const MODE_CONFIG = {
    compact: {
      label: "Compact",
      maxCategoryItems: 3,
      briefLimit: 145,
      structureLimit: 105,
      productionLimit: 135
    },
    balanced: {
      label: "Balanced",
      maxCategoryItems: 5,
      briefLimit: 230,
      structureLimit: 170,
      productionLimit: 240
    },
    detailed: {
      label: "Detailed",
      maxCategoryItems: 8,
      briefLimit: 420,
      structureLimit: 280,
      productionLimit: 520
    }
  };

  const OUTPUT_FORMATS = {
    forge: {
      label: "Forge Brief",
      hint: "The current full production brief."
    },
    suno: {
      label: "Suno Fields",
      hint: "Six labeled lines that keep Suno's main style signals easy to scan."
    },
    short: {
      label: "Short & Sweet",
      hint: "One focused GMIV line, intentionally kept under 220 characters."
    }
  };

  const SHORT_PROMPT_TARGET = 220;
  const SUNO_FIELDS_TARGET = 580;

  const DEFAULT_STATE = Object.freeze({
    brief: "",
    selected: [],
    bpm: 120,
    energy: "medium",
    length: "standard",
    key: "C",
    mode: "minor",
    meter: "4/4",
    vocalPlan: "follow selected vocal tags",
    structure: STRUCTURES[0][1],
    production: "",
    exclude: "",
    limit: 1000,
    outputFormat: "forge",
    promptMode: "balanced",
    output: "",
    activeStep: "brief"
  });

  const nodes = {};
  const categoryIndex = new Map();
  const allTagRecords = [];
  let promptHistory = loadCollection(HISTORY_KEY, LEGACY_HISTORY_KEY);
  let presets = loadCollection(PRESET_KEY, LEGACY_PRESET_KEY);
  let state = loadProject();
  let saveTimer = 0;
  let toastTimer = 0;
  let installPrompt = null;
  let outputDirty = !state.output;
  let lastCompile = {
    includedTags: 0,
    totalTags: 0,
    truncated: false
  };

  function clone(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function safeJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function loadCollection(primaryKey, legacyKey) {
    const value = safeJson(primaryKey) ?? safeJson(legacyKey) ?? [];
    return Array.isArray(value) ? value : [];
  }

  function normalizeState(value) {
    const next = {
      ...DEFAULT_STATE,
      ...(value && typeof value === "object" ? value : {})
    };
    next.selected = Array.isArray(next.selected)
      ? unique(next.selected.map(item => String(item || "").trim())).slice(0, MAX_SELECTED)
      : [];
    next.bpm = clampNumber(next.bpm, 50, 220, 120);
    next.limit = [0, 600, 800, 1000, 1200].includes(Number(next.limit)) ? Number(next.limit) : 1000;
    next.outputFormat = OUTPUT_FORMATS[next.outputFormat] ? next.outputFormat : "forge";
    next.promptMode = MODE_CONFIG[next.promptMode] ? next.promptMode : "balanced";
    next.activeStep = STEP_ORDER.includes(next.activeStep) ? next.activeStep : "brief";
    [
      "brief", "energy", "length", "key", "mode", "meter", "vocalPlan",
      "structure", "production", "exclude", "output"
    ].forEach(key => next[key] = String(next[key] ?? DEFAULT_STATE[key] ?? ""));
    return next;
  }

  function loadProject() {
    return normalizeState(safeJson(STORAGE_KEY) ?? safeJson(LEGACY_STORAGE_KEY) ?? {});
  }

  function clampNumber(value, minimum, maximum, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
  }

  function unique(items) {
    return [...new Set(items.filter(Boolean))];
  }

  function categories() {
    return typeof DATA !== "undefined" && DATA?.categories && typeof DATA.categories === "object"
      ? DATA.categories
      : {};
  }

  function groupedCategoryTags(category, tags) {
    const definitions = typeof DATA !== "undefined" && Array.isArray(DATA?.categoryGroups?.[category])
      ? DATA.categoryGroups[category]
      : [];
    if (!definitions.length) return [];

    const starts = definitions.map(group => tags.indexOf(group.start));
    if (starts.some((start, index) => start < 0 || (index > 0 && start <= starts[index - 1]))) {
      return [];
    }

    return definitions.map((group, index) => ({
      label: group.label,
      tags: tags.slice(starts[index], starts[index + 1] ?? tags.length)
    }));
  }

  function buildCategoryIndex() {
    categoryIndex.clear();
    allTagRecords.length = 0;
    Object.entries(categories()).forEach(([category, tags]) => {
      if (!Array.isArray(tags)) return;
      tags.forEach(tag => {
        const clean = String(tag || "").trim();
        if (!clean || categoryIndex.has(clean)) return;
        categoryIndex.set(clean, category);
        allTagRecords.push({
          tag: clean,
          category,
          search: `${clean} ${category}`.toLowerCase()
        });
      });
    });
    state.selected = state.selected.filter(tag => categoryIndex.has(tag)).slice(0, MAX_SELECTED);
    const available = categories();
    const genreCount = Array.isArray(available.Genre) ? available.Genre.length : 0;
    const instrumentCount = Array.isArray(available.Instruments) ? available.Instruments.length : 0;
    const totalCount = Object.values(available)
      .filter(Array.isArray)
      .reduce((total, tags) => total + tags.length, 0);
    nodes.libraryStats.textContent = `${totalCount.toLocaleString()} tags available · ${genreCount} genres · ${instrumentCount} instruments · select up to ${MAX_SELECTED}`;
  }

  function sentence(value) {
    const clean = String(value || "").trim().replace(/\s+/g, " ");
    if (!clean) return "";
    return /[.!?…]$/.test(clean) ? clean : `${clean}.`;
  }

  function compact(value, maximum) {
    const clean = String(value || "").trim().replace(/\s+/g, " ");
    if (!maximum || clean.length <= maximum) return clean;
    const room = Math.max(1, maximum - 1);
    const cut = clean.slice(0, room);
    const breakAt = Math.max(
      cut.lastIndexOf(". "),
      cut.lastIndexOf("; "),
      cut.lastIndexOf(", "),
      cut.lastIndexOf(" ")
    );
    const result = breakAt > room * .65 ? cut.slice(0, breakAt) : cut;
    return `${result.trim()}…`;
  }

  function titleCase(value) {
    const clean = String(value || "");
    return clean ? clean[0].toUpperCase() + clean.slice(1) : "";
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function toast(message) {
    nodes.toast.textContent = message;
    nodes.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => nodes.toast.classList.remove("show"), 2100);
  }

  function markDirty() {
    nodes.saveState.textContent = "Saving…";
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      const saved = saveJson(STORAGE_KEY, snapshot());
      nodes.saveState.textContent = saved ? "Saved on this device" : "Device storage unavailable";
    }, 180);
  }

  function markOutputDirty() {
    outputDirty = true;
    if (state.output && state.activeStep === "export") {
      nodes.outputStatus.textContent = "Your settings changed. Regenerate when you are ready to replace the edited prompt.";
    }
  }

  function snapshot() {
    pullControls();
    return {
      brief: state.brief,
      selected: [...state.selected],
      bpm: state.bpm,
      energy: state.energy,
      length: state.length,
      key: state.key,
      mode: state.mode,
      meter: state.meter,
      vocalPlan: state.vocalPlan,
      structure: state.structure,
      production: state.production,
      exclude: state.exclude,
      limit: state.limit,
      outputFormat: state.outputFormat,
      promptMode: state.promptMode,
      output: state.output,
      activeStep: state.activeStep
    };
  }

  function setStep(step, options = {}) {
    const next = STEP_ORDER.includes(step) ? step : "brief";
    const changed = state.activeStep !== next;
    state.activeStep = next;

    document.querySelectorAll("[data-step]").forEach(button => {
      const active = button.dataset.step === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });

    document.querySelectorAll("[data-panel]").forEach(panel => {
      const active = panel.dataset.panel === next;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });

    if (next === "export" && options.forge !== false && (outputDirty || !state.output)) {
      forgePrompt({ addHistory: false, announce: false });
    }

    updateStepSummaries();
    renderQuality();
    renderExclude();
    markDirty();

    if (options.history !== false && location.hash !== `#${next}`) {
      window.history.replaceState(null, "", `#${next}`);
    }

    if (changed && options.scroll !== false) {
      const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      nodes.workspaceMain.scrollIntoView({ behavior, block: "start" });
      window.setTimeout(() => {
        document.getElementById(`heading-${next}`)?.focus({ preventScroll: true });
      }, behavior === "smooth" ? 260 : 0);
    }
  }

  function updateStepSummaries() {
    const briefWords = state.brief.trim() ? state.brief.trim().split(/\s+/).length : 0;
    nodes.summaryBrief.textContent = briefWords ? `${briefWords} word${briefWords === 1 ? "" : "s"}` : "Not started";
    nodes.summarySound.textContent = state.selected.length
      ? `${state.selected.length} selected`
      : "Nothing selected";
    nodes.summaryShape.textContent = `${state.bpm} BPM · ${state.key} ${state.mode}`;
    nodes.summaryExport.textContent = state.output
      ? `${state.output.length} characters`
      : "Ready when you are";

    const activeIndex = STEP_ORDER.indexOf(state.activeStep);
    document.querySelectorAll("[data-step]").forEach(button => {
      const index = STEP_ORDER.indexOf(button.dataset.step);
      let complete = index < activeIndex;
      if (button.dataset.step === "brief") complete = Boolean(state.brief);
      if (button.dataset.step === "sound") complete = state.selected.length > 0;
      if (button.dataset.step === "export") complete = Boolean(state.output);
      button.classList.toggle("complete", complete);
    });
  }

  function renderRecipes() {
    nodes.recipeRow.replaceChildren();
    nodes.recipeSelect.replaceChildren();
    const prompt = document.createElement("option");
    prompt.value = "";
    prompt.textContent = "Choose a Quick Start";
    nodes.recipeSelect.appendChild(prompt);

    RECIPES.forEach((recipe, index) => {
      const button = document.createElement("button");
      const name = document.createElement("strong");
      const description = document.createElement("small");
      const option = document.createElement("option");
      button.type = "button";
      button.className = "recipe-card";
      button.dataset.recipeIndex = String(index);
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `Load ${recipe.name} recipe`);
      name.textContent = recipe.name;
      description.textContent = recipe.description;
      option.value = String(index);
      option.textContent = `${recipe.name} — ${recipe.description}`;
      button.append(name, description);
      button.addEventListener("click", () => applyRecipe(recipe));
      nodes.recipeRow.appendChild(button);
      nodes.recipeSelect.appendChild(option);
    });
  }

  function applyRecipe(recipe) {
    const recipeIndex = RECIPES.indexOf(recipe);
    state.brief = recipe.brief;
    state.selected = unique(recipe.tags).filter(tag => categoryIndex.has(tag)).slice(0, MAX_SELECTED);
    state.bpm = recipe.bpm;
    state.energy = recipe.energy;
    state.key = recipe.key;
    state.mode = recipe.mode;
    state.production = recipe.production;
    state.structure = STRUCTURES[0][1];
    nodes.recipeSelect.value = recipeIndex >= 0 ? String(recipeIndex) : "";
    nodes.recipeRow.querySelectorAll("[data-recipe-index]").forEach(button => {
      const active = Number(button.dataset.recipeIndex) === recipeIndex;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    markOutputDirty();
    syncControls();
    renderSelected();
    refreshCategoryButtons();
    refreshCategoryCounts();
    updateStepSummaries();
    renderQuality();
    markDirty();
    toast(`${recipe.name} loaded`);
  }

  function addTag(tag) {
    if (!tag || state.selected.includes(tag) || !categoryIndex.has(tag)) return;
    if (state.selected.length >= MAX_SELECTED) {
      toast(`Keep the palette focused: up to ${MAX_SELECTED} choices.`);
      return;
    }
    state.selected.push(tag);
    afterTagChange();
  }

  function removeTag(tag) {
    state.selected = state.selected.filter(item => item !== tag);
    afterTagChange();
  }

  function toggleTag(tag) {
    state.selected.includes(tag) ? removeTag(tag) : addTag(tag);
  }

  function afterTagChange() {
    markOutputDirty();
    renderSelected();
    renderSearch();
    refreshCategoryButtons();
    refreshCategoryCounts();
    updateStepSummaries();
    renderQuality();
    markDirty();
  }

  function renderSelected() {
    nodes.selectedTags.replaceChildren();
    state.selected.forEach(tag => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${tag} ×`;
      button.title = `Remove ${tag}`;
      button.setAttribute("aria-label", `Remove ${tag}`);
      button.addEventListener("click", () => removeTag(tag));
      nodes.selectedTags.appendChild(button);
    });

    const count = state.selected.length;
    nodes.selectedCount.textContent = `${count} selected`;
    const percentage = Math.min(100, Math.round((count / 12) * 100));
    nodes.paletteBar.style.width = `${percentage}%`;

    if (!count) {
      nodes.paletteLabel.textContent = "Open canvas";
      nodes.selectionGuidance.textContent = "Aim for 6–14 choices across a few categories.";
    } else if (count < 5) {
      nodes.paletteLabel.textContent = "Still broad";
      nodes.selectionGuidance.textContent = "Add a mood, instrument, and vocal or production choice.";
    } else if (count <= 14) {
      nodes.paletteLabel.textContent = "Focused";
      nodes.selectionGuidance.textContent = "This is a strong range. Add only details that change the result.";
    } else if (count <= 22) {
      nodes.paletteLabel.textContent = "Highly detailed";
      nodes.selectionGuidance.textContent = "The palette is dense. Remove anything that repeats another choice.";
    } else {
      nodes.paletteLabel.textContent = "Overloaded";
      nodes.selectionGuidance.textContent = "Too many choices can fight each other. Trim to the essentials.";
    }
  }

  function renderQuickPicks() {
    nodes.quickPickGrid.replaceChildren();
    Object.entries(QUICK_PICKS).forEach(([label, requestedTags]) => {
      const tags = requestedTags.filter(tag => categoryIndex.has(tag));
      if (!tags.length) return;
      const row = document.createElement("div");
      const heading = document.createElement("strong");
      const buttons = document.createElement("div");
      row.className = "quick-pick-row";
      heading.textContent = label;
      tags.forEach(tag => buttons.appendChild(makeTagButton(tag)));
      row.append(heading, buttons);
      nodes.quickPickGrid.appendChild(row);
    });
  }

  function renderSearch() {
    const query = nodes.tagSearch.value.trim().toLowerCase();
    nodes.searchResults.replaceChildren();
    if (!query) {
      nodes.searchResults.hidden = true;
      return;
    }

    const matches = allTagRecords
      .filter(item => item.search.includes(query))
      .sort((left, right) => {
        const leftStarts = left.tag.toLowerCase().startsWith(query) ? 0 : 1;
        const rightStarts = right.tag.toLowerCase().startsWith(query) ? 0 : 1;
        return leftStarts - rightStarts || left.tag.localeCompare(right.tag);
      })
      .slice(0, 100);

    matches.forEach(({ tag, category }) => {
      const button = document.createElement("button");
      const label = document.createElement("span");
      const detail = document.createElement("small");
      const active = state.selected.includes(tag);
      button.type = "button";
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(active));
      button.classList.toggle("active", active);
      label.textContent = active ? `✓ ${tag}` : tag;
      detail.textContent = category;
      button.append(label, detail);
      button.addEventListener("click", () => toggleTag(tag));
      nodes.searchResults.appendChild(button);
    });

    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "helper-text";
      empty.textContent = "No matching sound options. Try a shorter or broader term.";
      nodes.searchResults.appendChild(empty);
    }
    nodes.searchResults.hidden = false;
  }

  function makeTagButton(tag) {
    const button = document.createElement("button");
    const active = state.selected.includes(tag);
    button.type = "button";
    button.dataset.tag = tag;
    button.textContent = tag;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    button.addEventListener("click", () => toggleTag(tag));
    return button;
  }

  function fillCategory(details, tags) {
    let grid = details.querySelector(".category-grid");
    if (grid) return;
    grid = document.createElement("div");
    grid.className = "category-grid";
    const groups = groupedCategoryTags(details.dataset.category, tags);
    if (groups.length) {
      grid.classList.add("category-grid-grouped");
      groups.forEach(group => {
        const section = document.createElement("section");
        const heading = document.createElement("div");
        const title = document.createElement("h3");
        const count = document.createElement("span");
        const buttons = document.createElement("div");
        section.className = "category-subgroup";
        heading.className = "category-subgroup-heading";
        buttons.className = "category-subgroup-tags";
        title.textContent = group.label;
        count.textContent = `${group.tags.length} options`;
        group.tags.forEach(tag => buttons.appendChild(makeTagButton(tag)));
        heading.append(title, count);
        section.append(heading, buttons);
        grid.appendChild(section);
      });
    } else {
      tags.forEach(tag => grid.appendChild(makeTagButton(tag)));
    }
    details.appendChild(grid);
  }

  function renderCategories() {
    nodes.categoryList.replaceChildren();
    nodes.categoryJump.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Jump to category";
    nodes.categoryJump.appendChild(placeholder);

    Object.entries(categories()).forEach(([category, value]) => {
      const tags = Array.isArray(value) ? value : [];
      const id = `category-${slugify(category)}`;
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const title = document.createElement("span");
      const count = document.createElement("span");
      const toggle = document.createElement("span");
      const option = document.createElement("option");

      details.className = "category";
      details.id = id;
      details.dataset.category = category;
      title.textContent = category;
      count.className = "category-count";
      count.dataset.categoryCount = category;
      toggle.className = "category-toggle";
      toggle.setAttribute("aria-hidden", "true");
      summary.append(title, count, toggle);
      details.appendChild(summary);
      details.addEventListener("toggle", () => {
        if (details.open) fillCategory(details, tags);
      });
      nodes.categoryList.appendChild(details);

      option.value = id;
      option.textContent = `${category} (${tags.length})`;
      nodes.categoryJump.appendChild(option);
    });

    refreshCategoryCounts();
  }

  function refreshCategoryButtons() {
    document.querySelectorAll("[data-tag]").forEach(button => {
      const active = state.selected.includes(button.dataset.tag);
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function refreshCategoryCounts() {
    Object.entries(categories()).forEach(([category, value]) => {
      const tags = Array.isArray(value) ? value : [];
      const selected = tags.filter(tag => state.selected.includes(tag)).length;
      const node = nodes.categoryList.querySelector(
        `[data-category-count="${CSS.escape(category)}"]`
      );
      if (node) {
        node.textContent = selected
          ? `${tags.length} options · ${selected} selected`
          : `${tags.length} options`;
      }
    });
  }

  function renderStructures() {
    nodes.structurePresets.replaceChildren();
    STRUCTURES.forEach(([name, value]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = name;
      button.addEventListener("click", () => {
        state.structure = value;
        nodes.structureInput.value = value;
        markOutputDirty();
        markDirty();
        renderQuality();
      });
      nodes.structurePresets.appendChild(button);
    });
  }

  function groupSelected() {
    const grouped = new Map();
    state.selected.forEach(tag => {
      const category = categoryIndex.get(tag) || "Style";
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(tag);
    });
    return grouped;
  }

  function compileForgePrompt() {
    pullControls();
    const config = MODE_CONFIG[state.promptMode] || MODE_CONFIG.balanced;
    const grouped = groupSelected();
    const usedCategories = new Set();
    const segments = [];

    const add = (text, tags = [], essential = false) => {
      const clean = String(text || "").trim();
      if (clean) segments.push({ text: clean, tags, essential });
    };

    const addCategory = (category, maximum = config.maxCategoryItems) => {
      const values = grouped.get(category) || [];
      if (!values.length) return;
      usedCategories.add(category);
      const tags = values.slice(0, maximum);
      add(`${CATEGORY_LABELS[category] || category}: ${tags.join(", ")}`, tags, category === "Genre");
    };

    addCategory("Genre");
    addCategory("Mood");

    if (state.brief) {
      add(`Creative direction: ${compact(state.brief, config.briefLimit)}`, [], true);
    }

    add(
      `Track: ${state.bpm} BPM; ${state.key} ${state.mode}; ${state.meter}; ${state.energy} energy; ${state.length} length`,
      [],
      true
    );

    if (state.vocalPlan === "instrumental") {
      add("Vocals: instrumental; no lead or backing vocals", [], true);
      usedCategories.add("Vocals");
      usedCategories.add("Vocal Delivery");
      usedCategories.add("Vocal Arrangement");
      usedCategories.add("Harmony & Choir");
    } else if (state.vocalPlan !== "follow selected vocal tags") {
      add(`Vocal plan: ${state.vocalPlan}`);
    }

    CATEGORY_ORDER.forEach(category => {
      if (!usedCategories.has(category)) addCategory(category);
    });

    [...grouped.keys()]
      .filter(category => !usedCategories.has(category) && category !== "Key")
      .forEach(category => addCategory(category));

    if (state.structure) {
      add(`Structure: ${compact(state.structure, config.structureLimit)}`);
    }
    if (state.production) {
      add(`Production direction: ${compact(state.production, config.productionLimit)}`);
    }

    const limit = Number(state.limit) || 0;
    const included = new Set();
    const outputSegments = [];
    let truncated = false;

    for (const segment of segments) {
      const candidate = sentence(segment.text);
      const prefix = outputSegments.length ? " " : "";
      if (!limit || outputSegments.join(" ").length + prefix.length + candidate.length <= limit) {
        outputSegments.push(candidate);
        segment.tags.forEach(tag => included.add(tag));
        continue;
      }

      const remaining = limit - outputSegments.join(" ").length - prefix.length;
      if (segment.essential && remaining >= 64) {
        const shortened = sentence(compact(segment.text, remaining - 1));
        if (shortened.length <= remaining) outputSegments.push(shortened);
      }
      truncated = true;
    }

    let text = outputSegments.join(" ").trim();
    if (limit && text.length > limit) {
      text = compact(text, limit);
      truncated = true;
    }

    lastCompile = {
      includedTags: included.size,
      totalTags: state.selected.length,
      truncated
    };
    return text;
  }

  function categoryValues(grouped, categoryNames) {
    return unique(categoryNames.flatMap(category => grouped.get(category) || []));
  }

  function takeWithin(values, maximumItems, maximumCharacters, included) {
    const chosen = [];
    for (const value of unique(values).slice(0, maximumItems)) {
      const candidate = [...chosen, value].join(", ");
      if (candidate.length > maximumCharacters && chosen.length) break;
      chosen.push(candidate.length > maximumCharacters ? compact(value, maximumCharacters) : value);
      if (state.selected.includes(value)) included.add(value);
    }
    return chosen;
  }

  function naturalList(values) {
    if (values.length < 2) return values[0] || "";
    if (values.length === 2) return `${values[0]} and ${values[1]}`;
    return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
  }

  function compileSunoFieldsPrompt() {
    pullControls();
    const grouped = groupSelected();
    const included = new Set();
    const itemLimit = state.promptMode === "compact" ? 2 : state.promptMode === "detailed" ? 4 : 3;

    const genres = takeWithin(grouped.get("Genre") || [], Math.min(itemLimit, 3), 58, included);
    const eras = takeWithin(grouped.get("Era") || [], 1, 24, included);
    const moods = takeWithin(grouped.get("Mood") || [], Math.min(itemLimit, 3), 50, included);
    const instruments = takeWithin(grouped.get("Instruments") || [], Math.min(itemLimit, 3), 78, included);

    const vocalSource = state.vocalPlan === "instrumental"
      ? ["Instrumental"]
      : [
          ...(state.vocalPlan === "follow selected vocal tags" ? [] : [titleCase(state.vocalPlan)]),
          ...categoryValues(grouped, [
            "Vocals",
            "Vocal Delivery",
            "Vocal Range & Register",
            "Vocal Arrangement",
            "Harmony & Choir"
          ])
        ];
    const vocals = takeWithin(vocalSource, Math.min(itemLimit + 1, 4), 95, included);

    const productionTags = takeWithin(
      categoryValues(grouped, [
        "Production",
        "Mix & Master",
        "Effects",
        "Rhythm & Groove",
        "Recording Space",
        "Texture & Atmosphere"
      ]),
      Math.min(itemLimit + 1, 5),
      92,
      included
    );
    const productionParts = [
      `${state.bpm} BPM, ${state.key} ${state.mode}, ${state.meter}, ${state.energy} energy`
    ];
    if (productionTags.length) productionParts.push(productionTags.join(", "));
    if (state.production) {
      const noteLimit = state.promptMode === "compact" ? 72 : state.promptMode === "detailed" ? 120 : 96;
      productionParts.push(compact(state.production, noteLimit));
    }

    const lines = [
      ["GENRE", genres.join(", ")],
      ["ERA", eras.join(", ")],
      ["MOOD/EMOTION", moods.join(", ")],
      ["INSTRUMENTS", instruments.join(", ")],
      ["VOCAL STYLE", vocals.join(", ")],
      ["PRODUCTION", compact(productionParts.join("; "), 190)]
    ].map(([label, value]) => `${label}: ${value}`.trimEnd());

    const requestedLimit = Number(state.limit) || 0;
    const effectiveLimit = requestedLimit
      ? Math.min(requestedLimit, SUNO_FIELDS_TARGET)
      : SUNO_FIELDS_TARGET;
    let text = lines.join("\n");
    let truncated = false;
    if (text.length > effectiveLimit) {
      text = compact(text, effectiveLimit);
      truncated = true;
    }

    lastCompile = {
      includedTags: included.size,
      totalTags: state.selected.length,
      truncated
    };
    return text;
  }

  function compileShortPrompt() {
    pullControls();
    const grouped = groupSelected();
    const included = new Set();
    const genres = takeWithin(grouped.get("Genre") || [], 2, 42, included);
    const eras = takeWithin(grouped.get("Era") || [], 1, 16, included);
    const moods = takeWithin(grouped.get("Mood") || [], 3, 34, included);
    const instruments = takeWithin(grouped.get("Instruments") || [], 3, 54, included);

    const vocalSource = state.vocalPlan === "instrumental"
      ? ["Instrumental"]
      : [
          ...(state.vocalPlan === "follow selected vocal tags" ? [] : [titleCase(state.vocalPlan)]),
          ...categoryValues(grouped, ["Vocals", "Vocal Delivery", "Vocal Range & Register"])
        ];
    const vocals = takeWithin(vocalSource, 3, 58, included);

    const style = compact(
      [eras[0] || "", genres.join(" / ")].filter(Boolean).join(" "),
      52
    );
    const clauses = [
      style,
      naturalList(moods),
      naturalList(instruments),
      naturalList(vocals)
    ].filter(Boolean);

    let text = clauses.join(", ");
    if (!text && state.brief) text = compact(state.brief, 180);
    if (!text) text = `${state.bpm} BPM, ${state.key} ${state.mode}, ${state.energy} energy`;

    const requestedLimit = Number(state.limit) || 0;
    const effectiveLimit = requestedLimit
      ? Math.min(requestedLimit, SHORT_PROMPT_TARGET)
      : SHORT_PROMPT_TARGET;
    let truncated = false;
    if (text.length > effectiveLimit) {
      text = compact(text, effectiveLimit);
      truncated = true;
    }

    lastCompile = {
      includedTags: included.size,
      totalTags: state.selected.length,
      truncated
    };
    return text;
  }

  function compilePrompt() {
    if (state.outputFormat === "suno") return compileSunoFieldsPrompt();
    if (state.outputFormat === "short") return compileShortPrompt();
    return compileForgePrompt();
  }

  function forgePrompt(options = {}) {
    state.output = compilePrompt();
    nodes.promptOutput.value = state.output;
    outputDirty = false;
    renderCount();
    renderExclude();
    renderQuality();
    updateStepSummaries();
    markDirty();

    if (state.output) {
      const tagStatus = lastCompile.totalTags
        ? `${lastCompile.includedTags} of ${lastCompile.totalTags} selected sound choices represented`
        : "No sound choices selected";
      if (state.outputFormat === "short") {
        nodes.outputStatus.textContent = `Kept short and focused. ${tagStatus}.`;
      } else if (state.outputFormat === "suno") {
        nodes.outputStatus.textContent = `Organized into six Suno-ready fields. ${tagStatus}.`;
      } else {
        nodes.outputStatus.textContent = lastCompile.truncated
          ? `Built to the character limit. ${tagStatus}; review before copying.`
          : `Built locally. ${tagStatus}.`;
      }
      if (options.addHistory) addHistory();
      if (options.announce !== false) toast("Prompt regenerated");
    } else {
      nodes.outputStatus.textContent = "Add a brief or sound choices, then regenerate.";
    }
  }

  function renderCount() {
    const limit = Number(state.limit) || 0;
    const length = String(state.output || "").length;
    nodes.promptCount.textContent = state.outputFormat === "short"
      ? `${length} / ${SHORT_PROMPT_TARGET} target`
      : limit ? `${length} / ${limit}` : `${length} characters`;
    nodes.promptCount.style.borderColor = limit && length > limit ? "var(--danger)" : "";

    const format = OUTPUT_FORMATS[state.outputFormat] || OUTPUT_FORMATS.forge;
    const detail = MODE_CONFIG[state.promptMode]?.label || "Balanced";
    nodes.outputModeBadge.textContent = state.outputFormat === "short"
      ? format.label
      : `${format.label} · ${detail}`;
    nodes.formatHint.textContent = format.hint;
    nodes.promptModeControl.disabled = state.outputFormat === "short";
  }

  function calculateQuality() {
    const grouped = groupSelected();
    const count = state.selected.length;
    let score = 0;

    if (state.brief.length >= 20) score += 15;
    if (state.brief.length >= 80) score += 10;
    if (grouped.has("Genre")) score += 12;
    if (grouped.has("Mood")) score += 8;
    if (grouped.has("Instruments")) score += 9;
    if (grouped.has("Vocals") || state.vocalPlan === "instrumental") score += 8;
    if (count >= 5 && count <= 14) score += 14;
    else if (count > 0) score += 6;
    if (state.production.length >= 25) score += 12;
    if (state.structure) score += 5;
    if (state.exclude) score += 4;
    if (state.bpm && state.key && state.mode && state.meter) score += 8;

    if (count > 22) score -= 8;
    return Math.max(0, Math.min(100, score));
  }

  function renderQuality() {
    const score = calculateQuality();
    nodes.qualityScore.textContent = String(score);

    let heading = "A focused production brief";
    let hint = "Add a brief and a few sound choices to strengthen the prompt.";

    if (!state.brief) {
      heading = "Start with a clear idea";
      hint = "Describe the sound, emotion, or production goal in the Brief step.";
    } else if (!state.selected.length) {
      heading = "Give the idea a sound";
      hint = "Choose a style, mood, and a few instruments or vocal traits.";
    } else if (!state.production) {
      heading = "Add production movement";
      hint = "A short note about dynamics, recording character, or the final section will make this more specific.";
    } else if (state.selected.length > 22) {
      heading = "Trim competing choices";
      hint = "The palette is overloaded. Remove repeated or conflicting traits for a cleaner result.";
    } else if (score >= 85) {
      heading = "Studio-ready direction";
      hint = "The prompt has clear style, movement, and production detail without obvious gaps.";
    } else if (score >= 65) {
      heading = "Strong working prompt";
      hint = "This is ready to try. Fine-tune only the details that materially change the song.";
    }

    nodes.qualityHeading.textContent = heading;
    nodes.qualityHint.textContent = hint;
  }

  function renderExclude() {
    const value = state.exclude.trim();
    nodes.excludePreview.textContent = value
      ? compact(value, 220)
      : "Nothing excluded yet.";
    nodes.copyExcludeBtn.disabled = !value;
  }

  async function copyText(value, success) {
    const text = String(value || "").trim();
    if (!text) {
      toast("There is nothing to copy yet.");
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const box = document.createElement("textarea");
      box.value = text;
      box.setAttribute("readonly", "");
      box.style.position = "fixed";
      box.style.opacity = "0";
      document.body.appendChild(box);
      box.select();
      document.execCommand("copy");
      box.remove();
    }

    toast(success);
    return true;
  }

  function makeId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function addHistory() {
    if (!state.output) return;
    const item = {
      id: makeId(),
      at: Date.now(),
      prompt: state.output,
      state: snapshot()
    };
    promptHistory = promptHistory.filter(entry => entry?.prompt !== item.prompt);
    promptHistory.unshift(item);
    promptHistory = promptHistory.slice(0, 30);
    saveJson(HISTORY_KEY, promptHistory);
    renderSaved();
  }

  function savePreset() {
    pullControls();
    const name = nodes.presetNameInput.value.trim() || `Preset ${presets.length + 1}`;
    presets.unshift({
      id: makeId(),
      name: compact(name, 70),
      at: Date.now(),
      state: snapshot()
    });
    presets = presets.slice(0, 50);
    saveJson(PRESET_KEY, presets);
    nodes.presetNameInput.value = "";
    renderSaved();
    toast("Preset saved");
  }

  function loadSnapshot(value) {
    state = normalizeState(value);
    outputDirty = !state.output;
    syncControls();
    renderSelected();
    refreshCategoryButtons();
    refreshCategoryCounts();
    renderCount();
    renderExclude();
    renderQuality();
    updateStepSummaries();
    setStep(state.activeStep || "brief", {
      scroll: true,
      forge: false
    });
    markDirty();
    toast("Saved project loaded");
  }

  function renderSaved() {
    const buildItem = (title, subtitle, onLoad, onDelete) => {
      const item = document.createElement("div");
      const copy = document.createElement("div");
      const strong = document.createElement("strong");
      const small = document.createElement("small");
      const actions = document.createElement("div");
      const load = document.createElement("button");
      const remove = document.createElement("button");

      item.className = "saved-item";
      copy.className = "saved-item-copy";
      actions.className = "saved-item-actions";
      strong.textContent = title;
      small.textContent = subtitle;
      load.type = "button";
      load.textContent = "Load";
      load.addEventListener("click", onLoad);
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", onDelete);
      copy.append(strong, small);
      actions.append(load, remove);
      item.append(copy, actions);
      return item;
    };

    nodes.presetList.replaceChildren();
    presets.forEach(preset => {
      if (!preset?.state) return;
      nodes.presetList.appendChild(buildItem(
        String(preset.name || "Saved preset"),
        String(preset.state.output || preset.state.brief || "Saved prompt preset"),
        () => loadSnapshot(preset.state),
        () => {
          presets = presets.filter(item => item.id !== preset.id);
          saveJson(PRESET_KEY, presets);
          renderSaved();
          toast("Preset deleted");
        }
      ));
    });

    nodes.historyList.replaceChildren();
    promptHistory.forEach(entry => {
      if (!entry?.state || !entry?.prompt) return;
      const date = Number.isFinite(Number(entry.at))
        ? new Date(Number(entry.at)).toLocaleString()
        : "Recent prompt";
      nodes.historyList.appendChild(buildItem(
        date,
        String(entry.prompt),
        () => loadSnapshot(entry.state),
        () => {
          promptHistory = promptHistory.filter(item => item.id !== entry.id);
          saveJson(HISTORY_KEY, promptHistory);
          renderSaved();
          toast("History item deleted");
        }
      ));
    });

    nodes.savedCount.textContent = String(presets.length + promptHistory.length);
  }

  function exportBackup() {
    const payload = {
      app: "The Simplest Prompt Builder",
      version: 3,
      exportedAt: new Date().toISOString(),
      current: snapshot(),
      presets,
      history: promptHistory
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `simplest-prompt-builder-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1200);
  }

  async function importBackup(file) {
    if (!file || file.size > 2_000_000) {
      toast("Choose a Simplest Prompt Builder backup smaller than 2 MB.");
      return;
    }

    try {
      const payload = JSON.parse(await file.text());
      if (!payload || typeof payload !== "object") throw new Error("Invalid backup");
      if (payload.current) loadSnapshot(payload.current);
      if (Array.isArray(payload.presets)) {
        presets = payload.presets.filter(item => item?.state).slice(0, 50);
      }
      if (Array.isArray(payload.history)) {
        promptHistory = payload.history.filter(item => item?.state && item?.prompt).slice(0, 30);
      }
      saveJson(PRESET_KEY, presets);
      saveJson(HISTORY_KEY, promptHistory);
      renderSaved();
      toast("Backup imported");
    } catch {
      toast("That backup could not be read.");
    }
  }

  async function refineWithAi() {
    if (outputDirty || !state.output) forgePrompt({ addHistory: false, announce: false });
    const prompt = String(state.output || "").trim();
    if (!prompt) {
      toast("Build a prompt first.");
      return;
    }

    nodes.aiRefineBtn.disabled = true;
    nodes.aiStatus.textContent = "Refining the production prompt…";
    try {
      const response = await fetch("/api/refine-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          direction: nodes.aiDirectionInput.value.trim(),
          limit: state.outputFormat === "short"
            ? SHORT_PROMPT_TARGET
            : Number(state.limit) || 0,
          format: state.outputFormat
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Prompt AI failed (${response.status}).`);
      const refined = String(data?.prompt || "").trim();
      if (!refined) throw new Error("Prompt AI returned an empty result.");
      state.output = refined;
      nodes.promptOutput.value = refined;
      outputDirty = false;
      renderCount();
      addHistory();
      markDirty();
      nodes.aiStatus.textContent = "Refined prompt applied. Review it before copying.";
      toast("Prompt refined");
    } catch (error) {
      nodes.aiStatus.textContent = error?.message || "Prompt AI is unavailable. The local generator still works.";
      toast("Prompt AI unavailable");
    } finally {
      nodes.aiRefineBtn.disabled = false;
    }
  }

  function pullControls() {
    if (!nodes.briefInput) return;
    state.brief = nodes.briefInput.value.trim();
    state.bpm = clampNumber(nodes.bpmRange.value, 50, 220, 120);
    state.energy = nodes.energySelect.value;
    state.length = nodes.lengthSelect.value;
    state.key = nodes.keySelect.value;
    state.mode = nodes.modeSelect.value;
    state.meter = nodes.meterSelect.value;
    state.vocalPlan = nodes.vocalPlanSelect.value;
    state.structure = nodes.structureInput.value.trim();
    state.production = nodes.productionInput.value.trim();
    state.exclude = nodes.excludeInput.value.trim();
    state.limit = Number(nodes.limitSelect.value) || 0;
    state.outputFormat = document.querySelector('input[name="outputFormat"]:checked')?.value || "forge";
    state.promptMode = document.querySelector('input[name="promptMode"]:checked')?.value || "balanced";
  }

  function syncControls() {
    nodes.briefInput.value = state.brief;
    nodes.briefCount.textContent = `${state.brief.length} / 1200`;
    nodes.bpmRange.value = String(state.bpm);
    nodes.bpmOutput.textContent = `${state.bpm} BPM`;
    nodes.energySelect.value = state.energy;
    nodes.lengthSelect.value = state.length;
    nodes.keySelect.value = state.key;
    nodes.modeSelect.value = state.mode;
    nodes.meterSelect.value = state.meter;
    nodes.vocalPlanSelect.value = state.vocalPlan;
    nodes.structureInput.value = state.structure;
    nodes.productionInput.value = state.production;
    nodes.excludeInput.value = state.exclude;
    nodes.limitSelect.value = String(state.limit);
    const formatInput = document.querySelector(`input[name="outputFormat"][value="${CSS.escape(state.outputFormat)}"]`);
    if (formatInput) formatInput.checked = true;
    const modeInput = document.querySelector(`input[name="promptMode"][value="${CSS.escape(state.promptMode)}"]`);
    if (modeInput) modeInput.checked = true;
    nodes.promptOutput.value = state.output;
  }

  function bindStateControl(node, key, transform = value => value) {
    node.addEventListener("input", () => {
      state[key] = transform(node.value);
      if (key === "bpm") nodes.bpmOutput.textContent = `${state.bpm} BPM`;
      if (key === "brief") nodes.briefCount.textContent = `${node.value.length} / 1200`;
      markOutputDirty();
      renderExclude();
      renderQuality();
      updateStepSummaries();
      markDirty();
    });
  }

  function resetProject() {
    state = clone(DEFAULT_STATE);
    outputDirty = true;
    nodes.tagSearch.value = "";
    nodes.searchResults.hidden = true;
    syncControls();
    renderSelected();
    refreshCategoryButtons();
    refreshCategoryCounts();
    renderCount();
    renderExclude();
    renderQuality();
    updateStepSummaries();
    setStep("brief", { scroll: true, forge: false });
    markDirty();
    toast("New prompt ready");
  }

  function cacheNodes() {
    [
      "workspace", "saveState", "installBtn", "newProjectBtn", "summaryBrief", "summarySound",
      "summaryShape", "summaryExport", "briefInput", "briefCount", "clearBriefBtn", "recipeSelect", "recipeRow",
      "selectedCount", "tagSearch", "libraryStats", "searchResults", "selectedTags", "selectionGuidance",
      "clearTagsBtn", "paletteLabel", "paletteBar", "quickPickGrid", "categoryJump",
      "categoryList", "bpmOutput", "bpmRange", "energySelect", "lengthSelect", "keySelect",
      "modeSelect", "meterSelect", "vocalPlanSelect", "structureInput", "structurePresets",
      "productionInput", "excludeInput", "limitSelect", "outputFormatControl", "formatHint",
      "promptModeControl", "outputCard", "promptCount",
      "outputModeBadge", "promptOutput", "forgeBtn", "copyBtn", "copyExcludeBtn",
      "excludePreview", "shareBtn", "outputStatus", "qualityScore", "qualityHeading",
      "qualityHint", "savedWork", "savedCount", "presetNameInput", "savePresetBtn",
      "savePresetFooterBtn", "exportBackupBtn", "importBackupInput", "presetList",
      "historyList", "aiAssist", "aiDirectionInput", "aiRefineBtn", "aiStatus",
      "resetDialog", "confirmResetBtn", "toast"
    ].forEach(id => nodes[id] = document.getElementById(id));
    nodes.workspaceMain = document.querySelector(".workspace-main");
  }

  function initKeys() {
    const keys = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
    nodes.keySelect.replaceChildren();
    keys.forEach(key => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = key;
      nodes.keySelect.appendChild(option);
    });
  }

  function bindEvents() {
    document.querySelectorAll("[data-step]").forEach(button => {
      button.addEventListener("click", () => setStep(button.dataset.step));
      button.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const current = STEP_ORDER.indexOf(button.dataset.step);
        const index = event.key === "Home"
          ? 0
          : event.key === "End"
            ? STEP_ORDER.length - 1
            : (current + (event.key === "ArrowRight" ? 1 : -1) + STEP_ORDER.length) % STEP_ORDER.length;
        document.querySelector(`[data-step="${STEP_ORDER[index]}"]`)?.focus();
        setStep(STEP_ORDER[index]);
      });
    });

    document.querySelectorAll("[data-go]").forEach(button => {
      button.addEventListener("click", () => setStep(button.dataset.go));
    });

    bindStateControl(nodes.briefInput, "brief");
    bindStateControl(nodes.bpmRange, "bpm", value => clampNumber(value, 50, 220, 120));
    bindStateControl(nodes.energySelect, "energy");
    bindStateControl(nodes.lengthSelect, "length");
    bindStateControl(nodes.keySelect, "key");
    bindStateControl(nodes.modeSelect, "mode");
    bindStateControl(nodes.meterSelect, "meter");
    bindStateControl(nodes.vocalPlanSelect, "vocalPlan");
    bindStateControl(nodes.structureInput, "structure");
    bindStateControl(nodes.productionInput, "production");
    bindStateControl(nodes.excludeInput, "exclude");
    bindStateControl(nodes.limitSelect, "limit", value => Number(value) || 0);

    document.querySelectorAll('input[name="outputFormat"]').forEach(input => {
      input.addEventListener("change", () => {
        state.outputFormat = input.value;
        markOutputDirty();
        renderCount();
        markDirty();
      });
    });

    document.querySelectorAll('input[name="promptMode"]').forEach(input => {
      input.addEventListener("change", () => {
        state.promptMode = input.value;
        markOutputDirty();
        renderCount();
        markDirty();
      });
    });

    nodes.tagSearch.addEventListener("input", renderSearch);
    nodes.tagSearch.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        nodes.tagSearch.value = "";
        renderSearch();
      }
    });

    nodes.recipeSelect.addEventListener("change", () => {
      if (nodes.recipeSelect.value === "") return;
      const recipe = RECIPES[Number(nodes.recipeSelect.value)];
      if (recipe) applyRecipe(recipe);
    });

    nodes.clearBriefBtn.addEventListener("click", () => {
      state.brief = "";
      nodes.briefInput.value = "";
      nodes.briefCount.textContent = "0 / 1200";
      markOutputDirty();
      renderQuality();
      updateStepSummaries();
      markDirty();
      nodes.briefInput.focus();
    });

    nodes.clearTagsBtn.addEventListener("click", () => {
      if (!state.selected.length) return;
      state.selected = [];
      afterTagChange();
      toast("Sound palette cleared");
    });

    nodes.categoryJump.addEventListener("change", () => {
      const details = document.getElementById(nodes.categoryJump.value);
      if (!details) return;
      details.open = true;
      const tags = categories()[details.dataset.category] || [];
      fillCategory(details, Array.isArray(tags) ? tags : []);
      details.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
      nodes.categoryJump.value = "";
    });

    nodes.forgeBtn.addEventListener("click", () => forgePrompt({ addHistory: true }));
    nodes.promptOutput.addEventListener("input", () => {
      state.output = nodes.promptOutput.value;
      outputDirty = false;
      nodes.outputStatus.textContent = "Manual edits saved on this device.";
      renderCount();
      updateStepSummaries();
      markDirty();
    });

    nodes.copyBtn.addEventListener("click", async () => {
      if (!state.output) forgePrompt({ addHistory: false, announce: false });
      const copied = await copyText(nodes.promptOutput.value, "Style prompt copied");
      if (copied) addHistory();
    });

    nodes.copyExcludeBtn.addEventListener("click", () => {
      copyText(nodes.excludeInput.value, "Exclusions copied");
    });

    nodes.shareBtn.addEventListener("click", async () => {
      if (!state.output) forgePrompt({ addHistory: false, announce: false });
      if (!state.output) return;
      if (navigator.share) {
        try {
          await navigator.share({
            title: "The Simplest Prompt Builder prompt",
            text: state.output
          });
          addHistory();
        } catch (error) {
          if (error?.name !== "AbortError") toast("Sharing is unavailable.");
        }
      } else {
        const copied = await copyText(state.output, "Prompt copied for sharing");
        if (copied) addHistory();
      }
    });

    nodes.savePresetBtn.addEventListener("click", savePreset);
    nodes.savePresetFooterBtn.addEventListener("click", savePreset);
    nodes.exportBackupBtn.addEventListener("click", exportBackup);
    nodes.importBackupInput.addEventListener("change", () => {
      const file = nodes.importBackupInput.files?.[0];
      if (file) importBackup(file);
      nodes.importBackupInput.value = "";
    });

    nodes.newProjectBtn.addEventListener("click", () => {
      if (typeof nodes.resetDialog.showModal === "function") {
        nodes.resetDialog.showModal();
      } else if (window.confirm("Start a new prompt and clear the current project?")) {
        resetProject();
      }
    });

    nodes.confirmResetBtn.addEventListener("click", event => {
      event.preventDefault();
      resetProject();
      nodes.resetDialog.close?.();
    });
    nodes.aiRefineBtn.addEventListener("click", refineWithAi);

    nodes.installBtn.addEventListener("click", async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      nodes.installBtn.hidden = true;
    });

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      installPrompt = event;
      nodes.installBtn.hidden = false;
    });

    window.addEventListener("hashchange", () => {
      const step = location.hash.slice(1);
      if (STEP_ORDER.includes(step) && step !== state.activeStep) {
        setStep(step, { history: false });
      }
    });

    document.addEventListener("keydown", event => {
      const target = event.target;
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;

      if (event.key === "/" && !isTyping && state.activeStep === "sound") {
        event.preventDefault();
        nodes.tagSearch.focus();
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        const current = STEP_ORDER.indexOf(state.activeStep);
        if (state.activeStep === "export") {
          forgePrompt({ addHistory: true });
        } else {
          setStep(STEP_ORDER[Math.min(current + 1, STEP_ORDER.length - 1)]);
        }
      }
    });
  }

  function init() {
    cacheNodes();
    buildCategoryIndex();
    initKeys();
    renderRecipes();
    renderQuickPicks();
    renderStructures();
    renderCategories();
    syncControls();
    renderSelected();
    refreshCategoryButtons();
    refreshCategoryCounts();
    renderSaved();
    renderCount();
    renderExclude();
    renderQuality();
    updateStepSummaries();
    bindEvents();

    const hashStep = location.hash.slice(1);
    const initialStep = STEP_ORDER.includes(hashStep) ? hashStep : state.activeStep;
    setStep(initialStep, {
      scroll: false,
      forge: false,
      history: false
    });

    if ("serviceWorker" in navigator) {
      window.addEventListener(
        "load",
        () => navigator.serviceWorker.register("/sw.js").catch(() => {}),
        { once: true }
      );
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
