# Future Lab

A dark, cinematic one-page landing site for a web design studio — built with **React + Vite + TypeScript + Tailwind CSS** and **Framer Motion**, styled around a "liquid glass" morphism system.

## Sections

1. **Hero** — full-viewport fading background video, glass navbar, blur-in headline, timer/globe stat cards, and a trust bar with client wordmarks.
2. **Capabilities** — full-viewport fading background video over three glass cards (Design / Engineering / Growth) with tag chips.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
npm run preview  # serve the production build
```

## Typography

Loaded from Google Fonts in `index.html` and wired into `tailwind.config.js`:

| Token           | Family                            | Usage                                    |
| --------------- | --------------------------------- | ---------------------------------------- |
| `font-heading`  | Instrument Serif (italic)         | All headings — tight negative tracking   |
| `font-body`     | Barlow 300/400/500/600            | Body copy, nav, buttons, tags            |

## Liquid glass

Two plain CSS classes in `src/index.css`:

- `.liquid-glass` — `blur(4px)` backdrop, near-invisible fill, inset top highlight.
- `.liquid-glass-strong` — `blur(50px)` backdrop plus a drop shadow, for primary CTAs.

Both draw their border with a `::before` overlay: a vertical white gradient (bright at the top and bottom edges, transparent through the middle) masked with `mask-composite: exclude` so only a 1.4px stroke shows. The pseudo-element is `pointer-events: none`, so the glass stays clickable.

## Components

| File                             | Purpose                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/components/FadingVideo.tsx` | `<video>` that fades in on `loadeddata` and out 0.55s before the end, then loops or advances through an array of sources — so clip transitions never hard-cut. |
| `src/components/BlurText.tsx`    | Splits text into words and staggers them in (`blur(10px)` → `0`, `y: 50` → `0`, 100ms apart) once an IntersectionObserver fires. |
| `src/components/Icons.tsx`       | Hand-rolled inline SVGs (arrow, play, clock, globe, image, movie, lightbulb) — no icon dependency. |

`FadingVideo` drives opacity with `requestAnimationFrame` rather than CSS transitions, so repeated fade-in/fade-out cycles stay interruptible and never snap.

## Notes

- Both sections sit on pure black (`#000`); white text uses `white/80` or `white/90` for the quieter layers.
- Layout is responsive: nav links hide below `md`, the card grid collapses to one column, and display type scales with breakpoints.
- Background video sources are remote CDN URLs and require network access; without them the sections fall back to their black background.
