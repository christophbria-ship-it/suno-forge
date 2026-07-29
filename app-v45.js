"use strict";

(() => {
  const RULES = {
    Genre: [
      ["Soft, acoustic & melodic", /lullaby|soft rock|yacht rock|adult contemporary|bedroom pop|dream pop|sunshine pop|chamber pop|baroque pop|acoustic|singer-songwriter|folk|new age|smooth jazz|cool jazz|bossa nova|downtempo|chill|ambient/i],
      ["Pop & accessible", /pop|bubblegum|britpop|city pop/i],
      ["Soul, R&B, funk & gospel", /r&b|soul|motown|funk|gospel|quiet storm|new jack swing|disco|boogie/i],
      ["Hip-hop, rap & urban", /hip-hop|rap|trap|drill|phonk|grime|crunk|g-funk|horrorcore/i],
      ["Country, roots & blues", /country|bluegrass|americana|roots|blues|honky|western swing|rockabilly/i],
      ["Rock, indie & alternative", /rock|indie|alternative|grunge|shoegaze|new wave|post-punk|emo|madchester|krautrock|surf/i],
      ["Punk & hardcore", /punk|hardcore|screamo/i],
      ["Metal & extreme", /metal|deathcore|metalcore|djent/i],
      ["Electronic & dance", /house|techno|trance|garage|drum & bass|jungle|dubstep|riddim|breakbeat|big beat|future bass|edm|electronica|idm|synthwave|vaporwave|chiptune|8-bit|hardwave|darksynth|witch house/i],
      ["Jazz & improvisation", /jazz|bebop|bop|swing|fusion/i],
      ["Classical, orchestral & cinematic", /classical|chamber music|orchestral|opera|operetta|film score|trailer music|cinematic|musical theatre|cabaret|vaudeville|minimalism/i],
      ["Latin, Caribbean & African", /latin|bossa|samba|salsa|mambo|cha-cha|bolero|tango|flamenco|reggae|dub|dancehall|ska|rocksteady|afro|amapiano|highlife|soukous|makossa|gqom|cumbia|reggaeton|bachata|merengue|mariachi|ranchera|norteño|corrido|tejano|forró|sertanejo|mpb|tropicalia/i],
      ["Asian, Middle Eastern & global", /k-pop|j-pop|cantopop|mandopop|k-r&b|enka|trot|bollywood|bhangra|qawwali|ghazal|rai|arabic|dabke|anatolian/i],
      ["Experimental, noise & novelty", /experimental|noise|musique concrète|electroacoustic|glitch|poetry|spoken word|children|comedy|novelty|video game/i]
    ],
    Mood: [
      ["Soft & peaceful", /calm|intimate|tender|warm|peaceful|serene|dreamy|romantic|fragile|vulnerable/i],
      ["Reflective & emotional", /bittersweet|emotional|melancholic|nostalgic|sad|reflective|lonely|yearning|heartbroken|mournful|regretful|somber|grateful|spiritual/i],
      ["Positive & energized", /confident|energetic|euphoric|happy|hopeful|playful|powerful|triumphant|uplifting|celebratory|determined|ecstatic|empowering|joyful|optimistic|flirtatious|hilarious/i],
      ["Dark & tense", /dark|haunting|mysterious|suspenseful|detached|restless|defiant|uneasy|desperate|paranoid|cold|anxious|brooding|creepy|eerie|menacing|seductive|sinister|tense/i],
      ["Extreme & chaotic", /aggressive|apocalyptic|angry|chaotic|devastated|reckless|gritty/i]
    ],
    Instruments: [
      ["Guitars, bass & plucked strings", /guitar|bass|banjo|mandolin|bouzouki|ukulele|harp|autoharp|dulcimer|sitar|sarod|oud|shamisen|koto|pipa|balalaika|charango|cuatro/i],
      ["Orchestral strings", /fiddle|violin|viola|cello|double bass|string/i],
      ["Pianos, keys & organs", /piano|rhodes|wurlitzer|clavinet|harpsichord|celesta|music box|organ|accordion|bandoneon|mellotron/i],
      ["Synths & electronic sources", /synth|808 bass|sampler|turntables|vocoder|talk box/i],
      ["Drum kits & cymbals", /drum|kick|snare|rimshot|claps|finger snaps|hi-hat|cymbal|toms/i],
      ["Hand & world percussion", /percussion|shaker|tambourine|cowbell|claves|woodblock|triangle|djembe|cajón|congas|bongos|timbales|tabla|frame drum|bodhrán|castanets|guiro|agogô/i],
      ["Mallets, bells & tuned percussion", /vibraphone|marimba|xylophone|glockenspiel|bells|steel drums|hang drum|kalimba|mbira/i],
      ["Woodwinds", /flute|piccolo|recorder|ocarina|clarinet|oboe|english horn|bassoon|saxophone|woodwind/i],
      ["Brass", /trumpet|flugelhorn|trombone|french horn|tuba|brass/i],
      ["Folk & world winds", /harmonica|melodica|bagpipes|whistle|didgeridoo|shakuhachi|duduk|ney|uilleann/i],
      ["Ensembles & studio tools", /orchestra|choir|sampler|turntables/i]
    ],
    Vocals: [
      ["Vocal setup & role", /male vocal|female vocal|androgynous|child vocal|choir|solo vocal|duet|trio|group vocals|gang vocals|lead vocal|backing vocals|featured vocal|no vocals/i],
      ["Soft, clean & intimate", /whisper|airy|breathy|clean|tender|intimate|warm vocals/i],
      ["Character & genre style", /soulful|raspy|deep vocals|bright vocals|dark vocals|raw vocals|gospel|folk vocals|country twang|blues vocal|jazz vocal|pop vocal|rock vocal/i],
      ["Rhythmic & spoken", /rap vocals|spoken word|sung-spoken|half-sung/i],
      ["Powerful & theatrical", /powerful|operatic|theatrical/i],
      ["Aggressive & extreme", /shouted|screamed|growled|aggressive|metal vocal/i]
    ],
    "Vocal Delivery": [
      ["Natural & intimate", /close-mic|distant|conversational|storytelling|straight-tone|deadpan|detached|breath sounds|audible inhales|minimal ad-libs/i],
      ["Timing & phrasing", /legato|staccato|rubato|behind-the-beat|ahead-of-the-beat|syncopated|slow drawl|clipped phrases|long sustained|short punchy/i],
      ["Emotion & dynamics", /emotional crack|crying tone|smiling tone|whisper-to-belt|soft-to-loud|belting/i],
      ["Register & voice placement", /falsetto lead|head voice|chest voice|mixed voice|vocal fry/i],
      ["Ornamentation & melodic detail", /melismatic|ad-lib|vocal runs|riffs and runs|blue notes|grace notes|portamento|glissando|vibrato/i],
      ["Special & experimental techniques", /rapid-fire|yodeling|scat|beatboxing|chanting|callout|wordless|non-lexical|improvised/i]
    ],
    "Vocal Range & Register": [
      ["Low register", /bass|baritone|contralto|low register|subharmonic|growl register|low whisper|low rap/i],
      ["Middle register", /tenor|alto|mezzo|mid register|chest voice|mixed voice|narrow range/i],
      ["High register", /high baritone|high tenor|countertenor|soprano|high register|falsetto|head voice|high whisper|high rap/i],
      ["Extended & special range", /wide range|octave-leap|whistle register|vocal fry register/i]
    ],
    "Vocal Arrangement": [
      ["Core doubles & layers", /unison|octave doubles|double-tracked|triple-tracked|breathy double|falsetto double|octave double|whisper layer/i],
      ["Harmony placement", /harmony|parallel|open fifth|part harmony/i],
      ["Duets, answers & interaction", /counter-melody|answering vocal|call and response|lead-and-echo|question-and-answer|duet|lead swap|character|narrator/i],
      ["Group, gang & crowd vocals", /choir chorus|gang|crowd|audience|background oohs|background aahs/i],
      ["Sectional vocal changes", /pre-chorus|final chorus|bridge vocal|outro vocal|spoken intro|rap verse|sung verse/i],
      ["Counterpoint & experimental layers", /counterpoint|ad-lib response|wordless hook|vocal pad|vocal drone|vocal ostinato|round singing|canon|antiphonal|layered spoken/i]
    ],
    "Harmony & Choir": [
      ["Choir type & size", /satb|ssa|ttbb|mixed choir|women's choir|men's choir|children's choir|chamber choir|mass choir|small ensemble/i],
      ["Sacred, folk & genre choir", /gospel choir|monastic|gregorian|sacred|secular|a cappella|barbershop|doo-wop|gospel harmony|bluegrass|folk harmony|jazz|pop harmony|rock gang|metal choir/i],
      ["Soft pads, swells & drones", /swells|pad|drone|major-key|minor-key/i],
      ["Traditional harmony", /close harmony|descending|ascending|final-chord|harmony resolution/i],
      ["Open & modern harmony", /suspended|quartal|pedal-tone|open/i],
      ["Complex, tense & unresolved", /cluster|dissonant|chromatic|unresolved/i]
    ],
    "Rhythm & Groove": [
      ["Minimal & spacious", /minimal pulse|no drums|half-time|laid-back|loose pocket|6\/8 ballad|12\/8 blues/i],
      ["Relaxed & swinging", /shuffle|swing|waltz|bossa|neo-soul|motown|country two-step|humanized/i],
      ["Steady & danceable", /straight 4\/4|four-on-the-floor|boom bap|reggaeton|afrobeat|amapiano|funk|disco|train beat|tresillo|clave|samba|tango|tight pocket|quantized/i],
      ["Driving & fast", /double-time|trap hi-hats|drill|bluegrass drive|pushing groove|jungle breaks|amen break|d-beat|galloping|motorik/i],
      ["Complex & syncopated", /5\/4|7\/8|odd meter|polyrhythm|cross-rhythm|syncopated|broken beat|breakbeat/i],
      ["Extreme & fractured", /blast beat|breakcore/i]
    ],
    Production: [
      ["Clean & natural", /clean production|hi-fi|digital precision|live recording|organic production|dynamic mix|radio ready/i],
      ["Warm, vintage & lo-fi", /warm analog|lo-fi|tape|vinyl|vintage|bedroom|basement|garage|diy/i],
      ["Stereo, space & perspective", /wide stereo|mono|roomy|front-heavy|huge stereo|narrow stereo|headphone mix|airy top end|midrange forward|scooped mids/i],
      ["Punch, bass & compression", /compression|punchy|deep bass|crisp drums|sidechain|huge drums|small drums|heavy low end/i],
      ["Modern, club & cinematic", /modern production|festival mix|club mix|cinematic|film score|trailer|orchestral production|hybrid acoustic electronic/i],
      ["Dense & maximal", /dense layers|wall of sound|maximalist/i],
      ["Raw, distorted & extreme", /raw production|distorted|glitchy|dark mix|bright mix|saturated master/i],
      ["Production method & source", /field recording|sample-based|loop-based|live band|synthetic production|minimal|atmospheric|sparse arrangement/i]
    ],
    "Mix & Master": [
      ["Focus & balance", /vocal forward|instrument forward|bass forward|drums forward|guitar forward|keys forward|center-panned/i],
      ["Stereo placement & depth", /wide vocal|hard-panned|wide high end|front-to-back|flat depth|binaural/i],
      ["Low-end control", /mono low end|tight low end|booming low end|subtle sub bass/i],
      ["Dynamics & transients", /limiting|dynamic master|transient/i],
      ["Ambience & room", /reverb tail|dry mix|wet mix|intimate mix|arena mix|small-room|large-hall/i],
      ["Master tone & medium", /vintage master|clean master|dark master|bright master|warm master|cold master|tape master|vinyl master|cassette master|polished master|unmastered/i],
      ["Loud, crunchy & extreme", /loud master|aggressive limiting|crunchy master/i]
    ],
    Effects: [
      ["Reverb & space", /reverb|room|hall|spring|plate|shimmer|convolution/i],
      ["Delay & echo", /delay|echo|slapback|ping-pong|feedback swell/i],
      ["Modulation & movement", /chorus|flanger|phaser|tremolo|auto-pan|stereo widener|doppler/i],
      ["Saturation & distortion", /distortion|overdrive|fuzz|bitcrusher|ring modulation/i],
      ["Pitch & vocal processing", /auto-tune|pitch correction|vocal doubler|formant|pitch shift|pitch drift|vocoder|talk box|vocal chop|reverse vocal/i],
      ["Filters & degraded color", /telephone|radio filter|megaphone|underwater|bandpass|low-pass|high-pass|granular|white noise|pink noise/i],
      ["Transitions & impact", /tape stop|vinyl stop|dropout|filtered intro|riser|downlifter|impact hit|reverse cymbal|noise sweep|silence break/i],
      ["Glitch & extreme processing", /stutter|glitch cut|infinite reverb/i]
    ],
    Era: [
      ["Early & mid-century", /pre-war|1940s|1950s|1960s|radio era|classic soul/i],
      ["1970s & 1980s", /1970s|1980s|disco era|hair metal|cassette era|vinyl era|space age/i],
      ["1990s & 2000s", /1990s|2000s|grunge era|britpop|golden age hip-hop|early internet|y2k/i],
      ["2010s, 2020s & modern", /2010s|2020s|modern|timeless/i],
      ["Retro, futuristic & alternate", /retro|vintage|futuristic|cyberpunk|post-apocalyptic/i]
    ],
    Language: [
      ["English & multilingual formats", /english|bilingual|multilingual|instrumental/i],
      ["Western & Northern European", /spanish|french|german|italian|portuguese|swedish|norwegian|latin/i],
      ["Eastern European", /russian|ukrainian/i],
      ["East Asian", /japanese|korean|mandarin|cantonese/i],
      ["Middle Eastern & South Asian", /arabic|hindi|punjabi|turkish/i]
    ],
    Key: [
      ["Major keys", /major$/i], ["Minor keys", /minor$/i],
      ["Modes", /dorian|phrygian|lydian|mixolydian|locrian/i],
      ["Alternate scales & tonal systems", /harmonic minor|melodic minor|pentatonic|blues scale|whole-tone|chromatic|modal ambiguity/i]
    ],
    Writing: [
      ["Story, perspective & character", /first person|second person|third person|narrative|unreliable|character|dialogue|monologue|story|flashback|timelines/i],
      ["Imagery, tone & observation", /conversational|concrete imagery|understated|dark humor|scene-based|specific place|sensory detail|metaphor|confessional|observational|cinematic|commentary|spiritual|romantic tension/i],
      ["Rhyme, line shape & density", /rhyme|sparse lyrics|dense lyrics|short lines|long lines|syllabic precision|stream of consciousness/i],
      ["Hooks, forms & repetition", /refrain|hook|list song|letter song|phone-call|diary entry|repetition|callback lyrics/i],
      ["Conflict, arc & endings", /breakup|revenge|redemption|tragic ending|hopeful ending|twist ending|open ending|circular ending|unresolved ending/i],
      ["Experimental structure", /nonlinear|extended metaphor|multiple timelines|minimal metaphor/i]
    ],
    Arrangement: [
      ["Openings & entry", /cold open|intro|no intro|verse-first|chorus-first|immediate chorus/i],
      ["Core form & chorus design", /pre-chorus|post-chorus|double chorus|extended chorus|short chorus|refrain|verse variation|final verse twist/i],
      ["Builds, lifts & dynamic motion", /slow build|dynamic swells|final chorus lift|pre-chorus tension|layer-by-layer|sudden full|key change/i],
      ["Breaks, drops & contrast", /half-time|double-time|stop-time|instrumental break|a cappella|stripped bridge|breakdown|drumless|dropout|fake drop|double drop/i],
      ["Solos, spotlights & entrances", /solo|call-and-response|choir entrance|gang vocal entrance|instrumental bridge/i],
      ["Endings & outros", /ending|outro|fade out|hard stop|call-back|tag ending|vamp|looped outro|ambient outro|coda|resolved|unresolved/i]
    ],
    Performance: [
      ["Recording approach", /live performance|studio performance|one-take|acoustic session|unplugged/i],
      ["Control, intensity & precision", /virtuosic|minimalist|loose performance|tight performance|controlled chaos/i],
      ["Intimacy & venue", /intimate|arena|club|festival|church|street|campfire/i],
      ["Ensemble size & setup", /full band|power trio|duo|solo performance|orchestral|choir performance|audience singalong/i],
      ["Human detail, noise & imperfection", /imperfection|crowd noise|stage banter|count-in|studio chatter|room noise|finger noise|string squeak|stick click|breath left|pitch imperfection|timing imperfection/i]
    ],
    "Recording Space": [
      ["Dry & controlled", /dead booth|dry studio|radio studio/i],
      ["Small & intimate rooms", /bedroom|basement|garage|practice room|bathroom|kitchen|living room|motel|car interior/i],
      ["Clubs, stages & public spaces", /small club|large club|theatre|subway|street corner/i],
      ["Large & reverberant", /concert hall|cathedral|church|warehouse|tunnel|stairwell|huge soundstage/i],
      ["Outdoor & environmental", /outdoor field|forest|desert|mountain|beach/i],
      ["Character studios", /vintage studio/i]
    ],
    "Texture & Atmosphere": [
      ["Soft, airy & dreamlike", /atmospheric|cinematic|minimal|hazy|dreamlike|sunrise|sunset|silence/i],
      ["Warm, organic & tactile", /warm|dusty|smoky|wooden|organic|rural|field ambience/i],
      ["Cold, glassy & synthetic", /cold|glassy|metallic|synthetic|futuristic|retro-futuristic|urban/i],
      ["Weather, time & landscape", /nighttime|rainy|stormy|windy|desert heat|winter air/i],
      ["Grit, decay & machine noise", /grainy|industrial|analog decay|digital decay|tape warble|vinyl crackle|cassette hiss|room hum|electrical buzz/i],
      ["Dark, sacred & extreme", /dense|sacred|haunted/i]
    ]
  };

  const HINTS = {
    Genre: "Musical families, moving from softer styles toward heavier and experimental styles.",
    Mood: "From calm and gentle through dark, tense, and extreme.",
    Instruments: "Instrument families and musical roles.",
    Vocals: "Vocal setup, character, power, and intensity.",
    "Vocal Delivery": "Natural phrasing, timing, dynamics, ornamentation, and special techniques.",
    "Vocal Range & Register": "Low through high and extended techniques.",
    "Vocal Arrangement": "Layering, harmony, interaction, group vocals, and sectional use.",
    "Harmony & Choir": "Choir type, harmony style, texture, and tension.",
    "Rhythm & Groove": "Minimal and relaxed through driving, complex, and extreme.",
    Production: "Clarity, warmth, space, impact, density, distortion, and recording method.",
    "Mix & Master": "Balance, stereo placement, low end, dynamics, ambience, and mastering character.",
    Effects: "Effect families from subtle space through distortion and experimental processing.",
    Era: "Chronological periods plus retro and futuristic character.",
    Language: "Language regions and vocal formats.",
    Key: "Major, minor, modal, and alternate scales.",
    Writing: "Story, imagery, rhyme, hooks, endings, and experimental technique.",
    Arrangement: "Openings, song form, dynamics, breaks, spotlights, and endings.",
    Performance: "Recording approach, intensity, venue, ensemble, and human detail.",
    "Recording Space": "Dry rooms through large, outdoor, and unusual spaces.",
    "Texture & Atmosphere": "Soft and warm through cold, weathered, noisy, and extreme textures."
  };

  const EXACT = {
    "No Vocals": "Instrumental track with no sung or spoken lead.",
    "No Drums": "No drum part; other instruments carry the pulse.",
    "Half-Time": "Beat feels half as fast without changing tempo.",
    "Double-Time": "Beat feels twice as fast without changing tempo.",
    "Four-on-the-Floor": "Kick drum lands on every beat for a dance pulse.",
    Polyrhythm: "Different rhythmic patterns run at the same time.",
    "Lo-Fi": "Deliberately softened, imperfect, or degraded production.",
    "Hi-Fi": "Clean, detailed, full-range production.",
    Mono: "Entire mix is centered in one audio channel.",
    "Wide Stereo": "Sounds spread broadly from left to right.",
    "Light Compression": "Gently controls volume while preserving dynamics.",
    "Heavy Compression": "Strongly evens volume for a dense sound.",
    "Wall of Sound": "Many layers combine into one dense sonic mass.",
    "Sparse Arrangement": "Few parts with deliberate open space.",
    Sidechain: "One sound ducks whenever another sound triggers it.",
    "Hard Sidechain": "Obvious rhythmic pumping around the trigger.",
    "Auto-Tune": "Electronically corrects or stylizes vocal pitch.",
    "Hard Auto-Tune": "Fast correction creates a robotic pitch effect.",
    Bitcrusher: "Low digital resolution creates crunchy distortion.",
    "Low-Pass Filter": "Removes highs for a darker, muffled tone.",
    "High-Pass Filter": "Removes lows for a thinner, lighter tone.",
    "Formant Shift": "Changes perceived vocal size without simply changing pitch.",
    Vocoder: "Blends a voice with a synthesizer-like carrier.",
    "Tape Stop": "Audio slows down like a tape machine stopping.",
    "Unison Vocal": "Several voices sing the same melody and pitch.",
    "Octave Doubles": "Same melody is layered one or more octaves apart.",
    "Call and Response": "A phrase alternates with an answering phrase.",
    "Counter-Melody Vocal": "A second vocal melody moves independently from the lead.",
    "SATB Choir": "Soprano, alto, tenor, and bass choir sections.",
    "Choir Cluster": "Nearby notes stack into dense choral tension.",
    "Dorian Mode": "Minor-like mode with a brighter raised sixth.",
    "Phrygian Mode": "Dark minor-like mode with a lowered second.",
    "Lydian Mode": "Bright major-like mode with a raised fourth.",
    "Mixolydian Mode": "Major-like mode with a lowered seventh.",
    "Cold Open": "Song starts immediately without a separate intro.",
    "False Ending": "Song appears to end, then returns.",
    "Fake Drop": "Build delays or redirects the expected impact.",
    "Vamp Outro": "Short chord or groove pattern repeats to the end.",
    "Dead Booth": "Highly damped space with almost no room reflection.",
    "Silence as Texture": "Deliberate gaps and near-silence become part of the arrangement."
  };

  function groupFor(category, tag) {
    return (RULES[category] || []).find(([, pattern]) => pattern.test(tag))?.[0] || "Other useful options";
  }

  function definitionFor(tag, category) {
    if (EXACT[tag]) return EXACT[tag];
    const lower = tag.toLowerCase();
    return ({
      Genre: `Uses the rhythms, harmony, instruments, and production associated with ${tag}.`,
      Mood: `Makes the song feel ${lower}.`,
      Instruments: `Features ${lower} in the arrangement.`,
      Vocals: `Uses ${lower} as the vocal setup or character.`,
      "Vocal Delivery": `Shapes phrasing and performance toward ${lower}.`,
      "Vocal Range & Register": `Guides the singer toward ${lower}.`,
      "Vocal Arrangement": `Organizes vocal parts using ${lower}.`,
      "Harmony & Choir": `Uses ${lower} for harmony or choir writing.`,
      "Rhythm & Groove": `Builds the rhythmic feel around ${lower}.`,
      Production: `Shapes production toward ${lower}.`,
      "Mix & Master": `Applies ${lower} to the final balance and master.`,
      Effects: `Applies ${lower} as audible processing.`,
      Era: `Uses writing and production cues associated with ${tag}.`,
      Language: `Uses ${tag} for lyrics or vocal delivery.`,
      Key: `Centers harmony and melody around ${tag}.`,
      Writing: `Guides lyrics toward ${lower}.`,
      Arrangement: `Shapes the song form with ${lower}.`,
      Performance: `Presents the song as ${lower}.`,
      "Recording Space": `Places the recording in a ${lower} acoustic environment.`,
      "Texture & Atmosphere": `Adds a ${lower} sonic texture or atmosphere.`
    }[category] || `Adds ${lower} as a deliberate direction.`);
  }

  function addStyles() {
    if (document.getElementById("forgeV45Styles")) return;
    const style = document.createElement("style");
    style.id = "forgeV45Styles";
    style.textContent = `
      .category-organization-help{margin:2px 2px 9px;color:var(--muted);font-size:.72rem;line-height:1.35}
      .tag-subgroup{overflow:hidden;border:1px solid rgba(110,127,166,.22);border-radius:12px;background:rgba(7,11,18,.52)}
      .tag-subgroup+.tag-subgroup{margin-top:7px}.tag-subgroup>summary{display:flex;align-items:center;gap:9px;min-height:42px;padding:8px 10px;cursor:pointer;list-style:none}
      .tag-subgroup>summary::-webkit-details-marker{display:none}.tag-subgroup>summary:before{content:'+';color:var(--accent-2);font-weight:900}.tag-subgroup[open]>summary:before{content:'−'}
      .tag-subgroup>summary strong{flex:1;font-size:.82rem}.tag-subgroup>summary span{padding:3px 7px;border-radius:999px;color:var(--accent-2);background:rgba(255,122,24,.08);font-size:.68rem;font-weight:800}
      .tag-subgroup-grid{display:grid;gap:6px;padding:0 8px 8px}.sound-palette-card .tag-subgroup-grid .tag-button{display:grid;grid-template-columns:minmax(104px,.78fr) minmax(0,1.22fr);align-items:center;gap:8px;width:100%;min-height:52px;padding:8px 9px;text-align:left;border-radius:10px}
      .tag-option-name{color:#f4f7ff;font-size:.78rem;font-weight:850;line-height:1.2}.tag-option-description{color:rgba(208,217,237,.82);font-size:.64rem;font-weight:600;line-height:1.28}
      .sound-palette-card .tag-result-category{color:var(--accent-2);font-size:.64rem;font-weight:800}.sound-palette-card .tag-result-description{color:rgba(222,229,244,.84);font-size:.68rem;line-height:1.25}
      @media(min-width:700px){.tag-subgroup-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:360px){.sound-palette-card .tag-subgroup-grid .tag-button{grid-template-columns:1fr;gap:3px}}
    `;
    document.head.appendChild(style);
  }

  function decorateButton(button, tag, category) {
    if (button.dataset.forgeV45 === "ready") return;
    const name = document.createElement("span");
    const description = document.createElement("span");
    name.className = "tag-option-name";
    description.className = "tag-option-description";
    name.textContent = tag;
    description.textContent = definitionFor(tag, category);
    button.replaceChildren(name, description);
    button.title = `${tag}: ${description.textContent}`;
    button.setAttribute("aria-label", `${tag}. ${description.textContent}`);
    button.dataset.forgeV45 = "ready";
  }

  function organizeCategory(section) {
    if (section.dataset.forgeV45Grouped === "ready") return;
    const category = section.querySelector(".category-header strong")?.textContent?.trim();
    const content = section.querySelector(":scope > .category-content");
    const buttons = content ? [...content.querySelectorAll(":scope > .tag-button")] : [];
    if (!category || !buttons.length) return;

    const grouped = new Map();
    buttons.forEach((button) => {
      const tag = button.textContent.trim();
      const label = groupFor(category, tag);
      if (!grouped.has(label)) grouped.set(label, []);
      grouped.get(label).push({ button, tag });
    });

    const order = (RULES[category] || []).map(([label]) => label);
    if (grouped.has("Other useful options")) order.push("Other useful options");
    const fragment = document.createDocumentFragment();
    const help = document.createElement("p");
    help.className = "category-organization-help";
    help.textContent = HINTS[category] || "Grouped into practical classes for faster browsing.";
    fragment.appendChild(help);

    order.forEach((label, index) => {
      const entries = grouped.get(label);
      if (!entries?.length) return;
      if (!["Era", "Key"].includes(category)) entries.sort((a, b) => a.tag.localeCompare(b.tag));
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      const title = document.createElement("strong");
      const count = document.createElement("span");
      const grid = document.createElement("div");
      details.className = "tag-subgroup";
      details.open = index === 0 || Boolean(document.getElementById("tagSearch")?.value.trim());
      title.textContent = label;
      count.textContent = String(entries.length);
      grid.className = "tag-subgroup-grid";
      summary.append(title, count);
      entries.forEach(({ button, tag }) => {
        decorateButton(button, tag, category);
        grid.appendChild(button);
      });
      details.append(summary, grid);
      fragment.appendChild(details);
    });

    content.replaceChildren(fragment);
    section.dataset.forgeV45Grouped = "ready";
  }

  function organizeAll() {
    document.querySelectorAll(".category").forEach(organizeCategory);
  }

  function decorateSearchResults() {
    document.querySelectorAll(".direct-tag-result").forEach((button) => {
      const name = button.querySelector("strong")?.textContent?.trim();
      const meta = button.querySelector("small");
      if (!name || !meta) return;
      const category = (meta.querySelector(".tag-result-category")?.textContent || meta.textContent).split(" · ")[0].trim();
      const description = definitionFor(name, category);
      const signature = `${category}|${description}`;
      if (button.dataset.forgeV45Search === signature) return;
      const categoryLine = document.createElement("span");
      const descriptionLine = document.createElement("span");
      categoryLine.className = "tag-result-category";
      descriptionLine.className = "tag-result-description";
      categoryLine.textContent = [category, groupFor(category, name)].filter(Boolean).join(" · ");
      descriptionLine.textContent = description;
      meta.replaceChildren(categoryLine, descriptionLine);
      button.dataset.forgeV45Search = signature;
    });
  }

  function observe(id, callback) {
    const node = document.getElementById(id);
    if (!node || node.dataset.forgeV45Observed) return;
    let queued = false;
    new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        callback();
      });
    }).observe(node, { childList: true, subtree: true });
    node.dataset.forgeV45Observed = "true";
  }

  function init() {
    if (document.documentElement.dataset.forgeV45 === "ready") return;
    if (document.documentElement.dataset.forgeV44 !== "ready") {
      window.setTimeout(init, 80);
      return;
    }
    addStyles();
    observe("categoryList", organizeAll);
    observe("directTagResults", decorateSearchResults);
    organizeAll();
    decorateSearchResults();
    const help = document.querySelector(".tag-help");
    if (help) help.textContent = "Open a category, then a practical subgroup. Every option includes a short definition.";
    document.title = "Forge Studio v4.5";
    const eyebrow = document.querySelector("#generatorWorkspace .hero .eyebrow") || document.querySelector(".hero .eyebrow");
    if (eyebrow) eyebrow.textContent = "FORGE STUDIO V4.5";
    document.documentElement.dataset.forgeV45 = "ready";
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init, { once: true });
})();