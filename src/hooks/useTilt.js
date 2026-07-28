import { useEffect } from 'react'
import gsap from 'gsap'

/**
 * Subtle pointer-driven tilt on a card. No-ops on coarse pointers / reduced motion.
 */
export function useTilt(ref, { max = 6, scale = 1.02, disabled = false } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el || disabled) return undefined
    if (window.matchMedia('(pointer: coarse)').matches) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const setX = gsap.quickTo(el, 'rotateY', { duration: 0.5, ease: 'power3.out' })
    const setY = gsap.quickTo(el, 'rotateX', { duration: 0.5, ease: 'power3.out' })
    const setScale = gsap.quickTo(el, 'scale', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      setX(px * max)
      setY(-py * max)
      setScale(scale)
    }

    const onLeave = () => {
      setX(0)
      setY(0)
      setScale(1)
    }

    el.style.transformStyle = 'preserve-3d'
    el.style.transformPerspective = '900px'
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, max, scale, disabled])
}
