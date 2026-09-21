const SITES = {
  youtube: "https://www.youtube.com",
  google: "https://www.google.com",
  gmail: "https://mail.google.com",
  maps: "https://www.google.com/maps",
  github: "https://github.com",
  wikipedia: "https://en.wikipedia.org",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  twitter: "https://x.com",
  x: "https://x.com",
  reddit: "https://reddit.com",
  amazon: "https://amazon.com",
  netflix: "https://netflix.com",
  linkedin: "https://linkedin.com",
  whatsapp: "https://web.whatsapp.com",
  news: "https://news.google.com",
  translate: "https://translate.google.com",
  drive: "https://drive.google.com",
  calendar: "https://calendar.google.com",
  spotify: "https://open.spotify.com",
  twitch: "https://twitch.tv",
  tiktok: "https://tiktok.com",
  pinterest: "https://pinterest.com",
  dropbox: "https://dropbox.com",
  slack: "https://app.slack.com",
  discord: "https://discord.com/app",
  zoom: "https://zoom.us",
  bing: "https://bing.com",
  duckduckgo: "https://duckduckgo.com",
  stackoverflow: "https://stackoverflow.com",
  chatgpt: "https://chatgpt.com",
  gemini: "https://gemini.google.com",
  bbc: "https://bbc.com",
  cnn: "https://cnn.com",
  espn: "https://espn.com",
  weather: "https://www.windy.com",
  insta: "https://instagram.com",
};

const IFRAME_OK = /youtube\.com\/embed|youtube-nocookie|wikipedia\.org|openstreetmap\.org|duckduckgo\.com|player\.vimeo|archive\.org/i;

function stripWake(text) {
  return String(text)
    .replace(/^(hey |ok |okay |hi )?jarvis[,.!]?\s*/i, "")
    .replace(/^(please|would you|could you|can you)\s+/i, "")
    .trim();
}

function siteKey(name) {
  const n = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return SITES[n] ? n : null;
}

