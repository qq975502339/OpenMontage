import React from 'react';
import {Img} from 'remotion';
import {back, clamp, eio, eout, F, fmt, GRAD, GText, img, lerp, prog, rnd} from './lib';
import {Banknote, Sparkle} from './bg';
import {TechTile} from './bg_tech';
import {TH} from './theme';
const bgOf = (x: any) => (x == null ? {} : typeof x === 'string' ? {background: x} : x);

// ---------------------------------------------------------------- envelope
export const envelope = (e: any, t: number) => {
  const ad = e.ad ?? 0.5, p = prog(t, e.t, ad), a = e.anim ?? 'up';
  let op = 1, tx = 0, ty = 0, tz = 0, sc = 1, rx = 0, ry = 0, blur = 0;
  if (a === 'up') {op = eout(p); ty = (1 - eout(p)) * 80;}
  else if (a === 'down') {op = eout(p); ty = -(1 - eout(p)) * 80;}
  else if (a === 'left') {op = eout(p); tx = -(1 - eout(p)) * 220;}
  else if (a === 'right') {op = eout(p); tx = (1 - eout(p)) * 220;}
  else if (a === 'pop') {op = clamp(p * 3); sc = lerp(0.45, 1, back(p));}
  else if (a === 'flip') {op = clamp(p * 2); rx = (1 - eout(p)) * -88;}
  else if (a === 'flipy') {op = clamp(p * 2); ry = (1 - eout(p)) * 88;}
  else if (a === 'zoom') {op = eout(p); sc = lerp(1.5, 1, eout(p)); blur = (1 - p) * 10;}
  else if (a === 'slam') {op = clamp(p * 4); sc = lerp(2.2, 1, back(clamp(p * 1.1)));}
  else if (a === 'fade') {op = eout(p);}
  else if (a === 'fly3d') {const q = 1 - eout(p); op = clamp(p * 2.5); rx = q * 58; ry = q * -34 * (e.fdir ?? 1); ty = q * -240; tx = q * 160 * (e.fdir ?? 1); tz = q * 620; blur = q * 7;}
  else if (a === 'none') {op = 1;}
  if (e.out != null) {const q = prog(t, e.out, e.od ?? 0.35); op *= 1 - eout(q); if (e.oanim === 'up') ty -= q * 60;}
  let dimv = 0;
  for (const [a0, a1] of e.dim ?? []) dimv = Math.max(dimv, Math.min(prog(t, a0, 0.35), 1 - prog(t, a1 ?? 1e9, 0.35)));
  let litv = 0;
  for (const [a0, a1] of e.lit ?? []) litv = Math.max(litv, Math.min(prog(t, a0, 0.3), 1 - prog(t, a1 ?? 1e9, 0.3)));
  const fl = e.float ? Math.sin((t + (e.ph ?? 0)) * 1.6) * e.float : 0;
  return {op, tx, ty: ty + fl, tz, sc, rx, ry, blur, dimv, litv, p};
};

export const Place: React.FC<{e: any; t: number; xb?: number; children: (v: any) => any}> = ({e, t, xb = 0, children}) => {
  if (t < e.t - 1e-6) return null;
  if (e.out != null && t > e.out + (e.od ?? 0.35) + 0.05) return null;
  const v = envelope(e, t);
  if (v.op <= 0.002) return null;
  const s = (e.s ?? 1) * v.sc * (1 + (e.litScale ?? 0.05) * v.litv);
  const tf = `${e.abs ? '' : 'translate(-50%,-50%) '}translate3d(${v.tx}px,${v.ty}px,${(e.z ?? 0) + v.tz}px) rotateZ(${e.rot ?? 0}deg) rotateY(${(e.ry ?? 0) + v.ry}deg) rotateX(${(e.rx ?? 0) + v.rx}deg) scale(${s})`;
  // depth of field (xb) never blurs a lit element: the lit element is the focus
  const b = v.blur + v.dimv * (e.dimBlur ?? 4) + (e.blur ?? 0) + xb * (1 - v.litv);
  const filt = [b > 0.05 ? `blur(${b.toFixed(2)}px)` : '', v.dimv > 0 ? `brightness(${1 - 0.45 * v.dimv}) saturate(${1 - 0.5 * v.dimv})` : ''].filter(Boolean).join(' ');
  return (
    <div style={{position: 'absolute', left: e.abs ? 0 : e.x, top: e.abs ? 0 : e.y, transform: tf, transformOrigin: e.abs ? '0 0' : '50% 50%', opacity: v.op * (e.o ?? 1) * (1 - 0.35 * v.dimv), filter: filt || undefined, zIndex: e.zi ?? undefined}}>
      {children(v)}
    </div>
  );
};

// ---------------------------------------------------------------- small parts
const TAGC: any = {
  lime: ['linear-gradient(180deg,#f1f6bd,#dbe683)', '#2b2d17'], pink: ['linear-gradient(180deg,#ffc8d6,#ff93ad)', '#3a1020'],
  blue: ['linear-gradient(180deg,#c6d6ff,#8fa9f2)', '#121c3d'], gold: ['linear-gradient(180deg,#ffe9a8,#f0c45a)', '#3a2a08'],
  white: ['linear-gradient(180deg,#ffffff,#ecebe4)', '#22202a'], red: ['linear-gradient(180deg,#ff9384,#e04a3c)', '#ffffff'],
  dark: ['rgba(18,18,28,.88)', '#eef2c8'], mint: ['linear-gradient(180deg,#c9f7e6,#8fe0c4)', '#11392d'], purple: ['linear-gradient(180deg,#8a6fe0,#6247c4)', '#ffffff'],
};
export const Tag: React.FC<any> = ({txt, c = 'lime', size = 34, en}) => {
  const [bg, fg] = TAGC[c] || TAGC.lime;
  return (
    <div style={{background: bg, color: fg, fontFamily: TH.name === 'finance' ? F.ys : TH.f.card, fontWeight: TH.name === 'finance' || /PX|MSZ/.test(TH.f.card) ? 400 : 900, fontSize: size, padding: `${size * 0.16}px ${size * 0.62}px ${size * 0.12}px`, borderRadius: size * 0.2, whiteSpace: 'nowrap', boxShadow: '0 8px 22px rgba(0,0,0,.38)', letterSpacing: size * 0.08, textAlign: 'center', lineHeight: 1.15}}>
      {txt}
      {en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: size * 0.36, letterSpacing: 1.5, opacity: 0.75, marginTop: 1}}>{en}</div>}
    </div>
  );
};

const Corner: React.FC<any> = ({c, s = 58, style}) => (
  <svg width={s} height={s} viewBox="0 0 58 58" style={{position: 'absolute', ...style}}>
    <path d="M4 54 V17 Q4 4 17 4 H54" fill="none" stroke={c} strokeWidth="2.2" />
    <path d="M12 46 V23 Q12 12 23 12 H46" fill="none" stroke={c} strokeWidth="1" opacity=".7" />
    <path d="M4 32 q11 -1 13 -13 q2 -11 13 -15" fill="none" stroke={c} strokeWidth="1.3" opacity=".85" />
    <circle cx="17" cy="17" r="2.6" fill={c} />
  </svg>
);
export const Corners: React.FC<{c: string; i?: number}> = ({c, i = 12}) => (
  <>
    <Corner c={c} style={{left: i, top: i}} />
    <Corner c={c} style={{right: i, top: i, transform: 'scaleX(-1)'}} />
    <Corner c={c} style={{left: i, bottom: i, transform: 'scaleY(-1)'}} />
    <Corner c={c} style={{right: i, bottom: i, transform: 'scale(-1,-1)'}} />
  </>
);

