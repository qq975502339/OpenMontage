import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, prog, eout, eio, lerp, back, rnd} from '../lib';

// Empty board + episode-supplied evidence. No dossiers, seals or topic assets.
const SANS = "'NSC',sans-serif";
const SERIF = "'NSERIF','NSC',serif";
const HAND = "'MSZ','NSC',sans-serif";
const NUMBER = "'DIN','NSC',sans-serif";
const INK = '#29261f';
const RED = '#aa3028';
const MANILA = '#e7d4a5';
const PAPER = '#f3ead5';
const CONTACT = '0 2px 3px rgba(43,27,13,.32), 0 9px 19px rgba(43,27,13,.19)';
const FIBER = 'tex/fiber.jpg';
const finite = (n: any, fallback: number) => Number.isFinite(Number(n)) && n != null ? Number(n) : fallback;
const text = (s: any) => s == null ? '' : String(s);
const paperSurface = (color: string): React.CSSProperties => ({
  backgroundColor: color,
  backgroundImage: `url(${staticFile(FIBER)})`,
  backgroundBlendMode: 'multiply', backgroundSize: 'cover', backgroundPosition: 'center',
});

export const preset = (base: any, tx: (c: string, t?: string, size?: string) => any): any => ({
  ...base,
  name: 'casefile', title: 'casefile', end: 'casefile',
  plates: ['styles7/cork.jpg'], titlePlate: 'styles7/cork.jpg',
  endPlate: 'styles7/cork.jpg', paperPlate: 'styles7/cork.jpg',
  light: true, crt: false, fg: 'none', glyph: '', propLook: 'product_photo',
  ink: INK, ink2: '#605649', acc: RED, accInk: PAPER,
  lux: {...base.lux, light: 0, dust: 0, warm: true, vig: 0.12, grain: 0.025, bright: 1, still: true},
  pal: {...base.pal, teal: '#53665c', steel: '#62655e', coral: RED, lime: MANILA, slate: INK, cream: PAPER, gray: '#908574'},
  f: {...base.f, title: SERIF, card: SANS, num: NUMBER, body: SANS, doc: SERIF, tok: SANS},
  // Do not use BigNum's hard-coded newspaper clip or ruled index wrappers.
  num: {...base.num, grad: undefined, blend: 'normal', color: PAPER, ext: false,
    extc: undefined, glow: false, phosphor: undefined, card: false, dims: false,
    font: NUMBER, weight: 400, ls: 0, scale: 1, kc: '#f3d9a8', cc: PAPER},
  card: {...base.card, r: 2, torn: false, tape: false, pin: true,
    ruled: false, frame: false, flat: false, tilt: 1.2, glow: undefined,
    base: {...tx(MANILA, FIBER), border: '1px solid rgba(88,65,35,.25)', boxShadow: 'inset 0 1px 0 rgba(255,250,230,.65)'},
    lit: {...tx(PAPER, FIBER), border: '1px solid rgba(88,65,35,.35)', boxShadow: CONTACT},
    dim: [103, 91, 73], on: [41, 38, 31], sdim: [117, 101, 80], son: [125, 45, 36],
    litRing: RED, icon: 'print'},
  paper: {...base.paper, bg: {...tx(PAPER, FIBER), boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6)'},
    r: 2, border: '1px solid rgba(88,65,35,.24)', frame: undefined,
    flat: false, phosphor: false, hdr: tx(MANILA, FIBER), hdrInk: INK,
    kick: RED, bar: RED, blend: 'normal', val: INK, lab: INK,
    grid: 'rgba(74,58,36,.11)', axis: '#776650', sub: '#766a59',
    font: SANS, titleFont: SERIF},
  doc: {...base.doc, bg: {...tx(PAPER, FIBER), border: '1px solid rgba(88,65,35,.22)'},
    ink: INK, meta: '#766a59', font: SERIF, tractor: false, frame: undefined,
    hl: 'rgba(170,48,40,.19)', hlInk: undefined, hlBlend: 'multiply', box: RED, under: RED},
  panel: {...base.panel, bg: tx(MANILA, FIBER), r: 2,
    border: '1px solid rgba(88,65,35,.3)', shadow: CONTACT, torn: false,
    ticks: false, phosphor: false, sticky: undefined, cell: undefined,
    strip: 'transparent', rules: 'rgba(82,64,40,.32)',
    title: INK, tok: INK, op: '#776650', hiBg: 'transparent', hiRing: RED,
    hiInk: RED, lab: '#4d4437', foot: '#665947', arrow: RED, icon: 'print'},
  // Complete supported window/ledger schema; no inherited OS chrome.
  ui: {...base.ui, mode: 'window', win: {...tx(PAPER, FIBER), border: '1px solid rgba(88,65,35,.3)'},
    bar: tx(MANILA, FIBER), barInk: INK, r: 2, dots: false,
    field: '#f8f1df', fBorder: '#b4a17c', focus: RED,
    lab: '#665947', val: INK, res: '#eee0bd', resBorder: '#b4a17c', rt: '#766a59',
    num: INK, total: RED, lit: 'rgba(170,48,40,.13)',
    font: SANS, numFont: NUMBER, shadow: CONTACT},
  ent: {...base.ent, ring: '#b29c72', bg: tx(PAPER, FIBER), name: undefined,
    nameInk: INK, strip: tx(MANILA, FIBER), stripInk: INK},
  pip: {...base.pip, ring: PAPER, rect: PAPER},
});

