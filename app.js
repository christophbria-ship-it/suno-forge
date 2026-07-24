"use strict";

const STORAGE_KEY = "forgeStateV1";
const HISTORY_KEY = "forgeHistoryV1";
const PRESET_KEY = "forgePresetsV1";
const MAX_HISTORY = 25;

const $ = (id) => document.getElementById(id);
const clone = (value) => JSON.parse(JSON.stringify(value));

const els = {
  statusBadge: $("statusBadge"),
  randomizeBtn: $("randomizeBtn"),
  generateBtn: $("generateBtn"),
  clearSelectionsBtn: $("clearSelectionsBtn"),
  recipeGrid: $("recipeGrid"),
  selectedCount: $("selectedCount"),
  tagSearch: $("tagSearch"),
  categoryList: $("categoryList"),
  bpmRange: $("bpmRange"),
  bpmValue: $("bpmValue"),
  lengthSelect: $("lengthSelect"),
  energySelect: $("energySelect"),
  addStructureBtn: $("addStructureBtn"),
  structureList: $("structureList"),
  songIdea: $("songIdea"),
  lyricsInput: $("lyricsInput"),
  clearLyricsBtn: $("clearLyricsBtn"),
  promptOutput: $("promptOutput"),
  copyPromptBtn: $("copyPromptBtn"),
  sharePromptBtn: $("sharePromptBtn"),
  favoriteBtn: $("favoriteBtn"),
  presetName: $("presetName"),
  savePresetBtn: $("savePresetBtn"),
  exportBtn: $("exportBtn"),
  importInput: $("importInput"),
  presetList: $("presetList"),
  historyList: $("historyList"),
  clearHistoryBtn: $("clearHistoryBtn"),
  undoBtn: $("undoBtn"),
  redoBtn: $("redoBtn"),
  resetBtn: $("resetBtn"),
  errorPanel: $("errorPanel"),
  errorOutput: $("errorOutput"),
  closeErrorBtn: $("closeErrorBtn"),
  copyErrorBtn: $("copyErrorBtn"),
  toast: $("toast")
};

const defaultState = {
  selectedTags: [],
  bpm: DATA.defaults.bpm,
  length: DATA.defaults.length,
  energy: DATA.defaults.energy,
  songIdea: DATA.defaults.songIdea,
  lyrics: DATA.defaults.lyrics,
  structure: clone(DATA.defaultStructure),
  output: "",
  favorite: false
};

let state = loadJSON(STORAGE_KEY, clone(defaultState));
let history = loadJSON(HISTORY_KEY, []);
let presets = loadJSON(PRESET_KEY, []);
let undoStack = [];
let redoStack = [];
let toastTimer = null;

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveAll() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
}
function snapshot() {
  undoStack.push(clone(state));
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}

function updateUndoButtons() {
  els.undoBtn.disabled = undoStack.length === 0;
  els.redoBtn.disabled = redoStack.length === 0;
}

function setStatus(text, type = "") {
  els.statusBadge.textContent = text;
  els.statusBadge.className =
    `status-badge ${type}`.trim();
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");

  toastTimer = setTimeout(() => {
    els.toast.classList.remove("show");
  }, 1800);
}

function reportError(error) {
  const text =
    error?.stack ||
    error?.message ||
    String(error);

  els.errorOutput.textContent = text;
  els.errorPanel.classList.remove("hidden");
  setStatus("Error", "error");
}

function randomItem(list) {
  return list[
    Math.floor(Math.random() * list.length)
  ];
}

function unique(list) {
  return [...new Set(list)];
}

function renderRecipes() {
  els.recipeGrid.innerHTML = "";

  DATA.recipes.forEach((recipe) => {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "recipe-button";

    button.innerHTML =
      `<strong>${recipe.name}</strong>` +
      `<span>${recipe.description}</span>`;

    button.addEventListener("click", () => {
      applyRecipe(recipe);
    });

    els.recipeGrid.appendChild(button);
  });
}

