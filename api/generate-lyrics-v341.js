const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
const requests = new Map();
const ALLOWED_ACTIONS = new Set(["generate", "regenerate", "polish", "continue", "hooks"]);

const FORBIDDEN_PATTERNS = [
  /\b(?:song|songs|music|musical|melody|melodies|rhythm|rhythms|tune|tunes|sing|sings|sang|sung|singing|singer|singers|lyric|lyrics|guitar|guitars|piano|pianos|drum|drums|drummer|banjo|mandolin|fiddle|violin|violins|cello|saxophone|sax|trumpet|trombone|harmonica|flute|clarinet|synth|synthesizer|orchestra|choir|microphone|microphones|mic|studio|recording|recordings|headphones|earbuds|amplifier|amplifiers|vocoder|turntable|turntables)\b/i,
  /\b(?:phone|phones|cellphone|cellphones|smartphone|smartphones|screen|screens|computer|computers|laptop|laptops|browser|browsers|modem|modems|router|routers|internet|online|wi-?fi|wire|wires|wired|cable|cables|charger|chargers|charging|battery|batteries|radio|radios|television|televisions|tv|tablet|tablets|email|emails|e-mail|voicemail|voicemails|notification|notifications|digital|electronic|electronics|electricity|electrical|electric|outlet|outlets|plug|plugs|socket|sockets|app|apps|website|websites|webpage|webpages|keyboard|keyboards|mouse|monitor|monitors|printer|printers|camera|cameras|refrigerator|refrigerators|fridge|fridges|microwave|microwaves|circuit|circuits|voltage|signal|signals)\b/i
];

