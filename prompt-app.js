"use strict";

(() => {
  const STORAGE_KEY = "forgePromptGeneratorV1";
  const HISTORY_KEY = "forgePromptHistoryV1";
  const PRESET_KEY = "forgePromptPresetsV1";
  const MAX_SELECTED = 100;

  const RECIPES = [
    {
      name: "Dark Appalachian",
      brief: "Dark Appalachian folk with an intimate, weathered performance that grows into a defiant final chorus.",
      tags: ["Appalachian Folk","Dark Folk","Banjo","Fiddle","Upright Bass","Raspy Vocals","Haunting","Defiant"],
      bpm: 82, energy: "medium", key: "D", mode: "minor",
      production: "Dry close-mic vocal, sparse verses, natural room sound, heavier live drums and stacked harmony only in the final chorus."
    },
    {
      name: "Raw Grunge",
      brief: "Unpolished 1990s alternative rock with tense verses and a violent release in the chorus.",
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
    output: ""
  });

  let state = loadJson(STORAGE_KEY, DEFAULT_STATE);
  state = { ...DEFAULT_STATE, ...state, selected: Array.isArray(state.selected) ? state.selected.slice(0, MAX_SELECTED) : [] };
  let history = loadJson(HISTORY_KEY, []);
  let presets = loadJson(PRESET_KEY, []);
  let saveTimer = 0;
  const nodes = {};

  function clone(value) {
    return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
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
    localStorage.setItem(key, JSON.stringify(value));
  }

  function toast(message) {
    nodes.toast.textContent = message;
    nodes.toast.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => nodes.toast.classList.remove("show"), 1800);
  }

  function markDirty() {
    nodes.saveBadge.textContent = "Saving…";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveJson(STORAGE_KEY, state);
      nodes.saveBadge.textContent = "Saved";
    }, 180);
  }

  function allTags() {
    const categories = typeof DATA !== "undefined" && DATA?.categories ? DATA.categories : {};
    return Object.entries(categories).flatMap(([category, tags]) =>
      (Array.isArray(tags) ? tags : []).map(tag => ({ tag, category }))
    );
  }

  function categoryFor(tag) {
    const item = allTags().find(entry => entry.tag === tag);
    return item?.category || "Style";
  }

  function groupSelected() {
    const grouped = {};
    state.selected.forEach(tag => {
      const category = categoryFor(tag);
      (grouped[category] ||= []).push(tag);
    });
    return grouped;
  }

  function unique(items) {
    return [...new Set(items.filter(Boolean))];
  }

  function addTag(tag) {
    if (!tag || state.selected.includes(tag)) return;
    if (state.selected.length >= MAX_SELECTED) {
      toast(`Forge allows up to ${MAX_SELECTED} active sound choices.`);
      return;
    }
    state.selected.push(tag);
    renderSelected();
    renderCategories();
    renderSearch();
    refreshOutput();
    markDirty();
  }

  function removeTag(tag) {
    state.selected = state.selected.filter(item => item !== tag);
    renderSelected();
    renderCategories();
    renderSearch();
    refreshOutput();
    markDirty();
  }

  function toggleTag(tag) {
    state.selected.includes(tag) ? removeTag(tag) : addTag(tag);
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
    if (!query) {
      nodes.searchResults.hidden = true;
      nodes.searchResults.replaceChildren();
      return;
    }
    const matches = allTags()
      .filter(({ tag, category }) => tag.toLowerCase().includes(query) || category.toLowerCase().includes(query))
      .slice(0, 80);
    nodes.searchResults.replaceChildren();
    matches.forEach(({ tag, category }) => {
      const button = document.createElement("button");
      button.type = "button";
      const label = document.createElement("span");
      label.textContent = state.selected.includes(tag) ? `✓ ${tag}` : tag;
      const detail = document.createElement("small");
      detail.textContent = category;
      button.append(label, detail);
      button.addEventListener("click", () => toggleTag(tag));
      nodes.searchResults.appendChild(button);
    });
    if (!matches.length) {
      const empty = document.createElement("div");
      empty.className = "helper-text";
      empty.textContent = "No matching sound tags.";
      nodes.searchResults.appendChild(empty);
    }
    nodes.searchResults.hidden = false;
  }

  function renderCategories() {
    const openCategories = new Set(
      [...nodes.categoryList.querySelectorAll("details[open]")].map(item => item.dataset.category)
    );
    nodes.categoryList.replaceChildren();
    const categories = typeof DATA !== "undefined" && DATA?.categories ? DATA.categories : {};
    Object.entries(categories).forEach(([category, tags], index) => {
      const details = document.createElement("details");
      details.className = "category";
      details.dataset.category = category;
      if (openCategories.has(category) || (!openCategories.size && index === 0)) details.open = true;
      const summary = document.createElement("summary");
      const active = (tags || []).filter(tag => state.selected.includes(tag)).length;
      summary.textContent = `${category} · ${tags.length}${active ? ` · ${active} active` : ""}`;
      const grid = document.createElement("div");
      grid.className = "category-grid";
      tags.forEach(tag => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = tag;
        button.classList.toggle("active", state.selected.includes(tag));
        button.addEventListener("click", () => toggleTag(tag));
        grid.appendChild(button);
      });
      details.append(summary, grid);
      nodes.categoryList.appendChild(details);
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
    renderCategories();
    markDirty();
    forgePrompt();
    nodes.briefInput.scrollIntoView({ behavior: "smooth", block: "center" });
    toast(`${recipe.name} loaded`);
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

  function renderStructurePresets() {
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

  function titleCase(value) {
    return String(value || "").replace(/\b\w/g, match => match.toUpperCase());
  }

  function sentence(value) {
    const clean = String(value || "").trim().replace(/\s+/g, " ");
    if (!clean) return "";
    return /[.!?]$/.test(clean) ? clean : `${clean}.`;
  }

  function buildPromptParts() {
    const grouped = groupSelected();
    const genres = grouped.Genre || [];
    const moods = grouped.Mood || [];
    const instruments = grouped.Instruments || [];
    const vocals = unique([
      ...(grouped.Vocals || []),
      ...(grouped["Vocal Delivery"] || []),
      ...(grouped["Vocal Range & Register"] || []),
      ...(grouped["Vocal Arrangement"] || []),
      ...(grouped.Choir || [])
    ]);
    const rhythm = unique([...(grouped.Rhythm || []), ...(grouped.Percussion || [])]);
    const productionTags = unique([
      ...(grouped.Production || []),
      ...(grouped.Arrangement || []),
      ...(grouped.Texture || [])
    ]);
    const excludedCategories = new Set([
      "Genre","Mood","Instruments","Vocals","Vocal Delivery","Vocal Range & Register",
      "Vocal Arrangement","Choir","Rhythm","Percussion","Production","Arrangement","Texture"
    ]);
    const other = Object.entries(grouped)
      .filter(([category]) => !excludedCategories.has(category))
      .flatMap(([, tags]) => tags);

    const opening = [
      genres.length ? genres.slice(0, 5).join(", ") : "Distinctive original music",
      moods.length ? `with a ${moods.slice(0, 4).join(", ").toLowerCase()} character` : ""
    ].filter(Boolean).join(" ");

    const track = `${state.bpm} BPM, ${state.key} ${state.mode}, ${state.meter}, ${state.energy} energy, ${state.length} length.`;
    const vocalLine = state.vocalPlan === "instrumental"
      ? "Instrumental; no lead or backing vocals."
      : sentence([
          state.vocalPlan !== "follow selected vocal tags" ? titleCase(state.vocalPlan) : "",
          vocals.length ? vocals.join(", ") : ""
        ].filter(Boolean).join("; "));
    const soundLine = sentence([
      instruments.length ? `Core instruments: ${instruments.join(", ")}` : "",
      rhythm.length ? `Rhythm: ${rhythm.join(", ")}` : "",
      productionTags.length ? `Production character: ${productionTags.join(", ")}` : "",
      other.length ? `Additional color: ${other.join(", ")}` : ""
    ].filter(Boolean).join(". "));
    const arrangement = sentence(state.structure ? `Arrangement: ${state.structure}` : "");
    const production = sentence(state.production);
    const brief = sentence(state.brief);

    return [sentence(opening), brief, track, vocalLine, soundLine, arrangement, production].filter(Boolean);
  }

  function fitPrompt(parts, limit) {
    let result = parts.join(" ");
    if (!limit || result.length <= limit) return result;

    const working = [...parts];
    while (working.length > 4 && working.join(" ").length > limit) {
      working.splice(working.length - 2, 1);
    }
    result = working.join(" ");
    if (result.length <= limit) return result;

    const hard = result.slice(0, Math.max(0, limit - 1)).trimEnd();
    const lastBreak = Math.max(hard.lastIndexOf(". "), hard.lastIndexOf("; "), hard.lastIndexOf(", "));
    return `${(lastBreak > limit * 0.65 ? hard.slice(0, lastBreak + 1) : hard).trim()}…`;
  }

  function compilePrompt() {
    const limit = Number(state.limit) || 0;
    return fitPrompt(buildPromptParts(), limit);
  }

  function refreshOutput() {
    if (!state.output) return;
    pullControls();
    state.output = compilePrompt();
    nodes.promptOutput.value = state.output;
    renderCount();
  }

  function forgePrompt() {
    pullControls();
    state.output = compilePrompt();
    nodes.promptOutput.value = state.output;
    renderCount();
    if (state.output) addHistory();
    markDirty();
    nodes.outputStatus.textContent = state.output
      ? "Prompt forged locally. Review it, then copy it into the platform's Style box."
      : "Add a brief or sound choices first.";
    nodes.outputCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderCount() {
    const limit = Number(state.limit) || 0;
    nodes.promptCount.textContent = limit ? `${state.output.length} / ${limit}` : `${state.output.length} characters`;
    nodes.promptCount.style.borderColor = limit && state.output.length >= limit ? "var(--danger)" : "";
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
      output: state.output
    };
  }

  function addHistory() {
    if (!state.output) return;
    const item = { id: makeId(), at: Date.now(), prompt: state.output, state: snapshot() };
    history = history.filter(entry => entry.prompt !== item.prompt);
    history.unshift(item);
    history = history.slice(0, 25);
    saveJson(HISTORY_KEY, history);
    renderSaved();
  }

  function savePreset() {
    pullControls();
    const name = nodes.presetNameInput.value.trim() || `Preset ${presets.length + 1}`;
    const item = { id: makeId(), name, at: Date.now(), state: snapshot() };
    presets.unshift(item);
    presets = presets.slice(0, 40);
    saveJson(PRESET_KEY, presets);
    nodes.presetNameInput.value = "";
    renderSaved();
    toast("Preset saved");
  }

  function loadSnapshot(value) {
    state = { ...DEFAULT_STATE, ...(value || {}), selected: Array.isArray(value?.selected) ? value.selected.slice(0, MAX_SELECTED) : [] };
    syncControls();
    renderSelected();
    renderCategories();
    renderCount();
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
    nodes.savedCount.textContent = presets.length + history.length;
  }

  function exportBackup() {
    const payload = {
      app: "Forge Prompt Generator",
      version: 1,
      exportedAt: new Date().toISOString(),
      current: snapshot(),
      presets,
      history
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `forge-prompt-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  async function importBackup(file) {
    try {
      const payload = JSON.parse(await file.text());
      if (payload.current) loadSnapshot(payload.current);
      if (Array.isArray(payload.presets)) presets = payload.presets.slice(0, 40);
      if (Array.isArray(payload.history)) history = payload.history.slice(0, 25);
      saveJson(PRESET_KEY, presets);
      saveJson(HISTORY_KEY, history);
      renderSaved();
      toast("Backup imported");
    } catch {
      toast("That backup file could not be read.");
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
    if (!confirm("Start a new prompt and clear the current project? Saved presets and history will stay.")) return;
    state = clone(DEFAULT_STATE);
    syncControls();
    renderSelected();
    renderCategories();
    renderCount();
    markDirty();
    toast("New project ready");
  }

  function cacheNodes() {
    [
      "saveBadge","newProjectBtn","heroForgeBtn","clearBriefBtn","briefInput","recipeRow",
      "selectedCount","tagSearch","searchResults","selectedTags","categoryList",
      "bpmOutput","bpmRange","energySelect","lengthSelect","keySelect","modeSelect",
      "meterSelect","vocalPlanSelect","structureInput","structurePresets","productionInput",
      "excludeInput","limitSelect","outputCard","promptCount","promptOutput","forgeBtn",
      "copyBtn","copyExcludeBtn","shareBtn","savePresetBtn","outputStatus","savedCount",
      "presetNameInput","exportBackupBtn","importBackupInput","presetList","historyList","toast"
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
    nodes.heroForgeBtn.addEventListener("click", forgePrompt);
    nodes.forgeBtn.addEventListener("click", forgePrompt);
    nodes.copyBtn.addEventListener("click", () => copyText(nodes.promptOutput.value, "Prompt copied"));
    nodes.copyExcludeBtn.addEventListener("click", () => copyText(nodes.excludeInput.value, "Exclude list copied"));
    nodes.shareBtn.addEventListener("click", async () => {
      if (!state.output) forgePrompt();
      if (navigator.share) {
        try {
          await navigator.share({ title: "Forge Prompt", text: state.output });
        } catch {}
      } else {
        copyText(state.output, "Prompt copied");
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
  }

  function init() {
    cacheNodes();
    initKeys();
    renderRecipes();
    renderStructurePresets();
    renderSelected();
    renderCategories();
    renderSaved();
    syncControls();
    renderCount();
    bindEvents();
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}), { once: true });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