const glyphWidth = (s: string) => Math.max(1, ...s.split('\n').map(line =>
  Array.from(line).reduce((n, c) => n + (/[^\u0000-\u00ff]/.test(c) ? 1 : /[MW@]/.test(c) ? 0.82 : 0.6), 0)));
const fitSize = (s: string, requested: number, width: number) =>
  Math.max(1, Math.min(requested, width / (glyphWidth(s) * 1.04)));
const lines = (s: string) => s.split('\n').length;

const Tack: React.FC<{x: number; y: number; p: number}> = ({x, y, p}) => (
  <div style={{position: 'absolute', left: x - 7, top: y - 7, width: 14, height: 14,
    borderRadius: '50%', opacity: p, transform: `scale(${lerp(1.4, 1, p)})`,
    background: 'radial-gradient(circle at 35% 28%,#e0d4bb 0 10%,#a9926e 30%,#63503a 72%,#372b1e)',
    boxShadow: '1px 3px 2px rgba(43,27,13,.4), inset 0 0 0 1px rgba(255,248,227,.2)'}} />
);

// The thread only joins two supplied title clauses, never arbitrary board points.
const Thread: React.FC<{y1: number; y2: number; p: number}> = ({y1, y2, p}) => {
  const x = 37;
  const sag = lerp(27, 8, p);
  const d = `M${x} ${y1} C${x - sag} ${lerp(y1, y2, .3)},${x + sag} ${lerp(y1, y2, .72)},${x} ${y2}`;
  return <>
    <svg width="78" height={Math.max(y1, y2) + 24} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: p}}>
      <path d={d} fill="none" stroke="rgba(58,28,16,.24)" strokeWidth="4" transform="translate(1 2)" />
      <path d={d} fill="none" stroke={RED} strokeWidth="2.6" strokeLinecap="round" pathLength="1"
        strokeDasharray="1" strokeDashoffset={1 - p} />
      <path d={d} fill="none" stroke="rgba(233,142,116,.45)" strokeWidth=".65" pathLength="1"
        strokeDasharray="1" strokeDashoffset={1 - p} />
    </svg>
    <Tack x={x} y={y1} p={p} /><Tack x={x} y={y2} p={p} />
  </>;
};

const InkLine: React.FC<{w: number; p: number; closing?: boolean}> = ({w, p, closing}) => (
  <svg width={w} height="22" viewBox={`0 0 ${w} 22`} style={{display: 'block', overflow: 'visible'}}>
    <path d={`M3 11 Q${w * .3} 16 ${w * .67} 9 T${w - 4} 10`} fill="none" stroke={RED}
      strokeWidth="4.6" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - p} opacity={p > 0 ? .9 : 0} />
    {closing && <path d={`M${w * .78} 19 Q${w * .9} 15 ${w - 3} 17`} fill="none" stroke={RED}
      strokeWidth="2.1" strokeLinecap="round" pathLength="1" strokeDasharray="1"
      strokeDashoffset={1 - eout(prog(p, .66, .34))} opacity={p > .66 ? .75 : 0} />}
  </svg>
);

