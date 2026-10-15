# Surface brief: home (piotrjalocha.dev) — mode: Experience

## Direction contract (development-only)

**World: "Trasa" — the bike-park / piste trail map as a field document.** The whole page is one downhill run drawn as a trail map: you start at the START GATE and descend through numbered stations to the FINISH (contact). Event work and code are the same run: each station is a "section" with a trail difficulty marker (green / blue / red / black, the universal piste-and-bike-park grading) used FUNCTIONALLY (project complexity / event scale), not decoration.

Mechanism sentence: *Piotr runs live events and ships the software for them with AI — shown as one descent where the line you pick is the portfolio.*

**Physical scene:** a recruiter on a laptop in a bright office skims for 60 seconds; the page must look like nothing else in their tab list. Light/dark is decided by the world: bright orange course tape + snow-white map sheets + ink-black, with one night "control room" section in ink.

**Color strategy: Committed/Drenched.** Hero field is saturated course-marking orange `#FF5B1F` (≈ 40–50% of first viewports). Map sheets are cold snow-white `#F1F5F7` (NOT cream/paper). Ink `#0E1317`. Trail grades: green `#1FA35B`, blue `#1D6FE8`, red `#E5322D`, black = ink. Contour lines in ink at low opacity. No gradients on text, no neon glow.

**Type:** display = a condensed signage grotesque with a point of view (e.g. Big Shoulders Display, 800/900, uppercase, tight) — NOT Inter/Space Grotesk/DM/Fraunces etc. Body = a neutral humanist grotesque (e.g. Hanken Grotesk). Monospace (e.g. JetBrains Mono) ONLY for code/data/coordinates (elevation, km, timestamps, the AI-prompt log), never as "techy costume". Self-host not required; Google Fonts link OK.

**Signature elements:**
1. Contour-line topographic field (SVG, generated) that gently parallaxes/draws on load; the descent line (a bold route polyline) is the scroll progress, with an **elevation profile** rail that fills as you scroll and marks each station.
2. **Station markers** as trail signs (rounded-diamond for black, square for blue, circle for green, per real grading) with real CV content.
3. **The Line (game):** a canvas one-button downhill game — rider descends a procedurally generated slope, tap/Space/click to jump/pump, avoid rocks/trees, collect "event checkpoints" (ACCRED, RUN-OF-SHOW, CATERING, CREW COMMS, LIVE) ; toggle MTB ⇄ SKI freeride. Best score in localStorage. Never required to reach content; skippable; respects prefers-reduced-motion (starts paused with a "press to play" card). Mobile: tap.
4. **"Built with AI" log**: a real-feeling prompt → ship timeline for Calltime / Talent Trop / Mundial Typer (clearly illustrative, labelled "przykładowy zapis / illustrative log" where text is synthetic), in mono; shows the workflow: brief → Claude/ChatGPT/Copilot → review → ship. No invented metrics.
5. **Run-of-show ribbon** for the event CV: a horizontal timeline of Red Bull events (Full Moon, Sound Clash 2024, Drift Masters 2025, Linia Czasu 2026, Skoki w Punkt 2026) as race-timing-board rows.

**Structure (descent order):** START (hero: name, one-sentence mechanism, 2 CTAs, language toggle) → S1 FIELD (event experience: Red Bull run-of-show) → S2 SHIPPED (4 projects as graded trails; click = expand inline, no modal) → S3 AI WORKFLOW (the build log) → S4 THE LINE (game) → S5 BASE CAMP (about: bike instructor Totalbikes since 2017, ski freeride, education, teaching, tools) → FINISH (contact: email, phone, LinkedIn, Formspree form). Keep a small CV download/print link slot (href placeholder `#`... better: omit if no file).

**Refused (the rut):** XP/retro windows, dark-mode neon dev portfolio, cream+serif editorial, gradient hero blobs, icon-card grids, kicker eyebrows above headings, numbered "01/02/03" sections (station numbers are information here: they are real run order), hero-metric template, emoji as icons, border-left accent cards, glassmorphism.

**Honest risk:** a trail-map metaphor can read as gimmicky if content is thin; mitigation: every station carries real CV facts, and the map furniture (grades, elevation) is functional.

**Content truth:** only facts in PRODUCT.md. Photos: none supplied; build `<figure class="swap">` slots (optional, hidden until `img/` file exists is overkill — instead provide commented, clearly marked CSS-ready slots) and make the page complete without them. Old homelab/smart-home content demoted to one small line under About.

**Performance/a11y:** static, no build, no frameworks; < 150KB own JS/CSS; semantic HTML; keyboard operable; `prefers-reduced-motion`; PL/EN toggle persisted; lang attr updated; focus rings themed; text selection themed; custom scrollbar themed.
