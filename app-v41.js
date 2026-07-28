"use strict";

(() => {
  const STORAGE = Object.freeze({
    workspace: "forgeWorkspaceV4",
    accessCode: "forgeStudioRemoteAccessV41"
  });

  const state = {
    config: null,
    status: null,
    pollTimer: 0,
    starting: false
  };

  const nodes = {};

  function el(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function accessCode() {
    return localStorage.getItem(STORAGE.accessCode) || "";
  }

  function saveAccessCode(value) {
    const clean = String(value || "").trim();
    if (clean) localStorage.setItem(STORAGE.accessCode, clean);
    else localStorage.removeItem(STORAGE.accessCode);
  }

  function headers() {
    return {
      "Content-Type": "application/json",
      "x-forge-remote-key": accessCode()
    };
  }

  async function api(path, options = {}) {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  function money(value) {
    return `$${Number(value || 0).toFixed(2)}`;
  }

  function setMessage(message, kind = "") {
    nodes.message.textContent = message;
    nodes.message.className = `remote-message${kind ? ` ${kind}` : ""}`;
  }

  function setBusy(busy) {
    state.starting = busy;
    nodes.startBtn.disabled = busy || !state.config?.ready;
    nodes.stopBtn.disabled = busy || !state.status?.exists;
    nodes.checkBtn.disabled = busy;
  }

  function switchToRemote() {
    document.querySelector("#stemWorkspace")?.classList.add("workspace-hidden");
    document.querySelector("#generatorWorkspace")?.classList.add("workspace-hidden");
    document.querySelector(".bottom-bar")?.classList.add("workspace-hidden");
    document.querySelectorAll(".workspace-tab").forEach((tab) => tab.classList.remove("active"));
    nodes.remoteTab.classList.add("active");
    nodes.workspace.classList.remove("workspace-hidden");
    localStorage.setItem(STORAGE.workspace, "remote");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function leaveRemote() {
    nodes.workspace.classList.add("workspace-hidden");
    nodes.remoteTab.classList.remove("active");
  }

  function installTab() {
    const switcher = document.querySelector(".workspace-switcher");
    if (!switcher || switcher.querySelector('[data-workspace="remote"]')) return false;

    nodes.remoteTab = el("button", "workspace-tab", "Studio Remote");
    nodes.remoteTab.type = "button";
    nodes.remoteTab.dataset.workspace = "remote";
    nodes.remoteTab.addEventListener("click", switchToRemote);
    switcher.appendChild(nodes.remoteTab);

    switcher.querySelectorAll("button:not([data-workspace='remote'])").forEach((button) => {
      button.addEventListener("click", leaveRemote);
    });
    return true;
  }

  function buildStatusCard() {
    const card = el("section", "card remote-status-card");
    const heading = el("div", "section-heading");
    const copy = el("div");
    copy.append(el("p", "eyebrow", "ON-DEMAND COMPUTER"), el("h2", "", "Studio Remote Status"));
    nodes.checkBtn = el("button", "text-button", "Check Again");
    nodes.checkBtn.type = "button";
    nodes.checkBtn.addEventListener("click", refreshAll);
    heading.append(copy, nodes.checkBtn);

    nodes.message = el("p", "remote-message", "Checking the remote services...");
    nodes.serviceList = el("div", "remote-service-list");
    card.append(heading, nodes.message, nodes.serviceList);
    return card;
  }

  function buildControlCard() {
    const card = el("section", "card");
    const heading = el("div", "section-heading");
    const copy = el("div");
    copy.append(el("p", "eyebrow", "START / STOP"), el("h2", "", "Use Studio Only When You Need It"));
    heading.append(copy);

    const field = el("label", "field");
    field.appendChild(el("span", "", "Private Studio Remote access code"));
    nodes.accessInput = document.createElement("input");
    nodes.accessInput.type = "password";
    nodes.accessInput.autocomplete = "off";
    nodes.accessInput.value = accessCode();
    nodes.accessInput.placeholder = "Saved only on this phone";
    field.appendChild(nodes.accessInput);

    const save = el("button", "", "Save Code");
    save.type = "button";
    save.addEventListener("click", () => {
      saveAccessCode(nodes.accessInput.value);
      setMessage("Access code saved on this phone.", "ok");
      refreshStatus();
    });

    const accessRow = el("div", "remote-access-row");
    accessRow.append(field, save);

    const actions = el("div", "remote-actions");
    nodes.startBtn = el("button", "primary-button", "Start Studio Computer");
    nodes.startBtn.type = "button";
    nodes.startBtn.addEventListener("click", startRemote);

    nodes.openBtn = el("button", "secondary-button workspace-hidden", "Open Suno Studio");
    nodes.openBtn.type = "button";
    nodes.openBtn.addEventListener("click", openRemote);

    nodes.stopBtn = el("button", "danger-button", "Stop and Stop Billing");
    nodes.stopBtn.type = "button";
    nodes.stopBtn.addEventListener("click", stopRemote);

    actions.append(nodes.startBtn, nodes.openBtn, nodes.stopBtn);

    nodes.costText = el("p", "remote-cost");
    nodes.sessionText = el("p", "helper-text no-min-height", "Your Suno login and Chrome profile stay on a small persistent disk after the paid computer is destroyed.");
    card.append(heading, accessRow, actions, nodes.costText, nodes.sessionText);
    return card;
  }

  function buildProgressCard() {
    const card = el("section", "card remote-progress-card");
    const row = el("div", "remote-live-row");
    nodes.liveDot = el("span", "remote-live-dot");
    nodes.liveLabel = el("strong", "", "Stopped");
    nodes.liveDetail = el("small", "muted", "No paid computer is running.");
    row.append(nodes.liveDot, nodes.liveLabel, nodes.liveDetail);

    const track = el("div", "remote-progress-track");
    nodes.progress = el("div", "remote-progress-fill");
    track.appendChild(nodes.progress);

    card.append(row, track);
    return card;
  }

  function buildTouchCard() {
    const card = el("section", "card");
    const heading = el("div", "section-heading");
    const copy = el("div");
    copy.append(el("p", "eyebrow", "PHONE CONTROLS"), el("h2", "", "Built for Landscape Editing"));
    heading.append(copy);

    const grid = el("div", "remote-tip-grid");
    [
      ["Trackpad mode", "One finger moves the pointer. Tap to click. Two-finger drag scrolls the timeline."],
      ["Direct touch", "Switch to direct mode for large Studio buttons and clip dragging."],
      ["Right-click", "Long-press a clip to open Studio tools such as Remove FX and editing actions."],
      ["Keyboard", "Open the remote control panel for Space, Ctrl+E, Ctrl+Z, Delete, mute, and solo shortcuts."],
      ["Audio", "Keep Tailscale connected and use the HTTPS remote link so streamed Studio audio remains enabled."],
      ["Finish", "Return to Forge and tap Stop and Stop Billing when you are done."]
    ].forEach(([title, detail]) => {
      const item = el("div", "remote-tip");
      item.append(el("strong", "", title), el("p", "", detail));
      grid.appendChild(item);
    });

    const note = el("p", "remote-warning", "The first launch can take about two minutes while the computer installs and starts the remote Chrome container. Later launches reuse your persistent browser profile.");
    card.append(heading, grid, note);
    return card;
  }

  function buildWorkspace() {
    const generator = document.querySelector("#generatorWorkspace");
    if (!generator) return false;

    nodes.workspace = el("main", "remote-workspace workspace-hidden");
    nodes.workspace.id = "remoteWorkspace";

    const hero = el("section", "card remote-hero");
    const copy = el("div");
    copy.append(
      el("p", "eyebrow", "FORGE STUDIO V4.1"),
      el("h2", "", "Real Suno Studio. No desktop required."),
      el("p", "muted", "Forge starts a private browser computer near you, opens the full desktop Studio, and destroys the paid computer when you finish.")
    );
    const flow = el("div", "remote-flow");
    ["Start", "Connect", "Edit", "Export", "Stop billing"].forEach((step) => flow.appendChild(el("span", "", step)));
    hero.append(copy, flow);

    nodes.workspace.append(
      hero,
      buildStatusCard(),
      buildControlCard(),
      buildProgressCard(),
      buildTouchCard()
    );
    generator.insertAdjacentElement("beforebegin", nodes.workspace);
    return true;
  }

  function renderServices() {
    const config = state.config;
    nodes.serviceList.innerHTML = "";
    if (!config) return;

    const items = [
      ["Forge access lock", config.services?.accessCode],
      ["On-demand cloud computer", config.services?.digitalOcean],
      ["Private phone connection", config.services?.tailscale]
    ];

    items.forEach(([label, ready]) => {
      const row = el("div", "remote-service-row");
      row.append(
        el("span", `remote-ready-dot${ready ? " ready" : ""}`),
        el("strong", "", label),
        el("small", "muted", ready ? "Ready" : "Needs setup")
      );
      nodes.serviceList.appendChild(row);
    });

    nodes.costText.textContent = `Estimated computer cost: ${money(config.estimatedHourlyUsd)} per running hour. Persistent profile storage: about ${money(config.estimatedVolumeMonthlyUsd)} per month.`;
    nodes.startBtn.disabled = !config.ready || state.starting;

    if (config.ready) {
      setMessage("The control plane is ready. Start the Studio computer when you need it.", "ok");
    } else {
      setMessage("The Forge workspace is built. The listed private cloud settings must be connected once before the first session.", "warn");
    }
  }

  function renderStatus() {
    const status = state.status || { exists: false, status: "stopped", ready: false };
    const exists = Boolean(status.exists);
    nodes.stopBtn.disabled = !exists || state.starting;
    nodes.openBtn.classList.toggle("workspace-hidden", !status.ready);
    nodes.liveDot.className = `remote-live-dot${status.ready ? " ready" : exists ? " booting" : ""}`;
    nodes.liveLabel.textContent = status.ready ? "Studio Ready" : exists ? "Starting Studio" : "Stopped";

    if (status.ready) {
      nodes.liveDetail.textContent = "The private browser computer is running.";
      nodes.progress.style.width = "100%";
      nodes.progress.classList.remove("indeterminate");
      nodes.sessionText.textContent = "Open Studio, sign into Suno inside remote Chrome, then return here and stop the computer when finished.";
    } else if (exists) {
      const seconds = Number(status.bootSeconds || 0);
      nodes.liveDetail.textContent = `Booting · ${seconds}s elapsed`;
      nodes.progress.style.width = `${Math.min(92, 18 + seconds * 0.75)}%`;
      nodes.progress.classList.add("indeterminate");
    } else {
      nodes.liveDetail.textContent = "No paid computer is running.";
      nodes.progress.style.width = "0%";
      nodes.progress.classList.remove("indeterminate");
    }
  }

  async function loadConfig() {
    try {
      state.config = await api("/api/remote?action=config");
      renderServices();
    } catch (error) {
      setMessage(error.message, "error");
    }
  }

  async function refreshStatus() {
    if (!accessCode()) {
      state.status = { exists: false, status: "stopped", ready: false };
      renderStatus();
      return;
    }
    try {
      state.status = await api("/api/remote?action=status", { headers: { "x-forge-remote-key": accessCode() } });
      renderStatus();
      if (state.status.exists && !state.status.ready) schedulePoll();
    } catch (error) {
      setMessage(error.message, "error");
    }
  }

  async function refreshAll() {
    setBusy(true);
    await Promise.all([loadConfig(), refreshStatus()]);
    setBusy(false);
  }

  function schedulePoll() {
    clearTimeout(state.pollTimer);
    state.pollTimer = window.setTimeout(async () => {
      await refreshStatus();
    }, 5000);
  }

  async function startRemote() {
    if (!accessCode()) {
      setMessage("Enter and save the private Studio Remote access code first.", "error");
      return;
    }
    setBusy(true);
    setMessage("Creating the on-demand Studio computer...", "working");
    try {
      const data = await api("/api/remote?action=start", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ accessCode: accessCode() })
      });
      state.status = {
        exists: true,
        id: data.id,
        status: data.status,
        ready: false,
        bootSeconds: 0,
        sessionUrl: data.sessionUrl
      };
      renderStatus();
      setMessage("Computer created. Forge is installing private networking and remote Chrome.", "working");
      schedulePoll();
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  function openRemote() {
    const url = state.status?.sessionUrl || "https://forge-studio-remote:3001/";
    const opened = window.open(url, "_blank", "noopener");
    if (!opened) location.href = url;
  }

  async function stopRemote() {
    if (!state.status?.exists) return;
    setBusy(true);
    setMessage("Destroying the paid computer and preserving your browser profile...", "working");
    clearTimeout(state.pollTimer);
    try {
      await api("/api/remote?action=stop", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ id: state.status.id, accessCode: accessCode() })
      });
      state.status = { exists: false, status: "stopped", ready: false };
      renderStatus();
      setMessage("Studio computer stopped. Compute billing has ended; your browser profile remains saved.", "ok");
    } catch (error) {
      setMessage(error.message, "error");
    } finally {
      setBusy(false);
    }
  }

  function init() {
    if (document.documentElement.dataset.forgeV41 === "ready") return;
    if (document.documentElement.dataset.forgeV4 !== "ready") {
      window.setTimeout(init, 50);
      return;
    }
    if (!installTab() || !buildWorkspace()) {
      window.setTimeout(init, 50);
      return;
    }

    document.documentElement.dataset.forgeV41 = "ready";
    document.title = "Forge Studio v4.1";
    const topEyebrow = document.querySelector(".topbar .eyebrow");
    if (topEyebrow) topEyebrow.textContent = "MOBILE MUSIC WORKSTATION · V4.1";

    refreshAll();
    if (localStorage.getItem(STORAGE.workspace) === "remote") switchToRemote();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
