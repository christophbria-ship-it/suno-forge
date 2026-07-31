"use strict";

(() => {
  const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
  let scheduled = false;

  function notify(message) {
    if (typeof showToast === "function") {
      showToast(message);
      return;
    }
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function selectedTags() {
    try {
      return typeof state !== "undefined" && Array.isArray(state.selectedTags) ? state.selectedTags : [];
    } catch {
      return [];
    }
  }

  function categoryEntries() {
    try {
      if (typeof DATA === "undefined" || !DATA?.categories) return [];
      return Object.entries(DATA.categories).filter(([, tags]) => Array.isArray(tags));
    } catch {
      return [];
    }
  }

  function tagsForPicker(title) {
    const entries = categoryEntries();
    const lower = String(title || "").toLowerCase();
    let keyPattern = null;
    if (/genre/.test(lower)) keyPattern = /genre|style|hybrid/i;
    else if (/mood|emotion/.test(lower)) keyPattern = /mood|emotion|feeling/i;
    else if (/instrument/.test(lower)) keyPattern = /instrument|strings|brass|woodwind|percussion|keyboard|guitar/i;
    else if (/vocal|voice/.test(lower)) keyPattern = /vocal|voice|choir/i;
    else if (/groove|rhythm|tempo/.test(lower)) keyPattern = /groove|rhythm|tempo|meter/i;
    else if (/production|texture|effect/.test(lower)) keyPattern = /production|effect|texture|mix|era|recording/i;

    let tags = keyPattern
      ? entries.filter(([key]) => keyPattern.test(key)).flatMap(([, values]) => values)
      : entries.flatMap(([, values]) => values);

    if (!tags.length) tags = entries.flatMap(([, values]) => values);
    return unique(tags.map(String)).sort(collator.compare);
  }

  function findCanonical(query, tags) {
    const clean = normalize(query);
    if (!clean) return "";
    return tags.find((tag) => normalize(tag) === clean)
      || tags.find((tag) => normalize(tag).startsWith(clean))
      || "";
  }

  function clickExistingTag(tag) {
    const target = normalize(tag);
    const buttons = [...document.querySelectorAll(".tag-button,[data-tag],button")];
    const match = buttons.find((button) => {
      if (button.closest(".v5-clean-picker-results")) return false;
      const dataTag = button.dataset?.tag || button.getAttribute("data-value") || "";
      const label = button.querySelector(".tag-option-name")?.textContent || dataTag || button.textContent;
      return normalize(label) === target;
    });
    if (!match) return false;
    match.click();
    return true;
  }

  function addDirectly(tag) {
    try {
      if (typeof state === "undefined") return false;
      if (!Array.isArray(state.selectedTags)) state.selectedTags = [];
      if (!state.selectedTags.some((item) => normalize(item) === normalize(tag))) {
        if (typeof snapshot === "function") snapshot();
        state.selectedTags.push(tag);
      }
      state.output = "";
      state.favorite = false;
      if (typeof saveAll === "function") saveAll({ immediate: true });
      if (typeof syncControls === "function") syncControls(false);
      const selected = document.getElementById("selectedTags");
      if (selected) selected.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    } catch (error) {
      console.error("Forge direct tag add failed", error);
      return false;
    }
  }

  function closeSheet(sheet) {
    if (sheet instanceof HTMLDialogElement && sheet.open) {
      sheet.close();
      return;
    }
    const close = [...sheet.querySelectorAll("button")].find((button) => {
      const label = `${button.getAttribute("aria-label") || ""} ${button.textContent || ""}`.trim().toLowerCase();
      return label === "×" || /close|cancel|done/.test(label);
    });
    close?.click();
  }

  function addTag(tag, sheet) {
    if (!tag) {
      notify("Choose a sound first.");
      return;
    }
    const already = selectedTags().some((item) => normalize(item) === normalize(tag));
    if (already) {
      notify(`${tag} is already selected`);
      closeSheet(sheet);
      return;
    }
    const added = clickExistingTag(tag) || addDirectly(tag);
    if (!added) {
      notify("That sound could not be added.");
      return;
    }
    notify(`${tag} added`);
    closeSheet(sheet);
    window.setTimeout(scheduleDecorate, 80);
  }

  function sheetTitle(sheet) {
    return sheet.querySelector("h1,h2,h3,.v5-sheet-title,strong")?.textContent?.trim() || "Add Sound";
  }

  function renderPicker(sheet, input, results, count) {
    const tags = tagsForPicker(sheetTitle(sheet));
    const query = input.value.trim();
    const clean = normalize(query);
    const matches = clean
      ? tags.filter((tag) => normalize(tag).includes(clean))
      : tags;
    const current = selectedTags().map(normalize);

    results.replaceChildren();
    const shown = matches.slice(0, 500);
    if (!shown.length) {
      const empty = document.createElement("div");
      empty.className = "v5-clean-picker-empty";
      empty.textContent = "No exact library match. Change the search or use the custom Add button below.";
      results.appendChild(empty);
    } else {
      const fragment = document.createDocumentFragment();
      shown.forEach((tag) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "v5-clean-picker-row";
        const isSelected = current.includes(normalize(tag));
        button.disabled = isSelected;
        button.innerHTML = `<strong></strong><span>${isSelected ? "Selected" : "Add"}</span>`;
        button.querySelector("strong").textContent = tag;
        button.addEventListener("click", () => addTag(tag, sheet));
        fragment.appendChild(button);
      });
      results.appendChild(fragment);
    }
    count.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"}${matches.length > shown.length ? ` · showing ${shown.length}` : ""}`;
  }

  function enhancePicker(sheet) {
    if (sheet.dataset.cleanPicker === "ready") return;
    const title = sheetTitle(sheet);
    if (!/^add\b/i.test(title)) return;
    const input = sheet.querySelector('input[type="search"],input[type="text"]');
    if (!input) return;

    sheet.dataset.cleanPicker = "ready";
    sheet.classList.add("v5-clean-enhanced-picker");
    input.placeholder = `Search all ${title.replace(/^add\s+/i, "").toLowerCase()} options`;
    input.setAttribute("autocomplete", "off");

    const results = document.createElement("div");
    results.className = "v5-clean-picker-results";
    results.setAttribute("role", "listbox");
    const count = document.createElement("div");
    count.className = "v5-clean-picker-count";
    const footer = document.createElement("div");
    footer.className = "v5-clean-picker-footer";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", () => closeSheet(sheet));
    const add = document.createElement("button");
    add.type = "button";
    add.className = "primary-button";
    add.textContent = "Add Selection";
    add.addEventListener("click", () => {
      const tags = tagsForPicker(title);
      const canonical = findCanonical(input.value, tags);
      addTag(canonical || input.value.trim(), sheet);
    });
    footer.append(cancel, add);

    const anchor = input.closest("label,div") || input;
    anchor.insertAdjacentElement("afterend", results);
    results.insertAdjacentElement("afterend", count);
    count.insertAdjacentElement("afterend", footer);

    input.addEventListener("input", () => renderPicker(sheet, input, results, count));
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      add.click();
    });
    renderPicker(sheet, input, results, count);
  }

  function wrapCard(card, label, helper, open = false) {
    if (!card || card.closest(".v5-clean-disclosure")) return;
    const details = document.createElement("details");
    details.className = "v5-clean-disclosure";
    details.open = open;
    const summary = document.createElement("summary");
    const title = document.createElement("span");
    title.textContent = label;
    const small = document.createElement("small");
    small.textContent = helper;
    summary.append(title, small);
    card.before(details);
    details.append(summary, card);
  }

  function collapseSecondarySections() {
    wrapCard(document.getElementById("recipeGrid")?.closest(".card"), "Start from a recipe", "Optional templates for a faster starting point.");
    wrapCard(document.querySelector(".sound-palette-card") || document.getElementById("categoryList")?.closest(".card"), "Browse the full sound library", "Search every genre, instrument, vocal, mood, and production option.");
    wrapCard(document.getElementById("bpmRange")?.closest(".card"), "Advanced track controls", "Exact tempo, perspective, rhyme, density, language, and detailed DNA.");
    wrapCard(document.getElementById("presetList")?.closest(".card"), "Projects and history", "Presets, backups, favorites, and previous exports.");
  }

  function collapseSectionActions() {
    document.querySelectorAll(".v5-section-actions").forEach((actions) => {
      if (actions.dataset.cleanActions === "ready") return;
      const buttons = [...actions.children].filter((child) => child.tagName === "BUTTON");
      if (buttons.length <= 2) return;
      actions.dataset.cleanActions = "ready";
      const details = document.createElement("details");
      details.className = "v5-clean-more-actions";
      const summary = document.createElement("summary");
      summary.textContent = "More writing tools";
      const group = document.createElement("div");
      buttons.slice(2).forEach((button) => group.appendChild(button));
      details.append(summary, group);
      actions.appendChild(details);
    });
  }

  function simplifyHeader() {
    const ai = document.getElementById("forgeAiSettingsBtn");
    if (ai) {
      ai.setAttribute("aria-label", ai.textContent || "AI settings");
      if (/ready/i.test(ai.textContent || "")) ai.textContent = "AI";
    }
    const clear = document.getElementById("forgeClearBtn");
    if (clear) clear.textContent = "Clear";
  }

  function decorate() {
    document.body.classList.add("forge-v5-clean");
    simplifyHeader();
    collapseSecondarySections();
    collapseSectionActions();
    document.querySelectorAll(".v5-sheet,dialog").forEach(enhancePicker);
  }

  function scheduleDecorate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      decorate();
    });
  }

  function init() {
    decorate();
    const observer = new MutationObserver(scheduleDecorate);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
