# piotrjalocha.dev - Portfolio

Personal portfolio of Piotr Jalocha (event marketing at Red Bull, computer science engineer). The site is one downhill run drawn as a trail map: START, then stations S1 Field (Red Bull events as a timing board), S2 Projects (#projects, expandable cards), S3 The Line (optional mini-game), S4 About (#about), FINISH (contact).

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
js/main.js        language, generated contour field, route + elevation rail, trail expanders, photo slots, form
js/game.js        The Line, exposes window.TheLine.mount(el)
img/              photos by Greg Falski (@gregfalski): dirt-jump.jpg (hero), forest-trail.jpg (Field), fisheye-whip.jpg and forest-jump.jpg (About). Files must be listed in `<html data-photos>`; slots stay hidden until the file loads
```

## Notes

- Language: PL default, persisted in localStorage, updates `<html lang>`, dispatches a `langchange` event.
- prefers-reduced-motion is honoured; the game is never required to reach content.
- Bump the `?v=` query strings on css/js after changes.

Local preview: `python3 -m http.server`
