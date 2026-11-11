import resumeinsight from '@/assets/projects/resumeinsight.webp'
import spotify from '@/assets/projects/spotify.webp'
import thinktank from '@/assets/projects/thinktank.webp'
import frontendtoolbox from '@/assets/projects/frontendtoolbox.webp'
import snikrz from '@/assets/projects/snikrz.webp'
import bento from '@/assets/projects/bento.webp'
import beaesthetic from '@/assets/projects/beaesthetic.webp'
import island from '@/assets/projects/island.webp'
import framerPortfolio from '@/assets/projects/framerPortfolio.webp'
import app365Logo from '@/assets/apps/365/logo.png'
import wordigoLogo from '@/assets/apps/wordigo/logo.png'
import delhijalboardcrm from '@/assets/projects/delhijalboardcrm.webp'
import civicpulse from '@/assets/projects/civicpulse.webp'
import vayusetu from '@/assets/projects/vayusetu.webp'
import nutristep from '@/assets/projects/nutristep.webp'
import miniworld from '@/assets/projects/miniworld.webp'
import pulse from '@/assets/projects/pulse.webp'
import clawd from '@/assets/projects/clawd.webp'

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

export const projectTags = ['Web', 'AI', '3D', 'Mobile', 'Open Source', 'Freelance', 'Old portfolio']

// Array order is the order everywhere: the featured ones form the Home ring,
// old portfolios stay last, and CaseStudy prev/next follows it too.

