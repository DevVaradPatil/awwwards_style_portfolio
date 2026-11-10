# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Awwwards-grade single-page portfolio for Varad Patil. React 19 + Vite 8 (rolldown), plain JSX (no TypeScript), Tailwind CSS v4, heavy custom motion. Deployed on Vercel at `varaddev.vercel.app`.

## Commands

```bash
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # prebuild sitemap → vite build → postbuild prerender + perf budgets
npm run preview    # serve the production build locally
npm run lint       # ESLint (flat config) over the workspace
npm run budget:report   # print the perf-budget table without failing
```

There is no test suite. CI (`.github/workflows/ci.yml`) runs `npm run lint` and `npm run build`, so a budget violation fails the build — run both before calling a change done.

`npm run build` is a three-step pipeline:
- `scripts/generate-sitemap.mjs` (prebuild) parses project slugs out of `src/data/projects.js` **as text** (Node can't import the `.webp` imports), so keep `slug: '...'` as a plain string literal.
- `scripts/prerender.mjs` (postbuild) writes `dist/<route>/index.html` with a per-route `<head>` from `src/data/siteMeta.js` and `projects.js`; it reads `dist/.vite/manifest.json` (hence `manifest: true` in `vite.config.js`).
- `scripts/check-budgets.mjs` (postbuild) fails on oversized initial JS/CSS, lazy route chunks, or images. Oversized images are listed in `IMAGE_WAIVERS` at their current size; they may shrink, never grow.

## Conventions

- **Import alias:** `@` → `/src`. Use it for all cross-directory imports (`@/components/...`, `@/data/...`).
- **No TypeScript** — plain `.jsx`/`.js`. Types documented via JSDoc where useful.
- **Styling is Tailwind v4 with CSS-first tokens.** All design tokens live in the `@theme {}` block in `src/index.css` — there is no `tailwind.config.js`. Reference tokens with Tailwind v4 arbitrary-property syntax: `bg-(--color-void)`, `text-(length:--fs-h1)`, `rounded-(--radius-md)`. Do not hardcode hex colors in components; add/reuse a token.
- Icons come from `lucide-react` only (kept in a single shared `vendor-icons` chunk).

## Architecture

### Composition (`src/App.jsx`)
`SmoothScrollProvider` wraps everything → `Preloader` → skip-link → `CustomCursor` → `Header` → `<main>` holding `AppRouter` → `Footer` → `Analytics`. Persistent chrome (header/footer/cursor/scroll) lives here; only the routed page changes.

- `Preloader` is the first-visit-per-session intro (gated on `sessionStorage['varad:intro-seen']`). It is a fixed **sibling** of `<main>`, never a wrapper, and finishes on `setInterval`/`setTimeout` timers with a hard fallback, because rAF and CSS animations pause in background tabs and a stalled overlay hides the whole site. Its effect runs once (`[]` deps).
- `Analytics` loads `@vercel/analytics` + speed insights through a dynamic import, so they stay out of the initial `/` payload.

### Routing (`src/router/AppRouter.jsx`)
`Home` is eagerly imported; **every other route is `lazy()` + `Suspense`** (fallback `RouteLoader`) to keep the initial payload small — preserve this split when adding routes. `<Routes>` sits inside `ErrorBoundary` inside `PageTransition`, a CSS-only, enter-only fade keyed by pathname (`.page-enter` in `src/index.css`). Dynamic route `/work/:slug` renders `CaseStudy`. A new static route also needs an entry in `src/data/siteMeta.js` (`pageMeta`, `staticPrerenderRoutes`) and in `scripts/generate-sitemap.mjs`.

### Data-driven content (`src/data/`)
Pages/sections render from plain JS arrays: `projects.js`, `skills.js`, `experience.js`, `education.js`, `testimonials.js`, `socials.js`, `techLogos.js`, `now.js`. **To change portfolio content, edit these files — not the components.** Projects are keyed by `slug`; `CaseStudy` looks a project up by `slug` and computes prev/next by array index (wrapping), so array order is meaningful. Project images are imported from `src/assets/projects/*.webp` into `projects.js`.

### Motion system — three coordinated layers
There is no Framer Motion (it was removed to cut ~41 kB gz); don't reintroduce it.

1. **Lenis smooth scroll** (`SmoothScrollProvider`): driven off `gsap.ticker`, so GSAP and Lenis share one RAF loop. **Disabled on coarse/touch pointers** (native scroll wins). Instance exposed as `window.__lenis`. On route change it scrolls to top instantly and calls `ScrollTrigger.refresh()`.
2. **GSAP + ScrollTrigger** for scroll-scrubbed / pinned effects (e.g. the `ManifestoScrub` pin). Shared helpers in `src/lib/scrollHelpers.js` (`fadeUp`, `scrubTimeline`, `pinSection`, `killAllScrollTriggers`). Register plugins once per module (`gsap.registerPlugin(ScrollTrigger)`), and kill triggers on unmount to survive HMR.
3. **CSS keyframes** in `src/index.css` for page/card/menu entrances (`.page-enter`, `.card-enter`, `.menu-drop`). `Reveal` uses IntersectionObserver plus an in-view check at mount and a shared scroll watcher, so content is never left hidden if one path fails to fire.

Rules that keep pins and reveals working (each one broke the live site when violated):
- CSS entrance animations use `animation-fill-mode: backwards`, never `both`. A retained `transform` (even `translateY(0)`) on an ancestor turns it into the containing block for `position: fixed`, and ScrollTrigger pins fly off-screen.
- Never put `overflow-x` on `<html>`; it breaks ScrollTrigger's scroller detection and reveals stay at `opacity: 0`. Overflow containment lives on `body`.
- Don't gate entrance/reveal/transition animations on `prefers-reduced-motion`: the owner browses with it on and wants motion always playing. `.respect-reduced-motion` exists as an opt-in class for anything that should honor it.

The in-app browser preview reports reduced motion and runs as a hidden document (rAF, GSAP, CSS animations and IntersectionObserver are paused), so it cannot verify animation. Check animation changes by construction (lint, build, computed styles) and say the visual still needs a check in a real browser.

### Component tiers (`src/components/`)
- `system/` — structural/behavioral: `Container`, `Section`, `SmoothScrollProvider`, `PageTransition`, `Preloader`, `ErrorBoundary`, `CustomCursor`, `Analytics`/`VercelBeacons`, loaders (`RouteLoader`, `BrandedLoader`).
- `primitives/` — reusable motion/visual building blocks: `Reveal`, `MagneticButton`, `TiltCard`, `Marquee`, `GradientBlob`, `SplitText`, `Counter`, `Orb3D`, `ParticleSphere` (Hero accent), `GlassPhotoCard`. `Orb3D` and `ParticleSphere` are hand-rolled Canvas2D, not three.js.
- `layout/` — `Header`, `Footer`.

`src/sections/home/` holds the composed Home-page sections (Hero, FeaturedWork, SkillsCloud, ManifestoScrub, etc.); `src/pages/` holds one component per route.

### SEO / meta (`src/lib/useDocumentMeta.js`, `src/data/siteMeta.js`)
Each page calls `useDocumentMeta({ title, description, path, jsonLd })` to imperatively patch `<title>`, OG/Twitter tags, canonical link, and optional JSON-LD. New pages should call it. Site-wide defaults (`SITE`: name, URL, OG image) and static-route meta (`pageMeta`) live in `src/data/siteMeta.js`, which has no imports so both the app and the Node prerender script can read it. `SITE.ogImage` must name a file that exists in `public/` — unfurlers fail silently on a 404.

### Contact form / email (`src/lib/emailjs.js`)
Posts to the **EmailJS REST API** (no SDK) using `VITE_EMAILJS_*` env vars, and **silently falls back to `mailto:`** if any var is missing (`emailjsConfigured` flag). Env keys: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` (copy `.env.example` → `.env.local`). Fallback recipient is `contact.email` from `src/data/socials.js`.

### Build (`vite.config.js`)
`target: es2022`, `manifest: true`. Vendors are hand-split via `manualChunks` into `vendor-react`, `vendor-router`, `vendor-gsap`, `vendor-lenis`, `vendor-icons` — keep new heavy deps out of the app chunk by extending this map. `@vercel/*` deliberately returns `undefined` there (before the react matcher) so analytics stays in its async chunk. `dist` is gitignored and ESLint-ignored.

Fonts (Clash Display, Inter, JetBrains Mono) are self-hosted woff2 in `public/fonts/`, declared in `src/styles/fonts.css`; `scripts/fetch-fonts.mjs` regenerates both.

## Deployment
Vercel via `vercel.json`: SPA rewrite (all non-asset paths → `/index.html`, required so deep links like `/work/<slug>` survive refresh), immutable caching for hashed assets, and security headers. Any static host works with an equivalent SPA fallback. Set the three `VITE_EMAILJS_*` vars in the host's env settings.
