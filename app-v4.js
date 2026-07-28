"use strict";

(() => {
  const STORAGE = Object.freeze({
    workspace: "forgeWorkspaceV4",
    accessCode: "forgeStemAccessCodeV4",
    history: "forgeStemHistoryV4"
  });

  const TARGETS = [
    ["vocals", "Vocals", "lead and backing voices"],
    ["lead vocals", "Lead vocal", "main singer only"],
    ["backing vocals", "Backing vocals", "harmonies and background voices"],
    ["drums", "Drums", "full drum kit"],
    ["percussion", "Percussion", "shakers, tambourine, hand percussion"],
    ["bass guitar", "Bass", "bass guitar or low bass part"],
    ["electric guitar", "Electric guitar", "general electric guitar"],
    ["lead guitar", "Lead guitar", "solos and lead phrases"],
    ["distorted guitar", "Distorted guitar", "heavy or overdriven guitar"],
    ["acoustic guitar", "Acoustic guitar", "strummed or picked acoustic"],
    ["piano", "Piano", "acoustic piano"],
    ["synthesizer", "Synth", "synth pads, leads, or arpeggios"],
    ["string section", "Strings", "violin, viola, and cello ensemble"],
    ["violin", "Violin", "violin part"],
    ["brass section", "Brass", "trumpets, trombones, and horns"],
    ["saxophone", "Saxophone", "saxophone part"]
  ];

  const stateV4 = {
    file: null,
    objectUrl: "",
    uploadedUrl: "",
    predictionId: "",
    target: "vocals",
    pollTimer: 0,
    running: false,
    config: null,
    result: null
  };

  const nodes = {};

  function el(tag, className = "", text = "") {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function safeText(value) {
    return String(value || "").replace(/[<>]/g, "");
  }

  function safeFileName(name) {
    return String(name || "audio")
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 90) || "audio";
  }

  function formatBytes(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024) return `${value} B`;
    if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / 1024 ** 2).toFixed(1)} MB`;
  }

  function getAccessCode() {
    return localStorage.getItem(STORAGE.accessCode) || "";
  }

  function setAccessCode(value) {
    const clean = String(value || "").trim();
    if (clean) localStorage.setItem(STORAGE.accessCode, clean);
    else localStorage.removeItem(STORAGE.accessCode);
  }

  function authHeaders(extra = {}) {
    return {
      "Content-Type": "application/json",
      "x-forge-stem-key": getAccessCode(),
      ...extra
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

  function setProgress(percent, message, status = "processing") {
    const value = Math.max(0, Math.min(100, Number(percent) || 0));
    nodes.progressCard.classList.remove("workspace-hidden");
    nodes.progressFill.classList.remove("indeterminate");
    nodes.progressFill.style.width = `${value}%`;
    nodes.progressText.textContent = message;
    nodes.progressBadge.textContent = status;
    nodes.progressBadge.className = `stem-status-badge ${status}`;
  }

  function setIndeterminate(message, status = "processing") {
    nodes.progressCard.classList.remove("workspace-hidden");
    nodes.progressFill.style.width = "42%";
    nodes.progressFill.classList.add("indeterminate");
    nodes.progressText.textContent = message;
    nodes.progressBadge.textContent = status;
    nodes.progressBadge.className = `stem-status-badge ${status}`;
  }

  function showStemError(error) {
    const message = error?.message || String(error || "Unknown stem error");
    nodes.progressCard.classList.remove("workspace-hidden");
    nodes.progressFill.classList.remove("indeterminate");
    nodes.progressFill.style.width = "100%";
    nodes.progressText.textContent = message;
    nodes.progressText.classList.add("stem-error");
    nodes.progressBadge.textContent = "failed";
    nodes.progressBadge.className = "stem-status-badge failed";
    nodes.cancelBtn.classList.add("workspace-hidden");
    nodes.runBtn.disabled = false;
    stateV4.running = false;
  }

  function clearStemError() {
    nodes.progressText.classList.remove("stem-error");
  }

  function switchWorkspace(name) {
    const stemActive = name !== "generator";
    nodes.stemTab.classList.toggle("active", stemActive);
    nodes.generatorTab.classList.toggle("active", !stemActive);
    nodes.stemWorkspace.classList.toggle("workspace-hidden", !stemActive);
    nodes.generatorWorkspace.classList.toggle("workspace-hidden", stemActive);
    nodes.bottomBar?.classList.toggle("workspace-hidden", stemActive);
    localStorage.setItem(STORAGE.workspace, stemActive ? "stems" : "generator");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function buildSwitcher(topbar) {
    const switcher = el("div", "workspace-switcher");
    nodes.stemTab = el("button", "workspace-tab active", "Remove Instrument");
    nodes.generatorTab = el("button", "workspace-tab", "Generator");
    nodes.stemTab.type = "button";
    nodes.generatorTab.type = "button";
    nodes.stemTab.addEventListener("click", () => switchWorkspace("stems"));
    nodes.generatorTab.addEventListener("click", () => switchWorkspace("generator"));
    switcher.append(nodes.stemTab, nodes.generatorTab);
    topbar.insertAdjacentElement("afterend", switcher);
  }

  function buildSetupCard() {
    const card = el("section", "card stem-setup");
    nodes.setupCard = card;
    const heading = el("div", "section-heading");
    const copy = el("div");
    copy.append(el("p", "eyebrow", "STEM ENGINE"), el("h2", "", "Service Status"));
    nodes.refreshConfigBtn = el("button", "text-button", "Check Again");
    nodes.refreshConfigBtn.type = "button";
    nodes.refreshConfigBtn.addEventListener("click", loadConfig);
    heading.append(copy, nodes.refreshConfigBtn);
    nodes.setupMessage = el("p", "helper-text no-min-height", "Checking the upload and GPU services...");
    nodes.setupList = el("div", "stem-setup-list");
    card.append(heading, nodes.setupMessage, nodes.setupList);
    return card;
  }

  function buildUploadCard() {
    const card = el("section", "card");
    const heading = el("div", "section-heading");
    const copy = el("div");
    copy.append(el("p", "eyebrow", "STEP 1"), el("h2", "", "Choose a Song"));
    heading.append(copy);

    nodes.uploadZone = el("label", "stem-upload-zone");
    const icon = el("div", "stem-upload-icon", "＋");
    const title = el("strong", "", "Tap to choose audio");
    const help = el("p", "helper-text no-min-height", "MP3, WAV, FLAC, M4A, AAC, or OGG · up to 100 MB");
    nodes.fileInput = document.createElement("input");
    nodes.fileInput.type = "file";
    nodes.fileInput.accept = "audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg";
    nodes.fileInput.addEventListener("change", () => selectFile(nodes.fileInput.files?.[0]));
    nodes.uploadZone.append(icon, title, help, nodes.fileInput);

    ["dragenter", "dragover"].forEach((eventName) => {
      nodes.uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        nodes.uploadZone.classList.add("dragover");
      });
    });
    ["dragleave", "drop"].forEach((eventName) => {
      nodes.uploadZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        nodes.uploadZone.classList.remove("dragover");
      });
    });
    nodes.uploadZone.addEventListener("drop", (event) => selectFile(event.dataTransfer?.files?.[0]));

    nodes.fileMeta = el("div", "stem-file-meta workspace-hidden");
    nodes.fileName = el("strong");
    nodes.fileDetails = el("small", "muted");
    nodes.sourcePlayer = document.createElement("audio");
    nodes.sourcePlayer.controls = true;
    nodes.sourcePlayer.preload = "metadata";
    nodes.sourcePlayer.className = "workspace-hidden";
    nodes.fileMeta.append(nodes.fileName, nodes.fileDetails);
    card.append(heading, nodes.uploadZone, nodes.fileMeta, nodes.sourcePlayer);
    return card;
  }

  function buildTargetCard() {
    const card = el("section", "card");
    const heading = el("div", "section-heading");
    const copy = el("div");
    copy.append(el("p", "eyebrow", "STEP 2"), el("h2", "", "What Should Be Removed?"));
    heading.append(copy);
    nodes.targetGrid = el("div", "stem-target-grid");

    TARGETS.forEach(([value, label, detail], index) => {
      const button = el("button", `stem-target${index === 0 ? " active" : ""}`);
      button.type = "button";
      button.dataset.target = value;
      button.append(el("strong", "", label), el("small", "", detail));
      button.addEventListener("click", () => chooseTarget(value, button));
      nodes.targetGrid.appendChild(button);
    });

    const custom = el("label", "field");
    custom.appendChild(el("span", "", "Custom instrument or sound"));
    nodes.targetInput = document.createElement("input");
    nodes.targetInput.type = "text";
    nodes.targetInput.maxLength = 120;
    nodes.targetInput.value = "vocals";
    nodes.targetInput.placeholder = "Example: harpsichord, slide guitar, hand claps, crowd noise";
    nodes.targetInput.addEventListener("input", () => {
      stateV4.target = nodes.targetInput.value.trim();
      nodes.targetGrid.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item.dataset.target === stateV4.target));
    });
    custom.appendChild(nodes.targetInput);

    card.append(heading, nodes.targetGrid, custom);
    return card;
  }

  function buildSettingsCard() {
    const card = el("section", "card");
    const heading = el("div", "section-heading");
    const copy = el("div");
    copy.append(el("p", "eyebrow", "STEP 3"), el("h2", "", "Quality & Access"));
    heading.append(copy);

    const grid = el("div", "stem-control-grid");
    const quality = el("label", "field");
    quality.appendChild(el("span", "", "Separation quality"));
    nodes.qualitySelect = document.createElement("select");
    nodes.qualitySelect.innerHTML = '<option value="best">Best · SAM Audio Large</option><option value="fast">Fast · SAM Audio Base</option>';
    quality.appendChild(nodes.qualitySelect);

    const spans = el("label", "toggle-field");
    nodes.predictSpans = document.createElement("input");
    nodes.predictSpans.type = "checkbox";
    spans.append(nodes.predictSpans, document.createTextNode(" Auto-detect where the instrument appears"));

    const accessWrap = el("div", "stem-access-row full");
    const accessField = el("label", "field");
    accessField.appendChild(el("span", "", "Private stem access code"));
    nodes.accessInput = document.createElement("input");
    nodes.accessInput.type = "password";
    nodes.accessInput.autocomplete = "off";
    nodes.accessInput.placeholder = "Saved only on this phone";
    nodes.accessInput.value = getAccessCode();
    accessField.appendChild(nodes.accessInput);
    nodes.saveAccessBtn = el("button", "", "Save");
    nodes.saveAccessBtn.type = "button";
    nodes.saveAccessBtn.addEventListener("click", () => {
      setAccessCode(nodes.accessInput.value);
      showToast?.("Stem access code saved on this device");
    });
    accessWrap.append(accessField, nodes.saveAccessBtn);

    grid.append(quality, spans, accessWrap);
    nodes.runBtn = el("button", "primary-button stem-run-button", "Remove Selected Instrument");
    nodes.runBtn.type = "button";
    nodes.runBtn.addEventListener("click", runStemJob);
    const warning = el("p", "stem-warning", "The uploaded song is temporarily public so the GPU service can read it. Forge deletes the upload after processing. Only process audio you own or have permission to edit.");
    card.append(heading, grid, nodes.runBtn, warning);
    return card;
  }

  function buildProgressCard() {
    const card = el("section", "card stem-progress-card workspace-hidden");
    nodes.progressCard = card;
    const statusRow = el("div", "stem-status-row");
    nodes.progressText = el("strong", "", "Waiting");
    nodes.progressBadge = el("span", "stem-status-badge", "idle");
    statusRow.append(nodes.progressText, nodes.progressBadge);
    const track = el("div", "stem-progress-track");
    nodes.progressFill = el("div", "stem-progress-fill");
    track.appendChild(nodes.progressFill);
    nodes.cancelBtn = el("button", "text-button danger-text workspace-hidden", "Cancel Job");
    nodes.cancelBtn.type = "button";
    nodes.cancelBtn.addEventListener("click", cancelJob);
    card.append(statusRow, track, nodes.cancelBtn);
    return card;
  }

  function buildResultsCard() {
    const card = el("section", "card workspace-hidden");
    nodes.resultsCard = card;
    const heading = el("div", "section-heading");
    const copy = el("div");
    copy.append(el("p", "eyebrow", "RESULT"), el("h2", "", "Original vs. Subtracted Mix"));
    nodes.newJobBtn = el("button", "text-button", "New Job");
    nodes.newJobBtn.type = "button";
    nodes.newJobBtn.addEventListener("click", resetStemJob);
    heading.append(copy, nodes.newJobBtn);

    const grid = el("div", "stem-player-grid");
    const removed = el("div", "stem-player");
    removed.append(el("h3", "", "Removed Instrument"), el("p", "helper-text no-min-height", "Use this to hear what Forge identified."));
    nodes.targetPlayer = document.createElement("audio");
    nodes.targetPlayer.controls = true;
    nodes.targetPlayer.preload = "metadata";
    removed.appendChild(nodes.targetPlayer);

    const result = el("div", "stem-player");
    result.append(el("h3", "", "Song Without It"), el("p", "helper-text no-min-height", "This is the mix you asked for."));
    nodes.residualPlayer = document.createElement("audio");
    nodes.residualPlayer.controls = true;
    nodes.residualPlayer.preload = "metadata";
    result.appendChild(nodes.residualPlayer);
    grid.append(removed, result);

    const actions = el("div", "stem-result-actions");
    nodes.downloadResidual = el("a", "stem-download primary", "Download Edited Mix");
    nodes.downloadResidual.target = "_blank";
    nodes.downloadResidual.rel = "noopener";
    nodes.downloadTarget = el("a", "stem-download", "Download Removed Stem");
    nodes.downloadTarget.target = "_blank";
    nodes.downloadTarget.rel = "noopener";
    actions.append(nodes.downloadResidual, nodes.downloadTarget);
    const expiry = el("p", "stem-warning", "Download the files now. GPU output links are temporary and normally expire in about one hour.");
    card.append(heading, grid, actions, expiry);
    return card;
  }

  function buildHistoryCard() {
    const card = el("section", "card");
    const heading = el("div", "section-heading");
    const copy = el("div");
    copy.append(el("p", "eyebrow", "RECENT JOBS"), el("h2", "", "Stem History"));
    nodes.clearStemHistory = el("button", "text-button danger-text", "Clear");
    nodes.clearStemHistory.type = "button";
    nodes.clearStemHistory.addEventListener("click", () => {
      localStorage.removeItem(STORAGE.history);
      renderStemHistory();
    });
    heading.append(copy, nodes.clearStemHistory);
    nodes.historyList = el("div", "stem-history-list");
    card.append(heading, nodes.historyList);
    return card;
  }

  function buildStemWorkspace(generatorWorkspace) {
    const workspace = el("main", "stem-workspace");
    workspace.id = "stemWorkspace";
    nodes.stemWorkspace = workspace;

    const hero = el("section", "card stem-hero");
    const heroCopy = el("div");
    heroCopy.append(
      el("p", "eyebrow", "FORGE STUDIO V4"),
      el("h2", "", "Take an instrument out. Keep the song."),
      el("p", "muted", "Upload from your phone, describe the instrument or sound, let the GPU separate it, then preview and download the remaining mix.")
    );
    const flow = el("div", "stem-flow");
    ["Upload", "Choose target", "Separate", "Preview", "Download"].forEach((step) => flow.appendChild(el("span", "", step)));
    hero.append(heroCopy, flow);

    workspace.append(
      hero,
      buildSetupCard(),
      buildUploadCard(),
      buildTargetCard(),
      buildSettingsCard(),
      buildProgressCard(),
      buildResultsCard(),
      buildHistoryCard()
    );
    generatorWorkspace.insertAdjacentElement("beforebegin", workspace);
  }

  function chooseTarget(value, button) {
    stateV4.target = value;
    nodes.targetInput.value = value;
    nodes.targetGrid.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
  }

  function selectFile(file) {
    if (!file) return;
    const max = stateV4.config?.maxFileBytes || 100 * 1024 * 1024;
    if (file.size > max) {
      showStemError(new Error(`That file is ${formatBytes(file.size)}. Forge currently accepts up to ${formatBytes(max)}.`));
      return;
    }
    if (stateV4.objectUrl) URL.revokeObjectURL(stateV4.objectUrl);
    stateV4.file = file;
    stateV4.objectUrl = URL.createObjectURL(file);
    stateV4.uploadedUrl = "";
    nodes.fileMeta.classList.remove("workspace-hidden");
    nodes.fileName.textContent = file.name;
    nodes.fileDetails.textContent = `${formatBytes(file.size)} · ${file.type || "audio file"}`;
    nodes.sourcePlayer.src = stateV4.objectUrl;
    nodes.sourcePlayer.classList.remove("workspace-hidden");
    nodes.resultsCard.classList.add("workspace-hidden");
    nodes.progressCard.classList.add("workspace-hidden");
  }

  function renderConfig() {
    const config = stateV4.config;
    nodes.setupList.innerHTML = "";
    if (!config) return;
    const entries = [
      ["Private access code", config.services?.accessCode],
      ["Phone upload storage", config.services?.blob],
      ["GPU separation service", config.services?.replicate]
    ];
    entries.forEach(([label, ready]) => {
      const row = el("div", "stem-setup-row");
      row.append(el("span", `stem-ready-dot${ready ? " ready" : ""}`), el("strong", "", label), el("small", "muted", ready ? "Ready" : "Needs setup"));
      nodes.setupList.appendChild(row);
    });
    nodes.setupCard.classList.toggle("ready", config.ready);
    nodes.setupMessage.textContent = config.ready
      ? "Upload and GPU processing are ready."
      : "The workstation is built, but the missing server settings below must be added in Vercel before paid GPU jobs can run.";
    nodes.runBtn.disabled = !config.ready || stateV4.running;
  }

  async function loadConfig() {
    nodes.refreshConfigBtn.disabled = true;
    try {
      stateV4.config = await api("/api/stem-config");
      renderConfig();
    } catch (error) {
      nodes.setupMessage.textContent = error.message;
    } finally {
      nodes.refreshConfigBtn.disabled = false;
    }
  }

  async function uploadAudio() {
    if (stateV4.uploadedUrl) return stateV4.uploadedUrl;
    if (!stateV4.file) throw new Error("Choose an audio file first.");
    const accessCode = getAccessCode();
    if (!accessCode) throw new Error("Enter and save the private stem access code first.");

    setProgress(5, "Preparing phone upload");
    const { upload } = await import("https://esm.sh/@vercel/blob@2.6.1/client");
    const path = `forge-stems/input/${Date.now()}-${safeFileName(stateV4.file.name)}`;
    const blob = await upload(path, stateV4.file, {
      access: "public",
      handleUploadUrl: "/api/stem-upload",
      clientPayload: JSON.stringify({ accessCode }),
      multipart: true,
      contentType: stateV4.file.type || undefined,
      onUploadProgress: ({ percentage }) => {
        setProgress(5 + (Math.max(0, Math.min(100, percentage)) * 0.35), `Uploading from phone · ${Math.round(percentage)}%`);
      }
    });
    stateV4.uploadedUrl = blob.url;
    return blob.url;
  }

  async function runStemJob() {
    if (stateV4.running) return;
    clearStemError();
    if (!stateV4.config?.ready) {
      showStemError(new Error("The stem engine server settings are not ready yet."));
      return;
    }
    if (!stateV4.file) {
      showStemError(new Error("Choose an audio file first."));
      return;
    }
    const target = nodes.targetInput.value.trim();
    if (!target) {
      showStemError(new Error("Choose or describe the instrument to remove."));
      return;
    }

    stateV4.running = true;
    nodes.runBtn.disabled = true;
    nodes.resultsCard.classList.add("workspace-hidden");
    nodes.cancelBtn.classList.add("workspace-hidden");

    try {
      const audioUrl = await uploadAudio();
      setProgress(44, `Sending “${safeText(target)}” to the separation engine`);
      const job = await api("/api/stem-start", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          audioUrl,
          target,
          quality: nodes.qualitySelect.value,
          predictSpans: nodes.predictSpans.checked
        })
      });
      stateV4.predictionId = job.id;
      stateV4.target = target;
      nodes.cancelBtn.classList.remove("workspace-hidden");
      setIndeterminate("GPU is identifying and subtracting the selected sound");
      pollJob();
    } catch (error) {
      showStemError(error);
      await cleanupUpload();
    }
  }

  async function pollJob() {
    clearTimeout(stateV4.pollTimer);
    if (!stateV4.predictionId) return;
    try {
      const result = await api(`/api/stem-status?id=${encodeURIComponent(stateV4.predictionId)}`, {
        headers: { "x-forge-stem-key": getAccessCode() }
      });
      if (["starting", "processing"].includes(result.status)) {
        setIndeterminate(result.status === "starting" ? "Starting the GPU worker" : "Separating the target from the rest of the song");
        stateV4.pollTimer = window.setTimeout(pollJob, 2200);
        return;
      }
      if (result.status === "succeeded" && result.residualUrl) {
        finishJob(result);
        return;
      }
      throw new Error(result.error || `Stem job ended with status: ${result.status}`);
    } catch (error) {
      showStemError(error);
      await cleanupUpload();
    }
  }

  function finishJob(result) {
    stateV4.running = false;
    stateV4.result = result;
    nodes.runBtn.disabled = !stateV4.config?.ready;
    nodes.cancelBtn.classList.add("workspace-hidden");
    setProgress(100, `${stateV4.target} removed`, "succeeded");
    nodes.targetPlayer.src = result.targetUrl || "";
    nodes.residualPlayer.src = result.residualUrl;
    nodes.downloadTarget.href = result.targetUrl || result.residualUrl;
    nodes.downloadResidual.href = result.residualUrl;
    nodes.downloadTarget.download = `${safeFileName(stateV4.file?.name || "song")}-${safeFileName(stateV4.target)}-removed-stem.wav`;
    nodes.downloadResidual.download = `${safeFileName(stateV4.file?.name || "song")}-without-${safeFileName(stateV4.target)}.wav`;
    nodes.resultsCard.classList.remove("workspace-hidden");
    saveStemHistory(result);
    cleanupUpload();
    nodes.resultsCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function cancelJob() {
    if (!stateV4.predictionId) return;
    nodes.cancelBtn.disabled = true;
    try {
      await api("/api/stem-cancel", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id: stateV4.predictionId })
      });
      setProgress(0, "Stem job canceled", "failed");
    } catch (error) {
      showStemError(error);
    } finally {
      clearTimeout(stateV4.pollTimer);
      stateV4.running = false;
      nodes.runBtn.disabled = !stateV4.config?.ready;
      nodes.cancelBtn.disabled = false;
      nodes.cancelBtn.classList.add("workspace-hidden");
      await cleanupUpload();
    }
  }

  async function cleanupUpload() {
    const audioUrl = stateV4.uploadedUrl;
    if (!audioUrl) return;
    stateV4.uploadedUrl = "";
    try {
      await api("/api/stem-cleanup", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ audioUrl })
      });
    } catch (error) {
      console.warn("Forge could not delete the temporary upload", error);
    }
  }

  function resetStemJob() {
    clearTimeout(stateV4.pollTimer);
    stateV4.predictionId = "";
    stateV4.result = null;
    stateV4.running = false;
    nodes.resultsCard.classList.add("workspace-hidden");
    nodes.progressCard.classList.add("workspace-hidden");
    nodes.runBtn.disabled = !stateV4.config?.ready;
    window.scrollTo({ top: nodes.uploadZone.getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
  }

  function loadStemHistory() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE.history) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function saveStemHistory(result) {
    const history = loadStemHistory();
    history.unshift({
      id: result.id,
      fileName: stateV4.file?.name || "Audio",
      target: stateV4.target,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      residualUrl: result.residualUrl,
      targetUrl: result.targetUrl || ""
    });
    localStorage.setItem(STORAGE.history, JSON.stringify(history.slice(0, 12)));
    renderStemHistory();
  }

  function renderStemHistory() {
    if (!nodes.historyList) return;
    const now = Date.now();
    const history = loadStemHistory();
    nodes.historyList.innerHTML = "";
    if (!history.length) {
      nodes.historyList.appendChild(el("div", "empty-state", "Completed stem jobs will appear here temporarily."));
      return;
    }
    history.forEach((item) => {
      const entry = el("div", "stem-history-item");
      const expired = Date.parse(item.expiresAt) < now;
      entry.append(
        el("strong", "", `${item.fileName} · removed ${item.target}`),
        el("small", "", expired ? "Output link likely expired" : `Temporary link · ${new Date(item.createdAt).toLocaleString()}`)
      );
      if (!expired && item.residualUrl) {
        const link = el("a", "stem-download primary", "Open Edited Mix");
        link.href = item.residualUrl;
        link.target = "_blank";
        link.rel = "noopener";
        entry.appendChild(link);
      }
      nodes.historyList.appendChild(entry);
    });
  }

  function updateBrand() {
    document.title = "Forge Studio v4";
    const topEyebrow = document.querySelector(".topbar .eyebrow");
    if (topEyebrow) topEyebrow.textContent = "MOBILE MUSIC WORKSTATION";
  }

  function initV4() {
    if (document.documentElement.dataset.forgeV4 === "ready") return;
    const topbar = document.querySelector(".topbar");
    const generatorWorkspace = document.querySelector("main");
    if (!topbar || !generatorWorkspace) return;
    document.documentElement.dataset.forgeV4 = "ready";
    nodes.generatorWorkspace = generatorWorkspace;
    nodes.generatorWorkspace.id = "generatorWorkspace";
    nodes.bottomBar = document.querySelector(".bottom-bar");
    buildSwitcher(topbar);
    buildStemWorkspace(generatorWorkspace);
    updateBrand();
    renderStemHistory();
    loadConfig();
    switchWorkspace(localStorage.getItem(STORAGE.workspace) || "stems");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initV4, { once: true });
  } else {
    initV4();
  }
})();
