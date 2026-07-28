import { useRef } from 'react'
import gsap from 'gsap'
import { paths } from '../../data/paths'
import { Icon } from '../common/Icon'
import { SplitHeading } from '../common/SplitHeading'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './ThreePaths.css'

export function ThreePaths() {
  const sectionRef = useRef(null)
  const cardRefs = useRef([])

  useScopedGsap(
    sectionRef,
    () => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return
        gsap.set(card, { clipPath: 'inset(0% 0% 62% 0% round 24px)', opacity: 0, y: 30 })
        gsap.to(card, {
          clipPath: 'inset(0% 0% 0% 0% round 24px)',
          opacity: 1,
          y: 0,
          duration: 1,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 82%', once: true },
        })
      })
    },
    []
  )

  return (
    <section id="paths" className="three-paths" ref={sectionRef} aria-label="What we build">
      <div className="container">
        <p className="eyebrow">What we build</p>
        <SplitHeading as="h2" className="three-paths__title">
          Three Paths
        </SplitHeading>

        <div className="three-paths__grid">
          {paths.map((path, i) => (
            <article
              key={path.id}
              className="path-card"
              ref={(el) => (cardRefs.current[i] = el)}
              data-cursor-hover
            >
              <Icon name={path.icon} size={34} className="path-card__icon" />
              <h3>{path.label}</h3>
              <p>{path.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
