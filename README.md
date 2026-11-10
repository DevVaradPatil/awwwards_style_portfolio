# Varad Patil — Portfolio (`varaddev.vercel.app`)

A motion-led personal portfolio for **Varad Patil** — full-stack developer & AI builder, M.Tech AI for Sustainability @ IIT Kanpur. Built around the **Elastic** design system: full-bleed color "rooms" (ink, electric blue, bone, pink) and elastic type — letters of the variable font **Anybody** stretch wider and heavier as the pointer comes near.

> Fast and motion-rich with no 3D engine or animation SDK: GSAP + Lenis, CSS 3D, Canvas 2D and one hand-written WebGL shader.

---

## ✨ Stack

| Layer | Choice |
| --- | --- |
| Framework | **React 19** + **Vite 8 (rolldown)** |
| Routing | **react-router-dom 7** (lazy routes + page transitions) |
| Styling | **Tailwind CSS v4** (all tokens in `@theme {}` inside `src/index.css`) |
| Motion | **GSAP 3** + ScrollTrigger, **Lenis** smooth scroll, CSS 3D, Canvas 2D, raw WebGL |
| Type | **Self-hosted woff2** — Anybody (variable: width + weight) · Inter · JetBrains Mono |
| Icons | **lucide-react** (tree-shaken, single shared chunk) |
| Email | **EmailJS REST** (no SDK installed) with `mailto:` fallback |
| SEO | Build-time sitemap + per-route prerendered `<head>` + JSON-LD |
| Measurement | **Vercel Analytics** + **Speed Insights**, enforced perf budgets |
| Linting | ESLint flat config (`react-hooks`, `react-refresh`) |

No TypeScript — plain JSX. Alias: `@` → `/src`.

---

## 🧱 Folder map

```
.github/workflows/       CI — lint + build + perf budgets
scripts/                 generate-sitemap · prerender · check-budgets · fetch-fonts
public/                  Static assets (favicon, touch/PWA icons, webmanifest,
                         fonts, sitemap, robots, og-image)
src/
  assets/                Project screenshots, app icons, tech logos
  components/
    layout/              Header, Footer
    primitives/          ElasticText, WorkRing, CodePortrait, LiquidName,
                         MagneticButton
    system/              RouteLoader, ErrorBoundary, Preloader,
                         SmoothScrollProvider, PageTransition, CustomCursor,
                         Analytics, VercelBeacons
  data/                  projects, story, skills, experience, education,
                         testimonials, socials, now, siteMeta
  lib/                   emailjs, useDocumentMeta, titleLines
  pages/                 Home, Work, CaseStudy, About, Playground,
                         Contact, NotFound
  router/                AppRouter (lazy + Suspense + transitions)
  sections/home/         Hero, Story, WorkShowcase, Toolbox, CallToAction
  styles/                cursor.css, fonts.css
  App.jsx, main.jsx, index.css
```

---

## 🛠 Scripts

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server (http://localhost:5173)
npm run build        # production build → dist/
npm run preview      # serve the production build locally
npm run lint         # ESLint over the workspace
npm run budget       # re-check perf budgets against the last build
npm run sitemap      # regenerate public/sitemap.xml from projects.js
```

`npm run build` is a three-stage pipeline:

| Stage | Script | What it does |
| --- | --- | --- |
| `prebuild` | `scripts/generate-sitemap.mjs` | Rebuilds `public/sitemap.xml` from `src/data/projects.js` so case-study URLs can never drift |
| `build` | `vite build` | Bundles to `dist/` with hand-split vendor chunks |
| `postbuild` | `scripts/prerender.mjs` → `scripts/check-budgets.mjs` | Writes per-route HTML with baked-in `<head>` meta + JSON-LD, then **fails the build if a perf budget is exceeded** |

---

## 🔐 Environment variables

The contact form posts to EmailJS via REST when configured, and **falls back to the visitor's mail client** (`mailto:`) when not.

1. Copy [`.env.example`](.env.example) to `.env.local`.
2. Fill in the three keys from your EmailJS dashboard:

```ini
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

3. The EmailJS template should accept these params: `from_name`, `reply_to`, `message`.

If any value is missing, the form silently downgrades to `mailto:` — no errors, no broken UX.

---

## 🚀 Deployment

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/varadpatil/new_port_awards)

A pre-configured [`vercel.json`](vercel.json) ships in the repo:

- SPA rewrite — every unmatched path falls through to `/index.html` so deep links like `/work/<slug>` survive a refresh. Vercel checks the filesystem *first*, so the prerendered `dist/work/<slug>/index.html` wins for real routes and the rewrite is only the fallback.
- Aggressive immutable caching for hashed `/assets/*` and static media.
- Hardening headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

After import:

1. Set the three `VITE_EMAILJS_*` env vars in **Project Settings → Environment Variables**.
2. Enable **Analytics** and **Speed Insights** in the project dashboard (the client is already wired up in `src/components/system/Analytics.jsx` — the toggle is what starts collection).
3. Redeploy.

