import { startHud } from "./hud-canvas.js";
import { createVoice } from "./voice.js";
import { think, greeting, loadHistory, persistHistory } from "./agent.js";
import { loadConfig } from "./llm.js";
import { detectBrowser, unlockMedia, fitVisualViewport } from "./browser.js";
import { runCommand } from "./commands.js";


const $ = (id) => document.getElementById(id);

const hud = startHud($("hud-canvas"));
const env = detectBrowser();
const cfg = loadConfig();
let armed = false;
let busy = false;
let lastReply = "";
let camStream = null;
let history = [];

fitVisualViewport();

const voice = createVoice({
  onStart() {
    document.body.classList.add("is-speaking");
    hud.setAmp(0.9);
    setStatus("SPEAKING");
  },
  onEnd() {
    document.body.classList.remove("is-speaking");
    hud.setAmp(armed ? 0.45 : 0);
    if (armed) setStatus("LISTENING");
    voice.resumeListen();
  },
});

function setStatus(s) {
  const el = $("status-pill");
  if (el) el.textContent = s;
}

function setHeard(t) {
  $("heard").textContent = t || "";
}

function setReply(t) {
  $("reply").textContent = t || "";
  lastReply = t || lastReply;
}

function tickClock() {
  $("clock").textContent = new Date().toLocaleTimeString(undefined, { hour12: false });
}
setInterval(tickClock, 1000);
tickClock();

function openDock() {
  $("dock").hidden = false;
}

function closeView() {
  $("dock").hidden = true;
  $("web").src = "about:blank";
  $("dock-card").hidden = true;
  camera(false);
}

function openView(url, title) {
  openDock();
  $("cam").hidden = true;
  $("web").hidden = false;
  $("dock-card").hidden = true;
  $("dock-title").textContent = (title || "VIEW").toUpperCase();
  $("dock-url").textContent = url;
  $("web").src = url;
}

function openTab(url) {
  window.open(url, "_blank", "noopener");
}

function markExternal(url, title) {
  openDock();
  $("web").hidden = true;
  $("cam").hidden = true;
  const card = $("dock-card");
  card.hidden = false;
  card.textContent = `${title || "Page"} opened in a new browser tab.\n${url}`;
  $("dock-title").textContent = "NEW TAB";
  $("dock-url").textContent = url;
}

async function camera(on) {
  if (!on) {
    if (camStream) {
      camStream.getTracks().forEach((t) => t.stop());
      camStream = null;
    }
    $("cam").srcObject = null;
    $("cam").hidden = true;
    return true;
  }
  try {
    camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    openDock();
    $("web").hidden = true;
    $("dock-card").hidden = true;
    $("cam").hidden = false;
    $("cam").srcObject = camStream;
    $("dock-title").textContent = "CAMERA";
    $("dock-url").textContent = "local sensor";
    return true;
  } catch {
    return false;
  }
}

function screenshot() {
  const c = $("hud-canvas");
  const a = document.createElement("a");
  a.download = "jarvis-hud.png";
  a.href = c.toDataURL("image/png");
  a.click();
}

async function battery() {
  if (!navigator.getBattery) return "Battery telemetry is not exposed in this browser, sir.";
  const b = await navigator.getBattery();
  return `Power at ${Math.round(b.level * 100)} percent${b.charging ? ", charging" : ""}, sir.`;
}

async function locate() {
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
    );
    const { latitude, longitude } = pos.coords;
    openView(
      `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=14/${latitude}/${longitude}`,
      "Location"
    );
    return `You are near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}, sir.`;
  } catch {
    return "Location was declined, sir.";
  }
}

function timer(ms, label) {
  setTimeout(() => {
    try {
      Notification.requestPermission?.();
      if (Notification.permission === "granted") new Notification("J.A.R.V.I.S.", { body: label || "Time is up" });
    } catch {
      /* ignore */
    }
    voice.speak(`Timer complete, ${cfg.title || "sir"}. ${label || ""}`);
    setReply(`Timer complete. ${label || ""}`);
  }, ms);
}

