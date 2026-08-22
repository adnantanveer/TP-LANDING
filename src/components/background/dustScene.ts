import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";

/* ============================================================================
   Cosmic Dust — persistent site-wide ambient background. Ported from a
   standalone-HTML Three.js r0.143.0 spec, verbatim geometry/shaders/
   postprocessing, with the same two adaptations already used for the
   loader's TunnelBackground (see tunnelScene.ts): devicePixelRatio capped
   at 2, and a shared disposeComposer() since r0.143.0's EffectComposer has
   no dispose() of its own.

   Unlike the loader's Tunnel (a ~5s one-shot), this runs for the entire
   session, so it's mounted once at the app root (not per-route) and gated
   harder — see CosmicDustBackground.tsx for the tier/reduced-motion checks.
   ========================================================================== */

const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 };
// Bumped up from the original spec's 940/0.68 — the first pass read as too
// subtle next to the page's existing cursor-spotlight and section
// decorations, so density/brightness were raised on request until the dust
// reads as its own distinct layer while scrolling.
const POINT_COUNT = 2200;
const FIELD_DEPTH = 3.7;
const DRIFT_SPEED = 0.4;
const ALPHA_TARGET = 0.92;
const FADE_MS = 2200;

function hexToVec3(hex: string): THREE.Vector3 {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function disposeComposer(composer: EffectComposer) {
  composer.renderTarget1.dispose();
  composer.renderTarget2.dispose();
  for (const pass of composer.passes) {
    const disposable = pass as unknown as { dispose?: () => void };
    disposable.dispose?.();
  }
}

const DUST_VERTEX = `
attribute float size;
uniform float iTime;
uniform vec3 iShift;
uniform vec2 iResolution;
uniform vec3 iAnimation;
uniform float uDepth;
varying float transparency;
varying float warmness;
vec3 warp3d(vec3 pos, float t) {
  float curv = 0.9, a = 1.9, b = 0.25, b2 = 0.03, c = 0.02;
  pos *= 2.;
  pos.x += curv * sin(c * t + a * pos.y) + t * b2;
  pos.y += curv * cos(c * t + a * pos.x);
  pos.z += curv * cos(c * t + a * pos.y);
  pos.z += curv * sin(c * t + a * pos.x) + t * b;
  pos.z = abs(pos.z);
  return pos.xyz;
}
void main() {
  vec3 v = warp3d(position, iTime);
  v = uDepth * (2. * fract(v + iShift) - 1.) + iAnimation;
  vec4 vpos = modelViewMatrix * vec4(v, 1.);
  transparency = step(length(v), uDepth);
  warmness = step(.75, fract(size * 7.13));
  gl_PointSize = size * iResolution.y / 1000. / -vpos.z;
  gl_Position = projectionMatrix * vpos;
}
`;

const DUST_FRAGMENT = `
varying float transparency; varying float warmness;
uniform float iAlpha; uniform vec3 uCool; uniform vec3 uWarm;
void main() {
  vec3 color = mix(uCool * .8, uWarm * .8, warmness);
  float tex = smoothstep(1., .3, length(2. * gl_PointCoord - 1.));
  gl_FragColor = vec4(tex * color, tex * transparency * iAlpha);
}
`;

const FINAL_VERTEX = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`;

const FINAL_FRAGMENT = `
uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
uniform vec3 uBg; uniform vec3 uFlameA; uniform vec3 uFlameB; uniform float uFlameAmt;
varying vec2 vUv;
vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.;
  pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x);
  pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y);
  pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z);
  return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); }
