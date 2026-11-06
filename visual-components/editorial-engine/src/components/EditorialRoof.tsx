import React from 'react';
import {eout,F,prog} from '../lib';

/** Architectural header with a two-sided unfolding roofline. */
export const EditorialRoof:React.FC<{e:any;t:number}>=({e,t})=>{
 const w=e.w ?? 1300,h=e.h ?? 200,p=eout(prog(t,e.t ?? 0,.8));
 return <div style={{position:'relative',width:w,height:h,fontFamily:F.heavy}}><svg width={w} height={h}><path d={`M${w/2} 6 L${w-10} ${h-40} H10 Z`} fill="#e6aa76" stroke="#a95f4d" strokeWidth="5" opacity={p}/><path d={`M${w/2} 6 L${w/2+(w/2-10)*p} ${h-40} M${w/2} 6 L${w/2-(w/2-10)*p} ${h-40}`} fill="none" stroke="#fff0bf" strokeWidth="8"/><rect x="0" y={h-42} width={w} height="40" fill="#bf5b4c"/></svg><div style={{position:'absolute',left:0,right:0,top:h*.36,textAlign:'center',fontWeight:900,fontSize:e.size ?? 52,color:'#342d2b',letterSpacing:5,opacity:p}}>{e.txt}</div></div>;
};
