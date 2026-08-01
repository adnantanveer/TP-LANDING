import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Icon } from './Icon'
import { disciplines } from '../../data/disciplines'
import logo from '../../assets/techpotam-logo.png'
import preloaderVideo from '../../assets/preloader-bg.mp4'
import './Preloader.css'

const PARTICLE_COUNT = 240
const BAR_COUNT = 28
const TIMELINE_DURATION = 3.9

const DISCIPLINES = disciplines.map((d, i) => ({ ...d, at: (i + 1) * 25 }))

const CODE_LINES = [190, 310, 150, 360, 230, 330, 170, 290]

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = src
  })
}

/** Sample opaque pixels from the logo image into `count` scattered points, centered at (cx, cy). */
function sampleLogoPoints(img, count, cx, cy) {
  const boxH = 130
  const boxW = Math.round(boxH * (img.width / img.height))
  const off = document.createElement('canvas')
  off.width = boxW
  off.height = boxH
  const octx = off.getContext('2d')
  octx.drawImage(img, 0, 0, boxW, boxH)
  const data = octx.getImageData(0, 0, boxW, boxH).data

  const candidates = []
  const stride = 2
  for (let y = 0; y < boxH; y += stride) {
    for (let x = 0; x < boxW; x += stride) {
      if (data[(y * boxW + x) * 4 + 3] > 120) candidates.push({ x, y })
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const offsetX = cx - boxW / 2
  const offsetY = cy - boxH / 2
  const points = []
  for (let i = 0; i < count; i++) {
    const base = candidates.length ? candidates[i % candidates.length] : { x: boxW / 2, y: boxH / 2 }
    const jitter = candidates.length && i >= candidates.length ? (Math.random() - 0.5) * 3 : 0
    points.push({ x: offsetX + base.x + jitter, y: offsetY + base.y + jitter })
  }
  return points
}

/** Even perimeter sampling of a simple laptop silhouette (screen rect + base rect). */
function laptopPoints(count, cx, cy, unit) {
  const screen = { x: cx - unit * 0.5, y: cy - unit * 0.66, w: unit, h: unit * 0.62 }
  const base = { x: cx - unit * 0.62, y: screen.y + screen.h + unit * 0.04, w: unit * 1.24, h: unit * 0.09 }

  const rectSegs = (r) => [
    [{ x: r.x, y: r.y }, { x: r.x + r.w, y: r.y }],
    [{ x: r.x + r.w, y: r.y }, { x: r.x + r.w, y: r.y + r.h }],
    [{ x: r.x + r.w, y: r.y + r.h }, { x: r.x, y: r.y + r.h }],
    [{ x: r.x, y: r.y + r.h }, { x: r.x, y: r.y }],
  ]
  const segs = [...rectSegs(screen), ...rectSegs(base)]
  const lengths = segs.map(([a, b]) => Math.hypot(b.x - a.x, b.y - a.y))
  const total = lengths.reduce((s, l) => s + l, 0)

  const points = []
  for (let i = 0; i < count; i++) {
    let d = (i / count) * total
    let segIdx = 0
    while (segIdx < segs.length - 1 && d > lengths[segIdx]) {
      d -= lengths[segIdx]
      segIdx++
    }
    const [a, b] = segs[segIdx]
    const t = lengths[segIdx] ? d / lengths[segIdx] : 0
    points.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })
  }
  return { points, screen }
}

/**
 * Full-screen cinematic intro: ambient soundwave -> a point of light ->
 * particles gather into the logo -> morph into a wireframe laptop -> code
 * streams onto the screen -> crossfades to a finished site -> the whole
 * scene dissolves forward into the Hero's own 3D laptop, which sits in
 * roughly the same screen region so the handoff reads as one continuous
 * zoom rather than a hard cut. Pure Canvas 2D + DOM (no WebGL) so it paints
 * before the Hero's Three.js chunk is even needed. Skipped entirely under
 * prefers-reduced-motion.
 */
