import { useLocation } from 'react-router-dom'

/**
 * PageTransition — per-route enter animation, CSS-only (no Framer Motion).
 *
 * Keying the wrapper by pathname remounts the subtree on navigation, which
 * replays the `.page-enter` keyframe. Enter-only by design: exit animations
 * race badly with Suspense fallbacks on lazy routes, and SmoothScrollProvider
 * already snaps to top on navigation, so a clean fade-up in reads crisper than
 * a wait-for-exit crossfade. Honors prefers-reduced-motion via the CSS class.
 */
export default function PageTransition({ children }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}
