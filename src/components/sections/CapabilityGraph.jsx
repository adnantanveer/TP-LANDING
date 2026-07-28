import { useRef } from 'react'
import gsap from 'gsap'
import { SplitHeading } from '../common/SplitHeading'
import { Reveal } from '../common/Reveal'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './CapabilityGraph.css'

const NODES = [
  { id: 'design', label: 'Design', x: 80, y: 70 },
  { id: 'engineering', label: 'Engineering', x: 360, y: 70 },
  { id: 'cloud', label: 'Cloud & DevOps', x: 80, y: 250 },
  { id: 'ai', label: 'AI & ML', x: 360, y: 250 },
]
const CENTER = { x: 220, y: 160 }
const VIEW_W = 440
const VIEW_H = 320

function Graph({ lineRefs, nodeRefs, centerRef }) {
  return (
    <>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="capability-graph__svg" aria-hidden="true">
        {NODES.map((n, i) => (
          <line
            key={n.id}
            ref={(el) => lineRefs && (lineRefs.current[i] = el)}
            x1={CENTER.x}
            y1={CENTER.y}
            x2={n.x}
            y2={n.y}
            className="capability-graph__link"
          />
        ))}
        {NODES.map((n, i) => (
          <g key={n.id} ref={(el) => nodeRefs && (nodeRefs.current[i] = el)} className="capability-graph__node">
            <circle cx={n.x} cy={n.y} r="7" />
          </g>
        ))}
        <g ref={centerRef} className="capability-graph__node capability-graph__node--core">
          <circle cx={CENTER.x} cy={CENTER.y} r="11" />
        </g>
      </svg>

      {NODES.map((n) => (
        <span
          key={n.id}
          className="capability-graph__label"
          style={{ left: `${(n.x / VIEW_W) * 100}%`, top: `${(n.y / VIEW_H) * 100}%` }}
        >
          {n.label}
        </span>
      ))}
      <span
        className="capability-graph__label capability-graph__label--core"
        style={{ left: `${(CENTER.x / VIEW_W) * 100}%`, top: `${(CENTER.y / VIEW_H) * 100}%` }}
      >
        Your Product
      </span>
    </>
  )
}

export function CapabilityGraph() {
  const simplified = useSimplifiedMotion()
  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const lineRefs = useRef([])
  const nodeRefs = useRef([])
  const centerRef = useRef(null)

  useScopedGsap(
    sectionRef,
    () => {
      if (simplified) return
      const lines = lineRefs.current.filter(Boolean)
      const nodes = nodeRefs.current.filter(Boolean)
      if (!lines.length) return

      lines.forEach((line) => {
        const len = line.getTotalLength()
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len })
      })
      gsap.set(nodes, { scale: 0, transformOrigin: 'center', transformBox: 'fill-box' })
      gsap.set(centerRef.current, { scale: 0, transformOrigin: 'center', transformBox: 'fill-box' })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 60%', once: true },
      })

      tl.to(centerRef.current, { scale: 1, duration: 0.4, ease: 'back.out(2)' })
        .to(lines, { strokeDashoffset: 0, duration: 0.6, stagger: 0.12, ease: 'power2.inOut' }, '-=0.1')
        .to(nodes, { scale: 1, duration: 0.35, stagger: 0.12, ease: 'back.out(2)' }, '-=0.5')
        .call(() => stageRef.current?.classList.add('is-live'))
    },
    [simplified]
  )

  if (simplified) {
    return (
      <section id="how-we-connect" className="capability-graph capability-graph--simplified" aria-label="How it connects">
        <div className="container">
          <p className="eyebrow">How it connects</p>
          <SplitHeading as="h2">One Team. Every Layer.</SplitHeading>
          <p className="capability-graph__copy">
            Design, engineering, cloud and AI aren&rsquo;t separate teams passed along like a
            baton &mdash; they sit in the same room, wired into the same product from day one.
          </p>
        </div>
        <Reveal as="div" className="capability-graph__stage container" animation="scale">
          <Graph lineRefs={null} nodeRefs={null} centerRef={null} />
        </Reveal>
      </section>
    )
  }

  return (
    <section id="how-we-connect" className="capability-graph" ref={sectionRef} aria-label="How it connects">
      <div className="container">
        <p className="eyebrow">How it connects</p>
        <SplitHeading as="h2">One Team. Every Layer.</SplitHeading>
        <p className="capability-graph__copy">
          Design, engineering, cloud and AI aren&rsquo;t separate teams passed along like a
          baton &mdash; they sit in the same room, wired into the same product from day one.
        </p>
      </div>
      <div className="capability-graph__stage container" ref={stageRef}>
        <Graph lineRefs={lineRefs} nodeRefs={nodeRefs} centerRef={centerRef} />
      </div>
    </section>
  )
}
