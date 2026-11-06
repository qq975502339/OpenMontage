import React from 'react';
import {eout,F,prog} from '../lib';

/** A typographic reveal framed by moving editorial quotation marks. */
export const EditorialMeme:React.FC<{e:any;t:number}>=({e,t})=>{
 const size=e.size ?? 150,start=e.t ?? 0;
 const reveal=eout(prog(t,start,.7)),mark=eout(prog(t,start+.22,.65));
 return <div style={{position:'relative',display:'inline-flex',alignItems:'center',padding:`${size*.34}px ${size*.32}px`,whiteSpace:'nowrap',transform:`rotate(${e.tilt ?? -2}deg)`}}>
  <div style={{position:'absolute',left:0,top:size*.07,fontFamily:'Georgia, serif',fontSize:size*.9,lineHeight:1,fontWeight:900,color:'#e27a5c',opacity:mark,transform:`translate(${(1-mark)*-size*.35}px,${(1-mark)*size*.18}px)`}}>“</div>
  <div style={{overflow:'hidden',padding:`${size*.08}px ${size*.06}px ${size*.13}px`}}>
   <div style={{fontFamily:F.heavy,fontWeight:900,fontSize:size,lineHeight:1.2,letterSpacing:size*.025,color:e.c ?? '#fff0cf',textShadow:`${size*.035}px ${size*.04}px 0 #a85344`,transform:`translateY(${(1-reveal)*110}%)`,opacity:Math.min(1,reveal*3)}}>{e.txt}</div>
  </div>
  <div style={{position:'absolute',right:0,bottom:-size*.13,fontFamily:'Georgia, serif',fontSize:size*.9,lineHeight:1,fontWeight:900,color:'#e27a5c',opacity:mark,transform:`translate(${(1-mark)*size*.35}px,${(1-mark)*-size*.18}px)`}}>”</div>
  {e.burst && <div style={{position:'absolute',right:size*.06,top:size*.22,width:size*.11,height:size*.11,borderRadius:'50%',background:'#e9be78',transform:`scale(${mark})`}}/>}
 </div>;
};
