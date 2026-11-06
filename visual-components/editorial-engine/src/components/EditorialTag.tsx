import React from 'react';
import {eout,F,prog} from '../lib';

/** A hanging tag swings to rest. */
export const EditorialTag:React.FC<{e:any;t:number}>=({e,t})=>{
 const p=eout(prog(t,e.t ?? 0,.7)),s=e.size ?? 34,colors:any={lime:'#f8df9c',pink:'#efb6aa',blue:'#b6d3d2',gold:'#edc187',white:'#fff5dc',red:'#d46b53',dark:'#263d42',mint:'#b6d7c4',purple:'#cfc2d6'};
 return <div style={{position:'relative',display:'inline-flex',alignItems:'center',gap:s*.3,padding:`${s*.22}px ${s*.5}px`,background:colors[e.c] ?? e.c ?? '#f8df9c',color:e.c==='dark'?'#fff2ce':'#2c3839',fontFamily:F.heavy,fontWeight:900,fontSize:s,whiteSpace:'nowrap',clipPath:'polygon(0 0,90% 0,100% 50%,90% 100%,0 100%)',transform:`rotate(${Math.sin((1-p)*Math.PI*2)*15}deg)`,transformOrigin:'left center',opacity:p}}>{e.txt}{e.en && <span style={{fontFamily:F.en,fontSize:s*.45,letterSpacing:2}}>{e.en}</span>}</div>;
};
