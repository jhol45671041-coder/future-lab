import { startHud } from "./hud-canvas.js";
import { createVoice } from "./voice.js";
import { think, loadHistory, persistHistory, greeting } from "./agent.js";
import { loadConfig, saveConfig } from "./llm.js";
import { loadNotes } from "./tools.js";

const $ = (id) => document.getElementById(id);

const hud = startHud($("hud-canvas"));
let cfg = loadConfig();
let history = loadHistory();
let busy = false;
let abort = null;

const glow = $("cursor-glow");
window.addEventListener("pointermove", (e) => {
  document.body.classList.add("is-armed");
  if (!glow) return;
  glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

const voice = createVoice({
  onStart() {
    $("mini-reactor").classList.add("speaking");
    document.body.classList.add("is-speaking");
    hud.setAmp(0.85);
    $("m-voice").style.width = "88%";
  },
  onEnd() {
    $("mini-reactor").classList.remove("speaking");
    document.body.classList.remove("is-speaking");
    hud.setAmp(0);
    $("m-voice").style.width = "12%";
    $("stat-spoken").textContent = String(voice.spoken);
  },
  onListening(text) {
    $("input").value = text;
    resizeInput();
  },
});

function setLink(label, ok = true) {
  $("link-label").textContent = `NEURAL LINK: ${label}`;
  $("sys-core").textContent = label;
  $("link-chip").classList.toggle("ok", ok);
}

function refreshMemory() {
  const notes = loadNotes();
  $("memory-view").textContent = notes.length
    ? notes.map((n) => `• ${n.fact}`).join("\n")
    : "No persistent notes yet, sir.";
}

function updateClock() {
  const d = new Date();
  $("clock").textContent = d.toLocaleTimeString(undefined, { hour12: false });
  $("date-line").textContent = d
    .toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
}
setInterval(updateClock, 1000);
updateClock();

function resizeInput() {
  const el = $("input");
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
  const n = el.value.length;
    $("char-count").textContent = `${n.toLocaleString()} · unrestricted`;
}

function hideEmpty() {
  const el = $("empty-state");
  if (el) el.style.display = "none";
}

function stamp() {
  return new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function addMsg(role, text, extra = "") {
  hideEmpty();
  const wrap = document.createElement("div");
  wrap.className = `msg ${role}`;
  const who = role.includes("user") ? "You" : "J.A.R.V.I.S.";
  wrap.innerHTML = `
    <div class="who">${who}</div>
    <div class="bubble"></div>
    <div class="meta">${extra ? extra + " · " : ""}${stamp()}</div>
  `;
  wrap.querySelector(".bubble").textContent = text;
  $("transcript").appendChild(wrap);
  $("transcript").scrollTop = $("transcript").scrollHeight;
  return wrap;
}

function renderHistory() {
  $("transcript").querySelectorAll(".msg").forEach((n) => n.remove());
  if (!history.length) {
    const el = $("empty-state");
    if (el) el.style.display = "";
    return;
  }
  for (const m of history.slice(-80)) {
    addMsg(m.role === "user" ? "user" : "jarvis", m.content, m.engine ? m.engine : "");
  }
}

function stats() {
  $("stat-turns").textContent = String(history.filter((m) => m.role === "user").length);
  const chars = history.reduce((n, m) => n + m.content.length, 0);
  $("stat-chars").textContent = chars.toLocaleString();
  const pct = Math.min(100, 8 + (chars % 4000) / 40);
  $("m-ctx").style.width = `${pct}%`;
  $("m-cpu").style.width = `${20 + Math.random() * 30}%`;
}

async function send(text) {
  const content = (text ?? $("input").value).trim();
  if (!content || busy) return;
  busy = true;
  $("input").value = "";
  resizeInput();
    addMsg("user", content, "Uplink");
  history.push({ role: "user", content, ts: Date.now() });

  document.body.classList.add("is-thinking");
  const thinkMsg = addMsg("jarvis thinking", "A moment, while I consider that…", "Thinking");
  const bubble = thinkMsg.querySelector(".bubble");
  abort = new AbortController();

  let assembled = "";
  try {
    const result = await think({
      history,
      userText: content,
      cfg,
      signal: abort.signal,
      onEngine: (label) => setLink(label),
      onToken(piece, full) {
        assembled = full;
        thinkMsg.classList.remove("thinking");
        bubble.textContent = full;
        $("transcript").scrollTop = $("transcript").scrollHeight;
        hud.setAmp(0.4);
      },
    });
    assembled = result.text;
    thinkMsg.classList.remove("thinking");
    bubble.textContent = assembled;
    thinkMsg.querySelector(".meta").textContent = result.engine.toUpperCase();
    history.push({
      role: "assistant",
      content: assembled,
      ts: Date.now(),
      engine: result.engine,
    });
    persistHistory(history);
    stats();
    refreshMemory();
    await voice.speak(assembled);
  } catch (err) {
    if (err.name === "AbortError") {
      bubble.textContent = "Cancelled, sir.";
    } else {
      bubble.textContent = `A minor fault in the uplink, sir. ${err.message}`;
    }
  } finally {
    busy = false;
    abort = null;
    hud.setAmp(0);
    document.body.classList.remove("is-thinking");
  }
}

function bindUi() {
  $("input").addEventListener("input", resizeInput);
  $("input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
  $("btn-send").addEventListener("click", () => send());
  $("quick").addEventListener("click", (e) => {
    const q = e.target?.dataset?.q;
    if (q) send(q);
  });

  $("btn-mic").addEventListener("click", async () => {
    if (!voice.canListen) {
      addMsg(
        "jarvis",
        "This browser has not granted me auditory input, sir. Chrome or Edge will let me hear you. You may still write at any length.",
        "Voice"
      );
      return;
    }
    $("btn-mic").classList.add("live");
    document.body.classList.add("is-listening");
    $("sys-mic").textContent = "Listening";
    try {
      const heard = await voice.listenOnce();
      $("btn-mic").classList.remove("live");
      document.body.classList.remove("is-listening");
      $("sys-mic").textContent = "Idle";
      if (heard) await send(heard);
    } catch {
      $("btn-mic").classList.remove("live");
      document.body.classList.remove("is-listening");
      $("sys-mic").textContent = "Denied";
    }
  });

  $("btn-mute").addEventListener("click", () => {
    voice.setMuted(!voice.muted);
    $("btn-mute").textContent = voice.muted ? "Voice output · Off" : "Voice output · On";
    $("sys-voice").textContent = voice.muted ? "Muted" : "Online";
  });

  $("btn-clear").addEventListener("click", () => {
    history = [];
    persistHistory(history);
    $("transcript").querySelectorAll(".msg").forEach((n) => n.remove());
    const empty = $("empty-state");
    if (empty) empty.style.display = "";
    stats();
    addMsg("jarvis", "Session purged, sir. Memory banks of this conversation are clear. Persistent notes remain.", "System");
  });

  $("btn-settings").addEventListener("click", openSettings);
  $("btn-close-settings").addEventListener("click", closeSettings);
  $("btn-save-settings").addEventListener("click", () => {
    cfg = {
      engine: $("cfg-engine").value,
      title: $("cfg-title").value.trim() || "sir",
      base: $("cfg-base").value.trim(),
      key: $("cfg-key").value.trim(),
      model: $("cfg-model").value.trim() || "openai",
    };
    saveConfig(cfg);
    closeSettings();
    addMsg(
      "jarvis",
      `Protocol updated. I shall address you as ${cfg.title}. Neural link set to ${cfg.engine}. Token limiter remains disabled.`,
      "SYSTEM"
    );
    voice.speak(`Protocol updated. I shall address you as ${cfg.title}.`);
  });

  $("sys-voice").textContent = "Online";
  $("sys-mic").textContent = voice.canListen ? "Armed" : "Unavailable";
}

function openSettings() {
  $("cfg-engine").value = cfg.engine || "auto";
  $("cfg-title").value = cfg.title || "sir";
  $("cfg-base").value = cfg.base || "";
  $("cfg-key").value = cfg.key || "";
  $("cfg-model").value = cfg.model || "openai";
  $("settings").hidden = false;
  $("settings").classList.remove("hidden");
}

function closeSettings() {
  $("settings").hidden = true;
  $("settings").classList.add("hidden");
}

async function boot() {
  const lines = [
    "BIOMETRIC HANDSHAKE .............. OK",
    "ARC REACTOR EMULATOR ............. IGNITED",
    "VOICE MATRIX ..................... ALIGNED",
    "AUDITORY INPUT ................... " + (voice.canListen ? "ARMED" : "OPTIONAL"),
    "MEMORY BANKS ..................... UNBOUNDED",
    "TOKEN LIMITER .................... DISABLED",
    "CONTEXT WINDOW ................... ∞",
    "WIT PROTOCOL ..................... ENABLED",
    "J.A.R.V.I.S. MARK VII ............. READY",
  ];
  const log = $("boot-log");
  const fill = $("boot-fill");
  const pct = $("boot-pct");
  for (let i = 0; i < lines.length; i++) {
    log.textContent += (log.textContent ? "\n" : "") + "> " + lines[i];
    const p = Math.round(((i + 1) / lines.length) * 100);
    fill.style.width = p + "%";
    pct.textContent = String(p).padStart(2, "0") + "%";
    await new Promise((r) => setTimeout(r, 180));
  }
  await new Promise((r) => setTimeout(r, 420));
  $("boot").classList.add("hidden");
  $("boot").hidden = true;
  $("app").hidden = false;
  $("app").classList.remove("hidden");
  bindUi();
  refreshMemory();
  renderHistory();
  stats();
  setLink("STANDBY");
  const hello = history.length
    ? `Welcome back, ${cfg.title || "sir"}. Systems remain nominal. Token limiter is still disabled. I have our previous conversation on file.`
    : greeting(cfg);
  addMsg("jarvis", hello, "BOOT");
  history.push({ role: "assistant", content: hello, ts: Date.now(), engine: "local" });
  persistHistory(history);
  stats();
  await voice.speak(hello);
}

boot();
