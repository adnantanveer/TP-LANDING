import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import techpotamLogo from '../../assets/techpotam-logo.png'
import './ChipCircuit.css'

// Board-space (x, z) positions — right-angle hops between them are what
// gets traced, matching a real PCB trace rather than a smooth curve. This
// tells its own small story rather than listing generic disciplines: an
// idea becomes a real TechPotam build, powered by AI, shipped into reality.
const NODES = [
  { pos: [-1.5, 1.05], label: 'Your Idea', icon: 'idea', color: '#f2b84b' },
  { pos: [-0.35, -0.45], label: 'TechPotam', icon: 'logo', color: '#9db8cc' },
  { pos: [1.0, 0.75], label: 'AI', icon: 'robot', color: '#7c5cbf' },
  { pos: [1.5, -1.15], label: 'AI to Reality', icon: 'rocket', color: '#5fae7a' },
]

const BOARD_SIZE = { w: 4.2, d: 3.4 }

const GREEBLE_SPOTS = [
  [-1.9, -1.35, 'capacitor'], [-0.75, 1.35, 'resistor'], [0.35, -1.3, 'smd'], [1.85, 1.25, 'capacitor'],
  [-1.95, 0.15, 'resistor'], [1.95, -0.35, 'smd'], [0.55, 1.35, 'capacitor'], [-0.95, -1.2, 'resistor'],
  [1.35, 0.05, 'smd'], [-0.1, 0.35, 'capacitor'], [1.85, -1.35, 'resistor'], [-1.6, 0.6, 'smd'],
]

// Board-space (x, z) -> board texture UV, for drawing footprint outlines
// under each greeble on the same canvas the board mesh is textured with.
function boardToUV(x, z, canvasW, canvasH) {
  return {
    u: ((x + BOARD_SIZE.w / 2) / BOARD_SIZE.w) * canvasW,
    v: ((z + BOARD_SIZE.d / 2) / BOARD_SIZE.d) * canvasH,
  }
}

// A small overshoot-then-settle curve — gives the AI robot's entrance a
// "pop into place" feel rather than a flat linear scale-up.
function easeOutBack(x) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
}

function makeShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(0,0,0,0.55)')
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return new THREE.CanvasTexture(canvas)
}

// Alpha-only radial mask (opaque center, transparent edges) used to feather
// the floor plane's edges — without this it's a hard-edged rectangle that
// blocks the background video around the chipset instead of just sitting
// under it.
function makeFadeAlphaTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,1)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return new THREE.CanvasTexture(canvas)
}

// Drawn at 2x pixel density (canvas is physically 512, but every drawing
// call below still thinks in the original 0-256 space via ctx.scale) —
// 256 real pixels stretched across a plaque viewed at a steep, oblique
// camera angle was soft even before any texture filtering was involved.
const CHIP_CANVAS_SCALE = 2

function makeChipCanvas(bg = '#12181f') {
  const canvas = document.createElement('canvas')
  canvas.width = 256 * CHIP_CANVAS_SCALE
  canvas.height = 256 * CHIP_CANVAS_SCALE
  const ctx = canvas.getContext('2d')
  ctx.scale(CHIP_CANVAS_SCALE, CHIP_CANVAS_SCALE)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = 'rgba(124,158,186,0.5)'
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, 256 - 16, 256 - 16)
  return { canvas, ctx }
}

function drawChipLabel(ctx, label, color = '#f7f5f2') {
  ctx.fillStyle = color
  ctx.font = '600 26px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, 128, 222)
}

function textureFrom(canvas) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Plain text plaque — used as an instant placeholder for the logo chip
 * while the real logo image loads, and as a generic fallback. */
function makeChipTexture(label) {
  const { canvas, ctx } = makeChipCanvas()
  drawChipLabel(ctx, label)
  return textureFrom(canvas)
}

