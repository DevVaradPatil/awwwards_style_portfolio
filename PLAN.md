# Phase Plan — "Aurora Compute" Portfolio for Varad Patil

Content from [portfolio_content.md](portfolio_content.md) drives every data file (no hardcoded copy in components).

---

## Phase 0 — Foundation
**Goal:** Stand up a buildable Vite + React 19 + Tailwind v4 shell with routing, tokens, fonts, and branded loading states.

**Deliverables**
- `vite.config.js`: `@` → `/src` alias, `manualChunks` (function form) splitting `react`, `gsap`, `motion`, `lenis`, `three`.
- `src/index.css`: Tailwind v4 import, `@theme {}` with all Aurora Compute tokens (surfaces, ink, accents, stroke, fonts, signature gradient, radii, fluid type scale `--fs-h1`…`--fs-body`).
- Font loading: Clash Display (Fontshare CDN), Inter, JetBrains Mono — preconnect + `font-display: swap`.
- Global CSS reset, focus-ring utility, `.brand-gradient-text` (with padding-right + inline-block + overflow-wrap fix), display-heading letter-spacing fix.
- `src/router/AppRouter.jsx` with `BrowserRouter`, lazy routes: `/`, `/work`, `/work/:slug`, `/about`, `/playground`, `/contact`, `*` → 404.
- `src/components/system/BrandedLoader.jsx`, `RouteLoader.jsx`, `Container.jsx`, `Section.jsx`.
- `src/App.jsx` shell: skip-to-content link, header placeholder, `<Suspense fallback={<RouteLoader />}>`, footer placeholder.
- ESLint flat config tuned for React 19 + hooks.
- `index.html` meta defaults (theme-color `#08070d`, viewport, title).

**Acceptance criteria**
- `npm run build` completes clean, chunks visible in dist output.
- `npm run dev` serves `/`, `/work`, `/about`, `/contact`, `/playground`, 404 with placeholder text and no console errors.
- Tab key reveals "Skip to content" link; focus ring is visible on all routes' links.
- Tokens resolvable: `bg-void`, `text-(length:--fs-h1)`, `text-ink-100` all render correctly.

**Depends on:** none.

---

## Phase 1 — Design System Primitives
**Goal:** Build every reusable primitive in isolation, exercised on `/playground`.

**Deliverables**
- `src/components/primitives/`: `Reveal.jsx`, `MagneticButton.jsx`, `TiltCard.jsx`, `Marquee.jsx`, `GradientBlob.jsx`, `SplitText.jsx`, `Counter.jsx`, `Orb3D.jsx`.
- `src/data/` initial files seeded from portfolio_content.md: `projects.js`, `skills.js`, `experience.js`, `education.js`, `testimonials.js`, `socials.js`.
- `/playground` route: gallery of every primitive with labels + variants.
- Primitive rules baked in: Marquee uses per-frame measure of `groupW + gap`, flat sibling groups, `[-groupW, 0]` / `[0, groupW]` wrap; Orb3D uses fixed lighting + scrolling masked texture (not rotating mesh).

**Acceptance criteria**
- `/playground` renders all primitives; resize → marquee remains seamless, no jump.
- Magnetic buttons keyboard-activatable, visible focus ring.
- Orb3D: lighting fixed under cursor tilt; surface texture loops without seam.
- No primitive imports content directly — only from `src/data/*`.

**Depends on:** Phase 0.

---

## Phase 2 — Smooth Scroll & Motion Infrastructure
**Goal:** Wire Lenis ↔ GSAP ticker, page transitions, and a stateless custom cursor.

**Deliverables**
- `src/components/system/SmoothScrollProvider.jsx` (Lenis instance, `gsap.ticker.add`, `ScrollTrigger.update`, disabled on coarse pointer).
- `src/components/system/PageTransition.jsx` (Framer Motion `AnimatePresence` with key on `location.pathname`).
- `src/components/system/CustomCursor.jsx`: single `useLayoutEffect([])`, two refs, imperative `transform` writes, gated by `matchMedia('(hover: hover) and (pointer: fine)')`. No React state. No `useReducedMotion`.
- `src/lib/scrollHelpers.js`: ScrollTrigger reveal helper, scrub helper, pin helper.
- `src/styles/cursor.css` for cursor styles + `cursor: none` on `body` when active.

**Acceptance criteria**
- Scrolling on `/playground` is buttery, no jank; ScrollTrigger reveals fire correctly.
- Cursor follows pointer with zero re-renders.
- Route change shows transition; scroll restoration sane.
- Touch device: cursor hidden, native scroll preserved.

**Depends on:** Phases 0–1.

---

## Phase 3 — Home Page
**Goal:** Deliver the marquee Home scene flow.

**Deliverables**
- `src/pages/Home.jsx` composing scenes from `src/sections/home/`:
  - `Hero.jsx` — SplitText name, gradient tagline, dual CTAs, `Orb3D` accent.
  - `IntroMarquee.jsx` — running "Code · Design · Create · AI" strip.
  - `AboutTeaser.jsx` — short bio + photo placeholder + link.
  - `FeaturedWork.jsx` — top 4 projects from `projects.js` with TiltCard.
  - `SkillsCloud.jsx` — categorized chips from `skills.js`.
  - `ManifestoScrub.jsx` — scrub-pinned manifesto with word-by-word reveal.
  - `Stats.jsx` — Counters.
  - `CTAFooter.jsx` — large "Let's build" CTA.

