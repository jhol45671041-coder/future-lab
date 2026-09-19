/* ============================================================
   KID HUSTLE LAB — app logic
   Vanilla JS. No build step. State lives in localStorage.
   ============================================================ */
(function () {
  "use strict";
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const KEY = "khl.v1";

  /* ---------------- state ---------------- */
  const state = {
    answers: { age: null, vibe: null },
    filters: { q: "", cat: "all", mode: "all", age: "all", level: "all", free: false, sort: "match" },
    saved: [],
    ideaId: null,
    plan: { name: "", owner: "" },
    calc: { hours: null, rate: 15, mat: 0, jobs: 4 },
    split: { save: 50, spend: 35, give: 15 },
    gear: {},
    jobs: [],
    goal: { name: "", amount: 0 },
    flyer: { name: "", tag: "", contact: "", area: "", note: "Free estimate · Parent-approved · Cash or app", services: [] }
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      Object.keys(state).forEach(k => {
        if (saved[k] && typeof saved[k] === "object" && !Array.isArray(saved[k])) {
          Object.assign(state[k], saved[k]);
        } else if (saved[k] !== undefined) {
          state[k] = saved[k];
        }
      });
    } catch (e) { /* corrupted storage: start fresh */ }
  }
  let saveTimer = null;
  function flush() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 120);
  }
  /* never lose the last edit if the tab closes mid-debounce */
  window.addEventListener("pagehide", flush);
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });

  /* ---------------- helpers ---------------- */
  const money = n => "$" + Math.round(n).toLocaleString();
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = id => IDEAS.find(i => i.id === id);
  const catOf = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
  const ageBand = () => AGE_BANDS.find(b => b.id === state.answers.age) || null;
  /* "an 8-year-old" reads right, "a 11-year-old" does not. */
  const art = band => (/^(8|11|18)/.test(band.label) ? "an " : "a ") + band.label;
  const vibeOf = () => VIBES.find(v => v.id === state.answers.vibe) || null;
  const levelOf = id => LEVELS.find(l => l.id === +id) || LEVELS[0];
  const levelName = l => "Level " + l.id + " · " + l.name;
  /* "Free to start" is the whole point — count it from the data, never hard-code it. */
  const freeCount = () => IDEAS.filter(i => !i.startup).length;
  const freeCountFor = lvl => IDEAS.filter(i => i.level === +lvl && !i.startup).length;
  const countFor = lvl => IDEAS.filter(i => i.level === +lvl).length;

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("show"), 2600);
  }

  function fitsAge(idea) {
    const band = ageBand();
    if (!band) return true;
    return idea.ages[0] <= band.age && idea.ages[1] >= band.age;
  }
  function overlapsAge(idea) {
    const band = AGE_BANDS.find(b => b.id === state.filters.age);
    if (!band) return true;
    const lo = parseInt(band.id.split("-")[0], 10);
    const hi = parseInt(band.id.split("-")[1], 10);
    return idea.ages[0] <= hi && idea.ages[1] >= lo;
  }
  /* Sort key. Age legality dominates, then the exact percentage shown on the card,
     then tiebreakers weighted to total under 1 point so the badge order always
     reads top-to-bottom without jumping back up. */
  function matchScore(idea) {
    const band = ageBand();
    let s = 0;
    if (band) s += fitsAge(idea) ? 1000 : -1000;
    const m = matchInfo(idea);
    if (m && !m.warn) s += m.pct;
    if (idea.demand === "high") s += 0.35;
    if (idea.level === 1) s += 0.25;                     // easy to start
    if (idea.startup === 0) s += 0.15;                   // free to launch
    s += idea.payHigh / 2000;                            // mild lean to better pay
    return s;
  }

  /* Percentage shown on the badge — computed over the points actually scored,
     so 98% means "about as good as it gets" and 60% means "workable, not ideal". */
  function matchInfo(idea) {
    const band = ageBand(), vibe = vibeOf();
    if (!band && !vibe) return null;
    if (band && !fitsAge(idea)) return { warn: true, pct: 0 };
    let pts = 0, max = 0;
    if (band) { max += 60; pts += 60; }
    if (vibe) { max += 30; if (idea.mode === vibe.id) pts += 30; }
    max += 10;
    if (idea.demand === "high") pts += 5;
    if (idea.level === 1) pts += 3;
    if (idea.startup === 0) pts += 2;
    return { pct: Math.max(40, Math.min(98, Math.round(pts / max * 100))) };
  }
  const payPer = i => i.payLow + (i.payHigh - i.payLow) / 2;

  /* "45–75 min" / "1–2 hrs" / "3 hrs" → a starting estimate in hours, rounded to
     the nearest quarter hour so the price calculator opens with something sane. */
  function hoursFromTime(str) {
    const nums = (String(str).match(/\d+(?:\.\d+)?/g) || ["1"]).map(Number);
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    const hours = /min/i.test(str) ? avg / 60 : avg;
    return Math.max(0.25, Math.round(hours * 4) / 4);
  }

  /* ---------------- router ---------------- */
  const PAGES = ["find", "plan", "flyer", "earnings", "safety"];
  function route() {
    let h = (location.hash || "#/find").replace(/^#\/?/, "");
    let ideaParam = null;
    if (h.startsWith("idea/")) { ideaParam = h.slice(5); h = "find"; }
    if (PAGES.indexOf(h) === -1) h = "find";
    PAGES.forEach(p => {
      $("#page-" + p).classList.toggle("active", p === h);
    });
    $$(".nav a").forEach(a => {
      if (a.dataset.nav === h) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    document.title = {
      find: "Kid Hustle Lab — 35 real businesses a kid can start this weekend",
      plan: "My business plan — Kid Hustle Lab",
      flyer: "Make a flyer — Kid Hustle Lab",
      earnings: "Earnings tracker — Kid Hustle Lab",
      safety: "Safety rules — Kid Hustle Lab"
    }[h];
    if (ideaParam && byId(ideaParam)) openDrawer(ideaParam);
    if (h === "earnings") renderEarnings();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  /* ---------------- quiz chips ---------------- */
  function renderChips() {
    const ageC = $("#age-chips"), vibeC = $("#vibe-chips");
    ageC.innerHTML = AGE_BANDS.map(b =>
      `<button class="chip" data-age="${b.id}" aria-pressed="${state.answers.age === b.id}">${b.label} <small>· ${b.note}</small></button>`
    ).join("");
    vibeC.innerHTML = VIBES.map(v =>
      `<button class="chip" data-vibe="${v.id}" aria-pressed="${state.answers.vibe === v.id}">${v.emoji} ${v.label} <small>· ${v.hint}</small></button>`
    ).join("");
    ageC.onclick = e => {
      const b = e.target.closest("[data-age]"); if (!b) return;
      state.answers.age = state.answers.age === b.dataset.age ? null : b.dataset.age;
      renderChips(); updateQuizStatus(); save();
    };
    vibeC.onclick = e => {
      const b = e.target.closest("[data-vibe]"); if (!b) return;
      state.answers.vibe = state.answers.vibe === b.dataset.vibe ? null : b.dataset.vibe;
      renderChips(); updateQuizStatus(); save();
    };
  }
  function updateQuizStatus() {
    const a = ageBand(), v = vibeOf();
    const el = $("#quiz-status");
    if (a && v) el.textContent = `Nice — matches for ${art(a)} year old who likes ${v.label.toLowerCase()}.`;
    else if (a) el.textContent = "Now pick how you want to work.";
    else if (v) el.textContent = "Now pick your age so we filter the right jobs.";
    else el.textContent = "Pick both answers to get a personal shortlist.";
  }

  /* ---------------- free at every level ---------------- */
  /* Nothing on this site is locked, gated, or sold. These two renders keep the
     promise visible and keep every counter growing straight out of data.js,
     so a new idea updates the numbers everywhere automatically. */
  function renderFreePromise() {
    const F = FREE_PROMISE;
    const strip = $("#free-promise");
    if (strip && F) {
      const set = (key, text, sel) => { const el = $(sel || ("[data-free='" + key + "']"), strip); if (el) el.textContent = text; };
      set("badge", F.badge);
      set("headline", F.headline);
      set("body", F.body);
    }
    $$("[data-free='count-zero']").forEach(el => { el.textContent = freeCount(); });
    $$("[data-free='count-total']").forEach(el => { el.textContent = IDEAS.length; });
    const stat = $("#stat-free");
    if (stat) stat.textContent = freeCount();
  }

  function renderLevelLadder() {
    const host = $("#level-ladder");
    if (!host) return;
    const chosen = String(state.filters.level);
    host.innerHTML = LEVELS.map(l => {
      const active = chosen === String(l.id);
      return `<article class="level-card${active ? " is-active" : ""}" data-level="${l.id}" style="--tint:${l.tint}">
        <div class="level-top">
          <span class="level-emoji" aria-hidden="true">${l.emoji}</span>
          <span class="level-free">✓ Free · unlocked</span>
        </div>
        <h3>${esc(levelName(l))}</h3>
        <p class="level-cost">${esc(l.cost)}</p>
        <p class="level-blurb">${esc(l.blurb)}</p>
        <ul class="level-list">
          <li>${esc(l.unlocks)}</li>
          <li>${esc(l.gearLove)}</li>
        </ul>
        <div class="level-meta">
          <span><b>${countFor(l.id)}</b> ideas</span>
          <span><b>${freeCountFor(l.id)}</b> at $0 to start</span>
        </div>
        <button class="btn btn--sm level-btn" data-level-btn="${l.id}">${active ? "Showing " + esc(levelName(l)) : "Show " + esc(levelName(l)) + " ideas →"}</button>
      </article>`;
    }).join("");
  }

  function toggleLevel(id) {
    state.filters.level = String(state.filters.level) === String(id) ? "all" : String(id);
    renderFilters(); renderGrid(); save();
    const on = state.filters.level !== "all";
    toast(on ? levelName(levelOf(state.filters.level)) + " — every idea here is free ✓" : "Showing every level");
  }

  /* ---------------- filters ---------------- */
  function renderFilters() {
    $("#f-cat").innerHTML = `<option value="all">All categories</option>` +
      CATEGORIES.map(c => `<option value="${c.id}">${c.emoji} ${c.name}</option>`).join("");
    $("#f-mode").innerHTML = `<option value="all">Any work style</option>` +
      VIBES.map(v => `<option value="${v.id}">${v.emoji} ${v.label}</option>`).join("");
    $("#f-age").innerHTML = `<option value="all">Any age</option>` +
      AGE_BANDS.map(b => `<option value="${b.id}">${b.label} years old</option>`).join("");
    $("#f-level").innerHTML = `<option value="all">All levels</option>` +
      LEVELS.map(l => `<option value="${l.id}">${l.emoji} ${levelName(l)}</option>`).join("");
    $("#f-cat").value = state.filters.cat;
    $("#f-mode").value = state.filters.mode;
    $("#f-age").value = state.filters.age;
    $("#f-level").value = state.filters.level;
    $("#f-sort").value = state.filters.sort;
    $("#q").value = state.filters.q;

    const set = (k, v) => { state.filters[k] = v; save(); renderGrid(); };
    $("#f-cat").onchange   = e => set("cat", e.target.value);
    $("#f-mode").onchange  = e => set("mode", e.target.value);
    $("#f-age").onchange   = e => set("age", e.target.value);
    $("#f-level").onchange = e => set("level", e.target.value);
    $("#f-sort").onchange  = e => set("sort", e.target.value);
    const freeBtn = $("#btn-free-only");
    if (freeBtn) {
      freeBtn.setAttribute("aria-pressed", state.filters.free ? "true" : "false");
      freeBtn.onclick = () => {
        state.filters.free = !state.filters.free;
        freeBtn.setAttribute("aria-pressed", state.filters.free ? "true" : "false");
        renderGrid(); save();
        toast(state.filters.free
          ? freeCount() + " ideas need $0 to start — all levels stay free"
          : "Showing every idea again");
      };
    }
    let qt = null;
    $("#q").oninput = e => {
      clearTimeout(qt);
      const v = e.target.value;
      qt = setTimeout(() => set("q", v.trim().toLowerCase()), 160);
    };
    $("#btn-clear-filters").onclick = clearFilters;
  }

  /* One reset path, so a new filter can never be forgotten in one of the copies. */
  function clearFilters() {
    state.filters = { q: "", cat: "all", mode: "all", age: "all", level: "all", free: false, sort: "match" };
    renderFilters(); renderGrid(); save();
  }

  /* ---------------- grid ---------------- */
  function visibleIdeas() {
    const f = state.filters;
    let list = IDEAS.filter(i => {
      if (f.cat !== "all" && i.cat !== f.cat) return false;
      if (f.mode !== "all" && i.mode !== f.mode) return false;
      if (f.age !== "all" && !overlapsAge(i)) return false;
      if (f.level !== "all" && String(i.level) !== String(f.level)) return false;
      if (f.free && i.startup) return false;                 /* the "$0 to start only" switch */
      if (f.q) {
        const hay = (i.title + " " + i.tagline + " " + i.cat + " " + i.mode + " " + i.why.join(" ") + " " + i.gear.join(" ") + " " + i.steps.join(" ")).toLowerCase();
        if (hay.indexOf(f.q) === -1) return false;
      }
      return true;
    });
    const sorters = {
      match: (a, b) => matchScore(b) - matchScore(a) || a.title.localeCompare(b.title),
      pay:   (a, b) => b.payHigh - a.payHigh || a.title.localeCompare(b.title),
      easy:  (a, b) => a.level - b.level || a.startup - b.startup || a.title.localeCompare(b.title),
      cheap: (a, b) => a.startup - b.startup || a.level - b.level || a.title.localeCompare(b.title),
      az:    (a, b) => a.title.localeCompare(b.title)
    };
    return list.sort(sorters[f.sort] || sorters.match);
  }

  function cardHTML(i) {
    const c = catOf(i.cat);
    const m = matchInfo(i);
    const isSaved = state.saved.indexOf(i.id) > -1;
    return `<article class="card${i.startup === 0 ? " is-free" : ""}" data-idea="${i.id}">
      <span class="cat-strip" style="background:${c.color}"></span>
      <div class="card-top">
        <span class="card-emoji" aria-hidden="true">${i.emoji}</span>
        <div>
          <h3>${esc(i.title)}</h3>
          <p class="card-tag">${c.emoji} ${c.name} · ${i.seasons}</p>
        </div>
      </div>
      <div class="badges">
        <span class="badge badge--age">Ages ${i.ages[0]}–${i.ages[1]}</span>
        <span class="badge badge--pay">${i.price} / ${i.payUnit}</span>
        ${m && m.warn ? `<span class="badge badge--mismatch">Too old/young for this one yet</span>` : ""}
        ${m && !m.warn ? `<span class="badge badge--match">${m.pct}% match</span>` : ""}
        <span class="badge badge--level" style="--tint:${levelOf(i.level).tint}">${levelName(levelOf(i.level))} · free</span>
        <span class="badge badge--start">${i.startup === 0 ? "No startup cost" : "Starts at $" + i.startup}</span>
      </div>
      <p class="card-body">${esc(i.tagline)}</p>
      <div class="card-foot">
        <button class="btn btn--sm" data-open="${i.id}">Open the playbook</button>
        <button class="icon-btn${isSaved ? " is-on" : ""}" data-save="${i.id}" aria-label="${isSaved ? "Remove from saved" : "Save idea"}" title="Save for later">${isSaved ? "★" : "☆"}</button>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = visibleIdeas();
    const grid = $("#grid");
    grid.innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<div class="empty"><span class="big">🤔</span><h3>No ideas match that yet</h3><p>Try resetting the filters or searching a simpler word like “dog” or “yard”.</p><button class="btn" id="empty-reset">Reset filters</button></div>`;
    const er = $("#empty-reset");
    if (er) er.onclick = clearFilters;

    $("#result-count").textContent = list.length + (list.length === 1 ? " idea" : " ideas") +
      (state.filters.free ? " · $0 to start" : "");
    const a = ageBand(), v = vibeOf();
    $("#results-title").textContent = (a || v)
      ? `Ideas for ${a ? art(a) + " year old" : "you"}${v ? " who likes " + v.label.toLowerCase() : ""}`
      : `All ${IDEAS.length} ideas`;
    $("#results-sub").textContent = state.filters.free
      ? `Showing only the ${freeCount()} jobs that need $0 to start — every level stays free.`
      : (a || v)
        ? `Sorted so the best fits come first. Every level is free — open any card for prices, gear, and the exact words to use.`
        : `Browse everything — all ${IDEAS.length} playbooks are free and unlocked, or answer the two questions above for a shortlist built around you.`;
    $("#stat-ideas").textContent = IDEAS.length;
    $("#stat-top").textContent = money(Math.max.apply(null, IDEAS.map(i => i.payHigh)));
    renderLevelLadder();
  }

  /* ---------------- drawer ---------------- */
  let drawerIdea = null;
  function openDrawer(id) {
    const i = byId(id); if (!i) return;
    drawerIdea = i;
    const c = catOf(i.cat);
    $("#drawer-emoji").textContent = i.emoji;
    $("#drawer-title").textContent = i.title;
    $("#drawer-tag").textContent = `${c.emoji} ${c.name} · ages ${i.ages[0]}–${i.ages[1]} · ${i.seasons}`;
    $("#drawer-money").innerHTML = `
      <div class="money-cell"><span>Level</span><b>${levelOf(i.level).emoji} ${levelName(levelOf(i.level))}</b></div>
      <div class="money-cell"><span>Typical price</span><b>${i.price}</b></div>
      <div class="money-cell"><span>Per</span><b>${i.payUnit}</b></div>
      <div class="money-cell"><span>Time per job</span><b>${i.time}</b></div>
      <div class="money-cell"><span>Startup cost</span><b>${i.startup === 0 ? "$0 · free" : "$" + i.startup}</b></div>`;
    const tabs = $$("#drawer-tabs button");
    tabs.forEach(t => t.setAttribute("aria-selected", t.dataset.tab === "start" ? "true" : "false"));
    renderDrawerTab("start");
    const saveBtn = $("#drawer-save");
    saveBtn.textContent = state.saved.indexOf(i.id) > -1 ? "★ Saved" : "☆ Save";
    $("#drawer").hidden = false;
    requestAnimationFrame(() => {
      $("#drawer").classList.add("open");
      $("#backdrop").classList.add("open");
    });
    document.body.style.overflow = "hidden";
    $("#drawer-close").focus();
  }
  function closeDrawer() {
    $("#drawer").classList.remove("open");
    $("#backdrop").classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(() => { $("#drawer").hidden = true; }, 280);
  }
  function renderDrawerTab(tab) {
    const i = drawerIdea; if (!i) return;
    const body = $("#drawer-body");
    if (tab === "start") {
      body.innerHTML = `
        <p style="font-weight:700">${esc(i.tagline)}</p>
        <h3>Why this one works</h3>
        <ul class="list">${i.why.map(w => `<li>${esc(w)}</li>`).join("")}</ul>
        <h3>Your first week, step by step</h3>
        <ol class="list" style="counter-reset:s">${i.steps.map((s, n) => `<li><b>${n + 1}.</b> <span>${esc(s)}</span></li>`).join("")}</ol>
        <h3>Level up</h3>
        <p style="font-weight:600">${esc(i.upsell)}</p>`;
    } else if (tab === "gear") {
      body.innerHTML = `
        <h3>What you need</h3>
        <ul class="list list--check">${i.gear.map(g => `<li>${esc(g)}</li>`).join("")}</ul>
        <p class="quiz-hint">Add this to your plan and it becomes a tickable checklist.</p>`;
    } else if (tab === "pitch") {
      body.innerHTML = `
        <h3>Say exactly this</h3>
        <div class="say">${esc(i.script)}</div>
        <h3 style="margin-top:1.2rem">Where customers come from</h3>
        <ul class="list">
          <li>Neighbors you already know — start here, always.</li>
          <li>Parents' friends and coworkers who live nearby.</li>
          <li>A parent-approved post in a community group.</li>
          <li>Teachers, coaches, and church families.</li>
          <li>Anyone who says yes becomes a repeat customer — ask them who else needs help.</li>
        </ul>
        <h3>Answering “how much?”</h3>
        <p style="font-weight:600">Give the number and stop talking. ${esc(i.price)} per ${i.payUnit}. If they hesitate, offer a smaller first job — never a lower price.</p>`;
    } else {
      body.innerHTML = `
        <h3>Safety rules for this job</h3>
        <ul class="list list--warn">${i.safety.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
        <h3>Before the first paid job</h3>
        <ul class="list list--check">
          <li>A parent has met the customer or knows the family.</li>
          <li>Price and job are written down in a text message.</li>
          <li>You know what to do if you get hurt or feel unsafe: stop and call home.</li>
        </ul>`;
    }
  }
  $$("#drawer-tabs button").forEach(b => {
    b.addEventListener("click", () => {
      $$("#drawer-tabs button").forEach(x => x.setAttribute("aria-selected", "false"));
      b.setAttribute("aria-selected", "true");
      renderDrawerTab(b.dataset.tab);
    });
  });
  $("#drawer-close").onclick = closeDrawer;
  $("#backdrop").onclick = closeDrawer;
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#drawer").hidden) closeDrawer(); });
  $("#drawer-save").onclick = () => {
    const id = drawerIdea.id, idx = state.saved.indexOf(id);
    if (idx > -1) { state.saved.splice(idx, 1); toast("Removed from your list"); }
    else { state.saved.push(id); toast("Saved ★"); }
    $("#drawer-save").textContent = state.saved.indexOf(id) > -1 ? "★ Saved" : "☆ Save";
    const btn = document.querySelector(`[data-save="${id}"]`);
    if (btn) { btn.classList.toggle("is-on", state.saved.indexOf(id) > -1); btn.textContent = state.saved.indexOf(id) > -1 ? "★" : "☆"; }
    save();
  };
  $("#drawer-plan").onclick = () => {
    setIdea(drawerIdea.id);
    closeDrawer();
    location.hash = "#/plan";
    toast("Plan set to " + drawerIdea.title);
  };

  /* grid clicks (delegated) */
  $("#grid").addEventListener("click", e => {
    const open = e.target.closest("[data-open]");
    if (open) { openDrawer(open.dataset.open); return; }
    const s = e.target.closest("[data-save]");
    if (s) {
      const id = s.dataset.save, idx = state.saved.indexOf(id);
      if (idx > -1) { state.saved.splice(idx, 1); toast("Removed from your list"); }
      else { state.saved.push(id); toast("Saved ★"); }
      s.classList.toggle("is-on", state.saved.indexOf(id) > -1);
      s.textContent = state.saved.indexOf(id) > -1 ? "★" : "☆";
      save();
      return;
    }
    const card = e.target.closest(".card");
    if (card) openDrawer(card.dataset.idea);
  });

  /* ---------------- plan page ---------------- */
  function setIdea(id) {
    const i = byId(id); if (!i) return;
    state.ideaId = id;
    state.calc.hours = hoursFromTime(i.time);
    state.calc.mat = i.mat || 0;
    state.calc.rate = seedRate(i, state.calc.hours);
    if (!state.plan.name) {
      state.plan.name = suggestName(i);
    }
    if (!state.flyer.name) {
      state.flyer.name = state.plan.name;
      state.flyer.tag = i.tagline;
      state.flyer.services = [{ label: i.title, price: i.price + " / " + i.payUnit }];
    }
    save();
    renderPlan();
  }
  function suggestName(idea) {
    const pick = a => a[Math.floor(Math.random() * a.length)];
    const catWord = { home: "Yard", animals: "Paws", digital: "Pixel", craft: "Craft", organize: "Tidy" }[idea.cat] || "Street";
    const patterns = [
      () => `${pick(NAME_PARTS.first)} ${catWord} ${pick(NAME_PARTS.suffix)}`,
      () => `${pick(NAME_PARTS.first)} ${pick(NAME_PARTS.second)} ${pick(NAME_PARTS.suffix)}`,
      () => `The ${pick(NAME_PARTS.first)} ${catWord} Club`,
      () => `${idea.title.split(" ")[0]} ${pick(NAME_PARTS.suffix)}`,
      () => `${pick(NAME_PARTS.first)} ${pick(NAME_PARTS.second)} ${pick(NAME_PARTS.suffix)}`
    ];
    return pick(patterns)();
  }

  function renderPlan() {
    const sel = $("#plan-idea");
    sel.innerHTML = CATEGORIES.map(c => {
      const ideas = IDEAS.filter(i => i.cat === c.id);
      return `<optgroup label="${c.emoji} ${c.name}">${ideas.map(i => `<option value="${i.id}">${i.title} — ${i.price}/${i.payUnit}</option>`).join("")}</optgroup>`;
    }).join("");
    if (!state.ideaId) state.ideaId = IDEAS[0].id;
    sel.value = state.ideaId;

    const i = byId(state.ideaId);
    if (!state.calc.hours) state.calc.hours = hoursFromTime(i.time);
    if (state.calc.mat === null || state.calc.mat === undefined || state.calc.mat === "") state.calc.mat = i.mat || 0;
    if (state.calc.rate === null || state.calc.rate === undefined || state.calc.rate === "") state.calc.rate = seedRate(i, state.calc.hours);

    $("#plan-name").value = state.plan.name || "";
    $("#plan-owner").value = state.plan.owner || "";
    $("#calc-hours").value = state.calc.hours;
    $("#calc-rate").value = state.calc.rate;
    $("#calc-mat").value = state.calc.mat;
    $("#calc-jobs").value = state.calc.jobs;
    $("#pct-save").value = state.split.save;
    $("#pct-spend").value = state.split.spend;
    $("#pct-give").value = state.split.give;

    renderCalc();
    renderSplit();
    renderGear(i);
    renderPlanSummary(i);
  }

  /* Open each idea with a rate that lands the suggested price inside the real
     going rate for that job — then let the kid move the slider and see the warning. */
  function seedRate(idea, hours) {
    const mid = payPer(idea);
    if (idea.payUnit === "hour") return clampRate(Math.round(mid));
    return clampRate(Math.round((mid - (idea.mat || 0)) / (hours || 1)));
  }
  const clampRate = r => Math.max(3, Math.min(60, r));

  /* Two pricing models: jobs you quote flat (a lawn, a car, a website) and jobs
     you quote hourly (babysitting, organizing). The market check has to compare
     like with like, or every hourly job looks overpriced. */
  function calcModel() {
    const i = byId(state.ideaId);
    const h = Math.max(0.25, parseFloat(state.calc.hours) || 1);
    const r = clampRate(Math.round(parseFloat(state.calc.rate) || 15));
    const m = Math.max(0, parseFloat(state.calc.mat) || 0);
    const jobs = Math.max(1, parseInt(state.calc.jobs, 10) || 1);
    const hourly = i.payUnit === "hour";
    const unit = hourly ? r : Math.max(5, Math.round((h * r + m) / 5) * 5);   // the number you quote
    const perJob = hourly ? Math.round(h * r + m) : unit;
    return { idea: i, h, r, m, jobs, hourly, unit, perJob, week: perJob * jobs };
  }

  function renderCalc() {
    const { idea: i, h, r, m, hourly, unit, perJob, week } = calcModel();

    $("#calc-price").textContent = money(unit);
    $("#calc-price-label").textContent = hourly ? "Charge per hour" : "Charge per job";
    $("#calc-perjob").textContent = hourly ? money(perJob) + " / job" : money(perJob);
    $("#calc-perjob-label").textContent = hourly ? "Total for " + (Math.round(h * 100) / 100) + " hrs" : "Per job";
    $("#calc-week").textContent  = money(week);
    $("#calc-month").textContent = money(week * 4.33);

    let note;
    if (unit < i.payLow) {
      note = `Heads up: the going rate for ${i.title.toLowerCase()} is ${i.price} per ${i.payUnit}. Charging ${money(unit)} might make customers suspicious of quality — nudge your rate up.`;
    } else if (unit > i.payHigh) {
      note = `That's above the typical ${i.price} range. It's fine if you're experienced, bundled, or very fast — just be ready to explain why.`;
    } else {
      note = `Right in the going rate for this job (${i.price} per ${i.payUnit}). Quote it confidently and stop talking.`;
    }
    $("#calc-note").textContent = note;

    const kit = i.startup || 0;
    const kitEl = $("#calc-kit");
    if (kit > 0) {
      const back = Math.max(1, Math.ceil(kit / Math.max(1, unit - m)));
      kitEl.textContent = `Your starter kit costs about $${kit} — roughly ${back} job${back === 1 ? "" : "s"} to earn it back, then it's all profit.`;
    } else {
      kitEl.textContent = "No kit to buy — this one is free to start.";
    }
    save();
  }

  function renderSplit() {
    const s = state.split;
    $("#split-legend").innerHTML = MONEY_SPLIT.map(m => `<div class="split-item"><span class="dot" style="background:${m.color}"></span><b>${m.label} ${s[m.id]}%</b> — ${m.why}</div>`).join("");
    const total = (+s.save || 0) + (+s.spend || 0) + (+s.give || 0);
    const w = $("#split-warning");
    if (total !== 100) { w.textContent = `Your percentages add up to ${total}% — adjust them to equal 100%.`; w.style.color = "#c92a2a"; }
    else { w.textContent = "Perfect — that adds up to 100%."; w.style.color = "#0ca678"; }
    return total === 100;
  }

  function renderGear(i) {
    state.gear[i.id] = state.gear[i.id] || {};
    const g = state.gear[i.id];
    $("#gear-list").innerHTML = i.gear.map((item, n) => `
      <li><input type="checkbox" id="gear-${n}" data-gear="${n}" ${g[n] ? "checked" : ""}>
      <span>${esc(item)}</span></li>`).join("");
    $("#gear-list").onchange = e => {
      const cb = e.target.closest("[data-gear]"); if (!cb) return;
      g[cb.dataset.gear] = cb.checked;
      save();
    };
  }

  function renderPlanSummary(i) {
    const c = catOf(i.cat);
    const name = state.plan.name || "(name your business)";
    const owner = state.plan.owner || "you";
    const total = (+state.split.save || 0) + (+state.split.spend || 0) + (+state.split.give || 0);
    $("#plan-summary").innerHTML = `
      <p style="font-family:var(--font-display);font-weight:800;font-size:1.5rem;margin-bottom:.2rem">${esc(name)}</p>
      <p class="card-tag" style="margin-bottom:.9rem">Run by ${esc(owner)} · ${c.emoji} ${c.name} · ${esc(i.title)}</p>
      <div class="badges">
        <span class="badge badge--level" style="--tint:${levelOf(i.level).tint}">${levelName(levelOf(i.level))} · free</span>
        <span class="badge badge--age">Ages ${i.ages[0]}–${i.ages[1]}</span>
        <span class="badge badge--pay">${i.price} / ${i.payUnit}</span>
        <span class="badge badge--mode">${i.time} per job</span>
        <span class="badge badge--start">${i.startup === 0 ? "Free to start" : "$" + i.startup + " to start"}</span>
      </div>
      <h3>My pitch</h3>
      <div class="say">${esc(i.script)}</div>
      <h3 style="margin-top:1.1rem">First three moves</h3>
      <ol class="list">${i.steps.slice(0, 3).map((s, n) => `<li><b>${n + 1}.</b> <span>${esc(s)}</span></li>`).join("")}</ol>
      <p class="quiz-hint">Money split: ${state.split.save}% save · ${state.split.spend}% spend · ${state.split.give}% give${total !== 100 ? " (needs fixing)" : ""}.</p>`;
    $("#ag-kid-text").textContent = state.plan.owner || "________";
    $("#ag-biz-text").textContent = state.plan.name || "________";
    $("#ag-kid-name").textContent = state.plan.owner || "\u00a0";   /* never print a literal &nbsp; */
    $("#ag-kid-name").style.fontStyle = state.plan.owner ? "normal" : "normal";
    $("#ag-split").textContent = `${state.split.save} / ${state.split.spend} / ${state.split.give}`;
  }

  function initPlan() {
    $("#plan-idea").onchange = e => { setIdea(e.target.value); };
    $("#btn-name").onclick = () => {
      state.plan.name = suggestName(byId(state.ideaId));
      $("#plan-name").value = state.plan.name;
      renderPlanSummary(byId(state.ideaId)); save();
      toast("New name: " + state.plan.name);
    };
    $("#btn-name-try").onclick = $("#btn-name").onclick;
    $("#plan-name").oninput = e => { state.plan.name = e.target.value; renderPlanSummary(byId(state.ideaId)); save(); };
    $("#plan-owner").oninput = e => { state.plan.owner = e.target.value; renderPlanSummary(byId(state.ideaId)); save(); };
    ["calc-hours", "calc-rate", "calc-mat", "calc-jobs"].forEach(id => {
      $("#" + id).oninput = e => {
        const key = id.replace("calc-", "");
        state.calc[key] = e.target.value === "" ? "" : parseFloat(e.target.value);
        renderCalc();
      };
    });
    ["save", "spend", "give"].forEach(k => {
      $("#pct-" + k).oninput = e => {
        state.split[k] = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
        renderSplit(); renderPlanSummary(byId(state.ideaId)); save();
      };
    });
    $("#btn-print-plan").onclick = () => printSection("plan");
    $("#btn-to-flyer").onclick = () => { fillFlyerFromPlan(); location.hash = "#/flyer"; };
  }

  /* ---------------- flyer ---------------- */
  function fillFlyerFromPlan() {
    const i = byId(state.ideaId);
    state.flyer.name = state.plan.name || state.flyer.name || suggestName(i);
    state.flyer.tag = i.tagline;
    state.flyer.services = [
      { label: i.title, price: i.price + " / " + i.payUnit },
      { label: "Bundle / repeat visits", price: "ask for a discount price" }
    ];
    save();
    renderFlyerForm();
    renderFlyer();
  }
  function renderFlyerForm() {
    const f = state.flyer;
    $("#fl-name").value = f.name; $("#fl-tag").value = f.tag;
    $("#fl-contact").value = f.contact; $("#fl-area").value = f.area; $("#fl-note").value = f.note;
    if (!f.services.length) f.services = [{ label: "", price: "" }];
    $("#fl-services").innerHTML = f.services.map((s, n) => `
      <div class="field-row" style="margin-bottom:.5rem">
        <input class="txt" data-svc="${n}" data-k="label" type="text" placeholder="What you do" value="${esc(s.label)}">
        <input class="txt" data-svc="${n}" data-k="price" type="text" placeholder="$25 / yard" value="${esc(s.price)}">
        <button class="btn btn--ghost btn--sm" data-delsvc="${n}" aria-label="Remove service">✕</button>
      </div>`).join("");
  }
  function renderFlyer() {
    const f = state.flyer;
    const svc = f.services.filter(s => s.label || s.price);
    $("#flyer-out").innerHTML = `
      <div class="flyer-top">
        <div class="flyer-stars">★★★</div>
        <h2>${esc(f.name || "Your Business Name")}</h2>
        <p class="flyer-sub">${esc(f.tag || "Add your one-line promise")}</p>
      </div>
      <ul>
        ${svc.length ? svc.map(s => `<li><span>${esc(s.label)}</span><b>${esc(s.price)}</b></li>`).join("")
                    : `<li><span>List your services</span><b>with prices</b></li>`}
      </ul>
      <p style="font-weight:700;text-align:center">
        ${f.area ? "Serving " + esc(f.area) + ". " : ""}Friendly, local, and reliable — booked by neighbors, for neighbors.
      </p>
      <div class="flyer-foot">
        <p style="margin:0 0 .3rem">${esc(f.contact || "Write how to reach you here")}</p>
        <p style="margin:0;font-size:.82rem;font-weight:600;color:#565269">${esc(f.note || "")}</p>
      </div>`;
  }
  function initFlyer() {
    renderFlyerForm(); renderFlyer();
    [["fl-name", "name"], ["fl-tag", "tag"], ["fl-contact", "contact"], ["fl-area", "area"], ["fl-note", "note"]].forEach(pair => {
      const el = $("#" + pair[0]);
      el.oninput = e => { state.flyer[pair[1]] = e.target.value; renderFlyer(); save(); };
    });
    $("#fl-services").oninput = e => {
      const el = e.target.closest("[data-svc]"); if (!el) return;
      state.flyer.services[+el.dataset.svc][el.dataset.k] = el.value;
      renderFlyer(); save();
    };
    $("#fl-services").onclick = e => {
      const d = e.target.closest("[data-delsvc]"); if (!d) return;
      state.flyer.services.splice(+d.dataset.delsvc, 1);
      if (!state.flyer.services.length) state.flyer.services = [{ label: "", price: "" }];
      renderFlyerForm(); renderFlyer(); save();
    };
    $("#btn-add-service").onclick = () => {
      state.flyer.services.push({ label: "", price: "" });
      renderFlyerForm(); renderFlyer(); save();
      const inputs = $$("#fl-services input"); if (inputs.length) inputs[inputs.length - 2].focus();
    };
    $("#btn-flyer-from-plan").onclick = () => { fillFlyerFromPlan(); toast("Flyer filled from your plan"); };
    $("#btn-save-flyer").onclick = () => { save(); toast("Flyer details saved"); };
    $("#btn-print-flyer").onclick = () => printSection("flyer");
  }

  /* ---------------- earnings ---------------- */
  function totals() {
    const t = state.jobs.reduce((a, j) => a + (+j.amount || 0), 0);
    const byCustomer = {};
    state.jobs.forEach(j => { if (j.customer) byCustomer[j.customer] = (byCustomer[j.customer] || 0) + (+j.amount || 0); });
    const best = Object.keys(byCustomer).sort((a, b) => byCustomer[b] - byCustomer[a])[0];
    return {
      total: t,
      count: state.jobs.length,
      avg: state.jobs.length ? t / state.jobs.length : 0,
      best: best ? best + " (" + money(byCustomer[best]) + ")" : "—"
    };
  }
  function renderEarnings() {
    const t = totals();
    const pct = state.goal.amount > 0 ? Math.min(100, (t.total * (state.split.save / 100)) / state.goal.amount * 100) : 0;
    $("#earn-stats").innerHTML = `
      <div class="stat"><b>${money(t.total)}</b><span>Total earned</span></div>
      <div class="stat"><b>${t.count}</b><span>Jobs done</span></div>
      <div class="stat"><b>${money(t.avg)}</b><span>Average per job</span></div>
      <div class="stat"><b>${money(t.total * (state.split.save / 100))}</b><span>Into savings</span></div>
      <div class="stat"><b style="font-size:1.05rem">${esc(t.best)}</b><span>Best customer</span></div>`;
    $("#goal-name").value = state.goal.name;
    $("#goal-amount").value = state.goal.amount || "";
    $("#goal-bar").style.width = pct.toFixed(1) + "%";
    $("#goal-text").textContent = state.goal.amount > 0
      ? `${money(t.total * (state.split.save / 100))} of ${money(state.goal.amount)} saved toward ${state.goal.name || "your goal"} — ${pct.toFixed(0)}% of the way there.`
      : "Set a goal and watch it fill up.";

    $("#split-bars").innerHTML = MONEY_SPLIT.map(m => {
      const amt = t.total * (state.split[m.id] / 100);
      return `<div style="margin-bottom:.9rem">
        <div style="display:flex;justify-content:space-between;font-weight:800;font-family:var(--font-display)">
          <span>${m.label} · ${state.split[m.id]}%</span><span>${money(amt)}</span></div>
        <div class="bar-wrap" style="height:18px"><div class="bar" style="width:${state.split[m.id]}%;background:${m.color}"></div></div>
        <p class="quiz-hint" style="margin:.2rem 0 0">${m.why}</p>
      </div>`;
    }).join("");

    const rows = state.jobs.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    $("#jobs-body").innerHTML = rows.length ? rows.map(j => `
      <tr>
        <td>${esc(j.date || "")}</td>
        <td>${esc(j.customer || "—")}</td>
        <td>${esc(j.what || "—")}</td>
        <td class="num">${money(j.amount || 0)}</td>
        <td class="no-print"><button class="icon-btn" data-deljob="${j.id}" aria-label="Delete job" style="width:32px;height:32px;font-size:.9rem">✕</button></td>
      </tr>`).join("")
      : `<tr><td colspan="5" style="padding:1.2rem .5rem;color:var(--ink-soft)">No jobs logged yet. Your first one goes here — even a $5 job counts.</td></tr>`;
  }
  function initEarnings() {
    const today = new Date().toISOString().slice(0, 10);
    $("#job-date").value = today;
    $("#btn-add-job").onclick = () => {
      const amount = parseFloat($("#job-amount").value);
      if (!amount || amount <= 0) { toast("Add the amount you got paid"); $("#job-amount").focus(); return; }
      state.jobs.push({
        id: "j" + Date.now(),
        date: $("#job-date").value || today,
        customer: $("#job-customer").value.trim(),
        what: $("#job-what").value.trim() || (byId(state.ideaId) || {}).title || "",
        amount: amount
      });
      $("#job-amount").value = ""; $("#job-customer").value = ""; $("#job-what").value = "";
      save(); renderEarnings();
      toast("Logged " + money(amount) + " 💪");
    };
    $("#jobs-body").onclick = e => {
      const d = e.target.closest("[data-deljob]"); if (!d) return;
      state.jobs = state.jobs.filter(j => j.id !== d.dataset.deljob);
      save(); renderEarnings();
    };
    $("#goal-name").oninput = e => { state.goal.name = e.target.value; save(); renderEarnings(); };
    $("#goal-amount").oninput = e => { state.goal.amount = parseFloat(e.target.value) || 0; save(); renderEarnings(); };
    $("#btn-export").onclick = () => {
      const t = totals();
      const lines = [
        "KID HUSTLE LAB — earnings report",
        "Business: " + (state.plan.name || "unnamed"),
        "Owner: " + (state.plan.owner || "—"),
        "Total earned: " + money(t.total) + " across " + t.count + " jobs (avg " + money(t.avg) + ")",
        "Split: " + state.split.save + "% save / " + state.split.spend + "% spend / " + state.split.give + "% give",
        "",
        "Date | Customer | Job | Paid"
      ].concat(state.jobs.map(j => `${j.date} | ${j.customer || "—"} | ${j.what || "—"} | ${money(j.amount || 0)}`));
      const text = lines.join("\n");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => toast("Report copied to clipboard 📋"),
          () => window.prompt("Copy your report:", text)
        );
      } else window.prompt("Copy your report:", text);
    };
  }

  /* ---------------- safety page ---------------- */
  function renderSafety() {
    $("#rule-grid").innerHTML = SAFETY_RULES.map(r => `
      <article class="rule"><span class="ico" aria-hidden="true">${r.icon}</span>
      <h3>${esc(r.title)}</h3><p>${esc(r.text)}</p></article>`).join("");
    $("#parent-list").innerHTML = PARENT_CHECKLIST.map((c, n) =>
      `<li><input type="checkbox" id="pc-${n}"><span>${esc(c)}</span></li>`).join("");
    $("#btn-print-agreement").onclick = () => printSection("safety");
  }

  /* ---------------- print ---------------- */
  function printSection(which) {
    const host = $("#print-root");
    let html = "";
    const i = byId(state.ideaId);
    if (which === "plan") {
      html = `
        <h1>${esc(state.plan.name || "My business plan")}</h1>
        <p><strong>Owner:</strong> ${esc(state.plan.owner || "________")} &nbsp;|&nbsp; <strong>Business:</strong> ${esc(i.title)} &nbsp;|&nbsp; <strong>Ages:</strong> ${i.ages[0]}–${i.ages[1]}</p>
        <h2>What I sell</h2>
        <p>${esc(i.tagline)}</p>
        <p><strong>Price:</strong> ${$("#calc-price").textContent} per ${i.payUnit} &nbsp;·&nbsp; <strong>Time:</strong> ${i.time} &nbsp;·&nbsp; <strong>Weekly goal:</strong> ${$("#calc-jobs").value} jobs</p>
        <h2>My pitch (say this out loud)</h2>
        <p><em>${esc(i.script)}</em></p>
        <h2>Gear checklist</h2>
        <ul>${i.gear.map(g => `<li>&#9744; ${esc(g)}</li>`).join("")}</ul>
        <h2>First three moves</h2>
        <ol>${i.steps.slice(0, 5).map(s => `<li>${esc(s)}</li>`).join("")}</ol>
        <h2>Safety for this job</h2>
        <ul>${i.safety.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
        <h2>Money split</h2>
        <p>${state.split.save}% save · ${state.split.spend}% spend · ${state.split.give}% give &nbsp;|&nbsp; Goal profit: ${$("#calc-week").textContent} / week</p>
        <p style="margin-top:1.5rem">Kid signature: _______________________ &nbsp;&nbsp; Parent signature: _______________________</p>`;
    } else if (which === "flyer") {
      html = `<div class="flyer">${$("#flyer-out").innerHTML}</div>`;
    } else {
      const i2 = byId(state.ideaId);
      html = `
        <h1>Safety agreement — ${esc(state.plan.name || "our family business")}</h1>
        <p>We agree that <strong>${esc(state.plan.owner || "________")}</strong> runs <strong>${esc(state.plan.name || "________")}</strong> (${esc(i2.title)}) under these rules:</p>
        <ol>${SAFETY_RULES.map(r => `<li><strong>${esc(r.title)}:</strong> ${esc(r.text)}</li>`).join("")}</ol>
        <h2>Parent setup checklist</h2>
        <ul>${PARENT_CHECKLIST.map(c => `<li>&#9744; ${esc(c)}</li>`).join("")}</ul>
        <h2>Job rules</h2>
        <ul>
          <li>Jobs only with a parent's knowledge, for customers our family knows or has met.</li>
          <li>Work never gets in the way of school, sleep, or family plans.</li>
          <li>Money split: ${state.split.save}% save / ${state.split.spend}% spend / ${state.split.give}% give.</li>
          <li>Either of us can pause the business at any time to fix a problem.</li>
        </ul>
        <p style="margin-top:2rem">Kid signature: _______________________ &nbsp;&nbsp; Parent signature: _______________________ &nbsp;&nbsp; Date: ____________</p>`;
    }
    host.innerHTML = html;
    document.body.classList.add("print-mode");
    window.print();
    setTimeout(() => { document.body.classList.remove("print-mode"); host.innerHTML = ""; }, 400);
  }

  /* ---------------- boot ---------------- */
  function boot() {
    load();
    renderFreePromise();
    renderChips();
    updateQuizStatus();
    renderFilters();
    renderGrid();
    $("#level-ladder").addEventListener("click", e => {
      const card = e.target.closest("[data-level]");
      if (card) toggleLevel(card.dataset.level);
    });
    initPlan();
    renderPlan();
    /* Never let the print button produce a flyer full of placeholders: if the kid
       has not filled one in yet, start from the plan instead of an empty sheet. */
    if (!state.flyer.name) {
      state.plan.name = state.plan.name || suggestName(byId(state.ideaId));
      fillFlyerFromPlan();
    }
    initFlyer();
    initEarnings();
    renderSafety();
    renderEarnings();

    $("#btn-match").onclick = () => {
      if (!state.answers.age && !state.answers.vibe) { toast("Pick your age and work style first"); return; }
      state.filters.sort = "match";
      $("#f-sort").value = "match";
      renderGrid();
      const res = $("#results");
      if (res.scrollIntoView) res.scrollIntoView({ behavior: "smooth", block: "start" });
      const n = visibleIdeas().filter(fitsAge).length || visibleIdeas().length;
      toast(n + " ideas that fit you 👇");
    };
    $("#btn-reset").onclick = () => {
      state.answers = { age: null, vibe: null };
      renderChips(); updateQuizStatus(); save();
      toast("Cleared — showing everything");
    };
    route();
  }
  boot();
})();