// Real icon glyphs from Lucide (ISC license — permissive, no attribution
// required; path data taken directly from the library's own SVG files),
// stroked onto the chip canvas via Path2D rather than hand-drawn shapes.
const LUCIDE_PATHS = {
  lightbulb: [
    'M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5',
    'M9 18h6',
    'M10 22h4',
  ],
  bot: ['M12 8V4H8', 'M2 14h2', 'M20 14h2', 'M15 13v2', 'M9 13v2'],
  rocket: [
    'M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
    'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09',
    'M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z',
    'M9 12H4s.55-3.03 2-4c1.62-1.08 5 .05 5 .05',
  ],
}

function drawLucideIcon(ctx, name, { cx, cy, size = 76, color }) {
  const scale = size / 24
  ctx.save()
  ctx.translate(cx - 12 * scale, cy - 12 * scale)
  ctx.scale(scale, scale)
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  LUCIDE_PATHS[name].forEach((d) => ctx.stroke(new Path2D(d)))
  if (name === 'bot') {
    ctx.beginPath()
    ctx.roundRect(4, 8, 16, 12, 2)
    ctx.stroke()
  }
  ctx.restore()
}

// A lightbulb, for "Your Idea" — a warm glow behind the real Lucide glyph.
function makeIdeaTexture() {
  const { canvas, ctx } = makeChipCanvas()
  const cx = 128
  const cy = 96
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 60)
  glow.addColorStop(0, 'rgba(242,184,75,0.35)')
  glow.addColorStop(1, 'rgba(242,184,75,0)')
  ctx.fillStyle = glow
  ctx.fillRect(cx - 70, cy - 70, 140, 140)
  drawLucideIcon(ctx, 'lightbulb', { cx, cy, color: '#f2b84b' })
  drawChipLabel(ctx, 'Your Idea')
  return textureFrom(canvas)
}

// A friendly bot glyph, for the "AI" chip.
function makeRobotTexture() {
  const { canvas, ctx } = makeChipCanvas()
  drawLucideIcon(ctx, 'bot', { cx: 128, cy: 96, color: '#a894d9' })
  drawChipLabel(ctx, 'AI')
  return textureFrom(canvas)
}

// A rocket lifting off, for "AI to Reality" — the idea has shipped.
function makeRocketTexture() {
  const { canvas, ctx } = makeChipCanvas()
  drawLucideIcon(ctx, 'rocket', { cx: 128, cy: 96, color: '#7fc79a' })
  drawChipLabel(ctx, 'AI to Reality')
  return textureFrom(canvas)
}

// The real TechPotam logo, recolored solid white — the same treatment the
// site's own header uses for this logo on a dark background (there it's a
// CSS `brightness(0) invert(1)` filter; here it's the same idea done at the
// pixel level since this is a canvas texture, not a DOM <img>). A colored
// lockup on a small backing card read as "fine print" next to the other
// three chips' bold single-color glyphs — solid white, large, directly on
// the dark plaque (no card) gives it the same graphic punch as the others,
// and avoids the earlier bloom-blowout since it's a sparse shape, not a
// filled rectangle. Loaded async, so the caller gets a placeholder texture
// immediately and swaps this one in once ready.
function loadLogoTexture(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const { canvas, ctx } = makeChipCanvas()
      const maxW = 210
      const maxH = 150
      const scale = Math.min(maxW / img.width, maxH / img.height)
      const w = img.width * scale
      const h = img.height * scale
      const x = 128 - w / 2
      const y = 128 - h / 2
      // The source-in/fillRect composite trick drew a solid block instead
      // of the logo's silhouette — switching to the Canvas 2D `filter` API
      // with the exact same filter string the navbar's CSS already uses
      // successfully for this logo, just applied at draw time instead of
      // via a DOM stylesheet.
      ctx.filter = 'brightness(0) invert(1)'
      ctx.drawImage(img, x, y, w, h)
      ctx.filter = 'none'
      resolve(textureFrom(canvas))
    }
    img.src = src
  })
}

