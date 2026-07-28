import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Boots Lenis smooth-scroll and syncs it to GSAP's ticker + ScrollTrigger.
 * Pass `enabled=false` (e.g. from useSimplifiedMotion) to skip entirely and
 * fall back to native scrolling.
 */
export function useLenis(enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    // Keep Lenis's internal position in sync with the forced scroll-to-top
    // in main.jsx, so it never thinks it's somewhere the page isn't.
    lenis.scrollTo(0, { immediate: true })

    lenis.on('scroll', ScrollTrigger.update)

    const onTick = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(onTick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(onTick)
      lenis.destroy()
    }
  }, [enabled])
}
