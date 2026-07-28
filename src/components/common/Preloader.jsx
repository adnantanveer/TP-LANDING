import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './Preloader.css'

const COUNT_DURATION = 1.6
const EXIT_DELAY = 0.15
const EXIT_DURATION = 0.9

/**
 * Full-screen agency-style intro: a percentage counter fills, then the whole
 * overlay slides away to reveal the hero underneath. `onComplete` fires the
 * instant the exit finishes, so the caller can start the hero's own reveal
 * in lockstep rather than guessing a delay. Skipped entirely under
 * prefers-reduced-motion — content is available immediately instead.
 */
export function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const countRef = useRef(null)
  const barRef = useRef(null)
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    if (reducedMotion) {
      onComplete()
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const counter = { value: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = previousOverflow
        ScrollTrigger.refresh()
        onComplete()
      },
    })

    tl.to(counter, {
      value: 100,
      duration: COUNT_DURATION,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (countRef.current) {
          countRef.current.textContent = String(Math.round(counter.value)).padStart(2, '0')
        }
      },
    })
    tl.to(barRef.current, { scaleX: 1, duration: COUNT_DURATION, ease: 'power2.inOut' }, 0)
    tl.to(
      rootRef.current,
      { yPercent: -100, duration: EXIT_DURATION, ease: 'power3.inOut' },
      `+=${EXIT_DELAY}`
    )

    return () => {
      document.body.style.overflow = previousOverflow
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (reducedMotion) return null

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="preloader__inner">
        <span className="preloader__word">
          techpotam<span className="preloader__dot">.</span>
        </span>
        <div className="preloader__count">
          <span ref={countRef}>00</span>
          <span className="preloader__percent">%</span>
        </div>
        <div className="preloader__bar-track">
          <span ref={barRef} className="preloader__bar-fill" />
        </div>
      </div>
    </div>
  )
}
