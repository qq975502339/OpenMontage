import React from 'react';
import {eout,F,prog} from '../lib';

/** A seal presses down, makes contact, and settles with a small rebound. */
export const EditorialStamp:React.FC<{e:any;t:number}>=({e,t})=>{
 const p=prog(t,e.t ?? 0,.48),settle=eout(p),rebound=p>.7?Math.sin((p-.7)/.3*Math.PI)*.07:0,size=e.size ?? 120,color=e.c ?? '#d15f4e';
 return <div style={{position:'relative',display:'inline-flex',alignItems:'center',justifyContent:'center',padding:`${size*.12}px ${size*.35}px`,border:`${Math.max(4,size*.06)}px solid ${color}`,borderRadius:size*.5,color,background:e.bg ?? 'rgba(255,243,214,.08)',fontFamily:F.heavy,fontWeight:900,fontSize:size,whiteSpace:'nowrap',transform:`rotate(${e.tilt ?? -10}deg) scale(${1+(1-settle)*1.4-rebound})`,opacity:Math.min(1,p*4),filter:`blur(${(1-settle)*6}px)`,boxShadow:`0 ${Math.max(0,(1-settle)*28)}px ${Math.max(0,(1-settle)*32)}px rgba(0,0,0,.35)`}}>
  {e.txt}
 </div>;
};
