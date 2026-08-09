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
  let activeFamilyIndex = 0;
  let pageIndex = 0;
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

  function familyColumns(count) {
    const compact = window.innerWidth <= 800;
    if (count <= 4) return 2;
    if (count <= 6) return compact ? 2 : 3;
    if (count <= 9) return 3;
    if (count <= 12) return compact ? 3 : 4;
    return 4;
  }

  function pageLayout() {
    const short = window.innerHeight <= 650;
    if (window.innerWidth <= 480) return { columns: 2, size: short ? 6 : 8 };
    if (window.innerWidth <= 800) return { columns: 3, size: short ? 9 : 12 };
    if (window.innerWidth <= 1150) return { columns: 4, size: short ? 12 : 16 };
    return { columns: 5, size: short ? 15 : 20 };
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
      ? `Choose a family, then choose up to ${FOCUSED_LIMIT} tags${optional ? "." : "; the next main category opens automatically."}`
      : "Choose as many as you need; this category stays open until you switch tabs.";
    nodes.categorySelectionStatus.textContent = state.mode === "focused"
      ? `${selectedCount} / ${FOCUSED_LIMIT} selected`
      : `${selectedCount} selected`;
  }

  function renderFamilies() {
    const families = familiesFor(state.activeCategory);
    activeFamilyIndex = Math.min(activeFamilyIndex, Math.max(0, families.length - 1));
    nodes.familyBoard.replaceChildren();
    nodes.familyBoard.style.setProperty("--family-columns", String(familyColumns(families.length)));
    nodes.familyBoard.setAttribute("aria-label", `${state.activeCategory} families`);
    nodes.familyHeading.textContent = `${state.activeCategory} families`;
    nodes.familySummary.textContent = `${families.length} groups · ${categories()[state.activeCategory].length} total choices`;

    families.forEach((family, index) => {
      const button = document.createElement("button");
      const examples = family.tags.slice(0, 2).join(" · ");
      button.type = "button";
      button.className = "family-button";
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(index === activeFamilyIndex));
      button.setAttribute("aria-controls", "tagGrid");
      button.innerHTML = `<strong>${family.label}</strong><span>${family.tags.length} · ${examples}</span>`;
      button.addEventListener("click", () => {
        activeFamilyIndex = index;
        pageIndex = 0;
        renderFamilies();
        renderTagPage();
      });
      nodes.familyBoard.appendChild(button);
    });
  }

  function renderTagPage() {
    const families = familiesFor(state.activeCategory);
    const family = families[activeFamilyIndex] || { label: state.activeCategory, tags: [] };
    const layout = pageLayout();
    const totalPages = Math.max(1, Math.ceil(family.tags.length / layout.size));
    pageIndex = Math.min(pageIndex, totalPages - 1);
    const start = pageIndex * layout.size;
    const pageTags = family.tags.slice(start, start + layout.size);
    const selected = state.selected[state.activeCategory] || [];
    const focusedFull = state.mode === "focused" && selected.length >= FOCUSED_LIMIT;

    nodes.activeFamilyTitle.textContent = family.label;
    nodes.pageStatus.textContent = `${pageIndex + 1} / ${totalPages}`;
    nodes.previousPageBtn.disabled = pageIndex === 0;
    nodes.nextPageBtn.disabled = pageIndex >= totalPages - 1;
    nodes.tagGrid.style.setProperty("--tag-columns", String(layout.columns));
    nodes.tagGrid.replaceChildren();

    pageTags.forEach(tag => {
      const button = document.createElement("button");
      const isSelected = selected.includes(tag);
      button.type = "button";
      button.className = "tag-button";
      button.textContent = tag;
      button.dataset.tag = tag;
      button.setAttribute("aria-pressed", String(isSelected));
      button.disabled = focusedFull && !isSelected;
      button.addEventListener("click", () => toggleTag(tag));
      nodes.tagGrid.appendChild(button);
    });

    nodes.tagPageNote.textContent = state.mode === "focused"
      ? focusedFull
        ? "Two selected. Remove one to make a different choice."
        : `Select ${FOCUSED_LIMIT - selected.length} more; the next main tag opens automatically.`
      : `${family.tags.length} choices in this family · page through them without scrolling.`;
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

    const selectedCategories = OUTPUT_ORDER.filter(category => state.selected[category]?.length);
    nodes.selectedBreakdown.replaceChildren();
    selectedCategories.slice(0, 6).forEach(category => {
      const item = document.createElement("div");
      item.className = "breakdown-item";
      item.innerHTML = `<span>${categoryLabel(category)}</span><strong>${state.selected[category].length}</strong>`;
      nodes.selectedBreakdown.appendChild(item);
    });
    if (selectedCategories.length > 6) {
      const item = document.createElement("div");
      item.className = "breakdown-item";
      item.innerHTML = `<span>More categories</span><strong>+${selectedCategories.length - 6}</strong>`;
      nodes.selectedBreakdown.appendChild(item);
    }
  }

  function renderAll() {
    renderMainTabs();
    renderOptionalCategories();
    renderCategoryHeader();
    renderFamilies();
    renderTagPage();
    renderStyle();
    saveState();
  }

  function chooseCategory(category, options = {}) {
    if (!OUTPUT_ORDER.includes(category)) return;
    window.clearTimeout(advanceTimer);
    state.activeCategory = category;
    activeFamilyIndex = 0;
    pageIndex = 0;
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
    renderTagPage();
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
    pageIndex = 0;
    renderAll();
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

  function openStylePanel(open) {
    nodes.stylePanel.classList.toggle("open", open);
    nodes.mobileStyleBtn.setAttribute("aria-expanded", String(open));
  }

  function cacheNodes() {
    [
      "libraryStats", "mobileStyleBtn", "clearAllBtn", "mainCategoryTabs", "optionsBtn",
      "optionsActiveLabel", "tagWorkspace", "activeCategoryTitle", "activeCategoryHelp",
      "categorySelectionStatus", "familyHeading", "familySummary", "familyBoard",
      "activeFamilyTitle", "previousPageBtn", "pageStatus", "nextPageBtn", "tagGrid",
      "tagPageNote", "stylePanel", "closeStyleBtn", "styleOutput", "characterCount",
      "styleHint", "selectedBreakdown", "copyPromptBtn", "optionsDialog",
      "optionalCategoryGrid", "toast"
    ].forEach(id => {
      nodes[id] = document.getElementById(id);
    });
    nodes.focusedModeInput = document.querySelector('input[name="promptSize"][value="focused"]');
    nodes.extendedModeInput = document.querySelector('input[name="promptSize"][value="extended"]');
  }

  function bindEvents() {
    nodes.optionsBtn.addEventListener("click", openOptions);
    nodes.previousPageBtn.addEventListener("click", () => {
      if (pageIndex <= 0) return;
      pageIndex -= 1;
      renderTagPage();
    });
    nodes.nextPageBtn.addEventListener("click", () => {
      pageIndex += 1;
      renderTagPage();
    });
    document.querySelectorAll('input[name="promptSize"]').forEach(input => {
      input.addEventListener("change", () => setMode(input.value, input));
    });
    nodes.copyPromptBtn.addEventListener("click", copyPrompt);
    nodes.clearAllBtn.addEventListener("click", clearAll);
    nodes.mobileStyleBtn.addEventListener("click", () => openStylePanel(!nodes.stylePanel.classList.contains("open")));
    nodes.closeStyleBtn.addEventListener("click", () => openStylePanel(false));
    window.addEventListener("resize", () => {
      renderFamilies();
      renderTagPage();
    });
  }

  function validateLibrary() {
    const categoryNames = Object.keys(categories());
    const missing = OUTPUT_ORDER.filter(category => !categoryNames.includes(category));
    if (missing.length) throw new Error(`Missing tag categories: ${missing.join(", ")}`);

    const total = Object.values(categories()).reduce((sum, tags) => sum + tags.length, 0);
    if (total !== 1940) throw new Error(`Expected 1,940 tags, found ${total}.`);

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
