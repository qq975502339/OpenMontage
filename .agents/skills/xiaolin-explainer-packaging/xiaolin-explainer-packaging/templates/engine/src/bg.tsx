import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence} from 'remotion';
import {clamp, eio, eout, F, FPS, img, lerp, prog, rnd} from './lib';

export const Banknote: React.FC<{w?: number; c?: string; style?: any}> = ({w = 120, c = '#e98e9c', style}) => (
  <svg width={w} height={w * 0.54} viewBox="0 0 120 65" style={style}>
    <rect x="1.5" y="1.5" width="117" height="62" rx="4" fill={c} stroke="#a9455f" strokeWidth="2.5" />
    <rect x="7" y="7" width="106" height="51" rx="2" fill="none" stroke="#fff4f4" strokeOpacity=".75" strokeWidth="1.6" />
    <circle cx="60" cy="32.5" r="15" fill="#fff2f2" stroke="#a9455f" strokeWidth="1.6" />
    <text x="60" y="40" textAnchor="middle" fontSize="21" fontWeight="900" fill="#c24a66" fontFamily="Arial">¥</text>
    <circle cx="24" cy="32.5" r="6" fill="none" stroke="#fff4f4" strokeWidth="1.6" />
    <circle cx="96" cy="32.5" r="6" fill="none" stroke="#fff4f4" strokeWidth="1.6" />
  </svg>
);

export const NoteRows: React.FC<{t: number}> = ({t}) => {
  const sp = 134, off = (t * 18) % sp;
  const row = (y: number, dir: number) => (
    <div style={{position: 'absolute', left: 0, top: y, width: 1920, height: 70}}>
      {Array.from({length: 17}).map((_, i) => (
        <Banknote key={i} w={112} style={{position: 'absolute', left: i * sp - sp + dir * off, top: 0}} />
      ))}
    </div>
  );
  return <>{row(40, 1)}{row(978, -1)}</>;
};

export const Sparkle: React.FC<{s?: number; c?: string; style?: any}> = ({s = 60, c = '#3cc6dc', style}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={style}>
    <path d="M50 4 C54 36 64 46 96 50 C64 54 54 64 50 96 C46 64 36 54 4 50 C36 46 46 36 50 4 Z" fill={c} stroke="#ffffff" strokeWidth="7" strokeLinejoin="round" />
  </svg>
);

