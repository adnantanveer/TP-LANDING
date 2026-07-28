import { useEffect, useRef, useState } from 'react'
import { testimonials } from '../../data/testimonials'
import { VideoBlock } from '../common/VideoBlock'
import { SplitHeading } from '../common/SplitHeading'
import { Icon } from '../common/Icon'
import './Testimonials.css'

export function Testimonials() {
  const [index, setIndex] = useState(0)
  const total = testimonials.length
  const hoveringRef = useRef(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined
    const id = setInterval(() => {
      if (!hoveringRef.current) setIndex((i) => (i + 1) % total)
    }, 6000)
    return () => clearInterval(id)
  }, [total])

  const go = (next) => setIndex(((next % total) + total) % total)
  const current = testimonials[index]

  return (
    <section
      id="testimonials"
      className="testimonials"
      aria-label="Testimonials"
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
    >
      <div className="container">
        <p className="eyebrow">In their words</p>
        <SplitHeading as="h2">Trusted By Ambitious Teams</SplitHeading>

        <div className="testimonial-slide" aria-live="polite" key={index}>
          <div className="testimonial-slide__media">
            <VideoBlock tone="light" label={`${current.name} testimonial`} />
          </div>
          <blockquote className="testimonial-slide__quote">
            <p>&ldquo;{current.quote}&rdquo;</p>
            <footer>
              <span className="testimonial-slide__name">{current.name}</span>
              <span className="testimonial-slide__org">{current.org}</span>
            </footer>
          </blockquote>
        </div>

        <div className="testimonials__controls">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous testimonial">
            <Icon name="arrow-left-icon" />
          </button>
          <div className="testimonials__dots">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                className={i === index ? 'is-active' : ''}
                onClick={() => go(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next testimonial">
            <Icon name="arrow-right-icon" />
          </button>
        </div>
      </div>
    </section>
  )
}
