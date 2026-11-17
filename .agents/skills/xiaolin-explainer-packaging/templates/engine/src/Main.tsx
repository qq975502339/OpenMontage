import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, useCurrentFrame} from 'remotion';
import {back, clamp, eio, eout, F, FPS, GText, img, lerp, loadFonts, prog} from './lib';
import {BG, FgBokeh, Sparkle} from './bg';
import {ABS, ELS as ELS5, Place, Ruler} from './els';
import {ELS6} from './els6';
import {ELS7} from './els7';
import {ELS8} from './els8';
import {TECH_ELS} from './bg_tech';
import {REAL_ELS} from './els_real';
import {TH} from './theme';
import {CrtFx, ENDS, TITLES} from './skins';
import {STYLE7} from './styles7';
const ELS: any = {...ELS5, ...ELS6, ...ELS7, ...ELS8, ...TECH_ELS, ...REAL_ELS};
import D from './data/shots.json';

loadFonts();
const DATA: any = D;

// ---------------------------------------------------------------- camera
const camAt = (cam: any[], t: number) => {
  let cur = {x: 960, y: 540, s: 1, rx: 0, ry: 0, rz: 0};
  if (!cam || !cam.length) return cur;
  cur = {...cur, ...cam[0]};
  let last = cam[0].t ?? 0;
  for (let i = 1; i < cam.length; i++) {
    const k = cam[i];
    if (t < k.t) break;
    const p = eio(prog(t, k.t, k.d ?? 1.0)), nx: any = {...cur};
    for (const key of ['x', 'y', 's', 'rx', 'ry', 'rz']) if (k[key] != null) nx[key] = lerp((cur as any)[key], k[key], p);
    if (p >= 1) cur = {...cur, ...Object.fromEntries(Object.entries(k).filter(([a]) => ['x', 'y', 's', 'rx', 'ry', 'rz'].includes(a)))} as any;
    else cur = nx;
    last = k.t + (k.d ?? 1.0);
  }
  const drift = clamp((t - last) * 0.006, 0, 0.05);
  return {...cur, s: cur.s * (1 + drift)};
};

