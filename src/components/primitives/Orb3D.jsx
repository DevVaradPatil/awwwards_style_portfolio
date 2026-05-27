import { useEffect, useRef } from 'react'

/**
 * Orb3D — solid 3D icosphere rendered on Canvas2D.
 *
 * No three.js dependency. ~3kB of code. Runs at 60fps with 80 faces.
 *
 * What it does:
 *   - Builds an icosahedron, subdivides once (12→42 verts, 20→80 triangles).
 *   - True 3D rotation (X & Y matrices), perspective projection.
 *   - Lambert shading per face from a fixed key light.
 *   - Color tint sweeps violet → iris → cyan across the surface based on
 *     normal direction (matches Aurora Compute palette).
 *   - Back-face culling + painter's algorithm depth sort.
 *   - Pointer parallax + gentle auto-spin.
 *   - Pauses when offscreen, respects prefers-reduced-motion, dpr capped at 2.
 */
export default function Orb3D({ size = 380, className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // -- Build icosphere ----------------------------------------------------
    // Icosahedron base
    const t = (1 + Math.sqrt(5)) / 2
    const baseVerts = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ].map(([x, y, z]) => {
      const L = Math.hypot(x, y, z)
      return [x / L, y / L, z / L]
    })
    const baseFaces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ]

    // Subdivide once for smoother surface (80 faces)
    const verts = baseVerts.map((v) => v.slice())
    const midCache = new Map()
    const midpoint = (a, b) => {
      const key = a < b ? `${a}_${b}` : `${b}_${a}`
      if (midCache.has(key)) return midCache.get(key)
      const va = verts[a]
      const vb = verts[b]
      let mx = (va[0] + vb[0]) / 2
      let my = (va[1] + vb[1]) / 2
      let mz = (va[2] + vb[2]) / 2
      const L = Math.hypot(mx, my, mz)
      mx /= L; my /= L; mz /= L
      const idx = verts.length
      verts.push([mx, my, mz])
      midCache.set(key, idx)
      return idx
    }
    const faces = []
    for (const [a, b, c] of baseFaces) {
      const ab = midpoint(a, b)
      const bc = midpoint(b, c)
      const ca = midpoint(c, a)
      faces.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca])
    }

    // -- Sizing -------------------------------------------------------------
    let cssW = 1
    let cssH = 1
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      cssW = Math.max(1, Math.round(rect.width))
      cssH = Math.max(1, Math.round(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = cssW * dpr
      canvas.height = cssH * dpr
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // -- Animation state ----------------------------------------------------
    // Continuous spin (always advances) + pointer parallax offset (eased).
    let spinY = 0.6           // base rotation, continuously advanced
    let spinX = -0.35         // gentle X wobble
    let offsetX = 0           // pointer-driven tilt offset
    let offsetY = 0
    let targetOffsetX = 0
    let targetOffsetY = 0
    let auto = 0
    let last = performance.now()
    let visible = true
    let raf = 0

    // Reusable transformed vertex buffer
    const tv = verts.map(() => [0, 0, 0])

    const persp = 3.2

    // Light direction (normalised). Coming from upper-right-front.
    const lightLen = Math.hypot(0.55, 0.7, 0.85)
    const Lx = 0.55 / lightLen
    const Ly = -0.7 / lightLen   // -y is "up" on screen
    const Lz = 0.85 / lightLen   // +z is toward viewer in our convention

    // Aurora palette
    const colorViolet = [124, 91, 255]   // #7c5bff
    const colorIris   = [176, 123, 255]  // #b07bff
    const colorCyan   = [91, 228, 255]   // #5be4ff
    const mix = (a, b, t) => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ]
    const tint = (n) => {
      // n is normal vector; map normalized direction → palette sweep
      const t1 = (n[1] + 1) * 0.5  // y → violet→cyan
      const t2 = (n[0] + 1) * 0.5  // x → toward iris
      const a = mix(colorViolet, colorCyan, t1)
      return mix(a, colorIris, t2 * 0.35)
    }

    const draw = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      if (!reduceMotion) {
        // Continuous auto-spin around Y; subtle X wobble.
        auto += dt
        spinY += dt * 0.55                       // ~31°/s — clearly rotating
        spinX = -0.35 + Math.sin(auto * 0.5) * 0.18
        // Ease pointer offset toward target
        offsetX += (targetOffsetX - offsetX) * Math.min(1, dt * 5)
        offsetY += (targetOffsetY - offsetY) * Math.min(1, dt * 5)
      }

      const rotX = spinX + offsetY
      const rotY = spinY + offsetX

      const cx = cssW / 2
      const cy = cssH / 2
      const scale = Math.min(cssW, cssH) * 0.38

      const cosX = Math.cos(rotX), sinX = Math.sin(rotX)
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY)

      // Transform all verts: rotate Y then X
      for (let i = 0; i < verts.length; i++) {
        const v = verts[i]
        // rotate around Y
        const x1 = v[0] * cosY + v[2] * sinY
        const z1 = -v[0] * sinY + v[2] * cosY
        // rotate around X
        const y2 = v[1] * cosX - z1 * sinX
        const z2 = v[1] * sinX + z1 * cosX
        const t = tv[i]
        t[0] = x1
        t[1] = y2
        t[2] = z2
      }

      // Build draw list with depth + lighting
      const drawList = []
      for (let i = 0; i < faces.length; i++) {
        const [ia, ib, ic] = faces[i]
        const a = tv[ia], b = tv[ib], c = tv[ic]
        // face normal = (b-a) × (c-a)
        const ex = b[0] - a[0], ey = b[1] - a[1], ez = b[2] - a[2]
        const fx = c[0] - a[0], fy = c[1] - a[1], fz = c[2] - a[2]
        let nx = ey * fz - ez * fy
        let ny = ez * fx - ex * fz
        let nz = ex * fy - ey * fx
        const nl = Math.hypot(nx, ny, nz)
        if (nl === 0) continue
        nx /= nl; ny /= nl; nz /= nl

        // Back-face cull: face center vector dot normal — only draw when normal faces viewer (+z)
        if (nz < -0.05) continue

        // Lambert + ambient
        const lambert = Math.max(0, nx * Lx + ny * Ly + nz * Lz)
        const shade = 0.18 + lambert * 0.95

        const baseColor = tint([nx, ny, nz])
        const r = Math.min(255, baseColor[0] * shade)
        const g = Math.min(255, baseColor[1] * shade)
        const bl = Math.min(255, baseColor[2] * shade)

        // Project
        const projectPt = (p) => {
          const f = persp / (persp + p[2])
          return [cx + p[0] * scale * f, cy + p[1] * scale * f]
        }
        const pa = projectPt(a)
        const pb = projectPt(b)
        const pc = projectPt(c)
        const avgZ = (a[2] + b[2] + c[2]) / 3

        drawList.push({
          pa, pb, pc, avgZ,
          fill: `rgb(${r | 0},${g | 0},${bl | 0})`,
          // edge alpha follows facing angle — front faces get brighter wireframe
          edge: `rgba(244,242,255,${0.08 + Math.max(0, nz) * 0.18})`,
        })
      }

      // Painter's algorithm: far first
      drawList.sort((p, q) => p.avgZ - q.avgZ)

      // Clear
      ctx.clearRect(0, 0, cssW, cssH)

      // Soft glow background
      const grad = ctx.createRadialGradient(cx, cy, scale * 0.2, cx, cy, scale * 1.8)
      grad.addColorStop(0, 'rgba(124,91,255,0.12)')
      grad.addColorStop(0.6, 'rgba(91,228,255,0.04)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, cssW, cssH)

      ctx.lineJoin = 'round'
      ctx.lineWidth = 0.6

      for (let i = 0; i < drawList.length; i++) {
        const d = drawList[i]
        ctx.beginPath()
        ctx.moveTo(d.pa[0], d.pa[1])
        ctx.lineTo(d.pb[0], d.pb[1])
        ctx.lineTo(d.pc[0], d.pc[1])
        ctx.closePath()
        ctx.fillStyle = d.fill
        ctx.fill()
        ctx.strokeStyle = d.edge
        ctx.stroke()
      }
    }

    const tick = () => {
      draw()
      if (visible && !reduceMotion) raf = requestAnimationFrame(tick)
    }

    // -- Pointer parallax ---------------------------------------------------
    // Pointer position drives an additive tilt offset on top of the auto-spin.
    const onPointer = (e) => {
      const rect = wrap.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      targetOffsetX = px * 1.1
      targetOffsetY = py * 0.8
    }
    const onLeave = () => {
      targetOffsetX = 0
      targetOffsetY = 0
    }
    window.addEventListener('pointermove', onPointer)
    wrap.addEventListener('pointerleave', onLeave)

    // -- Visibility / resize ------------------------------------------------
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0]
        visible = !!e?.isIntersecting
        if (visible && !reduceMotion && !raf) {
          last = performance.now()
          raf = requestAnimationFrame(tick)
        } else if (!visible && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0.05 },
    )
    io.observe(wrap)

    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(wrap)

    // Kick off
    if (reduceMotion) {
      draw()
    } else {
      raf = requestAnimationFrame(tick)
    }

    return () => {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      wrap.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className={`relative mx-auto ${className}`}
      style={{ width: '100%', maxWidth: size, aspectRatio: '1 / 1' }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
