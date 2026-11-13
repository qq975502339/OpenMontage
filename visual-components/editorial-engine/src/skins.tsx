// Theme skins: title / chapter / end cards per theme, plus small material parts
// (torn paper edges, masking tape, push pins, ruled index cards, icon treatments, the CRT overlay).
// Every title component reads the same props as TitleCard: l1, l2, l2b, q, slam, s1, s2, s2b. A chapter card is l1=''.
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {back, clamp, eio, eout, img, lerp, prog, rnd} from './lib';
import {TH, tx} from './theme';

const A = (s: any) => Array.from(String(s ?? ''));
export const typed = (s: string, t: number, t0: number, cps = 9) => {const n = Math.floor(clamp((t - t0) * cps, 0, A(s).length)); return t < t0 ? '' : A(s).slice(0, n).join('');};

// ---------------------------------------------------------------- material parts
// torn paper outline (px), inward only so the piece never grows past its box
export const torn = (seed: number, w: number, h: number, a = 7, step = 22) => {
  const r = rnd(seed), j = () => Math.abs((r() - 0.5) * 2 * a), P: string[] = [];
  for (let x = 0; x <= w; x += step) P.push(`${Math.min(x, w).toFixed(0)}px ${j().toFixed(1)}px`);
  for (let y = step; y <= h; y += step) P.push(`${(w - j()).toFixed(1)}px ${Math.min(y, h).toFixed(0)}px`);
  for (let x = w - step; x >= 0; x -= step) P.push(`${Math.max(x, 0).toFixed(0)}px ${(h - j()).toFixed(1)}px`);
  for (let y = h - step; y > 0; y -= step) P.push(`${j().toFixed(1)}px ${Math.max(y, 0).toFixed(0)}px`);
  return `polygon(${P.join(',')})`;
};
// the same in percentages, for pieces whose size is set by their content
export const tornPct = (seed: number, a = 1.2, n = 44) => {
  const r = rnd(seed), j = () => Math.abs((r() - 0.5) * 2 * a), P: string[] = [], k = 100 / n;
  for (let i = 0; i <= n; i++) P.push(`${(i * k).toFixed(2)}% ${j().toFixed(2)}%`);
  for (let i = 1; i <= n; i++) P.push(`${(100 - j()).toFixed(2)}% ${(i * k).toFixed(2)}%`);
  for (let i = n - 1; i >= 0; i--) P.push(`${(i * k).toFixed(2)}% ${(100 - j()).toFixed(2)}%`);
  for (let i = n - 1; i > 0; i--) P.push(`${j().toFixed(2)}% ${(i * k).toFixed(2)}%`);
  return `polygon(${P.join(',')})`;
};
const zig = (w: number, h: number, d = 6, n = 7) => {
  const L: string[] = [], R: string[] = [];
  for (let i = 0; i <= n; i++) {const y = (h * i) / n; L.push(`${i % 2 ? d : 0}px ${y.toFixed(1)}px`); R.push(`${w - (i % 2 ? d : 0)}px ${y.toFixed(1)}px`);}
  return `polygon(${[...R, ...L.reverse()].join(',')})`;
};
export const Tape: React.FC<{w?: number; h?: number; rot?: number; style?: any}> = ({w = 170, h = 48, rot = -4, style}) => (
  <div style={{position: 'absolute', width: w, height: h, transform: `rotate(${rot}deg)`, ...tx('#e6d9b2', 'tex/newsprint.jpg'), opacity: 0.8,
    clipPath: zig(w, h), boxShadow: '0 1px 2px rgba(0,0,0,.18)', ...style}} />
);
export const Pin: React.FC<{c?: string; s?: number; style?: any}> = ({c = '#ff7a1a', s = 40, style}) => (
  <div style={{position: 'absolute', width: s, height: s, borderRadius: '50%', zIndex: 3,
    background: `radial-gradient(circle at 34% 30%, #ffe0c8 0 10%, ${c} 40%, #a8430a 100%)`,
    boxShadow: `${s * 0.18}px ${s * 0.32}px ${s * 0.32}px rgba(0,0,0,.45), 0 1px 2px rgba(0,0,0,.4)`, ...style}} />
);
// index-card rules: red header line + blue body lines (an overlay layer, multiply)
export const Ruled: React.FC<{lh?: number; top?: number}> = ({lh = 64, top = 120}) => (
  <div style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', pointerEvents: 'none',
    backgroundImage: `linear-gradient(180deg, transparent ${top - 3}px, rgba(214,82,70,.55) ${top - 3}px, rgba(214,82,70,.55) ${top}px, transparent ${top}px), repeating-linear-gradient(180deg, transparent 0 ${lh - 2}px, rgba(80,130,200,.30) ${lh - 2}px ${lh}px)`,
    backgroundSize: `100% 100%, 100% calc(100% - ${top}px)`, backgroundPosition: `0 0, 0 ${top}px`, backgroundRepeat: 'no-repeat'}} />
);
// how a 2.5D icon sits on each theme's surface
export const iconFx = (kind: string | undefined, lit: number): any => {
  switch (kind) {
    case 'print': return {filter: `grayscale(1) contrast(1.4) brightness(${(0.92 + 0.12 * lit).toFixed(2)})`, mixBlendMode: 'multiply'};
    case 'ink': return lit > 0.5 ? {filter: 'grayscale(1) contrast(1.3) brightness(.7)', mixBlendMode: 'multiply'} : {filter: 'grayscale(1) invert(1) brightness(1.4)', mixBlendMode: 'screen'};
    case 'phosphor': return lit > 0.5 ? {filter: 'grayscale(1) contrast(1.6) brightness(.35)', mixBlendMode: 'multiply'} : {filter: 'grayscale(1) sepia(1) saturate(6) hue-rotate(70deg) brightness(1.15) drop-shadow(0 0 10px rgba(51,255,136,.55))'};
    case 'flat': return {filter: 'drop-shadow(0 8px 10px rgba(0,0,0,.12))'};
    case 'sticker': return {filter: 'drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 8px 10px rgba(0,0,0,.28))'};
    default: return null;
  }
};
// realistic paper-on-desk shadow (contact + ambient)
export const deskShadow = (lift = 0) => `0 1px 2px rgba(0,0,0,.28), 0 ${(10 + 20 * lift).toFixed(0)}px ${(20 + 40 * lift).toFixed(0)}px rgba(0,0,0,${(0.3 - 0.1 * lift).toFixed(2)}), 0 ${(28 + 30 * lift).toFixed(0)}px ${(70 + 40 * lift).toFixed(0)}px rgba(0,0,0,.2)`;
export const phosphorTs = (rgb: string, k = 1) => `0 0 ${(5 * k).toFixed(0)}px rgba(${rgb},.9), 0 0 ${(22 * k).toFixed(0)}px rgba(${rgb},.45)`;

