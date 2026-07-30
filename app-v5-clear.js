"use strict";

(() => {
  let installed = false;

  function notify(message) {
    if (typeof showToast === "function") {
      showToast(message);
      return;
    }
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function clickControl(id, successMessage) {
    const control = document.getElementById(id);
    if (!control) {
      notify("That clear action is unavailable.");
      return false;
    }
    control.click();
    notify(successMessage);
    return true;
  }

  function clearOutput() {
    try {
      if (typeof snapshot === "function") snapshot();
      if (typeof state !== "undefined") {
        state.output = "";
        state.favorite = false;
      }
      const output = document.getElementById("promptOutput");
      if (output) output.value = "";
      if (typeof saveAll === "function") saveAll({ immediate: true });
      if (typeof syncControls === "function") syncControls(false);
      notify("Export cleared");
      return true;
    } catch (error) {
      console.error("Forge clear output failed", error);
      notify("Export could not be cleared.");
      return false;
    }
  }

  function buildDialog() {
    let dialog = document.getElementById("forgeClearDialog");
    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "forgeClearDialog";
    dialog.className = "v5-clear-dialog";
    dialog.innerHTML = `
      <form method="dialog" class="v5-clear-shell">
        <div class="v5-clear-header">
          <div>
            <span>PROJECT CONTROLS</span>
            <h2>Clear or reset</h2>
          </div>
          <button value="cancel" type="submit" aria-label="Close">×</button>
        </div>
        <p class="v5-clear-copy">Clear one part of the project without deleting everything.</p>
        <div class="v5-clear-grid">
          <button type="button" data-clear-action="sound"><strong>Clear Sound</strong><small>Remove all selected genres, instruments, vocals, moods, and production tags.</small></button>
          <button type="button" data-clear-action="lyrics"><strong>Clear Lyrics</strong><small>Remove the Writing Room draft while keeping the sound and arrangement.</small></button>
          <button type="button" data-clear-action="output"><strong>Clear Export</strong><small>Remove the compiled prompt without changing the project.</small></button>
          <button type="button" data-clear-action="history"><strong>Clear History</strong><small>Remove saved prompt history. Presets remain separate.</small></button>
        </div>
        <button class="v5-clear-reset" type="button" data-clear-action="reset"><strong>Start New Project</strong><small>Reset sound, Track DNA, arrangement, lyrics, and output.</small></button>
      </form>`;

    dialog.addEventListener("click", (event) => {
      const action = event.target.closest("[data-clear-action]")?.dataset.clearAction;
      if (!action) return;
      let completed = false;
      if (action === "sound") completed = clickControl("clearSelectionsBtn", "Sound cleared");
      if (action === "lyrics") completed = clickControl("clearLyricsBtn", "Lyrics cleared");
      if (action === "output") completed = clearOutput();
      if (action === "history") completed = clickControl("clearHistoryBtn", "History cleared");
      if (action === "reset") completed = clickControl("resetBtn", "New project started");
      if (completed && dialog.open) dialog.close();
    });

    document.body.appendChild(dialog);
    return dialog;
  }

  function openDialog() {
    const dialog = buildDialog();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function install() {
    if (installed && document.getElementById("forgeClearBtn")) return true;
    const actions = document.querySelector(".topbar .header-actions") || document.querySelector(".topbar");
    if (!actions) return false;
    let button = document.getElementById("forgeClearBtn");
    if (!button) {
      button = document.createElement("button");
      button.id = "forgeClearBtn";
      button.type = "button";
      button.className = "v5-clear-button";
      button.textContent = "Clear";
      button.title = "Clear part of the current project";
      button.setAttribute("aria-haspopup", "dialog");
      button.addEventListener("click", openDialog);
      actions.appendChild(button);
    }
    installed = true;
    return true;
  }

  function init() {
    install();
    const observer = new MutationObserver(install);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