function renderCategories(filter = "") {
  const query =
    filter.trim().toLowerCase();

  els.categoryList.innerHTML = "";

  Object.entries(DATA.categories)
    .forEach(([name, tags]) => {

      const matches = tags.filter((tag) =>
        tag.toLowerCase().includes(query)
      );

      if (query && matches.length === 0) {
        return;
      }

      const section =
        document.createElement("section");

      section.className = "category";

      const header =
        document.createElement("button");

      header.type = "button";
      header.className = "category-header";

      header.innerHTML =
        `<strong>${name}</strong>` +
        `<span>${matches.length}</span>`;

      header.addEventListener("click", () => {
        section.classList.toggle("collapsed");
      });

      const content =
        document.createElement("div");

      content.className = "category-content";

      matches.forEach((tag) => {
        const button =
          document.createElement("button");

        button.type = "button";
        button.className = "tag-button";

        if (state.selectedTags.includes(tag)) {
          button.classList.add("selected");
        }

        button.textContent = tag;

        button.addEventListener("click", () => {
          toggleTag(tag);
        });

        content.appendChild(button);
      });

      section.append(header, content);
      els.categoryList.appendChild(section);
    });
}
function renderStructure() {
  els.structureList.innerHTML = "";

  state.structure.forEach((part, index) => {
    const row =
      document.createElement("div");

    row.className = "structure-row";

    const select =
      document.createElement("select");

    DATA.structureOptions.forEach((option) => {
      const item =
        document.createElement("option");

      item.value = option;
      item.textContent = option;
      item.selected = option === part;

      select.appendChild(item);
    });

    select.addEventListener("change", () => {
      snapshot();
      state.structure[index] = select.value;
      saveAll();
    });

    const remove =
      document.createElement("button");

    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "×";

    remove.setAttribute(
      "aria-label",
      `Remove ${part}`
    );

    remove.addEventListener("click", () => {
      removeStructure(index);
    });

    row.append(select, remove);
    els.structureList.appendChild(row);
  });
}

function renderSaved() {
  renderPresetList();
  renderHistoryList();
}

function renderPresetList() {
  els.presetList.innerHTML =
    presets.length
      ? ""
      : '<div class="empty-state">' +
        "No presets saved.</div>";

  presets.forEach((preset) => {
    const item = createSavedItem(
      preset.name,
      `${preset.state.selectedTags.length}` +
        ` tags · ${preset.state.bpm} BPM`,
      () => loadPreset(preset.id),
      () => deletePreset(preset.id)
    );

    els.presetList.appendChild(item);
  });
}

function renderHistoryList() {
  els.historyList.innerHTML =
    history.length
      ? ""
      : '<div class="empty-state">' +
        "No prompt history.</div>";

  history.forEach((item) => {
    const title = item.favorite
      ? `★ ${item.title}`
      : item.title;

    const savedItem = createSavedItem(
      title,
      new Date(
        item.createdAt
      ).toLocaleString(),
      () => loadHistory(item.id),
      () => deleteHistory(item.id)
    );

    els.historyList.appendChild(savedItem);
  });
}

function createSavedItem(
  title,
  meta,
  onLoad,
  onDelete
) {
  const item =
    document.createElement("div");

  item.className = "saved-item";

  const content =
    document.createElement("div");

  content.className = "saved-item-content";

  content.innerHTML =
    '<div class="saved-item-title"></div>' +
    '<div class="saved-item-meta"></div>';

  content.children[0].textContent = title;
  content.children[1].textContent = meta;

  const actions =
    document.createElement("div");

  actions.className = "saved-item-actions";

  const load =
    document.createElement("button");

  load.type = "button";
  load.textContent = "Load";
  load.addEventListener("click", onLoad);

  const remove =
    document.createElement("button");

  remove.type = "button";
  remove.className = "delete-button";
  remove.textContent = "×";
  remove.addEventListener("click", onDelete);

  actions.append(load, remove);
  item.append(content, actions);

  return item;
}
function syncControls() {
  els.bpmRange.value = state.bpm;
  els.bpmValue.textContent =
    `${state.bpm} BPM`;

  els.lengthSelect.value = state.length;
  els.energySelect.value = state.energy;
  els.songIdea.value = state.songIdea;
  els.lyricsInput.value = state.lyrics;
  els.promptOutput.value = state.output;

  els.favoriteBtn.textContent =
    state.favorite
      ? "★ Favorited"
      : "Favorite";

  els.selectedCount.textContent =
    `${state.selectedTags.length} selected`;

  renderCategories(els.tagSearch.value);
  renderStructure();
  updateUndoButtons();
}

function toggleTag(tag) {
  snapshot();

  state.selectedTags =
    state.selectedTags.includes(tag)
      ? state.selectedTags.filter(
          (item) => item !== tag
        )
      : [...state.selectedTags, tag];

  saveAll();
  syncControls();
}

function applyRecipe(recipe) {
  snapshot();

  state.selectedTags =
    unique(recipe.tags);

  state.bpm = recipe.bpm;
  state.energy = recipe.energy;
  state.favorite = false;

  saveAll();
  syncControls();

  showToast(`${recipe.name} loaded`);
}

