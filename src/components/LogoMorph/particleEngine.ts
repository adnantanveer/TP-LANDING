import { ICON_ASPECT, ICON_POINTS, WORDMARK_ASPECT, WORDMARK_POINTS, MINT, GRAPHITE } from "./logoData";

export type Tier = "high" | "medium" | "low";

export interface TierConfig {
  particleCount: number;
  dustCount: number;
  depth: number; // max |z| a particle can wander to, in world units
  turbulence: number; // 0..1, scales organic jitter
  particleSize: number; // base radius in CSS px at z=0
}

const TIER_CONFIG: Record<Tier, TierConfig> = {
  high: { particleCount: 1500, dustCount: 46, depth: 220, turbulence: 1, particleSize: 2.1 },
  medium: { particleCount: 850, dustCount: 26, depth: 160, turbulence: 0.75, particleSize: 2.3 },
  low: { particleCount: 380, dustCount: 12, depth: 90, turbulence: 0.5, particleSize: 2.6 },
};

export function detectTier(): Tier {
  if (typeof window === "undefined") return "medium";
  const w = window.innerWidth;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  if (w < 640 || (coarse && w < 900)) return "low";
  if (w < 1100 || cores <= 4) return "medium";
  return "high";
}

export function getTierConfig(tier: Tier): TierConfig {
  return TIER_CONFIG[tier];
}

/* ---- premium easing: slow start, fast middle, soft decel + slight overshoot ---- */
export function easeSettle(t: number): number {
  // custom back-out, gentler than a stock elastic/bounce preset
  const c1 = 1.28;
  const c3 = c1 + 1;
  const x = t - 1;
  return 1 + c3 * x * x * x + c1 * x * x;
}
export function easeApproach(t: number): number {
  // slow-in, fast-mid, soft-out (quintic-ish, no overshoot) — for long travel
  return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
}
export function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/* ---- particle model ---- */
export type ColorGroup = "mint" | "graphite";

export interface Particle {
  // normalized (0..1) shape-local coordinates for each formation target
  icon: { x: number; y: number };
  word: { x: number; y: number };
  color: ColorGroup;
  // per-particle organic variation
  seed: number;
  phaseLag: number; // 0..0.18 — staggers arrival so formation isn't lockstep
  curveSign: number; // -1 | 1 — which way this particle bows during morph
  curveMag: number; // 0.4..1 — how much it bows
  zLane: number; // -1..1 — resting depth lane (foreground/mid/background)
  sizeJitter: number;
}

