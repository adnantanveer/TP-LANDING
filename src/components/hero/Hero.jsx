import { lazy, Suspense } from 'react'
import { SplitHeading } from '../common/SplitHeading'
import { Button } from '../common/Button'
import { ParticleNetwork } from './ParticleNetwork'
import './Hero.css'

// Three.js is a heavy dependency — keep it out of the main bundle and let it
// load as its own chunk in parallel rather than bloating the critical path.
const HeroScene3D = lazy(() => import('./HeroScene3D').then((m) => ({ default: m.HeroScene3D })))

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
        <SplitHeading as="h1" immediate play={introDone} className="hero__title">
          We don&rsquo;t just build software. We craft digital experiences people remember.
        </SplitHeading>
        <p className="hero__subhead">
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
    </section>
  )
}
