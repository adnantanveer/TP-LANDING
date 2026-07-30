import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'

/**
 * Simple character-by-character typewriter reveal, gated by `play`. Used
 * for the Hero subhead, chained to start once the headline (ScrambleReveal)
 * resolves. Splitting by character only (no line-grouping) means there's no
 * viewport-width measurement involved, so it's safe to split and hide
 * immediately on mount. Reversing `play` back to false fades it back out.
 * `onComplete` fires once typing finishes, to chain the next reveal.
 */
export function TypewriterHeading({ as: Tag = 'h1', play, stagger = 0.035, onComplete, className = '', children }) {
  const ref = useRef(null)
  const splitRef = useRef(null)
  const tweenRef = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const split = new SplitType(el, { types: 'chars' })
    splitRef.current = split
    gsap.set(split.chars, { opacity: reducedMotion ? 1 : 0 })

    return () => {
      tweenRef.current?.kill()
      split.revert()
    }
  }, [])

  useLayoutEffect(() => {
    const split = splitRef.current
    if (!split) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (play) onComplete?.()
      return undefined
    }

    tweenRef.current?.kill()
    tweenRef.current = play
      ? gsap.to(split.chars, { opacity: 1, duration: 0.01, stagger, ease: 'none', onComplete })
      : gsap.to(split.chars, { opacity: 0, duration: 0.3, ease: 'power2.in' })

    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
