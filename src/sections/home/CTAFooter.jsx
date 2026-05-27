import { ArrowUpRight, Mail } from 'lucide-react'
import Container from '@/components/system/Container.jsx'
import SplitText from '@/components/primitives/SplitText.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import GradientBlob from '@/components/primitives/GradientBlob.jsx'
import { contact, socials } from '@/data/socials.js'

export default function CTAFooter() {
  return (
    <section className="relative overflow-hidden py-40">
      <GradientBlob
        variant="violet"
        size={720}
        blur={160}
        opacity={0.4}
        className="top-[-200px] left-1/2 -translate-x-1/2"
      />
      <GradientBlob
        variant="cyan"
        size={520}
        blur={140}
        opacity={0.25}
        className="bottom-[-180px] right-[-120px]"
      />

      <Container className="relative text-center">
        <p className="font-mono text-(length:--fs-xs) uppercase tracking-[0.4em] text-(--color-ink-60)">
          05 · Let&apos;s build
        </p>
        <h2 className="mx-auto mt-8 max-w-5xl font-display text-(length:--fs-display) leading-[1.02]">
          <SplitText by="word">Have an idea?</SplitText>
          <br />
          <SplitText by="word" className="brand-gradient-text">
            Let&apos;s ship it.
          </SplitText>
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-(--color-ink-60)">
          Open to freelance projects, AI builds, and ambitious product work.
          Reply within 24 hours.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton variant="solid" to="/contact">
            Start a project
            <ArrowUpRight size={16} strokeWidth={2} />
          </MagneticButton>
          <MagneticButton variant="ghost" href={`mailto:${contact.email}`}>
            <Mail size={14} strokeWidth={2} />
            {contact.email}
          </MagneticButton>
        </div>

        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-(length:--fs-xs) uppercase tracking-[0.3em] text-(--color-ink-30)">
          {socials.map((s) => (
            <a
              key={s.id}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-(--color-ink-100)"
            >
              {s.label} ↗
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}
