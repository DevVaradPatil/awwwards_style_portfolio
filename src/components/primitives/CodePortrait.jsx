import { useEffect, useRef } from 'react'

const RAMP = ' .,:;-~=+*cxoeaO0#%&@'
const GLYPHS = '01<>/{}[]=+*#$%&@ABCDEFXYZ'
const DECODE_ROW_MS = 22 // decode sweeps down one row every N ms
const RESCAN_MS = 9000 // after decoding, re-run the sweep this often

/**
 * CodePortrait — a real photo drawn in colored code characters (Canvas 2D).
 *
 * On first view the characters decode line by line out of random glyphs; a
 * thin scan line keeps sweeping afterwards. The pointer is a lens that shows
 * the real photo underneath (mouse hover, or touch-drag on phones).
 *
 * Fills its parent's width; height follows the photo's aspect ratio. Only
 * animates while on screen.
 *
 * @param {{ src: string, alt: string, className?: string }} props
 */
export default function CodePortrait({ src, alt, className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    let W = 0
    let H = 0
    let fs = 10
    let cells = []
    let rows = 0
    let start = 0
    let raf = 0
    let visible = true
    let alive = true
    const lens = { x: -999, y: -999, k: 0, on: false }

    const layout = () => {
      if (!img.naturalWidth) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = wrap.clientWidth
      H = Math.round((W * img.naturalHeight) / img.naturalWidth)
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fs = W < 420 ? 7 : W < 640 ? 8 : 10
      const cw = fs * 0.62
      const cols = Math.floor(W / cw)
      rows = Math.floor(H / fs)
      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const o = off.getContext('2d')
      o.drawImage(img, 0, 0, cols, rows)
      const d = o.getImageData(0, 0, cols, rows).data
      cells = []
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4
          const r = d[i]
          const g = d[i + 1]
          const b = d[i + 2]
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
          const boost = 1.25
          cells.push({
            x: x * cw,
            y: y * fs,
            row: y,
            ch: RAMP[Math.min(RAMP.length - 1, Math.floor(Math.pow(lum, 0.8) * RAMP.length))],
            col: `rgb(${Math.min(255, (r * boost) | 0)},${Math.min(255, (g * boost) | 0)},${Math.min(255, (b * boost) | 0)})`,
            at: y * DECODE_ROW_MS + Math.random() * 380,
          })
        }
      }
      start = performance.now()
      wake()
    }

    const frame = (now) => {
      raf = 0
      if (!alive || !visible || !cells.length) return
      let t = now - start
      if (t > rows * DECODE_ROW_MS + RESCAN_MS) {
        start = now
        t = 0
        cells.forEach((c) => (c.at = c.row * DECODE_ROW_MS + Math.random() * 380))
      }
      ctx.fillStyle = '#0b0b0d'
      ctx.fillRect(0, 0, W, H)
      ctx.font = `700 ${fs}px "JetBrains Mono", ui-monospace, monospace`
      ctx.textBaseline = 'top'

      const R = Math.max(60, W * 0.17)
      lens.k += ((lens.on ? 1 : 0) - lens.k) * 0.15
      const r = R * lens.k
      const r2 = r * r
      const scanY = ((now / 12) % (H + 200)) - 100

      for (let i = 0; i < cells.length; i++) {
        const c = cells[i]
        if (lens.k > 0.05) {
          const dx = c.x - lens.x
          const dy = c.y - lens.y
          if (dx * dx + dy * dy < r2) continue
        }
        if (t < c.at) {
          if (t > c.at - 500) {
            ctx.fillStyle = 'rgba(255,138,208,0.6)'
            ctx.fillText(GLYPHS[(Math.random() * GLYPHS.length) | 0], c.x, c.y)
          }
          continue
        }
        const onScan = Math.abs(c.y - scanY) < 3
        ctx.fillStyle = onScan ? '#ff8ad0' : c.col
        ctx.fillText(onScan ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : c.ch, c.x, c.y)
      }

      if (lens.k > 0.05) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(lens.x, lens.y, r, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, 0, 0, W, H)
        ctx.restore()
        ctx.strokeStyle = 'rgba(255,138,208,0.95)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(lens.x, lens.y, r, 0, Math.PI * 2)
        ctx.stroke()
      }
      raf = requestAnimationFrame(frame)
    }
    function wake() {
      if (!raf && alive) raf = requestAnimationFrame(frame)
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      lens.x = e.clientX - rect.left
      lens.y = e.clientY - rect.top
      lens.on = true
      wake()
    }
    const onLeave = () => {
      lens.on = false
    }
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerdown', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    canvas.addEventListener('pointercancel', onLeave)
    // Touch: the lens follows the finger and lifts with it; a mouse keeps it.
    const onUp = (e) => {
      if (e.pointerType !== 'mouse') onLeave()
    }
    canvas.addEventListener('pointerup', onUp)

    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(([e]) => {
            visible = e.isIntersecting
            if (visible) wake()
          })
        : null
    io?.observe(canvas)

    let rt = 0
    const onResize = () => {
      clearTimeout(rt)
      rt = setTimeout(layout, 150)
    }
    window.addEventListener('resize', onResize)

    img.onload = () => {
      // The characters are drawn in JetBrains Mono; wait so they don't
      // render in a fallback face first.
      Promise.resolve(document.fonts?.load('700 10px "JetBrains Mono"'))
        .catch(() => {})
        .then(() => alive && layout())
    }
    img.src = src

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      clearTimeout(rt)
      io?.disconnect()
      window.removeEventListener('resize', onResize)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      canvas.removeEventListener('pointercancel', onLeave)
      canvas.removeEventListener('pointerup', onUp)
    }
  }, [src])

  return (
    <div ref={wrapRef} className={`relative overflow-hidden rounded-(--radius-lg) bg-(--color-ink) ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={alt}
        className="block w-full cursor-crosshair touch-pan-y"
        style={{ aspectRatio: '3 / 4' }}
      />
    </div>
  )
}