void main(){
  vec2 uv = 2.*vUv - 1.;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
  vec3 flame = 1.5*uFlameA*w.x; flame*=w.y; flame += uFlameB*w.z;
  flame *= smoothstep(0.25, 1., abs(uv.y));
  float md = smoothstep(-0.7, 1., -uv.y*uv.x); flame *= md*md;
  vec3 bg = uBg * (1.0 - 0.4 * length(uv));
  vec3 halo = texture2D(haloTexture, vUv).xyz;
  gl_FragColor = vec4(bg + flame*uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
}
`;

interface FinalPassUniforms {
  iTime: { value: number };
  tDiffuse: { value: THREE.Texture | null };
  torusTexture: { value: THREE.Texture | null };
  bloomTexture: { value: THREE.Texture | null };
  haloTexture: { value: THREE.Texture | null };
  uBg: { value: THREE.Vector3 };
  uFlameA: { value: THREE.Vector3 };
  uFlameB: { value: THREE.Vector3 };
  uFlameAmt: { value: number };
}

const FinalPass = {
  uniforms: {
    iTime: { value: 0 },
    tDiffuse: { value: null },
    torusTexture: { value: null },
    bloomTexture: { value: null },
    haloTexture: { value: null },
    uBg: { value: hexToVec3("#1a0a04") },
    uFlameA: { value: hexToVec3("#ff7a2a") },
    uFlameB: { value: hexToVec3("#ffce5a") },
    uFlameAmt: { value: 0.2 },
  } satisfies FinalPassUniforms,
  vertexShader: FINAL_VERTEX,
  fragmentShader: FINAL_FRAGMENT,
};

function easeSmootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export class DustScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private pointUniforms: {
    iTime: { value: number };
    iShift: { value: THREE.Vector3 };
    iAlpha: { value: number };
    iAnimation: { value: THREE.Vector3 };
    iResolution: { value: { x: number; y: number } };
    uDepth: { value: number };
    uCool: { value: THREE.Vector3 };
    uWarm: { value: THREE.Vector3 };
  };
  private torusComposer: EffectComposer;
  private bloomComposer: EffectComposer;
  private finalComposer: EffectComposer;
  private finalPassUniforms: FinalPassUniforms;
  private raf = 0;
  private startTime = performance.now();
  private pausedAt = 0;
  private destroyed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = null;
    this.scene.fog = new THREE.Fog(0x000000, 0, 22);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80);
    this.camera.position.set(0, 0, 3);
    this.camera.layers.enable(LAYERS.TORUS_SCENE);
    this.camera.layers.enable(LAYERS.BLOOM_SCENE);
    this.camera.layers.enable(LAYERS.ENTIRE_SCENE);
    this.scene.add(this.camera);

    const count = POINT_COUNT;
    const positions: number[] = [];
    const sizes: number[] = [];
    for (let i = 0; i < count; i++) {
      positions.push(2 * Math.random() - 1, 2 * Math.random() - 1, 2 * Math.random() - 1);
      sizes.push(25 + 25 * Math.random());
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

    this.pointUniforms = {
      iTime: { value: 0 },
      iShift: { value: new THREE.Vector3() },
      iAlpha: { value: 0 },
      iAnimation: { value: new THREE.Vector3(0, 0, 0) },
      iResolution: { value: { x: window.innerWidth * window.devicePixelRatio, y: window.innerHeight * window.devicePixelRatio } },
      uDepth: { value: FIELD_DEPTH },
      uCool: { value: hexToVec3("#b3401f") },
      uWarm: { value: hexToVec3("#ffc46b") },
    };
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: this.pointUniforms,
      vertexShader: DUST_VERTEX,
      fragmentShader: DUST_FRAGMENT,
    });
    material.stencilWrite = false;
    const points = new THREE.Points(geometry, material);
    points.position.set(0, 0, -1);
    points.layers.enable(LAYERS.ENTIRE_SCENE);
    this.scene.add(points);

    const renderScene = new RenderPass(this.scene, this.camera);

    this.torusComposer = new EffectComposer(this.renderer);
    this.torusComposer.renderToScreen = false;
    this.torusComposer.addPass(renderScene);
    this.torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
    this.torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.3, 0.3, 0));
    this.torusComposer.addPass(new ShaderPass(CopyShader));

    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(renderScene);
    this.bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.7, 0));
    this.bloomComposer.addPass(new ShaderPass(GammaCorrectionShader));

    const finalPass = new ShaderPass(FinalPass);
    this.finalPassUniforms = finalPass.uniforms as unknown as FinalPassUniforms;
    this.finalPassUniforms.bloomTexture.value = this.bloomComposer.renderTarget1.texture;
    this.finalPassUniforms.torusTexture.value = this.torusComposer.renderTarget1.texture;

    this.finalComposer = new EffectComposer(this.renderer);
    this.finalComposer.addPass(renderScene);
    this.finalComposer.addPass(finalPass);

    this.loop = this.loop.bind(this);
    this.handleVisibility = this.handleVisibility.bind(this);
    document.addEventListener("visibilitychange", this.handleVisibility);
  }

  resize(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    for (const composer of [this.torusComposer, this.bloomComposer, this.finalComposer]) {
      composer.setPixelRatio(dpr);
      composer.setSize(width, height);
    }
    this.pointUniforms.iResolution.value = { x: width * dpr, y: height * dpr };
  }

  start() {
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    disposeComposer(this.torusComposer);
    disposeComposer(this.bloomComposer);
    disposeComposer(this.finalComposer);
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Points) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else obj.material.dispose();
      }
    });
    this.renderer.dispose();
  }

  private handleVisibility() {
    if (document.hidden) {
      this.pausedAt = performance.now();
      cancelAnimationFrame(this.raf);
    } else if (this.pausedAt) {
      this.startTime += performance.now() - this.pausedAt; // don't count paused time toward the fade-in
      this.pausedAt = 0;
      this.raf = requestAnimationFrame(this.loop);
    }
  }

  private renderPoints() {
    const now = performance.now();
    this.pointUniforms.iTime.value = now / 1000;
    this.pointUniforms.iShift.value.add(this.camera.position.clone().multiplyScalar(0.0022 * DRIFT_SPEED));

    const elapsed = now - this.startTime;
    const eased = easeSmootherstep(Math.min(1, elapsed / FADE_MS));
    this.pointUniforms.iAlpha.value = eased * ALPHA_TARGET;
  }

  private loop() {
    if (this.destroyed) return;
    this.finalPassUniforms.iTime.value = performance.now() / 1000;
    this.renderPoints();

    this.camera.layers.set(LAYERS.TORUS_SCENE);
    this.torusComposer.render();
    this.camera.layers.set(LAYERS.BLOOM_SCENE);
    this.bloomComposer.render();
    this.camera.layers.set(LAYERS.ENTIRE_SCENE);
    this.finalComposer.render();

    this.raf = requestAnimationFrame(this.loop);
  }
}
