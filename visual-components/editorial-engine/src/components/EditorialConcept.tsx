import React from 'react';
import {Img} from 'remotion';
import {eout,F,img,prog} from '../lib';

/** Concept card: characters settle individually onto an editorial label. */
export const EditorialConcept:React.FC<{e:any;t:number;v?:any}>=({e,t,v})=>{
  const w=e.w ?? 760,h=e.h ?? 340,start=e.t ?? 0, chars=Array.from(String(e.word ?? ''));
  const s=Math.min(e.size ?? 150,w*.66/Math.max(1,chars.length)*1.1);
  const path=e.icon && (e.icon.includes('/') || /\.[a-z0-9]+$/i.test(e.icon)?e.icon:`icons/${e.icon}.png`), hasIcon=!!(path || e.iconKind);
  return <div style={{position:'relative',width:w,height:h,background:e.bg ?? '#1b2a3c',clipPath:'polygon(0 0,94% 0,100% 14%,100% 100%,0 100%)',boxShadow:'0 22px 50px rgba(0,0,0,.4)',overflow:'hidden'}}>
    <div style={{position:'absolute',left:w*.07,top:h*.24,right:hasIcon?w*.3:w*.07,display:'flex',whiteSpace:'nowrap',fontFamily:F.heavy,fontWeight:900,fontSize:s,lineHeight:1.05,color:e.color ?? '#f7e9c4'}}>{chars.map((c,i)=>{const p=eout(prog(t,start+i*.09,.5));return <span key={i} style={{display:'inline-block',opacity:p,transform:`translateY(${(1-p)*(i%2?-h*.22:h*.22)}px) rotate(${(1-p)*(i%2?12:-12)}deg)`}}>{c}</span>})}</div>
    {e.en && <div style={{position:'absolute',left:w*.075,top:h*.24+s*1.08,fontFamily:F.en,fontWeight:700,fontSize:e.ensize ?? h*.09,letterSpacing:2,color:'#cbbd9d',whiteSpace:'nowrap'}}>{e.en}</div>}
    {e.sub && <div style={{position:'absolute',left:w*.075,bottom:h*.08,fontFamily:F.heavy,fontWeight:700,fontSize:Math.min(36,h*.1),color:'#d9c390'}}>{e.sub}</div>}
    {hasIcon && <div style={{position:'absolute',right:w*.05,top:h*.22,width:w*.23,height:e.iconh ?? h*.6,filter:`drop-shadow(0 8px 12px rgba(0,0,0,${.18+.15*(v?.litv ?? 0)}))`}}>{e.iconKind==='money'?<svg viewBox="0 0 120 120" width="100%" height="100%"><circle cx="60" cy="60" r="46" fill="#e99a5f" stroke="#ab6750" strokeWidth="5"/><circle cx="60" cy="60" r="35" fill="#ffe6a8"/><text x="60" y="82" textAnchor="middle" fontSize="65" fontWeight="900" fill="#a55f4d">¥</text></svg>:path?<Img src={img(path)} style={{width:'100%',height:'100%',objectFit:'contain'}}/>:null}</div>}
  </div>;
};