function addStructure() {
  snapshot();
  state.structure.push("Verse");
  saveAll();
  renderStructure();
}

function removeStructure(index) {
  if (state.structure.length === 1) {
    showToast(
      "Keep at least one section"
    );
    return;
  }

  snapshot();
  state.structure.splice(index, 1);
  saveAll();
  renderStructure();
}

function buildPrompt() {
  const tags =
    state.selectedTags.length
      ? state.selectedTags.join(", ")
      : "Open genre and production direction";

  const structure =
    state.structure.join(" → ");

  const idea =
    state.songIdea.trim();

  const lyrics =
    state.lyrics.trim();

  const sections = [
    `STYLE: ${tags}`,
    `TEMPO: ${state.bpm} BPM`,
    `ENERGY: ${state.energy}`,
    `LENGTH: ${state.length}`,
    `STRUCTURE: ${structure}`
  ];

  if (idea) {
    sections.push(
      `SONG IDEA: ${idea}`
    );
  }

  if (lyrics) {
    sections.push(
      `LYRICS / DIRECTION:\n${lyrics}`
    );
  }

  return sections.join("\n\n");
}

function createLyricsDraft() {
  const idea = (
    state.songIdea ||
    "trying to leave something behind"
  ).replace(/[.!?]+$/, "");

  const mood =
    state.selectedTags.find((tag) =>
      DATA.categories.Mood.includes(tag)
    ) || "Reflective";

  const genre =
    state.selectedTags.find((tag) =>
      DATA.categories.Genre.includes(tag)
    ) || "Modern";

  const pick = (items) =>
    items[Math.floor(Math.random() * items.length)];

  const verses = [
    [
      "The porch light burned out sometime last week",
      "Your coffee cup is still beside the sink",
      "I leave the television talking to itself",
      "Just to make the room feel occupied"
    ],
    [
      "There is gravel in the floorboard of the car",
      "A faded receipt from a roadside bar",
      "I drove until the stations disappeared",
      "Then sat and listened to the engine cool"
    ],
    [
      "You called around midnight, then hung up",
      "I watched your name go dark across the screen",
      "There are things we never learned to say",
      "And things we said that we did not mean"
    ],
    [
      "Morning comes in pieces through the blinds",
      "I count the hours instead of getting sleep",
      "Some memories lose their edges over time",
      "Others settle somewhere underneath"
    ]
  ];

  const chorus = [
    `I keep coming back to ${idea.toLowerCase()}`,
    "Not because it saves me or makes it right",
    "Some things stay after everything changes",
    "Some truths only show themselves at night"
  ];

  const bridge = pick([
    [
      "Maybe there was never one clean ending",
      "Maybe we just stopped before the truth",
      "I do not need another explanation",
      "I need to know what I can live with"
    ],
    [
      "I used to think that leaving meant escape",
      "Now I know a place can follow you",
      "The road does not forgive or ask permission",
      "It only gives you somewhere else to move"
    ]
  ]);

  let verseNumber = 0;

  return state.structure.map((section) => {
    if (section === "Intro") {
      return `[Intro]
(${mood.toLowerCase()} ${genre.toLowerCase()} instrumentation)`;
    }

    if (section === "Verse") {
      const lines = verses[verseNumber % verses.length];
      verseNumber += 1;

      return `[Verse ${verseNumber}]
${lines.join("\n")}`;
    }

    if (section === "Chorus" || section === "Final Chorus") {
      return `[${section}]
${chorus.join("\n")}`;
    }

    if (section === "Pre-Chorus") {
      return `[Pre-Chorus]
I almost called, but let it ring
There was nothing new to say`;
    }

    if (section === "Bridge") {
      return `[Bridge]
${bridge.join("\n")}`;
    }

    if (section === "Outro") {
      return `[Outro]
The room goes quiet again
Nothing resolved, nothing erased`;
    }

    return `[${section}]
(${mood.toLowerCase()} instrumental passage)`;
  }).join("\n\n");
}

