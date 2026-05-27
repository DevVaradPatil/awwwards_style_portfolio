import { useEffect, useRef } from 'react'

/**
 * Marquee — seamless infinite scroller.
 *
 * Hard rules baked in:
 *  - Renders TWO flat sibling groups (not nested margin offsets).
 *  - Measures first group `width + gap` per frame for accurate wrap.
 *  - Wraps offset to [-groupW, 0] (left) or [0, groupW] (right).
 *  - Pauses on hover when `pauseOnHover` is true.
 */
export default function Marquee({
  children,
  speed = 60, // px / sec
  direction = 'left',
  gap = 48,
  pauseOnHover = true,
  className = '',
}) {
  const trackRef = useRef(null)
  const groupRef = useRef(null)
  const hoverRef = useRef(false)

  useEffect(() => {
    const track = trackRef.current
    const group = groupRef.current
    if (!track || !group) return

    let raf = 0
    let offset = direction === 'left' ? 0 : 0
    let last = performance.now()

    const tick = (now) => {
      const dt = (now - last) / 1000
      last = now

      if (!hoverRef.current) {
        const groupW = group.getBoundingClientRect().width + gap
        const delta = speed * dt * (direction === 'left' ? -1 : 1)
        offset += delta

        if (direction === 'left') {
          // wrap into [-groupW, 0]
          if (offset <= -groupW) offset += groupW
          if (offset > 0) offset -= groupW
        } else {
          // wrap into [0, groupW]
          if (offset >= groupW) offset -= groupW
          if (offset < 0) offset += groupW
        }

        track.style.transform = `translate3d(${offset}px, 0, 0)`
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [speed, direction, gap])

  const onEnter = () => {
    if (pauseOnHover) hoverRef.current = true
  }
  const onLeave = () => {
    if (pauseOnHover) hoverRef.current = false
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      aria-hidden="true"
    >
      <div
        ref={trackRef}
        className="flex w-max items-center will-change-transform"
        style={{ gap: `${gap}px` }}
      >
        <div ref={groupRef} className="flex items-center" style={{ gap: `${gap}px` }}>
          {children}
        </div>
        <div className="flex items-center" style={{ gap: `${gap}px` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
