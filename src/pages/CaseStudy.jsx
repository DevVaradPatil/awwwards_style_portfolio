import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight, ExternalLink, Code2 } from 'lucide-react'
import Container from '@/components/system/Container.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import { projects } from '@/data/projects.js'
import NotFound from '@/pages/NotFound.jsx'
import useDocumentMeta from '@/lib/useDocumentMeta.js'

export default function CaseStudy() {
  const { slug } = useParams()

  const { project, prev, next } = useMemo(() => {
    const idx = projects.findIndex((p) => p.slug === slug)
    if (idx === -1) return { project: null, prev: null, next: null }
    return {
      project: projects[idx],
      prev: projects[(idx - 1 + projects.length) % projects.length],
      next: projects[(idx + 1) % projects.length],
    }
  }, [slug])

  useDocumentMeta({
    title: project ? project.title : 'Case study',
    description: project ? project.summary : 'Project case study by Varad Patil.',
    path: `/work/${slug}`,
  })

  if (!project) return <NotFound />

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-40 pb-20">
        <GradientBlob
          variant="violet"
          size={620}
          blur={160}
          opacity={0.4}
          className="top-[-160px] left-[-160px]"
        />
        <Container className="relative">
          <Link
            to="/work"
            className="inline-flex items-center gap-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-60) transition-colors hover:text-(--color-ink-100)"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            All work
          </Link>

          <div className="mt-10 flex flex-wrap items-center gap-3 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-60)">
            <span>{project.year}</span>
            <span className="text-(--color-ink-30)">·</span>
            {project.tags.map((t, i) => (
              <span key={t} className="flex items-center gap-3">
                <span>{t}</span>
                {i < project.tags.length - 1 && <span className="text-(--color-ink-30)">·</span>}
              </span>
            ))}
          </div>

          <h1 className="mt-6 font-display text-(length:--fs-display) leading-[1.02]">
            <SplitText by="word" trigger="mount" className="brand-gradient-text">
              {project.title}
            </SplitText>
          </h1>

          <p className="mt-8 max-w-3xl text-(length:--fs-h4) text-(--color-ink-100)">
            {project.summary}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            {project.links?.live && (
              <MagneticButton variant="solid" href={project.links.live} target="_blank" rel="noreferrer">
                Live site
                <ExternalLink size={14} strokeWidth={2} />
              </MagneticButton>
            )}
            {project.links?.repo && (
              <MagneticButton variant="ghost" href={project.links.repo} target="_blank" rel="noreferrer">
                <Code2 size={14} strokeWidth={2} />
                Source
              </MagneticButton>
            )}
          </div>
        </Container>
      </section>

      {/* HERO IMAGE */}
      <section className="relative">
        <Container>
          <Reveal>
            <div className="overflow-hidden rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-void)">
              <img
                src={project.image}
                alt={`${project.title} — full preview`}
                className="block h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* DETAILS */}
      <section className="relative py-20 md:py-28 lg:py-40">
        <Container className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_2fr]">
          {/* META */}
          <aside className="space-y-10">
            <MetaBlock label="Year">{project.year}</MetaBlock>
            <MetaBlock label="Tags">
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-(--radius-pill) border border-(--color-stroke-strong) bg-(--color-elev) px-3 py-1 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-100)"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </MetaBlock>
            <MetaBlock label="Stack">
              <ul className="space-y-1.5 font-mono text-(length:--fs-sm) text-(--color-ink-100)">
                {project.stack.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </MetaBlock>
          </aside>

          {/* BODY */}
          <div className="space-y-16">
            {project.problem && (
              <Block kicker="01 · Problem" body={project.problem} />
            )}
            {project.approach && (
              <Block kicker="02 · Approach" body={project.approach} />
            )}
            {project.features?.length > 0 && (
              <Reveal>
                <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
                  03 · Features
                </p>
                <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {project.features.map((f) => (
                    <li
                      key={f}
                      className="rounded-(--radius-md) border border-(--color-stroke) bg-(--color-raise) p-5 text-(length:--fs-body) text-(--color-ink-100)"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {project.impact && (
              <Block kicker="04 · Impact" body={project.impact} />
            )}
          </div>
        </Container>
      </section>

      {/* PREV / NEXT */}
      <section className="border-t border-(--color-stroke) py-20">
        <Container className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <NavCard project={prev} direction="prev" />
          <NavCard project={next} direction="next" />
        </Container>
      </section>
    </>
  )
}

function MetaBlock({ label, children }) {
  return (
    <div>
      <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
        {label}
      </p>
      <div className="mt-3 text-(--color-ink-100)">{children}</div>
    </div>
  )
}

function Block({ kicker, body }) {
  return (
    <Reveal>
      <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
        {kicker}
      </p>
      <p className="mt-6 text-(length:--fs-h4) leading-[1.4] text-(--color-ink-100)">
        {body}
      </p>
    </Reveal>
  )
}

function NavCard({ project, direction }) {
  if (!project) return <div />
  const isPrev = direction === 'prev'
  return (
    <Link
      to={`/work/${project.slug}`}
      className={`group flex items-center gap-6 rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-elev) p-6 transition-colors hover:border-(--color-stroke-strong) ${
        isPrev ? '' : 'md:flex-row-reverse md:text-right'
      }`}
    >
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-(--color-stroke-strong) text-(--color-ink-100) transition-colors group-hover:border-(--color-cyan) group-hover:text-(--color-cyan)">
        {isPrev ? <ArrowLeft size={16} strokeWidth={2} /> : <ArrowRight size={16} strokeWidth={2} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
          {isPrev ? 'Previous' : 'Next'}
        </p>
        <p className="mt-2 truncate font-display text-(length:--fs-h4) text-(--color-ink-100)">
          {project.title}
        </p>
      </div>
      <ArrowUpRight
        size={16}
        strokeWidth={2}
        className="hidden text-(--color-ink-30) transition-colors group-hover:text-(--color-cyan) md:block"
      />
    </Link>
  )
}
