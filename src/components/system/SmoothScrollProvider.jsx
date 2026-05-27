import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * SmoothScrollProvider — wires Lenis into gsap.ticker so ScrollTrigger stays in sync.
 *
 * Hard rules:
 *  - Disabled on coarse pointers (touch) so native scroll wins.
 *  - On route change: scroll to top instantly (no fight with framer page transition).
 */
export default function SmoothScrollProvider({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    if (isCoarse) return

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    })

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const tickerCb = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tickerCb)
    gsap.ticker.lagSmoothing(0)

    // expose for components that want to scrollTo with smoothness
    window.__lenis = lenis

    return () => {
      gsap.ticker.remove(tickerCb)
      lenis.off('scroll', onScroll)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])

  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
    // refresh triggers after layout settles
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return children
}
