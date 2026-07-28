import gsap from 'gsap'

/** Resets an icon to its hidden state, then plays the draw-in + pop-in. */
export function playIconIn(container) {
  const drawEls = container.querySelectorAll('.icon-draw')
  const popEls = container.querySelectorAll('.icon-pop')
  const iconEl = container.querySelector('.motion-icon')
  iconEl?.classList.remove('is-live')

  gsap.set(drawEls, { scaleX: 0, transformOrigin: 'left center' })
  gsap.set(popEls, { opacity: 0, scale: 0.5, transformOrigin: 'center' })

  gsap.to(drawEls, { scaleX: 1, duration: 0.45, stagger: 0.06, ease: 'power2.out' })
  gsap.to(popEls, {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    stagger: 0.05,
    delay: 0.3,
    ease: 'back.out(2)',
    onComplete: () => iconEl?.classList.add('is-live'),
  })
}