### Any static host

Build, then serve `dist/` with **SPA fallback** (rewrite all paths to `/index.html`). On Netlify drop a `_redirects` with `/*  /index.html  200`. On nginx/Apache, set `try_files $uri /index.html`.

---

## 📊 Performance budgets

Budgets live in [`scripts/check-budgets.mjs`](scripts/check-budgets.mjs) and are enforced on every build (and in CI). The initial-payload figure is derived from `dist/index.html` — the entry script plus every `modulepreload`ed chunk — so it always reflects the real critical path instead of a list someone forgot to update.

| Budget | Limit | Current |
| --- | ---: | ---: |
| Initial `/` JS (gz) | 165 kB | **138.4 kB** |
| Initial `/` CSS (gz) | 14 kB | **8.9 kB** |
| Any lazy route chunk (gz) | 9 kB | **4.4 kB** (About) |
| Any single image | 150 KiB | **1 waived** |

Initial `/` breakdown (gz): `vendor-react` 55.3 · `vendor-gsap` 42.8 · `index` 17.4 · `vendor-router` 14.0 · `vendor-lenis` 4.9 · `vendor-icons` 4.2 · runtime 0.4.

Lazy chunks (gz): About 4.36 · Playground 3.73 · Contact 2.94 · CaseStudy 2.74 · Work 1.76 · VercelBeacons 1.74 · NotFound 0.67.

One image (the 365 app `logo.png`) exceeds the image cap under an explicit waiver pinned to its current size — it can shrink but never grow, and the waiver list doubles as the visible to-do (see [`docs/IMAGE_OPTIMIZATION.md`](docs/IMAGE_OPTIMIZATION.md)).

Other standing targets:

- ✅ Lighthouse Accessibility ≥ 95 — visible pink focus ring on every interactive primitive, semantic landmarks, ARIA labels on icon-only controls, keyboard-reachable mobile nav with focus trap.
- ✅ Every secondary route lazy-loaded behind `Suspense`.
- ✅ Per-route `<title>` / OG / Twitter / canonical, prerendered into static HTML at build time.
- ✅ JSON-LD `Person` on `/`, `CreativeWork` / `MobileApplication` per case study, `sitemap.xml`, `robots.txt`.
- 🎯 Field targets (watch in Speed Insights, not lab runs): LCP < 2.0 s, CLS < 0.05, INP < 200 ms.

---

## 🎨 Design tokens (cheat sheet)

| Token | Value | Use |
| --- | --- | --- |
| `--color-ink` | `#0b0b0d` | Hero, work, case studies, footer |
| `--color-blue` | `#2433ff` | Story, Now, next project (`.room-blue`) |
| `--color-bone` | `#ecece8` | Reading pages (`.room-bone`) |
| `--color-pink` | `#ff8ad0` | The one accent; closing call to action (`.room-pink`) |
| `--color-fg` / `-muted` / `-faint` | `#f2f2ee` / `#9d9da6` / `#5d5d66` | Text on ink and blue |
| `--color-type` / `-muted` | `#111114` / `#55555d` | Text on bone |
| Fonts | Anybody (display, variable) · Inter (body) · JetBrains Mono (code portrait) | |

Use the Tailwind v4 short syntax: `text-(length:--fs-h1)`, `bg-(--color-ink)`, `rounded-(--radius-md)`; set font width with `[font-stretch:115%]`.

---

## 📓 Changelog

Built in phases against [`IMPROVEMENT_PLAN.md`](IMPROVEMENT_PLAN.md), then redesigned against [`REDESIGN_PLAN.md`](REDESIGN_PLAN.md).

### Redesign — "Elastic"
- New visual system: four color rooms (ink, electric blue, bone, pink) replace the dark violet/cyan "Aurora Compute" look; Anybody variable font replaces Clash Display.
- **ElasticText**: per-letter width/weight driven by the pointer, one shared animation loop. Used for every big headline, the preloader and the footer name.
- **Home** tells a story: elastic hero → four pinned chapters (`src/data/story.js`) → 3D work ring → scroll-stretching toolbox → LET'S TALK.
- **WorkRing** (CSS 3D) on Home and Work; Work adds an index list with hover previews.
- **Case studies** with fitted elastic titles, screenshot strips for apps, next-project link.
- **About** with **CodePortrait** (photo drawn in code characters, pointer lens), **Contact** restyle, **Motion Lab** with a raw-WebGL liquid chrome name, elastic 404.
- Fixes: garbled "Â·" characters on About; contact form now focuses the first invalid field; portrait image 244 kB → 42 kB.
- New share image, favicon and app icons; 13 unused components removed.

