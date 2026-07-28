import { useRef } from 'react'
import gsap from 'gsap'
import { paths } from '../../data/paths'
import { WebIcon, MobileIcon, AiIcon } from './PathIcons'
import { SplitHeading } from '../common/SplitHeading'
import { useScopedGsap } from '../../hooks/useScopedGsap'
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
  const sectionRef = useRef(null)
  const cardRefs = useRef([])

  useScopedGsap(
    sectionRef,
    () => {
      const cards = cardRefs.current.filter(Boolean)
      if (!cards.length) return

      cards.forEach((card) => {
        const drawEls = card.querySelectorAll('.icon-draw')
        const popEls = card.querySelectorAll('.icon-pop')
        drawEls.forEach((el) => {
          const length = el.getTotalLength ? el.getTotalLength() : 100
          gsap.set(el, { strokeDasharray: length, strokeDashoffset: length })
        })
        gsap.set(popEls, { opacity: 0, scale: 0.5, transformOrigin: 'center' })
      })
      gsap.set(cards, { opacity: 0, y: 28 })

      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
      })

      cards.forEach((card, i) => {
        const drawEls = card.querySelectorAll('.icon-draw')
        const popEls = card.querySelectorAll('.icon-pop')
        const iconEl = card.querySelector('.path-icon')
        const startAt = i * 0.25

        tl.to(card, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, startAt)
          .to(drawEls, { strokeDashoffset: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, startAt + 0.1)
          .to(
            popEls,
            {
              opacity: 1,
              scale: 1,
              duration: 0.3,
              stagger: 0.05,
              ease: 'back.out(2)',
              onComplete: () => iconEl?.classList.add('is-live'),
            },
            startAt + 0.35
          )
      })
    },
    []
  )

  return (
    <section id="paths" className="three-paths" ref={sectionRef} aria-label="What we build">
      <div className="container">
        <p className="eyebrow">What we build</p>
        <SplitHeading as="h2" className="three-paths__title">
          Three Paths
        </SplitHeading>

        <div className="three-paths__grid">
          {paths.map((path, i) => (
            <article
              key={path.id}
              ref={(el) => (cardRefs.current[i] = el)}
              className="path-card"
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
