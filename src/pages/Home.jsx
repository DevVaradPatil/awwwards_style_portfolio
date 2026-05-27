import Hero from '@/sections/home/Hero.jsx'
import IntroMarquee from '@/sections/home/IntroMarquee.jsx'
import AboutTeaser from '@/sections/home/AboutTeaser.jsx'
import FeaturedWork from '@/sections/home/FeaturedWork.jsx'
import SkillsCloud from '@/sections/home/SkillsCloud.jsx'
import ManifestoScrub from '@/sections/home/ManifestoScrub.jsx'
import Stats from '@/sections/home/Stats.jsx'
import CTAFooter from '@/sections/home/CTAFooter.jsx'
import useDocumentMeta from '@/lib/useDocumentMeta.js'

export default function Home() {
  useDocumentMeta({
    title: null,
    description:
      'Varad Patil — Full-stack developer & AI enthusiast crafting fast, scalable, immersive web experiences. M.Tech AI for Sustainability, IIT Kanpur.',
    path: '/',
  })
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
