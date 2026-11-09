import React from 'react';
import {eout,F,fmt,lerp,prog} from '../lib';

/** Horizontal comparison chart with converging bars and time-based focus. */
export const EditorialHorizontalChart:React.FC<{e:any;t:number}>=({e,t})=>{
 const w=e.w ?? 1500,h=e.h ?? 900,rows:any[]=e.rows ?? [],max=Math.max(1,e.max ?? 0,...rows.map(r=>Number(r.v)||0)),top=h*.28,rowH=(h*.58)/Math.max(1,rows.length),left=w*.28,avail=w*.62;
 let cur=-1,prev=-1,at=-1e9;for(const [time,index] of e.hi ?? []) if(t>=time){prev=cur;cur=index;at=time;}
 const f=eout(prog(t,at,.35));
 return <div style={{position:'relative',width:w,height:h,overflow:'hidden',background:'#f4f4f0',fontFamily:F.heavy}}>
  {e.title && <div style={{position:'absolute',left:w*.05,top:h*.055,fontSize:e.ts ?? 70,fontWeight:900,color:'#273a51'}}>{e.title}</div>}
  {e.en && <div style={{position:'absolute',left:w*.05,top:h*.17,fontFamily:F.en,fontSize:20,letterSpacing:2,color:'#7e8386'}}>{e.en}</div>}
  {rows.map((r,i)=>{const p=eout(prog(t,(e.t ?? 0)+(e.bt ?? .35)+(r.dt ?? i*.14),e.gd ?? .8)),on=(x:number)=>x<0||x===i?1:.3,opacity=lerp(on(prev),on(cur),f),target=avail*Math.max(0,Number(r.v)||0)/max;
   return <div key={i} style={{position:'absolute',top:top+i*rowH,left:0,width:w,height:rowH,opacity}}>
    <div style={{position:'absolute',left:w*.04,width:left-w*.06,top:rowH*.25,textAlign:'right',fontSize:e.ls ?? 40,fontWeight:800,color:'#303744'}}>{r.l}</div>
    <div style={{position:'absolute',left,top:rowH*.22,width:target,height:rowH*.52,background:r.c ?? 'linear-gradient(90deg,#a99461,#ead6a0)',transform:`scaleX(${1.25-.25*p})`,transformOrigin:'left center',opacity:p,clipPath:'polygon(0 0,96% 0,100% 50%,96% 100%,0 100%)'}} />
    <div style={{position:'absolute',left:left+target+20,top:rowH*.2,fontSize:e.vs ?? 44,fontWeight:900,fontFamily:F.num,color:'#29394d',opacity:p,whiteSpace:'nowrap'}}>{r.s ?? fmt(Number(r.v)||0)}</div>
   </div>})}
  {e.unit && <div style={{position:'absolute',left:w*.04,top:top-h*.05,fontSize:24,color:'#7e8386'}}>{e.unit}</div>}{e.src && <div style={{position:'absolute',left:w*.04,bottom:h*.035,fontSize:22,color:'#7e8386'}}>{e.src}</div>}
 </div>;
};
