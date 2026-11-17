import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, prog, eout, eio, lerp, rnd} from '../lib';

// Standalone style: no theme/skins dependency; all times below are in seconds.
const HAND = "'MSZ','NSC',sans-serif";
const SANS = "'NSC',sans-serif";
const SERIF = "'NSERIF','NSC',serif";
const WHITE = '#f4f0df', YELLOW = '#ead777', GREEN = '#173b31', INK = '#24392f';
const SLATE = 'styles7/slate.jpg';
const n = (v: any, fallback: number) => Number.isFinite(Number(v)) && v != null ? Number(v) : fallback;
const text = (v: any) => String(v ?? '');
const units = (c: string) => /[\u2e80-\uffef]/u.test(c) ? 1 : /\s/u.test(c) ? 0.36 : 0.62;
const measure = (s: string) => Array.from(s).reduce((sum, c) => sum + units(c), 0);

// Every sub-token is rebuilt, rather than inheriting cut-paper or metallic finance flags.
export const preset = (base: any, tx: (c: string, t?: string, size?: string) => any): any => {
  const slate = (c: string): any => ({...tx(c, SLATE), backgroundBlendMode: 'soft-light'});
  const sheet = (c = '#f1ead7'): any => ({
    ...tx(c, 'tex/fiber.jpg'),
    backgroundImage: `repeating-linear-gradient(180deg, transparent 0 51px, rgba(69,91,74,.10) 51px 52px), url(${staticFile('tex/fiber.jpg')})`,
    backgroundSize: '100% 52px, cover', backgroundPosition: '0 17px, center',
    boxShadow: 'inset 0 0 0 1px rgba(61,72,47,.17), inset 0 2px 0 rgba(255,255,245,.65)',
  });
  return {
    ...base,
    name: 'chalk', title: 'chalk', end: 'chalk', propLook: 'lineart_white',
    plates: [SLATE], titlePlate: SLATE, endPlate: SLATE, paperPlate: 'tex/fiber.jpg', bezel: {},
    crt: false, light: false, fg: 'none', glyph: '',
    ink: WHITE, ink2: '#c2cec0', acc: YELLOW, accInk: INK,
    lux: {...base?.lux, light: 0, a: '238,230,199', b: '185,205,183', dust: 0, warm: false, vig: 0.14, grain: 0.025, bright: 1, still: true},
    pal: {teal: '#688b79', steel: '#82978b', coral: '#b6ad93', lime: YELLOW, slate: GREEN, cream: '#f1ead7', gray: '#a6b5a7'},
    f: {title: HAND, card: HAND, num: HAND, body: SANS, doc: SERIF, tok: HAND},
    num: {color: YELLOW, ext: false, glow: false, font: HAND, weight: 400, ls: 1, scale: 1, kc: '#c2cec0', cc: WHITE},
    card: {
      r: 2, tilt: 0.55, flat: true, icon: 'ink',
      base: {...slate('#21493b'), border: '2px solid rgba(237,237,211,.42)', borderRadius: '3px 7px 4px 6px', boxShadow: 'inset 1px -1px 0 rgba(232,231,204,.15)'},
      lit: {...slate('#2b5041'), border: '2px solid rgba(234,215,119,.82)', borderRadius: '5px 3px 6px 2px', boxShadow: 'inset -1px 1px 0 rgba(234,215,119,.25)'},
      dim: [199, 211, 194], on: [244, 224, 127], sdim: [178, 195, 180], son: [242, 238, 220],
    },
    paper: {
      bg: sheet(), r: 2, hdr: 'transparent', hdrInk: INK, kick: '#546e50',
      bar: `repeating-linear-gradient(174deg, #42614b 0 8px, #5a7557 8px 9px, #42614b 9px 17px)`,
      blend: 'normal', val: INK, lab: '#334a3d', grid: 'rgba(57,78,58,.13)', axis: 'rgba(46,68,48,.62)', sub: '#6c7666',
      font: SANS, titleFont: HAND,
    },
    doc: {bg: sheet('#f4edde'), ink: '#27382f', meta: '#6c7666', font: SERIF, hl: 'rgba(229,205,91,.43)', hlBlend: 'multiply', box: '#61734d', under: '#788354'},
    panel: {
      bg: {...slate('#1c4034'), borderRadius: '4px 6px 3px 7px'}, r: 2, border: '2px solid rgba(238,237,214,.44)',
      shadow: '0 14px 30px rgba(4,18,12,.23)', strip: 'transparent', title: WHITE, tok: WHITE, op: '#b8cbb7',
      hiBg: {...slate('#314e36'), borderBottom: '4px solid rgba(234,215,119,.80)'}, hiInk: YELLOW,
      lab: '#ced5c4', foot: '#c2cec0', arrow: '#c8d0bd', icon: 'ink',
    },
    ui: {
      mode: 'window', win: sheet(), bar: {...slate('#244738'), borderBottom: '2px solid rgba(238,237,214,.5)'}, barInk: WHITE,
      r: 2, dots: false, field: 'rgba(253,249,231,.70)', fBorder: '#98a18c', focus: '#718447', lab: '#59674f',
      val: INK, res: 'rgba(248,242,220,.66)', resBorder: '#98a18c', rt: '#6c7666', num: '#345b42', total: '#345b42',
      lit: 'rgba(234,215,119,.25)', font: SANS, numFont: HAND,
      shadow: '0 16px 32px rgba(5,20,13,.24), 0 2px 3px rgba(5,20,13,.22)',
    },
    ent: {ring: '#d3d7c0', bg: slate('#264939'), nameInk: WHITE, strip: sheet(), stripInk: INK},
    pip: {ring: '#d3d7c0', rect: 'rgba(241,234,215,.95)'},
  };
};

