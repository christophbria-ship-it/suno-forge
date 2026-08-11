"use strict";

(() => {
  const categories = DATA?.categories;
  if (!categories) return;

  const normalize = value => String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  function insertUniqueBefore(category, boundaryTag, additions) {
    const tags = categories[category];
    if (!Array.isArray(tags)) return;

    const existing = new Set(tags.map(normalize));
    const uniqueAdditions = additions.filter(tag => {
      const key = normalize(tag);
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    });

    if (!uniqueAdditions.length) return;
    const boundaryIndex = tags.indexOf(boundaryTag);
    const insertAt = boundaryIndex >= 0 ? boundaryIndex : tags.length;
    tags.splice(insertAt, 0, ...uniqueAdditions);
  }

  // Genres: only genuinely new choices from the supplied reference list.
  insertUniqueBefore("Genre", "Metal", [
    "Rock and Roll"
  ]);

  insertUniqueBefore("Genre", "Hip-Hop", [
    "Hair Metal"
  ]);

  insertUniqueBefore("Genre", "Electropop", [
    "Northern Soul",
    "Southern Soul"
  ]);

  insertUniqueBefore("Genre", "Glitch Hop", [
    "Big Room House"
  ]);

  insertUniqueBefore("Genre", "Country", [
    "Lo-Fi"
  ]);

  insertUniqueBefore("Genre", "Blues", [
    "Bro-Country"
  ]);

  insertUniqueBefore("Genre", "Reggae", [
    "Classic Female Blues"
  ]);

  insertUniqueBefore("Genre", "Celtic Folk", [
    "Afropop"
  ]);

  insertUniqueBefore("Genre", "Poetry", [
    "Impressionism",
    "Modernism",
    "Contemporary Classical"
  ]);

  // Instruments: skip aliases already covered (Pedal Steel/Pedal Steel Guitar,
  // Rhodes/Rhodes Piano, Analog Synth/Analog Synthesizer, etc.).
  insertUniqueBefore("Instruments", "Upright Bass", [
    "Classical Guitar",
    "Ngoni"
  ]);

  insertUniqueBefore("Instruments", "Piano", [
    "Kora"
  ]);

  insertUniqueBefore("Instruments", "Double Bass Drum Pedal", [
    "MIDI Keyboard Controller",
    "Drum Pad Controller",
    "MIDI Controller (Pad-Based)"
  ]);

  insertUniqueBefore("Instruments", "Music Box", [
    "Drum Kit",
    "Cymbals",
    "Body Percussion"
  ]);
})();
