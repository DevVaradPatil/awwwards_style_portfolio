# REDESIGN_PLAN.md — "Elastic"

Status: **complete — all phases built and committed on the local `redesign` branch (not pushed).** Decisions: hero is pure elastic type (no liquid); story chapters as drafted; palette chosen below.

A full restyle of the portfolio around the motion studies, with elastic type and the 3D work ring as the two signatures. Routes, content data, SEO, the contact form and the build pipeline stay as they are; everything visual is replaced.

---

## 1. Ground rules

- **Branch:** all work happens on a new local branch `redesign`. One commit per phase. **Nothing is pushed**, so Vercel never sees it and the live site is untouched.
- **Each phase ends with:** `npm run lint` → `npm run build` (includes the perf budgets) → a browser pass over every route at desktop and phone width (console errors, failed requests, layout, the interactions for that phase) → commit. I fix whatever the pass finds before moving on.
- **Site keeps working between phases.** Old token names are kept as aliases until the last phase, so pages that have not been redone yet still render correctly.
- **Existing rules still apply:** no Framer Motion, no `overflow-x` on `<html>`, CSS entrances use `animation-fill-mode: backwards`, no transform on an ancestor of a pinned section, animations are not gated on reduced motion.
- **No new heavy dependencies.** The liquid hero is raw WebGL (a single shader, a few kB), the ring is CSS 3D, the code portrait is Canvas 2D. No three.js.

One limit to know about: the in-app browser pauses animation when its pane is hidden. I can always check errors, layout and state there, but for the motion itself I need the Browser pane visible, or you look at `localhost:5173` yourself. I will say plainly at the end of each phase what I could and could not see moving.

---

## 2. The design

### Palette — four "rooms" instead of one dark page

| Token | Value | Used for |
| --- | --- | --- |
| Ink | `#0b0b0d` | Hero, work ring, case studies, footer |
| Blue | `#2433ff` | Story chapters, section breaks |
| Bone | `#ecece8` | Reading pages: About, Contact (cool off-white, not cream) |
| Pink | `#ff8ad0` | The one accent: active states, the closing call to action |

Each section is a full-bleed block of one color. No glow blobs, no gradient text, no glass cards, no pill badges, no tiny uppercase labels.

### Type

- **Display: Anybody** (variable font, width 50–150, weight 100–900). This single font is what makes elastic type possible. Self-hosted like the current fonts.
- **Body: Inter** (already hosted).
- **JetBrains Mono** only inside the code portrait and code-like details.
- Clash Display is removed.

### The four signature pieces and where they live

| Piece | Where |
| --- | --- |
| **Elastic type** | Everywhere: page titles, the story chapters on Home, the preloader, the footer name, the contact call to action, the 404. It is the site's voice. |
| **3D work ring** | Home (featured projects) and the Work page (all 14 projects). |
| **Liquid chrome name** | Motion Lab only (the hero is pure elastic type). |
| **Code portrait** | About hero only. |

---

## 3. Page by page

**Preloader.** "VARAD" in elastic type stretching from narrow to wide as the count goes 0 → 100, then the curtain lifts. Still timer-driven and once per session.

**Home — the story, in order:**
1. **Hero (ink).** "VARAD PATIL" in giant elastic type, full screen. Under it one elastic line that rewrites itself: *designs / builds / ships / researches*. The real `<h1>` text stays in the page for search engines and screen readers.
2. **Story (blue).** Four chapters, each a giant elastic word with one short paragraph, pinned and driven by scroll:
   - **STARTED** · 2022 · React developer at Bubble Byte
   - **SHIPPED** · 2023–24 · freelance, real clients, payments in production
   - **SCALED** · 2025 · dashboards for large datasets at Altair
   - **RESEARCHING** · 2025 → · AI for Sustainability at IIT Kanpur, two apps on Google Play
3. **Work ring (ink).** Featured projects on the 3D ring. Drag or scroll to spin, the front card names itself, click opens the case study.
4. **Toolbox (cream).** Skills as rows of elastic words that stretch with scroll speed. Replaces the skills cloud and the stat counters.
5. **Call to action (pink).** A giant elastic "LET'S TALK" that squashes under the cursor.

**Work.** The ring with all projects and the existing tag filter. Below it, a plain index list of every project (title, year, tags), which is also the keyboard and screen-reader path and the main view on phones.

