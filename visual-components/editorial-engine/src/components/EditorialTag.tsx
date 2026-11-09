import React from 'react';
import {eout,F,prog} from '../lib';

/** A hanging tag swings to rest. */
export const EditorialTag:React.FC<{e:any;t:number}>=({e,t})=>{
 const p=eout(prog(t,e.t ?? 0,.7)),s=e.size ?? 34,colors:any={lime:'#e5d5a9',pink:'#d4c4ad',blue:'#b6c5d1',gold:'#c4b282',white:'#f2eee2',red:'#b19a6d',dark:'#26364a',mint:'#bbc9c4',purple:'#c0c5d0'};
 return <div style={{position:'relative',display:'inline-flex',alignItems:'center',gap:s*.3,padding:`${s*.22}px ${s*.5}px`,background:colors[e.c] ?? e.c ?? '#e5d5a9',color:e.c==='dark'?'#f1e8d3':'#26364a',fontFamily:F.heavy,fontWeight:900,fontSize:s,whiteSpace:'nowrap',clipPath:'polygon(0 0,90% 0,100% 50%,90% 100%,0 100%)',transform:`rotate(${Math.sin((1-p)*Math.PI*2)*15}deg)`,transformOrigin:'left center',opacity:p}}>{e.txt}{e.en && <span style={{fontFamily:F.en,fontSize:s*.45,letterSpacing:2}}>{e.en}</span>}</div>;
};
