import { ArrowRight, Mail } from 'lucide-react'
import Container from '@/components/system/Container.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import ParticleSphere from '@/components/primitives/ParticleSphere.jsx'

export default function Hero() {
  return (
    <section
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-12 md:pt-28 md:pb-16 lg:h-[100svh] lg:min-h-[640px] lg:py-0"
    >
      {/* Background atmosphere */}
      <GradientBlob
        variant="violet"
        size={560}
        blur={140}
        opacity={0.5}
        className="top-[-180px] left-[-160px]"
      />
      <GradientBlob
        variant="cyan"
        size={460}
        blur={140}
        opacity={0.38}
        className="bottom-[-160px] right-[-120px]"
      />

      <Container className="relative grid w-full grid-cols-1 items-center gap-10 sm:gap-14 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        {/* TEXT */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-(--color-stroke-strong) bg-(--color-elev)/60 px-4 py-1.5 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-60) backdrop-blur">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-(--color-lime)" />
            Available for select work · 2026
          </div>

          <h1 className="mt-5 font-display text-(length:--fs-h1) leading-[1.04] md:text-(length:--fs-display)">
            <span className="block text-(--color-ink-100)">
              <SplitText by="char" trigger="mount">Hi, I&apos;m Varad.</SplitText>
            </span>
            <span className="mt-1 block">
              <SplitText
                by="char"
                trigger="mount"
                delay={0.2}
                className="brand-gradient-text"
              >
                Code · Design · Create.
              </SplitText>
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-(length:--fs-body) text-(--color-ink-60)">
            Full-stack developer &amp; AI enthusiast crafting fast, scalable,
            visually engaging products. Currently pursuing
            <span className="text-(--color-ink-100)"> M.Tech in AI for Sustainability at IIT Kanpur</span>.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <MagneticButton variant="solid" to="/work">
              View my work
              <ArrowRight size={16} strokeWidth={2} />
            </MagneticButton>
            <MagneticButton variant="ghost" to="/contact">
              <Mail size={14} strokeWidth={2} />
              Let&apos;s connect
            </MagneticButton>
          </div>

          <div className="mt-8 hidden max-w-md grid-cols-3 gap-6 border-t border-(--color-stroke) pt-5 font-mono text-(length:--fs-xs) uppercase tracking-[0.2em] text-(--color-ink-30) md:grid">
            <div>
              <p className="text-(--color-ink-100)">React · Next</p>
              <p className="mt-1">Frontend</p>
            </div>
            <div>
              <p className="text-(--color-ink-100)">MERN · Cloud</p>
              <p className="mt-1">Full-stack</p>
            </div>
            <div>
              <p className="text-(--color-ink-100)">LLM · NLP</p>
              <p className="mt-1">AI built-in</p>
            </div>
          </div>
        </div>

        {/* ORB */}
        <div className="relative flex items-center justify-center md:order-none">
          <ParticleSphere size={420} className="mx-auto" />
          <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-30)">
            Aurora Compute · v0.1
          </div>
        </div>
      </Container>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-30) md:block">
        <span className="inline-flex items-center gap-2">
          Scroll
          <span className="inline-block h-px w-10 bg-(--color-ink-30)" />
        </span>
      </div>
    </section>
  )
}
