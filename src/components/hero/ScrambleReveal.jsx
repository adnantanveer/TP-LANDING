import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import SplitType from 'split-type'

/**
 * Three-stage headline, driven by discrete stage numbers (not a boolean)
 * because there are three distinct states to move between, forward or
 * backward, as `stage` changes with scroll in either direction:
 *   0 = not there yet — invisible
 *   1 = scrambled — every character visible but scattered/rotated, and
 *       playful (they drift with the cursor)
 *   2 = resolved into the actual sentence
 */
export function ScrambleReveal({ as: Tag = 'h1', stage, onResolved, className = '', children }) {
  const ref = useRef(null)
  const splitRef = useRef(null)
  const tweenRef = useRef(null)
  const moversRef = useRef([])
  const interactiveRef = useRef(true)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const split = new SplitType(el, { types: 'chars' })
    splitRef.current = split

    if (reducedMotion) {
      gsap.set(split.chars, { x: 0, y: 0, rotation: 0, opacity: 1 })
      return () => split.revert()
    }

    // Scatter targets are picked across the hero section, not a small
    // jitter near the text's own spot — each character's base offset is (a
    // random point in the hero, inset from the edges so nothing lands under
    // the navbar/menu button) minus (its natural resting position), so the
    // transform actually lands it out there.
    const heroEl = el.closest('.hero') || el
    const heroRect = heroEl.getBoundingClientRect()
    const inset = { top: 140, right: 170, bottom: 60, left: 40 }
    const bounds = {
      left: heroRect.left + inset.left,
      top: heroRect.top + inset.top,
      width: Math.max(0, heroRect.width - inset.left - inset.right),
      height: Math.max(0, heroRect.height - inset.top - inset.bottom),
    }

    moversRef.current = split.chars.map((char) => {
      const charRect = char.getBoundingClientRect()
      const natural = { x: charRect.left + charRect.width / 2, y: charRect.top + charRect.height / 2 }
      const targetX = bounds.left + Math.random() * bounds.width
      const targetY = bounds.top + Math.random() * bounds.height
      const base = {
        x: targetX - natural.x,
        y: targetY - natural.y,
        rotation: gsap.utils.random(-45, 45),
      }
      gsap.set(char, { ...base, opacity: 0 })
      return {
        base,
        natural,
        setX: gsap.quickTo(char, 'x', { duration: 0.35, ease: 'power3.out' }),
        setY: gsap.quickTo(char, 'y', { duration: 0.35, ease: 'power3.out' }),
      }
    })

    // Proximity-based "runs away" chase: characters within RADIUS of the
    // cursor get pushed further along the line away from it, scaled by how
    // close the cursor is; outside that radius they settle back to their
    // resting scrambled spot.
    const RADIUS = 170
    const FLEE_DISTANCE = 110
    const onMove = (e) => {
      if (!interactiveRef.current) return
      moversRef.current.forEach(({ base, natural, setX, setY }) => {
        const charX = natural.x + base.x
        const charY = natural.y + base.y
        const dx = charX - e.clientX
        const dy = charY - e.clientY
        const dist = Math.hypot(dx, dy)
        if (dist < RADIUS && dist > 0.01) {
          const push = (1 - dist / RADIUS) * FLEE_DISTANCE
          setX(base.x + (dx / dist) * push)
          setY(base.y + (dy / dist) * push)
        } else {
          setX(base.x)
          setY(base.y)
        }
      })
    }
    window.addEventListener('pointermove', onMove)

    return () => {
      window.removeEventListener('pointermove', onMove)
      tweenRef.current?.kill()
      split.revert()
    }
  }, [])

  useLayoutEffect(() => {
    const split = splitRef.current
    if (!split) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (stage >= 2) onResolved?.()
      return undefined
    }

    interactiveRef.current = stage === 1
    tweenRef.current?.kill()

    if (stage === 0) {
      // Not there yet — plain fade to invisible, no need to move position.
      tweenRef.current = gsap.to(split.chars, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      })
    } else if (stage === 1) {
      // Scrambled — pop into scattered/rotated positions, visible and
      // playful. Also where a reversal from "resolved" lands, so this has
      // to explicitly set the scrambled position too, not just opacity.
      tweenRef.current = gsap.to(split.chars, {
        x: (i) => moversRef.current[i]?.base.x ?? 0,
        y: (i) => moversRef.current[i]?.base.y ?? 0,
        rotation: (i) => moversRef.current[i]?.base.rotation ?? 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        stagger: { each: 0.01, from: 'random' },
      })
    } else {
      tweenRef.current = gsap.to(split.chars, {
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.035,
        onComplete: onResolved,
      })
    }

    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
