import fs from "node:fs";

function replaceAll(path, replacements) {
  let content = fs.readFileSync(path, "utf8");
  for (const [from, to] of replacements) content = content.split(from).join(to);
  fs.writeFileSync(path, content);
}

replaceAll("prompt-app.js", [
  ["Forge allows up to", "The Simplest Prompt Maker allows up to"],
  ["Prompt forged locally.", "Prompt built locally."],
  ["Saved Forge preset", "Saved prompt preset"],
  ["Forge Studio Prompt Generator", "The Simplest Prompt Maker for AI Music"],
  ["forge-studio-backup-", "simplest-prompt-maker-backup-"],
  ["Forge Studio Prompt", "The Simplest Prompt Maker"]
]);

const stylePath = "prompt-style.css";
const marker = "/* Simplest Prompt Maker brand sizing */";
let style = fs.readFileSync(stylePath, "utf8");
if (!style.includes(marker)) {
  style += `\n${marker}\n.brand-name{max-width:245px;white-space:normal;line-height:1.06;font-size:.8rem;letter-spacing:.045em}\n.brand-subtitle{font-weight:800;letter-spacing:.09em}\n@media(max-width:640px){.brand-name{max-width:155px;font-size:.69rem}.brand-subtitle{display:block;font-size:.54rem}}\n@media(max-width:430px){.brand-name{max-width:132px;font-size:.62rem}.header-actions button{padding-inline:6px;font-size:.64rem}}\n`;
  fs.writeFileSync(stylePath, style);
}

console.log("Applied The Simplest Prompt Maker branding.");