### Phase 3.3 — Head/meta polish (backlog closeout)
- `apple-touch-icon` (180×180) + `icon-192` / `icon-512` + `site.webmanifest`, all rendered from `favicon.svg` onto the void surface.
- **Fixed:** `og:image` pointed at `og-image.png` while the actual file was `og-image.webp` — every shared link was unfurling with a 404 image. Now `/og-image.jpg`, 1200×658 at 38 kB.
- **Fixed:** the prerenderer matched project OG images by dist basename, which collided for the two Play Store apps (both ship `1.webp` and `logo.png`). It now reads Vite's build manifest for an exact source → output lookup, so all 13 case studies carry their own image.
- Per-route `og:image:alt`.

### Phase 6 — Measurement & guardrails
- Vercel **Analytics + Speed Insights**, lazy-loaded and production-only, with `/work/:slug` normalised to `/work/[slug]` so case studies group into one row.
- `scripts/check-budgets.mjs` — initial JS/CSS, lazy-chunk and per-image budgets, enforced on every build. Oversized legacy images are ratcheted via waivers pinned to their current size.
- GitHub Actions CI: lint + build + budgets on every push and PR.
- README rewritten against the code as it actually stands.

### Phase 5 — Awwwards-level upgrades
- **Résumé** (5.3): `public/resume.pdf` linked from the desktop nav, mobile menu and footer.
- **Content depth** (5.3): case studies end on a full-bleed visual "Next project" banner (dimmed image backdrop + big title) with a compact wrap-around previous link; About gained a data-driven "Currently" section (`src/data/now.js`) — Researching / Shipping / Building / Open to, no vanity metrics.
- **Animated link underlines** (5.2): `.link-underline` / `.nav-underline` — a branded gradient underline that wipes in from the left on hover/focus and retracts to the right, across the header nav (lit for the active route), footer, Contact and About. Pure CSS, GPU-composited.
- **Glass portrait card** (About): the About photo became `GlassPhotoCard` — a full-bleed portrait under a tilt-on-hover "glass" pane (cursor-tracked specular glare, reflection streak, rim light). Card ratio matched to the source (3:4) so `object-cover` fills with no crop and no gaps. Pure transforms + gradients, no `backdrop-filter`.
- **Hero constellation** (5.1): the hero's static orb became `ParticleSphere` — a rotating aurora point-globe with a wire mesh, glow, shimmer and cursor tilt. Pure Canvas2D, ~5 kB, no dependency (chosen over Spline, whose runtime alone would have blown the JS budget).
- **Entry preloader** (5.1 signature moment): a ~1.1 s aurora intro with a mono percentage counter, then a clip-path curtain wipe into the hero. First-visit-per-session only; driven by time-based timers so it can never trap the user, and built as a sibling overlay so it never touches ScrollTrigger's pins.
- Two Play Store apps (**365: Life Calendar in Dots**, **Wordigo**) added as first-class case studies with the official Google Play badge, app icon, screenshot gallery and `MobileApplication` JSON-LD — the `Mobile` filter finally has content behind it.
- AI/ML research (M.Tech @ IIT Kanpur) surfaced via a footer callout, a `socials` entry and JSON-LD `sameAs`.
- Cursor context labels (`data-cursor-label`), live `Asia/Kolkata` clock in the footer.

### Phase 4 — Accessibility & UX correctness
- Mobile-nav focus trap with focus returned to the trigger on close.
- Scroll restoration that respects Back/Forward (`POP` restores position; `PUSH` goes to top).
- Form `aria-busy` on submit.

### Phase 3 — SEO
- Build-time prerender of every non-home route (4 static + 13 case studies) into `dist/<route>/index.html` with real `<title>`, description, OG/Twitter, canonical and per-project OG image — so unfurlers that don't run JS stop showing the homepage for every shared link.
- Sitemap generated from `projects.js` at build time; per-page JSON-LD.

### Phase 2 — Performance
- **Framer Motion removed entirely** (−41 kB gz off `/`); page transitions, mobile nav and grid entrances rebuilt on CSS keyframes and GSAP.
- Fonts self-hosted as subset woff2 — killed two render-blocking stylesheets across three third-party hosts.
- Every project image re-exported (`beaesthetic` 560 → 33 kB, avatars 126 → 34 kB); card images sit in `aspect-[16/10]` boxes so the space is reserved before the bytes land — no CLS.
- `Orb3D` skips its layout read entirely while scrolled off-screen; `CustomCursor` parks its rAF loop once the ring converges instead of spinning forever.

### Phase 1 — Critical fixes
- **Fixed the Vercel 404** on deep links / refresh (canonical `/(.*) → /index.html` rewrite, dropped `cleanUrls`).
- Fixed the dead hover-zoom on FeaturedWork cards (missing `group` class).
- Added an `ErrorBoundary` for stale-chunk recovery after a redeploy.
- Corrected the JSON-LD `sameAs` handles.

---

## 🙌 Credits

- Type — **Google Fonts** (Anybody, Inter, JetBrains Mono) — self-hosted
- Icons — **lucide-react**
- Motion — **GSAP**, **Lenis**
- Tooling — **Vite (rolldown)**, **Tailwind v4**

---

## 📝 License

© 2026 Varad Patil. All rights reserved. Source code provided for portfolio review — please don't redistribute or rebrand without permission.
