import React from 'react';
import {eout,F,prog} from '../lib';

/** A reusable coin whose symbol is supplied by the caller. */
export const EditorialCoin:React.FC<{e:any;t:number;style?:React.CSSProperties}>=({e,t,style})=>{
 const s=e.s ?? e.size ?? 60,p=eout(prog(t,e.t ?? 0,.7));
 return <div style={{width:s,height:s,borderRadius:'50%',boxSizing:'border-box',background:'#f0b678',border:`${Math.max(3,s*.07)}px solid #a9644d`,boxShadow:'0 8px 16px rgba(0,0,0,.35)',display:'grid',placeItems:'center',fontFamily:F.heavy,fontWeight:900,fontSize:s*.48,color:'#9b5648',transform:`perspective(${s*5}px) rotateY(${(1-p)*180}deg)`,...style}}><span>{e.symbol ?? '¥'}</span></div>;
};
