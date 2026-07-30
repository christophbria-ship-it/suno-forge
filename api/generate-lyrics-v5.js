const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const requests = new Map();
const ACTIONS = new Set([
  "generate", "regenerate", "polish", "continue", "hooks",
  "write-section", "rewrite-section", "new-angle", "concrete",
  "tighten-meter", "simplify", "increase-tension", "internal-rhyme"
]);

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function cleanString(value, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanArray(value, maxItems = 100, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
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

function resolveApiKey(req) {
  const supplied = cleanString(req.headers["x-forge-openai-key"], 300);
  return supplied || process.env.OPENAI_API_KEY || "";
}

function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") return content.text.trim();
    }
  }
  return "";
}

function taskForAction(action, previousLyrics, sectionName, sectionLyrics) {
  const current = sectionLyrics || previousLyrics || "None";
  const section = sectionName ? ` for the ${sectionName} section` : "";
  const tasks = {
    generate: "Write a complete original lyric draft that follows the requested structure.",
    regenerate: `Write a completely new draft. Preserve the brief and structure, but replace the scenes, central phrases, imagery, line shapes, and wording.\n\nCURRENT DRAFT:\n${previousLyrics || "None"}`,
    polish: `Polish the current text without changing its story or strongest specific images. Remove filler, forced rhyme, generic language, and awkward phrasing.\n\nCURRENT TEXT:\n${current}`,
    continue: `Continue from the current text without repeating existing lines or images. Output continuation only.\n\nCURRENT TEXT:\n${current}`,
    hooks: `Write exactly five distinct hook options. Label them [Option 1] through [Option 5]. Each option must be concise, concrete, memorable, and meaningfully different.\n\nCONTEXT:\n${current}`,
    "write-section": `Write only the requested lyrics${section}. Match the full song context and do not repeat lines from other sections.`,
    "rewrite-section": `Rewrite only the requested lyrics${section}. Preserve the section's purpose while changing its wording and imagery.\n\nCURRENT SECTION:\n${current}`,
    "new-angle": `Rewrite${section} from a genuinely different emotional or narrative angle while preserving continuity.\n\nCURRENT SECTION:\n${current}`,
    concrete: `Rewrite${section} with specific actions, physical objects, locations, speech, bodily reactions, and consequences. Remove abstract summary.\n\nCURRENT SECTION:\n${current}`,
    "tighten-meter": `Rewrite${section} with cleaner rhythmic line lengths and more consistent stress while preserving meaning.\n\nCURRENT SECTION:\n${current}`,
    simplify: `Rewrite${section} in plainer, more direct language with fewer words and no loss of meaning.\n\nCURRENT SECTION:\n${current}`,
    "increase-tension": `Rewrite${section} so pressure escalates line by line through specific facts, withheld information, conflict, or consequence.\n\nCURRENT SECTION:\n${current}`,
    "internal-rhyme": `Rewrite${section} with restrained internal rhyme and sound repetition. Do not force end rhymes.\n\nCURRENT SECTION:\n${current}`
  };
  return tasks[action] || tasks.generate;
}

