import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import './HeroScene3D.css'

/**
 * Low-poly faceted gem floating over the hero's particle network — a
 * genuine 3D element (Three.js) rather than a CSS/canvas illusion. Slow
 * continuous auto-rotation plus a subtle pointer-driven tilt on a separate
 * inner group (so the two motions never fight over the same transform).
 * Frozen to a single static frame under prefers-reduced-motion; pointer tilt
 * skipped on coarse (touch) pointers.
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
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100)
    camera.position.set(0, 0, 7)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    const rig = new THREE.Group()
    rig.position.set(2.3, -0.5, 0)
    scene.add(rig)

    const tiltGroup = new THREE.Group()
    rig.add(tiltGroup)

    const geometry = new THREE.IcosahedronGeometry(0.9, 1)
    const material = new THREE.MeshStandardMaterial({
      color: 0x4c6b8a,
      metalness: 0.3,
      roughness: 0.3,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
    })
    const gem = new THREE.Mesh(geometry, material)
    tiltGroup.add(gem)

    const edges = new THREE.EdgesGeometry(geometry)
    const wireMaterial = new THREE.LineBasicMaterial({ color: 0xf7f5f2, transparent: true, opacity: 0.4 })
    const wire = new THREE.LineSegments(edges, wireMaterial)
    tiltGroup.add(wire)

    scene.add(new THREE.AmbientLight(0xf7f5f2, 0.6))
    const key = new THREE.DirectionalLight(0x9db8cc, 1.2)
    key.position.set(4, 5, 6)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x2b2b2e, 0.5)
    rim.position.set(-5, -3, -4)
    scene.add(rim)

    let frameId = null
    let targetX = 0
    let targetY = 0
    const clock = new THREE.Clock()

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      targetY = px * 0.6
      targetX = -py * 0.4
    }

    const onResize = () => {
      width = container.clientWidth
      height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    function render() {
      const delta = clock.getDelta()
      rig.rotation.y += delta * 0.15
      tiltGroup.rotation.x += (targetX - tiltGroup.rotation.x) * 0.06
      tiltGroup.rotation.y += (targetY - tiltGroup.rotation.y) * 0.06
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(render)
    }

    if (reducedMotion) {
      renderer.render(scene, camera)
    } else {
      if (!isCoarsePointer) window.addEventListener('pointermove', onPointerMove)
      frameId = requestAnimationFrame(render)
    }

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      if (frameId) cancelAnimationFrame(frameId)
      geometry.dispose()
      material.dispose()
      edges.dispose()
      wireMaterial.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="hero-scene-3d" aria-hidden="true" />
}
