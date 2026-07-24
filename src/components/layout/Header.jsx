import { useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Download, Menu, X } from 'lucide-react'

const links = [
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/playground', label: 'Playground' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const navRef = useRef(null)
  const triggerRef = useRef(null)
  const wasOpen = useRef(false)

  // Lock scroll when open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Focus management: trap Tab within the open menu, close on Escape, and
  // return focus to the trigger when it closes.
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) {
        wasOpen.current = false
        triggerRef.current?.focus()
      }
      return
    }
    wasOpen.current = true
    const focusables = () =>
      [...(navRef.current?.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])') || [])]
    focusables()[0]?.focus()

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-(--color-stroke) bg-(--color-void)/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6 md:px-10 lg:px-14">
        <Link
          to="/"
          aria-label="Varad Patil — Home"
          className="group flex items-center gap-2 font-display text-(length:--fs-h4) font-semibold tracking-wide"
        >
          <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full brand-gradient-surface" />
          <span>Varad</span>
          <span aria-hidden="true" className="text-(--color-ink-30)">/</span>
          <span className="text-(--color-ink-60) transition-colors group-hover:text-(--color-ink-100)">
            Patil
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav-underline rounded-(--radius-pill) px-4 py-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] transition-colors ${
                  isActive
                    ? 'text-(--color-ink-100)'
                    : 'text-(--color-ink-60) hover:text-(--color-ink-100)'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {/* Résumé is a static file in public/, not a route — plain <a>. */}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="nav-underline inline-flex items-center gap-1.5 rounded-(--radius-pill) px-4 py-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-60) transition-colors hover:text-(--color-ink-100)"
          >
            Résumé
            <Download size={12} strokeWidth={2} />
          </a>
        </nav>

        <Link
          to="/contact"
          className="hidden rounded-(--radius-pill) border border-(--color-stroke-strong) bg-(--color-elev) px-5 py-2 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-100) transition-colors hover:bg-(--color-raise) md:inline-block"
        >
          Let&apos;s talk
        </Link>

        {/* Mobile menu trigger */}
        <button
          ref={triggerRef}
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--color-stroke-strong) text-(--color-ink-100) transition-colors hover:border-(--color-cyan) hover:text-(--color-cyan) md:hidden"
        >
          {open ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
        </button>
      </div>

      {open && (
        <nav
          ref={navRef}
          id="mobile-nav"
          aria-label="Mobile"
          className="menu-drop absolute inset-x-0 top-full origin-top border-t border-(--color-stroke) bg-(--color-void)/95 backdrop-blur-xl md:hidden"
        >
          <ul className="mx-auto flex w-full max-w-[1400px] flex-col gap-1 px-6 py-6">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                onClick={close}
                className={({ isActive }) =>
                  `block rounded-(--radius-md) px-4 py-4 font-display text-(length:--fs-h3) transition-colors ${
                    isActive
                      ? 'text-(--color-ink-100)'
                      : 'text-(--color-ink-60) hover:text-(--color-ink-100)'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
          <li>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              onClick={close}
              className="flex items-center gap-3 rounded-(--radius-md) px-4 py-4 font-display text-(length:--fs-h3) text-(--color-ink-60) transition-colors hover:text-(--color-ink-100)"
            >
              Résumé
              <Download size={18} strokeWidth={2} />
            </a>
          </li>
          <li className="mt-3 border-t border-(--color-stroke) pt-5">
            <Link
              to="/contact"
              onClick={close}
              className="block rounded-(--radius-md) bg-(--color-ink-100) px-4 py-4 text-center font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-void)"
            >
              Let&apos;s talk
            </Link>
          </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