// ---------------------------------------------------------------- CRT overlay (terminal): scanlines, flicker, glass glare, bezel on top of the content
export const CrtFx: React.FC<{sc: any; t: number}> = ({sc, t}) => {
  if (!TH.crt) return null;
  const bt = sc.bg?.type;
  if (!bt || bt === 'none' || bt === 'broll') return null;
  const plate = typeof sc.bg.plate === 'string' ? sc.bg.plate : bt === 'paper' ? TH.paperPlate : bt === 'title' ? TH.titlePlate : bt === 'end' ? TH.endPlate : TH.plates[(sc.bg.v || 0) % TH.plates.length];
  const bez = TH.bezel?.[plate];
  const fl = 0.5 + 0.5 * Math.sin(t * 41) * Math.sin(t * 7.3);
  return (
    <AbsoluteFill style={{zIndex: 6, pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(180deg, rgba(0,0,0,.34) 0 2px, rgba(0,0,0,0) 2px 5px)', mixBlendMode: 'multiply', opacity: 0.55}} />
      <AbsoluteFill style={{background: `rgba(255,255,255,${(0.01 + 0.012 * fl).toFixed(3)})`, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 50% at 26% 16%, rgba(255,255,255,.07), rgba(255,255,255,0) 70%)', mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,.42) 100%)'}} />
      {bez && <Img src={img(bez)} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- title helpers
const fit = (parts: [number, number][], maxW: number) => {const w = parts.reduce((a, [n, s]) => a + n * s, 0); return w > maxW ? maxW / w : 1;};
const Cursor: React.FC<{t: number; on: boolean; s: number; c: string}> = ({t, on, s, c}) => (
  <span style={{display: 'inline-block', width: s * 0.5, height: s * 0.82, marginLeft: s * 0.06, background: c, verticalAlign: 'baseline', transform: `translateY(${s * 0.1}px)`,
    opacity: on || Math.floor(t * 2.4) % 2 === 0 ? 1 : 0, boxShadow: `0 0 18px ${c}`}} />
);

// 报刊: black serif letterpress stamped onto the cream strip of the plate, vermilion rule wipes in under the headline
const PressHead: React.FC<{rows: {txt: string; s: number; c?: string; t0: number}[]; t: number; bar?: number; cy?: number}> = ({rows, t, bar, cy = 540}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: cy, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {rows.map((r, k) => (
      <div key={k} style={{position: 'relative', display: 'flex', alignItems: 'flex-end', marginTop: k ? r.s * 0.04 : 0}}>
        {A(r.txt).map((c, i) => {
          const p = prog(t, r.t0 + i * 0.055, 0.2), q = rnd(k * 31 + i * 7 + 3)();
          const col = r.c ?? (c === '？' || c === '?' ? '#c23a2d' : '#1b1a18');
          return <span key={i} style={{display: 'inline-block', fontFamily: TH.f.title, fontWeight: 900, fontSize: r.s, lineHeight: 1.06, color: col, opacity: clamp(p * 3),
            transform: `scale(${lerp(1.45, 1, eout(p)).toFixed(3)}) rotate(${((q - 0.5) * 3).toFixed(2)}deg)`}}>{c}</span>;
        })}
        {bar != null && k === rows.length - 1 && <div style={{position: 'absolute', left: -10, bottom: -r.s * 0.2, height: Math.max(14, r.s * 0.12), width: `calc(${(bar * 100).toFixed(1)}% + 20px)`, background: '#d9483b', clipPath: torn(9, 1400, 30, 3, 14)}} />}
      </div>
    ))}
  </div>
);
const TitlePress: React.FC<any> = ({e, t}) => {
  const ch = !e.l1, slam = e.t + (ch ? 0.05 : e.slam ?? 0.55);
  const l2 = (e.l2 ?? '') + (e.l2b ?? '') + (e.q ?? '');
  const s2 = ch ? 160 : 210, k = fit([[A(l2).length, s2]], 1300);
  const rows = ch ? [{txt: e.l2, s: s2 * k, t0: slam}] : [{txt: e.l1, s: 110, t0: e.t}, {txt: l2, s: s2 * k, t0: slam}];
  return <AbsoluteFill><PressHead rows={rows} t={t} bar={eio(prog(t, slam + A(l2).length * 0.055 + 0.1, 0.45))} /></AbsoluteFill>;
};

// 蓝图: left-aligned white type revealed like a pen stroke, orange dimension line, construction corners
const DimLine: React.FC<{w: number; p: number; c?: string}> = ({w, p, c = '#ff7a1a'}) => {
  const a = (w / 2) * (1 - p), b = (w / 2) * (1 + p);
  return (
    <svg width={w + 4} height={56} style={{overflow: 'visible', display: 'block'}}>
      <g stroke={c} strokeWidth="3" fill="none" opacity={clamp(p * 4)}>
        <line x1="2" y1="0" x2="2" y2="50" /><line x1={w + 2} y1="0" x2={w + 2} y2="50" />
        <line x1={a + 2} y1="28" x2={b + 2} y2="28" />
        <path d={`M${a + 18} 18 L${a + 2} 28 L${a + 18} 38`} /><path d={`M${b - 14} 18 L${b + 2} 28 L${b - 14} 38`} />
      </g>
    </svg>
  );
};
const Corners: React.FC<{x: number; y: number; w: number; h: number; o: number}> = ({x, y, w, h, o}) => (
  <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible', opacity: o}} width={w} height={h}>
    <g stroke="rgba(240,246,252,.75)" strokeWidth="2.5" fill="none">
      <path d={`M0 46 V0 H46`} /><path d={`M${w - 46} 0 H${w} V46`} /><path d={`M${w} ${h - 46} V${h} H${w - 46}`} /><path d={`M46 ${h} H0 V${h - 46}`} />
    </g>
  </svg>
);
const BPRows: React.FC<{rows: {txt: string; s: number; t0: number}[]; t: number; dimT: number; X?: number}> = ({rows, t, dimT, X = 150}) => {
  const lh = (s: number) => s * 1.12;
  const H = rows.reduce((a, r) => a + lh(r.s), 0) + 80, top = 540 - H / 2;
  const wMax = Math.max(...rows.map((r) => A(r.txt).length * r.s)), last = rows[rows.length - 1], wl = A(last.txt).length * last.s;
  let y = top;
  return (
    <AbsoluteFill>
      <Corners x={X - 50} y={top - 50} w={wMax + 100} h={H + 70} o={eout(prog(t, rows[0].t0 + 0.1, 0.5)) * 0.9} />
      {rows.map((r, k) => {
        const p = eio(prog(t, r.t0, 0.6)), yy = y; y += lh(r.s);
        const w = A(r.txt).length * r.s;
        return (
          <div key={k} style={{position: 'absolute', left: X, top: yy, whiteSpace: 'pre', clipPath: `inset(-20% ${((1 - p) * 100).toFixed(2)}% -20% -2%)`}}>
            {A(r.txt).map((c, i) => <span key={i} style={{fontFamily: TH.f.title, fontWeight: 900, fontSize: r.s, lineHeight: 1.12, letterSpacing: 2, color: c === '？' || c === '?' ? '#ff7a1a' : '#f3f6fa', textShadow: '0 4px 14px rgba(5,20,45,.45)'}}>{c}</span>)}
            {p > 0 && p < 1 && <span style={{position: 'absolute', left: w * p - 8, top: r.s * 0.5, width: 16, height: 16, borderRadius: 8, background: '#ff7a1a', boxShadow: '0 0 16px #ff7a1a'}} />}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: X, top: y + 10}}><DimLine w={wl} p={eio(prog(t, dimT, 0.55))} /></div>
    </AbsoluteFill>
  );
};
const TitleBP: React.FC<any> = ({e, t}) => {
  const ch = !e.l1, slam = e.t + (ch ? 0.05 : e.slam ?? 0.55);
  const l2 = (e.l2 ?? '') + (e.l2b ?? '') + (e.q ?? '');
  const s2 = (ch ? 160 : 200) * fit([[A(l2).length, ch ? 160 : 200]], 1060);
  const rows = ch ? [{txt: e.l2, s: s2, t0: slam}] : [{txt: e.l1, s: 104, t0: e.t}, {txt: l2, s: s2, t0: slam}];
  return <BPRows rows={rows} t={t} dimT={slam + 0.55} />;
};

// 终端: prompt + typewriter + blinking block cursor, phosphor glow
const TermLines: React.FC<{lines: {txt: string; s: number; c: string; t0: number; cps?: number}[]; t: number; X?: number}> = ({lines, t, X = 230}) => {
  const H = lines.reduce((a, l) => a + l.s * 1.3, 0);
  let y = 540 - H / 2;
  const active = lines.map((l) => t >= l.t0).lastIndexOf(true);
  return (
    <AbsoluteFill>
      {lines.map((l, k) => {
        const yy = y; y += l.s * 1.3;
        const s = typed(l.txt, t, l.t0, l.cps ?? 9), done = A(s).length === A(l.txt).length;
        const rgb = l.c === '#33ff88' ? '51,255,136' : '255,176,0';
        return (
          <div key={k} style={{position: 'absolute', left: X, top: yy, whiteSpace: 'pre', fontFamily: TH.f.title, fontSize: l.s, lineHeight: 1.2, color: l.c, textShadow: phosphorTs(rgb, l.s / 96)}}>
            <span style={{color: '#33ff88', textShadow: phosphorTs('51,255,136', l.s / 96)}}>{'> '}</span>{s}
            {k === Math.max(0, active) && <Cursor t={t} on={!done && t >= l.t0} s={l.s} c={l.c} />}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
const px12 = (v: number) => Math.max(48, Math.floor(v / 12) * 12);
const TitleTerm: React.FC<any> = ({e, t}) => {
  const ch = !e.l1, l2 = (e.l2 ?? '') + (e.l2b ?? '') + (e.q ?? '');
  const s2 = px12((ch ? 144 : 192) * fit([[A(l2).length, ch ? 144 : 192]], 1380));
  const t1 = e.t + 0.1, t2 = ch ? e.t + 0.1 : Math.max(e.t + (e.slam ?? 0.55), t1 + A(e.l1).length / 10 + 0.2);
  const lines = ch ? [{txt: e.l2, s: s2, c: '#ffb000', t0: t2}] : [{txt: e.l1, s: 96, c: '#33ff88', t0: t1, cps: 10}, {txt: l2, s: s2, c: '#ffb000', t0: t2}];
  return <TermLines lines={lines} t={t} />;
};

// 桌面: an index card drops onto the desk, the title is hand-lettered on it, red marker underline
const IndexCard: React.FC<{w: number; h: number; t: number; t0: number; rot?: number; cx?: number; cy?: number; children?: any; lh?: number; top?: number}> = ({w, h, t, t0, rot = -2.2, cx = 960, cy = 540, children, lh = 76, top = 120}) => {
  const p = prog(t, t0, 0.55), ep = eout(p);
  return (
    <div style={{position: 'absolute', left: cx, top: cy, width: w, height: h, opacity: clamp(p * 4),
      transform: `translate(-50%,-50%) translateY(${lerp(-70, 0, ep).toFixed(1)}px) rotate(${lerp(rot - 3, rot, ep).toFixed(2)}deg) scale(${lerp(1.07, 1, ep).toFixed(4)})`,
      boxShadow: deskShadow(1 - ep), ...tx('#f6f1e6'), borderRadius: 4}}>
      <Ruled lh={lh} top={top} />
      <Tape w={190} h={52} rot={-34} style={{left: -50, top: 10}} />
      <Tape w={190} h={52} rot={32} style={{right: -50, top: 14}} />
      {children}
    </div>
  );
};
const Hand: React.FC<{txt: string; s: number; t: number; t0: number; c?: string; gap?: number; red?: string}> = ({txt, s, t, t0, c = '#1f1f22', gap = 0.1, red = '#e2543f'}) => (
  <span style={{whiteSpace: 'pre'}}>
    {A(txt).map((ch, i) => {
      const p = eio(prog(t, t0 + i * gap, 0.16));
      return <span key={i} style={{display: 'inline-block', fontFamily: TH.f.title, fontSize: s, lineHeight: 1.1, color: ch === '？' || ch === '?' ? red : c, clipPath: `inset(-10% ${((1 - p) * 100).toFixed(1)}% -10% -5%)`}}>{ch}</span>;
    })}
  </span>
);
const Marker: React.FC<{w: number; p: number; c?: string; sw?: number}> = ({w, p, c = '#e2543f', sw = 16}) => {
  const d = `M6 ${sw} C ${w * 0.25} ${sw * 0.4}, ${w * 0.55} ${sw * 1.6}, ${w - 6} ${sw * 0.7}`;
  return <svg width={w} height={sw * 2.2} style={{display: 'block', overflow: 'visible'}}><path d={d} stroke={c} strokeWidth={sw} strokeLinecap="round" fill="none" opacity={0.9} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} /></svg>;
};
const TitleDesk: React.FC<any> = ({e, t}) => {
  const ch = !e.l1, W = ch ? 1080 : 1260, H = ch ? 440 : 640;
  const l2 = (e.l2 ?? '') + (e.l2b ?? '') + (e.q ?? '');
  const s2 = (ch ? 150 : 190) * fit([[A(l2).length, ch ? 150 : 190]], W - 200);
  const tw = e.t + 0.5, t2 = ch ? tw : tw + A(e.l1).length * 0.1 + 0.15;
  return (
    <AbsoluteFill>
      <IndexCard w={W} h={H} t={t} t0={e.t} lh={ch ? 80 : 84} top={ch ? 110 : 128}>
        <div style={{position: 'absolute', left: 100, top: ch ? 120 : 132, display: 'flex', flexDirection: 'column'}}>
          {!ch && <Hand txt={e.l1} s={118} t={t} t0={tw} />}
          <div style={{marginTop: ch ? 0 : 20}}><Hand txt={l2} s={s2} t={t} t0={t2} /></div>
          <div style={{marginTop: -6, marginLeft: (ch ? 0 : A(e.l2).length * s2)}}><Marker w={(A(ch ? e.l2 : e.l2b ?? '').length || 2) * s2} p={eio(prog(t, t2 + A(l2).length * 0.1 + 0.1, 0.5))} /></div>
        </div>
      </IndexCard>
    </AbsoluteFill>
  );
};

// 杂志: huge black grotesk revealed from masks, the key word in Klein blue, a giant white "?" set in the blue block
const EdLines: React.FC<{lines: {txt: string; s: number; c: string; t0: number}[]; t: number; X?: number; ruleT: number; ruleW?: number}> = ({lines, t, X = 140, ruleT, ruleW = 1100}) => {
  const H = lines.reduce((a, l) => a + l.s * 1.08, 0) + 40;
  let y = 540 - H / 2;
  return (
    <AbsoluteFill>
      {lines.map((l, k) => {
        const yy = y; y += l.s * 1.08;
        const p = prog(t, l.t0, 0.75), ep = 1 - Math.pow(1 - p, 4);
        return (
          <div key={k} style={{position: 'absolute', left: X, top: yy, height: l.s * 1.08, overflow: 'hidden'}}>
            <div style={{fontFamily: TH.f.title, fontWeight: 900, fontSize: l.s, lineHeight: 1.08, letterSpacing: -l.s * 0.04, color: l.c, whiteSpace: 'pre', transform: `translateY(${((1 - ep) * 108).toFixed(2)}%)`}}>{l.txt}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: X + 6, top: y + 26, height: 5, width: ruleW * eio(prog(t, ruleT, 0.8)), background: '#111114'}} />
    </AbsoluteFill>
  );
};
const TitleEd: React.FC<any> = ({e, t}) => {
  const ch = !e.l1, slam = e.t + (ch ? 0.05 : e.slam ?? 0.55);
  const sz = (s: string, base: number) => Math.min(base, 1120 / Math.max(1, A(s).length));
  const lines = ch ? [{txt: e.l2, s: sz(e.l2, 190), c: '#111114', t0: slam}]
    : [{txt: e.l1, s: sz(e.l1, 120), c: '#111114', t0: e.t}, {txt: e.l2, s: sz(e.l2, 300), c: '#1f3fd1', t0: slam}, {txt: e.l2b ?? '', s: sz(e.l2b ?? '', 150), c: '#111114', t0: slam + 0.14}];
  const qp = prog(t, slam + 0.4, 0.8), qe = 1 - Math.pow(1 - qp, 4);
  return (
    <AbsoluteFill>
      <EdLines lines={lines.filter((l) => l.txt)} t={t} ruleT={slam + 0.3} />
      {e.q && !ch && <div style={{position: 'absolute', left: TH.edBlock ?? 1256, right: 0, top: 0, bottom: 0, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 540, transform: `translateY(-50%) translateY(${((1 - qe) * 30).toFixed(1)}%)`, textAlign: 'center', fontFamily: TH.f.title, fontWeight: 900, fontSize: 820, lineHeight: 1, color: '#ffffff', opacity: clamp(qp * 3)}}>{e.q}</div>
      </div>}
    </AbsoluteFill>
  );
};

// 财经: the original drop + slam, now with paper thickness and no clip-art sparkles
const ROT1 = [-8, 5, -4, 7, -6, 4, -5];
const thick = (c: string, n = 4) => Array.from({length: n}).map((_, i) => `0 ${i + 1}px 0 ${c}`).join(',') + ', 0 16px 26px rgba(0,0,0,.55)';
const TitleFin: React.FC<any> = ({e, t}) => {
  const l1 = A(e.l1), l2 = A(e.l2), slam = e.t + (e.slam ?? 0.55);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: e.y1 ?? 250, display: 'flex', justifyContent: 'center', gap: 6}}>
        {l1.map((c, i) => {const p = prog(t, e.t + i * 0.07, 0.4); return <span key={i} style={{fontFamily: TH.f.title, fontWeight: 900, fontSize: e.s1 ?? 128, color: '#f4f1e8', display: 'inline-block', transform: `translateY(${(1 - back(p)) * -120}px) rotate(${ROT1[i % 7]}deg)`, opacity: clamp(p * 3), textShadow: thick('#9c978a', 4)}}>{c}</span>;})}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: e.y2 ?? 430, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 4}}>
        {l2.map((c, i) => {const p = prog(t, slam + i * 0.06, 0.38); return <span key={i} style={{fontFamily: TH.f.title, fontWeight: 900, fontSize: e.s2 ?? 270, lineHeight: 1, color: '#eef37a', display: 'inline-block', transform: `scale(${lerp(2.4, 1, back(p))}) rotate(${[-3, 4, -2, 3, -4][i % 5]}deg)`, opacity: clamp(p * 4), textShadow: thick('#7d8526', 7)}}>{c}</span>;})}
        {e.l2b && A(e.l2b).map((c, i) => {const p = prog(t, slam + 0.25 + i * 0.06, 0.35); return <span key={'b' + i} style={{fontFamily: TH.f.title, fontWeight: 900, fontSize: e.s2b ?? 150, lineHeight: 1.1, color: '#eef37a', display: 'inline-block', transform: `scale(${lerp(2, 1, back(p))}) rotate(${[4, -3, 5][i % 3]}deg)`, opacity: clamp(p * 4), textShadow: thick('#7d8526', 5)}}>{c}</span>;})}
        {e.q && <span style={{fontFamily: TH.f.title, fontWeight: 900, fontSize: 170, color: '#f4f1e8', display: 'inline-block', transform: `rotate(14deg) scale(${back(prog(t, slam + 0.45, 0.35))})`, marginLeft: 10, textShadow: thick('#9c978a', 5)}}>{e.q}</span>}
      </div>
    </AbsoluteFill>
  );
};
export const TITLES: any = {finance: TitleFin, press: TitlePress, blueprint: TitleBP, terminal: TitleTerm, desk: TitleDesk, editorial: TitleEd};

// ---------------------------------------------------------------- end cards (echo each theme's title)
const BYE = '谢谢观看', SEE = '我们下期再见';
const EndFin: React.FC<any> = ({e, t}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, display: 'flex', justifyContent: 'center', gap: 8}}>
      {A(BYE).map((c, i) => {const p = prog(t, e.t + 0.1 + i * 0.1, 0.42); return <span key={i} style={{fontFamily: TH.f.title, fontWeight: 900, fontSize: 220, lineHeight: 1, color: '#eef37a', display: 'inline-block', transform: `scale(${lerp(2.2, 1, back(p))}) rotate(${[-5, 4, -3, 5][i]}deg)`, opacity: clamp(p * 4), textShadow: thick('#7d8526', 7)}}>{c}</span>;})}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 640, textAlign: 'center', fontFamily: TH.f.title, fontWeight: 800, fontSize: 64, letterSpacing: 6, color: '#f4f1e8', textShadow: thick('#6f6b62', 3), opacity: eout(prog(t, e.t + 0.9, 0.5)), transform: `translateY(${(1 - eout(prog(t, e.t + 0.9, 0.5))) * 30}px)`}}>{SEE}</div>
  </AbsoluteFill>
);
const EndPress: React.FC<any> = ({e, t}) => (
  <AbsoluteFill>
    <PressHead rows={[{txt: BYE, s: 170, t0: e.t + 0.1}]} t={t} cy={TH.endBand ?? 340} />
    {/* shifted right so it clears the photo print at the bottom-left of press_end.jpg */}
    <div style={{position: 'absolute', inset: 0, transform: `translateX(${TH.endSubDx ?? 260}px)`}}><PressHead rows={[{txt: SEE, s: 72, t0: e.t + 0.8}]} t={t} cy={TH.endSub ?? 650} bar={eio(prog(t, e.t + 1.25, 0.45))} /></div>
  </AbsoluteFill>
);
const EndBP: React.FC<any> = ({e, t}) => <BPRows rows={[{txt: BYE, s: 200, t0: e.t + 0.1}, {txt: SEE, s: 72, t0: e.t + 0.8}]} t={t} dimT={e.t + 1.2} />;
const EndTerm: React.FC<any> = ({e, t}) => <TermLines lines={[{txt: BYE, s: 192, c: '#ffb000', t0: e.t + 0.1}, {txt: SEE, s: 96, c: '#33ff88', t0: e.t + 0.1 + 4 / 9 + 0.3, cps: 10}]} t={t} />;
const EndDesk: React.FC<any> = ({e, t}) => {
  const sp = prog(t, e.t + 1.0, 0.45), se = eout(sp);
  return (
    <AbsoluteFill>
      <IndexCard w={1120} h={500} t={t} t0={e.t} cx={900} cy={500} lh={84} top={118}>
        <div style={{position: 'absolute', left: 110, top: 150}}><Hand txt={BYE} s={210} t={t} t0={e.t + 0.45} gap={0.12} /></div>
      </IndexCard>
      <div style={{position: 'absolute', left: 1390, top: 760, width: 430, height: 330, ...tx('#e2543f'), borderRadius: 3, opacity: clamp(sp * 4),
        transform: `translate(-50%,-50%) translateY(${lerp(-50, 0, se).toFixed(1)}px) rotate(${lerp(12, 6, se).toFixed(2)}deg) scale(${lerp(1.08, 1, se).toFixed(3)})`, boxShadow: deskShadow(1 - se)}}>
        <div style={{position: 'absolute', left: 44, top: 46, display: 'flex', flexDirection: 'column'}}>
          <Hand txt="我们" s={86} t={t} t0={e.t + 1.35} c="#fffaf2" />
          <Hand txt="下期再见" s={86} t={t} t0={e.t + 1.6} c="#fffaf2" />
        </div>
      </div>
    </AbsoluteFill>
  );
};
const EndEd: React.FC<any> = ({e, t}) => <EdLines lines={[{txt: BYE, s: 240, c: '#111114', t0: e.t + 0.1}, {txt: SEE, s: 76, c: 'rgba(17,17,20,.72)', t0: e.t + 0.45}]} t={t} ruleT={e.t + 0.4} ruleW={960} />;
export const ENDS: any = {finance: EndFin, press: EndPress, blueprint: EndBP, terminal: EndTerm, desk: EndDesk, editorial: EndEd};
