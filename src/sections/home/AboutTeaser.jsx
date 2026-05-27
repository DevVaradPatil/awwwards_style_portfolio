import { ArrowUpRight, Layout, Layers, Smartphone, Sparkles } from 'lucide-react'
import Container from '@/components/system/Container.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import { principles } from '@/data/socials.js'

const ICONS = { Layout, Layers, Smartphone, Sparkles }

export default function AboutTeaser() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
      <GradientBlob
        variant="iris"
        size={520}
        blur={140}
        opacity={0.3}
        className="top-1/2 left-[-200px] -translate-y-1/2"
      />

      <Container className="relative grid grid-cols-1 gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
            01 · Introduction
          </p>
          <h2 className="mt-6 font-display text-(length:--fs-h1)">
            <SplitText by="word">A developer who </SplitText>
            <SplitText by="word" className="brand-gradient-text">
              blends engineering with design.
            </SplitText>
          </h2>
        </div>

        <div className="space-y-10">
          <Reveal>
            <p className="text-(length:--fs-h4) text-(--color-ink-100)">
              I build scalable, user-friendly web &amp; Android applications using
              React, Next.js, MERN, React Native and native Android — and integrate
              AI to make products smarter.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-(--color-ink-60)">
              From freelance production sites to research at IIT Kanpur, I love
              turning ideas into impactful, real-world products that feel as good
              as they perform.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {principles.map((p, i) => {
              const Icon = ICONS[p.icon] ?? Sparkles
              return (
                <Reveal
                  key={p.id}
                  delay={0.1 + i * 0.06}
                  className="group relative overflow-hidden rounded-(--radius-md) border border-(--color-stroke) bg-(--color-raise) p-5 transition-all duration-500 hover:-translate-y-1 hover:border-(--color-stroke-strong) hover:bg-(--color-elev)"
                >
                  {/* hover gradient wash */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        'radial-gradient(ellipse at top right, rgba(124,91,255,0.18), transparent 60%)',
                    }}
                  />
                  <div className="relative flex items-start gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-(--radius-md) border border-(--color-stroke-strong) bg-(--color-void) text-(--color-cyan) transition-colors duration-500 group-hover:border-(--color-cyan) group-hover:text-(--color-violet)">
                      <Icon size={20} strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="font-display text-(length:--fs-h4) text-(--color-ink-100)">
                        {p.title}
                      </p>
                      <p className="mt-2 text-(length:--fs-sm) text-(--color-ink-60)">
                        {p.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>

          <MagneticButton variant="outline" to="/about">
            More about me
            <ArrowUpRight size={16} strokeWidth={2} />
          </MagneticButton>
        </div>
      </Container>
    </section>
  )
}
