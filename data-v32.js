"use strict";

(() => {
  const extendCategory = (name, values) => {
    if (!Array.isArray(DATA.categories[name])) DATA.categories[name] = [];
    const current = new Set(DATA.categories[name]);
    values.forEach((value) => {
      if (!current.has(value)) {
        DATA.categories[name].push(value);
        current.add(value);
      }
    });
  };

  const extras = {
    Genre: [
      "Baroque", "Darkwave", "Coldwave", "Ethereal Wave", "Baroque Classical", "Neo-Baroque", "Dark Baroque", "Progressive Baroque",
      "Psychedelic Baroque", "Electro-Baroque", "Baroque Rock", "Baroque Glam Rock",
      "Baroque Darkwave", "Baroque Gothic Rock", "Baroque Metal", "Baroque Doom",
      "Baroque Industrial", "Baroque Punk", "Baroque Grunge", "Baroque Shoegaze",
      "Baroque Dream Pop", "Baroque Synthwave", "Baroque Trip-Hop", "Baroque House",
      "Baroque Hip-Hop", "Baroque Soul", "Baroque Gospel", "Baroque Jazz",
      "Baroque Blues", "Baroque Country", "Baroque Bluegrass", "Baroque Folk",
      "Baroque Reggae", "Baroque Cabaret", "Baroque Opera Rock", "Chamber Rock",
      "Chamber Darkwave", "Orchestral Darkwave", "Gothic Chamber Pop"
    ],
    Instruments: [
      "Lute", "Archlute", "Theorbo", "Viola da Gamba", "Bass Viol", "Treble Viol",
      "Baroque Violin", "Baroque Cello", "Baroque Oboe", "Oboe d'Amore",
      "Recorder Consort", "Natural Trumpet", "Natural Horn", "Cornett", "Sackbut",
      "Serpent", "Basso Continuo", "Continuo Harpsichord", "Chamber Organ",
      "Baroque Timpani", "Plucked String Consort", "Period String Ensemble"
    ],
    "Vocal Delivery": [
      "Baroque Ornamentation", "Ornamental Vocal Runs", "Trill Ornamentation",
      "Mordent Ornamentation", "Appoggiatura Phrasing", "Recitative Delivery",
      "Aria-Style Delivery", "Fugal Vocal Entries", "Imitative Vocal Phrasing"
    ],
    "Vocal Arrangement": [
      "Polyphonic Vocal Weave", "Fugal Vocal Arrangement", "Imitative Counterpoint Vocals",
      "Ornamented Lead with Choir", "Solo Aria to Mass Choir", "Recitative Verse Aria Chorus",
      "Antiphonal Chamber Choir", "Layered Counterpoint Trio", "Canon Build",
      "Baroque Duet Counterpoint", "Four-Voice Polyphony"
    ],
    "Harmony & Choir": [
      "Baroque Counterpoint", "Fugal Counterpoint", "Imitative Counterpoint",
      "Contrapuntal Choir", "Suspension Chain Harmony", "Circle-of-Fifths Sequence",
      "Ground Bass Harmony", "Pedal Bass Counterpoint", "Picardy Third Ending",
      "Chromatic Lament Bass", "Ornamented Cadence", "Chamber Choir Counterpoint"
    ],
    Arrangement: [
      "Basso Continuo Foundation", "Fugal Intro", "Recitative Opening", "Aria Chorus",
      "Counterpoint Build", "Chamber Interlude", "Ornamented Final Chorus",
      "Harpsichord-Led Breakdown", "Choir-and-Strings Finale", "Ground Bass Section"
    ]
  };

  Object.entries(extras).forEach(([name, values]) => extendCategory(name, values));

  const baroqueRecipes = [
    {
      name: "Baroque Darkwave",
      description: "Harpsichord counterpoint inside a cold nocturnal pulse",
      tags: ["Baroque", "Darkwave", "Baroque Darkwave", "Harpsichord", "Analog Synth", "Dark", "Baroque Counterpoint", "Female Vocal", "Stacked Harmonies"],
      bpm: 104, energy: "high", perspective: "first-person", rhymeMode: "natural", density: "balanced",
      direction: "Blend ornate counterpoint with a severe nocturnal atmosphere. Keep the verses controlled and let the final chorus widen dramatically.",
      structure: ["Intro", "Verse", "Pre-Chorus", "Chorus", "Verse", "Chorus", "Instrumental Bridge", "Final Chorus", "Outro"]
    },
    {
      name: "Baroque Glam Rock",
      description: "Theatrical hooks, bright strings, and swagger",
      tags: ["Baroque", "Glam Rock", "Baroque Glam Rock", "Harpsichord", "String Ensemble", "Theatrical Vocals", "Wide Harmonies", "Arena Mix", "Final Chorus Lift"],
      bpm: 126, energy: "explosive", perspective: "first-person", rhymeMode: "tight", density: "balanced",
      direction: "Make it extravagant and theatrical without becoming comedic. Use sharp verse phrasing and a huge communal final chorus.",
      structure: ["Cold Open", "Verse", "Pre-Chorus", "Chorus", "Verse", "Chorus", "Solo", "Final Chorus", "Coda"]
    },
    {
      name: "Baroque Metal",
      description: "Fugal strings against heavy rhythmic pressure",
      tags: ["Baroque", "Symphonic Metal", "Baroque Metal", "Pipe Organ", "Baroque Violin", "Huge Drums", "Fugal Counterpoint", "Operatic Vocals", "Choir Stabs"],
      bpm: 138, energy: "explosive", perspective: "mixed", rhymeMode: "natural", density: "dense",
      direction: "Use genuine contrapuntal motion rather than simply placing strings over metal. Alternate disciplined verses with overwhelming choral sections.",
      structure: ["Intro", "Verse", "Pre-Chorus", "Chorus", "Verse", "Half-Time Breakdown", "Bridge", "Final Chorus", "Coda"]
    },
    {
      name: "Baroque Bluegrass",
      description: "Fast picking shaped by chamber counterpoint",
      tags: ["Baroque", "Bluegrass", "Baroque Bluegrass", "Banjo", "Mandolin", "Fiddle", "Basso Continuo", "Bluegrass Harmony", "Call and Response"],
      bpm: 154, energy: "high", perspective: "first-person", rhymeMode: "tight", density: "dense",
      direction: "Treat the acoustic parts like interlocking chamber voices. Keep the language plain, physical, and fast-moving.",
      structure: ["Intro", "Verse", "Chorus", "Instrumental", "Verse", "Chorus", "Instrumental Bridge", "Final Chorus", "Outro"]
    },
    {
      name: "Baroque Synthwave",
      description: "Period ornamentation over a widescreen retro drive",
      tags: ["Baroque", "Synthwave", "Baroque Synthwave", "Continuo Harpsichord", "Analog Synth", "Synth Bass", "Arpeggiated Synth", "Octave Doubles", "Wide Stereo"],
      bpm: 112, energy: "high", perspective: "second-person", rhymeMode: "natural", density: "balanced",
      direction: "Let the counterpoint control the motion while the retro pulse supplies scale. Avoid nostalgic clichés and keep the story grounded.",
      structure: ["Intro", "Verse", "Pre-Chorus", "Chorus", "Verse", "Chorus", "Bridge", "Final Chorus", "Outro"]
    },
    {
      name: "Baroque Gothic Rock",
      description: "Sacred architecture, dark guitars, and chamber voices",
      tags: ["Baroque", "Gothic Rock", "Baroque Gothic Rock", "Pipe Organ", "Viola da Gamba", "Dark Vocals", "Chamber Choir", "Suspension Chain Harmony", "Large-Hall Mix"],
      bpm: 116, energy: "high", perspective: "first-person", rhymeMode: "loose", density: "balanced",
      direction: "Keep the drama severe and human. Build tension through suspensions, restrained verses, and a choir that arrives late.",
      structure: ["Cold Open", "Verse", "Chorus", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Final Chorus", "Coda"]
    },
    {
      name: "Baroque Trip-Hop",
      description: "Slow breakbeats beneath intimate chamber detail",
      tags: ["Baroque", "Trip-Hop", "Baroque Trip-Hop", "Theorbo", "Prepared Piano", "Broken Beat", "Smoky", "Close-Mic Vocal", "Imitative Counterpoint"],
      bpm: 84, energy: "medium", perspective: "first-person", rhymeMode: "internal", density: "balanced",
      direction: "Use negative space and close physical detail. Let the baroque influence appear through repeating lines and interlocking responses.",
      structure: ["Intro", "Verse", "Refrain", "Verse", "Chorus", "Instrumental Bridge", "Bridge", "Final Chorus", "Outro"]
    },
    {
      name: "Baroque Country",
      description: "Plainspoken storytelling with ornate supporting motion",
      tags: ["Baroque", "Country", "Baroque Country", "Acoustic Guitar", "Pedal Steel", "Continuo Harpsichord", "Storytelling Delivery", "Parallel Thirds", "Warm Analog"],
      bpm: 88, energy: "medium", perspective: "first-person", rhymeMode: "loose", density: "balanced",
      direction: "Keep the narrator direct and believable. Put the complexity in the arrangement, not in fancy wording.",
      structure: ["Intro", "Verse", "Chorus", "Verse", "Chorus", "Bridge", "Final Chorus", "Outro"]
    },
    {
      name: "Baroque Gospel",
      description: "Counterpoint growing into massed testimony",
      tags: ["Baroque", "Gospel", "Baroque Gospel", "Hammond Organ", "Chamber Organ", "Gospel Choir", "Fugal Vocal Arrangement", "Solo Verse Choir Chorus", "Final Chorus Harmony Lift"],
      bpm: 92, energy: "high", perspective: "first-person", rhymeMode: "natural", density: "balanced",
      direction: "Begin as a private testimony and expand voice by voice. Make the final section feel earned rather than instantly enormous.",
      structure: ["Cold Open", "Verse", "Pre-Chorus", "Chorus", "Verse", "A Cappella Break", "Bridge", "Final Chorus", "Coda"]
    },
    {
      name: "Baroque Industrial",
      description: "Rigid machinery shaped by precise counterpoint",
      tags: ["Baroque", "Industrial Rock", "Baroque Industrial", "Harpsichord", "Industrial Percussion", "Distorted Guitar", "Fugal Counterpoint", "Shouted Vocals", "Controlled Chaos"],
      bpm: 122, energy: "explosive", perspective: "third-person", rhymeMode: "minimal", density: "dense",
      direction: "Use strict recurring patterns and abrupt contrasts. Keep lyric imagery human and physical rather than technological.",
      structure: ["Cold Open", "Verse", "Chorus", "Verse", "Breakdown", "Bridge", "Final Chorus", "Outro"]
    },
    {
      name: "Baroque Dream Pop",
      description: "Soft-focus harmony with ornate inner movement",
      tags: ["Baroque", "Dream Pop", "Baroque Dream Pop", "Celesta", "Pizzicato Strings", "Airy Vocals", "Shimmer Reverb", "Canon Vocals", "Dreamlike"],
      bpm: 94, energy: "low", perspective: "second-person", rhymeMode: "minimal", density: "sparse",
      direction: "Keep the surface gentle while the inner parts move continuously. Use few words and let repeated images change meaning.",
      structure: ["Intro", "Verse", "Refrain", "Verse", "Chorus", "Instrumental Bridge", "Final Chorus", "Outro"]
    },
    {
      name: "Baroque Cabaret",
      description: "Wry theatrical storytelling and chamber drama",
      tags: ["Baroque", "Cabaret", "Baroque Cabaret", "Piano", "Accordion", "Viola da Gamba", "Theatrical Vocals", "Character Duet", "Dark Humor"],
      bpm: 108, energy: "high", perspective: "mixed", rhymeMode: "tight", density: "dense",
      direction: "Use two distinct characters and controlled theatrical tension. Keep the humor dry and the consequences real.",
      structure: ["Cold Open", "Verse", "Chorus", "Verse", "Chorus", "Bridge", "Final Chorus", "Fake Ending", "Coda"]
    }
  ];

  const existingRecipes = new Set(DATA.recipes.map((recipe) => recipe.name));
  baroqueRecipes.slice().reverse().forEach((recipe) => {
    if (!existingRecipes.has(recipe.name)) DATA.recipes.unshift(recipe);
  });

  window.FORGE_V32 = Object.freeze({
    version: "3.2.0",
    featuredCategories: [
      "Genre", "Instruments", "Vocals", "Vocal Delivery",
      "Vocal Range & Register", "Vocal Arrangement", "Harmony & Choir",
      "Rhythm & Groove", "Production", "Arrangement"
    ],
    baroqueRecipes
  });

  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "style-v33.css";
  document.head.appendChild(style);

  const dataScript = document.createElement("script");
  dataScript.src = "data-v33.js";
  dataScript.async = false;
  dataScript.addEventListener("load", () => {
    const appScript = document.createElement("script");
    appScript.src = "app-v33.js";
    appScript.async = false;
    document.head.appendChild(appScript);
  });
  document.head.appendChild(dataScript);
})();
