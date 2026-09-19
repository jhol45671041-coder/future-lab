/* Smoke test for Kid Hustle Lab.
   Loads index.html in jsdom, runs the real app, and drives the UI.
   Usage:  npm i --no-save jsdom && node tests/smoke.js          */
const path = require("path");
const fs = require("fs");
/* jsdom can live in the repo (npm i --no-save jsdom) or anywhere on NODE_PATH. */
let JSDOM = null;
const candidates = [
  "jsdom",
  path.join(__dirname, "..", "node_modules", "jsdom"),
  path.join(__dirname, "..", "..", "qa", "node_modules", "jsdom")
];
for (const c of candidates) {
  try { JSDOM = require(c).JSDOM; break; } catch (e) { /* try next */ }
}
if (!JSDOM) {
  console.error("jsdom not found. Run:  npm i --no-save jsdom   (or set NODE_PATH)");
  process.exit(2);
}

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const wait = ms => new Promise(r => setTimeout(r, ms));

const errors = [];
const dom = new JSDOM(html, {
  url: "http://localhost:8000/", runScripts: "dangerously", pretendToBeVisual: true,
  beforeParse(w) { w.addEventListener("error", e => errors.push("window error: " + e.message)); }
});
const { window } = dom, doc = window.document;
window.print = () => { window.__printed = (window.__printed || 0) + 1; };
window.prompt = () => "prompted";

["data.js", "app.js"].forEach(f => {
  const s = doc.createElement("script");
  s.textContent = fs.readFileSync(path.join(ROOT, "assets/js", f), "utf8");
  doc.body.appendChild(s);
});

const q = s => doc.querySelector(s), qa = s => Array.from(doc.querySelectorAll(s));
const t = (n, c, x) => { console.log((c ? "  PASS  " : "  FAIL  ") + n + (!c && x ? "  → " + x : "")); if (!c) process.exitCode = 1; };
const click = el => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const fire = (el, type) => el.dispatchEvent(new window.Event(type, { bubbles: true }));
const nav = async hash => { window.location.hash = hash; window.dispatchEvent(new window.Event("hashchange")); await wait(30); };