// colour sets for the number Card (e.theme); kept apart from the global theme TH
const CARD_TH: any = {
  navy: {bg: 'linear-gradient(165deg,#1d2546 0%,#121830 100%)', bd: '#dfe0a6', orn: 'rgba(223,224,166,.75)', label: '#e8ecc6', en: 'rgba(222,226,190,.62)', grad: 'lime', glow: 'rgba(230,240,150,.45)'},
  cream: {bg: 'linear-gradient(165deg,#fffbea 0%,#efe6c6 100%)', bd: '#fff7d2', orn: 'rgba(120,100,50,.55)', label: '#3a3020', en: 'rgba(60,50,30,.6)', grad: 'gold', glow: 'rgba(255,240,180,.6)'},
  red: {bg: 'linear-gradient(165deg,#86313d 0%,#5c1f2a 100%)', bd: '#f4b0b4', orn: 'rgba(244,176,180,.7)', label: '#ffe9e9', en: 'rgba(255,220,220,.6)', grad: 'gold', glow: 'rgba(255,140,150,.5)'},
  blue: {bg: 'linear-gradient(165deg,#2c3b86 0%,#1a245c 100%)', bd: '#b4c4ff', orn: 'rgba(180,196,255,.7)', label: '#e9eeff', en: 'rgba(220,228,255,.6)', grad: 'lime', glow: 'rgba(150,170,255,.5)'},
  teal: {bg: 'linear-gradient(165deg,#1f4045 0%,#132a2e 100%)', bd: '#a6e6d6', orn: 'rgba(166,230,214,.7)', label: '#e6fff8', en: 'rgba(200,240,230,.6)', grad: 'mint', glow: 'rgba(140,230,200,.5)'},
  dark: {bg: 'linear-gradient(165deg,#24222a 0%,#17161b 100%)', bd: 'rgba(240,232,180,.55)', orn: 'rgba(240,232,180,.45)', label: '#f1efe4', en: 'rgba(240,236,220,.55)', grad: 'gold', glow: 'rgba(255,220,140,.4)'},
};

// ---------------------------------------------------------------- Card (number / info card)
export const Card: React.FC<any> = ({e, t, v}) => {
  const th = CARD_TH[e.theme || 'navy'], w = e.w || 560, h = e.h || 400;
  let val = e.value;
  if (e.count) {const [a, b, dec] = e.count; const p = eio(prog(t, e.ct ?? e.t + 0.25, e.cd ?? 1.1)); val = fmt(lerp(a, b, p), dec ?? 0, e.sep);}
  const vs = e.vsize || 170;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      {e.tag && <div style={{position: 'absolute', left: '50%', top: -22, transform: 'translate(-50%,-100%)'}}><Tag txt={e.tag} c={e.tagc || 'lime'} size={e.tagsize || 34} /></div>}
      <div style={{position: 'absolute', inset: 0, borderRadius: 22, background: th.bg, border: `3px solid ${th.bd}`, boxShadow: `0 34px 70px rgba(0,0,0,.55), inset 0 0 50px rgba(255,255,255,.035)${v.litv > 0 ? `, 0 0 ${50 * v.litv}px ${th.glow}` : ''}`}} />
      {e.orn !== false && <Corners c={th.orn} />}
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: e.gap ?? 4}}>
        {e.icon && <Img src={img(`icons/${e.icon}.png`)} style={{height: e.iconh || 150, filter: 'drop-shadow(0 12px 18px rgba(0,0,0,.45))'}} />}
        {e.label && <div style={{fontFamily: F.ys, fontSize: e.lsize || 46, color: th.label, letterSpacing: 5, whiteSpace: 'nowrap'}}>{e.label}</div>}
        {val != null && (
          <div style={{display: 'flex', alignItems: 'baseline', gap: 10, marginTop: e.vmt ?? 0}}>
            {e.pre && <GText txt={e.pre} size={vs * 0.42} font="ys" grad={e.grad || th.grad} />}
            <GText txt={String(val)} size={vs} font={e.vfont || 'num'} grad={e.grad || th.grad} />
            {e.unit && <GText txt={e.unit} size={vs * (e.usize ?? 0.4)} font={e.ufont || 'ys'} grad={e.grad || th.grad} />}
          </div>
        )}
        {e.sub && <div style={{fontFamily: F.ys, fontSize: e.subsize || 38, color: th.label, whiteSpace: 'nowrap', marginTop: 2}}>{e.sub}</div>}
        {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: e.ensize || 21, letterSpacing: 2.6, color: th.en, marginTop: 8, whiteSpace: 'nowrap'}}>{e.en}</div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Concept card (big gradient word + icon)
export const Concept: React.FC<any> = ({e, v}) => {
  const w = e.w || 760, h = e.h || 340, GL = TH.card === 'glass';
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: 20, ...(TH.name === 'finance' ? {background: GL ? 'linear-gradient(160deg,rgba(40,42,58,.80),rgba(14,15,22,.88))' : 'linear-gradient(165deg,#25232b,#16151a)'} : bgOf(TH.card.lit)), border: `${GL ? 1.5 : 2.5}px solid ${e.bd || (GL ? 'rgba(238,226,170,.55)' : 'rgba(238,226,170,.7)')}`, boxShadow: `0 34px 70px rgba(0,0,0,.55)${GL ? ', inset 0 1.5px 0 rgba(255,255,255,.2), inset 0 0 70px rgba(150,170,255,.05)' : ''}${v.litv ? `, 0 0 ${46 * v.litv}px rgba(255,220,140,.45)` : ''}`}}>
      <div style={{position: 'absolute', inset: 14, borderRadius: 12, border: `${GL ? 1.5 : 2}px dashed rgba(255,255,255,${GL ? 0.09 : 0.16})`}} />
      {GL && <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: '46%', borderRadius: '20px 20px 0 0', background: 'linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,0))'}} />}
      <div style={{position: 'absolute', left: e.icon ? 60 : 0, right: e.icon ? undefined : 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: e.icon ? 'flex-start' : 'center'}}>
        <GText txt={e.word} size={e.size || 150} font={TH.name === 'finance' ? 'ys' : TH.f.card} grad={e.grad || 'gold'} ext={TH.name === 'finance'} flat={TH.name !== 'finance'}
          color={TH.name === 'finance' ? undefined : e.grad === 'rose' || e.grad === 'red' ? '#d0442f' : `rgb(${TH.card.on.join(',')})`} weight={TH.name === 'finance' || /PX|MSZ/.test(TH.f.card) ? undefined : 900} />
        {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: e.ensize || 40, color: 'transparent', WebkitTextStroke: '1.6px rgba(255,255,255,.42)', letterSpacing: 2, marginTop: 4, whiteSpace: 'nowrap'}}>{e.en}</div>}
        {e.sub && <div style={{fontFamily: TH.name === 'finance' ? F.ys : TH.f.body, fontWeight: TH.name === 'finance' ? 400 : 700, fontSize: 36, color: TH.name === 'finance' ? '#efeadb' : `rgba(${TH.card.on.join(',')},.62)`, marginTop: 10, whiteSpace: 'nowrap'}}>{e.sub}</div>}
      </div>
      {e.icon && <Img src={img(`icons/${e.icon}.png`)} style={{position: 'absolute', right: 40, top: '50%', height: e.iconh || h * 0.78, transform: 'translateY(-50%)', filter: 'drop-shadow(0 14px 20px rgba(0,0,0,.5))'}} />}
    </div>
  );
};

