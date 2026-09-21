function pickJarvisVoice() {
  if (!window.speechSynthesis) return null;
  const voices = speechSynthesis.getVoices() || [];
  const scored = voices.map((v) => {
    let s = 0;
    const n = `${v.name} ${v.lang}`.toLowerCase();
    if (/en-gb|en_gb|british|uk english/.test(n)) s += 8;
    if (/daniel|george|arthur|male|david|rishi|fred|samantha/.test(n)) s += 5;
    if (/google uk english male/.test(n)) s += 12;
    if (v.lang && v.lang.toLowerCase().startsWith("en")) s += 2;
    if (v.default) s += 1;
    return { v, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0] ? scored[0].v : null;
}

function chunkText(text) {
  const clean = String(text)
    .replace(/[`*_#]/g, "")
    .replace(/https?:\/\/\S+/g, "link")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= 180) return [clean];
  const parts = [];
  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
  let buf = "";
  for (const s of sentences) {
    if ((buf + s).length > 180) {
      if (buf) parts.push(buf.trim());
      buf = s;
    } else {
      buf += s;
    }
  }
  if (buf.trim()) parts.push(buf.trim());
  return parts.length ? parts : [clean];
}

export function createVoice({ onStart, onEnd, onListening }) {
  const hasTTS = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  let voice = null;
  let muted = false;
  let spoken = 0;
  let desired = "";
  let speaking = false;
  let keepAlive = null;

  const loadVoices = () => {
    voice = pickJarvisVoice();
  };
  if (hasTTS) {
    loadVoices();
    if (speechSynthesis.addEventListener) {
      speechSynthesis.addEventListener("voiceschanged", loadVoices);
    } else {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let rec = null;
  let listening = false;

  if (Recognition) {
    rec = new Recognition();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
  }

  let looping = false;
  let paused = false;

  function kick() {
    if (!looping || paused || !rec) return;
    try {
      rec.start();
    } catch {
      /* already started */
    }
  }

  function startLoop({ onInterim, onFinal, onError }) {
    if (!rec) throw new Error("no-stt");
    looping = true;
    paused = false;
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final.trim()) onFinal && onFinal(final.trim());
      else if (interim.trim()) onInterim && onInterim(interim.trim());
    };
    rec.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      onError && onError(e.error);
    };
    rec.onend = () => {
      if (looping && !paused) setTimeout(kick, 160);
    };
    kick();
  }

  function stopLoop() {
    looping = false;
    paused = false;
    try {
      rec && rec.stop();
    } catch {
      /* ignore */
    }
  }

  function speakChunk(text) {
    return new Promise((resolve) => {
      if (!hasTTS) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      const picked = voice || pickJarvisVoice();
      if (picked) u.voice = picked;
      u.lang = picked && picked.lang ? picked.lang : "en-GB";
      u.rate = 1.02;
      u.pitch = 0.92;
      u.volume = 1;
      u.onstart = () => {
        if (!speaking) {
          speaking = true;
          spoken += 1;
          onStart && onStart();
        }
      };
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }

  async function speak(text) {
    if (muted || !text || !hasTTS) return;
    speechSynthesis.cancel();
    clearInterval(keepAlive);
    const parts = chunkText(text).slice(0, 40);
    keepAlive = setInterval(() => {
      if (!speechSynthesis.speaking) {
        clearInterval(keepAlive);
        return;
      }
      try {
        speechSynthesis.pause();
        speechSynthesis.resume();
      } catch {
        /* Safari / Firefox may ignore */
      }
    }, 8000);
    try {
      for (const part of parts) {
        if (muted) break;
        await speakChunk(part);
      }
    } finally {
      clearInterval(keepAlive);
      speaking = false;
      onEnd && onEnd();
    }
  }

  function listenOnce() {
    if (!rec) return Promise.reject(new Error("Speech recognition unavailable"));
    if (listening) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    }
    desired = "";
    return new Promise((resolve, reject) => {
      rec.onresult = (e) => {
        let final = "";
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t;
          else interim += t;
        }
        desired = (final || interim).trim();
        onListening && onListening(desired, Boolean(final));
      };
      rec.onerror = (e) => {
        listening = false;
        reject(new Error(e.error || "listen-failed"));
      };
      rec.onend = () => {
        listening = false;
        resolve(desired);
      };
      listening = true;
      try {
        rec.start();
      } catch (err) {
        listening = false;
        reject(err);
      }
    });
  }

  return {
    speak,
    listenOnce,
    startLoop,
    stopLoop,
    pauseListen() {
      paused = true;
      try {
        rec && rec.stop();
      } catch {
        /* ignore */
      }
    },
    resumeListen() {
      paused = false;
      kick();
    },
    stop() {
      looping = false;
      if (hasTTS) speechSynthesis.cancel();
      clearInterval(keepAlive);
      try {
        rec && rec.stop();
      } catch {
        /* ignore */
      }
      listening = false;
      speaking = false;
      onEnd && onEnd();
    },
    setMuted(v) {
      muted = v;
      if (v && hasTTS) speechSynthesis.cancel();
    },
    get muted() {
      return muted;
    },
    get spoken() {
      return spoken;
    },
    get canListen() {
      return Boolean(rec);
    },
    get canSpeak() {
      return hasTTS;
    },
    get voiceName() {
      return voice ? voice.name : "system default";
    },
  };
}
