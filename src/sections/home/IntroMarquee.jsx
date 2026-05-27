import Marquee from '@/components/primitives/Marquee.jsx'

const words = ['Code', 'Design', 'Create', 'Ship', 'Iterate', 'Open-Source', 'AI-Aware']

export default function IntroMarquee() {
  return (
    <section className="border-y border-(--color-stroke) bg-(--color-raise)/40 py-10 md:py-14">
      <Marquee speed={70}>
        {words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            className="flex items-center gap-10 font-display text-(length:--fs-h1) text-(--color-ink-100)"
          >
            <span>{w}</span>
            <span className="inline-block h-2.5 w-2.5 rounded-full brand-gradient-surface" />
          </span>
        ))}
      </Marquee>
    </section>
  )
}
