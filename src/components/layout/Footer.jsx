import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import { contact, socials, research } from '@/data/socials.js'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/playground', label: 'Lab' },
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
  return <span className="tabular-nums">Kanpur, IN · {now} IST</span>
}

const linkCls =
  'link-underline font-display text-(length:--fs-h4) font-semibold [font-stretch:112%] text-(--color-fg) transition-colors hover:text-(--color-pink)'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="overflow-hidden bg-(--color-ink) pt-20 md:pt-28">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10 lg:px-14">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <p className="font-display text-(length:--fs-h3) font-bold [font-stretch:115%] text-(--color-fg)">
              Have something worth building?
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="mt-4 inline-flex items-center gap-2 break-all font-display text-(length:--fs-h3) font-bold [font-stretch:115%] text-(--color-pink)"
            >
              <span className="link-underline">{contact.email}</span>
              <ArrowUpRight size={22} strokeWidth={2.2} className="shrink-0" />
            </a>
            <a
              href={research.href}
              target="_blank"
              rel="noreferrer"
              className="group mt-10 flex max-w-md items-baseline justify-between gap-4 border-t border-(--color-line) pt-4 text-(--color-fg-muted) transition-colors hover:text-(--color-fg)"
            >
              <span>
                {research.label} <span className="text-(--color-fg-faint)">· {research.org}</span>
              </span>
              <ArrowUpRight size={16} strokeWidth={2} className="shrink-0" />
            </a>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="space-y-2">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={linkCls}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/resume.pdf" target="_blank" rel="noreferrer" className={linkCls}>
                  Résumé
                </a>
              </li>
            </ul>
          </nav>

          <ul className="space-y-2">
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.href} target="_blank" rel="noreferrer" className={linkCls}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 flex flex-col justify-between gap-2 border-t border-(--color-line) pt-6 text-(length:--fs-sm) text-(--color-fg-muted) sm:flex-row">
          <p className="text-(--color-fg-muted)">© {year} Varad Patil</p>
          <LocalTime />
        </div>
      </div>

      {/* Signature: the name, edge to edge. Decorative — the brand is already
          named above and in the header, so screen readers skip it. */}
      <ElasticText
        text="VARAD PATIL"
        label=""
        aria-hidden="true"
        idle="wave"
        reach={1.1}
        width={[72, 132]}
        weight={[400, 900]}
        className="mt-8 select-none text-center text-[clamp(3rem,12.4vw,12.5rem)] text-(--color-fg) md:mt-12"
      />
    </footer>
  )
}
