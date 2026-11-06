import React from 'react';
import {Img} from 'remotion';
import {img} from '../lib';
import {FlagSvg} from '../els';

/** Country flag or custom image in an editorial frame, with a subtle waving motion. */
export const EditorialFlag:React.FC<{e:any;t:number}>=({e,t})=>{
 const size=e.size ?? 120,rect=e.shape==='rect',width=rect?size*1.5:size,wiggle=Math.sin((t-(e.t ?? 0))*2.2)*2.5;
 return <div style={{width,height:size,overflow:'hidden',borderRadius:rect?4:'50%',border:`${Math.max(3,size*.05)}px solid #fff1ce`,boxShadow:'0 10px 20px rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',background:'#fff1ce',transform:`skewY(${wiggle}deg)`}}>{e.src?<Img src={img(e.src)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<FlagSvg c={e.c} w={rect?width:size*1.55}/>}</div>;
};
