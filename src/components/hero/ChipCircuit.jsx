import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
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
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#141c17'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(124,158,186,0.12)'
  ctx.lineWidth = 1
  for (let i = 0; i <= 16; i++) {
    const p = (i / 16) * canvas.width
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, canvas.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, p)
    ctx.lineTo(canvas.width, p)
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
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
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100)
    const cameraBase = new THREE.Vector3(1.2, 3.6, 4.2)
    camera.position.copy(cameraBase)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.5, 0.55, 0.85)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    const world = new THREE.Group()
    world.scale.setScalar(0.9)
    scene.add(world)

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.1, 3.4),
      new THREE.MeshStandardMaterial({ map: makeBoardTexture(), roughness: 0.8 })
    )
    world.add(board)

    const chipMeshes = NODES.map((node) => {
      const group = new THREE.Group()
      group.position.set(node.pos[0], 0.09, node.pos[1])
      world.add(group)

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.16, 0.62),
        new THREE.MeshStandardMaterial({ color: 0x1a1c1f, metalness: 0.4, roughness: 0.5 })
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

    let frameId = null
    let targetX = 0
    let targetY = 0
    let curX = 0
    let curY = 0

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect()
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.4
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.25
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

    function render() {
      curX += (targetX - curX) * 0.05
      curY += (targetY - curY) * 0.05
      camera.position.set(cameraBase.x + curX, cameraBase.y + curY, cameraBase.z)
      camera.lookAt(0, 0, 0)
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
