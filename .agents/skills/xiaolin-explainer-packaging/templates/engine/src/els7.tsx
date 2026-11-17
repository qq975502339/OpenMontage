// v7 layouts: line chart, timeline, pie / donut, flow, tree, map, versus, relationship graph.
// Same rules as els6: every surface reads the theme tokens (TH.paper for chart cards, TH.card for boxes,
// TH.ink / TH.ink2 / TH.acc on the background), one lit item at a time, everything enters on cue.
import React from 'react';
import {Img} from 'remotion';
import {back, clamp, eio, eout, F, fmt, GText, img, lerp, prog, rnd} from './lib';
import {FlagSvg} from './els';
import {EN, TH} from './theme';
import {deskShadow, iconFx, Pin, phosphorTs, Ruled, Tape, torn} from './skins';
import WORLD from './geo/world110.json';
import {propShadow} from './els8';

const bgOf = (x: any) => (x == null ? {} : typeof x === 'string' ? {background: x} : x);
const mix = (a: number[], b: number[], l: number, al = 1) => `rgba(${lerp(a[0], b[0], l).toFixed(0)},${lerp(a[1], b[1], l).toFixed(0)},${lerp(a[2], b[2], l).toFixed(0)},${al})`;
const W900 = (f: string) => (f.includes("'PX'") || f.includes("'MSZ'") || f.includes("'YS'") || f.includes("'BB'") || f.includes("'DIN'") ? 400 : 900);
const fwOf = (f: string) => (W900(f) === 900 ? 700 : 400);
const TERM = TH.name === 'terminal';
const hexRgb = (h: string) => {const n = parseInt(h.slice(1, 7), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;};
const alpha = (c: string, a: number) => (c.startsWith('#') ? `rgba(${hexRgb(c)},${a})` : c);
const glowTs = (c: string, k = 1) => (TERM && c.startsWith('#') ? phosphorTs(hexRgb(c), k) : undefined);
const focusAt = (fs: any[] | undefined, t: number) => {
  let cur = -2, prev = -2, t0 = -1e9;
  for (const [ft, idx] of fs ?? []) {if (t + 1e-6 >= ft) {prev = cur; cur = idx; t0 = ft;}}
  return {cur, prev, p: eout(prog(t, t0, 0.35))};
};
const litOf = (fs: any[] | undefined, t: number, i: number) => {
  const {cur, prev, p} = focusAt(fs, t);
  const on = (k: number) => (k === -1 || k === -2 || k === i ? 1 : 0);
  return lerp(on(prev), on(cur), p);
};
// focus lists may name items by id: [[t, 'root'], ...] -> indices
const fsIdx = (fs: any[] | undefined, ids: Record<string, number>) => (fs ?? []).map(([ft, k]: any) => [ft, typeof k === 'string' ? ids[k] ?? -1 : k]);

// accent for highlights on chart paper, and a categorical sequence; a project can override with theme.hot / theme.seq
const HOT0: any = {finance: '#c8574d', press: '#d9483b', blueprint: '#ff7a1a', terminal: '#33ff88', desk: '#e2543f', editorial: '#1f3fd1'};
const SEQ0: any = {
  finance: ['#5b3a63', '#3f8a86', '#8b9a3c', '#c8574d', '#d8c88e', '#5b6a9e'],
  press: ['#c23a2d', '#1b1a18', '#7e7566', '#b89a6a', '#5c5548', '#e0a090'],
  blueprint: ['#123a6b', '#ff7a1a', '#4f7fb8', '#9db7d8', '#24508a', '#f2b27a'],
  terminal: ['#ffb000', '#33ff88', '#1f9e55', '#cc8a00', '#7dffb5', '#806000'],
  desk: ['#e2543f', '#2f5d8a', '#f0c24b', '#5a8a5e', '#1f1f22', '#c9a27a'],
  editorial: ['#1f3fd1', '#111114', '#8a8a90', '#c8cbe0', '#5b72e0', '#d6d6d0'],
};
export const hot = (): string => TH.hot ?? HOT0[TH.name] ?? TH.acc;
export const seq = (i: number): string => {const s = TH.seq ?? SEQ0[TH.name] ?? SEQ0.finance; return s[i % s.length];};
const onHot = () => (TERM ? '#0a1408' : '#ffffff');
const paperBase = () => {const b = TH.paper.bg; return (typeof b === 'object' && b.backgroundColor) || (typeof b === 'string' && b.startsWith('#') ? b : TERM ? '#03140a' : '#f4f2ec');};

// arrow head (filled triangle) at x,y pointing along angle a (radians)
const head = (x: number, y: number, a: number, s = 22) => {
  const p = (r: number, da: number) => `${(x + r * Math.cos(a + da)).toFixed(1)},${(y + r * Math.sin(a + da)).toFixed(1)}`;
  return `${p(0, 0)} ${p(-s, 0.42)} ${p(-s * 0.72, 0)} ${p(-s, -0.42)}`;
};
// quadratic curve between two points with a perpendicular bend (fraction of the chord)
const quad = (ax: number, ay: number, bx: number, by: number, bend = 0) => {
  const mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / L) * bend * L, cy = my + (dx / L) * bend * L;
  const at = (u: number) => [(1 - u) * (1 - u) * ax + 2 * (1 - u) * u * cx + u * u * bx, (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * cy + u * u * by];
  const ang = (u: number) => Math.atan2(2 * (1 - u) * (cy - ay) + 2 * u * (by - cy), 2 * (1 - u) * (cx - ax) + 2 * u * (bx - cx));
  return {d: `M${ax.toFixed(1)} ${ay.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`, at, ang};
};

// ---------------------------------------------------------------- shared: a theme card (the same material as the wall cards)
export const CardBox: React.FC<{w: number; h: number; lit: number; seed?: number; round?: boolean; children?: any}> = ({w, h, lit, seed = 1, round, children}) => {
  const C = TH.card, torn_ = C.torn && !round, r = round ? '50%' : C.r;
  const shadow = C.flat ? `0 ${10 + 14 * lit}px ${30 + 30 * lit}px rgba(20,20,40,${(0.08 + 0.1 * lit).toFixed(2)})`
    : TH.name === 'desk' ? deskShadow(lit * 0.6)
    : C.glow ? `0 0 ${(50 * lit).toFixed(0)}px rgba(${C.glow},${(0.55 * lit).toFixed(2)})`
    : `0 ${18 + 12 * lit}px ${36 + 30 * lit}px rgba(0,0,0,${(0.5 + 0.1 * lit).toFixed(2)}), 0 2px 3px rgba(0,0,0,.4)`;
  return (
    <div style={{position: 'relative', width: w, height: h, filter: torn_ ? `drop-shadow(0 ${(8 + 8 * lit).toFixed(0)}px ${(10 + 10 * lit).toFixed(0)}px rgba(0,0,0,${(0.32 + 0.12 * lit).toFixed(2)}))` : undefined}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden', clipPath: torn_ ? torn(seed, w, h, 6, 22) : undefined, boxShadow: torn_ ? undefined : shadow}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: r, ...bgOf(C.base)}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: r, opacity: lit, ...bgOf(C.lit)}} />
        {C.ruled && !round && h >= 150 && <div style={{position: 'absolute', inset: 0, opacity: 1 - lit}}><Ruled lh={Math.round(Math.max(44, h * 0.15))} top={Math.round(h * 0.2)} /></div>}
        {C.litRing && <div style={{position: 'absolute', inset: Math.min(14, w * 0.04), borderRadius: r, border: `4px solid ${C.litRing}`, opacity: lit}} />}
        {C.frame && <div style={{position: 'absolute', inset: 10, borderRadius: r, border: `1.5px solid ${lit > 0.5 ? 'rgba(18,58,107,.45)' : 'rgba(235,242,250,.35)'}`}} />}
        {TH.name === 'finance' && <div style={{position: 'absolute', inset: 0, borderRadius: r, boxShadow: `inset 0 2px 0 rgba(255,255,255,${(0.08 + 0.32 * lit).toFixed(2)}), inset 0 -3px 0 rgba(0,0,0,.22)`}} />}
        <div style={{position: 'absolute', inset: 0}}>{children}</div>
      </div>
      {C.tape && !round && <Tape w={Math.min(150, w * 0.32)} h={38} rot={(rnd(seed * 7 + 2)() - 0.5) * 10} style={{left: w * 0.34, top: -15}} />}
      {C.pin && <Pin s={30} style={{left: w / 2 - 15, top: -10}} />}
    </div>
  );
};
const cInk = (lit: number, a = 1) => mix(TH.card.dim, TH.card.on, lit, a);
const cSub = (lit: number) => mix(TH.card.sdim, TH.card.son, lit, 0.92);
const cGlow = (lit: number, size: number) => (TH.card.glow && lit < 0.5 ? phosphorTs('51,255,136', size / 120) : undefined);
const CardIcon: React.FC<{src: string; lit: number; style: any}> = ({src, lit, style}) => {
  const fx = iconFx(TH.card.icon, lit);
  return <Img src={img(src)} style={{position: 'absolute', objectFit: 'contain', ...style, ...(fx ?? {filter: `saturate(${(0.6 + 0.4 * lit).toFixed(2)}) brightness(${(0.8 + 0.2 * lit).toFixed(2)}) drop-shadow(0 6px 8px rgba(0,0,0,.3))`})}} />;
};

// ---------------------------------------------------------------- shared: chart paper (the same surface as `paper`)
const Surface: React.FC<{e: any; w: number; h: number; children: (top: number) => any}> = ({e, w, h, children}) => {
  const P = TH.paper, font = P.font ?? TH.f.body, fw = fwOf(font);
  const band = !!e.title && (e.hdr ?? 'dark') === 'dark' && P.hdr !== 'transparent';
  const top = !e.title ? 60 : band ? 240 : 220;
  const tf = P.titleFont ?? TH.f.title;
  const titleEl = !e.title ? null : TH.name === 'finance' ? <GText txt={e.title} size={e.ts ?? 72} grad="gold" glow={false} ls={6} />
    : <span style={{fontFamily: tf, fontWeight: W900(tf), fontSize: e.ts ?? 72, letterSpacing: 4, color: P.hdrInk, textShadow: P.phosphor ? phosphorTs('255,176,0') : undefined}}>{e.title}</span>;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: P.r, ...bgOf(P.bg), border: P.border, overflow: 'hidden',
      boxShadow: P.flat ? '0 30px 80px rgba(20,20,40,.14)' : TH.name === 'desk' ? deskShadow(0.4) : '0 50px 110px rgba(0,0,0,.55)'}}>
      {P.frame && <div style={{position: 'absolute', inset: 18, border: `3px solid ${P.frame}`}} />}
      {band && (
        <div style={{position: 'absolute', left: 30, right: 30, top: 30, height: 170, borderRadius: Math.max(0, P.r * 0.7), ...bgOf(P.hdr), textAlign: 'center'}}>
          {e.kicker && <div style={{marginTop: 18, fontFamily: TH.f.card, fontSize: 30, color: P.kick, letterSpacing: 6}}>{e.kicker}</div>}
          <div style={{marginTop: e.kicker ? 0 : 36}}>{titleEl}</div>
        </div>
      )}
      {e.title && !band && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center'}}>
          {e.kicker && <div style={{fontFamily: font, fontWeight: fw, fontSize: 28, color: P.kick, letterSpacing: 6, marginBottom: 4}}>{e.kicker}</div>}
          {titleEl}
          <div style={{margin: '10px auto 0', width: 140, height: 6, background: P.kick, borderRadius: TH.name === 'desk' ? 3 : 0}} />
        </div>
      )}
      {children(top)}
      {e.unit && <div style={{position: 'absolute', left: 60, top: top - 34, fontFamily: font, fontWeight: 400, fontSize: 24, color: P.sub}}>{e.unit}</div>}
      {e.src && <div style={{position: 'absolute', left: 60, bottom: 30, fontFamily: font, fontWeight: 400, fontSize: 22, color: P.sub}}>{e.src}</div>}
    </div>
  );
};
const Pill: React.FC<{txt: string; bg: string; ink: string; size?: number; style?: any}> = ({txt, bg, ink, size = 32, style}) => (
  <div style={{position: 'absolute', whiteSpace: 'nowrap', background: bg, color: ink, fontFamily: TH.f.body, fontWeight: fwOf(TH.f.body), fontSize: size, lineHeight: 1.15,
    padding: `${size * 0.22}px ${size * 0.5}px`, borderRadius: TH.card.r >= 4 ? size * 0.3 : 0, boxShadow: TH.card.flat || TERM ? 'none' : '0 6px 14px rgba(0,0,0,.22)', textShadow: glowTs(ink, 0.5), ...style}}>{txt}</div>
);

