// Performance budget guardrail (Phase 6).
//
// Runs after `vite build` (see the `postbuild` npm lifecycle) and fails the
// build when the shipped output regresses past a budget. The point is not to
// hit a perfect score today — it's to make a regression impossible to merge by
// accident. Adding one heavy dependency to the eager graph is a two-line diff
// that silently costs 40 kB; this script turns that into a red build.
//
// What it measures
//   1. Initial `/` JS  — the entry chunk plus every chunk the browser is told
//      to modulepreload, read straight out of dist/index.html so it always
//      reflects the real critical path rather than a hand-maintained list.
//   2. Initial CSS.
//   3. Each lazy route chunk (they must stay small or the split is pointless).
//   4. Every shipped image.
//
// Waivers
//   Known-oversized assets are listed in IMAGE_WAIVERS with their CURRENT size
//   as the ceiling. That keeps the build green while still ratcheting: a waived
//   asset may shrink freely but can never grow, and anything not on the list is
//   held to the normal cap. Delete an entry once the asset is re-exported.
//
// Usage
//   node scripts/check-budgets.mjs           # enforce (exit 1 on violation)
//   node scripts/check-budgets.mjs --report  # print the table, always exit 0

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, basename, extname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '..', 'dist')

const REPORT_ONLY = process.argv.includes('--report')

const KB = 1024

/* ----------------------------- the budgets ------------------------------ */

const BUDGETS = {
  // Everything the browser must download before `/` can render. Measured at
  // 154 kB after dropping Framer Motion in Phase 2; the headroom is deliberate
  // but small enough that a new vendor lands as a failure, not a shrug.
  initialJsGz: 165 * KB,
  initialCssGz: 14 * KB,
  // Lazy route chunks — if one of these blows up, the code-split stopped
  // earning its keep (largest today: About at 5.3 kB gz).
  routeChunkGz: 9 * KB,
  // Raw bytes on the wire; images are already compressed so gzip is moot.
  imageBytes: 150 * KB,
}

// basename -> max bytes. Keyed by source basename because dist filenames carry
// a content hash. Both Play Store apps ship a `logo.png`, so that entry covers
// the larger of the pair (365's, at 157 KiB; Wordigo's is only 15 KiB).
const IMAGE_WAIVERS = {
  'creator.jpg': 244 * KB, // re-export pending — see docs/IMAGE_OPTIMIZATION.md
  'logo.png': 158 * KB, //    365 app icon, shipped at Play Store resolution
}

/* ------------------------------- helpers -------------------------------- */

const gz = (buf) => gzipSync(buf, { level: 9 }).length
const fmt = (bytes) => `${(bytes / KB).toFixed(1)} kB`
const pct = (used, limit) => `${Math.round((used / limit) * 100)}%`

const violations = []
const rows = []

// `limit` is what actually gates the build. `softLimit`, when given, is the
// budget this asset *would* be held to without its waiver — exceeding it is
// reported as WAIVED so the debt stays visible instead of silently passing.
function check(label, used, limit, { softLimit } = {}) {
  let status = 'ok'
  if (used > limit) {
    status = 'FAIL'
    violations.push(`${label}: ${fmt(used)} exceeds ${fmt(limit)}`)
  } else if (softLimit != null && used > softLimit) {
    status = 'WAIVED'
  }
  rows.push({ status, label, used: fmt(used), limit: fmt(limit), pct: pct(used, limit) })
}

/* ------------------------- 1 + 2. initial payload ------------------------ */

if (!existsSync(resolve(DIST, 'index.html'))) {
  console.error('[budgets] dist/index.html not found — run `npm run build` first.')
  process.exit(1)
}

const html = readFileSync(resolve(DIST, 'index.html'), 'utf8')

