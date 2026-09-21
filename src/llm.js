async function readSse(res, onToken) {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("no-body");
  const decoder = new TextDecoder();
  let buf = "";
  let full = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n");
    buf = parts.pop() || "";
    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        const piece =
          json.choices?.[0]?.delta?.content ||
          json.choices?.[0]?.message?.content ||
          json.content ||
          "";
        if (piece) {
          full += piece;
          onToken?.(piece, full);
        }
      } catch {
        /* ignore malformed chunk */
      }
    }
  }
  return full;
}

async function openaiCompatible({ base, key, model, messages, onToken, signal }) {
  const url = `${base.replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      messages,
      temperature: 0.7,
      stream: true,
    }),
    signal,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${err.slice(0, 180)}`);
  }
  return readSse(res, onToken);
}

async function pollinations(messages, onToken, signal) {
  const res = await fetch("https://text.pollinations.ai/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai",
      messages,
      temperature: 0.7,
      stream: true,
      private: true,
    }),
    signal,
  });
  if (!res.ok) throw new Error(`cloud ${res.status}`);
  const ctype = res.headers.get("content-type") || "";
  if (ctype.includes("text/event-stream") || ctype.includes("stream")) {
    return readSse(res, onToken);
  }
  const json = await res.json().catch(() => null);
  const text =
    json?.choices?.[0]?.message?.content ||
    (typeof json === "string" ? json : null);
  if (!text) throw new Error("empty-cloud");
  onToken?.(text, text);
  return text;
}

async function pollinationsSimple(messages, onToken, signal) {
  const last = messages.filter((m) => m.role === "user").at(-1)?.content || "";
  const system = messages.find((m) => m.role === "system")?.content || "";
  const url =
    `https://text.pollinations.ai/${encodeURIComponent(last)}` +
    `?model=openai&system=${encodeURIComponent(system.slice(0, 1500))}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("cloud-simple");
  const text = (await res.text()).trim();
  if (!text) throw new Error("empty");
  onToken?.(text, text);
  return text;
}

export async function cloudComplete({ cfg, messages, onToken, signal }) {
  if (cfg.engine === "openai" && cfg.base) {
    return openaiCompatible({
      base: cfg.base,
      key: cfg.key,
      model: cfg.model,
      messages,
      onToken,
      signal,
    });
  }

  if (cfg.engine === "openai" && !cfg.base) {
    throw new Error("No API base URL configured");
  }

  try {
    return await pollinations(messages, onToken, signal);
  } catch {
    return pollinationsSimple(messages, onToken, signal);
  }
}

export function loadConfig() {
  const defaults = {
    engine: "auto",
    title: localStorage.getItem("jarvis.title") || "sir",
    base: "",
    key: "",
    model: "openai",
  };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem("jarvis.cfg") || "{}") };
  } catch {
    return defaults;
  }
}

export function saveConfig(cfg) {
  localStorage.setItem("jarvis.cfg", JSON.stringify(cfg));
  if (cfg.title) localStorage.setItem("jarvis.title", cfg.title);
}
