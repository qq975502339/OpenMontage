// Real-world material: web / document screenshots in a browser frame, and real logos.
// Screenshots come from scripts/web_shot.mjs (2x pixels, plus <png>.boxes.json for phrase boxes);
// add them with add_web() in story_core.py, which reads the PNG size and the boxes.
import React from 'react';
import {Img} from 'remotion';
import {clamp, eio, eout, F, img, lerp, prog} from './lib';

// keyframes [[t, v], [t, v, dur?], ...] -> eased value at t
const keyed = (keys: any[] | undefined, t: number, d = 0.9) => {
  if (!keys || !keys.length) return 0;
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [tk, vk, dk] = keys[i];
    if (t < tk) break;
    v = lerp(keys[i - 1][1], vk, eio(clamp((t - tk) / (dk ?? d))));
  }
  return v;
};

const union = (rs: number[][]) => {
  const x0 = Math.min(...rs.map((r) => r[0])), y0 = Math.min(...rs.map((r) => r[1]));
  const x1 = Math.max(...rs.map((r) => r[0] + r[2])), y1 = Math.max(...rs.map((r) => r[1] + r[3]));
  return [x0, y0, x1 - x0, y1 - y0];
};

// one mark, drawn in screenshot coordinates scaled by k
const Mark: React.FC<{m: any; k: number; t: number}> = ({m, k, t}) => {
  if (t < m.t || m.kind === 'none') return null;   // 'none': spotlight only
  const fade = m.out != null ? 1 - eout(prog(t, m.out, 0.3)) : 1;
  const rs: number[][] = m.r;
  if (m.kind === 'box') {
    const [x, y, w, h] = union(rs), pad = 10 / k, p = eout(prog(t, m.t, 0.35)), c = m.c || '#ff4d3d';
    return <div style={{position: 'absolute', left: (x - pad) * k, top: (y - pad) * k, width: (w + 2 * pad) * k, height: (h + 2 * pad) * k,
      border: `5px solid ${c}`, borderRadius: 12, opacity: p * fade, transform: `scale(${lerp(1.08, 1, p)})`, boxShadow: `0 0 26px ${c}88`}} />;
  }
  // hl / under: sweep line by line, total duration d
  const tot = rs.reduce((a, r) => a + r[2], 0) || 1, P = prog(t, m.t, m.d ?? 0.55);
  let acc = 0;
  return <>{rs.map((r, i) => {
    const a0 = acc / tot; acc += r[2]; const a1 = acc / tot;
    const p = clamp((P - a0) / Math.max(1e-3, a1 - a0));
    if (p <= 0) return null;
    if (m.kind === 'under') return <div key={i} style={{position: 'absolute', left: r[0] * k, top: (r[1] + r[3]) * k + 2, width: r[2] * k * p, height: 6,
      background: m.c || '#ff4d3d', borderRadius: 3, opacity: fade}} />;
    return <div key={i} style={{position: 'absolute', left: (r[0] - 6) * k, top: (r[1] - 3) * k, width: (r[2] + 12) * k * p, height: (r[3] + 6) * k,
      background: m.c || 'rgba(255,214,0,.48)', mixBlendMode: 'multiply', borderRadius: 4, opacity: fade}} />;
  })}</>;
};

// spotlight: darken everything but the active spot marks (current item brightest). All active spots merge into
// one window; when a new spot mark starts, the window grows / moves to include it.
const rectAt = (ms: any[]) => (ms.length ? union(ms.flatMap((m) => m.r)) : null);
const Spot: React.FC<{marks: any[]; k: number; t: number}> = ({marks, k, t}) => {
  const live = (m: any, tt: number) => m.spot && tt >= m.t - 0.2 && (m.out == null || tt < m.out + 0.35);
  const act = marks.filter((m) => live(m, t));
  if (!act.length) return null;
  const last = act.reduce((a, m) => (m.t > a.t ? m : a), act[0]);
  const p = eout(prog(t, last.t - 0.2, 0.45));
  const prev = rectAt(act.filter((m) => m !== last)), cur = rectAt(act)!;
  const r = prev ? prev.map((v, i) => lerp(v, cur[i], p)) : cur;
  const ends = act.filter((m) => m.out != null && act.every((n) => n.out != null)).map((m) => m.out);
  const fade = ends.length === act.length ? 1 - eout(prog(t, Math.max(...ends), 0.35)) : 1;
  const op = (prev ? 1 : p) * fade, pad = 18 / k;
  return <div style={{position: 'absolute', left: (r[0] - pad) * k, top: (r[1] - pad) * k, width: (r[2] + 2 * pad) * k, height: (r[3] + 2 * pad) * k,
    borderRadius: 10, boxShadow: `0 0 0 6000px rgba(10,12,18,${0.5 * op})`}} />;
};

