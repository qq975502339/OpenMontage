// Plate-based backgrounds: a rendered 3D / photographic plate + drifting light + dust + grain.
// Why: flat vector props read as clip-art. Her own episodes get texture from real imagery
// (darkened, blurred stock or her A-roll behind the cards) and from big tilted panels.
// Plates live in public/plates/. Theme presets list them (TH.plates, TH.titlePlate, TH.paperPlate);
// any scene can override with bg.plate='plates/xxx.jpg' (or bg.plate=false for no plate).
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {clamp, img, rnd} from './lib';
import {TH} from './theme';
const LX = () => TH.lux ?? {};

const lim = (v: number, m: number) => Math.max(-m, Math.min(m, v));

// one plate, slightly oversized so it can drift and parallax without showing edges
// still=true (terminal: the plate is the monitor itself) keeps the plate fixed so a bezel overlay can sit on it
export const Plate: React.FC<{src: string; cam: any; lt: number; flip?: boolean; bright?: number; push?: number; dof?: boolean; ox?: number; oy?: number; s0?: number; still?: boolean}> = ({
  src, cam, lt, flip, bright = 1, push = 0.004, dof = true, ox = 0, oy = 0, s0 = 1.1, still = false,
}) => {
  const px = still ? 0 : lim(-(cam.x - 960) * 0.035, 80) + ox, py = still ? 0 : lim(-(cam.y - 540) * 0.035, 45) + oy;
  const zs = still ? 1 : 1 + (cam.s - 1) * 0.3;
  const s = still ? 1 : s0 * zs * (1 + Math.min(0.05, lt * push));
  const blur = !still && dof && cam.s > 1.04 ? Math.min(5, (cam.s - 1.04) * 9) : 0;
  return (
    <Img src={img(src)} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, objectFit: 'cover',
      transform: `translate(${px.toFixed(1)}px,${py.toFixed(1)}px) scale(${s.toFixed(4)}) scaleX(${flip ? -1 : 1})`,
      filter: `brightness(${bright})${blur ? ` blur(${blur.toFixed(2)}px)` : ''}`}} />
  );
};

// two soft light pools drifting slowly (screen blend) so a still plate feels lit and alive
export const LightDrift: React.FC<{t: number; cam: any; a?: string; b?: string; o?: number; seed?: number}> = ({t, cam, a = '60,190,180', b = '230,110,90', o = 0.32, seed = 1}) => {
  const r = rnd(seed), p1 = r() * 6, p2 = r() * 6;
  const px = lim(-(cam.x - 960) * 0.08, 140);
  const x1 = 260 + Math.sin(t * 0.11 + p1) * 160 + px, y1 = 820 + Math.cos(t * 0.09 + p1) * 90;
  const x2 = 1640 + Math.sin(t * 0.08 + p2) * 170 + px, y2 = 240 + Math.cos(t * 0.12 + p2) * 80;
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: o, pointerEvents: 'none',
      background: `radial-gradient(ellipse 760px 520px at ${x1.toFixed(0)}px ${y1.toFixed(0)}px, rgba(${a},.55), rgba(${a},0) 70%),` +
        `radial-gradient(ellipse 820px 560px at ${x2.toFixed(0)}px ${y2.toFixed(0)}px, rgba(${b},.45), rgba(${b},0) 70%)`}} />
  );
};

// floating dust motes in three depth layers; nearer layers are larger, softer and move more with the camera
export const Dust: React.FC<{t: number; cam: any; n?: number; seed?: number; o?: number; warm?: boolean}> = ({t, cam, n = 38, seed = 7, o = 1, warm}) => {
  const r = rnd(seed);
  const motes = Array.from({length: n}).map((_, i) => {
    const z = i % 3, x0 = r() * 2200 - 140, y0 = r() * 1180 - 50, sp = 6 + r() * 14, ph = r() * 6.28, sz = [2.2, 3.6, 7][z] * (0.7 + r() * 0.6);
    return {z, x0, y0, sp, ph, sz, a: [0.5, 0.38, 0.22][z] * (0.6 + r() * 0.4)};
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: o, mixBlendMode: 'screen'}}>
      {motes.map((m, i) => {
        const k = [0.04, 0.1, 0.22][m.z];
        const x = m.x0 + Math.sin(t * 0.25 + m.ph) * 22 - (cam.x - 960) * k;
        let y = m.y0 - t * m.sp - (cam.y - 540) * k;
        y = ((y % 1180) + 1180) % 1180 - 50;
        const tw = 0.65 + 0.35 * Math.sin(t * 1.3 + m.ph * 3);
        const c = warm ? '255,226,190' : '220,236,255';
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: m.sz, height: m.sz, borderRadius: '50%',
          background: `rgba(${c},${(m.a * tw).toFixed(3)})`, filter: m.z === 2 ? 'blur(2.4px)' : m.z === 1 ? 'blur(.8px)' : undefined}} />;
      })}
    </AbsoluteFill>
  );
};

