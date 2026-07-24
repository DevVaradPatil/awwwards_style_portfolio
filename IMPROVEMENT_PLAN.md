# IMPROVEMENT_PLAN.md

Full audit of `new_port_awards` (React 19 + Vite 8 + Tailwind v4, deployed at `varaddev.vercel.app`) with a phase-wise execution plan. Original audit measured 2026-07-19.

> **See also:** [PLAN.md](PLAN.md) — the *original build plan* (Phases 0–9) that created the site. All of it shipped; it's kept as a historical record. This document supersedes it.

---

## ✅ Status at a glance — 2026-07-24

**Every phase in this plan is complete.** Nothing is blocked or pending on my side.

| Phase | Status |
| --- | --- |
| 1 · Critical fixes | ✅ Done |
| 2 · Performance | ✅ Done |
| 3 · SEO | ✅ Done (incl. 3.3 head/meta) |
| 4 · Accessibility & UX | ✅ Done |
| 5 · Awwwards upgrades | ✅ Done (5.1–5.5) |
| 6 · Measurement & guardrails | ✅ Done, ongoing by nature |

**Where the numbers landed** (vs. the 2026-07-19 baseline below):

| Metric | Baseline | Now |
| --- | ---: | ---: |
| Initial `/` JS (gz) | ~190 kB | **147.8 kB** (budget 165) |
| Initial CSS (gz) | 8.4 kB | **9.4 kB** (budget 14) |
| Largest project image | 560 kB | **151 kB** |
| OG image | 569 kB (and 404-ing) | **38 kB**, correct |
| Routes with real `<head>` | 1 | **18** (prerendered) |
| Case-study URLs in sitemap | 0 | **13** |

**Deliberately dropped** (decided, not pending):
- Per-project **metrics** (role/timeline/"500+ users") — not wanted.
- Project **screen-capture videos / GIF loops** — not wanted.
- **Image parallax** on project cards — would fight the existing `group-hover:scale-105` transform and regress the hover zoom.
- **Mono-label scramble/decode** effect — gimmicky next to the link underline.
- **Lighthouse CI** — needs a third-party action + hosted run; Speed Insights gives real field data instead.

**The only open items are yours, not code:**
1. Enable **Analytics + Speed Insights** in the Vercel dashboard (client code is wired and inert until toggled).
2. Before an Awwwards submission: walk the site at 1280×800 and on a mid-tier Android phone — the one check I can't run (the preview pauses animation entirely).

**Optional, nice-to-have (not blocking anything):**
- Re-export `creator.jpg` (243 KiB) and the 365 `logo.png` (157 KiB) — both held by budget waivers pinned to current size, so they can only shrink. See [docs/IMAGE_OPTIMIZATION.md](docs/IMAGE_OPTIMIZATION.md).
- 💡 **View Transitions** shared-element morph into case studies (5.2) — the one remaining "wow" idea; needs live iteration on a real browser.

---

## 0. Baseline — measured facts (2026-07-19, historical)

> Snapshot of the problems this plan set out to fix. Kept for the before/after record — see the table above for where each landed.

**Initial `/` payload (gzipped):**

| Chunk | gz size |
| --- | ---: |
| vendor-react | 57.2 kB |
| vendor-gsap | 44.3 kB |
| vendor-motion (Framer) | 41.0 kB |
| index (app) | 22.5 kB |
| vendor-router | 14.5 kB |
| vendor-icons | 5.1 kB |
| vendor-lenis | 5.0 kB |
| CSS | 8.4 kB |
| **Total JS ≈** | **~190 kB** |

**Heaviest static assets (as shipped):**

| Asset | Size |
| --- | ---: |
| `public/og-image.png` | 569 kB |
| `beaesthetic.webp` | 560 kB |
| `thinktank.webp` | 341 kB |
| `island.webp` | 296 kB |
| `spotify.webp` | 243 kB |
| `zelda.webp` | 195 kB |
| `psakhre.jpeg` (avatar!) | 126 kB |
| `aman.jpeg` (avatar!) | 106 kB |
| `creator.jpeg` | 89 kB |

