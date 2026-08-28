"use strict";

(() => {
  const STORAGE_KEY = "simplistSoundBlenderProfilesV1";
  const FOCUS_OPTIONS = ["Auto", "Full Sound", "Guitar", "Vocals", "Bass", "Drums", "Production"];
  const nodes = {};
  const selected = { 1: null, 2: null };
  let customProfiles = [];
  let searchableProfiles = [];
  let initialized = false;

  function normalize(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function cleanText(value, limit = 1000) {
    return String(value || "")
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit);
  }

  function sentence(value) {
    const clean = cleanText(value).replace(/[.;,\s]+$/, "");
    if (!clean) return "";
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function semanticFocus(profile, requested, usedKey) {
    if (usedKey !== "Auto") return usedKey;
    const explicit = Object.keys(profile.parts || {}).find(key => key !== "Auto");
    if (explicit) return explicit;
    if (profile.type === "Vocalist") return "Vocals";
    if (profile.type === "Producer") return "Production";
    if (profile.type === "Band" || profile.type === "Song" || profile.type === "Artist") return "Full Sound";
    return requested === "Auto" ? "Sound" : requested;
  }

  function categoryFocus(category, tag) {
    if (["Vocals", "Vocal Delivery", "Vocal Range & Register", "Vocal Arrangement", "Harmony & Choir"].includes(category)) return "Vocals";
    if (["Production", "Mix & Master", "Effects", "Recording Space", "Texture & Atmosphere"].includes(category)) return "Production";
    if (category === "Genre") return "Full Sound";
    if (category === "Instruments") {
      if (/guitar|lute|ukulele|banjo|mandolin/i.test(tag)) return "Guitar";
      if (/bass/i.test(tag)) return "Bass";
      if (/drum|percussion|cymbal|snare|kick|tom|tambourine|conga|bongo/i.test(tag)) return "Drums";
    }
    return "Sound";
  }

  function loadCustomProfiles() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      customProfiles = Array.isArray(saved)
        ? saved.filter(item => item && cleanText(item.name, 80) && item.parts && typeof item.parts === "object")
          .map(item => ({
            name: cleanText(item.name, 80),
            type: cleanText(item.type, 30) || "Custom",
            aliases: [],
            custom: true,
            parts: Object.fromEntries(Object.entries(item.parts)
              .filter(([key, value]) => FOCUS_OPTIONS.includes(key) && cleanText(value, 700))
              .map(([key, value]) => [key, cleanText(value, 700)]))
          }))
          .filter(item => Object.keys(item.parts).length)
        : [];
    } catch {
      customProfiles = [];
    }
  }

  function saveCustomProfiles() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customProfiles.map(({ name, type, parts }) => ({ name, type, parts }))));
      return true;
    } catch {
      return false;
    }
  }

  function libraryProfiles() {
    const result = [];
    const seen = new Set();
    Object.entries(globalThis.DATA?.categories || {}).forEach(([category, tags]) => {
      (tags || []).forEach(tag => {
        const key = normalize(tag);
        if (!key || seen.has(key)) return;
        seen.add(key);
        const trait = cleanText(globalThis.describeSimplistTag?.(tag, category));
        if (!trait) return;
        const focus = categoryFocus(category, tag);
        result.push({
          name: tag,
          type: category === "Instruments" ? "Instrument" : `Library · ${category}`,
          aliases: [],
          library: true,
          category,
          parts: focus === "Sound" ? { Auto: trait } : { Auto: trait, [focus]: trait }
        });
      });
    });
    return result;
  }

  function rebuildSearchIndex() {
    const builtIns = Array.isArray(globalThis.SIMPLIST_SOUND_PROFILES)
      ? [...globalThis.SIMPLIST_SOUND_PROFILES]
      : [];
    const library = libraryProfiles();
    searchableProfiles = [...customProfiles, ...builtIns, ...library].map((item, index) => {
      const genres = Array.isArray(item.genres) ? item.genres : [];
      return {
        ...item,
        _index: index,
        _names: [
          item.name,
          ...(item.aliases || []),
          item.era,
          ...genres,
          item.era && genres.length ? `${item.era} ${genres.join(" ")}` : ""
        ].map(normalize).filter(Boolean)
      };
    });
    nodes.soundProfileCount.textContent = `${builtIns.length + customProfiles.length} named profiles · ${library.length.toLocaleString()} library sounds`;
    renderNinetiesBrowser();
  }

  function renderNinetiesBrowser() {
    if (!nodes.ninetiesGenreFilter || !nodes.ninetiesSoundGrid) return;
    const profiles = searchableProfiles
      .filter(profile => profile.era === "1990s" && !profile.custom && !profile.library);
    const genres = [...new Set(profiles.flatMap(profile => profile.genres || []))]
      .sort((a, b) => a.localeCompare(b));
    const previousGenre = nodes.ninetiesGenreFilter.value;
    nodes.ninetiesGenreFilter.replaceChildren();
    ["All 1990s", ...genres].forEach(genre => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      nodes.ninetiesGenreFilter.appendChild(option);
    });
    nodes.ninetiesGenreFilter.value = genres.includes(previousGenre) ? previousGenre : "All 1990s";

    const activeGenre = nodes.ninetiesGenreFilter.value;
    const filtered = profiles
      .filter(profile => activeGenre === "All 1990s" || profile.genres?.includes(activeGenre))
      .sort((a, b) => a.name.localeCompare(b.name));
    nodes.ninetiesSoundCount.textContent = `${filtered.length} sounds`;
    nodes.ninetiesSoundGrid.replaceChildren();
    filtered.forEach(profile => {
      const button = document.createElement("button");
      const name = document.createElement("strong");
      const details = document.createElement("small");
      button.type = "button";
      button.className = "nineties-sound-button";
      name.textContent = profile.name;
      details.textContent = `${profile.type} · ${(profile.genres || []).join(" / ")}`;
      button.append(name, details);
      button.addEventListener("click", () => {
        const slot = inputFor(1).value.trim() ? 2 : 1;
        selected[slot] = profile;
        inputFor(slot).value = profile.name;
        focusFor(slot).value = "Auto";
        renderMatches(slot);
        updateReferenceStatus(slot, profile, "1990s pick");
        showMessage(`${profile.name} was placed in Sound ${slot}. Choose another sound or build the description.`);
      });
      nodes.ninetiesSoundGrid.appendChild(button);
    });
  }

  function scoreProfile(profile, query) {
    if (!query) return profile._index < 3 ? 100 - profile._index : -1;
    let best = -1;
    profile._names.forEach(name => {
      if (name === query) best = Math.max(best, 1000);
      else if (name.startsWith(query)) best = Math.max(best, 760 - Math.abs(name.length - query.length));
      else if (name.includes(query)) best = Math.max(best, 620 - Math.abs(name.length - query.length));
      else if (query.includes(name) && name.length >= 3) best = Math.max(best, 560 - Math.abs(name.length - query.length));
      else {
        const queryWords = query.split(" ").filter(word => word.length > 1);
        const matches = queryWords.filter(word => name.includes(word)).length;
        if (matches && matches === queryWords.length) best = Math.max(best, 420 + matches * 8);
      }
    });
    if (profile.custom && best >= 0) best += 20;
    if (!profile.library && best >= 0) best += 10;
    return best;
  }

  function findProfiles(value, limit = 6) {
    const query = normalize(value);
    return searchableProfiles
      .map(profile => ({ profile, score: scoreProfile(profile, query) }))
      .filter(match => match.score >= 0)
      .sort((a, b) => b.score - a.score || a.profile.name.localeCompare(b.profile.name))
      .slice(0, limit)
      .map(match => match.profile);
  }

  function inputFor(slot) {
    return nodes[`soundReference${slot}`];
  }

  function focusFor(slot) {
    return nodes[`soundFocus${slot}`];
  }

  function statusFor(slot) {
    return nodes[`soundReferenceStatus${slot}`];
  }

  function renderMatches(slot) {
    const container = nodes[`soundMatches${slot}`];
    const value = inputFor(slot).value;
    const matches = findProfiles(value, value.trim() ? 5 : 3);
    container.replaceChildren();
    matches.forEach(profile => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sound-match-button";
      button.textContent = `${profile.name} · ${profile.type}`;
      button.dataset.selected = String(selected[slot] === profile);
      button.addEventListener("click", () => {
        selected[slot] = profile;
        inputFor(slot).value = profile.name;
        updateReferenceStatus(slot, profile);
        renderMatches(slot);
      });
      container.appendChild(button);
    });

    if (!value.trim()) {
      statusFor(slot).textContent = slot === 1 ? "Choose an example or start typing a name or sound." : "Leave empty to describe one sound.";
      statusFor(slot).removeAttribute("data-state");
    } else if (!matches.length) {
      statusFor(slot).textContent = "No built-in match yet. Add this sound below and it will stay searchable.";
      statusFor(slot).dataset.state = "error";
    } else {
      const exact = matches.find(profile => profile._names.includes(normalize(value)));
      updateReferenceStatus(slot, exact || matches[0], exact ? "Matched" : "Closest match");
    }
  }

  function resolveTrait(profile, requested) {
    const parts = profile?.parts || {};
    let usedKey = requested;
    let trait = parts[requested];
    let fallback = false;

    if (!trait && requested === "Auto") {
      usedKey = parts.Auto ? "Auto" : (parts["Full Sound"] ? "Full Sound" : Object.keys(parts)[0]);
      trait = parts[usedKey];
    } else if (!trait) {
      usedKey = parts["Full Sound"] ? "Full Sound" : (parts.Auto ? "Auto" : Object.keys(parts)[0]);
      trait = parts[usedKey];
      fallback = true;
    }

    return {
      trait: cleanText(trait),
      focus: semanticFocus(profile, requested, usedKey),
      usedKey,
      fallback
    };
  }

  function updateReferenceStatus(slot, profile, prefix = "Matched") {
    const status = statusFor(slot);
    if (!profile) return;
    const resolved = resolveTrait(profile, focusFor(slot).value);
    const fallbackNote = resolved.fallback ? ` · ${focusFor(slot).value} is not separate, so Full Sound is used` : "";
    status.textContent = `${prefix}: ${profile.name} · ${profile.type} · ${resolved.focus}${fallbackNote}`;
    status.removeAttribute("data-state");
  }

  function resolveReference(slot, required) {
    const value = cleanText(inputFor(slot).value, 100);
    if (!value) {
      if (required) {
        statusFor(slot).textContent = "Enter the first sound you want to describe.";
        statusFor(slot).dataset.state = "error";
      }
      return null;
    }

    const current = selected[slot];
    const profile = current?._names?.includes(normalize(value)) ? current : findProfiles(value, 1)[0];
    if (!profile) {
      statusFor(slot).textContent = "This sound is not in the built-in library yet. Save its description below first.";
      statusFor(slot).dataset.state = "error";
      nodes.customSoundDetails.open = true;
      if (!nodes.customSoundName.value) nodes.customSoundName.value = value;
      return null;
    }

    selected[slot] = profile;
    const resolved = resolveTrait(profile, focusFor(slot).value);
    if (!resolved.trait) return null;
    updateReferenceStatus(slot, profile);
    return { profile, ...resolved, entered: value };
  }

  function withoutNames(value, references) {
    let clean = value;
    const names = references.flatMap(reference => [
      reference?.entered,
      reference?.profile?.name,
      ...(reference?.profile?.aliases || [])
    ]).map(item => cleanText(item, 100)).filter(item => item.length >= 3).sort((a, b) => b.length - a.length);
    [...new Set(names)].forEach(name => {
      clean = clean.replace(new RegExp(`\\b${escapeRegExp(name)}\\b`, "gi"), "");
    });
    return clean.replace(/\s+([,.;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
  }

  function resultLabel(focus) {
    if (focus === "Vocals") return "Vocals";
    if (focus === "Full Sound") return "Overall sound";
    if (focus === "Sound") return "Sound";
    return focus;
  }

  function buildDescription(first, second) {
    if (!second) return `${resultLabel(first.focus)}: ${sentence(first.trait)}.`.slice(0, 1000);
    let result;
    if (first.focus === second.focus) {
      const subject = first.focus === "Vocals" ? "Vocal sound" : `${resultLabel(first.focus)} sound`;
      result = `${subject} blends ${first.trait.charAt(0).toLowerCase()}${first.trait.slice(1)} with ${second.trait.charAt(0).toLowerCase()}${second.trait.slice(1)}.`;
    } else {
      result = `${resultLabel(first.focus)}: ${sentence(first.trait)}. ${resultLabel(second.focus)}: ${sentence(second.trait)}.`;
    }
    return withoutNames(result, [first, second]).slice(0, 1000);
  }

  function updateResultControls() {
    const text = cleanText(nodes.soundBlendResult.value);
    nodes.soundBlendCount.textContent = `${text.length} / 1,000`;
    [nodes.addBlendToPromptBtn, nodes.replacePromptWithBlendBtn, nodes.copySoundBlendBtn]
      .forEach(button => { button.disabled = !text; });
  }

  function showMessage(message, state = "") {
    nodes.soundBlendMessage.textContent = message;
    if (state) nodes.soundBlendMessage.dataset.state = state;
    else nodes.soundBlendMessage.removeAttribute("data-state");
  }

  function handleBuild(event) {
    event.preventDefault();
    const first = resolveReference(1, true);
    const secondValue = inputFor(2).value.trim();
    const second = secondValue ? resolveReference(2, false) : null;
    if (!first || (secondValue && !second)) {
      showMessage("I could not build this yet. Fix the marked reference or save its sound below.", "error");
      return;
    }
    const result = withoutNames(buildDescription(first, second), [first, second].filter(Boolean));
    nodes.soundBlendResult.value = result;
    updateResultControls();
    showMessage(second
      ? "Blend ready. The reference names were removed; edit anything you want before sending it to your prompt."
      : "Sound description ready. The reference name was removed; edit anything you want before sending it to your prompt.");
  }

  function applyToPrompt(mode) {
    const text = cleanText(nodes.soundBlendResult.value);
    if (!text) return;
    const detail = { text, mode, applied: false };
    nodes.styleOutput.dispatchEvent(new CustomEvent("simplist:apply-sound-blend", { detail }));
    if (!detail.applied) {
      showMessage("The prompt builder did not accept the sound. Nothing was changed.", "error");
      return;
    }
    nodes.soundPageBtn.click();
    showMessage(mode === "replace" ? "Your Sound prompt was replaced with this description." : "This description was added to your Sound prompt.");
    window.requestAnimationFrame(() => nodes.stylePanel?.scrollIntoView({ block: "start", behavior: "smooth" }));
  }

  async function copyResult() {
    const text = cleanText(nodes.soundBlendResult.value);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      nodes.copySoundBlendBtn.textContent = "Copied";
      showMessage("Sound description copied.");
    } catch {
      nodes.soundBlendResult.focus();
      nodes.soundBlendResult.select();
      nodes.copySoundBlendBtn.textContent = "Selected";
      showMessage("The description is selected. Use your device's Copy command.");
    }
    window.setTimeout(() => { nodes.copySoundBlendBtn.textContent = "Copy"; }, 1400);
  }

  function saveCustomSound(event) {
    event.preventDefault();
    const name = cleanText(nodes.customSoundName.value, 80);
    const type = cleanText(nodes.customSoundType.value, 30);
    const focus = nodes.customSoundFocus.value;
    let description = cleanText(nodes.customSoundDescription.value, 700);
    description = withoutNames(description, [{ entered: name, profile: { name, aliases: [] } }]);
    if (!name || !description) {
      nodes.customSoundStatus.textContent = "Enter both a searchable name and what that sound actually sounds like.";
      nodes.customSoundStatus.dataset.state = "error";
      return;
    }

    const key = normalize(name);
    let saved = customProfiles.find(profile => normalize(profile.name) === key);
    if (saved) {
      saved.type = type;
      saved.parts = { ...saved.parts, [focus]: description };
    } else {
      saved = { name, type, aliases: [], custom: true, parts: { [focus]: description } };
      customProfiles.unshift(saved);
    }
    if (!saveCustomProfiles()) {
      nodes.customSoundStatus.textContent = "This browser would not allow the sound to be saved. Nothing was erased.";
      nodes.customSoundStatus.dataset.state = "error";
      return;
    }
    rebuildSearchIndex();
    nodes.customSoundStatus.textContent = `${name} · ${focus} saved. It is searchable now.`;
    nodes.customSoundStatus.removeAttribute("data-state");
    inputFor(1).value = name;
    selected[1] = searchableProfiles.find(profile => profile.custom && normalize(profile.name) === key) || null;
    renderMatches(1);
    nodes.customSoundDescription.value = "";
  }

  function cacheNodes() {
    [
      "soundProfileCount", "soundBlendForm", "soundReference1", "soundFocus1", "soundMatches1", "soundReferenceStatus1",
      "soundReference2", "soundFocus2", "soundMatches2", "soundReferenceStatus2", "soundBlendResult", "soundBlendCount",
      "soundBlendMessage", "addBlendToPromptBtn", "replacePromptWithBlendBtn", "copySoundBlendBtn", "customSoundDetails",
      "customSoundForm", "customSoundName", "customSoundType", "customSoundFocus", "customSoundDescription", "customSoundStatus",
      "ninetiesSoundDetails", "ninetiesGenreFilter", "ninetiesSoundCount", "ninetiesSoundGrid",
      "styleOutput", "stylePanel", "soundPageBtn"
    ].forEach(id => { nodes[id] = document.getElementById(id); });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    cacheNodes();
    if (!nodes.soundBlendForm || !nodes.styleOutput) return;
    loadCustomProfiles();
    rebuildSearchIndex();
    [1, 2].forEach(slot => {
      inputFor(slot).addEventListener("input", () => {
        selected[slot] = null;
        renderMatches(slot);
      });
      focusFor(slot).addEventListener("change", () => {
        const match = selected[slot] || findProfiles(inputFor(slot).value, 1)[0];
        if (match) updateReferenceStatus(slot, match);
      });
      renderMatches(slot);
    });
    nodes.soundBlendForm.addEventListener("submit", handleBuild);
    nodes.soundBlendResult.addEventListener("input", updateResultControls);
    nodes.addBlendToPromptBtn.addEventListener("click", () => applyToPrompt("add"));
    nodes.replacePromptWithBlendBtn.addEventListener("click", () => applyToPrompt("replace"));
    nodes.copySoundBlendBtn.addEventListener("click", copyResult);
    nodes.customSoundForm.addEventListener("submit", saveCustomSound);
    nodes.ninetiesGenreFilter.addEventListener("change", renderNinetiesBrowser);
    updateResultControls();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
