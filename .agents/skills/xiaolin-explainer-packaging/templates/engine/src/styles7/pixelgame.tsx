import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, prog, eout, eio, lerp, back, rnd} from '../lib';

// A printed 16-bit system, not a terminal screen or a predefined game world.
const PX = "'PX','NSC',monospace";
const SANS = "'NSC',sans-serif";
const C = {navy: '#101d32', deep: '#091321', teal: '#276960', mint: '#93c1ae', gold: '#e8bd63', cream: '#f3e9cf'};
const TEXTURE = 'styles7/paper_dark.jpg';
const STEP = 'polygon(0 12px,12px 12px,12px 0,calc(100% - 12px) 0,calc(100% - 12px) 12px,100% 12px,100% calc(100% - 12px),calc(100% - 12px) calc(100% - 12px),calc(100% - 12px) 100%,12px 100%,12px calc(100% - 12px),0 calc(100% - 12px))';
const hardShadow = `8px 8px 0 ${C.deep}`;
const bands = `linear-gradient(180deg,${C.cream} 0 22%,${C.gold} 22% 72%,#bb8f43 72% 100%)`;

export const preset = (base: any, tx: (c: string, t?: string, size?: string) => any): any => {
  const surface = (color: string, edge: string, light: string): React.CSSProperties => ({
    ...tx(color, 'tex/fiber.jpg'), clipPath: STEP,
    border: `4px solid ${edge}`,
    boxShadow: `inset 4px 4px 0 ${light}, inset -4px -4px 0 ${edge}`,
  });
  return {
    ...base,
    name: 'pixelgame', title: 'pixelgame', end: 'pixelgame', propLook: 'pixel16',
    plates: [TEXTURE], titlePlate: TEXTURE, endPlate: TEXTURE, paperPlate: TEXTURE, bezel: {},
    crt: false, light: false, fg: 'none', glyph: '',
    ink: C.cream, ink2: C.mint, acc: C.gold, accInk: C.navy,
    lux: {...base.lux, light: 0, dust: 0, vig: 0, grain: 0, bright: 1, still: true, warm: false},
    pal: {...base.pal, teal: C.teal, steel: C.navy, coral: '#bb8f43', lime: C.mint, slate: C.deep, cream: C.cream, gray: '#7c8c90'},
    f: {title: PX, card: PX, num: PX, body: SANS, doc: SANS, tok: PX},
    num: {grad: bands, ext: true, extc: C.teal, glow: false, font: PX, weight: 400, ls: 0, kc: C.mint, cc: C.cream, phosphor: undefined},
    card: {
      r: 0, base: surface(C.navy, C.deep, '#37565b'), lit: surface(C.gold, '#a17b38', C.cream),
      dim: [211, 226, 218], on: [16, 29, 50], sdim: [147, 193, 174], son: [39, 68, 65],
      icon: 'flat', glow: undefined, torn: false, tape: false, pin: false, frame: false, ruled: false, flat: false,
    },
    paper: {
      bg: surface(C.cream, '#a6b4a3', '#fff7e6'), r: 0, border: `4px solid ${C.teal}`,
      hdr: surface(C.navy, C.deep, '#37565b'), hdrInk: C.cream, kick: C.gold,
      bar: `linear-gradient(180deg,#43857a 0 28%,${C.teal} 28% 82%,#194b49 82% 100%)`,
      val: C.navy, lab: C.navy, grid: 'rgba(39,105,96,.14)', axis: C.teal, sub: '#536860',
      font: SANS, titleFont: PX, phosphor: false, flat: false,
    },
    doc: {
      bg: surface(C.cream, '#a6b4a3', '#fff7e6'), ink: C.navy, meta: '#536860', font: SANS,
      tractor: false, hl: C.gold, hlBlend: 'multiply', box: C.teal, under: C.teal,
    },
    panel: {
      bg: surface(C.navy, C.deep, '#37565b'), r: 0, border: `4px solid ${C.teal}`, shadow: hardShadow,
      strip: 'transparent', cell: `3px solid ${C.teal}`, title: C.cream, tok: C.cream, op: C.mint,
      hiBg: surface(C.gold, '#a17b38', C.cream), hiInk: C.navy, lab: C.mint,
      foot: C.cream, arrow: C.mint, phosphor: false, icon: 'flat',
    },
    // Complete window tokens also support the existing ledger branch if selected by an episode.
    ui: {
      mode: 'window', win: surface(C.cream, C.teal, '#fff7e6'),
      bar: surface(C.navy, C.deep, '#37565b'), barInk: C.cream, r: 0, dots: false,
      field: '#fff7e6', fBorder: '#7d9b8e', focus: C.teal, lab: '#536860', val: C.navy,
      res: '#e3e4cd', resBorder: '#7d9b8e', rt: '#536860', num: C.teal, total: C.navy,
      lit: 'rgba(232,189,99,.35)', font: SANS, numFont: PX, shadow: hardShadow,
    },
    ent: {ring: C.teal, bg: surface(C.navy, C.deep, '#37565b'), nameInk: C.cream, strip: C.gold, stripInk: C.navy},
    pip: {ring: C.gold, rect: C.cream},
  };
};

