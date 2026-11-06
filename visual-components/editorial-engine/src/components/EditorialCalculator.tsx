import React from 'react';
import {eout, F, fmt, lerp, prog} from '../lib';

/** An editorial calculation sheet, driven by supplied field and result data. */
export const EditorialCalculator: React.FC<{e:any; t:number}> = ({e,t}) => {
  const w=e.w ?? 1920,h=e.h ?? 1080,fields:any[]=e.fields ?? [],results:any[]=e.res ?? [];
  const columns=Math.min(3,Math.max(1,fields.length)), rows=Math.max(1,Math.ceil(fields.length/columns));
  const bandH=Math.min(h*.28,rows*h*.14), fieldH=bandH/rows;
  const left=w*.095, right=w*.095, fieldTop=h*.23, resultTop=fieldTop+bandH+h*.035;
  return <div style={{position:'relative',width:w,height:h,overflow:'hidden',fontFamily:F.heavy,background:'#f5f6f8',color:'#332b2a'}}>
    <div style={{position:'absolute',left,top:h*.08,right,fontSize:Math.min(64,h*.065),fontWeight:900,color:'#332b2a',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.title ?? '计算器'}</div>
    {e.sub && <div style={{position:'absolute',left,top:h*.165,fontSize:Math.min(27,h*.03),color:'#a2745d'}}>{e.sub}</div>}
    <div style={{position:'absolute',left,right,top:fieldTop,height:bandH,display:'grid',gridTemplateColumns:`repeat(${columns}, minmax(0, 1fr))`,gridTemplateRows:`repeat(${rows}, minmax(0, 1fr))`,columnGap:w*.035}}>{fields.map((f,i)=>{
      const at=f.t ?? e.t ?? 0, entry=eout(prog(t,at,.35)), text=String(f.v ?? '');
      const typed=Array.from(text).slice(0,Math.floor(prog(t,at+.12,Math.max(.4,text.length*.1))*Array.from(text).length)).join('');
      return <div key={i} style={{position:'relative',minWidth:0,opacity:.45+.55*entry,paddingTop:fieldH*.06}}>
        <div style={{fontSize:Math.min(25,fieldH*.19),fontWeight:700,color:'#92715c',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{f.l}</div>
        <div style={{display:'flex',alignItems:'baseline',marginTop:fieldH*.04,borderBottom:`${Math.max(2,h*.004)}px solid #c99c7f`,color:'#332b2a',height:fieldH*.49}}>
          <span style={{fontFamily:F.din,fontSize:Math.min(62,fieldH*.42),fontWeight:700,overflow:'hidden',whiteSpace:'nowrap'}}>{typed}</span>
          <span style={{marginLeft:'auto',fontSize:Math.min(23,fieldH*.16),color:'#9c7a66',whiteSpace:'nowrap'}}>{f.u}</span>
        </div>
        <div style={{position:'absolute',left:0,bottom:fieldH*.08,width:`${entry*100}%`,height:Math.max(3,h*.006),background:'#d86850'}} />
      </div>;
    })}</div>
    <div style={{position:'absolute',left,right,top:resultTop,bottom:h*.1,background:'#ffffff',borderTop:'2px solid rgba(122,85,67,.25)',padding:`${h*.025}px ${w*.025}px`,boxSizing:'border-box',overflow:'hidden'}}>
      <div style={{fontSize:Math.min(25,h*.032),fontWeight:800,color:'#a26753',letterSpacing:2}}>{e.rtitle ?? '测算结果'}</div>
      <div style={{display:'flex',height:'83%',gap:w*.02}}>{results.map((r,i)=>{
        const at=r.t ?? e.t ?? 0, stamp=eout(prog(t,at,.5)), count=eout(prog(t,at+.15,r.cd ?? .8));
        const text=(r.pre ?? '')+fmt(lerp(r.from ?? 0,Number(r.v) || 0,count),r.dec ?? 0,true);
        const width=(w*.81-w*.05)/Math.max(1,results.length), maxSize=Math.min(r.total?h*.18:h*.13,width*1.3/Math.max(1,text.length));
        let selected=-1; for(const [time,index] of r.lit ?? []) if(t>=time) selected=index;
        return <div key={i} style={{position:'relative',minWidth:0,flex:1,opacity:stamp,transform:`scale(${1.18-.18*stamp}) rotate(${(1-stamp)*-4}deg)`,transformOrigin:'left center',background:selected===0?'rgba(239,174,98,.15)':'transparent'}}>
          <div style={{fontSize:Math.min(26,h*.033),fontWeight:800,color:'#443734',paddingTop:h*.018,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.l} {r.f && <span style={{fontFamily:F.din,color:'#a67b65',fontWeight:400}}>{r.f}</span>}</div>
          <div style={{fontFamily:F.num,fontSize:maxSize,lineHeight:1.05,color:'#c65f4e',whiteSpace:'nowrap',overflow:'hidden'}}>{text}<span style={{fontFamily:F.heavy,fontWeight:700,fontSize:Math.min(23,h*.03),color:'#967563',marginLeft:8}}>{r.u ?? '元/月'}</span></div>
        </div>;
      })}</div>
    </div>
  </div>;
};