// ---------------------------------------------------------------- Panel (big tilted plate with header)
export const Panel: React.FC<any> = ({e}) => {
  const w = e.w || 1600, h = e.h || 860;
  const bg = e.theme === 'teal' ? 'linear-gradient(170deg,#24394d 0%,#172634 100%)' : e.theme === 'slate' ? 'linear-gradient(170deg,#3a3d4e 0%,#262833 100%)' : 'linear-gradient(170deg,#4b3672 0%,#33244f 60%,#2a1e42 100%)';
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: TH.name === 'finance' ? 30 : TH.panel.r, ...(TH.name === 'finance' || e.theme ? {background: bg} : bgOf(TH.panel.bg)), border: TH.name === 'finance' ? '2px solid rgba(255,255,255,.13)' : TH.panel.border, boxShadow: '0 50px 110px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.12)', overflow: 'hidden'}}>
      {e.photo && <Img src={img(e.photo)} style={{position: 'absolute', right: 0, top: 0, width: w * 0.62, height: h, objectFit: 'cover', filter: 'blur(16px) brightness(.55)', opacity: 0.55, maskImage: 'linear-gradient(90deg, transparent 0%, black 40%)'}} />}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,.08), rgba(255,255,255,0) 60%)'}} />
      {e.title && (
        <div style={{position: 'absolute', left: 0, right: 0, top: e.ht ?? 34, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <GText txt={e.title} size={e.tsize || 76} font={TH.name === 'finance' ? 'ys' : TH.f.title} grad={e.tgrad || 'lilac'} color={e.tcolor ?? (TH.name === 'finance' ? undefined : TH.panel.title)} ls={8} glow={false} weight={TH.name === 'finance' || /PX|MSZ/.test(TH.f.title) ? undefined : 900} />
          {e.en && (
            <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 2, width: w * 0.86}}>
              <div style={{flex: 1, height: 1.5, background: 'rgba(255,255,255,.22)'}} />
              <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: 'rgba(240,236,255,.62)', whiteSpace: 'nowrap'}}>{e.en}</div>
              <div style={{flex: 1, height: 1.5, background: 'rgba(255,255,255,.22)'}} />
            </div>
          )}
        </div>
      )}
      {e.inner && <div style={{position: 'absolute', left: 36, right: 36, top: e.inner, bottom: 36, borderRadius: 18, background: 'rgba(10,8,20,.28)', border: '1px solid rgba(255,255,255,.07)'}} />}
    </div>
  );
};

// ---------------------------------------------------------------- Icon (+label)
export const Icon: React.FC<any> = ({e, v}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    {String(e.src).startsWith('tech:') ? <TechTile name={e.src.slice(5)} s={e.size || 220} c={e.c || 'teal'} /> :
    <Img src={img(e.src.includes('/') ? e.src : `icons/${e.src}.png`)} style={{height: e.size || 220, filter: `drop-shadow(0 16px 22px rgba(0,0,0,.5))${e.gray ? ' grayscale(1) brightness(.6)' : ''}`}} />}
    {e.label && <div style={{fontFamily: F.ys, fontSize: e.lsize || 42, color: e.lc || '#f3f1e6', marginTop: 8, whiteSpace: 'nowrap', textShadow: '0 3px 10px rgba(0,0,0,.6)'}}>{e.label}</div>}
    {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 19, letterSpacing: 2, color: 'rgba(240,238,225,.6)', marginTop: 2, whiteSpace: 'nowrap'}}>{e.en}</div>}
  </div>
);

