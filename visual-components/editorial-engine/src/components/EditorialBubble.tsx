import React from 'react';
import {back,F,prog} from '../lib';

/** Speech balloon inflates from its pointing tail. */
export const EditorialBubble:React.FC<{e:any;t:number}>=({e,t})=>{
 const p=prog(t,e.t ?? 0,.65), side=e.side==='r', color=e.bg ?? '#fff3d6';
 return <div style={{position:'relative',color:e.color ?? '#293b3f',fontFamily:F.heavy,fontWeight:900,fontSize:e.size ?? 40,whiteSpace:'nowrap',transform:`scale(${.2+.8*back(p)})`,transformOrigin:side?'90% 100%':'10% 100%',opacity:Math.min(1,p*3),filter:'drop-shadow(0 12px 13px rgba(0,0,0,.35))'}}>
  <div style={{position:'relative',background:color,clipPath:'polygon(0 0,92% 0,100% 28%,100% 100%,0 100%)',padding:'22px 46px 22px 36px'}}><span style={{position:'absolute',left:0,top:0,bottom:0,width:10,background:'#d76a52'}}/>{e.txt}</div>
  <svg width="48" height="32" style={{position:'absolute',bottom:1,[side?'right':'left']:34,transform:'translateY(95%)'}}><path d={side?'M0 0 H48 L40 30 Z':'M0 0 H48 L8 30 Z'} fill={color}/></svg>
 </div>;
};
