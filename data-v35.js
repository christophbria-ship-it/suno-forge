"use strict";

window.FORGE_V35 = Object.freeze({
  version: "3.5.0",
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
    { value: "grunge90s", label: "1990s grunge / alternative" },
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
    { value: "ruthless", label: "Ruthless · no stock lines" }
  ],
  presets: [
    { label: "Dark + Raw", tone: "dark", arc: "consistent", voice: "confessional", cheese: "strict" },
    { label: "Happy + Human", tone: "happy", arc: "consistent", voice: "natural", cheese: "strict" },
    { label: "Happy → Dark", tone: "happy", arc: "happy-dark", voice: "cinematic", cheese: "strict" },
    { label: "Cinematic", tone: "cinematic", arc: "calm-explosive", voice: "cinematic", cheese: "strict" },
    { label: "90s Grunge / Alt", tone: "dark", arc: "calm-explosive", voice: "grunge90s", cheese: "ruthless" },
    { label: "No Cheese", tone: "auto", arc: "consistent", voice: "natural", cheese: "ruthless" }
  ]
});
