import { useRef } from 'react'
import gsap from 'gsap'
import { SplitHeading } from '../common/SplitHeading'
import { Reveal } from '../common/Reveal'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './EvolvingCanvas.css'

const STAGES = [
  { key: 'sketch', label: 'Sketch', w: 140, h: 140, radius: '50%', bg: 'var(--color-warm-gray-light)' },
  { key: 'wireframe', label: 'Wireframe', w: 230, h: 150, radius: '14px', bg: 'var(--color-bg)' },
  { key: 'interface', label: 'Interface', w: 230, h: 150, radius: '14px', bg: 'var(--color-bg)' },
  { key: 'app', label: 'App', w: 120, h: 210, radius: '30px', bg: 'var(--color-soft-black)' },
  { key: 'assistant', label: 'Assistant', w: 210, h: 120, radius: '28px 28px 28px 6px', bg: 'var(--color-blue-muted)' },
]

function StageInner({ stageKey }) {
  switch (stageKey) {
    case 'sketch':
      return (
        <div className="ei-sketch">
          <span className="ei-scribble ei-scribble--1" />
          <span className="ei-scribble ei-scribble--2" />
          <span className="ei-scribble ei-scribble--3" />
        </div>
      )
    case 'wireframe':
      return (
        <div className="ei-grid">
          <span />
          <span />
          <span />
          <span />
        </div>
      )
    case 'interface':
      return (
        <div className="ei-ui">
          <span className="ei-ui-hero" />
          <span className="ei-ui-line" />
          <span className="ei-ui-line ei-ui-line--short" />
        </div>
      )
    case 'app':
      return (
        <div className="ei-app">
          <span className="ei-app-bar" />
          <span className="ei-app-card" />
          <span className="ei-app-card" />
        </div>
      )
    case 'assistant':
      return (
        <div className="ei-chat">
          <span />
          <span />
          <span />
        </div>
      )
    default:
      return null
  }
}

export function EvolvingCanvas() {
  const simplified = useSimplifiedMotion()
  const sectionRef = useRef(null)
  const shapeRef = useRef(null)
  const innerRefs = useRef([])
  const labelRefs = useRef([])
  const dotRefs = useRef([])

  useScopedGsap(
    sectionRef,
    () => {
      if (simplified) return
      const inners = innerRefs.current.filter(Boolean)
      const labels = labelRefs.current.filter(Boolean)
      const dots = dotRefs.current.filter(Boolean)
      if (!shapeRef.current || inners.length !== STAGES.length) return

      gsap.set(shapeRef.current, {
        width: STAGES[0].w,
        height: STAGES[0].h,
        borderRadius: STAGES[0].radius,
        backgroundColor: STAGES[0].bg,
      })
      gsap.set(inners, { autoAlpha: 0 })
      gsap.set(inners[0], { autoAlpha: 1 })
      gsap.set(labels, { autoAlpha: 0 })
      gsap.set(labels[0], { autoAlpha: 1 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3}`,
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            const idx = Math.min(STAGES.length - 1, Math.round(self.progress * (STAGES.length - 1)))
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === idx))
          },
        },
      })

      STAGES.slice(1).forEach((stage, i) => {
        const seg = `seg${i}`
        tl.addLabel(seg)
          .to(
            shapeRef.current,
            { width: stage.w, height: stage.h, borderRadius: stage.radius, backgroundColor: stage.bg, duration: 1, ease: 'power2.inOut' },
            seg
          )
          .to(inners[i], { autoAlpha: 0, duration: 0.3 }, seg)
          .to(inners[i + 1], { autoAlpha: 1, duration: 0.3 }, `${seg}+=0.6`)
          .to(labels[i], { autoAlpha: 0, duration: 0.3 }, seg)
          .to(labels[i + 1], { autoAlpha: 1, duration: 0.3 }, `${seg}+=0.6`)
      })
    },
    [simplified]
  )

  if (simplified) {
    return (
      <section id="evolve" className="evolve evolve--simplified" aria-label="How it evolves">
        <div className="container">
          <p className="eyebrow">How it evolves</p>
          <SplitHeading as="h2">One Idea, Many Forms.</SplitHeading>
          <p className="evolve__copy">
            The same product thinking shapes a sketch, a screen, an app, and an interface that
            talks back. We just change the material.
          </p>
        </div>
        <Reveal as="div" className="evolve__filmstrip container" stagger={0.08}>
          {STAGES.map((s) => (
            <div key={s.key} className={`evolve__frame evolve__frame--${s.key}`}>
              <div className="evolve__frame-shape">
                <StageInner stageKey={s.key} />
              </div>
              <p>{s.label}</p>
            </div>
          ))}
        </Reveal>
      </section>
    )
  }

  return (
    <section id="evolve" className="evolve" ref={sectionRef} aria-label="How it evolves">
      <div className="evolve__pin container">
        <div className="evolve__intro">
          <p className="eyebrow">How it evolves</p>
          <SplitHeading as="h2" className="evolve__title">
            One Idea, Many Forms.
          </SplitHeading>
          <p className="evolve__copy">
            The same product thinking shapes a sketch, a screen, an app, and an interface that
            talks back. We just change the material.
          </p>
          <ul className="evolve__dots">
            {STAGES.map((s, i) => (
              <li key={s.key} ref={(el) => (dotRefs.current[i] = el)} className={i === 0 ? 'is-active' : ''}>
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="evolve__stage">
          <div className="evolve__shape" ref={shapeRef}>
            {STAGES.map((s, i) => (
              <div
                key={s.key}
                ref={(el) => (innerRefs.current[i] = el)}
                className={`evolve__inner evolve__inner--${s.key}`}
              >
                <StageInner stageKey={s.key} />
              </div>
            ))}
          </div>
          <p className="evolve__label">
            {STAGES.map((s, i) => (
              <span key={s.key} ref={(el) => (labelRefs.current[i] = el)} className="evolve__label-item">
                {s.label}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}
