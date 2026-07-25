"use strict";

const STORAGE_KEY = "forgeStateV3";
const HISTORY_KEY = "forgeHistoryV3";
const PRESET_KEY = "forgePresetsV3";
const LEGACY_STORAGE_KEY = "forgeStateV2";
const LEGACY_HISTORY_KEY = "forgeHistoryV2";
const LEGACY_PRESET_KEY = "forgePresetsV2";
const MAX_HISTORY = 60;
const MAX_UNDO = 80;

const $ = (id) => document.getElementById(id);
const clone = (value) => JSON.parse(JSON.stringify(value));

const els = {
  statusBadge: $("statusBadge"),
  saveBadge: $("saveBadge"),
  installBtn: $("installBtn"),
  randomizeBtn: $("randomizeBtn"),
  forgePromptBtn: $("forgePromptBtn"),
  clearSelectionsBtn: $("clearSelectionsBtn"),
  recipeGrid: $("recipeGrid"),
  selectedCount: $("selectedCount"),
  selectedTags: $("selectedTags"),
  tagSearch: $("tagSearch"),
  categoryList: $("categoryList"),
  bpmRange: $("bpmRange"),
  bpmValue: $("bpmValue"),
  lengthSelect: $("lengthSelect"),
  energySelect: $("energySelect"),
  perspectiveSelect: $("perspectiveSelect"),
  rhymeSelect: $("rhymeSelect"),
  densitySelect: $("densitySelect"),
  languageSelect: $("languageSelect"),
  addStructureBtn: $("addStructureBtn"),
  structureList: $("structureList"),
  songIdea: $("songIdea"),
  customInstructions: $("customInstructions"),
  generateLyricsBtn: $("generateLyricsBtn"),
  regenerateLyricsBtn: $("regenerateLyricsBtn"),
  polishLyricsBtn: $("polishLyricsBtn"),
  continueLyricsBtn: $("continueLyricsBtn"),
  hookIdeasBtn: $("hookIdeasBtn"),
  clearLyricsBtn: $("clearLyricsBtn"),
  lyricsStatus: $("lyricsStatus"),
  lyricsInput: $("lyricsInput"),
  sectionStat: $("sectionStat"),
  lineStat: $("lineStat"),
  wordStat: $("wordStat"),
  durationStat: $("durationStat"),
  promptFormatSelect: $("promptFormatSelect"),
  promptOutput: $("promptOutput"),
  copyPromptBtn: $("copyPromptBtn"),
  copyLyricsBtn: $("copyLyricsBtn"),
  sharePromptBtn: $("sharePromptBtn"),
  favoriteBtn: $("favoriteBtn"),
  presetName: $("presetName"),
  savePresetBtn: $("savePresetBtn"),
  exportBtn: $("exportBtn"),
  importInput: $("importInput"),
  historySearch: $("historySearch"),
  favoritesOnly: $("favoritesOnly"),
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
  perspective: DATA.defaults.perspective,
  rhymeMode: DATA.defaults.rhymeMode,
  density: DATA.defaults.density,
  language: DATA.defaults.language,
  promptFormat: DATA.defaults.promptFormat,
  customInstructions: DATA.defaults.customInstructions,
  songIdea: DATA.defaults.songIdea,
  lyrics: DATA.defaults.lyrics,
  structure: clone(DATA.defaultStructure),
  output: "",
  favorite: false,
  lastGeneratedLyrics: "",
  lastAiAction: "",
  updatedAt: new Date().toISOString()
};

let state = loadInitialState();
let history = loadInitialCollection(HISTORY_KEY, LEGACY_HISTORY_KEY);
let presets = loadInitialCollection(PRESET_KEY, LEGACY_PRESET_KEY);
let undoStack = [];
let redoStack = [];
let toastTimer = null;
let saveTimer = null;
let isGenerating = false;
let installPromptEvent = null;

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function loadInitialState() {
  const current = loadJSON(STORAGE_KEY, null);
  if (current) return current;
  const legacy = loadJSON(LEGACY_STORAGE_KEY, null);
  return legacy ? { ...clone(defaultState), ...legacy } : clone(defaultState);
}

function loadInitialCollection(currentKey, legacyKey) {
  const current = loadJSON(currentKey, null);
  if (Array.isArray(current)) return current;
  const legacy = loadJSON(legacyKey, []);
  return Array.isArray(legacy) ? legacy : [];
}

function markDirty() {
  els.saveBadge.textContent = "Saving";
  els.saveBadge.classList.add("dirty");
}

