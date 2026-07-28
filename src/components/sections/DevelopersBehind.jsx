import { useRef } from 'react'
import gsap from 'gsap'
import { team } from '../../data/team'
import { SplitHeading } from '../common/SplitHeading'
import { VideoBlock } from '../common/VideoBlock'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import { useTilt } from '../../hooks/useTilt'
import './DevelopersBehind.css'

function DeveloperCard({ item, index }) {
  const cardRef = useRef(null)
  const mediaRef = useRef(null)
  useTilt(cardRef, { max: 5, scale: 1.015 })

  useScopedGsap(
    cardRef,
    () => {
      // Continuous scroll-scrubbed parallax — keeps moving the whole time the
      // card is on screen, rather than a one-shot entrance.
      gsap.to(mediaRef.current, {
        yPercent: index % 2 === 0 ? -8 : 8,
        ease: 'none',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      })
    },
    [index]
  )

  return (
    <article
      className="developer-card"
      ref={cardRef}
      style={{ '--shine-delay': `${index * 1.1}s` }}
      data-cursor-hover
    >
      <div className="developer-card__frame">
        <div className="developer-card__media" ref={mediaRef}>
          <VideoBlock tone="dark" label={item.title} />
        </div>
        <span className="developer-card__shine" aria-hidden="true" />
      </div>
      <div className="developer-card__caption">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </article>
  )
}

export function DevelopersBehind() {
  const sectionRef = useRef(null)
  const gridRef = useRef(null)

  useScopedGsap(
    sectionRef,
    () => {
      const cards = gsap.utils.toArray('.developer-card', gridRef.current)
      gsap.set(cards, { clipPath: 'inset(100% 0% 0% 0% round 20px)', opacity: 0 })
      cards.forEach((card, i) => {
        gsap.to(card, {
          clipPath: 'inset(0% 0% 0% 0% round 20px)',
          opacity: 1,
          duration: 1,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%', once: true },
        })
      })
    },
    []
  )

  return (
    <section id="studio" className="developers" ref={sectionRef} aria-label="The people behind the work">
      <div className="container">
        <p className="eyebrow">Studio</p>
        <SplitHeading as="h2">Developers Behind The Magic</SplitHeading>
        <p className="developers__lede">
          Real practices from our day-to-day — no stock photography, just the work itself.
        </p>
      </div>

      <div className="developers__grid container" ref={gridRef}>
        {team.map((item, i) => (
          <DeveloperCard key={item.title} item={item} index={i} />
        ))}
      </div>
    </section>
  )
}
