# piotrjalocha.dev — Portfolio

Personal portfolio website. Static HTML/CSS/JS, no build tools, no frameworks.

Live: **[piotrjalocha.dev](https://piotrjalocha.dev)**

## Stack

- Vanilla HTML, CSS, JS
- Google Fonts (Space Mono + DM Sans)
- [Formspree](https://formspree.io) — contact form
- Hosted on homelab (Proxmox) behind Cloudflare Tunnel

## Structure

```
portfolio/
├── index.html
├── css/
│   └── style.css
└── js/
    └── main.js
```

## Features

- Dark / light theme (persisted in localStorage)
- PL / EN language switcher (persisted in localStorage)
- Scroll animations (IntersectionObserver)
- Contact form via Formspree
- Responsive (mobile nav burger menu)
- Favicon as inline SVG data URI

## Local development

No build step needed — just open `index.html` in a browser or serve with any static server:

```bash
npx serve .
# or
python3 -m http.server
```
