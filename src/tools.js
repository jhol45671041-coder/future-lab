const NOTES_KEY = "jarvis.notes.v1";

export function loadNotes() {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveNotes(notes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes.slice(-80)));
}

export function remember(fact) {
  const notes = loadNotes();
  notes.push({ t: Date.now(), fact: fact.trim() });
  saveNotes(notes);
  return notes;
}

export function forgetAll() {
  saveNotes([]);
}

export function nowStamp() {
  const d = new Date();
  return {
    iso: d.toISOString(),
    local: d.toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    time: d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    date: d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };
}

export function safeCalculate(expr) {
  const cleaned = expr
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/,/g, "")
    .replace(/[^0-9+\-*/().%^\s]/g, "");
  if (!cleaned.trim()) throw new Error("empty");
  if (!/^[\d+\-*/().%\s^]+$/.test(cleaned)) throw new Error("unsafe");
  const js = cleaned.replace(/\^/g, "**");
  const fn = new Function(`return (${js})`);
  const value = fn();
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("nan");
  return value;
}

export async function wikiSummary(query) {
  const title = encodeURIComponent(query.trim().replace(/\s+/g, " "));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("wiki");
  const data = await res.json();
  if (data.type === "disambiguation") {
    return {
      title: data.title,
      extract: data.extract || "Several entries share that name, sir.",
      url: data.content_urls?.desktop?.page,
    };
  }
  return {
    title: data.title,
    extract: data.extract,
    url: data.content_urls?.desktop?.page,
  };
}

export async function weatherHere() {
  const pos = await new Promise((resolve, reject) => {
    if (!navigator.geolocation) reject(new Error("geo"));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 8000,
      maximumAge: 300000,
    });
  });
  const { latitude, longitude } = pos.coords;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather");
  const data = await res.json();
  return {
    latitude,
    longitude,
    temperature: data.current?.temperature_2m,
    humidity: data.current?.relative_humidity_2m,
    wind: data.current?.wind_speed_10m,
    unit: data.current_units?.temperature_2m || "°C",
    code: data.current?.weather_code,
  };
}

const WMO = {
  0: "clear skies",
  1: "mainly clear conditions",
  2: "partly cloudy skies",
  3: "overcast cover",
  45: "fog",
  48: "depositing rime fog",
  51: "light drizzle",
  61: "rain",
  71: "snow",
  80: "rain showers",
  95: "thunderstorms",
};

export function weatherPhrase(w) {
  const sky = WMO[w.code] || "mixed atmospheric conditions";
  return `${w.temperature}${w.unit}, ${sky}, humidity ${w.humidity}%, wind ${w.wind} km/h`;
}

export function detectToolIntent(text) {
  const q = text.toLowerCase().trim();
  if (/\b(weather|temperature|forecast|rain)\b/.test(q)) return "weather";
  if (/\b(time|clock)\b/.test(q) && /what|tell|current|now/.test(q)) return "time";
  if (/\b(date|day of the week|today'?s date)\b/.test(q)) return "date";
  if (/^(what is|what's|whats|calculate|compute|solve)\s+[0-9]/.test(q) || /[0-9]\s*[\+\-\*\/x×÷^]\s*[0-9]/.test(q))
    return "math";
  if (
    /^(who is|who's|what is|what's|tell me about|look up|wiki)\s+.{2,}/.test(q) &&
    !/\b(your name|you|jarvis|the time|the date|the weather)\b/.test(q)
  )
    return "wiki";
  if (/^remember (that )?/i.test(text) || /^note that /i.test(text)) return "remember";
  if (/what do you remember|recall my notes|show memory/.test(q)) return "recall";
  return null;
}
