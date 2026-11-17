import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, prog, eout, eio, lerp, back, rnd} from '../lib';

// A material system, not a subject skin. All visible words arrive through e.
const STOCK = 'styles7/paper_dark.jpg';
const FIBER = 'tex/fiber.jpg';
const C = {dark: '#242529', deep: '#17181b', edge: '#44454a', cream: '#f1eddf', paper: '#eee8da', acid: '#e8ef63', olive: '#777c35', ink: '#25262a'};
const SANS = "'NSC','Noto Sans SC',sans-serif";
const SERIF = "'NSERIF','Noto Serif SC',serif";
const DISPLAY = "'YS','NSC',sans-serif";
const NUMBER = "'DIN','BB','NSC',sans-serif";
const cut = 'polygon(0.3% 1%,18% 0,39% 0.6%,61% 0,82% 0.5%,99.6% 0,100% 33%,99.7% 66%,100% 99%,78% 100%,53% 99.5%,29% 100%,0 99.2%,0.4% 67%,0 34%)';
const raised = 'inset 0 1px 0 rgba(255,255,255,.22), inset 0 -3px 0 rgba(0,0,0,.28)';

export const preset = (base: any, tx: (c: string, t?: string, size?: string) => any): any => {
  const dark = (c: string): React.CSSProperties => ({...tx(c, STOCK), backgroundBlendMode: 'soft-light'});
  const light = (c: string): React.CSSProperties => ({...tx(c, FIBER), backgroundBlendMode: 'multiply'});
  const printed = (c: string) => `url(${staticFile(FIBER)}) center/cover, ${c}`;
  return {
    ...base,
    // Replace legacy photographic topic plates and glyph-driven foregrounds.
    plates: [STOCK], titlePlate: STOCK, endPlate: STOCK, paperPlate: STOCK,
    bezel: {}, crt: false, light: false, fg: 'none', glyph: '', propLook: 'sticker25d',
    ink: C.cream, ink2: 'rgba(241,237,223,.76)', acc: C.acid, accInk: C.ink,
    lux: {...base.lux, light: 0, dust: 0, warm: false, vig: 0.12, grain: 0.025, bright: 1, still: true},
    pal: {...base.pal, teal: C.edge, steel: '#5d6064', coral: C.olive, lime: C.acid, slate: C.dark, cream: C.cream, gray: '#99998f'},
    f: {...base.f, title: DISPLAY, card: SANS, num: NUMBER, body: SANS, doc: SERIF, tok: SANS},
    num: {grad: printed(C.acid), blend: 'multiply', ext: true, extc: C.olive, glow: false, font: NUMBER, weight: 400, ls: 2, scale: 1, kc: C.cream, cc: C.cream},
    card: {
      r: 3, torn: true, tape: false, pin: false, frame: false, ruled: false, flat: false, tilt: 0.65, icon: 'print',
      base: {...dark('#35363b'), border: '1px solid rgba(241,237,223,.15)', boxShadow: raised},
      lit: {...light(C.acid), border: '1px solid rgba(248,250,204,.58)', boxShadow: raised},
      dim: [205, 205, 195], on: [37, 38, 42], sdim: [170, 172, 166], son: [64, 66, 39],
    },
    paper: {
      bg: {...light(C.paper), boxShadow: raised}, r: 2, border: '1px solid rgba(37,38,42,.24)',
      hdr: {...dark(C.dark), boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.3)'}, hdrInk: C.cream, kick: C.acid,
      bar: printed('#46494a'), blend: 'multiply', val: C.ink, lab: '#454740',
      grid: 'rgba(37,38,42,.12)', axis: 'rgba(37,38,42,.64)', sub: '#6e7067', font: SANS, titleFont: DISPLAY,
    },
    doc: {
      bg: {...light('#f1eddf'), border: '1px solid rgba(37,38,42,.18)'}, ink: C.ink, meta: '#70716a', font: SERIF,
      hl: 'rgba(215,224,69,.64)', hlBlend: 'multiply', box: C.olive, under: '#4c5140', tractor: false,
    },
    panel: {
      bg: {...dark('#303135'), boxShadow: raised}, r: 2, border: '1px solid rgba(241,237,223,.2)',
      shadow: '4px 6px 0 #141518, 0 24px 48px rgba(0,0,0,.38)', torn: true,
      strip: 'rgba(0,0,0,.13)', title: C.cream, tok: C.cream, op: '#b6b8aa',
      hiBg: {...light(C.acid), boxShadow: raised}, hiInk: C.ink, lab: '#d5d6c8', foot: '#c0c2b7', arrow: '#c6c9b6', icon: 'print',
    },
    // Complete window/ledger token contract; no inheritance from partial app skins.
    ui: {
      mode: 'window', win: {...light(C.paper), border: '1px solid rgba(37,38,42,.28)', boxShadow: raised},
      bar: {...dark('#303135'), boxShadow: 'inset 0 -3px 0 #17181b'}, barInk: C.cream, r: 2, dots: false,
      field: '#e5dfd1', fBorder: '#a8a899', focus: '#626c25', lab: '#62645c', val: C.ink,
      res: '#f4f0e5', resBorder: '#adad9e', rt: '#6d7066', num: '#353832', total: '#535e20',
      lit: 'rgba(213,222,66,.34)', font: SANS, numFont: NUMBER,
      shadow: '5px 7px 0 #141518, 0 28px 65px rgba(0,0,0,.4)',
    },
    ent: {ring: C.cream, bg: {...dark('#33353a'), boxShadow: raised}, nameInk: C.cream, strip: light(C.acid), stripInk: C.ink},
    pip: {ring: C.cream, rect: '#e8e6d8'},
  };
};

