import React from 'react';
import {eout,F,prog} from '../lib';

/** A simple illustrated banknote; value, symbol and label are configurable. */
export const EditorialNote:React.FC<{e:any;t:number;style?:React.CSSProperties}>=({e,t,style})=>{
 const w=e.w ?? e.size ?? 160,h=w*.52,p=eout(prog(t,e.t ?? 0,.8));
 if(e.variant==='editorial') return <div style={{position:'relative',width:w,height:h,background:'#eed7af',border:`${Math.max(2,w*.018)}px solid #b66f55`,boxSizing:'border-box',transform:`skewX(${Math.sin((1-p)*Math.PI*3)*10}deg)`,opacity:p,overflow:'hidden',...style}}><div style={{position:'absolute',inset:'12%',border:'2px solid #c88d6b'}}/><div style={{position:'absolute',left:0,top:0,width:'22%',height:'100%',background:'#d97358'}}/><div style={{position:'absolute',left:'40%',top:'13%',width:'28%',height:'74%',borderRadius:'50%',background:'#fff0ca',display:'grid',placeItems:'center',fontFamily:F.heavy,fontWeight:900,fontSize:w*.2,color:'#a95f4b'}}>{e.symbol ?? '¥'}</div></div>;
 return <div style={{width:w,height:h,transform:`perspective(${w*3}px) rotateY(${(1-p)*-28}deg) translateY(${(1-p)*h*.18}px)`,opacity:p,...style}}>
  <svg viewBox="0 0 760 395" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
   <rect x="7" y="12" width="746" height="375" rx="26" fill="#782832"/>
   <rect x="7" y="5" width="746" height="370" rx="26" fill="#b83e49"/>
   <circle cx="565" cy="190" r="112" fill="#e6ada2"/>
   <circle cx="565" cy="190" r="90" fill="none" stroke="#b83e49" strokeWidth="3" opacity=".6"/>
   <text x="565" y="227" textAnchor="middle" fill="#8d2934" fontFamily={F.heavy} fontWeight="900" fontSize="110">{e.symbol ?? '¥'}</text>
   <text x="128" y="202" fill="#fae7cc" fontFamily={F.num} fontWeight="900" fontSize="118">{e.value ?? '100'}</text>
   <text x="134" y="260" fill="#f2d2bc" fontFamily={F.heavy} fontWeight="700" fontSize="28" letterSpacing="5">{e.label ?? '壹佰元'}</text>
   <path d="M133 294H274" stroke="#e7aaa0" strokeWidth="4" strokeLinecap="round"/>
  </svg>
 </div>;
};
