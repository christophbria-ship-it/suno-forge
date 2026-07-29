"use strict";

window.FORGE_V35 = Object.freeze({
  version: "3.5.1",
  tones: [
    { value: "auto", label: "Follow the song idea" },
    { value: "dark", label: "Dark" },
    { value: "happy", label: "Happy" },
    { value: "bittersweet", label: "Bittersweet" },
    { value: "angry", label: "Angry" },
    { value: "hopeful", label: "Hopeful" },
    { value: "numb", label: "Numb" },
    { value: "defiant", label: "Defiant" },
    { value: "cinematic", label: "Cinematic" }
  ],
  arcs: [
    { value: "consistent", label: "Stay consistent" },
    { value: "happy-dark", label: "Happy → Dark" },
    { value: "dark-hopeful", label: "Dark → Hopeful" },
    { value: "calm-explosive", label: "Calm → Explosive" },
    { value: "hopeful-devastating", label: "Hopeful → Devastating" },
    { value: "numb-defiant", label: "Numb → Defiant" },
    { value: "tender-furious", label: "Tender → Furious" }
  ],
  voices: [
    { value: "natural", label: "Modern natural" },
    { value: "grunge90s", label: "1990s grunge / alternative · dry" },
    { value: "blunt", label: "Blunt · no poetry" },
    { value: "cinematic", label: "Cinematic narrative" },
    { value: "plainspoken", label: "Plainspoken" },
    { value: "confessional", label: "Raw confessional" },
    { value: "surreal-grounded", label: "Surreal but grounded" },
    { value: "punk-direct", label: "Punk direct" }
  ],
  cheeseLevels: [
    { value: "relaxed", label: "Relaxed" },
    { value: "balanced", label: "Balanced" },
    { value: "strict", label: "Strict · grounded" },
    { value: "ruthless", label: "Ruthless · dry, no forced poetry" }
  ],
  presets: [
    { label: "Dark + Raw", tone: "dark", arc: "consistent", voice: "confessional", cheese: "strict" },
    { label: "Happy + Human", tone: "happy", arc: "consistent", voice: "natural", cheese: "strict" },
    { label: "Happy → Dark", tone: "happy", arc: "happy-dark", voice: "cinematic", cheese: "strict" },
    { label: "Cinematic", tone: "cinematic", arc: "calm-explosive", voice: "cinematic", cheese: "strict" },
    { label: "90s Grunge / Alt · Dry", tone: "dark", arc: "calm-explosive", voice: "grunge90s", cheese: "ruthless" },
    { label: "Blunt · No Poetry", tone: "auto", arc: "consistent", voice: "blunt", cheese: "ruthless" },
    { label: "No Cheese", tone: "auto", arc: "consistent", voice: "natural", cheese: "ruthless" }
  ]
});

(() => {
  const loadV351 = () => {
    if (document.documentElement.dataset.forgeV35 !== "ready") {
      window.setTimeout(loadV351, 40);
      return;
    }
    if (document.querySelector('script[src="app-v351.js"]')) return;
    const script = document.createElement("script");
    script.src = "app-v351.js";
    script.async = false;
    document.head.appendChild(script);
  };

  if (document.readyState === "complete") loadV351();
  else window.addEventListener("load", loadV351, { once: true });
})();

(() => {
  if (!document.querySelector('link[href="style-v4.css"]')) {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "style-v4.css";
    document.head.appendChild(style);
  }

  const loadV4 = () => {
    if (document.documentElement.dataset.forgeV351 !== "ready") {
      window.setTimeout(loadV4, 40);
      return;
    }
    if (document.querySelector('script[src="app-v4.js"]')) return;
    const script = document.createElement("script");
    script.src = "app-v4.js";
    script.async = false;
    document.head.appendChild(script);
  };

  if (document.readyState === "complete") loadV4();
  else window.addEventListener("load", loadV4, { once: true });
})();

(() => {
  if (!document.querySelector('link[href="style-v41.css"]')) {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "style-v41.css";
    document.head.appendChild(style);
  }

  const loadV41 = () => {
    if (document.documentElement.dataset.forgeV4 !== "ready") {
      window.setTimeout(loadV41, 50);
      return;
    }
    if (document.querySelector('script[src="app-v41.js"]')) return;
    const script = document.createElement("script");
    script.src = "app-v41.js";
    script.async = false;
    document.head.appendChild(script);
  };

  if (document.readyState === "complete") loadV41();
  else window.addEventListener("load", loadV41, { once: true });
})();

(() => {
  if (!document.querySelector('link[href="style-v42.css"]')) {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "style-v42.css";
    document.head.appendChild(style);
  }

  const loadV42 = () => {
    if (document.documentElement.dataset.forgeV41 !== "ready") {
      window.setTimeout(loadV42, 50);
      return;
    }
    if (document.querySelector('script[src="app-v42.js"]')) return;
    const script = document.createElement("script");
    script.src = "app-v42.js";
    script.async = false;
    document.head.appendChild(script);
  };

  if (document.readyState === "complete") loadV42();
  else window.addEventListener("load", loadV42, { once: true });
})();

(() => {
  if (!document.querySelector('link[href="style-v43.css"]')) {
    const style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = "style-v43.css";
    document.head.appendChild(style);
  }

  const loadV43 = () => {
    if (document.documentElement.dataset.forgeV42 !== "ready") {
      window.setTimeout(loadV43, 50);
      return;
    }
    if (document.querySelector('script[src="app-v43.js"]')) return;
    const script = document.createElement("script");
    script.src = "app-v43.js";
    script.async = false;
    document.head.appendChild(script);
  };

  if (document.readyState === "complete") loadV43();
  else window.addEventListener("load", loadV43, { once: true });
})();
