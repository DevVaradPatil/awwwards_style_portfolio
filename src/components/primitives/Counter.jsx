import { useEffect, useRef } from 'react'

/**
 * Counter — animates from 0 → value once on view.
 * Imperative DOM writes, no state.
 */
export default function Counter({
  value = 0,
  duration = 1800,
  suffix = '',
  prefix = '',
  className = '',
}) {
  const ref = useRef(null)
  const playedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ease = (t) => 1 - Math.pow(1 - t, 3)

    const play = () => {
      if (playedRef.current) return
      playedRef.current = true
      const start = performance.now()
      const target = value

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1)
        const v = Math.round(target * ease(t))
        el.textContent = `${prefix}${v}${suffix}`
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            play()
            io.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value, duration, suffix, prefix])

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}
