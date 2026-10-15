# piotrjalocha.dev - Portfolio

Personal portfolio of Piotr Jalocha (event marketing at Red Bull, computer science engineer). The site is one downhill run drawn as a trail map: START, then stations S1 Field (Red Bull events as a timing board), S2 Shipped (projects as graded trails), S3 AI Workflow (illustrative build log), S4 The Line (optional mini-game), S5 Base Camp (about), FINISH (contact).

## Stack

- Vanilla HTML, CSS, JS. No build, no frameworks.
- Fonts via Google Fonts: Big Shoulders Display, Hanken Grotesk, JetBrains Mono.
- Formspree for the contact form.
- Hosted on a homelab behind a Cloudflare Tunnel.

## Structure

```
index.html        page, PL/EN copy side by side (.pl / .en)
css/style.css     design system and layout
css/game.css      The Line styles
js/main.js        language, generated contour field, route + elevation rail, trail expanders, form
js/game.js        The Line, exposes window.TheLine.mount(el)
img/              optional photos: field.jpg, rider.jpg (slots stay hidden until the files exist)
```

## Notes

- Language: PL default, persisted in localStorage, updates `<html lang>`, dispatches a `langchange` event.
- prefers-reduced-motion is honoured; the game is never required to reach content.
- Bump the `?v=` query strings on css/js after changes.

Local preview: `python3 -m http.server`
