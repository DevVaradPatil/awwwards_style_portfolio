import { useEffect, useRef, useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'

const links = [
  { to: '/work', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/playground', label: 'Lab' },
  { to: '/contact', label: 'Contact' },
]

/**
 * Header — a transparent bar of white type with mix-blend-mode: difference,
 * so it inverts against whatever room is underneath (ink, blue, bone, pink)
 * and never needs its own background.
 *
 * The mobile menu is a SIBLING of the blended bar, not a child: a child would
 * inherit the blend and invert the overlay itself. The bar sits above the
 * overlay (z-50 vs z-40) so the same trigger opens and closes it.
 */
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
    window.__lenis?.stop?.()
    return () => {
      document.body.style.overflow = prev
      window.__lenis?.start?.()
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
    <>
      <header className="fixed inset-x-0 top-0 z-50 text-white mix-blend-difference">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6 md:h-20 md:px-10 lg:px-14">
          <Link to="/" aria-label="Varad Patil — Home" onClick={close} className="block py-2">
            <ElasticText
              text="VARAD PATIL"
              label=""
              idle="rest"
              reach={2.6}
              width={[85, 145]}
              weight={[700, 900]}
              className="text-[1.35rem] md:text-[1.6rem]"
            />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className="nav-underline py-2 font-display text-[1.02rem] font-semibold [font-stretch:112%]"
              >
                {l.label}
              </NavLink>
            ))}
            {/* Résumé is a static file in public/, not a route — plain <a>. */}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="nav-underline inline-flex items-center gap-1 py-2 font-display text-[1.02rem] font-semibold [font-stretch:112%]"
            >
              Résumé
              <ArrowUpRight size={15} strokeWidth={2.2} />
            </a>
          </nav>

          <button
            ref={triggerRef}
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center md:hidden"
          >
            {open ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {open && (
        <nav
          ref={navRef}
          id="mobile-nav"
          aria-label="Mobile"
          className="menu-drop fixed inset-0 z-40 flex flex-col justify-center bg-(--color-ink) px-6 pt-20 pb-10 md:hidden"
        >
          <ul className="flex flex-col gap-2">
            {[{ to: '/', label: 'Home' }, ...links].map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  onClick={close}
                  className={({ isActive }) =>
                    `block py-1 ${isActive ? 'text-(--color-pink)' : 'text-(--color-fg)'}`
                  }
                >
                  <ElasticText
                    text={l.label.toUpperCase()}
                    label={l.label}
                    idle="wave"
                    reach={1.4}
                    width={[70, 150]}
                    weight={[500, 900]}
                    className="text-[clamp(3rem,15vw,5rem)]"
                  />
                </NavLink>
              </li>
            ))}
          </ul>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            onClick={close}
            className="mt-10 inline-flex items-center gap-2 font-display text-(length:--fs-h4) font-semibold text-(--color-fg-muted)"
          >
            Résumé
            <ArrowUpRight size={18} strokeWidth={2} />
          </a>
        </nav>
      )}
    </>
  )
}
