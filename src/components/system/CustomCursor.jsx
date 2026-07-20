import { useLayoutEffect, useRef } from 'react'
import '@/styles/cursor.css'

/**
 * CustomCursor — zero React state, zero re-renders.
 *
 * Hard rules (do not change):
 *  - Single useLayoutEffect with [] deps.
 *  - Two refs that never re-render.
 *  - Imperative transform writes only.
 *  - Activates only when matchMedia('(hover: hover) and (pointer: fine)') matches.
 *  - Never gate on (pointer: coarse) or useReducedMotion.
 */
export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useLayoutEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return

    document.body.classList.add('cursor-active')

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let raf = 0

    const onMove = (e) => {
      mx = e.clientX
      my = e.clientY
      // dot snaps instantly
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      // wake the easing loop if it went idle
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const tick = () => {
      const dx = mx - rx
      const dy = my - ry
      // Converged and pointer isn't moving — park the loop until the next move.
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        rx = mx
        ry = my
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
        raf = 0
        return
      }
      // ring eases toward pointer
      rx += dx * 0.18
      ry += dy * 0.18
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    const onEnterWindow = () => {
      dot.classList.remove('is-hidden')
      ring.classList.remove('is-hidden')
    }
    const onLeaveWindow = () => {
      dot.classList.add('is-hidden')
      ring.classList.add('is-hidden')
    }

    // Delegate hover state for any interactive element
    const HOVER_SEL = 'a, button, [role="button"], input, textarea, select, [data-cursor="link"]'
    const onOver = (e) => {
      if (e.target instanceof Element && e.target.closest(HOVER_SEL)) {
        ring.classList.add('is-link')
        dot.classList.add('is-link')
      }
    }
    const onOut = (e) => {
      if (e.target instanceof Element && e.target.closest(HOVER_SEL)) {
        ring.classList.remove('is-link')
        dot.classList.remove('is-link')
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    window.addEventListener('pointerout', onOut, { passive: true })
    document.addEventListener('mouseenter', onEnterWindow)
    document.addEventListener('mouseleave', onLeaveWindow)

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('pointerout', onOut)
      document.removeEventListener('mouseenter', onEnterWindow)
      document.removeEventListener('mouseleave', onLeaveWindow)
      document.body.classList.remove('cursor-active')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="aurora-cursor aurora-cursor--ring" aria-hidden="true" />
      <div ref={dotRef} className="aurora-cursor aurora-cursor--dot" aria-hidden="true" />
    </>
  )
}
