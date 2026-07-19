import { Component } from 'react'

// Errors thrown when a lazy chunk 404s — typically after a redeploy invalidates
// the hashed asset the open tab still points at. Matching is intentionally broad
// across browsers (Chrome, Firefox, Safari all word this differently).
const CHUNK_ERROR_RE =
  /Loading chunk|Loading CSS chunk|dynamically imported module|Importing a module script failed|Failed to fetch dynamically imported/i

const RELOAD_FLAG = 'aurora:chunk-reload'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    // A stale-chunk error almost always resolves on a fresh load. Reload once,
    // guarded by sessionStorage so a genuinely-broken deploy can't loop forever.
    if (CHUNK_ERROR_RE.test(error?.message || '')) {
      if (!sessionStorage.getItem(RELOAD_FLAG)) {
        sessionStorage.setItem(RELOAD_FLAG, '1')
        window.location.reload()
      }
    }
  }

  handleReload = () => {
    sessionStorage.removeItem(RELOAD_FLAG)
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    // Chunk error with the reload already in flight — render nothing to avoid a flash.
    if (CHUNK_ERROR_RE.test(error?.message || '') && sessionStorage.getItem(RELOAD_FLAG)) {
      return null
    }

    return (
      <div
        role="alert"
        className="flex min-h-[70vh] w-full flex-col items-center justify-center px-6 text-center"
      >
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-30)">
          Aurora Compute · Error
        </p>
        <h1 className="mt-6 font-display text-(length:--fs-h2) text-(--color-ink-100)">
          Something broke on the way in.
        </h1>
        <p className="mt-4 max-w-md text-(length:--fs-sm) text-(--color-ink-60)">
          A part of the page failed to load. A quick reload usually sorts it out.
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="mt-8 rounded-(--radius-pill) border border-(--color-stroke-strong) bg-(--color-elev) px-6 py-3 font-mono text-(length:--fs-xs) uppercase tracking-[0.25em] text-(--color-ink-100) transition-colors hover:border-(--color-cyan) hover:text-(--color-cyan)"
        >
          Reload page
        </button>
      </div>
    )
  }
}
