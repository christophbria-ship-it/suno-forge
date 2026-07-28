const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
const requests = new Map();
const ALLOWED_ACTIONS = new Set(["generate", "regenerate", "polish", "continue", "hooks"]);

const FORBIDDEN_PATTERNS = [
  /\b(?:song|songs|music|musical|melody|melodies|rhythm|rhythms|tune|tunes|sing|sings|sang|sung|singing|singer|singers|lyric|lyrics|guitar|guitars|piano|pianos|drum|drums|drummer|banjo|mandolin|fiddle|violin|violins|cello|saxophone|sax|trumpet|trombone|harmonica|flute|clarinet|synth|synthesizer|orchestra|choir|microphone|microphones|mic|studio|recording|recordings|headphones|earbuds|amplifier|amplifiers|vocoder|turntable|turntables)\b/i,
  /\b(?:phone|phones|cellphone|cellphones|smartphone|smartphones|screen|screens|computer|computers|laptop|laptops|browser|browsers|modem|modems|router|routers|internet|online|wi-?fi|wire|wires|wired|cable|cables|charger|chargers|charging|battery|batteries|radio|radios|television|televisions|tv|tablet|tablets|email|emails|e-mail|voicemail|voicemails|notification|notifications|digital|electronic|electronics|electricity|electrical|electric|outlet|outlets|plug|plugs|socket|sockets|app|apps|website|websites|webpage|webpages|keyboard|keyboards|mouse|monitor|monitors|printer|printers|camera|cameras|refrigerator|refrigerators|fridge|fridges|microwave|microwaves|circuit|circuits|voltage|signal|signals)\b/i
];