// ---------------------------------------------------------------- line6: line chart on chart paper
// xs: x labels; series: [{v: [...], l?, c?, t?, d?}]; bands: [{a, b, l?, t?}] shaded x-ranges (indices);
// pins: [{i, j?, s, t?, below?}] callouts on points; draws left to right from e.t + bt over gd seconds
export const Line6: React.FC<any> = ({e, t}) => {
  const P = TH.paper, font = P.font ?? TH.f.body, fw = fwOf(font), H0 = hot();
  const w = e.w ?? 1600, h = e.h ?? 900, xs: string[] = e.xs ?? [];
  const series: any[] = e.series ?? [{v: e.v ?? []}];
  const all = series.flatMap((s) => s.v as number[]);
  const mn = Math.min(...all), mx = Math.max(...all);
  const nice = (span: number) => {const raw = span / 4, p = Math.pow(10, Math.floor(Math.log10(raw || 1))); for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p; return 10 * p;};
  const st = e.ystep ?? nice(mx * 1.08 - (mn >= 0 ? 0 : mn)), lo = e.min ?? (mn >= 0 ? 0 : Math.floor(mn / st) * st), hi = e.max ?? Math.ceil((mx * 1.08) / st) * st;
  const t0 = e.t + (e.bt ?? 0.35), gd = e.gd ?? 1.6, uid = `ln${Math.round(e.t * 1000)}_${Math.round(e.x ?? 0)}`;
  return (
    <Surface e={e} w={w} h={h}>{(top) => {
      const L = e.left ?? 140, R = w - 90, T = top + 40, B = h - (e.src ? 130 : 100);
      const n = Math.max(2, ...series.map((s) => s.v.length));
      const X = (i: number) => L + ((R - L) * i) / (n - 1), Y = (v: number) => B - ((B - T) * (v - lo)) / (hi - lo);
      const step = e.xstep ?? Math.max(1, Math.ceil(n / 8));
      // reveal: [[t, idx], ...] draws the line up to point idx at each cue (follows the narration); otherwise one sweep over gd
      const rev = (j: number) => {
        const s = series[j];
        if (!e.reveal) return eio(prog(t, s.t ?? t0 + j * 0.3, s.d ?? gd));
        let cur = 0;
        for (const [rt, ri] of e.reveal) {if (t < rt) break; cur = lerp(cur, ri / (n - 1), eio(prog(t, rt, e.rd ?? 0.9)));}
        return cur;
      };
      const ticks: number[] = [];
      if (e.yt !== false) for (let v = lo; v <= hi + st * 0.01; v += st) ticks.push(v);
      return (
        <>
          <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            <defs>{series.map((s, j) => {
              const p = rev(j);
              return <clipPath key={j} id={`${uid}_${j}`}><rect x={0} y={0} width={L + (R - L) * p + 4} height={h} /></clipPath>;
            })}</defs>
            {(e.bands ?? []).map((b: any, k: number) => {
              const q = eout(prog(t, b.t ?? t0, 0.45));
              return <rect key={k} x={X(b.a)} y={T - 10} width={Math.max(4, X(b.b) - X(b.a))} height={B - T + 10} fill={alpha(b.c ?? H0, 0.13)} opacity={q} />;
            })}
            {ticks.map((v, k) => <line key={k} x1={L} x2={R} y1={Y(v)} y2={Y(v)} stroke={k === 0 ? P.axis : P.grid} strokeWidth={k === 0 ? 3 : 1.5} />)}
            {series.map((s, j) => {
              const c = s.c ?? seq(j), pts = (s.v as number[]).map((v, i) => [X(i), Y(v)]);
              const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('');
              return (
                <g key={j} clipPath={`url(#${uid}_${j})`}>
                  {j === 0 && e.area !== false && <path d={`${d}L${pts[pts.length - 1][0]} ${B}L${pts[0][0]} ${B}Z`} fill={alpha(c, TERM ? 0.16 : 0.12)} />}
                  <path d={d} fill="none" stroke={c} strokeWidth={s.lw ?? e.lw ?? 7} strokeLinejoin="round" strokeLinecap="round" style={{filter: TERM ? `drop-shadow(0 0 6px ${alpha(c, 0.8)})` : undefined}} />
                </g>
              );
            })}
            {series.map((s, j) => {
              const p = rev(j), v = s.v as number[];
              if (p <= 0) return null;
              const f = p * (v.length - 1), i = Math.min(v.length - 2, Math.floor(f)), u = f - i;
              const x = lerp(X(i), X(i + 1), u), y = lerp(Y(v[i]), Y(v[i + 1]), u), c = s.c ?? seq(j);
              if (s.rider) {
                const R_ = typeof s.rider === 'string' ? {src: s.rider} : s.rider, rw = R_.w ?? 150, rh = R_.h ?? rw;
                const ang = (Math.atan2(Y(v[i + 1]) - Y(v[i]), X(i + 1) - X(i)) * 180 / Math.PI) * (R_.orient ?? 0.5), bob = p < 1 ? Math.abs(Math.sin(t * 8)) * (R_.hop ?? 7) : 0;
                return <g key={j} transform={`translate(${x.toFixed(1)},${(y - bob).toFixed(1)}) rotate(${ang.toFixed(2)})`}><image href={img(R_.src)} x={-rw / 2} y={-rh * (R_.ay ?? 0.86)} width={rw} height={rh} style={{filter: propShadow(0)}} /></g>;
              }
              return <circle key={j} cx={x} cy={y} r={11} fill={c} stroke={paperBase()} strokeWidth={4} />;
            })}
          </svg>
          {ticks.map((v, k) => <div key={k} style={{position: 'absolute', left: 0, width: L - 20, top: Y(v) - 16, textAlign: 'right', fontFamily: font, fontSize: 26, color: P.sub, whiteSpace: 'nowrap'}}>{fmt(v, e.dec ?? (st < 1 ? 1 : 0))}</div>)}
          {xs.map((x, i) => (i % step === 0 || i === xs.length - 1) && (
            <div key={i} style={{position: 'absolute', left: X(i) - 120, width: 240, top: B + 14, textAlign: 'center', fontFamily: font, fontWeight: fw === 700 ? 600 : 400, fontSize: e.xs_s ?? 30, color: P.lab, whiteSpace: 'nowrap'}}>{x}</div>
          ))}
          {(e.bands ?? []).map((b: any, k: number) => b.l && (
            <div key={k} style={{position: 'absolute', left: X(b.a), width: Math.max(160, X(b.b) - X(b.a)), top: T - 4, textAlign: 'center', fontFamily: font, fontWeight: fw, fontSize: 28, color: b.c ?? H0, opacity: eout(prog(t, (b.t ?? t0) + 0.2, 0.4)), whiteSpace: 'nowrap'}}>{b.l}</div>
          ))}
          {series.map((s, j) => s.l && (
            <div key={j} style={{position: 'absolute', left: R - 300, width: 300, top: Y(s.v[s.v.length - 1]) - (s.lb ? -22 : 64), textAlign: 'right', fontFamily: font, fontWeight: fw, fontSize: 32, color: s.c ?? seq(j), opacity: clamp((rev(j) - 0.9) * 10), whiteSpace: 'nowrap'}}>{s.l}</div>
          ))}
          {(e.pins ?? []).map((pn: any, k: number) => {
            const v = series[pn.j ?? 0].v[pn.i], x = X(pn.i), y = Y(v), q = prog(t, pn.t ?? t0 + gd, 0.4), below = pn.below ?? false;
            if (q <= 0) return null;
            const c = pn.c ?? H0, dy = below ? 70 : -70;
            return (
              <React.Fragment key={k}>
                <div style={{position: 'absolute', left: x - 2, top: Math.min(y, y + dy), width: 4, height: Math.abs(dy) * eout(q), background: c}} />
                <div style={{position: 'absolute', left: x - 17, top: y - 17, width: 34, height: 34, borderRadius: '50%', background: c, border: `5px solid ${paperBase()}`, transform: `scale(${back(q).toFixed(3)})`}} />
                <div style={{position: 'absolute', left: x, top: y + dy, transform: `translate(-50%, ${below ? '0' : '-100%'}) scale(${back(q).toFixed(3)})`, transformOrigin: below ? '50% 0' : '50% 100%'}}>
                  <Pill txt={pn.s} bg={c} ink={onHot()} size={pn.size ?? 34} style={{position: 'relative'}} />
                </div>
              </React.Fragment>
            );
          })}
        </>
      );
    }}</Surface>
  );
};

