"use strict";

(() => {
  const V34 = window.FORGE_V34 || {
    version: "3.4.0",
    profiles: [
      { id: "account", label: "My Suno limits", styleLimit: 1000, lyricsLimit: 8000 },
      { id: "safe", label: "Conservative", styleLimit: 950, lyricsLimit: 4800 }
    ],
    quickExcludes: []
  };

  const GROUPS = Object.freeze({
    genre: ["Genre"],
    mood: ["Mood", "Era", "Texture & Atmosphere"],
    vocal: ["Vocals", "Vocal Delivery", "Vocal Range & Register", "Vocal Arrangement", "Harmony & Choir"],
    instrument: ["Instruments"],
    rhythm: ["Rhythm & Groove"],
    production: ["Production", "Mix & Master", "Effects", "Recording Space", "Performance"],
    arrangement: ["Arrangement"],
    key: ["Key"]
  });

  let exportCard = null;
  let profileSelect = null;
  let styleLimitInput = null;
  let lyricsLimitInput = null;
  let styleCounter = null;
  let lyricsCounter = null;
  let styleStatus = null;
  let lyricsStatus = null;
  let sunoLyricsOutput = null;
  let excludeInput = null;
  let recommendationGrid = null;
  let renderQueued = false;

  function node(tag, className, text) {
    const item = document.createElement(tag);
    if (className) item.className = className;
    if (text !== undefined) item.textContent = text;
    return item;
  }

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[+&/_,.-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function sentence(value) {
    const clean = String(value || "").replace(/\s+/g, " ").trim().replace(/[.,;:]+$/, "");
    if (!clean) return "";
    return `${clean.charAt(0).toUpperCase()}${clean.slice(1)}.`;
  }

  function profileById(id) {
    return V34.profiles.find((profile) => profile.id === id) || V34.profiles[0];
  }

  function clampInteger(value, min, max, fallback) {
    const parsed = Math.round(Number(value));
    return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback;
  }

  function ensureSunoState() {
    const profile = profileById(state.sunoProfile);
    state.sunoProfile = profile.id;
    state.sunoStyleLimit = clampInteger(state.sunoStyleLimit, 500, 1000, profile.styleLimit);
    state.sunoLyricsLimit = clampInteger(state.sunoLyricsLimit, 1000, 8000, profile.lyricsLimit);
    state.sunoExclude = String(state.sunoExclude || "").slice(0, 1000);
    state.sunoExportVersion = V34.version;
  }

  function categoryMap() {
    const result = new Map();
    Object.entries(DATA.categories).forEach(([category, tags]) => {
      tags.forEach((tag) => {
        if (!result.has(tag)) result.set(tag, []);
        result.get(tag).push(category);
      });
    });
    return result;
  }

  const tagCategories = categoryMap();

  function tagWeight(tag) {
    const raw = Number(state.tagWeights?.[tag]);
    if (!Number.isFinite(raw)) return 75;
    return Math.min(100, Math.max(25, Math.round(raw / 25) * 25));
  }

  function tagsFor(groupName, maximum = 6) {
    const categories = GROUPS[groupName] || [];
    return state.selectedTags
      .map((tag, index) => ({
        tag,
        index,
        weight: tagWeight(tag),
        categories: tagCategories.get(tag) || []
      }))
      .filter((entry) => entry.categories.some((category) => categories.includes(category)))
      .sort((a, b) => b.weight - a.weight || a.index - b.index)
      .slice(0, maximum);
  }

  function compactGenreList(entries) {
    if (!entries.length) return [];
    const selected = entries.map((entry) => entry.tag);
    const hybrid = entries.find((entry) => {
      const words = normalize(entry.tag).split(" ").filter((word) => word.length > 2);
      const covered = selected.filter((other) => other !== entry.tag && words.some((word) => normalize(other).includes(word)));
      return covered.length >= 2;
    });

    if (!hybrid) return selected.slice(0, 4);
    const hybridWords = normalize(hybrid.tag).split(" ");
    return [
      hybrid.tag,
      ...selected.filter((tag) => tag !== hybrid.tag && !hybridWords.some((word) => normalize(tag) === word))
    ].slice(0, 4);
  }

  function names(entries, maximum) {
    return entries.slice(0, maximum).map((entry) => entry.tag);
  }

  function joinNatural(items) {
    const clean = [...new Set(items.filter(Boolean))];
    if (!clean.length) return "";
    if (clean.length === 1) return clean[0];
    if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
    return `${clean.slice(0, -1).join(", ")}, and ${clean.at(-1)}`;
  }

  function condensedStructure() {
    const parts = state.structure || [];
    if (!parts.length) return "";
    const important = parts.filter((part, index) => {
      if (index === 0 || index === parts.length - 1) return true;
      if (/chorus|bridge|breakdown|solo|drop|coda/i.test(part)) return true;
      return false;
    });
    const uniqueParts = [];
    important.forEach((part) => {
      if (uniqueParts.at(-1) !== part) uniqueParts.push(part);
    });
    return uniqueParts.slice(0, 7).join(" → ");
  }

  function preferredTags(entries, strongMax, supportingMax, accentMax) {
    const primary = entries.filter((entry) => entry.weight >= 100);
    const strong = entries.filter((entry) => entry.weight === 75);
    const supporting = entries.filter((entry) => entry.weight === 50);
    const accent = entries.filter((entry) => entry.weight <= 25);
    return [
      ...primary,
      ...strong.slice(0, strongMax),
      ...supporting.slice(0, supportingMax),
      ...accent.slice(0, accentMax)
    ];
  }

  function trimAtBoundary(text, limit) {
    const clean = String(text || "").trim();
    if (clean.length <= limit) return clean;
    const slice = clean.slice(0, Math.max(0, limit - 1));
    const sentenceBreak = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("; "), slice.lastIndexOf(", "));
    const wordBreak = slice.lastIndexOf(" ");
    const cut = sentenceBreak > limit * 0.7 ? sentenceBreak + 1 : wordBreak;
    return `${slice.slice(0, Math.max(1, cut)).trim().replace(/[,:;]+$/, "")}.`;
  }

  function buildSunoStyle() {
    ensureSunoState();

    const genres = compactGenreList(preferredTags(tagsFor("genre", 12), 4, 2, 1));
    const moods = names(preferredTags(tagsFor("mood", 10), 3, 2, 1), 5);
    const vocals = names(preferredTags(tagsFor("vocal", 14), 4, 3, 1), 7);
    const instruments = names(preferredTags(tagsFor("instrument", 14), 5, 3, 1), 8);
    const rhythms = names(preferredTags(tagsFor("rhythm", 10), 3, 2, 1), 5);
    const productions = names(preferredTags(tagsFor("production", 16), 5, 3, 1), 8);
    const arrangements = names(preferredTags(tagsFor("arrangement", 10), 3, 2, 1), 5);
    const keys = names(preferredTags(tagsFor("key", 3), 2, 1, 0), 2);

    const segments = [];
    if (genres.length) {
      const moodText = moods.length ? ` with a ${joinNatural(moods)} atmosphere` : "";
      segments.push(sentence(`${joinNatural(genres)}${moodText}`));
    } else if (moods.length) {
      segments.push(sentence(`${joinNatural(moods)} musical direction`));
    }

    if (vocals.length) segments.push(sentence(joinNatural(vocals)));
    if (instruments.length) segments.push(sentence(`Feature ${joinNatural(instruments)}`));

    const motion = [
      `${state.bpm} BPM`,
      `${state.energy} energy`,
      ...rhythms
    ].filter(Boolean);
    segments.push(sentence(joinNatural(motion)));

    if (keys.length) segments.push(sentence(joinNatural(keys)));
    if (productions.length) segments.push(sentence(joinNatural(productions)));

    const structure = condensedStructure();
    const arrangementText = [
      ...arrangements,
      structure ? `shape the arrangement as ${structure}` : ""
    ].filter(Boolean);
    if (arrangementText.length) segments.push(sentence(joinNatural(arrangementText)));

    const direction = String(state.customInstructions || "").replace(/\s+/g, " ").trim();
    if (direction) segments.push(sentence(direction));

    let text = "";
    let usedSegments = 0;
    for (const segment of segments.filter(Boolean)) {
      const candidate = [text, segment].filter(Boolean).join(" ");
      if (candidate.length <= state.sunoStyleLimit) {
        text = candidate;
        usedSegments += 1;
        continue;
      }
      if (!text) {
        text = trimAtBoundary(segment, state.sunoStyleLimit);
        usedSegments += 1;
      }
      break;
    }

    if (!text) {
      text = sentence(`Open genre direction at ${state.bpm} BPM with ${state.energy} energy`);
    }

    return {
      text: trimAtBoundary(text, state.sunoStyleLimit),
      omittedSegments: Math.max(0, segments.filter(Boolean).length - usedSegments)
    };
  }

  function normalizedLyrics() {
    return String(state.lyrics || "")
      .replace(/\r\n?/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{4,}/g, "\n\n\n")
      .trim();
  }

  function limitSafeLyrics(text, limit) {
    if (text.length <= limit) return text;
    const slice = text.slice(0, limit);
    const sectionBoundary = slice.lastIndexOf("\n[");
    const paragraphBoundary = slice.lastIndexOf("\n\n");
    const lineBoundary = slice.lastIndexOf("\n");
    const cut = sectionBoundary > limit * 0.72
      ? sectionBoundary
      : paragraphBoundary > limit * 0.8
        ? paragraphBoundary
        : lineBoundary > limit * 0.9
          ? lineBoundary
          : limit;
    return slice.slice(0, cut).trim();
  }

  function recommendedSettings() {
    const conflicts = typeof window.FORGE_V33 === "object" ? V33ConflictCount() : 0;
    const genreCount = tagsFor("genre", 20).length;
    const experimental = conflicts > 0 || genreCount >= 3;

    const weirdness = experimental ? 65 : 45;
    const styleInfluence = experimental ? 78 : 88;
    const duration = {
      short: "2:00–2:45",
      standard: "3:00–4:00",
      extended: "4:30–6:00",
      epic: "6:00–8:00"
    }[state.length] || "3:00–4:00";

    return [
      ["Model", "Newest model available"],
      ["Weirdness", `${weirdness}%`],
      ["Style Influence", `${styleInfluence}%`],
      ["Duration", duration]
    ];
  }

  function V33ConflictCount() {
    const conflictRules = window.FORGE_V33?.conflictRules || [];
    return conflictRules.filter((rule) => {
      const left = rule.left?.some((tag) => state.selectedTags.includes(tag));
      const right = rule.right?.some((tag) => state.selectedTags.includes(tag));
      return left && right;
    }).length;
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderSunoExport();
    });
  }

  function updateCounter(counter, current, limit) {
    counter.textContent = `${current.toLocaleString()} / ${limit.toLocaleString()}`;
    counter.dataset.state = current > limit ? "over" : current > limit * 0.9 ? "near" : "good";
  }

  function renderRecommendations() {
    recommendationGrid.innerHTML = "";
    recommendedSettings().forEach(([label, value]) => {
      const item = node("div", "suno-setting");
      item.append(node("span", "", label), node("strong", "", value));
      recommendationGrid.appendChild(item);
    });
  }

  function renderSunoExport() {
    if (!exportCard?.isConnected) return;
    ensureSunoState();

    profileSelect.value = state.sunoProfile;
    styleLimitInput.value = String(state.sunoStyleLimit);
    lyricsLimitInput.value = String(state.sunoLyricsLimit);
    excludeInput.value = state.sunoExclude;

    const style = buildSunoStyle();
    const lyrics = normalizedLyrics();

    if (state.promptFormat === "suno") {
      state.output = style.text;
      els.promptOutput.value = style.text;
    }

    sunoLyricsOutput.value = lyrics;
    updateCounter(styleCounter, style.text.length, state.sunoStyleLimit);
    updateCounter(lyricsCounter, lyrics.length, state.sunoLyricsLimit);

    styleStatus.textContent = style.omittedSegments
      ? `${style.omittedSegments} lower-priority section${style.omittedSegments === 1 ? "" : "s"} omitted to stay inside the Style limit. Percentages remain internal.`
      : "All useful high-priority style information fits. Percentages remain internal.";

    lyricsStatus.textContent = lyrics.length > state.sunoLyricsLimit
      ? `Lyrics are ${lyrics.length - state.sunoLyricsLimit} characters over this profile. Limit-safe copy stops at a clean line or section boundary.`
      : `${state.sunoLyricsLimit - lyrics.length} characters remain.`;

    renderRecommendations();
  }

  async function copySunoStyle() {
    const result = buildSunoStyle();
    state.output = result.text;
    els.promptOutput.value = result.text;
    saveAll();
    await copyText(result.text, "Suno Style copied");
  }

  async function copySunoLyrics(forceFull = false) {
    const lyrics = normalizedLyrics();
    if (!lyrics) {
      showToast("No lyrics to copy");
      return;
    }
    const text = forceFull ? lyrics : limitSafeLyrics(lyrics, state.sunoLyricsLimit);
    const message = text.length < lyrics.length ? "Limit-safe lyrics copied" : "Suno lyrics copied";
    await copyText(text, message);
  }

  function addExclude(value) {
    const items = state.sunoExclude
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!items.some((item) => normalize(item) === normalize(value))) items.push(value);
    state.sunoExclude = items.join(", ").slice(0, 1000);
    excludeInput.value = state.sunoExclude;
    saveAll();
  }

  function installPromptFormat() {
    if (!DATA.promptFormats.some((format) => format.value === "suno")) {
      DATA.promptFormats.unshift({ value: "suno", label: "Suno Style · limit-aware" });
    }

    const select = els.promptFormatSelect;
    if (![...select.options].some((option) => option.value === "suno")) {
      const option = document.createElement("option");
      option.value = "suno";
      option.textContent = "Suno Style · limit-aware";
      select.insertBefore(option, select.firstChild);
    }

    if (!state.sunoExportVersion) state.promptFormat = "suno";
    select.value = state.promptFormat;
  }

  function installExportCard() {
    const outputCard = els.promptOutput?.closest(".output-card");
    if (!outputCard || document.getElementById("sunoExportTools")) return;

    exportCard = outputCard;
    outputCard.classList.add("suno-export-card");

    const eyebrow = outputCard.querySelector(".eyebrow");
    const title = outputCard.querySelector("h2");
    if (eyebrow) eyebrow.textContent = "SUNO EXPORT";
    if (title) title.textContent = "Style, Lyrics, Exclude & Settings";

    const promptFormatLabel = outputCard.querySelector(".prompt-format-field > span");
    if (promptFormatLabel) promptFormatLabel.textContent = "Style Output Format";

    els.promptOutput.rows = 9;
    els.promptOutput.placeholder = "Forge builds a limit-aware Suno Style prompt here.";
    els.copyPromptBtn.textContent = "Copy Style";
    els.forgePromptBtn.textContent = "Build Suno Style";

    const existingHelper = outputCard.querySelector(".prompt-helper");
    if (existingHelper) {
      existingHelper.textContent = "This first box is only the Suno Style field. Tag percentages control compression inside Forge and are not copied.";
    }

    const forgeCopy = document.getElementById("forgeAndCopyBtn");
    if (forgeCopy) {
      forgeCopy.textContent = "Build & Copy Suno Style";
      const replacement = forgeCopy.cloneNode(true);
      replacement.addEventListener("click", copySunoStyle);
      forgeCopy.replaceWith(replacement);
    }

    const tools = node("div", "suno-export-tools");
    tools.id = "sunoExportTools";

    const profileGrid = node("div", "suno-profile-grid");
    const profileLabel = node("label", "field");
    profileLabel.appendChild(node("span", "", "Limit Profile"));
    profileSelect = document.createElement("select");
    V34.profiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.label;
      profileSelect.appendChild(option);
    });
    profileLabel.appendChild(profileSelect);

    const styleLimitLabel = node("label", "field");
    styleLimitLabel.appendChild(node("span", "", "Style limit"));
    styleLimitInput = document.createElement("input");
    styleLimitInput.type = "number";
    styleLimitInput.min = "500";
    styleLimitInput.max = "1000";
    styleLimitInput.step = "10";
    styleLimitLabel.appendChild(styleLimitInput);

    const lyricsLimitLabel = node("label", "field");
    lyricsLimitLabel.appendChild(node("span", "", "Lyrics limit"));
    lyricsLimitInput = document.createElement("input");
    lyricsLimitInput.type = "number";
    lyricsLimitInput.min = "1000";
    lyricsLimitInput.max = "8000";
    lyricsLimitInput.step = "100";
    lyricsLimitLabel.appendChild(lyricsLimitInput);

    profileGrid.append(profileLabel, styleLimitLabel, lyricsLimitLabel);

    const styleMeta = node("div", "suno-output-meta");
    styleMeta.append(node("strong", "", "Suno Style"), styleCounter = node("span", "suno-counter", "0 / 1000"));
    styleStatus = node("p", "helper-text no-min-height suno-limit-status");

    const lyricsMeta = node("div", "suno-output-meta");
    lyricsMeta.append(node("strong", "", "Suno Lyrics"), lyricsCounter = node("span", "suno-counter", "0 / 8000"));
    sunoLyricsOutput = document.createElement("textarea");
    sunoLyricsOutput.rows = 14;
    sunoLyricsOutput.readOnly = true;
    sunoLyricsOutput.placeholder = "Your lyrics appear here separately from the Style prompt.";
    lyricsStatus = node("p", "helper-text no-min-height suno-limit-status");

    const lyricsActions = node("div", "suno-copy-actions");
    const copySafe = node("button", "secondary-button", "Copy Suno Lyrics");
    copySafe.type = "button";
    copySafe.addEventListener("click", () => copySunoLyrics(false));
    const copyFull = node("button", "", "Copy Full Lyrics");
    copyFull.type = "button";
    copyFull.addEventListener("click", () => copySunoLyrics(true));
    lyricsActions.append(copySafe, copyFull);

    const excludeMeta = node("div", "suno-output-meta");
    excludeMeta.append(node("strong", "", "Suno Exclude"), node("span", "", "Optional"));
    excludeInput = document.createElement("textarea");
    excludeInput.rows = 4;
    excludeInput.maxLength = 1000;
    excludeInput.placeholder = "Example: excessive autotune, muddy mix, long intro, fade-out";
    const excludeChips = node("div", "suno-exclude-chips");
    V34.quickExcludes.forEach((value) => {
      const button = node("button", "suno-exclude-chip", `+ ${value}`);
      button.type = "button";
      button.addEventListener("click", () => addExclude(value));
      excludeChips.appendChild(button);
    });
    const copyExclude = node("button", "", "Copy Exclude");
    copyExclude.type = "button";
    copyExclude.addEventListener("click", () => copyText(state.sunoExclude, "Suno Exclude copied"));

    const settingsMeta = node("div", "suno-output-meta");
    settingsMeta.append(node("strong", "", "Recommended Suno Settings"), node("span", "", "Starting points"));
    recommendationGrid = node("div", "suno-settings-grid");

    tools.append(
      profileGrid,
      styleMeta,
      styleStatus,
      lyricsMeta,
      sunoLyricsOutput,
      lyricsStatus,
      lyricsActions,
      excludeMeta,
      excludeInput,
      excludeChips,
      copyExclude,
      settingsMeta,
      recommendationGrid
    );

    const existingActions = outputCard.querySelector(".action-grid.three-actions");
    outputCard.insertBefore(tools, existingActions);

    if (els.copyLyricsBtn) els.copyLyricsBtn.classList.add("hidden");

    profileSelect.addEventListener("change", () => {
      snapshot();
      const profile = profileById(profileSelect.value);
      state.sunoProfile = profile.id;
      state.sunoStyleLimit = profile.styleLimit;
      state.sunoLyricsLimit = profile.lyricsLimit;
      state.output = "";
      saveAll();
      scheduleRender();
    });

    styleLimitInput.addEventListener("change", () => {
      state.sunoStyleLimit = clampInteger(styleLimitInput.value, 500, 1000, 1000);
      state.output = "";
      saveAll();
      scheduleRender();
    });

    lyricsLimitInput.addEventListener("change", () => {
      state.sunoLyricsLimit = clampInteger(lyricsLimitInput.value, 1000, 8000, 8000);
      saveAll();
      scheduleRender();
    });

    excludeInput.addEventListener("input", () => {
      state.sunoExclude = excludeInput.value.slice(0, 1000);
      saveAll();
    });

    els.copyPromptBtn.addEventListener("click", () => {
      if (state.promptFormat === "suno") {
        state.output = buildSunoStyle().text;
        els.promptOutput.value = state.output;
      }
    }, { capture: true });

    [els.songIdea, els.customInstructions, els.lyricsInput, els.bpmRange].forEach((control) => {
      control?.addEventListener("input", scheduleRender);
    });
    [
      els.lengthSelect,
      els.energySelect,
      els.perspectiveSelect,
      els.rhymeSelect,
      els.densitySelect,
      els.languageSelect,
      els.promptFormatSelect
    ].forEach((control) => control?.addEventListener("change", scheduleRender));

    const selectedTags = document.getElementById("selectedTags");
    if (selectedTags) {
      new MutationObserver(scheduleRender).observe(selectedTags, { childList: true });
    }
  }

  function wrapCore() {
    defaultState.sunoProfile = "account";
    defaultState.sunoStyleLimit = 1000;
    defaultState.sunoLyricsLimit = 8000;
    defaultState.sunoExclude = "";
    defaultState.sunoExportVersion = V34.version;
    defaultState.promptFormat = "suno";

    const previousValidate = validateState;
    validateState = function validateStateV34() {
      previousValidate();
      ensureSunoState();
    };

    const previousBuildPrompt = buildPrompt;
    buildPrompt = function buildPromptV34() {
      ensureSunoState();
      if (state.promptFormat === "suno") return buildSunoStyle().text;
      return previousBuildPrompt();
    };

    const previousSyncControls = syncControls;
    syncControls = function syncControlsV34(renderLists = true) {
      ensureSunoState();
      previousSyncControls(renderLists);
      scheduleRender();
    };
  }

  function updateVersion() {
    document.title = "Forge Studio v3.4";
    const hero = document.querySelector(".hero");
    const eyebrow = hero?.querySelector(".eyebrow");
    const muted = hero?.querySelector(".muted");
    if (eyebrow) eyebrow.textContent = "FORGE STUDIO V3.4";
    if (muted) {
      muted.textContent = "Suno-ready Style, Lyrics, Exclude, and settings exports with limit-aware compression, weighted music intelligence, hybrids, and AI drafting.";
    }
  }

  function initV34() {
    if (document.documentElement.dataset.forgeV34 === "ready") return;
    document.documentElement.dataset.forgeV34 = "ready";

    const firstMigration = !state.sunoExportVersion;
    wrapCore();
    installPromptFormat();
    ensureSunoState();
    if (firstMigration) state.promptFormat = "suno";
    updateVersion();
    installExportCard();
    saveAll({ immediate: true });
    renderSunoExport();
  }

  if (typeof state === "undefined" || document.readyState !== "complete") {
    window.addEventListener("load", initV34, { once: true });
  } else {
    initV34();
  }
})();
