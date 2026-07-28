import { useRef } from 'react'
import gsap from 'gsap'
import { technologies } from '../../data/technologies'
import { Icon } from '../common/Icon'
import { SplitHeading } from '../common/SplitHeading'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './Technology.css'

export function Technology() {
  const sectionRef = useRef(null)
  const clusterRef = useRef(null)

  useScopedGsap(
    sectionRef,
    () => {
      const chips = gsap.utils.toArray('.tech-chip', clusterRef.current)
      gsap.set(chips, { opacity: 0, scale: 0.6 })
      gsap.to(chips, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: { each: 0.045, from: 'random' },
        ease: 'back.out(1.6)',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      })
    },
    []
  )

  return (
    <section id="technology" className="technology" ref={sectionRef} aria-label="Technology we use">
      <div className="container">
        <p className="eyebrow">Technology</p>
        <SplitHeading as="h2">Fluent In What Matters</SplitHeading>
      </div>

      <div className="technology__cluster container" ref={clusterRef}>
        {technologies.map((tech) => (
          <span key={tech.id} className="tech-chip" data-cursor-hover>
            <Icon name={tech.icon} size={26} sprite="/tech-icons.svg" />
            <span className="tech-chip__label">{tech.label}</span>
          </span>
        ))}
      </div>
    </section>
  )
}
