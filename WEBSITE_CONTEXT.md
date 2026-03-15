# Nathaniel Fedida — Portfolio Website Context

## Overview
Single-page portfolio website for Nathaniel Fedida, a CS student at CSULB focused on machine learning, product design, and full-stack engineering. The site is a **single `index.html` file** with all styles inline. No framework — vanilla HTML/CSS/JS only. Served locally via `node serve.mjs` at `http://localhost:3000`.

---

## Tech Stack
- **Single file:** `index.html` (all CSS inline in `<style>`, all JS inline in `<script>`)
- **Font:** Bricolage Grotesque (Google Fonts, variable font — `opsz,wght@12..96,200..800`) — used as a Neue Montreal substitute
- **CSS utility:** Tailwind CDN (`<script src="https://cdn.tailwindcss.com">`) — used sparingly
- **Local server:** `node serve.mjs` → `http://localhost:3000`
- **Screenshots:** `node screenshot.mjs http://localhost:3000 [label]` → saves to `temporary screenshots/`
- **Puppeteer** installed at project root for screenshots

---

## Design Direction
Inspired by **nographism.com** aesthetic:
- Clean, editorial, typographic-first
- **Color palette:** White background (`#fff`), near-black text (`#1a1918`), **sky blue accent** (`#7dd3fc` / `#bae6fd`) — NOT green/teal/indigo
- **Typography:** Bricolage Grotesque variable font throughout; headings use `font-variation-settings: 'wght' 790`, body uses `'wght' 400`
- Anti-generic: no default Tailwind blues, no purple gradients, no cookie-cutter layouts

---

## Page Structure (top to bottom)

### 1. Hero Section (`#top`)
- **No top navbar** — nav links live inside the hero itself
- Full-viewport-width name "Nathaniel Fedida" spanning edge-to-edge (JS-calculated font size)
- Large bio text (48px, `'wght' 400`, line-height 1.1) pushed close below the name (hero `min-height: 57vh`)
- Bottom row: "Get in touch ↗" button (sky blue pill, 34px) on the left + Welcome/Projects/Contact nav links (51px) on the right
- Services table (sky blue `#bae6fd` background) immediately below the hero content

### 2. Scroll-Triggered Floating Nav
- Appears when user scrolls past 85% of hero height
- **Transparent** — no background, no border — elements float over content
- Top-left: `assets/NJW.png` circular logo (54px), links back to `#top`
- Top-right: Hamburger button in a **circle border** (56×56px), expands horizontally to show Welcome / Projects / Contact links
- Animation: hamburger → X when open; links slide in with `max-width` transition

### 3. Marquee (scrolling ticker)
- Text: `Nathaniel Fedida · AI Specialist · ML Engineer · Product Developer ·` (loops)
- Does **not** pause on hover

### 4. Product & Engineering Section
- Sky blue background (`#bae6fd`)
- Two-column layout, no borders between columns
- Large free headers: **"Product"** and **"Engineering"** (60px, `'wght' 400` — not bold)
- List items (60px) separated by thin horizontal lines (`rgba(26,25,24,0.3)`)
- **Product column:** Product Design / Research & Prototyping / Consumer Facing / User Experience / Technical Roadmapping
- **Engineering column:** Machine Learning & AI / Full-Stack Development / Data Science & Analytics / Large Language Models / AI Integration

### 5. Selected Work — Sticky Scroll Showcase (`#work`)
- Header: "Selected Work" label + "Intelligent products and thoughtful experiences" heading, two-column layout
- **Sticky scroll experience:** tall container (`height: 6 * 100vh`), inner viewport is `position: sticky; top: 0; height: 100vh`
- Each project is `position: absolute; inset: 0` — they stack on top of each other
- **Non-overlapping transitions:** current project fully fades+slides out before next fades+slides in (FI=0.12, FO=0.12, VIS=0.76 of each 100vh slot)
- Layout per project: left side = project number (e.g. `01 — 06`), name (60px bold), description, tags; right side = image (460×360px, rounded 16px)
- Progress dots at bottom center (6 dots, active dot is sky blue + scaled up)

#### Projects (in order):
| # | Name | GitHub |
|---|------|--------|
| 01 | Amazon — ML Inference | https://github.com/SamuelLin213/BTTAI-Amazon-Team-B |
| 02 | Dynamic Digital Agents | https://github.com/ViniciusDugue/Generative_Agents |
| 03 | CSULB Academic Calendar | https://github.com/hunterDRuebsamen/CSULB_Calendar |
| 04 | FC Barcelona "More than a Hack" | https://github.com/natefedidadev/FCB-Pressure-Cooker |
| 05 | Research Engineer @ D2 Laboratories | `#` (no public repo) |
| 06 | Kaggle — NYBG Plant ID | https://github.com/natefedidadev/Kaggle-NYBG |

### 6. About Section (`#about`)
- Two-column: left = `assets/Professional Photo.jpg` (full-height, grayscale → color on hover), right = bio text
- Name, title, bio paragraph, "Get in touch" CTA + GitHub link

### 7. Experience / How I Work Section
- Timeline of roles: Amazon SDE Intern, CSULB Research, FCB Hackathon
- "How I work" principles list

### 8. Contact Section (`#contact`)
- Left: large heading "Let's build something"
- Right: LinkedIn CTA button + GitHub link
- All "Get in touch" links → `https://www.linkedin.com/in/nathaniel-fedida/`

### 9. Footer
- Logo, nav links, copyright

---

## Key JavaScript

### Full-Width Name (`fitHeroName`)
Uses an off-screen probe `<span>` with identical font settings to measure true text width at 100px, then scales to `window.innerWidth - 48`. Called on `document.fonts.ready` + `requestAnimationFrame`.

### Scroll-Triggered Nav
IntersectionObserver + scroll listener. Shows nav after 85% of hero height. Hamburger toggles `max-width: 0 → 360px` for link reveal.

### Sticky Scroll Projects
```js
const FI = 0.12, FO = 0.12, VIS = 0.76;
// p = scrolled / window.innerHeight (0→6)
// rel = p - i (each project's local position 0→1)
// Non-overlapping: exit completes at rel=1, next entry starts at rel=0
```
Drives `opacity` and `translateY(±70px)` directly from scroll position — no CSS transition (to avoid lag).

### Scroll Reveal
IntersectionObserver with `rootMargin: '0px 0px 100px 0px'` adds `.up` class for fade-in animations.

---

## Assets (`assets/`)
- `NJW.png` — circular monogram logo, used in scroll nav (54px)
- `Professional Photo.jpg` — Nathaniel's photo (note: filename has a space — server uses `decodeURIComponent`)
- `amazon.png` — Amazon project image
- `dda.png` — Dynamic Digital Agents project image
- `csulb.jpg` — CSULB Calendar project image
- `fcbhackathon.jpg` — FCB Hackathon project image
- `eyetracking.png` — Eye Tracking project image
- `kaggle.png` — Kaggle project image

---

## Hard Rules (from CLAUDE.md)
- Never use default Tailwind palette (indigo, blue-600, etc.) — sky blue custom palette only
- Never use `transition-all`
- No top navbar in the hero — nav links are inside hero bottom row
- All "Get in touch" CTAs link to LinkedIn
- Single `index.html` file, all styles/scripts inline
- Always serve on localhost before screenshotting
- Screenshot workflow: `node serve.mjs` (background) → `node screenshot.mjs http://localhost:3000 [label]`

---

## Pending / Known State
- Eye Tracking project (05) has no GitHub link (`href="#"`) — update when available
- The site has not yet been deployed; it runs locally only
- `CLAUDE.md` in the project root contains additional behavior rules for Claude
