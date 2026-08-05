"use strict";

(() => {
  const STORAGE_KEY = "forgePromptGeneratorV2";
  const HISTORY_KEY = "forgePromptHistoryV2";
  const PRESET_KEY = "forgePromptPresetsV2";
  const MAX_SELECTED = 100;

  const RECIPES = [
    {
      name: "Dark Appalachian",
      brief: "Dark Appalachian folk about finally leaving, intimate weathered vocal, restrained verses, and a defiant final chorus.",
      tags: ["Appalachian Folk","Dark Folk","Banjo","Fiddle","Upright Bass","Raspy Vocals","Haunting","Defiant"],
      bpm: 82, energy: "medium", key: "D", mode: "minor",
      production: "Dry close-mic vocal, sparse verses, natural room sound, heavier live drums and stacked harmony only in the final chorus."
    },
    {
      name: "Raw Grunge",
      brief: "Unpolished alternative rock with tense verses and a violent emotional release in the chorus.",
      tags: ["Grunge","Alternative Rock","Distorted Guitar","Bass Guitar","Live Drums","Raw Vocals","Gritty","Angry"],
      bpm: 112, energy: "high", key: "E", mode: "minor",
      production: "Loose live-band feel, dirty guitar layers, audible pick attack, restrained verse mix, wide explosive chorus without glossy polish."
    },
    {
      name: "Cinematic Fallout",
      brief: "A dark cinematic track that starts almost empty and becomes enormous without turning into trailer-music cliché.",
      tags: ["Film Score","Cinematic Rock","String Ensemble","Toms","Piano","Apocalyptic","Powerful","Haunting"],
      bpm: 76, energy: "explosive", key: "C", mode: "minor",
      production: "Slow dynamic escalation, low strings and piano first, percussion enters late, final section reaches full scale then cuts to a bare ending."
    },
    {
      name: "Soul Pressure",
      brief: "Modern soul with a tight pocket, restrained confidence, and a vocal that sounds close enough to touch.",
      tags: ["Neo-Soul","Alternative R&B","Rhodes","Bass Guitar","Live Drums","Soulful Vocals","Intimate","Confident"],
      bpm: 92, energy: "medium", key: "F", mode: "minor",
      production: "Warm bass-forward mix, human drum timing, Rhodes chords with space, intimate lead vocal, selective harmony stacks on the hook."
    },
    {
      name: "Outlaw Drive",
      brief: "Hard-driving outlaw country with grit, momentum, and no polished radio-country sheen.",
      tags: ["Outlaw Country","Country Rock","Electric Guitar","Pedal Steel","Bass Guitar","Live Drums","Raspy Vocals","Reckless"],
      bpm: 126, energy: "high", key: "A", mode: "mixolydian",
      production: "Live room character, sharp snare, overdriven rhythm guitar, short pedal-steel answers, rough lead vocal and a big gang-vocal final hook."
    },
    {
      name: "Cold Post-Punk",
      brief: "Minimal post-punk with a nervous pulse, detached vocal, and an atmosphere that never fully opens up.",
      tags: ["Post-Punk","New Wave","Bass Guitar","Clean Electric Guitar","Analog Synth","Detached Delivery","Cold","Tense"],
      bpm: 132, energy: "medium", key: "B", mode: "minor",
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
    output: "",
    activeStep: "brief"
  });

  const nodes = {};
  let state = { ...DEFAULT_STATE, ...loadJson(STORAGE_KEY, {}) };
  state.selected = Array.isArray(state.selected) ? [...new Set(state.selected)].slice(0, MAX_SELECTED) : [];
  let history = loadJson(HISTORY_KEY, []);
  let presets = loadJson(PRESET_KEY, []);
  let saveTimer = 0;
  let categoryIndex = null;
  let lastCompile = { text: "", includedTags: 0, totalTags: 0, truncated: false };

  function clone(value) {
    return typeof structuredClone === "function"
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function loadJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? clone(fallback);
    } catch {
      return clone(fallback);
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the generator usable even if storage is unavailable.
    }
  }

  function toast(message) {
    nodes.toast.textContent = message;
    nodes.toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => nodes.toast.classList.remove("show"), 1900);
  }

  function markDirty() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => saveJson(STORAGE_KEY, state), 140);
  }

  function categories() {
    return typeof DATA !== "undefined" && DATA?.categories ? DATA.categories : {};
  }

  function buildCategoryIndex() {
    categoryIndex = new Map();
    Object.entries(categories()).forEach(([category, tags]) => {
      (Array.isArray(tags) ? tags : []).forEach(tag => categoryIndex.set(tag, category));
    });
  }

  function allTags() {
    return [...categoryIndex.entries()].map(([tag, category]) => ({ tag, category }));
  }

  function categoryFor(tag) {
    return categoryIndex.get(tag) || "Style";
  }

  function unique(items) {
    return [...new Set(items.filter(Boolean))];
  }

  function sentence(value) {
    const clean = String(value || "").trim().replace(/\s+/g, " ");
    if (!clean) return "";
    return /[.!?]$/.test(clean) ? clean : `${clean}.`;
  }

  function compact(value, maximum) {
    const clean = String(value || "").trim().replace(/\s+/g, " ");
    if (!maximum || clean.length <= maximum) return clean;
    const cut = clean.slice(0, Math.max(0, maximum - 1));
    const breakAt = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "), cut.lastIndexOf(", "), cut.lastIndexOf(" "));
    return `${(breakAt > maximum * 0.65 ? cut.slice(0, breakAt) : cut).trim()}…`;
  }

  function setStep(step, options = {}) {
    const allowed = new Set(["brief", "sound", "shape", "export"]);
    const next = allowed.has(step) ? step : "brief";
    state.activeStep = next;

    document.querySelectorAll(".mode-tab").forEach(button => {
      const active = button.dataset.step === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".step-panel").forEach(panel => {
      const active = panel.dataset.panel === next;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    });

    markDirty();
    if (options.scroll !== false) {
      document.querySelector(".mode-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (next === "export" && options.forge !== false) forgePrompt({ scroll: false });
  }

  function renderRecipes() {
    nodes.recipeRow.replaceChildren();
    RECIPES.forEach(recipe => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = recipe.name;
      button.addEventListener("click", () => applyRecipe(recipe));
      nodes.recipeRow.appendChild(button);
    });
  }

  function applyRecipe(recipe) {
    state.brief = recipe.brief;
    state.selected = unique(recipe.tags).slice(0, MAX_SELECTED);
    state.bpm = recipe.bpm;
    state.energy = recipe.energy;
    state.key = recipe.key;
    state.mode = recipe.mode;
    state.production = recipe.production;
    state.output = "";
    syncControls();
    renderSelected();
    refreshCategoryCounts();
    markDirty();
    toast(`${recipe.name} loaded`);
  }

  function addTag(tag) {
    if (!tag || state.selected.includes(tag)) return;
    if (state.selected.length >= MAX_SELECTED) {
      toast(`Forge allows up to ${MAX_SELECTED} selected options.`);
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
    renderSelected();
    renderSearch();
    refreshCategoryButtons();
    refreshCategoryCounts();
    refreshOutput();
    markDirty();
  }

  function renderSelected() {
    nodes.selectedTags.replaceChildren();
    state.selected.forEach(tag => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `${tag} ×`;
      button.title = `Remove ${tag}`;
      button.addEventListener("click", () => removeTag(tag));
      nodes.selectedTags.appendChild(button);
    });
    nodes.selectedCount.textContent = `${state.selected.length} selected`;
  }

  function renderSearch() {
    const query = nodes.tagSearch.value.trim().toLowerCase();
    nodes.searchResults.replaceChildren();
    if (!query) {
      nodes.searchResults.hidden = true;
      return;
    }

    const matches = allTags()
      .filter(({ tag, category }) =>
        tag.toLowerCase().includes(query) || category.toLowerCase().includes(query)
      )
      .slice(0, 100);

    matches.forEach(({ tag, category }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.classList.toggle("active", state.selected.includes(tag));
      const label = document.createElement("span");
      label.textContent = state.selected.includes(tag) ? `✓ ${tag}` : tag;
      const detail = document.createElement("small");
      detail.textContent = category;
      button.append(label, detail);
      button.addEventListener("click", () => toggleTag(tag));
      nodes.searchResults.appendChild(button);
    });

    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "helper-text";
      empty.textContent = "No matching sound options.";
      nodes.searchResults.appendChild(empty);
    }
    nodes.searchResults.hidden = false;
  }

  function makeTagButton(tag) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.tag = tag;
    button.textContent = tag;
    button.classList.toggle("active", state.selected.includes(tag));
    button.addEventListener("click", () => toggleTag(tag));
    return button;
  }

  function fillCategory(details, tags) {
    let grid = details.querySelector(".category-grid");
    if (grid) return;
    grid = document.createElement("div");
    grid.className = "category-grid";
    tags.forEach(tag => grid.appendChild(makeTagButton(tag)));
    details.appendChild(grid);
  }

  function renderCategories() {
    nodes.categoryList.replaceChildren();
    Object.entries(categories()).forEach(([category, tags], index) => {
      const list = Array.isArray(tags) ? tags : [];
      const details = document.createElement("details");
      details.className = "category";
      details.dataset.category = category;

      const summary = document.createElement("summary");
      const title = document.createElement("span");
      title.textContent = category;
      const count = document.createElement("span");
      count.className = "category-count";
      count.dataset.categoryCount = category;
      summary.append(title, count);
      details.appendChild(summary);

      if (index < 2) {
        details.open = true;
        fillCategory(details, list);
      }
      details.addEventListener("toggle", () => {
        if (details.open) fillCategory(details, list);
      });
      nodes.categoryList.appendChild(details);
    });
    refreshCategoryCounts();
  }

  function refreshCategoryButtons() {
    nodes.categoryList.querySelectorAll("[data-tag]").forEach(button => {
      button.classList.toggle("active", state.selected.includes(button.dataset.tag));
    });
  }

  function refreshCategoryCounts() {
    Object.entries(categories()).forEach(([category, tags]) => {
      const count = (Array.isArray(tags) ? tags : []).filter(tag => state.selected.includes(tag)).length;
      const node = nodes.categoryList.querySelector(`[data-category-count="${CSS.escape(category)}"]`);
      if (node) node.textContent = `${tags.length} options${count ? ` · ${count} selected` : ""}`;
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
        refreshOutput();
        markDirty();
      });
      nodes.structurePresets.appendChild(button);
    });
  }

  function groupSelected() {
    const grouped = new Map();
    state.selected.forEach(tag => {
      const category = categoryFor(tag);
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category).push(tag);
    });
    return grouped;
  }

  function labelForCategory(category) {
    const labels = {
      Genre: "Style",
      Mood: "Mood",
      Instruments: "Instruments",
      Vocals: "Vocals",
      "Vocal Delivery": "Delivery",
      "Vocal Range & Register": "Register",
      "Vocal Arrangement": "Vocal arrangement",
      Choir: "Choir",
      Rhythm: "Rhythm",
      Percussion: "Percussion",
      Production: "Production",
      Arrangement: "Arrangement",
      Texture: "Texture",
      Effects: "Effects"
    };
    return labels[category] || category;
  }

  function compilePrompt() {
    pullControls();
    const limit = Number(state.limit) || 0;
    const grouped = groupSelected();
    const segments = [];
    const included = new Set();

    const addCategory = (category, maxItems = Infinity) => {
      const values = grouped.get(category) || [];
      if (!values.length) return;
      const used = values.slice(0, maxItems);
      used.forEach(tag => included.add(tag));
      segments.push(`${labelForCategory(category)}: ${used.join(", ")}`);
    };

    addCategory("Genre");
    addCategory("Mood");
    if (state.brief) segments.push(`Direction: ${compact(state.brief, limit ? 240 : 600)}`);
    segments.push(`Track: ${state.bpm} BPM, ${state.key} ${state.mode}, ${state.meter}, ${state.energy} energy, ${state.length} length`);

    if (state.vocalPlan === "instrumental") {
      segments.push("Vocals: instrumental, no lead or backing vocals");
    } else if (state.vocalPlan !== "follow selected vocal tags") {
      segments.push(`Vocal plan: ${state.vocalPlan}`);
    }

    [
      "Vocals", "Vocal Delivery", "Vocal Range & Register", "Vocal Arrangement", "Choir",
      "Instruments", "Rhythm", "Percussion", "Production", "Arrangement", "Texture", "Effects"
    ].forEach(category => addCategory(category));

    [...grouped.keys()]
      .filter(category => ![
        "Genre","Mood","Vocals","Vocal Delivery","Vocal Range & Register","Vocal Arrangement",
        "Choir","Instruments","Rhythm","Percussion","Production","Arrangement","Texture","Effects"
      ].includes(category))
      .forEach(category => addCategory(category));

    if (state.structure) segments.push(`Structure: ${compact(state.structure, limit ? 190 : 500)}`);
    if (state.production) segments.push(`Production direction: ${compact(state.production, limit ? 260 : 900)}`);
    if (state.exclude) segments.push(`Avoid: ${compact(state.exclude, limit ? 180 : 600)}`);

    let text = segments.map(sentence).join(" ");
    let truncated = false;

    if (limit && text.length > limit) {
      const optionalPrefixes = ["Production direction:", "Structure:", "Direction:"];
      let working = [...segments];
      for (const prefix of optionalPrefixes) {
        if (working.map(sentence).join(" ").length <= limit) break;
        const index = working.findIndex(segment => segment.startsWith(prefix));
        if (index >= 0) {
          const current = working[index];
          const target = prefix === "Direction:" ? 150 : prefix === "Production direction:" ? 170 : 125;
          working[index] = `${prefix} ${compact(current.slice(prefix.length), target)}`;
        }
      }
      text = working.map(sentence).join(" ");

      if (text.length > limit) {
        const hard = text.slice(0, Math.max(0, limit - 1)).trimEnd();
        const breakAt = Math.max(hard.lastIndexOf(". "), hard.lastIndexOf("; "), hard.lastIndexOf(", "), hard.lastIndexOf(" "));
        text = `${(breakAt > limit * 0.7 ? hard.slice(0, breakAt) : hard).trim()}…`;
        truncated = true;
      }
    }

    lastCompile = {
      text,
      includedTags: included.size,
      totalTags: state.selected.length,
      truncated
    };
    return text;
  }

  function forgePrompt(options = {}) {
    state.output = compilePrompt();
    nodes.promptOutput.value = state.output;
    renderCount();
    markDirty();

    if (state.output) {
      addHistory();
      const tagStatus = lastCompile.totalTags
        ? `${lastCompile.includedTags} selected sound options represented`
        : "No sound options selected";
      nodes.outputStatus.textContent = lastCompile.truncated
        ? `Prompt reached the character limit. ${tagStatus}; review the ending before copying.`
        : `Prompt forged locally. ${tagStatus}.`;
    } else {
      nodes.outputStatus.textContent = "Add a brief or sound options first.";
    }

    if (options.scroll !== false) nodes.outputCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function refreshOutput() {
    if (!state.output) return;
    state.output = compilePrompt();
    nodes.promptOutput.value = state.output;
    renderCount();
  }

  function renderCount() {
    const limit = Number(state.limit) || 0;
    const length = state.output.length;
    nodes.promptCount.textContent = limit ? `${length} / ${limit}` : `${length} characters`;
    nodes.promptCount.style.borderColor = limit && length >= limit ? "var(--danger)" : "";
  }

  async function copyText(value, success) {
    const text = String(value || "").trim();
    if (!text) {
      toast("There is nothing to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const box = document.createElement("textarea");
      box.value = text;
      document.body.appendChild(box);
      box.select();
      document.execCommand("copy");
      box.remove();
    }
    toast(success);
  }

  function makeId() {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
      output: state.output,
      activeStep: state.activeStep
    };
  }

  function addHistory() {
    if (!state.output) return;
    const item = { id: makeId(), at: Date.now(), prompt: state.output, state: snapshot() };
    history = history.filter(entry => entry.prompt !== item.prompt);
    history.unshift(item);
    history = history.slice(0, 30);
    saveJson(HISTORY_KEY, history);
    renderSaved();
  }

  function savePreset() {
    pullControls();
    const name = nodes.presetNameInput.value.trim() || `Preset ${presets.length + 1}`;
    presets.unshift({ id: makeId(), name, at: Date.now(), state: snapshot() });
    presets = presets.slice(0, 50);
    saveJson(PRESET_KEY, presets);
    nodes.presetNameInput.value = "";
    renderSaved();
    toast("Preset saved");
  }

  function loadSnapshot(value) {
    state = {
      ...DEFAULT_STATE,
      ...(value || {}),
      selected: Array.isArray(value?.selected) ? unique(value.selected).slice(0, MAX_SELECTED) : []
    };
    syncControls();
    renderSelected();
    refreshCategoryButtons();
    refreshCategoryCounts();
    renderCount();
    setStep(state.activeStep || "brief", { scroll: false, forge: false });
    markDirty();
    toast("Loaded");
  }

  function renderSaved() {
    const buildItem = (title, subtitle, onLoad, onDelete) => {
      const item = document.createElement("div");
      item.className = "saved-item";
      const strong = document.createElement("strong");
      strong.textContent = title;
      const small = document.createElement("small");
      small.textContent = subtitle;
      const actions = document.createElement("div");
      actions.className = "saved-item-actions";
      const load = document.createElement("button");
      load.type = "button";
      load.textContent = "Load";
      load.addEventListener("click", onLoad);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", onDelete);
      actions.append(load, remove);
      item.append(strong, small, actions);
      return item;
    };

    nodes.presetList.replaceChildren();
    presets.forEach(preset => {
      nodes.presetList.appendChild(buildItem(
        preset.name,
        preset.state?.output || preset.state?.brief || "Saved Forge preset",
        () => loadSnapshot(preset.state),
        () => {
          presets = presets.filter(item => item.id !== preset.id);
          saveJson(PRESET_KEY, presets);
          renderSaved();
        }
      ));
    });
    if (!presets.length) nodes.presetList.textContent = "No presets saved.";

    nodes.historyList.replaceChildren();
    history.forEach(entry => {
      nodes.historyList.appendChild(buildItem(
        new Date(entry.at).toLocaleString(),
        entry.prompt,
        () => loadSnapshot(entry.state),
        () => {
          history = history.filter(item => item.id !== entry.id);
          saveJson(HISTORY_KEY, history);
          renderSaved();
        }
      ));
    });
    if (!history.length) nodes.historyList.textContent = "No prompt history yet.";
    nodes.savedCount.textContent = String(presets.length + history.length);
  }

  function exportBackup() {
    const payload = {
      app: "Forge Studio Prompt Generator",
      version: 2,
      exportedAt: new Date().toISOString(),
      current: snapshot(),
      presets,
      history
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `forge-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function importBackup(file) {
    try {
      const payload = JSON.parse(await file.text());
      if (payload.current) loadSnapshot(payload.current);
      if (Array.isArray(payload.presets)) presets = payload.presets.slice(0, 50);
      if (Array.isArray(payload.history)) history = payload.history.slice(0, 30);
      saveJson(PRESET_KEY, presets);
      saveJson(HISTORY_KEY, history);
      renderSaved();
      toast("Backup imported");
    } catch {
      toast("That backup file could not be read.");
    }
  }

  async function refineWithAi() {
    if (!state.output) forgePrompt({ scroll: false });
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
          limit: Number(state.limit) || 0
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Prompt AI failed (${response.status}).`);
      const refined = String(data?.prompt || "").trim();
      if (!refined) throw new Error("Prompt AI returned an empty result.");
      state.output = refined;
      nodes.promptOutput.value = refined;
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
    state.brief = nodes.briefInput.value.trim();
    state.bpm = Number(nodes.bpmRange.value) || 120;
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
  }

  function syncControls() {
    nodes.briefInput.value = state.brief;
    nodes.bpmRange.value = state.bpm;
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
    nodes.promptOutput.value = state.output;
  }

  function bindStateControl(node, key, transform = value => value) {
    node.addEventListener("input", () => {
      state[key] = transform(node.value);
      if (key === "bpm") nodes.bpmOutput.textContent = `${state.bpm} BPM`;
      refreshOutput();
      markDirty();
    });
  }

  function resetProject() {
    if (!window.confirm("Start a new prompt and clear the current project? Saved presets and history will stay.")) return;
    state = clone(DEFAULT_STATE);
    syncControls();
    renderSelected();
    refreshCategoryButtons();
    refreshCategoryCounts();
    renderCount();
    setStep("brief", { scroll: true, forge: false });
    markDirty();
    toast("New project ready");
  }

  function cacheNodes() {
    [
      "toolsBtn","aiToolBtn","newProjectBtn","clearBriefBtn","briefInput","recipeRow",
      "selectedCount","tagSearch","searchResults","selectedTags","clearTagsBtn","categoryList",
      "bpmOutput","bpmRange","energySelect","lengthSelect","keySelect","modeSelect",
      "meterSelect","vocalPlanSelect","structureInput","structurePresets","productionInput",
      "excludeInput","limitSelect","outputCard","promptCount","promptOutput","forgeBtn",
      "copyBtn","copyExcludeBtn","shareBtn","savePresetBtn","outputStatus","savedWork",
      "savedCount","presetNameInput","exportBackupBtn","importBackupInput","presetList",
      "historyList","aiAssist","aiDirectionInput","aiRefineBtn","aiStatus","toast"
    ].forEach(id => nodes[id] = document.getElementById(id));
  }

  function initKeys() {
    const keys = ["C","C♯","D","E♭","E","F","F♯","G","A♭","A","B♭","B"];
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
    });
    document.querySelectorAll("[data-go]").forEach(button => {
      button.addEventListener("click", () => setStep(button.dataset.go));
    });

    bindStateControl(nodes.briefInput, "brief");
    bindStateControl(nodes.bpmRange, "bpm", value => Number(value));
    bindStateControl(nodes.energySelect, "energy");
    bindStateControl(nodes.lengthSelect, "length");
    bindStateControl(nodes.keySelect, "key");
    bindStateControl(nodes.modeSelect, "mode");
    bindStateControl(nodes.meterSelect, "meter");
    bindStateControl(nodes.vocalPlanSelect, "vocalPlan");
    bindStateControl(nodes.structureInput, "structure");
    bindStateControl(nodes.productionInput, "production");
    bindStateControl(nodes.excludeInput, "exclude");
    bindStateControl(nodes.limitSelect, "limit", value => Number(value));

    nodes.tagSearch.addEventListener("input", renderSearch);
    nodes.clearBriefBtn.addEventListener("click", () => {
      state.brief = "";
      nodes.briefInput.value = "";
      refreshOutput();
      markDirty();
    });
    nodes.clearTagsBtn.addEventListener("click", () => {
      state.selected = [];
      afterTagChange();
      toast("Sound options cleared");
    });
    nodes.forgeBtn.addEventListener("click", () => forgePrompt());
    nodes.copyBtn.addEventListener("click", () => copyText(nodes.promptOutput.value, "Prompt copied"));
    nodes.copyExcludeBtn.addEventListener("click", () => copyText(nodes.excludeInput.value, "Exclude list copied"));
    nodes.shareBtn.addEventListener("click", async () => {
      if (!state.output) forgePrompt({ scroll: false });
      if (navigator.share) {
        try {
          await navigator.share({ title: "Forge Studio Prompt", text: state.output });
        } catch {
          // User canceled.
        }
      } else {
        await copyText(state.output, "Prompt copied");
      }
    });
    nodes.savePresetBtn.addEventListener("click", savePreset);
    nodes.exportBackupBtn.addEventListener("click", exportBackup);
    nodes.importBackupInput.addEventListener("change", () => {
      const file = nodes.importBackupInput.files?.[0];
      if (file) importBackup(file);
      nodes.importBackupInput.value = "";
    });
    nodes.newProjectBtn.addEventListener("click", resetProject);
    nodes.toolsBtn.addEventListener("click", () => {
      setStep("export", { forge: false });
      nodes.savedWork.open = true;
      nodes.savedWork.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nodes.aiToolBtn.addEventListener("click", () => {
      setStep("export");
      nodes.aiAssist.open = true;
      nodes.aiAssist.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nodes.aiRefineBtn.addEventListener("click", refineWithAi);
  }

  function init() {
    cacheNodes();
    buildCategoryIndex();
    initKeys();
    renderRecipes();
    renderStructures();
    renderSelected();
    renderCategories();
    renderSaved();
    syncControls();
    renderCount();
    bindEvents();
    setStep(state.activeStep || "brief", { scroll: false, forge: false });

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}), { once: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
