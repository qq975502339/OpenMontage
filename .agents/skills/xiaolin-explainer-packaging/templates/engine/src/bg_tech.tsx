// Tech theme props: terminal windows, chat bubbles, keycaps, cursor, dot grid, title-card tickers and doodles.
// No readable text anywhere: code lines and messages are drawn as coloured bars (no decorative small text on screen).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {back, clamp, eout, prog, rnd} from './lib';
import {TH} from './theme';

const P = () => TH.pal;
const KEYC: Record<string, [string, string]> = {
  lime: ['#eef4b0', '#b4bf55'], cream: ['#f6f0e3', '#c7bca5'], coral: ['#f39a8c', '#b0463d'], steel: ['#8eaee0', '#46649a'], teal: ['#7cc9bf', '#2f7f7a'],
};

export const DotGrid: React.FC<{cam: any; o?: number; mask?: boolean}> = ({cam, o = 1, mask = true}) => {
  const px = -(cam.x - 960) * 0.06, py = -(cam.y - 540) * 0.06;
  const m = mask ? 'radial-gradient(ellipse at 50% 48%, transparent 30%, #000 85%)' : undefined;
  return (
    <AbsoluteFill style={{backgroundImage: 'radial-gradient(rgba(255,255,255,.085) 1.7px, transparent 1.9px)', backgroundSize: '38px 38px',
      backgroundPosition: `${px}px ${py}px`, opacity: o, WebkitMaskImage: m, maskImage: m}} />
  );
};

const CodeBars: React.FC<{rows: number; seed: number; w: number; top?: number; gap?: number}> = ({rows, seed, w, top = 74, gap = 34}) => {
  const r = rnd(seed), cols = ['#6cc2b6', '#e58a74', '#d9e47e', '#7d879a', '#8fb0e0', '#7d879a'];
  return (
    <>
      {Array.from({length: rows}).map((_, i) => {
        let x = 30 + (r() < 0.35 ? 44 : 0) + (r() < 0.15 ? 44 : 0);
        const n = 1 + Math.floor(r() * 3);
        return Array.from({length: n}).map((__, j) => {
          const len = Math.min(w - x - 30, 40 + r() * 190); const c = cols[Math.floor(r() * cols.length)];
          const el = <div key={i + '-' + j} style={{position: 'absolute', left: x, top: top + i * gap, width: Math.max(24, len), height: 14, borderRadius: 7, background: c, opacity: 0.8}} />;
          x += len + 16; return x < w - 40 ? el : null;
        });
      })}
    </>
  );
};

export const TermWin: React.FC<{x: number; y: number; w: number; h: number; rot?: number; seed?: number; bar?: string; style?: any}> = ({x, y, w, h, rot = 0, seed = 1, bar, style}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 22, overflow: 'hidden', transform: `rotate(${rot}deg)`,
    background: 'linear-gradient(180deg,#1f2734,#171d28)', border: '2px solid rgba(255,255,255,.10)', boxShadow: '0 40px 80px rgba(0,0,0,.5)', ...style}}>
    <div style={{height: 48, background: bar ?? P().teal, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 22}}>
      {['#ff8a7a', '#f3cf6b', '#8fd694'].map((c, i) => <div key={i} style={{width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.9}} />)}
    </div>
    <CodeBars rows={Math.floor((h - 80) / 34)} seed={seed} w={w} />
    <div style={{position: 'absolute', left: 30, bottom: 26, width: 22, height: 30, borderRadius: 3, background: P().lime, opacity: 0.9}} />
  </div>
);

export const ChatBub: React.FC<{x: number; y: number; w: number; h: number; rot?: number; c?: string; side?: 'l' | 'r'; style?: any}> = ({x, y, w, h, rot = 0, c, side = 'l', style}) => {
  const bg = c ?? P().steel;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, ...style}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: h * 0.34, background: bg, boxShadow: '0 30px 60px rgba(0,0,0,.45), inset 0 3px 0 rgba(255,255,255,.18)'}} />
      <div style={{position: 'absolute', [side === 'l' ? 'left' : 'right']: h * 0.22, bottom: -h * 0.12, width: h * 0.34, height: h * 0.34, background: bg,
        transform: `skewX(${side === 'l' ? 28 : -28}deg)`, borderRadius: 6}} />
      {[0.32, 0.56].map((yy, i) => <div key={i} style={{position: 'absolute', left: h * 0.3, top: h * yy - 9, width: (w - h * 0.6) * (i ? 0.62 : 0.92), height: 18, borderRadius: 9, background: 'rgba(255,255,255,.42)'}} />)}
    </div>
  );
};

