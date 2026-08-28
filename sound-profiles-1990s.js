"use strict";

(() => {
  const freezeParts = parts => Object.freeze(parts);
  const p = (name, type, genre, aliases, parts) => Object.freeze({
    name,
    type,
    aliases: Object.freeze(aliases || []),
    era: "1990s",
    genres: Object.freeze(Array.isArray(genre) ? genre : [genre]),
    parts: freezeParts(parts)
  });

  const baseGenres = Object.freeze({
    "John Frusciante": ["Rock & Alternative"],
    "Chris Cornell": ["Grunge"],
    "Beck": ["Rock & Alternative"],
    "Red Hot Chili Peppers": ["Rock & Alternative"],
    "Soundgarden": ["Grunge"],
    "Tom Morello": ["Rock & Alternative"],
    "The Edge": ["Rock & Alternative"],
    "Kurt Cobain": ["Grunge"],
    "Prince": ["Pop"],
    "Slash": ["Metal & Hard Rock"],
    "Jack White": ["Rock & Alternative"],
    "Josh Homme": ["Rock & Alternative"],
    "Jerry Cantrell": ["Grunge"],
    "Eddie Vedder": ["Grunge"],
    "Layne Staley": ["Grunge"],
    "Thom Yorke": ["Rock & Alternative"],
    "David Bowie": ["Rock & Alternative"],
    "Johnny Cash": ["Country"],
    "Dolly Parton": ["Country"],
    "Björk": ["Electronic & Dance"],
    "Stevie Nicks": ["Rock & Alternative"],
    "Maynard James Keenan": ["Metal & Hard Rock"],
    "Nirvana": ["Grunge"],
    "Alice in Chains": ["Grunge"],
    "Radiohead": ["Rock & Alternative"],
    "Pink Floyd": ["Rock & Alternative"],
    "Queens of the Stone Age": ["Rock & Alternative"],
    "Rage Against the Machine": ["Rock & Alternative"],
    "Deftones": ["Metal & Hard Rock"],
    "Tool": ["Metal & Hard Rock"],
    "The White Stripes": ["Rock & Alternative"],
    "Nine Inch Nails": ["Electronic & Dance", "Metal & Hard Rock"],
    "Portishead": ["Electronic & Dance"],
    "Massive Attack": ["Electronic & Dance"],
    "The Cure": ["Rock & Alternative"]
  });

  const profiles = [
    p("Michael Jackson", "Artist", "Pop", ["Michael Jackson 1990s", "MJ"], {
      "Full Sound": "Precision pop-funk uses hard syncopated drums, clipped bass, cinematic synth layers, sharp vocal punctuation, and huge tightly stacked choruses",
      Vocals: "Agile high tenor snaps through breathy attacks, rhythmic hiccups, bright belts, whispered phrases, and dense self-harmonies"
    }),
    p("Madonna", "Artist", "Pop", ["Madonna 1990s"], {
      "Full Sound": "Polished dance-pop moves between house piano, crisp drum machines, sleek R&B bass, cool intimate verses, and bold club-sized hooks",
      Vocals: "Cool controlled mezzo vocals use precise pop diction, breathy intimacy, talk-sung attitude, and clean doubled choruses"
    }),
    p("Mariah Carey", "Vocalist", ["Pop", "R&B & Soul"], ["Mariah Carey vocals"], {
      "Full Sound": "Glossy pop-R&B surrounds nimble melisma with soft electric keys, programmed swing, deep bass, bright vocal stacks, and dramatic ballad lifts",
      Vocals: "Five-octave vocals glide from smoky lows to floating whistle notes through fluid runs, breathy phrasing, ringing belts, and layered harmonies"
    }),
    p("Whitney Houston", "Vocalist", ["Pop", "R&B & Soul"], ["Whitney Houston vocals"], {
      "Full Sound": "Large pop-soul ballads build from warm keys and restrained drums into orchestral swells, gospel lift, and towering climactic choruses",
      Vocals: "Powerful clear mezzo-soprano uses rounded chest tone, flawless pitch, gospel turns, long crescendos, and ringing sustained belts"
    }),
    p("Celine Dion", "Vocalist", ["Pop", "Jazz & Adult Contemporary"], ["Celine Dion vocals"], {
      "Full Sound": "Grand adult-contemporary ballads layer piano, strings, restrained drums, key-change drama, and a long controlled climb into a massive final chorus",
      Vocals: "Bright focused soprano moves from delicate verses to precise high belts with long sustain, clean vibrato, and theatrical emotional control"
    }),
    p("Janet Jackson", "Artist", ["Pop", "R&B & Soul"], ["Janet Jackson 1990s"], {
      "Full Sound": "Tight new-jack and futuristic R&B production uses clipped funk guitar, industrial percussion, deep swing, whispered leads, and intricate vocal stacks",
      Vocals: "Soft breathy vocals ride the groove with close-miked intimacy, precise rhythmic phrasing, spoken accents, and many feather-light doubles"
    }),
    p("George Michael", "Artist", ["Pop", "R&B & Soul"], ["George Michael 1990s"], {
      "Full Sound": "Sophisticated blue-eyed soul combines warm keyboards, restrained funk rhythm, gospel harmony, polished drums, and expressive slow-building vocals",
      Vocals: "Rich flexible tenor uses smoky low phrases, clean soulful belts, gospel ornament, and controlled aching vibrato"
    }),
    p("Britney Spears", "Artist", "Pop", ["Britney", "Britney Spears 1990s"], {
      "Full Sound": "Late-90s teen pop uses punchy programmed drums, bright synth stabs, stop-start hooks, glossy vocal doubles, and sharp verse-to-chorus lift",
      Vocals: "Close-miked nasal pop vocals mix breathy low phrases, clipped consonants, rhythmic fry, and tightly layered chorus doubles"
    }),
    p("Backstreet Boys", "Group", "Pop", ["BSB"], {
      "Full Sound": "Polished boy-band pop builds syncopated programmed verses into wide key-lifted choruses with acoustic touches and rich five-part vocal harmony",
      Vocals: "Multiple clean male leads trade lines before locking into smooth close harmony, high tenor lifts, and thick unison hooks"
    }),
    p("Spice Girls", "Group", "Pop", [], {
      "Full Sound": "Bright personality-driven dance-pop uses bouncy programmed rhythm, simple synth hooks, call-and-response verses, and chantable group choruses",
      Vocals: "Contrasting female voices trade short characterful lines, then join in bold unison hooks and easy stacked harmony"
    }),
    p("NSYNC", "Group", "Pop", ["N Sync", "*NSYNC"], {
      "Full Sound": "Crisp late-90s pop mixes digital funk beats, stuttering edits, bright synths, dramatic breakdowns, and tightly arranged male harmony",
      Vocals: "Clean agile tenor leads sit over precise beatboxed rhythm, dense five-part harmony, falsetto accents, and polished unison hooks"
    }),
    p("Ace of Base", "Group", "Pop", [], {
      "Full Sound": "Sunny minor-key Europop pairs reggae-pop offbeats, soft drum-machine bounce, round synth bass, cool female leads, and instantly repeated choruses"
    }),
    p("Seal", "Vocalist", ["Pop", "Jazz & Adult Contemporary"], ["Seal vocals"], {
      "Full Sound": "Atmospheric adult pop blends rolling electronic rhythm, warm synth pads, acoustic touches, gospel-sized choruses, and a soulful grainy lead",
      Vocals: "Smoky baritone-tenor vocals use rounded chest resonance, conversational restraint, soulful cracks, and broad high-register release"
    }),
    p("Paula Abdul", "Artist", "Pop", [], {
      "Full Sound": "Choreographed dance-pop uses new-jack swing drums, bright synth brass, clipped funk accents, breathy vocals, and quick hook-centered arrangements"
    }),
    p("Roxette", "Group", "Pop", [], {
      "Full Sound": "Swedish pop-rock balances bright jangling verses, gated drums, glossy keyboards, huge power-ballad lifts, and sharp male-female vocal contrast"
    }),
    p("Savage Garden", "Group", "Pop", [], {
      "Full Sound": "Glossy romantic pop blends pulsing programmed rhythm, chiming guitar, airy keyboards, intimate verses, and soaring clean tenor choruses"
    }),
    p("Hanson", "Group", "Pop", [], {
      "Full Sound": "Youthful organic pop-rock uses bright piano, clean guitar, handclap energy, loose live drums, and high sibling harmonies around exuberant hooks"
    }),
    p("Natalie Imbruglia", "Artist", "Pop", [], {
      "Full Sound": "Late-90s guitar pop combines dry acoustic strums, restrained breakbeat pulse, bittersweet minor harmony, and a clear vulnerable vocal hook"
    }),
    p("Cher", "Artist", "Pop", ["Cher 1990s"], {
      "Full Sound": "Dramatic Eurodance drives a four-on-the-floor beat beneath bright synth arpeggios, huge chorus lifts, and unmistakable stepped pitch-corrected vocals",
      Vocals: "Deep commanding contralto carries firm vibrato, theatrical diction, and an electronic pitch-stepped shimmer"
    }),
    p("Elton John", "Artist", ["Pop", "Jazz & Adult Contemporary"], ["Elton John 1990s"], {
      "Full Sound": "Piano-led adult pop uses warm chord movement, orchestral support, steady soft-rock drums, and broad melodic choruses with emotional lift",
      Vocals: "Grainy expressive tenor-baritone uses strong diction, gospel inflection, bright upper belts, and a warm conversational center"
    }),
    p("Bryan Adams", "Artist", ["Pop", "Rock & Alternative"], [], {
      "Full Sound": "Straight-ahead arena pop-rock uses ringing guitar, firm backbeat, warm bass, raspy earnest vocals, and wide singable power-ballad choruses"
    }),
    p("Wilson Phillips", "Group", "Pop", [], {
      "Full Sound": "Clean adult pop supports close three-part female harmony with piano, bright acoustic guitar, restrained drums, and uplifting chorus modulation",
      Vocals: "Three clear female voices form smooth tightly tuned block harmony with gentle vibrato and luminous high-note blends"
    }),
    p("Pearl Jam", "Band", "Grunge", [], {
      "Full Sound": "Organic grunge rock uses open ringing guitars, muscular melodic bass, loose powerful drums, brooding verses, and cathartic arena-sized choruses",
      Guitar: "Layered guitars move between clean open chords, warm overdrive, blues-rooted leads, and broad dynamic swells"
    }),
    p("The Smashing Pumpkins", "Band", "Rock & Alternative", ["Smashing Pumpkins"], {
      "Full Sound": "Dreamy alternative rock stacks enormous fuzzy guitars over melodic bass, precise drums, fragile nasal vocals, and sharp quiet-to-loud shifts",
      Guitar: "Many overdubbed fuzz guitars form a smooth orchestral wall, alternating chiming arpeggios with saturated soaring leads"
    }),
    p("Stone Temple Pilots", "Band", "Grunge", ["STP"], {
      "Full Sound": "Heavy melodic alternative rock combines thick drop-tuned riffs, swinging rhythm, psychedelic color, and a versatile low croon-to-gritty-belt lead"
    }),
    p("Bush", "Band", "Grunge", ["Bush band"], {
      "Full Sound": "Polished post-grunge uses churning distorted guitars, simple heavy bass, compressed drums, husky vocals, and direct loud melodic hooks"
    }),
    p("Hole", "Band", "Grunge", ["Hole band"], {
      "Full Sound": "Raw female-fronted grunge pairs abrasive power chords, crashing drums, wounded melodic verses, and cracked furious vocal eruptions"
    }),
    p("Foo Fighters", "Band", "Rock & Alternative", [], {
      "Full Sound": "Driving alternative rock layers bright distorted guitars, firm melodic bass, explosive live drums, and hoarse melodic vocals into oversized hooks"
    }),
    p("Oasis", "Band", "Rock & Alternative", [], {
      "Full Sound": "Swaggering Britpop stacks ringing open chords into a dense guitar wall beneath tambourine-heavy drums, nasal vocals, and huge communal choruses"
    }),
    p("Blur", "Band", "Rock & Alternative", ["Blur band"], {
      "Full Sound": "Playful Britpop mixes angular guitar, bouncy bass, music-hall turns, clipped observational vocals, and sudden shifts between scrappy pop and art-rock"
    }),
    p("Pulp", "Band", "Rock & Alternative", ["Pulp band"], {
      "Full Sound": "Dramatic Britpop uses pulsing keyboards, wiry guitar, disco-aware bass, talk-sung storytelling, and theatrical choruses full of social tension"
    }),
    p("The Cranberries", "Band", "Rock & Alternative", ["Cranberries"], {
      "Full Sound": "Chiming Celtic-tinged alternative rock pairs melodic bass and clean guitar with airy verses, forceful choruses, and an unmistakable keening female lead",
      Vocals: "Clear Irish-accented soprano moves through breathy intimacy, quick yodel-like breaks, nasal cries, and fierce high belts"
    }),
    p("Counting Crows", "Band", "Rock & Alternative", [], {
      "Full Sound": "Roots-oriented alternative rock uses jangling guitars, piano, loose rhythm, conversational storytelling, and ragged emotional chorus lifts"
    }),
    p("Dave Matthews Band", "Band", "Rock & Alternative", ["DMB"], {
      "Full Sound": "Jam-oriented acoustic rock interlocks syncopated guitar, melodic bass, violin, saxophone, intricate drums, and elastic rhythmic vocals"
    }),
    p("R.E.M.", "Band", "Rock & Alternative", ["REM"], {
      "Full Sound": "Thoughtful alternative rock blends chiming guitar, melodic bass, restrained drums, warm organ or strings, and a grainy enigmatic baritone lead"
    }),
    p("Live", "Band", "Rock & Alternative", ["Live band"], {
      "Full Sound": "Earnest post-grunge builds clean tense verses into wide distorted choruses with firm bass, physical drums, and urgent high baritone vocals"
    }),
    p("Collective Soul", "Band", "Rock & Alternative", [], {
      "Full Sound": "Hook-first post-grunge combines crunchy guitar riffs, clean acoustic layers, compact drums, warm low vocals, and polished radio-sized choruses"
    }),
    p("Third Eye Blind", "Band", "Rock & Alternative", [], {
      "Full Sound": "Bright alternative pop-rock uses chiming electric guitar, fast lyrical phrasing, springy bass, crisp drums, and bittersweet singalong hooks"
    }),
    p("Matchbox Twenty", "Band", "Rock & Alternative", ["Matchbox 20"], {
      "Full Sound": "Polished rootsy post-grunge pairs warm guitar layers and steady backbeat with husky conversational vocals and broad emotionally direct choruses"
    }),
    p("Goo Goo Dolls", "Band", "Rock & Alternative", [], {
      "Full Sound": "Alternative power-pop moves from rough guitar rock into open-tuned acoustic ballads with chiming strings, yearning vocals, and swelling choruses"
    }),
    p("Gin Blossoms", "Band", "Rock & Alternative", [], {
      "Full Sound": "Jangling guitar pop uses clean arpeggios, bittersweet harmony, compact live drums, easy melodic bass, and wistful nasal vocals"
    }),
    p("Weezer", "Band", "Rock & Alternative", [], {
      "Full Sound": "Crunchy power-pop locks thick square guitar chords to simple bass and drums beneath awkwardly intimate verses and enormous stacked hooks"
    }),
    p("Cake", "Band", "Rock & Alternative", ["Cake band"], {
      "Full Sound": "Dry minimalist alternative rock combines clipped guitar, melodic bass, trumpet lines, cheap keyboard, deadpan talk-singing, and tightly pocketed rhythm"
    }),
    p("Alanis Morissette", "Artist", "Rock & Alternative", ["Alanis"], {
      "Full Sound": "Confessional alternative rock uses dry acoustic-to-distorted dynamics, muscular drums, tense verses, and explosive hook-driven choruses",
      Vocals: "Flexible nasal mezzo vocals stretch vowels, flip registers, rush conversational lines, and break into open-throated cathartic belts"
    }),
    p("Garbage", "Band", "Rock & Alternative", ["Garbage band"], {
      "Full Sound": "Glossy dark alternative rock splices distorted guitar, electronic loops, sampled noise, punchy drums, and cool seductive female vocals"
    }),
    p("The Verve", "Band", "Rock & Alternative", ["Verve"], {
      "Full Sound": "Expansive Britpop layers droning guitar, rolling bass, orchestral strings, hypnotic rhythm, and weary high vocals into long emotional swells"
    }),
    p("Mazzy Star", "Band", "Rock & Alternative", [], {
      "Full Sound": "Slow dream-pop surrounds hushed smoky vocals with tremolo guitar, soft organ, sparse drums, and a dim narcotic haze"
    }),
    p("Blind Melon", "Band", "Rock & Alternative", [], {
      "Full Sound": "Loose rootsy alternative rock uses bright clean guitar, rolling bass, swinging drums, and a high grainy vocal with playful psychedelic lift"
    }),
    p("Lenny Kravitz", "Artist", ["Rock & Alternative", "R&B & Soul"], [], {
      "Full Sound": "Retro-styled rock-funk combines dry vintage drums, thick bass, fuzz guitar, clavinet or organ, and soulful stacked vocals with analog warmth"
    }),
    p("The Black Crowes", "Band", "Rock & Alternative", ["Black Crowes"], {
      "Full Sound": "Loose Southern blues-rock uses open-tuned guitar, greasy organ, swinging rhythm, gospel backing voices, and a sharp raspy lead"
    }),
    p("Faith No More", "Band", ["Rock & Alternative", "Metal & Hard Rock"], [], {
      "Full Sound": "Genre-jumping heavy rock collides muscular riffs, funk bass, cinematic keyboards, abrupt rhythmic turns, and vocals that switch from croon to bark"
    }),
    p("Primus", "Band", "Rock & Alternative", [], {
      "Full Sound": "Angular funk-metal centers percussive popping bass beneath dissonant guitar, lurching drums, odd-meter grooves, and nasal character vocals",
      Bass: "Highly percussive electric bass uses rapid slaps, muted pops, chords, harmonics, and crooked rhythmic figures as the lead instrument"
    }),
    p("Metallica", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Massive heavy metal locks palm-muted downpicked riffs to pounding drums, dark melodic builds, forceful barked vocals, and long dramatic arrangements",
      Guitar: "Tight high-gain guitars combine machine-like downpicking, galloping rhythm, harmonized leads, wah-colored solos, and clean arpeggiated interludes"
    }),
    p("Guns N' Roses", "Band", "Metal & Hard Rock", ["Guns and Roses", "GNR"], {
      "Full Sound": "Dangerous bluesy hard rock uses swaggering riffs, loose rhythm, melodic bass, explosive drums, high rasped vocals, and singing guitar leads"
    }),
    p("Pantera", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Groove metal drives razor-edged down-tuned riffs through syncopated stop-start drums, deep bass, pinched harmonics, and harsh commanding shouts"
    }),
    p("Megadeth", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Technical thrash metal uses rapid angular riffs, intricate guitar counterpoint, sharp snare attack, snarled vocals, and fast twisting arrangements"
    }),
    p("Slayer", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Relentless thrash metal combines tremolo-picked dissonance, rapid double-kick drums, chaotic atonal solos, and clipped aggressive shouts"
    }),
    p("Korn", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Down-tuned seven-string riffs, clacking bass, hip-hop-influenced drums, eerie guitar noise, and wounded whisper-to-scream vocals create claustrophobic nu metal"
    }),
    p("Limp Bizkit", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Rap-metal pairs huge drop-tuned guitar grooves with turntable scratches, bouncing hip-hop drums, bratty rhythmic verses, and shouted hooks"
    }),
    p("Marilyn Manson", "Artist", "Metal & Hard Rock", [], {
      "Full Sound": "Industrial shock rock combines mechanical drums, corroded guitar, dark synth drones, whispered menace, and abrasive sneering choruses"
    }),
    p("Sepultura", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Heavy groove-thrash fuses down-tuned tribal riffs, huge tom patterns, rapid double-kick force, raw shouts, and Brazilian percussion"
    }),
    p("Dream Theater", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Progressive metal uses virtuosic guitar and keyboards, shifting odd meters, long sectional forms, precise drums, and clean high dramatic vocals"
    }),
    p("White Zombie", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Groove-heavy industrial metal layers grinding riffs, sampled horror dialogue, looped percussion, dirty bass, and snarling carnival-like vocals"
    }),
    p("Type O Negative", "Band", "Metal & Hard Rock", [], {
      "Full Sound": "Slow gothic metal uses detuned bass-heavy riffs, church organ, cold chorus guitar, cavernous drums, and an extremely deep romantic baritone"
    }),
    p("Ministry", "Band", ["Metal & Hard Rock", "Electronic & Dance"], [], {
      "Full Sound": "Industrial metal welds rigid drum machines, sampled speech, repetitive chainsaw guitar, distorted bass, and barked vocals into mechanical aggression"
    }),
    p("Helmet", "Band", "Metal & Hard Rock", ["Helmet band"], {
      "Full Sound": "Dry precision alt-metal uses drop-tuned stop-start riffs, jazz-tight drums, clipped bass, dissonant chords, and restrained shouted vocals"
    }),
    p("2Pac", "Artist", "Hip-Hop", ["Tupac", "Tupac Shakur"], {
      "Full Sound": "West Coast hip-hop balances warm soul samples and deep programmed drums with emotionally direct street narratives, urgent cadence, and memorable sung hooks",
      Vocals: "Forceful midrange rap uses clear diction, dramatic emphasis, conversational timing, and rapid shifts between tenderness, anger, and defiance"
    }),
    p("The Notorious B.I.G.", "Artist", "Hip-Hop", ["Notorious BIG", "Biggie Smalls", "Biggie"], {
      "Full Sound": "East Coast hip-hop rides dusty soul or funk loops, thick kick-snare swing, deep bass, cinematic street detail, and an effortless heavy vocal pocket",
      Vocals: "Deep resonant rap delivery uses relaxed behind-the-beat flow, internal rhyme, vivid storytelling, and smooth rhythmic control"
    }),
    p("Nas", "Artist", "Hip-Hop", ["Nas rapper"], {
      "Full Sound": "Sparse East Coast boom-bap uses chopped jazz and soul samples, dusty drums, dark loops, and dense observational lyricism",
      Vocals: "Calm focused baritone rap packs intricate internal rhyme and vivid imagery into an even conversational cadence"
    }),
    p("Wu-Tang Clan", "Group", "Hip-Hop", ["Wu Tang"], {
      "Full Sound": "Raw East Coast hip-hop uses grimy soul chops, kung-fu dialogue, rough drums, eerie loops, and a rotating cast of sharply contrasting rap voices"
    }),
    p("Snoop Dogg", "Artist", "Hip-Hop", ["Snoop Doggy Dogg", "Snoop"], {
      "Full Sound": "Laid-back G-funk pairs rubbery bass, high synth whistles, clean drum-machine swing, soulful backing hooks, and unhurried streetwise verses",
      Vocals: "Light nasal rap glides behind the beat with stretched vowels, melodic inflection, sly humor, and relaxed rhythmic precision"
    }),
    p("Jay-Z", "Artist", "Hip-Hop", ["Jay Z", "JAY-Z"], {
      "Full Sound": "Polished East Coast rap combines crisp drums, soul or orchestral samples, sparse bass, confident hooks, and sleek conversational verses",
      Vocals: "Cool flexible baritone delivery uses compact internal rhyme, conversational pauses, quick double-time turns, and effortless braggadocio"
    }),
    p("Outkast", "Group", "Hip-Hop", ["OutKast"], {
      "Full Sound": "Southern hip-hop mixes live funk, deep bass, psychedelic keyboards, elastic drums, eccentric melodies, and two radically different rap cadences"
    }),
    p("A Tribe Called Quest", "Group", "Hip-Hop", ["Tribe Called Quest", "ATCQ"], {
      "Full Sound": "Warm jazz rap uses upright-bass loops, soft horn samples, dusty relaxed drums, playful call-and-response, and conversational low-key flow"
    }),
    p("De La Soul", "Group", "Hip-Hop", [], {
      "Full Sound": "Playful sample-collage hip-hop combines bright soul fragments, odd spoken snippets, loose drums, layered jokes, and easy group interplay"
    }),
    p("Beastie Boys", "Group", "Hip-Hop", [], {
      "Full Sound": "Rowdy alternative hip-hop collides shouted tag-team rhymes with distorted bass, funk breaks, live punk instruments, turntable cuts, and sample chaos"
    }),
    p("Public Enemy", "Group", "Hip-Hop", [], {
      "Full Sound": "Militant hip-hop builds a dense siren-filled sample wall over hard marching drums, booming authority, shouted responses, and urgent political force"
    }),
    p("Ice Cube", "Artist", "Hip-Hop", [], {
      "Full Sound": "Hard West Coast rap uses heavy funk loops, dry drums, ominous bass, blunt hooks, and sharply enunciated confrontational storytelling"
    }),
    p("Lauryn Hill", "Artist", ["Hip-Hop", "R&B & Soul"], ["Lauryn Hill vocals"], {
      "Full Sound": "Organic neo-soul hip-hop blends warm live bass, dusty drums, acoustic guitar, gospel harmony, sharp rap verses, and richly sung choruses",
      Vocals: "Grainy expressive alto switches naturally between precise rap cadence, soulful melodic phrasing, gospel runs, and firm sustained belts"
    }),
    p("Fugees", "Group", ["Hip-Hop", "R&B & Soul"], ["The Fugees"], {
      "Full Sound": "Laid-back alternative hip-hop mixes reggae bass, dusty soul samples, acoustic guitar, conversational group verses, and a powerful sung female center"
    }),
    p("Missy Elliott", "Artist", "Hip-Hop", ["Missy Misdemeanor Elliott"], {
      "Full Sound": "Futuristic hip-hop uses skeletal syncopated beats, strange vocal sounds, elastic sub-bass, sudden negative space, and playful shape-shifting hooks",
      Vocals: "Rhythmic delivery jumps between rap, chant, whisper, melody, comic characters, and percussive nonsense syllables"
    }),
    p("Busta Rhymes", "Artist", "Hip-Hop", [], {
      "Full Sound": "Explosive East Coast rap uses hard cinematic beats, dramatic stops, huge shouted hooks, and a booming voice capable of rapid-fire precision",
      Vocals: "Massive animated baritone switches from slow theatrical growls to breath-controlled double-time bursts and roaring ad-libs"
    }),
    p("DMX", "Artist", "Hip-Hop", [], {
      "Full Sound": "Dark stripped rap pairs hard sparse drums, ominous keyboard loops, barked ad-libs, prayerful contrast, and raw street intensity",
      Vocals: "Hoarse gravelly baritone attacks syllables with shouted urgency, clipped cadence, growled accents, and sudden vulnerable prayer-like passages"
    }),
    p("Eminem", "Artist", "Hip-Hop", ["Slim Shady"], {
      "Full Sound": "Late-90s theatrical rap uses sparse bass-heavy beats, eerie keyboard loops, comic sound design, intricate rhyme chains, and sharply acted character voices",
      Vocals: "Bright nasal rap delivery bends accents and syllables through dense multisyllabic rhyme, quick internal rhythm, and sudden character changes"
    }),
    p("Mobb Deep", "Group", "Hip-Hop", [], {
      "Full Sound": "Cold Queensbridge hip-hop uses minor-key piano fragments, dusty hard drums, low bass, restrained menace, and bleak matter-of-fact verses"
    }),
    p("Bone Thugs-N-Harmony", "Group", "Hip-Hop", ["Bone Thugs", "Bone Thugs N Harmony"], {
      "Full Sound": "Melodic Midwest rap layers rapid triplet flows, sung consonants, close group harmony, dark synth pads, and rolling programmed drums"
    }),
    p("Cypress Hill", "Group", "Hip-Hop", [], {
      "Full Sound": "Smoky West Coast hip-hop uses deep funk bass, dusty drums, eerie pitched samples, nasal high lead rap, and slow hypnotic hooks"
    }),
    p("Salt-N-Pepa", "Group", "Hip-Hop", ["Salt N Pepa"], {
      "Full Sound": "Bright assertive party rap uses punchy drum-machine swing, funk samples, call-and-response hooks, and confident contrasting female voices"
    }),
    p("Queen Latifah", "Artist", "Hip-Hop", [], {
      "Full Sound": "Jazz- and soul-rooted hip-hop supports a commanding warm voice with upright-bass grooves, horn samples, live-band color, and uplifting choruses"
    }),
    p("The Roots", "Group", "Hip-Hop", ["Roots band"], {
      "Full Sound": "Live-band hip-hop locks crisp acoustic drums to deep bass, electric keys, jazz harmony, turntable detail, and controlled thoughtful rap"
    }),
    p("Naughty by Nature", "Group", "Hip-Hop", [], {
      "Full Sound": "High-energy East Coast rap combines hard swinging drums, bright sample hooks, crowd-ready chants, and agile fast internal rhyme"
    }),
    p("Coolio", "Artist", "Hip-Hop", [], {
      "Full Sound": "Accessible West Coast rap uses dark soulful loops or bright funk grooves, steady programmed drums, narrative verses, and broad sung choruses"
    }),
    p("TLC", "Group", "R&B & Soul", [], {
      "Full Sound": "Playful futuristic R&B uses crisp new-jack or skeletal digital beats, rubbery bass, conversational rap breaks, silky leads, and tightly layered hooks",
      Vocals: "Contrasting female voices blend warm low singing, bright agile leads, spoken attitude, rap accents, and smooth three-part harmony"
    }),
    p("Boyz II Men", "Group", "R&B & Soul", ["Boys II Men"], {
      "Full Sound": "Slow-jam R&B centers lush a cappella-rooted harmony over soft keys, restrained drums, romantic builds, and dramatic key-change finales",
      Vocals: "Four male voices form exceptionally smooth close harmony from resonant bass through bright tenor, with precise runs and seamless unison blends"
    }),
    p("Mary J. Blige", "Vocalist", "R&B & Soul", ["Mary J Blige"], {
      "Full Sound": "Hip-hop soul places raw gospel feeling over dusty samples, hard swing drums, warm keyboards, deep bass, and emotionally blunt hooks",
      Vocals: "Husky powerful alto uses gospel turns, conversational grit, cracked emotional belts, and strong rhythmic phrasing"
    }),
    p("Aaliyah", "Vocalist", "R&B & Soul", ["Aaliyah vocals"], {
      "Full Sound": "Futuristic minimal R&B uses off-center drums, deep negative space, elastic bass, whispered harmonies, and cool gliding melodies",
      Vocals: "Soft smoky alto floats behind the beat with breathy attacks, restrained runs, low-volume intimacy, and feathered stacked harmonies"
    }),
    p("Brandy", "Vocalist", "R&B & Soul", ["Brandy Norwood"], {
      "Full Sound": "Layered contemporary R&B uses dark warm keys, clipped programmed rhythm, dense background arrangements, and harmonically rich vocal production",
      Vocals: "Smoky contralto stacks many precisely tuned parts, agile runs, subtle rhythmic shifts, and unusually dense chordal harmonies"
    }),
    p("Monica", "Vocalist", "R&B & Soul", ["Monica singer"], {
      "Full Sound": "Direct 90s R&B pairs firm drum-machine swing and warm keys with emotionally clear verses, gospel-rooted lift, and strong melodic hooks",
      Vocals: "Rich grounded alto uses clean chest tone, controlled gospel runs, clear diction, and confident sustained belts"
    }),
    p("En Vogue", "Group", "R&B & Soul", [], {
      "Full Sound": "Sophisticated R&B-funk uses hard new-jack drums, sleek bass, dramatic stops, and four commanding voices arranged in dense gospel-derived harmony"
    }),
    p("SWV", "Group", "R&B & Soul", ["Sisters With Voices"], {
      "Full Sound": "Warm swingbeat R&B combines rounded bass, crisp snares, soft keyboards, hip-hop samples, a grainy high lead, and plush group harmony"
    }),
    p("Jodeci", "Group", "R&B & Soul", [], {
      "Full Sound": "Raw slow-jam R&B sets church-trained male harmony over deep bass, sparse drums, dark keys, whispered verses, and explosive pleading ad-libs"
    }),
    p("D'Angelo", "Artist", "R&B & Soul", ["DAngelo"], {
      "Full Sound": "Deep neo-soul uses behind-the-beat live drums, warm Rhodes, muted funk guitar, thick bass, analog haze, and layered intimate vocals",
      Vocals: "Soft grainy tenor drifts through loose gospel runs, falsetto turns, mumbled intimacy, and dense self-harmony"
    }),
    p("Erykah Badu", "Vocalist", "R&B & Soul", ["Erykah Badu vocals"], {
      "Full Sound": "Neo-soul blends jazz chords, deep pocket drums, rounded bass, sparse keys, vinyl warmth, and free conversational melodies",
      Vocals: "Nasal smoky alto bends behind the beat with jazz phrasing, elastic vowels, spoken turns, and earthy improvisation"
    }),
    p("Maxwell", "Vocalist", "R&B & Soul", ["Maxwell singer"], {
      "Full Sound": "Luxurious neo-soul uses warm live bass, brushed or pocketed drums, Rhodes chords, soft guitar, orchestral accents, and romantic falsetto",
      Vocals: "Velvety tenor rises into a weightless falsetto with gentle vibrato, smooth runs, and restrained sensual phrasing"
    }),
    p("Toni Braxton", "Vocalist", "R&B & Soul", ["Toni Braxton vocals"], {
      "Full Sound": "Dark elegant R&B ballads use low piano, slow programmed drums, orchestral swells, and a deeply resonant lead that builds without losing intimacy",
      Vocals: "Low smoky contralto uses heavy chest resonance, intimate breath, precise slow vibrato, and firm dramatic belts"
    }),
    p("Usher", "Artist", "R&B & Soul", ["Usher 1990s"], {
      "Full Sound": "Smooth late-90s R&B uses clipped swing drums, warm synth bass, romantic keys, clean melodic hooks, and agile tenor runs",
      Vocals: "Bright clean tenor blends easy melisma, rhythmic phrasing, soft falsetto, and controlled upper-register belts"
    }),
    p("Destiny's Child", "Group", "R&B & Soul", ["Destinys Child"], {
      "Full Sound": "Late-90s R&B uses stuttering programmed beats, plucked synth hooks, stop-start vocal rhythm, commanding leads, and sharp stacked responses"
    }),
    p("Blackstreet", "Group", "R&B & Soul", [], {
      "Full Sound": "New-jack R&B combines hard swinging drums, talk-box or synth hooks, deep bass, smooth male leads, and tightly arranged chorus harmony"
    }),
    p("Ginuwine", "Vocalist", "R&B & Soul", [], {
      "Full Sound": "Sparse futuristic R&B uses clipped offbeat percussion, unusual vocal samples, elastic sub-bass, dark synth space, and a smooth agile tenor"
    }),
    p("Garth Brooks", "Artist", "Country", [], {
      "Full Sound": "Arena-sized country combines acoustic strum, bright electric leads, fiddle and steel, powerful live drums, vivid storytelling, and enormous singalong choruses",
      Vocals: "Warm forceful baritone uses clear country diction, conversational verses, emotional cracks, and broad high choruses"
    }),
    p("Shania Twain", "Artist", ["Country", "Pop"], [], {
      "Full Sound": "Glossy country-pop locks bright acoustic guitar and fiddle to rock drums, punchy bass, playful spoken accents, and huge crossover hooks",
      Vocals: "Bright confident country alto uses crisp consonants, playful slides, stacked doubles, and an easy pop-centered belt"
    }),
    p("George Strait", "Artist", "Country", [], {
      "Full Sound": "Clean neotraditional country uses steel guitar, fiddle, piano, steady two-step rhythm, uncluttered arrangements, and calm plainspoken storytelling"
    }),
    p("Alan Jackson", "Artist", "Country", [], {
      "Full Sound": "Neotraditional country balances twangy Telecaster, fiddle, pedal steel, acoustic rhythm, easy honky-tonk drums, and warm conversational vocals"
    }),
    p("Reba McEntire", "Vocalist", "Country", ["Reba"], {
      "Full Sound": "Polished country storytelling builds from piano, steel, and acoustic guitar into dramatic drums, strings, and emotionally decisive choruses",
      Vocals: "Bright nasal country alto uses precise storytelling diction, quick ornamental turns, strong vibrato, and theatrical emotional lift"
    }),
    p("Brooks & Dunn", "Group", "Country", ["Brooks and Dunn"], {
      "Full Sound": "High-energy country mixes honky-tonk piano, Telecaster twang, fiddle, rock-solid drums, dance-floor two-step, and big male harmony hooks"
    }),
    p("Tim McGraw", "Artist", "Country", [], {
      "Full Sound": "Warm contemporary country uses acoustic rhythm, clean electric fills, steady drums, restrained steel, and a relaxed grainy baritone"
    }),
    p("Faith Hill", "Vocalist", ["Country", "Pop"], [], {
      "Full Sound": "Polished country-pop combines acoustic guitar, piano, bright electric layers, powerful drums, and soaring emotionally direct choruses",
      Vocals: "Clear strong country soprano moves from tender verses to sustained pop-sized belts with controlled vibrato"
    }),
    p("The Chicks", "Group", "Country", ["Dixie Chicks"], {
      "Full Sound": "Progressive country uses fast acoustic guitar, fiddle, banjo, punchy live rhythm, sharp storytelling, and bright three-part female harmony"
    }),
    p("Dwight Yoakam", "Artist", "Country", [], {
      "Full Sound": "Bakersfield country uses bright Telecaster twang, walking bass, tight snare, sparse fiddle or steel, and a high lonesome nasal lead"
    }),
    p("Trisha Yearwood", "Vocalist", "Country", [], {
      "Full Sound": "Elegant contemporary country supports emotionally detailed ballads with piano, acoustic guitar, pedal steel, restrained drums, and orchestral lift",
      Vocals: "Rich clear alto uses smooth phrasing, controlled country bends, strong low resonance, and clean soaring belts"
    }),
    p("LeAnn Rimes", "Vocalist", "Country", ["Leann Rimes"], {
      "Full Sound": "Young traditional-to-pop country places fiddle, steel, acoustic rhythm, and broad ballad production beneath a striking mature high voice",
      Vocals: "Powerful bright soprano uses pronounced country breaks, long vibrato, yodel-like flips, and sustained emotional belts"
    }),
    p("The Prodigy", "Group", "Electronic & Dance", ["Prodigy electronic"], {
      "Full Sound": "Aggressive big beat combines distorted breakbeats, acid synths, rave sirens, punk shouts, deep bass, and abrupt sample-driven impact"
    }),
    p("The Chemical Brothers", "Group", "Electronic & Dance", ["Chemical Brothers"], {
      "Full Sound": "Big beat layers crushing sampled drums, squelching acid bass, psychedelic loops, filter sweeps, and long builds into explosive drops"
    }),
    p("Fatboy Slim", "Artist", "Electronic & Dance", [], {
      "Full Sound": "Party-minded big beat loops huge funk breaks, shouted vocal samples, bright bass riffs, turntable cuts, and repeated tension-building filters"
    }),
    p("Daft Punk", "Group", "Electronic & Dance", [], {
      "Full Sound": "French house filters disco loops into pumping four-on-the-floor rhythm with rubbery bass, robotic vocals, bright repetition, and warm compression"
    }),
    p("Orbital", "Group", "Electronic & Dance", ["Orbital electronic"], {
      "Full Sound": "Cerebral techno layers looping arpeggios, soft analog pads, intricate drum-machine motion, gradual harmonic change, and long immersive builds"
    }),
    p("Underworld", "Group", "Electronic & Dance", ["Underworld electronic"], {
      "Full Sound": "Progressive techno drives pulsing bass and rushing synth loops beneath hypnotic spoken fragments, evolving layers, and extended club momentum"
    }),
    p("Aphex Twin", "Artist", "Electronic & Dance", [], {
      "Full Sound": "Experimental electronic music moves between fragile ambient melody and violently edited breakbeats, strange synthetic timbres, detuning, and unsettling space"
    }),
    p("Moby", "Artist", "Electronic & Dance", ["Moby 1990s"], {
      "Full Sound": "Melodic electronic music blends breakbeats or house pulse with soft synth pads, gospel and blues samples, piano, and melancholy cinematic lift"
    }),
    p("Jamiroquai", "Band", ["Electronic & Dance", "R&B & Soul"], [], {
      "Full Sound": "Acid jazz-funk uses elastic bass, wah guitar, bright keyboards, live dance drums, string accents, and a smooth agile high male lead"
    }),
    p("The Crystal Method", "Group", "Electronic & Dance", ["Crystal Method"], {
      "Full Sound": "American big beat uses distorted drum loops, heavy synth bass, rock-sized breaks, chopped voices, and aggressive filter-driven momentum"
    }),
    p("Enigma", "Group", "Electronic & Dance", ["Enigma music"], {
      "Full Sound": "New-age electronic pop surrounds downtempo beats with Gregorian chant, breathy whispers, flute-like melody, deep reverb, and sensual atmospheric space"
    }),
    p("Robert Miles", "Artist", "Electronic & Dance", [], {
      "Full Sound": "Dream-house pairs a steady soft trance beat with repeating piano melody, warm synth pads, gentle bass, and wistful late-night lift"
    }),
    p("Faithless", "Group", "Electronic & Dance", [], {
      "Full Sound": "Progressive house builds deep bass, pulsing synth arpeggios, spacious female singing, and calm spoken baritone verses into long euphoric peaks"
    }),
    p("SNAP!", "Group", "Electronic & Dance", ["Snap"], {
      "Full Sound": "Eurodance combines hard four-on-the-floor kick, bright synth stabs, commanding rap verses, soulful female choruses, and direct club hooks"
    }),
    p("La Bouche", "Group", "Electronic & Dance", [], {
      "Full Sound": "High-energy Eurodance uses pounding kick, galloping synth bass, bright arpeggios, deep male rap, and powerful female belted choruses"
    }),
    p("Aqua", "Group", "Electronic & Dance", ["Aqua band"], {
      "Full Sound": "Bubblegum Eurodance uses toy-bright synths, bouncy four-on-the-floor rhythm, cartoon character voices, and extremely simple chantable hooks"
    }),
    p("Everything but the Girl", "Group", "Electronic & Dance", ["Everything But The Girl", "EBTG"], {
      "Full Sound": "Sophisticated electronic pop combines deep house or breakbeat rhythm, warm sub-bass, sparse keyboards, and a low intimate melancholy vocal"
    }),
    p("Green Day", "Band", "Punk & Ska", [], {
      "Full Sound": "Fast melodic pop-punk locks crunchy power chords to driving bass and sharp snare beneath nasal verses and huge simple singalong hooks"
    }),
    p("The Offspring", "Band", "Punk & Ska", ["Offspring"], {
      "Full Sound": "Aggressive pop-punk uses rapid palm-muted guitar, galloping drums, sharp nasal shouts, gang responses, and sudden novelty-hook turns"
    }),
    p("Blink-182", "Band", "Punk & Ska", ["Blink 182"], {
      "Full Sound": "Bright late-90s pop-punk combines fast downstroked guitar, melodic bass movement, crisp busy drums, youthful nasal vocals, and compact hooks"
    }),
    p("Rancid", "Band", "Punk & Ska", [], {
      "Full Sound": "Street punk mixes raw distorted guitar, melodic walking bass, ska upstrokes, rough alternating voices, and shouted gang choruses"
    }),
    p("NOFX", "Band", "Punk & Ska", ["No FX"], {
      "Full Sound": "Fast skate punk uses rapid palm-muted chords, agile bass, double-time drums, nasal sarcastic vocals, and sudden ska or harmony breaks"
    }),
    p("Bad Religion", "Band", "Punk & Ska", [], {
      "Full Sound": "Tight melodic hardcore combines rapid guitar, forceful straight drums, clear intellectual lead vocals, and dense choir-like gang harmonies"
    }),
    p("Sublime", "Band", ["Punk & Ska", "Reggae & World"], [], {
      "Full Sound": "Loose California fusion moves between reggae offbeats, dub bass, punk bursts, hip-hop samples, blues guitar, and relaxed raspy singing"
    }),
    p("No Doubt", "Band", "Punk & Ska", [], {
      "Full Sound": "Energetic ska-pop uses clipped offbeat guitar, springy bass, bright horns or keyboards, sharp live drums, and dramatic agile female vocals"
    }),
    p("The Mighty Mighty Bosstones", "Band", "Punk & Ska", ["Mighty Mighty Bosstones", "Bosstones"], {
      "Full Sound": "Heavy ska-core combines brass punches and upbeat guitar with thick distorted riffs, racing drums, gravelly shouts, and rowdy group hooks"
    }),
    p("Reel Big Fish", "Band", "Punk & Ska", [], {
      "Full Sound": "Bright third-wave ska uses fast upstroke guitar, walking bass, punchy horn lines, comic vocals, and abrupt shifts into distorted punk choruses"
    }),
    p("Shaggy", "Artist", "Reggae & World", [], {
      "Full Sound": "Dancehall-pop uses bouncing digital reggae rhythm, round bass, bright keyboard hooks, smooth sung choruses, and a deep gravelly deejay voice"
    }),
    p("UB40", "Band", "Reggae & World", [], {
      "Full Sound": "Smooth pop-reggae uses soft offbeat guitar, warm organ, deep rounded bass, relaxed drums, saxophone touches, and an easy nasal male lead"
    }),
    p("Inner Circle", "Band", "Reggae & World", ["Inner Circle reggae"], {
      "Full Sound": "Upbeat reggae-pop combines buoyant bass, clipped guitar skank, bright keyboards, clean drums, and broad cheerful group-ready hooks"
    }),
    p("Ini Kamoze", "Artist", "Reggae & World", [], {
      "Full Sound": "Digital dancehall rides a spare looping bass figure, clipped drum-machine groove, short keyboard stabs, and cool rhythmic deejay phrasing"
    }),
    p("Buju Banton", "Artist", "Reggae & World", [], {
      "Full Sound": "Dancehall and roots reggae use heavy bass, syncopated digital or live drums, sparse skank, spiritual lift, and a fierce gravelly singjay voice"
    }),
    p("Ziggy Marley", "Artist", "Reggae & World", [], {
      "Full Sound": "Warm roots reggae uses deep live bass, steady one-drop drums, offbeat guitar, organ bubble, layered harmony, and an uplifting melodic lead"
    }),
    p("Selena", "Vocalist", "Latin", ["Selena Quintanilla"], {
      "Full Sound": "Tejano-pop combines cumbia rhythm, bright synthesizer, accordion or brass touches, bouncy bass, romantic melodies, and polished crossover hooks",
      Vocals: "Warm agile mezzo vocals use clear Spanish-English diction, playful rhythmic attack, smooth runs, and powerful sustained belts"
    }),
    p("Gloria Estefan", "Artist", ["Latin", "Pop"], ["Miami Sound Machine"], {
      "Full Sound": "Latin pop blends congas and syncopated percussion with bright brass, dance-pop keyboards, warm bass, and clear melodic choruses"
    }),
    p("Ricky Martin", "Artist", ["Latin", "Pop"], [], {
      "Full Sound": "High-energy Latin pop uses driving percussion, brass punches, rock guitar, dance rhythm, dramatic stops, and charismatic tenor hooks"
    }),
    p("Enrique Iglesias", "Artist", ["Latin", "Pop"], [], {
      "Full Sound": "Romantic Latin pop pairs acoustic guitar and soft percussion with glossy keyboards, slow builds, husky intimate verses, and wide yearning choruses"
    }),
    p("Marc Anthony", "Vocalist", "Latin", [], {
      "Full Sound": "Modern salsa drives piano montuno, tumbling percussion, bright horn punches, active bass, and dramatic romantic vocal peaks",
      Vocals: "Piercing emotional tenor uses fast salsa phrasing, nasal resonance, controlled melisma, and urgent sustained high notes"
    }),
    p("Maná", "Band", "Latin", ["Mana band"], {
      "Full Sound": "Latin rock combines clean and overdriven guitar, melodic bass, bright live drums, romantic pop structure, and expressive high male vocals"
    }),
    p("Carlos Vives", "Artist", "Latin", [], {
      "Full Sound": "Colombian pop-rock fuses vallenato accordion and hand percussion with electric guitar, modern drums, bright bass, and rapid joyful vocal phrasing"
    }),
    p("Los Fabulosos Cadillacs", "Band", "Latin", ["Fabulosos Cadillacs"], {
      "Full Sound": "Latin ska-rock mixes horn-driven offbeats, punk guitar, reggae bass, carnival percussion, rough vocals, and explosive ensemble energy"
    }),
    p("Santana", "Band", ["Latin", "Rock & Alternative"], ["Santana 1990s"], {
      "Full Sound": "Latin rock places singing sustained guitar over congas, timbales, deep bass, organ, rock drums, and polished guest-vocal hooks",
      Guitar: "Warm overdriven electric guitar uses long vocal sustain, smooth bends, fast Latin-blues runs, and a focused singing midrange"
    }),
    p("Sheryl Crow", "Artist", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Roots-pop uses dry acoustic and electric guitar, loose drums, organ, handclaps, conversational detail, and a warm grainy female lead"
    }),
    p("Tori Amos", "Artist", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Intimate art-pop centers expressive piano beneath shifting harmony, sparse-to-orchestral arrangements, confessional writing, and elastic high vocals"
    }),
    p("Fiona Apple", "Artist", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Dark piano-led art-pop uses jazz-tinged chords, dry drums, restless bass, dramatic space, and a smoky contralto with sharp rhythmic phrasing"
    }),
    p("Elliott Smith", "Artist", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Fragile indie folk uses close fingerpicked acoustic guitar, soft doubled whispers, melancholy chord changes, subtle tape warmth, and miniature melodic details"
    }),
    p("Ani DiFranco", "Artist", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Percussive acoustic folk uses hard syncopated strumming, alternate tunings, clipped funk attack, intimate live-room sound, and rapid conversational vocals"
    }),
    p("Jeff Buckley", "Vocalist", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Spacious art-rock uses clean reverberant guitar, fluid bass and drums, long dynamic builds, and an extraordinarily expressive lead",
      Vocals: "Wide-ranging tenor moves from breathy intimacy to floating falsetto, soulful runs, trembling cries, and full open high belts"
    }),
    p("PJ Harvey", "Artist", "Folk & Singer-Songwriter", ["P J Harvey"], {
      "Full Sound": "Stark art-rock uses abrasive guitar, dry skeletal rhythm, blues tension, severe negative space, and shape-shifting female vocals from whisper to howl"
    }),
    p("Jewel", "Artist", "Folk & Singer-Songwriter", ["Jewel singer"], {
      "Full Sound": "Coffeehouse folk-pop centers clear fingerpicked acoustic guitar, intimate storytelling, light band support, and a bright voice with country-like breaks"
    }),
    p("Sarah McLachlan", "Artist", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Atmospheric singer-songwriter pop layers piano, acoustic guitar, soft rhythm, ambient electric textures, and a clear haunting soprano"
    }),
    p("Melissa Etheridge", "Artist", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Roots rock uses driving acoustic guitar, crunchy electric layers, steady drums, confessional lyrics, and a powerful smoky rasp"
    }),
    p("Indigo Girls", "Group", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Acoustic folk-rock combines intricate strumming, mandolin or electric color, socially aware writing, and strong interlocking female harmony"
    }),
    p("Lucinda Williams", "Artist", "Folk & Singer-Songwriter", [], {
      "Full Sound": "Weathered Americana uses twangy guitar, slow loose rhythm, sparse organ, vivid detail, and a cracked drawling voice that sits behind the beat"
    }),
    p("Sade", "Group", ["R&B & Soul", "Jazz & Adult Contemporary"], ["Sade Adu"], {
      "Full Sound": "Elegant quiet-storm soul uses smooth fretless bass, brushed or restrained drums, clean jazz guitar, soft keyboards, saxophone, and cool nocturnal space",
      Vocals: "Low velvety contralto uses minimal ornament, slow precise phrasing, gentle vibrato, and calm intimate restraint"
    }),
    p("Kenny G", "Musician", "Jazz & Adult Contemporary", ["Kenny G saxophone"], {
      Auto: "Smooth soprano saxophone carries long breathy melodies over soft keyboards, programmed drums, polished bass, and spacious adult-contemporary harmony"
    }),
    p("Diana Krall", "Artist", "Jazz & Adult Contemporary", [], {
      "Full Sound": "Intimate vocal jazz uses brushed drums, upright bass, warm piano, clean guitar, relaxed swing, and close smoky late-night singing"
    }),
    p("Wynton Marsalis", "Musician", "Jazz & Adult Contemporary", [], {
      Auto: "Bright precise trumpet uses clean attack, controlled vibrato, blues articulation, acoustic swing, and traditional small-group jazz interplay"
    }),
    p("Pat Metheny", "Musician", "Jazz & Adult Contemporary", [], {
      Auto: "Warm chorus-rich electric guitar floats through lyrical jazz melody, open harmony, fluid improvisation, and spacious ensemble textures"
    }),
    p("Harry Connick Jr.", "Artist", "Jazz & Adult Contemporary", ["Harry Connick Junior"], {
      "Full Sound": "New Orleans-rooted vocal jazz uses swinging piano, upright bass, brushed drums, brass or big-band color, and a warm relaxed croon"
    }),
    p("Enya", "Artist", ["Reggae & World", "Jazz & Adult Contemporary"], [], {
      "Full Sound": "Ethereal new-age pop layers hundreds of soft vocal parts with slow synthesizer pads, Celtic melody, deep reverb, and almost weightless rhythm",
      Vocals: "Breathy pure alto is multiplied into dense choir-like chords with smooth vowels, minimal attack, and vast reverberant sustain"
    }),
    p("Yanni", "Artist", "Jazz & Adult Contemporary", [], {
      "Full Sound": "Cinematic new-age instrumental music combines sweeping synthesizers, piano melody, orchestral percussion, world instruments, and long uplifting crescendos"
    }),
    p("Kirk Franklin", "Artist", "Christian & Gospel", [], {
      "Full Sound": "Contemporary gospel fuses mass choir, funk bass, hip-hop drums, bright keyboards, spoken direction, call-and-response, and explosive praise peaks"
    }),
    p("CeCe Winans", "Vocalist", "Christian & Gospel", ["Cece Winans"], {
      "Full Sound": "Polished gospel ballads use piano, organ, restrained drums, warm choir support, and a gradual rise into worshipful climaxes",
      Vocals: "Smooth powerful alto uses clear gospel phrasing, controlled runs, warm low notes, and sustained spiritually intense belts"
    }),
    p("DC Talk", "Group", "Christian & Gospel", ["dc Talk"], {
      "Full Sound": "Christian alternative pop mixes rap verses, grunge guitar, funk rhythm, melodic rock choruses, and layered male vocal interplay"
    }),
    p("Jars of Clay", "Band", "Christian & Gospel", [], {
      "Full Sound": "Acoustic Christian alternative rock uses jangling guitar, light percussion, reflective lyrics, restrained dynamics, and earnest close male vocals"
    })
  ];

  const existing = Array.isArray(globalThis.SIMPLIST_SOUND_PROFILES)
    ? globalThis.SIMPLIST_SOUND_PROFILES
    : [];
  const decoratedExisting = existing.map(item => {
    const genres = baseGenres[item.name];
    if (!genres) return item;
    return Object.freeze({ ...item, era: "1990s", genres: Object.freeze(genres) });
  });
  const names = new Set(decoratedExisting.map(item => item.name.toLowerCase()));
  const additions = profiles.filter(item => !names.has(item.name.toLowerCase()));
  globalThis.SIMPLIST_SOUND_PROFILES = Object.freeze([...decoratedExisting, ...additions]);
})();
