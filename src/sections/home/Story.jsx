import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import { story } from '@/data/story.js'

gsap.registerPlugin(ScrollTrigger)

/**
 * Story — four chapters on the blue room.
 *
 * Desktop (≥768px): the section pins for one screen per chapter and scroll
 * steps through them; only the active chapter is shown. Mobile: no pin (it
 * fights native scroll and the address-bar resize), chapters simply stack.
 *
 * Pin safety: chapters animate their OWN transforms, never an ancestor of the
 * pinned section — a transformed ancestor would break the position:fixed pin
 * (see CLAUDE.md).
 */
export default function Story() {
  const sectionRef = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const mm = gsap.matchMedia()
    mm.add('(min-width: 768px)', () => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * (story.length - 0.5)}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(story.length - 1, Math.floor(self.progress * story.length))
          setActive((prev) => (prev === i ? prev : i))
        },
      })
      return () => st.kill()
    })
    // Fonts change line heights above this section; re-measure once they land.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => mm.revert()
  }, [])

  return (
    <section
      id="story"
      ref={sectionRef}
      aria-label="The story so far"
      className="room-blue relative overflow-hidden md:h-[100svh]"
    >
      <div className="relative mx-auto h-full w-full max-w-[1400px] px-6 md:px-10 lg:px-14">
        {story.map((c, i) => (
          <article
            key={c.id}
            className="story-chapter flex flex-col justify-center py-20 md:py-0"
            data-active={i === active}
          >
            <p className="font-display text-(length:--fs-h4) font-bold tabular-nums [font-stretch:118%] text-(--color-pink)">
              {c.when}
            </p>
            <ElasticText
              as="h2"
              text={c.word}
              label={`${c.word.charAt(0)}${c.word.slice(1).toLowerCase()}: ${c.title}`}
              reach={1.2}
              width={[74, 150]}
              weight={[400, 900]}
              className="mt-3 text-[clamp(3rem,12vw,12.5rem)] text-(--color-fg)"
            />
            <div className="mt-6 grid max-w-3xl gap-3 md:mt-10">
              <p className="font-display text-(length:--fs-h3) font-bold [font-stretch:112%] text-(--color-fg)">
                {c.title}
              </p>
              <p className="text-(length:--fs-body) leading-relaxed text-(--color-fg-muted)">{c.body}</p>
            </div>
          </article>
        ))}

        {/* Progress: the four years, current one lit. Desktop only (mobile stacks). */}
        <ol className="absolute inset-x-6 bottom-8 hidden gap-2 md:inset-x-10 md:grid md:grid-cols-4 lg:inset-x-14">
          {story.map((c, i) => (
            <li key={c.id} className="grid gap-2">
              <span
                className={`h-[3px] transition-colors duration-500 ${
                  i <= active ? 'bg-(--color-fg)' : 'bg-(--color-line)'
                }`}
              />
              <span
                className={`text-(length:--fs-sm) tabular-nums transition-colors duration-500 ${
                  i === active ? 'text-(--color-fg)' : 'text-(--color-fg-muted)'
                }`}
              >
                {c.when}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
