import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import gsap from 'gsap'
import './HeroScene3D.css'

const LID_CLOSED = Math.PI / 2
const LID_OPEN = 0.18

function makeScreenTexture(kind) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 320
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0a0c10'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (kind === 'code') {
    const widths = [190, 310, 150, 360, 230, 330, 170, 290, 210, 260]
    widths.forEach((w, i) => {
      ctx.fillStyle = i % 3 === 0 ? '#7d97ad' : i % 3 === 1 ? '#c9c3ba' : '#4c6b8a'
      const indent = 28 + (i % 4) * 18
      ctx.fillRect(indent, 24 + i * 27, w, 10)
    })
  } else if (kind === 'ui') {
    ctx.strokeStyle = 'rgba(247,245,242,0.55)'
    ctx.lineWidth = 3
    ctx.strokeRect(24, 24, canvas.width - 48, 36)
    ctx.strokeRect(24, 76, canvas.width - 48, 96)
    const cardW = (canvas.width - 48 - 40) / 3
    for (let i = 0; i < 3; i++) {
      ctx.strokeRect(24 + i * (cardW + 20), 190, cardW, 100)
    }
  } else {
    ctx.fillStyle = '#f7f5f2'
    ctx.fillStyle = '#e4e0d8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#2b2b2e'
    ctx.fillRect(24, 24, canvas.width - 48, 36)
    const grad = ctx.createLinearGradient(24, 76, canvas.width - 24, 172)
    grad.addColorStop(0, '#4c6b8a')
    grad.addColorStop(1, '#2b2b2e')
    ctx.fillStyle = grad
    ctx.fillRect(24, 76, canvas.width - 48, 96)
    const cardW = (canvas.width - 48 - 40) / 3
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(76,107,138,0.55)'
      ctx.fillRect(24 + i * (cardW + 20), 190, cardW, 100)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function makeKeyboardTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 160
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#111214'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#2a2d31'
  const cols = 14
  const rows = 5
  const gap = 3
  const keyW = (canvas.width - gap * (cols + 1)) / cols
  const keyH = (canvas.height - gap * (rows + 1)) / rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = gap + c * (keyW + gap)
      const y = gap + r * (keyH + gap)
      ctx.fillRect(x, y, keyW, keyH)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/**
 * Cinematic hero centerpiece: a stylised 3D laptop that plays an original
 * click -> wake -> open -> code -> UI -> product -> camera-orbit sequence
 * once on load (GSAP-driven, values mutated directly on the Three.js
 * objects), then settles into a slow idle rotation with mouse parallax.
 * Screen/keyboard textures are procedurally drawn on canvas — no external
 * assets. Skips straight to the settled "product" frame under
 * prefers-reduced-motion; pointer parallax skipped on coarse pointers.
 */
export function HeroScene3D() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches

    let width = container.clientWidth
    let height = container.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100)
    camera.position.set(0.4, 2.3, 6.4)
    camera.lookAt(0, 0.85, -0.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(pixelRatio)
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.3, 0.5, 0.92)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())

    // ---- rig: continuous auto-rotation (outer) + pointer parallax (inner) ----
    const rig = new THREE.Group()
    rig.position.set(2.1, -0.3, -0.6)
    rig.scale.setScalar(0.62)
    scene.add(rig)
    const parallax = new THREE.Group()
    rig.add(parallax)

    // ---- laptop base ----
    const baseGeo = new THREE.BoxGeometry(3.2, 0.12, 2.1)
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x18191b, metalness: 0.55, roughness: 0.35 })
    const base = new THREE.Mesh(baseGeo, shellMat)
    parallax.add(base)

    const keyboardTexture = makeKeyboardTexture()
    const keyboardMat = new THREE.MeshStandardMaterial({
      map: keyboardTexture,
      emissive: new THREE.Color(0x4c6b8a),
      emissiveIntensity: 0,
      roughness: 0.6,
    })
    const keyboard = new THREE.Mesh(new THREE.PlaneGeometry(2.75, 1.7), keyboardMat)
    keyboard.rotation.x = -Math.PI / 2
    keyboard.position.set(0, 0.062, -0.05)
    parallax.add(keyboard)

    // ---- lid, hinged at the back edge of the base ----
    const hinge = new THREE.Group()
    hinge.position.set(0, 0.06, -1.05)
    hinge.rotation.x = LID_CLOSED
    parallax.add(hinge)

    const lidGeo = new THREE.BoxGeometry(3.2, 2.0, 0.09)
    const lid = new THREE.Mesh(lidGeo, shellMat)
    lid.position.set(0, 1.0, 0.045)
    hinge.add(lid)

    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 1.85),
      new THREE.MeshBasicMaterial({ color: 0x9db8cc, transparent: true, opacity: 0 })
    )
    glow.position.set(0, 1.0, 0.095)
    hinge.add(glow)

    const layerDefs = ['code', 'ui', 'product']
    const layers = layerDefs.map((kind) => {
      const mat = new THREE.MeshBasicMaterial({
        map: makeScreenTexture(kind),
        transparent: true,
        opacity: 0,
      })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.82, 1.78), mat)
      mesh.position.set(0, 1.0, 0.1)
      hinge.add(mesh)
      return mesh
    })
    const [codeLayer, uiLayer, productLayer] = layers
    productLayer.material.opacity = reducedMotion ? 1 : 0

    // ---- lighting ----
    scene.add(new THREE.AmbientLight(0xf7f5f2, 0.5))
    const key = new THREE.DirectionalLight(0x9db8cc, 1.3)
    key.position.set(3, 5, 4)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x4c6b8a, 0.7)
    rim.position.set(-4, 2, -3)
    scene.add(rim)

    // ---- click / wake indicator ----
    const clickRing = new THREE.Mesh(
      new THREE.RingGeometry(0.05, 0.075, 32),
      new THREE.MeshBasicMaterial({ color: 0xf7f5f2, transparent: true, opacity: 0, side: THREE.DoubleSide })
    )
    clickRing.position.set(0, 0.35, 1.6)
    scene.add(clickRing)

    if (reducedMotion) {
      hinge.rotation.x = LID_OPEN
      keyboardMat.emissiveIntensity = 0.7
      glow.material.opacity = 0.12
    }

    let frameId = null
    let targetX = 0
    let targetY = 0
    const idleTl = gsap.timeline({ repeat: -1, yoyo: true })

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      targetY = px * 0.35
      targetX = -py * 0.15
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

    function render() {
      parallax.rotation.x += (targetX - parallax.rotation.x) * 0.05
      parallax.rotation.y += (targetY - parallax.rotation.y) * 0.05
      composer.render()
      frameId = requestAnimationFrame(render)
    }

    let introTl
    if (!reducedMotion) {
      introTl = gsap.timeline({ delay: 0.3 })
      introTl
        .to(clickRing.material, { opacity: 0.8, duration: 0.15 })
        .to(clickRing.scale, { x: 6, y: 6, z: 6, duration: 0.5, ease: 'power2.out' }, '<')
        .to(clickRing.material, { opacity: 0, duration: 0.4 }, '<0.1')
        .to(glow.material, { opacity: 0.4, duration: 0.5 }, '-=0.2')
        .to(keyboardMat, { emissiveIntensity: 0.7, duration: 0.6 }, '<')
        .to(hinge.rotation, { x: LID_OPEN, duration: 1.3, ease: 'power2.inOut' }, '-=0.2')
        .to(codeLayer.material, { opacity: 1, duration: 0.5 }, '-=0.5')
        .to(glow.material, { opacity: 0.12, duration: 0.6 }, '<')
        .to(codeLayer.material, { opacity: 0, duration: 0.45 }, '+=0.6')
        .to(uiLayer.material, { opacity: 1, duration: 0.45 }, '<')
        .to(uiLayer.material, { opacity: 0, duration: 0.45 }, '+=0.7')
        .to(productLayer.material, { opacity: 1, duration: 0.6 }, '<')
        .to(
          camera.position,
          {
            x: -1.1,
            y: 1.9,
            z: 6.0,
            duration: 1.6,
            ease: 'power2.inOut',
            onUpdate: () => camera.lookAt(0, 0.85, -0.2),
          },
          '-=0.1'
        )
        .add(() => {
          idleTl.to(rig.rotation, { y: 0.12, duration: 4.5, ease: 'sine.inOut' })
          idleTl.to(rig.position, { y: -0.2, duration: 4.5, ease: 'sine.inOut' }, '<')
        })
    } else {
      idleTl.to(rig.rotation, { y: 0.08, duration: 4.5, ease: 'sine.inOut' })
    }

    if (!isCoarsePointer) window.addEventListener('pointermove', onPointerMove)
    frameId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      if (frameId) cancelAnimationFrame(frameId)
      introTl?.kill()
      idleTl.kill()
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
  }, [])

  return <div ref={containerRef} className="hero-scene-3d" aria-hidden="true" />
}