function generatePrompt() {
  snapshot();

  state.songIdea = els.songIdea.value.trim();
  state.lyrics = els.lyricsInput.value.trim();

  if (!state.lyrics) {
    state.lyrics = createLyricsDraft();
  }

  state.output = buildPrompt();
  state.favorite = false;

  const title =
    state.songIdea ||
    state.selectedTags.slice(0, 3).join(" · ") ||
    "Untitled Prompt";

  history.unshift({
    id: makeId(),
    title,
    createdAt: new Date().toISOString(),
    favorite: false,
    state: clone(state)
  });

  history = history.slice(0, MAX_HISTORY);

  saveAll();
  syncControls();
  renderSaved();

  setStatus("Forged", "success");
  showToast("Prompt and lyrics forged");
}
function randomize() {
  snapshot();

  const allTags =
    Object.values(
      DATA.categories
    ).flat();

  const count =
    5 + Math.floor(Math.random() * 4);

  const picked = [];

  while (picked.length < count) {
    const tag = randomItem(allTags);

    if (!picked.includes(tag)) {
      picked.push(tag);
    }
  }

  state.selectedTags = picked;

  state.bpm =
    70 + Math.floor(Math.random() * 91);

  state.energy = randomItem([
    "low",
    "medium",
    "high",
    "explosive"
  ]);

  state.length = randomItem([
    "short",
    "standard",
    "extended",
    "epic"
  ]);

  state.structure =
    clone(DATA.defaultStructure);

  state.output = "";
  state.favorite = false;

  saveAll();
  syncControls();

  showToast("Random setup created");
}

async function copyText(
  text,
  successMessage
) {
  if (!text.trim()) {
    showToast("Nothing to copy");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const box =
      document.createElement("textarea");

    box.value = text;

    document.body.appendChild(box);

    box.select();
    document.execCommand("copy");
    box.remove();
  }

  showToast(successMessage);
}

async function sharePrompt() {
  if (!state.output.trim()) {
    showToast("Forge a prompt first");
    return;
  }

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Forge Prompt",
        text: state.output
      });

      return;
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  }

  copyText(
    state.output,
    "Prompt copied for sharing"
  );
}

function toggleFavorite() {
  if (!state.output.trim()) {
    showToast("Forge a prompt first");
    return;
  }

  snapshot();

  state.favorite = !state.favorite;

  const match = history.find(
    (item) =>
      item.state.output === state.output
  );

  if (match) {
    match.favorite = state.favorite;
  }

  saveAll();
  syncControls();
  renderSaved();
}

function savePreset() {
  const name =
    els.presetName.value.trim();

  if (!name) {
    showToast("Enter a preset name");
    return;
  }

  presets.unshift({
    id: makeId(),
    name,
    state: clone(state)
  });

  els.presetName.value = "";

  saveAll();
  renderPresetList();

  showToast("Preset saved");
}
function loadPreset(id) {
  const preset = presets.find(
    (item) => item.id === id
  );

  if (!preset) return;

  snapshot();

  state = clone(preset.state);

  saveAll();
  syncControls();

  showToast("Preset loaded");
}

function deletePreset(id) {
  presets = presets.filter(
    (item) => item.id !== id
  );

  saveAll();
  renderPresetList();
}

function loadHistory(id) {
  const item = history.find(
    (entry) => entry.id === id
  );

  if (!item) return;

  snapshot();

  state = clone(item.state);
  state.favorite = item.favorite;

  saveAll();
  syncControls();

  showToast("History item loaded");
}

function deleteHistory(id) {
  history = history.filter(
    (item) => item.id !== id
  );

  saveAll();
  renderHistoryList();
}

function clearHistory() {
  history = [];

  saveAll();
  renderHistoryList();

  showToast("History cleared");
}

