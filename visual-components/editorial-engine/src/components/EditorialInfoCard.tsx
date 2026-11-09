import React from 'react';
import {Img} from 'remotion';
import {eio, eout, F, fmt, img, lerp, prog} from '../lib';

const CardIcon: React.FC<{kind?:string;src?:string}> = ({kind,src}) => {
  if(kind==='money') return <svg viewBox="0 0 120 120" width="100%" height="100%"><circle cx="60" cy="60" r="45" fill="#e99a5f" stroke="#a7634f" strokeWidth="5"/><circle cx="60" cy="60" r="34" fill="#ffe4a4"/><text x="60" y="81" textAnchor="middle" fontSize="62" fontWeight="900" fill="#a55f4d">¥</text></svg>;
  if(kind==='knowledge') return <svg viewBox="0 0 120 120" width="100%" height="100%"><path d="M60 30Q40 16 12 26v64q28-10 48 5 20-15 48-5V26Q80 16 60 30Z" fill="#fff1bd" stroke="#a55f4d" strokeWidth="5" strokeLinejoin="round"/><path d="M60 30v65M22 40q17-5 28 2M22 53q17-5 28 2M70 42q12-7 28-2M70 55q12-7 28-2" fill="none" stroke="#df7958" strokeWidth="4" strokeLinecap="round"/></svg>;
  const path=src && (src.includes('/') || /\.[a-z0-9]+$/i.test(src) ? src : `icons/${src}.png`);
  return path ? <Img src={img(path)} style={{width:'100%',height:'100%',objectFit:'contain'}} /> : null;
};

/** Information card with the approved Wall Street direction; content remains data driven. */
export const EditorialInfoCard: React.FC<{e:any;t:number;v?:any}> = ({e,t,v}) => {
  const w=e.w ?? 560,h=e.h ?? 400,start=e.t ?? 0;
  const entrance=eout(prog(t,start,.65)), content=eout(prog(t,start+.28,.55));
  const colors:any={navy:['#36495c','#0e1823'],cream:['#49463d','#191d24'],red:['#594047','#211a22'],blue:['#36495c','#0e1823'],teal:['#344b4d','#112121'],dark:['#36393f','#0b0b0d']};
  const palette=colors[e.theme ?? 'navy'] ?? colors.navy;
  let value=e.value;
  if(e.count){const [a,b,dec]=e.count; value=fmt(lerp(a,b,eio(prog(t,e.ct ?? start+.25,e.cd ?? 1.1))),dec ?? 0,e.sep);}
  const valueText=value == null?'':String(value), valueSize=Math.min(e.vsize ?? h*.27,w*.62/Math.max(1,Array.from(valueText).length)*1.5);
  const labelSize=Math.min(e.lsize ?? h*.075,w*.68/Math.max(1,Array.from(String(e.label ?? '')).length)*1.3);
  const highlighted=v?.litv ?? 0;
  return <div style={{position:'relative',width:w,height:h,opacity:entrance,transform:`translateY(${(1-entrance)*38}px)`,fontFamily:F.heavy}}>
    <div style={{position:'absolute',inset:0,border:'2px solid rgba(222,205,158,.48)',borderRadius:6,background:e.bg ?? `linear-gradient(125deg,${palette[0]},${palette[1]})`,boxShadow:`0 20px 50px rgba(0,0,0,.5), inset 0 1px rgba(255,255,255,.15)${highlighted?', 0 0 22px rgba(230,205,142,.32)':''}`}} />
    {e.tag && <div style={{position:'absolute',left:w*.07,top:h*.04,color:'#c8b88b',fontWeight:800,fontSize:e.tagsize ?? h*.05,opacity:content}}>{e.tag}</div>}
    {(e.icon || e.iconKind) && <div style={{position:'absolute',right:w*.07,top:h*.1,width:Math.min(w*.15,e.iconh ?? h*.14),height:Math.min(w*.15,e.iconh ?? h*.14),border:'1px solid #c4ad77',borderRadius:'50%',background:'rgba(248,236,194,.1)',display:'flex',alignItems:'center',justifyContent:'center',opacity:content}}><div style={{width:'72%',height:'72%'}}><CardIcon kind={e.iconKind} src={e.icon}/></div></div>}
    {e.label && <div style={{position:'absolute',left:w*.07,right:w*.27,top:h*(e.tag?.17:.1),fontWeight:700,fontSize:labelSize,lineHeight:1.15,color:'#e5dcc3',letterSpacing:2,opacity:content,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.label}</div>}
    <div style={{position:'absolute',left:w*.07,right:w*.07,top:h*(e.tag?.34:.29),height:2,background:'linear-gradient(90deg,#d6c28f,rgba(214,194,143,.04))',opacity:content}} />
    {value != null && <div style={{position:'absolute',left:w*.07,right:w*.07,top:h*.37,display:'flex',alignItems:'baseline',gap:w*.018,opacity:content,color:e.valueColor ?? '#f3df9b',whiteSpace:'nowrap'}}>
      {e.pre && <span style={{fontFamily:F.heavy,fontWeight:800,fontSize:valueSize*.4}}>{e.pre}</span>}
      <span style={{fontFamily:F.num,fontWeight:800,fontSize:valueSize,lineHeight:1,color:e.valueColor ?? 'transparent',background:e.valueColor?undefined:'linear-gradient(180deg,#fffbe7,#f3dfa1 68%,#c6a267)',WebkitBackgroundClip:e.valueColor?undefined:'text'}}>{valueText}</span>
      {e.unit && <span style={{fontWeight:800,fontSize:valueSize*(e.usize ?? .31)}}>{e.unit}</span>}
    </div>}
    {e.sub && <div style={{position:'absolute',left:w*.07,right:e.en?w*.34:w*.07,bottom:h*.12,fontWeight:700,fontSize:Math.min(e.subsize ?? h*.075,h*.09),color:'#d7d4c7',opacity:content,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.sub}</div>}
    {e.en && <div style={{position:'absolute',right:w*.07,bottom:h*.12,maxWidth:w*.25,textAlign:'right',fontFamily:F.en,fontWeight:700,fontSize:Math.min(e.ensize ?? h*.04,h*.055),letterSpacing:2,color:'#acaa9f',opacity:content,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.en}</div>}
  </div>;
};