// ---------------------------------------------------------------- People row (fractional, lit count)
export const People: React.FC<any> = ({e, t}) => {
  const n = e.n, cnt = Math.ceil(n - 1e-6), size = e.size || 150, gap = e.gap ?? 10, ar = e.ar ?? 0.62;
  return (
    <div style={{display: 'flex', alignItems: 'flex-end', gap}}>
      {Array.from({length: cnt}).map((_, i) => {
        const fr = Math.min(1, n - i), p = prog(t, e.t + i * (e.stag ?? 0.08), 0.4);
        const lit = e.litn == null || t < (e.lt ?? 0) ? true : i < e.litn;
        return (
          <div key={i} style={{width: size * ar * fr, height: size, overflow: 'hidden', opacity: clamp(p * 3), transform: `translateY(${(1 - back(p)) * 40}px)`}}>
            <Img src={img(`icons/${e.src}.png`)} style={{height: size, filter: lit ? 'drop-shadow(0 10px 14px rgba(0,0,0,.45))' : 'grayscale(1) brightness(.38)'}} />
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- Coin (css) and coin flow (world coords, abs)
export const Coin: React.FC<{s?: number; style?: any}> = ({s = 46, style}) => (
  <div style={{width: s, height: s, borderRadius: '50%', background: 'radial-gradient(circle at 35% 32%, #fff6c2 0%, #f6cf55 45%, #d39a23 100%)', border: `${s * 0.07}px solid #b47c14`, boxShadow: '0 6px 12px rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial', fontWeight: 900, fontSize: s * 0.52, color: '#9a6510', ...style}}>¥</div>
);
export const CoinFlow: React.FC<any> = ({e, t}) => {
  const [x1, y1] = e.from, [x2, y2] = e.to, bend = e.bend ?? -160, n = e.n ?? 12, d = e.d ?? 2.4, tr = e.tr ?? 1.1;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = mx + (-(y2 - y1) / len) * bend, cy = my + ((x2 - x1) / len) * bend;
  const out: any[] = [];
  for (let i = 0; i < n; i++) {
    const tt = t - (e.t + (i * d) / n);
    if (tt < 0 || tt > tr) continue;
    const p = eio(tt / tr), q = 1 - p;
    const x = q * q * x1 + 2 * q * p * cx + p * p * x2, y = q * q * y1 + 2 * q * p * cy + p * p * y2;
    out.push(<Coin key={i} s={e.s ?? 48} style={{position: 'absolute', left: x - 24, top: y - 24, opacity: Math.min(1, Math.min(tt, tr - tt) * 6), transform: `rotateY(${tt * 360}deg)`}} />);
  }
  return <div style={{position: 'absolute', left: 0, top: 0}}>{out}</div>;
};

// ---------------------------------------------------------------- Arrow / scribbles (world coords, abs)
export const Arrow: React.FC<any> = ({e, t}) => {
  const [x1, y1] = e.from, [x2, y2] = e.to, bend = e.bend ?? 0;
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const cx = mx + (-(y2 - y1) / len) * bend, cy = my + ((x2 - x1) / len) * bend;
  const p = eout(prog(t, e.t, e.d ?? 0.55));
  const ang = Math.atan2(y2 - cy, x2 - cx), hs = e.hs ?? 22, c = e.c || (TH.name === 'finance' ? '#eef3c4' : TH.light ? TH.acc : TH.ink), sw = e.sw ?? 5;
  return (
    <svg width="10" height="10" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" pathLength={1} strokeDasharray={e.dash ? '0.02 0.02' : '1'} strokeDashoffset={e.dash ? 0 : 1 - p} opacity={e.dash ? p : 1} />
      {p > 0.92 && <path d={`M${x2 - hs * Math.cos(ang - 0.5)} ${y2 - hs * Math.sin(ang - 0.5)} L${x2} ${y2} L${x2 - hs * Math.cos(ang + 0.5)} ${y2 - hs * Math.sin(ang + 0.5)}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
};
export const Scribble: React.FC<any> = ({e, t}) => {
  const {x, y, w, h} = e, p = eout(prog(t, e.t, e.d ?? 0.5)), c = e.c || '#ff5d73', sw = e.sw ?? 6;
  let d = '';
  if (e.shape === 'circle') {const rx = w / 2, ry = h / 2, cx = x, cy = y; d = `M${cx + rx * 0.2} ${cy - ry * 1.02} C${cx + rx * 1.15} ${cy - ry * 0.95}, ${cx + rx * 1.08} ${cy + ry * 1.02}, ${cx} ${cy + ry} C${cx - rx * 1.12} ${cy + ry * 0.98}, ${cx - rx * 1.06} ${cy - ry * 1.05}, ${cx + rx * 0.35} ${cy - ry * 0.92}`;}
  else if (e.shape === 'under') d = `M${x - w / 2} ${y} Q${x} ${y + 10} ${x + w / 2} ${y - 4}`;
  else if (e.shape === 'strike') d = `M${x - w / 2} ${y + 4} L${x + w / 2} ${y - 6}`;
  else if (e.shape === 'cross') d = `M${x - w / 2} ${y - h / 2} L${x + w / 2} ${y + h / 2} M${x + w / 2} ${y - h / 2} L${x - w / 2} ${y + h / 2}`;
  else if (e.shape === 'box') d = `M${x - w / 2} ${y - h / 2} H${x + w / 2} V${y + h / 2} H${x - w / 2} Z`;
  return (
    <svg width="10" height="10" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: `drop-shadow(0 0 8px ${c}88)`}}>
      <path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
    </svg>
  );
};

// ---------------------------------------------------------------- Document (white paper, highlighter)
const hlSplit = (txt: string, hls: any[] = [], t: number) => {
  if (!hls.length) return [txt];
  const parts: any[] = []; let rest = txt, k = 0;
  for (const h of hls) {
    const i = rest.indexOf(h.s); if (i < 0) continue;
    parts.push(rest.slice(0, i));
    const p = eio(prog(t, h.t, h.d ?? 0.9)), col = h.c || 'rgba(255,224,60,.78)';
    parts.push(<span key={k++} style={{background: `linear-gradient(90deg, ${col} ${p * 100}%, rgba(0,0,0,0) ${p * 100}%)`, padding: '0 2px', borderRadius: 3, fontWeight: h.b ? 700 : undefined}}>{h.s}</span>);
    rest = rest.slice(i + h.s.length);
  }
  parts.push(rest);
  return parts;
};
export const Doc: React.FC<any> = ({e, t}) => {
  const w = e.w || 1200;
  return (
    <div style={{width: w, minHeight: e.h, background: e.paper || 'linear-gradient(180deg,#fdfcf8,#f4f2ea)', borderRadius: 8, boxShadow: '0 50px 100px rgba(0,0,0,.6)', padding: e.pad ?? '64px 80px', color: '#1f1f24', fontFamily: e.font === 'cn' ? F.heavy : F.serif, position: 'relative', overflow: 'hidden'}}>
      {e.org && (
        <div style={{display: 'flex', alignItems: 'center', gap: 16, borderBottom: '3px solid #1d2c55', paddingBottom: 16, marginBottom: 26}}>
          <div style={{width: 54, height: 54, borderRadius: '50%', border: '3px solid #1d2c55', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.serif, fontWeight: 700, color: '#1d2c55', fontSize: 22}}>{e.seal || 'SSA'}</div>
          <div style={{fontFamily: F.serif, fontWeight: 700, letterSpacing: 2, color: '#1d2c55', fontSize: 24}}>{e.org}</div>
        </div>
      )}
      {(e.lines || []).map((l: any, i: number) => {
        if (l.st === 'rule') return <div key={i} style={{height: 2, background: '#d8d4c6', margin: '18px 0'}} />;
        if (l.st === 'row') {
          const p = l.t != null ? eout(prog(t, l.t, 0.4)) : 1;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'baseline', fontSize: l.size || 38, margin: '14px 0', fontFamily: F.heavy, fontWeight: l.b ? 900 : 500, opacity: l.t != null ? p : 1, color: l.c || '#24232b'}}>
              <span style={{whiteSpace: 'nowrap'}}>{hlSplit(l.l, l.hls, t)}</span>
              <span style={{flex: 1, borderBottom: '2px dotted #b9b4a4', margin: '0 18px', transform: 'translateY(-8px)'}} />
              <span style={{fontFamily: F.num, fontSize: (l.size || 38) * 1.25, letterSpacing: 1, whiteSpace: 'nowrap'}}>{hlSplit(l.r, l.rhls, t)}</span>
            </div>
          );
        }
        const st: any = l.st === 'h1' ? {fontSize: l.size || 44, fontWeight: 700, lineHeight: 1.25, margin: '0 0 22px', letterSpacing: 0.5}
          : l.st === 'h2' ? {fontSize: l.size || 30, fontWeight: 700, margin: '26px 0 10px', color: '#1d2c55', letterSpacing: 1}
          : l.st === 'meta' ? {fontSize: l.size || 22, color: '#6c6a73', margin: '0 0 8px', letterSpacing: 1}
          : {fontSize: l.size || 31, lineHeight: 1.62, margin: '0 0 16px', color: '#2c2b33'};
        return <div key={i} style={st}>{hlSplit(l.txt, l.hls, t)}</div>;
      })}
    </div>
  );
};

// ---------------------------------------------------------------- Slider (age / years ruler)
export const Slider: React.FC<any> = ({e, t}) => {
  const w = e.w || 1100, min = e.min, max = e.max, X = (val: number) => ((val - min) / (max - min)) * w;
  const p = eio(prog(t, e.mt ?? e.t + 0.6, e.md ?? 1.6)), cur = lerp(e.a, e.b, p), done = t >= (e.mt ?? e.t + 0.6) + (e.md ?? 1.6);
  const unit = e.unit ?? '岁', c = e.c || '#e6f08f';
  return (
    <div style={{position: 'relative', width: w + (e.lw ?? 330), height: 190}}>
      <div style={{position: 'absolute', left: 0, top: 70, width: e.lw ?? 300, textAlign: 'right'}}>
        <div style={{fontFamily: F.ys, fontSize: e.lsize || 54, color: '#f5f3e8', whiteSpace: 'nowrap'}}>{e.label}</div>
        {e.sub && <div style={{fontFamily: F.ys, fontSize: 28, color: 'rgba(240,238,225,.6)', whiteSpace: 'nowrap', marginTop: 2}}>{e.sub}</div>}
      </div>
      <div style={{position: 'absolute', left: e.lw ?? 330, top: 0, width: w, height: 190}}>
        <div style={{position: 'absolute', left: 0, top: 112, width: w, height: 20, borderRadius: 10, background: 'rgba(255,255,255,.12)', boxShadow: 'inset 0 2px 6px rgba(0,0,0,.4)'}} />
        <div style={{position: 'absolute', left: X(e.a), top: 112, width: Math.max(0, X(cur) - X(e.a)), height: 20, borderRadius: 10, background: `linear-gradient(90deg, ${c}55, ${c})`, boxShadow: `0 0 18px ${c}88`}} />
        {Array.from({length: max - min + 1}).map((_, i) => {
          const val = min + i, big = val % 5 === 0;
          return (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: X(val) - 1, top: big ? 140 : 140, width: 2, height: big ? 16 : 8, background: 'rgba(255,255,255,.35)'}} />
              {big && <div style={{position: 'absolute', left: X(val) - 30, top: 160, width: 60, textAlign: 'center', fontFamily: F.en, fontWeight: 700, fontSize: 20, color: 'rgba(255,255,255,.5)'}}>{val}</div>}
            </React.Fragment>
          );
        })}
        <div style={{position: 'absolute', left: X(e.a) - 15, top: 107, width: 30, height: 30, borderRadius: '50%', border: '3px dashed rgba(255,255,255,.55)'}} />
        <div style={{position: 'absolute', left: X(e.a) - 60, top: 18, width: 120, textAlign: 'center', fontFamily: F.num, fontSize: 52, color: 'rgba(255,255,255,.4)', opacity: p > 0.15 ? 1 : 0}}>{fmt(e.a)}</div>
        <div style={{position: 'absolute', left: X(cur) - 22, top: 100, width: 44, height: 44, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #ffffff, ${c})`, boxShadow: `0 0 24px ${c}, 0 6px 14px rgba(0,0,0,.5)`}} />
        <div style={{position: 'absolute', left: X(cur) - 90, top: -12, width: 180, textAlign: 'center'}}>
          <GText txt={fmt(cur, e.dec ?? 0)} size={84} font="num" grad="lime" />
          <GText txt={unit} size={34} font="ys" grad="lime" />
        </div>
        {done && e.delta && <div style={{position: 'absolute', left: X(e.b) + 70, top: 52, transform: `scale(${back(prog(t, (e.mt ?? e.t + 0.6) + (e.md ?? 1.6), 0.45))})`, transformOrigin: 'left center'}}><Tag txt={e.delta} c={e.dc || 'pink'} size={40} /></div>}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- Banknote stack
export const Stack: React.FC<any> = ({e, t}) => {
  const n = e.n, d = e.d ?? 1.4, nw = e.nw ?? 300, gap = e.gap ?? 13;
  const shown = Array.from({length: n}).map((_, i) => prog(t, e.t + (i / Math.max(1, n)) * d, 0.22));
  const top = shown.reduce((a, p, i) => (p > 0 ? i : a), -1);
  return (
    <div style={{position: 'relative', width: nw + 40, height: n * gap + 160}}>
      {shown.map((p, i) => p <= 0 ? null : (
        <div key={i} style={{position: 'absolute', left: 20 + ((i * 37) % 9) - 4, bottom: i * gap + (1 - eout(p)) * 70, width: nw, height: gap + 3, borderRadius: 3, background: i % 2 ? 'linear-gradient(180deg,#e98e9c,#c45f76)' : 'linear-gradient(180deg,#f09aa7,#cc6880)', border: '1.5px solid #9c3f58', opacity: clamp(p * 3), boxShadow: '0 3px 4px rgba(0,0,0,.25)'}} />
      ))}
      {top >= 0 && <Banknote w={nw} style={{position: 'absolute', left: 20, bottom: top * gap + gap - 4, transform: 'perspective(600px) rotateX(58deg)', transformOrigin: 'bottom center'}} />}
    </div>
  );
};

// ---------------------------------------------------------------- Pillar + roof
export const Pillar: React.FC<any> = ({e, v}) => {
  const w = e.w || 320, h = e.h || 560, st = e.state || 'solid';
  const colW = st === 'thin' ? w * 0.42 : w * 0.78;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: w, height: 46, borderRadius: 6, background: 'linear-gradient(180deg,#fff4d6,#d9c592)', boxShadow: '0 8px 16px rgba(0,0,0,.35)'}} />
      <div style={{position: 'absolute', left: 0, bottom: 0, width: w, height: 46, borderRadius: 6, background: 'linear-gradient(180deg,#e8d7a6,#b9a26a)'}} />
      {st === 'scaffold' ? (
        <svg width={colW} height={h - 92} style={{position: 'absolute', left: (w - colW) / 2, top: 46}}>
          <rect x="3" y="3" width={colW - 6} height={h - 98} fill="rgba(255,240,200,.06)" stroke="#e9d9a6" strokeWidth="4" strokeDasharray="14 10" />
          {Array.from({length: 5}).map((_, i) => {const y0 = 3 + i * ((h - 98) / 5), y1 = y0 + (h - 98) / 5; return <path key={i} d={`M3 ${y0} L${colW - 3} ${y1} M${colW - 3} ${y0} L3 ${y1}`} stroke="#e9d9a6" strokeWidth="2.5" opacity=".7" />;})}
        </svg>
      ) : (
        <div style={{position: 'absolute', left: (w - colW) / 2, top: 46, width: colW, height: h - 92, background: 'repeating-linear-gradient(90deg,#f6ead0 0px,#f6ead0 18px,#d8c69a 18px,#d8c69a 24px)', boxShadow: 'inset 0 0 30px rgba(120,90,40,.35)', opacity: st === 'thin' ? 0.9 : 1}} />
      )}
      <div style={{position: 'absolute', left: '50%', top: 64, transform: 'translateX(-50%)', width: 76, height: 76, borderRadius: '50%', background: 'linear-gradient(180deg,#5d47b8,#3a2a86)', border: '4px solid #fff4d6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.num, fontSize: 52, color: '#fff4d6', boxShadow: '0 8px 18px rgba(0,0,0,.45)'}}>{e.n}</div>
      {e.icon && <Img src={img(`icons/${e.icon}.png`)} style={{position: 'absolute', left: '50%', top: 160, height: 170, transform: 'translateX(-50%)', filter: 'drop-shadow(0 10px 16px rgba(0,0,0,.5))'}} />}
      <div style={{position: 'absolute', left: -40, right: -40, top: 350, textAlign: 'center'}}>
        <div style={{display: 'inline-block', background: 'rgba(22,20,34,.86)', borderRadius: 12, padding: '10px 22px', boxShadow: '0 8px 20px rgba(0,0,0,.4)'}}>
          <div style={{fontFamily: F.ys, fontSize: 44, color: '#fff4d6', whiteSpace: 'nowrap'}}>{e.title}</div>
          {e.sub && <div style={{fontFamily: F.ys, fontSize: 28, color: 'rgba(255,244,214,.7)', whiteSpace: 'nowrap', marginTop: 2}}>{e.sub}</div>}
        </div>
      </div>
    </div>
  );
};
export const Roof: React.FC<any> = ({e}) => {
  const w = e.w || 1300, h = e.h || 200;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
        <defs><linearGradient id="rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff4d6" /><stop offset="1" stopColor="#cdb67c" /></linearGradient></defs>
        <polygon points={`${w / 2},6 ${w - 10},${h - 40} 10,${h - 40}`} fill="url(#rf)" stroke="#8e7640" strokeWidth="3" />
        <rect x="0" y={h - 42} width={w} height="40" rx="6" fill="#e3d09c" stroke="#8e7640" strokeWidth="3" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: h * 0.36, textAlign: 'center', fontFamily: F.ys, fontSize: 52, color: '#4a3a16', letterSpacing: 8}}>{e.txt}</div>
    </div>
  );
};

// ---------------------------------------------------------------- Formula
export const Formula: React.FC<any> = ({e, t}) => {
  const size = e.size || 150;
  const foc = (e.focus || []).find((f: any) => t >= f[0] && t < (f[1] ?? 1e9));
  return (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: e.gap ?? 26}}>
      {e.items.map((it: any, i: number) => {
        const p = prog(t, it.t ?? e.t, 0.45);
        if (p <= 0) return <div key={i} style={{width: it.w ?? (it.op ? size * 0.5 : size * 0.9), height: size}} />;
        const isF = foc && foc[2] === i, dimmed = foc && !isF && !it.op;
        const lp = prog(t, (it.t ?? e.t) + 0.25, 0.5);
        return (
          <div key={i} style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp(p * 2.5) * (dimmed ? 0.42 : 1), transform: `translateY(${(1 - back(p)) * 50}px) scale(${isF ? 1.06 : 1})`, minWidth: it.w}}>
            {isF && <div style={{position: 'absolute', left: -18, right: -18, top: -14, height: size * 1.12, borderRadius: 14, border: '4px solid #eef5a8', boxShadow: '0 0 30px rgba(238,245,168,.55), inset 0 0 22px rgba(238,245,168,.25)'}} />}
            <div style={{height: size * 1.08, display: 'flex', alignItems: 'center'}}>
              {it.op ? <GText txt={it.s} size={size * 0.62} font="num" color="rgba(236,240,205,.78)" glow={false} />
                : <GText txt={it.s} size={it.size ?? size} font={it.font || 'num'} grad={it.grad || 'lime'} ext style={{transform: 'skewX(-8deg)'}} />}
            </div>
            {it.lab && (
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp(lp * 2)}}>
                <div style={{width: Math.max(size * 0.9, it.uw ?? 0), height: 4, borderRadius: 2, background: 'rgba(240,245,200,.6)'}} />
                <svg width="40" height="70" style={{marginTop: 6}}><path d="M20 66 Q16 36 20 8 M10 20 L20 6 L30 20" fill="none" stroke="rgba(240,245,200,.8)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {it.icon && <Img src={img(`icons/${it.icon}.png`)} style={{height: e.iconh || 130, marginTop: 6, filter: 'drop-shadow(0 10px 14px rgba(0,0,0,.45))'}} />}
                <div style={{fontFamily: F.ys, fontSize: e.lsize || 38, color: '#f2f0e2', marginTop: 8, whiteSpace: 'nowrap'}}>{it.lab}</div>
                {it.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 17, letterSpacing: 1.8, color: 'rgba(240,238,225,.58)', marginTop: 2, whiteSpace: 'nowrap'}}>{it.en}</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- Flags
const star = (cx: number, cy: number, r: number, rot = 0) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {const a = rot - Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.382 : r; pts.push(`${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`);}
  return pts.join(' ');
};
export const FlagSvg: React.FC<{c: string; w: number}> = ({c, w}) => {
  const h = w * (2 / 3);
  if (c === 'cn') {
    const u = w / 30, sm = [[10, 2], [12, 4], [12, 7], [10, 9]];
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}><rect width={w} height={h} fill="#de2910" />
        <polygon points={star(5 * u, 5 * u, 3 * u)} fill="#ffde00" />
        {sm.map(([x, y], i) => <polygon key={i} points={star(x * u, y * u, u, Math.atan2(5 - y, 5 - x) + Math.PI / 2)} fill="#ffde00" />)}
      </svg>
    );
  }
  if (c === 'us') return (
    <svg width={w} height={h} viewBox="0 0 190 127"><rect width="190" height="127" fill="#fff" />{Array.from({length: 7}).map((_, i) => <rect key={i} y={i * 19.54} width="190" height="9.77" fill="#b22234" />)}<rect width="76" height="68.4" fill="#3c3b6e" />
      {Array.from({length: 9}).map((_, r) => Array.from({length: r % 2 ? 5 : 6}).map((_, k) => <circle key={`${r}-${k}`} cx={(r % 2 ? 12.6 : 6.3) + k * 12.6} cy={6 + r * 6.9} r="2.2" fill="#fff" />))}</svg>
  );
  if (c === 'fr') return <svg width={w} height={h} viewBox="0 0 3 2"><rect width="1" height="2" fill="#0055a4" /><rect x="1" width="1" height="2" fill="#fff" /><rect x="2" width="1" height="2" fill="#ef4135" /></svg>;
  if (c === 'de') return <svg width={w} height={h} viewBox="0 0 5 3" preserveAspectRatio="none"><rect width="5" height="1" fill="#000" /><rect y="1" width="5" height="1" fill="#dd0000" /><rect y="2" width="5" height="1" fill="#ffce00" /></svg>;
  if (c === 'jp') return <svg width={w} height={h} viewBox="0 0 3 2"><rect width="3" height="2" fill="#fff" /><circle cx="1.5" cy="1" r="0.6" fill="#bc002d" /></svg>;
  if (c === 'cl') return <svg width={w} height={h} viewBox="0 0 6 4"><rect width="6" height="4" fill="#d52b1e" /><rect width="6" height="2" fill="#fff" /><rect width="2" height="2" fill="#0039a6" /><polygon points={star(1, 1, 0.55)} fill="#fff" /></svg>;
  return <svg width={w} height={h}><rect width={w} height={h} fill="#888" /></svg>;
};
export const Flag: React.FC<any> = ({e}) => {
  const s = e.size || 120;
  if (e.shape === 'rect') return <div style={{borderRadius: 8, overflow: 'hidden', boxShadow: '0 10px 24px rgba(0,0,0,.45)', border: '3px solid rgba(255,255,255,.85)', lineHeight: 0}}><FlagSvg c={e.c} w={s * 1.5} /></div>;
  return (
    <div style={{width: s, height: s, borderRadius: '50%', overflow: 'hidden', border: `${Math.max(3, s * 0.05)}px solid #f6f3e8`, boxShadow: '0 10px 24px rgba(0,0,0,.45)', position: 'relative'}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', lineHeight: 0}}><FlagSvg c={e.c} w={s * 1.55} /></div>
    </div>
  );
};
export const Entity: React.FC<any> = ({e, v}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '20px 34px 20px 22px', borderRadius: 18, background: v.litv > 0.5 ? 'linear-gradient(165deg,#fffbea,#efe6c6)' : 'linear-gradient(165deg,#25233a,#17162a)', border: '2.5px solid rgba(240,232,180,.6)', boxShadow: '0 24px 50px rgba(0,0,0,.5)'}}>
    <Flag e={{c: e.c, size: e.fs || 96}} />
    <div>
      <div style={{fontFamily: F.ys, fontSize: e.size || 52, color: v.litv > 0.5 ? '#2a2340' : '#f5f2e6', whiteSpace: 'nowrap'}}>{e.name}</div>
      {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 19, letterSpacing: 2, color: v.litv > 0.5 ? 'rgba(42,35,64,.6)' : 'rgba(245,242,230,.55)', whiteSpace: 'nowrap'}}>{e.en}</div>}
    </div>
  </div>
);