const wob = 'url(#wobble)';
export const Doodles: React.FC<{t: number}> = ({t}) => {
  const b = (k: number) => Math.sin(t * 2.2 + k) * 4;
  const st = {fill: 'none', strokeWidth: 5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <AbsoluteFill>
      <svg width="0" height="0"><filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" /><feDisplacementMap in="SourceGraphic" scale="5" /></filter></svg>
      {/* sun */}
      <svg width="190" height="190" viewBox="0 0 190 190" style={{position: 'absolute', left: 30, top: 140 + b(0), filter: wob}}>
        <circle cx="95" cy="95" r="44" fill="#d8b94a" stroke="#f2e6b8" {...st} />
        {Array.from({length: 10}).map((_, i) => {const a = (i / 10) * Math.PI * 2; return <line key={i} x1={95 + Math.cos(a) * 58} y1={95 + Math.sin(a) * 58} x2={95 + Math.cos(a) * 80} y2={95 + Math.sin(a) * 80} stroke="#f2e6b8" {...st} />;})}
        <path d="M75 100 Q95 120 115 100" stroke="#7a5a10" {...st} /><circle cx="80" cy="85" r="4" fill="#7a5a10" /><circle cx="110" cy="85" r="4" fill="#7a5a10" />
      </svg>
      {/* hourglass */}
      <svg width="150" height="190" viewBox="0 0 150 190" style={{position: 'absolute', left: 1730, top: 170 + b(1), filter: wob, transform: 'rotate(12deg)'}}>
        <path d="M30 15 H120 M30 175 H120" stroke="#f2e6b8" {...st} />
        <path d="M42 18 C42 70 108 80 108 95 C108 110 42 120 42 172 M108 18 C108 70 42 80 42 95 C42 110 108 120 108 172" stroke="#3ea9a4" {...st} />
        <path d="M58 150 Q75 128 92 150 Z" fill="#e7c65a" stroke="none" />
      </svg>
      {/* old man with cane */}
      <svg width="170" height="200" viewBox="0 0 170 200" style={{position: 'absolute', left: 50, top: 760 + b(2), filter: wob}}>
        <circle cx="78" cy="38" r="20" fill="#9a9aa4" stroke="none" />
        <path d="M74 60 Q66 100 72 130 M72 128 L52 182 M72 128 L96 182 M70 78 Q96 92 112 112 M112 112 L118 186" stroke="#9a9aa4" strokeWidth="13" fill="none" strokeLinecap="round" />
      </svg>
      {/* mountain + flag */}
      <svg width="200" height="200" viewBox="0 0 200 200" style={{position: 'absolute', left: 1700, top: 740 + b(3), filter: wob}}>
        <path d="M10 185 L80 70 L115 120 L135 95 L190 185 Z" fill="#3ea9a4" stroke="#f2e6b8" {...st} />
        <path d="M80 70 L66 98 L80 92 L92 100 Z" fill="#f2f2f2" stroke="none" />
        <path d="M80 72 V20" stroke="#f2e6b8" {...st} /><path d="M80 22 L118 32 L80 44 Z" fill="#3ea9a4" stroke="#f2e6b8" strokeWidth="4" />
      </svg>
      {/* coin sketch above the title */}
      <svg width="120" height="110" viewBox="0 0 120 110" style={{position: 'absolute', left: 1040, top: 130 + b(4), filter: wob}}>
        <ellipse cx="60" cy="60" rx="36" ry="36" stroke="#f2f2f2" strokeWidth="3.5" fill="none" />
        <text x="60" y="73" textAnchor="middle" fontSize="38" fill="#f2f2f2" fontFamily="Arial" fontWeight="700">¥</text>
        <path d="M14 22 l10 8 M106 18 l-8 10 M60 6 v10" stroke="#f2f2f2" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </AbsoluteFill>
  );
};

// muted geometric blocks used on her dark explainer backgrounds
export const Shapes: React.FC<{cam: any; t: number; v?: number}> = ({cam, t, v = 0}) => {
  const px = -(cam.x - 960) * 0.04, py = -(cam.y - 540) * 0.04;
  const sets = [
    [
      {pts: '0,0 480,0 380,230 0,260', c: '#3f8a86'}, {pts: '470,0 620,0 600,40 455,52', c: '#7cc0bf'},
      {pts: '1420,0 1760,0 1745,230 1440,215', c: '#8b9a3c'}, {pts: '1460,1080 1920,700 1920,1080', c: '#8b9a3c'},
      {pts: '0,860 820,940 860,1080 0,1080', c: '#5b6a9e'},
    ],
    [
      {pts: '0,0 300,0 140,330 0,360', c: '#5b6a9e'}, {pts: '1500,0 1920,0 1920,300 1660,250', c: '#3f8a86'},
      {pts: '0,1080 0,780 420,1080', c: '#8b9a3c'}, {pts: '1240,1080 1920,860 1920,1080', c: '#7a4f7e'},
    ],
  ];
  const s = sets[v % sets.length];
  return (
    <AbsoluteFill style={{transform: `translate(${px}px,${py}px)`}}>
      <svg width="1920" height="1080" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {s.map((p, i) => <polygon key={i} points={p.pts} fill={p.c} opacity={0.88} />)}
        {v % 2 === 0 ? <circle cx="10" cy="840" r="150" fill="#4a78c8" opacity="0.9" /> : <circle cx="1910" cy="520" r="120" fill="#4a78c8" opacity="0.85" />}
      </svg>
      <Banknote w={170} c="#8e4d58" style={{position: 'absolute', left: 1240, top: -40, transform: `rotate(${-18 + Math.sin(t * 0.6) * 3}deg)`, opacity: 0.9}} />
      <Banknote w={170} c="#8e4d58" style={{position: 'absolute', left: 790, top: 1015, transform: `rotate(${14 + Math.sin(t * 0.5) * 3}deg)`, opacity: 0.9}} />
    </AbsoluteFill>
  );
};

