import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * SplitText — splits children into word + char spans, animates on view.
 * Children must be a plain string.
 */
export default function SplitText({
  children,
  as: Tag = 'span',
  className = '',
  by = 'char', // 'char' | 'word'
  stagger,
  duration = 1.1,
  y = '1em',
  delay = 0,
  trigger = 'view', // 'view' | 'mount'
  once = true,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const targets = el.querySelectorAll('[data-split-unit]')
    if (!targets.length) return

    const resolvedStagger =
      typeof stagger === 'number' ? stagger : by === 'word' ? 0.05 : 0.018

    gsap.set(targets, { yPercent: 100, opacity: 0 })

    const play = () => {
      gsap.to(targets, {
        yPercent: 0,
        opacity: 1,
        duration,
        ease: 'power4.out',
        stagger: resolvedStagger,
        delay,
        overwrite: 'auto',
      })
    }

    if (trigger === 'mount') {
      play()
      return
    }

    const trig = ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once,
      onEnter: play,
    })

    return () => trig.kill()
  }, [by, stagger, duration, delay, trigger, once, y])

  if (typeof children !== 'string') {
    return <Tag ref={ref} className={className}>{children}</Tag>
  }

  const words = children.split(/(\s+)/)

  return (
    <Tag ref={ref} className={`inline-block ${className}`}>
      {words.map((word, wi) => {
        if (/^\s+$/.test(word)) return <span key={`s-${wi}`}>{word}</span>
        if (by === 'word') {
          return (
            <span
              key={`w-${wi}`}
              className="inline-block overflow-hidden align-bottom"
              style={{ paddingRight: '0.02em' }}
            >
              <span data-split-unit className="inline-block will-change-transform">
                {word}
              </span>
            </span>
          )
        }
        // char split — keep word as inline unit to prevent line breaks mid-word
        return (
          <span key={`w-${wi}`} className="inline-block" style={{ whiteSpace: 'nowrap' }}>
            {Array.from(word).map((ch, ci) => (
              <span
                key={`c-${wi}-${ci}`}
                className="inline-block overflow-hidden align-bottom"
              >
                <span data-split-unit className="inline-block will-change-transform">
                  {ch}
                </span>
              </span>
            ))}
          </span>
        )
      })}
    </Tag>
  )
}
