"use strict";

(() => {
  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  function createGenreInput(select, label, placeholder, datalistId, genres) {
    select.classList.add("hybrid-source-select");
    select.hidden = true;
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "hybrid-text-input";
    input.maxLength = 80;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = placeholder;
    input.setAttribute("aria-label", label);
    input.setAttribute("list", datalistId);
    input.value = select.value;
    select.insertAdjacentElement("afterend", input);

    const sync = (canonicalize = false) => {
      const clean = input.value.replace(/\s+/g, " ").trim();
      if (!clean) {
        select.value = "";
        return "";
      }

      const canonical = genres.find((genre) => normalize(genre) === normalize(clean)) || clean;
      let option = [...select.options].find((item) => item.value === canonical);
      if (!option) {
        option = document.createElement("option");
        option.value = canonical;
        option.textContent = canonical;
        option.dataset.customHybrid = "true";
        select.appendChild(option);
      }
      select.value = canonical;
      if (canonicalize) input.value = canonical;
      return canonical;
    };

    input.addEventListener("input", () => sync(false));
    input.addEventListener("change", () => sync(true));
    input.addEventListener("blur", () => sync(true));

    return { input, sync };
  }

  function installTypedHybridFields() {
    if (document.documentElement.dataset.forgeV43 === "ready") return true;
    if (document.documentElement.dataset.forgeV42 !== "ready") return false;

    const lab = document.getElementById("hybridLab");
    const firstSelect = document.getElementById("hybridPrimary");
    const secondSelect = document.getElementById("hybridPartner");
    if (!lab || !firstSelect || !secondSelect) return false;
    if (document.getElementById("hybridGenreOptions")) return true;

    const genres = [...new Set(DATA.categories.Genre || [])].sort((a, b) => a.localeCompare(b));
    const datalist = document.createElement("datalist");
    datalist.id = "hybridGenreOptions";
    genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre;
      datalist.appendChild(option);
    });
    lab.appendChild(datalist);

    const firstLabel = firstSelect.closest("label");
    const secondLabel = secondSelect.closest("label");
    firstLabel?.querySelector("span")?.replaceChildren("Main style — type or choose");
    secondLabel?.querySelector("span")?.replaceChildren("Blend with — type or choose");

    const first = createGenreInput(
      firstSelect,
      "Main hybrid style",
      "Example: Baroque, desert blues, doom jazz",
      datalist.id,
      genres
    );
    const second = createGenreInput(
      secondSelect,
      "Second hybrid style",
      "Example: Darkwave, bluegrass, cinematic soul",
      datalist.id,
      genres
    );

    const helper = lab.querySelector(":scope > .helper-text");
    if (helper) {
      helper.textContent = "Type any two styles into the boxes or choose a Forge suggestion. Custom styles are added to the prompt even when they are not already in the genre library.";
    }

    const actionButtons = [...lab.querySelectorAll(".hybrid-action-row button")];
    const swap = actionButtons.find((button) => /swap/i.test(button.textContent));
    const add = actionButtons.find((button) => /add hybrid/i.test(button.textContent));
    const status = document.getElementById("hybridStatus");

    swap?.addEventListener("click", () => {
      window.setTimeout(() => {
        first.input.value = firstSelect.value;
        second.input.value = secondSelect.value;
      }, 0);
    });

    add?.addEventListener("click", (event) => {
      const primary = first.sync(true);
      const partner = second.sync(true);
      if (!primary || !partner) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (status) status.textContent = "Type a style in both boxes.";
        return;
      }
      if (normalize(primary) === normalize(partner)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (status) status.textContent = "Use two different styles.";
      }
    }, true);

    document.documentElement.dataset.forgeV43 = "ready";
    return true;
  }

  function init() {
    if (!installTypedHybridFields()) window.setTimeout(init, 80);
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once: true });
})();