// ---------------------------------------------------------------- special cards
const ROT1 = [-8, 5, -4, 7, -6, 4, -5];
const TitleCard: React.FC<any> = ({e, t}) => {
  const l1 = Array.from(e.l1 as string), l2 = Array.from(e.l2 as string);
  const slam = e.t + (e.slam ?? 0.55);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: e.y1 ?? 250, display: 'flex', justifyContent: 'center', gap: 6}}>
        {l1.map((c, i) => {const p = prog(t, e.t + i * 0.07, 0.4); return <span key={i} style={{fontFamily: F.heavy, fontWeight: 900, fontSize: e.s1 ?? 128, color: '#f6f4ee', display: 'inline-block', transform: `translateY(${(1 - back(p)) * -120}px) rotate(${ROT1[i % 7]}deg)`, opacity: clamp(p * 3), textShadow: '0 10px 18px rgba(0,0,0,.5)'}}>{c}</span>;})}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: e.y2 ?? 430, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 4}}>
        {l2.map((c, i) => {const p = prog(t, slam + i * 0.06, 0.38); return <span key={i} style={{fontFamily: F.heavy, fontWeight: 900, fontSize: e.s2 ?? 270, lineHeight: 1, color: '#f8f56b', display: 'inline-block', transform: `scale(${lerp(2.4, 1, back(p))}) rotate(${[-3, 4, -2, 3, -4][i % 5]}deg)`, opacity: clamp(p * 4), textShadow: '0 14px 26px rgba(0,0,0,.55)'}}>{c}</span>;})}
        {e.l2b && Array.from(e.l2b as string).map((c, i) => {const p = prog(t, slam + 0.25 + i * 0.06, 0.35); return <span key={'b' + i} style={{fontFamily: F.heavy, fontWeight: 900, fontSize: e.s2b ?? 150, lineHeight: 1.1, color: '#f8f56b', display: 'inline-block', transform: `scale(${lerp(2, 1, back(p))}) rotate(${[4, -3, 5][i % 3]}deg)`, opacity: clamp(p * 4), textShadow: '0 12px 22px rgba(0,0,0,.5)'}}>{c}</span>;})}
        {e.q && <span style={{fontFamily: F.heavy, fontWeight: 900, fontSize: 170, color: '#f6f4ee', display: 'inline-block', transform: `rotate(14deg) scale(${back(prog(t, slam + 0.45, 0.35))})`, marginLeft: 10}}>{e.q}</span>}
      </div>
      {[[e.sp1x ?? 330, 470 + (e.spy ?? 0), 90, 0], [e.sp1x ? e.sp1x + 40 : 370, 590 + (e.spy ?? 0), 54, 1], [e.sp2x ?? 1560, 460 + (e.spy ?? 0), 80, 2], [e.sp2x ? e.sp2x - 30 : 1530, 590 + (e.spy ?? 0), 50, 3]].map(([x, y, s, k], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y, opacity: clamp(prog(t, slam + 0.2 + i * 0.08, 0.3) * 2), transform: `scale(${0.8 + 0.2 * Math.sin(t * 5 + k)}) rotate(${k * 9}deg)`}}><Sparkle s={s} /></div>
      ))}
      {e.en && <div style={{position: 'absolute', left: 0, right: 0, top: e.ye ?? 790, textAlign: 'center', fontFamily: F.en, fontWeight: 700, fontSize: e.se ?? 40, color: '#f6f4ee', letterSpacing: 1.5, opacity: eout(prog(t, slam + 0.55, 0.5))}}>{e.en}</div>}
    </AbsoluteFill>
  );
};
const EndCard: React.FC<any> = ({e, t}) => {
  const w = Array.from('谢谢观看');
  // dark end (plate themes): title-yellow heading + light text; light end: pink heading on mint
  const DK = TH.end === 'dark', ink = DK ? '#f6f4ee' : '#1f5a49';
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 170, top: 300, display: 'flex', gap: 10}}>
        {w.map((c, i) => {const p = prog(t, e.t + 0.1 + i * 0.1, 0.45); return <span key={i} style={{fontFamily: F.heavy, fontWeight: 900, fontSize: 210, color: DK ? '#f8f56b' : '#ff7fa3', WebkitTextStroke: DK ? undefined : '10px #ffffff', paintOrder: 'stroke fill', textShadow: DK ? '0 12px 30px rgba(0,0,0,.55)' : undefined, display: 'inline-block', transform: `translateY(${(1 - back(p)) * 140}px) rotate(${[-6, 5, -4, 6][i]}deg)`, opacity: clamp(p * 3), filter: 'drop-shadow(0 14px 18px rgba(30,90,70,.35))'}}>{c}</span>;})}
      </div>
      {(D as any).en_labels !== false && <div style={{position: 'absolute', left: 190, top: 590, fontFamily: F.en, fontWeight: 700, fontSize: 48, color: ink, letterSpacing: 4, opacity: eout(prog(t, e.t + 0.8, 0.5))}}>THANKS FOR WATCHING</div>}
      <div style={{position: 'absolute', left: 190, top: 680, fontFamily: F.heavy, fontWeight: 800, fontSize: 52, color: ink, textShadow: DK ? '0 6px 18px rgba(0,0,0,.6)' : undefined, opacity: eout(prog(t, e.t + 1.1, 0.5))}}>我们下期再见</div>
      {(D as any).brand?.endToon && <Img src={img((D as any).brand.endToon)} style={{position: 'absolute', right: 140, top: 160 + Math.sin(t * 3) * 8, height: 860, filter: 'drop-shadow(0 24px 30px rgba(20,70,55,.35))', transform: `rotate(${Math.sin(t * 2.6) * 2}deg)`, opacity: clamp(prog(t, e.t, 0.4) * 2)}} />}
    </AbsoluteFill>
  );
};
// each theme has its own title and end card (skins.tsx); TitleCard / EndCard stay as the generic fallback
const TitleAny: React.FC<any> = (p) => {const C = (TH.s7 && STYLE7[TH.style]?.Title) || TITLES[TH.title] || TitleCard; return <C {...p} />;};
const EndAny: React.FC<any> = (p) => {const C = (TH.s7 && STYLE7[TH.style]?.End) || ENDS[TH.end] || EndCard; return <C {...p} />;};
const SCREEN: any = {titlecard: TitleAny, endcard: EndAny, ruler: Ruler};

