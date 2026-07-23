import { useLayoutEffect, useRef } from 'react'

/**
 * Reveal — fades/rises an element in the first time it enters the viewport.
 *
 * Design rule, learned the hard way: an element is hidden ONLY while we are
 * confident we can un-hide it. Previous versions gated visibility on a single
 * callback (ScrollTrigger, then IntersectionObserver); when that callback
 * didn't fire, whole sections stayed invisible and the page looked blacked out.
 * So there are now three independent paths to reveal, all idempotent:
 *
 *   1. A synchronous in-view check at mount (covers above-the-fold content and
 *      anything on screen after a route change).
 *   2. IntersectionObserver — the efficient primary trigger.
 *   3. A single shared, throttled scroll/resize watcher — the safety net if an
 *      IO callback never arrives.
 *
 * Whichever fires first wins; the element latches revealed and is never hidden
 * again. If none of them can run, the worst case is content that is already
 * visible rather than content that is invisible.
 */

/* ---- shared fallback watcher (one listener for every pending Reveal) ---- */

const TRIGGER_RATIO = 0.92 // reveal once the top edge is 92% down the viewport
const pending = new Set()
let watching = false
let queued = false

// True once the element's top edge has passed the trigger line — deliberately
// NOT "currently on screen". If the user jumps or fast-scrolls past something,
// it must still count as revealed; requiring `bottom > 0` left skipped-over
// sections hidden forever. Safe because reveal latches and never re-hides.
function isInView(el) {
  return el.getBoundingClientRect().top < window.innerHeight * TRIGGER_RATIO
}

function flush() {
  queued = false
  for (const entry of [...pending]) {
    if (isInView(entry.el)) entry.reveal()
  }
  if (pending.size === 0) stopWatching()
}

function onActivity() {
  if (queued) return
  queued = true
  setTimeout(flush, 100) // throttle: at most ~10 rect reads per element / sec
}

function startWatching() {
  if (watching) return
  watching = true
  window.addEventListener('scroll', onActivity, { passive: true })
  window.addEventListener('resize', onActivity, { passive: true })
}

function stopWatching() {
  if (!watching) return
  watching = false
  window.removeEventListener('scroll', onActivity)
  window.removeEventListener('resize', onActivity)
}

/* ------------------------------- component ------------------------------- */

export default function Reveal({
  as: Tag = 'div',
  children,
  delay = 0,
  y = 20,
  duration = 1.1,
  // Accepted for API compatibility. Reveal always latches once revealed —
  // re-hiding on exit is what produced the "section blacks out" bug.
  once = true, // eslint-disable-line no-unused-vars
  className = '',
  style,
  ...rest
}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.dataset.revealed === 'true') return // already done; never re-hide

    el.style.setProperty('--reveal-y', `${y}px`)
    el.style.setProperty('--reveal-duration', `${duration}s`)
    el.style.setProperty('--reveal-delay', `${delay}s`)
    // Hidden state applied pre-paint, so content never flashes in then blinks out.
    el.dataset.reveal = 'out'

    let settled = false
    let io = null
    let timer = null
    const entry = { el, reveal: () => reveal() }

    function teardown() {
      if (io) {
        io.disconnect()
        io = null
      }
      pending.delete(entry)
      if (pending.size === 0) stopWatching()
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }

    function reveal() {
      if (settled) return
      settled = true
      el.dataset.reveal = 'in'
      el.dataset.revealed = 'true'
      teardown()
    }

    // 1. Already on screen right now — reveal on the next tick so the CSS
    //    transition still plays. setTimeout (not rAF) so a throttled/hidden
    //    tab can't strand it hidden.
    if (isInView(el)) {
      timer = setTimeout(reveal, 30)
    }

    // 2. Primary trigger.
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) reveal()
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
      )
      io.observe(el)
    }

    // 3. Safety net.
    pending.add(entry)
    startWatching()

    return teardown
  }, [delay, duration, y])

  return (
    <Tag ref={ref} className={className} style={style} {...rest}>
      {children}
    </Tag>
  )
}
