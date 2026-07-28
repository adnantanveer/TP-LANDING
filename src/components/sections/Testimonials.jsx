import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { testimonials } from '../../data/testimonials'
import { VideoBlock } from '../common/VideoBlock'
import { SplitHeading } from '../common/SplitHeading'
import { Reveal } from '../common/Reveal'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import './Testimonials.css'

function SlideContent({ item, mediaRef, quoteRef }) {
  return (
    <>
      <div ref={mediaRef} className="testimonial-slide__media">
        <VideoBlock tone="light" label={`${item.name} testimonial`} />
      </div>
      <blockquote ref={quoteRef} className="testimonial-slide__quote">
        <p>&ldquo;{item.quote}&rdquo;</p>
        <footer>
          <span className="testimonial-slide__name">{item.name}</span>
          <span className="testimonial-slide__org">{item.org}</span>
        </footer>
      </blockquote>
    </>
  )
}

export function Testimonials() {
  const simplified = useSimplifiedMotion()
  const sectionRef = useRef(null)
  const panelRefs = useRef([])
  const mediaRefs = useRef([])
  const quoteRefs = useRef([])
  const dotRefs = useRef([])

  useScopedGsap(
    sectionRef,
    () => {
      if (simplified) return
      const panels = panelRefs.current.filter(Boolean)
      const medias = mediaRefs.current.filter(Boolean)
      const quotes = quoteRefs.current.filter(Boolean)
      if (!panels.length) return

      gsap.set(panels, { autoAlpha: 0 })
      gsap.set(panels[0], { autoAlpha: 1 })

      let currentIndex = 0

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * (testimonials.length - 1) * 0.9}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const idx = Math.min(testimonials.length - 1, Math.floor(self.progress * testimonials.length))
          if (idx === currentIndex) return
          const prevIdx = currentIndex
          currentIndex = idx

          gsap.to(panels[prevIdx], { autoAlpha: 0, duration: 0.25, overwrite: 'auto' })
          gsap.set(panels[idx], { autoAlpha: 1 })
          // media slides in from the left; quote drops in from above and bounces to rest
          gsap.fromTo(
            medias[idx],
            { x: -70, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.7, ease: 'power3.out', overwrite: 'auto' }
          )
          gsap.fromTo(
            quotes[idx],
            { y: -60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: 'bounce.out', overwrite: 'auto' }
          )

          dotRefs.current.forEach((dot, i) => dot?.classList.toggle('is-active', i === idx))
        },
      })
    },
    [simplified]
  )

  if (simplified) {
    return (
      <section id="testimonials" className="testimonials testimonials--simplified" aria-label="Testimonials">
        <div className="container">
          <p className="eyebrow">In their words</p>
          <SplitHeading as="h2">Trusted By Ambitious Teams</SplitHeading>
          <div className="testimonials__stack">
            {testimonials.map((item) => (
              <Reveal as="div" key={item.name} className="testimonial-slide testimonial-slide--static">
                <SlideContent item={item} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="testimonials" className="testimonials" ref={sectionRef} aria-label="Testimonials">
      <div className="testimonials__pin container">
        <div className="testimonials__intro">
          <p className="eyebrow">In their words</p>
          <SplitHeading as="h2">Trusted By Ambitious Teams</SplitHeading>
        </div>

        <div className="testimonials__panels">
          {testimonials.map((item, i) => (
            <div key={item.name} ref={(el) => (panelRefs.current[i] = el)} className="testimonial-slide">
              <SlideContent
                item={item}
                mediaRef={(el) => (mediaRefs.current[i] = el)}
                quoteRef={(el) => (quoteRefs.current[i] = el)}
              />
            </div>
          ))}
        </div>

        <div className="testimonials__dots" aria-hidden="true">
          {testimonials.map((item, i) => (
            <span
              key={item.name}
              ref={(el) => (dotRefs.current[i] = el)}
              className={i === 0 ? 'is-active' : ''}
            />
          ))}
        </div>
        <span className="u-visually-hidden">Scroll to move between testimonials.</span>
      </div>
    </section>
  )
}
