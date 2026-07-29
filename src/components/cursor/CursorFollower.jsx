import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './CursorFollower.css'

const HOVER_SELECTOR = 'a, button, [data-cursor-hover]'

/** Pointer-follow glow + dot. Only ever mounted for fine-pointer, motion-safe visitors. */
export function CursorFollower() {
  const dotRef = useRef(null)
  const glowRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const glow = glowRef.current
    const label = labelRef.current
    if (!dot || !glow || !label) return undefined

    const setDotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
    const setDotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
    const setGlowX = gsap.quickTo(glow, 'x', { duration: 0.45, ease: 'power3.out' })
    const setGlowY = gsap.quickTo(glow, 'y', { duration: 0.45, ease: 'power3.out' })
    const setLabelX = gsap.quickTo(label, 'x', { duration: 0.35, ease: 'power3.out' })
    const setLabelY = gsap.quickTo(label, 'y', { duration: 0.35, ease: 'power3.out' })

    const onMove = (e) => {
      // Keeps the follower hidden until the pointer actually moves, so it
      // never flashes at its default (0,0) position on load or on touch.
      dot.classList.add('is-visible')
      glow.classList.add('is-visible')
      setDotX(e.clientX)
      setDotY(e.clientY)
      setGlowX(e.clientX)
      setGlowY(e.clientY)
      setLabelX(e.clientX)
      setLabelY(e.clientY)
    }

    const onOver = (e) => {
      const target = e.target.closest?.(HOVER_SELECTOR)
      if (target) {
        glow.classList.add('is-hovering')
        dot.classList.add('is-hovering')
        const text = target.dataset.cursorLabel
        if (text) {
          label.textContent = text
          label.classList.add('is-visible')
        }
      }
    }
    const onOut = (e) => {
      if (e.target.closest?.(HOVER_SELECTOR)) {
        glow.classList.remove('is-hovering')
        dot.classList.remove('is-hovering')
        label.classList.remove('is-visible')
      }
    }
    const onDown = () => glow.classList.add('is-pressed')
    const onUp = () => glow.classList.remove('is-pressed')

    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <div aria-hidden="true">
      <span ref={glowRef} className="cursor-glow" />
      <span ref={dotRef} className="cursor-dot" />
      <span ref={labelRef} className="cursor-label" />
    </div>
  )
}
