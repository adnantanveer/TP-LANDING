import { useEffect, useRef, useState } from 'react'

/**
 * Animates 0 -> target once, starting when `ref` enters the viewport.
 * Uses requestAnimationFrame directly (no layout-affecting properties involved).
 */
export function useCountUp(target, { duration = 1400 } = {}) {
  const ref = useRef(null)
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const run = () => {
      if (startedRef.current) return
      startedRef.current = true

      if (prefersReduced) {
        setValue(target)
        return
      }

      const start = performance.now()
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) run()
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return [ref, value]
}