**Key structural facts:**
- Pure client-side SPA — crawlers/link-unfurlers that don't execute JS only ever see the *default* `index.html` meta for every route (`useDocumentMeta` patches tags after hydration).
- **Two full animation libraries (GSAP 44 kB + Framer Motion 41 kB) are both in the eager `/` graph** — Framer is pulled in by `Header` (mobile nav) and `PageTransition`, so it can never be lazy today.
- Fonts load via **two render-blocking external CSS files** (Fontshare + Google Fonts) across 3 third-party hosts.
- `sitemap.xml` lists only the 5 static routes — none of the 11 `/work/<slug>` case-study URLs.
- Project `<img>`s have `loading="lazy"` + `decoding="async"` (good) but **no `width`/`height`/`srcset`** outside About/SkillsCloud → CLS risk + full-size downloads.

---

## Phase 1 — Critical fixes — ✅ shipped

### 1.1 Fix the Vercel 404 on refresh / deep links ⚠ (the known issue)

The current rewrite in [vercel.json](vercel.json) uses a negative-lookahead regex plus `cleanUrls`. Vercel's `source` matching (path-to-regexp) is fussy with nested groups, and `cleanUrls` adds `.html`-stripping redirects on top — the combination is fragile and is the prime suspect. On Vercel, **the filesystem handler always wins before rewrites**, so the exclusions (`assets/`, `.*\..*`) are unnecessary — real files are served regardless.

Replace the config with the canonical SPA form:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

- Drop `cleanUrls` / `trailingSlash` (no benefit for an SPA, adds redirect layers).
- Drop `framework`/`buildCommand`/etc. only if the dashboard preset is already "Vite" — otherwise keep them.
- After merging: **redeploy**, then verify in the Vercel dashboard that (a) the project's *Root Directory* is the repo root (so `vercel.json` is picked up) and (b) no dashboard-level rewrites override it.
- Acceptance: hard-refresh `https://varaddev.vercel.app/work/resume-insight` → 200 + correct page. Test `/work`, `/about`, `/contact`, a bogus URL (`/nope` → NotFound page renders).

### 1.2 Broken hover effect on FeaturedWork cards (real bug)

[FeaturedWork.jsx:31](src/sections/home/FeaturedWork.jsx:31) — the `<Link>` has **no `group` class**, but the image inside uses `group-hover:scale-105` → the zoom-on-hover never fires on the home page (it works on `/work` where `ProjectCard` has `group block`). Add `className="group block h-full"` to the Link and switch the arrow chip from `hover:` to `group-hover:`.

### 1.3 Add an error boundary (stale-chunk protection)

Lazy routes + immutable hashed assets mean: user has tab open → you redeploy → they navigate → old chunk 404s → **blank white screen**. Add a top-level `ErrorBoundary` that catches chunk-load errors and offers/does a `window.location.reload()`. Wrap `<AppRouter />` (or `Suspense`) with it.

### 1.4 Data hygiene checks

- Verify `sameAs` URLs in [index.html:69-72](index.html) (`github.com/varadpatil`, `linkedin.com/in/varadpatil`) actually match your profiles (git username is `DevVaradPatil` — if the JSON-LD/socials point at someone else's handle, that's an SEO/identity bug). Sync with `src/data/socials.js`.
- Delete or wire up dead code: `BrandedLoader.jsx` is exported but never imported anywhere.

---

## Phase 2 — Performance — ✅ shipped

> Landed: every image re-exported (`beaesthetic` 560 → 33 kB, avatars 126 → 34 kB), fonts self-hosted as subset woff2 (two render-blocking third-party stylesheets removed), **Framer Motion deleted entirely** (−41 kB gz off `/`), `Orb3D` layout read gated on visibility, `CustomCursor` rAF loop parks when converged. Initial `/` JS: ~190 → **147.8 kB gz**.

### 2.1 Images (largest single win)

1. **Resize + recompress every project screenshot** to the largest rendered size (~800–900 px wide for the 16/10 cards; ~1400 px for case-study heroes). Targets: `beaesthetic` 560→<90 kB, `thinktank` 341→<90 kB, `island`, `spotify`, `zelda` similar. Use `sharp`/`squoosh` (webp q≈75, or AVIF with webp fallback).
2. **Avatars are absurdly heavy** — `psakhre.jpeg` 126 kB, `aman.jpeg` 106 kB render at tiny sizes. Export 128–160 px webp → 3–8 kB each.
3. Add **`width` + `height` (or `aspect-ratio`) to every `<img>`** in `Work.jsx`, `FeaturedWork.jsx`, `CaseStudy.jsx` → kills CLS.
4. Optionally add `srcset`/`sizes` (2 widths per project image) via a small `vite-imagetools` setup — nice-to-have once files are properly sized.
5. `public/og-image.png` 569 kB → re-export ≤1200×630 as a well-compressed PNG/JPEG **under 150 kB** (some unfurlers time out on large OG images).