const text = (s: any) => String(s ?? '');
const units = (s: string) => Array.from(s).reduce((n, ch) => n + (/[^\x00-\x7f]/.test(ch) ? 1 : 0.72), 0);
const snap = (n: number, grid = 8) => Math.round(n / grid) * grid;
const discrete = (p: number, steps = 8) => Math.floor(clamp(p) * steps) / steps;
const fit = (s: string, desired: any, maxWidth: number, fallback: number) => {
  const n = Number(desired);
  const requested = Number.isFinite(n) && n > 0 ? n : fallback;
  const limit = maxWidth / Math.max(1, units(s));
  const fs = Math.min(requested, limit);
  // PX is a 12-pixel face: integer multiples retain its source pixel cadence.
  return fs >= 24 ? Math.floor(fs / 12) * 12 : Math.max(1, Math.floor(fs));
};

type Row = {a: string; b?: string; size: number; delay: number; color: string};

const Wordmark: React.FC<{e: any; t: number; ending?: boolean}> = ({e, t, ending = false}) => {
  const lt = Number(t ?? 0) - Number(e.t ?? 0);
  const w = clamp(Number(e.w) || 1560, 240, 1680);
  const inner = w - 64;
  const left = e.align === 'left';
  const rows: Row[] = [];
  const first = ending ? '' : text(e.l1);
  const main = ending ? text(e.title ?? '下期再见') : text(e.l2);
  const tail = ending ? '' : text(e.l2b);
  first.split('\n').filter(Boolean).forEach((a, i) => rows.push({a, size: fit(a, e.s1, inner, 108), delay: i * 0.10, color: C.cream}));
  const mains = main.split('\n');
  const start = rows.length * 0.10 + (first ? 0.10 : 0);
  mains.forEach((a, i) => {
    const b = i === mains.length - 1 ? tail : '';
    if (!a && !b) return;
    rows.push({a, b, size: fit(a + b, e.s2 ?? (ending ? e.s1 : undefined), inner, ending ? 156 : 168), delay: start + i * 0.10, color: b ? C.cream : C.gold});
  });
  const sub = ending ? text(e.sub ?? e.l2 ?? '') : text(e.q);
  const subLines = sub.split('\n').filter(Boolean);
  const subSize = Math.min(36, ...subLines.map((s) => fit(s, undefined, inner, 36)));
  const gap = 18;
  const estimated = rows.reduce((h, r) => h + r.size * 1.2 + gap, 0) + 44 + (sub ? subLines.length * subSize * 1.4 + 22 : 0);
  // Keep explicit multiline inputs inside the vertical safe area as well.
  const scale = Math.min(1, 760 / Math.max(1, estimated));
  rows.forEach((r) => {r.size = Math.max(1, Math.floor(r.size * scale));});
  const ss = Math.max(1, Math.floor(subSize * scale));
  const rowGap = gap * scale;
  const h = rows.reduce((v, r) => v + r.size * 1.2 + rowGap, 0) + 44 * scale + (sub ? subLines.length * ss * 1.4 + 22 * scale : 0);
  const x = clamp(Number(e.x) || 960, 120 + w / 2, 1800 - w / 2);
  const y = clamp(Number(e.y) || 500, 100 + h / 2, 900 - h / 2);
  const lineWidth = Math.min(inner, Math.max(72, ...rows.map((r) => units(r.a + (r.b ?? '')) * r.size)));
  const stampP = discrete(eio(prog(lt, start + 0.32, 0.44)), 8);
  const dock = discrete(eout(prog(lt, start + 0.14, 0.42)), 6);
  const spriteOpacity = lt < start + 0.14 ? 0 : 1 - discrete(prog(lt, start + 0.68, 0.20), 4);
  const trackX = left ? 0 : (inner - lineWidth) / 2;
  if (!rows.length && !sub) return null;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, padding: '0 32px', boxSizing: 'border-box', textAlign: left ? 'left' : 'center'}}>
        {rows.map((r, i) => {
          const p = discrete(eout(prog(lt, r.delay, 0.42)), 8);
          return <div key={i} style={{height: r.size * 1.2, marginBottom: rowGap, opacity: lt < r.delay ? 0 : 1,
            transform: `translate(${snap(lerp(-32, 0, p))}px,${snap(lerp(16, 0, p))}px)`,
            clipPath: `inset(-12px ${(1 - p) * 100}% -16px -12px)`}}>
            <span style={{display: 'inline-block', whiteSpace: 'pre', fontFamily: PX, fontWeight: 400, fontSize: r.size,
              lineHeight: 1.2, color: r.color, textShadow: `-4px 0 0 ${C.deep},4px 0 0 ${C.deep},0 -4px 0 ${C.deep},0 4px 0 ${C.deep},-4px -4px 0 ${C.deep},4px -4px 0 ${C.deep},-4px 4px 0 ${C.deep},4px 4px 0 ${C.deep},8px 10px 0 ${C.deep}`}}>
              {r.a}{r.b && <span style={{color: C.gold}}>{r.b}</span>}
            </span>
          </div>;
        })}
        <div style={{position: 'relative', height: 44 * scale}}>
          <svg width={lineWidth} height={32 * scale} viewBox={`0 0 ${lineWidth} 32`} preserveAspectRatio="none"
            style={{position: 'absolute', left: trackX, top: 0, opacity: lt < start + 0.32 ? 0 : 1, clipPath: `inset(0 ${(1 - stampP) * 100}% 0 0)`}} shapeRendering="crispEdges">
            <path d={`M0 4 H${Math.max(0, lineWidth - 32)} V12 H${lineWidth - 16} V20 H${lineWidth}`} stroke={C.deep} strokeWidth="8" fill="none" transform="translate(0 4)" />
            <path d={`M0 4 H${Math.max(0, lineWidth - 32)} V12 H${lineWidth - 16} V20 H${lineWidth}`} stroke={C.gold} strokeWidth="4" fill="none" />
          </svg>
          {/* Nonfigurative sprite: a brief printing/docking interaction, never a mascot or HUD. */}
          <div style={{position: 'absolute', left: trackX + snap(lerp(-24, lineWidth - 24, dock)), top: -8 * scale,
            width: 24 * scale, height: 24 * scale, opacity: spriteOpacity, transform: `translateY(${snap((1 - clamp(back(prog(lt, start + 0.14, 0.42)))) * -16)}px)`}}>
            <span style={{position: 'absolute', left: 0, top: 8 * scale, width: 8 * scale, height: 8 * scale, background: C.teal}} />
            <span style={{position: 'absolute', left: 8 * scale, top: 0, width: 16 * scale, height: 16 * scale, background: C.gold, boxShadow: `0 ${4 * scale}px 0 ${C.deep}`}} />
          </div>
        </div>
        {sub && <div style={{marginTop: 22 * scale, fontFamily: SANS, fontWeight: 700, fontSize: ss, lineHeight: 1.4, display: 'inline-block', padding: `${6 * scale}px ${18 * scale}px`, background: C.deep, boxShadow: `4px 4px 0 ${C.teal}`,
          color: C.cream, whiteSpace: 'pre', opacity: discrete(prog(lt, start + 0.50, 0.32), 4),
          transform: `translateY(${snap(lerp(16, 0, discrete(eout(prog(lt, start + 0.50, 0.32)), 4)))}px)`}}>{sub}</div>}
      </div>
    </AbsoluteFill>
  );
};

