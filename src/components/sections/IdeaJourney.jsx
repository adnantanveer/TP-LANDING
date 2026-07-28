import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { journey } from '../../data/journey'
import { SplitHeading } from '../common/SplitHeading'
import { Reveal } from '../common/Reveal'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import { playIconIn } from '../../utils/iconMotion'
import {
  IdeaIcon,
  ResearchIcon,
  DesignIcon,
  PrototypeIcon,
  DevelopmentIcon,
  LaunchIcon,
  GrowthIcon,
} from './JourneyIcons'
import './IdeaJourney.css'

const JOURNEY_ICONS = {
  Idea: IdeaIcon,
  Research: ResearchIcon,
  Design: DesignIcon,
  Prototype: PrototypeIcon,
  Development: DevelopmentIcon,
  Launch: LaunchIcon,
  Growth: GrowthIcon,
}

export function IdeaJourney() {
  const simplified = useSimplifiedMotion()
  const sectionRef = useRef(null)
  const panelRefs = useRef([])
  const railRefs = useRef([])
  const progressRef = useRef(null)

  useScopedGsap(
    sectionRef,
    () => {
      if (simplified) return
      const panels = panelRefs.current.filter(Boolean)
      if (!panels.length) return

      gsap.set(panels, { autoAlpha: 0, y: 16 })
      gsap.set(panels[0], { autoAlpha: 1, y: 0 })
      playIconIn(panels[0])

      let currentIndex = 0

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * (journey.length - 1) * 0.9}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const idx = Math.min(journey.length - 1, Math.floor(self.progress * journey.length))
          panels.forEach((panel, i) => {
            gsap.to(panel, { autoAlpha: i === idx ? 1 : 0, y: i === idx ? 0 : 16, duration: 0.3, overwrite: 'auto' })
          })
          railRefs.current.forEach((rail, i) => rail?.classList.toggle('is-active', i === idx))
          if (progressRef.current) progressRef.current.style.transform = `scaleY(${self.progress})`

          if (idx !== currentIndex) {
            currentIndex = idx
            playIconIn(panels[idx])
          }
        },
      })
    },
    [simplified]
  )

  if (simplified) {
    return (
      <section id="approach" className="idea-journey idea-journey--simplified" aria-label="Our process">
        <div className="container">
          <p className="eyebrow">How we work</p>
          <SplitHeading as="h2">From Idea to Experience</SplitHeading>
          <ol className="idea-journey__list">
            {journey.map((item) => {
              const Icon = JOURNEY_ICONS[item.label]
              return (
                <Reveal as="li" key={item.step} className="idea-journey__item">
                  <div className="idea-journey__item-visual">
                    <Icon />
                  </div>
                  <span className="idea-journey__step">{item.step}</span>
                  <div>
                    <h3>{item.label}</h3>
                    <p>{item.description}</p>
                  </div>
                </Reveal>
              )
            })}
          </ol>
        </div>
      </section>
    )
  }

  return (
    <section id="approach" className="idea-journey" ref={sectionRef} aria-label="Our process">
      <div className="idea-journey__pin container">
        <div className="idea-journey__rail">
          <p className="eyebrow">How we work</p>
          <SplitHeading as="h2" className="idea-journey__title">
            From Idea to Experience
          </SplitHeading>
          <ul className="idea-journey__steps-rail">
            {journey.map((item, i) => (
              <li key={item.step} ref={(el) => (railRefs.current[i] = el)}>
                {item.label}
              </li>
            ))}
          </ul>
          <div className="idea-journey__progress-track">
            <span ref={progressRef} className="idea-journey__progress-fill" />
          </div>
        </div>

        <div className="idea-journey__panels">
          {journey.map((item, i) => {
            const Icon = JOURNEY_ICONS[item.label]
            return (
              <div key={item.step} ref={(el) => (panelRefs.current[i] = el)} className="idea-journey__panel">
                <div className="idea-journey__panel-visual">
                  <Icon />
                </div>
                <div className="idea-journey__panel-text">
                  <span className="idea-journey__panel-step">{item.step}</span>
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