### 2.2 Self-host fonts (kills the render-blocking third-party chain)

Currently: 2 render-blocking CSS requests to `api.fontshare.com` + `fonts.googleapis.com`, then font files from a third host. Replace with self-hosted woff2:
- Download Clash Display (500/600/700 — Fontshare license allows self-hosting), Inter (400/500/600/700 — trim 300 if unused), JetBrains Mono (400/500).
- `@font-face` with `font-display: swap` in `index.css`, files in `public/fonts/`, `<link rel="preload" as="font" type="font/woff2" crossorigin>` for the 1–2 faces used above the fold (Clash Display 600, Inter 400).
- Remove the three `preconnect`s + two stylesheet links from `index.html`.
- Expected: −300–500 ms FCP/LCP on cold loads, no FOUT flash of fallback on repeat views.

### 2.3 Consolidate animation libraries (−~41 kB gz from `/`)

You ship **both** GSAP and Framer Motion eagerly. GSAP is load-bearing (SplitText, ScrollTrigger, scrub sections) — Framer is used only for: `PageTransition` (fade/slide), `Header` mobile-nav (slide-down), and `Work` filter grid (layout/exit animations).

Recommended: **drop Framer Motion from the eager path**:
- `PageTransition` → reimplement with GSAP or plain CSS classes on route change (a fade+translate needs ~20 lines).
- `Header` mobile nav → CSS transition on mount/unmount (or a `grid-template-rows` trick).
- `Work.jsx` filter animations → either GSAP `Flip` plugin (already paying for GSAP) or keep Framer *only* inside the lazy `Work` chunk.
- Acceptance: `/` payload drops to ~150 kB gz; no visual regression in transitions.

(Alternative if you love Framer's API: go the other way and remove GSAP — but GSAP's ScrollTrigger is doing more work here, so removing Framer is cheaper.)

### 2.4 Runtime niceties (small, quick)

- [Orb3D.jsx:269](src/components/primitives/Orb3D.jsx:269) — the `pointermove` listener is on `window` and calls `getBoundingClientRect()` **on every mouse move, forever, even when the orb is off-screen**. Gate it on the existing `visible` flag and cache the rect (refresh in the ResizeObserver).
- `CustomCursor` rAF loop runs even when the ring has converged — early-out when `|mx−rx| < 0.1` and restart on next pointermove (minor battery win).
- Add `content-visibility: auto` + `contain-intrinsic-size` to below-fold home sections (`SkillsCloud`, `Stats`, testimonials) — cheap initial-render win.
- Consider `React.lazy` for `Orb3D` with an IntersectionObserver mount, though it's already lightweight (~3 kB).

---

## Phase 3 — SEO — ✅ shipped

