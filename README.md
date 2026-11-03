# Aditya Varma Dantuluri — Portfolio

Personal portfolio: release management, DevOps and CI/CD, and IT security.

**Live site:** https://aditya-varma-dantuluri.vercel.app

## What's here

A fast, dependency-free static site: one HTML page, two small scripts, no build step.

| Path | Purpose |
|---|---|
| `index.html` | The page: content, styles, theme toggle, navigation, the release-lifecycle walkthrough and the LSB steganography demo |
| `assets/interactions.js` | Project search, topic filters and expandable cards |
| `assets/motion.js` | Animations: word-by-word headings, staggered reveals, card tilt, scroll progress, timeline rail and more |
| `assets/Aditya-Varma-Dantuluri-Resume.pdf` | Résumé download |
| `og-image.png` | Link-preview image (1200 × 627) for LinkedIn and other sites |
| `robots.txt`, `sitemap.xml` | Search-engine hints |

Everything works without JavaScript (the scripts only enhance the page), and all motion is switched off for
visitors who prefer reduced motion.

## Run locally

Any static file server works, for example:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Hosted on Vercel as a static site:

```bash
vercel deploy --prod
```
