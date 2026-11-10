import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import WorkRing from '@/components/primitives/WorkRing.jsx'
import { projects, projectTags } from '@/data/projects.js'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

const FILTERS = ['All', ...projectTags]
const years = projects.map((p) => p.year).filter(Boolean)
const span = `${Math.min(...years)}–${Math.max(...years)}`

export default function Work() {
  useDocumentMeta(pageMeta.work)
  const [filter, setFilter] = useState('All')

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.tags.includes(filter))),
    [filter],
  )

  return (
    <>
      <section className="relative overflow-hidden bg-(--color-ink) pt-32 pb-10 md:pt-40">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14">
          <h1 className="font-normal">
            <span className="sr-only">Selected work</span>
            <ElasticText
              text="WORK"
              label=""
              aria-hidden="true"
              reach={1.3}
              width={[70, 150]}
              weight={[350, 900]}
              className="text-[clamp(5rem,20vw,20rem)] text-(--color-fg)"
            />
          </h1>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-xl text-(length:--fs-h4) text-(--color-fg-muted)">
              {projects.length} projects, {span}. AI products, full-stack apps, Android apps, client
              sites and experiments. Drag the ring or use the list below.
            </p>
            <FilterBar value={filter} onChange={setFilter} />
          </div>
        </div>

        {/* Re-key so the ring re-lays-out for the new card count. */}
        <WorkRing key={filter} projects={visible} className="mt-6 md:mt-10" />
      </section>

      <section aria-label="Project index" className="room-bone py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-(length:--fs-h2)">Index</h2>
            <p className="text-(length:--fs-sm) tabular-nums text-(--color-type-muted)">
              {visible.length} {visible.length === 1 ? 'project' : 'projects'}
              {filter !== 'All' && ` · ${filter}`}
            </p>
          </div>
          <ProjectIndex items={visible} />
        </div>
      </section>
    </>
  )
}

function FilterBar({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-x-5 gap-y-2">
      {FILTERS.map((f) => {
        const active = f === value
        return (
          <button
            key={f}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(f)}
            className={`nav-underline py-1 font-display text-(length:--fs-sm) font-bold [font-stretch:115%] transition-colors ${
              active ? 'text-(--color-pink)' : 'text-(--color-fg-muted) hover:text-(--color-fg)'
            }`}
          >
            {f}
          </button>
        )
      })}
    </div>
  )
}

/**
 * The list view: one row per project. On fine pointers, hovering a row shows
 * its screenshot floating beside the cursor.
 */
function ProjectIndex({ items }) {
  const previewRef = useRef(null)
  const [hovered, setHovered] = useState(null)

  const move = (e) => {
    const el = previewRef.current
    if (!el) return
    el.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 90}px, 0)`
  }

  return (
    <div className="relative mt-10" onPointerMove={move} onPointerLeave={() => setHovered(null)}>
      <ul className="border-b border-(--color-line)">
        {items.map((p) => (
          <li key={p.slug} className="border-t border-(--color-line)">
            <Link
              to={`/work/${p.slug}`}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(p)}
              className="group grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 py-5 md:grid-cols-[5rem_1fr_16rem_auto] md:py-6"
            >
              <span className="text-(length:--fs-sm) tabular-nums text-(--color-type-muted)">{p.year}</span>
              <span className="min-w-0 font-display text-(length:--fs-h3) font-extrabold [font-stretch:118%] text-(--color-type) transition-[color,transform] duration-300 group-hover:translate-x-2 group-hover:text-(--color-blue)">
                {p.title}
              </span>
              <span className="hidden text-(length:--fs-sm) text-(--color-type-muted) md:block">
                {p.tags.join(' · ')}
              </span>
              <ArrowUpRight
                size={22}
                strokeWidth={2.2}
                className="text-(--color-type) transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </Link>
          </li>
        ))}
      </ul>
      {items.length === 0 && (
        <p className="py-16 text-center text-(--color-type-muted)">No projects under this filter yet.</p>
      )}

      {/* Floating preview — decorative, mouse only. */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className={`pointer-events-none fixed top-0 left-0 z-30 hidden w-72 transition-opacity duration-200 md:block ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {hovered && (
          <img
            src={hovered.image}
            alt=""
            className="aspect-[16/10] w-full rounded-(--radius-md) object-cover object-top shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
          />
        )}
      </div>
    </div>
  )
}
