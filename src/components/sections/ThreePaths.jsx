import { useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { paths } from '../../data/paths'
import { WebIcon, MobileIcon, AiIcon } from './PathIcons'
import { SplitHeading } from '../common/SplitHeading'
import { Reveal } from '../common/Reveal'
import { useSimplifiedMotion } from '../../hooks/useSimplifiedMotion'
import { useScopedGsap } from '../../hooks/useScopedGsap'
import { playIconIn } from '../../utils/iconMotion'
import './ThreePaths.css'

const PATH_ICONS = { web: WebIcon, mobile: MobileIcon, ai: AiIcon }

function PathContent({ path }) {
  const Graphic = PATH_ICONS[path.id]
  return (
    <>
      <Graphic />
      <h3>{path.label}</h3>
      <p>{path.description}</p>
    </>
  )
}

export function ThreePaths() {
  const simplified = useSimplifiedMotion()
  const sectionRef = useRef(null)
  const cardRefs = useRef([])

  useScopedGsap(
    sectionRef,
    () => {
      if (simplified) return
      const cards = cardRefs.current.filter(Boolean)
      if (!cards.length) return

      playIconIn(cards[0])

      let currentIndex = 0

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${window.innerHeight * (paths.length - 1) * 0.9}`,
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const idx = Math.min(paths.length - 1, Math.floor(self.progress * paths.length))
          if (idx === currentIndex) return
          const prevIdx = currentIndex
          currentIndex = idx

          cards[prevIdx].classList.remove('is-active')
          cards[idx].classList.add('is-active')
          playIconIn(cards[idx])
        },
      })
    },
    [simplified]
  )

  if (simplified) {
    return (
      <section id="paths" className="three-paths three-paths--simplified" aria-label="What we build">
        <div className="container">
          <p className="eyebrow">What we build</p>
          <SplitHeading as="h2" className="three-paths__title">
            Three Paths
          </SplitHeading>

          <div className="three-paths__stack">
            {paths.map((path) => (
              <Reveal as="article" key={path.id} className="path-card path-card--static" data-cursor-hover>
                <PathContent path={path} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="paths" className="three-paths" ref={sectionRef} aria-label="What we build">
      <div className="three-paths__pin container">
        <p className="eyebrow">What we build</p>
        <SplitHeading as="h2" className="three-paths__title">
          Three Paths
        </SplitHeading>

        <div className="three-paths__row">
          {paths.map((path, i) => (
            <article
              key={path.id}
              ref={(el) => (cardRefs.current[i] = el)}
              className={`path-card ${i === 0 ? 'is-active' : ''}`}
              data-cursor-hover
            >
              <PathContent path={path} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
