# J.A.R.V.I.S. — Unlimited Token Core

Just A Rather Very Intelligent System. A cinematic, voice-first AI agent that talks like Jarvis: British, dry, loyal — and **not rationed by a token meter**.

## What you get

- Holographic Iron-Man HUD, boot sequence, and arc reactor
- Speaks aloud (prefers a British male voice when the browser has one)
- Push-to-talk listening (Chrome / Edge)
- **Token limiter disabled** — no cut-off, unbounded session history, compressed long-term memory
- Local personality core that always works offline
- Optional cloud neural link (Pollinations or any OpenAI-compatible API) from *your* browser
- Tools: time, date, calculator, Wikipedia briefings, local weather, persistent notes (“remember that…”)

## Run

```bash
npm install
npm run dev
```

Open the preview, allow microphone + voice if prompted, and address him as you would in the workshop.

## Neural link

Open **NEURAL LINK** in the right panel:

| Engine | Behaviour |
| --- | --- |
| AUTO | Try cloud, fall back to local core |
| CLOUD | Public OpenAI-compatible gateway (no key) |
| CUSTOM API | Your Groq / OpenAI / OpenRouter / Gemini-compatible base URL + key |
| LOCAL CORE | On-device Jarvis personality + tools only |

Keys are stored in `localStorage` on your machine, never sent to this repo.

## Voice

Chrome’s **Google UK English Male** is the closest built-in stand-in for Paul Bettany. Type if the browser blocks speech recognition — there is still no token cap on text.