const STALE_METAPHOR_PATTERNS = [
  { label: "ledger metaphor", pattern: /\bledgers?\b/i },
  { label: "bookkeeping metaphor", pattern: /\b(?:balance sheets?|bookkeep(?:er|ing)?|tally books?|accounts? settled|settling accounts?)\b/i },
  {
    label: "life-as-accounting metaphor",
    pattern: /\b(?:life|love|heart|soul|memory|memories|past|pain|grief|years?)\b.{0,48}\b(?:debts?|dues?|accounts?|balances?|owed|paid|price|cost|tally)\b|\b(?:debts?|dues?|accounts?|balances?|owed|paid|price|cost|tally)\b.{0,48}\b(?:life|love|heart|soul|memory|memories|past|pain|grief|years?)\b/i
  }
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

function staleMetaphors(text) {
  const body = lyricBodyOnly(text);
  return STALE_METAPHOR_PATTERNS
    .filter(({ pattern }) => pattern.test(body))
    .map(({ label }) => label);
}

function taskForAction(action, previousLyrics) {
  if (action === "regenerate") {
    return `Write a complete new draft that is substantially different in scenes, central phrases, line shapes, imagery families, and wording. Preserve only the core brief and requested structure. Do not recycle the previous draft's metaphors.\n\nPREVIOUS DRAFT:\n${previousLyrics || "None"}`;
  }
  if (action === "polish") {
    return `Return a complete polished version. Preserve the core story, strongest specific images, section order, and emotional intent. Improve specificity, flow, natural phrasing, and line economy. Replace generic metaphors with actions or sensory evidence.\n\nCURRENT LYRICS:\n${previousLyrics || "None"}`;
  }
  if (action === "continue") {
    return `Continue without repeating existing lines, metaphors, or object motifs. Output continuation only, beginning with an appropriate section label.\n\nCURRENT LYRICS:\n${previousLyrics || "None"}`;
  }
  if (action === "hooks") {
    return `Write exactly five distinct central-phrase options. Label them [Option 1] through [Option 5]. Each option should be 2-4 concise lines with a different image family and no bookkeeping metaphors.\n\nCURRENT LYRICS FOR CONTEXT:\n${previousLyrics || "None"}`;
  }
  return "Write a complete original lyric draft that follows the requested structure exactly.";
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
      instructions: "Write disciplined, specific, human lyrics. Honor every weighted style tag according to its priority. Treat style information as invisible production metadata. Never put music-making, instrument, performance, studio, electronic, electrical, internet, computer, phone, screen, or communications-technology references inside lyric lines. Avoid stock metaphor systems, especially bookkeeping or accounting language applied to life, love, memory, guilt, grief, or pain.",
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

  if (["polish", "continue"].includes(action) && !previousLyrics) {
    return json(res, 400, { error: "This action requires lyrics in the editor." });
  }

  const checklist = selectedTags.length
    ? selectedTags.map((tag, index) => `${index + 1}. ${tag} — ${weightLabel(tagWeights[tag])} (${tagWeights[tag]}%)`).join("\n")
    : "No selected tags.";
  const variationKey = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const prompt = `You are writing for Forge Studio, a professional mobile songwriting workstation.

ACTION: ${action}
TASK: ${taskForAction(action, previousLyrics)}
CREATIVE VARIATION KEY: ${variationKey} — use it only to avoid repeating familiar choices; never print it.

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
- Never name or describe genres, instruments, vocals, arrangements, performing, recording, studios, songs, singing, melodies, rhythms, or music-making inside lyric lines.
- Never mention electronics, electricity, wires, cables, browsers, modems, routers, internet services, phones, screens, computers, radios, televisions, appliances, digital devices, notifications, signals, or related technology inside lyric lines.
- Never use ledger, bookkeeping, balance-sheet, tally-book, settled-account, debts-owed, dues-paid, price-of-love, or cost-of-life metaphors.
- Do not turn life, love, memory, guilt, grief, pain, the heart, or the soul into an account, balance, debt, bill, price, transaction, or payment.
- Prefer a person doing something in a specific place over abstract statements about life.
- Do not build the draft from a list of receipts, letters, tickets, money, or paper objects. Use varied sensory evidence, physical actions, spoken words, work routines, weather, rooms, roads, bodies, food, clothing, and consequences only when they advance the scene.
- Square-bracket section headings are allowed as structural metadata; lines beneath them must obey the exclusions.
- Use concrete, believable human details and consequences. Avoid filler, vague cosmic imagery, generic inspiration, stock heartbreak phrases, and familiar AI-poetry constructions.
- Each section must add new information, action, pressure, or consequence.
- Do not imitate, mention, or closely evoke any living artist or copyrighted work.
- Output only the requested lyrics or options. No explanation, analysis, markdown fence, or title unless it is part of a lyric line.`;

  const maxOutputTokens = outputTokenLimit(action, length);
  const startedAt = Date.now();

  try {
    let lyrics = await callOpenAI(prompt, maxOutputTokens, 40_000);
    if (!lyrics) return json(res, 502, { error: "The model returned an empty result." });

    let forbidden = forbiddenReferences(lyrics);
    let stale = staleMetaphors(lyrics);
    if ((forbidden.length || stale.length) && Date.now() - startedAt < 43_000) {
      const cleanup = `Rewrite the text below while preserving section headings, story, perspective, emotional meaning, and approximate length.

Remove every detected forbidden reference and stale metaphor. Do not replace anything with music, technology, bookkeeping, accounting, transactional, debt, payment, price, cost, bill, balance, tally, account, ledger, receipt, letter, ticket, or generic paper-object imagery. Replace the affected lines with scene-specific human actions, sensory evidence, spoken words, work routines, weather, rooms, roads, bodies, food, clothing, or consequences that fit the existing story.

Detected forbidden references: ${forbidden.join(", ") || "none"}
Detected stale metaphors: ${stale.join(", ") || "none"}

TEXT:
${lyrics}

Output only the rewritten text.`;
      lyrics = await callOpenAI(cleanup, Math.min(maxOutputTokens, 1800), 12_000);
      forbidden = forbiddenReferences(lyrics);
      stale = staleMetaphors(lyrics);
    }

    if (!lyrics || forbidden.length || stale.length) {
      return json(res, 422, {
        error: stale.length
          ? "The draft repeated a blocked lyric cliché. Forge will use its safe local writer instead."
          : "The draft contained prohibited music or electronics references. Forge will use its safe local writer instead."
      });
    }

    return json(res, 200, {
      lyrics,
      action,
      tagCount: selectedTags.length,
      weighted: true,
      qualityGuard: "3.4.1"
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return json(res, timedOut ? 504 : (error?.status || 500), {
      error: timedOut ? "The AI request took too long. Forge will use its safe local writer instead." : (error?.message || "Unexpected server error.")
    });
  }
}
