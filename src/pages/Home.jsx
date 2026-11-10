import Hero from '@/sections/home/Hero.jsx'
import Story from '@/sections/home/Story.jsx'
import WorkShowcase from '@/sections/home/WorkShowcase.jsx'
import Toolbox from '@/sections/home/Toolbox.jsx'
import CallToAction from '@/sections/home/CallToAction.jsx'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

/** Home tells the story in order: name → four chapters → work → toolbox → talk. */
export default function Home() {
  useDocumentMeta(pageMeta.home)
  return (
    <>
      <Hero />
      <Story />
      <WorkShowcase />
      <Toolbox />
      <CallToAction />
    </>
  )
}
