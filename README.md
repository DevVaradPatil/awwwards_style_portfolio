# Varad Patil — Portfolio (`varadpatil.vercel.app`)

An Awwwards-grade personal portfolio for **Varad Patil** — full-stack developer & AI builder, M.Tech AI for Sustainability @ IIT Kanpur. Built around the **Aurora Compute** design system: deep-space surfaces with a violet → iris → cyan accent gradient, Clash Display + Inter + JetBrains Mono.

> Dark, fast, motion-rich. Zero R3F, zero heavy SDKs — everything custom and tree-shaken.

---

## ✨ Stack

| Layer | Choice |
| --- | --- |
| Framework | **React 19** + **Vite 8 (rolldown)** |
| Routing | **react-router-dom 7** (lazy routes + page transitions) |
| Styling | **Tailwind CSS v4** (all tokens in `@theme {}` inside `src/index.css`) |
| Motion | **GSAP 3** + ScrollTrigger, **Framer Motion 12**, **Lenis** smooth scroll |
| Icons | **lucide-react** (tree-shaken, single shared chunk) |
| Email | **EmailJS REST** (no SDK installed) with `mailto:` fallback |
| Linting | ESLint flat config (`react-hooks`, `react-refresh`) |

No TypeScript — plain JSX. Alias: `@` → `/src`.

---

## 🧱 Folder map

```
public/                  Static assets (favicon, sitemap, robots, og)
src/
  assets/                Project screenshots, tech logos, illustrations
  components/
    layout/              Header, Footer
    primitives/          Reveal, MagneticButton, TiltCard, Marquee,
                         GradientBlob, SplitText, Counter, Orb3D
    system/              Container, Section, Loaders, SmoothScrollProvider,
                         PageTransition, CustomCursor
  data/                  projects, skills, experience, education,
                         testimonials, socials, techLogos
  lib/                   scrollHelpers, emailjs, useDocumentMeta
  pages/                 Home, Work, CaseStudy, About, Playground,
                         Contact, NotFound
  router/                AppRouter (lazy + Suspense + transitions)
  sections/home/         Hero, IntroMarquee, AboutTeaser, FeaturedWork,
                         SkillsCloud, ManifestoScrub, Stats, CTAFooter
  styles/                cursor.css
  App.jsx, main.jsx, index.css
```

---

## 🛠 Scripts

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server (http://localhost:5173)
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run lint       # ESLint over the workspace
```

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

- SPA rewrite — every non-asset path falls through to `/index.html` so deep links like `/work/<slug>` work on refresh.
- Aggressive immutable caching for hashed `/assets/*` and static media.
- Hardening headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

After import, set the three `VITE_EMAILJS_*` env vars in **Project Settings → Environment Variables**, then redeploy.

### Any static host

Build, then serve `dist/` with **SPA fallback** (rewrite all paths to `/index.html`). On Netlify drop a `_redirects` with `/*  /index.html  200`. On nginx/Apache, set `try_files $uri /index.html`.

---

## 🎯 Quality targets (hit by Phases 7–8)

- ✅ Lighthouse Accessibility ≥ 95 (every interactive primitive has a visible cyan focus ring, semantic landmarks, ARIA labels on icon-only controls, full keyboard reachable mobile nav).
- ✅ Initial `/` JS payload **~187 kB gzipped** (under 200 kB target).
- ✅ All secondary routes lazy-loaded (NotFound 1 kB gz, Work 1.85, CaseStudy 1.90, Playground 2.47, Contact 3.14, About 4.74).
- ✅ Per-route `<title>` / OG / Twitter / canonical via `useDocumentMeta`.
- ✅ JSON-LD `Person` schema, `sitemap.xml`, `robots.txt`.
- ⚠ `public/og-image.png` and the largest asset `beaesthetic.webp` (560 kB) are pending optimization passes the design system isn't responsible for.

---

## 🎨 Design tokens (cheat sheet)

| Token | Value |
| --- | --- |
| `--color-void` | `#08070d` |
| `--color-elev` | `#11101a` |
| `--color-raise` | `#1b1a27` |
| `--color-ink-100/60/30` | `#F4F2FF / #A6A3C2 / #5A5775` |
| `--color-violet` | `#7C5BFF` |
| `--color-iris` | `#B07BFF` |
| `--color-cyan` | `#5BE4FF` |
| `--color-lime` | `#C7FF6E` |
| `--color-rose` | `#FF6A8A` |
| Fonts | Clash Display · Inter · JetBrains Mono |

Use the Tailwind v4 short syntax: `text-(length:--fs-h1)`, `bg-(--color-void)`, `rounded-(--radius-md)`.

---

## 🙌 Credits

- Type — **Fontshare** (Clash Display), **Google Fonts** (Inter, JetBrains Mono)
- Icons — **lucide-react**
- Motion — **GSAP**, **Framer Motion**, **Lenis**
- Tooling — **Vite (rolldown)**, **Tailwind v4**

---

## 📝 License

© 2026 Varad Patil. All rights reserved. Source code provided for portfolio review — please don't redistribute or rebrand without permission.
