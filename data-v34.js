"use strict";

window.FORGE_V34 = Object.freeze({
  version: "3.4.0",
  profiles: [
    {
      id: "account",
      label: "My Suno limits · 1000 style / 8000 lyrics",
      styleLimit: 1000,
      lyricsLimit: 8000
    },
    {
      id: "safe",
      label: "Conservative · 950 style / 4800 lyrics",
      styleLimit: 950,
      lyricsLimit: 4800
    }
  ],
  quickExcludes: [
    "excessive autotune",
    "muddy mix",
    "long intro",
    "fade-out",
    "spoken word",
    "trap hi-hats",
    "bright major-key mood",
    "overcrowded arrangement",
    "harsh high frequencies",
    "repetitive chorus"
  ]
});

(() => {
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "style-v35.css";
  document.head.appendChild(style);

  const dataScript = document.createElement("script");
  dataScript.src = "data-v35.js";
  dataScript.async = false;
  dataScript.addEventListener("load", () => {
    const loadV35 = () => {
      if (document.documentElement.dataset.forgeV34 !== "ready") {
        window.setTimeout(loadV35, 40);
        return;
      }
      if (document.querySelector('script[src="app-v35.js"]')) return;
      const appScript = document.createElement("script");
      appScript.src = "app-v35.js";
      appScript.async = false;
      document.head.appendChild(appScript);
    };

    if (document.readyState === "complete") loadV35();
    else window.addEventListener("load", loadV35, { once: true });
  });
  document.head.appendChild(dataScript);
})();