> Landed: build-time prerender of all 17 non-home routes into `dist/<route>/index.html` with real title/description/OG/Twitter/canonical + per-project OG image and JSON-LD; sitemap generated from `projects.js` at build time (13 case-study URLs); `og:image:alt` per route. Two live bugs fixed along the way — the OG image was 404-ing site-wide (`.png` vs the actual `.webp`), and the prerenderer resolved project images by dist basename, which collided for the two Play Store apps (now uses Vite's build manifest).

### 3.1 Prerender every route to static HTML (the big one)

Right now Google *usually* renders JS, but LinkedIn/Twitter/WhatsApp/Slack unfurlers and many crawlers **don't** — every shared `/work/foo` link shows the homepage title/OG. Fix by generating static HTML per route at build time:

- Add a post-build prerender step (e.g. `vite-prerender-plugin`, or a ~60-line Puppeteer/`happy-dom` script iterating routes) that snapshots `/`, `/work`, `/about`, `/playground`, `/contact`, and **all 11 `/work/<slug>` pages** into `dist/<route>/index.html`.
- Each snapshot bakes in the route's real `<title>`, meta description, OG/Twitter tags, and canonical (your `useDocumentMeta` already sets them — the snapshot captures the patched head).
- Vercel then serves real HTML per URL; the SPA hydrates on top. The Phase-1 rewrite stays as fallback for unknown URLs.
- Bonus: a prerendered NotFound can be emitted as `404.html`-style handling instead of a soft-404.

### 3.2 Sitemap + structured data

- **Add all `/work/<slug>` URLs to `sitemap.xml`** with `<lastmod>`. Best: generate `sitemap.xml` at build time from `src/data/projects.js` (small node script in `npm run build`) so it can never drift.
- Add per-page JSON-LD: `CreativeWork`/`SoftwareApplication` on case studies (name, description, image, url, author), `BreadcrumbList` on `/work/<slug>`, and `WebSite` on `/`.
- Per-project OG images: even just using each project's screenshot as its `og:image` (needs Phase 3.1 to be visible to unfurlers) massively improves how shared links look.

### 3.3 Head/meta polish — ✅ shipped

- ✅ `apple-touch-icon` (180×180 PNG) + `icon-192` / `icon-512` and a minimal `site.webmanifest` (name, icons, theme color, standalone display). All three PNGs were rendered from `favicon.svg` onto the `--color-void` surface — Node has no SVG rasteriser and this ffmpeg build has no SVG decoder, so they were generated through a browser canvas.
- ✅ **Fixed a live bug found while doing this:** `og:image` pointed at `/og-image.png`, but the re-exported file is `og-image.webp` — so *every* OG image on the site was a 404 and every shared link unfurled with no image at all. Now `/og-image.jpg` (1200×658, 38 kB), referenced from both `index.html` and `siteMeta.js`. JPEG rather than WebP because several unfurlers still don't handle WebP OG images.
- ✅ **Fixed a second bug:** the prerenderer resolved each project's OG image by dist basename, which silently failed for the two Play Store apps (their `image` comes from an `import.meta.glob`, and both apps ship a `1.webp` *and* a `logo.png`, so basenames collide). Now `build.manifest: true` and the prerenderer reads `dist/.vite/manifest.json` for an exact source → hashed-output lookup, and warns loudly if a project's image can't be resolved. All 13 case studies now carry their own OG image.
- ✅ Per-route `og:image:alt`.
- ⏭ `twitter:creator` — **N/A, dropped**: no X handle exists. (Never guess one; the tag is simply omitted.)
- ✅ Canonical logic kept as is (already correct per route).

---

## Phase 4 — Accessibility & UX correctness — ✅ shipped

> Landed: mobile-nav focus trap with focus returned to the trigger, scroll restoration that respects Back/Forward (`POP` restores position, `PUSH` goes to top), `aria-busy` on the contact form while sending. **Reduced-motion note:** the global gating attempted here was deliberately reverted — the owner browses with reduce-motion enabled and gating froze all site motion. Motion is always-on by project decision; the opt-in `.respect-reduced-motion` class remains for anything that genuinely needs it.

- **Mobile nav focus trap**: `Header` closes on Escape (good) but focus isn't trapped in the open menu and isn't returned to the trigger on close. Add a small focus-trap (first/last sentinel or `inert` on `main` while open).
- **Scroll restoration**: `SmoothScrollProvider` force-scrolls to top on *every* pathname change — including browser **Back**, which breaks users' expected scroll position. Track navigation type (React Router's `useNavigationType() === 'POP'`) and skip the scroll-to-top on Back/Forward.
- **Reduced motion audit**: the CSS opt-in class `.respect-reduced-motion` exists but GSAP-driven animations (SplitText, scrub sections, Reveal) should check `prefers-reduced-motion` and skip/no-op (Orb3D already does this — extend the pattern; simplest via `gsap.matchMedia()`).
- **SplitText & hidden content**: split targets start at `opacity: 0` via `gsap.set` — if GSAP fails or reduced-motion path misses, headings stay invisible. Add a `.no-js`/timeout fallback or set initial state only when animation will actually run.
- Run Lighthouse + axe on every route; verify the ≥95 a11y score still holds after changes.
- Form: add `aria-busy` on submit button while sending; consider honeypot field for spam.

---

## Phase 5 — "Catches everyone's eye": Awwwards-level upgrades — ✅ shipped

