import { lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Vercel Web Analytics + Speed Insights.
 *
 * Field data (real LCP/CLS/INP from real visitors) is the only thing that tells
 * us whether the perf work in Phases 2–3 actually landed — lab Lighthouse runs
 * on a fast desktop lie. Both are cookieless and same-origin: the scripts come
 * from /_vercel/insights/* and /_vercel/speed-insights/*, so there's no
 * third-party host, no extra preconnect, and nothing to add to a CSP.
 *
 * Loaded lazily and rendered only in production — no beacons in dev, no
 * localhost noise in the numbers, and zero bytes on the critical path.
 */

const VercelBeacons = lazy(() => import('./VercelBeacons.jsx'))

// This app uses the declarative <BrowserRouter>, not a data router, so
// useMatches() (which would hand us the matched path pattern) isn't available.
// /work/:slug is the only dynamic route, so normalising it by hand keeps every
// case study grouped under one row instead of fragmenting the report into 13.
const DYNAMIC_ROUTES = [[/^\/work\/[^/]+\/?$/, '/work/[slug]']]

function routeTemplate(pathname) {
  for (const [pattern, template] of DYNAMIC_ROUTES) {
    if (pattern.test(pathname)) return template
  }
  return pathname
}

export default function Analytics() {
  const { pathname } = useLocation()

  if (!import.meta.env.PROD) return null

  return (
    <Suspense fallback={null}>
      <VercelBeacons route={routeTemplate(pathname)} path={pathname} />
    </Suspense>
  )
}
