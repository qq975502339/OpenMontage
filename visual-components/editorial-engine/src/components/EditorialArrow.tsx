import React from 'react';
import {eout,prog} from '../lib';

/** Curved arrow assembled from sequential points. */
export const EditorialArrow:React.FC<{e:any;t:number}>=({e,t})=>{
 const [x1,y1]=e.from,[x2,y2]=e.to,bend=e.bend ?? 0,mx=(x1+x2)/2,my=(y1+y2)/2,len=Math.hypot(x2-x1,y2-y1)||1,cx=mx-(y2-y1)/len*bend,cy=my+(x2-x1)/len*bend;
 const p=eout(prog(t,e.t ?? 0,e.d ?? .8)), c=e.c ?? '#e3cf98',sw=e.sw ?? 7,hs=e.hs ?? 26,ang=Math.atan2(y2-cy,x2-cx);
 return <svg width="10" height="10" style={{position:'absolute',left:0,top:0,overflow:'visible'}}>
  {Array.from({length:30}).map((_,i)=>{const q=i/29,shown=Math.min(1,Math.max(0,(p-q)*15)),u=1-q;return <circle key={i} cx={u*u*x1+2*u*q*cx+q*q*x2} cy={u*u*y1+2*u*q*cy+q*q*y2} r={sw*.55*shown} fill={c}/>})}
  {p>.92 && <path d={`M${x2-hs*Math.cos(ang-.5)} ${y2-hs*Math.sin(ang-.5)} L${x2} ${y2} L${x2-hs*Math.cos(ang+.5)} ${y2-hs*Math.sin(ang+.5)}`} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>}
 </svg>;
};
