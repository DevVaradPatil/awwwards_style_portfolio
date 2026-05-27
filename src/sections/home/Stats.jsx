import Container from '@/components/system/Container.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import Counter from '@/components/primitives/Counter.jsx'
import { stats } from '@/data/socials.js'

export default function Stats() {
  return (
    <section className="relative border-y border-(--color-stroke) py-24">
      <Container className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.id} delay={i * 0.05}>
            <div className="flex flex-col gap-3">
              <Counter
                value={s.value}
                suffix={s.suffix}
                className="font-display text-(length:--fs-display) leading-none text-(--color-ink-100)"
              />
              <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-60)">
                {s.label}
              </p>
            </div>
          </Reveal>
        ))}
      </Container>
    </section>
  )
}
