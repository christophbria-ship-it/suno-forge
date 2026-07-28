"use strict";

window.FORGE_V40 = Object.freeze({
  version: "4.0.0",
  workspaceKey: "forgeActiveWorkspaceV4",
  stemHistoryKey: "forgeStemHistoryV4",
  maxClientFileBytes: 200 * 1024 * 1024,
  acceptedExtensions: ["mp3", "wav", "m4a", "aac", "flac", "ogg", "opus", "webm"],
  targets: [
    { id: "vocals", label: "Vocals", description: "Remove lead and backing vocals", profiles: ["quick", "detail"] },
    { id: "drums", label: "Drums", description: "Remove the drum stem", profiles: ["quick", "detail"] },
    { id: "bass", label: "Bass", description: "Remove bass while keeping the rest", profiles: ["quick", "detail"] },
    { id: "guitar", label: "Guitar", description: "Remove the separated guitar stem", profiles: ["detail"] },
    { id: "piano", label: "Piano", description: "Remove the separated piano stem", profiles: ["detail"] },
    { id: "other", label: "Other", description: "Remove the combined remaining stem", profiles: ["quick", "detail"] }
  ],
  profiles: [
    {
      id: "quick",
      label: "Quick · 4 stems",
      model: "htdemucs",
      helper: "Vocals, drums, bass, and other. Faster and usually cleaner for broad removal."
    },
    {
      id: "detail",
      label: "Detailed · 6 stems",
      model: "htdemucs_6s",
      helper: "Adds guitar and piano separation. Slower and may create more artifacts."
    }
  ],
  stages: [
    { id: "uploading", label: "Upload" },
    { id: "queued", label: "Queue" },
    { id: "separating", label: "Separate" },
    { id: "mixing", label: "Subtract" },
    { id: "finalizing", label: "Finalize" },
    { id: "complete", label: "Ready" }
  ]
});
