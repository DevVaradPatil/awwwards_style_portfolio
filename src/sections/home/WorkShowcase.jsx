import { ArrowUpRight } from 'lucide-react'
import ElasticText from '@/components/primitives/ElasticText.jsx'
import WorkRing from '@/components/primitives/WorkRing.jsx'
import MagneticButton from '@/components/primitives/MagneticButton.jsx'
import { featuredProjects, projects } from '@/data/projects.js'

export default function WorkShowcase() {
  return (
    <section aria-label="Selected work" className="relative overflow-hidden bg-(--color-ink) py-24 md:py-32">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between md:px-10 lg:px-14">
        <ElasticText
          as="h2"
          text="WORK"
          label="Selected work"
          reach={1.4}
          width={[62, 150]}
          weight={[350, 900]}
          className="text-[clamp(4rem,14vw,13rem)] text-(--color-fg)"
        />
        <p className="max-w-sm pb-3 text-(--color-fg-muted)">
          Drag the ring to look around. AI products, full-stack apps and Android apps that are live
          today.
        </p>
      </div>

      <WorkRing projects={featuredProjects} className="mt-6 md:mt-2" />

      <div className="mt-12 flex justify-center">
        <MagneticButton variant="ghost" to="/work">
          All {projects.length} projects
          <ArrowUpRight size={16} strokeWidth={2.2} />
        </MagneticButton>
      </div>
    </section>
  )
}
