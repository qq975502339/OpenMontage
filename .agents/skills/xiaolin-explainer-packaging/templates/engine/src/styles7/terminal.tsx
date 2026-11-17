import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {clamp, prog, eout, eio, lerp} from '../lib';

const PX = "'PX','NSC',monospace";
const NSC = "'NSC',sans-serif";
const AMBER = '#ffbc46';
const GREEN = '#78e9a5';
const BLACK = '#050a07';
const PAPER = '#f3f1e6';
const PAPER_INK = '#203e30';
const MATERIAL = 'styles7/paper_dark.jpg';
const phosphor = '0 0 3px rgba(255,188,70,.55), 0 0 15px rgba(255,176,0,.22)';
const greenGlow = '0 0 8px rgba(120,233,165,.22)';

// Complete surface tokens: no old bezel, subject glyph, or partial Win95 state survives.
export const preset = (base: any, tx: (c: string, t?: string, size?: string) => any): any => {
  const dark = (c = BLACK): any => ({
    ...tx(c, MATERIAL),
    backgroundImage: `repeating-linear-gradient(180deg, transparent 0 3px, rgba(0,0,0,.2) 3px 4px), url(${staticFile(MATERIAL)})`,
    backgroundSize: '100% 4px, cover',
    backgroundBlendMode: 'normal, soft-light',
  });
  const stock = (c = PAPER): any => ({...tx(c, MATERIAL), backgroundBlendMode: 'soft-light'});
  return {
    ...base,
    plates: [MATERIAL], titlePlate: MATERIAL, endPlate: MATERIAL, paperPlate: MATERIAL,
    bezel: {}, crt: true, light: false, fg: 'none', glyph: '', propLook: 'pixel16',
    lux: {light: 0, dust: 0, vig: 0.16, grain: 0.035, bright: 1, still: true},
    ink: AMBER, ink2: GREEN, acc: AMBER, accInk: '#161207',
    f: {title: PX, card: PX, num: PX, body: NSC, doc: PX, tok: PX},
    num: {color: AMBER, ext: false, glow: false, font: PX, phosphor: '255,188,70', ls: 0, kc: GREEN, cc: AMBER},
    card: {
      r: 0,
      base: {...dark(), border: '2px solid rgba(120,233,165,.48)', boxShadow: 'inset 0 0 0 5px rgba(0,0,0,.42)'},
      lit: {...stock('#edb951'), border: '2px solid #ffcc70', boxShadow: 'inset 0 2px 0 rgba(255,239,179,.35)'},
      dim: [120,233,165], on: [22,25,12], sdim: [105,174,132], son: [48,58,30],
      glow: '255,188,70', icon: 'phosphor',
    },
    paper: {
      bg: {
        ...stock(),
        backgroundImage: `repeating-linear-gradient(180deg, rgba(61,104,77,.04) 0 52px, transparent 52px 104px), url(${staticFile(MATERIAL)})`,
        backgroundSize: '100% 104px, cover', backgroundBlendMode: 'normal, soft-light',
        boxShadow: 'inset 0 2px 0 rgba(255,255,255,.6)',
      },
      r: 0, border: '2px solid rgba(32,62,48,.35)', hdr: 'transparent', hdrInk: PAPER_INK,
      kick: '#386c4c', bar: 'repeating-linear-gradient(180deg,#dfaa40 0 3px,#d39e35 3px 4px)',
      val: PAPER_INK, lab: '#345740', grid: 'rgba(32,62,48,.12)', axis: 'rgba(32,62,48,.65)',
      sub: '#56725e', font: PX, titleFont: PX, phosphor: false,
    },
    doc: {
      bg: stock(), ink: PAPER_INK, meta: '#56725e', font: PX, tractor: true,
      hl: 'rgba(233,184,69,.45)', hlBlend: 'multiply', box: '#386c4c', under: '#386c4c',
    },
    panel: {
      bg: dark('#07100a'), r: 0, border: '2px solid rgba(120,233,165,.42)',
      shadow: '0 14px 34px rgba(0,0,0,.35)', strip: 'transparent',
      title: GREEN, tok: AMBER, op: '#9acbab', hiBg: AMBER, hiInk: '#161207',
      lab: GREEN, foot: '#a2cbb1', arrow: GREEN, phosphor: true, icon: 'phosphor',
    },
    ui: {
      mode: 'window',
      win: {...dark('#07100a'), border: '2px solid rgba(120,233,165,.54)'},
      bar: {...dark('#11251a'), boxShadow: 'inset 0 -2px 0 rgba(120,233,165,.4)'},
      barInk: GREEN, r: 0, dots: false, field: '#050b07', fBorder: '#345b42', focus: AMBER,
      lab: '#9acbab', val: AMBER, res: '#09130d', resBorder: '#345b42', rt: '#9acbab',
      num: AMBER, total: '#ffcd73', lit: 'rgba(255,188,70,.13)', font: PX, numFont: PX,
      shadow: '0 14px 34px rgba(0,0,0,.35)',
    },
    ent: {
      ring: '#50775a', bg: dark('#09130d'), nameInk: AMBER,
      strip: {...stock('#edb951'), borderTop: '2px solid #ffcd73'}, stripInk: '#161207',
    },
    pip: {ring: GREEN, rect: '#0e2116'},
    pal: {teal: '#386c4c', steel: '#50775a', coral: '#c99b44', lime: GREEN, slate: BLACK, cream: PAPER, gray: '#92a898'},
  };
};

