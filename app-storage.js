function exportData() {
  const payload = JSON.stringify({
    version: DATA.version,
    exportedAt: new Date().toISOString(),
    state,
    presets,
    history
  }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `forge-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Backup exported");
}

async function importData(file) {
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    if (!imported.state || !Array.isArray(imported.presets) || !Array.isArray(imported.history)) {
      throw new Error("Invalid Forge backup file.");
    }

    snapshot();
    state = { ...clone(defaultState), ...imported.state };
    presets = imported.presets.slice(0, 100);
    history = imported.history.slice(0, MAX_HISTORY);
    validateState();
    saveAll({ immediate: true });
    syncControls();
    showToast("Backup imported");
  } catch (error) {
    reportError(error, "Import Backup");
  } finally {
    els.importInput.value = "";
  }
}

function undo() {
  if (!undoStack.length) return;
  redoStack.push(clone(state));
  state = undoStack.pop();
  validateState();
  saveAll({ immediate: true });
  syncControls(false);
  showToast("Undone");
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(clone(state));
  state = redoStack.pop();
  validateState();
  saveAll({ immediate: true });
  syncControls(false);
  showToast("Redone");
}

function resetAll() {
  if (!window.confirm("Reset the current Forge workspace? Saved presets and history will remain.")) return;
  snapshot();
  state = clone(defaultState);
  els.tagSearch.value = "";
  saveAll({ immediate: true });
  syncControls(false);
  setLyricsStatus("AI uses the full brief and structure. Offline fallback remains available.");
  showToast("Workspace reset");
}

function clearSelections() {
  if (!state.selectedTags.length) return;
  snapshot();
  state.selectedTags = [];
  state.output = "";
  saveAll();
  syncControls(false);
  showToast("Tags cleared");
}

function clearLyrics() {
  if ((els.songIdea.value.trim() || els.customInstructions.value.trim() || els.lyricsInput.value.trim() || state.output.trim()) &&
      !window.confirm("Clear the song idea, AI direction, lyrics, and generated prompt?")) return;

  snapshot();
  state.songIdea = "";
  state.customInstructions = "";
  state.lyrics = "";
  state.lastGeneratedLyrics = "";
  state.lastAiAction = "";
  state.output = "";
  state.favorite = false;
  saveAll({ immediate: true });
  syncControls(false);
  setLyricsStatus("Lyrics cleared. The editor is ready.", "success");
  els.songIdea.focus();
  showToast("Writing room cleared");
}

function validateState() {
  state = { ...clone(defaultState), ...state };
  state.selectedTags = Array.isArray(state.selectedTags)
    ? unique(state.selectedTags.filter((tag) => typeof tag === "string")).slice(0, 100)
    : [];
  state.structure = Array.isArray(state.structure) && state.structure.length
    ? state.structure.filter((part) => DATA.structureOptions.includes(part)).slice(0, 24)
    : clone(DATA.defaultStructure);
  if (!state.structure.length) state.structure = clone(DATA.defaultStructure);

  state.bpm = Number.isFinite(Number(state.bpm))
    ? Math.min(220, Math.max(50, Number(state.bpm)))
    : DATA.defaults.bpm;

  const allowed = {
    length: ["short", "standard", "extended", "epic"],
    energy: ["low", "medium", "high", "explosive"],
    perspective: DATA.perspectives.map((item) => item.value),
    rhymeMode: DATA.rhymeModes.map((item) => item.value),
    density: DATA.densities.map((item) => item.value),
    language: DATA.languages,
    promptFormat: DATA.promptFormats.map((item) => item.value)
  };

  Object.entries(allowed).forEach(([key, values]) => {
    if (!values.includes(state[key])) state[key] = defaultState[key];
  });

  state.songIdea = String(state.songIdea || "").slice(0, 700);
  state.customInstructions = String(state.customInstructions || "").slice(0, 1200);
  state.lyrics = String(state.lyrics || "").slice(0, 16000);
  state.output = String(state.output || "").slice(0, 30000);
  state.lastGeneratedLyrics = String(state.lastGeneratedLyrics || "").slice(0, 16000);
  state.favorite = Boolean(state.favorite);
}

function runDiagnostic() {
  const failures = [];
  const required = Object.entries(els).filter(([, element]) => !element).map(([name]) => name);
  if (required.length) failures.push(`Missing HTML elements: ${required.join(", ")}`);
  if (!DATA?.categories || !Object.keys(DATA.categories).length) failures.push("DATA.categories is missing.");
  if (!Array.isArray(DATA?.recipes) || !DATA.recipes.length) failures.push("DATA.recipes is missing.");
  if (!Array.isArray(state.structure) || !state.structure.length) failures.push("State structure is invalid.");
  if (typeof requestLyrics !== "function") failures.push("AI request function is missing.");
  if (failures.length) throw new Error(failures.join("\n"));
}

function syncStateFromWritingFields() {
  state.songIdea = els.songIdea.value;
  state.customInstructions = els.customInstructions.value;
  state.lyrics = els.lyricsInput.value;
  state.output = "";
  state.favorite = false;
  saveAll();
  updateStats();
  els.regenerateLyricsBtn.disabled = !state.lyrics.trim() || isGenerating;
  els.polishLyricsBtn.disabled = !state.lyrics.trim() || isGenerating;
  els.continueLyricsBtn.disabled = !state.lyrics.trim() || isGenerating;
  els.copyLyricsBtn.disabled = !state.lyrics.trim();
}

function bindSelect(select, key) {
  select.addEventListener("change", () => {
    snapshot();
    state[key] = select.value;
    state.output = "";
    saveAll();
    if (key === "promptFormat" && state.lyrics.trim()) {
      state.output = buildPrompt();
      saveAll();
      els.promptOutput.value = state.output;
    }
  });
}

function bindEvents() {
  els.forgePromptBtn.addEventListener("click", forgePrompt);
  els.randomizeBtn.addEventListener("click", randomize);
  els.clearSelectionsBtn.addEventListener("click", clearSelections);
  els.tagSearch.addEventListener("input", () => renderCategories(els.tagSearch.value));

  els.bpmRange.addEventListener("input", () => {
    state.bpm = Number(els.bpmRange.value);
    state.output = "";
    els.bpmValue.textContent = `${state.bpm} BPM`;
    saveAll();
  });

  bindSelect(els.lengthSelect, "length");
  bindSelect(els.energySelect, "energy");
  bindSelect(els.perspectiveSelect, "perspective");
  bindSelect(els.rhymeSelect, "rhymeMode");
  bindSelect(els.densitySelect, "density");
  bindSelect(els.languageSelect, "language");
  bindSelect(els.promptFormatSelect, "promptFormat");

  els.songIdea.addEventListener("input", syncStateFromWritingFields);
  els.customInstructions.addEventListener("input", syncStateFromWritingFields);
  els.lyricsInput.addEventListener("input", syncStateFromWritingFields);

  els.generateLyricsBtn.addEventListener("click", () => runAiAction("generate"));
  els.regenerateLyricsBtn.addEventListener("click", () => runAiAction("regenerate"));
  els.polishLyricsBtn.addEventListener("click", () => runAiAction("polish"));
  els.continueLyricsBtn.addEventListener("click", () => runAiAction("continue"));
  els.hookIdeasBtn.addEventListener("click", () => runAiAction("hooks"));

  els.addStructureBtn.addEventListener("click", addStructure);
  els.clearLyricsBtn.addEventListener("click", clearLyrics);
  els.copyPromptBtn.addEventListener("click", () => copyText(state.output, "Prompt copied"));
  els.copyLyricsBtn.addEventListener("click", () => copyText(state.lyrics, "Lyrics copied"));
  els.sharePromptBtn.addEventListener("click", sharePrompt);
  els.favoriteBtn.addEventListener("click", toggleFavorite);
  els.savePresetBtn.addEventListener("click", savePreset);
  els.clearHistoryBtn.addEventListener("click", clearHistory);
  els.exportBtn.addEventListener("click", exportData);
  els.importInput.addEventListener("change", () => importData(els.importInput.files[0]));
  els.historySearch.addEventListener("input", renderSaved);
  els.favoritesOnly.addEventListener("change", renderSaved);
  els.undoBtn.addEventListener("click", undo);
  els.redoBtn.addEventListener("click", redo);
  els.resetBtn.addEventListener("click", resetAll);
  els.closeErrorBtn.addEventListener("click", () => els.errorPanel.classList.add("hidden"));
  els.copyErrorBtn.addEventListener("click", () => copyText(els.errorOutput.textContent, "Error report copied"));

  els.installBtn.addEventListener("click", async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    installPromptEvent = null;
    els.installBtn.classList.add("hidden");
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      forgePrompt();
    }
  });
}

function populateStaticControls() {
  populateSelect(els.perspectiveSelect, DATA.perspectives, state.perspective);
  populateSelect(els.rhymeSelect, DATA.rhymeModes, state.rhymeMode);
  populateSelect(els.densitySelect, DATA.densities, state.density);
  populateSelect(els.languageSelect, DATA.languages, state.language);
  populateSelect(els.promptFormatSelect, DATA.promptFormats, state.promptFormat);
}

function init() {
  try {
    validateState();
    populateStaticControls();
    runDiagnostic();
    renderRecipes();
    bindEvents();
    syncControls();
    saveAll({ immediate: true });
    setStatus(navigator.onLine ? "Ready" : "Offline", navigator.onLine ? "success" : "error");
  } catch (error) {
    reportError(error, "Startup");
  }
}

window.addEventListener("error", (event) => reportError(event.error || event.message, "JavaScript"));
window.addEventListener("unhandledrejection", (event) => reportError(event.reason, "Promise"));
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPromptEvent = event;
  els.installBtn.classList.remove("hidden");
});
window.addEventListener("online", () => setStatus("Ready", "success"));
window.addEventListener("offline", () => setStatus("Offline", "error"));
window.addEventListener("load", () => {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  }
});
document.addEventListener("DOMContentLoaded", init);