export const Particles: React.FC<{t: number; n?: number; seed?: number}> = ({t, n = 46, seed = 7}) => {
  const r = rnd(seed);
  const ps = Array.from({length: n}).map(() => ({x: r() * 1920, y: r() * 1080, s: 18 + r() * 46, b: r() * 6, sp: 10 + r() * 22, o: 0.25 + r() * 0.5, ph: r() * 6}));
  return (
    <AbsoluteFill>
      {ps.map((p, i) => {
        const y = ((p.y + t * p.sp) % 1180) - 50;
        return <div key={i} style={{position: 'absolute', left: p.x + Math.sin(t * 0.7 + p.ph) * 12, top: y, fontFamily: 'Arial', fontWeight: 900, fontSize: p.s, color: '#e9c46a', opacity: p.o, filter: `blur(${p.b}px)`}}>¥</div>;
      })}
    </AbsoluteFill>
  );
};

export const FilmStrip: React.FC = () => (
  <>
    {[0, 1050].map((y) => (
      <div key={y} style={{position: 'absolute', left: 0, top: y, width: 1920, height: 30, background: '#0c0c10'}}>
        {Array.from({length: 40}).map((_, i) => <div key={i} style={{position: 'absolute', left: 14 + i * 48, top: 8, width: 26, height: 14, borderRadius: 4, background: '#ff7b9c'}} />)}
      </div>
    ))}
  </>
);

