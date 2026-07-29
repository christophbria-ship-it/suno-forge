"use strict";

(() => {
  const IMAGERY_ROUTES = [
    "Build the song around a believable conversation and what each person refuses to say.",
    "Build the song around ordinary behavior changing over the course of one day.",
    "Use a specific public place with people doing normal things; let social friction carry the emotion.",
    "Use body language, distance, touch, posture, appetite, sleep, or movement instead of symbolic objects.",
    "Use work, craft, repair, preparation, or cleanup as literal action rather than as a life metaphor.",
    "Use humor, embarrassment, interruption, or a small misunderstanding to reveal the relationship.",
    "Use a clear sequence of decisions and consequences with very little decorative imagery.",
    "Use one fresh setting chosen from the actual song idea and stay inside it long enough for details to matter.",
    "Let dialogue, contradiction, and changed behavior do most of the emotional work.",
    "Use physical geography or daylight only when it belongs to the supplied story; avoid generic bad-weather sadness."
  ];

  const STALE_MOTIFS = [
    { label: "rain-and-gutter imagery", pattern: /\b(?:rain|rainy|rainwater|wet pavement|gutter|storm drain)\b/i, allow: /\b(?:rain|rainy|storm|flood|weather)\b/i },
    { label: "anonymous alley imagery", pattern: /\b(?:alley|alleyway|back alley)\b/i, allow: /\b(?:alley|alleyway)\b/i },
    { label: "coin-and-receipt props", pattern: /\b(?:coin|coins|quarter|quarters|receipt|pawn ticket)\b/i, allow: /\b(?:coin|quarter|receipt|money|cash|bill|debt|pawn)\b/i },
    { label: "motel-hallway-key props", pattern: /\b(?:motel|hallway|room number|key|lock|porch chain)\b/i, allow: /\b(?:motel|hotel|hallway|key|lock|apartment|door)\b/i },
    { label: "rope-thread-fraying metaphor", pattern: /\b(?:tight ?rope|rope|thread|fray|frayed|fraying|unravel(?:ing|ed)?)\b/i, allow: /\b(?:tight ?rope|rope|thread|sew|fabric|fray|unravel)\b/i },
    { label: "automatic parent-child tragedy", pattern: /\b(?:mother|mom|mama|son|child|boy)\b/i, allow: /\b(?:mother|mom|mama|son|child|boy|parent|family)\b/i }
  ];

  const OFFLINE_SCENES = [
    {
      tones: ["auto", "bittersweet", "numb", "dark"],
      intro: ["The diner chairs are upside down", "You wipe the same clean table twice"],
      verseA: ["You stack the sugar jars by height", "I fold my coat across my knees", "The cook carries a trash bag through the side door", "You ask whether I still take cream"],
      pre: ["The easy answer sits between us", "Neither of us reaches for it"],
      chorus: ["Say it plain before they turn the sign", "I can take the truth without the careful part", "We have ten quiet minutes and an empty room", "Do not make me guess what you came here to do"],
      verseB: ["A birthday candle bends beside the register", "Someone left a scarf across the last booth", "You laugh once at the wrong moment", "Then look at the floor until it passes"],
      bridge: ["You say, “I thought this would be easier”", "I say, “That was never the deal”", "The cook kills the lights over the counter", "We finally look like people who have chosen"],
      outro: ["The front door closes without a scene", "Morning finds us walking different blocks"]
    },
    {
      tones: ["auto", "happy", "hopeful", "bittersweet"],
      intro: ["We meet beside the grocery carts", "You are holding peaches like evidence"],
      verseA: ["You read every label out loud", "I keep putting things in the wrong basket", "An old man asks us to reach the top shelf", "We argue softly over which bread to buy"],
      pre: ["Nothing important has happened yet", "That is what makes me want to stay"],
      chorus: ["Take the long way through the ordinary", "Let me learn the life you actually live", "Not a promise big enough to frighten us", "Just your hand on the cart when I turn too fast"],
      verseB: ["The freezer aisle fogs your glasses", "You draw a crooked smile across the glass", "I tell you the joke I always ruin", "You laugh before I reach the end"],
      bridge: ["At checkout we divide nothing evenly", "You carry the heavy bag without announcing it", "Outside, the afternoon is clear", "I stop rehearsing how this might go wrong"],
      outro: ["The peaches roll together in the back seat", "We take them home before they bruise"]
    },
    {
      tones: ["auto", "angry", "defiant", "dark"],
      intro: ["The hardware store is almost empty", "You test every hinge except the broken one"],
      verseA: ["I wait beside the paint samples", "You ask a stranger which screws will hold", "He says, “Depends what you are fixing”", "You answer him instead of me"],
      pre: ["I know that trick", "Make the problem small enough to carry"],
      chorus: ["Do not hand me another temporary fix", "Do not call it strong because it has not fallen yet", "I am done holding weight you never name", "Choose the repair or step out of the room"],
      verseB: ["You buy a level and ignore the measure", "I put the unopened box back on the shelf", "At the register you finally ask me why", "I say, “You already heard me”"],
      bridge: ["No shouting, no broken display", "Just my coat zipped and my shoulders square", "You can keep the tools you never learned to use", "I am leaving with both hands empty"],
      outro: ["The automatic doors part once", "I do not turn around"]
    },
    {
      tones: ["auto", "happy", "hopeful", "cinematic"],
      intro: ["The county fair opens at noon", "You win a blue ribbon for a pie you nearly burned"],
      verseA: ["We share lemonade by the livestock barn", "Your sleeve catches on the ticket booth", "A little girl beats us both at ring toss", "You bow like she planned the whole defeat"],
      pre: ["For once the day asks nothing from us", "Except to stay until the lights come on"],
      chorus: ["Keep this hour exactly as it is", "Your laugh carrying over the grandstand", "My name sounding easy in your mouth", "No lesson, no warning, just a good day happening"],
      verseB: ["We watch the tractor pull from the back row", "You cheer for the smallest machine", "A paper crown slips over one eye", "I straighten it and you let me"],
      bridge: ["At dusk the crowd thins near the gate", "You ask whether I am tired", "I say, “Not of this”", "And mean more than the walk to the car"],
      outro: ["The ribbon rides home on the dashboard", "You keep smiling when nobody is looking"]
    },
    {
      tones: ["auto", "numb", "bittersweet", "confessional"],
      intro: ["The kitchen light is too bright at six", "I cut an apple and leave half untouched"],
      verseA: ["Your mug is still on the drying towel", "The calendar shows a week we never reached", "I open one cabinet, then another", "As if the right plate could explain me"],
      pre: ["I am not falling apart", "I am wasting time in very exact ways"],
      chorus: ["I keep doing the next small thing", "Wash the knife, close the drawer, feed the dog", "Grief does not need a grand entrance", "It sits down while the kettle warms"],
      verseB: ["The neighbor waves through the back window", "I wave before I decide whether to", "A delivery truck stops at the wrong house", "For one second I stand up too quickly"],
      bridge: ["I say your name to test the room", "Nothing answers and nothing breaks", "I finish the apple over the sink", "Then write down what must be done tomorrow"],
      outro: ["The kitchen gets darker by degrees", "I leave one light on and go upstairs"]
    },
    {
      tones: ["auto", "cinematic", "bittersweet", "hopeful"],
      intro: ["At baggage claim the belt starts empty", "Everyone leans forward at the same sound"],
      verseA: ["You stand beneath a red departure banner", "I recognize your coat before your face", "A suitcase circles twice without an owner", "You lift one hand and let it fall"],
      pre: ["We practiced this meeting separately", "Neither version included the silence"],
      chorus: ["Come closer or keep walking", "Either choice will finally be real", "I did not cross this distance for a polite goodbye", "Say what changed before the last bag comes through"],
      verseB: ["A family nearby counts missing pieces", "A worker rolls an empty cart past us", "You ask whether I slept on the flight", "I ask whether that is all you have"],
      bridge: ["Then you take the handle from my hand", "Not forgiveness, not yet", "Just enough weight shared between us", "To reach the doors without pretending"],
      outro: ["Outside, taxis pull forward one by one", "We choose the same one"]
    },
    {
      tones: ["auto", "angry", "defiant", "punk-direct"],
      intro: ["The break room clock is five minutes slow", "Management calls that close enough"],
      verseA: ["We eat standing beside the vending machine", "Maya shows the blister under her glove", "The supervisor says the schedule is final", "Nobody looks surprised"],
      pre: ["You can lower your voice", "The fact stays loud"],
      chorus: ["We are not extra hands", "We are the reason the doors open", "Write our names beside the hours you erased", "Then explain the numbers to our faces"],
      verseB: ["Luis keeps notes inside his lunch bag", "I copy every date onto clean paper", "At two o’clock the line stops moving", "This time nobody rushes to restart it"],
      bridge: ["No speech, no hero standing on a chair", "Just twelve people waiting together", "The supervisor reaches for the rule book", "Maya says, “Read it from the beginning”"],
      outro: ["The clock reaches the correct time", "We are still there"]
    },
    {
      tones: ["auto", "happy", "hopeful", "defiant"],
      intro: ["The backyard table leans to one side", "We fix it with a folded coaster"],
      verseA: ["Someone burns the first batch of corn", "Your uncle tells the same story too early", "The dog steals a bun and disappears", "You laugh with your whole face"],
      pre: ["I came prepared to leave by seven", "Then you put another chair beside yours"],
      chorus: ["Let the evening be easy", "No test hidden under every kind word", "I can belong here for one plate and one hour", "Maybe longer if nobody makes a speech"],
      verseB: ["Your cousin brings a cake with my name wrong", "I eat the misspelled corner first", "You squeeze my shoulder under the table", "Quiet enough that nobody notices"],
      bridge: ["When the dishes stack beside the sink", "I stay and dry while you wash", "You say, “Next time bring nothing”", "I say, “Next time I will know that”"],
      outro: ["The yard empties without becoming sad", "We carry the last two chairs inside"]
    }
  ];

  function hash(value) {
    return [...String(value || "")].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
  }

  function pick(list, seed, offset = 0) {
    return list[(seed + offset) % list.length];
  }

  function freshDirective(payload) {
    const source = `${payload.songIdea || ""} ${payload.customInstructions || ""}`;
    const route = pick(IMAGERY_ROUTES, hash(`${payload.variationKey}|${source}|${Date.now()}`));
    const protectedMotifs = STALE_MOTIFS
      .filter((item) => !item.allow.test(source))
      .map((item) => item.label)
      .join(", ");

    return `FRESHNESS CONTROL — REQUIRED
${route}
Derive the setting, objects, and relationships from the supplied song idea instead of defaulting to a generic gritty scene.
Do not use poverty props, anonymous urban decay, bad weather, or parent-child suffering as shortcuts for emotional depth.
Unless the song idea literally requires them, avoid these overused motif families: ${protectedMotifs}.
Do not use rain, alleys, gutters, coins, quarters, receipts, motels, hallways, keys, locks, wet pavement, tightropes, ropes, threads, fraying, unraveling, mothers, sons, or endangered children merely to make the lyric feel serious.
Use one coherent setting. Let dialogue, behavior, contradiction, choice, humor, bodily reaction, or consequence carry the emotion.
A fresh draft must differ from prior drafts in location, central objects, relationship setup, and main metaphor—not only wording.`;
  }

  function staleHits(lyrics, payload) {
    const source = `${payload.songIdea || ""} ${payload.customInstructions || ""}`;
    return STALE_MOTIFS
      .filter((item) => !item.allow.test(source) && item.pattern.test(lyrics))
      .map((item) => item.label);
  }

  async function callLyricsApi(payload) {
    const response = await fetch("/api/generate-lyrics-v35", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Lyrics request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    if (!data.lyrics || typeof data.lyrics !== "string") throw new Error("The server returned no lyrics.");
    return {
      lyrics: data.lyrics.trim(),
      tagCount: Number.isFinite(Number(data.tagCount)) ? Number(data.tagCount) : 0
    };
  }

  async function requestFreshLyrics(action) {
    const payload = buildGenerationPayload(action);
    payload.variationKey = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    payload.customInstructions = [payload.customInstructions, freshDirective(payload)].filter(Boolean).join("\n\n");

    let result = await callLyricsApi(payload);
    const hits = staleHits(result.lyrics, payload);
    const severe = hits.includes("rope-thread-fraying metaphor") || hits.length >= 2;

    if (severe) {
      const retryAction = ["generate", "regenerate"].includes(action) ? "regenerate" : action;
      const retryPayload = {
        ...payload,
        action: retryAction,
        previousLyrics: result.lyrics,
        variationKey: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-retry`,
        customInstructions: `${payload.customInstructions}\n\nFIRST DRAFT REJECTED FOR REPETITIVE IMAGERY: ${hits.join(", ")}.
Write from a completely different setting and social situation. Do not paraphrase the rejected images. Replace the entire scene logic, central objects, and relationship framing.`
      };
      result = await callLyricsApi(retryPayload);
    }

    return result;
  }

  function eligibleScenes(tone) {
    const matching = OFFLINE_SCENES.filter((scene) => scene.tones.includes(tone));
    return matching.length ? matching : OFFLINE_SCENES;
  }

  function buildFreshOfflineLyrics(action = "generate") {
    const idea = safeOfflineIdea(state.songIdea);
    const tone = String(state.lyricTone || "auto");
    const seed = hash(`${idea}|${tone}|${action}|${Date.now()}|${Math.random()}`);
    const scene = pick(eligibleScenes(tone), seed);

    if (action === "hooks") {
      const options = [
        scene.chorus.slice(0, 2),
        scene.pre.concat(scene.chorus[0]).slice(0, 3),
        scene.bridge.slice(0, 3),
        scene.verseB.slice(0, 2).concat(scene.chorus[1]).slice(0, 3),
        scene.outro.concat(scene.chorus[0]).slice(0, 3)
      ];
      return options.map((lines, index) => `[Option ${index + 1}]\n${lines.join("\n")}`).join("\n\n");
    }

    if (action === "continue") {
      return `[Continuation]\n${scene.verseB.join("\n")}\n\n[Bridge]\n${scene.bridge.join("\n")}\n\n[Outro]\n${scene.outro.join("\n")}`;
    }

    let verse = 0;
    return state.structure.map((section) => {
      if (section === "Intro" || section === "Cold Open") return `[${section}]\n${scene.intro.join("\n")}`;
      if (section === "Verse") {
        verse += 1;
        const lines = verse === 1 ? scene.verseA : scene.verseB;
        return `[Verse ${verse}]\n${verse === 1 ? `${idea}\n` : ""}${lines.join("\n")}`;
      }
      if (section === "Pre-Chorus") return `[Pre-Chorus]\n${scene.pre.join("\n")}`;
      if (["Chorus", "Final Chorus", "Double Chorus", "Refrain", "Post-Chorus"].includes(section)) {
        const lines = section === "Final Chorus" ? [...scene.chorus, scene.outro[0]] : scene.chorus;
        return `[${section}]\n${lines.join("\n")}`;
      }
      if (["Bridge", "Instrumental Bridge", "Breakdown", "Half-Time Breakdown"].includes(section)) return `[${section}]\n${scene.bridge.join("\n")}`;
      if (["Outro", "Coda", "Fake Ending"].includes(section)) return `[${section}]\n${scene.outro.join("\n")}`;
      return `[${section}]\n${scene.verseB.slice(0, 2).join("\n")}`;
    }).join("\n\n");
  }

  function updateVersion() {
    document.title = "Forge Studio v4.6";
    const hero = document.querySelector("#generatorWorkspace .hero") || document.querySelector(".hero");
    const eyebrow = hero?.querySelector(".eyebrow");
    if (eyebrow) eyebrow.textContent = "FORGE STUDIO V4.6";
  }

  function init() {
    if (document.documentElement.dataset.forgeV46 === "ready") return;
    if (document.documentElement.dataset.forgeV45 !== "ready") {
      window.setTimeout(init, 80);
      return;
    }

    requestLyrics = requestFreshLyrics;
    buildOfflineLyrics = buildFreshOfflineLyrics;
    updateVersion();
    document.documentElement.dataset.forgeV46 = "ready";
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once: true });
})();
