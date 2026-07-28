import { useEffect, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const COARSE_POINTER_QUERY = '(pointer: coarse)'
const NARROW_VIEWPORT_QUERY = '(max-width: 900px)'

function readSimplified() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return (
    window.matchMedia(REDUCED_MOTION_QUERY).matches ||
    window.matchMedia(COARSE_POINTER_QUERY).matches ||
    window.matchMedia(NARROW_VIEWPORT_QUERY).matches
  )
}

/**
 * Single source of truth for "skip the cinematic/hijack treatment":
 * true under prefers-reduced-motion, coarse (touch) pointers, or narrow viewports.
 * Every scroll-hijack section and the cursor follower/Lenis setup gate off this hook.
 */
export function useSimplifiedMotion() {
  const [simplified, setSimplified] = useState(readSimplified)

  useEffect(() => {
    const queries = [REDUCED_MOTION_QUERY, COARSE_POINTER_QUERY, NARROW_VIEWPORT_QUERY].map((q) =>
      window.matchMedia(q)
    )
    const update = () => setSimplified(readSimplified())
    queries.forEach((mq) => mq.addEventListener('change', update))
    update()
    return () => queries.forEach((mq) => mq.removeEventListener('change', update))
  }, [])

  return simplified
}
