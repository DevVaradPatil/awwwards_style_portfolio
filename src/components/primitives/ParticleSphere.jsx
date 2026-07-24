import { useEffect, useRef } from 'react'

/**
 * ParticleSphere — a rotating constellation globe on Canvas2D.
 *
 * No three.js, no WebGL, no dependency. ~5kB of code, trivially 60fps.
 *
 * What it does:
 *   - Distributes N points evenly on a sphere (Fibonacci lattice).
 *   - Precomputes each point's nearest neighbours once → a fixed "wire" mesh.
 *   - True 3D rotation (Y auto-spin + X wobble) + perspective projection, so
 *     front points are larger/brighter than back ones — a real depth read.
 *   - Aurora tint (violet → iris → cyan) mapped across the surface.
 *   - Additive ('lighter') blending so dense/overlapping points bloom into a
 *     glowing core, plus a soft radial backglow.
 *   - Per-point shimmer + cursor parallax tilt → it feels alive and responsive.
 *   - Pauses when scrolled offscreen (perf), dpr capped at 2.
 *
 * Deliberately NOT gated on prefers-reduced-motion: the owner browses with it
 * on, and gating motion there froze the previous hero element to a dead frame.
 * The motion here is slow and non-flashing, which is the spirit of that setting.
 */
export default function ParticleSphere({ size = 420, count = 280, className = '' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // -- Build the point sphere (Fibonacci lattice → even coverage) ----------
    const N = count
    const golden = Math.PI * (3 - Math.sqrt(5))
    const pts = []
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = i * golden
      pts.push([Math.cos(theta) * r, y, Math.sin(theta) * r])
      // stable per-point shimmer phase
      pts[i].phase = (i * 12.9898) % (Math.PI * 2)
    }

    // -- Precompute a sparse neighbour mesh (done once; topology is static) ---
    const edges = []
    const seen = new Set()
    const K = 3
    for (let i = 0; i < N; i++) {
      const a = pts[i]
      const near = []
      for (let j = 0; j < N; j++) {
        if (j === i) continue
        const b = pts[j]
        const dx = a[0] - b[0]
        const dy = a[1] - b[1]
        const dz = a[2] - b[2]
        near.push([dx * dx + dy * dy + dz * dz, j])
      }
      near.sort((p, q) => p[0] - q[0])
      for (let k = 0; k < K; k++) {
        const j = near[k][1]
        const key = i < j ? i * N + j : j * N + i
        if (!seen.has(key)) {
          seen.add(key)
          edges.push([i, j])
        }
      }
    }

    // -- Aurora palette ------------------------------------------------------
    const cViolet = [124, 91, 255] // #7c5bff
    const cIris = [176, 123, 255] //  #b07bff
    const cCyan = [91, 228, 255] //   #5be4ff
    const mix = (a, b, t) => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ]
    // colour per point, precomputed from its resting position (violet↓ → cyan↑,
    // nudged toward iris by x). Rotation changes depth/brightness, not hue.
    const colors = pts.map(([x, y]) => {
      const base = mix(cViolet, cCyan, (y + 1) * 0.5)
      return mix(base, cIris, (x + 1) * 0.5 * 0.35)
    })

    // -- Sizing --------------------------------------------------------------
    let cssW = 1
    let cssH = 1
    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      cssW = Math.max(1, Math.round(rect.width))
      cssH = Math.max(1, Math.round(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = cssW * dpr
      canvas.height = cssH * dpr
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    // -- Animation state -----------------------------------------------------
    let spinY = 0.4
    let spinX = -0.25
    let offX = 0
    let offY = 0
    let targetOffX = 0
    let targetOffY = 0
    let auto = 0
    let last = performance.now()
    let visible = true
    let raf = 0

    const persp = 3.2
    // reusable projected buffers
    const sx = new Float32Array(N)
    const sy = new Float32Array(N)
    const depth = new Float32Array(N) // 0 (back) → 1 (front)
    const scaleF = new Float32Array(N)

    const draw = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      auto += dt
      spinY += dt * 0.32 // ~18°/s — an unhurried rotation
      spinX = -0.25 + Math.sin(auto * 0.45) * 0.16
      offX += (targetOffX - offX) * Math.min(1, dt * 4)
      offY += (targetOffY - offY) * Math.min(1, dt * 4)

      const rotX = spinX + offY
      const rotY = spinY + offX
      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)

      const cx = cssW / 2
      const cy = cssH / 2
      const scale = Math.min(cssW, cssH) * 0.4

      for (let i = 0; i < N; i++) {
        const v = pts[i]
        const x1 = v[0] * cosY + v[2] * sinY
        const z1 = -v[0] * sinY + v[2] * cosY
        const y2 = v[1] * cosX - z1 * sinX
        const z2 = v[1] * sinX + z1 * cosX
        const f = persp / (persp - z2)
        sx[i] = cx + x1 * scale * f
        sy[i] = cy + y2 * scale * f
        depth[i] = (z2 + 1) * 0.5
        scaleF[i] = f
      }

      ctx.clearRect(0, 0, cssW, cssH)

      // Soft radial backglow.
      const grad = ctx.createRadialGradient(cx, cy, scale * 0.15, cx, cy, scale * 1.7)
      grad.addColorStop(0, 'rgba(124,91,255,0.14)')
      grad.addColorStop(0.55, 'rgba(91,228,255,0.05)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, cssW, cssH)

      // Additive blending: overlapping points/lines bloom into a glowing core.
      ctx.globalCompositeOperation = 'lighter'

      // Wire mesh — faint, fades with depth.
      ctx.lineWidth = 0.7
      for (let e = 0; e < edges.length; e++) {
        const i = edges[e][0]
        const j = edges[e][1]
        const dAvg = (depth[i] + depth[j]) * 0.5
        const alpha = dAvg * dAvg * 0.16
        if (alpha < 0.008) continue
        const c = colors[i]
        ctx.strokeStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`
        ctx.beginPath()
        ctx.moveTo(sx[i], sy[i])
        ctx.lineTo(sx[j], sy[j])
        ctx.stroke()
      }

      // Points — size & brightness scale with depth; gentle per-point shimmer.
      for (let i = 0; i < N; i++) {
        const d = depth[i]
        const shimmer = 0.78 + 0.22 * Math.sin(auto * 1.6 + pts[i].phase)
        const alpha = (0.1 + d * 0.62) * shimmer
        const rad = (0.7 + d * 1.9) * scaleF[i]
        const c = colors[i]
        ctx.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`
        ctx.beginPath()
        ctx.arc(sx[i], sy[i], rad, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'
    }

    const tick = () => {
      draw()
      if (visible) raf = requestAnimationFrame(tick)
    }

    // -- Pointer parallax ----------------------------------------------------
    const onPointer = (e) => {
      if (!visible) return
      const rect = wrap.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      targetOffX = px * 1.0
      targetOffY = py * 0.75
    }
    const onLeave = () => {
      targetOffX = 0
      targetOffY = 0
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    wrap.addEventListener('pointerleave', onLeave)

    // -- Visibility / resize -------------------------------------------------
    const io = new IntersectionObserver(
      (entries) => {
        visible = !!entries[0]?.isIntersecting
        if (visible && !raf) {
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

    // Draw one frame immediately so it's never blank before the loop spins up
    // (and so a paused/hidden tab still shows the composed image).
    draw()
    raf = requestAnimationFrame(tick)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      wrap.removeEventListener('pointerleave', onLeave)
    }
  }, [count])

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
