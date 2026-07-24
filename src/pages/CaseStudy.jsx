import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Code2 } from 'lucide-react'
import Container from '@/components/system/Container.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import { projects } from '@/data/projects.js'
import googlePlayBadge from '@/assets/apps/google-play-badge.png'
import NotFound from '@/pages/NotFound.jsx'
import useDocumentMeta, { SITE } from '@/lib/useDocumentMeta.js'

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
    jsonLd: project
      ? {
          '@context': 'https://schema.org',
          '@type': project.type === 'app' ? 'MobileApplication' : 'CreativeWork',
          name: project.title,
          description: project.summary,
          url: `${SITE.url}/work/${slug}`,
          ...(project.image ? { image: `${SITE.url}${project.image}` } : {}),
          ...(project.year ? { dateCreated: String(project.year) } : {}),
          ...(project.tags?.length ? { keywords: project.tags.join(', ') } : {}),
          ...(project.type === 'app'
            ? {
                operatingSystem: 'ANDROID',
                installUrl: project.links?.playstore,
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              }
            : {}),
          author: { '@type': 'Person', name: SITE.name, url: SITE.url },
        }
      : null,
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

          {project.logo && (
            <img
              src={project.logo}
              alt={`${project.title} app icon`}
              width={72}
              height={72}
              className="mt-8 h-[72px] w-[72px] rounded-(--radius-lg) border border-(--color-stroke-strong) bg-(--color-elev) object-contain p-1"
            />
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-60)">
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
            {project.links?.playstore && (
              <a
                href={project.links.playstore}
                target="_blank"
                rel="noreferrer"
                aria-label={`Get ${project.title} on Google Play`}
                className="inline-block transition-transform hover:-translate-y-0.5"
              >
                <img
                  src={googlePlayBadge}
                  alt="Get it on Google Play"
                  width={646}
                  height={250}
                  className="h-14 w-auto"
                />
              </a>
            )}
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

      {/* HERO MEDIA */}
      <section className="relative">
        <Container>
          <Reveal>
            {project.screenshots?.length ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {project.screenshots.map((shot, i) => (
                  <img
                    key={i}
                    src={shot}
                    alt={`${project.title} — screenshot ${i + 1}`}
                    width={1080}
                    height={1920}
                    className="h-[420px] w-auto shrink-0 rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-void) md:h-[560px]"
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-void)">
                <img
                  src={project.image}
                  alt={`${project.title} — full preview`}
                  className="block h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            )}
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

      {/* NEXT PROJECT */}
      <section className="border-t border-(--color-stroke) py-16 md:py-20">
        <Container>
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
              Keep exploring
            </p>
            {prev && (
              <Link
                to={`/work/${prev.slug}`}
                className="group inline-flex items-center gap-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-60) transition-colors hover:text-(--color-ink-100)"
              >
                <ArrowLeft size={14} strokeWidth={2} />
                <span className="link-underline">
                  <span className="hidden sm:inline">Previous · </span>
                  {prev.title}
                </span>
              </Link>
            )}
          </div>
          <NextProjectCard project={next} />
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

function NextProjectCard({ project }) {
  if (!project) return null
  return (
    <Link
      to={`/work/${project.slug}`}
      aria-label={`Next project: ${project.title}`}
      className="group relative mt-6 block overflow-hidden rounded-(--radius-xl) border border-(--color-stroke) bg-(--color-void) transition-colors hover:border-(--color-stroke-strong)"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[2/1] lg:aspect-[21/9]">
        <img
          src={project.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-(--color-void) via-(--color-void)/50 to-(--color-void)/10" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-10 lg:p-12">
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-cyan)">
          Next project
        </p>
        <div className="mt-3 flex items-end justify-between gap-6">
          <h2 className="font-display text-(length:--fs-h1) leading-[1.04] text-(--color-ink-100)">
            {project.title}
          </h2>
          <span className="hidden shrink-0 items-center justify-center rounded-full border border-(--color-stroke-strong) bg-(--color-void)/40 p-4 text-(--color-ink-100) backdrop-blur transition-colors group-hover:border-(--color-cyan) group-hover:text-(--color-cyan) sm:inline-flex">
            <ArrowRight
              size={20}
              strokeWidth={2}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </span>
        </div>
        <p className="mt-3 hidden max-w-xl text-(length:--fs-body) text-(--color-ink-60) line-clamp-2 md:block">
          {project.summary}
        </p>
      </div>
    </Link>
  )
}