const text = (s: any): string => s == null || typeof s === 'boolean' ? '' : String(s);
const units = (s: string): number => Math.max(1, ...s.split('\n').map((line) => Array.from(line).reduce((n, ch) => n + (/[^\u0000-\u00ff]/.test(ch) ? 1.04 : /[MW@]/.test(ch) ? 0.88 : 0.64), 0)));
const numeric = (n: any, fallback: number): number => typeof n === 'number' && Number.isFinite(n) ? n : fallback;
const fit = (s: string, size: number, w: number): number => Math.min(Math.max(16, size), (w - 34) / (units(s) + 0.12));
const lineCount = (s: string): number => s ? s.split('\n').length : 0;

// Restrict content, including its modest thickness and entry travel, to the safe area.
const box = (e: any, h: number) => {
  const w = clamp(numeric(e.w, 1480), 240, 1680);
  const left = e.align === 'left';
  const x = numeric(e.x, left ? 120 : 960);
  return {w, left: clamp(left ? x : x - w / 2, 120, 1800 - w), top: clamp(numeric(e.y, 500) - h / 2, 100, 900 - h), align: left ? 'left' : 'center'} as const;
};

const CutType: React.FC<{s: string; size: number; color: string; age: number; delay: number; serif?: boolean}> = ({s, size, color, age, delay, serif}) => {
  const land = back(prog(age, delay, 0.52));
  const ink = eio(prog(age, delay + 0.06, 0.32));
  const register = eout(prog(age, delay + 0.12, 0.36));
  const font: React.CSSProperties = {fontFamily: serif ? SERIF : DISPLAY, fontWeight: serif ? 800 : 400, fontSize: size, lineHeight: 1.14, letterSpacing: 0.6, whiteSpace: 'pre', display: 'inline-block'};
  return (
    <span style={{...font, position: 'relative', maxWidth: '100%', opacity: eout(prog(age, delay, 0.18)), transform: `translateY(${lerp(16, 0, land)}px) rotate(${lerp(-0.8, 0, register)}deg)`, transformOrigin: '50% 80%', filter: 'drop-shadow(0 7px 5px rgba(0,0,0,.35))'}}>
      <span aria-hidden style={{...font, position: 'absolute', inset: 0, color: C.olive, opacity: 0.5, transform: `translate(${lerp(-10, -2, register)}px,${lerp(5, 1, register)}px)`}}>{s}</span>
      <span aria-hidden style={{...font, position: 'absolute', inset: 0, color: color === C.acid ? '#777d32' : '#979a86', transform: 'translate(2px,4px)'}}>{s}</span>
      <span style={{...font, position: 'relative', backgroundColor: color, backgroundImage: `url(${staticFile(FIBER)})`, backgroundSize: 'cover', backgroundBlendMode: 'multiply', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '.45px rgba(24,25,27,.35)', clipPath: `inset(0 ${(1 - ink) * 100}% 0 0)`}}>{s}</span>
    </span>
  );
};

export const Title: React.FC<any> = ({e, t}) => {
  const age = numeric(t, 0) - numeric(e.t, 0);
  const l1 = text(e.l1);
  let l2 = text(e.l2), l2b = text(e.l2b);
  if (e.q === true) {if (l2b) l2b += '？'; else if (l2) l2 += '？';}
  const q = text(e.q);
  if (!l1 && !l2 && !l2b && !q) return null;
  const w = clamp(numeric(e.w, 1480), 240, 1680);
  let s1 = fit(l1, numeric(e.s1, l2 || l2b ? 104 : 190), w);
  let s2 = fit(l2, numeric(e.s2, l1 ? 206 : 220), w);
  let s2b = fit(l2b, numeric(e.s2, 206), w);
  let sq = fit(q, numeric(e.qSize, 42), w);
  const gaps = (l1 ? 18 : 0) + (l2b ? 10 : 0) + (q ? 26 : 0) + 56;
  const height = () => 1.14 * (lineCount(l1) * s1 + lineCount(l2) * s2 + lineCount(l2b) * s2b) + lineCount(q) * sq * 1.4 + gaps;
  const shrink = Math.min(1, 860 / height());
  s1 *= shrink; s2 *= shrink; s2b *= shrink; sq *= shrink;
  const h = height(), b = box(e, h);
  const sweep = eio(prog(age, 0.22, 0.38));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: b.left, top: b.top, width: b.w, textAlign: b.align, padding: '12px 16px 20px', boxSizing: 'border-box'}}>
        {l1 && <div style={{marginBottom: 18}}><CutType s={l1} size={s1} color={C.cream} age={age} delay={0} serif /></div>}
        {l2 && <div><CutType s={l2} size={s2} color={C.acid} age={age} delay={l1 ? 0.12 : 0} /></div>}
        {l2b && <div style={{marginTop: 10}}><CutType s={l2b} size={s2b} color={C.cream} age={age} delay={0.2} /></div>}
        <div aria-hidden style={{position: 'relative', height: 6, width: Math.min(220, w * 0.2), margin: b.align === 'left' ? '18px 0 0' : '18px auto 0', background: C.olive, clipPath: cut, transform: `scaleX(${sweep})`, transformOrigin: b.align === 'left' ? '0 50%' : '50% 50%'}}>
          <div style={{position: 'absolute', inset: 0, backgroundColor: C.acid, backgroundImage: `url(${staticFile(FIBER)})`, backgroundBlendMode: 'multiply', transform: 'translate(-2px,-1px)'}} />
        </div>
        {q && <div style={{marginTop: 26, fontFamily: SANS, fontWeight: 500, fontSize: sq, lineHeight: 1.4, whiteSpace: 'pre', color: C.cream, opacity: eout(prog(age, 0.36, 0.28)), transform: `translateY(${(1 - eout(prog(age, 0.36, 0.3))) * 10}px)`}}>{q}</div>}
      </div>
    </AbsoluteFill>
  );
};

