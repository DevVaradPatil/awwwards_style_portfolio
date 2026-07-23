import resumeinsight from '@/assets/projects/resumeinsight.webp'
import spotify from '@/assets/projects/spotify.webp'
import thinktank from '@/assets/projects/thinktank.webp'
import frontendtoolbox from '@/assets/projects/frontendtoolbox.webp'
import snikrz from '@/assets/projects/snikrz.webp'
import bento from '@/assets/projects/bento.webp'
import beaesthetic from '@/assets/projects/beaesthetic.webp'
import island from '@/assets/projects/island.webp'
import framerPortfolio from '@/assets/projects/framerPortfolio.webp'
import codesnap from '@/assets/projects/codesnap.webp'
import zelda from '@/assets/projects/zelda.webp'
import app365Logo from '@/assets/apps/365/logo.png'
import wordigoLogo from '@/assets/apps/wordigo/logo.png'

// Play Store screenshots — globbed and numerically sorted (1.webp, 2.webp, …).
const sortedShots = (glob) =>
  Object.entries(glob)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url)

const app365Shots = sortedShots(
  import.meta.glob('../assets/apps/365/*.webp', { eager: true, import: 'default' }),
)
const wordigoShots = sortedShots(
  import.meta.glob('../assets/apps/wordigo/*.webp', { eager: true, import: 'default' }),
)

export const projectTags = ['Web', 'AI', '3D', 'Mobile', 'Open Source', 'Freelance']

