"use strict";

const DATA = Object.freeze({
  version: "3.0.0",

  categories: {
    Genre: [
      "Pop", "Rock", "Alternative Rock", "Indie Rock", "Hard Rock", "Punk Rock",
      "Post-Rock", "Metal", "Industrial Metal", "Sludge Metal", "Stoner Rock",
      "Shoegaze", "Hip-Hop", "Trap", "Dark Trap", "Boom Bap", "Drift Phonk",
      "R&B", "Neo-Soul", "Country", "Bluegrass", "Folk", "Celtic Folk",
      "Nordic Folk", "Jazz", "Latin Jazz", "Jazz Fusion", "Blues", "Funk",
      "Disco", "House", "Afro House", "Lo-Fi House", "Progressive House",
      "Melodic Techno", "Minimal Techno", "Ambient Techno", "Techno", "Trance",
      "Dubstep", "Future Bass", "Future Garage", "UK Garage", "Liquid Drum & Bass",
      "Glitch Hop", "Hyperpop", "Synthwave", "Hardwave", "Dream Pop",
      "Witch House", "Dark Ambient", "Psybient", "Cinematic Rock",
      "Epic Orchestral", "Electro Swing", "Americana", "Gospel", "Reggae",
      "Dancehall", "Afrobeats", "Bossa Nova", "Trip-Hop", "Grunge", "Emo"
    ],

    Mood: [
      "Aggressive", "Apocalyptic", "Bittersweet", "Calm", "Confident", "Dark",
      "Dreamy", "Emotional", "Energetic", "Euphoric", "Happy", "Haunting",
      "Hopeful", "Intimate", "Melancholic", "Mysterious", "Nostalgic", "Playful",
      "Powerful", "Romantic", "Sad", "Suspenseful", "Triumphant", "Uplifting",
      "Detached", "Restless", "Defiant", "Tender", "Uneasy", "Wry", "Desperate",
      "Paranoid", "Warm", "Cold", "Reckless", "Reflective", "Lonely", "Yearning"
    ],

    Instruments: [
      "Acoustic Guitar", "Electric Guitar", "Distorted Guitar", "Bass Guitar",
      "Upright Bass", "Banjo", "Mandolin", "Fiddle", "Violin", "Cello", "Piano",
      "Electric Piano", "Organ", "Synthesizer", "Analog Synth", "Synth Bass",
      "808 Bass", "Live Drums", "Electronic Drums", "Hand Percussion", "Strings",
      "Brass", "Choir", "Flute", "Saxophone", "Harmonica", "Pedal Steel",
      "Dobro", "Lap Steel", "Trumpet", "Trombone", "Clarinet", "Marimba",
      "Music Box", "Found Percussion", "Prepared Piano", "Baritone Guitar"
    ],

    Vocals: [
      "Male Vocal", "Female Vocal", "Duet", "Choir Vocals", "Gang Vocals",
      "Whispered Vocals", "Spoken Word", "Rap Vocals", "Falsetto", "Raspy Vocals",
      "Soulful Vocals", "Deep Vocals", "Airy Vocals", "Aggressive Vocals",
      "Layered Harmonies", "Call and Response", "No Vocals", "Close-Mic Vocal",
      "Breathy Vocal", "Belting", "Half-Sung Half-Spoken", "Vocal Fry",
      "Unison Vocal", "Octave Doubles"
    ],

    Production: [
      "Clean Production", "Raw Production", "Lo-Fi", "Hi-Fi", "Warm Analog",
      "Wide Stereo", "Mono", "Heavy Compression", "Punchy Mix", "Deep Bass",
      "Crisp Drums", "Tape Saturation", "Vinyl Texture", "Distorted", "Glitchy",
      "Atmospheric", "Cinematic", "Minimal", "Dense Layers", "Live Recording",
      "Dry Vocal", "Roomy Drums", "Front-Heavy Mix", "Dark Mix", "Bright Mix",
      "Subtle Sidechain", "Hard Sidechain", "Saturated Master", "Dynamic Mix"
    ],

    Effects: [
      "Reverb", "Reverse Reverb", "Delay", "Echo", "Chorus", "Flanger", "Phaser",
      "Distortion", "Bitcrusher", "Sidechain", "Auto-Tune", "Vocal Doubler",
      "Tape Delay", "Shimmer Reverb", "Filtered Intro", "Dropout", "Riser", "Impact Hit",
      "Telephone Filter", "Spring Reverb", "Plate Reverb", "Granular Texture",
      "Pitch Drift", "Stutter Edit", "Reverse Cymbal", "Noise Sweep"
    ],

    Era: [
      "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s",
      "Modern", "Futuristic", "Retro", "Pre-War", "Post-Punk Era", "Y2K"
    ],

    Language: [
      "English", "Spanish", "French", "German", "Italian", "Portuguese",
      "Japanese", "Korean", "Latin", "Instrumental", "Bilingual"
    ],

    Key: [
      "C Major", "C Minor", "C# Minor", "D Major", "D Minor", "D# Minor",
      "E Major", "E Minor", "F Major", "F Minor", "F# Minor", "G Major",
      "G Minor", "G# Minor", "A Major", "A Minor", "A# Minor", "B Major", "B Minor"
    ],

    Writing: [
      "Conversational Lyrics", "Concrete Imagery", "Narrative Lyrics", "Understated",
      "Dark Humor", "First Person", "Third Person", "Unreliable Narrator",
      "Internal Rhyme", "Loose Rhyme", "No Rhyming Pressure", "Sparse Lyrics",
      "Dense Lyrics", "Short Lines", "Long Lines", "Nonlinear Story", "Scene-Based",
      "Dialogue", "Refrain-Driven", "Character Study", "Unresolved Ending",
      "Specific Place Names", "Sensory Detail", "Minimal Metaphor", "Extended Metaphor"
    ],

    Arrangement: [
      "Slow Build", "Cold Open", "Immediate Chorus", "Half-Time Chorus", "Double-Time Verse",
      "Stop-Time Hits", "False Ending", "Key Change", "Instrumental Break", "A Cappella Break",
      "Final Chorus Lift", "Stripped Bridge", "Explosive Outro", "Fade Out", "Hard Stop",
      "Dynamic Swells", "Call-Back Ending", "Pre-Chorus Tension"
    ]
  },

  structureOptions: [
    "Intro", "Verse", "Pre-Chorus", "Chorus", "Post-Chorus", "Refrain",
    "Instrumental", "Drop", "Breakdown", "Bridge", "Solo", "Final Chorus", "Outro"
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
    "English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Korean", "Bilingual"
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
      bpm: 82,
      energy: "medium",
      perspective: "first-person",
      rhymeMode: "loose",
      density: "balanced"
    },
    {
      name: "Bluegrass Fire",
      description: "Fast acoustic picking and tight harmony",
      tags: ["Bluegrass", "Energetic", "Banjo", "Mandolin", "Fiddle", "Layered Harmonies", "Live Recording", "Call and Response"],
      bpm: 150,
      energy: "high",
      perspective: "first-person",
      rhymeMode: "tight",
      density: "dense"
    },
    {
      name: "Neon Night",
      description: "Retro motion with modern low end",
      tags: ["Synthwave", "Nostalgic", "Analog Synth", "Synth Bass", "Wide Stereo", "1980s", "Conversational Lyrics"],
      bpm: 105,
      energy: "high",
      perspective: "second-person",
      rhymeMode: "natural",
      density: "balanced"
    },
    {
      name: "Dream Pop",
      description: "Soft edges and suspended emotion",
      tags: ["Dream Pop", "Dreamy", "Airy Vocals", "Electric Guitar", "Shimmer Reverb", "Atmospheric", "Sparse Lyrics"],
      bpm: 92,
      energy: "low",
      perspective: "first-person",
      rhymeMode: "minimal",
      density: "sparse"
    },
    {
      name: "Dark Trap",
      description: "Heavy bass, menace, and sharp detail",
      tags: ["Dark Trap", "Aggressive", "Rap Vocals", "808 Bass", "Deep Bass", "Distorted", "Internal Rhyme", "Concrete Imagery"],
      bpm: 140,
      energy: "high",
      perspective: "first-person",
      rhymeMode: "internal",
      density: "dense"
    },
    {
      name: "Epic Trailer",
      description: "Large-scale cinematic rise",
      tags: ["Epic Orchestral", "Triumphant", "Strings", "Brass", "Choir", "Cinematic", "Impact Hit", "Slow Build"],
      bpm: 110,
      energy: "explosive",
      perspective: "mixed",
      rhymeMode: "minimal",
      density: "sparse"
    },
    {
      name: "Desert Blues",
      description: "Dry heat, open space, damaged amplifiers",
      tags: ["Blues", "Restless", "Electric Guitar", "Live Drums", "Tape Saturation", "Concrete Imagery", "Loose Rhyme"],
      bpm: 96,
      energy: "medium",
      perspective: "first-person",
      rhymeMode: "loose",
      density: "balanced"
    },
    {
      name: "Industrial Folk",
      description: "Human story inside mechanical noise",
      tags: ["Folk", "Industrial Metal", "Uneasy", "Acoustic Guitar", "Electronic Drums", "Distorted", "Narrative Lyrics", "Understated"],
      bpm: 118,
      energy: "high",
      perspective: "third-person",
      rhymeMode: "minimal",
      density: "balanced"
    },
    {
      name: "Basement Soul",
      description: "Close vocal, worn keys, late-night confession",
      tags: ["Neo-Soul", "Intimate", "Soulful Vocals", "Electric Piano", "Warm Analog", "Close-Mic Vocal", "Conversational Lyrics"],
      bpm: 74,
      energy: "low",
      perspective: "first-person",
      rhymeMode: "natural",
      density: "balanced"
    },
    {
      name: "Grunge Static",
      description: "Loud-soft dynamics and ugly honesty",
      tags: ["Grunge", "Defiant", "Distorted Guitar", "Live Drums", "Raw Production", "Dynamic Swells", "Understated"],
      bpm: 124,
      energy: "high",
      perspective: "first-person",
      rhymeMode: "minimal",
      density: "sparse"
    },
    {
      name: "Midnight House",
      description: "Patient groove, deep bass, restrained hook",
      tags: ["Deep Bass", "House", "Mysterious", "Synth Bass", "Subtle Sidechain", "Minimal", "Refrain-Driven"],
      bpm: 122,
      energy: "medium",
      perspective: "second-person",
      rhymeMode: "natural",
      density: "sparse"
    },
    {
      name: "Cinematic Confession",
      description: "Small human detail inside a huge arrangement",
      tags: ["Cinematic Rock", "Emotional", "Piano", "Strings", "Final Chorus Lift", "Scene-Based", "Concrete Imagery"],
      bpm: 88,
      energy: "high",
      perspective: "first-person",
      rhymeMode: "natural",
      density: "balanced"
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