export const Title: React.FC<any> = ({e, t}) => <Wordmark e={e ?? {}} t={t} />;
export const End: React.FC<any> = ({e, t}) => <Wordmark e={e ?? {}} t={t} ending />;

// Sparse edge fragments only. There is deliberately no stage, chart, wall, or content anchor.
const fragments = (() => {
  const r = rnd(71);
  return Array.from({length: 22}, (_, i) => ({
    x: i % 2 === 0 ? snap(24 + r() * 64) : snap(1832 + r() * 64),
    y: snap(48 + r() * 944), w: snap(8 + r() * 16), h: snap(8 + r() * 24),
    shade: r() > 0.6,
  }));
})();

export const Backdrop: React.FC<any> = ({bg, t, lt, cam}) => {
  const light = bg?.type === 'paper';
  // lt is already scene-local in the engine; fallback uses the scene's t when supplied.
  const local = Number.isFinite(lt) ? lt : Number(t ?? 0) - Number(bg?.t ?? 0);
  const p = discrete(eout(prog(local, 0, 0.44)), 6);
  const framed = bg?.type === 'title' || bg?.type === 'end';
  // Background is registered to the screen, not to a moving camera: no texture shimmer.
  void cam;
  return <AbsoluteFill style={{width: 1920, height: 1080, overflow: 'hidden', backgroundColor: light ? C.cream : C.navy, pointerEvents: 'none'}}>
    <Img src={staticFile(TEXTURE)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: light ? 0.08 : 0.23, mixBlendMode: light ? 'multiply' : 'soft-light'}} />
    <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(90deg,rgba(147,193,174,.035) 0 2px,transparent 2px 8px),repeating-linear-gradient(0deg,rgba(9,19,33,.035) 0 2px,transparent 2px 8px)', opacity: light ? 0.25 : 0.45}} />
    {/* Peripheral print fragments, without text, symbols, topic props, or a fixed full frame. */}
    {fragments.map((f, i) => <div key={i} style={{position: 'absolute', left: f.x, top: f.y,
      width: f.w, height: f.h, background: light ? (f.shade ? '#98ab98' : '#c5cab1') : (f.shade ? C.teal : '#1d3445'),
      opacity: (light ? 0.22 : 0.26) * p, transform: `translateX(${snap((1 - p) * (i % 2 === 0 ? -16 : 16))}px)`,
      boxShadow: light ? '4px 4px 0 rgba(39,105,96,.08)' : '4px 4px 0 rgba(9,19,33,.5)'}} />)}
    {framed && <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: 0.42 * p}} shapeRendering="crispEdges">
      <path d="M24 88 H56 V56 H112 M1808 1024 H1864 V992 H1896" fill="none" stroke={light ? C.teal : C.mint} strokeWidth="4" />
      <path d="M24 96 H64 V64 H112 M1808 1032 H1872 V1000 H1896" fill="none" stroke={light ? '#b4baa3' : C.deep} strokeWidth="4" />
    </svg>}
  </AbsoluteFill>;
};
