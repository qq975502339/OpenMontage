import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, prog, eout, eio, lerp} from '../lib';

// Topic-neutral intaglio printing: security paper, not a reproduction of money.
const SERIF = "'NSERIF','Noto Serif SC','Songti SC',serif";
const SANS = "'NSC','Noto Sans SC',sans-serif";
const TEX = 'styles7/security.jpg';
const INK = '#493c2d';
const SOFT = '#70644e';
const SAGE = '#d5ddc4';
const PALE = '#ecedde';
const RED = '#a64f42';
const RULE = 'rgba(73,60,45,.32)';

export const preset = (base: any, tx: (c: string, t?: string, size?: string) => any): any => {
  const surface = (c: string, hatch = 0): any => {
    const scan = tx(c, TEX, 'cover');
    if (!hatch) return scan;
    return {
      ...scan,
      backgroundImage: `repeating-linear-gradient(128deg,rgba(73,60,45,${hatch}) 0 1px,transparent 1px 7px),${scan.backgroundImage}`,
      backgroundSize: '7px 7px,cover',
      backgroundBlendMode: 'multiply,multiply',
    };
  };
  const inset = 'inset 0 0 0 1px rgba(236,237,222,.8), inset 0 0 0 5px rgba(73,60,45,.10), inset 0 1px 2px rgba(73,60,45,.18)';
  return {
    ...base,
    name: 'banknote', title: 'banknote', end: 'banknote',
    plates: [TEX], titlePlate: TEX, endPlate: TEX, paperPlate: TEX,
    bezel: {}, crt: false, light: true, fg: 'none', glyph: '', propLook: 'engraving',
    lux: {...base.lux, light: 0, dust: 0, vig: 0.08, grain: 0, bright: 1, warm: false, still: true},
    ink: INK, ink2: SOFT, acc: RED, accInk: PALE,
    pal: {...base.pal, teal: '#72816a', steel: '#7f8770', coral: RED, lime: '#cbd3b3', slate: INK, cream: PALE, gray: '#93937e'},
    f: {title: SERIF, card: SERIF, num: SERIF, body: SANS, doc: SERIF, tok: SERIF},
    num: {
      grad: 'repeating-linear-gradient(118deg,#493c2d 0 3px,#88785d 3px 4px,#493c2d 4px 7px)',
      ext: false, glow: false, font: SERIF, weight: 800, ls: 1, scale: 0.94,
      kc: RED, cc: INK,
    },
    // Rebuild rather than inherit press's torn edges, tape, or halftone icons.
    card: {
      r: 2, torn: false, tape: false, pin: false, frame: false, ruled: false, flat: true,
      base: {...surface(SAGE, 0.045), border: `3px double ${RULE}`, boxShadow: inset},
      lit: {...surface(PALE, 0.035), border: '3px double rgba(166,79,66,.68)', boxShadow: inset},
      dim: [105, 99, 79], on: [73, 60, 45], sdim: [120, 114, 94], son: [127, 62, 51],
      litRing: 'rgba(166,79,66,.58)', icon: 'print',
    },
    paper: {
      bg: {...surface(PALE, 0.018), boxShadow: inset}, r: 2,
      border: `3px double ${RULE}`, hdr: 'transparent', hdrInk: INK, kick: RED,
      bar: 'repeating-linear-gradient(126deg,#75634c 0 4px,#b4b798 4px 5px,#75634c 5px 9px)',
      val: INK, lab: INK, grid: 'rgba(73,60,45,.10)', axis: 'rgba(73,60,45,.55)', sub: SOFT,
      font: SERIF, titleFont: SERIF, phosphor: false, flat: true,
    },
    doc: {
      bg: {...surface('#e8ebd8', 0.018), border: `2px solid ${RULE}`, boxShadow: inset},
      ink: INK, meta: SOFT, font: SERIF, tractor: false,
      hl: 'rgba(166,79,66,.19)', hlBlend: 'multiply', box: RED, under: RED,
    },
    panel: {
      bg: {...surface('#dce2ce', 0.028), boxShadow: inset}, r: 2,
      border: `3px double ${RULE}`, shadow: '0 18px 40px rgba(52,47,32,.15)',
      torn: false, ticks: false, phosphor: false, strip: 'transparent',
      rules: 'rgba(73,60,45,.24)', title: INK, tok: INK, op: SOFT,
      hiBg: {...surface('#e9d9c7', 0.05), border: '1px solid rgba(166,79,66,.45)'},
      hiInk: '#843c31', lab: SOFT, foot: SOFT, arrow: 'rgba(73,60,45,.62)', icon: 'print',
    },
    // Complete window/ledger vocabulary: no partial inherited GUI preset.
    ui: {
      mode: 'window', win: {...surface('#e4e8d5', 0.018), border: `3px double ${RULE}`, boxShadow: inset},
      bar: {...surface('#cbd4b9', 0.065), borderBottom: `3px double ${RULE}`},
      barInk: INK, r: 2, dots: false,
      field: 'linear-gradient(180deg,#f0f0e3,#e8ebd9)', fBorder: '#a8ad91', focus: RED,
      lab: SOFT, val: INK, res: 'repeating-linear-gradient(128deg,rgba(73,60,45,.018) 0 1px,transparent 1px 8px),#eff0e3',
      resBorder: '#a8ad91', rt: SOFT, num: INK, total: '#843c31', lit: 'rgba(166,79,66,.13)',
      font: SANS, numFont: SERIF, shadow: '0 20px 44px rgba(52,47,32,.18)',
    },
    ent: {
      ring: 'repeating-linear-gradient(125deg,#76694e 0 2px,#bcc4a5 2px 4px)',
      bg: surface('#e3e8d2', 0.035), nameInk: INK,
      strip: {...surface('#cbd4b9', 0.06), borderTop: `2px double ${RULE}`}, stripInk: INK,
    },
    pip: {ring: '#776b52', rect: '#e3e8d2'},
  };
};