const str = (s: any): string => s == null ? '' : String(s);
const cell = (c: string): number => /[\u2e80-\u9fff\uf900-\ufaff\uff01-\uff60]/u.test(c) ? 1 : /\s/u.test(c) ? 0.5 : 0.64;
const units = (s: string): number => Array.from(s).reduce((v, c) => v + cell(c), 0);
const widest = (s: string): number => Math.max(1, ...s.split('\n').map(units));
const positive = (n: any, fallback: number): number => Number.isFinite(Number(n)) && Number(n) > 0 ? Number(n) : fallback;
const wrap = (s: string, max: number): string => s.split('\n').map((ln) => {
  let line = '', n = 0;
  const lines: string[] = [];
  for (const c of Array.from(ln)) {
    const u = cell(c);
    if (n + u > max && line) {lines.push(line); line = ''; n = 0;}
    line += c; n += u;
  }
  lines.push(line);
  return lines.join('\n');
}).join('\n');

// Every glyph owns a fixed cell; reveal changes ink, not layout. The cursor retires once.
const CommandText: React.FC<any> = ({text, size, elapsed, start, duration, color, align = 'center', glow = false}) => {
  const lines = str(text).split('\n');
  const total = lines.reduce((n, s) => n + Array.from(s).length, 0);
  const p = prog(elapsed, start, duration);
  const count = Math.floor(p * total + 1e-6);
  const cursor = elapsed >= start && elapsed < start + duration + 0.22;
  let offset = 0;
  return <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'center', gap: size * 0.08}}>
    {lines.map((line, li) => {
      const chars = Array.from(line), previous = offset;
      offset += chars.length;
      const local = clamp(count - previous, 0, chars.length);
      const x = units(chars.slice(0, local).join('')) * size;
      const active = count >= previous && (li === lines.length - 1 || count < offset);
      return <div key={li} style={{position: 'relative', height: size * 1.16, width: units(line) * size, fontFamily: PX, fontWeight: 400, fontSize: size, lineHeight: 1.16, whiteSpace: 'pre', color, textShadow: glow ? phosphor : undefined}}>
        {chars.map((c, i) => <span key={i} style={{display: 'inline-block', width: cell(c) * size, opacity: count > previous + i ? 1 : 0}}>{c}</span>)}
        {cursor && active && <span style={{position: 'absolute', left: x + size * 0.035, top: size * 0.18, width: Math.max(4, size * 0.085), height: size * 0.76, background: color, opacity: 1 - eout(prog(elapsed, start + duration, 0.22)), boxShadow: glow ? greenGlow : undefined}} />}
      </div>;
    })}
  </div>;
};