const Lock = () => (
  <svg width="15" height="17" viewBox="0 0 15 17"><rect x="1.5" y="7" width="12" height="9" rx="2" fill="rgba(255,255,255,.72)" />
    <path d="M4.2 7V5a3.3 3.3 0 0 1 6.6 0v2" stroke="rgba(255,255,255,.72)" strokeWidth="1.8" fill="none" /></svg>
);

// webshot: e.src e.iw e.ih (screenshot px), e.w e.h (frame px), e.bar, e.url, e.sy/e.sx scroll keys, e.marks
const WebShot: React.FC<any> = ({e, t}) => {
  const w = e.w ?? 1500, h = e.h ?? 860, bar = e.bar ?? 56, k = w / e.iw;
  const sy = keyed(e.sy, t), sx = keyed(e.sx, t);
  const marks: any[] = e.marks || [];
  return (
    <div style={{width: w, height: h + bar, borderRadius: 20, overflow: 'hidden', background: '#0d0f14',
      boxShadow: '0 60px 140px rgba(0,0,0,.58), 0 18px 40px rgba(0,0,0,.35), 0 0 0 1.5px rgba(255,255,255,.12)'}}>
      <div style={{height: bar, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 11,
        background: 'linear-gradient(180deg,#2d313b,#1e2129)', borderBottom: '1px solid rgba(255,255,255,.07)'}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: 15, height: 15, borderRadius: 8, background: c, opacity: 0.92}} />)}
        <div style={{marginLeft: 26, height: 34, minWidth: w * 0.42, borderRadius: 17, background: 'rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px'}}>
          <Lock /><span style={{fontFamily: F.din, fontSize: 20, color: 'rgba(255,255,255,.82)', letterSpacing: 0.4}}>{e.url}</span>
        </div>
      </div>
      <div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: e.paper ?? '#ffffff'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: w, transform: `translate(${-sx * k}px, ${-sy * k}px)`}}>
          <Img src={img(e.src)} style={{width: w, height: e.ih * k, display: 'block'}} />
          <Spot marks={marks} k={k} t={t} />
          {marks.map((m, i) => <Mark key={i} m={m} k={k} t={t} />)}
        </div>
      </div>
    </div>
  );
};

// logo: a real logo (PNG/SVG under public/) on a white rounded chip; e.size, e.label, e.fill, e.bg, e.lit (0..1 dims)
const Logo: React.FC<any> = ({e}) => {
  const s = e.size ?? 200, f = e.fill ?? 0.62;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: s * 0.1}}>
      <div style={{width: s, height: s, borderRadius: s * 0.24, background: e.bg ?? 'linear-gradient(160deg,#ffffff,#e9ecf2)',
        boxShadow: '0 26px 54px rgba(0,0,0,.5), inset 0 0 0 1.5px rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Img src={img(e.src)} style={{width: s * f, height: s * f, objectFit: 'contain'}} />
      </div>
      {e.label && <div style={{fontFamily: F.heavy, fontWeight: 800, fontSize: s * 0.19, color: e.lc ?? '#f6f4ee', whiteSpace: 'nowrap',
        textShadow: '0 4px 14px rgba(0,0,0,.55)'}}>{e.label}</div>}
    </div>
  );
};

export const REAL_ELS: any = {webshot: WebShot, logo: Logo};
