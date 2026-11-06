import React from 'react';
import {Img} from 'remotion';
import {eout,F,img,prog} from '../lib';

/** A labeled icon develops from monochrome to color inside its badge. */
export const EditorialIcon:React.FC<{e:any;t:number}>=({e,t})=>{
 const size=e.size ?? 220,p=eout(prog(t,e.t ?? 0,.75)),src=String(e.src ?? ''),path=src && (src.includes('/') || /\.[a-z0-9]+$/i.test(src)?src:`icons/${src}.png`);
 return <div style={{display:'flex',flexDirection:'column',alignItems:'center',fontFamily:F.heavy,opacity:p}}>
  <div style={{width:size*1.25,height:size*1.25,background:'#fff1cf',clipPath:'polygon(0 0,88% 0,100% 12%,100% 100%,0 100%)',display:'grid',placeItems:'center',filter:`grayscale(${e.gray?1:1-p})`,boxShadow:'0 12px 25px rgba(0,0,0,.3)'}}>
   {e.iconKind==='money'?<svg viewBox="0 0 120 120" width={size*.8} height={size*.8}><circle cx="60" cy="60" r="46" fill="#e99a5f" stroke="#ab6750" strokeWidth="5"/><circle cx="60" cy="60" r="35" fill="#ffe6a8"/><text x="60" y="82" textAnchor="middle" fontSize="65" fontWeight="900" fill="#a55f4d">¥</text></svg>:path&&<Img src={img(path)} style={{height:size,width:size,objectFit:'contain',filter:e.gray?'grayscale(1) brightness(.6)':undefined}}/>}
  </div>
  {e.label && <div style={{fontSize:e.lsize ?? 42,fontWeight:900,color:e.lc ?? '#fff1bd',marginTop:12,whiteSpace:'nowrap'}}>{e.label}</div>}
  {e.en && <div style={{fontFamily:F.en,fontWeight:700,fontSize:19,letterSpacing:2,color:'#dbb697',marginTop:4}}>{e.en}</div>}
 </div>;
};