const STOCK_CLICHE_PATTERNS = [
  {
    label: "ledger-of-life metaphor",
    pattern: /\b(?:(?:a|the)\s+)?ledger\s+(?:of|for)\s+(?:life|love|time|years?|memory|memories|grief|loss|the\s+heart|our\s+lives)\b/i
  },
  {
    label: "emotional bookkeeping metaphor",
    pattern: /\b(?:life|love|memory|memories|grief|loss|the\s+heart|our\s+lives)\s+(?:keeps?|kept|keeping)\s+(?:the\s+)?(?:books|score|accounts?)\b/i
  },
  {
    label: "balance-the-books metaphor",
    pattern: /\b(?:balance|balancing|balanced)\s+(?:the\s+)?(?:books|accounts?|scales)\s+(?:of|for)\s+(?:life|love|memory|memories|grief|loss|the\s+heart)\b/i
  },
  {
    label: "pages-or-chapters-of-life metaphor",
    pattern: /\b(?:pages?|chapters?)\s+(?:of|in)\s+(?:my|your|our|this|the)\s+(?:life|story|heart)\b/i
  },
  {
    label: "emotional debt metaphor",
    pattern: /\b(?:debts?|dues?|accounts?)\s+(?:of|for)\s+(?:love|life|the\s+heart|memory|memories|grief)\b/i
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

function stockClicheHits(text) {
  const body = lyricBodyOnly(text);
  return STOCK_CLICHE_PATTERNS
    .filter(({ pattern }) => pattern.test(body))
    .map(({ label }) => label);
}

function taskForAction(action, previousLyrics) {
  if (action === "regenerate") {
    return `Write a complete new draft that is substantially different in scenes, central phrases, line shapes, metaphors, and wording. Preserve only the core brief and requested structure. Do not recycle ledger, accounting, book-of-life, page-of-life, chapter-of-life, or emotional-debt imagery from the previous draft.\n\nPREVIOUS DRAFT:\n${previousLyrics || "None"}`;
  }
  if (action === "polish") {
    return `Return a complete polished version. Preserve the core story, strongest images, section order, and emotional intent. Improve specificity, flow, natural phrasing, and line economy. Replace stock AI metaphors with concrete details from the actual scene.\n\nCURRENT LYRICS:\n${previousLyrics || "None"}`;
  }
  if (action === "continue") {
    return `Continue without repeating existing lines or distinctive metaphors. Output continuation only, beginning with an appropriate section label.\n\nCURRENT LYRICS:\n${previousLyrics || "None"}`;
  }
  if (action === "hooks") {
    return `Write exactly five distinct central-phrase options. Label them [Option 1] through [Option 5]. Each option should be 2-4 concise lines. Avoid abstract life-summary metaphors and make every option arise from a concrete action, place, object, or consequence.\n\nCURRENT LYRICS FOR CONTEXT:\n${previousLyrics || "None"}`;
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
      instructions: "Write disciplined, specific, human lyrics. Honor every weighted style tag according to its priority. Treat all style information as invisible production metadata. Never put music-making, instrument, performance, studio, electronic, electrical, internet, computer, phone, screen, or communications-technology references inside lyric lines. Never use stock AI metaphors such as 'ledger of life,' emotional bookkeeping, balancing the books of love, pages or chapters of life, or debts of the heart. Build imagery from concrete actions, places, objects, speech, weather, work, money, bodies, and consequences tied to the supplied story.",
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

  const prompt = `You are writing for Forge Studio, a professional mobile songwriting workstation.

ACTION: ${action}
TASK: ${taskForAction(action, previousLyrics)}

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
- These exclusions override the song idea, previous draft, selected tags, and extra direction.
- Square-bracket section headings are allowed as structural metadata; lines beneath them must obey the exclusions.
- Use concrete, believable human details and consequences. Avoid filler, vague cosmic imagery, generic inspiration, and stock heartbreak phrases.
- Never use "ledger of life" or any metaphor that treats life, love, memory, grief, loss, or the heart as a ledger, account, balance sheet, tally, score, debt, book, page, or chapter.
- Literal financial language is allowed only when the actual story concerns money, bills, wages, work, business, or debt; do not turn it into an abstract life-summary metaphor.
- Build each major image from the supplied situation. Favor a specific action, location, object, overheard line, bodily detail, or consequence over abstract statements about life.
- Do not imitate, mention, or closely evoke any living artist or copyrighted work.
- Output only the requested lyrics or options. No explanation, analysis, markdown fence, or title unless it is part of a lyric line.`;

  const maxOutputTokens = outputTokenLimit(action, length);
  const startedAt = Date.now();

  try {
    let lyrics = await callOpenAI(prompt, maxOutputTokens, 40_000);
    if (!lyrics) return json(res, 502, { error: "The model returned an empty result." });

    let forbidden = forbiddenReferences(lyrics);
    let cliches = stockClicheHits(lyrics);
    if ((forbidden.length || cliches.length) && Date.now() - startedAt < 43_000) {
      const cleanup = `Rewrite the text below while preserving section headings, story, perspective, emotional meaning, and approximate length.

Remove every detected music, instrument, performance, studio, electronics, electrical, internet, phone, screen, computer, appliance, wire, cable, browser, modem, router, signal, and digital-device reference.

Also remove every detected stock AI metaphor. Do not paraphrase ledger, accounting, balance-sheet, tally, score, emotional-debt, book-of-life, page-of-life, or chapter-of-life imagery with another abstract life-summary metaphor. Replace each one with a concrete action, place, physical object, spoken line, weather detail, work detail, money detail, bodily reaction, or consequence that belongs to this specific story.

Detected prohibited references: ${forbidden.join(", ") || "None"}
Detected stock clichés: ${cliches.join(", ") || "None"}

TEXT:
${lyrics}

Output only the rewritten text.`;
      lyrics = await callOpenAI(cleanup, Math.min(maxOutputTokens, 1600), 12_000);
      forbidden = forbiddenReferences(lyrics);
      cliches = stockClicheHits(lyrics);
    }

    if (!lyrics || forbidden.length || cliches.length) {
      return json(res, 422, { error: "The draft contained prohibited references or stock AI metaphors. Forge will use its safe local writer instead." });
    }

    return json(res, 200, { lyrics, action, tagCount: selectedTags.length, weighted: true });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    return json(res, timedOut ? 504 : (error?.status || 500), {
      error: timedOut ? "The AI request took too long. Forge will use its safe local writer instead." : (error?.message || "Unexpected server error.")
    });
  }
}
