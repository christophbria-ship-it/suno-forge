import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const context = {};
vm.createContext(context);
for (const file of ["data.js", "data-additions.js", "tag-descriptions.js"]) {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
}
vm.runInContext("globalThis.TEST_DATA = DATA", context);

const { TEST_DATA, describeSimplistTag } = context;
assert.equal(typeof describeSimplistTag, "function", "The description engine must be available globally.");
assert.equal(Object.keys(TEST_DATA.categories).length, 20, "All 20 sound categories must be described.");

const banned = [
  /recognizable sound and feel of/i,
  /adds the tone and playing character of/i,
  /makes the music feel [^.]+\.$/i,
  /uses [^.]+ as a clear musical direction/i,
  /description of/i,
  /^its groove, instruments,/i,
  /^this sound source adds its own/i,
  /^the chosen voice type changes/i,
  /^the delivery choice changes/i,
  /^the selected register changes/i,
  /^the vocal layout changes/i,
  /^the choir choice changes/i,
  /^the selected groove changes/i,
  /^the production choice changes/i,
  /^the mix choice changes/i,
  /^the effect audibly changes/i,
  /^period-specific instruments/i,
  /^the writing choice changes/i,
  /^the arrangement choice changes/i,
  /^the performance choice changes/i,
  /^the space changes early reflections/i,
  /^the texture choice changes/i
];

let tagCount = 0;
for (const [category, tags] of Object.entries(TEST_DATA.categories)) {
  for (const tag of tags) {
    tagCount += 1;
    const description = describeSimplistTag(tag, category);
    assert.equal(typeof description, "string", `${category} / ${tag} must return text.`);
    assert.ok(description.length >= 45, `${category} / ${tag} needs a meaningful audible description.`);
    assert.ok(description.length <= 240, `${category} / ${tag} should remain concise enough for its card.`);
    assert.ok(!banned.some(pattern => pattern.test(description)), `${category} / ${tag} still uses a generic template: ${description}`);
  }
}
assert.equal(tagCount, 1962, "Every built-in and added tag must pass the description audit.");

const vocalizedFamily = [
  "A Cappella", "Barbershop", "Doo-Wop", "Musical Theatre", "Cabaret", "Sea Shanties",
  "Vocal Jazz", "Gospel", "Gospel Folk", "Gospel Ballad", "Hymn", "Bluegrass Gospel",
  "Old-Time Gospel", "Southern Gospel", "Contemporary Christian", "Worship Music", "Praise Music",
  "Sacred Harp", "Shape Note", "Spiritual", "Gregorian Chant", "Choral", "Opera", "Operetta",
  "Qawwali", "Ghazal"
];
const vocalizedDescriptions = vocalizedFamily.map(tag => describeSimplistTag(tag, "Genre"));
assert.equal(new Set(vocalizedDescriptions).size, vocalizedFamily.length, "Every Vocalized & Harmony choice needs its own sound description.");

const audibleChecks = [
  ["A Cappella", "Genre", /voices.+no instruments/i],
  ["Barbershop", "Genre", /four close vocal parts.+ringing chords/i],
  ["Qawwali", "Genre", /harmonium.+handclaps.+tabla|handclaps.+harmonium.+tabla/i],
  ["Acoustic Guitar", "Instruments", /wooden body resonance.+picked or strummed/i],
  ["Fretless Bass", "Instruments", /sliding pitch.+singing sustain/i],
  ["Aggressive", "Mood", /hard attacks.+forceful dynamics/i],
  ["Half-Time", "Rhythm & Groove", /half as fast/i],
  ["Warm Analog", "Production", /rounded transients.+saturation/i],
  ["Vocal Forward", "Mix & Master", /vocal sits louder and closer/i],
  ["Spring Reverb", "Effects", /metal springs.+splashy/i],
  ["1980s", "Era", /synths.+gated drums/i],
  ["Cold Open", "Arrangement", /starts immediately/i],
  ["Cathedral", "Recording Space", /long bright reverberation/i],
  ["Tape Warble", "Texture & Atmosphere", /pitch wobble.+softened highs/i]
];
for (const [tag, category, pattern] of audibleChecks) {
  assert.match(describeSimplistTag(tag, category), pattern, `${category} / ${tag} must explain its audible result.`);
}

console.log("Description checks passed: 1,962 tags across 20 categories explain an audible result with no placeholder templates.");
