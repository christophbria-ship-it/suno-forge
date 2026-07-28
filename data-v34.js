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
