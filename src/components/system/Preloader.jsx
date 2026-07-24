import { useLayoutEffect, useState } from 'react'
import BrandedLoader from '@/components/system/BrandedLoader.jsx'

/**
 * Preloader — the site's entry moment (Phase 5.1 signature moment).
 *
 * A ~1.1s branded intro: the aurora orb + a JetBrains-Mono percentage counter
 * (BrandedLoader, previously unused, finally earns its keep), then a clip-path
 * curtain wipe up into the hero.
 *
 * Design guarantees, in priority order:
 *  1. It NEVER traps the user. Completion is driven by time-based timers
 *     (setInterval/setTimeout), not requestAnimationFrame or `animationend` —
 *     rAF and CSS animations are paused in a hidden/background tab, and if the
 *     unmount hung on either the overlay could strand the whole site behind it.
 *     A hard fallback timer force-clears it no matter what.
 *  2. First visit per SESSION only. sessionStorage-gated, decided before first
 *     paint, so refreshes and in-session navigation stay instant.
 *  3. It is a SIBLING overlay, not a wrapper. It must never wrap the routed
 *     page — a lingering transform on an ancestor of the page creates a
 *     containing block that breaks GSAP ScrollTrigger's position:fixed pins
 *     (see the Manifesto-blackout history). As its own fixed sibling that
 *     unmounts, its curtain transform touches nothing else.
 *  4. NOT gated on prefers-reduced-motion. The owner browses with reduce-motion
 *     on; gating motion there once blanked the whole site. The intro is brief
 *     and self-dismissing, so it runs for everyone.
 */

const INTRO_KEY = 'varad:intro-seen'
const COUNT_MS = 1100 // 0 → 100 counter
const REVEAL_MS = 750 // curtain wipe (keep in sync with .intro--leaving in index.css)

function alreadySeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    // Private mode / storage disabled — treat as "show once", it just won't persist.
    return false
  }
}

export default function Preloader() {
  // Decided synchronously, pre-paint, so a repeat visit renders nothing at all.
  const [phase, setPhase] = useState(() => (alreadySeen() ? 'done' : 'run'))
  const [pct, setPct] = useState(0)

  // Runs once on mount — NOT keyed on `phase`. The run→leave→done transitions
  // are driven by the timers below via setState; re-running this effect on each
  // phase change would fire its cleanup (written for unmount) mid-intro, which
  // would clear the pending finish timer and unlock scroll before the wipe ends.
  useLayoutEffect(() => {
    // `phase` is captured from the first render; it's 'run' unless the intro was
    // already seen this session, in which case there's nothing to drive.
    if (phase !== 'run') return

    // Lock scroll beneath the overlay.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.__lenis?.stop?.()

    let finished = false
    const timers = new Set()
    const later = (fn, ms) => {
      const id = setTimeout(fn, ms)
      timers.add(id)
      return id
    }

    const finish = () => {
      if (finished) return
      finished = true
      for (const id of timers) clearTimeout(id)
      clearInterval(interval)
      try {
        sessionStorage.setItem(INTRO_KEY, '1')
      } catch {
        /* storage unavailable — fine, it just replays next session */
      }
      document.body.style.overflow = prevOverflow
      window.__lenis?.start?.()
      window.scrollTo(0, 0)
      setPhase('done')
    }

    const startLeaving = () => {
      setPct(100)
      setPhase('leave')
      // Timer, not animationend: CSS animations don't progress in a hidden tab.
      later(finish, REVEAL_MS)
    }

    // Time-based (not frame-based) so a throttled tab catches up instead of freezing.
    const start = performance.now()
    const interval = setInterval(() => {
      const p = Math.min(100, ((performance.now() - start) / COUNT_MS) * 100)
      setPct(Math.round(p))
      if (p >= 100) {
        clearInterval(interval)
        startLeaving()
      }
    }, 40)

    // Hard safety net: whatever happens, the overlay is gone by this deadline.
    later(finish, COUNT_MS + REVEAL_MS + 400)

    return () => {
      for (const id of timers) clearTimeout(id)
      clearInterval(interval)
      // If we're torn down mid-intro (HMR, unmount), don't leave scroll locked.
      if (!finished) {
        document.body.style.overflow = prevOverflow
        window.__lenis?.start?.()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === 'done') return null

  return (
    // aria-hidden: a decorative, self-dismissing intro shouldn't be announced,
    // and this hides BrandedLoader's role="status"/aria-live from assistive tech.
    <div className={`intro${phase === 'leave' ? ' intro--leaving' : ''}`} aria-hidden="true">
      <BrandedLoader label={`${pct}%`} />
    </div>
  )
}
