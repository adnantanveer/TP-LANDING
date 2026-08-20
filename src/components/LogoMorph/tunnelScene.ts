import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";

/* ============================================================================
   Tunnel — glowing wormhole background for the LogoMorph intro.
   Ported from a standalone-HTML Three.js r0.143.0 spec. Two deliberate
   adaptations for use as a ~5s overlay background instead of a full
   scrollable page (everything else — geometry, shaders, colors, motion,
   postprocessing pipeline — is verbatim):
     1. No real page scroll exists during the intro (body scroll is locked).
        `scrollCurrent` is driven by `setProgress()` on a synthetic 0..1
        timeline from LogoMorph's own phase clock instead of window.scrollY.
     2. devicePixelRatio is capped at 2 (matches this project's existing
        performance convention in particleEngine.ts) — an uncapped DPR
        through a 3-composer bloom pipeline on a retina display is a real
        frame-time risk stacked underneath an already-active particle canvas.
   Also gated by device tier (see TunnelBackground.tsx) — skipped entirely
   on low-tier devices and under prefers-reduced-motion.
   ========================================================================== */

const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 };

// Matches particleEngine.ts's PHASE.HOLD_END + a short tail — the synthetic
// "scroll" ramps to its target over this window instead of a real scrollbar.
const INTRO_MS = 4700;
const SCROLL_DEPTH_CAP = 0.72; // don't demand the full 34-unit fly depth in ~5s

const Lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// r0.143.0's EffectComposer has no dispose() of its own (confirmed against
// the shipped source — passes/render-targets must be freed individually).
function disposeComposer(composer: EffectComposer) {
  composer.renderTarget1.dispose();
  composer.renderTarget2.dispose();
  for (const pass of composer.passes) {
    const disposable = pass as unknown as { dispose?: () => void };
    disposable.dispose?.();
  }
}