export const Vignette: React.FC<{k?: number}> = ({k = 0.55}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${k}) 100%)`, pointerEvents: 'none'}} />
);
export const Grain: React.FC<{t: number; o?: number}> = ({t, o = 0.07}) => {
  const f = Math.floor(t * 12) % 4;
  return <AbsoluteFill style={{backgroundImage: `url(${img('fx/noise.png')})`, backgroundPosition: `${f * 137}px ${f * 71}px`, opacity: o, mixBlendMode: 'overlay'}} />;
};

export const BG: React.FC<{bg: any; t: number; cam: any; sc: any}> = ({bg, t, cam, sc}) => {
  if (!bg || bg.type === 'none') return null;
  const lt = t - sc.t0;
  if (bg.type === 'dark') {
    return (
      <AbsoluteFill style={{background: bg.base || 'radial-gradient(ellipse at 50% 45%, #29272f 0%, #1b1a20 60%, #141318 100%)'}}>
        {bg.photo && <Img src={img(bg.photo)} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, objectFit: 'cover', filter: `blur(${bg.blur ?? 10}px) brightness(${bg.bright ?? 0.35}) saturate(0.7)`, transform: `scale(${1.08 + lt * 0.004})`}} />}
        {bg.shapes !== false && !bg.photo && (
          <div style={{position: 'absolute', inset: 0, filter: cam.s > 1.05 ? `blur(${Math.min(3.2, (cam.s - 1.05) * 6).toFixed(2)}px)` : undefined}}>
            <Shapes cam={cam} t={t} v={bg.v || 0} />
          </div>
        )}
        {bg.particles && <Particles t={t} seed={bg.seed || 7} />}
        <Grain t={t} />
        <Vignette k={0.5} />
      </AbsoluteFill>
    );
  }
  if (bg.type === 'paper') {
    return (
      <AbsoluteFill style={{background: bg.base || '#f4f4f1'}}>
        <Grain t={t} />
        <Vignette k={0.18} />
      </AbsoluteFill>
    );
  }
  if (bg.type === 'broll') {
    const d = Math.max(1, (bg.t1 ?? sc.t0 + 8) - sc.t0), p = clamp(lt / d);
    const s = lerp(bg.s0 ?? 1.04, bg.s1 ?? 1.14, p), dx = lerp(bg.x0 ?? 0, bg.x1 ?? -30, p), dy = lerp(bg.y0 ?? 0, bg.y1 ?? 0, p);
    const filt = bg.bw ? 'grayscale(1) contrast(1.15) brightness(0.92) sepia(0.18)' : `brightness(${bg.bright ?? 0.95}) saturate(${bg.sat ?? 1})`;
    return (
      <AbsoluteFill style={{background: '#000'}}>
        {bg.video ? (
          <Sequence from={Math.round((sc.t0 - (bg.pre ?? 0)) * FPS)} layout="none">
            <OffthreadVideo src={img(bg.video)} muted style={{position: 'absolute', inset: 0, width: 1920, height: 1080, objectFit: 'cover', filter: filt, transform: `scale(${s}) translate(${dx}px,${dy}px)`}} />
          </Sequence>
        ) : (
          <Img src={img(bg.img)} style={{position: 'absolute', inset: 0, width: 1920, height: 1080, objectFit: 'cover', filter: filt, transform: `scale(${s}) translate(${dx}px,${dy}px)`}} />
        )}
        {bg.dim ? <AbsoluteFill style={{background: `rgba(10,10,16,${bg.dim})`}} /> : null}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)'}} />
        {bg.bw && <Grain t={t} o={0.16} />}
        <Vignette k={bg.bw ? 0.75 : 0.45} />
      </AbsoluteFill>
    );
  }
  if (bg.type === 'title') {
    return (
      <AbsoluteFill style={{background: '#141316'}}>
        <NoteRows t={t} />
        <Doodles t={t} />
        <Grain t={t} o={0.05} />
      </AbsoluteFill>
    );
  }
  if (bg.type === 'end') {
    return (
      <AbsoluteFill style={{background: 'linear-gradient(160deg,#bfeee0 0%,#9fe0d0 100%)'}}>
        <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
          <path d={`M0 ${780 + Math.sin(t) * 10} C 400 700, 700 900, 1100 820 S 1700 700, 1920 760 L1920 1080 L0 1080 Z`} fill="#7fd0bd" />
          <path d={`M0 ${900 + Math.cos(t) * 8} C 500 840, 900 1000, 1300 930 S 1800 860, 1920 900 L1920 1080 L0 1080 Z`} fill="#63bfa9" />
          <circle cx={1650 + Math.sin(t * 0.7) * 10} cy="200" r="150" fill="#ffd6e0" opacity=".7" />
          <circle cx={260} cy={260 + Math.cos(t * 0.6) * 10} r="90" fill="#fff4c2" opacity=".8" />
        </svg>
      </AbsoluteFill>
    );
  }
  return null;
};

// v5: out-of-focus foreground objects (coins / banknotes) at the frame edges, moving faster than the camera (parallax)
export const FgBokeh: React.FC<{sc: any; cam: any; t: number}> = ({sc, cam, t}) => {
  const bg = sc.bg || {};
  if (sc.fg === false || bg.type !== 'dark') return null;
  const r = rnd((Math.round(sc.t0 * 100) % 9973) + 11);
  if (sc.fg !== true && r() > 0.62) return null;
  const spots = [[-60, 940], [1985, 150], [1935, 1000], [-30, 110], [1700, 1135], [250, 1125]];
  const pick = spots.map((p) => ({p, k: r()})).sort((a, b) => a.k - b.k).slice(0, 3);
  const px = -(cam.x - 960) * 0.45, py = -(cam.y - 540) * 0.45, zs = 1 + (cam.s - 1) * 0.7;
  return (
    <AbsoluteFill style={{zIndex: 4, pointerEvents: 'none', transform: `translate(${px}px,${py}px) scale(${zs})`, transformOrigin: '960px 540px'}}>
      {pick.map(({p: [x, y]}, i) => {
        const rot = (r() - 0.5) * 70, sz = 1 + r() * 0.5, ph = r() * 6;
        const dx = Math.sin(t * 0.35 + ph) * 18, dy = Math.cos(t * 0.3 + ph) * 14;
        const st: any = {position: 'absolute', left: x + dx, top: y + dy, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${sz})`, filter: `blur(${15 + i * 4}px)`, opacity: 0.82};
        return i === 1 ? <Banknote key={i} w={340} style={st} /> : <Img key={i} src={img('icons/coins.png')} style={{...st, width: i === 0 ? 300 : 230}} />;
      })}
    </AbsoluteFill>
  );
};
