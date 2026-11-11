import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * ElasticText — the site's signature type. Each letter of a variable font
 * (Anybody: wdth 50–150, wght 100–900) stretches wider and heavier as the
 * pointer comes near, then relaxes. With no pointer nearby a slow, wandering
 * focus point keeps the line breathing (`idle="wave"`), or it settles flat
 * (`idle="rest"`).
 *
 * Layout model — no layout shift:
 *  - Letters are absolutely positioned and placed with the CSS `translate`
 *    property. In normal flow, every width change would push the neighbours
 *    sideways and Chrome would count it as layout shift (CLS).
 *  - Widths are read, not estimated: the font's axes aren't linear enough to
 *    interpolate (measured: up to 7px off on a 300px "W").
 *  - The row keeps its resting width as `min-width`, so the element still
 *    sizes itself in flex/inline contexts (the header logo).
 *
 * Performance model — one rAF loop shared by every instance, four phases:
 *  1. read each instance's rect, 2. write every letter's axis variables,
 *  3. read every changed letter's width (ONE layout for the whole page — the
 *  same layout the browser would run for this frame anyway), 4. write
 *  `translate` (compositor-only, dirties no layout). Only on-screen instances
 *  (IntersectionObserver) take part.
 *  - Re-measured only on word change, window resize and font load. Never via
 *    ResizeObserver: the letters change every frame.
 *
 * Accessibility: the real text sits in an sr-only span; the animated letters
 * are aria-hidden. Not gated on prefers-reduced-motion (owner's choice — see
 * CLAUDE.md).
 *
 * @param {object} p
 * @param {string} [p.as='span']  Element tag (h1, h2, p, span…).
 * @param {string} [p.text]       Static text. Ignored when `words` is given.
 * @param {string[]} [p.words]    Cycles through these, squash-and-pop.
 * @param {number} [p.interval=2800] ms between words.
 * @param {string} [p.label]      Accessible text (defaults to text / words).
 * @param {'wave'|'rest'} [p.idle='wave']
 * @param {number} [p.reach=1.6]  Influence radius, in multiples of font size.
 * @param {[number, number]} [p.width=[60, 150]]  wdth at rest → at peak.
 * @param {[number, number]} [p.weight=[300, 900]] wght at rest → at peak.
 */
export default function ElasticText({
  as: Tag = 'span',
  text = '',
  words,
  interval = 2800,
  label,
  idle = 'wave',
  reach = 1.6,
  width = [60, 150],
  weight = [300, 900],
  className = '',
  ...rest
}) {
  const ref = useRef(null)
  const instRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [entering, setEntering] = useState(false)
  const current = words?.length ? words[index % words.length] : text
  const accessible = label ?? (words?.length ? words.join(', ') : text)

  // Register with the shared loop for the component's lifetime.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const inst = createInstance(el)
    instRef.current = inst
    register(inst)
    return () => unregister(inst)
  }, [])

  // Options can change between renders; the loop reads them from the instance.
  useLayoutEffect(() => {
    const inst = instRef.current
    if (!inst) return
    inst.opts = { idle, reach, width, weight }
  })

  // Re-measure whenever the letters change (mount + every word swap). This
  // also places them, before paint, so they never flash stacked at x = 0.
  useLayoutEffect(() => {
    instRef.current?.measure()
  }, [current])

  // Word cycling: squash the current letters out, then render the next word.
  // Keyed on the count, not the array, so a parent passing a fresh array
  // literal on every render doesn't restart the timer.
  const wordCount = words?.length ?? 0
  useEffect(() => {
    if (wordCount < 2) return
    let swapTimer = 0
    const id = setInterval(() => {
      const chars = ref.current?.querySelectorAll('.elastic-char') ?? []
      chars.forEach((c, i) => {
        c.style.transitionDelay = `${i * 18}ms`
        c.classList.add('elastic-char--out')
      })
      swapTimer = window.setTimeout(() => {
        setEntering(true)
        setIndex((i) => (i + 1) % wordCount)
      }, 280 + chars.length * 18)
    }, interval)
    return () => {
      clearInterval(id)
      clearTimeout(swapTimer)
    }
  }, [wordCount, interval])

  return (
    <Tag ref={ref} className={`elastic ${className}`} {...rest}>
      <span className="sr-only">{accessible}</span>
      <span aria-hidden="true" className="elastic-row" key={current + index}>
        {Array.from(current).map((ch, i) =>
          ch === ' ' ? (
            <span key={i} className="elastic-char elastic-char--space" />
          ) : (
            <span
              key={i}
              className={`elastic-char${entering ? ' elastic-char--in' : ''}`}
              style={{
                '--w': width[0],
                '--g': weight[0],
                ...(entering ? { animationDelay: `${i * 30}ms` } : null),
              }}
            >
              {ch}
            </span>
          ),
        )}
      </span>
    </Tag>
  )
}

/* ------------------------------------------------------------------------ */
/* Shared loop                                                              */
/* ------------------------------------------------------------------------ */

const instances = new Set()
let raf = 0
let observer = null
let listening = false
const pointer = { x: -1e5, y: -1e5, at: -1e9 }
const POINTER_FRESH_MS = 1400 // pointer counts as "present" this long after it last moved
const EASE = 0.14

function onPointerMove(e) {
  pointer.x = e.clientX
  pointer.y = e.clientY
  pointer.at = performance.now()
  wake()
}

function onResize() {
  instances.forEach((inst) => inst.measure())
}

function register(inst) {
  instances.add(inst)
  if (!observer && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = [...instances].find((i) => i.el === entry.target)
          if (target) target.visible = entry.isIntersecting
        })
        wake()
      },
      { rootMargin: '120px' },
    )
  }
  if (observer) observer.observe(inst.el)
  else inst.visible = true
  if (!listening) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    document.fonts?.ready.then(onResize)
    listening = true
  }
  wake()
}

