"use strict";

(() => {
  const READY = "ready";

  function addStyle(href, marker) {
    if (document.querySelector(`link[data-forge-asset="${marker}"], link[href*="${href.split("?")[0]}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.forgeAsset = marker;
    document.head.appendChild(link);
  }

  function addScript(src, marker) {
    if (document.querySelector(`script[data-forge-asset="${marker}"], script[src*="${src.split("?")[0]}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.forgeAsset = marker;
    document.body.appendChild(script);
  }

  function init() {
    if (document.documentElement.dataset.forgeV47 === READY) return;
    if (document.documentElement.dataset.forgeV46 !== READY) {
      window.setTimeout(init, 80);
      return;
    }

    document.documentElement.dataset.forgeV47 = READY;
    document.body.classList.add("forge-polished", "forge-focused");
    document.title = "Forge Studio";

    addStyle("style-v5.css?v=5.2.1", "v5-style");
    addStyle("style-v6-focus.css?v=6.0.0", "v6-focus-style");
    addScript("app-v5.js?v=5.2.1", "v5-app");
    addScript("app-v5-ai-actions.js?v=6.0.0", "v6-ai-actions");
    addScript("app-v6-focus.js?v=6.0.0", "v6-focus-app");
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once: true });
})();