type Glyph = {c: string; accent: boolean};
type Row = {chars: Glyph[]; size: number; delay: number};
const rowsOf = (a: string, b = ''): Glyph[][] => {
  const rows: Glyph[][] = [[]];
  [a, b].forEach((s, k) => Array.from(s).forEach((c) => {
    if (c === '\n') rows.push([]); else rows[rows.length - 1].push({c, accent: k === 1});
  }));
  return rows.filter((row) => row.length > 0);
};
const roughFill = (color: string): React.CSSProperties => ({
  color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text',
  backgroundImage: `repeating-linear-gradient(176deg, ${color} 0 6px, ${color}dd 6px 6.7px, transparent 6.7px 7.1px, ${color} 7.1px 13px), repeating-linear-gradient(89deg, ${color} 0 13px, transparent 13px 14px)`,
  backgroundBlendMode: 'normal', WebkitTextStroke: `0.28px ${color}99`,
});

// A rubbed leading edge stays inside this text strip; it is not a screen-wide wipe.
const ChalkLine: React.FC<{row: Row; local: number; align: 'left' | 'center'; index: number}> = ({row, local, align, index}) => {
  const p = eio(prog(local, row.delay, 0.64));
  const edge = p * 100;
  const clip = p >= 1 ? undefined : `polygon(0 0, ${edge}% 0, ${Math.max(0, edge - 0.9)}% 19%, ${edge}% 39%, ${Math.max(0, edge - 0.5)}% 69%, ${edge}% 100%, 0 100%)`;
  const rub = prog(local, row.delay, 0.64);
  return <div style={{height: row.size * 1.24, position: 'relative', display: 'flex', justifyContent: align === 'left' ? 'flex-start' : 'center', alignItems: 'center', overflow: 'hidden'}}>
    <div style={{display: 'inline-flex', position: 'relative', clipPath: clip, opacity: p > 0 ? 1 : 0, transform: `translateY(${lerp(5, 0, eout(prog(local, row.delay, 0.38)))}px)`}}>
      {row.chars.map((g, i) => {
        const rng = rnd(113 + index * 191 + i * 17);
        const tilt = lerp(-0.75, 0.75, rng());
        const settle = eout(prog(local, row.delay + i * 0.018, 0.21));
        return <span key={i} style={{...roughFill(g.accent ? YELLOW : WHITE), fontFamily: HAND, fontWeight: 400, fontSize: row.size,
          display: 'inline-block', width: `${units(g.c) + 0.018}em`, lineHeight: 1.18, whiteSpace: 'pre', textAlign: 'center',
          opacity: lerp(0.68, 1, settle), transform: `translateY(${lerp(3, 0, settle)}px) rotate(${tilt.toFixed(2)}deg)`}}>{g.c}</span>;
      })}
      {rub > 0 && rub < 1 && <div style={{position: 'absolute', left: `calc(${edge}% - 16px)`, top: '12%', bottom: '13%', width: 24,
        background: 'linear-gradient(90deg,transparent,rgba(225,234,208,.13),transparent)', opacity: Math.sin(rub * Math.PI), transform: 'skewX(-9deg)', pointerEvents: 'none'}} />}
    </div>
  </div>;
};

