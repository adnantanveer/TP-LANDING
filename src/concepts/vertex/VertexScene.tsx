import { useEffect, useRef } from "react";
import * as THREE from "three";
import { detectTier } from "@/components/LogoMorph/particleEngine";

const ACCENT = 0xa8ff5c; // must visually match --primary in vertex.css

/**
 * A real rendered 3D scene (Three.js), not a CSS approximation — a field
 * of wireframe/solid geometric shapes drifting in space, camera dollying
 * forward as the hero section scrolls past, with pointer parallax on the
 * whole group. Imperative Three.js in a plain class, same pattern this
 * codebase already uses for its other WebGL work (dustScene.ts,
 * particleEngine.ts) rather than pulling in @react-three/fiber for one
 * scene. Shape count scales with detectTier() (same device-capability
 * gate CosmicDustBackground already uses).
 */
class Scene {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  group: THREE.Group;
  raf = 0;
  pointer = { x: 0, y: 0 };
  targetRotation = { x: 0, y: 0 };
  scrollProgress = 0;
  reduceMotion: boolean;

  constructor(canvas: HTMLCanvasElement, container: HTMLElement, reduceMotion: boolean) {
    this.reduceMotion = reduceMotion;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0c0f0b, 0.045);

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    this.camera.position.set(0, 0, 14);

    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    const point = new THREE.PointLight(ACCENT, 4, 40);
    point.position.set(6, 6, 10);
    this.scene.add(ambient, point);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    const tier = detectTier();
    const count = tier === "high" ? 42 : tier === "medium" ? 26 : 14;
    this.buildShapes(count);
    this.resize(container.clientWidth, container.clientHeight);
  }

  buildShapes(count: number) {
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.8, 0.28, 8, 24),
      new THREE.OctahedronGeometry(1, 0),
    ];
    const wireMat = new THREE.MeshBasicMaterial({ color: ACCENT, wireframe: true, transparent: true, opacity: 0.55 });
    const solidMat = new THREE.MeshStandardMaterial({
      color: ACCENT,
      emissive: ACCENT,
      emissiveIntensity: 0.25,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });

    for (let i = 0; i < count; i++) {
      const geo = geometries[i % geometries.length];
      const solid = i % 5 === 0;
      const mesh = new THREE.Mesh(geo, solid ? solidMat : wireMat);
      const radius = 6 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 14;
      mesh.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius - 4);
      const scale = 0.4 + Math.random() * 1.1;
      mesh.scale.setScalar(scale);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.userData.spin = (Math.random() - 0.5) * 0.006 + (Math.random() < 0.5 ? -1 : 1) * 0.002;
      mesh.userData.spinAxis = Math.random();
      this.group.add(mesh);
    }
  }

  setPointer(x: number, y: number) {
    this.pointer = { x, y };
  }

  setScrollProgress(p: number) {
    this.scrollProgress = p;
  }

  resize(w: number, h: number) {
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  start() {
    const tick = () => {
      this.raf = requestAnimationFrame(tick);

      if (!this.reduceMotion) {
        this.group.children.forEach((child) => {
          const spin = (child.userData.spin as number) ?? 0.003;
          child.rotation.x += spin;
          child.rotation.y += spin * 0.7;
        });
      }

      // Pointer parallax: lerp toward target rather than snapping.
      this.targetRotation.y += (this.pointer.x * 0.25 - this.targetRotation.y) * 0.04;
      this.targetRotation.x += (this.pointer.y * 0.15 - this.targetRotation.x) * 0.04;
      this.group.rotation.y = this.targetRotation.y;
      this.group.rotation.x = this.targetRotation.x;

      // Scroll dolly: camera moves forward through the field as the hero scrolls.
      const targetZ = 14 - this.scrollProgress * 10;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.08;

      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.group.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    });
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && !Array.isArray(obj.material)) {
        obj.material.dispose();
      }
    });
    this.renderer.dispose();
  }
}

export function VertexScene({ scrollTarget }: { scrollTarget: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new Scene(canvas, wrap, reduceMotion);
    scene.start();

    const onResize = () => scene.resize(wrap.clientWidth, wrap.clientHeight);
    window.addEventListener("resize", onResize);

    const onPointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      scene.setPointer(nx, ny);
    };
    window.addEventListener("pointermove", onPointerMove);

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const target = scrollTarget.current;
        if (!target) return;
        const rect = target.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
        scene.setScrollProgress(progress);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      scene.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapRef} className="vertex-canvas-wrap">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
