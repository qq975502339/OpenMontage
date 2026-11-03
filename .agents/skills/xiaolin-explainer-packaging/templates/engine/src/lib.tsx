import React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

export const W = 1920, H = 1080, FPS = 24;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const eio = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const eout = (p: number) => 1 - Math.pow(1 - p, 3);
export const back = (p: number) => {const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);};
export const prog = (t: number, t0: number, d: number) => clamp((t - t0) / Math.max(1e-3, d));
export const rnd = (seed: number) => {let s = (seed * 2654435761) >>> 0 || 1; return () => {s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000;};};
export const fmt = (v: number, dec = 0, sep = false) => {
  let s = v.toFixed(dec);
  if (sep) {const [a, b] = s.split('.'); s = a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? '.' + b : '');}
  return s;
};
export const img = (p: string) => staticFile(p);

export const F: any = {
  ys: "'YS','NSC',sans-serif",
  heavy: "'NSC',sans-serif",
  num: "'BB','DIN','NSC',sans-serif",
  din: "'DIN','BB',sans-serif",
  en: "'QS',sans-serif",
  wm: "'QS','NSC',sans-serif",
  serif: "Georgia,'Times New Roman',serif",
  serifsc: "'NSERIF','Songti SC',serif",
};

export const GRAD: any = {
  lime: 'linear-gradient(180deg,#fdfee8 0%,#f1f7bb 45%,#d9e47e 100%)',
  gold: 'linear-gradient(180deg,#fff6cf 0%,#f8dc80 40%,#e2ae3f 75%,#c98e22 100%)',
  steel: 'linear-gradient(180deg,#f0f4ff 0%,#b9c7ea 50%,#8193c4 100%)',
  rose: 'linear-gradient(180deg,#fff0f4 0%,#ffb3c6 50%,#f0708f 100%)',
  mint: 'linear-gradient(180deg,#effff9 0%,#aef0d8 50%,#5fc8a8 100%)',
  lilac: 'linear-gradient(180deg,#fbeaff 0%,#e3c3ff 55%,#b993f2 100%)',
  white: 'linear-gradient(180deg,#ffffff 0%,#eceaf3 100%)',
  red: 'linear-gradient(180deg,#ffd9d2 0%,#ff8a76 50%,#e2453a 100%)',
  yellow: 'linear-gradient(180deg,#fdfc9a 0%,#f6f06a 100%)',
  sky: 'linear-gradient(180deg,#eef8ff 0%,#a9dcff 55%,#5aa8ec 100%)',
  lav: 'linear-gradient(180deg,#f6f2ff 0%,#ddd2f4 50%,#ab9cd0 100%)',
};
const GLOW: any = {lime: 'rgba(236,244,150,0.35)', gold: 'rgba(255,205,90,0.35)', steel: 'rgba(170,190,240,0.3)', rose: 'rgba(255,140,170,0.35)', mint: 'rgba(120,230,190,0.3)', lilac: 'rgba(210,170,255,0.3)', white: 'rgba(255,255,255,0.25)', red: 'rgba(255,110,90,0.35)', yellow: 'rgba(250,245,110,0.3)', sky: 'rgba(120,190,255,0.3)'};
const EXT: any = {gold: '#6e4a12', lime: '#4f5520', steel: '#2f3a5e', rose: '#7a2c44', red: '#6d1d18', mint: '#1f5a49', lilac: '#4b3270', white: '#3a3848', yellow: '#6a6420', sky: '#1d4a78'};

export const GText: React.FC<any> = ({txt, size = 100, font = 'ys', grad = 'lime', glow = true, ext = false, italic = false, ls = 0, weight, color, stroke, style}) => {
  const fw = weight ?? (font === 'heavy' ? 900 : font === 'en' ? 700 : 400);
  const sh: string[] = [];
  // v6: cap filter passes. Large text (500px+) with ~20 chained drop-shadows hangs headless Chrome.
  if (ext) {
    const c = EXT[grad] || '#333'; const n = Math.min(6, Math.max(2, Math.round(size / 28)));
    const step = Math.max(1.5, (size / 28) * 1.6 / n);
    for (let i = 1; i <= n; i++) sh.push(`drop-shadow(0 ${i === 1 ? Math.max(2, step).toFixed(1) : step.toFixed(1)}px 0 ${c})`);
  }
  sh.push(`drop-shadow(0 ${Math.round(Math.min(size * 0.05, 26))}px ${Math.round(Math.min(size * 0.08, 34))}px rgba(0,0,0,0.45))`);
  if (glow) sh.push(`drop-shadow(0 0 ${Math.round(Math.min(size * 0.22, 56))}px ${GLOW[grad] || 'rgba(255,255,255,.2)'})`);
  const base: any = {
    fontFamily: F[font] || font, fontSize: size, fontWeight: fw, letterSpacing: ls, whiteSpace: 'pre', lineHeight: 1.08,
    display: 'inline-block', fontStyle: italic ? 'italic' : 'normal', paddingRight: italic ? size * 0.06 : 0,
  };
  if (color) return <span style={{...base, color, filter: sh.join(' '), WebkitTextStroke: stroke, ...style}}>{txt}</span>;
  return (
    <span style={{display: 'inline-block', filter: sh.join(' '), ...style}}>
      <span style={{...base, background: GRAD[grad] || grad, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', isolation: 'isolate'}}>{txt}</span>
    </span>
  );
};

const FONTS: [string, string, string][] = [
  ['YS', 'fonts/YouShe.ttf', '400'], ['NSC', 'fonts/NotoSC.ttf', '100 900'], ['QS', 'fonts/Quicksand.ttf', '300 700'],
  ['BB', 'fonts/Bebas.ttf', '400'], ['DIN', 'fonts/DDINCond.ttf', '400'], ['OSW', 'fonts/Oswald.ttf', '200 700'], ['NSERIF', 'fonts/NotoSerifSC.ttf', '200 900'],
];
let fontsStarted = false;
export const loadFonts = () => {
  if (fontsStarted) return; fontsStarted = true;
  const h = delayRender('fonts');
  // Load each font on its own: a missing file (e.g. YouShe.ttf, not redistributed) only drops that family,
  // and the CSS stacks in F fall back to Noto Sans SC.
  Promise.allSettled(FONTS.map(([n, f, w]) => new FontFace(n, `url(${staticFile(f)})`, {weight: w}).load().then((x) => {(document as any).fonts.add(x);})))
    .then(async (r) => {
      r.forEach((x, i) => {if (x.status === 'rejected') console.warn('font missing, using fallback:', FONTS[i][1]);});
      // Without YouShe, map the 'YS' family to Noto Sans SC clamped to weight 900, so titles and subtitles stay heavy.
      if (r[0].status === 'rejected') {
        try {(document as any).fonts.add(await new FontFace('YS', `url(${staticFile('fonts/NotoSC.ttf')})`, {weight: '900'}).load());}
        catch (e) {console.warn('YS fallback failed', e);}
      }
      continueRender(h);
    });
};