// Crops just the icon mark from the left of the full lockup (icon +
// "TECHPOTAM" wordmark side by side in the same source image) — used on
// the AI robot's chest, where only the mark reads cleanly at that size.
// Keeps the mark's own brand colors rather than recoloring it, since it's
// meant to read as a small badge rather than the flat white plaque used
// elsewhere on the PCB chips.
function loadLogoMarkTexture(src) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 256
      canvas.height = 256
      const ctx = canvas.getContext('2d')
      const markFrac = 0.29
      const sw = img.width * markFrac
      const sh = img.height
      const maxW = 200
      const maxH = 200
      const scale = Math.min(maxW / sw, maxH / sh)
      const w = sw * scale
      const h = sh * scale
      const x = (canvas.width - w) / 2
      const y = (canvas.height - h) / 2
      ctx.drawImage(img, 0, 0, sw, sh, x, y, w, h)
      resolve(textureFrom(canvas))
    }
    img.src = src
  })
}

const CHIP_TEXTURES = {
  idea: makeIdeaTexture,
  robot: makeRobotTexture,
  rocket: makeRocketTexture,
}

function makeBoardTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#141c17'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Faint fabricator's grid, like a real PCB layer.
  ctx.strokeStyle = 'rgba(124,158,186,0.08)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 24; i++) {
    const p = (i / 24) * canvas.width
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, canvas.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, p)
    ctx.lineTo(canvas.width, p)
    ctx.stroke()
  }

  // Copper-trace squiggles scattered across the board — short chained
  // right-angle runs, like real routed signal traces between components.
  for (let i = 0; i < 46; i++) {
    let x = Math.random() * canvas.width
    let y = Math.random() * canvas.height
    ctx.strokeStyle = `rgba(157, 184, 204, ${0.1 + Math.random() * 0.14})`
    ctx.lineWidth = 1.5 + Math.random() * 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    const hops = 2 + Math.floor(Math.random() * 3)
    for (let h = 0; h < hops; h++) {
      if (Math.random() > 0.5) x += (Math.random() - 0.5) * 140
      else y += (Math.random() - 0.5) * 140
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Vias / mounting holes.
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    ctx.beginPath()
    ctx.arc(x, y, 2.5 + Math.random() * 2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(200, 210, 215, 0.18)'
    ctx.fill()
  }

  // Footprint outlines under each greeble's spot, like real labeled pads.
  ctx.strokeStyle = 'rgba(157, 184, 204, 0.25)'
  ctx.lineWidth = 1.5
  GREEBLE_SPOTS.forEach(([x, z]) => {
    const { u, v } = boardToUV(x, z, canvas.width, canvas.height)
    ctx.strokeRect(u - 26, v - 20, 52, 40)
  })

  // Subtle vignette so the edges read as darker board material.
  const vignette = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.25,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.72
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Feather the board's own alpha toward its edges (destination-in keeps
  // only what overlaps the gradient below) so the background video shows
  // through around the chipset instead of the board reading as one big
  // hard-edged opaque rectangle covering most of the frame. Fade starts
  // closer to center than a "whole board" silhouette would, so only a
  // tight halo around the chips themselves stays opaque.
  ctx.globalCompositeOperation = 'destination-in'
  const alphaFade = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.2,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width * 0.46
  )
  alphaFade.addColorStop(0, 'rgba(255,255,255,1)')
  alphaFade.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = alphaFade
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'source-over'

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// Small non-interactive components scattered across the board purely for
// density/realism — capacitors, resistors, tiny SMD chips. None of these
// are part of the navigable trace; they never light up or animate. Each
// gets a soft blurred contact shadow beneath it — a cheap stand-in for real
// ambient occlusion that does a lot of work selling "sitting on the board".
function addGreebles(world, shadowTex) {
  GREEBLE_SPOTS.forEach(([x, z, kind]) => {
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.34, 0.34),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    )
    shadow.rotation.x = -Math.PI / 2
    shadow.position.set(x, 0.056, z)
    world.add(shadow)

    let mesh
    if (kind === 'capacitor') {
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0x2b2f35, metalness: 0.6, roughness: 0.35 })
      )
      mesh.position.y = 0.06
    } else if (kind === 'resistor') {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.05, 0.07),
        new THREE.MeshStandardMaterial({ color: 0x8c7654, roughness: 0.6 })
      )
      mesh.position.y = 0.025
      mesh.rotation.y = Math.random() * Math.PI
    } else {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.045, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x111316, metalness: 0.5, roughness: 0.4 })
      )
      mesh.position.y = 0.022
      mesh.rotation.y = Math.random() * Math.PI
    }
    mesh.position.x = x
    mesh.position.z = z
    world.add(mesh)
  })
}

