import { useRef } from 'react'

/**
 * GlassPhotoCard — a full-bleed photo with a circular "loupe" that follows
 * the cursor and shows a negative/duotone version of whatever's underneath —
 * like holding a strip of exposed film up to the portrait. One accent color
 * (the brand violet), no hue-cycling, no glass.
 *
 * The lens is a second copy of the same image, sized and positioned via
 * background-size/background-position so it lines up pixel-for-pixel with
 * whatever the lens is currently over, then run through grayscale+invert
 * and tinted with a single mix-blend-mode wash. Everything is written
 * imperatively to refs on pointermove — no React state, no re-renders.
 *
 * Not gated on prefers-reduced-motion: the lens and tilt only move while
 * the pointer is on the card.
 */
export default function GlassPhotoCard({
  src,
  alt = '',
  max = 10, // peak tilt in degrees at the card edge
  ratio = '1 / 1', // card aspect — match the photo so object-cover fills without cropping
  lensSize = 160, // diameter of the negative-reveal loupe, in px
  width,
  height,
  className = '',
}) {
  const wrapRef = useRef(null)
  const innerRef = useRef(null)
  const lensRef = useRef(null)
  const lensImgRef = useRef(null)

  const onMove = (e) => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    const lens = lensRef.current
    const lensImg = lensImgRef.current
    if (!wrap || !inner) return
    const r = wrap.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const px = x / r.width
    const py = y / r.height

    // Gentle tilt toward the cursor, same as before, just less extreme —
    // the lens is the main event now, the tilt is a quiet support beat.
    const rx = (0.5 - py) * max * 2
    const ry = (px - 0.5) * max * 2
    inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`

    if (lens && lensImg) {
      const half = lensSize / 2
      lens.style.transform = `translate(${x - half}px, ${y - half}px)`
      lens.style.opacity = '1'
      // Align the lens's background so it shows exactly what's under it —
      // same image, same box, offset by the lens's own top-left corner.
      lensImg.style.backgroundSize = `${r.width}px ${r.height}px`
      lensImg.style.backgroundPosition = `${-(x - half)}px ${-(y - half)}px`
    }
  }

  const onLeave = () => {
    if (innerRef.current) innerRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'
    if (lensRef.current) lensRef.current.style.opacity = '0'
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative ${className}`}
      style={{ perspective: '1000px' }}
    >
      <div
        ref={innerRef}
        className="relative w-full overflow-hidden rounded-(--radius-lg) border border-(--color-stroke-strong) bg-(--color-elev) shadow-[0_20px_50px_-20px_rgba(8,7,13,0.9)] transition-transform duration-500 ease-out will-change-transform"
        style={{ aspectRatio: ratio, transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Photo — full cover, no gaps. When the card's `ratio` matches the
            source, object-cover fills edge-to-edge with no crop. */}
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          draggable={false}
          width={width}
          height={height}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />

        {/* Bottom grounding vignette so the portrait sits on the dark surface. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
          style={{ background: 'linear-gradient(to top, rgba(8,7,13,0.55), transparent)' }}
        />

        {/* The negative-reveal lens. Fixed size, hard-edged circle — reads
            like a loupe or a strip of negative film held up to the photo,
            not a soft glow. Off by default, fades in on move. */}
        <div
          ref={lensRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 overflow-hidden rounded-full opacity-0 transition-opacity duration-200 ease-out"
          style={{
            width: lensSize,
            height: lensSize,
            boxShadow: '0 0 0 2px rgba(124,91,255,0.85), 0 0 24px 4px rgba(124,91,255,0.4)',
          }}
        >
          {/* Same image, negative + grayscale, aligned to sit under the lens. */}
          <div
            ref={lensImgRef}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              filter: 'grayscale(1) invert(1) contrast(1.05)',
            }}
          />
          {/* Single-color wash so the negative reads as branded duotone
              (violet ↔ black) instead of a muddy literal color-invert. */}
          <div
            className="absolute inset-0"
            style={{ background: '#7C5BFF', mixBlendMode: 'color' }}
          />
        </div>
      </div>
    </div>
  )
}