import { ArrowDown } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'

const VERBS = ['BUILDS', 'DESIGNS', 'SHIPS', 'RESEARCHES']

/**
 * Hero — pure elastic type. The name fills the screen; one pink line under it
 * rewrites itself. The real heading text lives in an sr-only span.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden bg-(--color-ink) pt-24 pb-10 md:pt-28">
      <h1 className="font-normal">
        <span className="sr-only">Varad Patil — developer, designer and AI builder</span>
        <ElasticText
          text="VARAD"
          label=""
          aria-hidden="true"
          reach={1.15}
          width={[78, 150]}
          weight={[300, 900]}
          className="text-center text-[clamp(5.5rem,22vw,24rem)] text-(--color-fg)"
        />
        <ElasticText
          text="PATIL"
          label=""
          aria-hidden="true"
          reach={1.15}
          width={[78, 150]}
          weight={[300, 900]}
          className="text-center text-[clamp(5.5rem,22vw,24rem)] text-(--color-fg)"
        />
      </h1>

      <ElasticText
        as="p"
        words={VERBS}
        interval={2600}
        label="Builds, designs, ships and researches."
        reach={1.6}
        width={[70, 150]}
        weight={[400, 900]}
        className="mt-4 text-center text-[clamp(2.4rem,8vw,7rem)] text-(--color-pink) md:mt-6"
      />

      <div className="mx-auto mt-12 flex w-full max-w-[1400px] flex-col items-start justify-between gap-6 px-6 md:mt-16 md:flex-row md:items-end md:px-10 lg:px-14">
        <p className="max-w-md text-(length:--fs-body) text-(--color-fg-muted)">
          Full-stack developer and AI builder. Now doing an M.Tech in{' '}
          <span className="text-(--color-fg)">AI for Sustainability at IIT Kanpur</span>.
        </p>
        <a
          href="#story"
          onClick={(e) => {
            // Lenis owns scrolling on desktop; a native anchor jump desyncs it.
            const target = document.getElementById('story')
            if (!target) return
            e.preventDefault()
            if (window.__lenis) window.__lenis.scrollTo(target)
            else target.scrollIntoView({ behavior: 'smooth' })
          }}
          className="inline-flex items-center gap-2 font-display text-(length:--fs-sm) font-bold [font-stretch:118%] text-(--color-fg) transition-colors hover:text-(--color-pink)"
        >
          The story so far
          <ArrowDown size={16} strokeWidth={2.2} />
        </a>
      </div>
    </section>
  )
}