const ChalkStroke: React.FC<{w: number; p: number}> = ({w, p}) => (
  <svg width={w} height={27} viewBox={`0 0 ${w} 27`} style={{display: 'block', overflow: 'visible'}} aria-hidden="true">
    <path d={`M4 14 Q${w * .19} 8 ${w * .37} 13 T${w * .72} 11 L${w - 6} 14`} fill="none" stroke={YELLOW} strokeWidth={5.2} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={.92} />
    <path d={`M8 18 Q${w * .42} 13 ${w * .69} 17 L${w - 17} 16`} fill="none" stroke={YELLOW} strokeWidth={1.1} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} opacity={.4} />
  </svg>
);

const wrapPaper = (s: string, capacity: number) => {
  const lines: string[] = [];
  s.split('\n').forEach((source) => {
    let line = '', len = 0;
    Array.from(source).forEach((c) => {
      const u = units(c);
      if (line && len + u > capacity) {lines.push(line); line = ''; len = 0;}
      line += c; len += u;
    });
    lines.push(line);
  });
  return lines;
};

// x/y are content-centre anchors for both alignments; alignment affects the inner composition.
const BoardHeading: React.FC<any> = ({e, t, first, second, accent, note, end = false}) => {
  const local = n(t, 0) - n(e.t, 0);
  const align: 'left' | 'center' = e.align === 'left' ? 'left' : 'center';
  const w = clamp(n(e.w, 1520), 280, 1640);
  const left = clamp(n(e.x, 960) - w / 2, 132, 1788 - w);
  const group1 = rowsOf(first), group2 = rowsOf(second, accent);
  const fit = (rows: Glyph[][], desired: number) => Math.min(clamp(desired, 24, 240), (w - 28) / Math.max(1, ...rows.map((row) => row.reduce((sum, g) => sum + units(g.c) + .018, 0))));
  const s1 = fit(group1, n(e.s1, end ? 168 : 150));
  const s2 = fit(group2, n(e.s2, first ? 176 : 196));
  const rows: Row[] = [...group1.map((chars) => ({chars, size: s1, delay: .06})), ...group2.map((chars) => ({chars, size: s2, delay: .22}))]
    .map((row, i) => ({...row, delay: row.delay + i * .13}));
  const noteSize = 36, noteW = Math.min(w, Math.max(340, measure(note) * noteSize + 72));
  const noteLines = note ? wrapPaper(note, (noteW - 68) / noteSize) : [];
  const paperH = noteLines.length ? noteLines.length * 52 + 38 : 0;
  const naturalH = rows.reduce((sum, row) => sum + row.size * 1.24, 0) + (rows.length ? 47 : 0) + (note ? paperH + 32 : 0);
  const scale = Math.min(1, 760 / Math.max(1, naturalH));
  const height = naturalH * scale;
  const top = clamp(n(e.y, 540) - height / 2, 112, 880 - height);
  const lastDelay = rows.length ? rows[rows.length - 1].delay : 0;
  const strokeP = eio(prog(local, lastDelay + .5, .44));
  const paperP = eout(prog(local, lastDelay + .67, .34));
  if (!rows.length && !note) return null;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left, top, width: w, height}}>
      <div style={{width: w, transform: `scale(${scale})`, transformOrigin: align === 'left' ? '0 0' : '50% 0', display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'center'}}>
        {rows.map((row, i) => <div key={i} style={{width: w}}><ChalkLine row={row} local={local} align={align} index={i} /></div>)}
        {rows.length > 0 && <div style={{width: Math.min(w * .56, 770), height: 47, paddingTop: 5, alignSelf: align === 'left' ? 'flex-start' : 'center'}}><ChalkStroke w={Math.min(w * .56, 770)} p={strokeP} /></div>}
        {note && <div style={{position: 'relative', width: noteW, marginTop: 32, height: paperH, boxSizing: 'border-box', padding: '19px 34px',
          backgroundColor: '#f1ead7', backgroundImage: `repeating-linear-gradient(180deg,transparent 0 51px,rgba(60,91,72,.12) 51px 52px), url(${staticFile('tex/fiber.jpg')})`,
          backgroundSize: '100% 52px, cover', backgroundPosition: '0 12px, center', backgroundBlendMode: 'multiply',
          border: '1px solid rgba(67,77,49,.27)', borderRadius: '2px 4px 3px 1px', boxShadow: '0 5px 10px rgba(0,14,8,.22), inset 0 1px rgba(255,255,244,.68)',
          opacity: paperP, transform: `translateY(${lerp(12, 0, paperP)}px) rotate(${lerp(-.8, -.3, paperP)}deg)`,
          fontFamily: SANS, fontWeight: 500, fontSize: noteSize, lineHeight: '52px', color: INK}}>
          <div style={{position: 'absolute', left: 22, top: 12, bottom: 12, width: 1, background: 'rgba(94,115,69,.25)'}} />
          {noteLines.map((line, i) => <div key={i} style={{whiteSpace: 'pre', textAlign: align}}>{line || '\u00a0'}</div>)}
        </div>}
      </div>
    </div>
  </AbsoluteFill>;
};