function exportData() {
  const payload = JSON.stringify(
    {
      version: DATA.version,
      state,
      presets,
      history
    },
    null,
    2
  );

  const blob = new Blob(
    [payload],
    {
      type: "application/json"
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `forge-backup-` +
    `${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

  link.click();

  URL.revokeObjectURL(url);

  showToast("Backup exported");
}

async function importData(file) {
  if (!file) return;

  try {
    const text = await file.text();
    const imported = JSON.parse(text);

    const valid =
      imported.state &&
      Array.isArray(imported.presets) &&
      Array.isArray(imported.history);

    if (!valid) {
      throw new Error(
        "Invalid Forge backup file"
      );
    }

    snapshot();

    state = imported.state;
    presets = imported.presets;
    history = imported.history;

    saveAll();
    syncControls();
    renderSaved();

    showToast("Backup imported");
  } catch (error) {
    reportError(error);
  } finally {
    els.importInput.value = "";
  }
}

function undo() {
  if (!undoStack.length) return;

  redoStack.push(clone(state));
  state = undoStack.pop();

  saveAll();
  syncControls();
}

function redo() {
  if (!redoStack.length) return;

  undoStack.push(clone(state));
  state = redoStack.pop();

  saveAll();
  syncControls();
}
function resetAll() {
  snapshot();

  state = clone(defaultState);

  saveAll();

  els.tagSearch.value = "";

  syncControls();

  showToast("Forge reset");
}

function clearSelections() {
  snapshot();

  state.selectedTags = [];

  saveAll();
  syncControls();
}

function clearLyrics() {
  snapshot();

  state.songIdea = "";
  state.lyrics = "";

  saveAll();
  syncControls();
}

function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `${Date.now()}-` +
    `${Math.random()
      .toString(16)
      .slice(2)}`
  );
}

function bindEvents() {
  els.generateBtn.addEventListener(
    "click",
    generatePrompt
  );

  els.randomizeBtn.addEventListener(
    "click",
    randomize
  );

  els.clearSelectionsBtn.addEventListener(
    "click",
    clearSelections
  );

  els.tagSearch.addEventListener(
    "input",
    () => {
      renderCategories(
        els.tagSearch.value
      );
    }
  );

  els.bpmRange.addEventListener(
    "input",
    () => {
      state.bpm =
        Number(els.bpmRange.value);

      els.bpmValue.textContent =
        `${state.bpm} BPM`;

      saveAll();
    }
  );

  els.lengthSelect.addEventListener(
    "change",
    () => {
      snapshot();

      state.length =
        els.lengthSelect.value;

      saveAll();
    }
  );

  els.energySelect.addEventListener(
    "change",
    () => {
      snapshot();

      state.energy =
        els.energySelect.value;

      saveAll();
    }
  );

  els.songIdea.addEventListener(
    "input",
    () => {
      state.songIdea =
        els.songIdea.value;

      saveAll();
    }
  );

  els.lyricsInput.addEventListener(
    "input",
    () => {
      state.lyrics =
        els.lyricsInput.value;

      saveAll();
    }
  );

  els.addStructureBtn.addEventListener(
    "click",
    addStructure
  );

  els.clearLyricsBtn.addEventListener(
    "click",
    clearLyrics
  );

  els.copyPromptBtn.addEventListener(
    "click",
    () => {
      copyText(
        state.output,
        "Prompt copied"
      );
    }
  );
    els.sharePromptBtn.addEventListener(
    "click",
    sharePrompt
  );

  els.favoriteBtn.addEventListener(
    "click",
    toggleFavorite
  );

  els.savePresetBtn.addEventListener(
    "click",
    savePreset
  );

  els.clearHistoryBtn.addEventListener(
    "click",
    clearHistory
  );

  els.exportBtn.addEventListener(
    "click",
    exportData
  );

  els.importInput.addEventListener(
    "change",
    () => {
      importData(
        els.importInput.files[0]
      );
    }
  );

  els.undoBtn.addEventListener(
    "click",
    undo
  );

  els.redoBtn.addEventListener(
    "click",
    redo
  );

  els.resetBtn.addEventListener(
    "click",
    resetAll
  );

  els.closeErrorBtn.addEventListener(
    "click",
    () => {
      els.errorPanel.classList.add(
        "hidden"
      );
    }
  );

  els.copyErrorBtn.addEventListener(
    "click",
    () => {
      copyText(
        els.errorOutput.textContent,
        "Error copied"
      );
    }
  );
}

function validateState() {
  state = {
    ...clone(defaultState),
    ...state
  };

  state.selectedTags =
    Array.isArray(state.selectedTags)
      ? state.selectedTags
      : [];

  state.structure =
    Array.isArray(state.structure) &&
    state.structure.length
      ? state.structure
      : clone(DATA.defaultStructure);
}

function init() {
  validateState();
  renderRecipes();
  renderSaved();
  syncControls();
  bindEvents();
  saveAll();

  setStatus("Ready", "success");
}

window.addEventListener(
  "error",
  (event) => {
    reportError(
      event.error || event.message
    );
  }
);

window.addEventListener(
  "unhandledrejection",
  (event) => {
    reportError(event.reason);
  }
);

document.addEventListener(
  "DOMContentLoaded",
  init
);

document.addEventListener("DOMContentLoaded", () => {
  const lyricsBox = document.getElementById("lyricsInput");
  const clearButton = document.getElementById("clearLyricsBtn");

  if (!lyricsBox || !clearButton) {
    return;
  }

  lyricsBox.readOnly = false;
  lyricsBox.disabled = false;
  lyricsBox.style.pointerEvents = "auto";
  lyricsBox.style.position = "relative";
  lyricsBox.style.zIndex = "5";

  clearButton.onclick = () => {
    snapshot();

    state.songIdea = "";
    state.lyrics = "";
    state.output = "";

    els.songIdea.value = "";
    els.lyricsInput.value = "";
    els.promptOutput.value = "";

    saveAll();
    showToast("Lyrics cleared");
  };
});