"use strict";

const STRUCTURE_LIBRARY = Object.freeze({
  basicSections: [
    "Intro",
    "Verse",
    "Pre-Chorus",
    "Chorus",
    "Post-Chorus",
    "Refrain",
    "Hook",
    "Bridge",
    "Breakdown",
    "Drop",
    "Instrumental",
    "Solo",
    "Final Chorus",
    "Outro",
    "Coda"
  ],

  defaultStructure: [
    "Intro",
    "Verse 1",
    "Pre-Chorus",
    "Chorus",
    "Verse 2",
    "Pre-Chorus",
    "Chorus",
    "Bridge",
    "Outro"
  ],

  families: [
    {
      label: "Structure & Form",
      tags: [
        "Instrumental Intro", "Cold Open", "Intro Tease", "Verse", "Verse 1", "Verse 2",
        "Pre-Chorus", "Chorus", "Post-Chorus", "Refrain", "Hook", "Bridge", "Middle 8",
        "Break", "Breakdown", "Drop", "Instrumental Interlude", "Interlude", "Solo",
        "Final Chorus", "Outro", "Coda", "Tag Ending", "Vamp"
      ]
    },
    {
      label: "Instrumentals & Solos",
      tags: [
        "Instrumental Break", "Instrumental Verse", "Instrumental Chorus", "Bass Solo", "Guitar Solo",
        "Acoustic Guitar Solo", "Electric Guitar Solo", "Piano Solo", "Rhodes Solo", "Hammond Organ Solo",
        "Synth Solo", "Sax Solo", "Trumpet Solo", "Violin Solo", "Cello Solo", "Drum Solo",
        "Percussion Solo", "Banjo Solo", "Mandolin Solo", "Harmonica Solo", "Pedal Steel Solo",
        "Orchestral Interlude", "Ambient Interlude", "Drum Break"
      ]
    },
    {
      label: "Energy & Movement",
      tags: [
        "Slow Build", "Build", "Gradual Build", "Crescendo", "Diminuendo", "Climax",
        "Explosive Chorus", "Stripped Verse", "Half-Time", "Double-Time", "Tempo Drop", "Tempo Lift",
        "Dynamic Swell", "Sudden Stop", "Full Band Hit", "Drop to Silence", "Quiet Breakdown",
        "Heavy Breakdown", "Massive Drop", "Final Lift", "Soft-to-Loud Build", "Dynamic Swells"
      ]
    },
    {
      label: "Vocals & Harmony",
      tags: [
        "A Cappella", "Spoken Word", "Whispered Vocals", "Breathy Vocals", "Falsetto",
        "Belted Vocals", "Screamed Vocals", "Growled Vocals", "Choir", "Gospel Choir", "Gang Vocals",
        "Call and Response", "Vocal Harmony", "Stacked Harmonies", "Background Oohs", "Background Aahs",
        "Ad-Libs", "Vocal Runs", "Wordless Vocals", "Crowd Chant", "Audience Singalong",
        "Male-Female Duet", "Solo Vocal", "Vocal Dropout"
      ]
    },
    {
      label: "Arrangement & Entrances",
      tags: [
        "Full Band", "Stripped Back", "Acoustic Only", "Drums Enter", "Bass Enters", "Guitar Enters",
        "Piano Enters", "Synth Enters", "Strings Enter", "Brass Enters", "Choir Enters", "Percussion Enters",
        "Kick Drops Out", "Drums Drop Out", "Bass Dropout", "Guitar Dropout", "Instrumental Dropout",
        "Layer-by-Layer Build", "Sudden Full Arrangement", "Solo Spotlight", "Orchestra Swell", "Unison Hit",
        "Drumless Verse", "Full-Band Dropout"
      ]
    },
    {
      label: "Transitions",
      tags: [
        "Transition", "Break", "Pause", "Stop-Time", "Drum Fill", "Riser", "Downlifter",
        "Reverse Cymbal", "Impact Hit", "Key Change", "Modulation", "Beat Switch", "Time Signature Change",
        "Filter Sweep", "Tape Stop", "Vinyl Stop", "Glitch Cut", "Silence Break", "Reverb Tail",
        "Feedback Swell", "Pre-Chorus Tension", "Bridge Modulation"
      ]
    },
    {
      label: "Endings",
      tags: [
        "Fade Out", "Hard Stop", "Abrupt Ending", "Final Hit", "Final Chord", "Resolved Ending",
        "Unresolved Ending", "Extended Outro", "Ambient Outro", "Looped Outro", "Vocal Outro",
        "Instrumental Outro", "Hidden Coda", "Tag Ending", "Vamp Outro", "False Ending", "Final Key Change"
      ]
    },
    {
      label: "Effects & Texture",
      tags: [
        "Reverb", "Delay", "Echo", "Distortion", "Fuzz", "Overdrive", "Lo-Fi", "Vinyl Texture",
        "Tape Saturation", "Telephone Filter", "Radio Filter", "Filtered", "Ambient", "Atmospheric",
        "Sparse", "Dense", "Wide Stereo", "Mono", "Dry", "Wet", "Shimmer Reverb", "Gated Reverb",
        "Reverse Reverb", "Bitcrusher", "Vocoder", "Talk Box"
      ]
    }
  ]
});

globalThis.STRUCTURE_LIBRARY = STRUCTURE_LIBRARY;