function asUrl(raw) {
  const t = raw.trim();
  const key = siteKey(t.replace(/^(the )?/, ""));
  if (key) return SITES[key];
  if (/^https?:\/\//i.test(t)) return t;
  const host = t.replace(/\s+/g, "").toLowerCase();
  if (/^[a-z0-9-]+\.[a-z]{2,}(\/[^\s]*)?$/i.test(host)) return "https://" + host;
  return null;
}

function parseDuration(text) {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const u = m[2].toLowerCase();
  if (u.startsWith("sec")) return n * 1000;
  if (u.startsWith("min")) return n * 60000;
  return n * 3600000;
}

export async function runCommand(utterance, ctx) {
  const raw = stripWake(utterance);
  const q = raw.toLowerCase();
  const t = ctx.title || "sir";
  if (!raw) return { handled: false };

  if (/^(stop listening|go to sleep|sleep|that's enough|good night)$/.test(q)) {
    ctx.sleep();
    return { handled: true, speech: `Going standby, ${t}. Tap the core when you need me.` };
  }
  if (/^(stop talking|be quiet|silence|mute|hush)$/.test(q)) {
    ctx.mute(true);
    return { handled: true, speech: `Silent mode, ${t}.` };
  }
  if (/^(speak|unmute|talk to me)$/.test(q)) {
    ctx.mute(false);
    return { handled: true, speech: `Voice output restored, ${t}.` };
  }
  if (/^(stop|cancel|never mind|abort)$/.test(q)) {
    ctx.stopSpeech();
    return { handled: true, speech: `Cancelled, ${t}.` };
  }

  if (/^(close|dismiss|go home|close that|close it|hide)$/.test(q)) {
    ctx.closeView();
    return { handled: true, speech: `View closed, ${t}.` };
  }
  if (/^(fullscreen|full screen|go full)$/.test(q)) {
    await ctx.fullscreen(true);
    return { handled: true, speech: `Fullscreen, ${t}.` };
  }
  if (/^(exit fullscreen|leave fullscreen|windowed)$/.test(q)) {
    await ctx.fullscreen(false);
    return { handled: true, speech: `Windowed, ${t}.` };
  }
  if (/scroll down|page down/.test(q)) {
    ctx.scroll(400);
    return { handled: true, speech: `Scrolling, ${t}.` };
  }
  if (/scroll up|page up/.test(q)) {
    ctx.scroll(-400);
    return { handled: true, speech: `Scrolling up.` };
  }
  if (/^refresh|reload/.test(q)) {
    ctx.refresh();
    return { handled: true, speech: `Reloading the view.` };
  }
  if (/^print/.test(q)) {
    window.print();
    return { handled: true, speech: `Print dialogue opened.` };
  }
  if (/screenshot|capture (the )?(screen|hud)/.test(q)) {
    ctx.screenshot();
    return { handled: true, speech: `HUD captured, ${t}.` };
  }
  if (/turn on (the )?camera|open (the )?camera|show (my )?camera|webcam/.test(q)) {
    const ok = await ctx.camera(true);
    return {
      handled: true,
      speech: ok ? `Camera online, ${t}.` : `Camera was declined, ${t}.`,
    };
  }
  if (/turn off (the )?camera|close (the )?camera|stop camera/.test(q)) {
    ctx.camera(false);
    return { handled: true, speech: `Camera off.` };
  }

  const play = raw.match(/^(play|watch|youtube)\s+(?:me\s+)?(.+)/i);
  if (play) {
    const query = play[2].trim();
    const url = `https://www.youtube.com/embed?autoplay=1&listType=search&list=${encodeURIComponent(query)}`;
    ctx.openView(url, `YouTube · ${query}`);
    return { handled: true, speech: `Playing ${query}, ${t}.` };
  }

  const search = raw.match(/^(search|google|look up|find|bing)\s+(?:for\s+|on the web\s+)?(.+)/i);
  if (search) {
    const query = search[2].trim();
    const ddg = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    ctx.openView(ddg, `Search · ${query}`);
    ctx.openTab(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    return { handled: true, speech: `Searching the web for ${query}.` };
  }

  const wiki = raw.match(/^(wiki|wikipedia)\s+(.+)/i);
  if (wiki) {
    const query = wiki[2].trim();
    ctx.openView(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`, query);
    return { handled: true, speech: `Encyclopaedia open for ${query}.` };
  }

  const maps = raw.match(/^(maps?|directions?|navigate to|where is)\s+(.+)/i);
  if (maps) {
    const query = maps[2].trim();
    ctx.openView(
      `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`,
      `Maps · ${query}`
    );
    ctx.openTab(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
    return { handled: true, speech: `Plotting ${query}, ${t}.` };
  }

  const trans = raw.match(/^translate\s+(.+?)\s+to\s+([a-zA-Z]+)$/i);
  if (trans) {
    const url = `https://translate.google.com/?sl=auto&tl=${encodeURIComponent(trans[2])}&text=${encodeURIComponent(trans[1])}&op=translate`;
    ctx.openTab(url);
    return { handled: true, speech: `Translation opened, ${t}.` };
  }

  const mail = raw.match(/^(email|mail|e-mail)\s+(.+)/i);
  if (mail) {
    ctx.openTab("mailto:" + encodeURIComponent(mail[2].replace(/\s+at\s+/i, "@").replace(/\s+/g, "")));
    return { handled: true, speech: `Composing mail.` };
  }
  if (/^(open )?gmail$/.test(q)) {
    ctx.openTab(SITES.gmail);
    return { handled: true, speech: `Gmail, ${t}.` };
  }

  const call = raw.match(/^(call|phone|dial)\s+(.+)/i);
  if (call) {
    ctx.openTab("tel:" + call[2].replace(/[^\d+]/g, ""));
    return { handled: true, speech: `Dialling.` };
  }

  if (/^news\b|open news|today'?s news/.test(q)) {
    ctx.openTab(SITES.news);
    return { handled: true, speech: `News, ${t}.` };
  }

  const open = raw.match(/^(open|go to|goto|visit|launch|take me to|bring up)\s+(.+)/i);
  if (open) {
    const target = open[2].replace(/\.$/, "").trim();
    const url = asUrl(target);
    if (url) {
      if (IFRAME_OK.test(url)) ctx.openView(url, target);
      else {
        ctx.openTab(url);
        ctx.markExternal(url, target);
      }
      return { handled: true, speech: `Opening ${target}, ${t}.` };
    }
    const ddg = `https://duckduckgo.com/?q=${encodeURIComponent(target)}`;
    ctx.openView(ddg, target);
    return { handled: true, speech: `I could not resolve a site named ${target}. Searching instead.` };
  }

  if (/new tab/.test(q)) {
    ctx.openTab("https://duckduckgo.com");
    return { handled: true, speech: `New tab, ${t}.` };
  }

  const timer = q.match(/^(set |start )?(a |an )?(timer|alarm|countdown)/);
  if (timer) {
    const ms = parseDuration(q) || 60000;
    const mins = Math.round(ms / 600) / 100;
    ctx.timer(ms, "Timer");
    return { handled: true, speech: `Timer set for ${mins} minutes, ${t}.` };
  }
  const remind = raw.match(/^remind me (?:to |that )?(.+?)(?: in (.+))?$/i);
  if (remind) {
    const ms = remind[2] ? parseDuration(remind[2]) : 300000;
    ctx.timer(ms || 300000, remind[1]);
    return { handled: true, speech: `I shall remind you: ${remind[1]}.` };
  }

  if (/copy that|copy this|copy to clipboard/.test(q)) {
    await ctx.copyLast();
    return { handled: true, speech: `Copied, ${t}.` };
  }

  if (/battery/.test(q)) {
    const b = await ctx.battery();
    return { handled: true, speech: b };
  }

  if (/where am i|my location|locate me/.test(q)) {
    const loc = await ctx.locate();
    return { handled: true, speech: loc };
  }

  if (/help|what can you do|your commands|capabilities/.test(q) && q.length < 48) {
    return {
      handled: true,
      speech: `Voice only, ${t}. Say open YouTube, play a song, search for anything, go to a website, maps, news, camera, timer, fullscreen, screenshot, or just ask me a question. I will do it in this browser.`,
    };
  }

  return { handled: false };
}
