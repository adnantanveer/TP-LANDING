import { useRef } from 'react'
import gsap from 'gsap'
import { SplitHeading } from '../common/SplitHeading'
import { Reveal } from '../common/Reveal'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './PromptToProduct.css'

const PROMPT_TEXT = 'Design a booking app for a boutique hotel'
const BAR_HEIGHTS = [55, 100, 75, 40, 88, 62]

function Stage({ typedRef = null, barsRef = null, mockupRef = null }) {
  return (
    <div className="prompt-product__window">
      <div className="prompt-product__bar">
        <span />
        <span />
        <span />
        <span className="prompt-product__bar-label">brief.new</span>
      </div>
      <div className="prompt-product__body">
        <p className="prompt-product__line">
          <span className="prompt-product__prompt-label">&gt;</span>
          <span className="prompt-product__typed" ref={typedRef}>
            {PROMPT_TEXT}
          </span>
          <span className="prompt-product__caret" />
        </p>

        <div className="prompt-product__bars" ref={barsRef}>
          {BAR_HEIGHTS.map((h, i) => (
            <span key={i} style={{ '--h': `${h}%` }} />
          ))}
        </div>

        <div className="prompt-product__mockup" ref={mockupRef}>
          <div className="prompt-product__mockup-hero" />
          <p className="prompt-product__mockup-title">The Wren Hotel</p>
          <div className="prompt-product__mockup-lines">
            <span />
            <span />
          </div>
          <span className="prompt-product__mockup-btn">Book a stay</span>
        </div>
      </div>
    </div>
  )
}

export function PromptToProduct() {
  const simplified = useSimplifiedMotion()
  const sectionRef = useRef(null)
  const typedRef = useRef(null)
  const barsRef = useRef(null)
  const mockupRef = useRef(null)

  useScopedGsap(
    sectionRef,
    () => {
      if (simplified) return
      const bars = gsap.utils.toArray('span', barsRef.current)

      gsap.set(bars, { scaleY: 0, transformOrigin: 'bottom' })
      gsap.set(mockupRef.current, { autoAlpha: 0, y: 20, scale: 0.96 })
      gsap.set(typedRef.current, { textContent: '' })

      const typeState = { n: 0 }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', once: true },
      })

      tl.to(typeState, {
        n: PROMPT_TEXT.length,
        duration: 1.4,
        ease: 'none',
        onUpdate: () => {
          if (typedRef.current) typedRef.current.textContent = PROMPT_TEXT.slice(0, Math.round(typeState.n))
        },
      })
        .to(bars, { scaleY: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '+=0.15')
        .to(bars, { backgroundColor: 'var(--color-blue-muted)', duration: 0.3, stagger: 0.05 }, '-=0.2')
        .to(mockupRef.current, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, '+=0.1')
    },
    [simplified]
  )

  if (simplified) {
    return (
      <section id="generate" className="prompt-product prompt-product--simplified" aria-label="How we start">
        <div className="container prompt-product__grid">
          <div className="prompt-product__intro">
            <p className="eyebrow">How we start</p>
            <SplitHeading as="h2">From Brief to Build.</SplitHeading>
            <p className="prompt-product__copy">
              Give us the outcome you need. We turn it into wireframes, interface and a working
              product &mdash; fast enough that you see it happen, not just hear about it.
            </p>
          </div>
          <Reveal className="prompt-product__stage" animation="scale">
            <Stage typedRef={{ current: null }} barsRef={{ current: null }} mockupRef={{ current: null }} />
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <section id="generate" className="prompt-product" ref={sectionRef} aria-label="How we start">
      <div className="container prompt-product__grid">
        <div className="prompt-product__intro">
          <p className="eyebrow">How we start</p>
          <SplitHeading as="h2">From Brief to Build.</SplitHeading>
          <p className="prompt-product__copy">
            Give us the outcome you need. We turn it into wireframes, interface and a working
            product &mdash; fast enough that you see it happen, not just hear about it.
          </p>
        </div>
        <div className="prompt-product__stage">
          <Stage typedRef={typedRef} barsRef={barsRef} mockupRef={mockupRef} />
        </div>
      </div>
    </section>
  )
}