// ---------------------------------------------------------------- Year ruler (screen)
export const Ruler: React.FC<any> = ({e, t}) => {
  const a = e.from ?? 1880, b = e.to ?? 2030, x0 = 150, x1 = 1770, y = e.y ?? 1052, X = (yr: number) => x0 + ((yr - a) / (b - a)) * (x1 - x0);
  const p = eio(prog(t, e.t + 0.15, 0.9)), m = lerp(e.prev ?? e.mark, e.mark, p);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080}}>
      <div style={{position: 'absolute', left: x0, top: y, width: x1 - x0, height: 2, background: 'rgba(255,255,255,.35)'}} />
      {Array.from({length: Math.floor((b - a) / 5) + 1}).map((_, i) => {
        const yr = a + i * 5, big = yr % 50 === 0;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: X(yr), top: y - (big ? 10 : 5), width: 2, height: big ? 10 : 5, background: 'rgba(255,255,255,.45)'}} />
            {big && <div style={{position: 'absolute', left: X(yr) - 40, top: y + 6, width: 80, textAlign: 'center', fontFamily: F.en, fontWeight: 700, fontSize: 16, color: 'rgba(255,255,255,.5)'}}>{yr}</div>}
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: X(a), top: y - 1, width: X(m) - X(a), height: 4, background: 'linear-gradient(90deg,rgba(230,240,140,0),#e6f08f)'}} />
      <div style={{position: 'absolute', left: X(m) - 9, top: y - 20, width: 0, height: 0, borderLeft: '9px solid transparent', borderRight: '9px solid transparent', borderTop: '14px solid #e6f08f'}} />
      <div style={{position: 'absolute', left: X(m) - 80, top: y - 66, width: 160, textAlign: 'center'}}><GText txt={String(Math.round(m))} size={44} font="num" grad="lime" /></div>
    </div>
  );
};