// ---------------------------------------------------------------- timeline6: horizontal axis, year nodes, event cards above / below
// items: [{y: '1913', l: '美联储成立', s?, icon?, side?: 'up'|'down', t?}]; focus [[t, i]] lights one event; pan the camera along it
export const Timeline6: React.FC<any> = ({e, t}) => {
  const items = e.items as any[], n = items.length;
  const gap = e.gap ?? 460, cw = e.cw ?? 400, ch = e.ch ?? 200, pad = e.pad ?? 240, arm = e.arm ?? 110, ys = e.ys ?? 64;
  const W = pad * 2 + gap * (n - 1), H = (ch + arm + ys + 40) * 2, yA = H / 2;
  const t0 = e.t + 0.1, gd = e.gd ?? Math.max(0.8, n * 0.3), pa = eio(prog(t, t0, gd));
  const ink = TH.ink, ink2 = TH.ink2, acc = TH.acc;
  return (
    <div style={{position: 'relative', width: W, height: H}}>
      <div style={{position: 'absolute', left: 0, top: yA - 3, width: (W - 30) * pa, height: 6, background: ink, opacity: 0.75, borderRadius: 3, boxShadow: TERM ? '0 0 12px rgba(255,176,0,.7)' : undefined}} />
      {pa > 0.98 && <svg width={60} height={60} style={{position: 'absolute', left: W - 52, top: yA - 30, overflow: 'visible'}}><polygon points={head(50, 30, 0, 34)} fill={ink} opacity={0.75} /></svg>}
      {items.map((it, i) => {
        const x = pad + gap * i, ti = it.t ?? t0 + gd * (x / W) * 0.9, p = eout(prog(t, ti, 0.5)), lit = litOf(e.focus, t, i);
        const up = (it.side ?? (i % 2 === 0 ? 'up' : 'down')) === 'up';
        if (p <= 0) return null;
        const cy = up ? yA - arm - ch : yA + arm;
        const yy = up ? yA + 30 : yA - 30 - ys * 1.15;
        const size = it.size ?? e.ls ?? 50;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x - 1.5, top: up ? yA - arm * p : yA, width: 3, height: arm * p, background: ink2}} />
            <div style={{position: 'absolute', left: x - 19, top: yA - 19, width: 38, height: 38, borderRadius: TH.card.r >= 4 ? '50%' : 0, border: `5px solid ${ink}`, background: lit > 0.5 ? acc : (TH.light ? '#f4f1ea' : '#16161a'), transform: `scale(${back(p).toFixed(3)}) rotate(${TH.card.r >= 4 ? 0 : 45}deg)`}} />
            <div style={{position: 'absolute', left: x - 200, width: 400, top: yy, textAlign: 'center', fontFamily: TH.f.num, fontWeight: W900(TH.f.num), fontSize: ys, lineHeight: 1.1, color: lit > 0.5 ? acc : ink, opacity: (0.45 + 0.55 * lit) * clamp(p * 2), textShadow: glowTs(lit > 0.5 ? acc : ink, 0.8), whiteSpace: 'nowrap'}}>{it.y}</div>
            <div style={{position: 'absolute', left: x - cw / 2, top: cy, opacity: clamp(p * 2), transform: `translateY(${((1 - p) * (up ? -40 : 40)).toFixed(1)}px) scale(${(1 + 0.04 * lit).toFixed(4)})`, transformOrigin: up ? '50% 100%' : '50% 0'}}>
              <CardBox w={cw} h={ch} lit={lit} seed={i * 17 + 3}>
                <div style={{position: 'absolute', left: 34, right: it.icon ? ch * 0.6 : 30, top: it.s ? ch * 0.17 : (ch - size * 1.12) / 2, fontFamily: TH.f.card, fontWeight: W900(TH.f.card), fontSize: size, lineHeight: 1.12, color: cInk(lit), textShadow: cGlow(lit, size), whiteSpace: 'pre'}}>{it.l}</div>
                {it.s && <div style={{position: 'absolute', left: 36, right: 30, bottom: ch * 0.16, fontFamily: TH.f.body, fontWeight: fwOf(TH.f.body), fontSize: it.ss ?? 28, color: cSub(lit), whiteSpace: 'nowrap', overflow: 'hidden'}}>{it.s}</div>}
                {it.icon && <CardIcon src={it.icon} lit={lit} style={{right: 22, top: ch * 0.18, height: ch * 0.64, width: ch * 0.55}} />}
              </CardBox>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- pie6: pie or donut on chart paper, legend on the right
// slices: [{l, v, s?, c?, t?}]; donut: inner radius ratio (0 = pie); center: {v, l}; hi: [[t, i]] pulls one slice out
const arc = (cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) => {
  const R = (a: number) => (a * Math.PI) / 180, lg = a1 - a0 > 180 ? 1 : 0;
  const p = (r: number, a: number) => `${(cx + r * Math.cos(R(a))).toFixed(1)} ${(cy + r * Math.sin(R(a))).toFixed(1)}`;
  return r0 > 0 ? `M${p(r1, a0)}A${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 ${lg} 0 ${p(r0, a0)}Z`
    : `M${cx} ${cy}L${p(r1, a0)}A${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)}Z`;
};
export const Pie6: React.FC<any> = ({e, t}) => {
  const P = TH.paper, font = P.font ?? TH.f.body, fw = fwOf(font);
  const w = e.w ?? 1500, h = e.h ?? 900, sl = e.slices as any[], tot = sl.reduce((a, b) => a + b.v, 0);
  const t0 = e.t + (e.bt ?? 0.35), sd = e.sd ?? 0.3;
  return (
    <Surface e={e} w={w} h={h}>{(top) => {
      const avail = h - top - (e.src ? 90 : 60), R = e.r ?? Math.min(avail / 2 - 10, w * 0.22), cx = e.cx ?? 70 + R + 40, cy = top + avail / 2;
      const ir = R * (e.donut ?? 0.55), F0 = focusAt(e.hi, t);
      let a0 = -90;
      const geo = sl.map((s, i) => {const a1 = a0 + (360 * s.v) / tot; const g = {a0, a1}; a0 = a1; return g;});
      const lx = cx + R + 110, rowH = Math.min(100, (avail - 20) / sl.length), ly = cy - (rowH * sl.length) / 2;
      return (
        <>
          <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
            {sl.map((s, i) => {
              const {a0, a1} = geo[i], q = eio(prog(t, s.t ?? t0 + i * sd, sd * 1.5));
              if (q <= 0) return null;
              const ex = ((F0.cur === i ? F0.p : 0) + (F0.prev === i ? 1 - F0.p : 0)) * (e.pull ?? 26), m = ((a0 + a1) / 2) * (Math.PI / 180);
              const lit = e.hi ? litOf(e.hi, t, i) : 1;
              const d_ = arc(cx + ex * Math.cos(m), cy + ex * Math.sin(m), ir, R, a0, a0 + Math.min(359.9, (a1 - a0) * q));
              if (e.img) {
                const cid = `pie${Math.round(e.t * 1000)}_${i}`, ox = ex * Math.cos(m), oy = ex * Math.sin(m), z = e.iz ?? 1.04;
                return (
                  <g key={i} opacity={0.42 + 0.58 * lit} style={{filter: lit < 0.99 ? `saturate(${(0.3 + 0.7 * lit).toFixed(2)})` : undefined}}>
                    <clipPath id={cid}><path d={d_} /></clipPath>
                    <image href={img(e.img)} x={cx + ox - R * z} y={cy + oy - R * z} width={2 * R * z} height={2 * R * z} clipPath={`url(#${cid})`} preserveAspectRatio="xMidYMid slice" />
                    <path d={d_} fill={s.c ?? seq(i)} opacity={e.tint ?? 0.2} style={{mixBlendMode: 'multiply'}} />
                    <path d={d_} fill="none" stroke={paperBase()} strokeWidth={7} />
                  </g>
                );
              }
              return <path key={i} d={d_} fill={s.c ?? seq(i)} opacity={0.35 + 0.65 * lit}
                stroke={paperBase()} strokeWidth={P.flat || TERM ? 3 : 5} style={{filter: TERM ? `drop-shadow(0 0 8px ${alpha(s.c ?? seq(i), 0.6)})` : undefined}} />;
            })}
          </svg>
          {sl.map((s, i) => {
            const {a0, a1} = geo[i], frac = s.v / tot, q = eio(prog(t, s.t ?? t0 + i * sd, sd * 1.5)), m = ((a0 + a1) / 2) * (Math.PI / 180), rr = ir > 0 ? (ir + R) / 2 : R * 0.62;
            const ex = ((F0.cur === i ? F0.p : 0) + (F0.prev === i ? 1 - F0.p : 0)) * (e.pull ?? 26);
            if (frac < (e.minIn ?? 0.07) || q < 0.95) return null;
            const lit = e.hi ? litOf(e.hi, t, i) : 1, c = s.c ?? seq(i), light = !e.img && ['#d8c88e', '#9db7d8', '#f2b27a', '#f0c24b', '#c9a27a', '#c8cbe0', '#d6d6d0', '#7dffb5', '#e0a090', '#b89a6a'].includes(c);
            return <div key={i} style={{position: 'absolute', left: cx + (rr + ex) * Math.cos(m) - 90, top: cy + (rr + ex) * Math.sin(m) - 26, width: 180, textAlign: 'center', fontFamily: TH.f.num, fontWeight: W900(TH.f.num), fontSize: e.ps ?? Math.max(30, R * 0.12), lineHeight: 1.2,
              color: TERM ? (lit > 0.5 ? '#0a1408' : P.lab) : light ? '#141414' : '#ffffff', textShadow: e.img ? '0 2px 10px rgba(0,0,0,.85), 0 0 3px rgba(0,0,0,.9)' : undefined, opacity: clamp((q - 0.95) * 20) * (0.45 + 0.55 * lit)}}>{s.p ?? `${fmt(frac * 100, e.dec ?? 0)}%`}</div>;
          })}
          {e.center && ir > 0 && (
            <div style={{position: 'absolute', left: cx - ir, width: ir * 2, top: cy - ir * 0.42, textAlign: 'center', opacity: eout(prog(t, t0 + sl.length * sd * 0.6, 0.5))}}>
              <div style={{fontFamily: TH.f.num, fontWeight: W900(TH.f.num), fontSize: e.center.size ?? ir * 0.5, lineHeight: 1, color: P.val, textShadow: P.phosphor ? phosphorTs('255,176,0', 0.8) : undefined}}>{e.center.v}</div>
              {e.center.l && <div style={{marginTop: 10, fontFamily: font, fontWeight: fw, fontSize: 30, color: P.lab}}>{e.center.l}</div>}
            </div>
          )}
          {e.legend !== false && sl.map((s, i) => {
            const q = eout(prog(t, (s.t ?? t0 + i * sd) + 0.15, 0.4)), lit = e.hi ? litOf(e.hi, t, i) : 1, c = s.c ?? seq(i), y = ly + i * rowH;
            const on = e.hi && F0.cur === i;
            return (
              <div key={i} style={{position: 'absolute', left: lx, right: 70, top: y, height: rowH - 14, opacity: q * (0.35 + 0.65 * lit), transform: `translateX(${((1 - q) * 30).toFixed(1)}px)`,
                background: on ? alpha(hot(), 0.12) : 'transparent', borderRadius: TH.card.r >= 4 ? 10 : 0, display: 'flex', alignItems: 'center', padding: '0 20px'}}>
                <div style={{width: 34, height: 34, borderRadius: TH.card.r >= 4 ? 8 : 0, background: c, flex: 'none', boxShadow: TERM ? `0 0 10px ${alpha(c, 0.7)}` : undefined}} />
                <div style={{marginLeft: 22, flex: 1, fontFamily: font, fontWeight: fw, fontSize: e.ls ?? 40, color: P.lab, whiteSpace: 'nowrap', textShadow: P.phosphor ? phosphorTs('51,255,136', 0.4) : undefined}}>{s.l}</div>
                <div style={{fontFamily: TH.f.num, fontWeight: W900(TH.f.num), fontSize: e.vs ?? 44, color: P.val, whiteSpace: 'nowrap', textShadow: P.phosphor ? phosphorTs('255,176,0', 0.5) : undefined}}>{s.s ?? `${fmt((s.v / tot) * 100, e.dec ?? 0)}%`}</div>
              </div>
            );
          })}
        </>
      );
    }}</Surface>
  );
};

// ---------------------------------------------------------------- flow6: steps in a row joined by arrows, current step lit, optional loop back
// steps: [{l, s?, icon?, al? (label on the arrow into this step), t?}]; loop: {from?, to?, l?, t?}; focus [[t, i]]
export const Flow6: React.FC<any> = ({e, t}) => {
  const steps = e.steps as any[], n = steps.length;
  const bw = e.bw ?? 360, bh = e.bh ?? 230, gap = e.gap ?? 150, loopH = e.loop ? (e.loopH ?? 190) : 0;
  const lb_ = e.bare ? 120 : 0, W = n * bw + (n - 1) * gap, H = bh + loopH + 30 + lb_, stag = e.stag ?? 0.45, t0 = e.t + 0.05, ac = e.ac ?? TH.ink2;
  const T = (i: number) => steps[i].t ?? t0 + i * stag;
  const lp = e.loop ? eio(prog(t, e.loop.t ?? T(n - 1) + 0.5, e.loop.d ?? 0.8)) : 0;
  const la = e.loop ? e.loop.from ?? n - 1 : 0, lb = e.loop ? e.loop.to ?? 0 : 0;
  const lx0 = la * (bw + gap) + bw / 2, lx1 = lb * (bw + gap) + bw / 2, ly = bh + 16 + lb_;
  return (
    <div style={{position: 'relative', width: W, height: H}}>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {steps.map((s, i) => {
          if (i === 0) return null;
          const pa = eout(prog(t, T(i) - 0.3, 0.32)), x0 = i * (bw + gap) - gap + 16, x1 = i * (bw + gap) - 16, y = bh / 2;
          if (pa <= 0) return null;
          return (
            <g key={i}>
              <line x1={x0} y1={y} x2={lerp(x0, x1 - 18, pa)} y2={y} stroke={ac} strokeWidth={7} strokeLinecap="round" />
              {pa > 0.9 && <polygon points={head(x1, y, 0, 34)} fill={ac} />}
            </g>
          );
        })}
        {e.loop && lp > 0 && (
          <>
            <path d={`M${lx0} ${ly}C${lx0} ${ly + loopH}, ${lx1} ${ly + loopH}, ${lx1} ${ly + 22}`} fill="none" stroke={ac} strokeWidth={6} strokeDasharray="1 1" pathLength={1} strokeDashoffset={1 - lp} strokeLinecap="round" />
            {lp > 0.97 && <polygon points={head(lx1, ly, -Math.PI / 2, 32)} fill={ac} />}
          </>
        )}
      </svg>
      {e.loop?.l && <div style={{position: 'absolute', left: Math.min(lx0, lx1), width: Math.abs(lx1 - lx0), top: bh + lb_ + loopH * 0.62, textAlign: 'center', opacity: clamp((lp - 0.6) * 3)}}>
        <Pill txt={e.loop.l} bg={TH.acc} ink={TH.accInk} size={34} style={{position: 'relative', display: 'inline-block'}} /></div>}
      {steps.map((s, i) => s.al && (
        <div key={`al${i}`} style={{position: 'absolute', left: i * (bw + gap) - gap - 60, width: gap + 120, top: bh / 2 - 66, textAlign: 'center', fontFamily: TH.f.body, fontWeight: fwOf(TH.f.body), fontSize: 26, color: TH.ink2, opacity: eout(prog(t, T(i) - 0.1, 0.3)), whiteSpace: 'nowrap', textShadow: glowTs(TH.ink2, 0.4)}}>{s.al}</div>
      ))}
      {steps.map((s, i) => {
        const p = eout(prog(t, T(i), 0.45)), lit = litOf(e.focus, t, i), size = s.size ?? e.ls ?? 60;
        if (p <= 0) return null;
        if (e.bare) return (
          <div key={i} style={{position: 'absolute', left: i * (bw + gap), top: 0, width: bw, height: bh, opacity: clamp(p * 2) * (0.45 + 0.55 * lit), transform: `translateY(${((1 - p) * 50).toFixed(1)}px) scale(${(lerp(0.85, 1, back(p)) * (1 + 0.06 * lit)).toFixed(4)})`, filter: lit < 0.99 ? `saturate(${(0.4 + 0.6 * lit).toFixed(2)})` : undefined}}>
            {s.img && <Img src={img(s.img)} style={{position: 'absolute', left: 0, top: 0, width: bw, height: bh, objectFit: 'contain', filter: propShadow(lit * 0.5)}} />}
            <div style={{position: 'absolute', left: bw / 2, top: bh + 14, transform: 'translateX(-50%)'}}><Pill txt={s.l} bg={(lit > 0.5 ? TH.acc : TH.light ? 'rgba(255,255,255,.88)' : 'rgba(10,10,16,.62)')} ink={(lit > 0.5 ? TH.accInk : TH.ink)} size={s.size ?? e.ls ?? 46} style={{position: 'relative'}} /></div>
            {s.s && <div style={{position: 'absolute', left: -60, right: -60, top: bh + 14 + (s.size ?? e.ls ?? 46) * 1.6, textAlign: 'center', fontFamily: TH.f.body, fontWeight: fwOf(TH.f.body), fontSize: s.ss ?? 30, color: TH.ink, whiteSpace: 'nowrap', textShadow: TH.light ? undefined : '0 2px 10px rgba(0,0,0,.7)'}}>{s.s}</div>}
          </div>
        );
        return (
          <div key={i} style={{position: 'absolute', left: i * (bw + gap), top: 0, opacity: clamp(p * 2), transform: `translateY(${((1 - p) * 50).toFixed(1)}px) scale(${((0.94 + 0.06 * p) * (1 + 0.04 * lit)).toFixed(4)})`}}>
            <CardBox w={bw} h={bh} lit={lit} seed={i * 29 + 5}>
              {e.num !== false && <div style={{position: 'absolute', left: 26, top: 18, fontFamily: TH.f.num, fontWeight: W900(TH.f.num), fontSize: 34, color: cSub(lit), opacity: 0.8}}>{String(i + 1).padStart(2, '0')}</div>}
              {s.icon && <CardIcon src={s.icon} lit={lit} style={{left: bw / 2 - bh * 0.2, top: bh * 0.12, height: bh * 0.36, width: bh * 0.4}} />}
              <div style={{position: 'absolute', left: 10, right: 10, top: s.icon ? bh * 0.5 : s.s ? bh * 0.26 : (bh - size * 1.1) / 2, textAlign: 'center', fontFamily: TH.f.card, fontWeight: W900(TH.f.card), fontSize: size, lineHeight: 1.1, color: cInk(lit), textShadow: cGlow(lit, size), whiteSpace: 'pre'}}>{s.l}</div>
              {s.s && <div style={{position: 'absolute', left: 10, right: 10, bottom: bh * 0.13, textAlign: 'center', fontFamily: TH.f.body, fontWeight: fwOf(TH.f.body), fontSize: s.ss ?? 28, color: cSub(lit), whiteSpace: 'nowrap'}}>{s.s}</div>}
            </CardBox>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- tree6: top-down breakdown (利润 = 收入 - 成本 ...)
// root: {l, s?, id?, op? (sign shown on the branch into this node), c: [children], t?}; focus [[t, idx | id]] (idx = depth-first order)
export const Tree6: React.FC<any> = ({e, t}) => {
  const bw = e.bw ?? 330, bh = e.bh ?? 160, gx = e.gx ?? 50, lv = e.lv ?? 300, ld = e.ld ?? 0.6, ac = e.ac ?? TH.ink2;
  type Nd = {n: any; x: number; y: number; d: number; par: number; k: number; t: number};
  const flat: Nd[] = [];
  let leaf = 0;
  const walk = (n: any, d: number, par: number, k: number): number => {
    const me = flat.length; flat.push({n, x: 0, y: d * lv, d, par, k, t: 0});
    const kids = (n.c ?? []) as any[];
    if (!kids.length) {flat[me].x = leaf * (bw + gx) + bw / 2; leaf += 1;}
    else {const xs = kids.map((c, j) => walk(c, d + 1, me, j)); flat[me].x = (flat[xs[0]].x + flat[xs[xs.length - 1]].x) / 2;}
    return me;
  };
  walk(e.root, 0, -1, 0);
  flat.forEach((f) => {f.t = f.n.t ?? e.t + f.d * ld + f.k * 0.12;});
  const ids: Record<string, number> = {}; flat.forEach((f, i) => {if (f.n.id) ids[f.n.id] = i;});
  const fs = fsIdx(e.focus, ids), depth = Math.max(...flat.map((f) => f.d));
  const W = leaf * (bw + gx) - gx, H = depth * lv + bh * 1.2;
  return (
    <div style={{position: 'relative', width: W, height: H}}>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {flat.map((f, i) => {
          if (f.par < 0) return null;
          const P = flat[f.par], pb = P.y + (P.d === 0 ? bh * 1.2 : bh), my = pb + (f.y - pb) / 2, q = eio(prog(t, f.t - 0.25, 0.35));
          if (q <= 0) return null;
          return <path key={i} d={`M${P.x} ${pb}L${P.x} ${my}L${f.x} ${my}L${f.x} ${f.y}`} fill="none" stroke={ac} strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} />;
        })}
      </svg>
      {flat.map((f, i) => {
        if (f.par < 0 || !f.n.op) return null;
        const P = flat[f.par], pb = P.y + (P.d === 0 ? bh * 1.2 : bh), my = pb + (f.y - pb) / 2, q = prog(t, f.t - 0.05, 0.35);
        return q > 0 && <div key={`op${i}`} style={{position: 'absolute', left: f.x - 30, top: my - 30, width: 60, height: 60, borderRadius: TH.card.r >= 4 ? '50%' : 0, background: TH.acc, color: TH.accInk, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: TH.f.num, fontWeight: W900(TH.f.num), fontSize: 44, lineHeight: 1, transform: `scale(${back(q).toFixed(3)})`, boxShadow: TERM ? '0 0 14px rgba(255,176,0,.6)' : undefined}}>{f.n.op}</div>;
      })}
      {flat.map((f, i) => {
        const p = eout(prog(t, f.t, 0.45)), lit = litOf(fs, t, i), root = f.d === 0, w = root ? bw * 1.25 : bw, h = root ? bh * 1.2 : bh;
        const size = f.n.size ?? (root ? 64 : f.d === 1 ? 52 : 44);
        if (p <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: f.x - w / 2, top: f.y, opacity: clamp(p * 2), transform: `translateY(${((1 - p) * -30).toFixed(1)}px) scale(${(1 + 0.04 * lit).toFixed(4)})`}}>
            <CardBox w={w} h={h} lit={lit} seed={i * 23 + 11}>
              {f.n.icon && <CardIcon src={f.n.icon} lit={lit} style={{left: 14, top: h * 0.12, height: h * 0.76, width: h * 0.76}} />}
              <div style={{position: 'absolute', left: f.n.icon ? h * 0.82 : 10, right: 10, top: f.n.s ? h * 0.2 : (h - size * 1.1) / 2, textAlign: 'center', fontFamily: TH.f.card, fontWeight: W900(TH.f.card), fontSize: size, lineHeight: 1.1, color: cInk(lit), textShadow: cGlow(lit, size), whiteSpace: 'pre'}}>{f.n.l}</div>
              {f.n.s && <div style={{position: 'absolute', left: 10, right: 10, bottom: h * 0.14, textAlign: 'center', fontFamily: TH.f.body, fontWeight: fwOf(TH.f.body), fontSize: f.n.ss ?? 26, color: cSub(lit), whiteSpace: 'nowrap'}}>{f.n.s}</div>}
            </CardBox>
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- map6: world map (Natural Earth 1:110m, public domain), schematic only
// view: [lon0, lat0, lon1, lat1]; hi: [{id: 'USA', t?, c?, l?, at?: [lon, lat]}] country fills by ISO 3166 alpha-3;
// pts: [{lon, lat, l?, t?, side?: 'r'|'l'|'t'|'b'}]; routes: [{a: [lon, lat], b: [lon, lat], t?, d?, bend?, l?, c?, flow?}]
// surface: 'paper' (chart paper with title) | 'none' (land drawn straight on the background)
const MAPC0: any = {
  finance: ['#d9cdb8', '#f6efe0', '#5b3a63', '#c8574d'], press: ['#cdbf9f', '#efe6cf', '#c23a2d', '#1b1a18'],
  blueprint: ['#c9d6e6', '#f4f5f2', '#123a6b', '#ff7a1a'], terminal: ['rgba(51,255,136,.2)', 'rgba(51,255,136,.55)', '#ffb000', '#ffb000'],
  desk: ['#dedad2', '#fbfaf6', '#e2543f', '#2f5d8a'], editorial: ['#e4e3de', '#fbfaf7', '#1f3fd1', '#111114'],
};
const Wd: any = WORLD;
const RD = (r: any) => r.d ?? (r.vehicle ? 2.4 : 0.9);
const ne1 = (lon: number, lat: number) => {
  const l = (lon * Math.PI) / 180, p = (lat * Math.PI) / 180, p2 = p * p, p4 = p2 * p2;
  const x = l * (0.8707 - 0.131979 * p2 + p4 * (-0.013791 + p4 * (0.003971 * p2 - 0.001529 * p4)));
  const y = p * (1.007226 + p2 * (0.015085 + p4 * (-0.044475 + 0.028874 * p2 - 0.005916 * p4)));
  return [Wd.ox + x * Wd.S, Wd.oy - y * Wd.S];
};
export const Map6: React.FC<any> = ({e, t}) => {
  const surf = (e.surface ?? 'paper') === 'paper', mc = TH.mapc ?? MAPC0[TH.name] ?? MAPC0.finance;
  const land = surf ? mc[0] : TH.light ? 'rgba(17,17,20,.13)' : 'rgba(255,255,255,.17)', edge = surf ? mc[1] : TH.light ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.35)';
  const hiC = surf ? mc[2] : TH.acc, route = surf ? mc[3] : TH.ink;
  const [lo0, la0, lo1, la1] = e.view ?? [-180, -58, 180, 85];
  let vx = 1e9, vy = 1e9, vX = -1e9, vY = -1e9;
  for (let k = 0; k <= 24; k++) for (const [lo, la] of [[lerp(lo0, lo1, k / 24), la0], [lerp(lo0, lo1, k / 24), la1], [lo0, lerp(la0, la1, k / 24)], [lo1, lerp(la0, la1, k / 24)]]) {
    const [x, y] = ne1(lo, la); vx = Math.min(vx, x); vy = Math.min(vy, y); vX = Math.max(vX, x); vY = Math.max(vY, y);
  }
  const vw = vX - vx, vh = vY - vy, w = e.w ?? 1700;
  const t0 = e.t + (e.bt ?? 0.3);
  const body = (top: number, W: number, Hh: number) => {
    const pad = surf ? 50 : 0, aw = W - pad * 2, ah = Hh - top - (surf ? (e.src ? 90 : 50) : 0), k = Math.min(aw / vw, ah / vh);
    const ox = pad + (aw - vw * k) / 2, oy = top + (ah - vh * k) / 2;
    const P = (lon: number, lat: number) => {const [x, y] = ne1(lon, lat); return [ox + (x - vx) * k, oy + (y - vy) * k];};
    const pin = (p: any, i: number) => {
      const [x, y] = P(p.lon, p.lat), q = prog(t, p.t ?? t0 + 0.6 + i * 0.25, 0.4), side = p.side ?? 'r';
      if (q <= 0) return null;
      const c = p.c ?? hot(), ring = 1 + ((t - (p.t ?? t0)) % 1.6) / 1.6;
      if (p.img) {
        const iw = p.iw ?? 130, trI = side === 'r' ? `translate(${iw * 0.45}px,-50%)` : side === 'l' ? `translate(calc(-100% - ${iw * 0.45}px),-50%)` : side === 't' ? `translate(-50%,calc(-100% - ${iw * 0.95}px))` : 'translate(-50%,22px)';
        return (
          <React.Fragment key={`p${i}`}>
            <div style={{position: 'absolute', left: x - iw / 2, top: y - iw * 0.9, width: iw, height: iw, transform: `scale(${back(q).toFixed(3)})`, transformOrigin: '50% 90%', zIndex: 2}}><Img src={img(p.img)} style={{width: iw, height: iw, objectFit: 'contain', filter: propShadow(0)}} /></div>
            {p.l && <div style={{position: 'absolute', left: x, top: y, transform: trI, opacity: clamp(q * 2), zIndex: 3}}><Pill txt={p.l} bg={c} ink={onHot()} size={p.size ?? 34} style={{position: 'relative'}} /></div>}
          </React.Fragment>
        );
      }
      const tr = side === 'r' ? 'translate(28px,-50%)' : side === 'l' ? 'translate(calc(-100% - 28px),-50%)' : side === 't' ? 'translate(-50%,calc(-100% - 26px))' : 'translate(-50%,26px)';
      return (
        <React.Fragment key={`p${i}`}>
          <div style={{position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: '50%', border: `3px solid ${c}`, opacity: (1 - (ring - 1)) * 0.8 * clamp(q * 2), transform: `scale(${ring.toFixed(3)})`}} />
          <div style={{position: 'absolute', left: x - 13, top: y - 13, width: 26, height: 26, borderRadius: '50%', background: c, border: `5px solid ${surf ? paperBase() : '#ffffff'}`, transform: `scale(${back(q).toFixed(3)})`}} />
          {p.l && <div style={{position: 'absolute', left: x, top: y, transform: tr, opacity: clamp(q * 2)}}><Pill txt={p.l} bg={c} ink={onHot()} size={p.size ?? 34} style={{position: 'relative'}} /></div>}
        </React.Fragment>
      );
    };
    return (
      <>
        <svg width={vw * k} height={vh * k} viewBox={`${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`} style={{position: 'absolute', left: ox, top: oy, filter: TERM ? 'drop-shadow(0 0 4px rgba(51,255,136,.5))' : undefined}}>
          {Object.entries(Wd.c).map(([iso, d]: any) => <path key={iso} d={d} fill={land} stroke={edge} strokeWidth={1.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />)}
          {(e.hi ?? []).map((hh: any, i: number) => {
            const H = typeof hh === 'string' ? {id: hh} : hh, q = eout(prog(t, H.t ?? t0 + 0.2 + i * 0.15, 0.5)), d = Wd.c[H.id];
            return d && <path key={`h${i}`} d={d} fill={H.c ?? hiC} opacity={q} stroke={edge} strokeWidth={1.4} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />;
          })}
        </svg>
        <svg width={W} height={Hh} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {(e.routes ?? []).map((r: any, i: number) => {
            const [ax, ay] = P(r.a[0], r.a[1]), [bx, by] = P(r.b[0], r.b[1]), Q = quad(ax, ay, bx, by, r.bend ?? -0.22);
            const tr = r.t ?? t0 + 0.8 + i * 0.35, q = eio(prog(t, tr, RD(r))), c = r.c ?? route;
            if (q <= 0) return null;
            const flow = r.flow && q >= 1 ? [0, 1, 2].map((j) => Q.at(((t - tr - (RD(r))) * 0.45 + j / 3) % 1)) : [];
            return (
              <g key={i}>
                <path d={Q.d} fill="none" stroke={c} strokeWidth={r.w ?? 6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} style={{filter: TERM ? `drop-shadow(0 0 6px ${alpha(c, 0.8)})` : undefined}} />
                {q > 0.97 && (!r.vehicle || r.vehicle.stay || t > tr + RD(r) + 0.3) && <polygon points={head(bx, by, Q.ang(1), 30)} fill={c} />}
                {flow.map(([x, y], j) => <circle key={j} cx={x} cy={y} r={9} fill={hot()} stroke={surf ? paperBase() : '#fff'} strokeWidth={3} />)}
              </g>
            );
          })}
        </svg>
        {(e.routes ?? []).map((r: any, i: number) => {
          if (!r.vehicle) return null;
          const V = typeof r.vehicle === 'string' ? {src: r.vehicle} : r.vehicle, [ax, ay] = P(r.a[0], r.a[1]), [bx, by] = P(r.b[0], r.b[1]), Q = quad(ax, ay, bx, by, r.bend ?? -0.22);
          const tr = r.t ?? t0 + 0.8 + i * 0.35, d = RD(r);
          if (t < tr) return null;
          let u = eio(prog(t, tr, d));
          if (V.loop && t > tr + d) u = ((t - tr - d) * (V.sp ?? 0.22)) % 1;
          const [x, y] = Q.at(u), vw = V.w ?? 150;
          let a = Q.ang(u); const fl = Math.cos(a) < 0; if (fl) a -= Math.PI;
          while (a < -Math.PI) a += 2 * Math.PI; while (a > Math.PI) a -= 2 * Math.PI;
          const rot = (a * 180 / Math.PI) * (V.orient ?? 0.5) + Math.sin(t * 2.4 + i) * 2.5;
          return <div key={`v${i}`} style={{position: 'absolute', left: x - vw / 2, top: y - vw * (V.ay ?? 0.6), width: vw, height: vw, opacity: clamp((t - tr) / 0.3) * (V.stay ? 1 : 1 - prog(t, tr + d, 0.5)), transform: `rotate(${rot.toFixed(2)}deg) scaleX(${fl ? -1 : 1})`, transformOrigin: '50% 60%', zIndex: 3}}>
            <Img src={img(V.src)} style={{width: vw, height: vw, objectFit: 'contain', filter: propShadow(0)}} /></div>;
        })}
        {(e.routes ?? []).map((r: any, i: number) => {
          if (!r.l) return null;
          const [ax, ay] = P(r.a[0], r.a[1]), [bx, by] = P(r.b[0], r.b[1]), [mx, my] = quad(ax, ay, bx, by, r.bend ?? -0.22).at(0.5), q = prog(t, (r.t ?? t0 + 0.8 + i * 0.35) + (RD(r)) * 0.6, 0.4);
          return q > 0 && <div key={`rl${i}`} style={{position: 'absolute', left: mx, top: my, transform: `translate(-50%,-50%) scale(${back(q).toFixed(3)})`}}><Pill txt={r.l} bg={TH.acc} ink={TH.accInk} size={30} style={{position: 'relative'}} /></div>;
        })}
        {(e.hi ?? []).map((hh: any, i: number) => {
          if (typeof hh === 'string' || !hh.l || !hh.at) return null;
          const [x, y] = P(hh.at[0], hh.at[1]), q = prog(t, (hh.t ?? t0 + 0.2 + i * 0.15) + 0.3, 0.4);
          return q > 0 && <div key={`hl${i}`} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${back(q).toFixed(3)})`}}><Pill txt={hh.l} bg={hh.c ?? hiC} ink={onHot()} size={hh.size ?? 36} style={{position: 'relative'}} /></div>;
        })}
        {(e.pts ?? []).map(pin)}
      </>
    );
  };
  if (!surf) {const h = e.h ?? Math.round((w * vh) / vw); return <div style={{position: 'relative', width: w, height: h}}>{body(0, w, h)}</div>;}
  const h = e.h ?? 940;
  return <Surface e={e} w={w} h={h}>{(top) => body(top - 20, w, h)}</Surface>;
};

// ---------------------------------------------------------------- vs6: two cards side by side, VS badge, points appear one by one
// a / b: {l, v?, u?, s?, flag?, icon?, pts?: [str | {s, t}], t?}; focus [[t, 0|1]]
export const Vs6: React.FC<any> = ({e, t}) => {
  const w = e.w ?? 1720, h = e.h ?? 820, gap = e.gap ?? 150, cw = (w - gap) / 2, sides = [e.a, e.b];
  const vq = prog(t, e.t + 0.35, 0.45), round = TH.card.r >= 4;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {sides.map((S: any, k: number) => {
        const ts = S.t ?? e.t + k * 0.25, p = eout(prog(t, ts, 0.5)), lit = e.focus ? litOf(e.focus, t, k) : 1;
        const pts = (S.pts ?? []).map((x: any, j: number) => (typeof x === 'string' ? {s: x, t: ts + 0.5 + j * 0.3} : {t: ts + 0.5 + j * 0.3, ...x}));
        const ls = S.ls ?? 64, vs = S.vs ?? 170;
        if (p <= 0) return null;
        return (
          <div key={k} style={{position: 'absolute', left: k * (cw + gap), top: 0, opacity: clamp(p * 2), transform: `translateX(${((1 - p) * (k ? 80 : -80)).toFixed(1)}px) scale(${(1 + 0.03 * lit).toFixed(4)})`}}>
            <CardBox w={cw} h={h} lit={lit} seed={k * 31 + 7}>
              <div style={{position: 'absolute', left: 64, right: 50, top: 60, display: 'flex', alignItems: 'center', gap: 24}}>
                {S.flag && <div style={{flex: 'none', boxShadow: '0 4px 10px rgba(0,0,0,.25)'}}><FlagSvg c={S.flag} w={96} /></div>}
                {S.icon && <Img src={img(S.icon)} style={{height: ls * 1.3, objectFit: 'contain'}} />}
                <div style={{fontFamily: TH.f.card, fontWeight: W900(TH.f.card), fontSize: ls, lineHeight: 1.1, color: cInk(lit), textShadow: cGlow(lit, ls), whiteSpace: 'nowrap'}}>{S.l}</div>
              </div>
              {S.pic && <Img src={img(S.pic)} style={{position: 'absolute', right: 30, top: 34, width: cw * 0.44, height: h * 0.5, objectFit: 'contain', filter: propShadow(lit * 0.5)}} />}
              {S.row && Array.from({length: S.row.n}, (_, j) => {
                const R_ = S.row, iw = R_.iw ?? 84, stepx = Math.min(iw * 0.9, (cw - 128 - iw) / Math.max(1, R_.n - 1)), q = prog(t, (R_.t ?? ts + 0.6) + j * (R_.dt ?? 0.07), 0.3);
                return q > 0 && <Img key={`r${j}`} src={img(R_.src)} style={{position: 'absolute', left: 64 + j * stepx, top: h - iw - 44, width: iw, height: iw, objectFit: 'contain', opacity: clamp(q * 3), transform: `translateY(${((1 - eout(q)) * -60).toFixed(1)}px) scale(${lerp(0.6, 1, back(q)).toFixed(3)})`, filter: propShadow(0)}} />;
              })}
              {S.v != null && (
                <div style={{position: 'absolute', left: 60, right: 40, top: 60 + ls * 1.5, whiteSpace: 'nowrap', color: cInk(lit), textShadow: cGlow(lit, vs * 0.6)}}>
                  <span style={{fontFamily: TH.f.num, fontWeight: W900(TH.f.num), fontSize: vs, lineHeight: 1.05, letterSpacing: TH.num?.ls ? TH.num.ls / 3 : 0}}>{S.v}</span>
                  {S.u && <span style={{marginLeft: 14, fontFamily: TH.f.card, fontWeight: W900(TH.f.card), fontSize: vs * 0.32}}>{S.u}</span>}
                </div>
              )}
              {S.s && <div style={{position: 'absolute', left: 64, right: 40, top: 60 + ls * 1.5 + (S.v != null ? vs * 1.12 : 0), fontFamily: TH.f.body, fontWeight: fwOf(TH.f.body), fontSize: 30, color: cSub(lit), whiteSpace: 'nowrap'}}>{S.s}</div>}
              <div style={{position: 'absolute', left: 64, right: 64, top: h * 0.6 - 30, height: 3, background: cInk(lit, 0.22)}} />
              {pts.map((x: any, j: number) => {
                const q = eout(prog(t, x.t, 0.4));
                return q > 0 && <div key={j} style={{position: 'absolute', left: 64, right: 40, top: h * 0.6 + j * 74, opacity: q, transform: `translateX(${((1 - q) * 24).toFixed(1)}px)`, fontFamily: TH.f.body, fontWeight: fwOf(TH.f.body), fontSize: x.size ?? 38, color: cInk(lit, 0.9), whiteSpace: 'nowrap'}}>
                  <span style={{color: lit > 0.5 && !TH.card.lit?.background?.startsWith?.('#ffb000') ? cInk(lit) : TH.acc, marginRight: 14}}>{TH.name === 'terminal' ? '>' : '—'}</span>{x.s}</div>;
              })}
            </CardBox>
          </div>
        );
      })}
      {vq > 0 && <div style={{position: 'absolute', left: w / 2 - 85, top: h / 2 - 85, width: 170, height: 170, borderRadius: round ? '50%' : 0, background: TH.acc, color: TH.accInk, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: TH.f.num, fontWeight: W900(TH.f.num), fontSize: 72, letterSpacing: 2, transform: `scale(${back(vq).toFixed(3)}) rotate(${round ? -8 : 0}deg)`, boxShadow: TERM ? '0 0 30px rgba(255,176,0,.6)' : TH.card.flat ? 'none' : '0 16px 36px rgba(0,0,0,.4)', zIndex: 2}}>{e.vs ?? 'VS'}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- graph6: nodes + labelled arrows (ownership, money flows, alliances)
// nodes: [{id, l, s?, x, y (centre, local px), w?, h?, round?, d?, logo?, flag?, icon?, t?, size?}];
// edges: [{a, b, l?, t?, d?, bend?, two?, flow?, c?}]; focus [[t, id | idx]]
export const Graph6: React.FC<any> = ({e, t}) => {
  const nodes = e.nodes as any[], w = e.w ?? 1800, h = e.h ?? 900, ac = e.ac ?? TH.ink2;
  const ids: Record<string, number> = {}; nodes.forEach((n, i) => {ids[n.id ?? String(i)] = i;});
  const fs = fsIdx(e.focus, ids);
  const geo = nodes.map((n) => {if (n.img) {const d = n.iw ?? 240; return {round: true, w: d, h: d, bare: true};} const round = !!n.round, d = n.d ?? 220; return {round, w: round ? d : n.w ?? 320, h: round ? d : n.h ?? 150};});
  // mv: [[t, x, y, d?], ...] moves a node; edges follow
  const pos = (i: number) => {const n = nodes[i]; let x = n.x, y = n.y; for (const [mt, mx, my, md] of n.mv ?? []) {const q = eio(prog(t, mt, md ?? 0.8)); x = lerp(x, mx, q); y = lerp(y, my, q);} return [x, y];};
  const T = (i: number) => nodes[i].t ?? e.t + i * 0.3;
  const exitOf = (i: number, dx: number, dy: number) => {
    const g = geo[i], L = Math.hypot(dx, dy) || 1;
    if (g.round) return (g.w / 2 + 12) / L;
    return Math.min((g.w / 2 + 12) / Math.max(1e-6, Math.abs(dx)), (g.h / 2 + 12) / Math.max(1e-6, Math.abs(dy)));
  };
  const edges = (e.edges ?? []).map((ed: any, k: number) => {
    const [Ax, Ay] = pos(ids[ed.a]), [Bx, By] = pos(ids[ed.b]), dx = Bx - Ax, dy = By - Ay;
    const sa = exitOf(ids[ed.a], dx, dy), sb = exitOf(ids[ed.b], dx, dy);
    const Q = quad(Ax + dx * sa, Ay + dy * sa, Bx - dx * sb, By - dy * sb, ed.bend ?? 0);
    const te = ed.t ?? Math.max(T(ids[ed.a]), T(ids[ed.b])) + 0.3 + k * 0.1;
    return {ed, Q, te, q: eio(prog(t, te, ed.d ?? 0.6)), c: ed.c ?? ac};
  });
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {edges.map(({ed, Q, te, q, c}: any, k: number) => {
          if (q <= 0) return null;
          const flow = ed.flow && q >= 1 ? [0, 1, 2].map((j) => Q.at(((t - te - (ed.d ?? 0.6)) * 0.5 + j / 3) % 1)) : [];
          return (
            <g key={k}>
              <path d={Q.d} fill="none" stroke={c} strokeWidth={ed.w ?? 6} strokeDasharray={ed.dash ? '14 12' : '1 1'} pathLength={ed.dash ? undefined : 1} strokeDashoffset={ed.dash ? 0 : 1 - q} opacity={ed.dash ? q : 1} strokeLinecap="round" />
              {q > 0.95 && <polygon points={head(...(Q.at(1) as [number, number]), Q.ang(1), 30)} fill={c} />}
              {q > 0.95 && ed.two && <polygon points={head(...(Q.at(0) as [number, number]), Q.ang(0) + Math.PI, 30)} fill={c} />}
              {flow.map(([x, y], j) => ed.dot ? <image key={j} href={img(ed.dot)} x={x - (ed.dw ?? 64) / 2} y={y - (ed.dw ?? 64) / 2} width={ed.dw ?? 64} height={ed.dw ?? 64} style={{filter: propShadow(0)}} />
                : <circle key={j} cx={x} cy={y} r={10} fill={TH.acc} stroke={TH.light ? '#ffffff' : 'rgba(0,0,0,.5)'} strokeWidth={3} />)}
            </g>
          );
        })}
      </svg>
      {edges.map(({ed, Q, te}: any, k: number) => {
        if (!ed.l) return null;
        const [x, y] = Q.at(0.5), q = prog(t, te + (ed.d ?? 0.6) * 0.6, 0.4);
        return q > 0 && <div key={`l${k}`} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${back(q).toFixed(3)})`, zIndex: 3}}><Pill txt={ed.l} bg={TH.acc} ink={TH.accInk} size={ed.size ?? 32} style={{position: 'relative'}} /></div>;
      })}
      {nodes.map((n, i) => {
        const g = geo[i], p = eout(prog(t, T(i), 0.45)), lit = litOf(fs, t, i), size = n.size ?? (g.round ? g.w * 0.2 : 50);
        if (p <= 0) return null;
        const media = n.logo || n.icon || n.flag, mh = g.h * (g.round ? 0.34 : 0.4), [nx, ny] = pos(i);
        if (g.bare) return (
          <div key={i} style={{position: 'absolute', left: nx - g.w / 2, top: ny - g.h / 2, width: g.w, height: g.h, opacity: clamp(p * 2) * (0.45 + 0.55 * lit), transform: `scale(${((0.8 + 0.2 * back(p)) * (1 + 0.06 * lit)).toFixed(4)})`, zIndex: 2, filter: lit < 0.99 ? `saturate(${(0.4 + 0.6 * lit).toFixed(2)})` : undefined}}>
            <Img src={img(n.img)} style={{width: g.w, height: g.h, objectFit: 'contain', filter: propShadow(lit * 0.5)}} />
            {n.l && <div style={{position: 'absolute', left: g.w / 2, top: g.h - 4, transform: 'translateX(-50%)'}}><Pill txt={n.l} bg={(lit > 0.5 ? TH.acc : TH.light ? 'rgba(255,255,255,.88)' : 'rgba(10,10,16,.62)')} ink={(lit > 0.5 ? TH.accInk : TH.ink)} size={n.size ?? 36} style={{position: 'relative'}} /></div>}
          </div>
        );
        return (
          <div key={i} style={{position: 'absolute', left: nx - g.w / 2, top: ny - g.h / 2, opacity: clamp(p * 2), transform: `scale(${((0.85 + 0.15 * back(p)) * (1 + 0.05 * lit)).toFixed(4)})`, zIndex: 2}}>
            <CardBox w={g.w} h={g.h} lit={lit} seed={i * 19 + 7} round={g.round}>
              {(n.logo || n.icon) && <Img src={img(n.logo ?? n.icon)} style={{position: 'absolute', left: g.w / 2 - mh, width: mh * 2, top: g.h * (g.round ? 0.16 : 0.1), height: mh, objectFit: 'contain', filter: n.icon ? iconFx(TH.card.icon, lit)?.filter : undefined}} />}
              {n.flag && <div style={{position: 'absolute', left: g.w / 2 - mh * 0.75, top: g.h * (g.round ? 0.18 : 0.12)}}><FlagSvg c={n.flag} w={mh * 1.5} /></div>}
              <div style={{position: 'absolute', left: 8, right: 8, top: media ? g.h * (g.round ? 0.54 : 0.55) : n.s ? g.h * 0.24 : (g.h - size * 1.1) / 2, textAlign: 'center', fontFamily: TH.f.card, fontWeight: W900(TH.f.card), fontSize: media ? size * 0.82 : size, lineHeight: 1.1, color: cInk(lit), textShadow: cGlow(lit, size), whiteSpace: 'pre'}}>{n.l}</div>
              {n.s && !media && <div style={{position: 'absolute', left: 8, right: 8, bottom: g.h * 0.16, textAlign: 'center', fontFamily: TH.f.body, fontWeight: fwOf(TH.f.body), fontSize: n.ss ?? 26, color: cSub(lit), whiteSpace: 'nowrap'}}>{n.s}</div>}
            </CardBox>
          </div>
        );
      })}
    </div>
  );
};

export const ELS7: any = {line6: Line6, timeline6: Timeline6, pie6: Pie6, flow6: Flow6, tree6: Tree6, map6: Map6, vs6: Vs6, graph6: Graph6};
void EN; void F;
