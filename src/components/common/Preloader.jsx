import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Icon } from './Icon'
import logo from '../../assets/techpotam-logo.png'
import './Preloader.css'

const COUNT_DURATION = 2
const EXIT_DELAY = 0.2
const EXIT_DURATION = 0.9
const RING_RADIUS = 72
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const DISCIPLINES = [
  { label: 'Design', icon: 'discipline-design-icon', at: 25 },
  { label: 'Engineering', icon: 'discipline-code-icon', at: 50 },
  { label: 'Cloud', icon: 'discipline-cloud-icon', at: 75 },
  { label: 'AI', icon: 'path-ai-icon', at: 100 },
]

/**
 * Full-screen agency-style intro: a faceted vector mark spins inside a
 * circular progress ring while a row of discipline icons lights up as the
 * count passes each milestone, then the whole overlay slides away to reveal
 * the hero. `onComplete` fires the instant the exit finishes, so the caller
 * can start the hero's own reveal in lockstep rather than guessing a delay.
 * Skipped entirely under prefers-reduced-motion — content is available
 * immediately instead.
 */
export function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const countRef = useRef(null)
  const ringRef = useRef(null)
  const glyphOuterRef = useRef(null)
  const glyphInnerRef = useRef(null)
  const chipRefs = useRef([])
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

    gsap.set(ringRef.current, {
      strokeDasharray: RING_CIRCUMFERENCE,
      strokeDashoffset: RING_CIRCUMFERENCE,
    })

    const spin = gsap.timeline({ repeat: -1 })
    spin.to(glyphOuterRef.current, { rotate: 360, svgOrigin: '80 80', duration: 9, ease: 'none' }, 0)
    spin.to(glyphInnerRef.current, { rotate: -360, svgOrigin: '80 80', duration: 6, ease: 'none' }, 0)

    const counter = { value: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        spin.kill()
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
        const value = counter.value
        if (countRef.current) {
          countRef.current.textContent = String(Math.round(value)).padStart(2, '0')
        }
        gsap.set(ringRef.current, { strokeDashoffset: RING_CIRCUMFERENCE * (1 - value / 100) })
        chipRefs.current.forEach((chip, i) => {
          chip?.classList.toggle('is-active', value >= DISCIPLINES[i].at)
        })
      },
    })
    tl.to(
      rootRef.current,
      { yPercent: -100, duration: EXIT_DURATION, ease: 'power3.inOut' },
      `+=${EXIT_DELAY}`
    )

    return () => {
      document.body.style.overflow = previousOverflow
      spin.kill()
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (reducedMotion) return null

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <div className="preloader__inner">
        <img src={logo} alt="TechPotam" className="preloader__word" />

        <div className="preloader__mark">
          <svg className="preloader__ring-svg" viewBox="0 0 160 160">
            <circle className="preloader__ring-track" cx="80" cy="80" r={RING_RADIUS} />
            <circle
              ref={ringRef}
              className="preloader__ring-fill"
              cx="80"
              cy="80"
              r={RING_RADIUS}
              transform="rotate(-90 80 80)"
            />
          </svg>

          <svg className="preloader__glyph" viewBox="0 0 160 160">
            <polygon
              ref={glyphOuterRef}
              className="preloader__glyph-outer"
              points="80,34 120,57 120,103 80,126 40,103 40,57"
            />
            <polygon
              ref={glyphInnerRef}
              className="preloader__glyph-inner"
              points="80,57 100,69 100,91 80,103 60,91 60,69"
            />
          </svg>

          <div className="preloader__count">
            <span ref={countRef}>00</span>
            <span className="preloader__percent">%</span>
          </div>
        </div>

        <div className="preloader__disciplines">
          {DISCIPLINES.map((d, i) => (
            <span key={d.label} ref={(el) => (chipRefs.current[i] = el)} className="preloader__chip">
              <Icon name={d.icon} size={18} />
              <span>{d.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
