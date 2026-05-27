import { useRef } from 'react'

/**
 * TiltCard — mouse-driven 3D tilt with imperative transforms.
 * Inner content sits on preserve-3d to keep crisp.
 */
export default function TiltCard({
  children,
  className = '',
  max = 8,
  glare = true,
  ...rest
}) {
  const wrapRef = useRef(null)
  const innerRef = useRef(null)
  const glareRef = useRef(null)

  const handleMove = (e) => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return
    const r = wrap.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    const rx = (0.5 - py) * max * 2
    const ry = (px - 0.5) * max * 2
    inner.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${
        py * 100
      }%, rgba(255,255,255,0.18), transparent 55%)`
    }
  }

  const handleLeave = () => {
    const inner = innerRef.current
    if (inner) inner.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
    if (glareRef.current) glareRef.current.style.background = 'transparent'
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={`group relative ${className}`}
      style={{ perspective: '900px' }}
      {...rest}
    >
      <div
        ref={innerRef}
        className="relative h-full w-full rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-elev) will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
        {glare && (
          <div
            ref={glareRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-(--radius-lg)"
            style={{ transition: 'background 0.3s linear' }}
          />
        )}
      </div>
    </div>
  )
}
