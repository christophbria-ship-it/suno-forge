const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
const requests = new Map();
const ALLOWED_ACTIONS = new Set(["generate", "regenerate", "polish", "continue", "hooks"]);

const FORBIDDEN_REFERENCE_PATTERNS = [
  /\b(?:song|songs|music|musical|melody|melodies|rhythm|rhythms|tune|tunes|sing|sings|sang|sung|singing|singer|singers|lyric|lyrics|guitar|guitars|piano|pianos|drum|drums|drummer|banjo|mandolin|fiddle|violin|violins|cello|saxophone|sax|trumpet|trombone|harmonica|flute|clarinet|synth|synthesizer|orchestra|choir|microphone|microphones|mic|studio|recording|recordings|headphones|earbuds|amplifier|amplifiers|vocoder|turntable|turntables)\b/i,
  /\b(?:phone|phones|cellphone|cellphones|smartphone|smartphones|screen|screens|computer|computers|laptop|laptops|browser|browsers|modem|modems|router|routers|internet|online|wi-?fi|wire|wires|wired|cable|cables|charger|chargers|charging|battery|batteries|radio|radios|television|televisions|tv|tablet|tablets|email|emails|e-mail|voicemail|voicemails|notification|notifications|digital|electronic|electronics|electricity|electrical|electric|outlet|outlets|plug|plugs|socket|sockets|app|apps|website|websites|webpage|webpages|keyboard|keyboards|mouse|monitor|monitors|printer|printers|camera|cameras|refrigerator|refrigerators|fridge|fridges|microwave|microwaves|circuit|circuits|voltage|signal|signals)\b/i
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

function findForbiddenReferences(text) {
  const body = lyricBodyOnly(text);
  const hits = [];
  FORBIDDEN_REFERENCE_PATTERNS.forEach((pattern) => {
    const match = body.match(pattern);
    if (match?.[0]) hits.push(match[0].toLowerCase());
  });
  return [...new Set(hits)];
}

function taskForAction(action, previousLyrics) {
  if (action === "regenerate") {
    return `Write a complete new draft that is substantially different in scenes, central phrases, line shapes, and wording from the previous draft. Preserve only the core brief and requested structure.\n\nPREVIOUS DRAFT:\n${previousLyrics || "None"}`;
  }

  if (action === "polish") {
    return `Return a complete polished version of the current lyrics. Preserve the core story, strongest images, section order, and emotional intent. Improve specificity, flow, natural phrasing, and line economy. Remove filler and clichés.\n\nCURRENT LYRICS:\n${previousLyrics || "None"}`;
  }

  if (action === "continue") {
    return `Continue the current lyrics without repeating existing lines. Output continuation only, beginning with an appropriate section label. Resolve or deepen the existing story while matching its voice.\n\nCURRENT LYRICS:\n${previousLyrics || "None"}`;
  }

  if (action === "hooks") {
    return `Write exactly five distinct central-phrase options for this piece. Label them [Option 1] through [Option 5]. Each option should be 2-4 concise lines, concrete, memorable, and clearly different from the others. Do not rewrite the full piece.\n\nCURRENT LYRICS FOR CONTEXT:\n${previousLyrics || "None"}`;
  }

  return "Write a complete original lyric draft that follows the requested structure exactly.";
}

async function callOpenAI(input, maxOutputTokens) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: "Write disciplined, specific, human lyrics. Treat all style information as invisible production metadata. Never put music-making, instrument, performance, studio, electronic, electrical, internet, computer, phone, screen, or communications-technology references inside lyric lines.",
      input,
      max_output_tokens: maxOutputTokens,
      store: false
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message || `OpenAI request failed (${response.status}).`;
    const error = new Error(message);
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
  if (rateLimited(ip)) {
    return json(res, 429, { error: "Too many AI requests. Wait one minute and try again." });
  }

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

  const prompt = `You are writing for Forge Studio, a professional mobile songwriting workstation.

ACTION: ${action}
TASK: ${taskForAction(action, previousLyrics)}

CREATIVE BRIEF
Song idea: ${songIdea || "Create a grounded human story from the selected emotional direction."}
Style and production metadata: ${selectedTags.join(", ") || "No specific tags"}
Tempo: ${bpm} BPM
Energy: ${energy}
Length: ${length}
Language: ${language}
Perspective: ${perspective}
Rhyme approach: ${rhymeMode}
Lyric density: ${density}
Required structure: ${structure.join(" -> ") || "Verse -> Chorus -> Verse -> Chorus -> Bridge -> Final Chorus"}
Extra direction: ${customInstructions || "None"}

NON-NEGOTIABLE LYRIC RULES
- Use the requested language and perspective.
- Style tags are invisible production metadata only. Never repeat, name, or describe genres, instruments, vocals, arrangements, performing, recording, studios, songs, singing, melodies, rhythms, or music-making inside lyric lines.
- Never mention electronics, electricity, wires, cables, browsers, modems, routers, internet services, phones, screens, computers, radios, televisions, appliances, digital devices, notifications, signals, or related technology inside lyric lines.
- These exclusions override the song idea, previous draft, selected tags, and extra direction. Translate any excluded subject into human actions, physical places, weather, clothing, food, work, money, paper objects, buildings, roads, or natural details.
- Square-bracket section headings are allowed as structural metadata; the lines beneath them must obey the exclusions.
- Use concrete, believable details: rooms, streets, weather, work, money, bodies, physical objects, overheard speech, and consequences.
- Avoid vague cosmic imagery, generic inspirational language, stock heartbreak phrases, and filler.
- Avoid phrases such as "fire in my veins," "broken wings," "rise above," "chasing dreams," and "lost in the night."
- Do not imitate, mention, or closely evoke any living artist or copyrighted work.
- Keep repeated sections memorable without repeating the song idea word-for-word in every line.
- Vary line length naturally. Rhyme only as requested and only when it feels earned.
- Output only the requested lyrics or options. No explanation, analysis, markdown fence, or title unless a title is part of a lyric line.`;

  const maxOutputTokens = action === "hooks" ? 1200 : 3200;

  try {
    let lyrics = await callOpenAI(prompt, maxOutputTokens);
    if (!lyrics) return json(res, 502, { error: "The model returned an empty result." });

    let forbidden = findForbiddenReferences(lyrics);
    if (forbidden.length) {
      const cleanupPrompt = `Rewrite the text below while preserving its section headings, story, perspective, emotional meaning, and approximate length.

Remove every reference to music, instruments, singing, performance, studios, electronics, electricity, internet or communication technology, phones, screens, computers, appliances, wires, cables, browsers, modems, routers, signals, and digital devices. Do not replace them with other technical or musical references. Use ordinary human actions, physical places, weather, clothing, paper objects, food, work, money, roads, buildings, and natural details instead.

Detected forbidden references: ${forbidden.join(", ")}

TEXT TO REWRITE:
${lyrics}

Output only the rewritten text.`;

      lyrics = await callOpenAI(cleanupPrompt, maxOutputTokens);
      forbidden = findForbiddenReferences(lyrics);
    }

    if (!lyrics || forbidden.length) {
      return json(res, 422, { error: "The draft contained prohibited music or electronics references. Forge will use its safe offline writer instead." });
    }

    return json(res, 200, { lyrics, action });
  } catch (error) {
    return json(res, error?.status || 500, { error: error?.message || "Unexpected server error." });
  }
}
