function renderStructure() {
  els.structureList.innerHTML = "";

  state.structure.forEach((part, index) => {
    const row = document.createElement("div");
    row.className = "structure-row";

    const select = document.createElement("select");
    select.setAttribute("aria-label", `Song section ${index + 1}`);
    DATA.structureOptions.forEach((option) => {
      const item = document.createElement("option");
      item.value = option;
      item.textContent = option;
      item.selected = option === part;
      select.appendChild(item);
    });
    select.addEventListener("change", () => {
      snapshot();
      state.structure[index] = select.value;
      state.output = "";
      saveAll();
      syncControls(false);
    });

    const actions = document.createElement("div");
    actions.className = "structure-actions";

    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "↑";
    up.disabled = index === 0;
    up.setAttribute("aria-label", `Move ${part} up`);
    up.addEventListener("click", () => moveStructure(index, -1));

    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "↓";
    down.disabled = index === state.structure.length - 1;
    down.setAttribute("aria-label", `Move ${part} down`);
    down.addEventListener("click", () => moveStructure(index, 1));

    const duplicate = document.createElement("button");
    duplicate.type = "button";
    duplicate.textContent = "⧉";
    duplicate.setAttribute("aria-label", `Duplicate ${part}`);
    duplicate.addEventListener("click", () => duplicateStructure(index));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${part}`);
    remove.addEventListener("click", () => removeStructure(index));

    actions.append(up, down, duplicate, remove);
    row.append(select, actions);
    els.structureList.appendChild(row);
  });
}

function createSavedItem(title, meta, favorite, onLoad, onDelete, onToggleFavorite) {
  const item = document.createElement("div");
  item.className = "saved-item";

  const content = document.createElement("div");
  content.className = "saved-item-content";
  content.innerHTML = '<div class="saved-item-title"></div><div class="saved-item-meta"></div>';
  content.children[0].textContent = favorite ? `★ ${title}` : title;
  content.children[1].textContent = meta;

  const actions = document.createElement("div");
  actions.className = "saved-item-actions";

  const load = document.createElement("button");
  load.type = "button";
  load.textContent = "Load";
  load.addEventListener("click", onLoad);

  if (onToggleFavorite) {
    const star = document.createElement("button");
    star.type = "button";
    star.textContent = favorite ? "★" : "☆";
    star.setAttribute("aria-label", favorite ? `Unfavorite ${title}` : `Favorite ${title}`);
    star.addEventListener("click", onToggleFavorite);
    actions.appendChild(star);
  }

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete-button";
  remove.textContent = "×";
  remove.setAttribute("aria-label", `Delete ${title}`);
  remove.addEventListener("click", onDelete);

  actions.append(load, remove);
  item.append(content, actions);
  return item;
}

function getSavedFilter() {
  return {
    query: els.historySearch.value.trim().toLowerCase(),
    favoritesOnly: els.favoritesOnly.checked
  };
}

function renderPresetList() {
  const { query } = getSavedFilter();
  const filtered = presets.filter((preset) => {
    const haystack = `${preset.name} ${preset.state?.selectedTags?.join(" ") || ""}`.toLowerCase();
    return !query || haystack.includes(query);
  });

  els.presetList.innerHTML = filtered.length ? "" : '<div class="empty-state">No matching presets.</div>';
  filtered.forEach((preset) => {
    els.presetList.appendChild(createSavedItem(
      preset.name,
      `${preset.state.selectedTags.length} tags · ${preset.state.bpm} BPM · ${preset.state.language || "English"}`,
      false,
      () => loadPreset(preset.id),
      () => deletePreset(preset.id)
    ));
  });
}

function renderHistoryList() {
  const { query, favoritesOnly } = getSavedFilter();
  const filtered = history.filter((item) => {
    if (favoritesOnly && !item.favorite) return false;
    const haystack = [
      item.title,
      item.state?.songIdea,
      item.state?.selectedTags?.join(" "),
      item.state?.lyrics
    ].filter(Boolean).join(" ").toLowerCase();
    return !query || haystack.includes(query);
  });

  els.historyList.innerHTML = filtered.length ? "" : '<div class="empty-state">No matching history.</div>';
  filtered.forEach((item) => {
    els.historyList.appendChild(createSavedItem(
      item.title,
      `${new Date(item.createdAt).toLocaleString()} · ${item.state?.bpm || 120} BPM`,
      Boolean(item.favorite),
      () => loadHistory(item.id),
      () => deleteHistory(item.id),
      () => toggleHistoryFavorite(item.id)
    ));
  });
}

function renderSaved() {
  renderPresetList();
  renderHistoryList();
}

function syncControls(renderLists = true) {
  els.bpmRange.value = state.bpm;
  els.bpmValue.textContent = `${state.bpm} BPM`;
  els.lengthSelect.value = state.length;
  els.energySelect.value = state.energy;
  els.perspectiveSelect.value = state.perspective;
  els.rhymeSelect.value = state.rhymeMode;
  els.densitySelect.value = state.density;
  els.languageSelect.value = state.language;
  els.promptFormatSelect.value = state.promptFormat;
  els.songIdea.value = state.songIdea;
  els.customInstructions.value = state.customInstructions;
  els.lyricsInput.value = state.lyrics;
  els.promptOutput.value = state.output;
  els.favoriteBtn.textContent = state.favorite ? "★ Favorited" : "Favorite";

  const hasLyrics = Boolean(state.lyrics.trim());
  els.regenerateLyricsBtn.disabled = !hasLyrics || isGenerating;
  els.polishLyricsBtn.disabled = !hasLyrics || isGenerating;
  els.continueLyricsBtn.disabled = !hasLyrics || isGenerating;
  els.hookIdeasBtn.disabled = isGenerating;
  els.generateLyricsBtn.disabled = isGenerating;
  els.forgePromptBtn.disabled = isGenerating;
  els.copyLyricsBtn.disabled = !hasLyrics;

  renderSelectedTags();
  renderCategories(els.tagSearch.value);
  renderStructure();
  updateStats();
  updateUndoButtons();
  if (renderLists) renderSaved();
}

function toggleTag(tag) {
  snapshot();
  state.selectedTags = state.selectedTags.includes(tag)
    ? state.selectedTags.filter((item) => item !== tag)
    : [...state.selectedTags, tag];
  state.output = "";
  saveAll();
  syncControls(false);
}

function applyRecipe(recipe) {
  snapshot();
  state.selectedTags = unique(recipe.tags);
  state.bpm = recipe.bpm;
  state.energy = recipe.energy;
  state.perspective = recipe.perspective || state.perspective;
  state.rhymeMode = recipe.rhymeMode || state.rhymeMode;
  state.density = recipe.density || state.density;
  state.output = "";
  state.favorite = false;
  saveAll();
  syncControls(false);
  showToast(`${recipe.name} loaded`);
}

function addStructure() {
  snapshot();
  state.structure.push("Verse");
  state.output = "";
  saveAll();
  syncControls(false);
}

function moveStructure(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= state.structure.length) return;
  snapshot();
  [state.structure[index], state.structure[target]] = [state.structure[target], state.structure[index]];
  state.output = "";
  saveAll();
  syncControls(false);
}

function duplicateStructure(index) {
  if (state.structure.length >= 24) {
    showToast("Structure limit reached");
    return;
  }
  snapshot();
  state.structure.splice(index + 1, 0, state.structure[index]);
  state.output = "";
  saveAll();
  syncControls(false);
}

function removeStructure(index) {
  if (state.structure.length === 1) {
    showToast("Keep at least one section");
    return;
  }
  snapshot();
  state.structure.splice(index, 1);
  state.output = "";
  saveAll();
  syncControls(false);
}

function buildPrompt() {
  const tags = state.selectedTags.length
    ? state.selectedTags.join(", ")
    : "Open genre and production direction";
  const lyrics = state.lyrics.trim();

  if (state.promptFormat === "lyrics") return lyrics;

  if (state.promptFormat === "compact") {
    const brief = [
      tags,
      `${state.bpm} BPM`,
      `${state.energy} energy`,
      state.length,
      state.language,
      state.perspective.replaceAll("-", " "),
      `${state.rhymeMode} rhyme`,
      `${state.density} lyrics`,
      `structure: ${state.structure.join(" → ")}`
    ].join(", ");
    return `${brief}.${state.songIdea.trim() ? ` Song idea: ${state.songIdea.trim()}.` : ""}${lyrics ? `\n\n${lyrics}` : ""}`;
  }

  const sections = [
    `STYLE: ${tags}`,
    `TEMPO: ${state.bpm} BPM`,
    `ENERGY: ${state.energy}`,
    `LENGTH: ${state.length}`,
    `LANGUAGE: ${state.language}`,
    `PERSPECTIVE: ${state.perspective.replaceAll("-", " ")}`,
    `RHYME: ${state.rhymeMode}`,
    `LYRIC DENSITY: ${state.density}`,
    `STRUCTURE: ${state.structure.join(" → ")}`
  ];

  if (state.songIdea.trim()) sections.push(`SONG IDEA: ${state.songIdea.trim()}`);
  if (state.customInstructions.trim()) sections.push(`EXTRA DIRECTION: ${state.customInstructions.trim()}`);
  if (lyrics) sections.push(`LYRICS / DIRECTION:\n${lyrics}`);
  return sections.join("\n\n");
}

function buildOfflineLyrics(action = "generate") {
  const idea = state.songIdea.trim() || "someone deciding whether to leave before sunrise";
  const mood = state.selectedTags.find((tag) => DATA.categories.Mood.includes(tag)) || "restless";
  const genre = state.selectedTags.find((tag) => DATA.categories.Genre.includes(tag)) || "indie rock";
  const details = shuffle(DATA.offlineDetails).slice(0, 8);
  const hooks = [
    "I keep the porch light off but the hallway knows my name",
    "Nothing changed except the lock and the weather",
    "I said I was leaving; the engine said maybe",
    "We make a promise every time the floorboards shake",
    "The truth sounds smaller when the refrigerator kicks on"
  ];

  if (action === "hooks") {
    return hooks.map((hook, index) => `[Hook ${index + 1}]\n${hook}`).join("\n\n");
  }

  if (action === "continue") {
    return `[Continuation]\nBy daylight ${details[0]} is still where I left it\n${details[1]} turns ordinary in the sun\nI take the long way past the same three houses\nAnd let the last unfinished sentence ride`;
  }

  const alternate = action === "regenerate" || action === "polish";
  let verse = 0;
  let detailIndex = alternate ? 3 : 0;

  return state.structure.map((section) => {
    if (section === "Intro") return `[Intro]\n(${mood.toLowerCase()} ${genre.toLowerCase()} texture; close room sound)`;
    if (section === "Verse") {
      verse += 1;
      const first = details[detailIndex % details.length];
      const second = details[(detailIndex + 1) % details.length];
      detailIndex += 2;
      return `[Verse ${verse}]\n${idea}\nThere is ${first}\nAnd ${second}\nNobody calls it a sign; it is just what stayed behind`;
    }
    if (section === "Pre-Chorus") {
      return `[Pre-Chorus]\nThe room goes quiet when the pipes stop\nI can hear the decision before I make it`;
    }
    if (section === "Chorus" || section === "Final Chorus") {
      return `[${section}]\n${randomItem(hooks)}\nThe key is warm inside my hand\nSome decisions do not arrive like thunder\nThey sound like tires crossing wet pavement`;
    }
    if (section === "Bridge") {
      return `[Bridge]\nYour last message is still unsent\nThree words and a blinking cursor underneath\nI delete it when the sun hits the glass\nThen pull out slow enough to change my mind`;
    }
    if (section === "Outro") return `[Outro]\n(road noise, loose motif, unresolved ending)`;
    return `[${section}]\n(${mood.toLowerCase()} instrumental or vocal variation)`;
  }).join("\n\n");
}

function buildGenerationPayload(action) {
  return {
    action,
    songIdea: state.songIdea.trim(),
    customInstructions: state.customInstructions.trim(),
    selectedTags: state.selectedTags,
    bpm: state.bpm,
    energy: state.energy,
    length: state.length,
    perspective: state.perspective,
    rhymeMode: state.rhymeMode,
    density: state.density,
    language: state.language,
    structure: state.structure,
    previousLyrics: state.lyrics.trim() || state.lastGeneratedLyrics
  };
}
