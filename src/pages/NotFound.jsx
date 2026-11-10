import { ArrowUpRight, Home } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

/** 404 — a giant elastic "404" you can squash with the pointer. */
export default function NotFound() {
  useDocumentMeta(pageMeta.notFound)
  return (
    <section className="flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-(--color-ink) px-6 pt-24 pb-16 text-center">
      <h1 className="font-normal">
        <span className="sr-only">404 — page not found</span>
        <ElasticText
          text="404"
          label=""
          aria-hidden="true"
          reach={1}
          width={[55, 150]}
          weight={[200, 900]}
          className="text-[clamp(8rem,34vw,30rem)] text-(--color-pink)"
        />
      </h1>
      <p className="mt-6 font-display text-(length:--fs-h3) font-bold [font-stretch:115%] text-(--color-fg)">
        This page doesn&apos;t exist.
      </p>
      <p className="mt-3 max-w-md text-(--color-fg-muted)">
        The link may be old or mistyped. Everything that does exist is one click away.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <MagneticButton variant="solid" to="/">
          <Home size={15} strokeWidth={2.2} />
          Back home
        </MagneticButton>
        <MagneticButton variant="ghost" to="/work">
          See the work
          <ArrowUpRight size={16} strokeWidth={2.2} />
        </MagneticButton>
      </div>
    </section>
  )
}
