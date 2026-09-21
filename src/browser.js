export function detectBrowser() {
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS/i.test(ua);
  const isEdge = /Edg/i.test(ua);
  const isChrome = /Chrome|CriOS/i.test(ua) && !isEdge;
  const inIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const canTTS = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  const canSTT = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const label = isIOS
    ? "Safari iOS"
    : isFirefox
      ? "Firefox"
      : isEdge
        ? "Edge"
        : isChrome
          ? "Chrome"
          : isSafari
            ? "Safari"
            : isAndroid
              ? "Android"
              : "Browser";
  return { isIOS, isAndroid, isFirefox, isSafari, isEdge, isChrome, inIframe, canTTS, canSTT, label };
}

export function unlockMedia() {
  try {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0;
      window.speechSynthesis.speak(u);
      window.speechSynthesis.cancel();
    }
  } catch {
    /* ignore */
  }
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) {
      const ctx = new Ctx();
      if (ctx.state === "suspended") ctx.resume();
    }
  } catch {
    /* ignore */
  }
}

export function fitVisualViewport() {
  const apply = () => {
    const vv = window.visualViewport;
    const h = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty("--vvh", `${Math.round(h)}px`);
  };
  apply();
  window.addEventListener("resize", apply);
  window.visualViewport?.addEventListener("resize", apply);
  window.visualViewport?.addEventListener("scroll", apply);
}
