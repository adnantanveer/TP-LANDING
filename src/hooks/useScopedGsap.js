import { useLayoutEffect } from 'react'
import gsap from 'gsap'

/**
 * Runs `setup` inside a gsap.context() scoped to scopeRef, and reverts
 * (kills tweens/ScrollTriggers created within it) on cleanup or dep change.
 */
export function useScopedGsap(scopeRef, setup, deps = []) {
  useLayoutEffect(() => {
    if (!scopeRef.current) return undefined
    const ctx = gsap.context(setup, scopeRef)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