**Case study.** Title in elastic type, large screenshot (or the phone screenshots strip for the apps), problem / approach / features / impact, then the next project as one big elastic link. Same content and JSON-LD as today.

**About (cream).** Hero is the code portrait: your photo drawn in characters, with the cursor as a lens onto the real photo. Then currently / timeline / stack / education / testimonials, restyled.

**Contact (cream → pink).** Elastic headline, the same form logic and validation, restyled fields.

**Playground → Motion Lab.** The four pieces standalone, each with a one-line note on how it is built.

**404.** An elastic "404" you can squash.

**Header, footer, cursor.** Restyled to the new system. Footer ends with your name in huge elastic type and the live Kanpur time.

### On phones and touch

- Elastic type follows scroll position and touch instead of a cursor.
- Liquid hero runs at lower resolution and ripples on touch.
- Ring spins with a horizontal swipe; vertical scroll still works.
- Code portrait: tap or drag to move the lens.

---

## 4. Phases

### Phase 0 — Setup
- Create branch `redesign`; commit the pending CLAUDE.md / production guide updates and this plan.
- Record baseline build numbers (initial JS is 147.8 kB gz against a 165 kB budget).

### Phase 1 — Foundation
- New tokens in `src/index.css`, with the old names aliased so nothing breaks yet.
- Fonts: add Anybody (variable) to `scripts/fetch-fonts.mjs`, drop Clash Display, update preloads in `index.html`.
- New primitive **`ElasticText`**: one shared animation loop for every instance, runs only while on screen, real text exposed to assistive tech.
- Restyle buttons, custom cursor, Header, Footer, Preloader, route loader.
- **Test:** all 7 routes render with the new chrome, no console errors, mobile menu and focus trap still work, build and budgets pass.

### Phase 2 — Home
- Elastic-type hero.
- Story chapters with a scroll-driven pin; chapter copy lives in a new `src/data/story.js`.
- `WorkRing` primitive, used here with featured projects.
- Toolbox and call-to-action sections. Old home sections removed.
- **Test:** hero renders, pin enters and releases cleanly with no blank scroll, ring drag and click-through work, phone layout.

### Phase 3 — Work and case studies
- Work page: ring with all projects + filter + index list.
- Case study restyle, next-project link.
- **Test:** every one of the 14 case-study URLs loads, filter works, deep link + refresh works, prerender still emits all routes.

### Phase 4 — About, Contact, Motion Lab, 404
- `CodePortrait` primitive; re-export the portrait photo so it fits the 150 kB image budget (it is on a waiver today).
- About, Contact, Motion Lab and 404 restyled.
- **Test:** contact form validation, mailto fallback path, testimonial carousel, portrait on phone.

### Phase 5 — Cleanup and finish
- Delete what is no longer used: `GradientBlob`, `ParticleSphere`, `Orb3D`, `TiltCard`, `GlassPhotoCard`, `BrandedLoader`, old home sections, old token aliases, unused CSS.
- New OG image, favicon, theme color and web manifest in the new palette.
- Update `CLAUDE.md` and `README.md` to describe the new system.
- **Final test:** every route, desktop and phone, production build served with `npm run preview`; budget report included in the summary.

Then it is yours to review locally. Pushing to GitHub stays your call.

---

## 5. What does not change

Routes and URLs · `src/data/*` content (plus one new `story.js`) · `useDocumentMeta`, sitemap, prerender, JSON-LD · EmailJS and the mailto fallback · lazy route splitting · Lenis + GSAP ScrollTrigger · Vercel config.

---

## 6. Decisions

1. **Colors:** ink / electric blue / bone / pink (table above).
2. **Hero:** pure elastic type. The liquid chrome piece moves to the Motion Lab (raw WebGL, loaded only on that route).
3. **Story copy:** I draft the four chapters from your existing content; you edit `src/data/story.js` afterwards.
4. **Photos:** only one personal photo exists in the repo. The plan works with it; more photos (campus, desk) would make the story chapters richer and can be added later.

## 7. Risks

- **Elastic type cost.** Changing letter width every frame is layout work. It is limited to headline-sized text that is on screen, never body copy, with fixed-height rows so nothing around it shifts.
- **Font size.** A two-axis variable font is larger than a static one. Measured in Phase 1; if it is too heavy I subset it to the characters used.
- **Pinned story + ring on one page.** This is the area that broke the site before (pins vs transforms). It gets the most testing in Phase 2.
