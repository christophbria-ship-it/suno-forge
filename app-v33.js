"use strict";

(() => {
  const V33 = window.FORGE_V33 || {
    version: "3.3.0",
    influenceLevels: [
      { value: 25, label: "Accent" },
      { value: 50, label: "Supporting" },
      { value: 75, label: "Strong" },
      { value: 100, label: "Primary" }
    ],
    suggestionRules: [],
    conflictRules: []
  };

  const DEFAULT_WEIGHT = 75;
  let intelligenceCard = null;
  let weightsList = null;
  let suggestionGrid = null;
  let conflictList = null;
  let scoreBadge = null;
  let observer = null;
  let renderQueued = false;

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[+&/_,.-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function categoryMap() {
    const map = new Map();
    Object.entries(DATA.categories).forEach(([category, tags]) => {
      tags.forEach((tag) => {
        if (!map.has(tag)) map.set(tag, []);
        map.get(tag).push(category);
      });
    });
    return map;
  }

  const tagCategories = categoryMap();

  function clampWeight(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return DEFAULT_WEIGHT;
    const snapped = Math.round(number / 25) * 25;
    return Math.min(100, Math.max(25, snapped));
  }

  function ensureTagWeights(defaultWeight = DEFAULT_WEIGHT) {
    if (!state.tagWeights || typeof state.tagWeights !== "object" || Array.isArray(state.tagWeights)) {
      state.tagWeights = {};
    }

    const next = {};
    state.selectedTags.forEach((tag) => {
      next[tag] = clampWeight(state.tagWeights[tag] ?? defaultWeight);
    });
    state.tagWeights = next;
    return next;
  }

  function levelFor(weight) {
    const exact = V33.influenceLevels.find((level) => level.value === clampWeight(weight));
    return exact || V33.influenceLevels[2];
  }

  function weightedTagText() {
    ensureTagWeights();
    return state.selectedTags
      .map((tag) => `${tag} ${state.tagWeights[tag]}%`)
      .join(", ");
  }

  function findConflicts() {
    const conflicts = [];
    V33.conflictRules.forEach((rule) => {
      const left = rule.left.filter((tag) => state.selectedTags.includes(tag));
      const right = rule.right.filter((tag) => state.selectedTags.includes(tag));
      if (left.length && right.length) {
        conflicts.push({
          tags: [...left, ...right],
          message: rule.message
        });
      }
    });
    return conflicts;
  }

  function categoryCoverage() {
    const groups = {
      genre: ["Genre"],
      instrument: ["Instruments"],
      vocal: ["Vocals", "Vocal Delivery", "Vocal Range & Register", "Vocal Arrangement", "Harmony & Choir"],
      groove: ["Rhythm & Groove"],
      production: ["Production", "Mix & Master", "Effects", "Recording Space", "Texture & Atmosphere"],
      arrangement: ["Arrangement", "Performance"]
    };

    const covered = {};
    Object.entries(groups).forEach(([key, categories]) => {
      covered[key] = state.selectedTags.some((tag) => {
        const tagGroups = tagCategories.get(tag) || [];
        return tagGroups.some((category) => categories.includes(category));
      });
    });
    return covered;
  }

  function compatibilityScore(conflicts) {
    const coverage = categoryCoverage();
    const coveredCount = Object.values(coverage).filter(Boolean).length;
    let score = 46 + (coveredCount * 8) + Math.min(10, state.selectedTags.length);
    score -= conflicts.length * 14;
    if (state.selectedTags.length > 30) score -= Math.min(18, state.selectedTags.length - 30);
    score = Math.min(100, Math.max(15, score));

    let label = "Experimental";
    if (score >= 88) label = "Production-ready";
    else if (score >= 72) label = "Coherent";
    else if (score >= 55) label = "Adventurous";
    return { score, label, coverage };
  }

  function suggestionCandidates() {
    const scores = new Map();
    const reasons = new Map();

    V33.suggestionRules.forEach((rule) => {
      const matched = rule.triggers.filter((tag) => state.selectedTags.includes(tag));
      if (!matched.length) return;
      rule.suggestions.forEach((tag, index) => {
        if (!tagCategories.has(tag) || state.selectedTags.includes(tag)) return;
        const current = scores.get(tag) || 0;
        scores.set(tag, current + 20 - Math.min(index, 8));
        if (!reasons.has(tag)) reasons.set(tag, `Pairs with ${matched[0]}`);
      });
    });

    const coverage = categoryCoverage();
    const coverageFallbacks = [
      { missing: !coverage.instrument, tags: ["String Ensemble", "Piano", "Electric Guitar", "Live Drums"], reason: "Adds instrumentation" },
      { missing: !coverage.vocal, tags: ["Lead Vocal", "Layered Harmonies", "Conversational Delivery", "Chorus-Only Harmonies"], reason: "Adds vocal direction" },
      { missing: !coverage.groove, tags: ["Humanized Timing", "Laid-Back Groove", "Half-Time", "Dynamic Swells"], reason: "Adds rhythmic direction" },
      { missing: !coverage.production, tags: ["Dynamic Mix", "Warm Analog", "Wide Stereo", "Intimate Mix"], reason: "Adds production direction" },
      { missing: !coverage.arrangement, tags: ["Slow Build", "Final Chorus Lift", "Stripped Bridge", "Hard Stop"], reason: "Adds arrangement shape" }
    ];

    coverageFallbacks.forEach((entry) => {
      if (!entry.missing) return;
      entry.tags.forEach((tag, index) => {
        if (!tagCategories.has(tag) || state.selectedTags.includes(tag)) return;
        scores.set(tag, (scores.get(tag) || 0) + 9 - index);
        if (!reasons.has(tag)) reasons.set(tag, entry.reason);
      });
    });

    return [...scores.entries()]
      .map(([tag, score]) => ({ tag, score, reason: reasons.get(tag) || "Completes the palette" }))
      .sort((a, b) => b.score - a.score || a.tag.localeCompare(b.tag))
      .slice(0, 12);
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => {
      renderQueued = false;
      renderMusicIntelligence();
    });
  }

  function setTagWeight(tag, value, takeSnapshot = true) {
    if (!state.selectedTags.includes(tag)) return;
    ensureTagWeights();
    const next = clampWeight(value);
    if (state.tagWeights[tag] === next) return;
    if (takeSnapshot) snapshot();
    state.tagWeights[tag] = next;
    state.output = "";
    state.favorite = false;
    saveAll();
    scheduleRender();
  }

  function renderWeights() {
    weightsList.innerHTML = "";
    ensureTagWeights();

    if (!state.selectedTags.length) {
      weightsList.appendChild(element("div", "intelligence-empty", "Select tags to control how strongly each one shapes the result."));
      return;
    }

    state.selectedTags.forEach((tag) => {
      const weight = state.tagWeights[tag];
      const level = levelFor(weight);
      const row = element("div", "influence-row");

      const identity = element("div", "influence-identity");
      identity.append(
        element("strong", "", tag),
        element("small", "", (tagCategories.get(tag) || ["Tag"]).join(" · "))
      );

      const controls = element("div", "influence-controls");
      const range = document.createElement("input");
      range.type = "range";
      range.min = "25";
      range.max = "100";
      range.step = "25";
      range.value = String(weight);
      range.setAttribute("aria-label", `${tag} influence`);

      const output = element("output", "influence-output", `${level.label} · ${weight}%`);
      range.addEventListener("input", () => {
        const preview = levelFor(range.value);
        output.textContent = `${preview.label} · ${range.value}%`;
      });
      range.addEventListener("change", () => setTagWeight(tag, range.value));

      controls.append(range, output);
      row.append(identity, controls);
      weightsList.appendChild(row);
    });
  }

  function renderSuggestions() {
    suggestionGrid.innerHTML = "";
    const suggestions = suggestionCandidates();

    if (!state.selectedTags.length) {
      suggestionGrid.appendChild(element("div", "intelligence-empty", "Suggestions appear after you choose a genre or recipe."));
      return;
    }

    if (!suggestions.length) {
      suggestionGrid.appendChild(element("div", "intelligence-empty", "This palette already covers the main musical roles."));
      return;
    }

    suggestions.forEach((suggestion) => {
      const button = element("button", "suggestion-button");
      button.type = "button";
      button.append(
        element("strong", "", `+ ${suggestion.tag}`),
        element("small", "", suggestion.reason)
      );
      button.addEventListener("click", () => {
        toggleTag(suggestion.tag);
        setTagWeight(suggestion.tag, 50, false);
        showToast(`${suggestion.tag} added as supporting`);
      });
      suggestionGrid.appendChild(button);
    });
  }

  function renderConflicts(conflicts) {
    conflictList.innerHTML = "";
    if (!conflicts.length) {
      conflictList.appendChild(element("div", "conflict-clear", "No major tag conflicts detected."));
      return;
    }

    conflicts.forEach((conflict) => {
      const item = element("div", "conflict-item");
      item.append(
        element("strong", "", conflict.tags.join(" ↔ ")),
        element("p", "", conflict.message)
      );
      conflictList.appendChild(item);
    });
  }

  function renderMusicIntelligence() {
    if (!intelligenceCard?.isConnected) return;
    ensureTagWeights();
    const conflicts = findConflicts();
    const result = compatibilityScore(conflicts);
    scoreBadge.textContent = `${result.score}% · ${result.label}`;
    scoreBadge.dataset.score = result.score >= 72 ? "good" : result.score >= 55 ? "mixed" : "warning";
    renderWeights();
    renderSuggestions();
    renderConflicts(conflicts);
  }

  function autoBalance() {
    if (!state.selectedTags.length) {
      showToast("Select tags first");
      return;
    }

    snapshot();
    const categorySeen = new Map();
    ensureTagWeights();

    state.selectedTags.forEach((tag) => {
      const categories = tagCategories.get(tag) || [];
      const primaryCategory = categories[0] || "Other";
      const seen = categorySeen.get(primaryCategory) || 0;
      categorySeen.set(primaryCategory, seen + 1);

      let weight = 50;
      if (primaryCategory === "Genre") weight = seen === 0 ? 100 : 75;
      else if (["Vocals", "Vocal Delivery", "Vocal Range & Register", "Vocal Arrangement", "Harmony & Choir"].includes(primaryCategory)) weight = seen === 0 ? 75 : 50;
      else if (primaryCategory === "Instruments") weight = seen === 0 ? 75 : 50;
      else if (["Effects", "Mix & Master", "Texture & Atmosphere"].includes(primaryCategory)) weight = 25;
      else if (["Mood", "Writing", "Rhythm & Groove", "Arrangement"].includes(primaryCategory)) weight = 50;
      state.tagWeights[tag] = weight;
    });

    state.output = "";
    saveAll();
    renderMusicIntelligence();
    showToast("Tag influence balanced");
  }

  function setAllStrong() {
    if (!state.selectedTags.length) {
      showToast("Select tags first");
      return;
    }
    snapshot();
    state.tagWeights = Object.fromEntries(state.selectedTags.map((tag) => [tag, 75]));
    state.output = "";
    saveAll();
    renderMusicIntelligence();
    showToast("All tags set to Strong");
  }

  function installIntelligenceCard() {
    if (document.getElementById("musicIntelligenceCard")) return;
    const hybridLab = document.getElementById("hybridLab");
    const tagCard = document.getElementById("tagSearch")?.closest("section.card");
    if (!tagCard) return;

    intelligenceCard = element("section", "card intelligence-card");
    intelligenceCard.id = "musicIntelligenceCard";

    const heading = element("div", "section-heading intelligence-heading");
    const headingCopy = element("div");
    headingCopy.append(
      element("p", "eyebrow", "MUSIC INTELLIGENCE"),
      element("h2", "", "Tag Strength & Compatibility")
    );
    scoreBadge = element("span", "compatibility-badge", "50% · Building");
    heading.append(headingCopy, scoreBadge);

    const helper = element(
      "p",
      "helper-text no-min-height",
      "Every selected tag is still used. Set Primary for the main identity, Strong for major ingredients, Supporting for secondary roles, and Accent for small details."
    );

    const actions = element("div", "intelligence-actions");
    const balanceButton = element("button", "secondary-button", "Auto Balance");
    balanceButton.type = "button";
    balanceButton.addEventListener("click", autoBalance);
    const strongButton = element("button", "", "Set All Strong");
    strongButton.type = "button";
    strongButton.addEventListener("click", setAllStrong);
    actions.append(balanceButton, strongButton);

    const influenceHeading = element("div", "intelligence-subheading");
    influenceHeading.append(
      element("h3", "", "Selected Tag Influence"),
      element("span", "", "25%–100%")
    );
    weightsList = element("div", "influence-list");

    const suggestionHeading = element("div", "intelligence-subheading");
    suggestionHeading.append(
      element("h3", "", "Smart Suggestions"),
      element("span", "", "Tap to add at 50%")
    );
    suggestionGrid = element("div", "suggestion-grid");

    const conflictHeading = element("div", "intelligence-subheading");
    conflictHeading.append(
      element("h3", "", "Compatibility Check"),
      element("span", "", "Warnings do not block hybrids")
    );
    conflictList = element("div", "conflict-list");

    intelligenceCard.append(
      heading,
      helper,
      actions,
      influenceHeading,
      weightsList,
      suggestionHeading,
      suggestionGrid,
      conflictHeading,
      conflictList
    );

    (hybridLab || tagCard).insertAdjacentElement("afterend", intelligenceCard);
  }

  function wrapCoreFunctions() {
    defaultState.tagWeights = {};
    ensureTagWeights();

    const originalValidateState = validateState;
    validateState = function validateStateV33() {
      originalValidateState();
      ensureTagWeights();
    };

    const originalSyncControls = syncControls;
    syncControls = function syncControlsV33(renderLists = true) {
      ensureTagWeights();
      originalSyncControls(renderLists);
      scheduleRender();
    };

    const originalToggleTag = toggleTag;
    toggleTag = function toggleTagV33(tag) {
      const wasSelected = state.selectedTags.includes(tag);
      originalToggleTag(tag);
      ensureTagWeights();
      if (!wasSelected && state.selectedTags.includes(tag)) state.tagWeights[tag] = DEFAULT_WEIGHT;
      if (wasSelected && !state.selectedTags.includes(tag)) delete state.tagWeights[tag];
      state.output = "";
      saveAll();
      scheduleRender();
    };

    const originalApplyRecipe = applyRecipe;
    applyRecipe = function applyRecipeV33(recipe) {
      originalApplyRecipe(recipe);
      ensureTagWeights();
      state.selectedTags.forEach((tag, index) => {
        state.tagWeights[tag] = index === 0 ? 100 : 75;
      });
      saveAll();
      scheduleRender();
    };

    const originalRandomize = randomize;
    randomize = function randomizeV33() {
      originalRandomize();
      ensureTagWeights(50);
      state.selectedTags.forEach((tag, index) => {
        state.tagWeights[tag] = index < 2 ? 75 : 50;
      });
      saveAll();
      scheduleRender();
    };

    const originalBuildGenerationPayload = buildGenerationPayload;
    buildGenerationPayload = function buildGenerationPayloadV33(action) {
      const payload = originalBuildGenerationPayload(action);
      ensureTagWeights();
      payload.tagWeights = Object.fromEntries(
        state.selectedTags.map((tag) => [tag, state.tagWeights[tag]])
      );
      return payload;
    };

    requestLyrics = async function requestLyricsV33(action) {
      const response = await fetch("/api/generate-lyrics-v33", {
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

    const originalBuildPrompt = buildPrompt;
    buildPrompt = function buildPromptV33() {
      const base = originalBuildPrompt();
      if (state.promptFormat === "lyrics" || !state.selectedTags.length) return base;
      const influence = weightedTagText();
      return state.promptFormat === "compact"
        ? `TAG INFLUENCE: ${influence}.\n${base}`
        : `TAG INFLUENCE: ${influence}\n\n${base}`;
    };
  }

  function updateVersion() {
    document.title = "Forge Studio v3.3";
    const hero = document.querySelector(".hero");
    const eyebrow = hero?.querySelector(".eyebrow");
    const muted = hero?.querySelector(".muted");
    if (eyebrow) eyebrow.textContent = "FORGE STUDIO V3.3";
    if (muted) {
      muted.textContent = "Weighted tag influence, compatibility guidance, smart suggestions, hybrid building, advanced vocal arrangements, and AI drafting.";
    }
  }

  function observeSelections() {
    const selectedTags = document.getElementById("selectedTags");
    if (!selectedTags) return;
    observer?.disconnect();
    observer = new MutationObserver(() => {
      ensureTagWeights();
      scheduleRender();
    });
    observer.observe(selectedTags, { childList: true });
  }

  function initV33() {
    if (document.documentElement.dataset.forgeV33 === "ready") return;
    document.documentElement.dataset.forgeV33 = "ready";
    wrapCoreFunctions();
    updateVersion();
    installIntelligenceCard();
    observeSelections();
    saveAll({ immediate: true });
    renderMusicIntelligence();
  }

  if (document.readyState === "loading" || typeof state === "undefined") {
    document.addEventListener("DOMContentLoaded", initV33, { once: true });
  } else {
    initV33();
  }
})();
