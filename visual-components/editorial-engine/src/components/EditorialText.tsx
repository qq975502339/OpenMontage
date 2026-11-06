import React from 'react';
import {eout,F,GRAD,prog} from '../lib';

/** Text settles from a displaced echo, keeping user-supplied font and color. */
export const EditorialText:React.FC<{e:any;t:number}>=({e,t})=>{
 const p=eout(prog(t,e.t ?? 0,.75)),size=e.size ?? 90,gradient=GRAD[e.grad] ?? e.grad;
 return <div style={{position:'relative',textAlign:e.align ?? 'center',whiteSpace:'nowrap',fontFamily:F[e.font] ?? e.font ?? F.ys,fontSize:size,fontStyle:e.italic?'italic':'normal',letterSpacing:e.ls ?? 0}}>
  <span style={{position:'absolute',inset:0,color:'#d97052',opacity:(1-p)*.6,transform:`translate(${(1-p)*45}px,${(1-p)*-22}px)`}}>{e.txt}</span>
  <span style={{position:'relative',color:e.color ?? (gradient?'transparent':'#fff1bd'),background:gradient,WebkitBackgroundClip:gradient?'text':undefined,backgroundClip:gradient?'text':undefined,opacity:p}}>{e.txt}</span>
  {e.en && <div style={{fontFamily:F.en,fontWeight:700,fontSize:e.ensize ?? 26,letterSpacing:3,color:'#e2bea0',marginTop:4,opacity:p}}>{e.en}</div>}
 </div>;
};
