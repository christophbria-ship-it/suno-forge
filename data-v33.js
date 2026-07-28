"use strict";

window.FORGE_V33 = Object.freeze({
  version: "3.3.0",
  influenceLevels: [
    { value: 25, label: "Accent" },
    { value: 50, label: "Supporting" },
    { value: 75, label: "Strong" },
    { value: 100, label: "Primary" }
  ],
  suggestionRules: [
    { triggers: ["Baroque", "Baroque Pop", "Baroque Rock"], suggestions: ["Harpsichord", "Counterpoint", "String Ensemble", "Chamber Choir", "Ornamented Vocal Phrasing", "Terraced Dynamics"] },
    { triggers: ["Darkwave", "Coldwave", "Ethereal Wave"], suggestions: ["Dark Mix", "Deep Bass", "Drum Machine", "Low Register", "Detached Delivery", "Atmospheric"] },
    { triggers: ["Glam Rock", "Glam Metal", "Baroque Glam Rock"], suggestions: ["Theatrical Vocals", "Stacked Harmonies", "Electric Guitar", "Arena Mix", "Final Chorus Lift", "Gang Vocal Accents"] },
    { triggers: ["Bluegrass", "Progressive Bluegrass"], suggestions: ["Banjo", "Mandolin", "Fiddle", "Bluegrass Harmony", "Call and Response", "Bluegrass Drive"] },
    { triggers: ["Gothic Rock", "Dark Folk", "Witch House"], suggestions: ["Haunting", "Minor-Key Choir", "Low Register", "Distant Vocal", "Large-Hall Mix", "Unresolved Harmony"] },
    { triggers: ["Dream Pop", "Shoegaze", "Ethereal Wave"], suggestions: ["Airy Vocals", "Shimmer Reverb", "Wide Stereo", "Hazy", "Layered Harmonies", "Slow Build"] },
    { triggers: ["Metal", "Heavy Metal", "Symphonic Metal", "Baroque Metal"], suggestions: ["Powerful Vocals", "Distorted Guitar", "Live Drums", "Double-Time Breakdown", "Metal Choir Layer", "Huge Drums"] },
    { triggers: ["Doom Metal", "Baroque Doom", "Drone Metal"], suggestions: ["Slow Build", "Low Register", "Dissonant Choir", "Heavy Low End", "Long Reverb Tail", "Unresolved Ending"] },
    { triggers: ["Hip-Hop", "Alternative Hip-Hop", "Baroque Hip-Hop"], suggestions: ["Rap Vocals", "Internal Rhyme", "808 Bass", "Boom Bap Groove", "Rap Verse Sung Chorus", "Concrete Imagery"] },
    { triggers: ["Neo-Soul", "Soul", "Baroque Soul"], suggestions: ["Soulful Vocals", "Rhodes", "Behind-the-Beat Vocal", "Close Harmony", "Warm Analog", "Intimate Mix"] },
    { triggers: ["Gospel", "Baroque Gospel"], suggestions: ["Gospel Choir", "Hammond Organ", "Solo Verse Choir Chorus", "Call and Response", "Final Chorus Harmony Lift", "Hopeful"] },
    { triggers: ["Jazz", "Jazz Fusion", "Baroque Jazz"], suggestions: ["Jazz Vocal", "Upright Bass", "Brush Drums", "Rubato Vocal", "Jazz Harmony Vocals", "Dynamic Mix"] },
    { triggers: ["Country", "Outlaw Country", "Baroque Country"], suggestions: ["Pedal Steel", "Acoustic Guitar", "Country Twang", "Narrative Lyrics", "Train Beat", "Raw Production"] },
    { triggers: ["Industrial Metal", "Industrial Rock", "Baroque Industrial"], suggestions: ["Industrial Percussion", "Distorted", "Cold", "Hard Stop", "Controlled Chaos", "Midrange Forward"] },
    { triggers: ["Synthwave", "Darksynth", "Baroque Synthwave"], suggestions: ["Analog Synth", "Synth Bass", "1980s", "Wide Stereo", "Arpeggiated Synth", "Final Chorus Lift"] },
    { triggers: ["Trip-Hop", "Baroque Trip-Hop"], suggestions: ["Downtempo", "Deep Bass", "Brush Drums", "Breathy Vocal", "Tape Saturation", "Cinematic Storytelling"] },
    { triggers: ["Reggae", "Roots Reggae", "Baroque Reggae"], suggestions: ["Laid-Back Groove", "Deep Bass", "Organ", "Call and Response", "Dub", "Warm Analog"] },
    { triggers: ["Opera", "Baroque Opera Rock"], suggestions: ["Operatic Vocals", "Orchestra", "Choir", "Wide Range", "Theatrical Vocals", "Dynamic Swells"] }
  ],
  conflictRules: [
    { left: ["No Vocals", "Instrumental"], right: ["Lead Vocal", "Male Vocal", "Female Vocal", "Duet", "Choir Vocals", "Rap Vocals"], message: "No-vocal direction conflicts with selected vocal parts." },
    { left: ["No Drums"], right: ["Live Drums", "Electronic Drums", "Drum Machine", "Huge Drums", "Crisp Drums"], message: "No Drums conflicts with selected drum parts." },
    { left: ["Dry Mix", "Dry Vocal"], right: ["Wet Mix", "Infinite Reverb", "Long Reverb Tail"], message: "Dry and heavily reverberant directions need section-specific roles." },
    { left: ["Mono"], right: ["Wide Stereo", "Huge Stereo Width", "Stereo Widener"], message: "Mono and extra-wide stereo should be assigned to different sections." },
    { left: ["Sparse Arrangement", "Minimal"], right: ["Dense Layers", "Maximalist Production", "Wall of Sound"], message: "Sparse and maximal directions work best as a deliberate build or contrast." },
    { left: ["Hard Stop", "Abrupt Ending"], right: ["Fade Out", "Looped Outro", "Vamp Outro"], message: "Choose one main ending behavior or specify a false ending." },
    { left: ["Tight Performance"], right: ["Loose Performance", "Controlled Chaos"], message: "Tight and loose performance tags need separate sections or performers." },
    { left: ["Modern Production", "Digital Precision"], right: ["Vintage Recording", "Unmastered Feel", "Cassette Master"], message: "Modern precision and vintage degradation should have a clear priority." },
    { left: ["Low Register"], right: ["High Register", "Whistle Register"], message: "Very low and very high registers imply a wide-range or role-split arrangement." }
  ]
});

(() => {
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "style-v34.css";
  document.head.appendChild(style);

  const loadV341 = () => {
    if (document.documentElement.dataset.forgeV34 !== "ready") {
      window.setTimeout(loadV341, 40);
      return;
    }
    if (document.querySelector('script[src="app-v341.js"]')) return;
    const patchScript = document.createElement("script");
    patchScript.src = "app-v341.js";
    patchScript.async = false;
    document.head.appendChild(patchScript);
  };

  const dataScript = document.createElement("script");
  dataScript.src = "data-v34.js";
  dataScript.async = false;
  dataScript.addEventListener("load", () => {
    const loadV34 = () => {
      if (document.documentElement.dataset.forgeV33 !== "ready") {
        window.setTimeout(loadV34, 40);
        return;
      }

      const existing = document.querySelector('script[src="app-v34.js"]');
      if (existing) {
        loadV341();
        return;
      }

      const appScript = document.createElement("script");
      appScript.src = "app-v34.js";
      appScript.async = false;
      appScript.addEventListener("load", loadV341, { once: true });
      document.head.appendChild(appScript);
    };

    if (document.readyState === "complete") loadV34();
    else window.addEventListener("load", loadV34, { once: true });
  });
  document.head.appendChild(dataScript);
})();
