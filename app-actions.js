async function requestLyrics(action) {
  const response = await fetch("/api/generate-lyrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildGenerationPayload(action))
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Lyrics request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  if (!data.lyrics || typeof data.lyrics !== "string") {
    throw new Error("The server returned no lyrics.");
  }
  return {
    lyrics: data.lyrics.trim(),
    tagCount: Number.isFinite(Number(data.tagCount)) ? Number(data.tagCount) : 0
  };
}

function actionLabel(action) {
  return {
    generate: "Generating a complete draft…",
    regenerate: "Writing a substantially different draft…",
    polish: "Polishing the current lyrics…",
    continue: "Continuing from the current draft…",
    hooks: "Building hook options…"
  }[action] || "Writing…";
}

function shouldConfirmReplacement(action, existing) {
  if (!existing) return false;
  if (!["generate", "regenerate", "polish"].includes(action)) return false;
  const looksGenerated = existing === state.lastGeneratedLyrics;
  if (action === "regenerate" && looksGenerated) return false;
  return true;
}

async function runAiAction(action) {
  if (isGenerating) return;

  const existing = els.lyricsInput.value.trim();
  if (shouldConfirmReplacement(action, existing)) {
    const confirmed = window.confirm("Replace the lyrics currently in the editor? Your current draft remains available through Undo.");
    if (!confirmed) return;
  }

  snapshot();
  state.songIdea = els.songIdea.value.trim();
  state.customInstructions = els.customInstructions.value.trim();
  state.lyrics = existing;
  isGenerating = true;
  setStatus("Writing", "busy");
  setLyricsStatus(actionLabel(action));
  syncControls(false);

  try {
    let result;
    let tagCount = 0;
    let fallbackError = null;

    try {
      const response = await requestLyrics(action);
      result = response.lyrics;
      tagCount = response.tagCount;
    } catch (apiError) {
      fallbackError = apiError;
      result = buildOfflineLyrics(action);
      console.warn(apiError);
    }

    if (action === "continue") {
      state.lyrics = [existing, result].filter(Boolean).join("\n\n");
    } else if (action === "hooks") {
      state.lyrics = [existing, result].filter(Boolean).join("\n\n");
    } else {
      state.lyrics = result;
      state.lastGeneratedLyrics = result;
    }

    state.lastAiAction = action;
    state.output = "";
    state.favorite = false;
    saveAll({ immediate: true });

    if (fallbackError) {
      const connected = navigator.onLine;
      const reason = fallbackError.status === 504
        ? "The AI request took too long, so Forge used its safe local writer."
        : "The AI request could not finish, so Forge used its safe local writer.";
      setLyricsStatus(reason, "error");
      setStatus(connected ? "Local Draft" : "Offline", "error");
      showToast(connected ? "Local fallback used" : "Offline draft created");
    } else {
      const tagMessage = tagCount
        ? ` AI received all ${tagCount} selected tags.`
        : "";
      setLyricsStatus(`AI result added.${tagMessage} Edit anything you want.`, "success");
      setStatus("Ready", "success");
      showToast(action === "hooks" ? "Hook ideas added" : "Lyrics updated");
    }
  } catch (error) {
    reportError(error, `AI ${action}`);
  } finally {
    isGenerating = false;
    syncControls(false);
  }
}

function forgePrompt() {
  snapshot();
  state.songIdea = els.songIdea.value.trim();
  state.customInstructions = els.customInstructions.value.trim();
  state.lyrics = els.lyricsInput.value;
  state.output = buildPrompt();
  state.favorite = false;

  const title = state.songIdea || state.selectedTags.slice(0, 3).join(" · ") || "Untitled Prompt";
  const previous = history[0];
  const duplicate = previous && previous.state?.output === state.output;

  if (!duplicate) {
    history.unshift({
      id: makeId(),
      title,
      createdAt: new Date().toISOString(),
      favorite: false,
      state: clone(state)
    });
    history = history.slice(0, MAX_HISTORY);
  }

  saveAll({ immediate: true });
  syncControls();
  setStatus("Forged", "success");
  showToast(duplicate ? "Prompt refreshed" : "Prompt forged");
}

function randomize() {
  snapshot();
  const categories = Object.values(DATA.categories);
  const picked = [];
  categories.forEach((tags) => {
    if (Math.random() > 0.42) picked.push(randomItem(tags));
  });

  state.selectedTags = unique(picked).slice(0, 12);
  state.bpm = 68 + Math.floor(Math.random() * 95);
  state.energy = randomItem(["low", "medium", "high", "explosive"]);
  state.length = randomItem(["short", "standard", "extended", "epic"]);
  state.perspective = randomItem(DATA.perspectives).value;
  state.rhymeMode = randomItem(DATA.rhymeModes).value;
  state.density = randomItem(DATA.densities).value;
  state.output = "";
  state.favorite = false;
  saveAll();
  syncControls(false);
  showToast("Random setup created");
}

async function copyText(text, successMessage) {
  if (!String(text || "").trim()) {
    showToast("Nothing to copy");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const box = document.createElement("textarea");
    box.value = text;
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    const copied = document.execCommand("copy");
    box.remove();
    if (!copied) throw new Error("Clipboard copy failed.");
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
      await navigator.share({ title: "Forge Prompt", text: state.output });
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }

  await copyText(state.output, "Prompt copied for sharing");
}

function toggleFavorite() {
  if (!state.output.trim()) {
    showToast("Forge a prompt first");
    return;
  }

  snapshot();
  state.favorite = !state.favorite;
  const match = history.find((item) => item.state?.output === state.output);
  if (match) match.favorite = state.favorite;
  saveAll({ immediate: true });
  syncControls();
  showToast(state.favorite ? "Added to favorites" : "Removed from favorites");
}

function toggleHistoryFavorite(id) {
  const item = history.find((entry) => entry.id === id);
  if (!item) return;
  item.favorite = !item.favorite;
  if (item.state?.output === state.output) state.favorite = item.favorite;
  saveAll({ immediate: true });
  renderHistoryList();
}

function savePreset() {
  const name = els.presetName.value.trim();
  if (!name) {
    showToast("Enter a preset name");
    return;
  }

  const existing = presets.find((preset) => preset.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.state = clone(state);
    existing.updatedAt = new Date().toISOString();
    showToast("Preset updated");
  } else {
    presets.unshift({ id: makeId(), name, state: clone(state), updatedAt: new Date().toISOString() });
    showToast("Preset saved");
  }

  els.presetName.value = "";
  saveAll({ immediate: true });
  renderPresetList();
}

function loadPreset(id) {
  const preset = presets.find((item) => item.id === id);
  if (!preset) return;
  snapshot();
  state = { ...clone(defaultState), ...clone(preset.state), favorite: false };
  state.output = "";
  validateState();
  saveAll({ immediate: true });
  syncControls();
  showToast("Preset loaded");
}

function deletePreset(id) {
  presets = presets.filter((item) => item.id !== id);
  saveAll({ immediate: true });
  renderPresetList();
}

function loadHistory(id) {
  const item = history.find((entry) => entry.id === id);
  if (!item) return;
  snapshot();
  state = { ...clone(defaultState), ...clone(item.state), favorite: item.favorite };
  validateState();
  saveAll({ immediate: true });
  syncControls();
  showToast("History item loaded");
}

function deleteHistory(id) {
  history = history.filter((item) => item.id !== id);
  saveAll({ immediate: true });
  renderHistoryList();
}

function clearHistory() {
  if (history.length && !window.confirm("Delete all prompt history? Presets will remain.")) return;
  history = [];
  saveAll({ immediate: true });
  renderHistoryList();
  showToast("History cleared");
}