// A trace segment mesh whose local origin sits at `from` — scaling it
// along its own axis from 0 to 1 grows it toward `to`, so revealing the
// trace is just a scale tween with no arc-length math to keep in sync.
function makeSegment(from, to) {
  const dx = to[0] - from[0]
  const dz = to[1] - from[1]
  const isX = Math.abs(dx) > Math.abs(dz)
  const len = Math.abs(isX ? dx : dz) || 0.001
  const geo = new THREE.BoxGeometry(isX ? len : 0.055, 0.05, isX ? 0.055 : len)
  geo.translate(isX ? dx / 2 : 0, 0, isX ? 0 : dz / 2)
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x9db8cc }))
  mesh.position.set(from[0], 0.09, from[1])
  mesh.scale.set(isX ? 0.001 : 1, 1, isX ? 1 : 0.001)
  return { mesh, axis: isX ? 'x' : 'z' }
}

/**
 * The Hero's visual centerpiece: a real WebGL circuit board where "chips" —
 * one per discipline — light up as a trace draws itself between them. The
 * scroll-trigger/pin driving that progress lives in Hero.jsx (synchronous,
 * not part of this lazy-loaded chunk — see the comment there for why); this
 * component only renders the scene and exposes a `setProgress` through
 * `apiRef` for Hero to drive. `stRef` gives it the live ScrollTrigger so it
 * can sync to whatever progress already happened if the user scrolled
 * before this chunk finished loading.
 */
