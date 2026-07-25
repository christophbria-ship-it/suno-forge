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

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${part}`);
    remove.addEventListener("click", () => removeStructure(index));

    row.append(select, remove);
    els.structureList.appendChild(row);
  });
}

function createSavedItem(title, meta, onLoad, onDelete) {
  const item = document.createElement("div");
  item.className = "saved-item";

  const content = document.createElement("div");
  content.className = "saved-item-content";
  content.innerHTML = '<div class="saved-item-title"></div><div class="saved-item-meta"></div>';
  content.children[0].textContent = title;
  content.children[1].textContent = meta;

  const actions = document.createElement("div");
  actions.className = "saved-item-actions";

  const load = document.createElement("button");
  load.type = "button";
  load.textContent = "Load";
  load.addEventListener("click", onLoad);

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

function renderPresetList() {
  els.presetList.innerHTML = presets.length ? "" : '<div class="empty-state">No presets saved.</div>';
  presets.forEach((preset) => {
    els.presetList.appendChild(createSavedItem(
      preset.name,
      `${preset.state.selectedTags.length} tags · ${preset.state.bpm} BPM`,
      () => loadPreset(preset.id),
      () => deletePreset(preset.id)
    ));
  });
}

function renderHistoryList() {
  els.historyList.innerHTML = history.length ? "" : '<div class="empty-state">No prompt history.</div>';
  history.forEach((item) => {
    els.historyList.appendChild(createSavedItem(
      item.favorite ? `★ ${item.title}` : item.title,
      new Date(item.createdAt).toLocaleString(),
      () => loadHistory(item.id),
      () => deleteHistory(item.id)
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
  els.songIdea.value = state.songIdea;
  els.lyricsInput.value = state.lyrics;
  els.promptOutput.value = state.output;
  els.favoriteBtn.textContent = state.favorite ? "★ Favorited" : "Favorite";
  els.regenerateLyricsBtn.disabled = !state.lyrics.trim() || isGenerating;
  els.generateLyricsBtn.disabled = isGenerating;
  els.forgePromptBtn.disabled = isGenerating;
  renderSelectedTags();
  renderCategories(els.tagSearch.value);
  renderStructure();
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
  const sections = [
    `STYLE: ${tags}`,
    `TEMPO: ${state.bpm} BPM`,
    `ENERGY: ${state.energy}`,
    `LENGTH: ${state.length}`,
    `STRUCTURE: ${state.structure.join(" → ")}`
  ];

  if (state.songIdea.trim()) sections.push(`SONG IDEA: ${state.songIdea.trim()}`);
  if (state.lyrics.trim()) sections.push(`LYRICS / DIRECTION:\n${state.lyrics.trim()}`);
  return sections.join("\n\n");
}

function buildOfflineLyrics() {
  const idea = state.songIdea.trim() || "someone deciding whether to leave before sunrise";
  const mood = state.selectedTags.find((tag) => DATA.categories.Mood.includes(tag)) || "restless";
  const genre = state.selectedTags.find((tag) => DATA.categories.Genre.includes(tag)) || "indie rock";
  const details = [
    "a cracked phone charging beside the motel sink",
    "the red numbers on a microwave clock",
    "rainwater dragging cigarette ash into the gutter",
    "a work shirt hanging from the passenger window",
    "two quarters and a receipt in the cup holder",
    "the neighbor's sprinkler clicking at 4 a.m.",
    "a dog barking behind a chain-link fence",
    "cold fries in a paper bag on the dashboard"
  ];
  const picked = unique([...details].sort(() => Math.random() - 0.5)).slice(0, 4);
  let verse = 0;

  return state.structure.map((section) => {
    if (section === "Intro") return `[Intro]\n(${mood.toLowerCase()} ${genre.toLowerCase()} texture; no vocal)`;
    if (section === "Verse") {
      verse += 1;
      const lines = verse === 1
        ? [
            `The night clerk watches ${idea.toLowerCase()}`,
            `There's ${picked[0]} and ${picked[1]}`,
            "I tell him one more hour, maybe two",
            "He nods like he's heard that answer before"
          ]
        : [
            `By morning, ${picked[2]} is all that's moving`,
            `I count out change beside ${picked[3]}`,
            "No revelation, no clean break",
            "Just the engine catching on the second try"
          ];
      return `[Verse ${verse}]\n${lines.join("\n")}`;
    }
    if (section === "Chorus" || section === "Final Chorus") {
      return `[${section}]\nI said I'd leave before the traffic starts\nBut the key is warm inside my hand\nSome decisions don't arrive like thunder\nThey sound like tires crossing wet pavement`;
    }
    if (section === "Bridge") {
      return `[Bridge]\nYour last message is still unsent\nThree words, then nothing underneath\nI delete it when the sun hits the glass\nAnd pull out slow enough to change my mind`;
    }
    if (section === "Outro") return `[Outro]\n(road noise, loose guitar figure, unresolved ending)`;
    return `[${section}]\n(${mood.toLowerCase()} instrumental passage)`;
  }).join("\n\n");
}

function buildGenerationPayload() {
  return {
    songIdea: state.songIdea.trim(),
    selectedTags: state.selectedTags,
    bpm: state.bpm,
    energy: state.energy,
    length: state.length,
    structure: state.structure,
    previousLyrics: state.lastGeneratedLyrics || state.lyrics.trim()
  };
}
