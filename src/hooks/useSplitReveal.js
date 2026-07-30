import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SplitType from 'split-type'

gsap.registerPlugin(ScrollTrigger)

/**
 * Splits the text inside `ref` into lines (SplitType) and reveals them with a
 * blur+fade+rise stagger. `immediate` skips the scroll trigger and plays on
 * mount (used for the Hero H1) — pass `play={false}` with `immediate` to hold
 * the reveal until a later trigger (e.g. the preloader finishing), then flip
 * `play` to true. Under prefers-reduced-motion the text is shown immediately
 * with no animation at all.
 *
 * For `immediate` mode, the actual SplitType measurement is deferred until
 * `play` is true, not done on mount: the Preloader locks `body { overflow:
 * hidden }` while it's up, which changes the viewport's effective width by
 * the scrollbar gutter. Measuring the Hero H1 while that lock is still on
 * commits SplitType to line groupings sized for a slightly wider viewport
 * than the one the text actually renders in once the lock lifts — the words
 * no longer fit their assigned line and wrap again inside it (a short,
 * ragged extra line). Waiting for `play` guarantees the measurement happens
 * after the preloader has already restored the real scroll state.
 */
export function useSplitReveal(ref, { immediate = false, play = true, delay = 0 } = {}) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || (immediate && !play)) return undefined

    let split
    let tween
    let cancelled = false

    const setup = () => {
      if (cancelled || !el) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      split = new SplitType(el, { types: 'lines,words', lineClass: 'split-line' })

      if (reducedMotion) {
        gsap.set(split.words, { opacity: 1, y: '0%', filter: 'blur(0px)' })
        return
      }

      gsap.set(split.words, { opacity: 0, y: '110%', filter: 'blur(6px)' })

      tween = gsap.to(split.words, {
        opacity: 1,
        y: '0%',
        filter: 'blur(0px)',
        duration: 1,
        delay,
        ease: 'power3.out',
        stagger: 0.045,
        scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 85%', once: true },
      })
    }

    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(setup)
    } else {
      setup()
    }

    return () => {
      cancelled = true
      tween?.scrollTrigger?.kill()
      tween?.kill()
      split?.revert()
    }
  }, [ref, immediate, play, delay])
}