function seededJitter(seed: number, salt: number): number {
  const v = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function splitByColor(flat: number[]): { mint: { x: number; y: number }[]; graphite: { x: number; y: number }[] } {
  const mint: { x: number; y: number }[] = [];
  const graphite: { x: number; y: number }[] = [];
  for (let i = 0; i < flat.length; i += 3) {
    const p = { x: flat[i], y: flat[i + 1] };
    (flat[i + 2] === 0 ? mint : graphite).push(p);
  }
  return { mint, graphite };
}

// Fisher-Yates so cycled/repeated sampling doesn't produce visible runs.
function shuffled<T>(arr: T[], seed: number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(seededJitter(seed + i, i * 0.001) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function buildParticles(tier: Tier): Particle[] {
  const { particleCount } = getTierConfig(tier);
  const icon = splitByColor(ICON_POINTS);
  const word = splitByColor(WORDMARK_POINTS);

  const mintRatio = icon.mint.length / (icon.mint.length + icon.graphite.length);
  const nMint = Math.round(particleCount * mintRatio);
  const nGraphite = particleCount - nMint;

  const iconMint = shuffled(icon.mint, 1);
  const iconGraphite = shuffled(icon.graphite, 2);
  const wordMint = shuffled(word.mint, 3);
  const wordGraphite = shuffled(word.graphite, 4);

  const particles: Particle[] = [];

  const push = (count: number, iconSrc: { x: number; y: number }[], wordSrc: { x: number; y: number }[], color: ColorGroup, salt: number) => {
    for (let i = 0; i < count; i++) {
      const seed = i * 0.6180339887 + salt;
      const iconP = iconSrc[i % iconSrc.length];
      const wordP = wordSrc[i % wordSrc.length];
      // tiny per-particle jitter so repeated/cycled source points (when
      // particleCount > sample count) don't stack in perfectly identical spots
      const jx = (seededJitter(seed, 11) - 0.5) * 0.012;
      const jy = (seededJitter(seed, 22) - 0.5) * 0.012;
      particles.push({
        icon: { x: iconP.x + jx, y: iconP.y + jy },
        word: { x: wordP.x + jx * 0.5, y: wordP.y + jy * 0.5 },
        color,
        seed,
        phaseLag: seededJitter(seed, 33) * 0.18,
        curveSign: seededJitter(seed, 44) > 0.5 ? 1 : -1,
        curveMag: 0.4 + seededJitter(seed, 55) * 0.6,
        zLane: seededJitter(seed, 66) * 2 - 1,
        sizeJitter: 0.7 + seededJitter(seed, 77) * 0.6,
      });
    }
  };

  push(nMint, iconMint, wordMint, "mint", 100);
  push(nGraphite, iconGraphite, wordGraphite, "graphite", 200);

  return particles;
}

export interface DustMote {
  x: number;
  y: number;
  z: number;
  seed: number;
  speed: number;
  opacity: number;
}

export function buildDust(tier: Tier): DustMote[] {
  const { dustCount, depth } = getTierConfig(tier);
  const dust: DustMote[] = [];
  for (let i = 0; i < dustCount; i++) {
    const seed = i * 3.14159 + 500;
    dust.push({
      x: (seededJitter(seed, 1) - 0.5) * 1.6,
      y: (seededJitter(seed, 2) - 0.5) * 1.6,
      z: (seededJitter(seed, 3) - 0.5) * depth * 1.4,
      seed,
      speed: 0.15 + seededJitter(seed, 4) * 0.25,
      opacity: 0.08 + seededJitter(seed, 5) * 0.14,
    });
  }
  return dust;
}

export { ICON_ASPECT, WORDMARK_ASPECT, MINT, GRAPHITE };

/* ---- ambient orbs: soft glowing spheres that drift in once the wordmark
   has settled — a bit of "flashy" life around the finished mark without
   competing with it (low opacity, slow, gaussian-soft, not the crisp
   glyph particles). Roughly half sit behind the wordmark, half in front. */
export type OrbColor = "mint" | "graphite" | "white";

export interface Orb {
  seed: number;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
  depthLane: 1 | -1; // 1 = front (drawn over particles), -1 = behind
  color: OrbColor;
  driftFreq: number;
}

export function buildOrbs(tier: Tier): Orb[] {
  const count = tier === "high" ? 20 : tier === "medium" ? 13 : 7;
  const orbs: Orb[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 7.777 + 900;
    const colorRoll = seededJitter(seed, 6);
    orbs.push({
      seed,
      radius: 16 + seededJitter(seed, 1) * 44,
      orbitRadius: 90 + seededJitter(seed, 2) * 260,
      orbitSpeed: 0.00006 + seededJitter(seed, 3) * 0.00009,
      orbitPhase: seededJitter(seed, 4) * Math.PI * 2,
      depthLane: seededJitter(seed, 5) > 0.5 ? 1 : -1,
      color: colorRoll > 0.72 ? "graphite" : colorRoll > 0.36 ? "white" : "mint",
      driftFreq: 0.00018 + seededJitter(seed, 7) * 0.00025,
    });
  }
  return orbs;
}

/* ---- ambient icon glyphs: crisp small geometric marks (ring, diamond,
   cross, triangle) drifting alongside the soft orbs — thin-stroke, low
   opacity, distinct silhouettes for visual variety without turning into
   clutter or literal "icons". */
export type IconShape = "ring" | "diamond" | "cross" | "triangle" | "hex";

export interface IconGlyph {
  seed: number;
  shape: IconShape;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
  spinSpeed: number;
  depthLane: 1 | -1;
  color: OrbColor;
}

const ICON_SHAPES: IconShape[] = ["ring", "diamond", "cross", "triangle", "hex"];

export function buildIcons(tier: Tier): IconGlyph[] {
  const count = tier === "high" ? 10 : tier === "medium" ? 6 : 3;
  const icons: IconGlyph[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 5.317 + 1400;
    const colorRoll = seededJitter(seed, 6);
    icons.push({
      seed,
      shape: ICON_SHAPES[i % ICON_SHAPES.length],
      size: 7 + seededJitter(seed, 1) * 10,
      orbitRadius: 140 + seededJitter(seed, 2) * 320,
      orbitSpeed: 0.00005 + seededJitter(seed, 3) * 0.00007,
      orbitPhase: seededJitter(seed, 4) * Math.PI * 2,
      spinSpeed: (seededJitter(seed, 8) - 0.5) * 0.0009,
      depthLane: seededJitter(seed, 5) > 0.55 ? 1 : -1,
      color: colorRoll > 0.66 ? "graphite" : colorRoll > 0.33 ? "white" : "mint",
    });
  }
  return icons;
}

/* ============================================================================
   Phase timeline (ms, from engine start). Each phase's particle behavior is
   computed live from elapsed time — no React state, no per-frame allocation
   beyond what's unavoidable for Canvas2D.
   ========================================================================== */
export const PHASE = {
  DARK_END: 500,
  AWAKEN_END: 1500,
  ICON_END: 2500,
  MORPH_END: 3500,
  WORDMARK_END: 4200,
  HOLD_END: 4700,
};

const BG = "#06070a";

function staggered(elapsedInPhase: number, duration: number, lag: number): number {
  const denom = duration * (1 - lag);
  if (denom <= 0) return 1;
  return clamp01((elapsedInPhase - lag * duration) / denom);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function iconWorldOffset(nx: number, ny: number, w: number, h: number) {
  const iconH = Math.min(w, h) * 0.32;
  const iconW = iconH * ICON_ASPECT;
  return { ox: (nx - 0.5) * iconW, oy: (ny - 0.5) * iconH - h * 0.015 };
}

function wordWorldOffset(nx: number, ny: number, w: number) {
  const wordW = Math.min(w * 0.7, 640);
  const wordH = wordW / WORDMARK_ASPECT;
  return { ox: (nx - 0.5) * wordW, oy: (ny - 0.5) * wordH };
}

export class LogoMorphEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[];
  private dust: DustMote[];
  private orbs: Orb[];
  private icons: IconGlyph[];
  private cfg: TierConfig;
  private width = 0;
  private height = 0;
  private raf = 0;
  private startTime = 0;
  private pausedAt = 0;
  private pauseOffset = 0;
  private destroyed = false;
  private completed = false;
  private firstFrame = true;
  private onComplete: () => void;

  constructor(canvas: HTMLCanvasElement, tier: Tier, onComplete: () => void) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.canvas = canvas;
    this.ctx = ctx;
    this.particles = buildParticles(tier);
    this.dust = buildDust(tier);
    this.orbs = buildOrbs(tier);
    this.icons = buildIcons(tier);
    this.cfg = getTierConfig(tier);
    this.onComplete = onComplete;
    this.handleVisibility = this.handleVisibility.bind(this);
    this.loop = this.loop.bind(this);
    document.addEventListener("visibilitychange", this.handleVisibility);
  }

  resize(cssWidth: number, cssHeight: number, dpr: number) {
    this.width = cssWidth;
    this.height = cssHeight;
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.firstFrame = true; // repaint a full opaque background after a resize
  }

  start() {
    this.startTime = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    document.removeEventListener("visibilitychange", this.handleVisibility);
  }

  private handleVisibility() {
    if (document.hidden) {
      this.pausedAt = performance.now();
      cancelAnimationFrame(this.raf);
    } else if (this.pausedAt) {
      this.pauseOffset += performance.now() - this.pausedAt;
      this.pausedAt = 0;
      this.raf = requestAnimationFrame(this.loop);
    }
  }

  private loop(now: number) {
    if (this.destroyed) return;
    const t = now - this.startTime - this.pauseOffset;
    this.draw(t);
    if (t < PHASE.HOLD_END + 260) {
      this.raf = requestAnimationFrame(this.loop);
    } else if (!this.completed) {
      this.completed = true;
      this.onComplete();
    }
  }

  private draw(t: number) {
    const { ctx, width: w, height: h } = this;
    if (w === 0 || h === 0) return;

    // Near-opaque clear each frame for a faint premium trail; fully opaque on
    // the very first frame (and right after a resize) so nothing ghosts in.
    ctx.fillStyle = this.firstFrame ? BG : "rgba(6,7,10,0.32)";
    ctx.fillRect(0, 0, w, h);
    this.firstFrame = false;

    const cx = w / 2;
    const cy = h / 2;
    // barely-there camera drift + a hint of parallax rotation during the morph
    const camX = Math.sin(t * 0.00018) * 8;
    const camY = Math.cos(t * 0.00013) * 5;
    const morphLocal = t > PHASE.ICON_END && t < PHASE.MORPH_END ? (t - PHASE.ICON_END) / (PHASE.MORPH_END - PHASE.ICON_END) : 0;
    const tiltAngle = Math.sin(Math.PI * clamp01(morphLocal)) * 0.045;

    this.drawGlow(t, cx + camX, cy + camY);
    this.drawDust(t, cx + camX, cy + camY);
    this.drawOrbs(t, cx + camX, cy + camY, false);
    this.drawIcons(t, cx + camX, cy + camY, false);
    this.drawParticles(t, cx + camX, cy + camY, tiltAngle);
    this.drawOrbs(t, cx + camX, cy + camY, true);
    this.drawIcons(t, cx + camX, cy + camY, true);
  }

  private drawGlow(t: number, cx: number, cy: number) {
    const { ctx, width: w, height: h } = this;
    const breathe = 1 + Math.sin(t * 0.0011) * 0.04;
    const r = Math.min(w, h) * 0.38 * breathe;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, "rgba(115,228,162,0.05)");
    grad.addColorStop(1, "rgba(115,228,162,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  private drawDust(t: number, cx: number, cy: number) {
    const { ctx, width: w, height: h } = this;
    for (const d of this.dust) {
      const drift = t * d.speed * 0.02;
      const dx = d.x * w + Math.sin(drift + d.seed) * 14;
      const dy = d.y * h - (drift % (h * 1.4));
      const y = ((dy + h * 0.7) % (h * 1.4)) - h * 0.35;
      const twinkle = 0.6 + 0.4 * Math.sin(t * 0.002 + d.seed * 7);
      ctx.beginPath();
      ctx.arc(cx + dx, cy + y, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(230,235,240,${(d.opacity * twinkle).toFixed(3)})`;
      ctx.fill();
    }
  }

  private drawOrbs(t: number, cx: number, cy: number, front: boolean) {
    const appearStart = PHASE.MORPH_END - 300;
    if (t < appearStart) return;
    const ctx = this.ctx;
    const appear = clamp01((t - appearStart) / 600);
    const FOV = 620;
    for (const o of this.orbs) {
      if (front !== (o.depthLane > 0)) continue;
      const angle = o.orbitPhase + t * o.orbitSpeed;
      const wobble = Math.sin(t * o.driftFreq + o.seed) * 18;
      const ox = Math.cos(angle) * o.orbitRadius;
      const oy = Math.sin(angle * 0.72) * o.orbitRadius * 0.5 + wobble;
      const oz = o.depthLane * 170;
      const perspective = FOV / (FOV + oz);
      const sx = cx + ox * perspective;
      const sy = cy + oy * perspective;
      const r = o.radius * perspective * (front ? 1 : 0.72);
      const baseOpacity = (front ? 0.13 : 0.075) * appear;
      const hex = o.color === "mint" ? MINT : o.color === "graphite" ? GRAPHITE : "#e8ecef";
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      grad.addColorStop(0, hexToRgba(hex, baseOpacity));
      grad.addColorStop(0.6, hexToRgba(hex, baseOpacity * 0.4));
      grad.addColorStop(1, hexToRgba(hex, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawIcons(t: number, cx: number, cy: number, front: boolean) {
    const appearStart = PHASE.MORPH_END - 100;
    if (t < appearStart) return;
    const ctx = this.ctx;
    const appear = clamp01((t - appearStart) / 700);
    const FOV = 620;
    for (const icon of this.icons) {
      if (front !== (icon.depthLane > 0)) continue;
      const angle = icon.orbitPhase + t * icon.orbitSpeed;
      const ox = Math.cos(angle * 1.15) * icon.orbitRadius;
      const oy = Math.sin(angle) * icon.orbitRadius * 0.42 + Math.sin(t * 0.00021 + icon.seed) * 14;
      const oz = icon.depthLane * 190;
      const perspective = FOV / (FOV + oz);
      const sx = cx + ox * perspective;
      const sy = cy + oy * perspective;
      const size = icon.size * perspective;
      const spin = icon.seed + t * icon.spinSpeed;
      const opacity = (front ? 0.4 : 0.22) * appear;
      const hex = icon.color === "mint" ? MINT : icon.color === "graphite" ? GRAPHITE : "#e8ecef";

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(spin);
      ctx.strokeStyle = hexToRgba(hex, opacity);
      ctx.lineWidth = Math.max(0.75, size * 0.11);
      ctx.beginPath();
      drawIconShape(ctx, icon.shape, size);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawParticles(t: number, cx: number, cy: number, tiltAngle: number) {
    const { ctx, width: w, height: h, cfg } = this;
    const FOV = 620;

    for (const p of this.particles) {
      let ox: number, oy: number, oz: number, opacity: number;

      if (t < PHASE.DARK_END) {
        continue; // not yet awakened
      } else if (t < PHASE.AWAKEN_END) {
        const local = staggered(t - PHASE.DARK_END, PHASE.AWAKEN_END - PHASE.DARK_END, p.phaseLag);
        const eased = easeApproach(local);
        const startOx = (seededStart(p.seed, 1) - 0.5) * w * 1.1;
        const startOy = (seededStart(p.seed, 2) - 0.5) * h * 1.1;
        const startOz = (seededStart(p.seed, 3) - 0.5) * cfg.depth * 2.4;
        const target = iconWorldOffset(p.icon.x, p.icon.y, w, h);
        ox = lerp(startOx, target.ox, eased);
        oy = lerp(startOy, target.oy, eased);
        oz = lerp(startOz, p.zLane * cfg.depth * 0.3, eased);
        opacity = clamp01(local / 0.25);
      } else if (t < PHASE.ICON_END) {
        const local = staggered(t - PHASE.AWAKEN_END, PHASE.ICON_END - PHASE.AWAKEN_END, p.phaseLag * 0.4);
        const eased = easeSettle(Math.min(local, 1));
        const target = iconWorldOffset(p.icon.x, p.icon.y, w, h);
        const breathe = local > 0.6 ? Math.sin(t * 0.004 + p.seed) * 1.4 : 0;
        const jitterScale = (local > 0.85 ? 2.2 : 0.4) * cfg.turbulence;
        const jitter = organicJitter(p.seed, t);
        ox = target.ox + jitter.x * jitterScale * eased;
        oy = target.oy + breathe + jitter.y * jitterScale * eased;
        oz = p.zLane * cfg.depth * 0.3;
        opacity = 1;
      } else if (t < PHASE.MORPH_END) {
        const local = staggered(t - PHASE.ICON_END, PHASE.MORPH_END - PHASE.ICON_END, p.phaseLag);
        const eased = easeApproach(local);
        const from = iconWorldOffset(p.icon.x, p.icon.y, w, h);
        const to = wordWorldOffset(p.word.x, p.word.y, w);
        // quadratic bezier bow, perpendicular to the direct path, plus a
        // toward-camera z bulge — the "flow" instead of a straight dissolve
        const dx = to.ox - from.ox;
        const dy = to.oy - from.oy;
        const dist = Math.hypot(dx, dy) || 1;
        const nx = -dy / dist;
        const ny = dx / dist;
        const bow = p.curveSign * p.curveMag * Math.min(dist * 0.22, 90) * Math.sin(Math.PI * eased);
        const jitter = organicJitter(p.seed, t);
        ox = lerp(from.ox, to.ox, eased) + nx * bow + jitter.x * cfg.turbulence * (1 - eased) * 6;
        oy = lerp(from.oy, to.oy, eased) + ny * bow + jitter.y * cfg.turbulence * (1 - eased) * 6;
        oz = lerp(p.zLane * cfg.depth * 0.3, -cfg.depth * 0.5, Math.sin(Math.PI * eased)) + p.zLane * cfg.depth * 0.15;
        opacity = 1;
      } else if (t < PHASE.WORDMARK_END) {
        const local = staggered(t - PHASE.MORPH_END, PHASE.WORDMARK_END - PHASE.MORPH_END, p.phaseLag * 0.3);
        const eased = easeSettle(Math.min(local, 1));
        const to = wordWorldOffset(p.word.x, p.word.y, w);
        ox = to.ox;
        oy = to.oy;
        oz = lerp(p.zLane * cfg.depth * 0.15, p.zLane * cfg.depth * 0.12, eased);
        opacity = 1;
      } else {
        const to = wordWorldOffset(p.word.x, p.word.y, w);
        const breathe = Math.sin(t * 0.0016 + p.seed) * 0.8;
        ox = to.ox;
        oy = to.oy + breathe * 0.3;
        oz = p.zLane * cfg.depth * 0.12;
        opacity = 1;
      }

      // subtle Y-axis-style tilt (rotate the ox/oz plane) during the morph —
      // real perspective-affecting rotation, not a flat 2D skew
      if (tiltAngle !== 0) {
        const cos = Math.cos(tiltAngle);
        const sin = Math.sin(tiltAngle);
        const rox = ox * cos - oz * sin;
        const roz = ox * sin + oz * cos;
        ox = rox;
        oz = roz;
      }

      const perspective = FOV / (FOV + oz);
      const sx = cx + ox * perspective;
      const sy = cy + oy * perspective;
      const radius = Math.max(0.4, cfg.particleSize * p.sizeJitter * perspective);

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(p.color === "mint" ? MINT : GRAPHITE, opacity * clamp01(perspective * 1.15));
      ctx.fill();
    }
  }
}

function seededStart(seed: number, salt: number): number {
  const v = Math.sin(seed * 91.345 + salt * 17.77) * 24571.847;
  return v - Math.floor(v);
}

function organicJitter(seed: number, t: number): { x: number; y: number } {
  const f1 = 0.0017 + (seed % 1) * 0.0006;
  const f2 = 0.0023 + (seed % 1) * 0.0004;
  return {
    x: Math.sin(t * f1 + seed * 3.1) * 3.2,
    y: Math.cos(t * f2 + seed * 5.7) * 3.2,
  };
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${clamp01(alpha).toFixed(3)})`;
}

// Traces one glyph's outline into the canvas's current path (caller strokes
// it). Drawn centered on the current translated/rotated origin.
function drawIconShape(ctx: CanvasRenderingContext2D, shape: IconShape, size: number) {
  const s = size;
  switch (shape) {
    case "ring":
      ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
      break;
    case "diamond":
      ctx.moveTo(0, -s * 0.55);
      ctx.lineTo(s * 0.55, 0);
      ctx.lineTo(0, s * 0.55);
      ctx.lineTo(-s * 0.55, 0);
      ctx.closePath();
      break;
    case "cross":
      ctx.moveTo(-s * 0.5, 0);
      ctx.lineTo(s * 0.5, 0);
      ctx.moveTo(0, -s * 0.5);
      ctx.lineTo(0, s * 0.5);
      break;
    case "triangle":
      ctx.moveTo(0, -s * 0.55);
      ctx.lineTo(s * 0.5, s * 0.4);
      ctx.lineTo(-s * 0.5, s * 0.4);
      ctx.closePath();
      break;
    case "hex":
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const x = Math.cos(a) * s * 0.5;
        const y = Math.sin(a) * s * 0.5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
  }
}
