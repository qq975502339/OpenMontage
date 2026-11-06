import React from 'react';
import {clamp,eout,F,fmt,prog} from '../lib';

/** A line chart whose points and connecting segments are revealed one by one. */
export const EditorialLineChart:React.FC<{e:any;t:number}>=({e,t})=>{
 const w=e.w ?? 1100,h=e.h ?? 520,pts:[string,number][]=e.pts ?? [],n=pts.length,vs=pts.map(x=>Number(x[1]));
 const mn=e.min ?? Math.min(0,...vs), rawMax=e.max ?? Math.max(1,...vs), mx=rawMax===mn?mn+1:rawMax;
 const left=w*.08,right=w*.06,top=h*.24,base=h*.8,X=(i:number)=>left+i*(w-left-right)/Math.max(1,n-1),Y=(v:number)=>base-(v-mn)/(mx-mn)*(base-top);
 const labels:number[]=e.labels ?? (n>1?[0,n-1]:[0]), d=e.d ?? 2.2,start=(e.t ?? 0)+.2;
 return <div style={{position:'relative',width:w,height:h,overflow:'hidden',background:e.bg ?? '#fff3d6',clipPath:'polygon(0 0,96% 0,100% 9%,100% 100%,0 100%)',fontFamily:F.heavy}}>
  <div style={{position:'absolute',left:0,top:0,width:w*.45,height:h*.19,background:'#bd504c',clipPath:'polygon(0 0,90% 0,100% 63%,0 100%)'}} />
  {e.title && <div style={{position:'absolute',left:w*.04,top:h*.035,fontSize:e.tsize ?? 44,fontWeight:900,color:'#fff3c7',whiteSpace:'nowrap'}}>{e.title}{e.en && <span style={{fontFamily:F.en,fontSize:20,letterSpacing:2,marginLeft:18}}>{e.en}</span>}</div>}
  <svg width={w} height={h} style={{position:'absolute',inset:0}}>
   {[0,1,2,3].map(i=><line key={i} x1={left} x2={w-right} y1={top+(base-top)*i/3} y2={top+(base-top)*i/3} stroke="#d8c3a7" strokeWidth="2"/>)}
   {pts.slice(1).map((q,i)=>{const p=eout(prog(t,start+(i/Math.max(1,n-1))*d,d/Math.max(1,n-1))); return <line key={i} x1={X(i)} y1={Y(vs[i])} x2={lerpSafe(X(i),X(i+1),p)} y2={lerpSafe(Y(vs[i]),Y(q[1]),p)} stroke={e.c ?? '#d76851'} strokeWidth="8" strokeLinecap="round"/>;})}
   {pts.map((q,i)=>{const p=eout(prog(t,start+i*d/Math.max(1,n-1),.3));return <g key={i} opacity={p}><line x1={X(i)} x2={X(i)} y1={base} y2={Y(q[1])} stroke="#b98a6b" strokeWidth="2" strokeDasharray="5 8"/><circle cx={X(i)} cy={Y(q[1])} r={labels.includes(i)?11:7} fill="#fff3d6" stroke={e.c ?? '#d76851'} strokeWidth="5"/></g>;})}
  </svg>
  {pts.map((q,i)=><div key={i} style={{position:'absolute',left:X(i),top:base+12,transform:'translateX(-50%)',fontFamily:F.num,fontSize:30,color:'#756257'}}>{q[0]}</div>)}
  {labels.filter(i=>pts[i]).map(i=>{const p=clamp(prog(t,start+i*d/Math.max(1,n-1),.3));return <div key={i} style={{position:'absolute',left:X(i),top:Y(vs[i])-(e.vsize ?? 64)*1.2,transform:i===0?'translateX(0)':i===n-1?'translateX(-100%)':'translateX(-50%)',fontFamily:F.num,fontSize:e.vsize ?? 64,fontWeight:700,color:'#273d42',opacity:p,whiteSpace:'nowrap'}}>{fmt(vs[i],e.dec ?? 0)}{e.unit ?? ''}</div>})}
 </div>;
};
const lerpSafe=(a:number,b:number,p:number)=>a+(b-a)*p;
