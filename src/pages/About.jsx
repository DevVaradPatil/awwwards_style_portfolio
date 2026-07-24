import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Calendar,
  GraduationCap,
  MapPin,
  Quote,
  Sparkles,
} from 'lucide-react'
import Container from '@/components/system/Container.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import Reveal from '@/components/primitives/Reveal.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import GlassPhotoCard from '@/components/primitives/GlassPhotoCard.jsx'
import creator from '@/assets/creator.jpg'
import { principles, contact, socials } from '@/data/socials.js'
import { now } from '@/data/now.js'
import { skillGroups } from '@/data/skills.js'
import { experience } from '@/data/experience.js'
import { education } from '@/data/education.js'
import { testimonials } from '@/data/testimonials.js'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

export default function About() {
  useDocumentMeta(pageMeta.about)
  return (
    <>
      <Hero />
      <NowSection />
      <Principles />
      <Timeline />
      <StackChips />
      <EducationBlock />
      <TestimonialsCarousel />
      <Closer />
    </>
  )
}

/* ---------- HERO ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">
      <GradientBlob
        variant="violet"
        size={620}
        blur={160}
        opacity={0.45}
        className="top-[-180px] left-[-160px]"
      />
      <GradientBlob
        variant="cyan"
        size={520}
        blur={140}
        opacity={0.3}
        className="bottom-[-160px] right-[-120px]"
      />
      <Container className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
        <div>
          <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
            About Â· {contact.name}
          </p>
          <h1 className="mt-5 font-display text-(length:--fs-h1) leading-[1.04]">
            <SplitText by="word" trigger="mount">Developer who </SplitText>
            <SplitText by="word" trigger="mount" delay={0.18} className="brand-gradient-text">
              builds at the intersection.
            </SplitText>
          </h1>
          <div className="mt-8 space-y-5 text-(--color-ink-60)">
            <p className="text-(length:--fs-h4) text-(--color-ink-100)">
              I&apos;m a full-stack developer and AI enthusiast pursuing my M.Tech
              in <span className="text-(--color-ink-100)">AI for Sustainability at IIT Kanpur</span>.
            </p>
            <p>
              I love crafting fast, scalable, and visually engaging web &amp; mobile
              applications â€” from production client work to research-grade AI
              tools. My focus is the seam where engineering rigor meets design
              sensibility.
            </p>
            <p>
              Outside the editor: open-source contributions, sustainability
              research, and turning ambitious ideas into shippable products.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-60)">
            <span className="inline-flex items-center gap-2">
              <MapPin size={14} strokeWidth={2} />
              {contact.location}
            </span>
            <span className="text-(--color-ink-30)">Â·</span>
            <span className="inline-flex items-center gap-2">
              <Sparkles size={14} strokeWidth={2} className="text-(--color-cyan)" />
              {contact.availability}
            </span>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 m-auto h-72 w-72 rounded-full brand-gradient-surface opacity-30 blur-3xl" />
          <GlassPhotoCard
            src={creator}
            alt="Portrait of Varad Patil"
            ratio="3 / 4"
            width={513}
            height={683}
            className="w-full max-w-md"
          />
        </div>
      </Container>
    </section>
  )
}

/* ---------- NOW ---------- */
function NowSection() {
  return (
    <section className="relative border-y border-(--color-stroke) bg-(--color-raise)/30 py-16 md:py-20">
      <Container>
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--color-lime) opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-(--color-lime)" />
          </span>
          <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
            Currently
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {now.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.05}>
              <NowCard item={item} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

function NowCard({ item }) {
  const inner = (
    <>
      <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-cyan)">
        {item.label}
      </p>
      <h3 className="mt-3 font-display text-(length:--fs-h4) text-(--color-ink-100)">
        {item.title}
      </h3>
      <p className="mt-2 text-(length:--fs-sm) text-(--color-ink-60)">{item.detail}</p>
      {item.href && (
        <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-30) transition-colors group-hover:text-(--color-cyan)">
          {item.external ? 'Visit' : 'View'}
          <ArrowUpRight
            size={13}
            strokeWidth={2}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      )}
    </>
  )

  const cls =
    'group flex h-full flex-col rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-elev) p-6 transition-colors hover:border-(--color-stroke-strong)'

  if (!item.href) return <div className={cls}>{inner}</div>
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    )
  }
  return (
    <Link to={item.href} className={cls}>
      {inner}
    </Link>
  )
}

