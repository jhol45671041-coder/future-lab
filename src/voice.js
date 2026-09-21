function pickJarvisVoice() {
  const voices = speechSynthesis.getVoices();
  const scored = voices.map((v) => {
    let s = 0;
    const n = `${v.name} ${v.lang}`.toLowerCase();
    if (/en-gb|en_gb|british|uk english/.test(n)) s += 8;
    if (/daniel|george|arthur|male|david|rishi/.test(n)) s += 5;
    if (/google uk english male/.test(n)) s += 12;
    if (v.lang?.toLowerCase().startsWith("en")) s += 2;
    if (v.default) s += 1;
    return { v, s };
  });
  scored.sort((a, b) => b.s - a.s);
  return scored[0]?.v || null;
}

export function createVoice({ onStart, onEnd, onListening }) {
  let voice = null;
  let muted = false;
  let spoken = 0;
  let desired = "";

  const loadVoices = () => {
    voice = pickJarvisVoice();
  };
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;

  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let rec = null;
  let listening = false;

  if (Recognition) {
    rec = new Recognition();
    rec.lang = "en-GB";
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
  }

  function speak(text) {
    if (muted || !text) return Promise.resolve();
    speechSynthesis.cancel();
    const clean = String(text)
      .replace(/[`*_#]/g, "")
      .replace(/https?:\/\/\S+/g, "link")
      .slice(0, 4000);
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(clean);
      u.voice = voice || pickJarvisVoice();
      u.lang = u.voice?.lang || "en-GB";
      u.rate = 1.02;
      u.pitch = 0.92;
      u.volume = 1;
      u.onstart = () => {
        spoken += 1;
        onStart?.();
      };
      u.onend = () => {
        onEnd?.();
        resolve();
      };
      u.onerror = () => {
        onEnd?.();
        resolve();
      };
      speechSynthesis.speak(u);
    });
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
        onListening?.(desired, Boolean(final));
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
    stop() {
      speechSynthesis.cancel();
      try {
        rec?.stop();
      } catch {
        /* ignore */
      }
      listening = false;
      onEnd?.();
    },
    setMuted(v) {
      muted = v;
      if (v) speechSynthesis.cancel();
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
    get voiceName() {
      return voice?.name || "system default";
    },
  };
}
