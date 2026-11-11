# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A motion-led single-page portfolio for Varad Patil. React 19 + Vite 8 (rolldown), plain JSX (no TypeScript), Tailwind CSS v4, custom motion (GSAP + Lenis + hand-written canvas/WebGL). Deployed on Vercel at `varaddev.vercel.app`.

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
- `scripts/check-budgets.mjs` (postbuild) fails on oversized initial JS/CSS, lazy route chunks (9 kB gz each), or images (150 kB). Oversized images are listed in `IMAGE_WAIVERS` at their current size; they may shrink, never grow.

## Conventions

- **Import alias:** `@` → `/src`. Use it for all cross-directory imports (`@/components/...`, `@/data/...`).
- **No TypeScript** — plain `.jsx`/`.js`. Types documented via JSDoc where useful.
- **Styling is Tailwind v4 with CSS-first tokens.** All design tokens live in the `@theme {}` block in `src/index.css` — there is no `tailwind.config.js`. Reference tokens with Tailwind v4 arbitrary-property syntax: `bg-(--color-ink)`, `text-(length:--fs-h1)`, `rounded-(--radius-md)`. Do not hardcode hex colors in components; add/reuse a token. Font width is set with `[font-stretch:115%]`.
- Element defaults and the room/elastic classes sit in `@layer base`, so a Tailwind utility on an element always wins. Keep new global element rules inside that layer; an unlayered rule silently beats every utility.
- Icons come from `lucide-react` only (kept in a single shared `vendor-icons` chunk).

## Design system ("Elastic")

- **Rooms.** Every section is one full-bleed block of a single color: ink `--color-ink` (hero, work, case studies, footer), midnight `.room-blue` (story, Now, next project; `--color-midnight`, the story word in `--color-blue-bright`; electric `--color-blue` stays an accent on bone), bone `.room-bone` (reading pages: About details, Contact, project index), pink `.room-pink` (the closing call to action only). A room class re-points `--color-fg`, `--color-fg-muted`, `--color-line` for its surface, so shared components read correctly anywhere. On bone, body text uses `--color-type` / `--color-type-muted`.
- **Type.** Display face is **Anybody**, a variable font with width (50–150) and weight (100–900) axes; body is Inter; JetBrains Mono only inside the code portrait. There are no gradient text, glow blobs, glass cards, pill badges or tiny uppercase mono labels — avoid reintroducing them.
- **Header** is white type with `mix-blend-mode: difference` (inverts over any room). The mobile menu is a sibling of the blended bar, never a child.

## Architecture

### Composition (`src/App.jsx`)
`SmoothScrollProvider` wraps everything → `Preloader` → skip-link → `CustomCursor` → `Header` → `<main>` holding `AppRouter` → `Footer` → `Analytics`. Persistent chrome lives here; only the routed page changes.

- `Preloader` is the first-visit-per-session intro (gated on `sessionStorage['varad:intro-seen']`): "VARAD" stretches as a counter runs. It is a fixed **sibling** of `<main>`, never a wrapper, and finishes on `setInterval`/`setTimeout` timers with a hard fallback, because rAF and CSS animations pause in background tabs and a stalled overlay hides the whole site. Its effect runs once (`[]` deps).
- `Analytics` loads `@vercel/analytics` + speed insights through a dynamic import, so they stay out of the initial `/` payload.

### Routing (`src/router/AppRouter.jsx`)
`Home` is eagerly imported; **every other route is `lazy()` + `Suspense`** (fallback `RouteLoader`) to keep the initial payload small — preserve this split when adding routes. `<Routes>` sits inside `ErrorBoundary` inside `PageTransition`, a CSS-only, enter-only fade keyed by pathname (`.page-enter`). Dynamic route `/work/:slug` renders `CaseStudy`; `/playground` is the Motion Lab. A new static route also needs an entry in `src/data/siteMeta.js` (`pageMeta`, `staticPrerenderRoutes`) and in `scripts/generate-sitemap.mjs`.

### Data-driven content (`src/data/`)
Pages render from plain JS: `projects.js`, `story.js` (the four Home chapters), `skills.js`, `experience.js`, `education.js`, `testimonials.js`, `socials.js`, `now.js`, `siteMeta.js`. **To change portfolio content, edit these files — not the components.** Projects are keyed by `slug`; `CaseStudy` looks a project up by `slug` and computes prev/next by array index (wrapping), so array order is meaningful. `featured: true` puts a project on the Home ring. Project images are imported from `src/assets/projects/*.webp` into `projects.js`.

### Motion
There is no Framer Motion and no three.js; don't add either.