export const projects = [
  {
    slug: 'resume-insight',
    title: 'Resume Insight',
    year: 2025,
    tags: ['AI', 'Web'],
    summary:
      'AI-powered resume analyzer that compares resumes with job descriptions and suggests ATS-friendly improvements.',
    description:
      'AI-powered resume analyzer that compares resumes with job descriptions and suggests improvements for ATS compatibility and overall impact.',
    problem:
      'Job seekers struggle to bridge unstructured resume content with role-specific keywords required by ATS pipelines.',
    approach:
      'Built a Next.js front-end backed by the Gemini API. Parses resume + JD, scores ATS alignment, and produces targeted, line-level improvement suggestions.',
    features: ['Resume vs JD matching', 'ATS scoring', 'Smart improvement suggestions'],
    impact: 'Helps candidates tailor resumes and pass ATS filters.',
    stack: ['Next.js', 'Gemini API', 'AI/NLP'],
    image: resumeinsight,
    links: { live: 'https://resumeinsight.vercel.app/', repo: null },
    featured: true,
  },
  {
    slug: '365-life-calendar',
    title: '365 — Life Calendar in Dots',
    year: 2026,
    tags: ['Mobile'],
    type: 'app',
    summary:
      'A beautifully minimal life calendar — your time as a grid of dots that fills in as days pass, with Year, Life and Goal views, home-screen widgets and a live wallpaper.',
    description:
      '365. turns your time into a clean grid of dots — one for each day — that quietly fills in as the year passes. Three views (Year, Life, Goal) reframe how much time has gone and how much remains, backed by resizable widgets, a dot-calendar live wallpaper, gentle reflection logging, and private-by-default data.',
    problem:
      'The passing of time is abstract — most people only feel the weight of it at New Year, then lose that perspective for the rest of the year.',
    approach:
      'Rendered time as a dot grid across three modes (Year / Life / Goal), then pushed it onto the home screen with resizable widgets and a live wallpaper that redraws at midnight — so the perspective is always ambient, not something you have to open an app for.',
    features: [
      'Year, Life & Goal dot grids',
      'Resizable home-screen widgets',
      'Dot-calendar live wallpaper',
      'Milestones & event rings',
      'Gentle daily reflection & streaks',
      'Private by default, optional Drive backup',
    ],
    impact: 'Live on Google Play — an ambient, memento-mori life calendar.',
    stack: ['Flutter', 'Dart', 'Home Widgets', 'Live Wallpaper'],
    image: app365Shots[0],
    logo: app365Logo,
    screenshots: app365Shots,
    links: {
      playstore:
        'https://play.google.com/store/apps/details?id=com.vertexstudios.project_365',
    },
    featured: true,
  },
  {
    slug: 'wordigo',
    title: 'Wordigo — Daily Word Puzzle',
    year: 2026,
    tags: ['Mobile'],
    type: 'app',
    summary:
      'A free, ad-free daily word game — a shared Daily puzzle, a 100+ level career mode and a pressure-free Zen mode, with streaks, gems and unlockable themes.',
    description:
      'Wordigo is a free word puzzle game for daily players: guess the word in six tries, keep a daily streak alive, and progress through 100+ hand-crafted career levels — or unwind in an endless Zen mode. Fully offline, with no paywalls and no ads.',
    problem:
      'Most word games gate the fun behind ads, subscriptions and paywalls, and ship a single mode that gets stale fast.',
    approach:
      'Built three distinct modes (Daily, Career, Zen) on a shared engine, with an offline-first store for streaks, gems, achievements and unlockable skins — so the whole game stays free and playable without a connection.',
    features: [
      'Shared Daily puzzle',
      '100+ career levels',
      'Endless Zen mode',
      'Streaks & emergency hints',
      'Gems, skins & themes',
      'Fully offline + auto-save',
    ],
    impact: 'Live on Google Play — a complete, genuinely ad-free daily word game.',
    stack: ['Flutter', 'Dart'],
    image: wordigoShots[0],
    logo: wordigoLogo,
    screenshots: wordigoShots,
    links: {
      playstore:
        'https://play.google.com/store/apps/details?id=com.vertexstudios.wordigo',
    },
    featured: true,
  },
  {
    slug: 'spotify-2',
    title: 'Spotify 2.O',
    year: 2024,
    tags: ['Web'],
    summary:
      'Personalized Spotify clone with secure auth and Stripe-based premium subscriptions.',
    description:
      'Personalized Spotify clone with secure authentication and premium subscription flow.',
    problem:
      'Combine media streaming UX, secure auth, and recurring payments inside a single full-stack app.',
    approach:
      'Next.js front-end, Supabase for auth + storage, Stripe for subscription billing. Playlists, audio playback, and tier-gated content.',
    features: ['Auth', 'Music playback', 'Playlists', 'Stripe subscriptions'],
    stack: ['Next.js', 'Supabase', 'Stripe'],
    image: spotify,
    links: { live: 'https://spotify-2-o.vercel.app/', repo: null },
    featured: true,
  },
  {
    slug: 'think-tank-india',
    title: 'Think Tank India',
    year: 2024,
    tags: ['Web'],
    summary:
      'Modern blog-style platform showcasing innovative projects with a sleek, contemporary design.',
    description:
      'Modern blog-style platform showcasing innovative projects with a sleek, contemporary design.',
    approach:
      'Next.js + Prisma data layer, Shadcn UI design system. Clean typography and editorial layout.',
    features: ['Blog & project posts', 'Modern design system', 'Clean typography'],
    stack: ['Next.js', 'Prisma', 'Shadcn UI'],
    image: thinktank,
    links: { live: 'http://thinktankindia.vercel.app/', repo: null },
    featured: true,
  },
  {
    slug: 'frontend-toolbox',
    title: 'Frontend Toolbox',
    year: 2024,
    tags: ['Web', 'Open Source'],
    summary:
      'A productivity hub of CSS generators — gradients, shadows, grids, flex — with real-time previews and one-click copy.',
    description:
      'Comprehensive collection of CSS tools and generators with real-time previews and one-click copy.',
    approach:
      'React + Vite + Tailwind. Each generator is a self-contained module with live preview and clipboard export.',
    features: ['Live previews', 'Copyable snippets', 'Multiple generators'],
    impact: 'A developer productivity hub for everyday CSS tasks.',
    stack: ['React', 'Vite', 'Tailwind CSS'],
    image: frontendtoolbox,
    links: { live: 'https://frontend-toolbox-ten.vercel.app/', repo: null },
    featured: true,
  },
  {
    slug: 'snikrz',
    title: 'Snikrz',
    year: 2024,
    tags: ['Web'],
    summary: 'Full-stack MERN sneaker e-commerce platform with Stripe checkout.',
    description: 'Full-stack MERN sneaker e-commerce platform with Stripe checkout.',
    features: ['Product catalog', 'Cart', 'Secure payments', 'Responsive UI'],
    stack: ['MongoDB', 'Express', 'React', 'Node.js', 'Stripe'],
    image: snikrz,
    links: { live: 'http://snikrz.web.app/', repo: null },
  },
  {
    slug: 'bento-portfolio',
    title: 'Bento Portfolio (Varadverse)',
    year: 2024,
    tags: ['Web', 'Open Source'],
    summary: 'Interactive, animated bento-grid portfolio template with smooth transitions.',
    description: 'Interactive, animated bento-grid portfolio template with smooth transitions.',
    stack: ['React', 'Tailwind CSS', 'LottieFiles'],
    image: bento,
    links: { live: 'https://varadverse.vercel.app/', repo: null },
  },
  {
    slug: 'beaesthetic',
    title: 'BeAesthetic',
    year: 2024,
    tags: ['Web', 'Freelance'],
    summary: 'Full-stack fitness event website built for a client; rich UI/UX with integrated payments.',
    description:
      'Full-stack fitness event website built for a client; rich UI/UX with smooth animations and integrated payments.',
    impact: 'Delivered production site for a paying client.',
    stack: ['React.js', 'Razorpay', 'Framer Motion'],
    image: beaesthetic,
    links: { live: 'https://beaesthetic.co.in/', repo: null },
  },
  {
    slug: '3d-portfolio-island',
    title: '3D Portfolio Island',
    year: 2023,
    tags: ['3D', 'Web'],
    summary: 'Immersive 3D portfolio island used as a creative showcase.',
    description: 'Immersive 3D portfolio island website used as a creative showcase.',
    stack: ['Three.js', 'React.js', 'Framer Motion'],
    image: island,
    links: { live: 'https://varad-dev-island.vercel.app/', repo: null },
  },
  {
    slug: 'framer-portfolio',
    title: 'Animated Framer Portfolio',
    year: 2023,
    tags: ['Web'],
    summary:
      'Visually engaging animated portfolio built in Framer with motion design and interactive elements.',
    description:
      'Visually engaging animated portfolio built in Framer with motion design and interactive elements.',
    stack: ['Framer', 'Motion Design'],
    image: framerPortfolio,
    links: { live: 'https://varadpatil.framer.website/', repo: null },
  },
  {
    slug: 'codesnap',
    title: 'CodeSnap',
    year: 2023,
    tags: ['Web', 'Open Source'],
    summary: 'A snippet-sharing tool with syntax-highlighted exportable code cards.',
    description: 'A snippet-sharing tool with syntax-highlighted exportable code cards.',
    stack: ['React', 'Tailwind CSS'],
    image: codesnap,
    links: { live: null, repo: null },
  },
  {
    slug: 'zelda-tribute',
    title: 'Zelda Tribute',
    year: 2023,
    tags: ['Web', '3D'],
    summary: 'Themed creative landing exploring atmospheric UI and motion.',
    description: 'Themed creative landing exploring atmospheric UI and motion.',
    stack: ['React', 'GSAP'],
    image: zelda,
    links: { live: null, repo: null },
  },
]

export const featuredProjects = projects.filter((p) => p.featured)