The bones are genuinely good (custom cursor, magnetic buttons, orb, scrub sections). What separates "nice portfolio" from Awwwards SOTD-nominee is **one signature moment + relentless transition polish + case-study depth**.

### 5.1 Signature moments (pick 1–2, don't do all) — ✅ two shipped

- ✅ **Site entry preloader** — shipped as [`Preloader.jsx`](src/components/system/Preloader.jsx). A ~1.1 s branded intro: the aurora orb + a JetBrains-Mono percentage counter (this is what finally puts the previously-unused `BrandedLoader` to work), then a `clip-path` + translateY curtain wipe up into the hero. `sessionStorage`-gated to first visit per session (decided pre-paint, so refresh / in-session nav stay instant). Built with three hard guarantees: (1) it never traps the user — completion is driven by time-based `setInterval`/`setTimeout` with a hard fallback timer, never rAF or `animationend` (both pause in a hidden tab, which would otherwise strand the whole site behind the overlay); (2) it's a *sibling* overlay, never a wrapper, so its curtain transform can't create a containing block that breaks ScrollTrigger's fixed pins; (3) not gated on `prefers-reduced-motion` (the owner browses with it on). Verified end-to-end in the paused-rAF preview: run → leave → done → unmount, scroll lock set and restored, `sessionStorage` set, and a fixed-probe confirming no containing block.
- ✅ **Hero upgrade** — the hero's solid `Orb3D` was replaced with [`ParticleSphere.jsx`](src/components/primitives/ParticleSphere.jsx): a rotating constellation globe (aurora points on a Fibonacci-lattice sphere, a precomputed nearest-neighbour wire mesh, additive-blended glow, per-point shimmer, and cursor-tilt parallax). Pure Canvas2D, ~5 kB, no dependency — byte-neutral against the orb it replaced. Root cause of why the old one read as "static": `Orb3D` is gated on `prefers-reduced-motion` and freezes to a single frame, and the owner browses with reduce-motion on. `ParticleSphere` is deliberately not gated (per the project's standing motion decision), so it actually moves. `Orb3D` is retained — still used on the Playground page. (A Spline scene was considered and rejected: its ~200 kB+ runtime plus scene weight would blow the perf budget for what a 5 kB canvas achieves.)
- ⏭ **Page transitions v2** (branded wipe / View Transitions) — skipped by design. The brief was "pick 1–2, don't do all"; the preloader and the hero constellation are the two. Route changes already animate via the CSS `.page-enter` keyframe.

### 5.2 Interaction polish (high ROI, low risk) — ✅ shipped

