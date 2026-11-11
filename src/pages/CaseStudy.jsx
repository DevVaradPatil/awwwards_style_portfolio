import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Code2, ExternalLink } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import { projects } from '@/data/projects.js'
import googlePlayBadge from '@/assets/apps/google-play-badge.png'
import NotFound from '@/pages/NotFound.jsx'
import useDocumentMeta, { SITE } from '@/lib/useDocumentMeta.js'
import { titleLines, fitFontSize } from '@/lib/titleLines.js'
import { pageMeta } from '@/data/siteMeta.js'

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
    // This effect runs after NotFound's own, so an unknown slug must say 404 here too.
    title: project ? project.title : pageMeta.notFound.title,
    description: project ? project.summary : pageMeta.notFound.description,
    path: `/work/${slug}`,
    noindex: !project,
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
      <Hero project={project} />
      <Media project={project} />
      <Details project={project} />
      <NextProject next={next} prev={prev} />
    </>
  )
}

/* ---------- HERO (ink) ---------- */
function Hero({ project }) {
  const { lines, subtitle, longest } = titleLines(project.title)
  const size = fitFontSize(longest)
  const hasLinks = project.links?.playstore || project.links?.live || project.links?.repo

  return (
    <section className="relative overflow-hidden bg-(--color-ink) pt-28 pb-14 md:pt-36 md:pb-20">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14">
        <Link
          to="/work"
          className="inline-flex items-center gap-2 font-display text-(length:--fs-sm) font-bold [font-stretch:115%] text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
        >
          <ArrowLeft size={16} strokeWidth={2.2} />
          All work
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-(length:--fs-sm) text-(--color-fg-muted)">
          {project.logo && (
            <img
              src={project.logo}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-(--radius-md) object-contain"
            />
          )}
          <span className="tabular-nums text-(--color-pink)">{project.year}</span>
          <span>{project.tags.join(' · ')}</span>
        </div>

        <h1 className="mt-5 font-normal">
          <span className="sr-only">{project.title}</span>
          {lines.map((line) => (
            <ElasticText
              key={line}
              text={line}
              label=""
              aria-hidden="true"
              reach={1.3}
              width={[80, 140]}
              weight={[500, 900]}
              className="text-(--color-fg)"
              style={{ fontSize: size }}
            />
          ))}
        </h1>
        {subtitle && (
          <p className="mt-4 font-display text-(length:--fs-h3) font-bold [font-stretch:115%] text-(--color-pink)">
            {subtitle}
          </p>
        )}

        <div className="mt-10 grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <p className="max-w-2xl text-(length:--fs-h4) leading-relaxed text-(--color-fg)">{project.summary}</p>
          {hasLinks && (
            <div className="flex flex-wrap items-center gap-4 md:justify-end">
              {project.links?.playstore && (
                <a
                  href={project.links.playstore}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Get ${project.title} on Google Play`}
                  className="inline-block transition-transform hover:-translate-y-0.5"
                >
                  <img src={googlePlayBadge} alt="Get it on Google Play" width={646} height={250} className="h-14 w-auto" />
                </a>
              )}
              {project.links?.live && (
                <MagneticButton variant="solid" href={project.links.live} target="_blank" rel="noreferrer">
                  Live site
                  <ExternalLink size={15} strokeWidth={2.2} />
                </MagneticButton>
              )}
              {project.links?.repo && (
                <MagneticButton variant="ghost" href={project.links.repo} target="_blank" rel="noreferrer">
                  <Code2 size={15} strokeWidth={2.2} />
                  Source
                </MagneticButton>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ---------- MEDIA (ink) ---------- */
function Media({ project }) {
  return (
    <section aria-label="Screenshots" className="bg-(--color-ink) pb-20 md:pb-28">
      {project.screenshots?.length ? (
        // Phone apps: a sideways strip of real store screenshots.
        <div className="flex gap-4 overflow-x-auto px-6 pb-4 md:gap-6 md:px-10 lg:px-14" role="region" tabIndex={0} aria-label="Screenshots, scroll sideways">
          {project.screenshots.map((shot, i) => (
            <img
              key={i}
              src={shot}
              alt={`${project.title} — screenshot ${i + 1}`}
              width={1080}
              height={1920}
              loading="lazy"
              decoding="async"
              className="h-[440px] w-auto shrink-0 rounded-(--radius-lg) md:h-[600px]"
            />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14">
          <img
            src={project.image}
            alt={`${project.title} — full preview`}
            loading="lazy"
            decoding="async"
            className="block w-full rounded-(--radius-lg)"
          />
        </div>
      )}
    </section>
  )
}

/* ---------- DETAILS (bone) ---------- */
function Details({ project }) {
  const blocks = [
    ['Problem', project.problem],
    ['Approach', project.approach],
    ['Impact', project.impact],
  ].filter(([, body]) => body)

  return (
    <section aria-label="Case study" className="room-bone py-20 md:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-16 px-6 md:px-10 lg:grid-cols-[18rem_1fr] lg:gap-24 lg:px-14">
        <aside className="grid content-start gap-8 lg:sticky lg:top-28">
          <Meta label="Year">
            <span className="tabular-nums">{project.year}</span>
          </Meta>
          <Meta label="Stack">
            <ul className="grid gap-1">
              {project.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </Meta>
          <Meta label="Tags">{project.tags.join(' · ')}</Meta>
        </aside>

        <div className="grid gap-14 md:gap-20">
          {blocks.map(([label, body]) => (
            <div key={label} className="grid gap-4">
              <h2 className="text-(length:--fs-h2) text-(--color-type)">{label}</h2>
              <p className="max-w-3xl text-(length:--fs-h4) leading-relaxed text-(--color-type)">{body}</p>
            </div>
          ))}
          {project.features?.length > 0 && (
            <div className="grid gap-6">
              <h2 className="text-(length:--fs-h2) text-(--color-type)">What it does</h2>
              <ul className="grid gap-x-10 border-t border-(--color-line) sm:grid-cols-2">
                {project.features.map((f) => (
                  <li
                    key={f}
                    className="border-b border-(--color-line) py-4 font-display text-(length:--fs-h4) font-bold [font-stretch:112%] text-(--color-type)"
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function Meta({ label, children }) {
  return (
    <div className="grid gap-2">
      <p className="text-(length:--fs-sm) font-semibold text-(--color-type-muted)">{label}</p>
      <div className="font-display text-(length:--fs-h4) font-bold [font-stretch:112%] text-(--color-type)">
        {children}
      </div>
    </div>
  )
}

/* ---------- NEXT (blue) ---------- */
function NextProject({ next, prev }) {
  if (!next) return null
  const { lines, longest } = titleLines(next.title)
  const size = fitFontSize(longest, { cap: '9rem', vw: 80 })
  return (
    <section aria-label="Keep exploring" className="room-blue relative overflow-hidden">
      <Link
        to={`/work/${next.slug}`}
        aria-label={`Next project: ${next.title}`}
        className="group block py-20 md:py-28"
      >
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14">
          <p className="inline-flex items-center gap-2 font-display text-(length:--fs-h4) font-bold [font-stretch:118%] text-(--color-pink)">
            Next project
            <ArrowUpRight size={22} strokeWidth={2.4} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </p>
          <div className="mt-4" aria-hidden="true">
            {lines.map((line) => (
              <ElasticText
                key={line}
                text={line}
                label=""
                reach={1.3}
                width={[80, 145]}
                weight={[500, 900]}
                className="text-(--color-fg)"
                style={{ fontSize: size }}
              />
            ))}
          </div>
          <p className="mt-6 max-w-xl text-(--color-fg-muted)">{next.summary}</p>
        </div>
      </Link>
      {prev && (
        <div className="mx-auto max-w-[1400px] px-6 pb-12 md:px-10 lg:px-14">
          <Link
            to={`/work/${prev.slug}`}
            className="inline-flex items-center gap-2 font-display text-(length:--fs-sm) font-bold [font-stretch:115%] text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            Previous: {prev.title}
          </Link>
        </div>
      )}
    </section>
  )
}
