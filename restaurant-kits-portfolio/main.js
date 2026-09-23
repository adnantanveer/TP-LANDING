import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const revealItems = document.querySelectorAll('.reveal');

gsap.timeline({ defaults: { ease: 'power3.out' } })
  .to('.page-shell', { duration: 1, autoAlpha: 1, ease: 'power2.out' })
  .from('.brand', { duration: 0.9, y: -24, opacity: 0, filter: 'blur(16px)' }, '-=0.7')
  .from('nav a', { duration: 0.8, y: -16, opacity: 0, stagger: 0.08, filter: 'blur(10px)' }, '-=0.7')
  .from('.banner-shell', { duration: 1.5, y: 70, opacity: 0, filter: 'blur(20px)', scale: 0.97, ease: 'expo.out' }, '-=0.6')
  .from('.mini-stack img', { duration: 0.9, y: 28, opacity: 0, stagger: 0.18 }, '-=1.0')
  .from('.banner-copy-wrap', { duration: 1.05, y: 32, opacity: 0 }, '-=0.8')
  .from('.banner-actions', { duration: 0.8, y: 20, opacity: 0 }, '-=0.6')
  .from('.banner-right img', { duration: 1.25, x: 52, opacity: 0, scale: 0.96, ease: 'power3.out' }, '-=1.0');

gsap.utils.toArray('.reveal').forEach((item) => {
  gsap.fromTo(item,
    { opacity: 0, y: 42 },
    {
      scrollTrigger: {
        trigger: item,
        start: 'top 82%',
        once: true,
      },
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power2.out'
    }
  );
});

const floatGroup = document.querySelector('.banner-shell');
if (floatGroup) {
  gsap.to(floatGroup, {
    y: -6,
    duration: 3.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    paused: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
}

const canvas = document.getElementById('three-scene');

if (canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.BoxGeometry(1.7, 1.7, 1.7);
  const material = new THREE.MeshStandardMaterial({
    color: 0xd46d2e,
    metalness: 0.45,
    roughness: 0.28,
    emissive: 0x3a1c0a,
    emissiveIntensity: 0.3
  });

  const cube = new THREE.Mesh(geometry, material);
  group.add(cube);

  const wireframe = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xf2b184, transparent: true, opacity: 0.9 })
  );
  group.add(wireframe);

  const ambient = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambient);

  const point = new THREE.PointLight(0xffd29d, 2, 50);
  point.position.set(3, 4, 6);
  scene.add(point);

  function resizeRenderer() {
    const { clientWidth, clientHeight } = canvas;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resizeRenderer);
  resizeRenderer();

  const tick = () => {
    cube.rotation.x += 0.008;
    cube.rotation.y += 0.011;
    wireframe.rotation.x -= 0.006;
    wireframe.rotation.y -= 0.009;
    group.rotation.z = Math.sin(Date.now() * 0.001) * 0.3;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };

  tick();

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.to('.scene-wrap', {
      duration: 2.6,
      scale: 1.04,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  }
}
