import { ArrowUpRight, Home } from 'lucide-react'
import Container from '@/components/system/Container.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import Marquee from '@/components/primitives/Marquee.jsx'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

const lostWords = [
  '404',
  'Lost in transit',
  'Page not found',
  'Wrong turn',
  'Off the map',
  'Broken link',
]

export default function NotFound() {
  useDocumentMeta(pageMeta.notFound)
  return (
    <>
      <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-32 pb-20">
        <GradientBlob
          variant="violet"
          size={620}
          blur={160}
          opacity={0.4}
          className="top-[-180px] left-[-160px]"
        />
        <GradientBlob
          variant="cyan"
          size={520}
          blur={140}
          opacity={0.3}
          className="bottom-[-160px] right-[-120px]"
        />

        <Container className="relative text-center">
          <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
            Error · 404
          </p>

          <h1
            className="mt-8 font-display leading-none brand-gradient-text"
            style={{ fontSize: 'clamp(8rem, 28vw, 22rem)' }}
          >
            404
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-(length:--fs-h4) text-(--color-ink-100)">
            <SplitText by="word" trigger="mount">
              This page slipped through the seams of the grid.
            </SplitText>
          </p>
          <p className="mx-auto mt-4 max-w-xl text-(--color-ink-60)">
            The route you&apos;re looking for doesn&apos;t exist — yet. Let&apos;s get
            you back on the map.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <MagneticButton variant="solid" to="/">
              <Home size={14} strokeWidth={2} />
              Back home
            </MagneticButton>
            <MagneticButton variant="ghost" to="/work">
              Browse the work
              <ArrowUpRight size={16} strokeWidth={2} />
            </MagneticButton>
          </div>
        </Container>
      </section>

      <section
        aria-hidden="true"
        className="border-y border-(--color-stroke) bg-(--color-raise)/30 py-8"
      >
        <Marquee speed={80} gap={64}>
          {lostWords.map((w, i) => (
            <span
              key={`${w}-${i}`}
              className="flex items-center gap-10 font-display text-(length:--fs-h2) text-(--color-ink-30)"
            >
              <span>{w}</span>
              <span className="inline-block h-2 w-2 rounded-full brand-gradient-surface" />
            </span>
          ))}
        </Marquee>
      </section>
    </>
  )
}
