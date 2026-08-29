"use strict";

(() => {
  const STORAGE_KEY = "simplistStructureBuilderV1";
  const PAGE_KEY = "simplistActivePageV1";
  const nodes = {};
  let suppressPaletteClickUntil = 0;
  let soundStats = "";

  const state = {
    sections: [],
    activeId: null,
    page: "sound",
    customInstruments: []
  };

  function isPhoneLayout() {
    return window.matchMedia("(max-width: 720px)").matches;
  }

  function structureDrawers() {
    return [...nodes.structurePage.querySelectorAll(".structure-tool-drawer")];
  }

  function closeStructureDrawers(except = null) {
    structureDrawers().forEach(drawer => {
      if (drawer !== except) drawer.open = false;
    });
  }

  function openBracketDrawer() {
    const tagDrawer = nodes.structurePage.querySelector(".tag-drawer");
    if (!tagDrawer) return;
    closeStructureDrawers(tagDrawer);
    tagDrawer.open = true;
  }

  function bindStructureDrawers() {
    structureDrawers().forEach(drawer => {
      drawer.addEventListener("toggle", () => {
        if (drawer.open) closeStructureDrawers(drawer);
      });
    });
  }

  function uid() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `section-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  function defaultSections() {
    return STRUCTURE_LIBRARY.defaultStructure.map(label => ({ id: uid(), label, lyrics: "" }));
  }

  function cleanInstrumentName(value) {
    return String(value || "")
      .replace(/^\s*\[|\]\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function instrumentKey(value) {
    return cleanInstrumentName(value).toLowerCase();
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (Array.isArray(saved?.sections) && saved.sections.length) {
        state.sections = saved.sections
          .filter(section => section && typeof section.label === "string")
          .map(section => ({
            id: typeof section.id === "string" ? section.id : uid(),
            label: section.label,
            lyrics: typeof section.lyrics === "string" ? section.lyrics : ""
          }));
      }
      state.activeId = state.sections.some(section => section.id === saved?.activeId)
        ? saved.activeId
        : state.sections[0]?.id || null;
      state.customInstruments = Array.isArray(saved?.customInstruments)
        ? [...new Map(saved.customInstruments
            .map(cleanInstrumentName)
            .filter(Boolean)
            .map(name => [instrumentKey(name), name])).values()]
        : [];
      const savedPage = localStorage.getItem(PAGE_KEY);
      state.page = ["sound", "blend", "structure"].includes(savedPage) ? savedPage : "sound";
    } catch {
      state.sections = [];
      state.customInstruments = [];
    }

    if (!state.sections.length) {
      state.sections = defaultSections();
      state.activeId = state.sections[0]?.id || null;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sections: state.sections,
        activeId: state.activeId,
        customInstruments: state.customInstruments
      }));
      localStorage.setItem(PAGE_KEY, state.page);
    } catch {
      // The editor remains usable when browser storage is unavailable.
    }
  }

  function activeSectionIndex() {
    return state.sections.findIndex(section => section.id === state.activeId);
  }

  function resolveSectionLabel(requested) {
    if (requested !== "Verse") return requested;
    const verseNumbers = state.sections
      .map(section => section.label.match(/^Verse\s+(\d+)$/i))
      .filter(Boolean)
      .map(match => Number(match[1]));
    return `Verse ${verseNumbers.length ? Math.max(...verseNumbers) + 1 : 1}`;
  }

  function revealSection(id) {
    window.requestAnimationFrame(() => {
      activateSection(id);
      const card = nodes.structureSections.querySelector(`.song-section[data-section-id="${CSS.escape(id)}"]`);
      card?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  function insertSection(label, options = {}) {
    const section = { id: uid(), label: resolveSectionLabel(label), lyrics: "" };
    let insertAt = state.sections.length;

    if (options.beforeId) {
      const index = state.sections.findIndex(item => item.id === options.beforeId);
      if (index >= 0) insertAt = index;
    } else if (options.afterId) {
      const index = state.sections.findIndex(item => item.id === options.afterId);
      if (index >= 0) insertAt = index + 1;
    } else {
      const activeIndex = activeSectionIndex();
      if (activeIndex >= 0) insertAt = activeIndex + 1;
    }

    state.sections.splice(insertAt, 0, section);
    state.activeId = section.id;
    renderSections();
    saveState();

    if (isPhoneLayout()) {
      openBracketDrawer();
      revealSection(section.id);
    }
    else focusSection(section.id);
  }

  function deleteSection(id) {
    const index = state.sections.findIndex(section => section.id === id);
    if (index < 0) return;
    state.sections.splice(index, 1);
    if (!state.sections.length) {
      const section = { id: uid(), label: "Verse 1", lyrics: "" };
      state.sections.push(section);
      state.activeId = section.id;
    } else if (state.activeId === id) {
      state.activeId = state.sections[Math.min(index, state.sections.length - 1)].id;
    }
    renderSections();
    saveState();
  }

  function moveSection(id, direction) {
    const index = state.sections.findIndex(section => section.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= state.sections.length) return;
    const [section] = state.sections.splice(index, 1);
    state.sections.splice(target, 0, section);
    renderSections();
    saveState();
    if (isPhoneLayout()) revealSection(id);
    else focusSection(id, false);
  }

  function syncStateOrderFromDom() {
    const order = [...nodes.structureSections.querySelectorAll(".song-section")]
      .map(element => element.dataset.sectionId);
    const byId = new Map(state.sections.map(section => [section.id, section]));
    state.sections = order.map(id => byId.get(id)).filter(Boolean);
    saveState();
    renderStatus();
  }

  function activateSection(id) {
    state.activeId = id;
    nodes.structureSections.querySelectorAll(".song-section").forEach(card => {
      const active = card.dataset.sectionId === id;
      card.classList.toggle("active", active);
      card.setAttribute("aria-expanded", String(active));
    });
    saveState();
  }

  function focusSection(id, placeCursor = true) {
    window.requestAnimationFrame(() => {
      const textarea = nodes.structureSections.querySelector(`.section-lyrics[data-section-id="${CSS.escape(id)}"]`);
      if (!textarea) return;
      activateSection(id);
      textarea.focus({ preventScroll: true });
      if (placeCursor) textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      textarea.closest(".song-section")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  function renderPalette() {
    nodes.basicSectionList.replaceChildren();
    STRUCTURE_LIBRARY.basicSections.forEach(label => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "basic-section-button";
      button.textContent = label;
      button.draggable = true;
      button.dataset.sectionLabel = label;
      button.addEventListener("click", () => {
        if (Date.now() < suppressPaletteClickUntil) return;
        insertSection(label);
      });
      button.addEventListener("dragstart", event => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/x-simplist-section", label);
      });
      bindTouchPaletteDrag(button, label);
      nodes.basicSectionList.appendChild(button);
    });
  }

  function bindTouchPaletteDrag(button, label) {
    let startX = 0;
    let startY = 0;
    let dragging = false;
    let ghost = null;

    button.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse") return;
      startX = event.clientX;
      startY = event.clientY;
      dragging = false;
      ghost = null;
      button.setPointerCapture(event.pointerId);
    });

    button.addEventListener("pointermove", event => {
      if (event.pointerType === "mouse" || !button.hasPointerCapture(event.pointerId)) return;
      const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
      if (!dragging && distance < 10) return;
      if (!dragging) {
        dragging = true;
        ghost = document.createElement("div");
        ghost.className = "structure-drag-ghost";
        ghost.textContent = `[${label}]`;
        document.body.appendChild(ghost);
      }
      event.preventDefault();
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
    });

    button.addEventListener("pointerup", event => {
      if (event.pointerType === "mouse") return;
      if (dragging) {
        const point = document.elementFromPoint(event.clientX, event.clientY);
        const target = point?.closest(".song-section");
        if (target) {
          const rect = target.getBoundingClientRect();
          const before = event.clientY < rect.top + rect.height / 2;
          insertSection(label, before
            ? { beforeId: target.dataset.sectionId }
            : { afterId: target.dataset.sectionId });
        } else if (point?.closest("#structureSections")) {
          insertSection(label, { afterId: state.sections.at(-1)?.id });
        }
        suppressPaletteClickUntil = Date.now() + 500;
      }
      ghost?.remove();
      dragging = false;
      ghost = null;
    });

    button.addEventListener("pointercancel", () => {
      ghost?.remove();
      dragging = false;
      ghost = null;
    });
  }

  function renderSections() {
    nodes.structureSections.replaceChildren();

    state.sections.forEach((section, index) => {
      const card = document.createElement("section");
      card.className = `song-section${section.id === state.activeId ? " active" : ""}`;
      card.dataset.sectionId = section.id;
      card.setAttribute("aria-expanded", String(section.id === state.activeId));

      const header = document.createElement("header");
      header.className = "song-section-header";

      const handle = document.createElement("button");
      handle.type = "button";
      handle.className = "section-drag-handle";
      handle.textContent = "⋮⋮";
      handle.draggable = true;
      handle.setAttribute("aria-label", `Drag ${section.label}`);

      const label = document.createElement("div");
      label.className = "section-label";
      label.textContent = `[${section.label}]`;
      label.setAttribute("role", "button");
      label.tabIndex = 0;
      label.setAttribute("aria-label", `Open ${section.label}`);
      label.addEventListener("keydown", event => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activateSection(section.id);
      });

      const up = document.createElement("button");
      up.type = "button";
      up.className = "section-move-button";
      up.textContent = "↑";
      up.disabled = index === 0;
      up.setAttribute("aria-label", `Move ${section.label} up`);
      up.addEventListener("click", () => moveSection(section.id, -1));

      const down = document.createElement("button");
      down.type = "button";
      down.className = "section-move-button";
      down.textContent = "↓";
      down.disabled = index === state.sections.length - 1;
      down.setAttribute("aria-label", `Move ${section.label} down`);
      down.addEventListener("click", () => moveSection(section.id, 1));

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "section-delete-button";
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Delete ${section.label}`);
      remove.addEventListener("click", () => deleteSection(section.id));

      const textarea = document.createElement("textarea");
      textarea.className = "section-lyrics";
      textarea.dataset.sectionId = section.id;
      textarea.value = section.lyrics;
      textarea.placeholder = "Lyrics, directions, or bracket tags…";
      textarea.spellcheck = true;
      textarea.addEventListener("focus", () => activateSection(section.id));
      textarea.addEventListener("pointerdown", () => activateSection(section.id));
      textarea.addEventListener("input", () => {
        const current = state.sections.find(item => item.id === section.id);
        if (!current) return;
        current.lyrics = textarea.value;
        renderStatus();
        saveState();
      });

      card.addEventListener("pointerdown", event => {
        if (!event.target.closest("button") && !event.target.closest("textarea")) activateSection(section.id);
      });

      bindSectionDrag(card, handle);
      header.append(handle, label, up, down, remove);
      card.append(header, textarea);
      nodes.structureSections.appendChild(card);
    });

    renderStatus();
  }

  function bindSectionDrag(card, handle) {
    handle.addEventListener("dragstart", event => {
      card.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/x-simplist-existing-section", card.dataset.sectionId);
    });

    handle.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      syncStateOrderFromDom();
    });

    let touchDragging = false;
    handle.addEventListener("pointerdown", event => {
      if (event.pointerType === "mouse") return;
      event.preventDefault();
      touchDragging = true;
      handle.setPointerCapture(event.pointerId);
      card.classList.add("touch-dragging");
    });

    handle.addEventListener("pointermove", event => {
      if (!touchDragging || event.pointerType === "mouse") return;
      event.preventDefault();
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".song-section");
      if (!target || target === card || target.parentElement !== nodes.structureSections) return;
      const rect = target.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      nodes.structureSections.insertBefore(card, before ? target : target.nextSibling);
    });

    const finish = () => {
      if (!touchDragging) return;
      touchDragging = false;
      card.classList.remove("touch-dragging");
      syncStateOrderFromDom();
    };
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
  }

  function buildInstrumentSaver() {
    const wrapper = document.createElement("div");
    wrapper.className = "custom-instrument-saver";

    const title = document.createElement("strong");
    title.className = "custom-instrument-title";
    title.textContent = "My saved instruments";

    const form = document.createElement("form");
    form.className = "custom-instrument-form";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "custom-instrument-input";
    input.placeholder = "Type instrument…";
    input.autocomplete = "off";
    input.setAttribute("list", "simplistInstrumentSuggestions");
    input.setAttribute("aria-label", "Instrument name to save");

    const datalist = document.createElement("datalist");
    datalist.id = "simplistInstrumentSuggestions";
    const suggestions = globalThis.DATA?.categories?.Instruments || [];
    suggestions.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      datalist.appendChild(option);
    });

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "custom-instrument-save";
    saveButton.textContent = "+ Save";

    form.append(input, saveButton, datalist);
    form.addEventListener("submit", event => {
      event.preventDefault();
      const name = cleanInstrumentName(input.value);
      if (!name) return;
      if (!state.customInstruments.some(saved => instrumentKey(saved) === instrumentKey(name))) {
        state.customInstruments.push(name);
        state.customInstruments.sort((a, b) => a.localeCompare(b));
        saveState();
      }
      renderTagFamilies();
    });

    wrapper.append(title, form);

    if (state.customInstruments.length) {
      const savedGrid = document.createElement("div");
      savedGrid.className = "saved-instrument-grid";

      state.customInstruments.forEach(name => {
        const row = document.createElement("div");
        row.className = "saved-instrument-row";

        const solo = document.createElement("button");
        solo.type = "button";
        solo.className = "structure-meta-button saved-instrument-tag";
        solo.textContent = `[${name} Solo]`;
        solo.addEventListener("click", () => insertMetaTag(`${name} Solo`));

        const instrumental = document.createElement("button");
        instrumental.type = "button";
        instrumental.className = "structure-meta-button saved-instrument-tag";
        instrumental.textContent = `[${name} Instrumental]`;
        instrumental.addEventListener("click", () => insertMetaTag(`${name} Instrumental`));

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "saved-instrument-remove";
        remove.textContent = "×";
        remove.setAttribute("aria-label", `Remove ${name} from saved instruments`);
        remove.addEventListener("click", () => {
          state.customInstruments = state.customInstruments.filter(saved => instrumentKey(saved) !== instrumentKey(name));
          saveState();
          renderTagFamilies();
        });

        row.append(solo, instrumental, remove);
        savedGrid.appendChild(row);
      });

      wrapper.appendChild(savedGrid);
    }

    return wrapper;
  }

  function renderTagFamilies() {
    nodes.structureTagBoxes.replaceChildren();
    STRUCTURE_LIBRARY.families.forEach(family => {
      const card = document.createElement("section");
      card.className = "structure-tag-card";
      const heading = document.createElement("h3");
      heading.textContent = family.label;
      const grid = document.createElement("div");
      grid.className = "structure-tag-grid";

      family.tags.forEach(tag => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "structure-meta-button";
        button.textContent = `[${tag}]`;
        button.title = `Insert [${tag}] at the lyric cursor`;
        button.addEventListener("click", () => insertMetaTag(tag));
        grid.appendChild(button);
      });

      card.append(heading, grid);
      if (family.label === "Instrumentals & Solos") card.appendChild(buildInstrumentSaver());
      nodes.structureTagBoxes.appendChild(card);
    });
  }

  function insertMetaTag(tag) {
    const id = state.activeId || state.sections[0]?.id;
    const section = state.sections.find(item => item.id === id);
    if (!section) return;

    const textarea = nodes.structureSections.querySelector(`.section-lyrics[data-section-id="${CSS.escape(id)}"]`);
    if (!textarea) return;

    const start = Number.isInteger(textarea.selectionStart) ? textarea.selectionStart : textarea.value.length;
    const end = Number.isInteger(textarea.selectionEnd) ? textarea.selectionEnd : start;
    const tagText = `[${tag}]`;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const leading = before && !before.endsWith("\n") ? "\n" : "";
    const trailing = after && !after.startsWith("\n") ? "\n" : "";
    const insertion = `${leading}${tagText}${trailing}`;

    textarea.value = `${before}${insertion}${after}`;
    section.lyrics = textarea.value;
    const cursor = before.length + insertion.length;
    textarea.setSelectionRange(cursor, cursor);
    activateSection(id);
    renderStatus();
    saveState();

    if (isPhoneLayout()) openBracketDrawer();
    else textarea.focus();
  }

  function assembledLyrics() {
    return state.sections.map(section => {
      const body = section.lyrics.trim();
      return body ? `[${section.label}]\n${body}` : `[${section.label}]`;
    }).join("\n\n");
  }

  function renderStatus() {
    const text = assembledLyrics();
    nodes.structureStatus.textContent = `${state.sections.length} sections`;
    nodes.structureCopyStatus.textContent = `${text.length.toLocaleString()} characters · bracket structure preserved`;
  }

  async function copyForSuno() {
    const text = assembledLyrics();
    try {
      await navigator.clipboard.writeText(text);
      nodes.copyForSunoBtn.textContent = "Copied";
      nodes.structureCopyStatus.textContent = "Copied for Suno";
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
      nodes.copyForSunoBtn.textContent = "Copied";
    }
    window.setTimeout(() => {
      nodes.copyForSunoBtn.textContent = "Copy for Suno";
      renderStatus();
    }, 1400);
  }

  function resetStructure() {
    if (!window.confirm("Reset Page 3 to the basic song structure?")) return;
    state.sections = defaultSections();
    state.activeId = state.sections[0]?.id || null;
    renderSections();
    saveState();
  }

  function addCustomSection() {
    const entered = window.prompt("Name the section. Square brackets are added automatically.", "Instrumental Interlude");
    if (!entered) return;
    const clean = entered.replace(/^\[|\]$/g, "").trim();
    if (clean) insertSection(clean);
  }

  function setPage(page) {
    state.page = ["sound", "blend", "structure"].includes(page) ? page : "sound";
    const soundActive = state.page === "sound";
    const blendActive = state.page === "blend";
    const structureActive = state.page === "structure";
    nodes.workspace.hidden = !soundActive;
    nodes.blendPage.hidden = !blendActive;
    nodes.structurePage.hidden = !structureActive;
    nodes.soundPageBtn.setAttribute("aria-selected", String(soundActive));
    nodes.blendPageBtn.setAttribute("aria-selected", String(blendActive));
    nodes.structurePageBtn.setAttribute("aria-selected", String(structureActive));
    nodes.clearAllBtn.hidden = !soundActive;
    nodes.libraryStats.textContent = structureActive
      ? "Page 3 · build lyrics and square-bracket structure for Suno"
      : blendActive
        ? "Page 2 · translate named music references into name-free sound descriptions"
        : soundStats;
    saveState();

    if (structureActive) {
      window.requestAnimationFrame(() => {
        if (isPhoneLayout()) openBracketDrawer();
        else focusSection(state.activeId, false);
      });
    }
  }

  function bindDropZone() {
    nodes.structureSections.addEventListener("dragover", event => {
      const types = Array.from(event.dataTransfer.types || []);
      const hasNew = types.includes("text/x-simplist-section");
      const hasExisting = types.includes("text/x-simplist-existing-section");
      if (!hasNew && !hasExisting) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = hasNew ? "copy" : "move";

      if (hasExisting) {
        const dragging = nodes.structureSections.querySelector(".song-section.dragging");
        const target = event.target.closest(".song-section");
        if (!dragging || !target || target === dragging) return;
        const rect = target.getBoundingClientRect();
        const before = event.clientY < rect.top + rect.height / 2;
        nodes.structureSections.insertBefore(dragging, before ? target : target.nextSibling);
      }
    });

    nodes.structureSections.addEventListener("drop", event => {
      event.preventDefault();
      const newLabel = event.dataTransfer.getData("text/x-simplist-section");
      if (newLabel) {
        const target = event.target.closest(".song-section");
        if (!target) {
          insertSection(newLabel, { afterId: state.sections.at(-1)?.id });
          return;
        }
        const rect = target.getBoundingClientRect();
        const before = event.clientY < rect.top + rect.height / 2;
        insertSection(newLabel, before
          ? { beforeId: target.dataset.sectionId }
          : { afterId: target.dataset.sectionId });
      } else {
        syncStateOrderFromDom();
      }
    });
  }

  function cacheNodes() {
    [
      "workspace", "blendPage", "structurePage", "soundPageBtn", "blendPageBtn", "structurePageBtn", "clearAllBtn", "libraryStats",
      "basicSectionList", "customSectionBtn", "structureSections", "structureStatus",
      "structureCopyStatus", "resetStructureBtn", "copyForSunoBtn", "structureTagBoxes"
    ].forEach(id => {
      nodes[id] = document.getElementById(id);
    });
  }

  function init() {
    cacheNodes();
    if (!nodes.structurePage || !globalThis.STRUCTURE_LIBRARY) return;
    soundStats = nodes.libraryStats.textContent;
    loadState();
    renderPalette();
    renderTagFamilies();
    renderSections();
    bindDropZone();
    bindStructureDrawers();
    nodes.customSectionBtn.addEventListener("click", addCustomSection);
    nodes.resetStructureBtn.addEventListener("click", resetStructure);
    nodes.copyForSunoBtn.addEventListener("click", copyForSuno);
    nodes.soundPageBtn.addEventListener("click", () => setPage("sound"));
    nodes.blendPageBtn.addEventListener("click", () => setPage("blend"));
    nodes.structurePageBtn.addEventListener("click", () => setPage("structure"));
    setPage(state.page);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
