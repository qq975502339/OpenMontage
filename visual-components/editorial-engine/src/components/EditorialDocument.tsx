import React from 'react';
import {eio, eout, F, lerp, prog} from '../lib';

/** An editorial document whose supplied lines are revealed in reading order. */
export const EditorialDocument: React.FC<{e:any; t:number}> = ({e,t}) => {
  const w=e.w ?? 2300, h=e.h ?? 1600, size=e.size ?? 60, lh=e.lh ?? 1.9, mx=e.mx ?? 150;
  const marks:any[]=e.marks ?? [], lines:any[]=e.lines ?? [];
  const start=e.t ?? 0, lineDelay=e.lineDelay ?? .22, lineDuration=e.lineDuration ?? .55;
  let y=e.my ?? 120, visibleIndex=0;
  return <div style={{position:'relative',width:w,height:h,overflow:'hidden',background:'radial-gradient(ellipse at center,#263e46,#0a1720 80%)'}}>
    <div style={{position:'absolute',inset:0,opacity:.19,backgroundImage:'radial-gradient(#b4c0bf 2px,transparent 2px)',backgroundSize:'38px 38px'}} />
    <div style={{position:'absolute',top:0,left:0,width:'32%',height:'15%',background:'#be504c',clipPath:'polygon(0 0,87% 0,100% 55%,0 100%)'}} />
    <div style={{position:'absolute',right:0,bottom:0,width:'32%',height:'23%',background:'#e99457',clipPath:'polygon(0 100%,100% 0,100% 100%)'}} />
    <div style={{position:'absolute',inset:`${h*.025}px ${w*.035}px`,background:'#b86750',transform:'rotate(-1deg)'}} />
    <div style={{position:'absolute',inset:`${h*.025}px ${w*.035}px`,background:'#fff5dc',boxShadow:'0 20px 65px rgba(0,0,0,.35)'}} />
    {e.logo && <div style={{position:'absolute',right:mx,top:70,fontFamily:F.heavy,fontWeight:700,fontSize:26,color:'#ac6752',letterSpacing:2,opacity:eout(prog(t,start,.35))}}>{e.logo}</div>}
    {lines.map((line,i)=>{
      const cls=line.cls ?? 'p', fs=cls==='title'?size*1.25:cls==='meta'?size*.5:size;
      const lineH=cls==='gap'?size*.6:fs*(cls==='title'?1.6:cls==='meta'?2.2:lh);
      const top=y; y+=lineH; if(cls==='gap') return null;
      const visible=eout(prog(t,start+(visibleIndex++)*lineDelay,lineDuration));
      return <div key={i} style={{position:'absolute',left:mx,right:mx,top,height:lineH,display:'flex',alignItems:'center',justifyContent:'flex-start',whiteSpace:'pre',fontFamily:cls==='meta'?F.heavy:F.serifsc,fontWeight:cls==='title'?800:cls==='meta'?400:500,fontSize:fs,color:cls==='title'?'#fff4ca':cls==='meta'?'#9d7866':'#292728',letterSpacing:cls==='title'?4:.5,background:cls==='title'?'#bd504c':'transparent',clipPath:`inset(0 ${(1-visible)*100}% 0 0)`,paddingLeft:cls==='title'?size*.4:0,boxSizing:'border-box'}}>
        {(line.segs ?? []).map((seg:any,j:number)=>{
          if(seg.m==null) return <span key={j}>{seg.s}</span>;
          const mark=marks[seg.m] ?? {}, p=prog(t,(mark.t ?? 0)+(seg.dt ?? 0),seg.d ?? mark.d ?? .45), kind=mark.kind ?? 'hl';
          if(kind==='hl') return <span key={j} style={{background:`linear-gradient(${mark.c ?? '#f4b75e'},${mark.c ?? '#f4b75e'}) no-repeat`,backgroundSize:`${eio(p)*100}% 78%`,backgroundPosition:'0 70%',padding:'0 2px'}}>{seg.s}</span>;
          if(kind==='box') return <span key={j} style={{position:'relative'}}><span style={{position:'absolute',left:-8,right:-8,top:-6,bottom:-6,border:`3px solid ${mark.c ?? '#c95e4d'}`,background:'rgba(224,130,91,.18)',opacity:eout(p),transform:`scale(${lerp(1.08,1,eout(p))})`}}/><span style={{position:'relative'}}>{seg.s}</span></span>;
          return <span key={j} style={{position:'relative'}}>{seg.s}<span style={{position:'absolute',left:0,bottom:-4,height:6,width:`${eio(p)*100}%`,background:mark.c ?? '#c95e4d'}}/></span>;
        })}
      </div>;
    })}
  </div>;
};
