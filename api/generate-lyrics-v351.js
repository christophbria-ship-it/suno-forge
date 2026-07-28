import baseHandler from "./generate-lyrics-v35.js";

const DRY_VOICES = new Set(["grunge90s", "blunt"]);
const DRY_CHEESE_LEVELS = new Set(["ruthless"]);

const FORBIDDEN_PATTERNS = [
  /\b(?:song|songs|music|musical|melody|melodies|rhythm|rhythms|tune|tunes|sing|sings|sang|sung|singing|singer|singers|lyric|lyrics|guitar|guitars|piano|pianos|drum|drums|drummer|banjo|mandolin|fiddle|violin|violins|cello|saxophone|sax|trumpet|trombone|harmonica|flute|clarinet|synth|synthesizer|orchestra|choir|microphone|microphones|mic|studio|recording|recordings|headphones|earbuds|amplifier|amplifiers|vocoder|turntable|turntables)\b/i,
  /\b(?:phone|phones|cellphone|cellphones|smartphone|smartphones|screen|screens|computer|computers|laptop|laptops|browser|browsers|modem|modems|router|routers|internet|online|wi-?fi|wire|wires|wired|cable|cables|charger|chargers|charging|battery|batteries|radio|radios|television|televisions|tv|tablet|tablets|email|emails|e-mail|voicemail|voicemails|notification|notifications|digital|electronic|electronics|electricity|electrical|electric|outlet|outlets|plug|plugs|socket|sockets|app|apps|website|websites|webpage|webpages|keyboard|keyboards|mouse|monitor|monitors|printer|printers|camera|cameras|refrigerator|refrigerators|fridge|fridges|microwave|microwaves|circuit|circuits|voltage|signal|signals)\b/i
];

const STOCK_PATTERNS = [
  /\b(?:(?:a|the)\s+)?ledger\s+(?:of|for)\s+(?:life|love|time|years?|memory|memories|grief|loss|the\s+heart|our\s+lives)\b/i,
  /\b(?:life|love|memory|memories|grief|loss|the\s+heart|our\s+lives)\s+(?:keeps?|kept|keeping)\s+(?:the\s+)?(?:books|score|accounts?)\b/i,
  /\b(?:balance|balancing|balanced)\s+(?:the\s+)?(?:books|accounts?|scales)\s+(?:of|for)\s+(?:life|love|memory|memories|grief|loss|the\s+heart)\b/i,
  /\b(?:pages?|chapters?)\s+(?:of|in)\s+(?:my|your|our|this|the)\s+(?:life|story|heart)\b/i,
  /\bfire\s+in\s+(?:my|your|our|the)\s+veins\b/i,
  /\bbroken\s+wings\b/i,
  /\brise\s+above\b/i,
  /\blost\s+in\s+the\s+night\b/i,
  /\bshattered\s+pieces\b/i,
  /\bheart\s+on\s+fire\b/i,
  /\bscream(?:ing|s|ed)?\s+into\s+the\s+void\b/i,
  /\bshadows?\s+of\s+the\s+past\b/i,
  /\bechoes?\s+of\s+yesterday\b/i,
  /\bstorm\s+(?:inside|within)\b/i,
  /\b(?:rise|rising|rose)\s+from\s+the\s+ashes\b/i,
  /\bnothing\s+left\s+to\s+lose\b/i,
  /\bnever\s+let\s+go\b/i,
  /\bmeant\s+to\s+be\b/i,
  /\bset\s+me\s+free\b/i
];

const FORCED_POETRY_PATTERNS = [
  /\b(?:room|hallway|house|walls?|floor|ceiling|window|street|weather|silence|darkness|night|morning|sun|rain|dust)\s+(?:knows?|remembers?|holds?|keeps?|swallows?|breathes?|waits?|watches?|listens?|refuses?|forgives?)\b/i,
  /\bhard\s+enough\s+to\s+(?:bleed|break|burn|bruise|crack|scar)\b/i,
  /\bwhat\s+(?:you|we|i)\s+(?:left|leave|kept|keep)\s+behind\b/i,
  /\bwhere\s+(?:you|we|i)\s+used\s+to\s+(?:sit|stand|sleep|wait|smoke|lie)\b/i,
  /\b(?:small|little)\s+(?:excuse|reason|proof|promise|sign)\b/i,
  /\blike\s+(?:a|an|the)\s+[^,\n]{1,50}(?:dropped|forgotten|ignored|abandoned|left\s+behind|thrown\s+away)\b/i
];