// The entry <script type="module"> plus every <link rel="modulepreload">: this
// is exactly what the browser fetches before first render.
const initialJs = new Set()
for (const m of html.matchAll(/<script[^>]+src="(\/assets\/[^"]+\.js)"/g)) initialJs.add(m[1])
for (const m of html.matchAll(/rel="modulepreload"[^>]*href="(\/assets\/[^"]+\.js)"/g)) {
  initialJs.add(m[1])
}
const initialCss = [...html.matchAll(/rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"/g)].map(
  (m) => m[1],
)

if (initialJs.size === 0) {
  console.error('[budgets] Parsed 0 initial JS chunks from dist/index.html — parser is stale.')
  process.exit(1)
}

const jsBreakdown = [...initialJs]
  .map((href) => ({ href, size: gz(readFileSync(resolve(DIST, `.${href}`))) }))
  .sort((a, b) => b.size - a.size)

const initialJsGz = jsBreakdown.reduce((sum, c) => sum + c.size, 0)
const initialCssGz = initialCss.reduce((sum, h) => sum + gz(readFileSync(resolve(DIST, `.${h}`))), 0)

check(`initial / JS (${initialJs.size} chunks, gz)`, initialJsGz, BUDGETS.initialJsGz)
check('initial / CSS (gz)', initialCssGz, BUDGETS.initialCssGz)

/* --------------------------- 3. lazy route chunks ------------------------ */

const assetFiles = readdirSync(resolve(DIST, 'assets'))
const lazyChunks = assetFiles
  .filter((f) => f.endsWith('.js') && !initialJs.has(`/assets/${f}`))
  .map((f) => ({ f, size: gz(readFileSync(resolve(DIST, 'assets', f))) }))
  .sort((a, b) => b.size - a.size)

for (const { f, size } of lazyChunks) {
  check(`lazy chunk ${f} (gz)`, size, BUDGETS.routeChunkGz)
}

/* ------------------------------- 4. images ------------------------------- */

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif'])

// Hashed assets are `<basename>-<hash>.<ext>`; public/ files are copied verbatim.
const images = []
for (const f of assetFiles) {
  if (!IMAGE_EXT.has(extname(f).toLowerCase())) continue
  const source = `${f.replace(/-[A-Za-z0-9_-]{8,}(\.\w+)$/, '$1')}`
  images.push({ file: `assets/${f}`, source, bytes: statSync(resolve(DIST, 'assets', f)).size })
}
for (const f of readdirSync(DIST)) {
  if (!IMAGE_EXT.has(extname(f).toLowerCase())) continue
  images.push({ file: f, source: basename(f), bytes: statSync(resolve(DIST, f)).size })
}

for (const img of images.sort((a, b) => b.bytes - a.bytes)) {
  const waiver = IMAGE_WAIVERS[img.source]
  check(`image ${img.file}`, img.bytes, waiver ?? BUDGETS.imageBytes, {
    softLimit: waiver ? BUDGETS.imageBytes : undefined,
  })
}

/* -------------------------------- report -------------------------------- */

const interesting = rows.filter((r) => r.status !== 'ok' || r.label.startsWith('initial'))
const width = Math.max(...interesting.map((r) => r.label.length))

console.log('\n[budgets] Performance budgets')
for (const r of interesting) {
  const mark = r.status === 'ok' ? '  ok  ' : r.status === 'WAIVED' ? ' waive' : ' FAIL '
  console.log(`  ${mark} ${r.label.padEnd(width)}  ${r.used.padStart(9)} / ${r.limit.padStart(9)}  ${r.pct}`)
}

console.log('\n  initial / JS breakdown:')
for (const c of jsBreakdown) {
  console.log(`    ${fmt(c.size).padStart(9)}  ${c.href.replace('/assets/', '')}`)
}

const waivedCount = rows.filter((r) => r.status === 'WAIVED').length
if (waivedCount) {
  console.log(`\n  ${waivedCount} asset(s) over budget under an explicit waiver — see IMAGE_WAIVERS.`)
}

if (violations.length === 0) {
  console.log(`\n[budgets] PASS — ${rows.length} checks.\n`)
  process.exit(0)
}

console.error(`\n[budgets] FAIL — ${violations.length} budget violation(s):`)
for (const v of violations) console.error(`  · ${v}`)
console.error(
  '\n  Fix the asset, or (if the growth is genuinely justified) raise the budget\n' +
    '  in scripts/check-budgets.mjs in the same commit so the change is reviewable.\n',
)
process.exit(REPORT_ONLY ? 0 : 1)
