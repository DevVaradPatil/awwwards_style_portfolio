# IMPROVEMENT_PLAN.md

Full audit of `new_port_awards` (React 19 + Vite 8 + Tailwind v4, deployed at `varaddev.vercel.app`) with a phase-wise execution plan. Measured on the current build (`npm run build`, 2026-07-19).

---

## 0. Current state — measured facts

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

## Phase 1 — Critical fixes (do first, ~half a day)

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

## Phase 2 — Performance (biggest Lighthouse wins, ~1–2 days)

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

## Phase 3 — SEO (the SPA problem, ~1–2 days)

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

### 3.3 Head/meta polish

- Add `apple-touch-icon` (180×180 PNG) and a minimal `site.webmanifest` (name, icons, theme color) — favicon.svg alone breaks iOS bookmarks.
- `twitter:creator` if you have an X handle.
- Keep canonical logic as is (already correct per route).

---

## Phase 4 — Accessibility & UX correctness (~1 day)

- **Mobile nav focus trap**: `Header` closes on Escape (good) but focus isn't trapped in the open menu and isn't returned to the trigger on close. Add a small focus-trap (first/last sentinel or `inert` on `main` while open).
- **Scroll restoration**: `SmoothScrollProvider` force-scrolls to top on *every* pathname change — including browser **Back**, which breaks users' expected scroll position. Track navigation type (React Router's `useNavigationType() === 'POP'`) and skip the scroll-to-top on Back/Forward.
- **Reduced motion audit**: the CSS opt-in class `.respect-reduced-motion` exists but GSAP-driven animations (SplitText, scrub sections, Reveal) should check `prefers-reduced-motion` and skip/no-op (Orb3D already does this — extend the pattern; simplest via `gsap.matchMedia()`).
- **SplitText & hidden content**: split targets start at `opacity: 0` via `gsap.set` — if GSAP fails or reduced-motion path misses, headings stay invisible. Add a `.no-js`/timeout fallback or set initial state only when animation will actually run.
- Run Lighthouse + axe on every route; verify the ≥95 a11y score still holds after changes.
- Form: add `aria-busy` on submit button while sending; consider honeypot field for spam.

---

## Phase 5 — "Catches everyone's eye": Awwwards-level upgrades (~1–2 weeks, iterative)

The bones are genuinely good (custom cursor, magnetic buttons, orb, scrub sections). What separates "nice portfolio" from Awwwards SOTD-nominee is **one signature moment + relentless transition polish + case-study depth**. Prioritized ideas:

### 5.1 Signature moments (pick 1–2, don't do all)

- **Site entry preloader**: a 1–1.5 s branded intro (percentage counter in JetBrains Mono, aurora gradient sweep, then a clip-path curtain reveal into the hero). You already have loader keyframes + the unused `BrandedLoader` — this is the perfect home for it. Gate to first visit per session (`sessionStorage`) so repeat navigation stays instant.
- **Hero upgrade**: make the Orb *react* — scale/distort on scroll velocity (wire Lenis velocity into the orb's spin speed), or morph it between sections. A "living" element that responds to the visitor is exactly what juries screenshot.
- **Page transitions v2**: replace the generic fade/slide with a branded wipe — full-screen `clip-path` curtain in `--color-elev` with the wordmark, or an expanding circle from the clicked link (View Transitions API is now viable and nearly free).

### 5.2 Interaction polish (high ROI, low risk)

- **Cursor context labels**: your `CustomCursor` already supports `data-cursor="link"` — extend it with `data-cursor-label="View case"` so hovering a project card morphs the ring into a pill saying "View →". Classic Awwwards move, ~30 lines.
- **Shared-element feel into case studies**: on project-card click, animate the card image to the case-study hero position (View Transitions API `view-transition-name` per slug makes this nearly free in Chromium; graceful fallback elsewhere).
- **Link underline choreography**: animated underline (scale-x origin-swap) on all inline links; text "scramble/decode" effect on the mono uppercase labels on hover.
- **Image parallax**: subtle `yPercent` drift on project images inside their `overflow-hidden` frames while scrolling (GSAP, you already have the helpers).
- **Footer**: oversized "Let's build something" CTA with hover-fill, your local time (`Asia/Kolkata` live clock), and a repeat of the marquee. The footer is the last impression — right now it's the quietest part of the site.

### 5.3 Content depth (what actually converts recruiters/clients)

- **Case studies are the product.** Add to each: role, timeline, 2–3 metrics ("−38% load time", "500+ users"), a process section (problem → constraints → decisions → result) with 2–4 supporting images/video, and a full-bleed next-project footer with big preview image (you have prev/next logic already — make it visual).
- Record **short screen-capture videos/GIF-webm loops** for the top 3 projects — motion in cards (muted `<video>` on hover) outperforms static screenshots dramatically.
- **About page**: add a real photo-forward moment and a "what I'm doing now" section — juries and clients both read About second.
- Resume: `/resume.pdf` in `public/` + a "Résumé ↓" link in header/footer.

### 5.4 New content: Android apps & AI/ML research ★ (requested addition)

The site claims "Mobile" as a skill (services icon, `principles`, the `Mobile` filter tag) but ships **zero mobile projects** — while two real apps are live on the Play Store under Vertex Studios. That's the strongest untold story on the site. Fix:

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

### 5.5 Awwwards submission hygiene

- Every judged category matters: Design, Usability, Creativity, Content. The wipe transition + cursor labels + preloader cover Creativity; Phases 2–4 cover Usability; case-study depth covers Content.
- Test the whole flow at 1280×800 and on a mid-tier Android phone — judges do.

---

## Phase 6 — Measurement & guardrails (ongoing)

- **Analytics**: add Vercel Analytics + Speed Insights (zero-config on Vercel) — you need field LCP/CLS data, not just lab runs.
- **Perf budget in CI**: `npm run build` + a tiny script that fails if `/` gz JS > 160 kB or any image > 150 kB. (Lighthouse CI via GitHub Action if you want the full treatment.)
- Re-run Lighthouse after each phase; track: LCP < 2.0 s (4G), CLS < 0.05, TBT < 150 ms, SEO = 100, A11y ≥ 95.
- Add a `CHANGELOG`-style section to README as phases land (nice signal for people reading the repo — it *is* a portfolio piece).

---

## Suggested execution order & effort

| Phase | What | Effort | Impact |
| --- | --- | --- | --- |
| 1 | Vercel 404 fix, hover bug, error boundary, data checks | ~½ day | 🔴 Critical |
| 2 | Images, self-hosted fonts, drop eager Framer, runtime fixes | 1–2 days | 🔴 Huge (perf) |
| 3 | Prerender routes, generated sitemap, JSON-LD, OG per page | 1–2 days | 🔴 Huge (SEO/sharing) |
| 4 | Focus trap, scroll restoration, reduced-motion, audits | ~1 day | 🟡 High |
| 5 | Preloader, transitions v2, cursor labels, case-study depth, videos, **Android apps + research link** | 1–2 weeks, iterative | 🟣 The "wow" |
| 6 | Analytics, perf budgets, Lighthouse CI | ~½ day, ongoing | 🟢 Guardrail |

Phases 1–3 are sequential and unblock everything (a portfolio that 404s on shared links can't win anything). Phase 5 items are independent — ship them one at a time behind small PRs and re-measure perf after each so the wow never costs the speed.
