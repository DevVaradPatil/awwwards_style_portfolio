import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

/**
 * The actual Vercel beacons. Split into its own module so Analytics.jsx can
 * lazy() it — that keeps @vercel/* out of the eager `/` graph entirely
 * (it becomes a separate vendor-analytics chunk that is never modulepreloaded),
 * so measurement never costs the thing it measures.
 */
export default function VercelBeacons({ route, path }) {
  return (
    <>
      <Analytics route={route} path={path} />
      <SpeedInsights route={route} />
    </>
  )
}
