// Single source of truth for site-wide + per-route SEO meta.
//
// Plain data, no imports — so both the React app (via useDocumentMeta) and the
// build-time prerender script (scripts/prerender.mjs, run in Node) can consume
// it without one drifting from the other.

export const SITE = {
  name: 'Varad Patil',
  url: 'https://varaddev.vercel.app',
  defaultTitle: 'Varad Patil — Developer · Designer · AI Builder',
  defaultDescription:
    'Varad Patil — Full-stack developer & AI enthusiast crafting fast, scalable, immersive web experiences. M.Tech AI for Sustainability, IIT Kanpur.',
  // Must match a file that actually exists in public/ — unfurlers silently
  // show nothing on a 404, and there is no error anywhere to notice.
  ogImage: '/og-image.jpg',
}

// Static-route meta. Case studies (/work/:slug) derive their meta from the
// project record at runtime and from projects.js in the prerender script.
export const pageMeta = {
  home: { title: null, description: SITE.defaultDescription, path: '/' },
  work: {
    title: 'Selected Work',
    description:
      'A selection of full-stack, AI, 3D and mobile projects shipped by Varad Patil — from production SaaS to creative playgrounds.',
    path: '/work',
  },
  about: {
    title: 'About',
    description:
      'M.Tech researcher at IIT Kanpur, full-stack developer, AI builder. Principles, timeline, stack, education and recommendations.',
    path: '/about',
  },
  playground: {
    title: 'Playground',
    description:
      'Live demos of motion primitives, scroll-driven interactions and design tokens powering varaddev.vercel.app.',
    path: '/playground',
  },
  contact: {
    title: 'Contact',
    description:
      'Have an idea worth shipping? Reach Varad Patil for full-stack, AI and product collaborations.',
    path: '/contact',
  },
  notFound: { title: '404', description: 'Page not found.', path: '/404' },
}

// Routes the prerender script emits as their own static HTML (home stays as the
// root index.html; case studies are appended from project data).
export const staticPrerenderRoutes = [
  pageMeta.work,
  pageMeta.about,
  pageMeta.playground,
  pageMeta.contact,
]
