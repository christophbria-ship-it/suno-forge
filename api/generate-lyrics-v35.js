const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
const requests = new Map();
const ALLOWED_ACTIONS = new Set(["generate", "regenerate", "polish", "continue", "hooks"]);

const TONES = Object.freeze({
  auto: "Let the supplied story and selected emotional tags determine the dominant tone. Keep it emotionally specific rather than generically sad or uplifting.",
  dark: "Dark, tense, and unsentimental. Build dread, resentment, isolation, damage, danger, or decay through concrete scenes and consequences. Do not use vague gothic wallpaper, generic shadows, or melodramatic evil language.",
  happy: "Genuinely happy, warm, playful, relieved, or affectionate. Use physical joy, humor, ordinary wins, real companionship, and specific sensory pleasure. Avoid motivational slogans, forced sunshine, and denying all complications.",
  bittersweet: "Hold pleasure and loss in the same scene. Let good details remain good while their cost or impermanence becomes clear. Avoid announcing that the feeling is bittersweet.",
  angry: "Angry, sharp, and controlled enough to be believable. Use accusations, withheld speech, physical tension, consequences, and specific grievances. Avoid empty threats and generic rage slogans.",
  hopeful: "Hopeful without becoming inspirational copy. Earn hope through a choice, repair, risk, gesture, or changed behavior. Keep the damage visible.",
  numb: "Emotionally numb, detached, and observant. Let ordinary details carry the pressure. Avoid repeatedly naming emptiness, numbness, or silence.",
  defiant: "Defiant and self-possessed. Show refusal through action and boundaries rather than empowerment slogans or victory speeches.",
  cinematic: "Cinematic in scale and visual progression while remaining intimate and believable. Build distinct scenes, reversals, movement, and consequences. Avoid trailer slogans and generic epic language."
});

const ARCS = Object.freeze({
  consistent: "Keep the chosen tone coherent from beginning to end while allowing natural increases and decreases in intensity.",
  "happy-dark": "Begin with believable warmth, humor, relief, or safety. Introduce one small wrong detail, then let its meaning spread. The final sections should reveal a darker consequence without making the opening feel fake.",
  "dark-hopeful": "Begin inside damage, fear, resentment, or defeat. Do not erase it. Let a concrete choice, gesture, departure, repair, or boundary create a narrow but credible opening by the end.",
  "calm-explosive": "Start restrained, observational, and low-pressure. Accumulate specific details and withheld information. Break open in the bridge or final chorus with blunt emotional force and shorter, harder lines.",
  "hopeful-devastating": "Build credible hope through actions and details, then overturn it with a specific revelation or consequence. Do not use a random twist; the ending must be prepared by earlier clues.",
  "numb-defiant": "Begin detached and passive. Gradually sharpen perception and agency until the narrator makes a clear refusal, boundary, departure, or decision.",
  "tender-furious": "Begin with care, intimacy, or vulnerability. Let betrayal, hypocrisy, neglect, or danger become undeniable. End in focused anger rather than uncontrolled shouting."
});

const VOICES = Object.freeze({
  natural: "Use contemporary, natural human language. Favor clear scenes, believable speech, varied line length, and memorable phrasing that does not sound engineered for quotes.",
  grunge90s: "Use broad 1990s grunge and alternative lyric traits only: raw and unpolished language, a flawed or unreliable narrator, sardonic understatement, mundane or ugly sensory details, alienation, bodily discomfort, domestic or workaday objects, oblique connections that still feel concrete, uneven line lengths, loose or internal rhyme, detached verses, and a chorus built around one blunt hard phrase. Do not name, imitate, closely evoke, or borrow distinctive wording from any artist, band, song, or copyrighted work.",
  cinematic: "Write as a sequence of visible scenes with entrances, exits, locations, movement, reversals, and consequences. Use framing and scale without writing stage directions or trailer copy.",
  plainspoken: "Use direct everyday language, short sentences, overheard speech, and concrete facts. Avoid ornate metaphor unless it arises naturally from a physical object in the scene.",
  confessional: "Use a raw first-hand voice that admits contradiction, embarrassment, blame, desire, and self-deception. Keep revelations specific and avoid diary-summary clichés.",
  "surreal-grounded": "Allow strange juxtapositions and dreamlike images, but anchor each one to a real room, body, object, action, or consequence. Avoid random cosmic imagery.",
  "punk-direct": "Use compressed, confrontational, socially alert language, hard verbs, short lines, and sharp repetition. Avoid slogans that could fit on any poster."
});