function buildPrompt(body, action) {
  const selectedTags = cleanArray(body.selectedTags, 100, 80);
  const structure = cleanArray(body.structure, 30, 60);
  const exclusions = cleanArray(body.exclusions, 30, 120);
  const songIdea = cleanString(body.songIdea || body.brief, 1200);
  const customInstructions = cleanString(body.customInstructions || body.direction, 1800);
  const previousLyrics = cleanString(body.previousLyrics || body.lyrics, 18000);
  const sectionName = cleanString(body.sectionName || body.section?.name, 80);
  const sectionLyrics = cleanString(body.sectionLyrics || body.section?.lyrics, 6000);
  const platform = cleanString(body.platform || body.targetPlatform, 40) || "Universal";
  const bpm = Math.min(240, Math.max(40, Number(body.bpm) || 120));
  const energy = cleanString(body.energy, 40) || "medium";
  const length = cleanString(body.length, 40) || "standard";
  const perspective = cleanString(body.perspective, 60) || "first person";
  const rhyme = cleanString(body.rhymeMode || body.rhyme, 60) || "natural";
  const density = cleanString(body.density, 60) || "balanced";
  const language = cleanString(body.language, 60) || "English";
  const tagList = selectedTags.length ? selectedTags.map((tag, index) => `${index + 1}. ${tag}`).join("\n") : "None selected";
  const structureList = structure.length ? structure.join(" -> ") : "Verse -> Chorus -> Verse -> Chorus -> Bridge -> Final Chorus";

  return `You are the lyric engine inside Forge Studio, a professional mobile AI music workstation.

TASK
${taskForAction(action, previousLyrics, sectionName, sectionLyrics)}

PROJECT
Target platform: ${platform}
Song brief: ${songIdea || "Create a grounded human story from the selected direction."}
Tempo: ${bpm} BPM
Energy: ${energy}
Length: ${length}
Language: ${language}
Perspective: ${perspective}
Rhyme approach: ${rhyme}
Lyric density: ${density}
Required structure: ${structureList}
Section being edited: ${sectionName || "Whole song"}
Additional direction: ${customInstructions || "None"}
Explicit exclusions: ${exclusions.join("; ") || "None"}

SELECTED SOUND DIRECTIONS
${tagList}

NON-NEGOTIABLE RULES
- Treat genres, instruments, vocals, production, arrangement, and effects as invisible production metadata. Never place their tag names in lyric lines.
- Never imitate, name, or closely evoke a specific artist, band, song, or copyrighted lyric.
- Use concrete scenes, actions, places, physical objects, speech, bodies, work, money, weather, and consequences.
- Remove stock AI language, generic empowerment slogans, vague cosmic imagery, and interchangeable heartbreak phrases.
- Avoid familiar fire, shadow, storm, ashes, wings, destiny, chains, scars, and "rise above" metaphors unless literally required by the brief.
- Follow the requested structure and edit scope exactly.
- Output only the requested lyrics or options. No analysis, introduction, markdown fence, or explanation.`;
}

async function callOpenAI(apiKey, prompt, action, length) {
  const maxOutputTokens = action === "hooks"
    ? 900
    : ({ short: 1100, standard: 1700, extended: 2400, epic: 3000 }[length] || 1700);
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    signal: AbortSignal.timeout(50_000),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions: "Write disciplined, specific, human lyrics. Follow the Forge project constraints exactly. Return only the requested writing.",
      input: prompt,
      reasoning: { effort: "minimal" },
      max_output_tokens: maxOutputTokens,
      store: false
    })
  });
  const data = await response.json().catch(() => ({}));
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

  const apiKey = resolveApiKey(req);
  if (!apiKey) return json(res, 503, { error: "Remote AI is not connected. Forge will use its local writer." });
  if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(apiKey)) return json(res, 401, { error: "The connected OpenAI API key is not valid." });

  const ip = getIp(req);
  if (rateLimited(ip)) return json(res, 429, { error: "Too many AI requests. Wait one minute and try again." });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return json(res, 400, { error: "Request body must be valid JSON." });
  }

  const requestedAction = cleanString(body.action, 60).toLowerCase();
  const action = ACTIONS.has(requestedAction) ? requestedAction : "generate";
  const length = cleanString(body.length, 40) || "standard";
  const prompt = buildPrompt(body, action);

  try {
    const lyrics = await callOpenAI(apiKey, prompt, action, length);
    if (!lyrics) return json(res, 502, { error: "The model returned an empty result." });
    return json(res, 200, {
      lyrics,
      action,
      tagCount: cleanArray(body.selectedTags, 100, 80).length,
      source: "openai",
      model: process.env.OPENAI_MODEL || "gpt-5-mini"
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    const status = timedOut ? 504 : (Number(error?.status) || 500);
    return json(res, status, {
      error: timedOut ? "The AI request took too long. Forge will use its local writer." : (error?.message || "Remote AI failed. Forge will use its local writer.")
    });
  }
}