const stringOf = (v: any) => v == null ? '' : String(v);
const finite = (v: any, fallback: number) => typeof v === 'number' && Number.isFinite(v) ? v : fallback;
const units = (s: string) => Array.from(s).reduce((a, c) => a + (/\s/.test(c) ? 0.34 : /[\u2e80-\uffef]/.test(c) ? 1 : 0.62), 0);
const widest = (s: string) => Math.max(1, ...s.split('\n').map(units));
const lineCount = (s: string) => Math.max(1, s.split('\n').length);
const fitted = (s: string, desired: number, w: number, ls = 2) => Math.max(14, Math.min(desired, (w - widest(s) * ls) / widest(s)));

// Static geometry; time only reveals an existing engraved ribbon once.
const ribbonPath = (w: number, h: number, index: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const x = w * i / 160;
    const u = i / 160;
    const taper = Math.sin(Math.PI * u);
    const y = h / 2 + Math.sin(u * Math.PI * 14 + index * 0.7) * h * 0.31 * taper + Math.sin(u * Math.PI * 2) * (index - 3) * 1.2;
    pts.push(`${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(' ');
};

const Ribbon: React.FC<{w: number; h?: number; p: number; color?: string}> = ({w, h = 36, p, color = SOFT}) => (
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{display: 'block', overflow: 'visible'}}>
    {Array.from({length: 7}, (_, i) => <path key={i} d={ribbonPath(w, h, i)} fill="none" stroke={color}
      strokeWidth={i === 3 ? 1.1 : 0.7} opacity={i === 3 ? 0.72 : 0.42}
      pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - clamp(p))} />)}
  </svg>
);

const EngravedLine: React.FC<{text: string; size: number; p: number; accent?: boolean; align: 'left' | 'center'; ending?: boolean}> = ({text, size, p, accent = false, align, ending}) => {
  const color = accent ? RED : INK;
  const groove = accent ? '#bf7b69' : '#88785d';
  const type: React.CSSProperties = {
    fontFamily: SERIF, fontSize: size, fontWeight: ending ? 700 : 800, letterSpacing: 2,
    whiteSpace: 'pre', lineHeight: 1.16, display: 'inline-block',
  };
  return (
    <div style={{textAlign: align, lineHeight: 1.16, opacity: eout(prog(p, 0, 0.28))}}>
      <span style={{...type, position: 'relative', color, transformOrigin: align === 'left' ? '0 50%' : '50% 50%',
        transform: `translateY(${lerp(12, 0, eout(prog(p, 0, 0.42)))}px) scale(${lerp(1.012, 1, eout(prog(p, 0, 0.42)))})`,
        textShadow: '0 1.3px 0 rgba(248,248,231,.88), 0 -0.6px 0 rgba(48,40,29,.32)'}}>
        <span style={{opacity: 0.36}}>{text}</span>
        <span aria-hidden="true" style={{...type, position: 'absolute', inset: 0, color: 'transparent',
          backgroundImage: `repeating-linear-gradient(118deg,${color} 0 3px,${groove} 3px 3.8px,${color} 3.8px 6.5px)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextStroke: `0.55px ${color}`,
          clipPath: `inset(0 ${(1 - eio(prog(p, 0.06, 0.60))) * 100}% 0 0)`, textShadow: 'none'}}>{text}</span>
      </span>
    </div>
  );
};

