import React from 'react';
import {eio,prog} from '../lib';

/** Coins travel along the supplied Bézier route with short fading trails. */
export const EditorialCoinFlow:React.FC<{e:any;t:number}>=({e,t})=>{
 const [x1,y1]=e.from,[x2,y2]=e.to,bend=e.bend ?? -160,n=Math.max(1,e.n ?? 12),d=e.d ?? 2.4,tr=e.tr ?? 1.1,len=Math.hypot(x2-x1,y2-y1)||1,cx=(x1+x2)/2-(y2-y1)/len*bend,cy=(y1+y2)/2+(x2-x1)/len*bend,s=e.s ?? 48;
 const point=(q:number)=>{const z=1-q;return [z*z*x1+2*z*q*cx+q*q*x2,z*z*y1+2*z*q*cy+q*q*y2]};
 return <svg width="10" height="10" style={{position:'absolute',left:0,top:0,overflow:'visible'}}>{Array.from({length:n}).map((_,i)=>{const elapsed=t-((e.t ?? 0)+i*d/n);if(elapsed<0 || elapsed>tr)return null;const p=eio(prog(elapsed,0,tr)),[x,y]=point(p),[px,py]=point(Math.max(0,p-.05)),opacity=Math.min(1,elapsed*6,(tr-elapsed)*6);return <g key={i} opacity={opacity}><line x1={px} y1={py} x2={x} y2={y} stroke="#efba82" strokeWidth={s*.16} strokeLinecap="round" opacity=".5"/><circle cx={x} cy={y} r={s*.5} fill="#eaa06b" stroke="#a95f4d" strokeWidth={s*.07}/><text x={x} y={y+s*.17} textAnchor="middle" fontFamily="sans-serif" fontWeight="bold" fontSize={s*.5} fill="#8c5243">{e.symbol ?? '¥'}</text></g>})}</svg>;
};