export const Title: React.FC<any> = ({e, t}) => <BoardHeading e={e} t={t} first={text(e.l1)} second={text(e.l2)} accent={text(e.l2b)} note={text(e.q)} />;
export const End: React.FC<any> = ({e, t}) => <BoardHeading e={e} t={t} first={text(e.title ?? '下期再见')} second="" accent="" note={text(e.sub ?? e.l2 ?? '')} end />;

const edgeRng = rnd(7853);
const traces = Array.from({length: 10}, (_, i) => ({
  x: 90 + edgeRng() * 1650, y: i < 5 ? 24 + edgeRng() * 48 : 1004 + edgeRng() * 43,
  w: 40 + edgeRng() * 135, bend: edgeRng() * 6 - 3, opacity: .025 + edgeRng() * .024,
}));

// No cards, diagrams, labels, symbols or theme-specific props are baked into the plate.
export const Backdrop: React.FC<any> = ({bg, t, lt, cam: _cam}) => {
  const paper = bg?.type === 'paper';
  const local = Math.max(0, n(lt, n(t, 0) - n(bg?.t, 0)));
  const frame = bg?.type === 'title' || bg?.type === 'end';
  const erase = eio(prog(local, .08, .72));
  const eraseOpacity = (1 - eout(prog(local, .52, .44))) * .055;
  return <AbsoluteFill style={{width: 1920, height: 1080, overflow: 'hidden', backgroundColor: paper ? '#f1ead7' : GREEN, pointerEvents: 'none'}}>
    <Img src={staticFile(paper ? 'tex/fiber.jpg' : SLATE)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: paper ? .58 : .8, mixBlendMode: paper ? 'multiply' : 'soft-light'}} />
    {!paper && <AbsoluteFill style={{background: `radial-gradient(ellipse at 49% 42%,rgba(88,115,78,.07),transparent 64%), linear-gradient(180deg,rgba(3,21,14,${frame ? .17 : .11}),transparent 22%,transparent 81%,rgba(3,21,14,.24))`}} />}
    {paper ? <>
      <div style={{position: 'absolute', left: 52, top: 0, bottom: 0, width: 1, background: 'rgba(85,107,70,.12)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 36, height: 1, background: 'rgba(85,107,70,.10)'}} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 110px rgba(99,85,53,.055)'}} />
    </> : <>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}} aria-hidden="true">
        {traces.map((s, i) => <path key={i} d={`M${s.x} ${s.y} q${s.w * .5} ${s.bend} ${s.w} 0`} fill="none" stroke={WHITE} strokeWidth={i % 2 ? 2 : 7} strokeLinecap="round" opacity={s.opacity} />)}
      </svg>
      {eraseOpacity > .0001 && <div style={{position: 'absolute', left: lerp(104, 338, erase), top: 995, width: 220, height: 49,
        opacity: eraseOpacity, background: 'repeating-linear-gradient(177deg,rgba(238,239,217,.8) 0 3px,transparent 3px 8px)',
        clipPath: 'polygon(0 17%,95% 0,100% 75%,7% 100%)', filter: 'blur(2px)'}} />}
    </>}
  </AbsoluteFill>;
};
