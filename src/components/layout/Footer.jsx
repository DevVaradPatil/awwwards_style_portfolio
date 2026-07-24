import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, FlaskConical } from 'lucide-react'
import { contact, socials, research } from '@/data/socials.js'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/playground', label: 'Playground' },
  { to: '/contact', label: 'Contact' },
]

// Live local time (Varad is based at IIT Kanpur → IST).
function LocalTime() {
  const [now, setNow] = useState('')
  useEffect(() => {
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        }).format(new Date()),
      )
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])
  if (!now) return null
  return (
    <span className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
      Kanpur, IN · {now} IST
    </span>
  )
}

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-(--color-stroke) bg-(--color-void) py-16">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand + tagline */}
          <div>
            <Link
              to="/"
              aria-label="Varad Patil — Home"
              className="inline-flex items-center gap-2 font-display text-(length:--fs-h3)"
            >
              <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full brand-gradient-surface" />
              <span>Varad Patil</span>
            </Link>
            <p className="mt-5 max-w-md text-(length:--fs-sm) text-(--color-ink-60)">
              Full-stack developer &amp; AI enthusiast. Building fast, scalable,
              visually engaging products from IIT Kanpur.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-6 inline-flex items-center gap-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-100) transition-colors hover:text-(--color-cyan)"
            >
              <span className="link-underline">{contact.email}</span>
              <ArrowUpRight size={14} strokeWidth={2} />
            </a>

            {/* Research callout */}
            <a
              href={research.href}
              target="_blank"
              rel="noreferrer"
              className="group mt-8 flex max-w-md items-center gap-4 rounded-(--radius-lg) border border-(--color-stroke) bg-(--color-elev) p-4 transition-colors hover:border-(--color-cyan)/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-(--color-stroke-strong) text-(--color-cyan)">
                <FlaskConical size={16} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-30)">
                  {research.org}
                </span>
                <span className="mt-1 flex items-center gap-1.5 font-display text-(length:--fs-h4) text-(--color-ink-100)">
                  {research.label}
                  <ArrowUpRight
                    size={16}
                    strokeWidth={2}
                    className="text-(--color-ink-60) transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--color-cyan)"
                  />
                </span>
              </span>
            </a>
          </div>

          {/* Sitemap */}
          <nav aria-label="Footer navigation">
            <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
              Sitemap
            </p>
            <ul className="mt-5 space-y-3">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="link-underline inline-block font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-60) transition-colors hover:text-(--color-ink-100)"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div>
            <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
              Elsewhere
            </p>
            <ul className="mt-5 space-y-3">
              {socials.map((s) => (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-60) transition-colors hover:text-(--color-ink-100)"
                  >
                    <span className="link-underline">{s.label}</span>
                    <ArrowUpRight size={12} strokeWidth={2} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-(--color-stroke) pt-8 md:flex-row md:items-center">
          <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-60)">
            © {year} Varad Patil · All rights reserved
          </p>
          <LocalTime />
        </div>
      </div>
    </footer>
  )
}
