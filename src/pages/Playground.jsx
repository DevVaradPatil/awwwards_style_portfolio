import { useEffect, useRef } from 'react'
import Section from '@/components/system/Section.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import { scrubTimeline } from '@/lib/scrollHelpers.js'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import TiltCard from '@/components/primitives/TiltCard.jsx'
import Marquee from '@/components/primitives/Marquee.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import Counter from '@/components/primitives/Counter.jsx'
import Orb3D from '@/components/primitives/Orb3D.jsx'
import { featuredProjects } from '@/data/projects.js'
import { skillCloud } from '@/data/skills.js'
import { stats } from '@/data/socials.js'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

function Lab({ id, title, kicker, children }) {
  return (
    <section id={id} className="relative border-t border-(--color-stroke) py-20">
      <div className="mb-10">
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.35em] text-(--color-ink-30)">
          {kicker}
        </p>
        <h2 className="mt-3 font-display text-(length:--fs-h2) text-(--color-ink-100)">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

export default function Playground() {
  useDocumentMeta(pageMeta.playground)
  const scrubRef = useRef(null)

  useEffect(() => {
    const el = scrubRef.current
    if (!el) return
    const words = el.querySelectorAll('[data-scrub-word]')
    const tl = scrubTimeline(el, { start: 'top 70%', end: 'bottom 50%', scrub: 0.8 })
    tl.from(words, { opacity: 0.12, stagger: 0.05, ease: 'none' })
    return () => tl.scrollTrigger?.kill()
  }, [])

  return (
    <Section as="div" className="pt-32" containerClassName="relative">
      {/* HEADER */}
      <div className="relative">
        <GradientBlob
          variant="violet"
          size={520}
          className="top-[-120px] right-[-80px]"
          opacity={0.4}
        />
        <GradientBlob
          variant="cyan"
          size={420}
          className="top-[80px] left-[-120px]"
          opacity={0.3}
        />
        <p className="relative font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
          Design System · Aurora Compute v0.1
        </p>
        <h1 className="relative mt-6 font-display text-(length:--fs-h1)">
          <SplitText by="word" trigger="mount">
            Primitives, exercised.
          </SplitText>
        </h1>
        <p className="relative mt-6 max-w-2xl text-(--color-ink-60)">
          Every primitive ships in isolation here. Every page on the site composes
          from these — no bespoke one-offs.
        </p>
      </div>

      {/* SplitText */}
      <Lab id="split" kicker="01 · SplitText" title="Text reveal — by char & word">
        <div className="space-y-6">
          <div className="rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-raise) p-10">
            <SplitText
              as="h3"
              by="char"
              trigger="mount"
              className="font-display text-(length:--fs-h2)"
            >
              Code. Design. Create.
            </SplitText>
          </div>
          <div className="rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-raise) p-10">
            <SplitText
              as="h3"
              by="word"
              trigger="mount"
              className="font-display text-(length:--fs-h3) text-(--color-ink-60)"
            >
              Full-stack developer and AI enthusiast crafting fast, scalable, immersive products.
            </SplitText>
          </div>
        </div>
      </Lab>

      {/* Reveal */}
      <Lab id="reveal" kicker="02 · Reveal" title="Scroll-triggered reveal">
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 0.1, 0.2].map((d, i) => (
            <Reveal
              key={i}
              delay={d}
              className="rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-raise) p-8"
            >
              <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
                Card {i + 1}
              </p>
              <p className="mt-3 text-(--color-ink-100)">
                Fades and rises into view on scroll. Delay staggers between cards.
              </p>
            </Reveal>
          ))}
        </div>
      </Lab>

      {/* MagneticButton */}
      <Lab id="magnetic" kicker="03 · MagneticButton" title="Pointer-tracking CTAs">
        <div className="flex flex-wrap items-center gap-5">
          <MagneticButton variant="solid">Hire me →</MagneticButton>
          <MagneticButton variant="ghost">See work</MagneticButton>
          <MagneticButton variant="outline" href="mailto:varadapatil123@gmail.com">
            Email Varad
          </MagneticButton>
          <MagneticButton variant="solid" to="/contact">
            Contact route
          </MagneticButton>
        </div>
      </Lab>

      {/* TiltCard + featured projects */}
      <Lab id="tilt" kicker="04 · TiltCard" title="3D tilt with glare">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredProjects.map((p) => (
            <TiltCard key={p.slug} className="h-[260px]">
              <div className="flex h-full flex-col justify-between p-6">
                <div>
                  <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-cyan)">
                    {p.tags.join(' · ')}
                  </p>
                  <h3 className="mt-3 font-display text-(length:--fs-h4) text-(--color-ink-100)">
                    {p.title}
                  </h3>
                </div>
                <p className="text-(length:--fs-sm) text-(--color-ink-60)">{p.summary}</p>
              </div>
            </TiltCard>
          ))}
        </div>
      </Lab>

      {/* Marquee */}
      <Lab id="marquee" kicker="05 · Marquee" title="Seamless looping strip">
        <div className="space-y-6">
          <Marquee speed={70} className="border-y border-(--color-stroke) py-6">
            {['CODE', 'DESIGN', 'CREATE', 'SHIP', 'AI', 'WEB', '3D', 'MOBILE'].map((w, i) => (
              <span
                key={i}
                className="font-display text-(length:--fs-h2) text-(--color-ink-100)"
              >
                {w}{' '}
                <span className="inline-block h-2 w-2 translate-y-[-0.4em] rounded-full brand-gradient-surface" />
              </span>
            ))}
          </Marquee>
          <Marquee
            speed={45}
            direction="right"
            className="border-b border-(--color-stroke) py-4"
          >
            {skillCloud.slice(0, 14).map((s) => (
              <span
                key={s.label}
                className="rounded-(--radius-pill) border border-(--color-stroke-strong) bg-(--color-elev) px-5 py-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-60)"
              >
                {s.label}
              </span>
            ))}
          </Marquee>
        </div>
      </Lab>

      {/* GradientBlob */}
      <Lab id="blob" kicker="06 · GradientBlob" title="Decorative aurora glows">
        <div className="grid gap-6 sm:grid-cols-3">
          {['violet', 'iris', 'cyan'].map((v) => (
            <div
              key={v}
              className="relative h-[240px] overflow-hidden rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-raise)"
            >
              <GradientBlob
                variant={v}
                size={320}
                blur={80}
                className="-top-12 -left-12"
              />
              <span className="absolute bottom-4 left-5 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-100)">
                {v}
              </span>
            </div>
          ))}
        </div>
      </Lab>

      {/* Counter */}
      <Lab id="counter" kicker="07 · Counter" title="Animated numeric stats">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.id}
              className="rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-raise) p-8"
            >
              <Counter
                value={s.value}
                suffix={s.suffix}
                className="font-display text-(length:--fs-h1) text-(--color-ink-100) brand-gradient-text"
              />
              <p className="mt-3 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-60)">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Lab>

      {/* Orb3D */}
      <Lab id="orb" kicker="08 · Orb3D" title="Planet-illusion sphere (CSS only)">
        <div className="flex items-center justify-center rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-raise) py-16">
          <Orb3D size={400} />
        </div>
        <p className="mt-6 max-w-2xl font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
          Lighting fixed to viewer · 200% surface texture scrolls 14s loop · ±8° mouse tilt.
        </p>
      </Lab>

      {/* Scroll scrub helper */}
      <Lab id="scrub" kicker="09 · scrubTimeline" title="Scroll-scrubbed text reveal">
        <p
          ref={scrubRef}
          className="max-w-4xl font-display text-(length:--fs-h2) leading-[1.05] text-(--color-ink-100)"
        >
          {'Engineering rigor, design sensibility, AI awareness — shipped as one product.'
            .split(' ')
            .map((w, i) => (
              <span key={i} data-scrub-word className="inline-block pr-[0.25em]">
                {w}
              </span>
            ))}
        </p>
      </Lab>
    </Section>
  )
}
