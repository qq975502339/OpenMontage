import React from 'react';
import {clamp, eout, F, fmt, prog} from '../lib';

/** Standalone replacement for the `paper` element's vertical-column layout. */
export const EditorialColumnChart: React.FC<{e: any; t: number}> = ({e, t}) => {
  const w = e.w ?? 1500, h = e.h ?? 900;
  const items: any[] = e.cols ?? e.rows ?? [];
  const maximum = Math.max(1, e.max ?? 0, ...items.map(x => Math.max(0, Number(x.v) || 0)));
  const margin = w * .09, slot = (w - margin * 2) / Math.max(1, items.length);
  const bw = Math.min(e.bw ?? w * .11, slot * .55);
  const base = h * .79, top = h * .30, available = base - top;
  const t0 = (e.t ?? 0) + (e.bt ?? .35);
  const focus = (e.hi ?? []).filter(([time]: number[]) => time <= t);
  const current = focus.length ? focus[focus.length - 1][1] : -1;
  const ascending = items.length > 1 && items.every((item, i) => i === 0 || Number(item.v) >= Number(items[i - 1].v)) && Number(items[items.length - 1]?.v) > Number(items[0]?.v);
  const arrow = e.trendArrow !== false && ascending;
  const arrowProgress = eout(prog(t, t0 + (items.length - 1) * (e.stag ?? .1) + .25, .75));
  return <div style={{position:'relative',width:w,height:h,overflow:'hidden',background:'radial-gradient(ellipse at 50% 52%,#263e46,#0a1720 76%)',fontFamily:F.heavy,color:'#fff1bd'}}>
    <div style={{position:'absolute',inset:0,opacity:.2,backgroundImage:'radial-gradient(#859094 2px,transparent 2px)',backgroundSize:'32px 32px'}} />
    <div style={{position:'absolute',left:0,top:0,width:w*.45,height:h*.15,background:'#bc4c4c',clipPath:'polygon(0 0,88% 0,100% 58%,0 100%)'}} />
    <div style={{position:'absolute',right:0,bottom:0,width:w*.34,height:h*.20,background:'#e89656',clipPath:'polygon(0 100%,100% 0,100% 100%)'}} />
    <div style={{position:'absolute',left:margin,top:h*.065,fontWeight:900,fontSize:e.ts ?? Math.min(72,h*.085),lineHeight:1.1,whiteSpace:'nowrap',maxWidth:w*.72,overflow:'hidden',textOverflow:'ellipsis'}}>{e.title}</div>
    {e.en && <div style={{position:'absolute',left:margin,top:h*.18,fontFamily:F.en,fontWeight:700,fontSize:Math.min(24,h*.032),letterSpacing:3,color:'#f6d5ad'}}>{e.en}</div>}
    {e.kicker && <div style={{position:'absolute',right:margin,top:h*.06,fontFamily:F.en,fontWeight:700,fontSize:Math.min(28,h*.034),color:'#f9e8c0'}}>{e.kicker}</div>}
    {e.unit && <div style={{position:'absolute',left:margin,top:h*.25,fontSize:Math.min(25,h*.035),color:'#e1d0ae'}}>{e.unit}</div>}
    <div style={{position:'absolute',left:margin,right:margin,top:base,height:Math.max(3,h*.005),background:'#fff0bd'}} />
    {items.map((item,i)=>{
      const progress=eout(prog(t,t0+(item.dt ?? i*(e.stag ?? .1)),e.gd ?? .8));
      const barHeight=available*clamp((Number(item.v)||0)/maximum)*progress;
      const cx=margin+slot*(i+.5), active=current<0 || current===i;
      return <div key={i} style={{opacity:active?1:.3}}>
        <div style={{position:'absolute',left:cx-bw/2,top:base-barHeight,width:bw,height:barHeight,borderRadius:'10px 10px 0 0',background:item.c ?? 'linear-gradient(180deg,#ffdfa0,#f2a264 70%,#e78057)',boxShadow:'10px 8px 0 rgba(127,80,64,.75)'}} />
        <div style={{position:'absolute',left:cx-slot*.48,width:slot*.96,top:base-barHeight-(e.vs ?? 48)*1.25,textAlign:'center',fontSize:e.vs ?? 48,fontWeight:900,color:item.vc ?? '#fff2be',opacity:clamp((progress-.4)*3),whiteSpace:'nowrap'}}>{item.s ?? fmt(Number(item.v)||0)}</div>
        <div style={{position:'absolute',left:cx-slot*.48,width:slot*.96,top:base+h*.025,textAlign:'center',fontSize:e.ls ?? 34,fontWeight:800,color:'#fff0c0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.l}</div>
      </div>;
    })}
    {arrow && <svg width={w} height={h} style={{position:'absolute',inset:0,pointerEvents:'none',opacity:arrowProgress}} viewBox={`0 0 ${w} ${h}`}><path d={`M ${w*.55} ${h*.30} Q ${w*.7} ${h*.24} ${w*.82} ${h*.15}`} stroke="#ef7959" strokeWidth={h*.012} fill="none" strokeLinecap="round" strokeDasharray="1000" strokeDashoffset={1000*(1-arrowProgress)}/><path d={`M ${w*.82} ${h*.15} l ${-w*.04} ${h*.015} l ${w*.025} ${h*.035} Z`} fill="#ef7959"/></svg>}
    {e.src && <div style={{position:'absolute',left:margin,bottom:h*.04,fontSize:Math.min(23,h*.03),color:'#d8c9ae',maxWidth:w*.72}}>{e.src}</div>}
  </div>;
};
