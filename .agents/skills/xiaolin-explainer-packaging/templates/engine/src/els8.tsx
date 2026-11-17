// v8: per-episode treatment. The layouts in els6 / els7 are skeletons (axes, arrows, wedges, routes); what makes a scene
// belong to ITS topic is the material put on them: real photos behind, and cut-out props made for this episode.
// prop   = one cut-out image (cartoon character, object, sticker) that can idle, travel along a path, or stream in copies.
// stack6 = pictogram chart built from a prop image: columns of piled icons, or a grid where some icons swap to another image.
// Props must be generated in the theme's own drawing style (references/treatment.md); the engine only adds the shadow.
import React from 'react';
import {Img} from 'remotion';
import {back, clamp, eio, eout, fmt, img, lerp, prog} from './lib';
import {TH} from './theme';
import {phosphorTs} from './skins';

const W900 = (f: string) => (f.includes("'PX'") || f.includes("'MSZ'") || f.includes("'YS'") || f.includes("'BB'") || f.includes("'DIN'") ? 400 : 900);

// How each prop drawing style sits on the page (references/treatment.md section 4 lists the prompts).
// sh: 'soft' floating sticker / object shadow, 'paper' thin shadow of paper lying on the page, 'hard' offset pixel shadow,
//     'glow' light emitted by the drawing (gc = glow colour), 'none'. dark / light: false = do not use on that kind of page.
export const PROP_LOOKS: Record<string, any> = {
  sticker25d: {sh: 'soft'}, papercut: {sh: 'paper'}, chalk: {sh: 'none', light: false}, clay: {sh: 'soft'}, toy3d: {sh: 'soft'},
  vintage_ad: {sh: 'soft'}, risograph: {sh: 'paper'}, flat_editorial: {sh: 'soft'}, mono_line: {sh: 'none', dark: false},
  comic_pop: {sh: 'paper'}, product_photo: {sh: 'soft'}, watercolor: {sh: 'paper'}, engraving: {sh: 'paper'}, woodcut: {sh: 'paper'},
  ink_wash: {sh: 'paper'}, collage: {sh: 'paper'}, lineart_white: {sh: 'glow', gc: '255,255,255', light: false}, cutaway: {sh: 'soft'},
  neon: {sh: 'glow', gc: '255,120,200', light: false}, pixel16: {sh: 'hard'},
};
export const lookOf = (id?: string) => PROP_LOOKS[id ?? TH.propLook] ?? PROP_LOOKS.sticker25d;
// shadow (CSS filter) for a cut-out prop; lift 0..1 = how high it floats; look = a PROP_LOOKS id (default: the episode's)
export const propShadow = (lift = 0, look?: string): string => {
  const L = lookOf(look), dark = !TH.light;
  if (TH.name === 'terminal' && L.sh !== 'hard' && L.sh !== 'glow') return `drop-shadow(0 0 ${(8 + 6 * lift).toFixed(0)}px rgba(51,255,136,.38))`;
  if (L.sh === 'none') return '';
  if (L.sh === 'glow') return `drop-shadow(0 0 ${(6 + 4 * lift).toFixed(0)}px rgba(${L.gc},.55)) drop-shadow(0 0 ${(18 + 8 * lift).toFixed(0)}px rgba(${L.gc},.28))`;
  if (L.sh === 'hard') return `drop-shadow(${(6 + 4 * lift).toFixed(0)}px ${(6 + 4 * lift).toFixed(0)}px 0 rgba(0,0,0,${dark ? 0.55 : 0.28}))`;
  if (L.sh === 'paper') return dark ? `drop-shadow(0 ${(3 + 6 * lift).toFixed(0)}px ${(4 + 8 * lift).toFixed(0)}px rgba(0,0,0,${(0.55 + 0.1 * lift).toFixed(2)}))`
    : `drop-shadow(0 ${(2 + 5 * lift).toFixed(0)}px ${(3 + 6 * lift).toFixed(0)}px rgba(40,30,20,${(0.3 + 0.06 * lift).toFixed(2)}))`;
  if (TH.light) return `drop-shadow(0 ${(8 + 10 * lift).toFixed(0)}px ${(10 + 12 * lift).toFixed(0)}px rgba(40,30,20,${(0.26 + 0.06 * lift).toFixed(2)}))`;
  return `drop-shadow(0 ${(12 + 10 * lift).toFixed(0)}px ${(16 + 14 * lift).toFixed(0)}px rgba(0,0,0,${(0.5 + 0.1 * lift).toFixed(2)}))`;
};
// a cut-out image, optionally re-coloured: tint paints the drawing's alpha in one colour (white line art -> phosphor green)
export const PropImg: React.FC<{src: string; w: number; h: number; filter?: string; tint?: string}> = ({src, w, h, filter, tint}) => tint ? (
  <div style={{width: w, height: h, filter}}>
    <div style={{width: w, height: h, backgroundColor: tint, WebkitMaskImage: `url(${img(src)})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
      maskImage: `url(${img(src)})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center'} as any} />
  </div>
) : <Img src={img(src)} style={{width: w, height: h, objectFit: 'contain', filter}} />;

// point at fraction u of a polyline (by length): [x, y, angle, distance]
export const polyAt = (pts: number[][], u: number) => {
  const L: number[] = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = L[L.length - 1] || 1, d = clamp(u) * tot;
  let i = 1;
  while (i < pts.length - 1 && L[i] < d) i++;
  const seg = L[i] - L[i - 1] || 1, k = clamp((d - L[i - 1]) / seg), [ax, ay] = pts[i - 1], [bx, by] = pts[i];
  return [lerp(ax, bx, k), lerp(ay, by, k), Math.atan2(by - ay, bx - ax), d];
};
// parabola from (0,0) to (dx,dy) peaking `h` px above the chord
const arcPts = (to: number[], h: number, n = 28) => Array.from({length: n + 1}, (_, k) => {const u = k / n; return [to[0] * u, to[1] * u - 4 * h * u * (1 - u)];});

// ---------------------------------------------------------------- prop
// src, w (px), h? (box height, default w; the image is contained), flip, lift (shadow depth 0..1), noShadow,
//   look (PROP_LOOKS id, default the episode's prop_look: sets the shadow), tint (CSS colour: repaint the drawing in one colour)
// idle: 'sway' | 'breathe' | 'shake' | 'wobble' | 'spin' (+ amp, sp); Place's float / anim / out / dim / lit still apply
// motion (offsets relative to x, y): path [[dx, dy], ...] or to [dx, dy] + arc (px); pt (start, default e.t), pd (seconds),
//   ease 'io' | 'out' | 'lin', orient (true or a fraction: rotate along the path), autoflip (mirror when moving left),
//   hop (px) + stride (px): walking bounce; spinTo (deg over the motion); sTo (scale at the end); fadeEnd (fade the last 15 %)
//   loop: repeat the motion (gap = pause between runs); copies + dt: a stream of n copies on the same motion
export const Prop: React.FC<any> = ({e, t}) => {
  const w = e.w ?? 300, h = e.h ?? w, pd = e.pd ?? 1.0;
  const pts = e.path ? [[0, 0], ...e.path] : e.to ? arcPts(e.to, e.arc ?? 0) : null;
  const one = (k: number) => {
    const t0 = (e.pt ?? e.t) + k * (e.dt ?? 0.3);
    let tl = t - t0;
    if (e.copies && tl < 0) return null;
    if (e.loop && tl > 0) tl = tl % (pd + (e.gap ?? 0));
    const raw = clamp(tl / pd), u = e.ease === 'lin' ? raw : e.ease === 'out' ? eout(raw) : eio(raw);
    let x = 0, y = 0, a = 0, dist = 0, rot = 0, sx = e.flip ? -1 : 1, sc = 1, op = 1;
    if (pts) {
      [x, y, a, dist] = polyAt(pts, u);
      if (e.autoflip && Math.cos(a) < -0.05) {sx = -sx; a -= Math.PI;}
      while (a > Math.PI) a -= 2 * Math.PI;
      while (a < -Math.PI) a += 2 * Math.PI;
      if (e.orient) rot += (a * 180 / Math.PI) * (e.orient === true ? 1 : e.orient);
      if (e.hop && raw > 0 && raw < 1) y -= Math.abs(Math.sin((Math.PI * dist) / (e.stride ?? 90))) * e.hop;
      if (e.spinTo) rot += e.spinTo * u;
      if (e.sTo != null) sc *= lerp(1, e.sTo, u);
      if (e.fadeEnd) op *= 1 - prog(raw, 0.85, 0.15);
    }
    const amp = e.amp, sp = e.sp, tt = t + (e.ph ?? 0) + k * 0.37;
    let sy = 1;
    if (e.idle === 'sway') rot += Math.sin(tt * (sp ?? 2.2)) * (amp ?? 4);
    else if (e.idle === 'wobble') rot += Math.sin(tt * (sp ?? 9)) * (amp ?? 6);
    else if (e.idle === 'breathe') sy = 1 + Math.sin(tt * (sp ?? 2.6)) * (amp ?? 0.025);
    else if (e.idle === 'shake') x += Math.sin(tt * (sp ?? 47)) * (amp ?? 5);
    else if (e.idle === 'spin') rot += tt * (sp ?? 160);
    return (
      <div key={k} style={{position: 'absolute', left: 0, top: 0, width: w, height: h, opacity: op,
        transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${(sx * sc).toFixed(4)},${(sc * sy).toFixed(4)})`, transformOrigin: e.origin ?? '50% 70%'}}>
        <PropImg src={e.src} w={w} h={h} tint={e.tint} filter={(e.noShadow ? [e.fx] : [propShadow(e.lift ?? 0, e.look), e.fx]).filter(Boolean).join(' ') || undefined} />
      </div>
    );
  };
  const n = e.copies ?? 1;
  return <div style={{position: 'relative', width: w, height: h}}>{Array.from({length: n}, (_, k) => one(k))}</div>;
};

// ---------------------------------------------------------------- stack6: pictogram chart from a prop image
// columns mode: cols [{l, v, src?, s? (value label, default fmt(v) + u), t?, c?}], unit (value per icon), u (unit text)
//   per (icons per row inside a column, default 1), iw / ih (icon box), ov (vertical overlap 0..0.8), gap (between columns),
//   sd (seconds to fill one column), drop (px fall height), focus [[t, i]] dims the other columns, lab: false hides labels
// grid mode: grid {n, per, hi (count), alt (image for the hi icons), hiT (start), hiD (seconds to turn them all), from: 'start' | 'random',
//   dim (default true: the other icons grey out as the hi ones turn), fx (filter on the hi icons, default a red glow)}
export const Stack6: React.FC<any> = ({e, t}) => {
  const iw = e.iw ?? 110, ih = e.ih ?? iw, ov = e.ov ?? 0.12, sd = e.sd ?? 0.9, drop = e.drop ?? 160, src0 = e.src;
  const font = TH.f.card, num = TH.f.num, ink = TH.ink, dark = !TH.light;
  const ts = dark ? '0 3px 14px rgba(0,0,0,.65)' : undefined;
  const icon = (key: any, src: string, x: number, y: number, q: number, extra: any = {}) => q > 0 && (
    <div key={key} style={{position: 'absolute', left: x, top: y, width: iw, height: ih, opacity: clamp(q * 3) * (extra.op ?? 1),
      transform: `translateY(${((1 - eout(q)) * -drop).toFixed(1)}px) scale(${(lerp(0.6, 1, back(q)) * (extra.sc ?? 1)).toFixed(4)})`, transformOrigin: '50% 100%', clipPath: extra.clip}}>
      <Img src={img(src)} style={{width: iw, height: ih, objectFit: 'contain', filter: [propShadow(0), extra.fx].filter(Boolean).join(' ')}} />
    </div>
  );
  if (e.grid) {
    const G = e.grid, per = G.per ?? 10, n = G.n ?? 100, gx = iw * (1 - (e.ovx ?? 0.05)), gy = ih * (1 - ov), rows = Math.ceil(n / per);
    const W = (per - 1) * gx + iw, H = (rows - 1) * gy + ih, t0 = e.t + 0.05, fill = e.sd ?? 1.2;
    const order = Array.from({length: n}, (_, i) => i);
    if (G.from === 'random') {let s = 7; for (let i = n - 1; i > 0; i--) {s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [order[i], order[j]] = [order[j], order[i]];}}
    const rank: number[] = []; order.forEach((idx, r) => {rank[idx] = r;});
    return (
      <div style={{position: 'relative', width: W, height: H}}>
        {Array.from({length: n}, (_, i) => {
          const r = Math.floor(i / per), c = i % per, q = prog(t, t0 + (i / n) * fill, 0.35);
          const isHi = G.hi && rank[i] < G.hi, hq = isHi ? prog(t, (G.hiT ?? 1e9) + (rank[i] / G.hi) * (G.hiD ?? 1.2), 0.25) : 0;
          const rest = !isHi && G.hi && G.dim !== false ? prog(t, (G.hiT ?? 1e9) + 0.2, 0.6) : 0;
          return (
            <React.Fragment key={i}>
              {icon(`a${i}`, src0, c * gx, r * gy, q, {op: (1 - hq) * (1 - 0.62 * rest), fx: rest > 0 ? `grayscale(${rest.toFixed(2)})` : e.fx})}
              {hq > 0 && icon(`b${i}`, G.alt, c * gx, r * gy, 1, {sc: lerp(1.45, 1.08, back(hq)), fx: G.fx ?? 'drop-shadow(0 0 9px rgba(255,70,60,.85))'})}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
  const cols = e.cols as any[], per = e.per ?? 1, gap = e.gap ?? 120, unit = e.unit ?? 1;
  const cw = per * iw * 0.92, counts = cols.map((c) => c.v / unit), maxRows = Math.max(...counts.map((k) => Math.ceil(k / per)));
  const step = ih * (1 - ov), labH = e.lab === false ? 0 : 110, valH = 110;
  const W = cols.length * cw + (cols.length - 1) * gap, H = valH + (maxRows - 1) * step + ih + labH, base = valH + (maxRows - 1) * step;
  const F0 = e.focus;
  const litOf = (i: number) => {let cur = -1, t0 = -1e9; for (const [ft, k] of F0 ?? []) if (t + 1e-6 >= ft) {cur = k; t0 = ft;} const on = cur === -1 || cur === i ? 1 : 0; return lerp(1, on, eout(prog(t, t0, 0.35)));};
  return (
    <div style={{position: 'relative', width: W, height: H}}>
      {cols.map((col, ci) => {
        const x0 = ci * (cw + gap), k = counts[ci], full = Math.floor(k), frac = k - full, total = Math.ceil(k - 1e-6);
        const t0 = col.t ?? e.t + ci * (sd + 0.2), lit = litOf(ci), rowsC = Math.ceil(total / per);
        const done = prog(t, t0 + sd, 0.4), topY = base - (rowsC - 1) * step;
        return (
          <div key={ci} style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: 0.4 + 0.6 * lit, filter: lit < 0.99 ? `saturate(${(0.4 + 0.6 * lit).toFixed(2)})` : undefined}}>
            {Array.from({length: total}, (_, i) => {
              const r = Math.floor(i / per), c = i % per, q = prog(t, t0 + (i / Math.max(1, total)) * sd, 0.3);
              const last = i === total - 1 && frac > 1e-6;
              return icon(i, col.src ?? src0, x0 + c * iw * 0.92 + (per === 1 ? (cw - iw) / 2 : 0), base - r * step, q, {clip: last ? `inset(0 ${((1 - frac) * 100).toFixed(1)}% 0 0)` : undefined, fx: e.fx});
            })}
            {done > 0 && (
              <div style={{position: 'absolute', left: x0 - 80, width: cw + 160, top: topY - 96, textAlign: 'center', opacity: done, transform: `scale(${back(done).toFixed(3)})`, transformOrigin: '50% 100%',
                fontFamily: num, fontWeight: W900(num), fontSize: e.vs ?? 76, lineHeight: 1, color: col.c ?? ink, whiteSpace: 'nowrap', textShadow: TH.name === 'terminal' ? phosphorTs('255,176,0', 0.7) : ts}}>
                {col.s ?? `${fmt(col.v, e.dec ?? 0)}${e.u ?? ''}`}
              </div>
            )}
            {e.lab !== false && (
              <div style={{position: 'absolute', left: x0 - 80, width: cw + 160, top: base + ih + 18, textAlign: 'center', opacity: eout(prog(t, t0, 0.4)),
                fontFamily: font, fontWeight: W900(font), fontSize: e.ls ?? 48, lineHeight: 1.1, color: ink, whiteSpace: 'nowrap', textShadow: ts}}>{col.l}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ELS8: any = {prop: Prop, stack6: Stack6};
