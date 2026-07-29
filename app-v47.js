"use strict";

(() => {
  function text(node, value) {
    if (node) node.textContent = value;
  }

  function installBrandLockup() {
    const block = document.querySelector(".topbar .brand-block");
    if (!block || block.dataset.forgeV47 === "ready") return;

    const mark = document.createElement("span");
    mark.className = "forge-brand-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "F";

    const copy = document.createElement("span");
    copy.className = "forge-brand-copy";

    const product = document.createElement("span");
    product.className = "forge-brand-name";
    product.textContent = "Forge";

    const descriptor = document.createElement("span");
    descriptor.className = "forge-brand-descriptor";
    descriptor.textContent = "Creative audio workstation";

    copy.append(product, descriptor);
    block.replaceChildren(mark, copy);
    block.dataset.forgeV47 = "ready";
  }

  function refineControls() {
    const shuffle = document.getElementById("randomizeBtn");
    if (shuffle) {
      shuffle.textContent = "↻";
      shuffle.title = "Shuffle track settings";
      shuffle.setAttribute("aria-label", "Shuffle track settings");
    }

    const install = document.getElementById("installBtn");
    if (install) {
      install.textContent = "＋";
      install.title = "Install Forge";
    }

    const workspaceTabs = [...document.querySelectorAll(".workspace-tab")];
    workspaceTabs.forEach((button) => {
      const label = button.textContent.trim();
      if (/remove instrument/i.test(label)) button.textContent = "Stem Remover";
    });
  }

  function refineHero() {
    const hero = document.querySelector("#generatorWorkspace .hero") || document.querySelector(".hero");
    if (!hero) return;

    text(hero.querySelector(".eyebrow"), "FORGE STUDIO · V4.7");
    text(hero.querySelector("h2"), "Shape the sound. Write the song. Export with confidence.");
    text(
      hero.querySelector(".muted"),
      "A focused workspace for sound design, AI-assisted writing, Suno-ready exports, stem tools, and repeatable creative workflows."
    );
  }

  function addCardDepthLabels() {
    document.querySelectorAll("section.card").forEach((card) => {
      if (card.dataset.forgeSurface === "ready") return;
      card.dataset.forgeSurface = "ready";
    });
  }

  function updateVersion() {
    document.title = "Forge Studio";
    document.documentElement.dataset.forgeV47 = "ready";
    document.body.classList.add("forge-polished");
  }

  function init() {
    if (document.documentElement.dataset.forgeV47 === "ready") return;
    if (document.documentElement.dataset.forgeV46 !== "ready") {
      window.setTimeout(init, 80);
      return;
    }

    installBrandLockup();
    refineControls();
    refineHero();
    addCardDepthLabels();

    const observer = new MutationObserver(() => {
      refineControls();
      addCardDepthLabels();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    updateVersion();
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once: true });
})();
