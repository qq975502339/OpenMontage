import React from 'react';
import {Img} from 'remotion';
import {eout,img,prog} from '../lib';

/** Supplied cutout rises into a soft floating pose. */
export const EditorialToon:React.FC<{e:any;t:number}>=({e,t})=>{
 const size=e.size ?? 520,p=eout(prog(t,e.t ?? 0,.8)),src=String(e.src ?? ''),path=src.includes('/')?src:`toon/${src}.png`;
 return <div style={{position:'relative',height:size,opacity:p,transform:`translateY(${(1-p)*size*.12+Math.sin(t*2)*Math.min(8,e.wig ?? 2)}px)`}}>
  <div style={{position:'absolute',left:'10%',right:'10%',bottom:0,height:size*.08,borderRadius:'50%',background:'rgba(0,0,0,.25)',filter:'blur(12px)'}} />
  {e.iconKind==='editorialPerson'?<svg height={size} viewBox="0 0 300 560" style={{position:'relative',filter:'drop-shadow(0 18px 22px rgba(0,0,0,.35))'}}><path d="M82 180 Q55 45 150 45 Q245 45 218 180Z" fill="#293f45"/><ellipse cx="150" cy="130" rx="70" ry="80" fill="#f2c9a3"/><path d="M82 120 Q78 30 154 40 Q221 40 220 120 Q170 86 123 91Z" fill="#293f45"/><circle cx="125" cy="133" r="5" fill="#293f45"/><circle cx="178" cy="133" r="5" fill="#293f45"/><path d="M133 158 Q150 170 168 158" fill="none" stroke="#a96e60" strokeWidth="4" strokeLinecap="round"/><path d="M85 235 Q150 200 215 235 L250 360 Q244 385 225 380 L205 313 L200 530 H160 L150 380 L140 530 H100 L95 313 L75 380 Q55 385 50 360Z" fill="#6f9998" stroke="#293f45" strokeWidth="7" strokeLinejoin="round"/><path d="M115 213 L150 260 L185 213" fill="#fff2dd" stroke="#293f45" strokeWidth="5"/></svg>:<Img src={img(path)} style={{height:size,position:'relative',objectFit:'contain',filter:'drop-shadow(0 18px 22px rgba(0,0,0,.35))'}}/>}
 </div>;
};
