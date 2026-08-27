"use strict";

(() => {
  const KEY = "simplist-v10-custom-family-tags";
  const prompt = () => document.getElementById("styleOutput");
  const clean = value => String(value || "").replace(/\s+/g, " ").trim();
  const describe = (tag, category) => {
    const description = globalThis.describeSimplistTag?.(clean(tag), clean(category));
    return clean(description) || "This choice changes a specific audible part of the track.";
  };

  const get = () => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {
      return {};
    }
  };

  const put = value => {
    try {
      localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
      // Custom tags remain optional when storage is unavailable.
    }
  };

  const category = () => document.getElementById("activeCategoryTitle")?.textContent?.trim() || "Genre";

  function decorateButton(button, activeCategory) {
    if (!button || button.dataset.v10Custom === "1") return;
    const name = clean(button.dataset.tag || button.dataset.name || button.querySelector("strong")?.textContent || button.textContent);
    if (!name) return;
    const buttonCategory = clean(button.dataset.category || activeCategory);
    const description = describe(name, buttonCategory);
    button.classList.add("v10-tag");
    button.dataset.name = name;
    button.dataset.category = buttonCategory;
    button.textContent = "";
    const label = document.createElement("strong");
    label.textContent = name;
    const detail = document.createElement("span");
    detail.className = "tag-description";
    detail.textContent = description;
    button.append(label, detail);
    button.title = `${name}: ${description}`;
    button.setAttribute("aria-label", `${name}. ${description}`);
  }

  function addCustomToPrompt(name, button) {
    const output = prompt();
    if (!output) return;
    const handled = !output.dispatchEvent(new CustomEvent("simplist:add-custom-tag", {
      bubbles: true,
      cancelable: true,
      detail: { name }
    }));
    if (!handled) {
      const parts = output.value.split(",").map(clean).filter(Boolean);
      if (!parts.some(value => value.toLowerCase() === name.toLowerCase())) parts.push(name);
      output.value = parts.join(", ").slice(0, 1000);
      output.dispatchEvent(new Event("input", { bubbles: true }));
    }
    button?.setAttribute("aria-pressed", "true");
  }

  function customButton(item) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "expanded-tag-button v10-tag";
    button.dataset.name = item.name;
    button.dataset.v10Custom = "1";
    const label = document.createElement("strong");
    label.textContent = item.name;
    const detail = document.createElement("span");
    detail.className = "tag-description";
    detail.textContent = item.description;
    button.append(label, detail);
    button.addEventListener("click", () => addCustomToPrompt(item.name, button));
    return button;
  }

  function addForm(host, activeCategory, family) {
    const existing = host.querySelector(".dialog-family-add");
    if (existing?.dataset.category === activeCategory && existing.dataset.family === family) return;
    existing?.remove();
    const box = document.createElement("details");
    box.className = "dialog-family-add";
    box.dataset.category = activeCategory;
    box.dataset.family = family;
    const summary = document.createElement("summary");
    summary.textContent = `+ Add to ${family}`;
    const form = document.createElement("div");
    form.className = "v10-add-form";
    const name = document.createElement("input");
    name.type = "text";
    name.placeholder = activeCategory === "Instruments" ? "Example: Slap Bass" : "Type a missing tag";
    name.maxLength = 60;
    const detail = document.createElement("input");
    detail.type = "text";
    detail.placeholder = "Description (optional)";
    detail.maxLength = 220;
    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Save";

    save.addEventListener("click", () => {
      const tagName = clean(name.value);
      if (!tagName) return;
      const tagDescription = clean(detail.value) || describe(tagName, activeCategory);
      const data = get();
      data[activeCategory] ??= {};
      data[activeCategory][family] ??= [];
      if (!data[activeCategory][family].some(item => item.name.toLowerCase() === tagName.toLowerCase())) {
        data[activeCategory][family].push({ name: tagName, description: tagDescription });
      }
      put(data);
      document.getElementById("expandedTagGrid")?.append(customButton({ name: tagName, description: tagDescription }));
      name.value = "";
      detail.value = "";
      box.open = false;
    });

    [name, detail].forEach(input => input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        save.click();
      }
    }));

    form.append(name, detail, save);
    box.append(summary, form);
    host.append(box);
  }

  function enhanceMain() {
    document.querySelectorAll(".family-card").forEach(card => {
      const header = card.querySelector(".family-card-header");
      if (!header || header.dataset.cleanCard) return;
      header.dataset.cleanCard = "1";
      const count = header.querySelector("span");
      if (count) count.textContent = `${count.textContent.match(/\d+/)?.[0] || ""} choices · tap to open`;
      card.addEventListener("click", event => {
        if (event.target.closest("button,details,input")) return;
        header.click();
      });
    });

    const output = prompt();
    if (!output) return;
    output.readOnly = false;
    output.spellcheck = true;
    output.maxLength = 1000;
    output.placeholder = "Tap tags or type anything you want here.";
  }

  function enhanceDialog() {
    const dialog = document.getElementById("familyDialog");
    if (!dialog?.open) return;
    const activeCategory = category();
    const family = clean(document.getElementById("expandedFamilyTitle")?.textContent || "Other");
    const grid = document.getElementById("expandedTagGrid");
    if (!grid) return;
    grid.querySelectorAll(".expanded-tag-button").forEach(button => decorateButton(button, activeCategory));
    const saved = get()?.[activeCategory]?.[family] || [];
    saved.forEach(item => {
      const alreadyPresent = [...grid.querySelectorAll("[data-name]")]
        .some(node => clean(node.dataset.name).toLowerCase() === item.name.toLowerCase());
      if (!alreadyPresent) grid.append(customButton(item));
    });
    addForm(dialog.querySelector("form"), activeCategory, family);
  }

  function enhance() {
    enhanceMain();
    enhanceDialog();
  }

  let timer = 0;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(enhance, 35);
  };

  new MutationObserver(schedule).observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["open"]
  });

  document.addEventListener("DOMContentLoaded", () => {
    enhance();
    document.addEventListener("click", event => {
      if (event.target.closest(".family-card-header,.category-tab,.optional-category-button")) {
        setTimeout(enhance, 55);
      }
    });
  });
})();

