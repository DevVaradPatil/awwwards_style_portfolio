/**
 * GradientBlob — decorative violet/iris/cyan gradient orb.
 * Pure CSS, GPU-friendly. Slow drift via keyframes.
 */
let blobId = 0

export default function GradientBlob({
  size = 480,
  className = '',
  style = {},
  variant = 'violet', // violet | cyan | iris
  blur = 120,
  opacity = 0.6,
}) {
  const id = `blob-${++blobId}`
  const palette = {
    violet: ['#7C5BFF', '#B07BFF'],
    iris: ['#B07BFF', '#5BE4FF'],
    cyan: ['#5BE4FF', '#7C5BFF'],
  }
  const [a, b] = palette[variant] ?? palette.violet

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
      style={{
        width: size,
        height: size,
        filter: `blur(${blur}px)`,
        opacity,
        animation: `${id}-drift 18s ease-in-out infinite`,
        background: `radial-gradient(circle at 30% 30%, ${a} 0%, ${b} 45%, transparent 70%)`,
        borderRadius: '9999px',
        ...style,
      }}
    >
      <style>{`
        @keyframes ${id}-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(4%, -3%, 0) scale(1.08); }
        }
      `}</style>
    </div>
  )
}