1. **Lenis smooth scroll** (`SmoothScrollProvider`): driven off `gsap.ticker`, so GSAP and Lenis share one RAF loop. **Disabled on coarse/touch pointers** (native scroll wins). Instance exposed as `window.__lenis`; use `window.__lenis.scrollTo(target)` for in-page jumps (a native anchor jump desyncs it). On route change it scrolls to top instantly and calls `ScrollTrigger.refresh()`.
2. **GSAP + ScrollTrigger** for the Home story pin (`sections/home/Story.jsx`, desktop only via `gsap.matchMedia`) and the toolbox scroll effects. Register plugins once per module and kill/revert triggers on unmount to survive HMR.
3. **Signature primitives** (`src/components/primitives/`), each running its own rAF loop only while on screen (IntersectionObserver):
   - `ElasticText` — letters stretch wider/heavier near the pointer (CSS vars `--w`/`--g` → `font-variation-settings`). One shared loop for all instances, reads-then-writes, positions cached and re-measured on word change/resize/font load (never via ResizeObserver — the row resizes every frame). Rows never wrap; split long text into lines first (`lib/titleLines.js`). `words` prop cycles words with a squash-and-pop.
   - `WorkRing` — project cards on a CSS 3D ring; drag/horizontal-wheel momentum, keyboard focus faces a card, a drag never counts as a click.
   - `CodePortrait` — a photo redrawn as colored characters on Canvas 2D, pointer lens onto the real photo.
   - `LiquidName` — raw WebGL fragment shader (no library); used only on the Motion Lab route.
4. **CSS keyframes** in `src/index.css` for page/card/menu entrances (`.page-enter`, `.card-enter`, `.menu-drop`) and the route loader.

Rules that keep pins working (each one broke the live site when violated):
- CSS entrance animations use `animation-fill-mode: backwards`, never `both`. A retained `transform` (even `translateY(0)`) on an ancestor turns it into the containing block for `position: fixed`, and ScrollTrigger pins fly off-screen. Story chapters animate their own transforms, never the pinned section or anything above it.
- Never put `overflow-x` on `<html>`; it breaks ScrollTrigger's scroller detection. Overflow containment lives on `body`.
- Don't gate animations on `prefers-reduced-motion`: the owner browses with it on and wants motion always playing.

The in-app browser preview reports reduced motion and runs as a hidden document (rAF, GSAP, CSS animations and IntersectionObserver are throttled or paused), so it cannot verify animation. Check animation changes by construction (lint, build, DOM/computed state; `document.getAnimations().forEach(a => a.finish())` before reading layout) and say the visual still needs a check in a real browser.

### Component tiers
- `components/system/` — `SmoothScrollProvider`, `PageTransition`, `Preloader`, `ErrorBoundary`, `CustomCursor`, `Analytics`/`VercelBeacons`, `RouteLoader`.
- `components/primitives/` — `ElasticText`, `WorkRing`, `CodePortrait`, `LiquidName`, `MagneticButton` (variants `solid` pink, `ink`, `ghost`, `outline`).
- `components/layout/` — `Header`, `Footer`.
- `sections/home/` — `Hero`, `Story`, `WorkShowcase`, `Toolbox`, `CallToAction` (also reused at the end of About).
- `pages/` — one component per route.

### SEO / meta (`src/lib/useDocumentMeta.js`, `src/data/siteMeta.js`)
Each page calls `useDocumentMeta({ title, description, path, jsonLd })` to imperatively patch `<title>`, OG/Twitter tags, canonical link, and optional JSON-LD. New pages should call it. Site-wide defaults (`SITE`: name, URL, OG image) and static-route meta (`pageMeta`) live in `src/data/siteMeta.js`, which has no imports so both the app and the Node prerender script can read it. `SITE.ogImage` must name a file that exists in `public/` — unfurlers fail silently on a 404. Headings drawn with ElasticText keep their real text in an `sr-only` span. `scripts/prerender.mjs` also writes a `<noscript>` body (heading, description, links) into every route for crawlers that don't run JS, and reuses the `page-jsonld` id so the app doesn't duplicate the schema. The SPA rewrite answers unknown URLs with 200, so the 404 page sets `noindex` through the hook.

### Contact form / email (`src/lib/emailjs.js`)
Posts to the **EmailJS REST API** (no SDK) using `VITE_EMAILJS_*` env vars, and **silently falls back to `mailto:`** if any var is missing (`emailjsConfigured` flag). Env keys: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` (copy `.env.example` → `.env.local`). Fallback recipient is `contact.email` from `src/data/socials.js`. When `.env.local` is configured, a valid submit sends a real email — test validation only.

### Build (`vite.config.js`)
`target: es2022`, `manifest: true`. Vendors are hand-split via `manualChunks` into `vendor-react`, `vendor-router`, `vendor-gsap`, `vendor-lenis`, `vendor-icons` — keep new heavy deps out of the app chunk by extending this map. `@vercel/*` deliberately returns `undefined` there (before the react matcher) so analytics stays in its async chunk. `dist` is gitignored and ESLint-ignored.

Fonts (Anybody variable, Inter, JetBrains Mono) are self-hosted woff2 in `public/fonts/`, declared in `src/styles/fonts.css`; `scripts/fetch-fonts.mjs` regenerates both.

## Deployment
Vercel via `vercel.json`: SPA rewrite (all non-asset paths → `/index.html`, required so deep links like `/work/<slug>` survive refresh), immutable caching for hashed assets, and security headers. Any static host works with an equivalent SPA fallback. Set the three `VITE_EMAILJS_*` vars in the host's env settings. Pushing `main` deploys the live site.
