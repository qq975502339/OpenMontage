import React from 'react';
import {clamp, eout, F, fmt, lerp, prog} from '../lib';

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
