// Build-time sitemap generator.
//
// Runs via the `prebuild` npm lifecycle (so `npm run build` — including on
// Vercel — regenerates it automatically). Slugs are parsed from the data file
// as text rather than imported, because projects.js imports .webp assets that
// Node can't evaluate. This keeps the sitemap from ever drifting out of sync
// with the project list.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const SITE = 'https://varaddev.vercel.app'
const today = new Date().toISOString().slice(0, 10)

// Static routes with hand-tuned priorities.
const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/work', priority: '0.9', changefreq: 'monthly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/playground', priority: '0.6', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'yearly' },
]

// Parse project slugs from the data file (text, not import).
const projectsSrc = readFileSync(resolve(root, 'src/data/projects.js'), 'utf8')
const slugs = [...projectsSrc.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])

if (slugs.length === 0) {
  console.warn('[sitemap] No project slugs found — sitemap will omit case studies.')
}

const caseStudyRoutes = slugs.map((slug) => ({
  path: `/work/${slug}`,
  priority: '0.8',
  changefreq: 'monthly',
}))

const routes = [...staticRoutes, ...caseStudyRoutes]

const urls = routes
  .map(
    ({ path, priority, changefreq }) =>
      `  <url>\n` +
      `    <loc>${SITE}${path}</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${changefreq}</changefreq>\n` +
      `    <priority>${priority}</priority>\n` +
      `  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

writeFileSync(resolve(root, 'public/sitemap.xml'), xml)
console.log(`[sitemap] Wrote ${routes.length} URLs (${slugs.length} case studies) → public/sitemap.xml`)
