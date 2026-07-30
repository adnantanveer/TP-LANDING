import { lazy, Suspense } from 'react'
import { SplitHeading } from '../common/SplitHeading'
import { Button } from '../common/Button'
import { ParticleNetwork } from './ParticleNetwork'
import { RoleCycler } from './RoleCycler'
import { Marquee } from '../common/Marquee'
import './Hero.css'

// Three.js is a heavy dependency — keep it out of the main bundle and let it
// load as its own chunk in parallel rather than bloating the critical path.
const HeroScene3D = lazy(() => import('./HeroScene3D').then((m) => ({ default: m.HeroScene3D })))

const MARQUEE_ITEMS = ['UK Digital Product Studio', 'Design — Engineering — Cloud — AI', 'Crafted With Intention']

export function Hero({ introDone = true }) {
  return (
    <section id="top" className="hero" aria-label="Introduction">
      <div className="hero__scene" aria-hidden="true">
        <ParticleNetwork />
        <Suspense fallback={null}>
          <HeroScene3D />
        </Suspense>
        <div className="hero__vignette" />
      </div>

      <div className={`container hero__content ${introDone ? 'is-ready' : ''}`}>
        <p className="hero__badge">
          <span className="hero__badge-dot" aria-hidden="true" />
          UK digital product studio — <RoleCycler words={['Design', 'Engineering', 'Cloud', 'AI']} />
        </p>
        <SplitHeading as="h1" immediate play={introDone} className="hero__title">
          We don&rsquo;t just build software. We craft digital experiences people remember.
        </SplitHeading>
        <p className="hero__subhead lead">
          We design and engineer premium websites, applications and intelligent digital
          products for ambitious businesses across the UK.
        </p>
        <div className="hero__ctas">
          <Button href="#contact" variant="primary on-dark">
            Start Your Project
          </Button>
          <Button href="#work" variant="secondary on-dark">
            View Our Work
          </Button>
        </div>
      </div>

      <div className="hero__scroll-cue" aria-hidden="true">
        <span className="hero__scroll-line" />
        <span className="hero__scroll-label">Scroll</span>
      </div>

      <div className="hero__marquee">
        <Marquee items={MARQUEE_ITEMS} tone="dark" speed={32} />
      </div>
    </section>
  )
}
