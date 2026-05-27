# Production Guide — Varad Patil Portfolio

Stack: **React 19 + Vite 8 (rolldown) + Tailwind v4 + GSAP + Framer Motion + Lenis**.
Hosted-anywhere static SPA. Recommended host: **Vercel** (zero-config), but works on Netlify, Cloudflare Pages, GitHub Pages, S3+CloudFront, or a plain nginx box.

---

## 1. Pre-flight checklist

Before you ship, verify each item.

| # | Check | Command / Where |
|---|-------|-----------------|
| 1 | Node ≥ 20.11 (Vite 8 requirement) | `node -v` |
| 2 | Dependencies clean install | `npm ci` |
| 3 | Lint passes | `npm run lint` |
| 4 | Production build succeeds | `npm run build` |
| 5 | Preview locally | `npm run preview` and walk every route |
| 6 | All routes load on hard refresh (SPA fallback wired) | `/`, `/work`, `/work/<slug>`, `/about`, `/playground`, `/contact`, `/garbage-url` (must hit 404 page) |
| 7 | EmailJS keys configured (Contact form) | `.env` |
| 8 | Real OG image at `public/og-image.png` (1200×630) | Browse `/og-image.png` |
| 9 | `robots.txt` and `sitemap.xml` reflect prod URL | `public/` |
| 10 | Lighthouse: Performance ≥ 90, A11y ≥ 95, SEO ≥ 95 | Chrome DevTools → Lighthouse |
| 11 | Bundle size sane | `dist/assets/*.js` — initial route ≤ ~200 kB gz |

---

## 2. Environment variables

The Contact form uses **EmailJS REST API** (no SDK). Create an EmailJS account, a Service, and a Template that accepts these vars: `from_name`, `reply_to`, `message`.

Create `.env` (copy from `.env.example`):

```dotenv
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxxxxxx
```

> `VITE_`-prefixed vars are **embedded in the client bundle**. Do not put any secret server keys here. EmailJS public key is designed for client use.

On Vercel: **Project → Settings → Environment Variables**, scope to `Production` + `Preview`.

---

## 3. Update content for your domain

Edit these before first deploy:

| File | What to change |
|------|----------------|
| `src/lib/useDocumentMeta.js` | `SITE.url` → your production origin (e.g. `https://varaddev.vercel.app`) |
| `index.html` | `<meta property="og:url">`, `<link rel="canonical">`, JSON-LD `sameAs` URLs |
| `public/sitemap.xml` | Replace `https://varaddev.vercel.app` with your domain |
| `public/robots.txt` | Update `Sitemap:` URL |
| `src/data/socials.js` | Verify GitHub / LinkedIn / contact email |
| `public/og-image.png` | Drop a real 1200×630 PNG (currently a placeholder) |
| `public/favicon.svg` (or `.ico`) | Brand mark |

---

## 4. Build

```bash
npm ci
npm run build
```

Output: `dist/` (static files, hashed). The build emits these chunks (rolldown manualChunks):

- `vendor-react`, `vendor-router`, `vendor-motion`, `vendor-gsap`, `vendor-lenis`, `vendor-icons`
- `index` (app shell)
- One lazy chunk per route page

Initial paint loads only what `/` needs.

---

## 5. Deploy

### Vercel (recommended)

