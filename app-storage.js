function exportData() {
  const payload = JSON.stringify({ version: DATA.version, state, presets, history }, null, 2);
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
    presets = imported.presets;
    history = imported.history;
    validateState();
    saveAll();
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
  saveAll();
  syncControls(false);
}

function redo() {
  if (!redoStack.length) return;
  undoStack.push(clone(state));
  state = redoStack.pop();
  saveAll();
  syncControls(false);
}

function resetAll() {
  if (!window.confirm("Reset the current Forge workspace? Saved presets and history will remain.")) return;
  snapshot();
  state = clone(defaultState);
  els.tagSearch.value = "";
  saveAll();
  syncControls(false);
  setLyricsStatus("AI uses the selected tags and structure. Offline fallback stays available.");
  showToast("Workspace reset");
}

function clearSelections() {
  snapshot();
  state.selectedTags = [];
  state.output = "";
  saveAll();
  syncControls(false);
}

function clearLyrics() {
  if ((els.songIdea.value.trim() || els.lyricsInput.value.trim() || state.output.trim()) &&
      !window.confirm("Clear the song idea, lyrics, and generated prompt?")) return;
  snapshot();
  state.songIdea = "";
  state.lyrics = "";
  state.lastGeneratedLyrics = "";
  state.output = "";
  state.favorite = false;
  saveAll();
  syncControls(false);
  setLyricsStatus("Lyrics cleared. The editor is ready.", "success");
  els.songIdea.focus();
  showToast("Lyrics cleared");
}

function validateState() {
  state = { ...clone(defaultState), ...state };
  state.selectedTags = Array.isArray(state.selectedTags) ? unique(state.selectedTags) : [];
  state.structure = Array.isArray(state.structure) && state.structure.length
    ? state.structure.filter((part) => DATA.structureOptions.includes(part))
    : clone(DATA.defaultStructure);
  if (!state.structure.length) state.structure = clone(DATA.defaultStructure);
  state.bpm = Number.isFinite(Number(state.bpm)) ? Math.min(220, Math.max(50, Number(state.bpm))) : 120;
  state.songIdea = String(state.songIdea || "");
  state.lyrics = String(state.lyrics || "");
  state.output = String(state.output || "");
}

function runDiagnostic() {
  const failures = [];
  const required = Object.entries(els).filter(([, element]) => !element).map(([name]) => name);
  if (required.length) failures.push(`Missing HTML elements: ${required.join(", ")}`);
  if (!DATA?.categories || !Object.keys(DATA.categories).length) failures.push("DATA.categories is missing.");
  if (!Array.isArray(DATA?.recipes) || !DATA.recipes.length) failures.push("DATA.recipes is missing.");
  if (!Array.isArray(state.structure) || !state.structure.length) failures.push("State structure is invalid.");
  if (failures.length) throw new Error(failures.join("\n"));
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

  els.lengthSelect.addEventListener("change", () => {
    snapshot();
    state.length = els.lengthSelect.value;
    state.output = "";
    saveAll();
  });

  els.energySelect.addEventListener("change", () => {
    snapshot();
    state.energy = els.energySelect.value;
    state.output = "";
    saveAll();
  });

  els.songIdea.addEventListener("input", () => {
    state.songIdea = els.songIdea.value;
    state.output = "";
    saveAll();
  });

  els.lyricsInput.addEventListener("input", () => {
    state.lyrics = els.lyricsInput.value;
    state.output = "";
    state.favorite = false;
    saveAll();
    els.regenerateLyricsBtn.disabled = !state.lyrics.trim() || isGenerating;
  });

  els.generateLyricsBtn.addEventListener("click", () => generateLyrics({ force: false }));
  els.regenerateLyricsBtn.addEventListener("click", () => generateLyrics({ force: true }));
  els.addStructureBtn.addEventListener("click", addStructure);
  els.clearLyricsBtn.addEventListener("click", clearLyrics);
  els.copyPromptBtn.addEventListener("click", () => copyText(state.output, "Prompt copied"));
  els.sharePromptBtn.addEventListener("click", sharePrompt);
  els.favoriteBtn.addEventListener("click", toggleFavorite);
  els.savePresetBtn.addEventListener("click", savePreset);
  els.clearHistoryBtn.addEventListener("click", clearHistory);
  els.exportBtn.addEventListener("click", exportData);
  els.importInput.addEventListener("change", () => importData(els.importInput.files[0]));
  els.undoBtn.addEventListener("click", undo);
  els.redoBtn.addEventListener("click", redo);
  els.resetBtn.addEventListener("click", resetAll);
  els.closeErrorBtn.addEventListener("click", () => els.errorPanel.classList.add("hidden"));
  els.copyErrorBtn.addEventListener("click", () => copyText(els.errorOutput.textContent, "Error report copied"));
}

function init() {
  try {
    validateState();
    runDiagnostic();
    renderRecipes();
    bindEvents();
    syncControls();
    saveAll();
    setStatus("Ready", "success");
  } catch (error) {
    reportError(error, "Startup");
  }
}

window.addEventListener("error", (event) => reportError(event.error || event.message, "JavaScript"));
window.addEventListener("unhandledrejection", (event) => reportError(event.reason, "Promise"));
window.addEventListener("load", () => {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  }
});
document.addEventListener("DOMContentLoaded", init);
