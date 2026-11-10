/**
 * RouteLoader — Suspense fallback while a lazy route chunk loads. A thin bar
 * that sweeps across; pure CSS, no state.
 */
export default function RouteLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      className="flex min-h-[60vh] w-full items-center justify-center"
    >
      <div className="route-loader" />
    </div>
  )
}
