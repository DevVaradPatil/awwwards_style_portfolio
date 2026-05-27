import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import PageTransition from '@/components/system/PageTransition.jsx'
import RouteLoader from '@/components/system/RouteLoader.jsx'
import Home from '@/pages/Home.jsx'

const Work = lazy(() => import('@/pages/Work.jsx'))
const CaseStudy = lazy(() => import('@/pages/CaseStudy.jsx'))
const About = lazy(() => import('@/pages/About.jsx'))
const Playground = lazy(() => import('@/pages/Playground.jsx'))
const Contact = lazy(() => import('@/pages/Contact.jsx'))
const NotFound = lazy(() => import('@/pages/NotFound.jsx'))

export default function AppRouter() {
  const location = useLocation()
  return (
    <PageTransition>
      <Suspense fallback={<RouteLoader />}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<CaseStudy />} />
          <Route path="/about" element={<About />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </PageTransition>
  )
}
