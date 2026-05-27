import Container from '@/components/system/Container.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import Marquee from '@/components/primitives/Marquee.jsx'
import { skillGroups } from '@/data/skills.js'
import { techLogos } from '@/data/techLogos.js'

export default function SkillsCloud() {
  return (
    <section className="relative overflow-hidden border-y border-(--color-stroke) bg-(--color-raise)/30 py-20 md:py-28 lg:py-40">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
              03 · Stack
            </p>
            <h2 className="mt-6 font-display text-(length:--fs-h1)">
              Tools of the <span className="brand-gradient-text">trade.</span>
            </h2>
          </div>
          <p className="max-w-md text-(--color-ink-60)">
            Production-tested across web, mobile, cloud, and AI workflows.
          </p>
        </div>

        <div className="mt-14 space-y-10">
          {skillGroups.map((group, gi) => (
            <Reveal key={group.id} delay={gi * 0.05}>
              <div className="flex flex-col gap-4 border-t border-(--color-stroke) pt-6 md:flex-row md:items-baseline md:gap-10">
                <p className="w-40 shrink-0 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-(--radius-pill) border border-(--color-stroke-strong) bg-(--color-elev) px-4 py-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.2em] text-(--color-ink-100) transition-colors hover:border-(--color-cyan) hover:text-(--color-cyan)"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>

      <div className="mt-20">
        <Marquee speed={45} gap={64}>
          {techLogos.map((t, i) => (
            <span
              key={`${t.name}-${i}`}
              className="flex items-center gap-3 opacity-70 transition-opacity hover:opacity-100"
            >
              <img
                src={t.src}
                alt={`${t.name} logo`}
                width={36}
                height={36}
                loading="lazy"
                decoding="async"
                className="h-9 w-9 object-contain"
              />
              <span className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-60)">
                {t.name}
              </span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
