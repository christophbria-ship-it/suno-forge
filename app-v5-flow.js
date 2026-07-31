"use strict";

(() => {
  let pendingAdvance = null;

  function briefInput() {
    return document.querySelector(".v5-brief-field textarea, .v5-brief-card textarea");
  }

  function soundTab() {
    return [...document.querySelectorAll(".v5-mode-tab")].find((tab) => /^sound$/i.test(tab.textContent.trim()))
      || document.querySelectorAll(".v5-mode-tab")[1]
      || null;
  }

  function buildFailed() {
    const errorPanel = document.getElementById("errorPanel");
    if (errorPanel && !errorPanel.classList.contains("hidden")) return true;
    const toast = document.getElementById("toast");
    const message = toast?.classList.contains("show") ? toast.textContent.trim() : "";
    return /error|failed|could not|required|describe/i.test(message);
  }

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

  function advanceToSound() {
    const tab = soundTab();
    if (!tab || tab.classList.contains("active")) return;
    tab.click();
    window.requestAnimationFrame(() => {
      document.querySelector(".v5-mode-tabs")?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    notify("Starting point built. Review your sound.");
  }

  function waitForBuild(button) {
    if (pendingAdvance) window.clearInterval(pendingAdvance);
    const started = Date.now();
    pendingAdvance = window.setInterval(() => {
      if (buildFailed()) {
        window.clearInterval(pendingAdvance);
        pendingAdvance = null;
        return;
      }
      if (!button.isConnected || Date.now() - started > 5000) {
        window.clearInterval(pendingAdvance);
        pendingAdvance = null;
        return;
      }
      if (!button.disabled && Date.now() - started >= 250) {
        window.clearInterval(pendingAdvance);
        pendingAdvance = null;
        advanceToSound();
      }
    }, 100);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".v5-primary-hero");
    if (!button || !/build my starting point/i.test(button.textContent)) return;
    const input = briefInput();
    if (!input || !input.value.trim()) return;
    waitForBuild(button);
  }, true);
})();
