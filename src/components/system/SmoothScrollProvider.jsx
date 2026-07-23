import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
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
  const location = useLocation()
  const navType = useNavigationType()
  const positions = useRef(new Map())

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

  // Own scroll restoration (SPA + custom scroll fights the browser's).
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) return
    const prev = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = prev
    }
  }, [])

  // Remember the scroll position of the current history entry as it's scrolled.
  useEffect(() => {
    const key = location.key
    const save = () => positions.current.set(key, window.scrollY)
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      save() // capture final position of the outgoing entry before we leave
      window.removeEventListener('scroll', save)
    }
  }, [location.key])

  // On navigation: restore saved position for Back/Forward (POP), else top.
  useEffect(() => {
    const target = navType === 'POP' ? positions.current.get(location.key) ?? 0 : 0
    if (window.__lenis) {
      window.__lenis.scrollTo(target, { immediate: true })
    } else {
      window.scrollTo(0, target)
    }
    // refresh triggers after layout settles
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [location.key, navType])

  return children
}