export function ChipCircuit({ apiRef, stRef, onRobotStateChange }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches

    let width = container.clientWidth
    let height = container.clientHeight

    const scene = new THREE.Scene()
    // A wider FOV + closer, lower camera than a "product catalog" telephoto
    // shot — the extra perspective distortion (near components look
    // noticeably bigger than far ones) is what actually reads as 3D depth
    // rather than a flat illustration, especially once the idle sway and
    // mouse-parallax are moving that perspective around.
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100)
    // A closer offset than a "whole board" establishing shot — the camera
    // follows whichever chip the trace is currently reaching (below), so
    // it needs to already read as zoomed-in rather than pulling back to
    // frame the full board every time it moves.
    const cameraBase = new THREE.Vector3(0.9, 2.05, 2.5)
    camera.position.set(NODES[0].pos[0] + cameraBase.x, cameraBase.y, NODES[0].pos[1] + cameraBase.z)
    camera.lookAt(NODES[0].pos[0], 0.05, NODES[0].pos[1])
    // The camera itself needs to be part of the scene graph for the AI
    // robot below to render — it's parented to the camera (screen-space
    // "right side of frame" placement, not board-space), and the renderer
    // only draws what it can reach by traversing from `scene`.
    scene.add(camera)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    // `alpha: true` above only makes the canvas *capable* of transparency —
    // the renderer still clears every frame to opaque black by default
    // unless told otherwise. That's almost certainly why nothing behind
    // this canvas (the background video) was showing: the canvas painted
    // as a solid dark rectangle regardless of where the 3D scene actually
    // drew anything.
    renderer.setClearAlpha(0)
    container.appendChild(renderer.domElement)
    // The board is viewed from a steep, oblique angle rather than head-on —
    // exactly the case where textures look blurry without anisotropic
    // filtering, since the GPU is sampling them at a heavy skew. Applied to
    // every texture below via the scene traverse near the end of setup.
    const maxAniso = renderer.capabilities.getMaxAnisotropy()

    const composer = new EffectComposer(renderer)
    const renderPass = new RenderPass(scene, camera)
    renderPass.clearAlpha = 0
    composer.addPass(renderPass)
    // BokehPass (depth-of-field) removed: it allocates its internal depth
    // render target from window.innerWidth/innerHeight at construction time
    // (no width/height was ever passed here) and never resizes it, so at
    // large/fullscreen viewport sizes that buffer mismatched the actual
    // canvas size — the likely cause of the video failing to show through
    // only at large window sizes while working fine at smaller ones.
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.55, 0.92)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    const world = new THREE.Group()
    world.scale.setScalar(0.9)
    scene.add(world)

    // A dark glossy surface well below the board — low roughness so it
    // picks up specular highlights from the lights as the scene sways,
    // reading as "resting on a glass/lacquer surface" rather than floating
    // against a flat background. Deliberately not a full mirror reflection
    // (no extra render pass to keep this cheap); the sheen alone sells depth.
    // Sized just past the board's own footprint (not a huge ground plane) —
    // an oversized opaque plane here would sweep into view more and more as
    // the viewport gets wider, which is exactly what was blotting out the
    // background video at large/fullscreen window sizes while it showed
    // fine in a smaller window.
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 4.6),
      new THREE.MeshStandardMaterial({
        color: 0x0a0b0d,
        metalness: 0.75,
        roughness: 0.18,
        alphaMap: makeFadeAlphaTexture(),
        transparent: true,
      })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.7
    world.add(floor)

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.1, 3.4),
      new THREE.MeshStandardMaterial({ map: makeBoardTexture(), roughness: 0.8, transparent: true })
    )
    world.add(board)
    const shadowTex = makeShadowTexture()
    addGreebles(world, shadowTex)

    const chipMeshes = NODES.map((node) => {
      const group = new THREE.Group()
      group.position.set(node.pos[0], 0.09, node.pos[1])
      world.add(group)

      const chipShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.85, 0.85),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
      )
      chipShadow.rotation.x = -Math.PI / 2
      chipShadow.position.y = -0.005
      group.add(chipShadow)

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.16, 0.62),
        new THREE.MeshStandardMaterial({ color: 0x1a1c1f, metalness: 0.55, roughness: 0.4 })
      )
      body.position.y = 0.08
      group.add(body)
      ;[
        [0.36, 0, 0],
        [-0.36, 0, 0],
        [0, 0, 0.36],
        [0, 0, -0.36],
      ].forEach(([x, , z]) => {
        const pin = new THREE.Mesh(
          new THREE.BoxGeometry(x ? 0.16 : 0.32, 0.03, z ? 0.16 : 0.32),
          new THREE.MeshStandardMaterial({ color: 0x8a8f96, metalness: 0.7, roughness: 0.3 })
        )
        pin.position.set(x, 0.02, z)
        group.add(pin)
      })

      const plaqueMat = new THREE.MeshBasicMaterial({ map: makeChipTexture(node.label), transparent: true })
      if (node.icon === 'logo') {
        loadLogoTexture(techpotamLogo).then((tex) => {
          if (maxAniso > 1) tex.anisotropy = maxAniso
          plaqueMat.map?.dispose()
          plaqueMat.map = tex
          plaqueMat.needsUpdate = true
        })
      } else {
        plaqueMat.map = CHIP_TEXTURES[node.icon]?.() ?? plaqueMat.map
      }
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), plaqueMat)
      plaque.rotation.x = -Math.PI / 2
      plaque.position.y = 0.165
      group.add(plaque)

      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.9),
        new THREE.MeshBasicMaterial({ color: node.color || 0x9db8cc, transparent: true, opacity: 0 })
      )
      glow.rotation.x = -Math.PI / 2
      glow.position.y = 0.02
      group.add(glow)

      return { glow }
    })

    const segments = []
    for (let i = 1; i < NODES.length; i++) {
      const from = NODES[i - 1].pos
      const to = NODES[i].pos
      const bend = [to[0], from[1]]
      segments.push(makeSegment(from, bend), makeSegment(bend, to))
    }
    segments.forEach(({ mesh }) => world.add(mesh))

    scene.add(new THREE.AmbientLight(0xf7f5f2, 0.6))
    const key = new THREE.DirectionalLight(0x9db8cc, 1.1)
    key.position.set(3, 5, 2)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x4c6b8a, 0.5)
    rim.position.set(-3, 2, -3)
    scene.add(rim)
    // Warm bounce-light fill, like a second reflector card in a product
    // shoot — keeps the far side of the board from going flat black.
    const fill = new THREE.DirectionalLight(0xc9a988, 0.35)
    fill.position.set(-2, 1.2, 3)
    scene.add(fill)

    // A small AI robot that lives in camera (screen) space, not board space
    // — it always sits in the same spot on the right side of the frame
    // regardless of which chip the camera is currently dollying toward.
    // Hidden (scale ~0) until the trace reaches the final "AI to Reality"
    // chip, then pops into place — see setProgress()/render() below. Built
    // as a proper humanoid silhouette (head/neck/torso/arms/legs) rather
    // than a single stacked block. There's no environment map in this scene,
    // so near-full metalness (as tried first) reflects almost nothing but
    // tiny specular pinpricks and reads as a dark, hard-to-see blob — this
    // uses a lighter, more moderate metal (similar range to the chip bodies
    // elsewhere in the scene, which already read clearly under these same
    // lights) so it stays visibly lit via diffuse response, not just
    // reflection. Glow emissive intensity kept modest — bloom's threshold
    // is easy to blow past at this close camera range, which is what turned
    // the whole thing into a white flare last time.
    const robotAccent = new THREE.Color('#4169e1')
    const robotBodyMat = new THREE.MeshStandardMaterial({
      color: 0xaab2c4,
      metalness: 0.55,
      roughness: 0.32,
      emissive: 0x1c2028,
      emissiveIntensity: 0.5,
    })
    const robotJointMat = new THREE.MeshStandardMaterial({
      color: 0xd6dae4,
      metalness: 0.6,
      roughness: 0.25,
      emissive: 0x1c2028,
      emissiveIntensity: 0.4,
    })
    const robotGlowMat = new THREE.MeshStandardMaterial({
      color: robotAccent,
      emissive: robotAccent,
      emissiveIntensity: 1.1,
      roughness: 0.25,
    })

    const robotGroup = new THREE.Group()
    robotGroup.position.set(1.3, -0.05, -2.9)
    robotGroup.scale.setScalar(0.0001)
    camera.add(robotGroup)

    const robotHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 20), robotBodyMat)
    robotHead.position.y = 0.62
    robotGroup.add(robotHead)
    ;[-0.065, 0.065].forEach((ex) => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 12), robotGlowMat)
      eye.position.set(ex, 0.63, 0.135)
      robotGroup.add(eye)
    })

    const robotNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 12), robotJointMat)
    robotNeck.position.y = 0.48
    robotGroup.add(robotNeck)

    const robotChest = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.28, 0.24), robotBodyMat)
    robotChest.position.y = 0.32
    robotGroup.add(robotChest)

    const robotCore = new THREE.Mesh(new THREE.CircleGeometry(0.075, 24), robotGlowMat)
    robotCore.position.set(0, 0.32, 0.119)
    robotGroup.add(robotCore)

    // TechPotam "TP" mark badge, sitting just in front of the glow above —
    // reads as a lit chest emblem rather than a flat sticker. Hidden until
    // the (already-bundled, near-instant) crop finishes loading.
    const robotLogoMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    const robotLogo = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), robotLogoMat)
    robotLogo.position.set(0, 0.32, 0.123)
    robotGroup.add(robotLogo)
    loadLogoMarkTexture(techpotamLogo).then((tex) => {
      if (maxAniso > 1) tex.anisotropy = maxAniso
      robotLogoMat.map = tex
      robotLogoMat.opacity = 1
      robotLogoMat.needsUpdate = true
    })

    const robotWaist = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.2), robotBodyMat)
    robotWaist.position.y = 0.14
    robotGroup.add(robotWaist)

    ;[-1, 1].forEach((side) => {
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), robotJointMat)
      shoulder.position.set(side * 0.24, 0.4, 0)
      robotGroup.add(shoulder)

      const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.09), robotBodyMat)
      upperArm.position.set(side * 0.26, 0.26, 0)
      robotGroup.add(upperArm)

      const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), robotJointMat)
      elbow.position.set(side * 0.26, 0.14, 0)
      robotGroup.add(elbow)

      const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.08), robotBodyMat)
      forearm.position.set(side * 0.26, 0.02, 0.03)
      forearm.rotation.x = -0.25
      robotGroup.add(forearm)
    })

    const robotHip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.18), robotJointMat)
    robotHip.position.y = 0.045
    robotGroup.add(robotHip)

    ;[-1, 1].forEach((side) => {
      const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.2, 0.1), robotBodyMat)
      thigh.position.set(side * 0.09, -0.08, 0)
      robotGroup.add(thigh)

      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), robotJointMat)
      knee.position.set(side * 0.09, -0.19, 0)
      robotGroup.add(knee)

      const shin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.09), robotBodyMat)
      shin.position.set(side * 0.09, -0.31, 0)
      robotGroup.add(shin)

      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.16), robotJointMat)
      foot.position.set(side * 0.09, -0.42, 0.03)
      robotGroup.add(foot)
    })

    const robotAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), robotJointMat)
    robotAntenna.position.set(0, 0.78, 0)
    robotGroup.add(robotAntenna)

    const robotAntennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), robotGlowMat)
    robotAntennaTip.position.set(0, 0.85, 0)
    robotGroup.add(robotAntennaTip)

    const robotRing = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 8, 48), robotGlowMat)
    robotRing.rotation.x = Math.PI / 2.3
    robotRing.position.y = -0.45
    robotGroup.add(robotRing)

    const robotOrbitDots = Array.from({ length: 3 }, (_, i) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), robotGlowMat)
      robotGroup.add(dot)
      return { mesh: dot, offset: (i / 3) * Math.PI * 2 }
    })

    if (maxAniso > 1) {
      scene.traverse((obj) => {
        if (obj.material?.map) {
          obj.material.map.anisotropy = maxAniso
          obj.material.map.needsUpdate = true
        }
      })
    }

    let frameId = null
    let targetX = 0
    let targetY = 0
    let curX = 0
    let curY = 0
    // Where the camera is dollying to/from as the trace progresses — starts
    // zoomed in on the first chip, then follows along to each next one.
    let camFollowX = NODES[0].pos[0]
    let camFollowZ = NODES[0].pos[1]
    let curFollowX = camFollowX
    let curFollowZ = camFollowZ

    // AI robot reveal state — triggered once the trace reaches the final
    // chip (see setProgress), then plays a fixed-duration pop-in tween
    // independent of further scroll, so Hero.jsx can hold the scroll lock
    // until this finishes rather than releasing it the instant progress
    // hits 1.
    const ROBOT_REVEAL_DURATION = 1.1
    // Its final resting size — 1.5x read too large (the head/antenna were
    // pushed past the top of the frame, cropping the face out of view
    // entirely), so this stays close to the raw pop-in scale.
    const ROBOT_REST_SCALE = 1.05
    let robotActive = false
    let robotStartTime = 0
    let robotDoneCalled = false
    let robotScale = 0.0001

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect()
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.75
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.45
    }
    const onResize = () => {
      width = container.clientWidth
      height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      composer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)
    if (!isCoarsePointer) window.addEventListener('pointermove', onPointerMove)

    let idleT = 0
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function render() {
      curX += (targetX - curX) * 0.05
      curY += (targetY - curY) * 0.05
      // A slow continuous sway, independent of the mouse — the board reads
      // as a real 3D object even to someone who never moves their cursor.
      if (!reducedMotion) {
        idleT += 0.0032
        world.rotation.y = Math.sin(idleT) * 0.14
        world.rotation.x = Math.sin(idleT * 0.7) * 0.04
      }
      // Ease toward wherever the trace currently is, rather than snapping —
      // the dolly move between chips is what sells "zooming in on this one"
      // instead of just cutting between static shots.
      curFollowX += (camFollowX - curFollowX) * 0.045
      curFollowZ += (camFollowZ - curFollowZ) * 0.045
      camera.position.set(curFollowX + cameraBase.x + curX, cameraBase.y + curY, curFollowZ + cameraBase.z)
      camera.lookAt(curFollowX, 0.05, curFollowZ)

      if (robotActive) {
        const elapsed = (performance.now() - robotStartTime) / 1000
        const t = Math.min(1, elapsed / ROBOT_REVEAL_DURATION)
        robotScale = Math.max(0.0001, easeOutBack(t)) * ROBOT_REST_SCALE
        robotGroup.rotation.y = (1 - t) * Math.PI * 0.6
        if (t >= 1 && !robotDoneCalled) {
          robotDoneCalled = true
          onRobotStateChange?.(true)
        }
      } else {
        robotScale += (0.0001 - robotScale) * 0.12
        robotGroup.rotation.y *= 0.9
      }
      robotGroup.scale.setScalar(robotScale)
      const robotT = performance.now() * 0.001
      robotHead.position.y = 0.62 + Math.sin(robotT * 1.6) * 0.012
      robotAntennaTip.material.emissiveIntensity = 1.0 + Math.sin(robotT * 3) * 0.35
      robotRing.rotation.z += 0.01
      robotOrbitDots.forEach(({ mesh, offset }) => {
        const a = robotT * 1.2 + offset
        mesh.position.set(Math.cos(a) * 0.24, 0.62 + Math.sin(a * 1.3) * 0.05, Math.sin(a) * 0.24)
      })

      composer.render()
      frameId = requestAnimationFrame(render)
    }
    frameId = requestAnimationFrame(render)

    const setProgress = (p) => {
      const total = segments.length
      segments.forEach(({ mesh, axis }, i) => {
        const segProgress = Math.min(1, Math.max(0, p * total - i))
        if (axis === 'x') mesh.scale.x = Math.max(0.001, segProgress)
        else mesh.scale.z = Math.max(0.001, segProgress)
      })
      chipMeshes.forEach((chip, i) => {
        const isActive = i === 0 || p >= i / (NODES.length - 1) - 0.03
        chip.glow.material.opacity = isActive ? 0.5 : 0
      })

      // Which chip the camera should be zoomed in on — interpolated so the
      // dolly move happens smoothly across each hop rather than jumping.
      const hopCount = NODES.length - 1
      const hopF = Math.min(hopCount, Math.max(0, p * hopCount))
      const hopIdx = Math.min(hopCount - 1, Math.floor(hopF))
      const hopT = hopF - hopIdx
      const from = NODES[hopIdx].pos
      const to = NODES[hopIdx + 1].pos
      camFollowX = from[0] + (to[0] - from[0]) * hopT
      camFollowZ = from[1] + (to[1] - from[1]) * hopT

      // Same threshold the last chip's own glow uses — the robot pops in
      // right as "AI to Reality" lights up. Scrolling back out before the
      // reveal finishes retracts it and clears the "done" flag, so it plays
      // the full entrance again next time progress reaches this point.
      const reachedLastChip = p >= 1 - 0.03
      if (reachedLastChip && !robotActive) {
        robotActive = true
        robotStartTime = performance.now()
        robotDoneCalled = false
      } else if (!reachedLastChip && robotActive) {
        robotActive = false
        robotDoneCalled = false
        onRobotStateChange?.(false)
      }
    }
    // Sync to whatever progress already happened on Hero's scroll-trigger
    // (owned there, not here) in case the user scrolled before this lazy
    // chunk finished loading, rather than always starting at 0.
    const initialProgress = stRef?.current?.progress ?? 0
    setProgress(initialProgress)
    apiRef.current = { setProgress }

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      if (frameId) cancelAnimationFrame(frameId)
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => {
            m.map?.dispose()
            m.dispose()
          })
        }
      })
      composer.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className="chip-circuit" aria-hidden="true" />
}