// ---------------------------------------------------------------- misc
export const Txt: React.FC<any> = ({e}) => (
  <div style={{textAlign: e.align || 'center', whiteSpace: 'nowrap'}}>
    <GText txt={e.txt} size={e.size || 90} font={e.font || (TH.name === 'finance' ? 'ys' : TH.f.card)} grad={e.grad || 'white'} italic={e.italic} ls={e.ls ?? 0}
      color={e.color ?? (e.grad || TH.name === 'finance' ? undefined : TH.ink)} ext={e.ext} glow={e.glow ?? TH.name === 'finance'} flat={TH.light}
      phosphor={TH.name === 'terminal' && !e.grad ? '255,176,0' : undefined} weight={TH.name === 'finance' || /PX|MSZ/.test(TH.f.card) ? undefined : 900} />
    {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: e.ensize || 26, letterSpacing: 3, color: TH.ink2, marginTop: 4}}>{e.en}</div>}
  </div>
);
export const Photo: React.FC<any> = ({e}) => (
  <div style={{background: '#f3efe4', padding: '16px 16px 18px', boxShadow: '0 34px 70px rgba(0,0,0,.6)', borderRadius: 4}}>
    <Img src={img(e.src)} style={{width: e.w || 420, height: e.h || 560, objectFit: 'cover', objectPosition: e.pos || '50% 25%', display: 'block', filter: e.bw ? 'grayscale(1) contrast(1.08)' : undefined}} />
    {e.cap && <div style={{fontFamily: F.ys, fontSize: 40, color: '#2a2730', textAlign: 'center', marginTop: 12}}>{e.cap}</div>}
    {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 18, letterSpacing: 2, color: '#77737f', textAlign: 'center'}}>{e.en}</div>}
    {e.credit && <div style={{fontFamily: F.heavy, fontWeight: 500, fontSize: e.cs || 15, color: '#8d8995', textAlign: 'right', marginTop: 8, whiteSpace: 'nowrap'}}>{e.credit}</div>}
  </div>
);
export const Meme: React.FC<any> = ({e, t}) => {
  const sh = t - e.t < 0.35 ? Math.sin(t * 90) * 7 * (1 - (t - e.t) / 0.35) : 0;
  const ol = Array.from({length: 16}).map((_, i) => {const a = (i / 16) * Math.PI * 2; return `${Math.cos(a) * 7}px ${Math.sin(a) * 7}px 0 #111`;}).join(',');
  return (
    <div style={{position: 'relative', transform: `translate(${sh}px,${-sh * 0.6}px) rotate(${e.tilt ?? -5}deg)`}}>
      {e.burst && (
        <svg width="900" height="900" viewBox="-450 -450 900 900" style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) rotate(${t * 20}deg)`, zIndex: -1}}>
          {Array.from({length: 18}).map((_, i) => {const a0 = (i / 18) * Math.PI * 2, a1 = a0 + Math.PI / 18; return <path key={i} d={`M0 0 L${Math.cos(a0) * 450} ${Math.sin(a0) * 450} L${Math.cos(a1) * 450} ${Math.sin(a1) * 450} Z`} fill={i % 2 ? '#ffd23f' : '#ffb52e'} opacity=".95" />;})}
        </svg>
      )}
      <div style={{fontFamily: F.heavy, fontWeight: 900, fontSize: e.size || 150, color: e.c || '#fff', textShadow: `${ol}, 0 14px 22px rgba(0,0,0,.5)`, whiteSpace: 'nowrap', letterSpacing: 4}}>{e.txt}</div>
    </div>
  );
};
export const Bubble: React.FC<any> = ({e}) => (
  <div style={{position: 'relative', background: e.bg || '#ffffff', color: '#1e1d24', borderRadius: 26, padding: '18px 30px', fontFamily: F.heavy, fontWeight: 800, fontSize: e.size || 40, whiteSpace: 'nowrap', boxShadow: '0 16px 34px rgba(0,0,0,.45)'}}>
    {e.txt}
    <div style={{position: 'absolute', [e.side === 'r' ? 'right' : 'left']: 44, bottom: -22, width: 0, height: 0, borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `26px solid ${e.bg || '#ffffff'}`}} />
  </div>
);
export const Comment: React.FC<any> = ({e}) => (
  <div style={{width: e.w || 640, background: 'rgba(255,255,255,.96)', borderRadius: 20, padding: '20px 26px', boxShadow: '0 18px 40px rgba(0,0,0,.45)', display: 'flex', gap: 18}}>
    <div style={{width: 64, height: 64, borderRadius: '50%', background: e.ac || '#7fb6ff', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: F.heavy, fontWeight: 900, fontSize: 30}}>{e.av || '友'}</div>
    <div style={{flex: 1}}>
      <div style={{fontFamily: F.heavy, fontWeight: 600, fontSize: 24, color: '#fb7299'}}>{e.name}</div>
      <div style={{fontFamily: F.heavy, fontWeight: 600, fontSize: 32, color: '#222', marginTop: 4, lineHeight: 1.35}}>{e.txt}</div>
      {e.meta !== '' && <div style={{fontFamily: F.heavy, fontSize: 20, color: '#9a9aa6', marginTop: 8}}>{e.meta ?? '👍 2.3万'}</div>}
    </div>
  </div>
);
export const Stamp: React.FC<any> = ({e}) => (
  <div style={{border: `9px solid ${e.c || '#ff4d5e'}`, color: e.c || '#ff4d5e', borderRadius: 14, padding: '6px 34px', fontFamily: F.heavy, fontWeight: 900, fontSize: e.size || 120, transform: `rotate(${e.tilt ?? -10}deg)`, whiteSpace: 'nowrap', textShadow: '0 0 1px rgba(0,0,0,.2)', background: e.bg || 'transparent'}}>{e.txt}</div>
);
export const Toon: React.FC<any> = ({e, t}) => (
  <Img src={img(`toon/${e.src}.png`)} style={{height: e.size || 520, filter: 'drop-shadow(0 20px 30px rgba(0,0,0,.5))', transform: `rotate(${Math.sin(t * 3) * (e.wig ?? 2)}deg)`}} />
);
export const Spark: React.FC<any> = ({e, t}) => <Sparkle s={(e.size || 60) * (0.85 + 0.15 * Math.sin(t * 5 + (e.ph ?? 0)))} c={e.c || '#3cc6dc'} />;
export const Box: React.FC<any> = ({e}) => <div style={{width: e.w, height: e.h, borderRadius: e.r ?? 18, background: e.bg || 'rgba(255,255,255,.06)', border: e.bd || '2px solid rgba(255,255,255,.14)', boxShadow: e.sh}} />;

// ---------------------------------------------------------------- Chart (line, progressive draw)
export const Chart: React.FC<any> = ({e, t}) => {
  const w = e.w || 1100, h = e.h || 520, pts = e.pts as [string, number][], n = pts.length;
  const vs = pts.map((p) => p[1]), mn = e.min ?? Math.min(...vs) * 0.85, mx = e.max ?? Math.max(...vs) * 1.08;
  const pad = 70, X = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, n - 1), Y = (v: number) => h - 60 - ((v - mn) / (mx - mn)) * (h - 140);
  const p = eio(prog(t, e.t + 0.2, e.d ?? 2.2)), c = e.c || '#ff7d95';
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(q[1]).toFixed(1)}`).join(' ');
  const area = `${d} L${X(n - 1)} ${h - 60} L${X(0)} ${h - 60} Z`;
  const lab: number[] = e.labels ?? [0, n - 1];
  return (
    <div style={{position: 'relative', width: w, height: h, background: 'rgba(18,16,32,.72)', borderRadius: 26, border: '2px solid rgba(255,255,255,.12)', boxShadow: '0 24px 60px rgba(0,0,0,.45)'}}>
      {e.title && <div style={{position: 'absolute', left: 40, top: 26, fontFamily: F.ys, fontSize: e.tsize || 44, color: '#f3f1e6'}}>{e.title}<span style={{fontFamily: F.en, fontSize: 20, letterSpacing: 3, marginLeft: 18, color: 'rgba(240,238,225,.55)'}}>{e.en}</span></div>}
      <svg width={w} height={h} style={{position: 'absolute', left: 0, top: 0}}>
        <defs>
          <linearGradient id={`ga${e.t}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".38" /><stop offset="1" stopColor={c} stopOpacity="0" /></linearGradient>
          <clipPath id={`cl${e.t}`}><rect x="0" y="0" width={pad + (w - pad * 2) * p + 4} height={h} /></clipPath>
        </defs>
        {[0, 1, 2, 3].map((i) => <line key={i} x1={pad} x2={w - pad} y1={80 + (i * (h - 140)) / 3} y2={80 + (i * (h - 140)) / 3} stroke="rgba(255,255,255,.07)" strokeWidth="2" />)}
        <g clipPath={`url(#cl${e.t})`}>
          <path d={area} fill={`url(#ga${e.t})`} />
          <path d={d} fill="none" stroke={c} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" style={{filter: `drop-shadow(0 0 12px ${c})`}} />
        </g>
        {pts.map((q, i) => {const on = p >= i / Math.max(1, n - 1) - 0.001; return on ? <circle key={i} cx={X(i)} cy={Y(q[1])} r={lab.includes(i) ? 13 : 8} fill="#fff" stroke={c} strokeWidth="5" /> : null;})}
      </svg>
      {pts.map((q, i) => <div key={i} style={{position: 'absolute', left: X(i), top: h - 50, transform: 'translateX(-50%)', fontFamily: F.num, fontSize: 30, color: 'rgba(240,238,225,.6)'}}>{q[0]}</div>)}
      {lab.map((i) => {const q = pts[i]; const on = clamp((p - i / Math.max(1, n - 1)) * 6 + 0.2); return (
        <div key={`l${i}`} style={{position: 'absolute', left: X(i), top: Y(q[1]) - 92, transform: `translateX(-50%) scale(${0.6 + 0.4 * back(on)})`, opacity: on}}>
          <GText txt={`${fmt(q[1], e.dec ?? 0)}${e.unit || ''}`} size={e.vsize || 64} font="num" grad={e.grad || 'rose'} />
        </div>);})}
    </div>
  );
};
// ---------------------------------------------------------------- Bars (horizontal, grow from left)
export const Bars: React.FC<any> = ({e, t}) => {
  const w = e.w || 1100, bh = e.bh || 96, gap = e.gap || 56, lw = e.lw ?? 300, mx = e.max ?? Math.max(...e.rows.map((r: any) => r.v));
  return (
    <div style={{position: 'relative', width: w, height: e.rows.length * (bh + gap) - gap}}>
      {e.rows.map((r: any, i: number) => {
        const t0 = r.t ?? e.t + i * (e.stag ?? 0.5), p = eout(prog(t, t0, e.d ?? 0.9)), bw = ((w - lw - 220) * r.v) / mx;
        const on = t >= t0 - 0.01;
        return (
          <div key={i} style={{position: 'absolute', left: 0, top: i * (bh + gap), width: w, height: bh, opacity: on ? 1 : 0}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: lw - 30, height: bh, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center'}}>
              <div style={{fontFamily: F.ys, fontSize: e.lsize || 50, color: '#f3f1e6', whiteSpace: 'nowrap'}}>{r.label}</div>
              {r.sub && <div style={{fontFamily: F.en, fontSize: 18, letterSpacing: 2, color: 'rgba(240,238,225,.55)', whiteSpace: 'nowrap'}}>{r.sub}</div>}
            </div>
            <div style={{position: 'absolute', left: lw, top: 0, width: w - lw - 220, height: bh, borderRadius: bh / 2, background: 'rgba(255,255,255,.07)'}} />
            {r.v2 != null && <div style={{position: 'absolute', left: lw, top: 0, width: ((w - lw - 220) * r.v2) / mx * p, height: bh, borderRadius: bh / 2, background: `repeating-linear-gradient(45deg, ${r.c || '#e9f5a0'}55 0 14px, transparent 14px 28px)`, border: `3px dashed ${r.c || '#e9f5a0'}`}} />}
            <div style={{position: 'absolute', left: lw, top: 0, width: Math.max(bh, bw * p), height: bh, borderRadius: bh / 2, background: r.bg || 'linear-gradient(90deg,#c9e86b,#f2f7b6)', boxShadow: `0 0 24px ${r.c || '#e9f5a0'}55`}} />
            {r.icon && <Img src={img(`icons/${r.icon}.png`)} style={{position: 'absolute', left: lw + Math.max(bh, bw * p) - bh * 1.1, top: -bh * 0.35, height: bh * 1.6, opacity: p}} />}
            <div style={{position: 'absolute', left: lw + Math.max(bh, bw * (r.v2 != null ? Math.max(1, r.v2 / r.v) : 1) * p) + 26, top: bh / 2, transform: 'translateY(-50%)', opacity: clamp(p * 2 - 0.4), whiteSpace: 'nowrap'}}>
              <GText txt={r.txt} size={e.vsize || 76} font="num" grad={r.grad || 'lime'} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
export const ELS: any = {card: Card, concept: Concept, panel: Panel, icon: Icon, people: People, doc: Doc, slider: Slider, stack: Stack, pillar: Pillar, roof: Roof, formula: Formula, flag: Flag, entity: Entity, txt: Txt, photo: Photo, meme: Meme, bubble: Bubble, comment: Comment, stamp: Stamp, toon: Toon, spark: Spark, box: Box, chart: Chart, bars: Bars,
  tag: ({e}: any) => <Tag txt={e.txt} c={e.c} size={e.size} en={e.en} />, coin: ({e}: any) => <Coin s={e.size || 60} />, note: ({e}: any) => <Banknote w={e.size || 160} />};
export const ABS: any = {coinflow: CoinFlow, arrow: Arrow, scribble: Scribble};
