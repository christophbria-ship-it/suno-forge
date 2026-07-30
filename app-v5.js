"use strict";

(async () => {
  try {
    const response = await fetch("app-v5-core.txt?v=5.0.0", { cache: "no-store" });
    if (!response.ok) throw new Error(`Forge v5 core failed (${response.status})`);
    const encoded = (await response.text()).replace(/\s+/g, "");
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    if (!("DecompressionStream" in window)) throw new Error("This browser needs a current Chrome, Edge, or Safari version for Forge v5.");
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    const source = await new Response(stream).text();
    (0, eval)(`${source}\n//# sourceURL=forge-app-v5-core.js`);
  } catch (error) {
    console.error("Forge v5 failed to start", error);
    document.documentElement.dataset.forgeV5 = "error";
    if (typeof reportError === "function") reportError(error, "Forge v5 startup");
  }
})();
