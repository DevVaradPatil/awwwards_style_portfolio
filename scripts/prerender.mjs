// Build-time route prerendering (meta-injection strategy).
//
// Runs via the `postbuild` npm lifecycle. For every route it clones the built
// dist/index.html and rewrites the <head> — title, description, OG/Twitter,
// canonical, and (for case studies) per-project OG image + CreativeWork JSON-LD
// — then writes it to dist/<route>/index.html. Vercel serves these static files
// for their exact URLs (the SPA rewrite in vercel.json is only the fallback for
// unmatched paths), so shared links and crawlers get correct per-route meta
// while the same JS bundle still boots the full SPA on load.
//
// This does NOT snapshot the rendered body — deliberately. The app is
// canvas/GSAP heavy and body snapshots would bake in mid-animation states.
// Unfurlers read <head>, and Googlebot renders the JS, so head-accurate HTML
// is what actually moves the needle.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { SITE, staticPrerenderRoutes } from '../src/data/siteMeta.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const DIST = resolve(root, 'dist')

const template = readFileSync(resolve(DIST, 'index.html'), 'utf8')

// --- helpers ----------------------------------------------------------------
const escAttr = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

// Prevent a "</script>" inside JSON-LD from closing the script element early.
const escJsonLd = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c')

const fullTitle = (title) => (title ? `${title} — ${SITE.name}` : SITE.defaultTitle)

// Replace a whole tag (matched by one identifying attribute) with a freshly
// built, normalized single-line tag. Tolerates the multi-line attribute
// wrapping some tags have in the source index.html.
function replaceMeta(html, attr, key, content) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, 'i')
  if (!re.test(html)) {
    console.warn(`[prerender] meta ${attr}="${key}" not found, skipped.`)
    return html
  }
  return html.replace(re, `<meta ${attr}="${key}" content="${escAttr(content)}" />`)
}

function buildHtml({ title, description, path, ogImage, jsonLd }) {
  const t = fullTitle(title)
  const desc = description || SITE.defaultDescription
  const url = `${SITE.url}${path}`
  const image = ogImage || `${SITE.url}${SITE.ogImage}`
  let html = template

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(t)}</title>`)
  html = replaceMeta(html, 'name', 'description', desc)
  html = replaceMeta(html, 'property', 'og:title', t)
  html = replaceMeta(html, 'property', 'og:description', desc)
  html = replaceMeta(html, 'property', 'og:url', url)
  html = replaceMeta(html, 'property', 'og:image', image)
  html = replaceMeta(html, 'name', 'twitter:title', t)
  html = replaceMeta(html, 'name', 'twitter:description', desc)
  html = replaceMeta(html, 'name', 'twitter:image', image)
  html = html.replace(
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${escAttr(url)}" />`,
  )

  if (jsonLd) {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">${escJsonLd(jsonLd)}</script>\n  </head>`,
    )
  }
  return html
}

function writeRoute(path, html) {
  // '/work' -> dist/work/index.html ; '/work/slug' -> dist/work/slug/index.html
  const dir = resolve(DIST, `.${path}`)
  mkdirSync(dir, { recursive: true })
  writeFileSync(resolve(dir, 'index.html'), html)
}

// --- case-study data (parsed from projects.js as text) ----------------------
const projectsSrc = readFileSync(resolve(root, 'src/data/projects.js'), 'utf8')

// image variable -> source basename (sans extension)
const imgVarToBase = {}
for (const m of projectsSrc.matchAll(/import\s+(\w+)\s+from\s+['"][^'"]*\/([\w.-]+)\.webp['"]/g)) {
  imgVarToBase[m[1]] = m[2]
}

// hashed dist asset lookup: basename -> "/assets/<base>-<hash>.webp"
const distAssets = readdirSync(resolve(DIST, 'assets')).filter((f) => f.endsWith('.webp'))
const baseToAsset = {}
for (const f of distAssets) baseToAsset[f.split('-')[0]] = `/assets/${f}`

function parseProjects() {
  const slugMatches = [...projectsSrc.matchAll(/slug:\s*['"]([^'"]+)['"]/g)]
  const out = []
  for (let i = 0; i < slugMatches.length; i++) {
    const start = slugMatches[i].index
    const end = i + 1 < slugMatches.length ? slugMatches[i + 1].index : projectsSrc.length
    const chunk = projectsSrc.slice(start, end)
    const slug = slugMatches[i][1]
    const title = chunk.match(/title:\s*(['"])(.*?)\1/)?.[2]
    const summary = chunk.match(/summary:\s*(['"])([\s\S]*?)\1\s*,/)?.[2]
    const year = chunk.match(/year:\s*(\d+)/)?.[1]
    const tags = [...(chunk.match(/tags:\s*\[([^\]]*)\]/)?.[1] || '').matchAll(/['"]([^'"]+)['"]/g)].map(
      (t) => t[1],
    )
    const imageVar = chunk.match(/image:\s*(\w+)/)?.[1]
    const base = imageVar ? imgVarToBase[imageVar] : null
    const asset = base ? baseToAsset[base] : null
    out.push({ slug, title, summary, year, tags, asset })
  }
  return out
}

// --- run --------------------------------------------------------------------
let count = 0

// Static routes (home stays as the untouched root index.html).
for (const route of staticPrerenderRoutes) {
  writeRoute(route.path, buildHtml(route))
  count++
}

// Case studies.
const projects = parseProjects()
const bad = projects.filter((p) => !p.title || !p.summary)
if (bad.length) {
  console.warn(`[prerender] ${bad.length} project(s) missing title/summary — check projects.js parsing.`)
}
for (const p of projects) {
  const path = `/work/${p.slug}`
  const ogImage = p.asset ? `${SITE.url}${p.asset}` : undefined
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: p.title,
    description: p.summary,
    url: `${SITE.url}${path}`,
    ...(ogImage ? { image: ogImage } : {}),
    ...(p.year ? { dateCreated: String(p.year) } : {}),
    ...(p.tags.length ? { keywords: p.tags.join(', ') } : {}),
    author: { '@type': 'Person', name: SITE.name, url: SITE.url },
  }
  writeRoute(path, buildHtml({ title: p.title, description: p.summary, path, ogImage, jsonLd }))
  count++
}

console.log(`[prerender] Wrote ${count} route HTML files (${projects.length} case studies).`)
