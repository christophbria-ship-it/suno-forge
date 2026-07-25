"use strict";

const DATA = Object.freeze({
  version: "3.1.0",

  categories: {
    Genre: [
      "Pop", "Dance Pop", "Synth Pop", "Indie Pop", "Dream Pop", "Art Pop", "Electropop", "Hyperpop",
      "Bedroom Pop", "Power Pop", "Sunshine Pop", "Baroque Pop", "Chamber Pop", "Bubblegum Pop", "Teen Pop", "Adult Contemporary",
      "Soft Rock", "Yacht Rock", "Pop Rock", "Alternative Rock", "Indie Rock", "Garage Rock", "Classic Rock", "Hard Rock",
      "Arena Rock", "Glam Rock", "Blues Rock", "Southern Rock", "Psychedelic Rock", "Progressive Rock", "Post-Rock", "Math Rock",
      "Krautrock", "Noise Rock", "Experimental Rock", "Space Rock", "Stoner Rock", "Desert Rock", "Surf Rock", "Rockabilly",
      "Punk Rock", "Pop Punk", "Hardcore Punk", "Post-Hardcore", "Emo", "Midwest Emo", "Screamo", "Post-Punk",
      "New Wave", "Gothic Rock", "Shoegaze", "Grunge", "Britpop", "Madchester", "Industrial Rock", "Metal",
      "Heavy Metal", "Thrash Metal", "Death Metal", "Melodic Death Metal", "Black Metal", "Doom Metal", "Sludge Metal", "Stoner Metal",
      "Groove Metal", "Power Metal", "Symphonic Metal", "Progressive Metal", "Folk Metal", "Viking Metal", "Industrial Metal", "Nu Metal",
      "Metalcore", "Deathcore", "Djent", "Alternative Metal", "Glam Metal", "Speed Metal", "Drone Metal", "Hip-Hop",
      "Boom Bap", "East Coast Hip-Hop", "West Coast Hip-Hop", "Southern Hip-Hop", "Conscious Hip-Hop", "Alternative Hip-Hop", "Experimental Hip-Hop", "Jazz Rap",
      "Trap", "Dark Trap", "Drill", "UK Drill", "Cloud Rap", "Emo Rap", "Lo-Fi Hip-Hop", "Phonk",
      "Drift Phonk", "Crunk", "Grime", "G-Funk", "Memphis Rap", "Horrorcore", "R&B", "Contemporary R&B",
      "Alternative R&B", "Neo-Soul", "Soul", "Motown", "Quiet Storm", "Funk", "P-Funk", "Gospel",
      "New Jack Swing", "Disco", "Boogie", "Country", "Contemporary Country", "Traditional Country", "Outlaw Country", "Alt-Country",
      "Country Rock", "Country Pop", "Honky-Tonk", "Western Swing", "Bluegrass", "Progressive Bluegrass", "Americana", "Roots Rock",
      "Folk", "Indie Folk", "Contemporary Folk", "Singer-Songwriter", "Acoustic Folk", "Celtic Folk", "Nordic Folk", "Appalachian Folk",
      "Gothic Folk", "Dark Folk", "Freak Folk", "Anti-Folk", "Gospel Folk", "Blues", "Delta Blues", "Chicago Blues",
      "Electric Blues", "Country Blues", "Soul Blues", "Jazz", "Traditional Jazz", "Swing", "Bebop", "Hard Bop",
      "Cool Jazz", "Modal Jazz", "Free Jazz", "Vocal Jazz", "Smooth Jazz", "Jazz Fusion", "Acid Jazz", "Nu Jazz",
      "Latin Jazz", "Gypsy Jazz", "Bossa Nova", "Samba", "Salsa", "Mambo", "Cha-Cha", "Bolero",
      "Tango", "Flamenco", "Reggae", "Roots Reggae", "Dub", "Dancehall", "Ska", "Rocksteady",
      "Afrobeats", "Afrobeat", "Afro House", "Amapiano", "Highlife", "Soukous", "Makossa", "Gqom",
      "K-Pop", "J-Pop", "City Pop", "Cantopop", "Mandopop", "K-R&B", "Enka", "Trot",
      "Bollywood", "Bhangra", "Qawwali", "Ghazal", "Rai", "Arabic Pop", "Dabke", "Anatolian Rock",
      "Cumbia", "Reggaeton", "Latin Pop", "Latin Trap", "Bachata", "Merengue", "Mariachi", "Ranchera",
      "Norteño", "Corrido", "Tejano", "Forró", "Sertanejo", "MPB", "Tropicalia", "House",
      "Deep House", "Progressive House", "Tech House", "Acid House", "Chicago House", "Detroit House", "Lo-Fi House", "Piano House",
      "Disco House", "French House", "Future House", "Bass House", "Electro House", "Tropical House", "Melodic House", "Techno",
      "Detroit Techno", "Minimal Techno", "Melodic Techno", "Industrial Techno", "Acid Techno", "Hard Techno", "Ambient Techno", "Dub Techno",
      "Trance", "Progressive Trance", "Psytrance", "Goa Trance", "Uplifting Trance", "Hard Trance", "Breakbeat", "Big Beat",
      "UK Garage", "2-Step Garage", "Speed Garage", "Future Garage", "Bassline", "Drum & Bass", "Liquid Drum & Bass", "Jungle",
      "Neurofunk", "Breakcore", "Dubstep", "Brostep", "Riddim", "Future Bass", "Trap EDM", "Glitch Hop",
      "IDM", "Electronica", "Downtempo", "Trip-Hop", "Chillout", "Chillwave", "Vaporwave", "Synthwave",
      "Retrowave", "Darksynth", "Hardwave", "Witch House", "Dark Ambient", "Ambient", "Drone", "New Age",
      "Psybient", "Space Ambient", "Noise", "Harsh Noise", "Musique Concrète", "Electroacoustic", "Glitch", "Minimalism",
      "Modern Classical", "Neo-Classical", "Chamber Music", "Orchestral", "Epic Orchestral", "Film Score", "Trailer Music", "Cinematic Rock",
      "Cinematic Electronic", "Opera", "Operetta", "Musical Theatre", "Cabaret", "Vaudeville", "Spoken Word", "Poetry",
      "Children's Music", "Lullaby", "Comedy", "Novelty", "Video Game Music", "Chiptune", "8-Bit", "Electro Swing"
    ],

    Mood: [
      "Aggressive", "Apocalyptic", "Bittersweet", "Calm", "Confident", "Dark", "Dreamy", "Emotional", "Energetic", "Euphoric",
      "Happy", "Haunting", "Hopeful", "Intimate", "Melancholic", "Mysterious", "Nostalgic", "Playful", "Powerful", "Romantic",
      "Sad", "Suspenseful", "Triumphant", "Uplifting", "Detached", "Restless", "Defiant", "Tender", "Uneasy", "Wry",
      "Desperate", "Paranoid", "Warm", "Cold", "Reckless", "Reflective", "Lonely", "Yearning", "Angry", "Anxious",
      "Brooding", "Celebratory", "Chaotic", "Contemplative", "Creepy", "Determined", "Devastated", "Ecstatic", "Eerie", "Empowering",
      "Flirtatious", "Fragile", "Grateful", "Gritty", "Heartbroken", "Hilarious", "Hypnotic", "Joyful", "Menacing", "Mournful",
      "Optimistic", "Peaceful", "Regretful", "Seductive", "Serene", "Sinister", "Somber", "Spiritual", "Tense", "Vulnerable"
    ],

    Instruments: [
      "Acoustic Guitar", "Nylon-String Guitar", "Steel-String Guitar", "12-String Guitar", "Electric Guitar", "Clean Electric Guitar", "Distorted Guitar", "Baritone Guitar",
      "Slide Guitar", "Resonator Guitar", "Dobro", "Lap Steel", "Pedal Steel", "Bass Guitar", "Fretless Bass", "Upright Bass",
      "Sub Bass", "Synth Bass", "808 Bass", "Banjo", "Clawhammer Banjo", "Mandolin", "Octave Mandolin", "Bouzouki",
      "Ukulele", "Harp", "Autoharp", "Dulcimer", "Hammered Dulcimer", "Sitar", "Sarod", "Oud",
      "Shamisen", "Koto", "Pipa", "Erhu", "Balalaika", "Charango", "Cuatro", "Fiddle",
      "Violin", "Viola", "Cello", "Double Bass", "String Quartet", "String Ensemble", "Pizzicato Strings", "Spiccato Strings",
      "Tremolo Strings", "Solo Violin", "Solo Cello", "Piano", "Upright Piano", "Grand Piano", "Prepared Piano", "Honky-Tonk Piano",
      "Electric Piano", "Rhodes", "Wurlitzer", "Clavinet", "Harpsichord", "Celesta", "Music Box", "Organ",
      "Hammond Organ", "Pipe Organ", "Reed Organ", "Accordion", "Bandoneon", "Mellotron", "Synthesizer", "Analog Synth",
      "Digital Synth", "Modular Synth", "FM Synth", "Wavetable Synth", "Granular Synth", "Mono Synth", "Poly Synth", "Arpeggiated Synth",
      "Synth Pad", "Synth Lead", "Synth Pluck", "Synth Brass", "Synth Strings", "Live Drums", "Electronic Drums", "Drum Machine",
      "808 Drum Machine", "909 Drum Machine", "Acoustic Drum Kit", "Brush Drums", "Marching Drums", "Taiko Drums", "Toms", "Floor Toms",
      "Kick Drum", "Snare Drum", "Rimshot", "Claps", "Finger Snaps", "Hi-Hat", "Ride Cymbal", "Crash Cymbal",
      "Hand Percussion", "Shaker", "Tambourine", "Cowbell", "Claves", "Woodblock", "Triangle", "Vibraphone",
      "Marimba", "Xylophone", "Glockenspiel", "Tubular Bells", "Steel Drums", "Hang Drum", "Kalimba", "Mbira",
      "Djembe", "Cajón", "Congas", "Bongos", "Timbales", "Tabla", "Frame Drum", "Bodhrán",
      "Castanets", "Guiro", "Agogô Bells", "Found Percussion", "Industrial Percussion", "Flute", "Piccolo", "Alto Flute",
      "Recorder", "Pan Flute", "Ocarina", "Clarinet", "Bass Clarinet", "Oboe", "English Horn", "Bassoon",
      "Saxophone", "Soprano Saxophone", "Alto Saxophone", "Tenor Saxophone", "Baritone Saxophone", "Trumpet", "Muted Trumpet", "Flugelhorn",
      "Trombone", "Bass Trombone", "French Horn", "Tuba", "Brass Section", "Woodwind Section", "Harmonica", "Melodica",
      "Bagpipes", "Tin Whistle", "Didgeridoo", "Shakuhachi", "Duduk", "Ney Flute", "Uilleann Pipes", "Orchestra",
      "Strings", "Brass", "Woodwinds", "Choir", "Vocoder", "Talk Box", "Turntables", "Sampler"
    ],

    Vocals: [
      "Male Vocal", "Female Vocal", "Androgynous Vocal", "Child Vocal", "Youth Choir", "Adult Choir", "Solo Vocal", "Duet",
      "Trio Vocals", "Group Vocals", "Choir Vocals", "Gang Vocals", "Lead Vocal", "Backing Vocals", "Featured Vocal", "No Vocals",
      "Rap Vocals", "Spoken Word", "Sung-Spoken Vocal", "Half-Sung Half-Spoken", "Whispered Vocals", "Shouted Vocals", "Screamed Vocals", "Growled Vocals",
      "Soulful Vocals", "Raspy Vocals", "Airy Vocals", "Breathy Vocal", "Deep Vocals", "Bright Vocals", "Dark Vocals", "Warm Vocals",
      "Clean Vocals", "Raw Vocals", "Aggressive Vocals", "Tender Vocals", "Intimate Vocals", "Powerful Vocals", "Operatic Vocals", "Theatrical Vocals",
      "Gospel Vocals", "Folk Vocals", "Country Twang", "Blues Vocal", "Jazz Vocal", "Pop Vocal", "Rock Vocal", "Metal Vocal"
    ],

    "Vocal Delivery": [
      "Close-Mic Vocal", "Distant Vocal", "Conversational Delivery", "Storytelling Delivery", "Melismatic Delivery", "Straight-Tone Delivery", "Legato Phrasing", "Staccato Phrasing",
      "Rubato Vocal", "Behind-the-Beat Vocal", "Ahead-of-the-Beat Vocal", "Syncopated Vocal", "Rapid-Fire Delivery", "Slow Drawl", "Deadpan Delivery", "Detached Delivery",
      "Emotional Crack", "Crying Tone", "Smiling Tone", "Whisper-to-Belt", "Soft-to-Loud Build", "Controlled Belting", "Full Belting", "Falsetto Lead",
      "Head Voice Lead", "Chest Voice Lead", "Mixed Voice Lead", "Vocal Fry", "Yodeling", "Scat Singing", "Beatboxing", "Chanting",
      "Callout Phrases", "Ad-Lib Heavy", "Minimal Ad-Libs", "Breath Sounds", "Audible Inhales", "Vocal Runs", "Riffs and Runs", "Blue Notes",
      "Grace Notes", "Portamento", "Glissando", "Vibrato Heavy", "Straight Vibrato", "Wide Vibrato", "Tight Vibrato", "No Vibrato",
      "Clipped Phrases", "Long Sustained Notes", "Short Punchy Lines", "Wordless Vocalise", "Non-Lexical Vocals", "Improvised Vocal"
    ],

    "Vocal Range & Register": [
      "Bass Vocal", "Bass-Baritone", "Baritone", "High Baritone", "Tenor", "High Tenor", "Countertenor", "Alto",
      "Contralto", "Mezzo-Soprano", "Soprano", "Coloratura Soprano", "Low Register", "Mid Register", "High Register", "Wide Range",
      "Narrow Range", "Octave-Leap Melody", "Falsetto Register", "Head Voice", "Chest Voice", "Mixed Voice", "Whistle Register", "Subharmonic Vocal",
      "Vocal Fry Register", "Growl Register", "Low Whisper", "High Whisper", "Low Rap Register", "High Rap Register"
    ],

    "Vocal Arrangement": [
      "Unison Vocal", "Octave Doubles", "Double-Tracked Lead", "Triple-Tracked Lead", "Layered Harmonies", "Stacked Harmonies", "Tight Harmonies", "Wide Harmonies",
      "Parallel Thirds", "Parallel Sixths", "Open Fifth Harmonies", "Four-Part Harmony", "Three-Part Harmony", "Two-Part Harmony", "Counter-Melody Vocal", "Answering Vocal",
      "Call and Response", "Lead-and-Echo", "Question-and-Answer Duet", "Alternating Duet", "Overlapping Duet", "Male-Female Duet", "Same-Range Duet", "Octave Duet",
      "Verse Solo Chorus Group", "Solo Verse Choir Chorus", "Lead with Gang Shouts", "Gang Vocal Hook", "Gang Vocal Accents", "Crowd Chant", "Crowd Singalong", "Audience Response",
      "Whisper Layer", "Breathy Double", "Falsetto Double", "Low Octave Double", "High Octave Double", "Harmony on Last Words", "Harmony on Every Line", "Chorus-Only Harmonies",
      "Pre-Chorus Harmony Build", "Final Chorus Harmony Lift", "Bridge Vocal Stack", "Outro Vocal Stack", "Ad-Lib Counterpoint", "Ad-Lib Response", "Background Oohs", "Background Aahs",
      "Wordless Hook", "Vocal Pad", "Vocal Drone", "Vocal Ostinato", "Round Singing", "Canon Vocals", "Antiphonal Vocals", "Layered Spoken Word",
      "Spoken Intro Sung Chorus", "Rap Verse Sung Chorus", "Sung Verse Rap Bridge", "Lead Swap", "Character Duet", "Narrator-and-Character Vocals"
    ],

    "Harmony & Choir": [
      "SATB Choir", "SSA Choir", "TTBB Choir", "Mixed Choir", "Women's Choir", "Men's Choir", "Children's Choir", "Gospel Choir",
      "Chamber Choir", "Mass Choir", "Small Ensemble Choir", "Monastic Chant", "Gregorian Chant", "Sacred Choir", "Secular Choir", "A Cappella Choir",
      "Choir Swells", "Choir Stabs", "Choir Pad", "Choir Drone", "Choir Cluster", "Dissonant Choir", "Major-Key Choir", "Minor-Key Choir",
      "Close Harmony", "Barbershop Harmony", "Doo-Wop Harmony", "Gospel Harmony", "Bluegrass Harmony", "Folk Harmony", "Jazz Harmony Vocals", "Pop Harmony Stack",
      "Rock Gang Harmony", "Metal Choir Layer", "Cluster Harmony", "Suspended Harmony", "Quartal Harmony", "Drone Harmony", "Pedal-Tone Harmony", "Chromatic Harmony",
      "Descending Harmony", "Ascending Harmony", "Harmony Resolution", "Unresolved Harmony", "Final-Chord Choir"
    ],

    "Rhythm & Groove": [
      "Straight 4/4", "Shuffle", "Swing Feel", "Half-Time", "Double-Time", "Four-on-the-Floor", "Boom Bap Groove", "Trap Hi-Hats",
      "Drill Rhythm", "Reggaeton Dem Bow", "Afrobeat Groove", "Amapiano Groove", "Funk Pocket", "Neo-Soul Pocket", "Disco Groove", "Motown Groove",
      "Country Two-Step", "Train Beat", "Bluegrass Drive", "Waltz", "6/8 Ballad", "12/8 Blues", "3/4 Meter", "5/4 Meter",
      "7/8 Meter", "Odd Meter", "Polyrhythm", "Cross-Rhythm", "Syncopated Groove", "Laid-Back Groove", "Pushing Groove", "Humanized Timing",
      "Quantized Timing", "Loose Pocket", "Tight Pocket", "Broken Beat", "Breakbeat Groove", "Jungle Breaks", "Amen Break", "D-Beat",
      "Blast Beat", "Galloping Rhythm", "Motorik Beat", "Tresillo", "Clave Rhythm", "Bossa Groove", "Samba Groove", "Tango Rhythm",
      "Minimal Pulse", "No Drums"
    ],

    Production: [
      "Clean Production", "Raw Production", "Lo-Fi", "Hi-Fi", "Warm Analog", "Digital Precision", "Wide Stereo", "Mono",
      "Heavy Compression", "Light Compression", "Punchy Mix", "Deep Bass", "Crisp Drums", "Tape Saturation", "Vinyl Texture", "Distorted",
      "Glitchy", "Atmospheric", "Cinematic", "Minimal", "Dense Layers", "Live Recording", "Dry Vocal", "Roomy Drums",
      "Front-Heavy Mix", "Dark Mix", "Bright Mix", "Subtle Sidechain", "Hard Sidechain", "Saturated Master", "Dynamic Mix", "Radio Ready",
      "Festival Mix", "Club Mix", "Headphone Mix", "Huge Stereo Width", "Narrow Stereo", "Huge Drums", "Small Drums", "Heavy Low End",
      "Airy Top End", "Midrange Forward", "Scooped Mids", "Vintage Recording", "Modern Production", "Bedroom Production", "Basement Recording", "Garage Recording",
      "Field Recording", "Sample-Based Production", "Loop-Based Production", "Live Band Production", "Hybrid Acoustic Electronic", "Orchestral Production", "Film Score Mix", "Trailer Mix",
      "Wall of Sound", "Sparse Arrangement", "Maximalist Production", "Organic Production", "Synthetic Production", "DIY Production"
    ],

    "Mix & Master": [
      "Vocal Forward", "Instrument Forward", "Bass Forward", "Drums Forward", "Guitar Forward", "Keys Forward", "Center-Panned Vocal", "Wide Vocal",
      "Hard-Panned Guitars", "Mono Low End", "Wide High End", "Tight Low End", "Booming Low End", "Subtle Sub Bass", "Aggressive Limiting", "Gentle Limiting",
      "Loud Master", "Dynamic Master", "Vintage Master", "Clean Master", "Dark Master", "Bright Master", "Warm Master", "Cold Master",
      "Tape Master", "Vinyl Master", "Cassette Master", "Crunchy Master", "Polished Master", "Unmastered Feel", "Transient Heavy", "Soft Transients",
      "Punchy Transients", "Smeared Transients", "Long Reverb Tail", "Short Reverb Tail", "Dry Mix", "Wet Mix", "Front-to-Back Depth", "Flat Depth",
      "Intimate Mix", "Arena Mix", "Small-Room Mix", "Large-Hall Mix", "Binaural Feel"
    ],

    Effects: [
      "Reverb", "Reverse Reverb", "Delay", "Echo", "Chorus", "Flanger", "Phaser", "Distortion",
      "Overdrive", "Fuzz", "Bitcrusher", "Sidechain", "Auto-Tune", "Hard Auto-Tune", "Natural Pitch Correction", "Vocal Doubler",
      "Tape Delay", "Slapback Delay", "Ping-Pong Delay", "Shimmer Reverb", "Spring Reverb", "Plate Reverb", "Room Reverb", "Hall Reverb",
      "Gated Reverb", "Convolution Reverb", "Telephone Filter", "Radio Filter", "Megaphone Filter", "Underwater Filter", "Bandpass Filter", "Low-Pass Filter",
      "High-Pass Filter", "Formant Shift", "Pitch Shift", "Pitch Drift", "Granular Texture", "Stutter Edit", "Vocal Chop", "Reverse Vocal",
      "Vocoder", "Talk Box", "Ring Modulation", "Tremolo", "Auto-Pan", "Stereo Widener", "Doppler Effect", "Tape Stop",
      "Vinyl Stop", "Dropout", "Filtered Intro", "Riser", "Downlifter", "Impact Hit", "Reverse Cymbal", "Noise Sweep",
      "White Noise", "Pink Noise", "Glitch Cut", "Silence Break", "Feedback Swell", "Infinite Reverb"
    ],

    Era: [
      "Pre-War", "1940s", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s",
      "Modern", "Futuristic", "Retro", "Vintage", "Y2K", "Post-Punk Era", "Golden Age Hip-Hop", "Classic Soul Era", "Disco Era", "Hair Metal Era",
      "Grunge Era", "Britpop Era", "Early Internet", "Cassette Era", "Vinyl Era", "Radio Era", "Space Age", "Cyberpunk", "Post-Apocalyptic", "Timeless"
    ],

    Language: [
      "English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Korean", "Mandarin", "Cantonese",
      "Arabic", "Hindi", "Punjabi", "Turkish", "Russian", "Ukrainian", "Swedish", "Norwegian", "Latin", "Bilingual",
      "Multilingual", "Instrumental"
    ],

    Key: [
      "C Major", "C Minor", "C# Major", "C# Minor", "D Major", "D Minor", "D# Major", "D# Minor",
      "E Major", "E Minor", "F Major", "F Minor", "F# Major", "F# Minor", "G Major", "G Minor",
      "G# Major", "G# Minor", "A Major", "A Minor", "A# Major", "A# Minor", "B Major", "B Minor",
      "Dorian Mode", "Phrygian Mode", "Lydian Mode", "Mixolydian Mode", "Locrian Mode", "Harmonic Minor", "Melodic Minor", "Pentatonic",
      "Blues Scale", "Whole-Tone Scale", "Chromatic", "Modal Ambiguity"
    ],

    Writing: [
      "Conversational Lyrics", "Concrete Imagery", "Narrative Lyrics", "Understated", "Dark Humor", "First Person", "Second Person", "Third Person",
      "Unreliable Narrator", "Internal Rhyme", "Loose Rhyme", "Tight Rhyme", "No Rhyming Pressure", "Sparse Lyrics", "Dense Lyrics", "Short Lines",
      "Long Lines", "Nonlinear Story", "Scene-Based", "Dialogue", "Refrain-Driven", "Character Study", "Unresolved Ending", "Specific Place Names",
      "Sensory Detail", "Minimal Metaphor", "Extended Metaphor", "Stream of Consciousness", "Confessional", "Observational", "Cinematic Storytelling", "Chronological Story",
      "Flashback", "Multiple Timelines", "Multiple Characters", "Single-Room Story", "Road Story", "Workplace Story", "Domestic Detail", "Social Commentary",
      "Political Commentary", "Spiritual Reflection", "Romantic Tension", "Breakup Aftermath", "Revenge Story", "Redemption Story", "Tragic Ending", "Hopeful Ending",
      "Twist Ending", "Open Ending", "Circular Ending", "Callback Lyrics", "Title Hook", "Non-Title Hook", "Question Hook", "Command Hook",
      "List Song", "Letter Song", "Phone-Call Song", "Diary Entry", "Monologue", "Minimal Repetition", "Heavy Repetition", "Syllabic Precision"
    ],

    Arrangement: [
      "Slow Build", "Cold Open", "Immediate Chorus", "Half-Time Chorus", "Double-Time Verse", "Stop-Time Hits", "False Ending", "Key Change",
      "Instrumental Break", "A Cappella Break", "Final Chorus Lift", "Stripped Bridge", "Explosive Outro", "Fade Out", "Hard Stop", "Dynamic Swells",
      "Call-Back Ending", "Pre-Chorus Tension", "Intro Tease", "No Intro", "Long Intro", "Short Intro", "Verse-First", "Chorus-First",
      "Post-Chorus Hook", "Double Chorus", "Extended Chorus", "Short Chorus", "Refrain Instead of Chorus", "Verse Variation", "Final Verse Twist", "Bridge Modulation",
      "Instrumental Bridge", "Half-Time Breakdown", "Double-Time Breakdown", "Drumless Verse", "Bass Dropout", "Vocal Dropout", "Full-Band Dropout", "Solo Spotlight",
      "Guitar Solo", "Synth Solo", "Piano Solo", "Sax Solo", "Drum Solo", "Call-and-Response Section", "Choir Entrance", "Gang Vocal Entrance",
      "Layer-by-Layer Build", "Sudden Full Arrangement", "Fake Drop", "Double Drop", "Breakdown Before Final Chorus", "Final Key Change", "Tag Ending", "Vamp Outro",
      "Looped Outro", "Ambient Outro", "Abrupt Ending", "Resolved Ending", "Unresolved Ending", "Hidden Coda"
    ],

    Performance: [
      "Live Performance", "Studio Performance", "One-Take Performance", "Imperfection Kept", "Virtuosic Performance", "Minimalist Performance", "Loose Performance", "Tight Performance",
      "Intimate Performance", "Arena Performance", "Club Performance", "Festival Performance", "Church Performance", "Street Performance", "Campfire Performance", "Acoustic Session",
      "Unplugged", "Full Band", "Power Trio", "Duo Performance", "Solo Performance", "Orchestral Performance", "Choir Performance", "Audience Singalong",
      "Crowd Noise", "Stage Banter", "Count-In", "Studio Chatter", "Room Noise", "Finger Noise", "String Squeak", "Drum Stick Click",
      "Breath Left In", "Pitch Imperfection", "Timing Imperfection", "Controlled Chaos"
    ],

    "Recording Space": [
      "Dead Booth", "Dry Studio", "Small Bedroom", "Basement", "Garage", "Practice Room", "Small Club", "Large Club",
      "Theatre", "Concert Hall", "Cathedral", "Church", "Warehouse", "Tunnel", "Stairwell", "Bathroom",
      "Kitchen", "Living Room", "Motel Room", "Outdoor Field", "Forest", "Desert", "Mountain", "Beach",
      "Subway Platform", "Street Corner", "Car Interior", "Radio Studio", "Vintage Studio", "Huge Soundstage"
    ],

    "Texture & Atmosphere": [
      "Atmospheric", "Cinematic", "Minimal", "Dense", "Warm", "Cold", "Dusty", "Smoky",
      "Glassy", "Metallic", "Wooden", "Organic", "Synthetic", "Grainy", "Hazy", "Dreamlike",
      "Nighttime", "Sunrise", "Sunset", "Rainy", "Stormy", "Windy", "Desert Heat", "Winter Air",
      "Urban", "Rural", "Industrial", "Sacred", "Haunted", "Futuristic", "Retro-Futuristic", "Analog Decay",
      "Digital Decay", "Tape Warble", "Vinyl Crackle", "Cassette Hiss", "Room Hum", "Electrical Buzz", "Field Ambience", "Silence as Texture"
    ]
  },

  structureOptions: [
    "Intro", "Cold Open", "Verse", "Pre-Chorus", "Chorus", "Post-Chorus", "Refrain", "Double Chorus",
    "Instrumental", "Instrumental Bridge", "Drop", "Breakdown", "Half-Time Breakdown", "Bridge", "Solo", "A Cappella Break",
    "Final Chorus", "Final Key Change", "Fake Ending", "Outro", "Coda"
  ],

  perspectives: [
    { value: "first-person", label: "First person (I/we)" },
    { value: "second-person", label: "Second person (you)" },
    { value: "third-person", label: "Third person (he/she/they)" },
    { value: "mixed", label: "Mixed perspective" }
  ],

  rhymeModes: [
    { value: "natural", label: "Natural / earned" },
    { value: "loose", label: "Loose rhyme" },
    { value: "internal", label: "Internal rhyme" },
    { value: "tight", label: "Tight rhyme" },
    { value: "minimal", label: "Minimal rhyme" }
  ],

  densities: [
    { value: "sparse", label: "Sparse" },
    { value: "balanced", label: "Balanced" },
    { value: "dense", label: "Dense" }
  ],

  languages: [
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Korean", "Mandarin", "Arabic", "Hindi", "Bilingual"
  ],

  promptFormats: [
    { value: "detailed", label: "Detailed Studio Brief" },
    { value: "compact", label: "Compact Prompt" },
    { value: "lyrics", label: "Lyrics Only" }
  ],

  recipes: [
    {
      name: "Dark Country",
      description: "Weathered, specific, and restrained",
      tags: ["Country", "Dark", "Raspy Vocals", "Acoustic Guitar", "Pedal Steel", "Raw Production", "Concrete Imagery", "Understated"],
      bpm: 82, energy: "medium", perspective: "first-person", rhymeMode: "loose", density: "balanced"
    },
    {
      name: "Bluegrass Fire",
      description: "Fast acoustic picking and tight harmony",
      tags: ["Bluegrass", "Energetic", "Banjo", "Mandolin", "Fiddle", "Layered Harmonies", "Live Recording", "Call and Response"],
      bpm: 150, energy: "high", perspective: "first-person", rhymeMode: "tight", density: "dense"
    },
    {
      name: "Neon Night",
      description: "Retro motion with modern low end",
      tags: ["Synthwave", "Nostalgic", "Analog Synth", "Synth Bass", "Wide Stereo", "1980s", "Conversational Lyrics"],
      bpm: 105, energy: "high", perspective: "second-person", rhymeMode: "natural", density: "balanced"
    },
    {
      name: "Dream Pop",
      description: "Soft edges and suspended emotion",
      tags: ["Dream Pop", "Dreamy", "Airy Vocals", "Electric Guitar", "Shimmer Reverb", "Atmospheric", "Sparse Lyrics"],
      bpm: 92, energy: "low", perspective: "first-person", rhymeMode: "minimal", density: "sparse"
    },
    {
      name: "Dark Trap",
      description: "Heavy bass, menace, and sharp detail",
      tags: ["Dark Trap", "Aggressive", "Rap Vocals", "808 Bass", "Deep Bass", "Distorted", "Internal Rhyme", "Concrete Imagery"],
      bpm: 140, energy: "high", perspective: "first-person", rhymeMode: "internal", density: "dense"
    },
    {
      name: "Epic Trailer",
      description: "Large-scale cinematic rise",
      tags: ["Epic Orchestral", "Triumphant", "Strings", "Brass", "Choir", "Cinematic", "Impact Hit", "Slow Build"],
      bpm: 110, energy: "explosive", perspective: "mixed", rhymeMode: "minimal", density: "sparse"
    },
    {
      name: "Desert Blues",
      description: "Dry heat, open space, damaged amplifiers",
      tags: ["Blues", "Restless", "Electric Guitar", "Live Drums", "Tape Saturation", "Concrete Imagery", "Loose Rhyme"],
      bpm: 96, energy: "medium", perspective: "first-person", rhymeMode: "loose", density: "balanced"
    },
    {
      name: "Industrial Folk",
      description: "Human story inside mechanical noise",
      tags: ["Folk", "Industrial Metal", "Uneasy", "Acoustic Guitar", "Electronic Drums", "Distorted", "Narrative Lyrics", "Understated"],
      bpm: 118, energy: "high", perspective: "third-person", rhymeMode: "minimal", density: "balanced"
    },
    {
      name: "Basement Soul",
      description: "Close vocal, worn keys, late-night confession",
      tags: ["Neo-Soul", "Intimate", "Soulful Vocals", "Electric Piano", "Warm Analog", "Close-Mic Vocal", "Conversational Lyrics"],
      bpm: 74, energy: "low", perspective: "first-person", rhymeMode: "natural", density: "balanced"
    },
    {
      name: "Grunge Static",
      description: "Loud-soft dynamics and ugly honesty",
      tags: ["Grunge", "Defiant", "Distorted Guitar", "Live Drums", "Raw Production", "Dynamic Swells", "Understated"],
      bpm: 124, energy: "high", perspective: "first-person", rhymeMode: "minimal", density: "sparse"
    },
    {
      name: "Midnight House",
      description: "Patient groove, deep bass, restrained hook",
      tags: ["House", "Mysterious", "Synth Bass", "Deep Bass", "Subtle Sidechain", "Minimal", "Refrain-Driven"],
      bpm: 122, energy: "medium", perspective: "second-person", rhymeMode: "natural", density: "sparse"
    },
    {
      name: "Cinematic Confession",
      description: "Small human detail inside a huge arrangement",
      tags: ["Cinematic Rock", "Emotional", "Piano", "Strings", "Final Chorus Lift", "Scene-Based", "Concrete Imagery"],
      bpm: 88, energy: "high", perspective: "first-person", rhymeMode: "natural", density: "balanced"
    },
    {
      name: "Gospel Lift",
      description: "Solo testimony growing into a full choir",
      tags: ["Gospel", "Hopeful", "Lead Vocal", "Gospel Choir", "Solo Verse Choir Chorus", "Hammond Organ", "Final Chorus Harmony Lift"],
      bpm: 86, energy: "high", perspective: "first-person", rhymeMode: "natural", density: "balanced"
    },
    {
      name: "Rap and Soul",
      description: "Tight verses with a wide sung hook",
      tags: ["Alternative Hip-Hop", "Neo-Soul", "Rap Verse Sung Chorus", "Sung-Spoken Vocal", "Stacked Harmonies", "808 Bass", "Rhodes"],
      bpm: 92, energy: "medium", perspective: "first-person", rhymeMode: "internal", density: "dense"
    },
    {
      name: "Choir Apocalypse",
      description: "Dissonant massed voices over collapsing drums",
      tags: ["Cinematic Electronic", "Apocalyptic", "Mass Choir", "Dissonant Choir", "Choir Swells", "Huge Drums", "Impact Hit", "Unresolved Harmony"],
      bpm: 108, energy: "explosive", perspective: "mixed", rhymeMode: "minimal", density: "sparse"
    },
    {
      name: "Acoustic Duet",
      description: "Two characters trading the same hard truth",
      tags: ["Indie Folk", "Intimate", "Male-Female Duet", "Alternating Duet", "Acoustic Guitar", "Question-and-Answer Duet", "Dialogue"],
      bpm: 78, energy: "low", perspective: "mixed", rhymeMode: "loose", density: "balanced"
    }
  ],

  defaultStructure: [
    "Intro", "Verse", "Chorus", "Verse", "Chorus", "Bridge", "Final Chorus", "Outro"
  ],

  offlineDetails: [
    "a cracked phone charging beside the motel sink",
    "the red numbers on a microwave clock",
    "rainwater dragging cigarette ash into the gutter",
    "a work shirt hanging from the passenger window",
    "two quarters and a receipt in the cup holder",
    "the neighbor's sprinkler clicking at 4 a.m.",
    "a dog barking behind a chain-link fence",
    "cold fries in a paper bag on the dashboard",
    "a pharmacy receipt folded into a wallet",
    "bleach and burnt toast in the apartment hallway",
    "a chipped coffee mug beside an unplugged alarm clock",
    "a dead porch light above a package with the wrong name",
    "a bus transfer soft from being held too long",
    "a key that sticks halfway in the ignition",
    "a voicemail recorded over the hum of a laundromat",
    "a pawn ticket tucked behind a driver's license"
  ],

  defaults: {
    bpm: 120,
    length: "standard",
    energy: "medium",
    perspective: "first-person",
    rhymeMode: "natural",
    density: "balanced",
    language: "English",
    promptFormat: "detailed",
    customInstructions: "",
    songIdea: "",
    lyrics: "",
    selectedTags: []
  }
});
