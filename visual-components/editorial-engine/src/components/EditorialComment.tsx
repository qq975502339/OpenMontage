import React from 'react';
import {eout,F,prog} from '../lib';

/** A comment card grows outward from the avatar before its text appears. */
export const EditorialComment:React.FC<{e:any;t:number}>=({e,t})=>{
 const w=e.w ?? 640,start=e.t ?? 0,p=eout(prog(t,start,.6)),text=eout(prog(t,start+.3,.45));
 return <div style={{width:w,background:'#fff3d6',clipPath:'polygon(0 0,96% 0,100% 16%,100% 100%,0 100%)',padding:'24px 28px',boxSizing:'border-box',boxShadow:'0 18px 40px rgba(0,0,0,.4)',display:'flex',gap:20,transform:`scaleX(${Math.max(.01,p)})`,transformOrigin:'32px center',opacity:p,fontFamily:F.heavy}}>
  <div style={{width:64,height:64,borderRadius:'50%',background:e.ac ?? '#d96b53',flexShrink:0,display:'grid',placeItems:'center',color:'#fff4d5',fontWeight:900,fontSize:30}}>{e.av ?? '友'}</div>
  <div style={{minWidth:0,opacity:text}}><div style={{fontSize:24,fontWeight:800,color:'#b25749'}}>{e.name}</div><div style={{fontSize:32,fontWeight:700,color:'#283b40',lineHeight:1.35,marginTop:4,overflowWrap:'anywhere'}}>{e.txt}</div>{e.meta && <div style={{fontSize:20,color:'#9c806c',marginTop:8}}>{e.meta}</div>}</div>
 </div>;
};
