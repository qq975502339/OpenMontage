// v6 layout components. Each one encodes a recurring 小Lin说 explainer layout, sized to fill the frame.
// Rules (see PLAN_v6.md): hero >= 60% of frame width, cropped by frame edges, one lit item, white paper alternates with dark.
// Every surface reads the theme tokens (theme.tsx): TH.card / TH.paper / TH.doc / TH.panel / TH.ui / TH.num / TH.ent.
import React from 'react';
import {Img} from 'remotion';
import {back, clamp, eio, eout, F, fmt, GText, img, lerp, prog, rnd} from './lib';
import {FlagSvg} from './els';
import {EN, TH, tx} from './theme';
import {deskShadow, iconFx, Pin, phosphorTs, Ruled, Tape, torn, tornPct} from './skins';
const CJK = (s: any) => /[\u3400-\u9fff\uff00-\uffef]/.test(String(s ?? ''));
const bgOf = (x: any) => (x == null ? {} : typeof x === 'string' ? {background: x} : x);
const mix = (a: number[], b: number[], l: number, al = 1) => `rgba(${lerp(a[0], b[0], l).toFixed(0)},${lerp(a[1], b[1], l).toFixed(0)},${lerp(a[2], b[2], l).toFixed(0)},${al})`;
const W900 = (f: string) => (f.includes("'PX'") || f.includes("'MSZ'") || f.includes("'YS'") || f.includes("'BB'") || f.includes("'DIN'") ? 400 : 900);

// focus timeline [[t, idx], ...] -> {cur, prev, p}
const focusAt = (fs: any[] | undefined, t: number) => {
  let cur = -2, prev = -2, t0 = -1e9;
  for (const [ft, idx] of fs ?? []) {if (t + 1e-6 >= ft) {prev = cur; cur = idx; t0 = ft;}}
  return {cur, prev, p: eout(prog(t, t0, 0.35))};
};
// lit amount of item i in [0,1]; -1 means "all lit"
const litOf = (fs: any[] | undefined, t: number, i: number) => {
  const {cur, prev, p} = focusAt(fs, t);
  const on = (k: number) => (k === -1 || k === -2 || k === i ? 1 : 0);
  return lerp(on(prev), on(cur), p);
};