// ---------------------------------------------------------------- element dispatcher
const ElView: React.FC<{e: any; t: number; xb?: number}> = ({e, t, xb = 0}) => {
  if (ABS[e.k]) {
    if (t < e.t) return null;
    if (e.out != null && t > e.out + 0.4) return null;
    const op = e.out != null ? 1 - eout(prog(t, e.out, 0.35)) : 1;
    const C = ABS[e.k];
    return <div style={{position: 'absolute', left: 0, top: 0, opacity: op, transform: `translateZ(${e.z ?? 0}px)`}}><C e={e} t={t} /></div>;
  }
  if (SCREEN[e.k]) {
    if (t < e.t) return null;
    if (e.out != null && t > e.out + 0.4) return null;
    const C = SCREEN[e.k];
    return <div style={{position: 'absolute', inset: 0, opacity: e.out != null ? 1 - eout(prog(t, e.out, 0.35)) : eout(prog(t, e.t, 0.3))}}><C e={e} t={t} /></div>;
  }
  const C = ELS[e.k];
  if (!C) return null;
  return <Place e={e} t={t} xb={xb}>{(v) => <C e={e} t={t} v={v} />}</Place>;
};

// v5 depth of field: when the camera pushes in, elements far from the focus point go soft; z-offset elements are always a little soft
const dofBlur = (e: any, cam: any) => {
  if (e.abs || e.x == null || e.nodof || ABS[e.k] || SCREEN[e.k]) return 0;
  let b = 0;
  const k = clamp((cam.s - 1.08) / 0.45);
  if (k > 0) {
    const R = 960 / cam.s, dist = Math.hypot(e.x - cam.x, (e.y - cam.y) * 1.5);
    b += clamp((dist - R * 0.7) / R) * 7 * k;
  }
  if (e.z) b += Math.min(6, Math.abs(e.z) / 160);
  return b;
};