const Prompt: React.FC<{size: number; p: number}> = ({size, p}) => <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{display: 'block', opacity: p}}>
  <path d="M8 9 L21 20 L8 31 M25 31 H34" fill="none" stroke={GREEN} strokeWidth="3" strokeLinejoin="miter" strokeLinecap="square" />
</svg>;

type Line = {text: string; size: number; color: string; gap: number; start: number; duration: number; main?: boolean};
const Heading: React.FC<{e: any; t: number; ending?: boolean}> = ({e, t, ending = false}) => {
  const elapsed = t - (e.t ?? 0);
  const align = e.align === 'left' ? 'left' : 'center';
  const w = clamp(positive(e.w, 1600), 360, 1680);
  const usable = w - 112;
  const mainText = ending ? str(e.title ?? e.l2 ?? '下期再见') : str(e.l2 || (!e.l2b ? e.l1 : ''));
  const second = ending ? '' : str(e.l2b);
  const kicker = ending || !e.l2 && !e.l2b ? '' : str(e.l1);
  const note = ending ? str(e.sub ?? '') : str(e.q);
  const fit = (s: string, requested: number) => Math.min(requested, usable / (widest(s) + 0.22));
  const mainSize = fit([mainText, second].join('\n'), positive(e.s2, ending ? 172 : 184));
  const kickSize = fit(kicker, positive(e.s1, 58));
  const noteSize = Math.min(38, mainSize * 0.36);
  let clock = 0.12;
  const lines: Line[] = [];
  const add = (text: string, size: number, color: string, gap: number, main = false) => {
    if (!text) return;
    const duration = clamp(Array.from(text.replace(/\n/g, '')).length * 0.055, 0.28, 0.78);
    lines.push({text, size, color, gap, start: clock, duration, main});
    clock += duration + (main ? 0.07 : 0.1);
  };
  add(kicker, kickSize, GREEN, 22);
  add(mainText, mainSize, AMBER, second ? 8 : 24, true);
  add(second, mainSize, AMBER, 24, true);
  add(wrap(note, usable / Math.max(1, noteSize)), noteSize, '#bad4c4', 0);
  const rawH = lines.reduce((h, line) => h + line.text.split('\n').length * line.size * 1.24 + line.gap, 0) + 58;
  const scale = Math.min(1, 800 / Math.max(1, rawH));
  const h = rawH * scale;
  const x0 = align === 'left' ? (e.x ?? 120) : (e.x ?? 960) - w / 2;
  const left = clamp(Number(x0), 120, 1800 - w);
  const top = clamp(Number(e.y ?? 500) - h / 2, 100, 900 - h);
  const entry = eout(prog(elapsed, 0, 0.28));
  const settled = eio(prog(elapsed, clock, 0.3));
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', left, top, width: w, height: h, opacity: entry}}>
      <div style={{position: 'absolute', left: align === 'left' ? 0 : (w - Math.min(w, 220)) / 2, top: 0, width: Math.min(w, 220), height: 3, background: '#3d6c4b', transform: `scaleX(${eio(prog(elapsed, 0, 0.3))})`, transformOrigin: align === 'left' ? 'left' : 'center'}} />
      <div style={{padding: `${22 * scale}px ${56 * scale}px 0`, display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'center'}}>
        {lines.map((line, i) => <div key={i} style={{position: 'relative', width: '100%', marginBottom: line.gap * scale, transform: `translateY(${lerp(10, 0, eout(prog(elapsed, line.start - 0.1, 0.26))) * scale}px)`}}>
          {line.main && i === (kicker ? 1 : 0) && <div style={{position: 'absolute', left: -40 * scale, top: line.size * 0.36 * scale}}><Prompt size={28 * scale} p={eout(prog(elapsed, line.start, 0.22))} /></div>}
          <CommandText text={line.text} size={line.size * scale} elapsed={elapsed} start={line.start} duration={line.duration} color={line.color} align={align} glow={line.main} />
        </div>)}
      </div>
      <div style={{position: 'absolute', bottom: 0, left: align === 'left' ? 56 * scale : (w - 116 * scale) / 2, width: 116 * scale, height: 4 * scale, background: ending ? GREEN : AMBER, opacity: settled, transform: `scaleX(${settled})`, transformOrigin: 'left'}} />
    </div>
  </AbsoluteFill>;
};

