import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Reveal({
  as: Tag = 'div',
  children,
  delay = 0,
  y = 20,
  duration = 1.1,
  once = true,
  className = '',
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    gsap.set(el, { opacity: 0, y })

    const trig = ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: 'power4.out',
          overwrite: 'auto',
        })
      },
    })

    return () => trig.kill()
  }, [delay, duration, once, y])

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
