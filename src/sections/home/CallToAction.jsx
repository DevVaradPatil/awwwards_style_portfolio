import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import { contact } from '@/data/socials.js'

/** The pink room: one giant elastic "LET'S TALK" that is itself the link. */
export default function CallToAction() {
  return (
    <section aria-label="Get in touch" className="room-pink relative overflow-hidden py-24 md:py-36">
      <Link to="/contact" className="block" aria-label="Let's talk — go to the contact page">
        <ElasticText
          text="LET'S TALK"
          label=""
          aria-hidden="true"
          reach={1.1}
          width={[62, 150]}
          weight={[400, 900]}
          className="text-center text-[clamp(3.5rem,14.5vw,15rem)] text-(--color-ink)"
        />
      </Link>

      <div className="mx-auto mt-10 flex max-w-[1400px] flex-col items-center gap-6 px-6 text-center md:mt-14">
        <p className="max-w-lg text-(length:--fs-h4) text-(--color-fg-muted)">
          Freelance work, product builds, research collaborations. I reply within a day.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <MagneticButton variant="ink" to="/contact">
            Start a project
            <ArrowUpRight size={16} strokeWidth={2.2} />
          </MagneticButton>
          <a
            href={`mailto:${contact.email}`}
            className="link-underline break-all font-display text-(length:--fs-sm) font-bold [font-stretch:115%] text-(--color-ink)"
          >
            {contact.email}
          </a>
        </div>
      </div>
    </section>
  )
}
