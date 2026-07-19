import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '@/components/system/Container.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import TiltCard from '@/components/primitives/TiltCard.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import { featuredProjects } from '@/data/projects.js'

export default function FeaturedWork() {
  return (
    <section className="relative py-20 md:py-28 lg:py-40">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
              02 · Selected Work
            </p>
            <h2 className="mt-6 font-display text-(length:--fs-h1)">
              Projects, <span className="brand-gradient-text">shipped.</span>
            </h2>
          </div>
          <p className="max-w-md text-(--color-ink-60)">
            A mix of AI products, full-stack apps, e-commerce, dev tools, and
            immersive 3D experiences.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {featuredProjects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <Link
                to={`/work/${p.slug}`}
                aria-label={`Open case study: ${p.title}`}
                className="group block h-full"
              >
                <TiltCard max={6} className="h-full">
                  <article className="flex h-full flex-col gap-5 p-5">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-(--radius-md) bg-(--color-void)">
                      <img
                        src={p.image}
                        alt={`${p.title} — preview`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-(--color-void)/70 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {p.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-(--radius-pill) border border-(--color-stroke-strong) bg-(--color-void)/60 px-3 py-1 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-100) backdrop-blur"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-6 px-2 pb-2">
                      <div>
                        <h3 className="font-display text-(length:--fs-h3) text-(--color-ink-100)">
                          {p.title}
                        </h3>
                        <p className="mt-2 max-w-md text-(length:--fs-sm) text-(--color-ink-60)">
                          {p.summary}
                        </p>
                      </div>
                      <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-stroke-strong) text-(--color-ink-100) transition-colors group-hover:border-(--color-cyan) group-hover:text-(--color-cyan)">
                        <ArrowUpRight size={16} strokeWidth={2} />
                      </span>
                    </div>
                  </article>
                </TiltCard>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <MagneticButton variant="outline" to="/work">
            All projects
            <ArrowUpRight size={16} strokeWidth={2} />
          </MagneticButton>
        </div>
      </Container>
    </section>
  )
}
