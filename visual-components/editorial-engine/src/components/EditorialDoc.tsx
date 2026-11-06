import React from 'react';
import {eio,eout,F,prog} from '../lib';

const marked=(value:any,marks:any[]=[],t:number)=>{
 let rest=String(value ?? ''),parts:React.ReactNode[]=[],key=0;
 for(const m of marks){const i=rest.indexOf(m.s);if(i<0)continue;parts.push(rest.slice(0,i));const p=eio(prog(t,m.t ?? 0,m.d ?? .9));parts.push(<span key={key++} style={{background:`linear-gradient(90deg,${m.c ?? '#f5bd78'} ${p*100}%,transparent ${p*100}%)`,fontWeight:m.b?700:undefined}}>{m.s}</span>);rest=rest.slice(i+m.s.length);}
 parts.push(rest);return parts;
};

/** Source excerpt on a clipped paper sheet. */
export const EditorialDoc:React.FC<{e:any;t:number}>=({e,t})=>{
 const w=e.w ?? 1200,p=eout(prog(t,e.t ?? 0,.7));
 return <div style={{width:w,minHeight:e.h,background:e.paper ?? '#fff4da',boxShadow:'12px 14px 0 #b35f4f,0 30px 60px rgba(0,0,0,.4)',padding:e.pad ?? '64px 80px',boxSizing:'border-box',color:'#292b2b',fontFamily:e.font==='cn'?F.heavy:F.serifsc,position:'relative',clipPath:'polygon(0 0,96% 0,100% 6%,100% 100%,0 100%)',transform:`rotate(${(1-p)*3}deg)`,opacity:p}}>
  {e.org && <div style={{display:'flex',alignItems:'center',gap:16,borderBottom:'3px solid #cb6b51',paddingBottom:16,marginBottom:26}}><div style={{width:54,height:54,borderRadius:'50%',border:'3px solid #cb6b51',display:'grid',placeItems:'center',fontFamily:F.serif,fontWeight:700,color:'#aa5549',fontSize:22}}>{e.seal ?? ''}</div><div style={{fontFamily:F.heavy,fontWeight:800,letterSpacing:2,color:'#934f43',fontSize:24}}>{e.org}</div></div>}
  {(e.lines ?? []).map((l:any,i:number)=>{
    if(l.st==='rule')return <div key={i} style={{height:2,background:'#d7bea2',margin:'18px 0'}}/>;
    if(l.st==='row')return <div key={i} style={{display:'flex',alignItems:'baseline',fontSize:l.size ?? 38,margin:'14px 0',fontFamily:F.heavy,fontWeight:l.b?900:500,opacity:l.t!=null?eout(prog(t,l.t,.4)):1,color:l.c ?? '#293b3e'}}><span>{marked(l.l,l.hls,t)}</span><span style={{flex:1,borderBottom:'2px dotted #bf9e88',margin:'0 18px'}}/><span style={{fontFamily:F.num,fontSize:(l.size ?? 38)*1.25}}>{marked(l.r,l.rhls,t)}</span></div>;
    const style:any=l.st==='h1'?{fontSize:l.size ?? 44,fontWeight:900,margin:'0 0 22px',color:'#a95849'}:l.st==='h2'?{fontSize:l.size ?? 30,fontWeight:800,margin:'26px 0 10px',color:'#a95849'}:l.st==='meta'?{fontSize:l.size ?? 22,color:'#997c69',margin:'0 0 8px'}:{fontSize:l.size ?? 31,lineHeight:1.62,margin:'0 0 16px'};
    return <div key={i} style={style}>{marked(l.txt,l.hls,t)}</div>;
  })}
 </div>;
};