function hexToVec3(hex: string): THREE.Vector3 {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

// Resolved sRGB hex for this theme's --primary / --background (oklch, so
// not directly usable as a WebGL uniform) — resolved once via a canvas
// pixel readback in a real browser. Must be kept in sync with styles.css;
// re-resolve if those tokens change (see Hero.tsx's ACCENT for the same
// pattern with the scroll-world engine's CSS-side theming).
const THEME_PRIMARY = "#f8962d"; // oklch(0.76 0.16 62)
const THEME_BG = "#060a0e"; // oklch(0.14 0.012 250)

const SNOISE = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const TUNNEL_VERTEX = `
uniform float uTime; uniform float uSize; uniform float uSwirl; uniform float uScale;
uniform vec3 uColLow; uniform vec3 uColHigh;
uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
varying float vFade; varying vec3 vColor;
${SNOISE}
void main() {
  vec3 wp = vec3(position.x * 7.0, 0.0, position.z * 25.0);
  wp.x += position.y * 6.0;
  float wn = snoise(vec3(wp.x * 0.08, wp.z * 0.08, uTime * 0.15)) * 2.0;
  wn += snoise(vec3(wp.x * 0.16, wp.z * 0.16, uTime * 0.3)) * 0.8;

  float tunnelR = 12.0;
  float currentSliceRadius = sqrt(max(0.0, 17.64 - position.z * position.z));
  float maxSliceWidth = 9.2195 * currentSliceRadius;
  float normalizedX = wp.x / (maxSliceWidth + 0.001);
  float tunnelAngle = normalizedX * 3.14159265;

  float jitterAngle = snoise(vec3(position.x * 15.0, position.y * 15.0, uTime * 0.1)) * 0.35;
  float jitterZ = snoise(vec3(position.y * 15.0, position.z * 15.0, uTime * 0.1)) * 4.0;
  float ambientSwirl = snoise(vec3(position.x * 5.0, position.y * 5.0, uTime * 0.2)) * 3.0;
  tunnelAngle += jitterAngle + ambientSwirl * uSwirl;

  float dynamicR = tunnelR - wn;
  vec3 tunnelPos = vec3(dynamicR * sin(tunnelAngle), -dynamicR * cos(tunnelAngle), wp.z + jitterZ);

  vec3 finalPos = tunnelPos * uScale;
  vec4 modelPosition = modelMatrix * vec4(finalPos, 1.0);
  vec3 toP = modelPosition.xyz - uCursor;
  float cd = length(toP);
  float fall = smoothstep(uRepelRadius, 0.0, cd);
  modelPosition.xyz += normalize(toP + vec3(0.0001)) * fall * uRepelStrength * uActivity;
  vec4 mvPosition = viewMatrix * modelPosition;

  float colMix = smoothstep(-3.0, 3.0, position.y + position.x * 0.5);
  vColor = mix(uColLow, uColHigh, clamp(colMix, 0.0, 1.0));
  vFade = 1.0;

  gl_PointSize = uSize * (10.0 / -mvPosition.z);
  gl_PointSize = max(gl_PointSize, 1.5);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const TUNNEL_FRAGMENT = `
uniform float uOpacity; uniform float uBrightness; uniform float uAppear;
varying float vFade; varying vec3 vColor;
void main() {
  vec2 xy = gl_PointCoord - 0.5;
  float ll = length(xy);
  if (ll > 0.5) discard;
  float a = smoothstep(0.5, 0.1, ll);
  gl_FragColor = vec4(vColor * uBrightness, vFade * a * uOpacity * uAppear);
}
`;

const ATMO_VERTEX = `
attribute float size; attribute float seed; uniform float uTime; uniform vec2 uRes;
varying float vA;
vec3 warp(vec3 p, float t){ float c=0.9,a=1.9,b=0.02,s=0.05; p*=2.;
  p.x+=c*sin(s*t+a*p.y)+t*b; p.y+=c*cos(s*t+a*p.x); p.y+=c*sin(s*t+a*p.z)+t*b;
  p.z+=c*cos(s*t+a*p.y); p.z+=c*sin(s*t+a*p.x)+t*b; p.x+=c*cos(s*t+a*p.z);
  return cos(p+vec3(1,2,4)); }
void main(){
  vec3 v = position*4.0 + warp(position, uTime)*1.2;
  vec4 mv = modelViewMatrix * vec4(v, 1.0);
  float r = length(v); float farF = 1.0 - smoothstep(5.0, 6.5, r); float nearF = smoothstep(0.0, 0.5, -mv.z);
  vA = farF * nearF;
  gl_PointSize = size * uRes.y / 900.0 / -mv.z; gl_PointSize = max(gl_PointSize, 1.0);
  gl_Position = projectionMatrix * mv;
}
`;

const ATMO_FRAGMENT = `
uniform vec3 uColor; varying float vA;
void main(){ vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
  float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor * tex, tex * vA * 0.6); }
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
    uBg: { value: hexToVec3("#0a0524") },
    uFlameA: { value: hexToVec3("#2bf0ff") },
    uFlameB: { value: hexToVec3("#7a3cff") },
    uFlameAmt: { value: 0.2 },
  } satisfies FinalPassUniforms,
  vertexShader: FINAL_VERTEX,
  fragmentShader: FINAL_FRAGMENT,
};