const CHEESE_RULES = Object.freeze({
  relaxed: "Familiar language is allowed sparingly when it is earned by the scene, but avoid the banned bookkeeping and book-of-life metaphors.",
  balanced: "Avoid obvious stock heartbreak, inspiration, cosmic, and empowerment phrases. Prefer specific actions and objects over abstract summaries.",
  strict: "Use a strict anti-cliché standard. No stock poetic shortcuts, generic heartbreak phrases, motivational slogans, vague darkness, generic fire or storm metaphors, or abstract summaries of life and love. Every major image must belong to this particular story.",
  ruthless: "Use a ruthless anti-cheese standard. Remove any line that sounds prewritten, quotable without context, inspirational, melodramatic, or interchangeable with another song. No abstract life lessons, destiny language, generic inner battles, fire/shadow/storm/ashes metaphors unless literally present, or familiar romantic promises. Concrete scene evidence must carry the emotion."
});

const FORBIDDEN_PATTERNS = [
  /\b(?:song|songs|music|musical|melody|melodies|rhythm|rhythms|tune|tunes|sing|sings|sang|sung|singing|singer|singers|lyric|lyrics|guitar|guitars|piano|pianos|drum|drums|drummer|banjo|mandolin|fiddle|violin|violins|cello|saxophone|sax|trumpet|trombone|harmonica|flute|clarinet|synth|synthesizer|orchestra|choir|microphone|microphones|mic|studio|recording|recordings|headphones|earbuds|amplifier|amplifiers|vocoder|turntable|turntables)\b/i,
  /\b(?:phone|phones|cellphone|cellphones|smartphone|smartphones|screen|screens|computer|computers|laptop|laptops|browser|browsers|modem|modems|router|routers|internet|online|wi-?fi|wire|wires|wired|cable|cables|charger|chargers|charging|battery|batteries|radio|radios|television|televisions|tv|tablet|tablets|email|emails|e-mail|voicemail|voicemails|notification|notifications|digital|electronic|electronics|electricity|electrical|electric|outlet|outlets|plug|plugs|socket|sockets|app|apps|website|websites|webpage|webpages|keyboard|keyboards|mouse|monitor|monitors|printer|printers|camera|cameras|refrigerator|refrigerators|fridge|fridges|microwave|microwaves|circuit|circuits|voltage|signal|signals)\b/i
];

const BASE_CLICHES = [
  ["ledger-of-life metaphor", /\b(?:(?:a|the)\s+)?ledger\s+(?:of|for)\s+(?:life|love|time|years?|memory|memories|grief|loss|the\s+heart|our\s+lives)\b/i],
  ["emotional bookkeeping metaphor", /\b(?:life|love|memory|memories|grief|loss|the\s+heart|our\s+lives)\s+(?:keeps?|kept|keeping)\s+(?:the\s+)?(?:books|score|accounts?)\b/i],
  ["balance-the-books metaphor", /\b(?:balance|balancing|balanced)\s+(?:the\s+)?(?:books|accounts?|scales)\s+(?:of|for)\s+(?:life|love|memory|memories|grief|loss|the\s+heart)\b/i],
  ["pages-or-chapters-of-life metaphor", /\b(?:pages?|chapters?)\s+(?:of|in)\s+(?:my|your|our|this|the)\s+(?:life|story|heart)\b/i],
  ["emotional debt metaphor", /\b(?:debts?|dues?|accounts?)\s+(?:of|for)\s+(?:love|life|the\s+heart|memory|memories|grief)\b/i]
];

const STRICT_CLICHES = [
  ["fire-in-my-veins phrase", /\bfire\s+in\s+(?:my|your|our|the)\s+veins\b/i],
  ["broken-wings phrase", /\bbroken\s+wings\b/i],
  ["rise-above phrase", /\brise\s+above\b/i],
  ["chasing-dreams phrase", /\bchas(?:e|ing)\s+(?:my|your|our|the)?\s*dreams\b/i],
  ["lost-in-the-night phrase", /\blost\s+in\s+the\s+night\b/i],
  ["shattered-pieces phrase", /\bshattered\s+pieces\b/i],
  ["heart-on-fire phrase", /\bheart\s+on\s+fire\b/i],
  ["scream-into-the-void phrase", /\bscream(?:ing|s|ed)?\s+into\s+the\s+void\b/i],
  ["shadows-of-the-past phrase", /\bshadows?\s+of\s+the\s+past\b/i],
  ["echoes-of-yesterday phrase", /\bechoes?\s+of\s+yesterday\b/i],
  ["storm-inside phrase", /\bstorm\s+(?:inside|within)\b/i],
  ["chains-that-bind phrase", /\bchains?\s+that\s+bind\b/i],
  ["drowning-in-sorrow phrase", /\bdrown(?:ing|ed)?\s+in\s+(?:my|your|our)?\s*sorrow\b/i],
  ["scars-remind phrase", /\bscars?\s+(?:that\s+)?remind(?:s|ed)?\s+(?:me|us|you)\b/i],
  ["rise-from-ashes phrase", /\b(?:rise|rising|rose)\s+from\s+the\s+ashes\b/i],
  ["darkness-inside phrase", /\bdarkness\s+(?:inside|within)\b/i],
  ["battle-within phrase", /\bbattle\s+within\b/i],
  ["light-at-end phrase", /\blight\s+at\s+the\s+end\s+of\s+the\s+tunnel\b/i],
  ["time-heals phrase", /\btime\s+heals\s+all\s+wounds\b/i]
];