(() => {
  const clean = value => String(value || "").replace(/\s+/g, " ").trim();
  let manualText = "";
  let manualDirty = false;
  let lastAuto = "";
  let suppress = false;

  const prompt = () => document.getElementById("styleOutput");
  const focused = () => document.querySelector('input[name="promptSize"][value="focused"]')?.checked;

  function count() {
    const output = prompt();
    const counter = document.getElementById("characterCount");
    if (output && counter) {
      counter.textContent = focused() ? `${output.value.length} characters` : `${output.value.length} / 1000`;
    }
  }

  function extraRail() {
    const rail = document.querySelector(".category-rail");
    if (!rail) return;
    rail.querySelector(".extra-category-block")?.remove();
    const options = document.getElementById("optionsBtn");
    if (options) {
      options.hidden = false;
      options.removeAttribute("hidden");
    }
  }

  function mergeNewAuto(newAuto) {
    if (!manualDirty) {
      lastAuto = newAuto;
      return;
    }

    const before = new Set(lastAuto.split(",").map(clean).filter(Boolean).map(value => value.toLowerCase()));
    const added = newAuto.split(",").map(clean).filter(Boolean)
      .filter(value => !before.has(value.toLowerCase()));
    let outputText = manualText;
    for (const item of added) {
      if (!outputText.toLowerCase().includes(item.toLowerCase())) {
        outputText = clean(outputText ? `${outputText}, ${item}` : item);
      }
    }
    manualText = outputText.slice(0, 1000);
    const output = prompt();
    if (output) {
      suppress = true;
      output.value = manualText;
      suppress = false;
      count();
    }
    lastAuto = newAuto;
  }

  function restoreExact() {
    const output = prompt();
    if (!output) return;
    const auto = output.value;
    if (!manualDirty) {
      lastAuto = auto;
      count();
      return;
    }
    suppress = true;
    output.value = manualText.slice(0, 1000);
    suppress = false;
    lastAuto = auto;
    count();
  }

  function afterClick(target) {
    setTimeout(() => {
      extraRail();
      const output = prompt();
      if (!output) return;
      if (target.closest('[data-v10-custom="1"]')) {
        count();
        return;
      }
      const isTag = Boolean(target.closest(".wall-tag-button,.expanded-tag-button"));
      if (isTag) mergeNewAuto(output.value);
      else restoreExact();

      const title = document.getElementById("activeCategoryTitle")?.textContent?.trim();
      const status = document.getElementById("categorySelectionStatus")?.textContent || "";
      if (focused() && title === "Production/Sound Quality" && /^2\s*\/\s*2/.test(status)) {
        setTimeout(() => prompt()?.focus(), 680);
      }
    }, 45);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const output = prompt();
    if (output) {
      lastAuto = output.value;
      output.addEventListener("input", event => {
        if (suppress || !event.isTrusted) return;
        manualText = output.value.slice(0, 1000);
        manualDirty = true;
        count();
      });
    }
    extraRail();
    new MutationObserver(extraRail).observe(document.body, { subtree: true, childList: true });
    document.addEventListener("click", event => {
      if (
        event.target.closest(".wall-tag-button,.expanded-tag-button,.category-tab,.optional-category-button")
        || event.target.closest('input[name="promptSize"]')
      ) {
        afterClick(event.target);
      }
    });
  });
})();