export class TunnelScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private group: THREE.Group;
  private tunnelUniforms: {
    uTime: { value: number };
    uAppear: { value: number };
    uColLow: { value: THREE.Vector3 };
    uColHigh: { value: THREE.Vector3 };
    uOpacity: { value: number };
    uSize: { value: number };
    uBrightness: { value: number };
    uSwirl: { value: number };
    uScale: { value: number };
    uCursor: { value: THREE.Vector3 };
    uRepelRadius: { value: number };
    uRepelStrength: { value: number };
    uActivity: { value: number };
  };
  private torusComposer: EffectComposer;
  private bloomComposer: EffectComposer;
  private finalComposer: EffectComposer;
  private finalPassUniforms: FinalPassUniforms;
  private rollPhase = 0;
  private t0 = performance.now() / 1000;
  private appearStart = performance.now();
  // Replaces the spec's window-scroll-derived scrollTarget/scrollSmooth/
  // scrollCurrent chain: body scroll is locked for the intro's duration, so
  // "scroll" progress is instead a synthetic 0..1 ramp over the same clock
  // as the particle logo's phases (see PHASE.HOLD_END in particleEngine.ts;
  // duplicated as a constant here rather than imported, to keep this module
  // self-contained — update INTRO_MS if that timeline changes).
  private scrollSmooth = 0;
  private progressSmooth = 0;
  private mouseTarget = new THREE.Vector2(0, 0);
  private mouse = new THREE.Vector2(0, 0);
  private pointerActive = false;
  private pointerLastMove = 0;
  private pointerActivity = 0;
  private pointerWorld = new THREE.Vector3();
  private raf = 0;
  private destroyed = false;
  private pausedAt = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.VSMShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = null; // alpha:true canvas — lets the DOM stack show through
    this.scene.fog = new THREE.Fog(0x000000, 0, 15);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 400);
    this.camera.position.set(0, 0, 20);
    this.camera.layers.enable(LAYERS.TORUS_SCENE);
    this.camera.layers.enable(LAYERS.BLOOM_SCENE);
    this.camera.layers.enable(LAYERS.ENTIRE_SCENE);
    this.scene.add(this.camera);

    // ---- tunnel points ----
    this.group = new THREE.Group();
    this.scene.add(this.group);

    const tunnelGeo = new THREE.SphereGeometry(4.2, 200, 600);
    this.tunnelUniforms = {
      uTime: { value: 0 },
      uAppear: { value: 0 },
      uColLow: { value: hexToVec3(THEME_BG) },
      uColHigh: { value: hexToVec3(THEME_PRIMARY) },
      uOpacity: { value: 1.44 },
      uSize: { value: 5 },
      uBrightness: { value: 0.4 },
      uSwirl: { value: 0.39 },
      uScale: { value: 0.17 },
      uCursor: { value: new THREE.Vector3() },
      uRepelRadius: { value: 2.4 },
      uRepelStrength: { value: 0.8 },
      uActivity: { value: 0 },
    };
    const tunnelMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: this.tunnelUniforms,
      vertexShader: TUNNEL_VERTEX,
      fragmentShader: TUNNEL_FRAGMENT,
    });
    const tunnelPoints = new THREE.Points(tunnelGeo, tunnelMat);
    tunnelPoints.frustumCulled = false;
    tunnelPoints.layers.enable(LAYERS.ENTIRE_SCENE);
    this.group.add(tunnelPoints);

    // ---- atmosphere motes ----
    const N = 300;
    const positions = new Float32Array(N * 3);
    const sizes = new Float32Array(N);
    const seeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      positions[i * 3] = 2 * Math.random() - 1;
      positions[i * 3 + 1] = 2 * Math.random() - 1;
      positions[i * 3 + 2] = 2 * Math.random() - 1;
      sizes[i] = 24 * (0.4 + Math.random());
      seeds[i] = Math.random();
    }
    const atmoGeo = new THREE.BufferGeometry();
    atmoGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    atmoGeo.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));
    atmoGeo.setAttribute("seed", new THREE.Float32BufferAttribute(seeds, 1));

    const atmoUniforms = {
      uTime: { value: 0 },
      uColor: { value: hexToVec3(THEME_PRIMARY) },
      uRes: { value: new THREE.Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio) },
    };
    const atmoMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: atmoUniforms,
      vertexShader: ATMO_VERTEX,
      fragmentShader: ATMO_FRAGMENT,
    });
    const atmoPoints = new THREE.Points(atmoGeo, atmoMat);
    atmoPoints.frustumCulled = false;
    atmoPoints.layers.enable(LAYERS.ENTIRE_SCENE);
    const finalPassUniformsRef = () => this.finalPassUniforms;
    atmoPoints.onBeforeRender = () => {
      const t = performance.now() / 1000;
      atmoUniforms.uTime.value = t * 1.0 * 8.0; // atmoSpeed = 1.0
      atmoPoints.position.copy(this.camera.position);
      finalPassUniformsRef().iTime.value = t;
    };
    this.scene.add(atmoPoints);

    // ---- postprocessing ----
    const renderScene = new RenderPass(this.scene, this.camera);

    this.torusComposer = new EffectComposer(this.renderer);
    this.torusComposer.renderToScreen = false;
    this.torusComposer.addPass(renderScene);
    this.torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
    this.torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.22, 0.2, 0));
    this.torusComposer.addPass(new ShaderPass(CopyShader));

    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.renderToScreen = false;
    this.bloomComposer.addPass(renderScene);
    this.bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.7, 0.6, 0));
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
  }

  setPointer(ndcX: number, ndcY: number, active: boolean) {
    this.mouseTarget.set(ndcX, ndcY);
    this.pointerActive = active;
    if (active) this.pointerLastMove = performance.now();
  }

  start() {
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    document.removeEventListener("visibilitychange", this.handleVisibility);
    // @types/three@0.143.0's EffectComposer typings omit `dispose()`, even
    // though the shipped r0.143.0 JS implements it (frees each pass's render
    // targets) — cast around the typings gap rather than leak WebGL targets.
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
      this.t0 += (performance.now() - this.pausedAt) / 1000; // don't count paused time as elapsed
      this.pausedAt = 0;
      this.raf = requestAnimationFrame(this.loop);
    }
  }

  private _ndc = new THREE.Vector3();
  private _dir = new THREE.Vector3();
  private _tgt = new THREE.Vector3();

  private updatePointerWorld() {
    this._tgt.set(0, 0, 0);
    if (this.pointerActive) {
      this._ndc.set(this.mouse.x, this.mouse.y, 0.5).unproject(this.camera);
      this._dir.copy(this._ndc).sub(this.camera.position).normalize();
      const dn = this._dir.z;
      if (Math.abs(dn) > 1e-4) {
        const tt = -this.camera.position.z / dn;
        if (tt > 0 && Number.isFinite(tt)) this._tgt.copy(this.camera.position).addScaledVector(this._dir, tt);
      }
    }
    this.pointerWorld.lerp(this._tgt, 0.12);
    const idle = (performance.now() - this.pointerLastMove) / 1000;
    this.pointerActivity += ((this.pointerActive && idle < 3 ? 1 : 0) - this.pointerActivity) * 0.06;
  }

  private renderScene() {
    const t = performance.now() / 1000;
    const dt = Math.min(0.05, t - this.t0);
    this.t0 = t;
    this.tunnelUniforms.uTime.value = t;

    const scroll = this.progressSmooth;
    this.camera.position.set(this.mouse.x * 0.12, this.mouse.y * 0.12, 20 - scroll * 34); // parallax 0.12, scrollFly 34
    this.camera.lookAt(this.mouse.x * 0.6, this.mouse.y * 0.6, this.camera.position.z - 12); // steer 0.6
    this.updatePointerWorld();

    this.tunnelUniforms.uSwirl.value = 0.39 * (1 + scroll * 1.5); // swirl 0.39, scrollSwirl 1.5
    this.rollPhase += dt * (0.065 + scroll * 0.05); // spin 0.065, scrollRoll 0.05
    this.group.rotation.z = this.rollPhase;

    this.tunnelUniforms.uCursor.value.copy(this.pointerWorld);
    this.tunnelUniforms.uActivity.value = this.pointerActivity;
    const elapsed = (performance.now() - this.appearStart) / 1000;
    this.tunnelUniforms.uAppear.value = Math.max(0, Math.min(1, (elapsed - 0.2) / 1.4));
  }

  private loop() {
    if (this.destroyed) return;
    const elapsed = performance.now() - this.appearStart;
    const scrollTarget = Math.min(1, elapsed / INTRO_MS) * SCROLL_DEPTH_CAP;
    this.scrollSmooth = Lerp(this.scrollSmooth, scrollTarget, 0.1);
    this.progressSmooth = Lerp(this.progressSmooth, this.scrollSmooth, 0.06);
    this.mouse.x = Lerp(this.mouse.x, this.mouseTarget.x, 0.06);
    this.mouse.y = Lerp(this.mouse.y, this.mouseTarget.y, 0.06);

    this.renderScene();

    this.camera.layers.set(LAYERS.TORUS_SCENE);
    this.torusComposer.render();
    this.camera.layers.set(LAYERS.BLOOM_SCENE);
    this.bloomComposer.render();
    this.camera.layers.set(LAYERS.ENTIRE_SCENE);
    this.finalComposer.render();

    this.raf = requestAnimationFrame(this.loop);
  }
}
