import { useRef } from 'react'
import gsap from 'gsap'
import { precision } from '../../data/precision'
import { SplitHeading } from '../common/SplitHeading'
import { Reveal } from '../common/Reveal'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './Precision.css'

const START_OFFSETS = [
  { x: -60, y: -40, scale: 1.5, rotate: -4 },
  { x: 50, y: 30, scale: 1.6, rotate: 3 },
  { x: -30, y: 50, scale: 1.4, rotate: 2 },
  { x: 40, y: -50, scale: 1.55, rotate: -3 },
  { x: -50, y: 10, scale: 1.45, rotate: 4 },
  { x: 30, y: -20, scale: 1.5, rotate: -2 },
]

export function Precision() {
  const simplified = useSimplifiedMotion()
  const sectionRef = useRef(null)
  const cardRefs = useRef([])

  useScopedGsap(
    sectionRef,
    () => {
      if (simplified) return
      const cards = cardRefs.current.filter(Boolean)
      if (!cards.length) return

      cards.forEach((card, i) => gsap.set(card, START_OFFSETS[i % START_OFFSETS.length]))

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=120%',
          scrub: 1,
          pin: true,
        },
      })

      cards.forEach((card, i) => {
        tl.to(card, { x: 0, y: 0, scale: 1, rotate: 0, ease: 'power2.out' }, i * 0.08)
      })
    },
    [simplified]
  )

  return (
    <section
      id="precision"
      className={`precision ${simplified ? 'precision--simplified' : ''}`}
      ref={sectionRef}
      aria-label="Built with precision"
    >
      <div className="container precision__inner">
        <p className="eyebrow">Capabilities</p>
        <SplitHeading as="h2">Built With Precision</SplitHeading>

        {simplified ? (
          <Reveal as="div" className="precision__grid" stagger={0.08} animation="fade-up">
            {precision.map((item) => (
              <article key={item.label} className="precision-card" data-cursor-hover>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </Reveal>
        ) : (
          <div className="precision__grid">
            {precision.map((item, i) => (
              <article
                key={item.label}
                className="precision-card"
                ref={(el) => (cardRefs.current[i] = el)}
                data-cursor-hover
              >
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
