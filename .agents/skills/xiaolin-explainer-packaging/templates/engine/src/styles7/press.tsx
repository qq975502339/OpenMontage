import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, prog, eout, eio, lerp, back, rnd} from '../lib';

// Topic-neutral press language: paper stock, letterpress, proof-reader red.
const STOCK = 'styles7/newsprint.jpg';
const PAPER = '#f2ead8';
const PALE = '#f8f1e2';
const INK = '#211e19';
const RED = '#b83b30';
const MUTED = '#72695a';
const SERIF = "'NSERIF','Noto Serif SC','Songti SC',serif";
const SANS = "'NSC','Noto Sans SC',sans-serif";
const dots = (color: string, base: string, gap = 9) =>
  `radial-gradient(circle, ${color} 0 1.1px, transparent 1.45px) 0 0/${gap}px ${gap}px, linear-gradient(${base},${base})`;
const stock = (color: string): React.CSSProperties => ({
  backgroundColor: color,
  backgroundImage: `url(${staticFile(STOCK)})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundBlendMode: 'multiply',
});

export const preset = (base: any, tx: (c: string, t?: string, size?: string) => any): any => ({
  ...base,
  name: 'press', title: 'press', end: 'press', propLook: 'engraving',
  plates: [STOCK], titlePlate: STOCK, endPlate: STOCK, paperPlate: STOCK,
  bezel: undefined, crt: false, light: true, fg: 'none', glyph: '',
  lux: {...base.lux, light: 0, dust: 0, warm: true, vig: 0.12, grain: 0.018, bright: 1, still: true},
  ink: INK, ink2: 'rgba(33,30,25,.72)', acc: RED, accInk: PALE,
  f: {title: SERIF, card: SERIF, num: SERIF, body: SANS, doc: SERIF, tok: SERIF},
  num: {color: INK, ext: false, glow: false, font: SERIF, weight: 900, ls: -3, scale: 1, kc: RED, cc: INK},
  card: {
    r: 0, torn: true, tape: false, flat: true, tilt: 0.65, icon: 'print',
    base: {...tx('#e5dac3', STOCK), border: '1px solid rgba(33,30,25,.18)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.55)'},
    lit: {...tx(PALE, STOCK), border: '1px solid rgba(33,30,25,.48)', boxShadow: 'inset 0 0 0 2px rgba(33,30,25,.05)'},
    dim: [104, 94, 78], on: [33, 30, 25], sdim: [119, 108, 91], son: [105, 47, 38], litRing: RED,
  },
  paper: {
    bg: tx(PAPER, STOCK), r: 0, hdr: {...tx(PALE, STOCK), borderBottom: `3px double ${INK}`}, hdrInk: INK, kick: RED,
    bar: dots('rgba(55,20,13,.25)', RED), blend: 'multiply',
    val: INK, lab: '#393329', grid: 'rgba(33,30,25,.10)', axis: 'rgba(33,30,25,.65)',
    sub: MUTED, font: SERIF, titleFont: SERIF, flat: true,
  },
  doc: {
    bg: tx(PALE, STOCK), ink: INK, meta: MUTED, font: SERIF,
    hl: 'rgba(184,59,48,.20)', hlBlend: 'multiply', box: RED, under: RED,
  },
  panel: {
    bg: tx(PAPER, STOCK), r: 0, border: 'none', torn: true,
    shadow: '0 14px 28px rgba(46,35,21,.16)', strip: 'transparent', rules: INK,
    title: INK, tok: INK, op: MUTED, hiBg: 'transparent', hiRing: RED, hiInk: RED,
    lab: '#393329', foot: '#51493d', arrow: MUTED, icon: 'print',
  },
  ui: {
    mode: 'ledger', win: {...tx(PAPER, STOCK), boxShadow: 'inset 0 0 0 1px rgba(33,30,25,.10)'},
    bar: INK, barInk: PALE, r: 0, dots: false,
    field: 'rgba(255,250,239,.72)', fBorder: '#8d806a', focus: RED,
    lab: '#51493d', val: INK, res: 'rgba(255,250,239,.34)', resBorder: INK,
    rt: MUTED, num: INK, total: RED, lit: 'rgba(184,59,48,.13)',
    font: SANS, numFont: SERIF, shadow: '0 18px 36px rgba(46,35,21,.20)',
  },
  ent: {ring: INK, bg: tx(PALE, STOCK), nameInk: INK, strip: INK, stripInk: PALE},
  pip: {ring: INK, rect: PAPER},
});

const text = (v: any) => String(v ?? '');
const finite = (v: any, fallback: number) => typeof v === 'number' && Number.isFinite(v) ? v : fallback;
const units = (s: string) => Array.from(s).reduce((n, c) => n + (
  /[\u3400-\u9fff\uff00-\uffef]/.test(c) ? 1.08 : c === "\u3000" ? 1 : /\s/.test(c) ? 0.4 : /[A-ZMW@]/.test(c) ? 0.83 : /[\u0000-\u007f]/.test(c) ? 0.66 : 1.15
), 0);
const lines = (s: string) => s.split('\n');
const widest = (s: string) => Math.max(0, ...lines(s).map(units));
const fit = (s: string, desired: number, w: number) => Math.min(desired, w / Math.max(1, widest(s)));

// Reproducible, irregular fibres at the edge; not a repeated zig-zag cut.
const tear = (seed: number, depth = 1.2) => {
  const random = rnd(seed), points: string[] = [];
  for (let i = 0; i <= 32; i++) points.push(`${i / 32 * 100}% ${random() * depth}%`);
  points.push('100% 99%');
  for (let i = 32; i >= 0; i--) points.push(`${i / 32 * 100}% ${100 - random() * depth}%`);
  return `polygon(${points.join(',')})`;
};

const InkRule: React.FC<{p: number; width: number; red?: boolean}> = ({p, width, red = false}) => (
  <svg width={width} height={red ? 20 : 12} viewBox={`0 0 ${width} ${red ? 20 : 12}`} style={{display: 'block', overflow: 'visible'}} aria-hidden="true">
    {red ? <path d={`M4 10 Q${width * 0.29} 5 ${width * 0.56} 11 T${width - 4} 8`}
      fill="none" stroke={RED} strokeWidth={4.5} strokeLinecap="round" pathLength={1}
      strokeDasharray="1" strokeDashoffset={1 - eio(p)} /> : <>
      <path d={`M0 2 H${width}`} stroke={INK} strokeWidth={3} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - eout(p)} />
      <path d={`M0 9 H${width}`} stroke={INK} strokeWidth={1} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - eout(p)} />
    </>}
  </svg>
);

// x/y anchor the centre of the content area; align changes typesetting, not the anchor.
// Requested type sizes are honoured up to the safe-area width/height constraints.
const Headline: React.FC<any> = ({e, t, ending = false}) => {
  const dt = finite(t, 0) - finite(e.t, 0);
  const l1 = text(e.l1), l2 = text(e.l2), l2b = text(e.l2b), q = text(e.q);
  const joined = l2 + (l2 && l2b ? '\u3000' : '') + l2b;
  const w = clamp(finite(e.w, 1510), 320, 1680);
  const leftAligned = e.align === 'left';
  let s1 = fit(l1, clamp(finite(e.s1, 138), 20, 300), w - 8);
  let s2 = fit(joined, clamp(finite(e.s2, ending ? 166 : l1 ? 174 : 188), 20, 340), w - 8);
  let qs = fit(q, 43, Math.max(250, w - 48));
  // q is a supporting deck, not decorative microtype. Long decks wrap on paper.
  qs = Math.max(28, qs);
  const qLines = q ? lines(q).reduce((n, line) => n + Math.max(1, Math.ceil(units(line) * qs / (w - 48))), 0) : 0;
  const measure = () => 34 + (l1 ? s1 * 1.18 * lines(l1).length + 14 : 0)
    + (joined ? s2 * 1.18 * lines(joined).length + 32 : 0)
    + (q ? qs * 1.48 * qLines + 44 : 0);
  const fixed = 34 + (l1 ? 14 : 0) + (joined ? 32 : 0) + (q ? 44 : 0);
  const ratio = Math.min(1, (740 - fixed) / Math.max(1, measure() - fixed));
  s1 *= ratio; s2 *= ratio; qs *= ratio;
  const h = measure();
  const x = clamp(finite(e.x, 960) - w / 2, 120, 1800 - w);
  const y = clamp(finite(e.y, 500) - h / 2, 100, 876 - h);
  const p1 = eout(prog(dt, 0.09, 0.43));
  const p2 = eout(prog(dt, l1 ? 0.23 : 0.12, 0.47));
  const pq = eout(prog(dt, 0.72, 0.34));
  const impression = ending ? lerp(0.984, 1, Math.min(1, back(prog(dt, 0.12, 0.48)))) : 1;
  const markW = Math.min(w - 8, Math.max(140, widest(joined) * s2));
  const row: React.CSSProperties = {
    fontFamily: SERIF, fontWeight: 900, lineHeight: 1.18, letterSpacing: -1.5,
    whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: INK,
    textShadow: '0 1px 0 rgba(255,255,255,.58)',
  };
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h,
      textAlign: leftAligned ? 'left' : 'center', transformOrigin: '50% 50%', transform: `scale(${impression})`}}>
      <div style={{marginBottom: 22, opacity: eout(prog(dt, 0, 0.3))}}>
        <InkRule p={prog(dt, 0.02, 0.45)} width={w} />
      </div>
      {l1 && <div style={{...row, fontSize: s1, marginBottom: 14,
        opacity: p1, transform: `translate(${lerp(-2, 0, p1)}px,${lerp(24, 0, p1)}px)`}}>{l1}</div>}
      {joined && <div style={{opacity: p2, transform: `translateY(${lerp(24, 0, p2)}px)`}}>
        <div style={{...row, fontSize: s2}}>
          {l2}{l2 && l2b ? '\u3000' : ''}{l2b && <span style={{color: RED}}>{l2b}</span>}
        </div>
        <div style={{width: markW, margin: leftAligned ? '5px 0 7px' : '5px auto 7px'}}>
          <InkRule p={prog(dt, 0.56, 0.34)} width={markW} red />
        </div>
      </div>}
      {q && <div style={{display: 'inline-block', maxWidth: w, boxSizing: 'border-box',
        marginTop: 16, padding: '12px 24px 16px', ...stock(PALE), clipPath: tear(59, 1.15),
        fontFamily: SANS, fontWeight: 500, fontSize: qs, lineHeight: 1.48, color: '#51493d',
        whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', textAlign: leftAligned ? 'left' : 'center',
        opacity: pq, transform: `translateX(${lerp(-18, 0, pq)}px) rotate(${lerp(-0.35, 0, pq)}deg)`}}>{q}</div>}
    </div>
  </AbsoluteFill>;
};

export const Title: React.FC<any> = ({e, t}) => <Headline e={e} t={t} />;

export const End: React.FC<any> = ({e, t}) => <Headline ending t={t} e={{
  ...e, l1: '', l2: e.title ?? '下期再见', l2b: '', q: e.sub ?? e.l2 ?? '',
}} />;

export const Backdrop: React.FC<any> = ({bg, t, lt, cam: _cam}) => {
  const paperMode = bg?.type === 'paper';
  const framed = bg?.type === 'title' || bg?.type === 'end';
  const local = finite(lt, finite(t, 0) - finite(bg?.t, 0));
  const p = paperMode ? 1 : eout(prog(local, 0, 0.55));
  const ground = paperMode ? PALE : '#e6dac3';
  return <AbsoluteFill style={{backgroundColor: ground, overflow: 'hidden', pointerEvents: 'none'}}>
    <Img src={staticFile(STOCK)} style={{position: 'absolute', inset: 0, width: 1920, height: 1080,
      objectFit: 'cover', opacity: paperMode ? 0.22 : 0.30, mixBlendMode: 'multiply'}} />
    <div style={{position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse at 51% 44%, rgba(255,251,239,${paperMode ? 0.38 : 0.50}) 0%, rgba(255,251,239,.13) 62%, rgba(97,72,39,.065) 100%)`}} />
    {/* Edge-only sheet layering: never a precomposed content card or diagram. */}
    <div style={{position: 'absolute', left: -45, top: -28, width: 115, height: 1140,
      ...stock(paperMode ? '#eee3cf' : '#cdbd9e'), opacity: paperMode ? 0.34 : 0.62,
      clipPath: tear(91, 2.2), transform: `translateX(${lerp(-12, 0, p)}px) rotate(-0.55deg)`,
      boxShadow: 'inset -2px 0 0 rgba(66,47,25,.12)'}} />
    <div style={{position: 'absolute', right: -54, top: -22, width: 104, height: 1130,
      ...stock(PALE), opacity: paperMode ? 0.34 : 0.64,
      clipPath: 'polygon(16% 0,100% 0,100% 100%,10% 100%,14% 94%,9% 89%,16% 81%,11% 74%,15% 66%,8% 59%,14% 52%,10% 44%,17% 36%,12% 28%,16% 20%,10% 12%)',
      transform: `translateX(${lerp(12, 0, p)}px) rotate(0.3deg)`}} />
    {!paperMode && <>
      <div style={{position: 'absolute', right: 75, top: 30, width: 156, height: 54,
        backgroundImage: 'radial-gradient(circle, rgba(33,30,25,.30) 0 1px, transparent 1.35px)',
        backgroundSize: '8px 8px', opacity: 0.20 * p,
        maskImage: 'linear-gradient(120deg,transparent,#000)', WebkitMaskImage: 'linear-gradient(120deg,transparent,#000)'}} />
      <div style={{position: 'absolute', left: 72, bottom: 24, width: 188, height: 55,
        backgroundImage: 'radial-gradient(circle, rgba(33,30,25,.30) 0 1px, transparent 1.35px)',
        backgroundSize: '9px 9px', opacity: 0.16 * p,
        maskImage: 'linear-gradient(25deg,#000,transparent)', WebkitMaskImage: 'linear-gradient(25deg,#000,transparent)'}} />
    </>}
    {framed && <>
      <div style={{position: 'absolute', left: 78, right: 78, top: 74, height: 2, background: INK,
        opacity: 0.20 * p, transform: `scaleX(${p})`, transformOrigin: '0 50%'}} />
      <div style={{position: 'absolute', left: 78, right: 78, bottom: 100, height: 1, background: INK, opacity: 0.15 * p}} />
      <svg width="46" height="72" viewBox="0 0 46 72" style={{position: 'absolute', left: 65, top: bg?.type === 'end' ? 740 : 228, opacity: 0.55 * p}} aria-hidden="true">
        <path d="M35 9 L13 32 L31 48 M14 33 L9 62" fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>}
  </AbsoluteFill>;
};
