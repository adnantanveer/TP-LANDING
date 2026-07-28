import { useRef } from 'react'
import gsap from 'gsap'
import { technologies } from '../../data/technologies'
import { Icon } from '../common/Icon'
import { SplitHeading } from '../common/SplitHeading'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './Technology.css'

const LAYER_GROUPS = [
  { id: 'frontend', label: 'Frontend', tech: ['react', 'angular', 'typescript', 'flutter'] },
  { id: 'backend', label: 'Backend', tech: ['node', 'python', 'java', 'springboot'] },
  { id: 'data', label: 'Data & Storage', tech: ['postgresql', 'mongodb'] },
  { id: 'cloud', label: 'Cloud & Infra', tech: ['aws', 'azure', 'docker', 'kubernetes'] },
]

const layers = LAYER_GROUPS.map((group) => ({
  ...group,
  items: group.tech.map((id) => technologies.find((tech) => tech.id === id)).filter(Boolean),
}))

export function Technology() {
  const sectionRef = useRef(null)
  const stackRef = useRef(null)
  const spineFillRef = useRef(null)

  useScopedGsap(
    sectionRef,
    () => {
      const layerEls = gsap.utils.toArray('.technology__layer', stackRef.current)
      const chips = gsap.utils.toArray('.tech-chip', stackRef.current)
      const nodes = gsap.utils.toArray('.technology__layer-node', stackRef.current)

      gsap.set(spineFillRef.current, { scaleY: 0 })
      gsap.set(nodes, { scale: 0, transformOrigin: 'center' })
      gsap.set(chips, { opacity: 0, y: 10, scale: 0.85 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', once: true },
      })

      tl.to(spineFillRef.current, { scaleY: 1, duration: 1.2, ease: 'power2.inOut' }, 0)

      layerEls.forEach((layer, i) => {
        const layerChips = layer.querySelectorAll('.tech-chip')
        const node = layer.querySelector('.technology__layer-node')
        const at = i * 0.28
        tl.to(node, { scale: 1, duration: 0.3, ease: 'back.out(2)' }, at)
        tl.to(
          layerChips,
          { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' },
          at + 0.08
        )
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

      <div className="technology__stack container" ref={stackRef}>
        <div className="technology__spine">
          <span className="technology__spine-fill" ref={spineFillRef} />
        </div>

        {layers.map((layer) => (
          <div className="technology__layer" key={layer.id}>
            <span className="technology__layer-node" />
            <div className="technology__layer-body">
              <p className="technology__layer-label">{layer.label}</p>
              <div className="technology__layer-chips">
                {layer.items.map((tech) => (
                  <span key={tech.id} className="tech-chip" data-cursor-hover>
                    <Icon name={tech.icon} size={26} sprite="/tech-icons.svg" />
                    <span className="tech-chip__label">{tech.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