const ctx = {
  get title() {
    return cfg.title || "sir";
  },
  sleep() {
    armed = false;
    voice.stopLoop();
    document.body.classList.remove("is-listening");
    setStatus("STANDBY");
    $("arm-hint").textContent = "Tap the core to listen again.";
    hud.setAmp(0);
  },
  mute(v) {
    voice.setMuted(v);
  },
  stopSpeech() {
    voice.stop();
    if (armed) voice.startLoop(loopHandlers);
  },
  closeView,
  openView,
  openTab,
  markExternal,
  async fullscreen(on) {
    try {
      if (on) await document.documentElement.requestFullscreen();
      else if (document.fullscreenElement) await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  },
  scroll(dy) {
    const frame = $("web");
    try {
      frame.contentWindow?.scrollBy(0, dy);
    } catch {
      window.scrollBy(0, dy);
    }
  },
  refresh() {
    if (!$("dock").hidden && $("web").src) $("web").src = $("web").src;
    else location.reload();
  },
  screenshot,
  camera,
  timer,
  async copyLast() {
    try {
      await navigator.clipboard.writeText(lastReply || $("heard").textContent || "");
    } catch {
      /* ignore */
    }
  },
  battery,
  locate,
};

const loopHandlers = {
  onInterim(text) {
    setHeard(text);
    hud.setAmp(0.6);
  },
  async onFinal(text) {
    setHeard(text);
    await handleUtterance(text);
  },
  onError(err) {
    if (err === "not-allowed") {
      setReply("Microphone blocked, sir. Allow it, then tap the core.");
      ctx.sleep();
    }
  },
};

async function handleUtterance(text) {
  if (busy || !text) return;
  const clean = text.replace(/^(hey |ok |okay )?jarvis[,.!]?\s*/i, "").trim();
  if (!clean) return;
  busy = true;
  voice.pauseListen();
  setStatus("ACTING");
  try {
    const cmd = await runCommand(clean, ctx);
    if (cmd.handled) {
      setReply(cmd.speech);
      await voice.speak(cmd.speech);
      return;
    }
    setStatus("THINKING");
    setReply("Considering that…");
    history.push({ role: "user", content: clean, ts: Date.now() });
    const result = await think({
      history,
      userText: clean,
      cfg,
      onEngine() {},
    });
    history.push({ role: "assistant", content: result.text, ts: Date.now() });
    persistHistory(history);
    setReply(result.text);
    await voice.speak(result.text);
  } catch (err) {
    const msg = `A fault, sir. ${err.message || err}`;
    setReply(msg);
    await voice.speak(msg);
  } finally {
    busy = false;
    if (armed) {
      setStatus("LISTENING");
      voice.resumeListen();
    }
  }
}

async function arm() {
  unlockMedia();
  if (!voice.canListen) {
    const why = env.inIframe
      ? "Open this page in its own browser tab so I may use the microphone."
      : "This browser cannot listen. Chrome or Edge will. I am voice-only — there is no keyboard.";
    setReply(why);
    await voice.speak(why);
    revealBar();
    return;
  }
  if (armed) {
    ctx.sleep();
    await voice.speak("Standing by.");
    return;
  }
  armed = true;
  document.body.classList.add("is-listening");
  $("arm-hint").textContent = "Listening. Speak a command.";
  setStatus("LISTENING");
  hud.setAmp(0.45);
  voice.startLoop(loopHandlers);
  const line = "Auditory input online. Command me. I will do it in this browser.";
  setReply(line);
  await voice.speak(line);
}

function revealBar() {
  const bar = $("browser-bar");
  const link = $("btn-full-browser");
  if (!bar || !env.inIframe) return;
  link.href = location.href;
  link.onclick = (e) => {
    e.preventDefault();
    const w = window.open(location.href, "_blank", "noopener");
    if (!w) location.assign(location.href);
  };
  bar.hidden = false;
  bar.classList.remove("hidden");
}

function bind() {
  $("core").addEventListener("pointerup", (e) => {
    e.preventDefault();
    arm();
  });
  $("btn-close-dock").addEventListener("click", closeView);
  if (env.inIframe) revealBar();
}

async function boot() {
  const lines = [
    "VOICE MATRIX ..................... ONLINE",
    "KEYBOARD ......................... DISABLED",
    "BROWSER ACTIONS .................. ARMED",
    "TOKEN LIMITER .................... DISABLED",
    "AWAITING CORE AUTHORISATION",
  ];
  const log = $("boot-log");
  for (let i = 0; i < lines.length; i++) {
    log.textContent += (log.textContent ? "\n" : "") + "> " + lines[i];
    $("boot-fill").style.width = `${Math.round(((i + 1) / lines.length) * 100)}%`;
    $("boot-pct").textContent = String(Math.round(((i + 1) / lines.length) * 100)).padStart(2, "0") + "%";
    await new Promise((r) => setTimeout(r, 160));
  }
  await new Promise((r) => setTimeout(r, 280));
  $("boot").hidden = true;
  $("boot").classList.add("hidden");
  $("app").hidden = false;
  $("app").classList.remove("hidden");
  bind();
  const hello = greeting(cfg).replace("you may speak at any length", "voice control only — I will act in this browser");
  setReply(hello);
  if (!env.isIOS) await voice.speak(hello);
}

boot();