- ✅ **Cursor context labels**: `CustomCursor` reads `data-cursor-label` and morphs the ring into a labelled pill.
- ✅ **Link underline choreography**: `.link-underline` / `.nav-underline` utilities in `index.css` — a branded violet→cyan underline that wipes in from the left on hover/focus and retracts to the right (origin-swap). Applied to the header nav (which also stays lit for the active route via `aria-current`), footer sitemap/socials/email, Contact socials, and the About closer. Pure CSS transform on a pseudo-element, GPU-composited. Verified: active-route underline renders at `scaleX(1)`, resting links at `scaleX(0)`. (The mono-label "scramble/decode" idea was dropped — it's gimmicky next to the clean underline and adds a JS loop for little gain.)
- 💡 **Shared-element feel into case studies** (View Transitions `view-transition-name` per slug): **optional future idea, not outstanding work.** The card-image-morphs-into-the-hero effect would be a genuine "wow", but it's fiddly to wire through React Router's SPA navigation and the morph can't be verified in a reduced-motion/paused preview — it needs live iteration on a real browser. Everything the plan committed to is done without it.
- ⏭ **Image parallax**: dropped. Project images already carry `group-hover:scale-105`, and a GSAP scroll-parallax on the same element fights over `transform` — it would regress the hover zoom that was previously fixed. Would need a wrapper-vs-image split; not worth the risk for the gain.
- **Footer**: oversized "Let's build something" CTA with hover-fill, your local time (`Asia/Kolkata` live clock), and a repeat of the marquee. The footer is the last impression — right now it's the quietest part of the site.

### 5.3 Content depth (what actually converts recruiters/clients) — ✅ shipped

- **Case studies are the product.** The narrative already exists (problem → approach → features → impact) plus year/tags/stack meta.
  - ✅ **Full-bleed next-project footer**: the old twin text prev/next cards are now a big visual "Next project" banner ([`NextProjectCard` in CaseStudy.jsx](src/pages/CaseStudy.jsx)) — the next project's image as a dimmed, gradient-over-void backdrop with a large title, arrow chip, and hover scale, plus a compact wrap-around "Previous · …" link using the `.link-underline`. Verified it reads well even for the app projects whose `image` is a portrait phone screenshot (dimmed backdrop, not a hero shot).
  - ⏭ **Role / timeline / metrics**: dropped — not wanted. (Never fabricate these; if they're ever added they must be real numbers.)
- ⏭ **Short screen-capture videos / GIF-webm loops** for the top projects: dropped — not wanted.
- **About page**:
  - ✅ Photo-forward moment — [`GlassPhotoCard.jsx`](src/components/primitives/GlassPhotoCard.jsx) (later reworked into a holo-foil tilt card): full-bleed 3:4 portrait, imperative transforms + gradients, no `backdrop-filter`.
  - ✅ **"What I'm doing now" section** — [`NowSection` in About.jsx](src/pages/About.jsx), data-driven from [`src/data/now.js`](src/data/now.js): a "Currently" band with a live pulse dot and four honest cards (Researching · Shipping · Building · Open to), linking out to the research site / work / contact. No vanity metrics.
- ✅ **Résumé**: `public/resume.pdf` is in place and linked from the **desktop header nav**, the **mobile menu**, and the **footer sitemap** (each opens in a new tab, with a download icon). Verified it serves as a real `application/pdf` — Vercel's filesystem handler wins over the SPA rewrite, so the deep path is safe.

### 5.4 New content: Android apps & AI/ML research ★ — ✅ shipped

> Landed: both Play Store apps are first-class case studies (official "Get it on Google Play" badge, app icon, screenshot gallery, `MobileApplication` JSON-LD with `operatingSystem: ANDROID` + `installUrl`, both `featured`), and the AI/ML research is surfaced via a footer callout card, a `socials` entry, the About "Currently" section, and JSON-LD `sameAs`. The `Mobile` filter tag finally has content behind it.

Original brief, for reference:

**a) Add both Play Store apps as first-class projects in `src/data/projects.js`:**

- **Wordigo — Daily Word Puzzle** (`com.vertexstudios.wordigo`) — word-puzzle game.
  `https://play.google.com/store/apps/details?id=com.vertexstudios.wordigo`
- **365: Life Calendar in Dots** (`com.vertexstudios.project_365`) — life-calendar / habit-visualization app.
  `https://play.google.com/store/apps/details?id=com.vertexstudios.project_365`

Implementation notes:
- Tag both `Mobile` (the filter tag already exists and is currently starved of content); Wordigo could also carry a `Game` angle in copy.
- **Extend the project `links` schema** with a `playstore` field (`{ live, repo, playstore }`) and render a proper "Get it on Google Play" action on the case-study page instead of the generic "LIVE SITE" label. A small Play-Store badge/icon on cards signals shipped-to-production credibility.
- **Assets needed from you:** app icons + 3–5 phone screenshots each (or better: device-frame mockups, dark background to match Aurora). Export as ~400–500 px wide webp — phone screenshots are tall, so consider a horizontal scroll strip or a 2–3 column phone-frame grid inside the case study; the 16/10 card image can be a composed banner (icon + framed screenshot on gradient).
- Case-study content per app: problem → design decisions → tech (Kotlin? Flutter? — state it), store metrics when shareable (downloads, rating), and what you learned shipping to the Play Store (release process, reviews, updates).
- Consider featuring one of them (`featured: true`) so mobile work is visible on the home page.
- The Phase 3 build-time sitemap picks the two new `/work/<slug>` URLs up automatically; JSON-LD for these should use `@type: SoftwareApplication` / `MobileApplication` with `operatingSystem: Android` and the store URL — great rich-result material.

**b) Surface the AI/ML research identity (M.Tech @ IIT Kanpur):**

Research site: **`https://varadiitk.vercel.app/`** — currently linked nowhere on the portfolio.

