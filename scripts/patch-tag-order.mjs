import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataPath = path.join(root, "data.js");
const marker = "/* FORGE_TAG_INTENSITY_ORDER_V1 */";

if (!fs.existsSync(dataPath)) {
  throw new Error("data.js was not found.");
}

const current = fs.readFileSync(dataPath, "utf8");
if (current.includes(marker)) {
  process.exit(0);
}

const sorter = String.raw`

${marker}
(() => {
  if (typeof DATA === "undefined" || !DATA?.categories) return;

  const rules = [
    [/\b(?:minimal|minimalist|simple|basic|plain|clean|dry|natural|organic|acoustic|solo|unison|mono|narrow|restrained|subtle|gentle|soft|quiet|calm|mellow|warm|intimate|delicate|light|airy|breathy|whisper|whispered|slow|steady|straight|sparse|traditional|smooth|tender|serene|peaceful|lullaby|ambient|downtempo)\b/i, -28],
    [/\b(?:low|close-mic|conversational|storytelling|legato|rubato|brush|fingerstyle|clean electric|upright|folk|country|blues|pop|soul|jazz|chamber)\b/i, -14],
    [/\b(?:balanced|moderate|mid|medium|groove|rhythmic|driving|bright|wide|layered|stacked|syncopated|energetic|powerful|anthemic|cinematic|rock|funk|dance|house|trance)\b/i, 10],
    [/\b(?:dense|complex|technical|virtuosic|progressive|experimental|avant-garde|polyrhythm|polyrhythmic|odd meter|irregular|rapid|rapid-fire|double-time|blast|breakcore|glitch|granular|modular|maximal|maximalist|orchestral|symphonic)\b/i, 24],
    [/\b(?:aggressive|angry|dark|harsh|heavy|hard|distorted|overdriven|saturated|explosive|chaotic|violent|menacing|sinister|apocalyptic|industrial|noise|scream|screamed|shout|shouted|growl|growled|death|black metal|thrash|doom|sludge|hardcore|metalcore|deathcore|djent|riddim|brostep|neurofunk|gabber)\b/i, 38]
  ];

  const categoryRules = {
    Genre: [
      [/\b(?:lullaby|ambient|new age|folk|acoustic|singer-songwriter|country|blues|soft rock|pop)\b/i, -18],
      [/\b(?:rock|punk|metal|industrial|noise|experimental|breakcore|hardcore|deathcore|djent)\b/i, 22]
    ],
    Mood: [
      [/\b(?:calm|peaceful|serene|tender|warm|hopeful|reflective|intimate|playful|happy)\b/i, -24],
      [/\b(?:tense|restless|uneasy|angry|aggressive|chaotic|menacing|sinister|apocalyptic|devastated)\b/i, 26]
    ],
    Instruments: [
      [/\b(?:acoustic|nylon|string guitar|ukulele|harp|piano|flute|recorder|shaker|brush|solo)\b/i, -12],
      [/\b(?:distorted|modular|granular|orchestra|industrial|taiko|brass section|woodwind section|choir)\b/i, 18]
    ],
    Vocals: [
      [/\b(?:solo vocal|clean vocals|airy|breathy|tender|intimate|warm|folk vocals)\b/i, -18],
      [/\b(?:group vocals|gang vocals|powerful|aggressive|shouted|screamed|growled|operatic|theatrical)\b/i, 20]
    ],
    "Vocal Delivery": [
      [/\b(?:whisper|conversational|straight-tone|legato|soft|deadpan|slow drawl|minimal ad-libs)\b/i, -22],
      [/\b(?:belting|rapid-fire|shouted|screamed|growl|vocal runs|wide vibrato|improvised)\b/i, 24]
    ],
    "Vocal Arrangement": [
      [/\b(?:unison|solo|single|two-part|octave doubles|minimal)\b/i, -18],
      [/\b(?:stacked|four-part|counterpoint|overlapping|choir|gang|crowd|round|ostinato)\b/i, 22]
    ],
    Rhythm: [
      [/\b(?:straight|steady|half-time|slow|simple|minimal)\b/i, -18],
      [/\b(?:syncopated|double-time|polyrhythm|odd|irregular|blast|rapid|complex)\b/i, 24]
    ],
    Production: [
      [/\b(?:dry|clean|natural|minimal|mono|narrow|subtle|warm|organic|lo-fi)\b/i, -18],
      [/\b(?:wide|layered|dense|saturated|distorted|maximal|cinematic|industrial|glitch)\b/i, 22]
    ],
    Arrangement: [
      [/\b(?:minimal|simple|solo|sparse|short|direct)\b/i, -18],
      [/\b(?:layered|stacked|counterpoint|through-composed|progressive|extended|epic|complex)\b/i, 22]
    ]
  };

  function score(category, label) {
    let value = 50;
    for (const [pattern, weight] of rules) {
      if (pattern.test(label)) value += weight;
    }
    for (const [pattern, weight] of categoryRules[category] || []) {
      if (pattern.test(label)) value += weight;
    }
    return value;
  }

  for (const [category, tags] of Object.entries(DATA.categories)) {
    if (!Array.isArray(tags)) continue;
    const original = new Map(tags.map((tag, index) => [tag, index]));
    tags.sort((left, right) => {
      const difference = score(category, left) - score(category, right);
      return difference || original.get(left) - original.get(right);
    });
  }

  const explainOrder = () => {
    const copy = document.querySelector(".library-card .section-copy");
    if (copy) copy.textContent = "Options are ordered from mild and simple at the top to aggressive and complex at the bottom.";
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", explainOrder, { once: true });
  } else {
    explainOrder();
  }
})();
`;

fs.writeFileSync(dataPath, `${current.trimEnd()}${sorter}\n`, "utf8");
console.log("Applied Forge tag intensity ordering.");
