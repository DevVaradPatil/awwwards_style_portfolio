import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

/**
 * WorkRing — project screenshots on a 3D ring (pure CSS 3D, no WebGL).
 *
 * Drag (mouse or touch) or horizontal wheel spins it with momentum; it drifts
 * slowly on its own. The card facing the viewer lights up and its title shows
 * underneath. Every card is a real link: Tab moves through them and focusing
 * one turns the ring to face it. A drag never counts as a click.
 *
 * The animation loop runs only while the ring is on screen.
 *
 * @param {{ projects: Array<{slug: string, title: string, image: string, year?: number, tags?: string[]}> }} props
 */
export default function WorkRing({ projects, className = '' }) {
  const stageRef = useRef(null)
  const ringRef = useRef(null)
  const cardsRef = useRef([])
  const state = useRef({ angle: 0, vel: -0.1, target: null, tilt: -6, tTilt: -6, dragging: false, lastX: 0, moved: 0, radius: 0, visible: true })
  const [front, setFront] = useState(0)
  const n = projects.length
  const step = 360 / n

  // Size the ring to the stage; re-run on resize and when the card count changes.
  useLayoutEffect(() => {
    const layout = () => {
      const stage = stageRef.current
      if (!stage) return
      const w = stage.clientWidth
      // Big rings (many projects) use smaller cards so the far side stays in frame.
      const cardW = w < 640 ? 210 : w < 1024 ? 300 : n > 8 ? 320 : 380
      const radius = Math.round(cardW / 2 / Math.tan(Math.PI / Math.max(n, 3)) + 48)
      state.current.radius = radius
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        card.style.width = `${cardW}px`
        card.style.left = `${-cardW / 2}px`
        card.style.top = `${-cardW * 0.36}px`
        card.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`
      })
    }
    layout()
    window.addEventListener('resize', layout)
    return () => window.removeEventListener('resize', layout)
  }, [n, step])

  useEffect(() => {
    const stage = stageRef.current
    const ring = ringRef.current
    if (!stage || !ring || !n) return
    const s = state.current
    let raf = 0
    let lastFront = -1

    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([e]) => {
            s.visible = e.isIntersecting
            if (s.visible && !raf) raf = requestAnimationFrame(frame)
          })
        : null
    io?.observe(stage)

    const onDown = (e) => {
      s.dragging = true
      s.lastX = e.clientX
      s.moved = 0
      s.target = null
    }
    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      s.tTilt = -6 + ((e.clientY - r.top) / r.height - 0.5) * -12
      if (!s.dragging) return
      const dx = e.clientX - s.lastX
      s.lastX = e.clientX
      s.moved += Math.abs(dx)
      s.vel = dx * 0.25
    }
    const onUp = () => {
      s.dragging = false
    }
    const onWheel = (e) => {
      // Only horizontal intent spins the ring; vertical wheel keeps scrolling the page.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      s.target = null
      s.vel -= e.deltaX * 0.02
    }
    // A click that ends a drag is not a navigation.
    const onClickCapture = (e) => {
      if (s.moved > 6) {
        e.preventDefault()
        e.stopPropagation()
      }
      s.moved = 0
    }

    stage.addEventListener('pointerdown', onDown)
    stage.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('pointermove', onWindowMove)
    stage.addEventListener('wheel', onWheel, { passive: false })
    stage.addEventListener('click', onClickCapture, true)

    function onWindowMove(e) {
      // Keep tracking a drag that leaves the stage.
      if (s.dragging && !stage.contains(e.target)) onMove(e)
    }

    function frame() {
      raf = 0
      if (!s.visible) return
      if (s.target != null) {
        const d = s.target - s.angle
        s.angle += d * 0.12
        s.vel = 0
        if (Math.abs(d) < 0.05) s.angle = s.target
      } else {
        s.angle += s.vel
        if (!s.dragging) s.vel += (-0.1 - s.vel) * 0.03
      }
      s.tilt += (s.tTilt - s.tilt) * 0.08
      ring.style.transform = `translateZ(${-s.radius}px) rotateX(${s.tilt.toFixed(2)}deg) rotateY(${s.angle.toFixed(2)}deg)`

      let best = -2
      let bestI = 0
      const skew = Math.max(-8, Math.min(8, s.vel * 1.2)).toFixed(2)
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        const a = (i * step + s.angle) * (Math.PI / 180)
        const facing = Math.cos(a)
        if (facing > best) {
          best = facing
          bestI = i
        }
        const img = card.firstElementChild
        img.style.filter = `brightness(${(0.28 + 0.72 * Math.max(0, facing)).toFixed(2)})`
        img.style.transform = `skewY(${skew}deg)`
      })
      if (bestI !== lastFront) {
        lastFront = bestI
        setFront(bestI)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      io?.disconnect()
      stage.removeEventListener('pointerdown', onDown)
      stage.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('pointermove', onWindowMove)
      stage.removeEventListener('wheel', onWheel)
      stage.removeEventListener('click', onClickCapture, true)
    }
  }, [n, step])

  // Focusing a card (keyboard) turns the ring to face it, by the shortest way.
  const faceCard = (i) => {
    const s = state.current
    let target = -i * step
    target += Math.round((s.angle - target) / 360) * 360
    s.target = target
  }

  const p = projects[front]

  return (
    <div className={className}>
      <div
        ref={stageRef}
        className="relative h-[360px] cursor-grab touch-pan-y select-none active:cursor-grabbing md:h-[460px] lg:h-[520px]"
        style={{ perspective: '1100px' }}
      >
        <div ref={ringRef} className="absolute top-[46%] left-1/2 h-0 w-0 [transform-style:preserve-3d]">
          {projects.map((proj, i) => (
            <Link
              key={proj.slug}
              ref={(el) => (cardsRef.current[i] = el)}
              to={`/work/${proj.slug}`}
              draggable={false}
              onFocus={() => faceCard(i)}
              data-cursor-label="Open"
              aria-label={`${proj.title} — case study`}
              className="absolute block [backface-visibility:hidden] [transform-style:preserve-3d]"
            >
              <img
                src={proj.image}
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
                className="pointer-events-none block aspect-[16/10] w-full rounded-(--radius-md) object-cover object-top shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
              />
            </Link>
          ))}
        </div>
      </div>

      {p && (
        <div className="mx-auto mt-4 flex max-w-[1400px] flex-col items-center gap-2 px-6 text-center">
          <p className="text-(length:--fs-sm) text-(--color-fg-muted) tabular-nums">
            {[p.year, ...(p.tags ?? [])].filter(Boolean).join(' · ')}
          </p>
          <Link
            to={`/work/${p.slug}`}
            className="group inline-flex items-center gap-2 font-display text-(length:--fs-h2) font-extrabold [font-stretch:125%] text-(--color-fg) transition-colors hover:text-(--color-pink)"
          >
            {p.title}
            <ArrowUpRight size={28} strokeWidth={2.4} className="shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  )
}