export function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const canvasRef = useRef(null)
  const glowRef = useRef(null)
  const screenRef = useRef(null)
  const scanlineRef = useRef(null)
  const codeRef = useRef(null)
  const siteRef = useRef(null)
  const flashRef = useRef(null)
  const barRefs = useRef([])
  const chipRefs = useRef([])
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    if (reducedMotion) {
      onComplete()
      return undefined
    }

    let cancelled = false
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let width = 0
    let height = 0
    let cx = 0
    let cy = 0
    let particles = []
    let frameId = null

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      cx = width / 2
      cy = height / 2
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 40
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        tx: cx,
        ty: cy,
      }
    })

    function draw() {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(247, 245, 242, 0.92)'
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function step() {
      for (const p of particles) {
        p.x += (p.tx - p.x) * 0.09
        p.y += (p.ty - p.y) * 0.09
      }
      draw()
      frameId = requestAnimationFrame(step)
    }
    frameId = requestAnimationFrame(step)

    const bars = barRefs.current
    gsap.set(bars, { scaleY: 0.15 })
    const soundwave = gsap.timeline({ repeat: -1 })
    bars.forEach((bar, i) => {
      soundwave.to(
        bar,
        { scaleY: () => 0.2 + Math.random() * 0.9, duration: 0.35 + Math.random() * 0.3, ease: 'sine.inOut' },
        i * 0.02
      )
    })
    soundwave.eventCallback('onRepeat', () => {
      bars.forEach((bar) => gsap.to(bar, { scaleY: 0.2 + Math.random() * 0.9, duration: 0.4, ease: 'sine.inOut' }))
    })

    const progress = { value: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        soundwave.kill()
        cancelAnimationFrame(frameId)
        document.body.style.overflow = previousOverflow
        ScrollTrigger.refresh()
        onComplete()
      },
    })

    tl.to(progress, {
      value: 100,
      duration: TIMELINE_DURATION,
      ease: 'none',
      onUpdate: () => {
        chipRefs.current.forEach((chip, i) => {
          chip?.classList.toggle('is-active', progress.value >= DISCIPLINES[i].at)
        })
      },
    }, 0)

    tl.to(glowRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }, 0)
    tl.to(glowRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.6)

    tl.call(
      () => {
        loadImage(logo).then((img) => {
          if (cancelled) return
          const logoPts = sampleLogoPoints(img, PARTICLE_COUNT, cx, cy)
          particles.forEach((p, i) => {
            p.tx = logoPts[i].x
            p.ty = logoPts[i].y
          })
        })
      },
      null,
      0.45
    )

    tl.call(
      () => {
        const unit = Math.min(width, height) * 0.34
        const { points, screen } = laptopPoints(PARTICLE_COUNT, cx, cy, unit)
        particles.forEach((p, i) => {
          p.tx = points[i].x
          p.ty = points[i].y
        })
        const el = screenRef.current
        if (el) {
          el.style.left = `${screen.x}px`
          el.style.top = `${screen.y}px`
          el.style.width = `${screen.w}px`
          el.style.height = `${screen.h}px`
        }
      },
      null,
      1.5
    )

    tl.fromTo(
      scanlineRef.current,
      { top: '0%', opacity: 1 },
      { top: '100%', opacity: 0.3, duration: 0.6, ease: 'power1.in' },
      1.75
    )

    tl.to(codeRef.current, { opacity: 1, duration: 0.35 }, 2.3)
    tl.fromTo(
      gsap.utils.toArray('.preloader__code-line'),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out', transformOrigin: 'left center' },
      2.3
    )
    tl.to(codeRef.current, { opacity: 0, duration: 0.3 }, 2.95)
    tl.to(siteRef.current, { opacity: 1, duration: 0.4 }, 2.95)

    tl.to(flashRef.current, { opacity: 0.55, duration: 0.12, ease: 'power1.in' }, 3.5)
    tl.to(flashRef.current, { opacity: 0, duration: 0.35, ease: 'power1.out' }, 3.62)
    tl.to(
      rootRef.current,
      { opacity: 0, scale: 1.06, duration: 0.55, ease: 'power2.inOut' },
      3.55
    )

    return () => {
      cancelled = true
      document.body.style.overflow = previousOverflow
      window.removeEventListener('resize', resize)
      if (frameId) cancelAnimationFrame(frameId)
      soundwave.kill()
      tl.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (reducedMotion) return null

  return (
    <div className="preloader" ref={rootRef} aria-hidden="true">
      <video className="preloader__video" autoPlay muted loop playsInline preload="auto">
        <source src={preloaderVideo} type="video/mp4" />
      </video>
      <div className="preloader__scrim" />
      <canvas ref={canvasRef} className="preloader__canvas" />

      <div className="preloader__glow" ref={glowRef} />

      <div className="preloader__screen" ref={screenRef}>
        <div className="preloader__scanline" ref={scanlineRef} />
        <div className="preloader__code" ref={codeRef}>
          {CODE_LINES.map((w, i) => (
            <span key={i} className="preloader__code-line" style={{ width: `${w / 4}px` }} />
          ))}
        </div>
        <div className="preloader__site" ref={siteRef}>
          <span className="preloader__site-nav" />
          <span className="preloader__site-hero" />
          <div className="preloader__site-cards">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>

      <div className="preloader__soundwave" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <span key={i} ref={(el) => (barRefs.current[i] = el)} className="preloader__bar" />
        ))}
      </div>

      <div className="preloader__disciplines">
        {DISCIPLINES.map((d, i) => (
          <span key={d.label} ref={(el) => (chipRefs.current[i] = el)} className="preloader__chip">
            <Icon name={d.icon} size={16} />
            <span>{d.label}</span>
          </span>
        ))}
      </div>

      <div className="preloader__flash" ref={flashRef} />
    </div>
  )
}
