import React from 'react';
import {Img} from 'remotion';
import {eio, eout, F, fmt, img, lerp, prog} from '../lib';

const CardIcon: React.FC<{kind?:string;src?:string}> = ({kind,src}) => {
  if(kind==='money') return <svg viewBox="0 0 120 120" width="100%" height="100%"><circle cx="60" cy="60" r="45" fill="#e99a5f" stroke="#a7634f" strokeWidth="5"/><circle cx="60" cy="60" r="34" fill="#ffe4a4"/><text x="60" y="81" textAnchor="middle" fontSize="62" fontWeight="900" fill="#a55f4d">¥</text></svg>;
  if(kind==='knowledge') return <svg viewBox="0 0 120 120" width="100%" height="100%"><path d="M60 30Q40 16 12 26v64q28-10 48 5 20-15 48-5V26Q80 16 60 30Z" fill="#fff1bd" stroke="#a55f4d" strokeWidth="5" strokeLinejoin="round"/><path d="M60 30v65M22 40q17-5 28 2M22 53q17-5 28 2M70 42q12-7 28-2M70 55q12-7 28-2" fill="none" stroke="#df7958" strokeWidth="4" strokeLinecap="round"/></svg>;
  const path=src && (src.includes('/') || /\.[a-z0-9]+$/i.test(src) ? src : `icons/${src}.png`);
  return path ? <Img src={img(path)} style={{width:'100%',height:'100%',objectFit:'contain'}} /> : null;
};

/** Generic information card with a hand-drawn perimeter reveal. */
export const EditorialInfoCard: React.FC<{e:any;t:number;v?:any}> = ({e,t,v}) => {
  const w=e.w ?? 560,h=e.h ?? 400,start=e.t ?? 0;
  const outline=eout(prog(t,start,.95)), content=eout(prog(t,start+.25,.55));
  const colors:any={navy:'#fff3d6',cream:'#fff7e5',red:'#f9e6df',blue:'#eaf1f1',teal:'#e9f3eb',dark:'#efede7'};
  let value=e.value;
  if(e.count){const [a,b,dec]=e.count; value=fmt(lerp(a,b,eio(prog(t,e.ct ?? start+.25,e.cd ?? 1.1))),dec ?? 0,e.sep);}
  const valueText=value == null?'':String(value), valueSize=Math.min(e.vsize ?? h*.3,w*.7/Math.max(1,Array.from(valueText).length)*1.6);
  const labelSize=Math.min(e.lsize ?? h*.095,w*.68/Math.max(1,Array.from(String(e.label ?? '')).length)*1.3);
  const highlighted=v?.litv ?? 0;
  return <div style={{position:'relative',width:w,height:h,filter:`drop-shadow(0 ${h*.035}px ${h*.045}px rgba(0,0,0,.4))`}}>
    <div style={{position:'absolute',inset:0,background:e.bg ?? colors[e.theme ?? 'navy'] ?? colors.navy,clipPath:'polygon(0 0,93% 0,100% 10%,100% 100%,0 100%)',opacity:.93+.07*outline}} />
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{position:'absolute',inset:0,pointerEvents:'none'}}><path d={`M3 3 H${w*.93} L${w-3} ${h*.1} V${h-3} H3 Z`} pathLength="1" fill="none" stroke="#c55d4e" strokeWidth={Math.max(4,w*.006)} strokeDasharray="1" strokeDashoffset={1-outline}/></svg>
    <div style={{position:'absolute',left:0,top:h*.1,width:w*.012,height:h*.35,background:'#dc7255',opacity:content}} />
    {e.tag && <div style={{position:'absolute',left:w*.065,top:h*.065,padding:`${h*.015}px ${w*.025}px`,background:'#c85a4d',color:'#fff3d6',fontFamily:F.heavy,fontWeight:800,fontSize:e.tagsize ?? h*.06,opacity:content}}>{e.tag}</div>}
    {(e.icon || e.iconKind) && <div style={{position:'absolute',right:w*.07,top:h*.1,width:Math.min(w*.2,e.iconh ?? h*.27),height:Math.min(w*.2,e.iconh ?? h*.27),opacity:content,filter:'drop-shadow(0 7px 9px rgba(0,0,0,.18))'}}><CardIcon kind={e.iconKind} src={e.icon}/></div>}
    {e.label && <div style={{position:'absolute',left:w*.07,right:w*.29,top:h*(e.tag?.19:.11),fontFamily:F.heavy,fontWeight:800,fontSize:labelSize,lineHeight:1.15,color:'#55463a',opacity:content,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.label}</div>}
    {value != null && <div style={{position:'absolute',left:w*.07,right:w*.07,top:h*.37,display:'flex',alignItems:'baseline',gap:w*.012,opacity:content,color:e.valueColor ?? '#263d41',whiteSpace:'nowrap'}}>
      {e.pre && <span style={{fontFamily:F.heavy,fontWeight:800,fontSize:valueSize*.4}}>{e.pre}</span>}
      <span style={{fontFamily:F.num,fontWeight:700,fontSize:valueSize,lineHeight:1,color:e.valueColor ?? '#263d41',textShadow:highlighted?'0 0 18px rgba(214,111,75,.35)':undefined}}>{valueText}</span>
      {e.unit && <span style={{fontFamily:F.heavy,fontWeight:800,fontSize:valueSize*(e.usize ?? .32)}}>{e.unit}</span>}
    </div>}
    {e.sub && <div style={{position:'absolute',left:w*.07,right:w*.07,bottom:h*.14,fontFamily:F.heavy,fontWeight:800,fontSize:Math.min(e.subsize ?? h*.075,h*.09),color:'#aa5d4a',opacity:content,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.sub}</div>}
    {e.en && <div style={{position:'absolute',left:w*.07,right:w*.07,bottom:h*.065,fontFamily:F.en,fontWeight:700,fontSize:Math.min(e.ensize ?? h*.04,h*.055),letterSpacing:2,color:'#9a8070',opacity:content,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.en}</div>}
  </div>;
};
