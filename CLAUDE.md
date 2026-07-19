# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Awwwards-grade single-page portfolio for Varad Patil. React 19 + Vite 8 (rolldown), plain JSX (no TypeScript), Tailwind CSS v4, heavy custom motion. Deployed on Vercel at `varaddev.vercel.app`.

## Commands

```bash
npm run dev        # Vite dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint (flat config) over the workspace
```

There is no test suite. Verification is manual (lint + visual/browser check via `npm run dev`).

## Conventions

- **Import alias:** `@` → `/src`. Use it for all cross-directory imports (`@/components/...`, `@/data/...`).
- **No TypeScript** — plain `.jsx`/`.js`. Types documented via JSDoc where useful.
- **Styling is Tailwind v4 with CSS-first tokens.** All design tokens live in the `@theme {}` block in `src/index.css` — there is no `tailwind.config.js`. Reference tokens with Tailwind v4 arbitrary-property syntax: `bg-(--color-void)`, `text-(length:--fs-h1)`, `rounded-(--radius-md)`. Do not hardcode hex colors in components; add/reuse a token.
- Icons come from `lucide-react` only (kept in a single shared `vendor-icons` chunk).

## Architecture

### Composition (`src/App.jsx`)
`SmoothScrollProvider` wraps everything → skip-link → `CustomCursor` → `Header` → `<main>` holding `AppRouter` → `Footer`. Persistent chrome (header/footer/cursor/scroll) lives here; only the routed page changes.

### Routing (`src/router/AppRouter.jsx`)
`Home` is eagerly imported; **every other route is `lazy()` + `Suspense`** (fallback `RouteLoader`) to keep the initial payload small — preserve this split when adding routes. The whole `<Routes>` is wrapped in `PageTransition` (Framer Motion) for enter/exit animation. Dynamic route `/work/:slug` renders `CaseStudy`.

### Data-driven content (`src/data/`)
Pages/sections render from plain JS arrays: `projects.js`, `skills.js`, `experience.js`, `education.js`, `testimonials.js`, `socials.js`, `techLogos.js`. **To change portfolio content, edit these files — not the components.** Projects are keyed by `slug`; `CaseStudy` looks a project up by `slug` and computes prev/next by array index (wrapping), so array order is meaningful. Project images are imported from `src/assets/projects/*.webp` into `projects.js`.

### Motion system — three coordinated layers
1. **Lenis smooth scroll** (`SmoothScrollProvider`): driven off `gsap.ticker`, so GSAP and Lenis share one RAF loop. **Disabled on coarse/touch pointers** (native scroll wins). Instance exposed as `window.__lenis`. On route change it scrolls to top instantly and calls `ScrollTrigger.refresh()`.
2. **GSAP + ScrollTrigger** for scroll-scrubbed / pinned effects. Shared helpers in `src/lib/scrollHelpers.js` (`fadeUp`, `scrubTimeline`, `pinSection`, `killAllScrollTriggers`). Register plugins once per module (`gsap.registerPlugin(ScrollTrigger)`), and kill triggers on unmount to survive HMR.
3. **Framer Motion** for component/page transitions (`PageTransition`) and the `Reveal` primitive.

  Respect `@media (prefers-reduced-motion: reduce)` (handled in `src/index.css`) when adding animation.

### Component tiers (`src/components/`)
- `system/` — structural/behavioral: `Container`, `Section`, `SmoothScrollProvider`, `PageTransition`, `CustomCursor`, loaders.
- `primitives/` — reusable motion/visual building blocks: `Reveal`, `MagneticButton`, `TiltCard`, `Marquee`, `GradientBlob`, `SplitText`, `Counter`, `Orb3D`.
- `layout/` — `Header`, `Footer`.

`src/sections/home/` holds the composed Home-page sections (Hero, FeaturedWork, SkillsCloud, ManifestoScrub, etc.); `src/pages/` holds one component per route.

### SEO / meta (`src/lib/useDocumentMeta.js`)
Each page calls `useDocumentMeta({ title, description, path })` to imperatively patch `<title>`, OG/Twitter tags, and canonical link. New pages should call it. Site-wide defaults (name, URL, OG image) are the `SITE` export in that file.

### Contact form / email (`src/lib/emailjs.js`)
Posts to the **EmailJS REST API** (no SDK) using `VITE_EMAILJS_*` env vars, and **silently falls back to `mailto:`** if any var is missing (`emailjsConfigured` flag). Env keys: `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY` (copy `.env.example` → `.env.local`). Fallback recipient is `contact.email` from `src/data/socials.js`.

### Build (`vite.config.js`)
`target: es2022`. Vendors are hand-split via `manualChunks` into `vendor-react`, `vendor-router`, `vendor-gsap`, `vendor-motion`, `vendor-lenis`, `vendor-icons` — keep new heavy deps out of the app chunk by extending this map. `dist` is gitignored and ESLint-ignored.

## Deployment
Vercel via `vercel.json`: SPA rewrite (all non-asset paths → `/index.html`, required so deep links like `/work/<slug>` survive refresh), immutable caching for hashed assets, and security headers. Any static host works with an equivalent SPA fallback. Set the three `VITE_EMAILJS_*` vars in the host's env settings.