function saveAll({ immediate = false } = {}) {
  markDirty();
  clearTimeout(saveTimer);

  const write = () => {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
    els.saveBadge.textContent = "Saved";
    els.saveBadge.classList.remove("dirty");
  };

  if (immediate) write();
  else saveTimer = setTimeout(write, 180);
}

function snapshot() {
  undoStack.push(clone(state));
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  redoStack = [];
  updateUndoButtons();
}

function updateUndoButtons() {
  els.undoBtn.disabled = undoStack.length === 0;
  els.redoBtn.disabled = redoStack.length === 0;
}

function setStatus(text, type = "") {
  els.statusBadge.textContent = text;
  els.statusBadge.className = `status-badge ${type}`.trim();
}

function setLyricsStatus(text, type = "") {
  els.lyricsStatus.textContent = text;
  els.lyricsStatus.className = `helper-text ${type}`.trim();
}

function showToast(message) {
  clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2100);
}

function reportError(error, context = "Forge") {
  const message = error?.message || String(error || "Unknown error");
  const stack = error?.stack || "No stack trace available.";
  const report = [
    "FORGE ERROR REPORT",
    `Version: ${DATA.version}`,
    `Time: ${new Date().toLocaleString()}`,
    `Context: ${context}`,
    `Message: ${message}`,
    "",
    stack
  ].join("\n");

  els.errorOutput.textContent = report;
  els.errorPanel.classList.remove("hidden");
  setStatus("Error", "error");
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function unique(list) {
  return [...new Set(list)];
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function populateSelect(select, options, selectedValue) {
  select.innerHTML = "";
  options.forEach((option) => {
    const item = document.createElement("option");
    const value = typeof option === "string" ? option : option.value;
    const label = typeof option === "string" ? option : option.label;
    item.value = value;
    item.textContent = label;
    item.selected = value === selectedValue;
    select.appendChild(item);
  });
}

function renderRecipes() {
  els.recipeGrid.innerHTML = "";
  DATA.recipes.forEach((recipe) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recipe-button";
    button.innerHTML = `<strong>${escapeHtml(recipe.name)}</strong><span>${escapeHtml(recipe.description)}</span>`;
    button.addEventListener("click", () => applyRecipe(recipe));
    els.recipeGrid.appendChild(button);
  });
}

function renderSelectedTags() {
  els.selectedTags.innerHTML = "";
  state.selectedTags.forEach((tag) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "selected-chip";
    chip.textContent = `${tag} ×`;
    chip.addEventListener("click", () => toggleTag(tag));
    els.selectedTags.appendChild(chip);
  });
  els.selectedCount.textContent = `${state.selectedTags.length} selected`;
}

function renderCategories(filter = "") {
  const query = filter.trim().toLowerCase();
  els.categoryList.innerHTML = "";

  Object.entries(DATA.categories).forEach(([name, tags]) => {
    const matches = tags.filter((tag) => tag.toLowerCase().includes(query));
    if (query && matches.length === 0) return;

    const section = document.createElement("section");
    section.className = "category";

    const header = document.createElement("button");
    header.type = "button";
    header.className = "category-header";
    header.innerHTML = `<strong>${escapeHtml(name)}</strong><span>${matches.length}</span>`;
    header.setAttribute("aria-expanded", "true");
    header.addEventListener("click", () => {
      section.classList.toggle("collapsed");
      header.setAttribute("aria-expanded", String(!section.classList.contains("collapsed")));
    });

    const content = document.createElement("div");
    content.className = "category-content";

    matches.forEach((tag) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tag-button";
      button.classList.toggle("selected", state.selectedTags.includes(tag));
      button.textContent = tag;
      button.addEventListener("click", () => toggleTag(tag));
      content.appendChild(button);
    });

    section.append(header, content);
    els.categoryList.appendChild(section);
  });
}

function getWordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function updateStats() {
  const text = state.lyrics || "";
  const nonEmptyLines = text.split(/\r?\n/).filter((line) => line.trim()).length;
  const sections = (text.match(/^\s*\[[^\]]+\]/gm) || []).length;
  const words = getWordCount(text);
  const estimatedSeconds = words ? Math.max(30, Math.round((words / 95) * 60)) : 0;
  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = String(estimatedSeconds % 60).padStart(2, "0");

  els.sectionStat.textContent = `${sections} section${sections === 1 ? "" : "s"}`;
  els.lineStat.textContent = `${nonEmptyLines} line${nonEmptyLines === 1 ? "" : "s"}`;
  els.wordStat.textContent = `${words} word${words === 1 ? "" : "s"}`;
  els.durationStat.textContent = `~${minutes}:${seconds}`;
}
