export default function BrandedLoader({ label = 'Loading' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-(--color-void)"
    >
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative h-20 w-20">
          <div
            className="absolute inset-0 rounded-full opacity-70 blur-2xl brand-gradient-surface"
            style={{ animation: 'auroraPulse 1.6s ease-in-out infinite' }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, #7C5BFF 90deg, #5BE4FF 180deg, transparent 270deg)',
              mask: 'radial-gradient(circle, transparent 55%, #000 56%)',
              WebkitMask: 'radial-gradient(circle, transparent 55%, #000 56%)',
              animation: 'auroraSpin 1.2s linear infinite',
            }}
          />
          <div className="absolute inset-[28%] rounded-full brand-gradient-surface" />
        </div>
        <span className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
          {label}
        </span>
      </div>
    </div>
  )
}