export const Title: React.FC<any> = ({e, t}) => <Heading e={e} t={t} />;
export const End: React.FC<any> = ({e, t}) => <Heading e={e} t={t} ending />;

// Full screen, not a device mockup. No subject, text, chart scaffold, or content anchors.
export const Backdrop: React.FC<any> = ({bg, t, lt, cam}) => {
  const paper = bg?.type === 'paper';
  const local = Number.isFinite(lt) ? lt : t - (bg?.t ?? 0);
  const frame = bg?.type === 'title' || bg?.type === 'end';
  const settle = eout(prog(local, 0, 0.42));
  // The screen surface intentionally stays camera-independent; only content is moved by cam.
  void cam;
  return <AbsoluteFill style={{width: 1920, height: 1080, overflow: 'hidden', background: paper ? PAPER : BLACK, pointerEvents: 'none'}}>
    <Img src={staticFile(MATERIAL)} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, objectFit: 'cover', filter: 'grayscale(1)', opacity: paper ? 0.12 : 0.18, mixBlendMode: paper ? 'multiply' : 'screen'}} />
    {paper ? <>
      <AbsoluteFill style={{background: 'linear-gradient(90deg,rgba(92,101,74,.09),transparent 9%,transparent 91%,rgba(92,101,74,.09))'}} />
      {[56, 1816].map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: 0, bottom: 0, width: 48, borderRight: i === 0 ? '1px dashed rgba(32,62,48,.18)' : undefined, borderLeft: i === 1 ? '1px dashed rgba(32,62,48,.18)' : undefined, backgroundImage: 'radial-gradient(circle at 24px 28px, rgba(24,40,29,.26) 0 7px, rgba(255,255,255,.55) 7px 9px, transparent 10px)', backgroundSize: '48px 56px'}} />)}
      <AbsoluteFill style={{opacity: 0.34, background: 'repeating-linear-gradient(180deg,rgba(74,112,80,.04) 0 72px,transparent 72px 144px)'}} />
      <div style={{position: 'absolute', left: 104, right: 104, top: 46, height: 2, background: 'rgba(66,81,54,.12)', boxShadow: '0 2px 0 rgba(255,255,255,.5)'}} />
    </> : <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 44%,transparent 28%,rgba(0,0,0,.36) 100%)'}} />
      <AbsoluteFill style={{opacity: 0.28, background: 'repeating-linear-gradient(180deg,transparent 0 3px,rgba(0,0,0,.5) 3px 4px)'}} />
      <AbsoluteFill style={{opacity: 0.12, background: 'repeating-linear-gradient(90deg,rgba(116,207,147,.035) 0 1px,transparent 1px 6px)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 1080, opacity: 0.055 * (1 - settle), background: 'linear-gradient(180deg,transparent,rgba(120,233,165,.22),transparent)', transform: `translateY(${lerp(-1080, 1080, settle)}px)`}} />
      {frame && <>
        <div style={{position: 'absolute', left: 66, top: 66, width: 82, height: 2, background: 'rgba(120,233,165,.32)'}} />
        <div style={{position: 'absolute', right: 66, bottom: 66, width: 82, height: 2, background: 'rgba(255,188,70,.28)'}} />
      </>}
    </>}
  </AbsoluteFill>;
};
