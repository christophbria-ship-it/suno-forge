async function requestLyrics() {
  const response = await fetch("/api/generate-lyrics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildGenerationPayload())
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Lyrics request failed (${response.status})`);
  }
  if (!data.lyrics || typeof data.lyrics !== "string") {
    throw new Error("The server returned no lyrics.");
  }
  return data.lyrics.trim();
}

async function generateLyrics({ force = false } = {}) {
  if (isGenerating) return;
  const existing = els.lyricsInput.value.trim();
  if (existing && !force) {
    const confirmed = window.confirm("Replace the lyrics currently in the editor?");
    if (!confirmed) return;
  }

  snapshot();
  state.songIdea = els.songIdea.value.trim();
  state.lyrics = existing;
  isGenerating = true;
  setStatus("Writing", "busy");
  setLyricsStatus("Generating a new draft…");
  syncControls(false);

  try {
    let lyrics;
    try {
      lyrics = await requestLyrics();
      setLyricsStatus("AI draft generated. Edit anything you want.", "success");
    } catch (apiError) {
      lyrics = buildOfflineLyrics();
      setLyricsStatus("Backend unavailable. A varied offline draft was generated instead.", "error");
      console.warn(apiError);
    }

    state.lyrics = lyrics;
    state.lastGeneratedLyrics = lyrics;
    state.output = "";
    state.favorite = false;
    saveAll();
    showToast("Lyrics generated");
    setStatus("Ready", "success");
  } catch (error) {
    reportError(error, "Generate Lyrics");
  } finally {
    isGenerating = false;
    syncControls(false);
  }
}

function forgePrompt() {
  snapshot();
  state.songIdea = els.songIdea.value.trim();
  state.lyrics = els.lyricsInput.value;
  state.output = buildPrompt();
  state.favorite = false;

  const title = state.songIdea || state.selectedTags.slice(0, 3).join(" · ") || "Untitled Prompt";
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
  setStatus("Forged", "success");
  showToast("Prompt forged");
}

function randomize() {
  snapshot();
  const categories = Object.values(DATA.categories);
  const picked = [];
  categories.forEach((tags) => {
    if (Math.random() > 0.35) picked.push(randomItem(tags));
  });
  state.selectedTags = unique(picked).slice(0, 9);
  state.bpm = 70 + Math.floor(Math.random() * 91);
  state.energy = randomItem(["low", "medium", "high", "explosive"]);
  state.length = randomItem(["short", "standard", "extended", "epic"]);
  state.output = "";
  state.favorite = false;
  saveAll();
  syncControls(false);
  showToast("Random setup created");
}

async function copyText(text, successMessage) {
  if (!text.trim()) {
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
  const match = history.find((item) => item.state.output === state.output);
  if (match) match.favorite = state.favorite;
  saveAll();
  syncControls();
}

function savePreset() {
  const name = els.presetName.value.trim();
  if (!name) {
    showToast("Enter a preset name");
    return;
  }
  presets.unshift({ id: makeId(), name, state: clone(state) });
  els.presetName.value = "";
  saveAll();
  renderPresetList();
  showToast("Preset saved");
}

function loadPreset(id) {
  const preset = presets.find((item) => item.id === id);
  if (!preset) return;
  snapshot();
  state = { ...clone(defaultState), ...clone(preset.state) };
  saveAll();
  syncControls();
  showToast("Preset loaded");
}

function deletePreset(id) {
  presets = presets.filter((item) => item.id !== id);
  saveAll();
  renderPresetList();
}

function loadHistory(id) {
  const item = history.find((entry) => entry.id === id);
  if (!item) return;
  snapshot();
  state = { ...clone(defaultState), ...clone(item.state), favorite: item.favorite };
  saveAll();
  syncControls();
  showToast("History item loaded");
}

function deleteHistory(id) {
  history = history.filter((item) => item.id !== id);
  saveAll();
  renderHistoryList();
}

function clearHistory() {
  if (history.length && !window.confirm("Delete all prompt history?")) return;
  history = [];
  saveAll();
  renderHistoryList();
  showToast("History cleared");
}
