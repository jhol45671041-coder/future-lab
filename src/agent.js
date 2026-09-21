import { localReply, SYSTEM_PROMPT } from "./brain.js";
import { cloudComplete } from "./llm.js";
import {
  detectToolIntent,
  nowStamp,
  safeCalculate,
  wikiSummary,
  weatherHere,
  weatherPhrase,
  remember,
  loadNotes,
} from "./tools.js";

const HISTORY_KEY = "jarvis.history.v1";
const MAX_STORED = 400;

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

export function persistHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-MAX_STORED)));
}

function summariseOld(history) {
  const old = history.slice(0, -16);
  if (!old.length) return "";
  const bits = old
    .slice(-30)
    .map((m) => `${m.role === "user" ? "User" : "JARVIS"}: ${m.content.slice(0, 180)}`)
    .join(" | ");
  return `Prior unbounded session memory (compressed, not discarded): ${bits}`;
}

function contextMessages(history, title, toolNote) {
  const recent = history.slice(-24).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: m.content,
  }));
  const memory = loadNotes()
    .slice(-12)
    .map((n) => n.fact)
    .join("; ");
  const stamp = nowStamp();
  const sys =
    SYSTEM_PROMPT(title) +
    `\nCurrent local time: ${stamp.local}.` +
    (memory ? `\nPersistent notes about the user: ${memory}` : "") +
    (toolNote ? `\nTool observation: ${toolNote}` : "") +
    `\n${summariseOld(history)}`;
  return [{ role: "system", content: sys }, ...recent];
}

async function runTool(intent, text, title) {
  const t = title || "sir";
  if (intent === "time") {
    const s = nowStamp();
    return `The time is ${s.time}, ${t}. I have synchronised with your local clock.`;
  }
  if (intent === "date") {
    const s = nowStamp();
    return `It is ${s.date}, ${t}.`;
  }
  if (intent === "math") {
    const expr = text.replace(/[^0-9+\-*/().%^\s×÷xX]/g, " ").replace(/[xX]/g, "*");
    try {
      const value = safeCalculate(expr);
      return `That comes to ${value}, ${t}. I did not even need the suit for this one.`;
    } catch {
      return null;
    }
  }
  if (intent === "remember") {
    const fact = text.replace(/^(please )?remember (that )?|^note that /i, "").trim();
    remember(fact);
    return `Logged, ${t}. I shall remember: “${fact}”. Memory banks remain unbounded.`;
  }
  if (intent === "recall") {
    const notes = loadNotes();
    if (!notes.length) return `I have no persistent notes yet, ${t}. Say “remember that …” and I shall keep it.`;
    return `From memory, ${t}:\n` + notes.map((n) => `• ${n.fact}`).join("\n");
  }
  if (intent === "wiki") {
    const q = text
      .replace(/^(who is|who's|what is|what's|tell me about|look up|wiki)\s+/i, "")
      .replace(/\?+$/, "")
      .trim();
    try {
      const w = await wikiSummary(q);
      return `Briefing on ${w.title}, ${t}: ${w.extract}${w.url ? `\nSource: ${w.url}` : ""}`;
    } catch {
      return null;
    }
  }
  if (intent === "weather") {
    try {
      const w = await weatherHere();
      return `Local atmospheric reading, ${t}: ${weatherPhrase(w)}. Do pack accordingly — I prefer you operational.`;
    } catch {
      return `I could not access your location sensors, ${t}. Permit geolocation, or tell me a city.`;
    }
  }
  return null;
}

export async function think({
  history,
  userText,
  cfg,
  onEngine,
  onToken,
  signal,
}) {
  const title = cfg.title || "sir";
  const intent = detectToolIntent(userText);
  let toolResult = null;
  if (intent) {
    toolResult = await runTool(intent, userText, title);
  }

  const preferLocal = cfg.engine === "local";
  const tryCloud = !preferLocal && cfg.engine !== "off";

  if (tryCloud) {
    onEngine?.(cfg.engine === "openai" ? "CUSTOM API" : "CLOUD LINK");
    try {
      const messages = contextMessages(history, title, toolResult);
      const text = await cloudComplete({
        cfg,
        messages,
        onToken,
        signal,
      });
      if (text && text.trim()) return { text: text.trim(), engine: "cloud" };
    } catch (err) {
      onEngine?.("LOCAL CORE");
      if (cfg.engine === "openai" || cfg.engine === "cloud") {
        const fallback = localReply(userText, { title }, {
          engineLabel: "LOCAL CORE",
          toolResult:
            toolResult ||
            `The cloud neural link declined (${err.message}). I am continuing on the local core, ${title}.`,
          voiceOnline: true,
          canListen: true,
        });
        onToken?.(fallback, fallback);
        return { text: fallback, engine: "local", error: err.message };
      }
    }
  }

  onEngine?.("LOCAL CORE");
  const text = localReply(userText, { title }, {
    engineLabel: preferLocal ? "LOCAL CORE" : "LOCAL CORE",
    toolResult,
    voiceOnline: true,
    canListen: true,
  });
  onToken?.(text, text);
  return { text, engine: "local" };
}

export function greeting(cfg) {
  const hour = new Date().getHours();
  const part = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const t = cfg.title || "sir";
  return `${part}, ${t}. All systems are operational. Token limiter disabled — you may speak at any length. How may I assist you?`;
}