/* ---------- PRINCIPLES ---------- */
function Principles() {
  return (
    <section className="relative border-y border-(--color-stroke) bg-(--color-raise)/30 py-20 md:py-28 lg:py-36">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
              01 Â· Principles
            </p>
            <h2 className="mt-6 font-display text-(length:--fs-h1)">
              What I <span className="brand-gradient-text">stand for.</span>
            </h2>
          </div>
          <p className="max-w-md text-(--color-ink-60)">
            Four pillars that shape every product I touch.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {principles.map((p, i) => (
            <Reveal
              key={p.id}
              delay={i * 0.05}
              className="group rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-elev) p-8 transition-colors hover:border-(--color-stroke-strong)"
            >
              <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
                0{i + 1}
              </p>
              <h3 className="mt-3 font-display text-(length:--fs-h3) text-(--color-ink-100)">
                {p.title}
              </h3>
              <p className="mt-4 text-(--color-ink-60)">{p.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ---------- TIMELINE ---------- */
function Timeline() {
  return (
    <section className="relative py-20 md:py-28 lg:py-36">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
              02 Â· Journey
            </p>
            <h2 className="mt-6 font-display text-(length:--fs-h1)">
              The <span className="brand-gradient-text">timeline.</span>
            </h2>
          </div>
          <p className="max-w-md text-(--color-ink-60)">
            Newest first. A mix of research, internships, freelance and OSS.
          </p>
        </div>

        <ol className="relative mt-14 space-y-6 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-(--color-violet)/60 before:via-(--color-iris)/40 before:to-(--color-cyan)/60 md:before:left-[27px]">
          {experience.map((e, i) => {
            const Icon = e.type === 'education' ? GraduationCap : Briefcase
            return (
              <Reveal
                as="li"
                key={e.id}
                delay={i * 0.05}
                className="group relative pl-14 md:pl-20"
              >
                {/* marker badge */}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--color-stroke-strong) shadow-[0_0_0_4px_var(--color-void)] transition-all duration-500 group-hover:scale-110 md:h-14 md:w-14 ${
                    e.type === 'education'
                      ? 'brand-gradient-surface text-(--color-void)'
                      : 'bg-(--color-elev) text-(--color-cyan)'
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className="md:h-5 md:w-5"
                  />
                </span>

                {/* card */}
                <div className="relative overflow-hidden rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-raise) p-6 transition-all duration-500 group-hover:-translate-y-0.5 group-hover:border-(--color-stroke-strong) group-hover:bg-(--color-elev) md:p-8">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        'radial-gradient(ellipse at top right, rgba(91,228,255,0.08), transparent 60%)',
                    }}
                  />
                  <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-(--radius-pill) px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.25em] ${
                        e.type === 'education'
                          ? 'border border-(--color-violet)/40 bg-(--color-violet)/10 text-(--color-iris)'
                          : 'border border-(--color-cyan)/30 bg-(--color-cyan)/5 text-(--color-cyan)'
                      }`}
                    >
                      <Calendar size={11} strokeWidth={2} />
                      {e.start} â†’ {e.end}
                    </span>
                    <span className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
                      {e.type === 'education' ? 'Education' : 'Work'}
                    </span>
                  </div>

                  <h3 className="relative mt-4 font-display text-(length:--fs-h3) text-(--color-ink-100)">
                    {e.role}
                  </h3>
                  <p className="relative mt-1 flex flex-wrap items-center gap-2 font-mono text-(length:--fs-sm) text-(--color-ink-60)">
                    <span className="text-(--color-ink-100)">{e.org}</span>
                    <span className="text-(--color-ink-30)">Â·</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} strokeWidth={2} />
                      {e.location}
                    </span>
                  </p>

                  <p className="relative mt-4 max-w-3xl text-(--color-ink-60)">
                    {e.summary}
                  </p>

                  {e.bullets?.length > 0 && (
                    <ul className="relative mt-5 grid gap-2 text-(length:--fs-sm) text-(--color-ink-100) sm:grid-cols-2">
                      {e.bullets.map((b) => (
                        <li key={b} className="flex gap-3">
                          <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-(--color-cyan)" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}

/* ---------- STACK ---------- */
function StackChips() {
  return (
    <section className="relative border-y border-(--color-stroke) bg-(--color-raise)/30 py-20 md:py-28">
      <Container>
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
          03 Â· Stack
        </p>
        <h2 className="mt-6 font-display text-(length:--fs-h1)">
          Tools I <span className="brand-gradient-text">reach for.</span>
        </h2>
        <div className="mt-14 space-y-8">
          {skillGroups.map((group, gi) => (
            <Reveal key={group.id} delay={gi * 0.04}>
              <div className="flex flex-col gap-4 border-t border-(--color-stroke) pt-5 md:flex-row md:items-baseline md:gap-10">
                <p className="w-40 shrink-0 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-(--radius-pill) border border-(--color-stroke-strong) bg-(--color-elev) px-4 py-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.2em] text-(--color-ink-100)"
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
    </section>
  )
}

/* ---------- EDUCATION ---------- */
function EducationBlock() {
  return (
    <section className="relative py-20 md:py-28 lg:py-36">
      <Container>
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
          04 Â· Education
        </p>
        <h2 className="mt-6 font-display text-(length:--fs-h1)">
          Where I <span className="brand-gradient-text">learned the craft.</span>
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {education.map((ed, i) => (
            <Reveal
              key={ed.id}
              delay={i * 0.06}
              className="rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-elev) p-8"
            >
              <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
                {ed.period}
              </p>
              <h3 className="mt-3 font-display text-(length:--fs-h3) text-(--color-ink-100)">
                {ed.degree}
              </h3>
              <p className="mt-2 text-(--color-ink-60)">{ed.school}</p>
              {ed.coursework?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {ed.coursework.map((c) => (
                    <span
                      key={c}
                      className="rounded-(--radius-pill) border border-(--color-stroke) bg-(--color-raise) px-3 py-1 font-mono text-(length:--fs-xs) uppercase tracking-[0.2em] text-(--color-ink-60)"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}

/* ---------- TESTIMONIALS CAROUSEL ---------- */
function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = testimonials.length

  const go = useCallback(
    (delta) => setIdx((i) => (i + delta + total) % total),
    [total],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  // Auto-advance every 5s; pause on hover or when user reduces motion
  useEffect(() => {
    if (paused) return
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % total)
    }, 5000)
    return () => window.clearInterval(id)
  }, [paused, total])

  const t = testimonials[idx]

  return (
    <section
      className="relative border-y border-(--color-stroke) bg-(--color-raise)/30 py-20 md:py-28 lg:py-36"
      aria-roledescription="carousel"
      aria-label="Testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <GradientBlob
        variant="iris"
        size={520}
        blur={160}
        opacity={0.25}
        className="top-1/2 right-[-160px] -translate-y-1/2"
      />
      <Container className="relative">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
              05 Â· Words
            </p>
            <h2 className="mt-6 font-display text-(length:--fs-h1)">
              From <span className="brand-gradient-text">people I&apos;ve built with.</span>
            </h2>
          </div>
          <p className="hidden font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30) md:block">
            {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </p>
        </div>

        <div className="relative mt-14 min-h-[320px]">
          <Quote
            aria-hidden="true"
            size={64}
            className="absolute -top-4 left-0 text-(--color-ink-30)/30"
            strokeWidth={1.2}
          />
          {/* Re-keying by testimonial id replays the fade-in on each change. */}
          <figure key={t.id} className="card-enter relative max-w-4xl pt-10 pl-16">
            <blockquote className="font-display text-(length:--fs-h2) leading-[1.2] text-(--color-ink-100)">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <img
                src={t.photo}
                alt={t.name}
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-14 w-14 rounded-full border border-(--color-stroke-strong) object-cover"
              />
              <div>
                <p className="font-display text-(length:--fs-h4) text-(--color-ink-100)">
                  {t.name}
                </p>
                <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-60)">
                  {t.role}
                </p>
              </div>
            </figcaption>
          </figure>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-(--color-stroke-strong) text-(--color-ink-100) transition-colors hover:border-(--color-cyan) hover:text-(--color-cyan)"
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-(--color-stroke-strong) text-(--color-ink-100) transition-colors hover:border-(--color-cyan) hover:text-(--color-cyan)"
          >
            <ArrowRight size={16} strokeWidth={2} />
          </button>
          <div className="ml-4 flex items-center gap-2" role="tablist" aria-label="Choose testimonial">
            {testimonials.map((tt, i) => (
              <button
                key={tt.id}
                type="button"
                role="tab"
                aria-selected={i === idx}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx
                    ? 'w-10 bg-(--color-cyan)'
                    : 'w-4 bg-(--color-stroke-strong) hover:bg-(--color-ink-60)'
                }`}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ---------- CLOSER ---------- */
function Closer() {
  return (
    <section className="relative overflow-hidden py-24 md:py-36">
      <GradientBlob
        variant="violet"
        size={620}
        blur={160}
        opacity={0.4}
        className="bottom-[-180px] left-1/2 -translate-x-1/2"
      />
      <Container className="relative text-center">
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
          06 Â· Next
        </p>
        <h2 className="mx-auto mt-6 max-w-4xl font-display text-(length:--fs-display) leading-[1.02]">
          <SplitText by="word">Let&apos;s build </SplitText>
          <SplitText by="word" className="brand-gradient-text">something good.</SplitText>
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton variant="solid" to="/contact">
            Start a project
            <ArrowUpRight size={16} strokeWidth={2} />
          </MagneticButton>
          <MagneticButton variant="ghost" to="/work">
            See the work
          </MagneticButton>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
          {socials.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="link-underline transition-colors hover:text-(--color-ink-100)"
            >
              {s.label} â†—
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}
