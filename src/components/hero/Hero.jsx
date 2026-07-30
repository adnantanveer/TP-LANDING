import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleReveal } from './ScrambleReveal'
import { TypewriterHeading } from './TypewriterHeading'
import { Button } from '../common/Button'
import { RoleCycler } from './RoleCycler'
import { disciplines } from '../../data/disciplines'
import './Hero.css'

gsap.registerPlugin(ScrollTrigger)

// Three.js is a heavy dependency — keep it out of the main bundle and let it
// load as its own chunk in parallel rather than bloating the critical path.
// The scroll-trigger/pin itself, though, is created synchronously below —
// not inside that lazy chunk — so the correct scroll space is reserved from
// the very first render, before Craft/ThreePaths/OurWork ever measure their
// own positions. Creating the pin only after the async chunk loads meant
// everything below Hero had already measured against the unpinned layout;
// once the pin-spacer appeared, those positions went stale, showing up as
// sections overlapping or blank gaps further down the page.
const ChipCircuit = lazy(() => import('./ChipCircuit').then((m) => ({ default: m.ChipCircuit })))

const ROLE_WORDS = disciplines.map((d) => d.label)

// Four chips (Design, Engineering, Cloud, AI) evenly spaced across the
// trace's scroll progress — these two thresholds mark when the headline
// clears away (reaching Engineering) and when it resolves (reaching Cloud).
const ENGINEERING_THRESHOLD = 1 / 3
const CLOUD_THRESHOLD = 2 / 3

export function Hero() {
  const sectionRef = useRef(null)
  const apiRef = useRef(null)
  const stRef = useRef(null)
  // Headline's own three states — 0 scrambled/interactive, 1 scattered away
  // and invisible, 2 resolved into the real sentence — driven directly by
  // scroll progress against the thresholds above, in both directions.
  const [charStage, setCharStage] = useState(0)
  // Post-headline sequence: 0 = nothing yet, 1 = subhead typing, 2 = buttons
  // shown. Starts once the headline's own resolve animation finishes.
  const [stage, setStage] = useState(0)

  // useLayoutEffect (not useEffect) matters here: every other pinned
  // section (ThreePaths, OurWork, etc.) measures its own ScrollTrigger via
  // useLayoutEffect too, synchronously before paint. A plain useEffect runs
  // later, after paint — so those sections were measuring themselves
  // against a document that didn't have Hero's pin-spacer in it yet,
  // baking in a too-short height and pinning early relative to their own
  // spacers further down the page.
  useLayoutEffect(() => {
    const skipAnimation =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(max-width: 900px)').matches
    if (skipAnimation) {
      apiRef.current?.setProgress(1)
      setCharStage(2)
      return undefined
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=100%',
      pin: true,
      scrub: 0.4,
      onUpdate: (self) => {
        apiRef.current?.setProgress(self.progress)
        // Bidirectional on purpose: scrolling back up moves the headline
        // back through its states too, not just a one-time trigger.
        const p = self.progress
        setCharStage(p >= CLOUD_THRESHOLD ? 2 : p >= ENGINEERING_THRESHOLD ? 1 : 0)
      },
    })
    stRef.current = st

    return () => st.kill()
  }, [])

  // If the headline un-resolves (scrolled back before Cloud), the subhead
  // and buttons need to go with it.
  useLayoutEffect(() => {
    if (charStage < 2) setStage(0)
  }, [charStage])

  return (
    <section id="top" className="hero" aria-label="Introduction" ref={sectionRef}>
      <div className="hero__scene" aria-hidden="true">
        <Suspense fallback={null}>
          <ChipCircuit apiRef={apiRef} stRef={stRef} />
        </Suspense>
        <div className="hero__vignette" />
        <div className="hero__grain" />
      </div>

      <div className={`container hero__content ${charStage >= 2 ? 'is-ready' : ''}`}>
        <p className="hero__badge">
          <span className="hero__badge-dot" aria-hidden="true" />
          UK digital product studio — <RoleCycler words={ROLE_WORDS} />
        </p>
        <ScrambleReveal
          as="h1"
          stage={charStage}
          onResolved={() => setStage((s) => Math.max(s, 1))}
          className="hero__title"
        >
          We don&rsquo;t just build software. We craft digital experiences people remember.
        </ScrambleReveal>
        <TypewriterHeading
          as="p"
          play={stage >= 1}
          stagger={0.014}
          onComplete={() => setStage((s) => Math.max(s, 2))}
          className="hero__subhead lead"
        >
          We design and engineer premium websites, applications and intelligent digital
          products for ambitious businesses across the UK.
        </TypewriterHeading>
        <div className={`hero__ctas ${stage >= 2 ? 'is-ready' : ''}`}>
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
