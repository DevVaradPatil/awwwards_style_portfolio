import { useRef } from 'react'
import { Link } from 'react-router-dom'

/**
 * MagneticButton — pointer-tracking magnetic pull.
 * Polymorphic: renders <Link>, <a>, or <button>.
 * Imperative transforms only — no React state, no re-renders.
 */
export default function MagneticButton({
  to,
  href,
  onClick,
  children,
  className = '',
  variant = 'solid', // solid | ghost | outline
  strength = 0.35,
  ...rest
}) {
  const wrapRef = useRef(null)
  const innerRef = useRef(null)

  const handleMove = (e) => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return
    const r = wrap.getBoundingClientRect()
    const x = (e.clientX - (r.left + r.width / 2)) * strength
    const y = (e.clientY - (r.top + r.height / 2)) * strength
    wrap.style.transform = `translate3d(${x}px, ${y}px, 0)`
    inner.style.transform = `translate3d(${x * 0.4}px, ${y * 0.4}px, 0)`
  }

  const handleLeave = () => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (wrap) wrap.style.transform = 'translate3d(0, 0, 0)'
    if (inner) inner.style.transform = 'translate3d(0, 0, 0)'
  }

  // Inline color guarantees the right contrast — bypasses any text-(...) parse ambiguity
  const variants = {
    solid: {
      cls: 'bg-(--color-ink-100) hover:bg-(--color-cyan) border border-transparent',
      style: { color: 'var(--color-void)' },
    },
    ghost: {
      cls: 'bg-(--color-elev) hover:bg-(--color-raise) border border-(--color-stroke-strong)',
      style: { color: 'var(--color-ink-100)' },
    },
    outline: {
      cls: 'border border-(--color-stroke-strong) hover:border-(--color-cyan) hover:text-(--color-cyan)',
      style: { color: 'var(--color-ink-100)' },
    },
  }
  const chosen = variants[variant] ?? variants.solid

  const base =
    'relative inline-flex items-center justify-center gap-2 rounded-(--radius-pill) px-7 py-3.5 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] transition-colors will-change-transform'

  const classes = `${base} ${chosen.cls} ${className}`

  const inner = (
    <span
      ref={innerRef}
      className="pointer-events-none inline-flex items-center gap-2 will-change-transform"
      style={{
        color: chosen.style.color,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </span>
  )

  const wrapperStyle = {
    ...chosen.style,
    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s, border-color 0.3s, color 0.3s',
  }

  if (to) {
    return (
      <Link
        to={to}
        ref={wrapRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className={classes}
        style={wrapperStyle}
        {...rest}
      >
        {inner}
      </Link>
    )
  }

  if (href) {
    return (
      <a
        href={href}
        ref={wrapRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        className={classes}
        style={wrapperStyle}
        {...rest}
      >
        {inner}
      </a>
    )
  }

  return (
    <button
      type="button"
      ref={wrapRef}
      onClick={onClick}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={classes}
      style={wrapperStyle}
      {...rest}
    >
      {inner}
    </button>
  )
}
