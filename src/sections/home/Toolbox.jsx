import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import { skillGroups } from '@/data/skills.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * Toolbox — the stack on the bone room. Each group is one long line of type
 * that slides sideways as you scroll (alternating directions), and the faster
 * you scroll the wider and heavier every letter gets. Scroll speed is written
 * to ONE CSS variable on the section (--v, 0–1); the type reads it.
 */
export default function Toolbox() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const rows = section.querySelectorAll('[data-toolbox-row]')
    const proxy = { v: 0 }
    const write = () => section.style.setProperty('--v', proxy.v.toFixed(3))

    const ctx = gsap.context(() => {
      rows.forEach((row, i) => {
        gsap.fromTo(
          row,
          { xPercent: i % 2 ? -18 : 0 },
          {
            xPercent: i % 2 ? 0 : -18,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.4 },
          },
        )
      })
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const target = Math.min(1, Math.abs(self.getVelocity()) / 2800)
          gsap.to(proxy, {
            v: target,
            duration: 0.25,
            overwrite: true,
            onUpdate: write,
            onComplete: () => gsap.to(proxy, { v: 0, duration: 0.9, ease: 'power2.out', onUpdate: write }),
          })
        },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      aria-label="Toolbox"
      className="room-bone relative overflow-hidden py-24 md:py-32"
      style={{ '--v': 0 }}
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14">
        <ElasticText
          as="h2"
          text="TOOLBOX"
          label="Toolbox"
          reach={1.4}
          width={[62, 150]}
          weight={[350, 900]}
          className="text-[clamp(3.5rem,12vw,11rem)] text-(--color-type)"
        />
        <p className="mt-4 max-w-md text-(--color-type-muted)">
          What I reach for, from the first sketch to the deploy. Scroll faster and watch it stretch.
        </p>
      </div>

      {/* Flex columns, not grid: a grid track would grow to the long nowrap line
          and push the centered labels off-screen. */}
      <div className="mt-14 flex flex-col gap-8 md:mt-20 md:gap-10">
        {skillGroups.map((g) => {
          // Repeat short groups so every line runs past both screen edges.
          const items = g.items.length < 8 ? [...g.items, ...g.items, ...g.items] : [...g.items, ...g.items]
          return (
            <div key={g.id} className="flex flex-col gap-2">
              <h3 className="mx-auto w-full max-w-[1400px] px-6 font-sans text-(length:--fs-sm) font-semibold text-(--color-type-muted) md:px-10 lg:px-14">
                {g.label}
              </h3>
              <p
                data-toolbox-row
                className="toolbox-row whitespace-nowrap font-display text-[clamp(2rem,5.2vw,4.75rem)] leading-none text-(--color-type)"
              >
                <span className="sr-only">{g.items.join(', ')}</span>
                {items.map((item, i) => (
                  <span key={i} aria-hidden="true">
                    {item}
                    <span className="mx-[0.35em] text-(--color-pink)">/</span>
                  </span>
                ))}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
