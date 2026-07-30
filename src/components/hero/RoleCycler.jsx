import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './RoleCycler.css'

/**
 * Vertically crossfades through `words`, one at a time, forever. Under
 * prefers-reduced-motion the CSS keeps only the first word visible and this
 * effect never runs.
 */
export function RoleCycler({ words, interval = 2200 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el || words.length < 2) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const items = Array.from(el.children)
    gsap.set(items, { position: 'absolute', inset: 0, display: 'flex', yPercent: 100, opacity: 0 })
    gsap.set(items[0], { yPercent: 0, opacity: 1 })

    let current = 0
    const id = window.setInterval(() => {
      const next = (current + 1) % items.length
      gsap.to(items[current], { yPercent: -100, opacity: 0, duration: 0.5, ease: 'power2.inOut' })
      gsap.fromTo(
        items[next],
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.5, ease: 'power2.inOut' }
      )
      current = next
    }, interval)

    return () => window.clearInterval(id)
  }, [words, interval])

  return (
    <span className="role-cycler" ref={containerRef}>
      {words.map((word) => (
        <span className="role-cycler__word" key={word}>
          {word}
        </span>
      ))}
    </span>
  )
}
