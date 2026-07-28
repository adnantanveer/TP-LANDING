import { useRef } from 'react'
import gsap from 'gsap'
import { useScopedGsap } from '../../hooks/useScopedGsap'

const PRESETS = {
  'fade-up': { y: 44, opacity: 0 },
  'fade-left': { x: -56, opacity: 0 },
  'fade-right': { x: 56, opacity: 0 },
  scale: { scale: 0.9, opacity: 0 },
  blur: { opacity: 0, filter: 'blur(14px)' },
}

/**
 * Declarative once-only scroll reveal, built on GSAP ScrollTrigger.
 * Set `stagger` > 0 to animate direct children instead of the wrapper itself.
 */
export function Reveal({
  as: Tag = 'div',
  animation = 'fade-up',
  delay = 0,
  stagger = 0,
  duration = 0.9,
  start = 'top 85%',
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)

  useScopedGsap(
    ref,
    () => {
      const targets = stagger ? gsap.utils.toArray(ref.current.children) : ref.current
      gsap.set(targets, PRESETS[animation])
      gsap.to(targets, {
        y: 0,
        x: 0,
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration,
        delay,
        stagger,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start, once: true },
      })
    },
    [animation, stagger, delay, duration, start]
  )

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}
