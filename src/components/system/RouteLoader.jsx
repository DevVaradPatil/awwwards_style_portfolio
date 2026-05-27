export default function RouteLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="flex min-h-[60vh] w-full items-center justify-center"
    >
      <div className="relative h-10 w-10">
        <div
          className="absolute inset-0 rounded-full opacity-60 blur-xl brand-gradient-surface"
          style={{ animation: 'auroraPulse 1.4s ease-in-out infinite' }}
        />
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: 'var(--color-cyan)',
            borderRightColor: 'var(--color-iris)',
            animation: 'auroraSpin 0.9s linear infinite',
          }}
        />
      </div>
    </div>
  )
}
