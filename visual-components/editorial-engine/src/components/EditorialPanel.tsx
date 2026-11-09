import React from 'react';
import {Img} from 'remotion';
import {eout,F,img,prog} from '../lib';

/** A reusable presentation panel, whose corner pieces assemble around its content. */
export const EditorialPanel:React.FC<{e:any;t:number}>=({e,t})=>{
 const w=e.w ?? 1600,h=e.h ?? 860,p=eout(prog(t,e.t ?? 0,.9));
 return <div style={{position:'relative',width:w,height:h,overflow:'hidden',background:e.bg ?? '#142236',boxShadow:'0 35px 75px rgba(0,0,0,.45)'}}>
  <div style={{position:'absolute',inset:0,opacity:.2,backgroundImage:'radial-gradient(#8b9aad 2px,transparent 2px)',backgroundSize:'36px 36px'}} />
  {e.photo && <Img src={img(e.photo)} style={{position:'absolute',right:0,top:0,width:w*.58,height:h,objectFit:'cover',opacity:.3,filter:'brightness(.65)',maskImage:'linear-gradient(90deg,transparent,black 40%)'}} />}
  {[[0,0,-1,-1],[1,0,1,-1],[0,1,-1,1],[1,1,1,1]].map(([x,y,dx,dy],i)=><div key={i} style={{position:'absolute',left:x?w*.5:0,top:y?h*.5:0,width:w*.5,height:h*.5,border:`${Math.max(3,w*.003)}px solid #bba875`,boxSizing:'border-box',clipPath:`inset(${y?75:0}% ${x?0:75}% ${y?0:75}% ${x?75:0}%)`,opacity:p,transform:`translate(${dx*(1-p)*w*.12}px,${dy*(1-p)*h*.12}px)`}} />)}
  {e.title && <div style={{position:'absolute',left:w*.075,right:w*.1,top:e.ht ?? h*.08,fontFamily:F.heavy,fontWeight:900,fontSize:e.tsize ?? 76,color:e.tcolor ?? '#fff1b6',opacity:p}}>{e.title}{e.en && <div style={{fontFamily:F.en,fontWeight:700,fontSize:22,letterSpacing:3,color:'#c7b993',marginTop:8}}>{e.en}</div>}</div>}
  {e.inner && <div style={{position:'absolute',left:w*.05,right:w*.05,top:e.inner,bottom:h*.06,border:'2px solid rgba(255,241,200,.35)',background:'rgba(255,245,215,.04)'}} />}
 </div>;
};
