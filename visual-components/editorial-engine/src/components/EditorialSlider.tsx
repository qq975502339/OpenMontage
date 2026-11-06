import React from 'react';
import {eio,F,fmt,lerp,prog} from '../lib';

/** A tick-based scale whose active ticks illuminate as the pointer travels. */
export const EditorialSlider:React.FC<{e:any;t:number}>=({e,t})=>{
 const w=e.w ?? 1100,lw=e.lw ?? 330,min=Number(e.min ?? 0),max=Number(e.max ?? 100),range=max-min || 1;
 const x=(v:number)=>Math.max(0,Math.min(w,(v-min)/range*w)), p=eio(prog(t,e.mt ?? (e.t ?? 0)+.6,e.md ?? 1.6)),cur=lerp(e.a ?? min,e.b ?? max,p), count=Math.min(20,Math.max(2,Math.floor(Math.abs(range))+1));
 return <div style={{position:'relative',width:w+lw,height:230,background:e.bg ?? 'transparent',fontFamily:F.heavy}}>
  <div style={{position:'absolute',left:0,top:40,width:lw-30,textAlign:'right',fontWeight:900,fontSize:e.lsize ?? 54,color:'#fff0bf'}}>{e.label}{e.sub && <div style={{fontSize:26,color:'#d2ad8d'}}>{e.sub}</div>}</div>
  <div style={{position:'absolute',left:lw,top:0,width:w,height:230}}>
   <div style={{position:'absolute',left:0,right:0,top:132,height:4,background:'rgba(255,240,200,.25)'}} />
   {Array.from({length:count}).map((_,i)=>{const val=min+range*i/(count-1),on=val>=Math.min(e.a ?? min,cur)-.001 && val<=Math.max(e.a ?? min,cur)+.001;return <div key={i} style={{position:'absolute',left:x(val)-2,top:122,width:4,height:on?25:15,background:on?(e.c ?? '#e79162'):'#788785'}}/>;})}
   <div style={{position:'absolute',left:x(cur)-16,top:115,width:32,height:32,background:'#fff1b5',border:'5px solid #d66850',borderRadius:'50%',boxSizing:'border-box',boxShadow:'0 6px 12px rgba(0,0,0,.3)'}} />
   <div style={{position:'absolute',left:x(cur)-105,top:5,width:210,textAlign:'center',fontFamily:F.num,fontSize:82,color:'#fff1b5',whiteSpace:'nowrap'}}>{fmt(cur,e.dec ?? 0)}<span style={{fontFamily:F.heavy,fontSize:32,marginLeft:6}}>{e.unit ?? '岁'}</span></div>
   <div style={{position:'absolute',left:0,top:165,fontFamily:F.en,fontSize:22,color:'#cbb6a0'}}>{min}</div><div style={{position:'absolute',right:0,top:165,fontFamily:F.en,fontSize:22,color:'#cbb6a0'}}>{max}</div>
   {e.delta && p>=1 && <div style={{position:'absolute',left:Math.min(w-100,x(e.b ?? max)+55),top:55,background:'#d66a50',padding:'5px 16px',fontSize:32,color:'#fff2d0'}}>{e.delta}</div>}
  </div>
 </div>;
};
