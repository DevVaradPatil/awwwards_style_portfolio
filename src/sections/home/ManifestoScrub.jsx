import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Container from '@/components/system/Container.jsx'

gsap.registerPlugin(ScrollTrigger)

const MANIFESTO =
  'I build for people who feel pixels and read code. Engineering rigor meets design sensibility — products that load fast, scale clean, and stay alive on the screen. Every interaction earns its weight; every animation respects intent. Ship it polished, then ship it again.'

export default function ManifestoScrub() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return
    const words = track.querySelectorAll('[data-manifesto-word]')
    if (!words.length) return

    // Pin + scrub only on desktop. Pinning fights mobile native scroll (Lenis
    // is off there) and the address-bar resize, so on mobile the words simply
    // render at full opacity (no pin).
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      gsap.set(words, { opacity: 0.12 })
      gsap.to(words, {
        opacity: 1,
        ease: 'none',
        stagger: { each: 1 },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=180%',
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden bg-(--color-void)"
    >
      <Container className="flex min-h-[100svh] flex-col justify-center py-20 md:py-24">
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-30)">
          04 · Manifesto
        </p>
        <p
          ref={trackRef}
          className="mt-10 max-w-5xl font-display text-(length:--fs-h2) leading-[1.15] text-(--color-ink-100)"
        >
          {MANIFESTO.split(' ').map((w, i) => (
            <span
              key={i}
              data-manifesto-word
              className="inline-block pr-[0.25em] will-change-[opacity]"
            >
              {w}
            </span>
          ))}
        </p>
      </Container>
    </section>
  )
}
