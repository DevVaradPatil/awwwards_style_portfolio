import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import CodePortrait from '@/components/primitives/CodePortrait.jsx'
import CallToAction from '@/sections/home/CallToAction.jsx'
import creator from '@/assets/creator.jpg'
import { principles, contact } from '@/data/socials.js'
import { now } from '@/data/now.js'
import { skillGroups } from '@/data/skills.js'
import { experience } from '@/data/experience.js'
import { education } from '@/data/education.js'
import { testimonials } from '@/data/testimonials.js'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

const wrap = 'mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14'

export default function About() {
  useDocumentMeta(pageMeta.about)
  return (
    <>
      <Hero />
      <Now />
      <WhatIDo />
      <Journey />
      <Testimonials />
      <CallToAction />
    </>
  )
}

/* ---------- HERO (ink): elastic hello + code portrait ---------- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-(--color-ink) pt-28 pb-20 md:pt-36 md:pb-28">
      {/* minmax(0, 1fr) tracks: the columns stay exactly half each. Plain `fr`
          tracks grow with their content, so a stretching HELLO would squeeze
          the portrait column. */}
      <div className={`${wrap} grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20`}>
        <div className="order-2 min-w-0 lg:order-1">
          <h1 className="font-normal">
            <span className="sr-only">About Varad Patil</span>
            {/* On desktop the size is capped so the stretch stays inside the
                left half: the worst pointer position makes the word ~4.9em
                wide; checked at 1024, 1440 and 1920px against the column. */}
            <ElasticText
              text="HELLO."
              label=""
              aria-hidden="true"
              reach={1.3}
              width={[70, 150]}
              weight={[350, 900]}
              className="text-[clamp(4.5rem,15vw,13rem)] text-(--color-fg) lg:text-[min(8vw,7.6rem)]"
            />
          </h1>
          <div className="mt-8 grid max-w-xl gap-5">
            <p className="text-(length:--fs-h4) leading-relaxed text-(--color-fg)">
              I&apos;m Varad, a full-stack developer and AI builder, now doing an M.Tech in AI for
              Sustainability at IIT Kanpur.
            </p>
            <p className="leading-relaxed">
              I build fast, scalable web and mobile apps, from client work in production to research
              tools. I care most about the seam where engineering rigor meets design: products that
              load fast, hold up, and feel alive.
            </p>
            <p className="leading-relaxed">
              Outside the editor: open-source tools, sustainability research, and turning ambitious
              ideas into things people can actually use.
            </p>
          </div>
          <dl className="mt-10 grid gap-4 text-(length:--fs-sm) sm:grid-cols-2">
            <div>
              <dt className="text-(--color-fg-faint)">Based in</dt>
              <dd className="mt-1 font-display text-(length:--fs-h4) font-bold [font-stretch:115%] text-(--color-fg)">
                {contact.location}
              </dd>
            </div>
            <div>
              <dt className="text-(--color-fg-faint)">Availability</dt>
              <dd className="mt-1 font-display text-(length:--fs-h4) font-bold [font-stretch:115%] text-(--color-pink)">
                {contact.availability}
              </dd>
            </div>
          </dl>
        </div>

        <div className="order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none">
          <CodePortrait src={creator} alt="Portrait of Varad Patil, drawn in code characters" />
          <p className="mt-3 text-center text-(length:--fs-sm) text-(--color-fg-faint)">
            Hover (or drag) over the code to see the photo.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------- NOW (blue) ---------- */
