"use strict";

(() => {
  const profile = (name, type, aliases, parts) => Object.freeze({
    name,
    type,
    aliases: Object.freeze(aliases || []),
    parts: Object.freeze(parts)
  });

  globalThis.SIMPLIST_SOUND_PROFILES = Object.freeze([
    profile("John Frusciante", "Musician", ["Frusciante", "John Frusciante guitar"], {
      Auto: "Sparse melodic electric guitar, glassy clean single-coil tone, warm tube breakup, expressive bends, loose funk-rock rhythm, spacious chorus and reverb",
      Guitar: "Sparse melodic electric guitar, glassy clean single-coil tone, warm tube breakup, expressive bends, loose funk-rock rhythm, spacious chorus and reverb"
    }),
    profile("Chris Cornell", "Vocalist", ["Cornell", "Chris Cornell vocals"], {
      Auto: "Powerful smoky baritone-to-tenor rock vocals, gritty chest resonance, anguished belts, sudden dynamic leaps, and soaring high notes",
      Vocals: "Powerful smoky baritone-to-tenor rock vocals, gritty chest resonance, anguished belts, sudden dynamic leaps, and soaring high notes"
    }),
    profile("Beck", "Artist", ["Beck Hansen", "Beck vocals"], {
      Auto: "Dry nasal talk-singing, laid-back deadpan phrasing, loose rhythmic delivery, quirky alternative character, and occasional fragile melodic lift",
      Vocals: "Dry nasal talk-singing, laid-back deadpan phrasing, loose rhythmic delivery, quirky alternative character, and occasional fragile melodic lift",
      "Full Sound": "Dusty alternative grooves mix sample-built beats, twangy guitar, lo-fi texture, deadpan vocals, and playful genre collisions"
    }),
    profile("Red Hot Chili Peppers", "Band", ["RHCP", "Chili Peppers"], {
      "Full Sound": "Elastic funk-rock bass, clipped clean guitar, punchy live drums, rhythmic rap-like verses, and broad melodic choruses",
      Guitar: "Glassy clean single-coil guitar alternates clipped funk rhythm, sparse melodic fills, warm overdrive, and spacious effects",
      Bass: "Bright muscular electric bass drives the song with syncopated slaps, popping accents, and melodic upper-register runs",
      Drums: "Dry forceful live drums sit deep in the pocket with sharp snare cracks, busy ghost notes, and explosive fills",
      Vocals: "Rhythmic half-rapped verses contrast with open tuneful rock choruses and stacked backing harmonies"
    }),
    profile("Soundgarden", "Band", ["Sound Garden"], {
      "Full Sound": "Heavy detuned guitar riffs, dark psychedelic harmony, irregular meters, massive live drums, and soaring anguished rock vocals",
      Guitar: "Thick detuned guitar uses dissonant intervals, unusual tunings, lurching odd-meter riffs, and psychedelic noise",
      Vocals: "Smoky low resonance erupts into gritty high belts with wide melodic leaps and an intense anguished edge",
      Production: "Dense organic rock production keeps the guitars huge, drums physical, vocals forward, and psychedelic details shadowy"
    }),
    profile("Audioslave", "Band", ["Audio Slave"], {
      "Full Sound": "Muscular hard-rock riffs, groove-heavy bass and drums, inventive effects-driven guitar, and towering soulful vocals",
      Guitar: "Heavy pentatonic riffs meet toggle-switch stutters, pitch effects, filter sweeps, and turntable-like guitar noises",
      Vocals: "Soulful smoky verses rise into raw chest-driven belts and sustained high rock cries"
    }),
    profile("Jimi Hendrix", "Musician", ["Hendrix", "Jimi Hendrix guitar"], {
      Auto: "Fuzzed electric guitar blooms through feedback, wah, elastic bends, chord embellishments, and loose blues-rock improvisation",
      Guitar: "Fuzzed electric guitar blooms through feedback, wah, elastic bends, chord embellishments, and loose blues-rock improvisation"
    }),
    profile("David Gilmour", "Musician", ["Gilmour", "David Gilmour guitar"], {
      Auto: "Singing electric-guitar sustain, slow vocal-like bends, spacious delay, smooth compression, and patient melodic phrasing",
      Guitar: "Singing electric-guitar sustain, slow vocal-like bends, spacious delay, smooth compression, and patient melodic phrasing"
    }),
    profile("Jimmy Page", "Musician", ["Page guitar", "Jimmy Page guitar"], {
      Auto: "Loose blues-rooted electric guitar moves between dry crunchy riffs, ringing acoustic layers, bowed textures, and fiery pentatonic leads",
      Guitar: "Loose blues-rooted electric guitar moves between dry crunchy riffs, ringing acoustic layers, bowed textures, and fiery pentatonic leads"
    }),
    profile("Eddie Van Halen", "Musician", ["Van Halen guitar", "EVH"], {
      Auto: "Hot-rodded brown-sound guitar, fluid two-hand tapping, squealing harmonics, whammy-bar dives, and buoyant hard-rock rhythm",
      Guitar: "Hot-rodded brown-sound guitar, fluid two-hand tapping, squealing harmonics, whammy-bar dives, and buoyant hard-rock rhythm"
    }),
    profile("Stevie Ray Vaughan", "Musician", ["SRV", "Stevie Ray Vaughan guitar"], {
      Auto: "Thick overdriven blues guitar, heavy string attack, wide bends, rapid pentatonic runs, and a forceful swinging Texas groove",
      Guitar: "Thick overdriven blues guitar, heavy string attack, wide bends, rapid pentatonic runs, and a forceful swinging Texas groove"
    }),
    profile("Tom Morello", "Musician", ["Morello", "Tom Morello guitar"], {
      Auto: "Percussive drop-tuned riffs collide with toggle-switch cuts, pitch-shifted squeals, filter sweeps, and DJ-like guitar effects",
      Guitar: "Percussive drop-tuned riffs collide with toggle-switch cuts, pitch-shifted squeals, filter sweeps, and DJ-like guitar effects"
    }),
    profile("The Edge", "Musician", ["Edge guitar", "U2 guitar"], {
      Auto: "Bright chiming guitar repeats in tempo-synced delay, with sparse chord shapes, dotted-eighth pulses, and wide ambient space",
      Guitar: "Bright chiming guitar repeats in tempo-synced delay, with sparse chord shapes, dotted-eighth pulses, and wide ambient space"
    }),
    profile("Kurt Cobain", "Musician", ["Cobain", "Kurt Cobain guitar"], {
      Auto: "Ragged distorted power chords, blunt quiet-loud dynamics, scraping noise, simple hooky lines, and an intentionally frayed attack",
      Guitar: "Ragged distorted power chords, blunt quiet-loud dynamics, scraping noise, simple hooky lines, and an intentionally frayed attack",
      Vocals: "A grainy wounded croon breaks into hoarse full-throated shouts with cracked notes and raw dynamic contrast"
    }),
    profile("Prince", "Artist", ["Prince guitar", "Prince vocals"], {
      "Full Sound": "Tight funk rhythm, bright synths, dry drum-machine punch, sensual stacked vocals, and flashes of fiery rock guitar",
      Guitar: "Precise clipped funk chords turn into fluid high-gain leads with vocal bends, fast runs, and dramatic sustain",
      Vocals: "Agile intimate singing jumps from breathy low phrases to sharp falsetto, soulful cries, and dense self-harmonies"
    }),
    profile("Mark Knopfler", "Musician", ["Knopfler", "Mark Knopfler guitar"], {
      Auto: "Clean fingerpicked electric guitar has a dry woody attack, pinched notes, subtle bends, and relaxed conversational phrasing",
      Guitar: "Clean fingerpicked electric guitar has a dry woody attack, pinched notes, subtle bends, and relaxed conversational phrasing"
    }),
    profile("Brian May", "Musician", ["Brian May guitar", "Queen guitar"], {
      Auto: "Saturated violin-like guitar sustain, tightly stacked harmonies, singing bends, orchestral lead lines, and a bright focused midrange",
      Guitar: "Saturated violin-like guitar sustain, tightly stacked harmonies, singing bends, orchestral lead lines, and a bright focused midrange"
    }),
    profile("Tony Iommi", "Musician", ["Iommi", "Tony Iommi guitar"], {
      Auto: "Dark down-tuned guitar delivers slow crushing riffs, tritone tension, thick midrange distortion, and ominous blues-rooted leads",
      Guitar: "Dark down-tuned guitar delivers slow crushing riffs, tritone tension, thick midrange distortion, and ominous blues-rooted leads"
    }),
    profile("Slash", "Musician", ["Slash guitar"], {
      Auto: "Thick singing hard-rock guitar, wah-shaped leads, long sustain, bluesy bends, and swaggering midrange-heavy riffs",
      Guitar: "Thick singing hard-rock guitar, wah-shaped leads, long sustain, bluesy bends, and swaggering midrange-heavy riffs"
    }),
    profile("Jack White", "Musician", ["Jack White guitar", "White Stripes guitar"], {
      Auto: "Raw garage-blues guitar uses splintery fuzz, octave effects, blunt riffs, pitch-bent noise, and an unstable live-wire attack",
      Guitar: "Raw garage-blues guitar uses splintery fuzz, octave effects, blunt riffs, pitch-bent noise, and an unstable live-wire attack"
    }),
    profile("Johnny Marr", "Musician", ["Marr", "Johnny Marr guitar"], {
      Auto: "Bright layered electric guitar interlocks ringing arpeggios, rapid chord figures, open strings, chorus, and melodic countermotion",
      Guitar: "Bright layered electric guitar interlocks ringing arpeggios, rapid chord figures, open strings, chorus, and melodic countermotion"
    }),
    profile("Nile Rodgers", "Musician", ["Nile Rodgers guitar", "Rodgers guitar"], {
      Auto: "Ultra-clean compressed guitar chops use muted sixteenth notes, tight chord inversions, and a crisp dance-floor pocket",
      Guitar: "Ultra-clean compressed guitar chops use muted sixteenth notes, tight chord inversions, and a crisp dance-floor pocket"
    }),
    profile("Josh Homme", "Musician", ["Homme", "Josh Homme guitar"], {
      Auto: "Dry mid-heavy guitar grinds through low desert-rock riffs, crooked swing, fuzzy octave lines, and hypnotic repetition",
      Guitar: "Dry mid-heavy guitar grinds through low desert-rock riffs, crooked swing, fuzzy octave lines, and hypnotic repetition"
    }),
    profile("Jerry Cantrell", "Musician", ["Cantrell", "Jerry Cantrell guitar"], {
      Auto: "Dark layered guitar combines down-tuned chromatic riffs, thick wah leads, acoustic shadows, and bleak minor-key harmony",
      Guitar: "Dark layered guitar combines down-tuned chromatic riffs, thick wah leads, acoustic shadows, and bleak minor-key harmony",
      Vocals: "A steady low harmony voice locks tightly beneath the lead in dark parallel lines"
    }),
    profile("Eddie Vedder", "Vocalist", ["Vedder", "Eddie Vedder vocals"], {
      Auto: "Deep rounded baritone vocals use weighty vibrato, swallowed vowels, earnest phrasing, and rough climactic belts",
      Vocals: "Deep rounded baritone vocals use weighty vibrato, swallowed vowels, earnest phrasing, and rough climactic belts"
    }),
    profile("Layne Staley", "Vocalist", ["Staley", "Layne Staley vocals"], {
      Auto: "Piercing nasal rock tenor carries controlled grit, long tortured notes, eerie vibrato, and tightly stacked minor harmonies",
      Vocals: "Piercing nasal rock tenor carries controlled grit, long tortured notes, eerie vibrato, and tightly stacked minor harmonies"
    }),
    profile("Thom Yorke", "Vocalist", ["Yorke", "Thom Yorke vocals"], {
      Auto: "Fragile high tenor slips between breathy chest voice, floating falsetto, bent vowels, and anxious trembling sustain",
      Vocals: "Fragile high tenor slips between breathy chest voice, floating falsetto, bent vowels, and anxious trembling sustain"
    }),
    profile("Robert Plant", "Vocalist", ["Plant vocals", "Robert Plant vocals"], {
      Auto: "High blues-rock tenor uses sharp wails, sensual grit, elastic melisma, sudden cries, and loose call-and-response phrasing",
      Vocals: "High blues-rock tenor uses sharp wails, sensual grit, elastic melisma, sudden cries, and loose call-and-response phrasing"
    }),
    profile("Freddie Mercury", "Vocalist", ["Mercury", "Freddie Mercury vocals"], {
      Auto: "Commanding theatrical tenor moves from warm conversational lines to ringing sustained belts, quick vibrato, and choir-like stacks",
      Vocals: "Commanding theatrical tenor moves from warm conversational lines to ringing sustained belts, quick vibrato, and choir-like stacks"
    }),
    profile("Amy Winehouse", "Vocalist", ["Winehouse", "Amy Winehouse vocals"], {
      Auto: "Smoky contralto bends behind the beat with jazz phrasing, grainy chest tone, clipped consonants, and wounded soul inflection",
      Vocals: "Smoky contralto bends behind the beat with jazz phrasing, grainy chest tone, clipped consonants, and wounded soul inflection"
    }),
    profile("Adele", "Vocalist", ["Adele vocals"], {
      Auto: "Full resonant pop-soul alto begins intimate, then opens into clear chest-driven belts, broad vibrato, and controlled emotional peaks",
      Vocals: "Full resonant pop-soul alto begins intimate, then opens into clear chest-driven belts, broad vibrato, and controlled emotional peaks"
    }),
    profile("Billie Eilish", "Vocalist", ["Billie Eilish vocals", "Eilish"], {
      Auto: "Close-miked whispery vocals use soft consonants, breath noise, restrained melody, layered murmurs, and sudden intimate low notes",
      Vocals: "Close-miked whispery vocals use soft consonants, breath noise, restrained melody, layered murmurs, and sudden intimate low notes",
      Production: "Minimal sub-bass, dry close-up details, negative space, distorted impacts, and abrupt scale changes create tense intimacy"
    }),
    profile("David Bowie", "Vocalist", ["Bowie", "David Bowie vocals"], {
      Auto: "Dramatic baritone-to-tenor vocals shift character through clipped theatrical diction, crooning warmth, nasal bite, and bold sustained notes",
      Vocals: "Dramatic baritone-to-tenor vocals shift character through clipped theatrical diction, crooning warmth, nasal bite, and bold sustained notes"
    }),
    profile("Johnny Cash", "Vocalist", ["Cash vocals", "Johnny Cash vocals"], {
      Auto: "Low weathered baritone delivers plain narrow melodies with firm diction, steady pulse, and an intimate spoken-sung gravity",
      Vocals: "Low weathered baritone delivers plain narrow melodies with firm diction, steady pulse, and an intimate spoken-sung gravity"
    }),
    profile("Dolly Parton", "Vocalist", ["Dolly vocals", "Dolly Parton vocals"], {
      Auto: "Bright high country soprano uses clear mountain twang, quick vibrato, precise storytelling diction, and tender sustained notes",
      Vocals: "Bright high country soprano uses clear mountain twang, quick vibrato, precise storytelling diction, and tender sustained notes"
    }),
    profile("Janis Joplin", "Vocalist", ["Joplin", "Janis Joplin vocals"], {
      Auto: "Rasping blues-rock vocals push cracked chest belts, wailing scoops, loose rhythm, and exposed emotional strain",
      Vocals: "Rasping blues-rock vocals push cracked chest belts, wailing scoops, loose rhythm, and exposed emotional strain"
    }),
    profile("Björk", "Vocalist", ["Bjork", "Bjork vocals", "Björk vocals"], {
      Auto: "Elastic art-pop vocals jump from tiny breathy syllables to open-throated cries, rolled consonants, unusual accents, and fearless register shifts",
      Vocals: "Elastic art-pop vocals jump from tiny breathy syllables to open-throated cries, rolled consonants, unusual accents, and fearless register shifts"
    }),
    profile("Florence Welch", "Vocalist", ["Florence and the Machine vocals", "Florence Welch vocals"], {
      Auto: "Large resonant alto vocals rise from dusky low phrases into urgent vibrato-rich belts with a dramatic almost ceremonial force",
      Vocals: "Large resonant alto vocals rise from dusky low phrases into urgent vibrato-rich belts with a dramatic almost ceremonial force"
    }),
    profile("Stevie Nicks", "Vocalist", ["Nicks", "Stevie Nicks vocals"], {
      Auto: "Husky nasal alto uses a grainy fluttering vibrato, incantatory repetition, conversational phrasing, and a weathered mystical tone",
      Vocals: "Husky nasal alto uses a grainy fluttering vibrato, incantatory repetition, conversational phrasing, and a weathered mystical tone"
    }),
    profile("Maynard James Keenan", "Vocalist", ["Maynard", "Maynard vocals"], {
      Auto: "Controlled dark tenor moves from intimate coiled phrases to long clean high notes, serrated shouts, and rhythmically precise intensity",
      Vocals: "Controlled dark tenor moves from intimate coiled phrases to long clean high notes, serrated shouts, and rhythmically precise intensity"
    }),
    profile("Nirvana", "Band", [], {
      "Full Sound": "Ragged distorted power chords, simple bass, pounding drums, wounded vocals, and extreme quiet-to-loud grunge dynamics",
      Production: "Raw close rock production preserves amplifier grit, drum-room impact, vocal cracks, and abrupt dynamic contrast"
    }),
    profile("Alice in Chains", "Band", ["AIC"], {
      "Full Sound": "Down-tuned crawling riffs, bleak minor harmony, thick guitar layers, heavy pocket drums, and eerie parallel vocal harmonies",
      Vocals: "A piercing gritty lead locks with a lower steady harmony in close dark intervals",
      Guitar: "Down-tuned chromatic riffs, wide bends, wah-colored leads, and layered acoustic darkness"
    }),
    profile("Radiohead", "Band", [], {
      "Full Sound": "Anxious art-rock blends fragile high vocals, ambiguous harmony, interlocking guitars, electronic fracture, and wide negative space",
      Production: "Organic instruments merge with granular edits, distorted electronics, unusual stereo movement, and carefully controlled emptiness"
    }),
    profile("Led Zeppelin", "Band", ["Zeppelin"], {
      "Full Sound": "Loose heavy blues riffs, huge room drums, elastic bass, high wailing vocals, and sharp contrasts between acoustic intimacy and electric force",
      Drums: "Massive open-tuned drums use a deep kick, cracking snare, booming room ambience, and behind-the-beat physical swing"
    }),
    profile("Pink Floyd", "Band", [], {
      "Full Sound": "Patient psychedelic rock uses spacious guitar, slow atmospheric keyboards, restrained vocals, sound effects, and long cinematic builds",
      Production: "Wide detailed stereo, tape effects, environmental sounds, long delays, and gradual layer-by-layer development create immersive space"
    }),
    profile("Queens of the Stone Age", "Band", ["QOTSA"], {
      "Full Sound": "Dry low desert-rock riffs, crooked mechanical swing, thick midrange guitars, hypnotic repetition, and cool detached vocals",
      Production: "Tightly controlled drums and bass support dense dry guitars, unusual filtered tones, and sharply arranged stop-start dynamics"
    }),
    profile("Rage Against the Machine", "Band", ["RATM", "Rage"], {
      "Full Sound": "Explosive rap-metal locks militant spoken shouts to muscular bass, deep pocket drums, heavy riffs, and machine-like guitar effects"
    }),
    profile("Deftones", "Band", [], {
      "Full Sound": "Crushing low-tuned guitars and physical drums dissolve into dreamy ambience, sensual breathy vocals, and sudden violent peaks"
    }),
    profile("Tool", "Band", [], {
      "Full Sound": "Dark progressive metal builds polyrhythmic bass and drums, repeating odd-meter guitar figures, controlled vocals, and slow ritualistic tension"
    }),
    profile("The White Stripes", "Band", ["White Stripes"], {
      "Full Sound": "Minimal garage blues uses raw fuzz guitar, stomping drums, piercing vocals, blunt riffs, and deliberately rough two-person energy"
    }),
    profile("Arctic Monkeys", "Band", [], {
      "Full Sound": "Taut indie-rock guitar and agile drums support sly low vocals, clipped lyrical phrasing, sharp hooks, and a dark lounge-rock edge"
    }),
    profile("Fleetwood Mac", "Band", [], {
      "Full Sound": "Polished soft rock layers warm rhythm guitar, melodic bass, clean drums, multiple distinctive lead voices, and close luminous harmonies"
    }),
    profile("Nine Inch Nails", "Band", ["NIN"], {
      "Full Sound": "Industrial rock fuses distorted drum machines, corroded synths, abrasive guitar, whispered-to-screamed vocals, and violent dynamic edits",
      Production: "Dense sound design stacks digital clipping, mechanical percussion, filtered noise, unstable ambience, and sudden near-silence"
    }),
    profile("Portishead", "Band", [], {
      "Full Sound": "Slow shadowy trip-hop pairs dusty breakbeats, vinyl wear, minor-key cinematic samples, twanging guitar, and fragile haunted vocals"
    }),
    profile("Massive Attack", "Band", [], {
      "Full Sound": "Deep dub-influenced trip-hop uses sub-bass, slow fractured beats, dark samples, rotating guest voices, and wide nocturnal atmosphere"
    }),
    profile("The Cure", "Band", ["Cure"], {
      "Full Sound": "Chiming chorus guitar, melodic bass, spacious drums, cold synth haze, and plaintive high vocals create romantic post-punk gloom"
    }),
    profile("Talking Heads", "Band", [], {
      "Full Sound": "Nervy art-funk locks clipped guitar, interlocking percussion, elastic bass, angular keyboards, and anxious talk-sung vocals"
    }),
    profile("Rick Rubin", "Producer", ["Rubin production", "Rick Rubin production"], {
      Auto: "Stripped-back production removes decorative layers, pushes the central performance forward, preserves physical dynamics, and gives drums and riffs blunt impact",
      Production: "Stripped-back production removes decorative layers, pushes the central performance forward, preserves physical dynamics, and gives drums and riffs blunt impact"
    }),
    profile("Phil Spector", "Producer", ["Wall of Sound producer", "Spector production"], {
      Auto: "Dense mono production doubles instruments, blends percussion and orchestration through heavy chamber echo, and forms one towering wall of sound",
      Production: "Dense mono production doubles instruments, blends percussion and orchestration through heavy chamber echo, and forms one towering wall of sound"
    }),
    profile("Brian Eno", "Producer", ["Eno production", "Brian Eno production"], {
      Auto: "Atmospheric production treats the studio as an instrument, using slow texture, unusual processing, generative repetition, and spacious ambient depth",
      Production: "Atmospheric production treats the studio as an instrument, using slow texture, unusual processing, generative repetition, and spacious ambient depth"
    }),
    profile("Dr. Dre", "Producer", ["Dr Dre", "Dre production"], {
      Auto: "Clean heavy hip-hop production centers deep controlled bass, crisp drums, sparse keyboard motifs, dry vocals, and wide uncluttered separation",
      Production: "Clean heavy hip-hop production centers deep controlled bass, crisp drums, sparse keyboard motifs, dry vocals, and wide uncluttered separation"
    }),
    profile("Timbaland", "Producer", ["Timbaland production"], {
      Auto: "Syncopated production turns unusual mouth sounds, clipped percussion, negative space, elastic bass, and off-center accents into a futuristic groove",
      Production: "Syncopated production turns unusual mouth sounds, clipped percussion, negative space, elastic bass, and off-center accents into a futuristic groove"
    }),
    profile("Max Martin", "Producer", ["Max Martin production"], {
      Auto: "Polished pop production builds clear verse-to-chorus lift, tightly layered hooks, punchy drums, bright vocal stacks, and controlled radio-ready density",
      Production: "Polished pop production builds clear verse-to-chorus lift, tightly layered hooks, punchy drums, bright vocal stacks, and controlled radio-ready density"
    }),
    profile("Scar Tissue", "Song", ["Scar Tissue guitar", "Scar Tissue sound"], {
      "Full Sound": "Airy midtempo alternative rock uses sparse clean guitar, warm bass, dry relaxed drums, reflective vocals, and sun-faded open space",
      Guitar: "Thin glassy clean guitar answers the vocal with sliding double-stops, exposed melodic gaps, and light tube grit"
    }),
    profile("Black Hole Sun", "Song", ["Black Hole Sun sound"], {
      "Full Sound": "Slow psychedelic heavy rock pairs warped open guitar chords, dark surreal harmony, massive drums, and smoky vocals that climb into anguished high belts"
    }),
    profile("Loser", "Song", ["Loser by Beck", "Loser sound"], {
      "Full Sound": "Dusty sampled hip-hop drums, looping slide guitar, lo-fi collage, stray noise, and slack deadpan talk-singing create eccentric alternative folk-rap"
    }),
    profile("Like a Stone", "Song", ["Like a Stone sound"], {
      "Full Sound": "Brooding midtempo hard rock uses a restrained bass-and-drum pulse, sparse clean verses, heavy choruses, spectral guitar effects, and a towering mournful vocal"
    })
  ]);
})();
