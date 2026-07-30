import { useEffect } from 'react'
import gsap from 'gsap'

/**
 * Pulls an element toward the pointer while hovered, snapping back on leave.
 * No-ops on coarse pointers / reduced motion — same guard as useTilt.
 */
export function useMagnetic(ref, { strength = 0.35, max = 18 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    if (window.matchMedia('(pointer: coarse)').matches) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const setX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const setY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = e.clientX - (rect.left + rect.width / 2)
      const py = e.clientY - (rect.top + rect.height / 2)
      setX(gsap.utils.clamp(-max, max, px * strength))
      setY(gsap.utils.clamp(-max, max, py * strength))
    }

    const onLeave = () => {
      setX(0)
      setY(0)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, strength, max])
}
