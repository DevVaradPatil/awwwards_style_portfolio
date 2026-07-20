# Image optimization checklist (Phase 2.1)

Re-export these from source, keep the **same filename and path** (the imports in
`src/data/projects.js`, `src/assets/index.js`, etc. resolve by name), drop the
new file in place, and rebuild. Vite hashes them on build, so no code changes
are needed. Recommended tooling: [Squoosh](https://squoosh.app) (drag-drop, per-image),
or `sharp`/`cwebp` if batch-scripting.

**Encoder settings:** WebP, quality **72–78**, "effort/method" max. For the OG
image use JPEG or PNG (see below). Enable metadata stripping.

## Priority 1 — huge, above-the-fold impact

| File | Current | Target dimensions | Budget |
| --- | --- | --- | --- |
| `public/og-image.png` | 2537×1393, 569 KB | **1200×630** (exact — OG spec) | **≤130 KB** — export as JPEG (q80) or PNG-8 |
| `src/assets/projects/beaesthetic.webp` | 547 KB | **1200 px** on long edge | ≤110 KB |
| `src/assets/projects/thinktank.webp` | 333 KB | 1200 px long edge | ≤110 KB |
| `src/assets/projects/island.webp` | 289 KB | 1200 px long edge | ≤110 KB |
| `src/assets/projects/spotify.webp` | 237 KB | 1200 px long edge | ≤100 KB |
| `src/assets/projects/zelda.webp` | 190 KB | 1200 px long edge | ≤100 KB |

> Project card images render at most ~660 px wide (2-col featured grid) and the
> case-study hero ~1200 px. 1200 px on the long edge covers every use at retina.
> `snikrz.webp` (151 KB) and `codesnap.webp` (87 KB) are borderline — re-export
> if convenient, same 1200 px / ≤100 KB target.

## Priority 2 — avatars are wildly oversized for their render size

These render at **56×56 px** (testimonial cards). They're shipping 800×800.

| File | Current | Target | Budget |
| --- | --- | --- | --- |
| `src/assets/psakhre.jpeg` | 800×800, 123 KB | **160×160** | ≤12 KB (WebP q75) |
| `src/assets/aman.jpeg` | 800×800, 103 KB | **160×160** | ≤12 KB |
| `src/assets/pghatge.jpeg` | 612×612, 54 KB | **160×160** | ≤12 KB |

> These are imported as `.jpeg`. You can either keep `.jpeg` (re-export smaller)
> or switch to WebP — if you switch extensions, tell me and I'll update the 3
> import statements. Easiest: keep the extension, just shrink.

## Priority 3 — the About portrait

| File | Current | Target | Budget |
| --- | --- | --- | --- |
| `src/assets/creator.jpeg` | 750×1000, 87 KB | **512×683** (renders ≤512 wide) | ≤45 KB |

## Optional — company logos

`iitk.jpg` (68 KB) is the only heavy one; the PNGs (`altair`, `bb`,
`freelancer` ~28–38 KB) render as small icons. Re-export `iitk.jpg` to ~128 px
tall / ≤15 KB if you want the extra polish; the rest are fine.

## Expected result

~2.4 MB of image payload today → **under ~600 KB** across the whole site, with
the biggest LCP-relevant drops on `/work` and case-study pages. After you drop
the files in, run `npm run build` and the sizes will show in the build output.
