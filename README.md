# Lamborghini Lineup — Deploy Package

Static website (HTML + CSS + JS). No build step, no server-side code, no dependencies.

## Contents
- `index.html` — page markup
- `styles.css` — all styling and animations
- `script.js` — interactions, counters, scroll reveals, static mode
- `assets/` — three model photos (WebP), badge SVG, self-hosted WOFF2 fonts

## Deploy options

### Netlify (easiest, free)
1. Go to https://app.netlify.com/drop
2. Drag the whole `lamborghini-site-deploy` folder onto the page
3. Done — you get a live URL instantly

### Vercel
1. `npx vercel` inside this folder, or drag-and-drop at https://vercel.com/new
2. Framework preset: **Other** / static — no build command, output directory `.`

### GitHub Pages
1. Create a repo, push the contents of this folder to `main`
2. Settings → Pages → Source: `Deploy from a branch` → `main` / `/ (root)`

### Any shared hosting / cPanel
Upload the contents of this folder into `public_html` (keep the `assets` folder structure).

## Notes
- Works from `file://` too, but a real HTTP server is recommended.
- `?static=1` in the URL disables the preloader/animations and pins the counters — useful for screenshots.
- All assets are local — no external CDN or tracking requests.
- Photos are for portfolio/demo use; Lamborghini is a trademark of Automobili Lamborghini S.p.A. This is a fan-made concept, credited to **Adnan Shaikh**.
