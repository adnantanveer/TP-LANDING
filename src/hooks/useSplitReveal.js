import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

/**
 * Splits the text inside `ref` into lines (SplitType) and reveals them with a
 * blur+fade+rise stagger. `immediate` skips the scroll trigger and plays on
 * mount (used for the Hero H1) — pass `play={false}` with `immediate` to hold
 * the reveal paused until a later trigger (e.g. the preloader finishing),
 * then flip `play` to true. Under prefers-reduced-motion the text is shown
 * immediately with no animation at all.
 */
export function useSplitReveal(ref, { immediate = false, play = true, delay = 0 } = {}) {
  const tweenRef = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const split = new SplitType(el, { types: 'lines,words', lineClass: 'split-line' })

    if (reducedMotion) {
      gsap.set(split.words, { opacity: 1, y: '0%', filter: 'blur(0px)' })
      return () => split.revert()
    }

    gsap.set(split.words, { opacity: 0, y: '110%', filter: 'blur(6px)' })

    const tween = gsap.to(split.words, {
      opacity: 1,
      y: '0%',
      filter: 'blur(0px)',
      duration: 1,
      delay,
      ease: 'power3.out',
      stagger: 0.045,
      paused: immediate ? !play : false,
      scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 85%', once: true },
    })
    tweenRef.current = tween

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
      split.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, immediate, delay])

  useLayoutEffect(() => {
    if (immediate && play) {
      tweenRef.current?.play()
    }
  }, [immediate, play])
}
