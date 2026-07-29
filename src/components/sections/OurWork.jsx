import { useRef } from 'react'
import gsap from 'gsap'
import { work } from '../../data/work'
import { VideoBlock } from '../common/VideoBlock'
import { SplitHeading } from '../common/SplitHeading'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './OurWork.css'

export function OurWork() {
  const simplified = useSimplifiedMotion()
  const sectionRef = useRef(null)
  const trackRef = useRef(null)

  useScopedGsap(
    sectionRef,
    () => {
      if (simplified || !trackRef.current) return
      const track = trackRef.current
      const distance = Math.max(0, track.scrollWidth - window.innerWidth)
      if (!distance) return

      gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${distance}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
        },
      })
    },
    [simplified]
  )

  return (
    <section
      id="work"
      className={`our-work ${simplified ? 'our-work--simplified' : ''}`}
      ref={sectionRef}
      aria-label="Our work"
    >
      <div className="our-work__intro container">
        <p className="eyebrow">Selected work</p>
        <SplitHeading as="h2">Our Work Speaks</SplitHeading>
      </div>

      <div className="our-work__viewport">
        <div className="our-work__track" ref={trackRef}>
          {work.map((project, i) => (
            <article key={project.id} className="work-card" data-cursor-hover data-cursor-label="View">
              <div className="work-card__frame">
                <VideoBlock tone="dark" label={`${project.title} preview`} className="work-card__media" />
              </div>
              <span className="work-card__index">{String(i + 1).padStart(2, '0')}</span>
              <div className="work-card__caption">
                <span className="work-card__category">{project.category}</span>
                <h3>{project.title}</h3>
                <p className="work-card__hover-info">{project.caption}</p>
                <span className="work-card__link">
                  View Case Study <span className="work-card__link-arrow">→</span>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