function cleanBody(req) {
  try {
    return typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  } catch {
    return {};
  }
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

function hasForbidden(text) {
  const body = lyricBodyOnly(text);
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(body));
}

function hasStockPhrase(text) {
  const body = lyricBodyOnly(text);
  return STOCK_PATTERNS.some((pattern) => pattern.test(body));
}

function poetryWarnings(text) {
  const body = lyricBodyOnly(text);
  const warnings = [];
  const comparisons = body.match(/\b(?:like|as\s+if|as\s+though)\b/gi) || [];
  if (comparisons.length > 1) warnings.push("multiple decorative comparisons");
  if (FORCED_POETRY_PATTERNS.some((pattern) => pattern.test(body))) warnings.push("forced poetic phrasing");

  const lines = body.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const objectLines = lines.filter((line) => /\b(?:lamp|coin|receipt|ashtray|jacket|jar|spoon|window|key|chair|glass|paper|cigarette|glovebox|coat|sink|door|mug|salt|sugar|dust|smoke)\b/i.test(line));
  if (lines.length >= 8 && objectLines.length >= Math.max(5, Math.ceil(lines.length * 0.35))) {
    warnings.push("decorative object inventory");
  }
  return warnings;
}

function runBaseHandler(req) {
  return new Promise((resolve, reject) => {
    let statusCode = 200;
    const headers = {};
    let settled = false;

    const finish = (payload) => {
      if (settled) return;
      settled = true;
      const raw = typeof payload === "string" ? payload : String(payload ?? "");
      let body;
      try {
        body = JSON.parse(raw || "{}");
      } catch {
        body = { error: raw || "Invalid base response." };
      }
      resolve({ statusCode, headers, body, raw });
    };

    const fakeRes = {
      status(code) {
        statusCode = Number(code) || 200;
        return this;
      },
      setHeader(name, value) {
        headers[String(name).toLowerCase()] = value;
        return this;
      },
      end(payload) {
        finish(payload);
        return this;
      }
    };

    Promise.resolve(baseHandler(req, fakeRes)).catch(reject);
  });
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
      instructions: "Act as a ruthless lyric de-poeticizing editor. Preserve the story, emotional arc, section headings, and broad writing mode, but make the language sound less authored, less polished, less symbolic, and more like a flawed person speaking plainly. Never imitate any artist, band, song, or copyrighted lyric. Never add music-making, instrument, studio, electronics, phone, screen, computer, internet, or communications-technology references.",
      input,
      reasoning: { effort: "minimal" },
      max_output_tokens: maxOutputTokens,
      store: false
    })
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error?.message || `OpenAI review failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return extractOutputText(data);
}

function passThrough(res, result) {
  res.status(result.statusCode);
  Object.entries(result.headers).forEach(([name, value]) => res.setHeader(name, value));
  res.end(result.raw);
}

export default async function handler(req, res) {
  const startedAt = Date.now();
  const body = cleanBody(req);
  const lyricVoice = String(body.lyricVoice || "natural");
  const cheeseFilter = String(body.cheeseFilter || "strict");
  const dryMode = DRY_VOICES.has(lyricVoice) || DRY_CHEESE_LEVELS.has(cheeseFilter);

  let baseResult;
  try {
    baseResult = await runBaseHandler(req);
  } catch (error) {
    return res.status(500).setHeader("Content-Type", "application/json; charset=utf-8").end(JSON.stringify({
      error: error?.message || "The base lyric writer failed."
    }));
  }

  if (baseResult.statusCode !== 200 || !baseResult.body?.lyrics || !dryMode) {
    return passThrough(res, baseResult);
  }

  const originalLyrics = String(baseResult.body.lyrics).trim();
  const initialWarnings = poetryWarnings(originalLyrics);
  const elapsed = Date.now() - startedAt;
  const reviewBudget = Math.min(16_000, Math.max(0, 55_000 - elapsed));

  if (reviewBudget < 3_000) {
    return res.status(200).setHeader("Content-Type", "application/json; charset=utf-8").end(JSON.stringify({
      ...baseResult.body,
      qualityPass: false,
      qualityWarnings: initialWarnings,
      qualityReason: "Review skipped because the first draft used the available function time."
    }));
  }

  const comparisonLimit = lyricVoice === "blunt" ? "Use zero similes, metaphors, personification, or symbolic objects." : "Use no more than one non-literal comparison in the entire piece.";
  const modeDirection = lyricVoice === "grunge90s"
    ? "Keep broad 1990s grunge and alternative traits through blunt complaints, sardonic understatement, embarrassment, boredom, bodily discomfort, bad decisions, work, domestic friction, and an unreliable narrator. Do not turn household objects into symbols. Do not create nostalgic thrift-store scenery. The chorus should center on one hard, ordinary phrase."
    : lyricVoice === "blunt"
      ? "Make the writing literal, plain, conversational, and uncomfortable. Prefer admissions, accusations, dialogue, actions, refusals, and consequences. It should be possible to say every line aloud without sounding like poetry."
      : "Keep the selected voice, but remove ornamental writing and forced depth.";

  const reviewPrompt = `Rewrite the lyrics below so they stop sounding like AI trying to be profound.

