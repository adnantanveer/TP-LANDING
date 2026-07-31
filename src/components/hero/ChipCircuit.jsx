import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js'
import { disciplines } from '../../data/disciplines'
import './ChipCircuit.css'

// Board-space (x, z) positions — right-angle hops between them are what
// gets traced, matching a real PCB trace rather than a smooth curve.
const NODES = [
  { ...disciplines[0], pos: [-1.5, 1.05] },
  { ...disciplines[1], pos: [-0.35, -0.45] },
  { ...disciplines[2], pos: [1.0, 0.75] },
  { ...disciplines[3], pos: [1.5, -1.15] },
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

function makeChipTexture(label) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#12181f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(124,158,186,0.5)'
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16)
  ctx.fillStyle = '#f7f5f2'
  ctx.font = '600 34px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, canvas.width / 2, canvas.height / 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
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
  vignette.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, canvas.width, canvas.height)

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
export function ChipCircuit({ apiRef, stRef }) {
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
    const cameraBase = new THREE.Vector3(1.35, 3.0, 3.7)
    camera.position.copy(cameraBase)
    camera.lookAt(0, 0.05, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bokehPass = new BokehPass(scene, camera, {
      focus: 5.2,
      aperture: 0.0011,
      maxblur: 0.006,
    })
    composer.addPass(bokehPass)
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.55, 0.85)
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
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 14),
      new THREE.MeshStandardMaterial({ color: 0x0a0b0d, metalness: 0.75, roughness: 0.18 })
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.7
    world.add(floor)

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.1, 3.4),
      new THREE.MeshStandardMaterial({ map: makeBoardTexture(), roughness: 0.8 })
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
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), plaqueMat)
      plaque.rotation.x = -Math.PI / 2
      plaque.position.y = 0.165
      group.add(plaque)

      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.9, 0.9),
        new THREE.MeshBasicMaterial({ color: 0x9db8cc, transparent: true, opacity: 0 })
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

    let frameId = null
    let targetX = 0
    let targetY = 0
    let curX = 0
    let curY = 0

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
      camera.position.set(cameraBase.x + curX, cameraBase.y + curY, cameraBase.z)
      camera.lookAt(0, 0.05, 0)
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