const RUTHLESS_CLICHES = [
  ["nothing-left-to-lose phrase", /\bnothing\s+left\s+to\s+lose\b/i],
  ["against-all-odds phrase", /\bagainst\s+all\s+odds\b/i],
  ["take-me-as-I-am phrase", /\btake\s+me\s+as\s+i\s+am\b/i],
  ["we-will-make-it-through phrase", /\bwe(?:'ll|\s+will)\s+make\s+it\s+through\b/i],
  ["one-more-chance phrase", /\bone\s+more\s+chance\b/i],
  ["never-let-go phrase", /\bnever\s+let\s+go\b/i],
  ["forever-and-always phrase", /\bforever\s+and\s+always\b/i],
  ["meant-to-be phrase", /\bmeant\s+to\s+be\b/i],
  ["set-me-free phrase", /\bset\s+me\s+free\b/i],
  ["hold-on-tight phrase", /\bhold\s+on\s+tight\b/i]
];

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function getIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  return String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.socket?.remoteAddress || "unknown")
    .split(",")[0]
    .trim();
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    requests.set(ip, recent);
    return true;
  }
  recent.push(now);
  requests.set(ip, recent);
  return false;
}

function cleanString(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanArray(value, maxItems, maxLength) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function cleanChoice(value, choices, fallback) {
  const clean = cleanString(value, 40);
  return Object.hasOwn(choices, clean) ? clean : fallback;
}

function cleanWeights(value, selectedTags) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return Object.fromEntries(selectedTags.map((tag) => {
    const raw = Number(source[tag]);
    const snapped = Number.isFinite(raw) ? Math.round(raw / 25) * 25 : 75;
    return [tag, Math.min(100, Math.max(25, snapped))];
  }));
}

function weightLabel(weight) {
  if (weight >= 100) return "PRIMARY";
  if (weight >= 75) return "STRONG";
  if (weight >= 50) return "SUPPORTING";
  return "ACCENT";
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text.trim();
    }
  }
  return "";
}

function lyricBodyOnly(text) {
  return String(text || "").replace(/^\s*\[[^\]]+\]\s*$/gm, "");
}

function forbiddenReferences(text) {
  const body = lyricBodyOnly(text);
  const hits = [];
  FORBIDDEN_PATTERNS.forEach((pattern) => {
    const match = body.match(pattern);
    if (match?.[0]) hits.push(match[0].toLowerCase());
  });
  return [...new Set(hits)];
}

function stockClicheHits(text, cheeseFilter) {
  const body = lyricBodyOnly(text);
  const patterns = [...BASE_CLICHES];
  if (["strict", "ruthless"].includes(cheeseFilter)) patterns.push(...STRICT_CLICHES);
  if (cheeseFilter === "ruthless") patterns.push(...RUTHLESS_CLICHES);
  return patterns.filter(([, pattern]) => pattern.test(body)).map(([label]) => label);
}

function taskForAction(action, previousLyrics) {
  if (action === "regenerate") {
    return `Write a complete new draft that is substantially different in scenes, central phrases, line shapes, metaphors, and wording. Preserve only the core brief, Lyric Director settings, and requested structure. Do not recycle distinctive images from the previous draft.\n\nPREVIOUS DRAFT:\n${previousLyrics || "None"}`;
  }
  if (action === "polish") {
    return `Return a complete polished version. Preserve the core story, strongest original images, section order, emotional arc, and writing voice. Improve specificity, flow, natural phrasing, and line economy. Replace stock AI language with concrete details from the actual scene.\n\nCURRENT LYRICS:\n${previousLyrics || "None"}`;
  }
  if (action === "continue") {
    return `Continue without repeating existing lines or distinctive metaphors. Output continuation only, beginning with an appropriate section label. Follow the selected emotional arc from the point already reached.\n\nCURRENT LYRICS:\n${previousLyrics || "None"}`;
  }
  if (action === "hooks") {
    return `Write exactly five distinct central-phrase options. Label them [Option 1] through [Option 5]. Each option should be 2-4 concise lines, obey the selected writing voice and cheese filter, and arise from a concrete action, place, object, or consequence.\n\nCURRENT LYRICS FOR CONTEXT:\n${previousLyrics || "None"}`;
  }
  return "Write a complete original lyric draft that follows the requested structure and Lyric Director settings exactly.";
}

