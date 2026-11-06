import React from 'react';
import {Img} from 'remotion';
import {eout,F,img,prog} from '../lib';

/** Data-driven pillar with a layered-panel arrival. */
export const EditorialPillar:React.FC<{e:any;t:number;v?:any}>=({e,t})=>{
 const w=e.w ?? 320,h=e.h ?? 560,state=e.state ?? 'solid',p=eout(prog(t,e.t ?? 0,.8)),inner=state==='thin'?w*.4:w*.75,path=e.icon && (e.icon.includes('/')?e.icon:`icons/${e.icon}.png`);
 return <div style={{position:'relative',width:w,height:h,fontFamily:F.heavy}}>
  <div style={{position:'absolute',left:(w-inner)/2,top:45,width:inner,height:h-90,background:state==='scaffold'?'repeating-linear-gradient(45deg,transparent 0 20px,#e1a472 21px 25px,transparent 26px 46px)':'linear-gradient(90deg,#e3b17f,#fff0c6 45%,#d68c64)',border:'3px solid #c08060',boxSizing:'border-box',transform:`translateY(${(1-p)*h*.18}px)`,opacity:p}}/>
  <div style={{position:'absolute',left:0,top:0,width:w,height:48,background:'#d56d51',clipPath:'polygon(0 0,92% 0,100% 30%,100% 100%,0 100%)'}}/>
  <div style={{position:'absolute',left:0,bottom:0,width:w,height:48,background:'#d56d51'}}/>
  {e.n!=null && <div style={{position:'absolute',left:'50%',top:65,transform:'translateX(-50%)',width:72,height:72,borderRadius:'50%',background:'#263e44',display:'grid',placeItems:'center',fontFamily:F.num,fontSize:48,color:'#fff1bd'}}>{e.n}</div>}
  {path && <Img src={img(path)} style={{position:'absolute',left:'50%',top:h*.28,height:h*.25,transform:'translateX(-50%)',objectFit:'contain'}}/>}
  <div style={{position:'absolute',left:-40,right:-40,top:h*.64,textAlign:'center'}}><div style={{display:'inline-block',background:'#263e44',padding:'10px 20px',color:'#fff1bd'}}><div style={{fontSize:44,fontWeight:900,whiteSpace:'nowrap'}}>{e.title}</div>{e.sub && <div style={{fontSize:28,color:'#eac4a1'}}>{e.sub}</div>}</div></div>
 </div>;
};
