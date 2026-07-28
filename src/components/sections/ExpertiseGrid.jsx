import { useRef } from 'react'
import gsap from 'gsap'
import { SplitHeading } from '../common/SplitHeading'
import { Reveal } from '../common/Reveal'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './ExpertiseGrid.css'

const TILES = [
  {
    id: 'software',
    area: 'software',
    title: 'Custom Software',
    desc: 'Backends, APIs and internal tools built to handle real load, not just the demo.',
  },
  {
    id: 'ai',
    area: 'ai',
    title: 'AI & ML',
    desc: 'Applied AI features — search, generation, automation — that fit naturally into a real workflow.',
  },
  {
    id: 'uiux',
    area: 'uiux',
    title: 'UI/UX Design',
    desc: 'Interfaces designed around how people actually behave, not just how a sitemap says they should.',
  },
  {
    id: 'mobile',
    area: 'mobile',
    title: 'Mobile Apps',
    desc: 'Native-feeling iOS and Android products, from onboarding to app-store release.',
  },
  {
    id: 'cloud',
    area: 'cloud',
    title: 'Cloud & DevOps',
    desc: 'Infrastructure, CI/CD and monitoring set up so shipping is routine, not an event.',
  },
  {
    id: 'design',
    area: 'design',
    title: 'Design Systems',
    desc: 'Reusable components and tokens so every new screen looks like it belongs.',
  },
]

function TileVisual({ id }) {
  if (id === 'software') {
    return (
      <div className="bento-visual bento-visual--software">
        <span className="bv-code-line" style={{ '--w': '70%' }} />
        <span className="bv-code-line" style={{ '--w': '45%' }} />
        <span className="bv-code-line bv-code-line--accent" style={{ '--w': '58%' }} />
      </div>
    )
  }
  if (id === 'ai') {
    return (
      <div className="bento-visual bento-visual--ai">
        <span className="bv-ai-label">generating<em>.</em><em>.</em><em>.</em></span>
        <div className="bv-ai-stream" />
      </div>
    )
  }
  if (id === 'uiux') {
    return (
      <div className="bento-visual bento-visual--uiux">
        <span className="bv-drag-block" />
        <span className="bv-cursor" />
      </div>
    )
  }
  if (id === 'mobile') {
    return (
      <div className="bento-visual bento-visual--mobile">
        <span className="bv-phone" />
      </div>
    )
  }
  if (id === 'cloud') {
    return (
      <div className="bento-visual bento-visual--cloud">
        {[0, 1, 2].map((i) => (
          <span className="bv-node" key={i}>
            <em />
          </span>
        ))}
      </div>
    )
  }
  return (
    <div className="bento-visual bento-visual--design">
      <span className="bv-swatch bv-swatch--1" />
      <span className="bv-swatch bv-swatch--2" />
      <span className="bv-swatch bv-swatch--3" />
      <span className="bv-swatch bv-swatch--4" />
    </div>
  )
}

function Tile({ tile }) {
  return (
    <article className={`bento-tile bento-tile--${tile.area}`} data-cursor-hover>
      <TileVisual id={tile.id} />
      <div className="bento-tile__body">
        <h3>{tile.title}</h3>
        <p>{tile.desc}</p>
      </div>
    </article>
  )
}

export function ExpertiseGrid() {
  const simplified = useSimplifiedMotion()
  const sectionRef = useRef(null)
  const gridRef = useRef(null)

  useScopedGsap(
    sectionRef,
    () => {
      if (simplified) return
      const tiles = gsap.utils.toArray('.bento-tile', gridRef.current)
      if (!tiles.length) return

      gsap.set(tiles, { opacity: 0, y: 24, scale: 0.96 })

      gsap.to(tiles, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', once: true },
        onComplete: () => tiles.forEach((t) => t.classList.add('is-live')),
      })
    },
    [simplified]
  )

  if (simplified) {
    return (
      <section id="expertise" className="expertise-grid expertise-grid--simplified" aria-label="What we do">
        <div className="container">
          <p className="eyebrow">What we do</p>
          <SplitHeading as="h2">Full-Service, By Design.</SplitHeading>
        </div>
        <Reveal as="div" className="bento-grid container" stagger={0.08}>
          {TILES.map((tile) => (
            <Tile key={tile.id} tile={tile} />
          ))}
        </Reveal>
      </section>
    )
  }

  return (
    <section id="expertise" className="expertise-grid" ref={sectionRef} aria-label="What we do">
      <div className="container">
        <p className="eyebrow">What we do</p>
        <SplitHeading as="h2">Full-Service, By Design.</SplitHeading>
      </div>
      <div className="bento-grid container" ref={gridRef}>
        {TILES.map((tile) => (
          <Tile key={tile.id} tile={tile} />
        ))}
      </div>
    </section>
  )
}