1. Push to GitHub.
2. Import the repo at https://vercel.com/new — framework auto-detected as **Vite**.
3. Add env vars (section 2).
4. Deploy. `vercel.json` already provides:
   - SPA rewrite (`/((?!api/|assets/|.*\\..*).*)` → `/index.html`)
   - Immutable cache headers for `/assets/*` and media (`*.webp|jpg|png|svg|woff2`)
   - Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` disabling camera/mic/geo

CLI alternative:

```bash
npm i -g vercel
vercel --prod
```

### Netlify

Create `public/_redirects`:

```
/*    /index.html   200
```

Build command: `npm run build`. Publish dir: `dist`. Add env vars in Netlify UI.

### Cloudflare Pages

Build command: `npm run build`. Build output dir: `dist`. Add an SPA fallback in `_redirects` (same as Netlify) or use Pages Functions.

### GitHub Pages

```bash
npm run build
# push dist/ to gh-pages branch
```

Add `404.html` that mirrors `index.html` so deep links work.

### Self-hosted nginx

```nginx
server {
  listen 80;
  server_name varaddev.vercel.app;
  root /var/www/portfolio/dist;
  index index.html;

  # Long cache for hashed assets
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 6. Custom domain

1. Add the domain in your host (Vercel: **Project → Settings → Domains**).
2. Point DNS:
   - `A`     `@`    → host IP, OR `CNAME @ → cname.vercel-dns.com.` (apex via ALIAS/ANAME if your DNS supports it)
   - `CNAME` `www`  → `cname.vercel-dns.com.`
3. Force HTTPS (Vercel does this automatically).
4. Update `SITE.url` (see section 3) and rebuild so canonicals / sitemap / OG point to the right origin.

---

## 7. Post-deploy verification

Run these on the live URL:

- [ ] Hard-refresh every route — no 404 from the SPA shell
- [ ] `view-source:` shows the meta description / OG / canonical for the current route
- [ ] `/robots.txt` and `/sitemap.xml` reachable
- [ ] Contact form: send a test message, confirm it arrives in your inbox
- [ ] Mobile (Lighthouse mobile preset): LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Social preview: paste URL in https://www.opengraph.xyz and https://cards-dev.twitter.com/validator
- [ ] Console clean — no 404s, no CSP violations, no React warnings
- [ ] Tab through with keyboard: focus rings visible, skip-link works (`Tab` on first paint), modals trap focus, mobile menu closes on `Esc`
- [ ] `prefers-reduced-motion: reduce` (DevTools → Rendering) — GSAP scroll reveals and orb still render statically without thrash

---

## 8. Common gotchas

| Symptom | Fix |
|---------|-----|
| Deep links 404 on hard refresh | SPA fallback missing (see section 5 per host). |
| Contact form returns 400 | Template field names must match `from_name`, `reply_to`, `message` exactly. |
| Tailwind classes "disappear" in prod | The `text-(--color-foo)` shorthand depends on `--color-*` being registered in `@theme {}` inside `src/index.css`. Don't strip it. |
| Slow initial JS | Verify `vite.config.js` `manualChunks` still splits vendors. Check `dist/stats.html` (if you add `rollup-plugin-visualizer`). |
| Fonts flash unstyled (FOUT) | Preconnect tags already in `index.html`. To eliminate entirely, self-host with `@font-face` + `font-display: swap`. |
| Orb 3D shape stutters on low-end devices | It auto-pauses when offscreen and respects `prefers-reduced-motion`. To dial back further, lower `SEGMENTS` in `src/components/primitives/Orb3D.jsx` from `280` to `180`. |
| Lenis breaks anchor links inside a page | Use `lenis.scrollTo(target)` instead of native `<a href="#id">`. |

---

## 9. Maintenance

- **Dependency updates:** `npm outdated` → bump patch/minor monthly. Test in a PR / preview deploy before merging.
- **Adding a case study:** drop a new entry in `src/data/projects.js`, image in `src/assets/`. Route `/work/<slug>` is generated automatically.
- **New page:** add the file in `src/pages/`, lazy-import in `src/App.jsx`, add to `src/data/socials.js` footer nav if relevant, add a `<url>` to `public/sitemap.xml`.
- **SEO content updates:** keep page-level `useDocumentMeta({ title, description, path })` synced with what's on screen.

---

## 10. Rollback

Vercel keeps every deploy immutable. To revert: **Project → Deployments → ⋯ → Promote to Production** on the last known-good build.

For self-hosted: keep at least the last 3 `dist/` tarballs (`dist-YYYYMMDD-HHmm.tgz`) and atomically symlink `current → dist-…`.

---

Ship it.