PRESERVE
- Section headings and section order
- Core story, perspective, emotional tone, and emotional arc
- Approximate length and the strongest blunt central phrase
- Any detail that directly changes the action, conflict, or consequence

DE-POETICIZE RULES
- ${comparisonLimit}
- At least 70% of lyric lines must be literal statements, actions, dialogue, accusations, admissions, questions, or plain observations.
- Do not personify rooms, hallways, windows, weather, silence, darkness, streets, furniture, clothing, paper, or other objects.
- Do not list lamps, receipts, ashtrays, jackets, jars, coins, windows, keys, dust, smoke, or similar props merely to imply emotional depth.
- An object may remain only when someone uses it, moves it, breaks it, pays for it, loses it, finds it, or it causes a real consequence.
- Remove decorative lines in the style of “like a coin dropped and ignored,” “salt in the sugar jar,” “the ink bled where your thumb pressed,” “a small excuse for staying,” or “where you used to sit.” Do not replace them with different decorative objects. State what happened more plainly.
- Do not make every line vivid, quotable, clever, cinematic, tragic, or meaningful. Leave room for ugly, flat, ordinary speech.
- Avoid moral conclusions, life lessons, destiny, emotional bookkeeping, book/page/chapter metaphors, generic fire, shadows, storms, ashes, scars, or inner battles.
- Use contractions and natural fragments where appropriate. Uneven line lengths are acceptable.
- Do not add prohibited music, performance, studio, electronics, phone, screen, computer, internet, or communications-technology references.
- ${modeDirection}

SONG IDEA
${String(body.songIdea || "Not supplied").slice(0, 700)}

SELECTED TONE: ${String(body.lyricTone || "auto")}
SELECTED ARC: ${String(body.lyricArc || "consistent")}
SELECTED WRITING MODE: ${lyricVoice}
CHEESE FILTER: ${cheeseFilter}

LYRICS TO REWRITE
${originalLyrics}

Output only the rewritten lyrics.`;

  let reviewedLyrics = originalLyrics;
  let qualityPass = false;
  try {
    const candidate = await callOpenAI(reviewPrompt, Math.min(2200, Math.max(900, Number(body.length === "epic" ? 2600 : 1900))), reviewBudget);
    if (candidate && !hasForbidden(candidate) && !hasStockPhrase(candidate)) {
      reviewedLyrics = candidate.trim();
      qualityPass = true;
    }
  } catch (error) {
    console.warn("Forge v3.5.1 de-poeticizing review skipped:", error?.message || error);
  }

  const warnings = poetryWarnings(reviewedLyrics);
  return res.status(200).setHeader("Content-Type", "application/json; charset=utf-8").setHeader("Cache-Control", "no-store").end(JSON.stringify({
    ...baseResult.body,
    lyrics: reviewedLyrics,
    qualityPass,
    decheesed: qualityPass,
    qualityWarnings: warnings,
    director: {
      ...(baseResult.body.director || {}),
      lyricVoice,
      cheeseFilter
    }
  }));
}