function Now() {
  return (
    <section aria-label="Currently" className="room-blue py-20 md:py-28">
      <div className={wrap}>
        <ElasticText
          as="h2"
          text="NOW"
          label="Currently"
          reach={1.3}
          width={[70, 150]}
          weight={[350, 900]}
          className="text-[clamp(4rem,12vw,11rem)] text-(--color-fg)"
        />
        <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {now.map((item) => (
            <li key={item.id} className="grid content-start gap-2 border-t-2 border-(--color-line) pt-5">
              <p className="text-(length:--fs-sm) font-semibold text-(--color-pink)">{item.label}</p>
              <NowTitle item={item} />
              <p className="text-(--color-fg-muted)">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function NowTitle({ item }) {
  const cls =
    'font-display text-(length:--fs-h3) font-extrabold [font-stretch:115%] text-(--color-fg) leading-tight'
  if (!item.href) return <h3 className={cls}>{item.title}</h3>
  const inner = (
    <>
      {item.title}
      <ArrowUpRight size={20} strokeWidth={2.4} className="ml-1 inline-block align-baseline" />
    </>
  )
  return (
    <h3 className={cls}>
      {item.external ? (
        <a href={item.href} target="_blank" rel="noreferrer" className="hover:text-(--color-pink)">
          {inner}
        </a>
      ) : (
        <Link to={item.href} className="hover:text-(--color-pink)">
          {inner}
        </Link>
      )}
    </h3>
  )
}

/* ---------- WHAT I DO (ink) ---------- */
function WhatIDo() {
  return (
    <section aria-label="What I do" className="bg-(--color-ink) py-20 md:py-28">
      <div className={wrap}>
        <h2 className="text-(length:--fs-h1)">What I do</h2>
        <ul className="mt-12 grid gap-x-16 gap-y-12 md:grid-cols-2">
          {principles.map((p) => (
            <li key={p.id} className="grid content-start gap-3">
              <h3 className="text-(length:--fs-h2) text-(--color-fg)">{p.title}</h3>
              <p className="max-w-lg text-(length:--fs-h4) leading-relaxed text-(--color-fg-muted)">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ---------- JOURNEY + EDUCATION + STACK (bone) ---------- */
function Journey() {
  return (
    <section aria-label="Journey" className="room-bone py-20 md:py-28">
      <div className={wrap}>
        <ElasticText
          as="h2"
          text="JOURNEY"
          label="Journey"
          reach={1.3}
          width={[70, 150]}
          weight={[350, 900]}
          className="text-[clamp(3.5rem,12vw,11rem)] text-(--color-type)"
        />

        <ol className="mt-12 border-b border-(--color-line)">
          {experience.map((e) => (
            <li
              key={e.id}
              className="grid gap-4 border-t border-(--color-line) py-8 md:grid-cols-[12rem_1fr] md:gap-10 md:py-10"
            >
              <p className="text-(length:--fs-sm) tabular-nums text-(--color-type-muted)">
                {e.start} – {e.end}
              </p>
              <div className="grid gap-3">
                <h3 className="text-(length:--fs-h3) text-(--color-type)">{e.role}</h3>
                <p className="text-(--color-type-muted)">
                  <span className="font-semibold text-(--color-type)">{e.org}</span> · {e.location}
                </p>
                <p className="max-w-3xl text-(--color-type)">{e.summary}</p>
                {e.bullets?.length > 0 && (
                  <ul className="grid list-disc gap-1.5 pl-5 text-(length:--fs-sm) text-(--color-type-muted) marker:text-(--color-blue) sm:grid-cols-2 sm:gap-x-8">
                    {e.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-24 text-(length:--fs-h1) text-(--color-type)">Education</h2>
        <ul className="mt-8 border-b border-(--color-line)">
          {education.map((ed) => (
            <li
              key={ed.id}
              className="grid gap-4 border-t border-(--color-line) py-8 md:grid-cols-[12rem_1fr] md:gap-10"
            >
              <p className="text-(length:--fs-sm) tabular-nums text-(--color-type-muted)">{ed.period}</p>
              <div className="grid gap-2">
                <h3 className="text-(length:--fs-h3) text-(--color-type)">{ed.degree}</h3>
                <p className="text-(--color-type-muted)">{ed.school}</p>
                {ed.coursework?.length > 0 && (
                  <p className="max-w-3xl text-(length:--fs-sm) text-(--color-type-muted)">
                    {ed.coursework.join(' · ')}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <h2 className="mt-24 text-(length:--fs-h1) text-(--color-type)">Stack</h2>
        <dl className="mt-8 border-b border-(--color-line)">
          {skillGroups.map((g) => (
            <div
              key={g.id}
              className="grid gap-2 border-t border-(--color-line) py-6 md:grid-cols-[12rem_1fr] md:gap-10"
            >
              <dt className="text-(length:--fs-sm) text-(--color-type-muted)">{g.label}</dt>
              <dd className="font-display text-(length:--fs-h4) font-bold [font-stretch:112%] text-(--color-type)">
                {g.items.join(', ')}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* ---------- TESTIMONIALS (ink) ---------- */
function Testimonials() {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = testimonials.length
  const go = useCallback((delta) => setIdx((i) => (i + delta + total) % total), [total])

  // Auto-advance every 6s; pauses on hover/focus. Not gated on reduced motion
  // (owner's choice — see CLAUDE.md).
  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => setIdx((i) => (i + 1) % total), 6000)
    return () => window.clearInterval(id)
  }, [paused, total])

  const t = testimonials[idx]

  return (
    <section
      aria-roledescription="carousel"
      aria-label="What people say"
      className="bg-(--color-ink) py-20 md:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={wrap}>
        <div className="flex items-end justify-between gap-6">
          <h2 className="text-(length:--fs-h1)">Kind words</h2>
          <p className="text-(length:--fs-sm) tabular-nums text-(--color-fg-muted)">
            {idx + 1} / {total}
          </p>
        </div>

        <figure key={t.id} className="card-enter mt-12 min-h-[18rem] max-w-5xl">
          <blockquote className="font-display text-(length:--fs-h2) font-bold leading-[1.15] [font-stretch:108%] text-(--color-fg)">
            <span className="text-(--color-pink)">“</span>
            {t.quote}
            <span className="text-(--color-pink)">”</span>
          </blockquote>
          <figcaption className="mt-8 flex items-center gap-4">
            <img
              src={t.photo}
              alt=""
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              className="h-14 w-14 rounded-full object-cover"
            />
            <div>
              <p className="font-display text-(length:--fs-h4) font-bold [font-stretch:115%] text-(--color-fg)">{t.name}</p>
              <p className="text-(length:--fs-sm) text-(--color-fg-muted)">{t.role}</p>
            </div>
          </figcaption>
        </figure>

        <div className="mt-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="inline-flex h-12 w-12 items-center justify-center rounded-(--radius-sm) border-2 border-(--color-line-strong) text-(--color-fg) transition-colors hover:border-(--color-pink) hover:text-(--color-pink)"
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="inline-flex h-12 w-12 items-center justify-center rounded-(--radius-sm) border-2 border-(--color-line-strong) text-(--color-fg) transition-colors hover:border-(--color-pink) hover:text-(--color-pink)"
          >
            <ArrowRight size={18} strokeWidth={2.2} />
          </button>
          <div className="ml-3 flex items-center gap-2" role="group" aria-label="Choose testimonial">
            {testimonials.map((tt, i) => (
              <button
                key={tt.id}
                type="button"
                aria-pressed={i === idx}
                aria-label={`Show testimonial ${i + 1}`}
                onClick={() => setIdx(i)}
                className={`h-1 transition-all ${i === idx ? 'w-10 bg-(--color-pink)' : 'w-5 bg-(--color-line-strong) hover:bg-(--color-fg-muted)'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
