import React from 'react';
import {Img} from 'remotion';
import {clamp,eout,img,prog} from '../lib';

/** Fractional people diagram: tokens unfold upwards and may be individually dimmed. */
export const EditorialPeople:React.FC<{e:any;t:number}>=({e,t})=>{
 const n=Math.max(0,Number(e.n)||0),cnt=Math.ceil(n-1e-6),size=e.size ?? 150,gap=e.gap ?? 10,ar=e.ar ?? .62,src=String(e.src ?? ''),path=src && (src.includes('/')?src:`icons/${src}.png`);
 return <div style={{display:'flex',alignItems:'flex-end',gap}}>{Array.from({length:cnt}).map((_,i)=>{
  const fraction=Math.min(1,n-i),p=eout(prog(t,(e.t ?? 0)+i*(e.stag ?? .08),.45)),lit=e.litn==null || t<(e.lt ?? 0) || i<e.litn;
  return <div key={i} style={{width:size*ar*fraction,height:size,overflow:'hidden',opacity:clamp(p*2),transform:`scaleY(${p})`,transformOrigin:'bottom',filter:lit?'none':'grayscale(1) brightness(.4)'}}>
   {e.iconKind==='person' || !path?<svg width={size*ar} height={size} viewBox="0 0 100 160"><path d="M29 48 Q25 17 50 15 Q76 17 71 49Z" fill="#344b50"/><ellipse cx="50" cy="38" rx="20" ry="24" fill="#f2c9a3"/><path d="M30 35 Q33 10 54 14 Q72 15 71 35 Q57 25 42 27Z" fill="#344b50"/><path d="M30 67 Q50 53 70 67 L82 104 Q80 111 73 111 L67 91 L66 151 H53 L50 111 L47 151 H34 L33 91 L27 111 Q20 111 18 104Z" fill="#699596" stroke="#344b50" strokeWidth="3" strokeLinejoin="round"/><path d="M41 60 L50 72 L59 60" fill="#fff3df" stroke="#344b50" strokeWidth="2"/></svg>:<Img src={img(path)} style={{height:size,objectFit:'contain'}}/>}
  </div>;
 })}</div>;
};