// dark scene on a plate. v picks the plate; every second cycle is mirrored for variety.
export const PlateDark: React.FC<{bg: any; t: number; lt: number; cam: any; plates: string[]; Grain: any; Vignette: any}> = ({bg, t, lt, cam, plates, Grain, Vignette}) => {
  const v = bg.v || 0, n = plates.length;
  const src = typeof bg.plate === 'string' ? bg.plate : plates[v % n];
  const L = LX(), still = !!L.still;
  const flip = still ? false : bg.flip ?? (Math.floor(v / n) % 2 === 1);
  const lo = bg.light ?? L.light ?? 0.26, dust = bg.dust === false ? 0 : L.dust ?? 0.85;
  return (
    <AbsoluteFill style={{background: '#06070a', overflow: 'hidden'}}>
      <Plate src={src} cam={cam} lt={lt} flip={flip} bright={bg.bright ?? L.bright ?? 0.92} still={still} />
      {lo > 0 && <LightDrift t={t} cam={cam} o={lo} seed={v + 3} a={L.a} b={L.b} />}
      {dust > 0 && <Dust t={t} cam={cam} seed={v + 11} o={dust} warm={!!L.warm} />}
      <Grain t={t} o={L.grain ?? 0.06} />
      <Vignette k={L.vig ?? 0.42} />
    </AbsoluteFill>
  );
};

// title / chapter card on a plate: continuous slow push-in, light, dust
export const PlateTitle: React.FC<{bg: any; t: number; lt: number; src: string; Grain: any; Vignette: any}> = ({bg, t, lt, src, Grain, Vignette}) => {
  const cam = {x: 960, y: 540, s: 1}, L = LX(), still = !!L.still;
  const s0 = (bg.s0 ?? 1.03) + clamp(lt / 9) * (bg.ds ?? 0.07);
  const lo = bg.light ?? L.light ?? 0.18, dust = bg.dust === false ? 0 : L.dust ?? 1;
  return (
    <AbsoluteFill style={{background: '#050608', overflow: 'hidden'}}>
      <Plate src={src} cam={cam} lt={0} s0={s0} oy={bg.oy ?? 0} bright={bg.bright ?? 1} dof={false} still={still} />
      {lo > 0 && <LightDrift t={t} cam={cam} o={lo} seed={5} a={L.a} b={L.b} />}
      {dust > 0 && <Dust t={t} cam={cam} n={46} seed={21} o={dust} warm={bg.warm ?? !!L.warm} />}
      <Grain t={t} o={L.grain ?? 0.06} />
      <Vignette k={Math.min(0.5, (L.vig ?? 0.42) + 0.06)} />
    </AbsoluteFill>
  );
};

// light page on a plate (soft window light on paper)
export const PlatePaper: React.FC<{bg: any; t: number; lt: number; cam: any; src: string; Grain: any; Vignette: any}> = ({bg, t, lt, cam, src, Grain, Vignette}) => (
  <AbsoluteFill style={{background: '#f2f1ee', overflow: 'hidden'}}>
    <Plate src={src} cam={cam} lt={lt} flip={!!bg.flip} bright={bg.bright ?? 1.02} push={0.003} still={!!LX().still} />
    <Grain t={t} o={LX().grain ?? 0.05} />
    <Vignette k={Math.min(0.14, LX().vig ?? 0.14)} />
  </AbsoluteFill>
);
