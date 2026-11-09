import React from 'react';
import {Img} from 'remotion';
import {eout,F,img,prog} from '../lib';

/** Photo mat opens through alternating shutter strips; caption and credit remain data-driven. */
export const EditorialPhoto:React.FC<{e:any;t:number}>=({e,t})=>{
 const w=e.w ?? 420,h=e.h ?? 560,start=e.t ?? 0;
 return <div style={{background:'#223146',padding:'16px 16px 18px',boxShadow:'0 28px 60px rgba(0,0,0,.48)',clipPath:'polygon(0 0,93% 0,100% 6%,100% 100%,0 100%)',position:'relative'}}>
  <div style={{position:'relative',width:w,height:h,overflow:'hidden'}}><Img src={img(e.src)} style={{width:w,height:h,objectFit:'cover',objectPosition:e.pos ?? '50% 25%',display:'block',filter:e.bw?'grayscale(1) contrast(1.08)':undefined}}/>
   {[0,1,2].map(i=>{const p=eout(prog(t,start+i*.12,.65));return <div key={i} style={{position:'absolute',left:i%2?`${p*100}%`:0,right:i%2?0:`${p*100}%`,top:`${i*100/3}%`,height:'34%',background:'#56677a'}}/>;})}
  </div>
  {e.cap && <div style={{fontFamily:F.heavy,fontWeight:900,fontSize:40,color:'#f2e6c7',textAlign:'left',marginTop:12}}>{e.cap}</div>}
  {e.en && <div style={{fontFamily:F.en,fontWeight:700,fontSize:18,letterSpacing:2,color:'#c9b88e'}}>{e.en}</div>}
  {e.credit && <div style={{fontFamily:F.heavy,fontWeight:500,fontSize:e.cs ?? 15,color:'#b0b2b1',textAlign:'right',marginTop:8}}>{e.credit}</div>}
 </div>;
};