function outputTokenLimit(action, length) {
  if (action === "hooks") return 900;
  return { short: 1100, standard: 1700, extended: 2400, epic: 3000 }[length] || 1700;
}

async function callOpenAI(input, maxOutputTokens, timeoutMs) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: "Write disciplined, specific, human lyrics. Honor the Lyric Director and every weighted style tag according to its priority. Treat all musical style information as invisible production metadata. Never imitate or closely evoke a particular artist, band, song, or copyrighted lyric. Never put music-making, instrument, performance, studio, electronic, electrical, internet, computer, phone, screen, or communications-technology references inside lyric lines. Avoid stock AI metaphors and build imagery from concrete actions, places, objects, speech, weather, work, bodies, and consequences tied to the supplied story.",
      input,
      reasoning: { effort: "minimal" },
      max_output_tokens: maxOutputTokens,
      store: false
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || `OpenAI request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return extractOutputText(data);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }
  if (!process.env.OPENAI_API_KEY) {
    return json(res, 503, { error: "OPENAI_API_KEY is not configured on the server." });
  }

  const ip = getIp(req);
  if (rateLimited(ip)) return json(res, 429, { error: "Too many AI requests. Wait one minute and try again." });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return json(res, 400, { error: "Request body must be valid JSON." });
  }

  const action = ALLOWED_ACTIONS.has(body.action) ? body.action : "generate";
  const songIdea = cleanString(body.songIdea, 700);
  const customInstructions = cleanString(body.customInstructions, 1200);
  const selectedTags = cleanArray(body.selectedTags, 100, 70);
  const tagWeights = cleanWeights(body.tagWeights, selectedTags);
  const structure = cleanArray(body.structure, 24, 40);
  const previousLyrics = cleanString(body.previousLyrics, 16000);
  const bpm = Math.min(220, Math.max(50, Number(body.bpm) || 120));
  const energy = cleanString(body.energy, 30) || "medium";
  const length = cleanString(body.length, 30) || "standard";
  const perspective = cleanString(body.perspective, 40) || "first-person";
  const rhymeMode = cleanString(body.rhymeMode, 30) || "natural";
  const density = cleanString(body.density, 30) || "balanced";
  const language = cleanString(body.language, 40) || "English";
  const lyricTone = cleanChoice(body.lyricTone, TONES, "auto");
  const lyricArc = cleanChoice(body.lyricArc, ARCS, "consistent");
  const lyricVoice = cleanChoice(body.lyricVoice, VOICES, "natural");
  const cheeseFilter = cleanChoice(body.cheeseFilter, CHEESE_RULES, "strict");
  const variationKey = cleanString(body.variationKey, 80) || `${Date.now()}`;

  if (["polish", "continue"].includes(action) && !previousLyrics) {
    return json(res, 400, { error: "This action requires lyrics in the editor." });
  }

  const checklist = selectedTags.length
    ? selectedTags.map((tag, index) => `${index + 1}. ${tag} — ${weightLabel(tagWeights[tag])} (${tagWeights[tag]}%)`).join("\n")
    : "No selected tags.";

  const prompt = `You are writing for Forge Studio, a professional mobile songwriting workstation.

ACTION: ${action}
TASK: ${taskForAction(action, previousLyrics)}

LYRIC DIRECTOR
Emotional tone: ${lyricTone}
Tone direction: ${TONES[lyricTone]}
Emotional arc: ${lyricArc}
Arc direction: ${ARCS[lyricArc]}
Writing mode: ${lyricVoice}
Voice direction: ${VOICES[lyricVoice]}
Cheese filter: ${cheeseFilter}
Anti-cheese direction: ${CHEESE_RULES[cheeseFilter]}
Variation key: ${variationKey} — use this only to force a fresh creative route; never print or refer to it.

CREATIVE BRIEF
Song idea: ${songIdea || "Create a grounded human story from the selected emotional direction."}
Tempo: ${bpm} BPM
Energy: ${energy}
Length: ${length}
Language: ${language}
Perspective: ${perspective}
Rhyme approach: ${rhymeMode}
Lyric density: ${density}
Required structure: ${structure.join(" -> ") || "Verse -> Chorus -> Verse -> Chorus -> Bridge -> Final Chorus"}
Extra direction: ${customInstructions || "None"}

