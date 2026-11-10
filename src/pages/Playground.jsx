import { useId, useState } from 'react'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import WorkRing from '@/components/primitives/WorkRing.jsx'
import CodePortrait from '@/components/primitives/CodePortrait.jsx'
import LiquidName from '@/components/primitives/LiquidName.jsx'
import creator from '@/assets/creator.jpg'
import { featuredProjects } from '@/data/projects.js'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

const wrap = 'mx-auto max-w-[1400px] px-6 md:px-10 lg:px-14'

/** Motion Lab (/playground): the site's four motion pieces, standalone. */
export default function Playground() {
  useDocumentMeta(pageMeta.playground)
  return (
    <>
      <section className="bg-(--color-ink) pt-28 pb-16 md:pt-36 md:pb-20">
        <div className={wrap}>
          <h1 className="font-normal">
            <span className="sr-only">Motion Lab</span>
            <ElasticText
              text="LAB"
              label=""
              aria-hidden="true"
              reach={1.3}
              width={[70, 150]}
              weight={[350, 900]}
              className="text-[clamp(5rem,22vw,22rem)] text-(--color-fg)"
            />
          </h1>
          <p className="mt-6 max-w-2xl text-(length:--fs-h4) leading-relaxed text-(--color-fg-muted)">
            The motion pieces this site is built from, one at a time. Everything here is hand-written:
            no animation libraries beyond GSAP, no 3D engine.
          </p>
        </div>
      </section>

      <TypeTester />

      <Piece
        title="Liquid chrome"
        how="One WebGL fragment shader: domain-warped noise distorts a texture of the text, the pointer adds a ripple and splits the color channels."
      >
        <LiquidName className="h-[50svh] min-h-[320px] rounded-(--radius-lg) md:h-[64svh]" />
      </Piece>

      <Piece
        title="Code portrait"
        how="A real photo sampled into a grid and redrawn as colored characters on a 2D canvas. The pointer is a lens onto the original."
      >
        <div className="mx-auto max-w-md">
          <CodePortrait src={creator} alt="Portrait of Varad Patil, drawn in code characters" />
        </div>
      </Piece>

      <Piece
        title="Work ring"
        how="Plain CSS 3D transforms: every card is rotated around a shared axis. Drag adds momentum; the card facing you is found with a cosine."
        bleed
      >
        <WorkRing projects={featuredProjects} />
      </Piece>
    </>
  )
}

/** Elastic type, but you choose the word. */
function TypeTester() {
  const id = useId()
  const [value, setValue] = useState('ELASTIC')
  const shown = value.trim() ? value.toUpperCase() : 'TYPE'
  return (
    <section aria-label="Elastic type" className="room-blue overflow-hidden py-20 md:py-28">
      <div className={wrap}>
        <h2 className="text-(length:--fs-h2)">Elastic type</h2>
        <p className="mt-3 max-w-2xl text-(--color-fg-muted)">
          A variable font with two axes, width and weight, set per letter every frame from the pointer
          distance. Type your own word, then move over it.
        </p>
        <label htmlFor={id} className="mt-8 block text-(length:--fs-sm) font-semibold text-(--color-fg-muted)">
          Your word
        </label>
        <input
          id={id}
          value={value}
          maxLength={12}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 w-full max-w-sm border-0 border-b-2 border-(--color-line) bg-transparent px-0 py-2 font-display text-(length:--fs-h3) font-bold uppercase text-(--color-fg) outline-none focus:border-(--color-pink)"
        />
      </div>
      <ElasticText
        as="p"
        text={shown}
        reach={1.3}
        width={[55, 150]}
        weight={[200, 900]}
        className="mt-10 text-center text-[clamp(3.5rem,13vw,13rem)] text-(--color-fg)"
      />
    </section>
  )
}

function Piece({ title, how, bleed = false, children }) {
  return (
    <section aria-label={title} className="border-t border-(--color-line) bg-(--color-ink) py-20 md:py-28">
      <div className={wrap}>
        <h2 className="text-(length:--fs-h2)">{title}</h2>
        <p className="mt-3 max-w-2xl text-(--color-fg-muted)">{how}</p>
      </div>
      <div className={bleed ? 'mt-10' : `${wrap} mt-10`}>{children}</div>
    </section>
  )
}
