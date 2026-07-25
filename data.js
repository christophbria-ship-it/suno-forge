"use strict";

const DATA = Object.freeze({
  version: "2.0.0",

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
      "Epic Orchestral", "Electro Swing"
    ],

    Mood: [
      "Aggressive", "Apocalyptic", "Bittersweet", "Calm", "Confident", "Dark",
      "Dreamy", "Emotional", "Energetic", "Euphoric", "Happy", "Haunting",
      "Hopeful", "Intimate", "Melancholic", "Mysterious", "Nostalgic", "Playful",
      "Powerful", "Romantic", "Sad", "Suspenseful", "Triumphant", "Uplifting",
      "Detached", "Restless", "Defiant", "Tender", "Uneasy", "Wry"
    ],

    Instruments: [
      "Acoustic Guitar", "Electric Guitar", "Distorted Guitar", "Bass Guitar",
      "Upright Bass", "Banjo", "Mandolin", "Fiddle", "Violin", "Cello", "Piano",
      "Electric Piano", "Organ", "Synthesizer", "Analog Synth", "Synth Bass",
      "808 Bass", "Live Drums", "Electronic Drums", "Hand Percussion", "Strings",
      "Brass", "Choir", "Flute", "Saxophone", "Harmonica", "Pedal Steel"
    ],

    Vocals: [
      "Male Vocal", "Female Vocal", "Duet", "Choir Vocals", "Gang Vocals",
      "Whispered Vocals", "Spoken Word", "Rap Vocals", "Falsetto", "Raspy Vocals",
      "Soulful Vocals", "Deep Vocals", "Airy Vocals", "Aggressive Vocals",
      "Layered Harmonies", "Call and Response", "No Vocals"
    ],

    Production: [
      "Clean Production", "Raw Production", "Lo-Fi", "Hi-Fi", "Warm Analog",
      "Wide Stereo", "Mono", "Heavy Compression", "Punchy Mix", "Deep Bass",
      "Crisp Drums", "Tape Saturation", "Vinyl Texture", "Distorted", "Glitchy",
      "Atmospheric", "Cinematic", "Minimal", "Dense Layers", "Live Recording"
    ],

    Effects: [
      "Reverb", "Reverse Reverb", "Delay", "Echo", "Chorus", "Flanger", "Phaser",
      "Distortion", "Bitcrusher", "Sidechain", "Auto-Tune", "Vocal Doubler",
      "Tape Delay", "Shimmer Reverb", "Filtered Intro", "Dropout", "Riser", "Impact Hit"
    ],

    Era: [
      "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s",
      "Modern", "Futuristic", "Retro"
    ],

    Language: [
      "English", "Spanish", "French", "German", "Italian", "Portuguese",
      "Japanese", "Korean", "Latin", "Instrumental"
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
      "Dense Lyrics", "Short Lines", "Long Lines", "Nonlinear Story"
    ]
  },

  structureOptions: [
    "Intro", "Verse", "Pre-Chorus", "Chorus", "Post-Chorus", "Instrumental",
    "Drop", "Breakdown", "Bridge", "Solo", "Final Chorus", "Outro"
  ],

  recipes: [
    {
      name: "Dark Country",
      description: "Weathered, specific, and restrained",
      tags: ["Country", "Dark", "Raspy Vocals", "Acoustic Guitar", "Pedal Steel", "Raw Production", "Concrete Imagery", "Understated"],
      bpm: 82,
      energy: "medium"
    },
    {
      name: "Bluegrass Fire",
      description: "Fast acoustic picking and tight harmony",
      tags: ["Bluegrass", "Energetic", "Banjo", "Mandolin", "Fiddle", "Layered Harmonies", "Live Recording"],
      bpm: 150,
      energy: "high"
    },
    {
      name: "Neon Night",
      description: "Retro motion with modern low end",
      tags: ["Synthwave", "Nostalgic", "Analog Synth", "Synth Bass", "Wide Stereo", "1980s", "Conversational Lyrics"],
      bpm: 105,
      energy: "high"
    },
    {
      name: "Dream Pop",
      description: "Soft edges and suspended emotion",
      tags: ["Dream Pop", "Dreamy", "Airy Vocals", "Electric Guitar", "Shimmer Reverb", "Atmospheric", "Sparse Lyrics"],
      bpm: 92,
      energy: "low"
    },
    {
      name: "Dark Trap",
      description: "Heavy bass, menace, and sharp detail",
      tags: ["Dark Trap", "Aggressive", "Rap Vocals", "808 Bass", "Deep Bass", "Distorted", "Internal Rhyme", "Concrete Imagery"],
      bpm: 140,
      energy: "high"
    },
    {
      name: "Epic Trailer",
      description: "Large-scale cinematic rise",
      tags: ["Epic Orchestral", "Triumphant", "Strings", "Brass", "Choir", "Cinematic", "Impact Hit"],
      bpm: 110,
      energy: "explosive"
    },
    {
      name: "Desert Blues",
      description: "Dry heat, open space, damaged amplifiers",
      tags: ["Blues", "Restless", "Electric Guitar", "Live Drums", "Tape Saturation", "Concrete Imagery", "Loose Rhyme"],
      bpm: 96,
      energy: "medium"
    },
    {
      name: "Industrial Folk",
      description: "Human story inside mechanical noise",
      tags: ["Folk", "Industrial Metal", "Uneasy", "Acoustic Guitar", "Electronic Drums", "Distorted", "Narrative Lyrics", "Understated"],
      bpm: 118,
      energy: "high"
    }
  ],

  defaultStructure: [
    "Intro", "Verse", "Chorus", "Verse", "Chorus", "Bridge", "Final Chorus", "Outro"
  ],

  defaults: {
    bpm: 120,
    length: "standard",
    energy: "medium",
    songIdea: "",
    lyrics: "",
    selectedTags: []
  }
});
