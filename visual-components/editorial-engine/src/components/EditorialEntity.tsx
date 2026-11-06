import React from 'react';
import {eout,F,prog} from '../lib';
import {EditorialFlag} from './EditorialFlag';

/** Compact entity row, with a scanning accent and optional country or custom image. */
export const EditorialEntity:React.FC<{e:any;t:number;v?:any}>=({e,t,v})=>{
 const p=eout(prog(t,e.t ?? 0,.7)),lit=v?.litv ?? 0;
 return <div style={{position:'relative',display:'flex',alignItems:'center',gap:24,padding:'22px 38px 22px 26px',background:lit>.5?'#fff1d2':'#20353b',clipPath:'polygon(0 0,94% 0,100% 20%,100% 100%,0 100%)',boxShadow:'0 18px 35px rgba(0,0,0,.4)',overflow:'hidden'}}>
  <div style={{position:'absolute',left:0,top:0,bottom:0,width:8,background:'#d56a50',transform:`translateY(${(1-p)*100}%)`}} />
  {(e.c || e.icon) && <EditorialFlag e={{c:e.c,src:e.icon,size:e.fs ?? 96,t:e.t}} t={t}/>}
  <div style={{fontFamily:F.heavy,color:lit>.5?'#2e3432':'#fff0c0',opacity:p}}><div style={{fontSize:e.size ?? 52,fontWeight:900,whiteSpace:'nowrap'}}>{e.name}</div>{e.en && <div style={{fontFamily:F.en,fontWeight:700,fontSize:19,letterSpacing:2,color:lit>.5?'#966d56':'#dab99c'}}>{e.en}</div>}</div>
 </div>;
};
