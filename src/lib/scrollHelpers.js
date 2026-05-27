import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * fadeUp — simple on-enter reveal (kept lightweight for one-off uses;
 * prefer the <Reveal> primitive for composition).
 */
export function fadeUp(target, { delay = 0, y = 32, duration = 0.9, once = true } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return null
  gsap.set(el, { opacity: 0, y })
  return ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once,
    onEnter: () => {
      gsap.to(el, { opacity: 1, y: 0, duration, delay, ease: 'expo.out' })
    },
  })
}

/**
 * scrubTimeline — build a gsap.timeline already wired with a scrub ScrollTrigger.
 * Caller fills the timeline with .to / .from / .fromTo calls.
 */
export function scrubTimeline(trigger, { start = 'top top', end = '+=100%', pin = false, scrub = 1 } = {}) {
  const el = typeof trigger === 'string' ? document.querySelector(trigger) : trigger
  if (!el) return gsap.timeline()
  return gsap.timeline({
    scrollTrigger: { trigger: el, start, end, pin, scrub },
  })
}

/**
 * pinSection — pin an element across its scroll range without any animation.
 */
export function pinSection(trigger, { start = 'top top', end = '+=100%' } = {}) {
  const el = typeof trigger === 'string' ? document.querySelector(trigger) : trigger
  if (!el) return null
  return ScrollTrigger.create({ trigger: el, start, end, pin: true })
}

/**
 * killAll — convenience teardown for hot-reload / unmount safety.
 */
export function killAllScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill())
}
