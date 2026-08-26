"use strict";

(() => {
  const STORAGE_KEY = "sunoForgeTagStudioV4";
  const LEGACY_STORAGE_KEYS = ["sunoForgeProjectV3", "forgePromptGeneratorV2"];
  const FOCUSED_LIMIT = 2;
  const EXTENDED_CHARACTER_LIMIT = 1000;

  const MAIN_CATEGORIES = [
    "Genre",
    "Mood",
    "Vocals",
    "Vocal Delivery",
    "Vocal Range & Register",
    "Instruments",
    "Production"
  ];

  const OPTIONAL_CATEGORIES = [
    "Vocal Arrangement",
    "Harmony & Choir",
    "Era",
    "Rhythm & Groove",
    "Effects",
    "Mix & Master",
    "Recording Space",
    "Texture & Atmosphere",
    "Language",
    "Key",
    "Writing",
    "Arrangement",
    "Performance"
  ];

  const OUTPUT_ORDER = [...MAIN_CATEGORIES, ...OPTIONAL_CATEGORIES];

  const SHORT_LABELS = {
    "Vocal Delivery": "Delivery",
    "Vocal Range & Register": "Vocal Range",
    "Vocal Arrangement": "Vocal Arrange",
    "Harmony & Choir": "Harmony",
    "Rhythm & Groove": "Groove",
    "Mix & Master": "Mix",
    "Recording Space": "Space",
    "Texture & Atmosphere": "Texture"
  };

  const MOOD_FAMILIES = [
    {
      label: "Mellow & Gentle",
      tags: [
        "Calm", "Dreamy", "Hopeful", "Intimate", "Tender", "Warm", "Fragile",
        "Grateful", "Peaceful", "Serene", "Spiritual", "Vulnerable"
      ]
    },
    {
      label: "Bright & Uplifting",
      tags: [
        "Confident", "Energetic", "Euphoric", "Happy", "Playful", "Powerful",
        "Triumphant", "Uplifting", "Celebratory", "Ecstatic", "Empowering", "Hilarious",
        "Joyful", "Optimistic", "Determined"
      ]
    },
    {
      label: "Reflective & Romantic",
      tags: [
        "Bittersweet", "Emotional", "Melancholic", "Nostalgic", "Romantic", "Sad",
        "Detached", "Reflective", "Lonely", "Yearning", "Contemplative", "Flirtatious",
        "Heartbroken", "Mournful", "Regretful", "Somber", "Wry"
      ]
    },
    {
      label: "Dark & Uneasy",
      tags: [
        "Dark", "Haunting", "Mysterious", "Suspenseful", "Uneasy", "Paranoid", "Cold",
        "Anxious", "Brooding", "Creepy", "Eerie", "Menacing", "Sinister", "Tense"
      ]
    },
    {
      label: "Intense & Extreme",
      tags: [
        "Aggressive", "Apocalyptic", "Restless", "Defiant", "Desperate", "Reckless",
        "Angry", "Chaotic", "Devastated", "Gritty", "Hypnotic", "Seductive"
      ]
    }
  ];

  const GROUP_BLUEPRINTS = {
    Vocals: [
      ["Voice & Ensemble", 0, 16],
      ["Spoken & Extreme", 16, 24],
      ["Tone & Character", 24, 38],
      ["Genre Vocal Styles", 38, 48]
    ],
    "Vocal Delivery": [
      ["Placement & Phrasing", 0, 16],
      ["Emotion & Power", 16, 28],
      ["Special Techniques", 28, 37],
      ["Runs, Slides & Vibrato", 37, 48],
      ["Phrase Shapes", 48, 54]
    ],
    "Vocal Range & Register": [
      ["Traditional Voice Types", 0, 12],
      ["Range & Melody Shape", 12, 18],
      ["Head, Chest & Falsetto", 18, 24],
      ["Extreme Registers", 24, 30]
    ],
    Production: [
      ["Fidelity & Format", 0, 8],
      ["Dynamics & Weight", 8, 15],
      ["Color & Texture", 15, 24],
      ["Tone & Space", 24, 31],
      ["Playback & Scale", 31, 43],
      ["Recording Character", 43, 49],
      ["Construction & Finish", 49, 62]
    ],
    "Vocal Arrangement": [
      ["Unison, Doubles & Harmony", 0, 16],
      ["Duets & Responses", 16, 24],
      ["Solo, Group & Crowd", 24, 32],
      ["Layers & Chorus Builds", 32, 44],
      ["Background Hooks", 44, 55],
      ["Spoken, Rap & Characters", 55, 62]
    ],
    "Harmony & Choir": [
      ["Choir Types", 0, 16],
      ["Choir Movement & Color", 16, 24],
      ["Genre Harmonies", 24, 34],
      ["Modern Harmony Shapes", 34, 40],
      ["Harmony Motion & Endings", 40, 45]
    ],
    "Rhythm & Groove": [
      ["Core Feel & Time", 0, 6],
      ["Genre Grooves", 6, 19],
      ["Meters & Polyrhythm", 19, 29],
      ["Pocket & Breaks", 29, 43],
      ["World Rhythms & Minimal", 43, 50]
    ],
    "Mix & Master": [
      ["Forward Elements", 0, 7],
      ["Width & Placement", 7, 16],
      ["Frequency Shape", 16, 27],
      ["Dynamics & Loudness", 27, 37],
      ["Format & Environment", 37, 45]
    ],
    Effects: [
      ["Core Effects", 0, 12],
      ["Vocal Tuning & Doubling", 12, 16],
      ["Delay & Reverb", 16, 26],
      ["Filters & Pitch", 26, 36],
      ["Granular & Movement", 36, 50],
      ["Transitions & Noise", 50, 62]
    ],
    Era: [
      ["Historic", 0, 6],
      ["Modern Decades", 6, 12],
      ["Vintage Movements", 12, 20],
      ["Broadcast & Technology", 20, 26],
      ["Future & Timeless", 26, 30]
    ],
    Language: [
      ["Western Europe", 0, 7],
      ["East & South Asia", 7, 13],
      ["Global Languages", 13, 19],
      ["Mixed or No Language", 19, 22]
    ],
    Key: [
      ["Natural Major & Minor", 0, 14],
      ["Sharp Major & Minor", 14, 24],
      ["Modes", 24, 30],
      ["Scales", 30, 35],
      ["Ambiguous", 35, 36]
    ],
    Writing: [
      ["Voice & Point of View", 0, 10],
      ["Rhyme & Sound", 10, 22],
      ["Story & Imagery", 22, 34],
      ["Form & Repetition", 34, 46],
      ["Literary Devices", 46, 56],
      ["Special Formats", 56, 64]
    ],
    Arrangement: [
      ["Builds & Openings", 0, 12],
      ["Section Energy", 12, 22],
      ["Breaks & Transitions", 22, 34],
      ["Drops & Climaxes", 34, 45],
      ["Instrumental Movement", 45, 54],
      ["Endings", 54, 62]
    ],
    Performance: [
      ["Setting & Capture", 0, 8],
      ["Scale & Audience", 8, 16],
      ["Player Character", 16, 27],
      ["Human Detail", 27, 36]
    ],
    "Recording Space": [
      ["Dry & Small Rooms", 0, 6],
      ["Clubs & Halls", 6, 12],
      ["Industrial Spaces", 12, 18],
      ["Outdoor & Unusual", 18, 26],
      ["Vehicles & Studios", 26, 30]
    ],
    "Texture & Atmosphere": [
      ["Density & Temperature", 0, 8],
      ["Material Character", 8, 16],
      ["Motion & Depth", 16, 24],
      ["Weather & Environment", 24, 32],
      ["Noise & Silence", 32, 40]
    ]
  };

  const VOCALIZED_GENRES = new Set([
    "A Cappella", "Barbershop", "Doo-Wop", "Sea Shanties", "Vocal Jazz", "Gospel",
    "Gospel Folk", "Gospel Ballad", "Hymn", "Bluegrass Gospel", "Old-Time Gospel",
    "Southern Gospel", "Contemporary Christian", "Worship Music", "Praise Music",
    "Sacred Harp", "Shape Note", "Spiritual", "Gregorian Chant", "Choral", "Opera",
    "Operetta", "Musical Theatre", "Cabaret", "Qawwali", "Ghazal"
  ]);

  const nodes = {};
  const categorySets = new Map();
  const familyCache = new Map();
  let advanceTimer = 0;
  let toastTimer = 0;
  let fitFrame = 0;
  let expandedFamilyIndex = -1;
  let initialized = false;

  const state = {
    activeCategory: "Genre",
    mode: "focused",
    selected: Object.create(null)
  };

  function categories() {
    return DATA?.categories || {};
  }

  function categoryLabel(category) {
    return SHORT_LABELS[category] || category;
  }

  function tagDescription(tag, category) {
    const description = globalThis.describeSimplistTag?.(tag, category);
    return typeof description === "string" && description.trim()
      ? description.trim()
      : "This choice changes a specific audible part of the track's tone, movement, structure, or performance.";
  }

  function unique(values) {
    return [...new Set(values)];
  }

  function safeJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function buildCategorySets() {
    Object.entries(categories()).forEach(([category, tags]) => {
      categorySets.set(category, new Set(tags));
    });
  }

  function emptySelections() {
    const result = Object.create(null);
    OUTPUT_ORDER.forEach(category => {
      result[category] = [];
    });
    return result;
  }

  function migrateLegacySelected(raw) {
    const result = emptySelections();
    const source = Array.isArray(raw?.selected) ? raw.selected : [];
    source.forEach(tag => {
      const category = OUTPUT_ORDER.find(name => categorySets.get(name)?.has(tag));
      if (category && !result[category].includes(tag)) result[category].push(tag);
    });
    return result;
  }

  function loadState() {
    const saved = safeJson(STORAGE_KEY);
    const legacy = LEGACY_STORAGE_KEYS.map(safeJson).find(Boolean);
    const source = saved?.selected && !Array.isArray(saved.selected)
      ? saved.selected
      : migrateLegacySelected(legacy || saved || {});

    state.mode = saved?.mode === "extended" ? "extended" : "focused";
    state.activeCategory = OUTPUT_ORDER.includes(saved?.activeCategory) ? saved.activeCategory : "Genre";
    state.selected = emptySelections();

    OUTPUT_ORDER.forEach(category => {
      const allowed = categorySets.get(category) || new Set();
      const values = Array.isArray(source?.[category]) ? source[category] : [];
      const valid = unique(values.filter(tag => allowed.has(tag)));
      state.selected[category] = state.mode === "focused" ? valid.slice(0, FOCUSED_LIMIT) : valid;
    });

    if (state.mode === "extended") trimExtendedToLimit();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        activeCategory: state.activeCategory,
        mode: state.mode,
        selected: state.selected
      }));
    } catch {
      // The tag studio still works if browser storage is unavailable.
    }
  }

  function splitFromStarts(category) {
    const tags = categories()[category] || [];
    const starts = DATA?.categoryGroups?.[category] || [];
    if (!starts.length) return [];
    return starts.map((group, index) => {
      const start = tags.indexOf(group.start);
      const nextStart = index + 1 < starts.length ? tags.indexOf(starts[index + 1].start) : tags.length;
      return {
        label: group.label,
        tags: tags.slice(start, nextStart)
      };
    });
  }

  function genreFamilies() {
    const source = splitFromStarts("Genre");
    const vocalized = (categories().Genre || []).filter(tag => VOCALIZED_GENRES.has(tag));
    const cleaned = source.map(group => ({
      label: group.label,
      tags: group.tags.filter(tag => !VOCALIZED_GENRES.has(tag))
    }));
    const byLabel = new Map(cleaned.map(group => [group.label, group]));
    const orderedLabels = [
      "Country, Folk, Roots & Acoustic",
      "Classical, Orchestral & Cinematic",
      "Pop, Vocal & Accessible",
      "Rock, Punk & Alternative",
      "Metal & Extreme",
      "Hip-Hop, Rap & Beat Styles",
      "R&B, Soul, Funk, Disco & Gospel",
      "Electronic Dance & Club",
      "Ambient, Experimental, Industrial & Noise",
      "Jazz & Blues",
      "Reggae & Caribbean",
      "Latin & Iberian",
      "African & Afro-Diasporic",
      "Asian, Middle Eastern & Global",
      "Theatrical, Novelty & Other Hybrids"
    ];
    const result = [{ label: "Vocalized & Harmony", tags: vocalized }];
    orderedLabels.forEach(label => {
      const group = byLabel.get(label);
      if (!group?.tags.length) return;
      const renamed = {
        "Country, Folk, Roots & Acoustic": "Acoustic, Folk & Roots",
        "Classical, Orchestral & Cinematic": "Classical & Cinematic",
        "Pop, Vocal & Accessible": "Pop & Accessible"
      }[label] || label;
      result.push({ label: renamed, tags: group.tags });
    });
    return result;
  }

  function explicitFamilies(category, definitions) {
    const available = categories()[category] || [];
    const used = new Set();
    const result = definitions.map(definition => {
      const tags = definition.tags.filter(tag => available.includes(tag));
      tags.forEach(tag => used.add(tag));
      return { label: definition.label, tags };
    }).filter(group => group.tags.length);
    const remaining = available.filter(tag => !used.has(tag));
    if (remaining.length) result.push({ label: `More ${category}`, tags: remaining });
    return result;
  }

  function blueprintFamilies(category) {
    const tags = categories()[category] || [];
    const blueprint = GROUP_BLUEPRINTS[category];
    if (blueprint) {
      return blueprint
        .map(([label, start, end]) => ({ label, tags: tags.slice(start, end) }))
        .filter(group => group.tags.length);
    }

    const groupCount = Math.min(5, Math.max(1, Math.ceil(tags.length / 14)));
    const size = Math.ceil(tags.length / groupCount);
    return Array.from({ length: groupCount }, (_, index) => ({
      label: `${category} ${index + 1}`,
      tags: tags.slice(index * size, (index + 1) * size)
    })).filter(group => group.tags.length);
  }

  function familiesFor(category) {
    if (familyCache.has(category)) return familyCache.get(category);
    let families;
    if (category === "Genre") families = genreFamilies();
    else if (category === "Instruments") families = splitFromStarts("Instruments");
    else if (category === "Mood") families = explicitFamilies("Mood", MOOD_FAMILIES);
    else families = blueprintFamilies(category);
    familyCache.set(category, families);
    return families;
  }

  function allSelectedTags(selected = state.selected) {
    return OUTPUT_ORDER.flatMap(category => selected[category] || []);
  }

  function styleText(selected = state.selected) {
    return allSelectedTags(selected).join(", ");
  }

  function trimExtendedToLimit() {
    const next = emptySelections();
    OUTPUT_ORDER.forEach(category => {
      for (const tag of state.selected[category] || []) {
        const candidate = { ...next, [category]: [...next[category], tag] };
        if (styleText(candidate).length > EXTENDED_CHARACTER_LIMIT) return;
        next[category].push(tag);
      }
    });
    state.selected = next;
  }

  function toast(message) {
    window.clearTimeout(toastTimer);
    nodes.toast.textContent = message;
    nodes.toast.classList.add("show");
    toastTimer = window.setTimeout(() => nodes.toast.classList.remove("show"), 1800);
  }

  function fitFamilyWall() {
    const viewportWidth = nodes.familyViewport.clientWidth;
    const viewportHeight = nodes.familyViewport.clientHeight;
    if (!viewportWidth || !viewportHeight || !nodes.familyBoard.children.length) return;

    const familyCount = familiesFor(state.activeCategory).length;
    const widths = unique([
      Math.round(viewportWidth),
      Math.max(620, Math.round(viewportWidth * 1.35)),
      Math.max(820, Math.round(viewportWidth * 1.7)),
      Math.max(1040, Math.round(viewportWidth * 2.05))
    ]);
    let best = null;

    nodes.familyBoard.style.setProperty("--wall-scale", "1");
    widths.forEach(width => {
      const maximumColumns = Math.min(familyCount, Math.max(1, Math.floor(width / 185)));
      for (let columns = 1; columns <= maximumColumns; columns += 1) {
        nodes.familyBoard.style.setProperty("--wall-width", `${width}px`);
        nodes.familyBoard.style.setProperty("--family-columns", String(columns));
        const naturalHeight = Math.max(nodes.familyBoard.scrollHeight, nodes.familyBoard.offsetHeight, 1);
        const scale = Math.min(viewportWidth / width, viewportHeight / naturalHeight, 1);
        if (!best || scale > best.scale) best = { width, columns, scale };
      }
    });

    if (!best) return;
    nodes.familyBoard.style.setProperty("--wall-width", `${best.width}px`);
    nodes.familyBoard.style.setProperty("--family-columns", String(best.columns));
    nodes.familyBoard.style.setProperty("--wall-scale", String(best.scale));
    nodes.familyBoard.dataset.fitScale = best.scale.toFixed(3);
  }

  function scheduleFitFamilyWall() {
    window.cancelAnimationFrame(fitFrame);
    fitFrame = window.requestAnimationFrame(fitFamilyWall);
  }

  function expandedColumns(count) {
    if (window.innerWidth <= 480) {
      if (count > 80) return 5;
      if (count > 50) return 4;
      if (count > 24) return 3;
      return 2;
    }
    if (window.innerWidth <= 800) {
      if (count > 80) return 7;
      if (count > 50) return 6;
      if (count > 30) return 5;
      return 4;
    }
    if (count > 80) return 9;
    if (count > 50) return 8;
    if (count > 30) return 7;
    return Math.min(6, Math.max(3, count));
  }

  function renderLibraryStats() {
    const counts = Object.values(categories()).map(tags => tags.length);
    const total = counts.reduce((sum, count) => sum + count, 0);
    nodes.libraryStats.textContent = `${total.toLocaleString()} tags · ${Object.keys(categories()).length} categories · nothing removed`;
  }

  function renderMainTabs() {
    nodes.mainCategoryTabs.replaceChildren();
    MAIN_CATEGORIES.forEach(category => {
      const button = document.createElement("button");
      const count = state.selected[category]?.length || 0;
      button.type = "button";
      button.className = "category-tab";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(state.activeCategory === category));
      button.innerHTML = `<span>${categoryLabel(category)}</span><small>${count ? `${count} selected` : "Choose 2"}</small>`;
      button.addEventListener("click", () => chooseCategory(category));
      nodes.mainCategoryTabs.appendChild(button);
    });

    const optionalActive = OPTIONAL_CATEGORIES.includes(state.activeCategory);
    nodes.optionsBtn.classList.toggle("active", optionalActive);
    nodes.optionsActiveLabel.textContent = optionalActive ? categoryLabel(state.activeCategory) : "More tags";
  }

  function renderOptionalCategories() {
    nodes.optionalCategoryGrid.replaceChildren();
    OPTIONAL_CATEGORIES.forEach(category => {
      const button = document.createElement("button");
      const selectedCount = state.selected[category]?.length || 0;
      button.type = "button";
      button.className = `optional-category-button${state.activeCategory === category ? " active" : ""}`;
      button.innerHTML = `<strong>${categoryLabel(category)}</strong><span>${categories()[category].length} choices${selectedCount ? ` · ${selectedCount} selected` : ""}</span>`;
      button.addEventListener("click", () => chooseCategory(category, { closeOptions: true }));
      nodes.optionalCategoryGrid.appendChild(button);
    });
  }

  function renderCategoryHeader() {
    const selectedCount = state.selected[state.activeCategory]?.length || 0;
    const optional = OPTIONAL_CATEGORIES.includes(state.activeCategory);
    nodes.activeCategoryTitle.textContent = state.activeCategory;
    nodes.activeCategoryHelp.textContent = state.mode === "focused"
      ? `Every choice is visible together. Pick up to ${FOCUSED_LIMIT}${optional ? "." : "; the next main category opens automatically."}`
      : "Every choice is visible together; this category stays open until you switch tabs.";
    nodes.categorySelectionStatus.textContent = state.mode === "focused"
      ? `${selectedCount} / ${FOCUSED_LIMIT} selected`
      : `${selectedCount} selected`;
  }

  function createTagButton(tag, className) {
    const activeCategory = state.activeCategory;
    const selected = state.selected[state.activeCategory] || [];
    const focusedFull = state.mode === "focused" && selected.length >= FOCUSED_LIMIT;
    const isSelected = selected.includes(tag);
    const description = tagDescription(tag, activeCategory);
    const button = document.createElement("button");
    const label = document.createElement("strong");
    const detail = document.createElement("span");
    button.type = "button";
    button.className = `${className} v10-tag`;
    button.dataset.tag = tag;
    button.dataset.name = tag;
    button.dataset.category = activeCategory;
    button.setAttribute("aria-pressed", String(isSelected));
    button.setAttribute("aria-label", `${tag}. ${description}`);
    button.title = `${tag}: ${description}`;
    button.disabled = focusedFull && !isSelected;
    label.textContent = tag;
    detail.className = "tag-description";
    detail.textContent = description;
    button.append(label, detail);
    button.addEventListener("click", event => {
      event.stopPropagation();
      toggleTag(tag);
    });
    return button;
  }

  function renderFamilyWall() {
    const families = familiesFor(state.activeCategory);
    nodes.familyBoard.replaceChildren();
    nodes.familyBoard.style.setProperty("--wall-scale", "1");
    nodes.familyBoard.setAttribute("aria-label", `${state.activeCategory} families with every choice`);
    nodes.familyHeading.textContent = `${state.activeCategory} families`;
    nodes.familySummary.textContent = `${families.length} boxes · all ${categories()[state.activeCategory].length} choices · tap a title to enlarge`;

    families.forEach((family, index) => {
      const card = document.createElement("section");
      const header = document.createElement("button");
      const tagGrid = document.createElement("div");

      card.className = "family-card";
      header.type = "button";
      header.className = "family-card-header";
      header.setAttribute("aria-haspopup", "dialog");
      header.setAttribute("aria-label", `Enlarge ${family.label}, ${family.tags.length} choices`);
      header.innerHTML = `<strong>${family.label}</strong><span>${family.tags.length} · enlarge ↗</span>`;
      header.addEventListener("click", () => openFamilyDialog(index));

      tagGrid.className = "family-tag-grid";
      tagGrid.setAttribute("role", "group");
      tagGrid.setAttribute("aria-label", `${family.label} choices`);
      family.tags.forEach(tag => tagGrid.appendChild(createTagButton(tag, "wall-tag-button")));

      card.append(header, tagGrid);
      nodes.familyBoard.appendChild(card);
    });

    scheduleFitFamilyWall();
  }

  function renderExpandedFamily() {
    const families = familiesFor(state.activeCategory);
    const family = families[expandedFamilyIndex];
    if (!family) return;

    nodes.expandedFamilyTitle.textContent = family.label;
    nodes.expandedFamilyCount.textContent = `${family.tags.length} choices · all shown together`;
    nodes.expandedTagGrid.style.setProperty("--expanded-columns", String(expandedColumns(family.tags.length)));
    nodes.expandedTagGrid.replaceChildren();
    family.tags.forEach(tag => nodes.expandedTagGrid.appendChild(createTagButton(tag, "expanded-tag-button")));
  }

  function openFamilyDialog(index) {
    expandedFamilyIndex = index;
    renderExpandedFamily();
    if (typeof nodes.familyDialog.showModal === "function") nodes.familyDialog.showModal();
    else nodes.familyDialog.setAttribute("open", "");
  }

  function renderStyle() {
    const text = styleText();
    nodes.styleOutput.value = text;
    nodes.characterCount.textContent = state.mode === "extended"
      ? `${text.length} / ${EXTENDED_CHARACTER_LIMIT}`
      : `${text.length} characters`;
    nodes.styleHint.textContent = state.mode === "focused"
      ? "Focused mode keeps every category to two strong choices. Every library tag remains available."
      : "1,000-character mode stays on the current category and stops selections at Suno’s limit.";
  }

  function renderAll() {
    renderMainTabs();
    renderOptionalCategories();
    renderCategoryHeader();
    renderFamilyWall();
    renderStyle();
    saveState();
  }

  function chooseCategory(category, options = {}) {
    if (!OUTPUT_ORDER.includes(category)) return;
    window.clearTimeout(advanceTimer);
    if (nodes.familyDialog?.open) nodes.familyDialog.close();
    expandedFamilyIndex = -1;
    state.activeCategory = category;
    if (options.closeOptions && nodes.optionsDialog.open) nodes.optionsDialog.close();
    renderAll();
  }

  function toggleTag(tag) {
    const category = state.activeCategory;
    const selected = [...(state.selected[category] || [])];
    const index = selected.indexOf(tag);
    const adding = index < 0;

    if (!adding) {
      selected.splice(index, 1);
    } else if (state.mode === "focused") {
      if (selected.length >= FOCUSED_LIMIT) {
        toast("Focused mode allows two choices in each category.");
        return;
      }
      selected.push(tag);
    } else {
      const candidate = { ...state.selected, [category]: [...selected, tag] };
      if (styleText(candidate).length > EXTENDED_CHARACTER_LIMIT) {
        toast("That choice would exceed the 1,000-character limit.");
        return;
      }
      selected.push(tag);
    }

    state.selected[category] = selected;
    renderMainTabs();
    renderOptionalCategories();
    renderCategoryHeader();
    renderFamilyWall();
    if (nodes.familyDialog.open) renderExpandedFamily();
    renderStyle();
    saveState();

    if (adding && state.mode === "focused" && selected.length === FOCUSED_LIMIT) {
      const currentPosition = MAIN_CATEGORIES.indexOf(category);
      if (currentPosition >= 0 && currentPosition < MAIN_CATEGORIES.length - 1) {
        toast(`${category} set. Opening ${MAIN_CATEGORIES[currentPosition + 1]}.`);
        advanceTimer = window.setTimeout(() => {
          if (state.activeCategory === category && state.mode === "focused") {
            chooseCategory(MAIN_CATEGORIES[currentPosition + 1]);
          }
        }, 650);
      }
    }
  }

  function setMode(mode, changedInput) {
    if (!['focused', 'extended'].includes(mode) || mode === state.mode) return;

    if (mode === "focused") {
      const needsTrim = OUTPUT_ORDER.some(category => (state.selected[category] || []).length > FOCUSED_LIMIT);
      if (needsTrim && !window.confirm("Focused mode keeps the first two choices in every category. Continue?")) {
        changedInput.checked = false;
        nodes.extendedModeInput.checked = true;
        return;
      }
      OUTPUT_ORDER.forEach(category => {
        state.selected[category] = (state.selected[category] || []).slice(0, FOCUSED_LIMIT);
      });
    }

    state.mode = mode;
    renderAll();
    if (nodes.familyDialog.open) renderExpandedFamily();
    toast(mode === "focused" ? "Focused mode: two per category." : "1,000-character mode enabled.");
  }

  async function copyPrompt() {
    const text = nodes.styleOutput.value.trim();
    if (!text) {
      toast("Choose a few tags first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      nodes.copyPromptBtn.textContent = "Copied";
      toast("Style prompt copied.");
    } catch {
      nodes.styleOutput.focus();
      nodes.styleOutput.select();
      nodes.copyPromptBtn.textContent = "Prompt selected";
      toast("Prompt selected. Use your device’s Copy command.");
    }
    window.setTimeout(() => {
      nodes.copyPromptBtn.textContent = "Copy prompt";
    }, 1400);
  }

  function clearAll() {
    if (!allSelectedTags().length) return;
    if (!window.confirm("Clear every selected tag?")) return;
    state.selected = emptySelections();
    chooseCategory("Genre");
    toast("All selections cleared.");
  }

  function openOptions() {
    renderOptionalCategories();
    if (typeof nodes.optionsDialog.showModal === "function") nodes.optionsDialog.showModal();
    else nodes.optionsDialog.setAttribute("open", "");
  }

  function cacheNodes() {
    [
      "libraryStats", "clearAllBtn", "mainCategoryTabs", "optionsBtn",
      "optionsActiveLabel", "tagWorkspace", "activeCategoryTitle", "activeCategoryHelp",
      "categorySelectionStatus", "familyHeading", "familySummary", "familyViewport",
      "familyBoard", "stylePanel", "styleOutput", "characterCount", "styleHint",
      "copyPromptBtn", "familyDialog", "expandedFamilyTitle", "expandedFamilyCount",
      "expandedTagGrid", "optionsDialog", "optionalCategoryGrid", "toast"
    ].forEach(id => {
      nodes[id] = document.getElementById(id);
    });
    nodes.focusedModeInput = document.querySelector('input[name="promptSize"][value="focused"]');
    nodes.extendedModeInput = document.querySelector('input[name="promptSize"][value="extended"]');
  }

  function bindEvents() {
    nodes.optionsBtn.addEventListener("click", openOptions);
    document.querySelectorAll('input[name="promptSize"]').forEach(input => {
      input.addEventListener("change", () => setMode(input.value, input));
    });
    nodes.copyPromptBtn.addEventListener("click", copyPrompt);
    nodes.clearAllBtn.addEventListener("click", clearAll);
    nodes.familyDialog.addEventListener("close", () => {
      expandedFamilyIndex = -1;
    });
    window.addEventListener("resize", () => {
      scheduleFitFamilyWall();
      if (nodes.familyDialog.open) renderExpandedFamily();
    });
  }

  function validateLibrary() {
    const categoryNames = Object.keys(categories());
    const missing = OUTPUT_ORDER.filter(category => !categoryNames.includes(category));
    if (missing.length) throw new Error(`Missing tag categories: ${missing.join(", ")}`);

    const total = Object.values(categories()).reduce((sum, tags) => sum + tags.length, 0);
    if (total < 1941) throw new Error(`Expected at least 1,941 tags, found ${total}.`);

    OUTPUT_ORDER.forEach(category => {
      const source = categories()[category];
      const grouped = familiesFor(category).flatMap(family => family.tags);
      const sourceCounts = new Map();
      const groupedCounts = new Map();
      source.forEach(tag => sourceCounts.set(tag, (sourceCounts.get(tag) || 0) + 1));
      grouped.forEach(tag => groupedCounts.set(tag, (groupedCounts.get(tag) || 0) + 1));
      const multiplicitiesMatch = [...sourceCounts.entries()]
        .every(([tag, count]) => groupedCounts.get(tag) === count);
      if (grouped.length !== source.length || !multiplicitiesMatch) {
        throw new Error(`${category} family grouping lost or duplicated tags.`);
      }
    });
  }

  function init() {
    if (initialized) return;
    initialized = true;
    cacheNodes();
    buildCategorySets();
    validateLibrary();
    loadState();
    nodes.focusedModeInput.checked = state.mode === "focused";
    nodes.extendedModeInput.checked = state.mode === "extended";
    bindEvents();
    renderLibraryStats();
    renderAll();
  }

  document.addEventListener("DOMContentLoaded", init);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }
})();