export const End: React.FC<any> = ({e, t}) => (
  <Title e={{...e, l1: '', l2: text(e.title ?? '下期再见'), l2b: '', q: text(e.sub ?? e.l2 ?? ''), s1: undefined, s2: numeric(e.s1, numeric(e.size, 146)), qSize: numeric(e.s2, 42)}} t={t} />
);

// Fixed seeded fibre-edge irregularities: never frame-random and never semantic icons.
const edge = (seed: number, x: number, y: number, w: number, h: number): string => {
  const random = rnd(seed);
  const pts: string[] = [`${x},${y}`];
  for (let i = 0; i <= 16; i++) pts.push(`${x + w + (random() - 0.5) * 6},${y + h * i / 16}`);
  pts.push(`${x},${y + h}`);
  return pts.join(' ');
};

export const Backdrop: React.FC<any> = ({bg, t, lt, cam}) => {
  const light = bg?.type === 'paper';
  const framing = bg?.type === 'title' || bg?.type === 'end';
  const age = numeric(lt, numeric(t, 0) - numeric(bg?.t, 0));
  const settle = eout(prog(age, 0, 0.6));
  // Camera belongs to content. This stock deliberately does not pan or breathe with cam.
  void cam;
  const ground = light ? C.paper : C.dark;
  const sheet = light ? '#d5d0c3' : '#303237';
  return (
    <AbsoluteFill style={{width: 1920, height: 1080, backgroundColor: ground, overflow: 'hidden', pointerEvents: 'none'}}>
      <Img src={staticFile('styles7/paper_dark.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: light ? 0.2 : 0.52, filter: light ? 'grayscale(1) invert(1) contrast(.65)' : 'grayscale(1)', mixBlendMode: light ? 'multiply' : 'soft-light'}} />
      <div style={{position: 'absolute', inset: 0, background: light ? 'radial-gradient(ellipse at 50% 45%,rgba(241,237,223,.24) 0 48%,rgba(69,70,63,.06) 100%)' : 'radial-gradient(ellipse at 50% 45%,transparent 0 48%,rgba(0,0,0,.18) 100%)'}} />
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" aria-hidden style={{position: 'absolute', inset: 0, opacity: 0.8, transform: `translateX(${(1 - settle) * -18}px)`}}>
        <polygon points={edge(71, -10, -8, framing ? 67 : 39, 600)} fill={light ? '#9c9e92' : '#111215'} opacity=".38" transform="translate(5 4)" />
        <polygon points={edge(71, -10, -8, framing ? 67 : 39, 600)} fill={sheet} />
        <polyline points="12,0 14,114 11,205 16,311 13,420 14,572" fill="none" stroke={light ? '#f7f4e9' : '#696b65'} strokeWidth="1.5" opacity=".4" />
        <path d="M1849 1080 L1853 913 L1864 891 L1861 1080 Z" fill={light ? '#bfc0b3' : '#131518'} opacity=".65" />
        <path d="M1861 1080 L1866 905 L1877 876 L1874 1080 Z" fill={sheet} />
      </svg>
      {framing && <svg width="1920" height="1080" viewBox="0 0 1920 1080" aria-hidden style={{position: 'absolute', inset: 0, opacity: eout(prog(age, 0.1, 0.38)) * 0.66}}>
        <path d="M92 0 L411 0 L384 30 L115 32 Z" fill="#111215" transform="translate(3 4)" />
        <path d="M92 0 L411 0 L384 30 L115 32 Z" fill="#3f4145" />
        <path d="M115 39 L298 39 L285 43 L114 42 Z" fill={C.acid} />
      </svg>}
    </AbsoluteFill>
  );
};