**Acceptance criteria**
- All sections render with real content from data files (no Lorem).
- Manifesto scrub plays smoothly, releases pin correctly.
- Stats counters trigger once on view.
- Lighthouse Perf on `/` ≥ 85 (pre-optimization baseline).

**Depends on:** Phases 0–2.

---

## Phase 4 — Work Index + Case Study
**Goal:** Filterable grid and rich dynamic case-study route.

**Deliverables**
- `src/data/projects.js` extended with `slug`, `tags`, `problem`, `approach`, `stack`, `images`, `links`, `year`.
- `src/pages/Work.jsx` — filter chips (Web · AI · 3D · Android · Open Source), animated grid.
- `src/pages/CaseStudy.jsx` (route `/work/:slug`) — hero with title + meta, problem/approach/stack sections, screenshot gallery, live + repo buttons, prev/next project nav.
- 404 fallback within case study for unknown slug.

**Acceptance criteria**
- Filter chips update grid without layout thrash; URL stays clean.
- Every project in data file has a working case study route, no broken images (placeholders allowed with `TODO:` marker if asset missing).
- Direct navigation to `/work/<slug>` works (SPA fallback verified).

**Depends on:** Phases 0–3.

---

## Phase 5 — About Page
**Goal:** Long-form story with principles, timeline, education, achievements.

**Deliverables**
- `src/pages/About.jsx` composing: long bio + portrait placeholder, principles grid (4 pillars), vertical timeline (experience + education from data), stack chips grouped, achievements + testimonials carousel, closer CTA → `/contact`.

**Acceptance criteria**
- Timeline renders chronologically newest-first, all entries from data.
- Testimonials carousel keyboard-navigable.
- Page passes axe DevTools with 0 critical issues.

**Depends on:** Phases 0–2.

---

## Phase 6 — Contact Page + Form
**Goal:** Working contact form with EmailJS plumbing and graceful fallback.

**Deliverables**
- `src/pages/Contact.jsx` — info card (email, socials, location, availability) + form (Name, Email, Message).
- `src/lib/emailjs.js` reading `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`. If any missing → fall back to `mailto:varadapatil123@gmail.com` with prefilled subject/body.
- Inline validation (required, email format), submit states (idle / sending / success / error).
- `.env.example` added with the three keys + comments.

**Acceptance criteria**
- Without env vars set: submitting opens `mailto:` link, shows neutral confirmation.
- With env vars: actual EmailJS call (manual test by Varad).
- Form is fully keyboard usable; errors announced via `aria-live`.

**Depends on:** Phases 0–2.

---

## Phase 7 — 404 + Accessibility Pass
**Goal:** Branded 404 and a clean a11y sweep across the site.

**Deliverables**
- `src/pages/NotFound.jsx` — large 404 display, tickerstrip, links to Home + Work.
- Audit: every interactive element has visible focus ring, semantic landmarks, alt text on every image, ARIA labels on icon-only buttons, language attribute, skip link verified.
- Opt-in `.respect-reduced-motion` class implementation (scoped, never global).
- Run Lighthouse a11y + axe DevTools.

**Acceptance criteria**
- Lighthouse Accessibility ≥ 95 on every route.
- axe DevTools: 0 critical, 0 serious issues.
- Decorative animations continue to play with system reduced-motion (since global killer is forbidden).

**Depends on:** Phases 3–6.

---

## Phase 8 — Code Splitting, Performance, SEO
**Goal:** Hit the performance and SEO targets.

**Deliverables**
- Verify all secondary routes lazy-loaded; preload critical fonts; `<link rel="preload">` for hero asset.
- Image pipeline: `loading="lazy"`, `decoding="async"`, explicit width/height, WebP variants where assets allow.
- Per-route title/description/OG via small `useDocumentMeta` hook.
- `public/sitemap.xml`, `public/robots.txt`, favicons (use existing `logov2.webp` or `TODO:` placeholder), `public/og-image.png` (`TODO:` if missing).
- JSON-LD `Person` schema in `index.html`.

**Acceptance criteria**
- Initial JS payload on `/` < 200 KB gzipped (best effort).
- Lighthouse mobile (throttled): Performance ≥ 90, Best Practices = 100, SEO = 100.
- View-source shows correct title/description/OG/JSON-LD per route after hydration.

**Depends on:** Phases 3–7.

---

## Phase 9 — Deployment Readiness
**Goal:** Make the repo push-and-deploy ready.

**Deliverables**
- `README.md`: overview, stack, scripts (`dev`/`build`/`preview`/`lint`), folder map, env vars, screenshots, "Deploy to Vercel" button, credits, license.
- `vercel.json` if SPA rewrite needed (`{"rewrites":[{"source":"/(.*)","destination":"/"}]}`).
- `.gitignore` audit: `node_modules`, `dist`, `.env*` (except `.env.example`), local editor folders.
- `.env.example` finalized with comments.
- Final `npm run build` clean; suggested first commit message.

**Acceptance criteria**
- Fresh clone → `npm i && npm run build` succeeds with no warnings (beyond third-party).
- All routes work on `vite preview`; deep-link refresh works (SPA rewrite verified).
- Lighthouse targets all hit; README screenshots in place (or `TODO:` listed).

**Depends on:** Phases 0–8.
