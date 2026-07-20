import Hero from '@/sections/home/Hero.jsx'
import IntroMarquee from '@/sections/home/IntroMarquee.jsx'
import AboutTeaser from '@/sections/home/AboutTeaser.jsx'
import FeaturedWork from '@/sections/home/FeaturedWork.jsx'
import SkillsCloud from '@/sections/home/SkillsCloud.jsx'
import ManifestoScrub from '@/sections/home/ManifestoScrub.jsx'
import Stats from '@/sections/home/Stats.jsx'
import CTAFooter from '@/sections/home/CTAFooter.jsx'
import useDocumentMeta from '@/lib/useDocumentMeta.js'
import { pageMeta } from '@/data/siteMeta.js'

export default function Home() {
  useDocumentMeta(pageMeta.home)
  return (
    <>
      <Hero />
      <IntroMarquee />
      <AboutTeaser />
      <FeaturedWork />
      <SkillsCloud />
      <ManifestoScrub />
      <Stats />
      <CTAFooter />
    </>
  )
}