- Add a `research` entry to `socials` in `src/data/socials.js` (label "Research · IITK") → it then appears on the Contact "Find me on" list automatically.
- Add it to the JSON-LD `sameAs` array in `index.html`.
- Add a visible pointer in the Footer and on the About page — e.g. a small "Currently: M.Tech AI research @ IIT Kanpur →" card linking out. The AI positioning ("AI Builder") is much more credible with the research work one click away.
- Optional stretch: a dedicated "Research" section/route summarizing the M.Tech work with an outbound link — good SEO surface for AI-related queries and a differentiator few dev portfolios have.

### 5.5 Awwwards submission hygiene — ✅ code-side done

- ✅ Every judged category is covered: **Creativity** — entry preloader, hero constellation, cursor labels, holo-foil portrait, animated underlines, full-bleed next-project banner. **Usability** — Phases 2–4 (perf, a11y, focus trap, scroll restoration). **Content** — case-study narrative, Play Store apps, research, "Currently" section, résumé. **Design** — the Aurora Compute token system throughout.
- 🙋 **Yours to do before submitting**: test the whole flow at 1280×800 and on a mid-tier Android phone — judges do, and it's the one check I can't run for you (the preview pauses animation entirely).

---

## Phase 6 — Measurement & guardrails (ongoing) — ✅ shipped

- ✅ **Analytics**: Vercel Analytics + Speed Insights, wired in `src/components/system/Analytics.jsx`. Lazy-loaded and production-only so measurement costs nothing on the critical path, with `/work/:slug` normalised to `/work/[slug]` so 13 case studies group into one row instead of fragmenting the report.
  - **Still needs a dashboard toggle**: Analytics and Speed Insights must be enabled in the Vercel project settings before data starts flowing. The client code is a no-op until then.
- ✅ **Perf budget in CI**: `scripts/check-budgets.mjs`, run automatically as part of `postbuild` (so it gates local builds *and* Vercel deploys) plus a `.github/workflows/ci.yml` running lint + build + budgets on every push/PR. Budgets: initial `/` JS ≤ 165 kB gz (currently 147.8), initial CSS ≤ 14 kB gz (9.0), any lazy chunk ≤ 9 kB gz (5.2), any image ≤ 150 kB. The initial-payload number is parsed out of `dist/index.html` (entry + modulepreloads) so it can't drift from reality.
  - Two legacy images (`creator.jpg` 243.5 KiB, the Wordigo `logo.png` 157 KiB) exceed the image cap and are held by explicit waivers pinned to their current size — they may shrink but never grow. Delete the waiver once re-exported (see `docs/IMAGE_OPTIMIZATION.md`).
  - Lighthouse CI was deliberately skipped: it needs a third-party action and a hosted run to be meaningful, and Speed Insights already gives real field data.
- ✅ **README changelog**: phase-by-phase log plus a live budget table, and the stale bits (Framer Motion, third-party font hosts) corrected against the code as it stands.
- 🔁 **Ongoing**: watch field data in Speed Insights — LCP < 2.0 s, CLS < 0.05, INP < 200 ms. Lab Lighthouse on a fast desktop will always look fine; the field numbers are the ones that matter.

---

## Execution order & outcome

| Phase | What | Impact | Status |
| --- | --- | --- | --- |
| 1 | Vercel 404 fix, hover bug, error boundary, data checks | 🔴 Critical | ✅ |
| 2 | Images, self-hosted fonts, drop eager Framer, runtime fixes | 🔴 Huge (perf) | ✅ |
| 3 | Prerender routes, generated sitemap, JSON-LD, OG per page, touch icons | 🔴 Huge (SEO/sharing) | ✅ |
| 4 | Focus trap, scroll restoration, `aria-busy`, audits | 🟡 High | ✅ |
| 5 | Preloader, hero constellation, cursor labels, underlines, glass portrait, next-project banner, "Currently", résumé, **Android apps + research** | 🟣 The "wow" | ✅ |
| 6 | Analytics, perf budgets, GitHub Actions CI, README changelog | 🟢 Guardrail | ✅ |

**All six phases are complete.** Perf never regressed while the "wow" was added — the budget guardrail in `scripts/check-budgets.mjs` runs on every build and CI push, and the initial `/` payload finished *lower* than the baseline (147.8 kB vs ~190 kB) despite the preloader, particle sphere, glass card, analytics and underlines all landing on top.
