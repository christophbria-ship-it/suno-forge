import { spawnSync } from "node:child_process";

const files = [
  "data.js",
  "data-v32.js",
  "data-v33.js",
  "data-v34.js",
  "data-v35.js",
  "app-core.js",
  "app-editor.js",
  "app-actions.js",
  "app-storage.js",
  "app-v32.js",
  "app-v33.js",
  "app-v34.js",
  "app-v35.js",
  "app-v351.js",
  "app-v4.js",
  "app-v41.js",
  "app-v42.js",
  "app-v43.js",
  "app-v44.js",
  "app-v45.js",
  "app-v46.js",
  "app-v47.js",
  "app-v5.js",
  "app-v5-finish.js",
  "app-v5-clear.js",
  "app-v5-clean.js",
  "app-v5-flow.js",
  "app-v5-export.js",
  "app-v5-guide.js",
  "app-v5-disclosure.js",
  "app-v5-ai-actions.js",
  "app-v6-focus.js",
  "api/generate-lyrics.js",
  "api/generate-lyrics-v5.js",
  "api/generate-lyrics-v6.js",
  "api/ai-status.js",
  "api/stem-config.js",
  "api/stem-upload.js",
  "api/stem-start.js",
  "api/stem-status.js",
  "api/stem-cancel.js",
  "api/stem-cleanup.js",
  "api/remote.js"
];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Validated ${files.length} JavaScript files for deployment.`);