// ---------------------------------------------------------------- wall: big concept cards, one lit
export const Wall: React.FC<any> = ({e, t}) => {
  const C = TH.card;
  const cw = e.cw ?? 760, ch = e.ch ?? 420, gap = e.gap ?? 56, cols = e.cols ?? 2;
  const cards = e.cards as any[], rows = Math.ceil(cards.length / cols);
  const W = cols * cw + (cols - 1) * gap, H = rows * ch + (rows - 1) * gap;
  return (
    <div style={{position: 'relative', width: W, height: H}}>
      {cards.map((c, i) => {
        const r = Math.floor(i / cols), k = i % cols;
        const [dx, dy] = c.pos ?? [k * (cw + gap), r * (ch + gap)];
        const p = prog(t, e.t + (c.dt ?? i * 0.09), 0.5), lit = litOf(e.focus, t, i);
        const w = c.w ?? cw, h = c.h ?? ch;
        const wordSize = c.size ?? h * 0.34;
        const rot = C.tilt ? (rnd(i * 13 + 5)() - 0.5) * 2 * C.tilt : 0;
        const blur = (1 - lit) * (e.dimBlur ?? 3.5);
        const shadow = C.flat ? `0 ${10 + 14 * lit}px ${30 + 30 * lit}px rgba(20,20,40,${(0.08 + 0.1 * lit).toFixed(2)})`
          : TH.name === 'desk' ? deskShadow(lit * 0.6)
          : C.glow ? `0 0 ${(50 * lit).toFixed(0)}px rgba(${C.glow},${(0.55 * lit).toFixed(2)})`
          : `0 ${18 + 12 * lit}px ${36 + 30 * lit}px rgba(0,0,0,${(0.5 + 0.1 * lit).toFixed(2)}), 0 2px 3px rgba(0,0,0,.4)`;
        const filt = [blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : '', C.torn ? `drop-shadow(0 ${(8 + 8 * lit).toFixed(0)}px ${(10 + 10 * lit).toFixed(0)}px rgba(0,0,0,${(0.32 + 0.12 * lit).toFixed(2)}))` : ''].filter(Boolean).join(' ');
        const word = c.w2 ?? c.word, ink = c.ink ?? mix(C.dim, C.on, lit), glowTs = C.glow && lit < 0.5 ? phosphorTs('51,255,136', wordSize / 120) : undefined;
        const fx = iconFx(C.icon, lit);
        return (
          <div key={i} style={{position: 'absolute', left: dx, top: dy, width: w, height: h, opacity: clamp(p * 2.5),
            transform: `translateY(${(1 - eout(p)) * 90}px) rotate(${rot.toFixed(2)}deg) scale(${((0.94 + 0.06 * eout(p)) * (1 + 0.035 * lit)).toFixed(4)})`, filter: filt || undefined}}>
            <div style={{position: 'absolute', inset: 0, borderRadius: C.r, overflow: 'hidden', clipPath: C.torn ? torn(i * 17 + 3, w, h, 7, 24) : undefined, boxShadow: C.torn ? undefined : shadow}}>
              <div style={{position: 'absolute', inset: 0, borderRadius: C.r, ...bgOf(C.base)}} />
              <div style={{position: 'absolute', inset: 0, borderRadius: C.r, opacity: lit, ...(c.bg ? {background: c.bg} : bgOf(C.lit))}} />
              {C.ruled && <div style={{position: 'absolute', inset: 0, opacity: 1 - lit}}><Ruled lh={Math.round(h * 0.15)} top={Math.round(h * 0.2)} /></div>}
              {C.litRing && <div style={{position: 'absolute', inset: 16, border: `5px solid ${C.litRing}`, opacity: lit}} />}
              {C.frame && <div style={{position: 'absolute', inset: 12, border: `1.5px solid ${lit > 0.5 ? 'rgba(18,58,107,.45)' : 'rgba(235,242,250,.35)'}`}} />}
              {TH.name === 'finance' && <div style={{position: 'absolute', inset: 0, borderRadius: C.r, boxShadow: `inset 0 2px 0 rgba(255,255,255,${(0.08 + 0.32 * lit).toFixed(2)}), inset 0 -3px 0 rgba(0,0,0,.22)`}} />}
              <div style={{position: 'absolute', left: w * 0.085, top: h * (c.ty ?? 0.2), fontFamily: TH.f.card, fontWeight: W900(TH.f.card), fontSize: wordSize, lineHeight: 1.05, whiteSpace: 'pre', color: ink, textShadow: glowTs}}>{word}</div>
              {EN && c.en && <div style={{position: 'absolute', left: w * 0.09, top: h * (c.ty ?? 0.2) + wordSize * 1.12 * (String(word).split('\n').length), fontFamily: F.en, fontWeight: 700, fontSize: c.es ?? Math.max(18, h * 0.065), letterSpacing: 2, whiteSpace: 'nowrap', color: mix(C.sdim, C.son, lit, 0.6)}}>{c.en}</div>}
              {c.sub && <div style={{position: 'absolute', left: w * 0.09, bottom: h * 0.12, fontFamily: TH.f.body, fontWeight: W900(TH.f.body) === 900 ? 700 : 400, fontSize: c.ss ?? h * 0.085, whiteSpace: 'nowrap', color: mix(C.sdim, C.son, lit, 0.92)}}>{c.sub}</div>}
              {c.icon && <Img src={img(c.icon)} style={{position: 'absolute', right: w * 0.06, bottom: h * (c.iy ?? 0.1), height: h * (c.ih ?? 0.62), objectFit: 'contain', transform: `rotate(${(c.irot ?? 6) * eout(p)}deg)`,
                ...(fx ?? {filter: `grayscale(${1 - lit}) brightness(${0.5 + 0.5 * lit}) drop-shadow(0 12px 18px rgba(0,0,0,${0.15 + 0.2 * lit}))`})}} />}
              {c.badge && <div style={{position: 'absolute', right: 26, top: 22, fontFamily: TH.f.num, fontSize: h * 0.14, color: mix(C.sdim, C.son, lit, 0.6)}}>{c.badge}</div>}
            </div>
            {C.tape && <Tape w={w * 0.3} h={44} rot={(rnd(i * 7 + 2)() - 0.5) * 10} style={{left: w * 0.35, top: -18}} />}
            {C.pin && <Pin style={{left: w / 2 - 20, top: -12}} />}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- paper: chart card (barh / col)
export const Paper: React.FC<any> = ({e, t}) => {
  const P = TH.paper, font = P.font ?? TH.f.body, fw = W900(font) === 900 ? 800 : 400;
  const w = e.w ?? 1500, h = e.h ?? 900, kind = e.kind ?? 'barh';
  const band = (e.hdr ?? 'dark') === 'dark' && P.hdr !== 'transparent', hh = band ? 170 : 150;
  const t0 = e.t + (e.bt ?? 0.35);
  const items = (e.rows ?? e.cols ?? []) as any[];
  const max = e.max ?? Math.max(...items.map((x) => x.v));
  const bodyTop = hh + 70, bodyH = h - bodyTop - 90;
  const hiAt = (i: number) => (e.hi ? litOf(e.hi, t, i) : 1);
  const tf = P.titleFont ?? TH.f.title, valIn = TH.name === 'terminal' ? '#140c00' : '#ffffff';
  const glowHi = P.phosphor ? '0 0 26px rgba(255,176,0,.6)' : P.flat ? 'none' : '0 6px 14px rgba(0,0,0,.18)';
  const titleEl = TH.name === 'finance' ? <GText txt={e.title} size={e.ts ?? 76} grad="gold" glow={false} ls={6} />
    : <span style={{fontFamily: tf, fontWeight: W900(tf), fontSize: e.ts ?? 76, letterSpacing: 4, color: P.hdrInk, textShadow: P.phosphor ? phosphorTs('255,176,0') : undefined}}>{e.title}</span>;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: P.r, ...bgOf(P.bg), border: P.border, boxShadow: P.flat ? '0 30px 80px rgba(20,20,40,.14)' : TH.name === 'desk' ? deskShadow(0.4) : '0 50px 110px rgba(0,0,0,.55)', overflow: 'hidden'}}>
      {P.frame && <div style={{position: 'absolute', inset: 18, border: `3px solid ${P.frame}`, boxShadow: `inset 0 0 0 6px ${TH.paper.bg?.backgroundColor ?? '#f4f5f2'}, inset 0 0 0 7.5px ${P.frame}`}} />}
      {band ? (
        <div style={{position: 'absolute', left: 30, right: 30, top: 30, height: hh, borderRadius: Math.max(0, P.r * 0.7), ...bgOf(P.hdr), textAlign: 'center'}}>
          {e.kicker && <div style={{marginTop: 18, fontFamily: TH.f.card, fontSize: 30, color: P.kick, letterSpacing: 6}}>{e.kicker}</div>}
          <div style={{marginTop: e.kicker ? 0 : 30}}>{titleEl}</div>
          {EN && e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 19, letterSpacing: 4, color: 'rgba(232,207,134,.45)', marginTop: 2}}>{e.en}</div>}
        </div>
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, top: 40, textAlign: 'center'}}>
          {e.kicker && <div style={{fontFamily: TH.f.body, fontWeight: fw, fontSize: 28, color: P.kick, letterSpacing: 6, marginBottom: 4}}>{e.kicker}</div>}
          {titleEl}
          <div style={{margin: '10px auto 0', width: 140, height: 6, background: P.kick, borderRadius: TH.name === 'desk' ? 3 : 0}} />
        </div>
      )}
      {kind === 'barh' && items.map((r, i) => {
        const n = items.length, rowH = Math.min(150, bodyH / n), bh = rowH * 0.56, y = bodyTop + i * rowH + (rowH - bh) / 2;
        const lw = e.lw ?? 230, bw = (w - lw - 140) * (r.v / max), p = eout(prog(t, t0 + (r.dt ?? i * 0.14), e.gd ?? 0.8)), hi = hiAt(i);
        return (
          <div key={i} style={{opacity: 0.3 + 0.7 * hi}}>
            <div style={{position: 'absolute', left: 60, width: lw - 40, top: y, height: bh, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontFamily: font, fontWeight: fw, fontSize: e.ls ?? 40, color: P.lab, whiteSpace: 'nowrap'}}>{r.l}</div>
            <div style={{position: 'absolute', left: lw + 40, top: y, height: bh, width: Math.max(4, bw * p), borderRadius: P.r > 3 ? '0 10px 10px 0' : 0, background: r.c ?? P.bar, backgroundBlendMode: P.blend, boxShadow: hi > 0.5 && e.hi ? glowHi : 'none'}} />
            <div style={{position: 'absolute', left: lw + 40 + (r.out ? bw * p + 24 : Math.max(0, bw * p / 2 - 200)), width: r.out ? 600 : 400, top: y, height: bh, display: 'flex', alignItems: 'center', justifyContent: r.out ? 'flex-start' : 'center',
              fontFamily: font, fontWeight: fw, fontSize: e.vs ?? 44, color: r.out ? P.val : valIn, opacity: clamp((p - 0.6) * 3), whiteSpace: 'nowrap'}}>{r.s ?? fmt(r.v)}</div>
          </div>
        );
      })}
      {kind === 'col' && (() => {
        const n = items.length, left = 110, right = 80, slot = (w - left - right) / n, bw = Math.min(e.bw ?? 160, slot * 0.62), base = h - (e.src ? 150 : 120), top = bodyTop + 50;
        return (
          <>
            {[0.25, 0.5, 0.75, 1].map((g, i) => <div key={i} style={{position: 'absolute', left, right, top: base - (base - top) * g, height: 1.5, background: P.grid}} />)}
            <div style={{position: 'absolute', left, right, top: base, height: 3, background: P.axis}} />
            {items.map((c, i) => {
              const p = eout(prog(t, t0 + (c.dt ?? i * (e.stag ?? 0.1)), e.gd ?? 0.7)), hi = hiAt(i), bh = (base - top) * (c.v / max) * p, cx = left + slot * (i + 0.5);
              return (
                <div key={i} style={{opacity: 0.3 + 0.7 * hi}}>
                  <div style={{position: 'absolute', left: cx - bw / 2, width: bw, top: base - bh, height: bh, borderRadius: P.r > 3 ? '10px 10px 0 0' : 0, background: c.c ?? P.bar, backgroundBlendMode: P.blend, boxShadow: hi > 0.5 && e.hi ? glowHi : 'none'}} />
                  <div style={{position: 'absolute', left: cx - 200, width: 400, top: base - bh - (e.vs ?? 40) * 1.45, textAlign: 'center', fontFamily: font, fontWeight: fw, fontSize: e.vs ?? 40, color: c.vc ?? P.val, opacity: clamp((p - 0.5) * 3), whiteSpace: 'nowrap', textShadow: P.phosphor ? phosphorTs('255,176,0', 0.6) : undefined}}>{c.s ?? fmt(c.v)}</div>
                  <div style={{position: 'absolute', left: cx - 200, width: 400, top: base + 16, textAlign: 'center', fontFamily: font, fontWeight: fw === 800 ? 600 : 400, fontSize: e.ls ?? 32, color: P.lab, whiteSpace: 'nowrap'}}>{c.l}</div>
                </div>
              );
            })}
          </>
        );
      })()}
      {e.unit && <div style={{position: 'absolute', left: 60, top: bodyTop - 26, fontFamily: font, fontWeight: 400, fontSize: 24, color: P.sub}}>{e.unit}</div>}
      {e.src && <div style={{position: 'absolute', left: 60, bottom: 30, fontFamily: font, fontWeight: 400, fontSize: 22, color: P.sub}}>{e.src}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- docpage: full-bleed document, line marks
// lines: [{cls:'title'|'meta'|'p'|'gap', segs:[{s, m?}]}], marks: [{t, d?, kind:'hl'|'box'|'under'}]; layout precomputed in Python
export const DocPage: React.FC<any> = ({e, t}) => {
  const Dc = TH.doc;
  const w = e.w ?? 2300, size = e.size ?? 60, lh = e.lh ?? 1.9, mx = e.mx ?? 150, H = e.h ?? 1600;
  const marks = (e.marks ?? []) as any[];
  let y = e.my ?? 120;
  const tw = W900(Dc.font) === 900 ? 800 : 400, pw = W900(Dc.font) === 900 ? 500 : 400, Lh = Math.round(size * lh);
  return (
    <div style={{position: 'relative', width: w, height: H, ...bgOf(Dc.bg), boxShadow: '0 40px 120px rgba(0,0,0,.35)', overflow: 'hidden'}}>
      {Dc.tractor && <>
        <div style={{position: 'absolute', inset: 0, background: `repeating-linear-gradient(180deg, rgba(150,205,165,.30) 0 ${Lh}px, rgba(0,0,0,0) ${Lh}px ${Lh * 2}px)`, backgroundPosition: `0 ${(e.my ?? 120) + size * 1.25 * 1.6}px`}} />
        {[0, w - 96].map((x, k) => <div key={k} style={{position: 'absolute', left: x, top: 0, bottom: 0, width: 96, background: '#f3f1e6', borderLeft: k ? '3px dashed rgba(0,0,0,.18)' : undefined, borderRight: k ? undefined : '3px dashed rgba(0,0,0,.18)',
          backgroundImage: 'radial-gradient(circle at 48px 36px, rgba(40,40,40,.85) 0 13px, rgba(0,0,0,0) 14px)', backgroundSize: '96px 72px'}} />)}
      </>}
      {Dc.frame && <div style={{position: 'absolute', inset: 50, border: `4px solid ${Dc.frame}`, boxShadow: `inset 0 0 0 8px rgba(0,0,0,0), inset 0 0 0 10px ${Dc.frame}`}} />}
      {e.logo && <div style={{position: 'absolute', right: mx, top: 70, fontFamily: TH.f.body, fontWeight: 500, fontSize: 26, color: Dc.meta, letterSpacing: 2}}>{e.logo}</div>}
      {(e.lines as any[]).map((ln, i) => {
        const cls = ln.cls ?? 'p';
        const fs = cls === 'title' ? size * 1.25 : cls === 'meta' ? size * 0.5 : size;
        const lineH = cls === 'gap' ? size * 0.6 : fs * (cls === 'title' ? 1.6 : cls === 'meta' ? 2.2 : lh);
        const top = y; y += lineH;
        if (cls === 'gap') return null;
        return (
          <div key={i} style={{position: 'absolute', left: mx, right: mx, top, height: lineH, display: 'flex', alignItems: 'center', justifyContent: cls === 'p' ? 'flex-start' : 'center', whiteSpace: 'pre',
            fontFamily: cls === 'meta' ? TH.f.body : Dc.font, fontWeight: cls === 'title' ? tw : cls === 'meta' ? 400 : pw, fontSize: fs, color: cls === 'meta' ? Dc.meta : Dc.ink, letterSpacing: cls === 'title' ? 4 : 0.5}}>
            {(ln.segs as any[]).map((sg, j) => {
              if (sg.m == null) return <span key={j}>{sg.s}</span>;
              const mk = marks[sg.m] || {}, mt = (mk.t ?? 0) + (sg.dt ?? 0), p = prog(t, mt, sg.d ?? mk.d ?? 0.45);
              const kind = mk.kind ?? 'hl', hc = mk.c ?? Dc.hl;
              if (kind === 'hl') return <span key={j} style={{background: `linear-gradient(${hc},${hc}) no-repeat`, backgroundSize: `${(eio(p) * 100).toFixed(1)}% ${Dc.hlInk ? '100%' : '78%'}`, backgroundPosition: '0 70%', padding: '0 2px', color: Dc.hlInk && p > 0.55 ? Dc.hlInk : undefined}}>{sg.s}</span>;
              if (kind === 'box') return <span key={j} style={{position: 'relative'}}><span style={{position: 'absolute', left: -8, right: -8, top: -6, bottom: -6, borderRadius: TH.name === 'finance' ? 4 : 0, border: `4px solid ${Dc.box}`, opacity: eout(p), transform: `scale(${lerp(1.08, 1, eout(p))})`}} /><span style={{position: 'relative'}}>{sg.s}</span></span>;
              return <span key={j} style={{position: 'relative'}}>{sg.s}<span style={{position: 'absolute', left: 0, bottom: -4, height: 7, width: `${eio(p) * 100}%`, background: mk.c ?? Dc.under, borderRadius: TH.name === 'desk' ? 4 : 0}} /></span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- ent6: tall entity card (country / institution)
export const Ent6: React.FC<any> = ({e, t}) => {
  const E = TH.ent;
  const w = e.w ?? 330, h = e.h ?? 470, fd = w * 0.36, sq = TH.name !== 'finance';
  return (
    <div style={{position: 'relative', width: w, height: h + fd / 2}}>
      <div style={{position: 'absolute', left: 0, top: fd / 2, width: w, height: h, borderRadius: sq ? 4 : 20, padding: 3, background: E.ring, boxShadow: TH.light ? '0 24px 50px rgba(0,0,0,.22)' : TH.name === 'desk' ? deskShadow(0.3) : '0 30px 60px rgba(0,0,0,.55)'}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: sq ? 2 : 17, overflow: 'hidden', ...(e.bg ? {background: e.bg} : bgOf(E.bg))}}>
          {EN && e.en && <div style={{position: 'absolute', left: 0, right: 0, top: fd * 0.62, textAlign: 'center', fontFamily: F.en, fontWeight: 700, fontSize: w * 0.06, letterSpacing: 2, color: E.nameInk ?? 'rgba(255,232,170,.75)', opacity: 0.7}}>{e.en}</div>}
          <div style={{position: 'absolute', left: 0, right: 0, top: fd * 0.62 + w * 0.09, textAlign: 'center'}}>
            {E.name ? <GText txt={e.name} size={e.ns ?? w * 0.24} grad={E.name} glow={false} ls={2} />
              : <span style={{fontFamily: TH.f.card, fontWeight: W900(TH.f.card), fontSize: e.ns ?? w * 0.24, color: E.nameInk, textShadow: TH.name === 'terminal' ? phosphorTs('255,176,0', 0.7) : undefined}}>{e.name}</span>}
          </div>
          {e.strip && <div style={{position: 'absolute', left: w * 0.09, right: w * 0.09, bottom: w * 0.09, height: h * 0.25, borderRadius: sq ? 0 : 10, ...bgOf(E.strip), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: e.sf === 'num' ? TH.f.num : TH.f.body, fontWeight: 900, fontSize: e.ss ?? h * 0.12, color: e.sc ?? E.stripInk, letterSpacing: 1, whiteSpace: 'nowrap'}}>{e.strip}</div>}
        </div>
      </div>
      <div style={{position: 'absolute', left: w / 2 - fd / 2, top: 0, width: fd, height: fd, borderRadius: '50%', overflow: 'hidden', border: `5px solid ${TH.pip?.ring ?? '#fbf3d6'}`, boxShadow: '0 10px 24px rgba(0,0,0,.35)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: 'scale(1.02)'}}><FlagSvg c={e.c} w={fd * 1.5} /></div>
      </div>
      {e.tag && <div style={{position: 'absolute', left: w / 2 - 70, width: 140, top: h + fd / 2 - 18, textAlign: 'center', fontFamily: F.en, fontWeight: 700, fontSize: 22, color: TH.accInk, background: TH.acc, borderRadius: sq ? 0 : 6, padding: '3px 0'}}>{e.tag}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- bignum: frame-filling number
const DimBar: React.FC<{p: number; c: string; y: number}> = ({p, c, y}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, height: 44, opacity: clamp(p * 4)}}>
    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: c}} />
    <div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: c}} />
    <div style={{position: 'absolute', left: `${((1 - p) * 50).toFixed(2)}%`, right: `${((1 - p) * 50).toFixed(2)}%`, top: 20, height: 3, background: c}} />
    <div style={{position: 'absolute', left: `${((1 - p) * 50).toFixed(2)}%`, top: 12, width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderRight: `18px solid ${c}`, transform: 'translateX(-2px)'}} />
    <div style={{position: 'absolute', right: `${((1 - p) * 50).toFixed(2)}%`, top: 12, width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: `18px solid ${c}`, transform: 'translateX(2px)'}} />
  </div>
);
export const BigNum: React.FC<any> = ({e, t}) => {
  const N = TH.num;
  let txt = e.v as string;
  if (e.count) {const [a, b, dec] = e.count; const p = eout(prog(t, e.ct ?? e.t, e.cd ?? 0.9)); txt = fmt(lerp(a, b, p), dec ?? 0, e.sep ?? false);}
  const size = (e.size ?? 520) * (N.scale ?? 1), card = N.card;
  const onCard = card === 'clip' || card === 'index';
  const kc = e.kc ?? N.kc ?? (onCard ? (card === 'index' ? '#e2543f' : '#c23a2d') : TH.ink2), cc = e.cc ?? N.cc ?? (onCard ? '#1b1a18' : TH.ink);
  const tsK = TH.name === 'terminal' ? phosphorTs('51,255,136', size / 300) : undefined, tsC = TH.name === 'terminal' ? phosphorTs('255,176,0', size / 400) : undefined;
  const numEl = e.grad || e.color ? <GText txt={txt} font={e.font ?? 'num'} size={size} grad={e.grad} color={e.color} ext={e.ext ?? true} glow={e.glow ?? false} ls={e.ls ?? 4} />
    : <GText txt={txt} font={N.font} size={size} grad={N.grad} color={N.color} blend={N.blend} ext={N.ext} extc={N.extc} glow={false} phosphor={N.phosphor} ls={N.ls ?? 4} weight={N.weight ?? W900(N.font)} flat={TH.light || onCard} />;
  const unitEl = e.unit && <span style={{marginLeft: size * 0.04, marginBottom: size * 0.12}}>
    <GText txt={e.unit} font={TH.f.card} size={size * (e.us ?? 0.3)} grad={N.grad} color={N.color} blend={N.blend} ext={false} glow={false} phosphor={N.phosphor} weight={W900(TH.f.card)} flat={TH.light || onCard} />
  </span>;
  const body = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: e.align ?? 'center'}}>
      {e.kicker && <div style={{fontFamily: TH.f.card, fontWeight: W900(TH.f.card), fontSize: size * 0.13, color: kc, letterSpacing: 6, marginBottom: -size * 0.04, opacity: eout(prog(t, e.t + 0.15, 0.4)), textShadow: tsK}}>{TH.name === 'terminal' ? '> ' : ''}{e.kicker}</div>}
      <div style={{position: 'relative', display: 'flex', alignItems: 'flex-end', lineHeight: 1}}>
        {N.dims && <DimBar p={eio(prog(t, e.t + 0.25, 0.6))} c={TH.ink} y={-size * 0.02} />}
        {numEl}{unitEl}
      </div>
      {e.cap && <div style={{fontFamily: TH.f.body, fontWeight: W900(TH.f.body) === 900 ? 800 : 400, fontSize: size * 0.11, color: cc, marginTop: size * 0.02, letterSpacing: 2, opacity: eout(prog(t, e.t + 0.3, 0.4)), whiteSpace: 'nowrap', textShadow: tsC}}>{e.cap}</div>}
      {EN && e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: Math.max(18, size * 0.04), color: TH.ink2, letterSpacing: 4, marginTop: 6, opacity: eout(prog(t, e.t + 0.4, 0.4))}}>{e.en}</div>}
    </div>
  );
  if (!onCard) return body;
  const pad = `${(size * 0.1).toFixed(0)}px ${(size * 0.2).toFixed(0)}px ${(size * 0.12).toFixed(0)}px`;
  if (card === 'clip') return (
    <div style={{position: 'relative', transform: 'rotate(-1.6deg)', filter: 'drop-shadow(0 14px 18px rgba(0,0,0,.35))'}}>
      <div style={{padding: pad, ...tx('#efe4cc', 'tex/newsprint.jpg'), clipPath: tornPct(41, 1.3, 40)}}>{body}</div>
      <Tape w={220} h={58} rot={-38} style={{left: -60, top: 6}} /><Tape w={220} h={58} rot={36} style={{right: -60, top: 10}} />
    </div>
  );
  return (
    <div style={{position: 'relative', transform: 'rotate(-2deg)', padding: pad, ...tx('#f6f1e6'), borderRadius: 4, boxShadow: deskShadow(0.3)}}>
      <Ruled lh={Math.round(size * 0.2)} top={Math.round(size * 0.18)} />
      <div style={{position: 'relative'}}>{body}</div>
      <Tape w={240} h={60} rot={-3} style={{left: '50%', top: -26, marginLeft: -120}} />
    </div>
  );
};

// ---------------------------------------------------------------- ui: app window (calculator). Modes: window / ledger / win95 / phone
const typed = (s: string, t: number, t0: number, cps = 9) => {const n = Math.floor(clamp((t - t0) * cps, 0, s.length)); return t < t0 ? '' : Array.from(s).slice(0, n).join('');};
const bevel = (inset = false, d = 3) => inset ? `inset ${d}px ${d}px 0 #808080, inset -${d}px -${d}px 0 #ffffff, inset ${d * 2}px ${d * 2}px 0 #404040, inset -${d * 2}px -${d * 2}px 0 #dfdfdf`
  : `inset -${d}px -${d}px 0 #404040, inset ${d}px ${d}px 0 #ffffff, inset -${d * 2}px -${d * 2}px 0 #808080, inset ${d * 2}px ${d * 2}px 0 #dfdfdf`;
const focusOf = (fields: any[], t: number) => fields.findIndex((f, i) => t >= f.t && (i === fields.length - 1 ? t < f.t + 1.2 : t < fields[i + 1].t));
const Win95: React.FC<any> = ({e, t}) => {
  const w = e.w ?? 1260, h = e.h ?? 860, fields = (e.fields ?? []) as any[], res = (e.res ?? []) as any[], focusF = focusOf(fields, t), PXF = TH.f.body;
  return (
    <div style={{position: 'relative', width: w, height: h, background: '#c0c0c0', boxShadow: `${bevel()}, 0 30px 60px rgba(0,0,0,.45)`, fontFamily: PXF}}>
      <div style={{position: 'absolute', left: 9, right: 9, top: 9, height: 66, background: 'linear-gradient(90deg,#000080,#1084d0)', display: 'flex', alignItems: 'center', paddingLeft: 20}}>
        <span style={{fontSize: 36, color: '#ffffff'}}>{e.title ?? '养老金测算'}</span>
        {e.sub && <span style={{marginLeft: 18, fontSize: 24, color: '#c8d4ff'}}>{e.sub}</span>}
        <div style={{marginLeft: 'auto', display: 'flex', gap: 6, marginRight: 10}}>
          {['_', '□', '×'].map((g, i) => <div key={i} style={{width: 46, height: 42, background: '#c0c0c0', boxShadow: bevel(false, 2), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#000', marginLeft: i === 2 ? 6 : 0}}>{g}</div>)}
        </div>
      </div>
      <div style={{position: 'absolute', left: 50, top: 120, width: e.lw ?? 560}}>
        {fields.map((f, i) => {
          const on = t >= f.t, foc = i === focusF;
          return (
            <div key={i} style={{marginBottom: 28, opacity: on ? 1 : 0.5}}>
              <div style={{fontSize: 30, color: '#000', marginBottom: 10}}>{f.l}</div>
              <div style={{height: 84, background: '#fff', boxShadow: bevel(true), display: 'flex', alignItems: 'center', paddingLeft: 24, paddingRight: 24, outline: foc ? '3px dotted #000080' : 'none', outlineOffset: 4}}>
                <span style={{fontSize: 48, color: '#000'}}>{typed(f.v, t, f.t + 0.15)}</span>
                {foc && Math.floor(t * 3) % 2 === 0 && <span style={{width: 4, height: 46, background: '#000', marginLeft: 4}} />}
                <span style={{marginLeft: 'auto', fontSize: 26, color: '#404040'}}>{f.u}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: (e.lw ?? 560) + 110, right: 44, top: 120, bottom: 44, background: '#fff', boxShadow: bevel(true), padding: '30px 40px'}}>
        <div style={{fontSize: 28, color: '#404040', letterSpacing: 3, marginBottom: 14}}>{e.rtitle ?? '测算结果'}</div>
        {res.map((r, i) => {
          const p = prog(t, r.t, 0.35), cp = eout(prog(t, r.t + 0.15, r.cd ?? 0.8)), lit = r.lit ? litOf(r.lit, t, 0) : 0;
          return (
            <div key={i} style={{opacity: eout(p), marginBottom: r.total ? 0 : 22, paddingTop: r.total ? 20 : 0, borderTop: r.total ? '3px dotted #808080' : 'none', position: 'relative'}}>
              {lit > 0 && <div style={{position: 'absolute', left: -16, right: -16, top: r.total ? 10 : -6, bottom: -6, background: '#000080', opacity: lit}} />}
              <div style={{position: 'relative', fontSize: 32, color: lit > 0.5 ? '#fff' : '#000'}}>{r.l}{r.f && <span style={{marginLeft: 16, fontSize: 28, color: lit > 0.5 ? '#c8d4ff' : '#606060'}}>{r.f}</span>}</div>
              <div style={{position: 'relative', fontSize: r.total ? 132 : 96, lineHeight: 1.1, whiteSpace: 'nowrap', color: lit > 0.5 ? '#ffffff' : '#000080'}}>
                {r.pre ?? ''}{fmt(lerp(r.from ?? 0, r.v, cp), r.dec ?? 0, true)}<span style={{fontSize: 30, color: lit > 0.5 ? '#c8d4ff' : '#404040', marginLeft: 12}}>{r.u ?? '元/月'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const PhoneCalc: React.FC<any> = ({e, t}) => {
  const w = e.w ?? 1260, h = e.h ?? 860, fields = (e.fields ?? []) as any[], res = (e.res ?? []) as any[], focusF = focusOf(fields, t);
  const PW = 500, PH = 1000;
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', left: 10, top: h / 2 - PH / 2, width: PW, height: PH, borderRadius: 78, background: 'linear-gradient(135deg,#3a3a3e,#151517 60%,#2a2a2d)', transform: 'rotate(-5deg)', boxShadow: `${deskShadow(0.2)}, inset 0 0 0 3px rgba(255,255,255,.12)`}}>
        <div style={{position: 'absolute', inset: 16, borderRadius: 64, background: '#fbfbfd', overflow: 'hidden', fontFamily: TH.f.body}}>
          <div style={{position: 'absolute', left: PW / 2 - 16 - 70, top: 20, width: 140, height: 40, borderRadius: 20, background: '#111'}} />
          <div style={{position: 'absolute', left: 40, top: 96, fontWeight: 900, fontSize: 42, color: '#1f1f22'}}>{e.title ?? '养老金测算'}</div>
          {e.sub && <div style={{position: 'absolute', left: 40, top: 150, fontWeight: 500, fontSize: 22, color: '#8a8a90'}}>{e.sub}</div>}
          <div style={{position: 'absolute', left: 36, right: 36, top: 200}}>
            {fields.map((f, i) => {
              const on = t >= f.t, foc = i === focusF;
              return (
                <div key={i} style={{marginBottom: 22, opacity: on ? 1 : 0.45}}>
                  <div style={{fontWeight: 600, fontSize: 24, color: '#6b6b74', marginBottom: 8}}>{f.l}</div>
                  <div style={{height: 78, borderRadius: 18, background: '#f1f1f5', border: `3px solid ${foc ? '#e2543f' : 'transparent'}`, display: 'flex', alignItems: 'center', padding: '0 22px'}}>
                    <span style={{fontWeight: 700, fontSize: 42, color: '#1f1f22'}}>{typed(f.v, t, f.t + 0.15)}</span>
                    {foc && Math.floor(t * 3) % 2 === 0 && <span style={{width: 3, height: 40, background: '#e2543f', marginLeft: 4}} />}
                    <span style={{marginLeft: 'auto', fontSize: 22, color: '#a5a5ad'}}>{f.u}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: PW + 70, right: 0, top: 40, bottom: 20, ...tx('#fbfaf6'), transform: 'rotate(2.2deg)', boxShadow: deskShadow(0.3), clipPath: undefined, padding: '46px 48px', fontFamily: TH.f.body}}>
        <Tape w={200} h={54} rot={-6} style={{left: '40%', top: -24}} />
        <div style={{fontFamily: TH.f.title, fontSize: 44, color: '#1f1f22', marginBottom: 18}}>{e.rtitle ?? '测算结果'}</div>
        {res.map((r, i) => {
          const p = prog(t, r.t, 0.35), cp = eout(prog(t, r.t + 0.15, r.cd ?? 0.8)), lit = r.lit ? litOf(r.lit, t, 0) : 0;
          return (
            <div key={i} style={{opacity: eout(p), transform: `translateY(${(1 - eout(p)) * 24}px)`, marginBottom: r.total ? 0 : 20, paddingTop: r.total ? 18 : 0, borderTop: r.total ? '3px dashed rgba(0,0,0,.25)' : 'none', position: 'relative'}}>
              <div style={{position: 'relative', fontWeight: 800, fontSize: 30, color: '#3a3a40'}}>{r.l}{r.f && <span style={{marginLeft: 14, fontWeight: 500, fontSize: 26, color: '#8a8a90'}}>{r.f}</span>}</div>
              <div style={{position: 'relative', display: 'inline-block', fontWeight: 900, fontSize: r.total ? 128 : 92, lineHeight: 1.08, whiteSpace: 'nowrap', color: r.total ? '#e2543f' : '#1f1f22'}}>
                {lit > 0 && <span style={{position: 'absolute', left: -10, right: -10, top: '42%', bottom: '4%', background: 'rgba(255,225,77,.9)', mixBlendMode: 'multiply', transform: `scaleX(${eio(lit)})`, transformOrigin: '0 50%', borderRadius: 6}} />}
                <span style={{position: 'relative'}}>{r.pre ?? ''}{fmt(lerp(r.from ?? 0, r.v, cp), r.dec ?? 0, true)}</span>
                <span style={{position: 'relative', fontWeight: 700, fontSize: 30, color: '#8a8a90', marginLeft: 12}}>{r.u ?? '元/月'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const UICalc: React.FC<any> = ({e, t}) => {
  const U = TH.ui;
  if (U.mode === 'win95') return <Win95 e={e} t={t} />;
  if (U.mode === 'phone') return <PhoneCalc e={e} t={t} />;
  const w = e.w ?? 1260, h = e.h ?? 860, ledger = U.mode === 'ledger';
  const fields = (e.fields ?? []) as any[], res = (e.res ?? []) as any[], focusF = focusOf(fields, t);
  const fw = W900(U.font) === 900, B = ledger ? 2 : 3;
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: U.r, ...bgOf(U.win), boxShadow: U.shadow ?? '0 50px 120px rgba(0,0,0,.55)', overflow: 'hidden', fontFamily: U.font, border: ledger ? '3px solid #1b1a18' : undefined}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 96, ...bgOf(U.bar), borderBottom: TH.name === 'editorial' ? '3px solid #111114' : '2px solid rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', paddingLeft: 36}}>
        {U.dots && ['#ff5f57', '#febc2e', '#28c840'].map((c, i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: c, marginRight: 12}} />)}
        {!U.dots && <div style={{width: 22, height: 22, background: U.focus, marginRight: 20, borderRadius: TH.name === 'finance' ? 11 : 0}} />}
        <div style={{fontWeight: fw ? 900 : 400, fontSize: 38, color: U.barInk}}>{e.title ?? '养老金测算'}</div>
        {e.sub && <div style={{marginLeft: 18, fontWeight: 500, fontSize: 24, color: U.barInk, opacity: 0.6}}>{e.sub}</div>}
      </div>
      <div style={{position: 'absolute', left: 50, top: 130, width: e.lw ?? 560}}>
        {fields.map((f, i) => {
          const on = t >= f.t, foc = i === focusF;
          return (
            <div key={i} style={{marginBottom: 30, opacity: on ? 1 : 0.45}}>
              <div style={{fontSize: 28, fontWeight: fw ? 600 : 400, color: U.lab, marginBottom: 10}}>{f.l}</div>
              <div style={{height: 86, borderRadius: U.r > 4 ? 14 : 0, background: U.field, border: `${B}px solid ${foc ? U.focus : U.fBorder}`, boxShadow: foc ? `0 0 0 6px ${U.lit}` : 'none', display: 'flex', alignItems: 'center', paddingLeft: 26, paddingRight: 26}}>
                <span style={{fontFamily: U.numFont, fontWeight: W900(U.numFont) === 900 ? 700 : 400, fontSize: 54, color: U.val, letterSpacing: 1}}>{typed(f.v, t, f.t + 0.15)}</span>
                {foc && Math.floor(t * 3) % 2 === 0 && <span style={{width: 3, height: 48, background: U.focus, marginLeft: 4}} />}
                <span style={{marginLeft: 'auto', fontSize: 26, color: U.lab}}>{f.u}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: (e.lw ?? 560) + 110, right: 50, top: 130, bottom: 50, borderRadius: U.r > 4 ? 22 : 0, background: U.res, border: `2px solid ${U.resBorder}`, padding: '30px 40px'}}>
        <div style={{fontSize: 26, fontWeight: fw ? 700 : 400, color: U.rt, letterSpacing: 3, marginBottom: 14}}>{e.rtitle ?? '测算结果'}</div>
        {res.map((r, i) => {
          const p = prog(t, r.t, 0.35), cp = eout(prog(t, r.t + 0.15, r.cd ?? 0.8));
          const lit = r.lit ? litOf(r.lit, t, 0) : 0;
          return (
            <div key={i} style={{opacity: eout(p), transform: `translateY(${(1 - eout(p)) * 30}px)`, marginBottom: r.total ? 0 : 22, paddingTop: r.total ? 20 : 0, borderTop: r.total ? `2px ${ledger ? 'solid' : 'dashed'} ${U.resBorder}` : 'none', position: 'relative'}}>
              {lit > 0 && <div style={{position: 'absolute', left: -18, right: -18, top: r.total ? 10 : -8, bottom: -8, borderRadius: U.r > 4 ? 14 : 0, background: U.lit, opacity: lit}} />}
              <div style={{position: 'relative', display: 'flex', alignItems: 'baseline'}}>
                <span style={{fontSize: 32, fontWeight: fw ? 800 : 400, color: U.val}}>{r.l}</span>
                {r.f && <span style={{marginLeft: 16, fontFamily: U.numFont, fontSize: 32, color: U.rt}}>{r.f}</span>}
              </div>
              <div style={{position: 'relative', fontFamily: U.numFont, fontWeight: W900(U.numFont) === 900 ? 900 : 400, fontSize: r.total ? 150 : 104, lineHeight: 1.05, whiteSpace: 'nowrap', color: r.total ? U.total : U.num, letterSpacing: W900(U.numFont) === 900 ? -2 : 2}}>
                {r.pre ?? ''}{fmt(lerp(r.from ?? 0, r.v, cp), r.dec ?? 0, true)}<span style={{fontFamily: U.font, fontWeight: fw ? 700 : 400, fontSize: 32, color: U.rt, marginLeft: 12}}>{r.u ?? '元/月'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- formula6: big formula strip on a panel
// toks: [{s, t, op?, icon?, l?, en?}], hl: [[t, idx]], strike: [[t, idx]]
export const Formula6: React.FC<any> = ({e, t}) => {
  const Pn = TH.panel;
  const toks = e.toks as any[], fs0 = e.fs ?? 128, pw = e.pw ?? 1300, ph = e.ph ?? 820;
  // shrink the strip when the tokens would overflow the panel (serif / pixel faces run wider than YS)
  const tokW = (k: any) => k.op ? fs0 * 0.42 : Math.max(Array.from(String(k.s)).reduce((a, c) => a + (CJK(c) ? 1 : 0.6), 0) * fs0 * (k.fs ?? 1) + fs0 * 0.3, k.icon ? (e.iw ?? 230) : 0);
  const need = toks.reduce((a, k) => a + tokW(k), 0) + (e.gap ?? 18) * (toks.length - 1);
  const fs = fs0 * Math.min(1, (pw - 130) / need);
  const {cur, prev, p: hp} = focusAt(e.hl, t);
  const hlv = (i: number) => lerp(prev === i ? 1 : 0, cur === i ? 1 : 0, hp);
  const anyHl = (e.hl ?? []).length > 0 && cur >= 0;
  const tf = TH.f.tok, tw = W900(tf), fin = TH.name === 'finance';
  const shadow = Pn.shadow ?? (TH.name === 'desk' ? deskShadow(0.3) : TH.light ? '0 30px 70px rgba(0,0,0,.25)' : '0 40px 100px rgba(0,0,0,.55)');
  const sy = e.sy ?? 200;
  const panel = (
    <div style={{position: 'relative', width: pw, height: ph, borderRadius: Pn.r, ...(e.pbg ? {background: e.pbg} : bgOf(Pn.bg)), boxShadow: Pn.torn ? undefined : shadow, border: Pn.border, clipPath: Pn.torn ? torn(77, pw, ph, 9, 26) : undefined}}>
      {Pn.ticks && [[-2, -2, '0 0'], [pw - 44, -2, '90'], [pw - 44, ph - 44, '180'], [-2, ph - 44, '270']].map(([x, y, r], i) => (
        <svg key={i} width="46" height="46" style={{position: 'absolute', left: x as number, top: y as number, transform: `rotate(${r === '0 0' ? 0 : r}deg)`}}><path d="M2 40 V2 H40" stroke="#ff7a1a" strokeWidth="5" fill="none" /></svg>))}
      {e.title && <div style={{position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center'}}>
        <span style={{fontFamily: TH.f.title, fontWeight: W900(TH.f.title), fontSize: e.ts ?? 64, letterSpacing: 6, color: Pn.title, textShadow: Pn.phosphor ? phosphorTs('51,255,136', 0.8) : undefined}}>{e.title}</span>
        {EN && e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: Pn.op, marginTop: 4}}>{e.en}</div>}
      </div>}
      {Pn.strip !== 'transparent' && <div style={{position: 'absolute', left: 50, right: 50, top: sy, height: fs * 1.55, borderRadius: Math.min(22, Pn.r * 2), background: Pn.strip, boxShadow: 'inset 0 4px 16px rgba(0,0,0,.4)'}} />}
      {Pn.rules && [sy - 8, sy + fs * 1.55 + 8].map((y, i) => <div key={i} style={{position: 'absolute', left: 50, right: 50, top: y, height: i ? 3 : 6, background: Pn.rules}} />)}
      <div style={{position: 'absolute', left: 50, right: 50, top: sy, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: e.gap ?? 18}}>
        {toks.map((k, i) => {
          const p = prog(t, k.t, 0.4), h = hlv(i), dim = anyHl && !k.op ? 1 - h : 0;
          const st = (e.strike ?? []).find((x: any) => x[1] === i), sp = st ? eout(prog(t, st[0], 0.3)) : 0;
          const kf = k.font === 'ys' ? TH.f.card : k.font === 'din' ? (fin ? F.din : tf) : CJK(k.s) ? (fin ? F.ys : tf) : fin ? F.din : TH.f.num === TH.f.title ? tf : TH.f.num;
          const kw = W900(kf), rot = Pn.sticky ? (rnd(i * 11 + 4)() - 0.5) * 6 : 0;
          const hiRing = Pn.hiRing && h > 0;
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp(p * 2.5) * (1 - 0.45 * dim * (e.dimOthers === false ? 0 : 1)), transform: `translateY(${(1 - back(p)) * -40}px) rotate(${rot.toFixed(2)}deg)`}}>
              <div style={{position: 'relative', height: fs * 1.55, display: 'flex', alignItems: 'center', padding: k.op ? '0 2px' : `0 ${fs * 0.14}px`, border: !k.op && Pn.cell ? Pn.cell : undefined,
                ...(Pn.sticky && !k.op ? {...Pn.sticky, boxShadow: deskShadow(0.1)} : {})}}>
                {h > 0 && !hiRing && <div style={{position: 'absolute', left: 0, right: 0, top: Pn.sticky || Pn.cell ? 0 : fs * 0.14, bottom: Pn.sticky || Pn.cell ? 0 : fs * 0.14, borderRadius: fin ? 14 : 0, ...bgOf(Pn.hiBg), opacity: h, transform: `scale(${lerp(0.85, 1, eout(h))})`, boxShadow: Pn.phosphor ? '0 0 34px rgba(255,176,0,.55)' : fin ? '0 0 30px rgba(230,240,150,.45)' : undefined}} />}
                {hiRing && <div style={{position: 'absolute', left: -6, right: -6, top: fs * 0.08, bottom: fs * 0.08, border: `7px solid ${Pn.hiRing}`, borderRadius: 6, opacity: h, transform: `rotate(-3deg) scale(${lerp(1.3, 1, eout(h))})`, mixBlendMode: 'multiply'}} />}
                <span style={{position: 'relative'}}>
                  {k.op ? <span style={{fontFamily: fin ? F.din : tf, fontWeight: W900(fin ? F.din : tf), fontSize: fs * 0.62, color: Pn.op}}>{k.s}</span>
                    : fin && h <= 0.5 ? <GText txt={k.s} font={k.font ?? (CJK(k.s) ? 'ys' : 'din')} size={fs * (k.fs ?? 1)} grad="lav" glow={false} ls={1} />
                    : <span style={{fontFamily: kf, fontWeight: kw, fontSize: fs * (k.fs ?? 1), letterSpacing: 1, color: h > 0.5 ? Pn.hiInk : Pn.tok, textShadow: Pn.phosphor && h <= 0.5 ? phosphorTs('255,176,0', fs / 140) : undefined}}>{k.s}</span>}
                </span>
                {sp > 0 && <div style={{position: 'absolute', left: '-6%', right: '-6%', top: '50%', height: 10, borderRadius: 5, background: '#e2453a', transform: `rotate(-14deg) scaleX(${sp})`, transformOrigin: '0 50%'}} />}
              </div>
              {k.icon && (() => {const q = prog(t, k.it ?? k.t + 0.25, 0.4), fx = iconFx(Pn.icon, h); return (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: eout(q), transform: `translateY(${(1 - eout(q)) * 30}px)`, marginTop: 14, width: e.iw ?? 230, borderRadius: fin ? 16 : 0, padding: '10px 0 14px', background: fin && h > 0 ? `rgba(238,245,176,${0.92 * h})` : 'transparent'}}>
                  <svg width="30" height="52" viewBox="0 0 30 52"><path d="M15 50 C 6 36, 24 20, 15 4" fill="none" stroke={fin && h > 0.5 ? '#5b6320' : Pn.arrow} strokeWidth="2.6" strokeLinecap="round" /><path d="M8 11 L15 3 L22 11" fill="none" stroke={fin && h > 0.5 ? '#5b6320' : Pn.arrow} strokeWidth="2.6" strokeLinecap="round" /></svg>
                  <Img src={img(k.icon)} style={{height: e.ih ?? 130, objectFit: 'contain', marginTop: 4, ...(fx ?? {filter: 'drop-shadow(0 10px 14px rgba(0,0,0,.35))'})}} />
                  {k.l && <div style={{fontFamily: TH.f.body, fontWeight: W900(TH.f.body) === 900 ? 700 : 400, fontSize: e.lfs ?? 32, color: fin && h > 0.5 ? '#3a4214' : Pn.lab, marginTop: 6, whiteSpace: 'nowrap'}}>{k.l}</div>}
                  {EN && k.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 15, letterSpacing: 1.5, color: Pn.op, whiteSpace: 'nowrap'}}>{k.en}</div>}
                </div>
              );})()}
            </div>
          );
        })}
      </div>
      {e.foot && <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: TH.f.body, fontWeight: W900(TH.f.body) === 900 ? 700 : 400, fontSize: e.ffs ?? 30, color: Pn.foot, opacity: eout(prog(t, e.ft ?? e.t, 0.4))}}>{e.foot}</div>}
    </div>
  );
  return Pn.torn ? <div style={{filter: 'drop-shadow(0 22px 26px rgba(0,0,0,.35))'}}>{panel}</div> : panel;
};

export const ELS6: any = {wall: Wall, paper: Paper, docpage: DocPage, ent6: Ent6, bignum: BigNum, ui: UICalc, formula6: Formula6};