function unregister(inst) {
  instances.delete(inst)
  observer?.unobserve(inst.el)
  if (!instances.size && listening) {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('resize', onResize)
    listening = false
  }
}

function wake() {
  if (!raf && instances.size) raf = requestAnimationFrame(tick)
}

function tick(now) {
  raf = 0
  const live = []
  // 1. Reads.
  instances.forEach((inst) => {
    if (!inst.visible || !inst.chars.length) return
    inst.rect = inst.el.getBoundingClientRect()
    live.push(inst)
  })
  // 2. Axis writes.
  const moved = live.filter((inst) => inst.update(now))
  // 3. Width reads (one layout flush), then 4. translate writes.
  const widths = moved.map((inst) => inst.readWidths())
  moved.forEach((inst, i) => inst.place(widths[i]))
  if (live.length) raf = requestAnimationFrame(tick)
}

function createInstance(el) {
  const inst = {
    el,
    visible: false,
    rect: null,
    items: [], // every row child: { node, space, w, g, x }
    chars: [], // letters only (no spaces): { item, x, y }
    rowWidth: 0,
    align: 'start',
    fontPx: 16,
    seed: Math.random() * 100,
    opts: { idle: 'wave', reach: 1.6, width: [60, 150], weight: [300, 900] },

    readWidths() {
      return inst.items.map((it) => it.node.getBoundingClientRect().width)
    },

    /** Lay the letters out side by side, given their current widths. */
    place(widths) {
      const total = widths.reduce((s, v) => s + v, 0)
      let x =
        inst.align === 'center'
          ? (inst.rowWidth - total) / 2
          : inst.align === 'right' || inst.align === 'end'
            ? inst.rowWidth - total
            : 0
      inst.items.forEach((item, i) => {
        if (Math.abs(x - (item.x ?? NaN)) > 0.05 || item.x === undefined) {
          item.x = x
          item.node.style.translate = `${x.toFixed(2)}px 0`
        }
        x += widths[i]
      })
    },

    measure() {
      const row = el.querySelector('.elastic-row')
      const nodes = row ? [...row.children] : []
      const { width, weight } = inst.opts
      const cs = getComputedStyle(el)
      inst.fontPx = parseFloat(cs.fontSize) || 16
      inst.align = cs.textAlign
      const prev = new Map(inst.items.map((it) => [it.node, it]))

      inst.items = nodes.map((node) => {
        const old = prev.get(node)
        return {
          node,
          space: node.classList.contains('elastic-char--space'),
          w: old ? old.w : width[0],
          g: old ? old.g : weight[0],
        }
      })
      const setAxes = (rest) =>
        inst.items.forEach((it) => {
          if (it.space) return
          it.node.style.setProperty('--w', rest ? width[0] : it.w.toFixed(1))
          it.node.style.setProperty('--g', rest ? weight[0] : it.g.toFixed(0))
        })

      // Resting width becomes the row's min-width, so the row still sizes
      // itself in flex/inline contexts now that its letters are absolute.
      setAxes(true)
      const restWidths = inst.readWidths()
      const restTotal = restWidths.reduce((s, v) => s + v, 0)
      if (row) row.style.minWidth = `${restTotal.toFixed(1)}px`
      inst.rowWidth = row ? row.clientWidth : 0

      // Pointer targets: each letter's resting centre, relative to the element.
      inst.place(restWidths)
      const base = el.getBoundingClientRect()
      const rowTop = row ? row.getBoundingClientRect().top - base.top : 0
      const half = (row ? row.clientHeight : inst.fontPx) / 2
      inst.chars = inst.items
        .map((item, i) => ({ item, x: item.x + restWidths[i] / 2, y: rowTop + half }))
        .filter((c) => !c.item.space)

      // Back to the current stretch, placed before paint.
      setAxes(false)
      inst.place(inst.readWidths())
      wake()
    },

    update(now) {
      const { idle, reach, width, weight } = inst.opts
      const r = inst.rect
      const R = reach * inst.fontPx
      const near =
        now - pointer.at < POINTER_FRESH_MS &&
        pointer.x > r.left - R &&
        pointer.x < r.right + R &&
        pointer.y > r.top - R &&
        pointer.y < r.bottom + R

      let fx = 0
      let fy = 0
      let strength = 1
      if (near) {
        fx = pointer.x - r.left
        fy = pointer.y - r.top
      } else if (idle === 'wave') {
        const t = now / 1000 + inst.seed
        fx = r.width * (0.5 + 0.44 * Math.sin(t * 0.62))
        fy = r.height * (0.5 + 0.35 * Math.sin(t * 1.07))
      } else {
        strength = 0
      }

      const R2 = R * R
      let moved = false
      for (let i = 0; i < inst.chars.length; i++) {
        const c = inst.chars[i]
        const it = c.item
        const dx = c.x - fx
        const dy = c.y - fy
        const f = strength * Math.exp(-(dx * dx + dy * dy) / R2)
        const tw = width[0] + (width[1] - width[0]) * f
        const tg = weight[0] + (weight[1] - weight[0]) * f
        const nw = it.w + (tw - it.w) * EASE
        const ng = it.g + (tg - it.g) * EASE
        if (Math.abs(nw - it.w) > 0.05 || Math.abs(ng - it.g) > 0.3) {
          it.w = nw
          it.g = ng
          it.node.style.setProperty('--w', nw.toFixed(1))
          it.node.style.setProperty('--g', ng.toFixed(0))
          moved = true
        }
      }
      return moved
    },
  }
  return inst
}
