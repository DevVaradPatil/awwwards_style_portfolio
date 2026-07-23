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
  const labelRef = useRef(null)

  useLayoutEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!mq.matches) return

    document.body.classList.add('cursor-active')

    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
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
      // re-derive hover state so it can never get stuck
      applyHoverState(e.target)
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
        if (label) label.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
        raf = 0
        return
      }
      // ring eases toward pointer
      rx += dx * 0.18
      ry += dy * 0.18
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      if (label) label.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(tick)
    }

    const onEnterWindow = () => {
      dot.classList.remove('is-hidden')
      ring.classList.remove('is-hidden')
    }
    const onLeaveWindow = () => {
      dot.classList.add('is-hidden')
      ring.classList.add('is-hidden')
      clearHoverState()
    }

    // Hover state is DERIVED from whatever is under the pointer right now,
    // instead of being toggled on/off by pointerover/pointerout. Clicking a
    // project navigates and unmounts the card, so pointerout never fires for
    // it — which left the "View" label (and the expanded ring) stuck to the
    // cursor. Deriving the state makes it self-correcting.
    const HOVER_SEL = 'a, button, [role="button"], input, textarea, select, [data-cursor="link"]'

    const clearHoverState = () => {
      ring.classList.remove('is-link')
      dot.classList.remove('is-link')
      if (label) label.classList.remove('is-visible')
    }

    const applyHoverState = (target) => {
      const el = target instanceof Element ? target : null
      // isConnected guards against a target that has since left the DOM.
      if (!el || !el.isConnected) {
        clearHoverState()
        return
      }

      const isLink = !!el.closest(HOVER_SEL)
      ring.classList.toggle('is-link', isLink)
      dot.classList.toggle('is-link', isLink)

      if (!label) return
      const labelled = el.closest('[data-cursor-label]')
      if (labelled) {
        const text = labelled.getAttribute('data-cursor-label') || ''
        if (label.textContent !== text) label.textContent = text
        label.classList.add('is-visible')
      } else {
        label.classList.remove('is-visible')
      }
    }

    const onOver = (e) => applyHoverState(e.target)

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    // Clicking a card navigates away; drop the label immediately rather than
    // waiting for the next pointermove on the new page.
    window.addEventListener('click', clearHoverState, { passive: true, capture: true })
    document.addEventListener('mouseenter', onEnterWindow)
    document.addEventListener('mouseleave', onLeaveWindow)

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      window.removeEventListener('click', clearHoverState, { capture: true })
      document.removeEventListener('mouseenter', onEnterWindow)
      document.removeEventListener('mouseleave', onLeaveWindow)
      document.body.classList.remove('cursor-active')
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className="aurora-cursor aurora-cursor--ring" aria-hidden="true" />
      <div ref={dotRef} className="aurora-cursor aurora-cursor--dot" aria-hidden="true" />
      <div ref={labelRef} className="aurora-cursor--label" aria-hidden="true" />
    </>
  )
}