const CaptionSheet: React.FC<{e: any; t: number; closing?: boolean}> = ({e, t, closing = false}) => {
  const dt = finite(t, 0) - finite(e.t, 0);
  const first = text(e.l1), second = text(e.l2), continuation = text(e.l2b), question = text(e.q);
  const rows = [
    ...(first ? [{s: first, font: SERIF, size: finite(e.s1, 128), weight: 800}] : []),
    ...(second ? [{s: second, font: SANS, size: finite(e.s2, first ? 176 : 196), weight: 900}] : []),
    ...(continuation ? [{s: continuation, font: SANS, size: finite(e.s2, 142), weight: 900}] : []),
  ];
  if (!rows.length && !question) return null;
  // x/y are the area's centre for both alignments; align changes text, not anchors.
  const w = clamp(finite(e.w, closing ? 1280 : 1480), 480, 1640);
  const pad = 80, inner = w - pad * 2;
  const qs0 = question ? fitSize(question, 48, inner) : 0;
  const sizes0 = rows.map(r => fitSize(r.s, r.size, inner));
  const fixedHeight = 116 + rows.length * 20 + (question ? 38 : 0);
  const flexibleHeight = rows.reduce((n, r, i) => n + sizes0[i] * 1.17 * lines(r.s), 0)
    + (question ? qs0 * 1.32 * lines(question) : 0);
  const scale = Math.min(1, (700 - fixedHeight) / Math.max(1, flexibleHeight));
  const sizes = sizes0.map(s => s * scale), qs = qs0 * scale;
  const heights = rows.map((r, i) => sizes[i] * 1.17 * lines(r.s));
  const h = Math.max(230, 116 + heights.reduce((n, v) => n + v + 20, 0)
    + (question ? qs * 1.32 * lines(question) + 38 : 0));
  const x = clamp(finite(e.x, 960), 140 + w / 2, 1780 - w / 2);
  const y = clamp(finite(e.y, 500), 140 + h / 2, 860 - h / 2);
  const left = e.align === 'left';
  const settle = eout(prog(dt, 0, .55));
  const contact = eio(prog(dt, .14, .35));
  const pen = eio(prog(dt, closing ? .5 : .72, .38));
  const thread = eio(prog(dt, .36, .46));
  const tilt = (rnd(31)() - .5) * 2.2;
  const underlineW = Math.max(50, Math.min(inner, rows.length ? glyphWidth(rows[rows.length - 1].s) * sizes[sizes.length - 1] * .88 : inner * .4));
  let rowY = 54;
  const anchors: number[] = [];
  rows.forEach((_, i) => {anchors.push(rowY + heights[i] * .56); rowY += heights[i] + 20;});
  return <AbsoluteFill style={{pointerEvents: 'none', width: 1920, height: 1080}}>
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h,
      opacity: settle, transformOrigin: '50% 18%',
      transform: `translateY(${(1 - settle) * -24}px) rotate(${tilt * (1 - settle)}deg) scale(${lerp(.985, 1, clamp(back(prog(dt, 0, .55)), 0, 1.012))})`,
      ...paperSurface(MANILA), borderRadius: 2, border: '1px solid rgba(87,64,35,.28)',
      boxShadow: `0 2px 3px rgba(37,25,13,${.22 + .12 * contact}), 0 ${lerp(22, 9, contact)}px ${lerp(32, 19, contact)}px rgba(37,25,13,${.12 + .07 * contact}), inset 0 1px 0 rgba(255,249,225,.65)`}}>
      <div style={{position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(112deg,rgba(255,248,224,.22),transparent 36%,transparent 84%,rgba(105,77,40,.07))'}} />
      {/* A physical corner fold, not a decorative file number or stamp. */}
      <div style={{position: 'absolute', right: -1, bottom: -1, width: 32, height: 32,
        background: 'linear-gradient(135deg,transparent 49%,#c9b482 50%,#efdfb6 57%,#dfc895 100%)',
        filter: 'drop-shadow(-1px -1px 1px rgba(51,34,17,.13))'}} />
      {first && second && <Thread y1={anchors[0]} y2={anchors[1]} p={thread} />}
      <div style={{position: 'relative', padding: `54px ${pad}px 48px`, textAlign: left ? 'left' : 'center', color: INK}}>
        {rows.map((r, i) => {
          const reveal = eout(prog(dt, .1 + i * .09, .34));
          return <div key={i} style={{fontFamily: r.font, fontWeight: r.weight, fontSize: sizes[i], lineHeight: 1.17,
            letterSpacing: '-.025em', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere',
            marginBottom: 20, opacity: reveal, transform: `translateY(${(1 - reveal) * 9}px)`,
            textShadow: '0 1px 0 rgba(255,248,225,.3)'}}>{r.s}</div>;
        })}
        <div style={{width: underlineW, marginTop: -13, marginLeft: left ? 0 : 'auto', marginRight: left ? 0 : 'auto'}}>
          <InkLine w={underlineW} p={pen} closing={closing} />
        </div>
        {question && <div style={{marginTop: 24, fontFamily: HAND, fontWeight: 400, fontSize: qs,
          lineHeight: 1.32, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: RED,
          opacity: eout(prog(dt, .68, .35)), transform: `translateX(${(1 - eout(prog(dt, .68, .35))) * -12}px)`}}>{question}</div>}
      </div>
    </div>
  </AbsoluteFill>;
};

export const Title: React.FC<any> = ({e, t}) => <CaptionSheet e={e ?? {}} t={t} />;
export const End: React.FC<any> = ({e = {}, t}) => <CaptionSheet closing t={t} e={{...e,
  l1: '', l2: e.title ?? '下期再见', l2b: '', q: e.sub ?? e.l2 ?? '',
}} />;

export const Backdrop: React.FC<any> = ({bg = {}, t, lt, cam}) => {
  const paper = bg.type === 'paper';
  const framing = bg.type === 'title' || bg.type === 'end';
  const local = finite(lt, finite(t, 0) - finite(bg.t, 0));
  const landed = eout(prog(local, 0, .65));
  // cam is intentionally not reapplied: the scene wrapper owns its camera.
  void cam;
  return <AbsoluteFill style={{width: 1920, height: 1080, overflow: 'hidden', backgroundColor: paper ? PAPER : '#a17b50', pointerEvents: 'none'}}>
    <Img src={staticFile('styles7/cork.jpg')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080,
      objectFit: 'cover', transform: `scale(${lerp(1.012, 1, landed)})`,
      filter: 'saturate(.72) brightness(.94)', opacity: paper ? .09 : 1}} />
    {paper && <div style={{position: 'absolute', inset: 0, ...paperSurface(PAPER), opacity: .97,
      boxShadow: 'inset 0 1px 0 rgba(255,252,237,.8)'}} />}
    <div style={{position: 'absolute', inset: 0,
      background: paper
        ? 'linear-gradient(115deg,rgba(255,252,236,.15),transparent 36%,transparent 80%,rgba(93,67,34,.025))'
        : 'radial-gradient(ellipse at 48% 42%,rgba(255,233,191,.16),transparent 66%), linear-gradient(110deg,rgba(60,38,18,.10),transparent 22%,transparent 82%,rgba(60,38,18,.10))'}} />
    <div style={{position: 'absolute', inset: 0, boxShadow: paper
      ? 'inset 0 0 80px rgba(90,67,36,.045)'
      : `inset 0 0 ${framing ? 130 : 90}px rgba(48,30,14,${framing ? .2 : .12})`}} />
    {/* Narrow material edges remain outside the content safe area. */}
    {!paper && <>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 22,
        background: 'linear-gradient(90deg,#665038,#856846)', boxShadow: '3px 0 7px rgba(34,23,13,.24)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 18,
        background: 'linear-gradient(180deg,#806342,#5c4934)', boxShadow: '0 -2px 5px rgba(34,23,13,.21)'}} />
    </>}
  </AbsoluteFill>;
};
