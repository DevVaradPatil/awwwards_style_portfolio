import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { contact, socials } from '@/data/socials.js'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/playground', label: 'Playground' },
  { to: '/contact', label: 'Contact' },
]

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
              {contact.email}
              <ArrowUpRight size={14} strokeWidth={2} />
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
                    className="font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-60) transition-colors hover:text-(--color-ink-100)"
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
                    {s.label}
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
          <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
            Aurora Compute · v0.1 · Crafted with React, GSAP &amp; Lenis
          </p>
        </div>
      </div>
    </footer>
  )
}
