import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import Container from '@/components/system/Container.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import { projects, projectTags } from '@/data/projects.js'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

const FILTERS = ['All', ...projectTags]

export default function Work() {
  useDocumentMeta(pageMeta.work)
  const [filter, setFilter] = useState('All')

  const visible = useMemo(() => {
    if (filter === 'All') return projects
    return projects.filter((p) => p.tags.includes(filter))
  }, [filter])

  return (
    <>
      {/* HEADER */}
      <section className="relative overflow-hidden pt-40 pb-16">
        <GradientBlob
          variant="iris"
          size={620}
          blur={160}
          opacity={0.35}
          className="top-[-180px] right-[-160px]"
        />
        <Container className="relative">
          <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
            Selected work · 2022 → 2026
          </p>
          <h1 className="mt-6 font-display text-(length:--fs-display) leading-[1.02]">
            <SplitText by="word" trigger="mount">Things I&apos;ve </SplitText>
            <SplitText by="word" trigger="mount" delay={0.15} className="brand-gradient-text">
              built &amp; shipped.
            </SplitText>
          </h1>
          <p className="mt-8 max-w-2xl text-(length:--fs-body) text-(--color-ink-60)">
            A range of AI products, full-stack apps, e-commerce, dev tools, and
            immersive 3D experiences — from client work to open-source.
          </p>
        </Container>
      </section>

      {/* FILTER CHIPS */}
      <section className="sticky top-[64px] z-20 border-y border-(--color-stroke) bg-(--color-void)/85 py-4 backdrop-blur">
        <Container>
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => {
              const active = f === filter
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={active}
                  className={`rounded-(--radius-pill) border px-4 py-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] transition-colors ${
                    active
                      ? 'border-(--color-cyan) bg-(--color-cyan)/15 text-(--color-cyan)'
                      : 'border-(--color-stroke-strong) text-(--color-ink-60) hover:border-(--color-ink-60) hover:text-(--color-ink-100)'
                  }`}
                >
                  {f}
                </button>
              )
            })}
            <span className="ml-auto font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-30)">
              {visible.length} {visible.length === 1 ? 'project' : 'projects'}
            </span>
          </div>
        </Container>
      </section>

      {/* GRID */}
      <section className="relative py-20 md:py-28">
        <Container>
          {/* Re-keying by filter replays the staggered entrance on each change. */}
          <div
            key={filter}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((p, i) => (
              <div
                key={p.slug}
                className="card-enter"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <ProjectCard project={p} />
              </div>
            ))}
          </div>

          {visible.length === 0 && (
            <Reveal className="py-20 text-center font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
              No projects under this filter — yet.
            </Reveal>
          )}
        </Container>
      </section>
    </>
  )
}

function ProjectCard({ project }) {
  return (
    <Link
      to={`/work/${project.slug}`}
      aria-label={`Open case study: ${project.title}`}
      className="group block h-full overflow-hidden rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-elev) transition-colors hover:border-(--color-stroke-strong)"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-(--color-void)">
        <img
          src={project.image}
          alt={`${project.title} — preview`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-(--color-void)/80 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-(--radius-pill) border border-(--color-stroke-strong) bg-(--color-void)/60 px-3 py-1 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-100) backdrop-blur"
            >
              {t}
            </span>
          ))}
        </div>
        <span className="absolute top-4 right-4 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
          {project.year}
        </span>
      </div>

      <div className="flex items-start justify-between gap-4 p-5">
        <div>
          <h3 className="font-display text-(length:--fs-h4) text-(--color-ink-100)">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-(length:--fs-sm) text-(--color-ink-60)">
            {project.summary}
          </p>
        </div>
        <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-(--color-stroke-strong) text-(--color-ink-100) transition-colors group-hover:border-(--color-cyan) group-hover:text-(--color-cyan)">
          <ArrowUpRight size={14} strokeWidth={2} />
        </span>
      </div>
    </Link>
  )
}