WEIGHTED TAG CHECKLIST — USE EVERY TAG
${checklist}

TAG PRIORITY RULES
- Every listed tag must influence the result; weight controls prominence, not whether it is used.
- PRIMARY tags define the main identity throughout.
- STRONG tags receive an obvious recurring role.
- SUPPORTING tags shape selected sections, phrasing, dynamics, or arrangement behavior.
- ACCENT tags appear as restrained details or brief contrasts.
- When tags conflict, assign them to different sections, layers, vocal roles, or intensity levels rather than ignoring either one.
- Tag names remain invisible metadata and must never appear in lyric lines.

NON-NEGOTIABLE LYRIC RULES
- Use the requested language and perspective.
- Follow the selected emotional arc across the section order rather than mentioning the arc in the lyric.
- Never name or describe genres, instruments, vocals, arrangements, performing, recording, studios, songs, singing, melodies, rhythms, or music-making inside lyric lines.
- Never mention electronics, electricity, wires, cables, browsers, modems, routers, internet services, phones, screens, computers, radios, televisions, appliances, digital devices, notifications, signals, or related technology inside lyric lines.
- These exclusions override the song idea, previous draft, selected tags, and extra direction.
- Square-bracket section headings are allowed as structural metadata; lines beneath them must obey the exclusions.
- Never use "ledger of life" or treat life, love, memory, grief, loss, or the heart as a ledger, account, balance sheet, tally, score, debt, book, page, or chapter.
- Build each major image from the supplied situation. Favor a specific action, location, object, overheard line, bodily detail, or consequence over abstract statements about life.
- Do not imitate, mention, or closely evoke any artist, band, copyrighted song, or distinctive lyric. Broad era and genre writing traits are allowed only as described in the Lyric Director.
- Repeated sections may repeat a strong central phrase, but surrounding lines should develop or change its meaning.
- Output only the requested lyrics or options. No explanation, analysis, markdown fence, or title unless it is part of a lyric line.`;

  const maxOutputTokens = outputTokenLimit(action, length);
  const startedAt = Date.now();

  try {
    let lyrics = await callOpenAI(prompt, maxOutputTokens, 40_000);
    if (!lyrics) return json(res, 502, { error: "The model returned an empty result." });

    let forbidden = forbiddenReferences(lyrics);
    let cliches = stockClicheHits(lyrics, cheeseFilter);
    if ((forbidden.length || cliches.length) && Date.now() - startedAt < 43_000) {
      const cleanup = `Rewrite the text below while preserving section headings, story, perspective, selected emotional arc, writing voice, and approximate length.

LYRIC DIRECTOR TO PRESERVE
Tone: ${TONES[lyricTone]}
Arc: ${ARCS[lyricArc]}
Writing mode: ${VOICES[lyricVoice]}
Cheese filter: ${CHEESE_RULES[cheeseFilter]}

Remove every detected music, instrument, performance, studio, electronics, electrical, internet, phone, screen, computer, appliance, wire, cable, browser, modem, router, signal, and digital-device reference.

Also remove every detected stock phrase. Do not replace one cliché with another abstract life lesson or generic fire, shadow, storm, ashes, destiny, inner-battle, or heartbreak metaphor. Replace it with a concrete action, place, physical object, spoken line, weather detail, work detail, bodily reaction, or consequence belonging to this specific story.

Detected prohibited references: ${forbidden.join(", ") || "None"}
Detected stock phrases: ${cliches.join(", ") || "None"}

TEXT:
${lyrics}

Output only the rewritten text.`;
      lyrics = await callOpenAI(cleanup, Math.min(maxOutputTokens, 1800), 12_000);
      forbidden = forbiddenReferences(lyrics);
      cliches = stockClicheHits(lyrics, cheeseFilter);
    }

    if (!lyrics || forbidden.length || cliches.length) {
      return json(res, 422, { error: "The draft contained prohibited references or stock lyric clichés. Forge will use its safe local writer instead." });
    }

    return json(res, 200, {
      lyrics,
      action,
      tagCount: selectedTags.length,
      weighted: true,
      director: { lyricTone, lyricArc, lyricVoice, cheeseFilter }
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return json(res, timedOut ? 504 : (error?.status || 500), {
      error: timedOut ? "The AI request took too long. Forge will use its safe local writer instead." : (error?.message || "Unexpected server error.")
    });
  }
}
