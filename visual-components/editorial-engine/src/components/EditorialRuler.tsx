import React from 'react';
import {eio,eout,F,lerp,prog} from '../lib';

/** A chronological rail whose marker drops into position as the value changes. */
export const EditorialRuler:React.FC<{e:any;t:number}>=({e,t})=>{
 const a=e.from ?? 1880,b=e.to ?? 2030,range=b-a || 1,x0=150,x1=1770,y=e.y ?? 1000,x=(v:number)=>x0+(v-a)/range*(x1-x0);
 const p=eio(prog(t,(e.t ?? 0)+.15,.9)),cur=lerp(e.prev ?? e.mark,e.mark,p),q=eout(prog(t,e.t ?? 0,.55)), step=e.step ?? 5,n=Math.max(0,Math.min(300,Math.floor((b-a)/step)));
 return <div style={{position:'absolute',inset:0,width:1920,height:1080,fontFamily:F.en}}>
  <div style={{position:'absolute',left:x0,top:y-3,width:x1-x0,height:6,background:'rgba(255,239,194,.4)'}} />
  {Array.from({length:n+1}).map((_,i)=>{const value=a+i*step,big=i%10===0;return <React.Fragment key={i}><div style={{position:'absolute',left:x(value),top:y-(big?22:12),width:3,height:big?22:12,background:'#c7c2b4'}}/>{big && <div style={{position:'absolute',left:x(value)-50,top:y+12,width:100,textAlign:'center',fontSize:20,color:'#e5dcc8'}}>{value}</div>}</React.Fragment>})}
  <div style={{position:'absolute',left:x(cur)-60,top:y-86-(1-q)*100,width:120,textAlign:'center',opacity:q}}><div style={{background:'#d2b879',color:'#f4ebd4',fontFamily:F.num,fontSize:48,lineHeight:1.1,padding:'4px 8px'}}>{Math.round(cur)}</div><div style={{width:0,height:0,margin:'auto',borderLeft:'12px solid transparent',borderRight:'12px solid transparent',borderTop:'16px solid #d2b879'}}/></div>
 </div>;
};
