import React from 'react';
import {Img} from 'remotion';
import {clamp,eout,F,img,prog} from '../lib';

/** Horizontal bars assemble as sequential segments, while lengths remain data-scaled. */
export const EditorialBars:React.FC<{e:any;t:number}>=({e,t})=>{
 const rows:any[]=e.rows ?? [],w=e.w ?? 1100,bh=e.bh ?? 96,gap=e.gap ?? 56,lw=e.lw ?? 300,h=rows.length*(bh+gap)-gap, mx=Math.max(1,e.max ?? 0,...rows.map(r=>Number(r.v)||0));
 const available=Math.max(1,w-lw-220);
 return <div style={{position:'relative',width:w,height:Math.max(h,1),background:e.bg ?? 'transparent',fontFamily:F.heavy}}>
  {rows.map((r,i)=>{const t0=r.t ?? (e.t ?? 0)+i*(e.stag ?? .5),p=eout(prog(t,t0,e.d ?? .9)),bw=available*clamp((Number(r.v)||0)/mx), length=bw*p, icon=r.icon && (r.icon.includes('/')?r.icon:`icons/${r.icon}.png`);
   return <div key={i} style={{position:'absolute',left:0,top:i*(bh+gap),width:w,height:bh,opacity:p}}>
    <div style={{position:'absolute',left:0,top:0,width:lw-30,height:bh,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'flex-end',color:'#fff1bf'}}><div style={{fontWeight:900,fontSize:e.lsize ?? 50}}>{r.label}</div>{r.sub && <div style={{fontFamily:F.en,fontSize:18,color:'#d7b696'}}>{r.sub}</div>}</div>
    <div style={{position:'absolute',left:lw,top:bh*.18,width:available,height:bh*.64,background:'rgba(255,245,216,.1)'}} />
    {r.v2!=null && <div style={{position:'absolute',left:lw,top:bh*.18,width:available*clamp((Number(r.v2)||0)/mx)*p,height:bh*.64,background:'repeating-linear-gradient(45deg,#e9a86c66 0 12px,transparent 12px 24px)',border:'2px dashed #e9a86c',boxSizing:'border-box'}} />}
    <div style={{position:'absolute',left:lw,top:bh*.18,width:bw,height:bh*.64,display:'flex',gap:4,overflow:'hidden',clipPath:'polygon(0 0,96% 0,100% 50%,96% 100%,0 100%)'}}>{Array.from({length:12}).map((_,segment)=>{const q=eout(prog(t,t0+segment*(e.d ?? .9)/12,.25));return <div key={segment} style={{flex:1,minWidth:0,height:'100%',background:r.bg ?? (segment%2?'#e99760':'#f4ca8b'),opacity:q,transform:`scaleY(${q})`,transformOrigin:segment%2?'top':'bottom'}}/>;})}</div>
    {icon && <Img src={img(icon)} style={{position:'absolute',left:lw+length-bh*.6,top:-bh*.22,height:bh*1.2,opacity:p}}/>}
    <div style={{position:'absolute',left:lw+Math.max(length,available*clamp((Number(r.v2)||0)/mx)*p)+24,top:bh*.12,fontFamily:F.num,fontSize:e.vsize ?? 76,color:'#fff1b5',whiteSpace:'nowrap',opacity:clamp(p*2-.4)}}>{r.txt ?? r.v}</div>
   </div>;
  })}
 </div>;
};
