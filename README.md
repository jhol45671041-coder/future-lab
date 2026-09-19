# 💸 Kid Hustle Lab

A free, offline-friendly field guide that turns the list of "neighborhood jobs a kid
*could* do" into 35 businesses a kid can actually start this weekend — with real
prices, gear lists, safety rules, and the exact words to say to a neighbor.

Built as a **static site**: no build step, no framework, no network calls, no accounts.
Open `index.html` and it works.

---

## What's inside

| Page | What it does |
|---|---|
| **Find an idea** | Two-question matcher (age + work style), search, filters, sort, and 35 idea cards. Saved ideas persist. |
| **Idea playbook** (slide-over) | For every idea: why it works, a first-week plan, gear, the sales script, safety rules, and how to charge more. |
| **My plan** | Name generator, a price calculator that warns you when you're under- or over-charging, money split, and a printable one-page plan. |
| **Flyer** | Live flyer builder that prints a real door-hanger. Auto-fills from your plan. |
| **Earnings** | Job log, totals, best customer, savings goal progress bar, and a save/spend/give breakdown. |
| **Safety** | 8 kid safety rules, a 10-point parent setup checklist, and a printable Kid + Parent agreement. |

Everything is stored in the browser's `localStorage` under the key `khl.v1`.
Nothing is uploaded anywhere. There is no analytics, no tracking, and no backend.

---

## The 35 ideas

Each one carries a typical local price, time per job, startup cost, season,
age range, gear list, a step-by-step start plan, a word-for-word sales script,
and job-specific safety rules.

- **🏡 Home & Yard** — lawn mowing, weed pulling, leaf raking, snow shoveling, plant
  watering, curb number painting, window washing, trash can management, car washing,
  pool skimming
- **🐾 Animals & Kids** — dog walking, pet feeding, cage cleaning, dog bathing,
  mother's helping, babysitting, homework tutoring
- **💻 Digital & Creative Tech** — Canva graphic design, video editing, no-code
  website building, data entry, photo organizing, tech coaching for seniors,
  gaming coaching
- **🎨 Crafting & Handmade** — slime making, jewelry making, dog treat baking,
  baking, tie-dye, soap making, holiday decorating
- **♻️ Organizing** — garage organizing, toy decluttering, recycling sorting,
  garage sale helping

### How pricing is modelled

Two distinct models, because a babysitter and a lawn mower don't price the same way:

- **Flat-price jobs** (per yard, car, site, dozen): the calculator opens with an
  hourly rate derived from that job's real market range, then lets the kid adjust
  and warns if the result falls outside the range.
- **Hourly jobs** (per hour): the suggested rate *is* the market range, and the
  weekly estimate multiplies by hours and jobs.

`startup` is a one-time kit cost and `mat` is what a job consumes in supplies —
kept separate so a $25 stencil kit never gets charged to a single customer.

---

## Running it

```bash
# any static server works
python3 -m http.server 8000
# → http://localhost:8000
```

## Tests

```bash
npm i --no-save jsdom      # one-time, test-only dependency
node tests/smoke.js              # 100+ assertions driving the real UI
node tests/audit-interpolations.js   # fails if user-typed text reaches innerHTML unescaped
```

`tests/smoke.js` loads `index.html` in jsdom, runs the real app, and drives the
matcher, filters, drawer, pricing calculator, flyer, earnings log, persistence,
and print payloads — then reloads the page with the same `localStorage` to prove
state survives. It also fires hostile input at every text field and asserts that
nothing becomes live markup.

---

## Project layout

```
index.html                  single page; sections are routers, not reloads
assets/css/fonts.css        self-hosted Baloo 2 + Nunito (SIL OFL, see assets/fonts/)
assets/css/styles.css       design system: sticker-book / neo-brutalist
assets/js/data.js           ALL content: 35 ideas, categories, safety rules, checklists
assets/js/app.js            state, router, matcher, calculator, flyer, tracker, print
assets/img/hero.png         hero illustration
tests/                      jsdom smoke suite + security audit
```

Content lives entirely in `data.js`. Adding a 36th idea means adding one object —
the grid, filters, matcher, plan builder, flyer and print output all pick it up
automatically. `startup` and `mat` are optional; `mat` defaults to 0.

---

## Notes for grown-ups

- Prices are typical US neighborhood ranges. Adjust for your town.
- Check your local rules on door-to-door sales and permits for minors.
- Food businesses may need a permit before selling baked goods — ask first.
- This is educational content, not legal or financial advice.
- Safety rules are deliberately conservative: no ladders, no roofs, no chemical
  handling, no second-storey windows, a parent present for any first visit.

## Credits

Hero illustration generated for this project. Typefaces are Baloo 2 and Nunito,
both SIL Open Font License 1.1, self-hosted in `assets/fonts/`.
