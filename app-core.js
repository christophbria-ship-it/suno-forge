"use strict";

const STORAGE_KEY = "forgeStateV2";
const HISTORY_KEY = "forgeHistoryV2";
const PRESET_KEY = "forgePresetsV2";
const MAX_HISTORY = 30;
const MAX_UNDO = 50;

const $ = (id) => document.getElementById(id);
const clone = (value) => JSON.parse(JSON.stringify(value));

const els = {
  statusBadge: $("statusBadge"),
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
  addStructureBtn: $("addStructureBtn"),
  structureList: $("structureList"),
  songIdea: $("songIdea"),
  generateLyricsBtn: $("generateLyricsBtn"),
  regenerateLyricsBtn: $("regenerateLyricsBtn"),
  clearLyricsBtn: $("clearLyricsBtn"),
  lyricsStatus: $("lyricsStatus"),
  lyricsInput: $("lyricsInput"),
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
  favorite: false,
  lastGeneratedLyrics: ""
};

let state = loadJSON(STORAGE_KEY, clone(defaultState));
let history = loadJSON(HISTORY_KEY, []);
let presets = loadJSON(PRESET_KEY, []);
let undoStack = [];
let redoStack = [];
let toastTimer = null;
let isGenerating = false;

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
  toastTimer = setTimeout(() => els.toast.classList.remove("show"), 1900);
}

function reportError(error, context = "Forge") {
  const message = error?.message || String(error || "Unknown error");
  const stack = error?.stack || "No stack trace available.";
  const report = [
    "FORGE ERROR REPORT",
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
    header.addEventListener("click", () => section.classList.toggle("collapsed"));

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