const SceneView: React.FC<{sc: any; t: number}> = ({sc, t}) => {
  const cam = camAt(sc.cam, t);
  const ry = cam.ry + (sc.sway ?? 0.5) * Math.sin(t * 0.45), rx = cam.rx + (sc.sway ?? 0.5) * 0.6 * Math.cos(t * 0.38);
  let fx = '', flash = 0;
  for (const f of sc.fx || []) {
    if (f.k === 'shake' && t >= f.t && t < f.t + (f.d ?? 0.3)) {const a = (f.a ?? 14) * (1 - (t - f.t) / (f.d ?? 0.3)); fx = `translate(${Math.sin(t * 97) * a}px,${Math.cos(t * 83) * a}px)`;}
    if (f.k === 'flash' && t >= f.t && t < f.t + (f.d ?? 0.25)) flash = Math.max(flash, 0.8 * (1 - (t - f.t) / (f.d ?? 0.25)));
  }
  const world = sc.els.filter((e: any) => e.layer !== 'screen'), screen = sc.els.filter((e: any) => e.layer === 'screen');
  return (
    <AbsoluteFill style={{zIndex: 1, transform: fx || undefined}}>
      <BG bg={sc.bg} t={t} cam={cam} sc={sc} />
      {world.length > 0 && (
        <AbsoluteFill style={{perspective: sc.persp ?? 2300, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformStyle: 'preserve-3d', transformOrigin: '960px 540px', transform: `rotateZ(${cam.rz}deg) rotateX(${rx}deg) rotateY(${ry}deg) scale(${cam.s}) translate(${960 - cam.x}px, ${540 - cam.y}px)`}}>
            {world.map((e: any, i: number) => <ElView key={i} e={e} t={t} xb={dofBlur(e, cam)} />)}
          </div>
        </AbsoluteFill>
      )}
      <FgBokeh sc={sc} cam={cam} lag={camAt(sc.cam, t - 0.45)} t={t} />
      <CrtFx sc={sc} t={t} />
      {screen.length > 0 && <AbsoluteFill style={{zIndex: 5}}>{screen.map((e: any, i: number) => <ElView key={i} e={e} t={t} />)}</AbsoluteFill>}
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash, zIndex: 9}} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- A-roll layer
const zoomAt = (zs: any[], t: number) => {
  if (!zs || !zs.length) return {z: 1, cx: 50, cy: 36};
  let z = zs[0];
  for (const k of zs) if (t + 1e-6 >= k[0]) z = k;
  return {z: z[1], cx: z[2] ?? 50, cy: z[3] ?? 36};
};
const ARoll: React.FC<{t: number; b: any}> = ({t, b}) => {
  const mode = b.aroll || 'full';
  let outer: any, inner: any;
  if (mode === 'piprect') {
    // v6: tall rounded-rect PiP on the left (her 2025+ panel layout), about 450x760
    const L = b.px ?? 110, T = b.py ?? 150, w = b.pw ?? 450, h = b.ph ?? 740, k = b.pipk ?? 0.78;
    const p = prog(t, b.t0, 0.4), vw = 1920 * k, vh = 1097 * k;
    outer = {position: 'absolute', left: L, top: T, width: w, height: h, borderRadius: TH.name === 'finance' ? 22 : TH.name === 'desk' ? 10 : 0, overflow: 'hidden', zIndex: 40, border: `4px solid ${TH.pip?.rect ?? 'rgba(240,232,255,.85)'}`, boxShadow: '0 24px 60px rgba(0,0,0,.6)', transform: `translateX(${(1 - eout(p)) * -560}px)`, background: '#222'};
    inner = {position: 'absolute', left: w / 2 - vw * (b.pfx ?? 0.5), top: (b.fy ?? 250) - vh * (b.pfy ?? 0.36), width: vw, height: vh};
  } else if (mode === 'pip') {
    const d = b.pipd ?? 330, [cx, cy] = b.pip === 'br' ? [1690, 836] : b.pip === 'tr' ? [1690, 250] : [222, 836];
    const p = prog(t, b.t0, 0.35), k = (b.pipk ?? 0.62);
    const vw = 1920 * k, vh = 1097 * k;
    outer = {position: 'absolute', left: cx - d / 2, top: cy - d / 2, width: d, height: d, borderRadius: '50%', overflow: 'hidden', zIndex: 40, border: `5px solid ${TH.pip?.ring ?? '#efe0a8'}`, boxShadow: '0 14px 40px rgba(0,0,0,.6)', transform: `scale(${back(p)})`, background: '#222'};
    inner = {position: 'absolute', left: d / 2 - vw * (b.pfx ?? 0.5), top: d / 2 - vh * (b.pfy ?? 0.4), width: vw, height: vh};
  } else if (mode === 'full') {
    const z = zoomAt(b.zoom, t);
    // adim / ablur: darken and soften the presenter so a card can sit on top of her (her 'card over A-roll' layout)
    const soft = b.adim != null || b.ablur;
    outer = {position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'hidden', zIndex: 0, filter: soft ? `brightness(${b.adim ?? 1}) blur(${b.ablur ?? 0}px) saturate(.9)` : undefined};
    inner = {position: 'absolute', left: 0, top: -8, width: 1920, height: 1097, transformOrigin: `${z.cx}% ${z.cy}%`, transform: `scale(${z.z * (b.ablur ? 1.04 : 1)})`};
  } else {
    outer = {position: 'absolute', left: 0, top: 0, width: 4, height: 4, overflow: 'hidden', opacity: 0, zIndex: 0};
    inner = {width: 4, height: 4};
  }
  return (
    <div style={outer}>
      <div style={inner}>
        {DATA.vsegs.map((v: any, i: number) => (
          <Sequence key={i} from={Math.round(v.t0 * FPS)} durationInFrames={Math.max(1, Math.round(v.dur * FPS))} layout="none">
            <OffthreadVideo src={img(v.src)} startFrom={Math.round(v.from * FPS)} muted style={{width: '100%', height: '100%', display: 'block'}} />
          </Sequence>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- subtitles + watermark
const Subs: React.FC<{t: number}> = ({t}) => {
  const s = DATA.subs.find((x: any) => t >= x.t0 && t < x.t1);
  if (!s || !s.text) return null;
  const ol = Array.from({length: 12}).map((_, i) => {const a = (i / 12) * Math.PI * 2; return `${(Math.cos(a) * 2.6).toFixed(2)}px ${(Math.sin(a) * 2.6).toFixed(2)}px 0 rgba(18,18,24,.92)`;}).join(',');
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 922, textAlign: 'center', zIndex: 60, fontFamily: F.ys, fontSize: 64, color: '#ffffff', letterSpacing: 2, textShadow: `${ol}, 0 4px 10px rgba(0,0,0,.55)`, whiteSpace: 'nowrap'}}>{s.text}</div>
  );
};
const Watermark: React.FC = () => (
  <>
    <div style={{position: 'absolute', right: 62, top: 40, zIndex: 70, fontFamily: F.wm, fontWeight: 700, fontSize: 36, color: 'rgba(255,255,255,.92)', textShadow: '0 2px 6px rgba(0,0,0,.45)', letterSpacing: 0.5}}>{(D as any).brand?.logo ?? ''}</div>
    <div style={{position: 'absolute', left: 34, top: 26, zIndex: 70, fontFamily: F.heavy, fontWeight: 500, fontSize: 19, color: 'rgba(255,255,255,.55)', letterSpacing: 1}}>{(D as any).brand?.label ?? 'AI生成 · 实验作品 · 非本人'}</div>
  </>
);

// ---------------------------------------------------------------- one block = A-roll layer + scene
const Shot: React.FC<{b: any; t: number}> = ({b, t}) => {
  const sc = b.scene ? DATA.scenes[b.scene] : null;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <ARoll t={t} b={b} />
      {sc && <SceneView sc={sc} t={t} />}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- v5 transitions (research/PACKAGING.md)
const TRANS: any[] = DATA.trans || [];
const Layer: React.FC<{st?: any; b: any; t: number}> = ({st, b, t}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'hidden', ...st}}><Shot b={b} t={t} /></div>
);
const Trans: React.FC<{tr: any; p: number; t: number; a: any; b: any; f: number}> = ({tr, p, t, a, b, f}) => {
  const W = 1920, dir = tr.dir || 1, s = Math.sin(Math.PI * p);
  if (tr.k === 'whip') {
    const e = eio(p), id = `mb${f}`;
    return (
      <>
        <svg width="0" height="0" style={{position: 'absolute'}}><filter id={id} x="-15%" y="0%" width="130%" height="100%"><feGaussianBlur stdDeviation={`${(80 * s).toFixed(1)} 0`} /></filter></svg>
        {e < 0.98 && <Layer b={a} t={t} st={{zIndex: 1, transform: `translateX(${-dir * W * e}px)`, filter: `url(#${id})`}} />}
        {e > 0.02 && <Layer b={b} t={t} st={{zIndex: 2, transform: `translateX(${dir * W * (1 - e)}px)`, filter: `url(#${id})`}} />}
      </>
    );
  }
  if (tr.k === 'zoom' || tr.k === 'zoomspin') {
    const spin = tr.k === 'zoomspin' ? 18 * dir : 0, fl = Math.max(0, 1 - Math.abs(p - 0.5) / 0.2);
    let body;
    if (p < 0.5) {
      const k = (p / 0.5) ** 2;
      body = <Layer b={a} t={t} st={{transform: `scale(${1 + 1.4 * k}) rotate(${spin * k}deg)`, filter: `blur(${(18 * k).toFixed(1)}px) brightness(${1 + 0.5 * k})`}} />;
    } else {
      const k = 1 - eout((p - 0.5) / 0.5);
      body = <Layer b={b} t={t} st={{transform: `scale(${1 + 0.7 * k}) rotate(${-spin * k}deg)`, filter: `blur(${(18 * k).toFixed(1)}px) brightness(${1 + 0.5 * k})`}} />;
    }
    return (
      <>
        {body}
        <AbsoluteFill style={{zIndex: 5, opacity: fl * 0.75, background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,248,230,.85) 38%, rgba(255,255,255,0) 72%)'}} />
      </>
    );
  }
  if (tr.k === 'flash') {
    const mix = clamp((p - 0.38) / 0.24), x = lerp(-35, 135, p);
    return (
      <>
        {mix < 1 && <Layer b={a} t={t} st={{zIndex: 1}} />}
        {mix > 0 && <Layer b={b} t={t} st={{zIndex: 2, opacity: mix}} />}
        <AbsoluteFill style={{zIndex: 5, mixBlendMode: 'screen', opacity: s, background: `radial-gradient(ellipse 50% 90% at ${x}% 45%, rgba(255,196,120,.95) 0%, rgba(255,120,90,.6) 34%, rgba(255,80,140,0) 70%)`}} />
        <AbsoluteFill style={{zIndex: 6, background: '#fff6e6', opacity: Math.max(0, 1 - Math.abs(p - 0.5) / 0.16) * 0.55}} />
      </>
    );
  }
  if (tr.k === 'glitch') {
    const id = `gl${f}`, sh = 22 * s;
    return (
      <>
        <svg width="0" height="0" style={{position: 'absolute'}}>
          <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.00001 0.04" numOctaves="1" seed={f % 97} result="n" />
            <feComponentTransfer in="n" result="n2"><feFuncR type="discrete" tableValues="0.5 0.5 0.12 0.5 0.9 0.5 0.5 0.28 0.5 0.75" /><feFuncG type="linear" slope="0" intercept="0.5" /></feComponentTransfer>
            <feDisplacementMap in="SourceGraphic" in2="n2" scale={(190 * s).toFixed(0)} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feOffset in="r" dx={sh} result="r2" />
            <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bb" />
            <feOffset in="bb" dx={-sh} result="b2" />
            <feBlend in="r2" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b2" mode="screen" />
          </filter>
        </svg>
        <Layer b={p < 0.5 ? a : b} t={t} st={{filter: `url(#${id})`}} />
        <AbsoluteFill style={{zIndex: 5, opacity: 0.3 * s, backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,.65) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
      </>
    );
  }
  if (tr.k === 'push') {
    const e = eio(p), k = 1 - 0.035 * s;
    return (
      <>
        {e < 0.99 && <Layer b={a} t={t} st={{zIndex: 1, transform: `translateX(${-dir * W * e}px) scale(${k})`, filter: `brightness(${1 - 0.35 * e})`}} />}
        <Layer b={b} t={t} st={{zIndex: 2, transform: `translateX(${dir * W * (1 - e)}px) scale(${k})`, boxShadow: '0 0 80px rgba(0,0,0,.75)'}} />
      </>
    );
  }
  if (tr.k === 'iris') {
    const r = eio(p) * 1150;
    return (
      <>
        <Layer b={a} t={t} st={{zIndex: 1, transform: `scale(${1 + 0.08 * p})`}} />
        <Layer b={b} t={t} st={{zIndex: 2, clipPath: `circle(${r.toFixed(1)}px at 50% 50%)`}} />
        <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, zIndex: 3}}><circle cx={960} cy={540} r={r} fill="none" stroke="#f8f56b" strokeWidth={2 + 10 * (1 - p)} /></svg>
      </>
    );
  }
  return <Layer b={p < 0.5 ? a : b} t={t} />;
};

export const Main: React.FC = () => {
  const f = useCurrentFrame(), t = f / FPS;
  const blocks = DATA.blocks;
  const tr = TRANS.find((x: any) => t >= x.t - x.d / 2 && t < x.t + x.d / 2);
  let body;
  if (tr) {
    const p = clamp((t - (tr.t - tr.d / 2)) / tr.d);
    body = <Trans tr={tr} p={p} t={t} a={blocks[tr.i - 1]} b={blocks[tr.i]} f={f} />;
  } else {
    const b = blocks.find((x: any) => t >= x.t0 - 1e-6 && t < x.t1 - 1e-6) || blocks[blocks.length - 1];
    body = <Shot b={b} t={t} />;
  }
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      {body}
      <Subs t={t} />
      <Watermark />
    </AbsoluteFill>
  );
};
