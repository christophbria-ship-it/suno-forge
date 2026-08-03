const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const requests = new Map();
const ACTIONS = new Set([
  "generate", "regenerate", "polish", "continue", "hooks",
  "write-section", "rewrite-section", "new-angle", "concrete",
  "tighten-meter", "simplify", "increase-tension", "internal-rhyme"
]);
const TRANSIENT_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

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
  return supplied || String(process.env.OPENAI_API_KEY || "").trim();
}

function extractOutputText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  const chunks = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n").trim();
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

  return `You are the lyric engine inside Forge Studio.

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

RULES
- Treat genre, instrument, vocal, production, arrangement, and effect tags as production metadata. Never put tag names into lyric lines.
- Never imitate, name, or closely evoke a specific artist, band, song, or copyrighted lyric.
- Use concrete scenes, actions, places, physical objects, speech, bodies, work, money, weather, and consequences.
- Remove generic slogans, vague cosmic imagery, stock AI phrasing, and interchangeable heartbreak language.
- Follow the requested structure and edit scope exactly.
- Output only the requested lyrics or options. No introduction, analysis, markdown fence, or explanation.`;
}

function maxTokensFor(action, length) {
  if (action === "hooks") return 900;
  return ({ short: 1100, standard: 1700, extended: 2400, epic: 3000 }[length] || 1700);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openAIRequest(apiKey, payload) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    signal: AbortSignal.timeout(52_000),
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || `OpenAI request failed (${response.status}).`);
    error.status = response.status;
    error.code = data?.error?.code || "";
    error.type = data?.error?.type || "";
    throw error;
  }
  return data;
}

async function callOpenAI(apiKey, prompt, action, length) {
  const model = String(process.env.OPENAI_MODEL || "gpt-5-mini").trim();
  const basePayload = {
    model,
    instructions: "Write disciplined, specific, human lyrics. Follow the Forge project constraints exactly. Return only the requested writing.",
    input: prompt,
    max_output_tokens: maxTokensFor(action, length),
    store: false
  };

  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const payload = attempt === 0 ? { ...basePayload, reasoning: { effort: "minimal" } } : basePayload;
    try {
      const data = await openAIRequest(apiKey, payload);
      const text = extractOutputText(data);
      if (!text) {
        const error = new Error("The model returned an empty result.");
        error.status = 502;
        throw error;
      }
      return { text, model: data.model || model, responseId: data.id || "" };
    } catch (error) {
      lastError = error;
      const status = Number(error?.status) || 0;
      const parameterProblem = status === 400 && /reasoning|unsupported|unknown parameter/i.test(error?.message || "");
      if (attempt === 0 && parameterProblem) continue;
      const transient = status === 0 || TRANSIENT_STATUS.has(status) || error?.name === "TimeoutError" || error?.name === "AbortError";
      if (!transient || attempt === 2) break;
      await sleep(status === 429 ? 1500 * (attempt + 1) : 650 * (attempt + 1));
    }
  }
  throw lastError || new Error("Remote AI failed.");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  const apiKey = resolveApiKey(req);
  if (!apiKey) return json(res, 503, { error: "AI is not connected. Add a valid OpenAI API key in Forge AI settings." });
  if (!/^sk-[A-Za-z0-9_-]{20,}$/.test(apiKey)) return json(res, 401, { error: "The connected OpenAI API key is not valid." });
  if (rateLimited(getIp(req))) return json(res, 429, { error: "Too many AI requests. Wait one minute and try again." });

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
    const result = await callOpenAI(apiKey, prompt, action, length);
    return json(res, 200, {
      lyrics: result.text,
      action,
      source: "openai",
      model: result.model,
      responseId: result.responseId,
      tagCount: cleanArray(body.selectedTags, 100, 80).length
    });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError" || error?.name === "AbortError";
    const status = timedOut ? 504 : (Number(error?.status) || 500);
    const publicStatus = [400, 401, 403, 404, 408, 409, 422, 429, 500, 502, 503, 504].includes(status) ? status : 500;
    return json(res, publicStatus, {
      error: timedOut
        ? "The AI request timed out after retrying. Nothing was changed."
        : (error?.message || "Remote AI failed after retrying. Nothing was changed.")
    });
  }
}
