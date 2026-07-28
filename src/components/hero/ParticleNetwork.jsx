import { useEffect, useRef } from 'react'
import './ParticleNetwork.css'

const NODE_RGB = '247, 245, 242'
const LINK_RGB = '124, 158, 186'
const POINTER_RGB = '247, 245, 242'

const NODE_COUNT_BASE = 70
const REFERENCE_AREA = 1440 * 900
const LINK_DISTANCE = 130
const POINTER_RADIUS = 180

function makeGlowSprite() {
  const size = 20
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const sctx = sprite.getContext('2d')
  const gradient = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, `rgba(${NODE_RGB}, 0.9)`)
  gradient.addColorStop(1, `rgba(${NODE_RGB}, 0)`)
  sctx.fillStyle = gradient
  sctx.fillRect(0, 0, size, size)
  return sprite
}

/**
 * Full-bleed canvas particle network for the hero background: drifting
 * glowing nodes, distance-based connecting lines, and lines reaching toward
 * the cursor. Pure Canvas 2D (no Three.js) to keep this cheap on every
 * device. Freezes to a single static frame under prefers-reduced-motion.
 */
export function ParticleNetwork() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const glowSprite = makeGlowSprite()

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches

    let width = 0
    let height = 0
    let particles = []
    let animationFrame = null
    const pointer = { x: 0, y: 0, active: false }

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect()
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const area = width * height
      const count = Math.max(24, Math.min(110, Math.round((area / REFERENCE_AREA) * NODE_COUNT_BASE)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 1,
      }))

      if (reducedMotion) draw()
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      const linkDistSq = LINK_DISTANCE * LINK_DISTANCE
      const pointerRadiusSq = POINTER_RADIUS * POINTER_RADIUS

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distSq = dx * dx + dy * dy
          if (distSq < linkDistSq) {
            const opacity = (1 - Math.sqrt(distSq) / LINK_DISTANCE) * 0.35
            ctx.strokeStyle = `rgba(${LINK_RGB}, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }

        if (pointer.active) {
          const dx = a.x - pointer.x
          const dy = a.y - pointer.y
          const distSq = dx * dx + dy * dy
          if (distSq < pointerRadiusSq) {
            const opacity = (1 - Math.sqrt(distSq) / POINTER_RADIUS) * 0.6
            ctx.strokeStyle = `rgba(${POINTER_RGB}, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(pointer.x, pointer.y)
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        const glowSize = p.r * 8
        ctx.drawImage(glowSprite, p.x - glowSize / 2, p.y - glowSize / 2, glowSize, glowSize)
        ctx.beginPath()
        ctx.fillStyle = `rgba(${NODE_RGB}, 0.85)`
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function step() {
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1
      }
      draw()
      animationFrame = requestAnimationFrame(step)
    }

    resize()
    window.addEventListener('resize', resize)

    let onMove
    let onLeave
    if (!isCoarsePointer) {
      onMove = (e) => {
        const rect = canvas.getBoundingClientRect()
        pointer.x = e.clientX - rect.left
        pointer.y = e.clientY - rect.top
        pointer.active = true
        if (reducedMotion) draw()
      }
      onLeave = () => {
        pointer.active = false
        if (reducedMotion) draw()
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerleave', onLeave)
    }

    if (!reducedMotion) {
      animationFrame = requestAnimationFrame(step)
    }

    return () => {
      window.removeEventListener('resize', resize)
      if (onMove) window.removeEventListener('pointermove', onMove)
      if (onLeave) window.removeEventListener('pointerleave', onLeave)
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [])

  return <canvas ref={canvasRef} className="particle-network" aria-hidden="true" />
}
