import React from 'react';
import {Img} from 'remotion';
import {eout,F,img,prog} from '../lib';

/** Compact formula: individual terms rotate into a flat paper strip. */
export const EditorialFormulaBasic:React.FC<{e:any;t:number}>=({e,t})=>{
 const size=e.size ?? 150,focus=(e.focus ?? []).find((f:any)=>t>=f[0] && t<(f[1] ?? 1e9));
 return <div style={{display:'flex',width:'max-content',alignItems:'flex-start',gap:e.gap ?? 26,fontFamily:F.heavy}}>{(e.items ?? []).map((it:any,i:number)=>{
  const p=eout(prog(t,it.t ?? e.t ?? 0,.55)),on=focus && focus[2]===i,dim=focus && !on && !it.op,src=it.icon && (it.icon.includes('/')?it.icon:`icons/${it.icon}.png`);
  return <div key={i} style={{minWidth:it.w ?? size*.9,display:'flex',flexDirection:'column',alignItems:'center',opacity:p*(dim?.4:1),transform:`rotate(${(1-p)*(i%2?18:-18)}deg)`,transformOrigin:'center top'}}>
   <div style={{minHeight:size*1.45,display:'grid',placeItems:'center',padding:`${size*.08}px ${size*.12}px`,boxSizing:'border-box',lineHeight:1.2,whiteSpace:'nowrap',background:it.op?'transparent':on?'#cbb579':'#24344a',clipPath:it.op?undefined:'polygon(0 0,90% 0,100% 15%,100% 100%,0 100%)',fontWeight:900,fontSize:it.op?size*.62:(it.size ?? size),color:it.op?'#eadab0':on?'#172338':'#f4ead1'}}>{it.s}</div>
   {it.lab && <div style={{textAlign:'center',color:'#f4e9ce',fontSize:e.lsize ?? 38,marginTop:14}}>{src && <Img src={img(src)} style={{height:e.iconh ?? 130,display:'block',margin:'0 auto'}}/>}{it.lab}{it.en && <div style={{fontFamily:F.en,fontSize:17,color:'#c7bfac'}}>{it.en}</div>}</div>}
  </div>;
 })}</div>;
};