const PrintHeading: React.FC<any> = ({e, t, ending = false}) => {
  const dt = finite(t, 0) - finite(e.t, 0);
  const align: 'left' | 'center' = e.align === 'left' ? 'left' : 'center';
  const w = clamp(finite(e.w, 1180), 300, 1680);
  const contentW = w - 24;
  const texts = ending
    ? [stringOf(e.title ?? '下期再见')]
    : [stringOf(e.l1), stringOf(e.l2), stringOf(e.l2b)];
  const q = ending ? stringOf(e.sub ?? e.l2 ?? '') : stringOf(e.q);
  const lines = texts.map((text: string, index: number) => ({
    text, index, size: fitted(text, Math.max(14, finite(index === 0 ? e.s1 : e.s2, index === 0 ? (ending ? 150 : 128) : 196)), contentW),
  })).filter((x: any) => x.text !== '');
  const qSize0 = fitted(q, 38, contentW, 1);
  const gap0 = 15;
  const headlineH = lines.reduce((n: number, x: any) => n + x.size * 1.16 * lineCount(x.text), 0) + Math.max(0, lines.length - 1) * gap0;
  const qH0 = q ? qSize0 * 1.5 * lineCount(q) + 24 : 0;
  // Even explicit size overrides and multiline text retain a bounded safe-area height.
  const shrink = Math.min(1, 520 / Math.max(1, headlineH + qH0 + 94));
  const qSize = qSize0 * shrink;
  const gap = gap0 * shrink;
  const textH = lines.reduce((n: number, x: any) => n + x.size * shrink * 1.16 * lineCount(x.text), 0) + Math.max(0, lines.length - 1) * gap;
  const qH = q ? qSize * 1.5 * lineCount(q) + 24 * shrink : 0;
  const h = textH + qH + 94;
  const left = align === 'left'
    ? clamp(finite(e.x, 120), 120, 1800 - w)
    : clamp(finite(e.x, 960), 120 + w / 2, 1800 - w / 2) - w / 2;
  const centerY = clamp(finite(e.y, 545), 100 + h / 2, 900 - h / 2);
  const ribbonW = Math.min(contentW, ending ? 430 : 590);
  const rp = eio(prog(dt, 0.18, 0.58));
  if (!lines.length && !q) return null;
  return (
    <AbsoluteFill style={{width: 1920, height: 1080, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left, top: centerY - h / 2, width: w, height: h,
        textAlign: align, padding: '0 12px', boxSizing: 'border-box'}}>
        <div style={{width: ribbonW, margin: align === 'left' ? '0 0 16px' : '0 auto 16px', opacity: eout(prog(dt, 0, 0.3))}}>
          <Ribbon w={ribbonW} h={30} p={rp} />
        </div>
        {lines.map((ln: any, i: number) => (
          <div key={ln.index} style={{marginTop: i ? gap : 0}}>
            <EngravedLine text={ln.text} size={ln.size * shrink} p={dt - i * 0.10} accent={!ending && ln.index === 2} align={align} ending={ending} />
          </div>
        ))}
        {q && <div style={{fontFamily: SANS, fontWeight: 500, fontSize: qSize, color: SOFT,
          lineHeight: 1.5, letterSpacing: 1, whiteSpace: 'pre', marginTop: 24 * shrink,
          opacity: eout(prog(dt, 0.34, 0.4)), transform: `translateY(${lerp(7, 0, eout(prog(dt, 0.34, 0.4)))}px)`}}>{q}</div>}
        <div style={{position: 'relative', height: 32, marginTop: 16, width: Math.min(contentW, ribbonW * 0.74),
          marginLeft: align === 'left' ? 0 : 'auto', marginRight: align === 'left' ? 0 : 'auto', opacity: eout(prog(dt, 0.25, 0.35))}}>
          <div style={{position: 'absolute', top: 9, left: 0, right: 0, height: 1,
            background: RULE, transform: `scaleX(${rp})`, transformOrigin: align === 'left' ? '0 50%' : '50% 50%'}} />
          <div style={{position: 'absolute', top: 13, left: 0, right: 0, height: 1,
            background: 'rgba(73,60,45,.18)', transform: `scaleX(${rp})`, transformOrigin: align === 'left' ? '0 50%' : '50% 50%'}} />
          <div style={{position: 'absolute', left: align === 'left' ? 0 : '50%', top: 7, width: ending ? 44 : 70, height: 5,
            background: RED, transform: `translateX(${align === 'left' ? 0 : -50}%) scaleX(${eio(prog(dt, 0.42, 0.28))})`,
            transformOrigin: align === 'left' ? '0 50%' : '50% 50%'}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Title: React.FC<any> = ({e, t}) => <PrintHeading e={e ?? {}} t={t} />;
export const End: React.FC<any> = ({e, t}) => <PrintHeading e={e ?? {}} t={t} ending />;

export const Backdrop: React.FC<any> = ({bg, t, lt, cam}) => {
  const paper = bg?.type === 'paper';
  const framed = bg?.type === 'title' || bg?.type === 'end';
  const dt = typeof lt === 'number' && Number.isFinite(lt) ? lt : finite(t, 0) - finite(bg?.t, 0);
  const p = eio(prog(dt, 0, 0.64));
  // The host owns camera movement; this full-bleed paper never floats independently.
  void cam;
  const field = paper ? PALE : '#d2dbc0';
  const edgeOpacity = paper ? 0.19 : 0.29;
  return (
    <AbsoluteFill style={{width: 1920, height: 1080, overflow: 'hidden', backgroundColor: field, pointerEvents: 'none'}}>
      <Img src={staticFile('styles7/security.jpg')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080,
        objectFit: 'cover', opacity: paper ? 0.36 : 0.48, mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 47%,${paper ? 'rgba(236,237,222,.74)' : 'rgba(213,221,196,.70)'} 0%,transparent 76%)`}} />
      <div style={{position: 'absolute', inset: 0, opacity: edgeOpacity,
        backgroundImage: 'repeating-linear-gradient(127deg,rgba(73,60,45,.46) 0 .8px,transparent .8px 6px)',
        maskImage: 'linear-gradient(90deg,#000 0,transparent 180px,transparent calc(100% - 180px),#000 100%)',
        WebkitMaskImage: 'linear-gradient(90deg,#000 0,transparent 180px,transparent calc(100% - 180px),#000 100%)'}} />
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" aria-hidden="true" style={{position: 'absolute', inset: 0, opacity: framed ? 0.38 : 0.24}}>
        <g fill="none" stroke={INK} strokeWidth={0.9}>
          <path d="M0 54 H440 M0 59 H352" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - p)} />
          <path d="M1480 1022 H1920 M1568 1027 H1920" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - p)} />
          {framed && <>
            <path d="M1480 54 H1920 M1568 59 H1920" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - p)} />
            <path d="M0 1022 H440 M0 1027 H352" pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - p)} />
          </>}
        </g>
        <g transform="translate(-32 5)" opacity={0.65}>
          {Array.from({length: 7}, (_, i) => <path key={i} d={ribbonPath(610, 34, i)} stroke={SOFT} strokeWidth={0.75} fill="none"
            pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - p)} />)}
        </g>
        <g transform="translate(1342 1040)" opacity={0.65}>
          {Array.from({length: 7}, (_, i) => <path key={i} d={ribbonPath(610, 34, i)} stroke={SOFT} strokeWidth={0.75} fill="none"
            pathLength={100} strokeDasharray="100 100" strokeDashoffset={100 * (1 - p)} />)}
        </g>
      </svg>
      <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 70px rgba(71,65,43,.075), inset 0 2px 0 rgba(248,248,231,.6)'}} />
    </AbsoluteFill>
  );
};