const KeyIcon: React.FC<{k: string; s: number}> = ({k, s}) => {
  const st = {fill: 'none', stroke: '#2b2f3a', strokeWidth: 7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <svg width={s * 0.5} height={s * 0.5} viewBox="0 0 100 100">
      {k === 'enter' && <><path d="M78 22 V56 H26" {...st} /><path d="M42 40 L26 56 L42 72" {...st} /></>}
      {k === 'cmd' && <path d="M38 38 H62 V62 H38 Z M38 38 V28 A10 10 0 1 0 28 38 H38 M62 38 H72 A10 10 0 1 0 62 28 V38 M62 62 V72 A10 10 0 1 0 72 62 H62 M38 62 H28 A10 10 0 1 0 38 72 V62" {...st} strokeWidth={6} />}
      {k === 'chev' && <><path d="M26 30 L48 50 L26 70" {...st} /><path d="M56 72 H78" {...st} /></>}
    </svg>
  );
};

export const Keycap: React.FC<{x: number; y: number; s: number; rot?: number; c?: string; icon?: string; style?: any}> = ({x, y, s, rot = 0, c = 'lime', icon = 'enter', style}) => {
  const [hi, lo] = KEYC[c] ?? KEYC.lime;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: s, height: s, borderRadius: s * 0.2, background: lo, transform: `rotate(${rot}deg)`,
      boxShadow: '0 30px 50px rgba(0,0,0,.5)', ...style}}>
      <div style={{position: 'absolute', left: s * 0.08, right: s * 0.08, top: s * 0.05, bottom: s * 0.16, borderRadius: s * 0.15,
        background: `linear-gradient(160deg, ${hi}, ${lo})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 3px 0 rgba(255,255,255,.5)'}}>
        <KeyIcon k={icon} s={s} />
      </div>
    </div>
  );
};

const Cursor: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
  <svg width={s} height={s * 1.2} viewBox="0 0 100 120" style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.5))'}}>
    <path d="M14 8 L14 96 L36 76 L52 112 L68 104 L52 70 L82 68 Z" fill={P().lime} stroke="#20232c" strokeWidth="6" strokeLinejoin="round" />
  </svg>
);

const Disc: React.FC<{cx: number; cy: number; r: number; c: string}> = ({cx, cy, r, c}) => (
  <div style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: c, opacity: 0.9}} />
);

// Corner props. Each variant fills 3–4 corners and leaves the centre and the mid-edges free.
export const TechDeco: React.FC<{cam: any; t: number; v?: number}> = ({cam, t, v = 0}) => {
  const p = P();
  const px = -(cam.x - 960) * 0.04, py = -(cam.y - 540) * 0.04;
  const fl = (k: number) => ({transform: `translate(${Math.sin(t * 0.5 + k) * 5}px, ${Math.cos(t * 0.45 + k) * 4}px)`});
  const sets: React.ReactNode[][] = [
    [<TermWin key="a" x={-110} y={-90} w={660} h={350} rot={-5} seed={3} />,
      <Keycap key="b" x={1700} y={-40} s={200} rot={14} c="lime" icon="enter" />,
      <ChatBub key="c" x={1440} y={860} w={600} h={250} rot={4} c={p.steel} side="l" />],
    [<ChatBub key="a" x={-120} y={-50} w={580} h={240} rot={-6} c={p.teal} side="r" />,
      <Disc key="b" cx={1930} cy={-20} r={210} c={p.coral} />,
      <TermWin key="c" x={-90} y={810} w={620} h={340} rot={5} seed={7} bar={p.steel} />,
      <Keycap key="d" x={1730} y={900} s={180} rot={-10} c="cream" icon="cmd" />],
    [<Disc key="a" cx={-30} cy={-30} r={200} c={p.steel} />,
      <TermWin key="b" x={1430} y={-100} w={640} h={330} rot={6} seed={11} bar={p.coral} />,
      <Keycap key="c" x={70} y={880} s={180} rot={-14} c="lime" icon="chev" />,
      <Cursor key="d" x={1740} y={830} s={170} rot={-8} />],
    [<Keycap key="a" x={50} y={30} s={150} rot={10} c="steel" icon="enter" />,
      <ChatBub key="b" x={1460} y={-60} w={560} h={230} rot={5} c={p.coral} side="l" />,
      <Disc key="c" cx={-10} cy={1050} r={200} c={p.teal} />,
      <TermWin key="d" x={1400} y={800} w={660} h={340} rot={-4} seed={5} bar={p.steel} />],
  ];
  const s = sets[v % sets.length];
  return (
    <AbsoluteFill style={{transform: `translate(${px}px,${py}px)`}}>
      {s.map((n, i) => <AbsoluteFill key={i} style={fl(i * 1.7 + v)}>{n}</AbsoluteFill>)}
    </AbsoluteFill>
  );
};

// out-of-focus foreground props for FgBokeh
export const techBokeh = (i: number, st: any) => {
  if (i === 1) return <ChatBub key={i} x={0} y={0} w={420} h={180} c={P().steel} style={{...st, position: 'absolute'}} />;
  return <Keycap key={i} x={0} y={0} s={i === 0 ? 260 : 200} c={i === 0 ? 'lime' : 'cream'} icon={i === 0 ? 'enter' : 'cmd'} style={{...st, position: 'absolute'}} />;
};

// title / chapter card: two tickers (top and bottom) + hand-drawn tech doodles
const Chip: React.FC<{k: number; x: number}> = ({k, x}) => {
  const p = P(), m = k % 3;
  if (m === 0) return (
    <div style={{position: 'absolute', left: x + 11, top: 4, width: 90, height: 56, borderRadius: 28, background: p.steel, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9}}>
      {[0, 1, 2].map((j) => <div key={j} style={{width: 11, height: 11, borderRadius: 6, background: '#e8eefa'}} />)}
    </div>);
  if (m === 1) return (
    <div style={{position: 'absolute', left: x + 6, top: 2, width: 100, height: 60, borderRadius: 12, background: p.teal}}>
      <svg width="100" height="60" viewBox="0 0 100 60"><path d="M30 18 L44 30 L30 42 M52 44 H70" fill="none" stroke={p.cream} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>);
  return <Keycap x={x + 24} y={0} s={64} c="lime" icon="enter" style={{boxShadow: 'none'}} />;
};
const ChipRows: React.FC<{t: number}> = ({t}) => {
  const sp = 134, off = (t * 18) % (sp * 3);
  const row = (y: number, dir: number, k0: number) => (
    <div style={{position: 'absolute', left: 0, top: y, width: 1920, height: 70}}>
      {Array.from({length: 20}).map((_, i) => <Chip key={i} k={i + k0} x={i * sp - sp * 3 + dir * off} />)}
    </div>
  );
  return <>{row(36, 1, 0)}{row(976, -1, 1)}</>;
};

const TechDoodles: React.FC<{t: number}> = ({t}) => {
  const p = P(), b = (k: number) => Math.sin(t * 2.2 + k) * 4;
  const st = {fill: 'none', stroke: p.cream, strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const wob = 'url(#wobble2)';
  return (
    <AbsoluteFill>
      <svg width="0" height="0"><filter id="wobble2"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" /><feDisplacementMap in="SourceGraphic" scale="5" /></filter></svg>
      {/* chat bubble */}
      <svg width="200" height="190" viewBox="0 0 200 190" style={{position: 'absolute', left: 30, top: 140 + b(0), filter: wob}}>
        <path d="M30 40 Q30 20 50 20 H150 Q170 20 170 40 V110 Q170 130 150 130 H80 L48 160 L54 130 H50 Q30 130 30 110 Z" {...st} fill={p.steel} />
        {[70, 100, 130].map((x) => <circle key={x} cx={x} cy={75} r="8" fill={p.cream} />)}
      </svg>
      {/* cursor with click rays */}
      <svg width="130" height="163" viewBox="0 0 160 200" style={{position: 'absolute', left: 1772, top: 108 + b(1), filter: wob, transform: 'rotate(12deg)'}}>
        <path d="M50 50 L50 160 L76 136 L94 178 L114 170 L96 128 L132 126 Z" {...st} fill={p.lime} />
        <path d="M30 30 L16 16 M50 22 V4 M70 30 L84 16 M22 50 H4" {...st} />
      </svg>
      {/* robot head */}
      <svg width="180" height="200" viewBox="0 0 180 200" style={{position: 'absolute', left: 50, top: 760 + b(2), filter: wob}}>
        <path d="M90 40 V18" {...st} /><circle cx="90" cy="14" r="8" fill={p.coral} stroke="none" />
        <rect x="34" y="42" width="112" height="92" rx="24" fill={p.gray} stroke="none" />
        <circle cx="68" cy="84" r="11" fill="#2b2f3a" /><circle cx="112" cy="84" r="11" fill="#2b2f3a" />
        <path d="M70 112 Q90 124 110 112" stroke="#2b2f3a" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M24 78 V100 M156 78 V100" {...st} stroke={p.gray} strokeWidth="10" />
        <path d="M54 144 Q90 160 126 144 L136 190 H44 Z" fill={p.gray} stroke="none" />
      </svg>
      {/* terminal window */}
      <svg width="210" height="200" viewBox="0 0 210 200" style={{position: 'absolute', left: 1690, top: 740 + b(3), filter: wob}}>
        <rect x="14" y="30" width="182" height="140" rx="16" {...st} fill={p.teal} />
        <path d="M14 62 H196" {...st} />
        <path d="M46 92 L70 112 L46 132 M84 138 H120" {...st} strokeWidth="7" />
      </svg>
      {/* gear above the title */}
      <svg width="120" height="120" viewBox="0 0 120 120" style={{position: 'absolute', left: 1040, top: 126 + b(4), filter: wob, transform: `rotate(${t * 20}deg)`}}>
        {Array.from({length: 8}).map((_, i) => {const a = (i / 8) * Math.PI * 2; return <line key={i} x1={60 + Math.cos(a) * 30} y1={60 + Math.sin(a) * 30} x2={60 + Math.cos(a) * 44} y2={60 + Math.sin(a) * 44} stroke="#f2f2f2" strokeWidth="9" strokeLinecap="round" />;})}
        <circle cx="60" cy="60" r="30" fill="none" stroke="#f2f2f2" strokeWidth="4" /><circle cx="60" cy="60" r="11" fill="none" stroke="#f2f2f2" strokeWidth="4" />
      </svg>
    </AbsoluteFill>
  );
};

export const TechTitle: React.FC<{t: number; Grain: any}> = ({t, Grain}) => (
  <AbsoluteFill style={{background: '#0f1116'}}>
    <DotGrid cam={{x: 960, y: 540}} o={0.9} mask={false} />
    {TH.title === 'tech' && <><ChipRows t={t} /><TechDoodles t={t} /></>}
    <Grain t={t} o={0.05} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- tech icons (SVG, 100x100 viewBox)
export const TECH_ICONS = ['term', 'chat', 'file', 'gear', 'key', 'lock', 'warn', 'cloud', 'robot', 'bolt', 'mail', 'search'];
export const TechGlyph: React.FC<{name: string; s: number; c?: string; w?: number}> = ({name, s, c = '#f2f2f2', w = 7}) => {
  const st = {fill: 'none', stroke: c, strokeWidth: w, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const g: Record<string, React.ReactNode> = {
    term: <><rect x="12" y="20" width="76" height="60" rx="10" {...st} /><path d="M28 42 L40 52 L28 62 M48 64 H66" {...st} /></>,
    chat: <><path d="M16 26 Q16 16 26 16 H74 Q84 16 84 26 V58 Q84 68 74 68 H44 L28 84 L30 68 H26 Q16 68 16 58 Z" {...st} /><circle cx="36" cy="42" r="4.5" fill={c} /><circle cx="50" cy="42" r="4.5" fill={c} /><circle cx="64" cy="42" r="4.5" fill={c} /></>,
    file: <><path d="M26 12 H60 L78 30 V88 H26 Z M60 12 V30 H78" {...st} /><path d="M38 48 H66 M38 62 H66 M38 76 H56" {...st} /></>,
    gear: <>{Array.from({length: 8}).map((_, i) => {const a = (i / 8) * Math.PI * 2; return <line key={i} x1={50 + Math.cos(a) * 24} y1={50 + Math.sin(a) * 24} x2={50 + Math.cos(a) * 36} y2={50 + Math.sin(a) * 36} {...st} strokeWidth={w * 1.6} />;})}<circle cx="50" cy="50" r="22" {...st} /><circle cx="50" cy="50" r="8" {...st} /></>,
    key: <><circle cx="32" cy="50" r="16" {...st} /><path d="M48 50 H86 M74 50 V64 M84 50 V60" {...st} /></>,
    lock: <><path d="M32 46 V34 Q32 16 50 16 Q68 16 68 34 V46" {...st} /><rect x="22" y="46" width="56" height="40" rx="8" {...st} /><path d="M50 60 V72" {...st} /></>,
    warn: <><path d="M50 14 L88 82 H12 Z" {...st} /><path d="M50 38 V58" {...st} /><circle cx="50" cy="70" r="4.5" fill={c} /></>,
    cloud: <path d="M30 76 Q12 76 12 60 Q12 44 30 44 Q34 24 54 24 Q74 24 76 44 Q90 44 90 60 Q90 76 74 76 Z" {...st} />,
    robot: <><path d="M50 22 V12" {...st} /><rect x="20" y="24" width="60" height="50" rx="14" {...st} /><circle cx="38" cy="48" r="5" fill={c} /><circle cx="62" cy="48" r="5" fill={c} /><path d="M38 86 H62" {...st} /></>,
    bolt: <path d="M56 10 L24 56 H48 L42 90 L76 42 H52 Z" {...st} />,
    mail: <><rect x="12" y="24" width="76" height="52" rx="8" {...st} /><path d="M14 28 L50 54 L86 28" {...st} /></>,
    search: <><circle cx="44" cy="44" r="24" {...st} /><path d="M62 62 L84 84" {...st} strokeWidth={w * 1.3} /></>,
  };
  return <svg width={s} height={s} viewBox="0 0 100 100" style={{overflow: 'visible'}}>{g[name] ?? g.file}</svg>;
};

// 3D tile with a glyph: used by `icon` when src starts with "tech:" (e.g. src='tech:term', c='teal')
export const TechTile: React.FC<{name: string; s?: number; c?: string; dark?: boolean}> = ({name, s = 200, c = 'teal', dark}) => {
  const [hi, lo] = KEYC[c] ?? KEYC.teal;
  const top = dark ? 'linear-gradient(160deg,#2b3344,#1f2532)' : `linear-gradient(160deg, ${hi}, ${lo})`;
  return (
    <div style={{position: 'relative', width: s, height: s, borderRadius: s * 0.24, background: dark ? '#161b25' : lo, boxShadow: dark ? 'none' : '0 18px 30px rgba(0,0,0,.45)'}}>
      <div style={{position: 'absolute', left: s * 0.06, right: s * 0.06, top: s * 0.04, bottom: s * 0.12, borderRadius: s * 0.2, background: top,
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `inset 0 ${Math.max(2, s * 0.02)}px 0 rgba(255,255,255,${dark ? 0.07 : 0.45})`}}>
        <TechGlyph name={name} s={s * 0.58} c={dark ? 'rgba(200,210,230,.55)' : '#22262f'} w={dark ? 6 : 7.5} />
      </div>
    </div>
  );
};

// `tiles`: a wall of app-icon tiles that ripples in from the centre. Conveys "a lot of X" without a number.
// e: cols, rows, ts (tile size), gap, seed, stag (stagger per tile-distance), lo (opacity of unlit tiles),
//    pop: [[t, n]] -> at time t light n random tiles. Do not use s / dim / lit / ad here: Place reads those.
const LIT_C = ['lime', 'teal', 'coral', 'steel', 'cream'];
export const Tiles: React.FC<{e: any; t: number}> = ({e, t}) => {
  const cols = e.cols ?? 14, rows = e.rows ?? 8, s = e.ts ?? 118, gap = e.gap ?? 26, st = s + gap;
  const r = rnd(e.seed ?? 3), cells = Array.from({length: cols * rows}).map((_, i) => ({i, ic: TECH_ICONS[Math.floor(r() * TECH_ICONS.length)], k: r(), lc: LIT_C[Math.floor(r() * LIT_C.length)]}));
  const order = [...cells].sort((a, b) => a.k - b.k);
  const litAt: Record<number, number> = {};
  let p0 = 0;
  for (const [lt, n] of (e.pop ?? []) as [number, number][]) { for (let j = 0; j < n && p0 < order.length; j++, p0++) litAt[order[p0].i] = lt + j * 0.05; }
  const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
  return (
    <div style={{position: 'relative', width: cols * st - gap, height: rows * st - gap}}>
      {cells.map(({i, ic, lc}) => {
        const x = i % cols, y = Math.floor(i / cols), d = Math.hypot(x - cx, (y - cy) * 1.2);
        const p = prog(t, e.t + d * (e.stag ?? 0.045), 0.45), lt = litAt[i], lp = lt != null ? prog(t, lt, 0.3) : 0;
        if (p <= 0) return null;
        return (
          <div key={i} style={{position: 'absolute', left: x * st, top: y * st, opacity: clamp(p * 1.6) * (e.lo ?? 0.5) + lp * (1 - (e.lo ?? 0.5)),
            transform: `scale(${(0.55 + 0.45 * back(p)) * (1 + 0.08 * Math.sin(lp * Math.PI))})`}}>
            {lp > 0.5 ? <TechTile name={ic} s={s} c={lc} /> : <TechTile name={ic} s={s} dark />}
          </div>
        );
      })}
    </div>
  );
};
export const TECH_ELS: any = {tiles: Tiles};