(async () => {
  console.log("\n— boot —");
  t("no script errors", errors.length === 0, errors.join(" | "));
  t("35 cards rendered", qa("#grid .card").length === 35, "got " + qa("#grid .card").length);
  t("result count text", q("#result-count").textContent === "35 ideas", q("#result-count").textContent);
  t("age chips = 4, vibe chips = 5", qa("#age-chips .chip").length === 4 && qa("#vibe-chips .chip").length === 5);
  t("category filter has 6 options", qa("#f-cat option").length === 6);
  t("work-style filter has 6 options", qa("#f-mode option").length === 6);
  t("hero stat = best job price", /^\$\d+$/.test(q("#stat-top").textContent), q("#stat-top").textContent);

  console.log("\n— free at every level —");
  const freeIdeas = window.IDEAS.filter(i => !i.startup).length;
  t("promise text comes from data.js", q("#free-promise").textContent.includes(window.FREE_PROMISE.headline),
    q("#free-promise").textContent.slice(0, 70));
  t("promise spells out what it is not", /no signup/i.test(window.FREE_PROMISE.body) && /no paid tier/i.test(window.FREE_PROMISE.body),
    window.FREE_PROMISE.body.slice(0, 70));
  t("strip is on screen and mentions no cost", /no cost/i.test(q("#free-promise").textContent));
  t("3 levels defined, all free to reach", window.LEVELS.length === 3 && window.LEVELS.every(l => l.id && l.name && l.cost));
  t("level ladder renders 3 cards", qa("#level-ladder .level-card").length === 3, "got " + qa("#level-ladder .level-card").length);
  t("every level card is stamped free + unlocked", qa("#level-ladder .level-free").every(el => /free/i.test(el.textContent)));
  t("nothing on the page is locked, gated or premium", qa("[data-locked], .locked, .is-locked, [data-premium], [data-upgrade]").length === 0);
  t("hero counts the $0-start ideas", q("#stat-free").textContent === String(freeIdeas), q("#stat-free").textContent + " vs " + freeIdeas);
  t("every $0 counter on the page matches the data", qa("[data-free='count-zero']").every(el => el.textContent === String(freeIdeas)));
  t("every playbook counter matches the data", qa("[data-free='count-total']").every(el => el.textContent === String(window.IDEAS.length)));
  t("level filter offers all 3 levels", qa("#f-level option").length === 4, "got " + qa("#f-level option").length);
  t("cards carry a level badge", qa("#grid .badge--level").length === 35, "got " + qa("#grid .badge--level").length);

  q("#f-level").value = "1"; fire(q("#f-level"), "change");
  const lvl1 = window.IDEAS.filter(i => i.level === 1).length;
  t("level 1 shows only starter jobs", qa("#grid .card").length === lvl1, "got " + qa("#grid .card").length + " vs " + lvl1);
  t("all shown cards are level 1", qa("#grid .badge--level").every(b => /Level 1/.test(b.textContent)));
  click(qa("#level-ladder .level-card")[2]);
  const lvl3 = window.IDEAS.filter(i => i.level === 3).length;
  t("clicking a level card filters the grid", qa("#grid .card").length === lvl3 && q("#f-level").value === "3",
    qa("#grid .card").length + " cards, select=" + q("#f-level").value);
  t("active level card is marked", qa("#level-ladder .level-card")[2].classList.contains("is-active"));
  click(q("#btn-free-only"));
  t("$0 switch hides jobs with a startup cost", qa("#grid .card").every(c => /No startup cost/.test(c.textContent)) && qa("#grid .card").length === 2,
    "got " + qa("#grid .card").length);
  q("#f-level").value = "all"; fire(q("#f-level"), "change");
  t("$0 switch alone = every free-to-start job", qa("#grid .card").length === freeIdeas, "got " + qa("#grid .card").length);
  t("$0 switch is announced", q("#btn-free-only").getAttribute("aria-pressed") === "true");
  t("result count flags the free filter", /\$0 to start/.test(q("#result-count").textContent), q("#result-count").textContent);
  click(q("#btn-free-only"));
  t("switching it off restores everything", qa("#grid .card").length === 35 && q("#btn-free-only").getAttribute("aria-pressed") === "false");
  click(q("#btn-clear-filters"));
  t("reset clears the level filter too", qa("#grid .card").length === 35 && q("#f-level").value === "all");
  t("footer promises there is no paid version", /no paid version/i.test(q(".site-footer").textContent));

  console.log("\n— quiz —");
  click(qa("#age-chips .chip")[1]);   // 11-12
  click(qa("#vibe-chips .chip")[1]);  // animals & kids
  t("both chips pressed", qa("#age-chips .chip")[1].getAttribute("aria-pressed") === "true" && qa("#vibe-chips .chip")[1].getAttribute("aria-pressed") === "true");
  t("status reflects answers", /11–12/.test(q("#quiz-status").textContent), q("#quiz-status").textContent);
  click(q("#btn-match"));
  await wait(30);
  t("results title personalised with correct article", /an 11–12 year old who likes animals/i.test(q("#results-title").textContent), q("#results-title").textContent);
  t("quiz status uses correct article", /for an 11–12 year old/.test(q("#quiz-status").textContent), q("#quiz-status").textContent);
  t("match badges rendered", /% match/.test(q("#grid").innerHTML));
  const top = q("#grid .card");
  const ageBadge = top.querySelector(".badge--age").textContent;          // e.g. "Ages 9–17"
  const mAge = ageBadge.match(/Ages (\d+)–(\d+)/);
  t("top match is legal for a 12-year-old", !!mAge && +mAge[1] <= 12 && +mAge[2] >= 12, ageBadge);
  t("top match is the highest-scoring card", (() => {
    const badges = qa("#grid .card .badge--match").map(b => parseInt(b.textContent, 10));
    return badges.every((v, i) => i === 0 || badges[i - 1] >= v);
  })(), qa("#grid .card .badge--match").map(b => b.textContent).slice(0, 5).join(" "));
  t("match scores are varied, not saturated", new Set(qa("#grid .card .badge--match").map(b => b.textContent)).size > 3,
    new Set(qa("#grid .card .badge--match").map(b => b.textContent)).size + " distinct");
  t("animal pick floats an animal job up", /dog|pet|cage|bath|sitting|tutor/i.test(top.textContent), top.querySelector("h3").textContent);
  click(q("#btn-reset"));
  t("reset clears answers", qa("#age-chips .chip")[1].getAttribute("aria-pressed") === "false");

  console.log("\n— filters & search —");
  q("#f-cat").value = "digital"; fire(q("#f-cat"), "change");
  t("digital category = 7 ideas", qa("#grid .card").length === 7, "got " + qa("#grid .card").length);
  q("#f-age").value = "8-10"; fire(q("#f-age"), "change");
  t("digital + age 8-10 narrows further", qa("#grid .card").length === 1, "got " + qa("#grid .card").length);
  q("#f-mode").value = "craft"; fire(q("#f-mode"), "change");
  t("impossible combo shows empty state", qa("#grid .card").length === 0 && !!q("#empty-reset"));
  click(q("#empty-reset"));
  t("empty-state reset restores all", qa("#grid .card").length === 35, "got " + qa("#grid .card").length);
  q("#f-age").value = "8-10"; fire(q("#f-age"), "change");
  const young = qa("#grid .card").length;
  t("age 8-10 shows a safe subset", young > 8 && young < 22, "got " + young);
  t("no lawn mowing for 8-10", !q("#grid").textContent.includes("Lawn Mowing"));
  q("#f-age").value = "13-14"; fire(q("#f-age"), "change");
  t("13-14 can do nearly everything", qa("#grid .card").length >= 30, "got " + qa("#grid .card").length);
  q("#f-age").value = "all"; fire(q("#f-age"), "change");
  q("#q").value = "snow"; fire(q("#q"), "input"); await wait(220);
  t("search 'snow' finds shoveling", qa("#grid .card").length === 1 && /Snow/.test(q("#grid").textContent), "got " + qa("#grid .card").length);
  q("#q").value = "zzzz"; fire(q("#q"), "input"); await wait(220);
  t("no-results message", /No ideas match/.test(q("#grid").textContent));
  q("#q").value = ""; fire(q("#q"), "input"); await wait(220);
  t("clearing search restores all", qa("#grid .card").length === 35);
  q("#f-sort").value = "pay"; fire(q("#f-sort"), "change");
  t("sort by pay puts website building first", /Website/i.test(q("#grid .card h3").textContent), q("#grid .card h3").textContent);
  q("#f-sort").value = "match"; fire(q("#f-sort"), "change");

  console.log("\n— idea drawer —");
  click(q("[data-open]"));
  t("drawer unhidden", q("#drawer").hidden === false);
  await wait(40);
  t("drawer animates open", q("#drawer").classList.contains("open") && q("#backdrop").classList.contains("open"));
  t("5 money cells incl. level", qa("#drawer-money .money-cell").length === 5, "got " + qa("#drawer-money .money-cell").length);
  t("drawer shows the level and that it is free", /Level \d/.test(q("#drawer-money").textContent) && /free/i.test(q("#drawer-money").textContent), q("#drawer-money").textContent.slice(0, 60));
  t("title filled", q("#drawer-title").textContent.length > 2, q("#drawer-title").textContent);
  const tabs = qa("#drawer-tabs button");
  tabs[1].click(); t("gear tab lists gear", qa("#drawer-body .list--check li").length > 2, String(qa("#drawer-body .list--check li").length));
  tabs[2].click(); t("pitch tab shows a script", !!q("#drawer-body .say"));
  tabs[3].click(); t("safety tab lists rules", qa("#drawer-body .list--warn li").length > 2);
  click(q("#drawer-save"));
  t("save button toggles", q("#drawer-save").textContent.includes("Saved"), q("#drawer-save").textContent);
  click(q("#drawer-plan"));
  await wait(60);
  t("drawer closes", q("#drawer").classList.contains("open") === false);
  t("routes to plan page", q("#page-plan").classList.contains("active"));

  console.log("\n— plan builder —");
  t("35 ideas in picker", qa("#plan-idea option").length === 35, "got " + qa("#plan-idea option").length);
  t("price suggestion filled", /^\$\d+$/.test(q("#calc-price").textContent), q("#calc-price").textContent);
  t("weekly + monthly math", /^\$\d/.test(q("#calc-week").textContent) && /^\$\d/.test(q("#calc-month").textContent));
  t("gear checklist rendered", qa("#gear-list li").length > 2, "got " + qa("#gear-list li").length);
  t("split legend = 3", qa("#split-legend .split-item").length === 3);
  t("summary has content", q("#plan-summary").textContent.length > 30);
  // pricing model regressions
  const priceOf = () => parseInt(q("#calc-price").textContent.replace(/[^0-9]/g, ""), 10);
  q("#plan-idea").value = "leaf-raking"; fire(q("#plan-idea"), "change");
  t("leaf raking opens at a sane rate ($20-40/yard)", /^\$2[05]$|^\$3[05]$|^\$40$/.test(q("#calc-price").textContent), q("#calc-price").textContent);
  t("leaf raking hours parsed as 1.5", parseFloat(q("#calc-hours").value) === 1.5, q("#calc-hours").value);
  t("in-range price gets the confident note", /Right in the going rate/.test(q("#calc-note").textContent), q("#calc-note").textContent);
  t("kit payback line hidden for free ideas", /free to start/.test(q("#calc-kit").textContent), q("#calc-kit").textContent);
  q("#plan-idea").value = "baking"; fire(q("#plan-idea"), "change");
  t("baking includes $6 of ingredients per dozen", parseFloat(q("#calc-mat").value) === 6, q("#calc-mat").value);
  t("baking kit payback explained", /starter kit costs about \$20/.test(q("#calc-kit").textContent), q("#calc-kit").textContent);
  q("#plan-idea").value = "babysitting"; fire(q("#plan-idea"), "change");
  t("hourly job labelled 'Charge per hour'", /per hour/i.test(q("#calc-price-label").textContent), q("#calc-price-label").textContent);
  t("babysitting opens at $12-18/hr", priceOf() >= 12 && priceOf() <= 18, q("#calc-price").textContent);
  q("#plan-idea").value = "dog-treats"; fire(q("#plan-idea"), "change");
  t("low-ticket product still prices in range", priceOf() >= 6 && priceOf() <= 12, q("#calc-price").textContent);
  q("#plan-idea").value = "ai-website"; fire(q("#plan-idea"), "change");
  q("#plan-idea").value = "ai-website"; fire(q("#plan-idea"), "change");
  t("switching idea updates summary", /Website/i.test(q("#plan-summary").textContent), q("#plan-summary").textContent.slice(0, 60));
  t("switching idea updates gear", /Carrd|Google Sites/.test(q("#gear-list").textContent), q("#gear-list").textContent.slice(0, 60));
  click(q("#btn-name"));
  const nm = q("#plan-name").value;
  t("name generator writes a name", nm.length > 4, nm);
  q("#plan-owner").value = "Maya"; fire(q("#plan-owner"), "input");
  q("#calc-hours").value = "8"; fire(q("#calc-hours"), "input");
  q("#calc-rate").value = "50"; fire(q("#calc-rate"), "input");
  t("above-market rate warns", /above the typical/.test(q("#calc-note").textContent), q("#calc-note").textContent);
  q("#calc-hours").value = "0.25"; fire(q("#calc-hours"), "input");
  q("#calc-rate").value = "8"; fire(q("#calc-rate"), "input");
  t("below-market rate warns", /going rate/.test(q("#calc-note").textContent), q("#calc-note").textContent);
  q("#calc-hours").value = "2"; fire(q("#calc-hours"), "input");
  q("#calc-rate").value = "15"; fire(q("#calc-rate"), "input");
  q("#pct-save").value = "60"; fire(q("#pct-save"), "input");
  t("split must total 100 (110 flagged)", /110%/.test(q("#split-warning").textContent), q("#split-warning").textContent);
  q("#pct-save").value = "50"; fire(q("#pct-save"), "input");
  t("split valid at 100", /100%/.test(q("#split-warning").textContent));
  const gcb = q("#gear-list input"); gcb.checked = true; fire(gcb, "change");
  click(q("#btn-print-plan"));
  t("plan print payload built", window.__printed === 1 && q("#print-root").innerHTML.includes(nm), "prints=" + window.__printed);

  console.log("\n— flyer —");
  click(q("#btn-to-flyer")); await wait(40);
  t("flyer page active", q("#page-flyer").classList.contains("active"));
  t("flyer name pulled from plan", q("#fl-name").value === nm, q("#fl-name").value + " vs " + nm);
  t("preview shows the name", q("#flyer-out").textContent.includes(nm));
  click(q("#btn-add-service"));
  t("service row added", qa("#fl-services .field-row").length === 3, "got " + qa("#fl-services .field-row").length);
  const svc = qa("#fl-services [data-k='label']")[1]; svc.value = "Driveway shoveling"; fire(svc, "input");
  const svcp = qa("#fl-services [data-k='price']")[1]; svcp.value = "$25 each"; fire(svcp, "input");
  t("preview reflects new service", q("#flyer-out").textContent.includes("Driveway shoveling") && q("#flyer-out").textContent.includes("$25 each"));
  click(qa("#fl-services [data-delsvc]")[2]);
  t("service deleted", qa("#fl-services .field-row").length === 2, "got " + qa("#fl-services .field-row").length);
  q("#fl-contact").value = "Text 555-0134"; fire(q("#fl-contact"), "input");
  t("contact shows on preview", q("#flyer-out").textContent.includes("555-0134"));
  click(q("#btn-print-flyer"));
  t("flyer print payload built", window.__printed === 2 && q("#print-root").innerHTML.includes("Driveway"));

  console.log("\n— earnings tracker —");
  await nav("#/earnings");
  t("empty log message", /No jobs logged yet/.test(q("#jobs-body").textContent));
  q("#job-amount").value = "30"; q("#job-customer").value = "Mrs. Patel"; q("#job-what").value = "Front lawn";
  click(q("#btn-add-job"));
  q("#job-amount").value = "12"; q("#job-customer").value = "Mr. Chen"; q("#job-what").value = "Dog walk";
  click(q("#btn-add-job"));
  t("two rows logged", qa("#jobs-body tr").length === 2, "got " + qa("#jobs-body tr").length);
  t("total = $42", q("#earn-stats").textContent.includes("$42"), q("#earn-stats").textContent.slice(0, 70));
  t("average = $21", q("#earn-stats").textContent.includes("$21"));
  t("best customer detected", q("#earn-stats").textContent.includes("Mrs. Patel"));
  click(q("#btn-add-job"));
  t("blank amount rejected", qa("#jobs-body tr").length === 2, "got " + qa("#jobs-body tr").length);
  q("#goal-name").value = "Bike"; fire(q("#goal-name"), "input");
  q("#goal-amount").value = "100"; fire(q("#goal-amount"), "input");
  t("goal bar at 21%", q("#goal-bar").style.width.startsWith("21"), q("#goal-bar").style.width);
  t("goal text names the goal", q("#goal-text").textContent.includes("Bike"));
  t("three split bars drawn", qa("#split-bars .bar-wrap").length === 3);
  const copied = [];
  Object.defineProperty(window.navigator, "clipboard", { value: { writeText: txt => { copied.push(txt); return Promise.resolve(); } }, configurable: true });
  click(q("#btn-export")); await wait(30);
  t("export builds a report", copied.length === 1 && copied[0].includes("Mrs. Patel"), copied[0] ? copied[0].slice(0, 40) : "nothing copied");
  click(q("[data-deljob]"));
  t("delete removes a row", qa("#jobs-body tr").length === 1, "got " + qa("#jobs-body tr").length);

  console.log("\n— safety + persistence —");
  click(qa("#vibe-chips .chip")[1]);   // re-answer the quiz so persistence has something to restore
  t("re-answered quiz", qa("#vibe-chips .chip")[1].getAttribute("aria-pressed") === "true");
  await nav("#/safety");
  t("8 safety rules", qa("#rule-grid .rule").length === 8, "got " + qa("#rule-grid .rule").length);
  t("10 parent checklist items", qa("#parent-list li").length === 10, "got " + qa("#parent-list li").length);
  t("agreement has kid name", q("#ag-kid-text").textContent === "Maya", q("#ag-kid-text").textContent);
  t("agreement has money split", q("#ag-split").textContent === "50 / 35 / 15", q("#ag-split").textContent);
  click(q("#btn-print-agreement"));
  t("agreement print payload", window.__printed === 3 && /Safety agreement/.test(q("#print-root").innerHTML));
  await wait(400);
  const stored = JSON.parse(window.localStorage.getItem("khl.v1") || "{}");
  t("persisted: answers", stored.answers && stored.answers.vibe === "animals", JSON.stringify(stored.answers));
  t("persisted: 1 job", (stored.jobs || []).length === 1, JSON.stringify(stored.jobs));
  t("persisted: saved idea", (stored.saved || []).length === 1, JSON.stringify(stored.saved));
  t("persisted: gear tick", !!(stored.gear && stored.gear["ai-website"] && Object.values(stored.gear["ai-website"]).some(Boolean)), JSON.stringify(stored.gear));
  t("persisted: flyer", (stored.flyer.services || []).length === 2, JSON.stringify(stored.flyer.services));

  console.log("\n— reload with the same storage —");
  const dom2 = new JSDOM(html, { url: "http://localhost:8000/", runScripts: "dangerously", pretendToBeVisual: true });
  dom2.window.localStorage.setItem("khl.v1", window.localStorage.getItem("khl.v1"));
  dom2.window.print = () => {};
  ["data.js", "app.js"].forEach(f => {
    const s = dom2.window.document.createElement("script");
    s.textContent = fs.readFileSync(path.join(ROOT, "assets/js", f), "utf8");
    dom2.window.document.body.appendChild(s);
  });
  await wait(60);
  const d2 = dom2.window.document;
  t("vibe answer restored", d2.querySelectorAll("#vibe-chips .chip")[1].getAttribute("aria-pressed") === "true");
  t("cleared age stays cleared", d2.querySelectorAll("#age-chips .chip")[1].getAttribute("aria-pressed") === "false");
  t("idea restored", d2.querySelector("#plan-idea").value === "ai-website", d2.querySelector("#plan-idea").value);
  t("business name restored", d2.querySelector("#plan-name").value === nm, d2.querySelector("#plan-name").value);
  t("job restored", /\$30|\$12/.test(d2.querySelector("#earn-stats").textContent), d2.querySelector("#earn-stats").textContent.slice(0, 50));
  t("saved star restored on card", !!d2.querySelector(".icon-btn.is-on"), "no starred card");
  t("gear tick restored", d2.querySelector("#gear-list input").checked === true);
  t("flyer restored", d2.querySelector("#fl-name").value.length > 2, d2.querySelector("#fl-name").value);
  t("default route = find page", d2.querySelector("#page-find").classList.contains("active"));

  console.log("\n— security: user input must never become markup —");
  const evil = '<img src=x onerror="window.__pwned=true">';
  let pwnedInjection = 0;
  for (const id of ["plan-name", "plan-owner", "fl-name", "fl-contact", "fl-area", "fl-note", "fl-tag", "job-customer", "job-what", "goal-name"]) {
    const el = q("#" + id);
    if (!el) continue;
    el.value = evil;
    fire(el, "input");
    pwnedInjection += qa('img[src="x"]').length;
    qa('img[src="x"]').forEach(el2 => el2.remove());
  }
  const svcField = qa("#fl-services [data-k='label']")[0];
  if (svcField) { svcField.value = evil; fire(svcField, "input"); }
  q("#job-amount").value = "10"; click(q("#btn-add-job"));
  pwnedInjection += qa('img[src="x"]').length;
  t("no injected elements from typed input", pwnedInjection === 0, pwnedInjection + " injected element(s)");
  t("payload rendered as literal text instead", /onerror/.test(q("#earn-stats").textContent) || /onerror/.test(q("#plan-summary").textContent), "payload not found in output at all");
  t("script did not execute", window.__pwned !== true, "XSS executed");
  // leave the state clean for the reload assertions below
  window.localStorage.setItem("khl.v1", JSON.stringify({ answers: { age: null, vibe: "animals" } }));

  console.log("\njsdom errors captured:", errors.length ? errors.join(" | ") : "none");
  console.log(process.exitCode === 1 ? "\n❌ SOME TESTS FAILED\n" : "\n✅ ALL TESTS PASSED\n");
})();
