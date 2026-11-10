import { useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * ElasticText — the site's signature type. Each letter of a variable font
 * (Anybody: wdth 50–150, wght 100–900) stretches wider and heavier as the
 * pointer comes near, then relaxes. With no pointer nearby a slow, wandering
 * focus point keeps the line breathing (`idle="wave"`), or it settles flat
 * (`idle="rest"`).
 *
 * Performance model — one rAF loop shared by every instance:
 *  - Only instances on screen (IntersectionObserver) are read or written.
 *  - Per frame: ONE getBoundingClientRect per instance (all reads first), then
 *    CSS-variable writes per letter (all writes after) — no layout thrash.
 *  - Letter positions are cached relative to the row and re-measured only on
 *    word change, window resize and font load. Never via ResizeObserver: the
 *    row's own width changes every frame, which would re-measure forever.
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

  // Re-measure whenever the letters change (mount + every word swap).
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
  // Reads first…
  instances.forEach((inst) => {
    if (!inst.visible || !inst.chars.length) return
    inst.rect = inst.el.getBoundingClientRect()
    live.push(inst)
  })
  // …then writes.
  live.forEach((inst) => inst.update(now))
  if (live.length) raf = requestAnimationFrame(tick)
}

function createInstance(el) {
  const inst = {
    el,
    visible: false,
    rect: null,
    chars: [], // { node, x, y, w, g }
    fontPx: 16,
    seed: Math.random() * 100,
    opts: { idle: 'wave', reach: 1.6, width: [60, 150], weight: [300, 900] },

    measure() {
      const base = el.getBoundingClientRect()
      const nodes = el.querySelectorAll('.elastic-char:not(.elastic-char--space)')
      const { width, weight } = inst.opts
      inst.fontPx = parseFloat(getComputedStyle(el).fontSize) || 16
      inst.chars = [...nodes].map((node, i) => {
        const r = node.getBoundingClientRect()
        const prev = inst.chars[i]
        return {
          node,
          x: r.left - base.left + r.width / 2,
          y: r.top - base.top + r.height / 2,
          w: prev?.node === node ? prev.w : width[0],
          g: prev?.node === node ? prev.g : weight[0],
        }
      })
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
      for (let i = 0; i < inst.chars.length; i++) {
        const c = inst.chars[i]
        const dx = c.x - fx
        const dy = c.y - fy
        const f = strength * Math.exp(-(dx * dx + dy * dy) / R2)
        const tw = width[0] + (width[1] - width[0]) * f
        const tg = weight[0] + (weight[1] - weight[0]) * f
        const nw = c.w + (tw - c.w) * EASE
        const ng = c.g + (tg - c.g) * EASE
        if (Math.abs(nw - c.w) > 0.05 || Math.abs(ng - c.g) > 0.3) {
          c.w = nw
          c.g = ng
          c.node.style.setProperty('--w', nw.toFixed(1))
          c.node.style.setProperty('--g', ng.toFixed(0))
        }
      }
    },
  }
  return inst
}