export const projects = [
  {
    slug: 'civic-pulse',
    title: 'CivicPulse',
    year: 2026,
    tags: ['AI', 'Web'],
    summary:
      'AI civic-grievance platform for Bengaluru: report by photo or voice in 22 languages, and agents triage, route and check what the city already spent in that ward.',
    description:
      'A citizen reports a civic issue with a photo, or by speaking in any of 22 Indian languages. An AI agent pipeline triages it, routes it to the agency that actually handles it, and then checks what the city already spent in that ward. Forge Gen AI Buildathon top-10 finalist.',
    problem:
      'Complaint boxes collect grievances but never set them against the money already spent, so nobody can see which wards are failing or which agencies never resolve anything.',
    approach:
      'Joined 16,071 real Bengaluru grievances with 43,492 BBMP work orders worth Rs 10,571 crore across 198 ward boundaries in Supabase Postgres. On top sits an agent pipeline: Gemini triage, deterministic dedup within 250 m, routing counted from the real records, and a multi-step investigation agent whose tool-call trace is shown on each issue.',
    features: [
      'Photo or voice reports in 22 Indian languages',
      'Multimodal triage: category, severity, hazards',
      'Routing to the agency that really handles it',
      'Investigation agent with a visible tool trace',
      'Neighbour confirmation + before/after fix check',
      'Ward map and agency accountability dashboard',
    ],
    impact: 'Forge Gen AI Buildathon top-10 finalist. Every figure traces to a government record.',
    stack: ['Next.js 16', 'Supabase Postgres', 'Gemini', 'Sarvam AI', 'TypeScript'],
    image: civicpulse,
    links: { live: 'https://civicpulse-forge.vercel.app', repo: 'https://github.com/DevVaradPatil/civicpulse-forge' },
    featured: true,
  },
  {
    slug: 'vayusetu',
    title: 'VayuSetu',
    year: 2026,
    tags: ['AI', 'Web'],
    summary:
      'Explains why the air is bad right now, which district to act on and who should act, from 70 trusted CPCB monitors, satellite fire data and wind.',
    description:
      'India has plenty of AQI dashboards; every one shows a number and a colour. VayuSetu answers what comes after the number: why the air is bad, which district to act on, and who should act. Built for Build with AI: Code for Communities, Clean Air track.',
    problem:
      'Officials get a city average and a colour, not a decision. Broken monitors are common, and a single bad sensor can drive the wrong response.',
    approach:
      'Every reading passes four integrity checks before it counts. Each monitor is compared with the robust median around it to find real local hotspots, NASA fire detections are sectored by wind, and Gemini turns the measured evidence into a brief with role-addressed actions. Residents get the same hour in one of ten Indian languages.',
    features: [
      'Monitor integrity checks on every reading',
      'Hotspots measured against their neighbours',
      'Satellite fires sectored by wind direction',
      'Gemini brief with who should act, and how urgently',
      'Residents view in ten Indian languages, read aloud',
      'Cases routed to agencies with deadlines',
    ],
    impact: 'Found a 4.1x hotspot hidden by the city average, and caught the broken monitors that had fooled the first version.',
    stack: ['Python', 'TypeScript', 'Gemini', 'Google Cloud Run', 'Firestore'],
    image: vayusetu,
    links: { live: 'https://vayusetu-999960875509.asia-south1.run.app', repo: 'https://github.com/DevVaradPatil/vayusetu' },
    featured: true,
  },
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
    links: { live: 'https://resumeinsight.vercel.app/', repo: 'https://github.com/DevVaradPatil/resume-analyzer' },
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
    links: { live: 'https://spotify-2-o.vercel.app/', repo: 'https://github.com/DevVaradPatil/spotify-2.O' },
    featured: true,
  },
  {
    slug: 'delhi-jal-board-crm',
    title: 'Delhi Jal Board WhatsApp CRM',
    year: 2026,
    tags: ['Web'],
    summary:
      'WhatsApp-based grievance management platform enabling citizens to register, track, and manage water, sewer, and revenue complaints.',
    description:
      'A WhatsApp-powered CRM system for Delhi Jal Board that streamlines complaint registration, tracking, and resolution through an interactive chatbot integrated with the WhatsApp Cloud API.',
    problem:
      'Citizens needed a simple and accessible way to register and monitor complaints without relying on traditional web portals or lengthy call center processes.',
    approach:
      'Built a Node.js and Express.js backend with MongoDB and Mongoose for data management. Integrated the WhatsApp Cloud API to create an automated chatbot workflow for complaint registration, status tracking, and user interactions via REST APIs.',
    features: [
      'WhatsApp chatbot',
      'Complaint registration',
      'Complaint status tracking',
      'Water, sewer & revenue grievance management',
      'REST API integration',
      'MongoDB data persistence'
    ],
    stack: [
      'Node.js',
      'Express.js',
      'MongoDB',
      'Mongoose',
      'WhatsApp Cloud API',
      'REST APIs'
    ],
    image: delhijalboardcrm,
    links: { live: null, repo: null },
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
  },
  {
    slug: 'nutristep',
    title: 'NutriStep',
    year: 2026,
    tags: ['Web'],
    summary:
      'Free interactive nutrition courses in English and Hindi: 3 courses, 36 story-style lessons with gated activities, streaks and a mascot.',
    description:
      'NutriStep teaches how food actually works through short, sequential lessons, from kids to adults, in English and Hindi. Each lesson is a story with a hands-on activity you cannot skip.',
    problem:
      'Nutrition advice online is either dry reading or a quiz game that rewards guessing; neither builds understanding, and little of it exists in Hindi.',
    approach:
      'Every lesson follows one arc: hook, idea, mechanism, worked example, gated activity, quiz and recap. Lesson content is typed TypeScript so a Hindi translation cannot drop a key without failing the build. Progress is local-first; signing in only adds a Firestore sync.',
    features: [
      '3 courses, 36 lessons, English + Hindi',
      'Gated hands-on activities inside each lesson',
      'XP, levels, streaks with a weekly shield',
      'Nori the mascot, pure SVG + CSS',
      'Sound synthesised with the Web Audio API',
      'Works with no account at all',
    ],
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Vitest'],
    image: nutristep,
    links: { live: 'https://nutristep.vercel.app/en', repo: 'https://github.com/DevVaradPatil/nutristep' },
  },
  {
    slug: 'mini-world',
    title: 'mini world',
    year: 2026,
    tags: ['3D', 'Web'],
    summary:
      'A tiny living 3D planet to explore: zoom from space to your explorer, then wander, swim and climb to find 12 fallen stars. Fully procedural, no asset files.',
    description:
      'A small 3D adventure in the browser. Zoom from the whole planet down to your explorer, then wander biomes, meet residents, fish, glide and find the twelve stars that fell from the sky.',
    approach:
      'Everything is generated in code: terrain, models, water, sky, creatures and every sound, synthesised with the Web Audio API. A Three.js engine runs the world with a React HUD on top, and the build is an installable PWA that works offline.',
    features: [
      'Procedural planet, models and sound',
      'Zoom from orbit to over-the-shoulder',
      'Quests, characters and a story',
      'Remappable keys and reduce-motion mode',
      'Touch controls on phones',
      'Installable PWA, works offline',
    ],
    stack: ['Three.js', 'React', 'Web Audio API', 'Vite', 'PWA'],
    image: miniworld,
    links: { live: 'https://mini-world-rouge.vercel.app', repo: null },
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
    links: { live: 'https://frontend-toolbox-ten.vercel.app/', repo: 'https://github.com/DevVaradPatil/frontend-toolbox' },
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
    links: { live: 'https://thinktankindia.vercel.app/', repo: 'https://github.com/DevVaradPatil/blog-site' },
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
    links: { live: 'https://snikrz.web.app/', repo: 'https://github.com/DevVaradPatil/snikrz_nextjs_ecommerce_site' },
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
    slug: 'pulse',
    title: 'Pulse',
    year: 2026,
    tags: ['Open Source'],
    summary:
      'Self-hosted, zero-cost keep-alive and uptime monitor for free-tier side projects. GitHub Actions runs the checks; a static dashboard shows the results.',
    description:
      'Free tiers go to sleep, and each counts activity differently. Pulse pings the thing that actually counts, on a schedule, records the result, alerts on failure and publishes a dashboard, with nothing but GitHub involved.',
    problem:
      'Pinging a homepage does not keep a Supabase database, a MongoDB Atlas cluster or a Render service awake: each measures activity in its own way.',
    approach:
      'One config file lists the targets; each check speaks the platform language (a Postgres statement, a driver connection, an HTTP request). Runs on GitHub Actions with zero runtime dependencies, about 34 of the 2,000 free minutes a month, and validates the config in CI.',
    features: [
      'Supabase, MongoDB and HTTP checks',
      'Adding a project is one config entry',
      'Retries, backoff and deduped failure alerts',
      '90-day uptime history and dashboard',
      'Private by default',
      'Zero runtime dependencies',
    ],
    impact: 'Keeps this portfolio and nine other projects awake, at no cost.',
    stack: ['Node.js', 'GitHub Actions', 'GitHub Pages'],
    image: pulse,
    links: { live: null, repo: 'https://github.com/DevVaradPatil/Pulse---Keep-Alive-Project' },
  },
  {
    slug: 'clawd-companion',
    title: 'Clawd Companion',
    year: 2026,
    tags: ['Open Source'],
    summary:
      'A Claude Code desktop plugin: a pixel mascot lives above your prompt and acts out what Claude is doing, beside context, usage-limit and turn-clock meters.',
    description:
      'A slim bar above the input box in the Claude Code desktop app. Behind, the numbers: context fill, 5-hour and weekly limits with your pace, and the turn clock. In front, Clawd, who poses for whatever tool Claude is using.',
    approach:
      'Built on Claude Code function hooks. Each tool call maps to one of 75 poses; subagents get half-size companions. Meters keep fixed widths so nothing jumps, and every limit uses one colour rule: yellow from 75%, red from 90%.',
    features: [
      'Context fill split by what fills it',
      '5-hour and weekly limits with pace',
      'Turn clock that flags when Claude waits on you',
      '75 poses mapped to tools and states',
      'Mini companions for running subagents',
      'One-line install from inside Claude Code',
    ],
    stack: ['TypeScript', 'Python', 'Claude Code plugins'],
    image: clawd,
    links: { live: null, repo: 'https://github.com/DevVaradPatil/clawd-companion' },
  },
  {
    slug: 'bento-portfolio',
    title: 'Bento Portfolio (Varadverse)',
    year: 2024,
    tags: ['Old portfolio', 'Web'],
    summary: 'Interactive, animated bento-grid portfolio template with smooth transitions.',
    description: 'Interactive, animated bento-grid portfolio template with smooth transitions.',
    stack: ['React', 'Tailwind CSS', 'LottieFiles'],
    image: bento,
    links: { live: 'https://varadverse.vercel.app/', repo: 'https://github.com/DevVaradPatil/bento_portfolio' },
  },
  {
    slug: '3d-portfolio-island',
    title: '3D Portfolio Island',
    year: 2023,
    tags: ['Old portfolio', 'Web'],
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
    tags: ['Old portfolio', 'Web'],
    summary:
      'Visually engaging animated portfolio built in Framer with motion design and interactive elements.',
    description:
      'Visually engaging animated portfolio built in Framer with motion design and interactive elements.',
    stack: ['Framer', 'Motion Design'],
    image: framerPortfolio,
    links: { live: 'https://varadpatil.framer.website/', repo: null },
  },
]

export const featuredProjects = projects.filter((p) => p.featured)
