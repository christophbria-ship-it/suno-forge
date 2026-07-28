"use strict";

(() => {
  const V35 = window.FORGE_V35;
  if (!V35) return;

  let toneSelect = null;
  let arcSelect = null;
  let voiceSelect = null;
  let cheeseSelect = null;
  let summary = null;

  function optionExists(list, value) {
    return list.some((item) => item.value === value);
  }

  function ensureDirectorState() {
    if (!optionExists(V35.tones, state.lyricTone)) state.lyricTone = "auto";
    if (!optionExists(V35.arcs, state.lyricArc)) state.lyricArc = "consistent";
    if (!optionExists(V35.voices, state.lyricVoice)) state.lyricVoice = "natural";
    if (!optionExists(V35.cheeseLevels, state.cheeseFilter)) state.cheeseFilter = "strict";
    state.lyricDirectorVersion = V35.version;
  }

  function labelFor(list, value) {
    return list.find((item) => item.value === value)?.label || value;
  }

  function fillSelect(select, list) {
    select.innerHTML = "";
    list.forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.value;
      option.textContent = entry.label;
      select.appendChild(option);
    });
  }

  function createField(label, list) {
    const wrapper = document.createElement("label");
    wrapper.className = "field";
    const title = document.createElement("span");
    title.textContent = label;
    const select = document.createElement("select");
    fillSelect(select, list);
    wrapper.append(title, select);
    return { wrapper, select };
  }

  function renderDirector() {
    if (!toneSelect) return;
    ensureDirectorState();
    toneSelect.value = state.lyricTone;
    arcSelect.value = state.lyricArc;
    voiceSelect.value = state.lyricVoice;
    cheeseSelect.value = state.cheeseFilter;
    summary.textContent = [
      labelFor(V35.tones, state.lyricTone),
      labelFor(V35.arcs, state.lyricArc),
      labelFor(V35.voices, state.lyricVoice),
      `${labelFor(V35.cheeseLevels, state.cheeseFilter)} cheese filter`
    ].join(" · ");
  }

  function updateSetting(key, value) {
    if (state[key] === value) return;
    snapshot();
    state[key] = value;
    state.output = "";
    state.favorite = false;
    saveAll();
    renderDirector();
  }

  function applyPreset(preset) {
    snapshot();
    state.lyricTone = preset.tone;
    state.lyricArc = preset.arc;
    state.lyricVoice = preset.voice;
    state.cheeseFilter = preset.cheese;
    state.output = "";
    state.favorite = false;
    saveAll();
    renderDirector();
    showToast(`${preset.label} lyric direction loaded`);
  }

  function installDirectorCard() {
    const writingCard = document.querySelector(".writing-card");
    if (!writingCard || document.getElementById("lyricDirectorCard")) return;

    const card = document.createElement("div");
    card.id = "lyricDirectorCard";
    card.className = "lyric-director-card";

    const heading = document.createElement("div");
    heading.className = "lyric-director-heading";
    const copy = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "LYRIC DIRECTOR";
    const title = document.createElement("h3");
    title.textContent = "Tone, Arc, Voice & Cheese Filter";
    copy.append(eyebrow, title);
    const badge = document.createElement("span");
    badge.className = "lyric-director-badge";
    badge.textContent = "AI writing only";
    heading.append(copy, badge);

    const grid = document.createElement("div");
    grid.className = "lyric-director-grid";

    const tone = createField("Emotional tone", V35.tones);
    const arc = createField("Emotional arc", V35.arcs);
    const voice = createField("Writing mode", V35.voices);
    const cheese = createField("Cheese filter", V35.cheeseLevels);
    toneSelect = tone.select;
    arcSelect = arc.select;
    voiceSelect = voice.select;
    cheeseSelect = cheese.select;
    grid.append(tone.wrapper, arc.wrapper, voice.wrapper, cheese.wrapper);

    const presets = document.createElement("div");
    presets.className = "lyric-director-presets";
    V35.presets.forEach((preset) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lyric-director-chip";
      button.textContent = preset.label;
      button.addEventListener("click", () => applyPreset(preset));
      presets.appendChild(button);
    });

    summary = document.createElement("p");
    summary.className = "helper-text lyric-director-summary";

    card.append(heading, grid, presets, summary);
    const firstField = writingCard.querySelector("label.field");
    writingCard.insertBefore(card, firstField || writingCard.children[1] || null);

    toneSelect.addEventListener("change", () => updateSetting("lyricTone", toneSelect.value));
    arcSelect.addEventListener("change", () => updateSetting("lyricArc", arcSelect.value));
    voiceSelect.addEventListener("change", () => updateSetting("lyricVoice", voiceSelect.value));
    cheeseSelect.addEventListener("change", () => updateSetting("cheeseFilter", cheeseSelect.value));
  }

  function wrapCore() {
    defaultState.lyricTone = "auto";
    defaultState.lyricArc = "consistent";
    defaultState.lyricVoice = "natural";
    defaultState.cheeseFilter = "strict";
    defaultState.lyricDirectorVersion = V35.version;

    const previousValidate = validateState;
    validateState = function validateStateV35() {
      previousValidate();
      ensureDirectorState();
    };

    const previousSync = syncControls;
    syncControls = function syncControlsV35(renderLists = true) {
      ensureDirectorState();
      previousSync(renderLists);
      renderDirector();
    };

    const previousPayload = buildGenerationPayload;
    buildGenerationPayload = function buildGenerationPayloadV35(action) {
      const payload = previousPayload(action);
      ensureDirectorState();
      payload.lyricTone = state.lyricTone;
      payload.lyricArc = state.lyricArc;
      payload.lyricVoice = state.lyricVoice;
      payload.cheeseFilter = state.cheeseFilter;
      payload.variationKey = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      return payload;
    };

    requestLyrics = async function requestLyricsV35(action) {
      const response = await fetch("/api/generate-lyrics-v35", {
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
    };
  }

  function updateVersion() {
    document.title = "Forge Studio v3.5";
    const hero = document.querySelector(".hero");
    const eyebrow = hero?.querySelector(".eyebrow");
    const muted = hero?.querySelector(".muted");
    if (eyebrow) eyebrow.textContent = "FORGE STUDIO V3.5";
    if (muted) {
      muted.textContent = "Suno-ready exports, weighted music intelligence, and a Lyric Director for tone, emotional arcs, grounded writing, cinematic storytelling, and 1990s grunge/alternative language.";
    }
  }

  function initV35() {
    if (document.documentElement.dataset.forgeV35 === "ready") return;
    document.documentElement.dataset.forgeV35 = "ready";
    const firstMigration = !state.lyricDirectorVersion;
    wrapCore();
    ensureDirectorState();
    if (firstMigration) state.cheeseFilter = "strict";
    installDirectorCard();
    updateVersion();
    saveAll({ immediate: true });
    renderDirector();
  }

  if (typeof state === "undefined" || document.readyState !== "complete") {
    window.addEventListener("load", initV35, { once: true });
  } else {
    initV35();
  }
})();
