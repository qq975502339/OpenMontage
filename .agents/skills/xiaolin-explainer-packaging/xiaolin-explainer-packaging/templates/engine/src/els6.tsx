// v6 layout components. Each one encodes a recurring 小Lin说 explainer layout, sized to fill the frame.
// Rules (see PLAN_v6.md): hero >= 60% of frame width, cropped by frame edges, one lit item, white paper alternates with dark.
import React from 'react';
import {Img} from 'remotion';
import {back, clamp, eio, eout, F, fmt, GText, img, lerp, prog} from './lib';
import {FlagSvg} from './els';

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
        return (
          <div key={i} style={{position: 'absolute', left: dx, top: dy, width: w, height: h, borderRadius: 28, overflow: 'hidden',
            opacity: clamp(p * 2.5), transform: `translateY(${(1 - eout(p)) * 90}px) scale(${(0.94 + 0.06 * eout(p)) * (1 + 0.035 * lit)})`,
            filter: `blur(${((1 - lit) * (e.dimBlur ?? 3.5)).toFixed(2)}px)`, boxShadow: `0 ${30 + 10 * lit}px ${60 + 20 * lit}px rgba(0,0,0,${0.45 + 0.1 * lit})`}}>
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#3b3a41 0%,#2b2a30 100%)'}} />
            <div style={{position: 'absolute', inset: 0, opacity: lit, background: c.bg ?? 'linear-gradient(135deg,#f4f8cc 0%,#e2ea9c 52%,#c9d474 100%)'}} />
            <div style={{position: 'absolute', inset: 0, borderRadius: 28, boxShadow: `inset 0 2px 0 rgba(255,255,255,${0.15 + 0.45 * lit})`}} />
            <div style={{position: 'absolute', left: w * 0.085, top: h * (c.ty ?? 0.2), fontFamily: F.ys, fontSize: wordSize, lineHeight: 1.05, whiteSpace: 'pre',
              color: `rgb(${lerp(112, 60, lit)},${lerp(110, 68, lit)},${lerp(118, 24, lit)})`}}>{c.w2 ?? c.word}</div>
            {c.en && <div style={{position: 'absolute', left: w * 0.09, top: h * (c.ty ?? 0.2) + wordSize * 1.12 * ((c.w2 ?? c.word).split('\n').length), fontFamily: F.en, fontWeight: 700, fontSize: c.es ?? Math.max(18, h * 0.065), letterSpacing: 2, whiteSpace: 'nowrap',
              color: `rgba(${lerp(140, 70, lit)},${lerp(138, 80, lit)},${lerp(146, 30, lit)},${0.55 + 0.1 * lit})`}}>{c.en}</div>}
            {c.sub && <div style={{position: 'absolute', left: w * 0.09, bottom: h * 0.12, fontFamily: F.heavy, fontWeight: 700, fontSize: c.ss ?? h * 0.085, whiteSpace: 'nowrap', color: `rgba(${lerp(150, 70, lit)},${lerp(148, 80, lit)},${lerp(156, 30, lit)},.9)`}}>{c.sub}</div>}
            {c.icon && <Img src={img(c.icon)} style={{position: 'absolute', right: w * 0.06, bottom: h * (c.iy ?? 0.1), height: h * (c.ih ?? 0.62), objectFit: 'contain',
              filter: `grayscale(${1 - lit}) brightness(${0.5 + 0.5 * lit}) drop-shadow(0 12px 18px rgba(0,0,0,${0.15 + 0.2 * lit}))`, transform: `rotate(${(c.irot ?? 6) * eout(p)}deg)`}} />}
            {c.badge && <div style={{position: 'absolute', right: 26, top: 22, fontFamily: F.num, fontSize: h * 0.14, color: `rgba(${lerp(130, 70, lit)},${lerp(128, 80, lit)},${lerp(136, 30, lit)},.6)`}}>{c.badge}</div>}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- paper: white chart card (barh / col)
export const Paper: React.FC<any> = ({e, t}) => {
  const w = e.w ?? 1500, h = e.h ?? 900, kind = e.kind ?? 'barh';
  const hdr = e.hdr ?? 'dark', hh = hdr === 'dark' ? 170 : 130;
  const t0 = e.t + (e.bt ?? 0.35);
  const items = (e.rows ?? e.cols ?? []) as any[];
  const max = e.max ?? Math.max(...items.map((x) => x.v));
  const bodyTop = hh + 70, bodyH = h - bodyTop - 90;
  const hiAt = (i: number) => (e.hi ? litOf(e.hi, t, i) : 1);
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: 22, background: 'linear-gradient(180deg,#ffffff 0%,#f6f6f4 100%)', boxShadow: '0 50px 110px rgba(0,0,0,.55)', overflow: 'hidden'}}>
      {hdr === 'dark' ? (
        <div style={{position: 'absolute', left: 30, right: 30, top: 30, height: hh, borderRadius: 16, background: 'linear-gradient(180deg,#373540 0%,#24232b 100%)', textAlign: 'center'}}>
          {e.kicker && <div style={{marginTop: 18, fontFamily: F.ys, fontSize: 30, color: '#e8cf86', letterSpacing: 6}}>{e.kicker}</div>}
          <div style={{marginTop: e.kicker ? 0 : 30}}><GText txt={e.title} size={e.ts ?? 76} grad="gold" glow={false} ls={6} /></div>
          {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 19, letterSpacing: 4, color: 'rgba(232,207,134,.45)', marginTop: 2}}>{e.en}</div>}
        </div>
      ) : (
        <div style={{position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center'}}>
          <div style={{fontFamily: F.din, fontSize: e.ts ?? 70, color: '#3a3a40', letterSpacing: 3}}>{e.title}</div>
          {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 19, letterSpacing: 3, color: '#a2a2a8', marginTop: 4}}>{e.en}</div>}
        </div>
      )}
      {kind === 'barh' && items.map((r, i) => {
        const n = items.length, rowH = Math.min(150, bodyH / n), bh = rowH * 0.56, y = bodyTop + i * rowH + (rowH - bh) / 2;
        const lw = e.lw ?? 230, bw = (w - lw - 140) * (r.v / max), p = eout(prog(t, t0 + (r.dt ?? i * 0.14), e.gd ?? 0.8)), hi = hiAt(i);
        return (
          <div key={i} style={{opacity: 0.3 + 0.7 * hi}}>
            <div style={{position: 'absolute', left: 60, width: lw - 40, top: y, height: bh, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontFamily: F.heavy, fontWeight: 700, fontSize: e.ls ?? 40, color: '#2f2f35', whiteSpace: 'nowrap'}}>{r.l}</div>
            <div style={{position: 'absolute', left: lw + 40, top: y, height: bh, width: Math.max(4, bw * p), borderRadius: '0 10px 10px 0', background: r.c ?? 'linear-gradient(90deg,#4fc3ee 0%,#3d84e2 55%,#4150d8 100%)', boxShadow: hi > 0.5 && e.hi ? '0 0 30px rgba(70,120,240,.55)' : '0 6px 14px rgba(40,70,160,.22)'}} />
            <div style={{position: 'absolute', left: lw + 40 + (r.out ? bw * p + 24 : Math.max(0, bw * p / 2 - 200)), width: r.out ? 600 : 400, top: y, height: bh, display: 'flex', alignItems: 'center', justifyContent: r.out ? 'flex-start' : 'center',
              fontFamily: F.heavy, fontWeight: 800, fontSize: e.vs ?? 44, color: r.out ? '#2f2f35' : '#ffffff', opacity: clamp((p - 0.6) * 3), whiteSpace: 'nowrap', textShadow: r.out ? 'none' : '0 2px 6px rgba(0,0,0,.25)'}}>{r.s ?? fmt(r.v)}</div>
          </div>
        );
      })}
      {kind === 'col' && (() => {
        const n = items.length, left = 110, right = 80, slot = (w - left - right) / n, bw = Math.min(e.bw ?? 160, slot * 0.62), base = h - (e.src ? 150 : 120), top = bodyTop + 50;
        return (
          <>
            {[0.25, 0.5, 0.75, 1].map((g, i) => <div key={i} style={{position: 'absolute', left, right, top: base - (base - top) * g, height: 1.5, background: '#e9e9ec'}} />)}
            <div style={{position: 'absolute', left, right, top: base, height: 3, background: '#cfcfd6'}} />
            {items.map((c, i) => {
              const p = eout(prog(t, t0 + (c.dt ?? i * (e.stag ?? 0.1)), e.gd ?? 0.7)), hi = hiAt(i), bh = (base - top) * (c.v / max) * p, cx = left + slot * (i + 0.5);
              return (
                <div key={i} style={{opacity: 0.3 + 0.7 * hi}}>
                  <div style={{position: 'absolute', left: cx - bw / 2, width: bw, top: base - bh, height: bh, borderRadius: '10px 10px 0 0', background: c.c ?? 'linear-gradient(180deg,#a77dff 0%,#6c41e2 55%,#4a26b2 100%)', boxShadow: '0 8px 20px rgba(80,40,180,.25)'}} />
                  <div style={{position: 'absolute', left: cx - 200, width: 400, top: base - bh - (e.vs ?? 40) * 1.45, textAlign: 'center', fontFamily: F.heavy, fontWeight: 800, fontSize: e.vs ?? 40, color: c.vc ?? '#35304a', opacity: clamp((p - 0.5) * 3), whiteSpace: 'nowrap'}}>{c.s ?? fmt(c.v)}</div>
                  <div style={{position: 'absolute', left: cx - 200, width: 400, top: base + 16, textAlign: 'center', fontFamily: F.heavy, fontWeight: 600, fontSize: e.ls ?? 32, color: '#55555c', whiteSpace: 'nowrap'}}>{c.l}</div>
                </div>
              );
            })}
          </>
        );
      })()}
      {e.unit && <div style={{position: 'absolute', left: 60, top: bodyTop - 26, fontFamily: F.heavy, fontWeight: 500, fontSize: 24, color: '#9a9aa2'}}>{e.unit}</div>}
      {e.src && <div style={{position: 'absolute', left: 60, bottom: 30, fontFamily: F.heavy, fontWeight: 400, fontSize: 22, color: '#a7a7ad'}}>{e.src}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- docpage: full-bleed white document, serif, line marks
// lines: [{cls:'title'|'meta'|'p'|'gap', segs:[{s, m?}]}], marks: [{t, d?, kind:'hl'|'box'|'under'}]; layout precomputed in Python
export const DocPage: React.FC<any> = ({e, t}) => {
  const w = e.w ?? 2300, size = e.size ?? 60, lh = e.lh ?? 1.9, mx = e.mx ?? 150;
  const marks = (e.marks ?? []) as any[];
  let y = e.my ?? 120;
  return (
    <div style={{position: 'relative', width: w, height: e.h ?? 1600, background: '#fdfdfb', boxShadow: '0 40px 120px rgba(0,0,0,.35)'}}>
      {e.logo && <div style={{position: 'absolute', right: mx, top: 70, fontFamily: F.heavy, fontWeight: 500, fontSize: 26, color: '#b9b9be', letterSpacing: 2}}>{e.logo}</div>}
      {(e.lines as any[]).map((ln, i) => {
        const cls = ln.cls ?? 'p';
        const fs = cls === 'title' ? size * 1.25 : cls === 'meta' ? size * 0.5 : size;
        const lineH = cls === 'gap' ? size * 0.6 : fs * (cls === 'title' ? 1.6 : cls === 'meta' ? 2.2 : lh);
        const top = y; y += lineH;
        if (cls === 'gap') return null;
        return (
          <div key={i} style={{position: 'absolute', left: mx, right: mx, top, height: lineH, display: 'flex', alignItems: 'center', justifyContent: cls === 'p' ? 'flex-start' : 'center', whiteSpace: 'pre',
            fontFamily: cls === 'meta' ? F.heavy : F.serifsc, fontWeight: cls === 'title' ? 800 : cls === 'meta' ? 400 : 500, fontSize: fs, color: cls === 'meta' ? '#8d8d93' : '#1e1e22', letterSpacing: cls === 'title' ? 4 : 0.5}}>
            {(ln.segs as any[]).map((sg, j) => {
              if (sg.m == null) return <span key={j}>{sg.s}</span>;
              const mk = marks[sg.m] || {}, mt = (mk.t ?? 0) + (sg.dt ?? 0), p = prog(t, mt, sg.d ?? mk.d ?? 0.45);
              const kind = mk.kind ?? 'hl';
              if (kind === 'hl') return <span key={j} style={{background: `linear-gradient(${mk.c ?? '#fff06a'},${mk.c ?? '#fff06a'}) no-repeat`, backgroundSize: `${(eio(p) * 100).toFixed(1)}% 78%`, backgroundPosition: '0 70%', padding: '0 2px'}}>{sg.s}</span>;
              if (kind === 'box') return <span key={j} style={{position: 'relative'}}><span style={{position: 'absolute', left: -8, right: -8, top: -6, bottom: -6, borderRadius: 4, border: '3px solid #4a8ef0', background: 'rgba(120,180,255,.30)', opacity: eout(p), transform: `scale(${lerp(1.08, 1, eout(p))})`}} /><span style={{position: 'relative'}}>{sg.s}</span></span>;
              return <span key={j} style={{position: 'relative'}}>{sg.s}<span style={{position: 'absolute', left: 0, bottom: -4, height: 6, width: `${eio(p) * 100}%`, background: mk.c ?? '#e2453a', borderRadius: 3}} /></span>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- ent6: tall entity card (country / institution)
export const Ent6: React.FC<any> = ({e, t}) => {
  const w = e.w ?? 330, h = e.h ?? 470, fd = w * 0.36;
  return (
    <div style={{position: 'relative', width: w, height: h + fd / 2}}>
      <div style={{position: 'absolute', left: 0, top: fd / 2, width: w, height: h, borderRadius: 20, padding: 3, background: 'linear-gradient(160deg,#fff1b8 0%,#d9a948 45%,#8a6322 100%)', boxShadow: '0 30px 60px rgba(0,0,0,.55)'}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 17, overflow: 'hidden', background: e.bg ?? 'linear-gradient(180deg,#6a47a8 0%,#45307a 60%,#33235c 100%)'}}>
          <div style={{position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'radial-gradient(circle at 20% 15%, rgba(255,255,255,.6) 0 2px, transparent 3px), radial-gradient(circle at 70% 40%, rgba(255,255,255,.5) 0 1.5px, transparent 2.5px)', backgroundSize: '46px 46px, 62px 62px'}} />
          <div style={{position: 'absolute', left: 0, right: 0, top: fd * 0.62, textAlign: 'center', fontFamily: F.en, fontWeight: 700, fontSize: w * 0.06, letterSpacing: 2, color: 'rgba(255,232,170,.75)'}}>{e.en}</div>
          <div style={{position: 'absolute', left: 0, right: 0, top: fd * 0.62 + w * 0.09, textAlign: 'center'}}><GText txt={e.name} size={e.ns ?? w * 0.24} grad="gold" glow={false} ls={2} /></div>
          {e.strip && <div style={{position: 'absolute', left: w * 0.09, right: w * 0.09, bottom: w * 0.09, height: h * 0.25, borderRadius: 10, background: 'linear-gradient(180deg,#ffffff,#ecebef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: e.sf === 'num' ? F.num : F.heavy, fontWeight: 900, fontSize: e.ss ?? h * 0.12, color: e.sc ?? '#24222c', letterSpacing: 1, whiteSpace: 'nowrap'}}>{e.strip}</div>}
        </div>
      </div>
      <div style={{position: 'absolute', left: w / 2 - fd / 2, top: 0, width: fd, height: fd, borderRadius: '50%', overflow: 'hidden', border: '5px solid #fbf3d6', boxShadow: '0 10px 24px rgba(0,0,0,.45)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{transform: 'scale(1.02)'}}><FlagSvg c={e.c} w={fd * 1.5} /></div>
      </div>
      {e.tag && <div style={{position: 'absolute', left: w / 2 - 70, width: 140, top: h + fd / 2 - 18, textAlign: 'center', fontFamily: F.en, fontWeight: 700, fontSize: 22, color: '#2a2210', background: 'linear-gradient(180deg,#ffe9a8,#e9b94e)', borderRadius: 6, padding: '3px 0'}}>{e.tag}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- bignum: frame-filling number
export const BigNum: React.FC<any> = ({e, t}) => {
  let txt = e.v as string;
  if (e.count) {const [a, b, dec] = e.count; const p = eout(prog(t, e.ct ?? e.t, e.cd ?? 0.9)); txt = fmt(lerp(a, b, p), dec ?? 0, e.sep ?? false);}
  const size = e.size ?? 520;
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: e.align ?? 'center'}}>
      {e.kicker && <div style={{fontFamily: F.ys, fontSize: size * 0.13, color: e.kc ?? '#efe9ff', letterSpacing: 6, marginBottom: -size * 0.04, opacity: eout(prog(t, e.t + 0.15, 0.4))}}>{e.kicker}</div>}
      <div style={{display: 'flex', alignItems: 'flex-end', lineHeight: 1}}>
        <GText txt={txt} font={e.font ?? 'num'} size={size} grad={e.grad ?? 'lime'} ext={e.ext ?? true} glow={e.glow ?? true} ls={e.ls ?? 4} />
        {e.unit && <span style={{marginLeft: size * 0.04, marginBottom: size * 0.12}}><GText txt={e.unit} font={e.uf ?? 'ys'} size={size * (e.us ?? 0.3)} grad={e.grad ?? 'lime'} ext={false} glow={false} /></span>}
      </div>
      {e.cap && <div style={{fontFamily: F.heavy, fontWeight: 800, fontSize: size * 0.11, color: e.cc ?? '#f4f2ea', marginTop: size * 0.02, letterSpacing: 2, opacity: eout(prog(t, e.t + 0.3, 0.4)), whiteSpace: 'nowrap'}}>{e.cap}</div>}
      {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: Math.max(18, size * 0.04), color: 'rgba(240,240,230,.5)', letterSpacing: 4, marginTop: 6, opacity: eout(prog(t, e.t + 0.4, 0.4))}}>{e.en}</div>}
    </div>
  );
};

// ---------------------------------------------------------------- ui: white app window (calculator)
const typed = (s: string, t: number, t0: number, cps = 9) => {const n = Math.floor(clamp((t - t0) * cps, 0, s.length)); return t < t0 ? '' : Array.from(s).slice(0, n).join('');};
export const UICalc: React.FC<any> = ({e, t}) => {
  const w = e.w ?? 1260, h = e.h ?? 860;
  const fields = (e.fields ?? []) as any[], res = (e.res ?? []) as any[];
  const focusF = fields.findIndex((f, i) => t >= f.t && (i === fields.length - 1 ? t < f.t + 1.2 : t < fields[i + 1].t));
  return (
    <div style={{position: 'relative', width: w, height: h, borderRadius: 30, background: '#f5f6f8', boxShadow: '0 50px 120px rgba(0,0,0,.55)', overflow: 'hidden', fontFamily: F.heavy}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 96, background: '#ffffff', borderBottom: '2px solid #ececf0', display: 'flex', alignItems: 'center', paddingLeft: 36}}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: c, marginRight: 12}} />)}
        <div style={{marginLeft: 26, fontWeight: 800, fontSize: 36, color: '#26252c'}}>{e.title ?? '养老金测算'}</div>
        {e.sub && <div style={{marginLeft: 18, fontWeight: 500, fontSize: 24, color: '#9b9ba3'}}>{e.sub}</div>}
      </div>
      <div style={{position: 'absolute', left: 50, top: 130, width: e.lw ?? 560}}>
        {fields.map((f, i) => {
          const on = t >= f.t, foc = i === focusF;
          return (
            <div key={i} style={{marginBottom: 30, opacity: on ? 1 : 0.45}}>
              <div style={{fontSize: 28, fontWeight: 600, color: '#6b6b74', marginBottom: 10}}>{f.l}</div>
              <div style={{height: 86, borderRadius: 14, background: '#fff', border: `3px solid ${foc ? '#ff8a3d' : '#e2e2e8'}`, boxShadow: foc ? '0 0 0 6px rgba(255,138,61,.18)' : 'none', display: 'flex', alignItems: 'center', paddingLeft: 26, paddingRight: 26}}>
                <span style={{fontFamily: F.din, fontSize: 54, color: '#1f1f25', letterSpacing: 1}}>{typed(f.v, t, f.t + 0.15)}</span>
                {foc && Math.floor(t * 3) % 2 === 0 && <span style={{width: 3, height: 48, background: '#ff8a3d', marginLeft: 4}} />}
                <span style={{marginLeft: 'auto', fontSize: 26, color: '#a5a5ad'}}>{f.u}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: (e.lw ?? 560) + 110, right: 50, top: 130, bottom: 50, borderRadius: 22, background: '#ffffff', border: '2px solid #ececf0', padding: '30px 40px'}}>
        <div style={{fontSize: 26, fontWeight: 700, color: '#9b9ba3', letterSpacing: 3, marginBottom: 14}}>{e.rtitle ?? '测算结果'}</div>
        {res.map((r, i) => {
          const p = prog(t, r.t, 0.35), cp = eout(prog(t, r.t + 0.15, r.cd ?? 0.8));
          const lit = r.lit ? litOf(r.lit, t, 0) : 0;
          return (
            <div key={i} style={{opacity: eout(p), transform: `translateY(${(1 - eout(p)) * 30}px)`, marginBottom: r.total ? 0 : 22, paddingTop: r.total ? 20 : 0, borderTop: r.total ? '2px dashed #dcdce2' : 'none', position: 'relative'}}>
              {lit > 0 && <div style={{position: 'absolute', left: -18, right: -18, top: r.total ? 10 : -8, bottom: -8, borderRadius: 14, background: '#eef5b0', opacity: lit}} />}
              <div style={{position: 'relative', display: 'flex', alignItems: 'baseline'}}>
                <span style={{fontSize: 32, fontWeight: 800, color: '#34333b'}}>{r.l}</span>
                {r.f && <span style={{marginLeft: 16, fontFamily: F.din, fontSize: 32, color: '#9b9ba3'}}>{r.f}</span>}
              </div>
              <div style={{position: 'relative', fontFamily: F.num, fontSize: r.total ? 150 : 104, lineHeight: 1.05, color: r.total ? '#5a3fd0' : '#3d4fd6', letterSpacing: 2}}>
                {r.pre ?? ''}{fmt(lerp(r.from ?? 0, r.v, cp), r.dec ?? 0, true)}<span style={{fontFamily: F.heavy, fontWeight: 700, fontSize: 32, color: '#8e8e96', marginLeft: 12}}>{r.u ?? '元/月'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- formula6: big formula strip on a purple panel
// toks: [{s, t, op?, icon?, l?, en?}], hl: [[t, idx]], strike: [[t, idx]]
export const Formula6: React.FC<any> = ({e, t}) => {
  const toks = e.toks as any[], fs = e.fs ?? 128, pw = e.pw ?? 1300, ph = e.ph ?? 820;
  const {cur, prev, p: hp} = focusAt(e.hl, t);
  const hlv = (i: number) => lerp(prev === i ? 1 : 0, cur === i ? 1 : 0, hp);
  const anyHl = (e.hl ?? []).length > 0 && cur >= 0;
  return (
    <div style={{position: 'relative', width: pw, height: ph, borderRadius: 30, background: e.pbg ?? 'linear-gradient(170deg,#57397f 0%,#432c69 45%,#33224f 100%)', boxShadow: '0 40px 100px rgba(0,0,0,.55), inset 0 2px 0 rgba(255,255,255,.12)', border: '2px solid rgba(200,170,255,.22)'}}>
      {e.title && <div style={{position: 'absolute', left: 0, right: 0, top: 54, textAlign: 'center'}}>
        <GText txt={e.title} size={e.ts ?? 64} grad="lilac" glow={false} ls={6} />
        {e.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 18, letterSpacing: 3, color: 'rgba(225,205,255,.45)', marginTop: 4}}>{e.en}</div>}
      </div>}
      <div style={{position: 'absolute', left: 50, right: 50, top: e.sy ?? 200, height: fs * 1.55, borderRadius: 22, background: 'linear-gradient(180deg,rgba(30,18,52,.75),rgba(44,28,72,.65))', boxShadow: 'inset 0 4px 16px rgba(0,0,0,.45)'}} />
      <div style={{position: 'absolute', left: 50, right: 50, top: e.sy ?? 200, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: e.gap ?? 18}}>
        {toks.map((k, i) => {
          const p = prog(t, k.t, 0.4), h = hlv(i), dim = anyHl && !k.op ? 1 - h : 0;
          const st = (e.strike ?? []).find((x: any) => x[1] === i), sp = st ? eout(prog(t, st[0], 0.3)) : 0;
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: clamp(p * 2.5) * (1 - 0.45 * dim * (e.dimOthers === false ? 0 : 1)), transform: `translateY(${(1 - back(p)) * -40}px)`}}>
              <div style={{position: 'relative', height: fs * 1.55, display: 'flex', alignItems: 'center', padding: k.op ? '0 2px' : `0 ${fs * 0.12}px`}}>
                {h > 0 && <div style={{position: 'absolute', left: 0, right: 0, top: fs * 0.14, bottom: fs * 0.14, borderRadius: 14, background: 'linear-gradient(180deg,#f6fac9,#dde78e)', opacity: h, transform: `scale(${lerp(0.85, 1, eout(h))})`, boxShadow: '0 0 30px rgba(230,240,150,.45)'}} />}
                <span style={{position: 'relative'}}>
                  {k.op ? <span style={{fontFamily: F.din, fontSize: fs * 0.62, color: 'rgba(220,205,250,.75)'}}>{k.s}</span>
                    : h > 0.5 ? <span style={{fontFamily: k.font === 'ys' ? F.ys : F.din, fontSize: fs * (k.fs ?? 1), color: '#3a4214', letterSpacing: 1}}>{k.s}</span>
                    : <GText txt={k.s} font={k.font ?? 'din'} size={fs * (k.fs ?? 1)} grad="lav" glow={false} ls={1} />}
                </span>
                {sp > 0 && <div style={{position: 'absolute', left: '-6%', right: '-6%', top: '50%', height: 10, borderRadius: 5, background: '#ff6b6b', transform: `rotate(-14deg) scaleX(${sp})`, transformOrigin: '0 50%', boxShadow: '0 0 12px rgba(255,80,80,.6)'}} />}
              </div>
              {k.icon && (() => {const q = prog(t, k.it ?? k.t + 0.25, 0.4); return (
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: eout(q), transform: `translateY(${(1 - eout(q)) * 30}px)`, marginTop: 14, width: e.iw ?? 230, borderRadius: 16, padding: '10px 0 14px', background: h > 0 ? `rgba(238,245,176,${0.92 * h})` : 'transparent'}}>
                  <svg width="30" height="52" viewBox="0 0 30 52"><path d="M15 50 C 6 36, 24 20, 15 4" fill="none" stroke={h > 0.5 ? '#5b6320' : 'rgba(225,210,255,.7)'} strokeWidth="2.6" strokeLinecap="round" /><path d="M8 11 L15 3 L22 11" fill="none" stroke={h > 0.5 ? '#5b6320' : 'rgba(225,210,255,.7)'} strokeWidth="2.6" strokeLinecap="round" /></svg>
                  <Img src={img(k.icon)} style={{height: e.ih ?? 130, objectFit: 'contain', marginTop: 4, filter: 'drop-shadow(0 10px 14px rgba(0,0,0,.35))'}} />
                  {k.l && <div style={{fontFamily: F.heavy, fontWeight: 700, fontSize: e.lfs ?? 32, color: h > 0.5 ? '#3a4214' : '#e4dbf6', marginTop: 6, whiteSpace: 'nowrap'}}>{k.l}</div>}
                  {k.en && <div style={{fontFamily: F.en, fontWeight: 700, fontSize: 15, letterSpacing: 1.5, color: h > 0.5 ? 'rgba(58,66,20,.6)' : 'rgba(225,210,255,.45)', whiteSpace: 'nowrap'}}>{k.en}</div>}
                </div>
              );})()}
            </div>
          );
        })}
      </div>
      {e.foot && <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontFamily: F.heavy, fontWeight: 700, fontSize: e.ffs ?? 30, color: 'rgba(238,230,255,.85)', opacity: eout(prog(t, e.ft ?? e.t, 0.4))}}>{e.foot}</div>}
    </div>
  );
};

export const ELS6: any = {wall: Wall, paper: Paper, docpage: DocPage, ent6: Ent6, bignum: BigNum, ui: UICalc, formula6: Formula6};
