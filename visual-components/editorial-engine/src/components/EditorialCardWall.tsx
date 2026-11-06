import React from 'react';
import {Img} from 'remotion';
import {clamp, eout, F, img, lerp, prog} from '../lib';

const EditorialIcon: React.FC<{kind?:string; src?:string}> = ({kind,src}) => {
  if (kind==='weather') return <svg viewBox="0 0 120 120" width="100%" height="100%"><circle cx="67" cy="43" r="24" fill="#f3ac5d"/><path d="M67 9v8m30 10-6 5M36 26l6 6m61 14h-8" stroke="#e57c58" strokeWidth="5" strokeLinecap="round"/><g fill="#fff1bd" stroke="#b96750" strokeWidth="4"><path d="M27 83a19 19 0 0 1 5-37 26 26 0 0 1 48 10 16 16 0 0 1 2 27z"/></g></svg>;
  if (kind==='shipping') return <svg viewBox="0 0 120 120" width="100%" height="100%"><path d="M10 34h65v49H10z" fill="#f4bd78" stroke="#a55f4d" strokeWidth="4"/><path d="M75 48h21l14 17v18H75z" fill="#e67458" stroke="#a55f4d" strokeWidth="4"/><path d="M80 53h13l9 12H80z" fill="#fff0bc"/><circle cx="31" cy="86" r="11" fill="#253943" stroke="#e8c899" strokeWidth="5"/><circle cx="91" cy="86" r="11" fill="#253943" stroke="#e8c899" strokeWidth="5"/><path d="M22 47h39M22 58h30" stroke="#fff2c9" strokeWidth="5" strokeLinecap="round"/></svg>;
  if (kind==='trend') return <svg viewBox="0 0 120 120" width="100%" height="100%"><circle cx="60" cy="59" r="48" fill="#e9975c" stroke="#a55f4d" strokeWidth="5"/><circle cx="60" cy="59" r="37" fill="#ffe1a0" stroke="#c47d5a" strokeWidth="3"/><path d="M34 76l18-16 13 8 22-27M73 41h14v14" fill="none" stroke="#be514a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind==='money') return <svg viewBox="0 0 120 120" width="100%" height="100%"><circle cx="60" cy="60" r="47" fill="#e9975c" stroke="#a55f4d" strokeWidth="5"/><circle cx="60" cy="60" r="36" fill="#ffe1a0" stroke="#c47d5a" strokeWidth="3"/><text x="60" y="80" textAnchor="middle" fontSize="64" fontWeight="900" fill="#a55f4d">¥</text></svg>;
  if (kind==='knowledge') return <svg viewBox="0 0 120 120" width="100%" height="100%"><path d="M60 30Q40 16 12 26v64q28-10 48 5 20-15 48-5V26Q80 16 60 30Z" fill="#fff1bd" stroke="#a55f4d" strokeWidth="5" strokeLinejoin="round"/><path d="M60 30v65M22 40q17-5 28 2M22 53q17-5 28 2M70 42q12-7 28-2M70 55q12-7 28-2" fill="none" stroke="#df7958" strokeWidth="4" strokeLinecap="round"/></svg>;
  if (kind==='health') return <svg viewBox="0 0 120 120" width="100%" height="100%"><path d="M60 99 17 58C-3 36 26 12 45 29l15 14 15-14c19-17 48 7 28 29Z" fill="#e97960" stroke="#a55f4d" strokeWidth="5" strokeLinejoin="round"/><path d="M23 62h19l8-15 11 30 9-17h25" fill="none" stroke="#fff1bd" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return src ? <Img src={img(src)} style={{width:'100%',height:'100%',objectFit:'contain'}} /> : null;
};

/** Editorial card wall, retaining the wall element's grid and focus timeline. */
export const EditorialCardWall: React.FC<{e: any; t: number}> = ({e,t}) => {
  const cw=e.cw ?? 760, ch=e.ch ?? 420, gap=e.gap ?? 56, cols=Math.max(1,e.cols ?? 2);
  const cards: any[]=e.cards ?? [], rows=Math.ceil(cards.length/cols);
  const width=cols*cw+(cols-1)*gap, height=rows*ch+Math.max(0,rows-1)*gap;
  let current=-1, previous=-1, changed=-1e9;
  for (const [at,index] of e.focus ?? []) if (t>=at) {previous=current; current=index; changed=at;}
  const transition=eout(prog(t,changed,.35));
  return <div style={{position:'relative',width,height}}>{cards.map((card,i)=>{
    const [x,y]=card.pos ?? [(i%cols)*(cw+gap),Math.floor(i/cols)*(ch+gap)];
    const w=card.w ?? cw, h=card.h ?? ch;
    const entry=eout(prog(t,(e.t ?? 0)+(card.dt ?? i*.14),.8));
    const visible=(index:number)=>index<0 || index===i ? 1 : 0;
    const focus=lerp(visible(previous),visible(current),transition);
    const text=String(card.w2 ?? card.word ?? '');
    const direction=i%3, dx=direction===0?-(1920+w):direction===2?(1920+w):0, dy=direction===1?-(1080+h):0;
    return <div key={i} style={{position:'absolute',left:x,top:y,width:w,height:h,opacity:entry*(.52+.48*focus),transform:`translate(${(1-entry)*dx}px,${(1-entry)*dy-focus*h*.035}px) scale(${.96+.04*focus})`,filter:`drop-shadow(0 ${h*.035}px ${h*.045}px rgba(0,0,0,.42))`}}>
      <div style={{position:'absolute',inset:0,filter:`grayscale(${1-focus}) brightness(${.68+.32*focus})`,clipPath:'polygon(0 0,90% 0,100% 11%,100% 100%,0 100%)',background:card.bg ?? 'linear-gradient(150deg,#263e47,#111f28 72%,#101920)',borderBottom:`${Math.max(3,h*.012)}px solid #e99a5e`,boxSizing:'border-box',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,opacity:.18,backgroundImage:'radial-gradient(#b6b4a7 2px,transparent 2px)',backgroundSize:'28px 28px'}} />
        <div style={{position:'absolute',inset:0,opacity:focus,background:'linear-gradient(145deg,#fff3c8,#efbc7d 72%,#e8955d)'}} />
        <div style={{position:'absolute',left:0,top:0,width:'65%',height:'15%',background:'#c6534e',clipPath:'polygon(0 0,90% 0,100% 60%,0 100%)'}} />
        {card.badge != null && <div style={{position:'absolute',right:w*.07,top:h*.06,fontFamily:F.num,fontSize:h*.105,color:focus>.5?'#684735':'#f0b877',opacity:.9}}>{card.badge}</div>}
        <div style={{position:'absolute',left:w*.07,right:w*.06,top:h*(card.ty ?? .23),fontFamily:F.ys,fontWeight:900,fontSize:card.size ?? h*.25,lineHeight:1.05,whiteSpace:'pre-wrap',color:'#fff0b1',textShadow:'0 5px #876447, 0 10px 14px rgba(0,0,0,.35)'}}>{text}</div>
        <div style={{position:'absolute',left:w*.07,right:w*.06,top:h*(card.ty ?? .23),fontFamily:F.ys,fontWeight:900,fontSize:card.size ?? h*.25,lineHeight:1.05,whiteSpace:'pre-wrap',color:'#382d29',opacity:focus,textShadow:'0 3px rgba(255,255,255,.2)'}}>{text}</div>
        {card.en && <div style={{position:'absolute',left:w*.075,top:h*(card.ty ?? .23)+(card.size ?? h*.25)*1.18*text.split('\n').length,fontFamily:F.en,fontWeight:700,fontSize:card.es ?? Math.max(18,h*.045),letterSpacing:2,color:focus>.5?'#654b3c':'#e7ba8b'}}>{card.en}</div>}
        {card.sub && <div style={{position:'absolute',left:w*.06,bottom:h*.075,maxWidth:w*.62,padding:`${h*.025}px ${w*.035}px`,background:'#da6955',clipPath:'polygon(3% 0,100% 0,97% 100%,0 100%)',fontFamily:F.heavy,fontWeight:800,fontSize:card.ss ?? h*.07,lineHeight:1.15,color:'#fff2d5',overflowWrap:'anywhere'}}>{card.sub}</div>}
        {(card.icon || card.iconKind) && <div style={{position:'absolute',right:w*.045,bottom:h*(card.iy ?? .1),height:h*(card.ih ?? .33),width:w*.32,transform:`rotate(${card.irot ?? 6}deg)`,filter:'drop-shadow(0 8px 12px rgba(0,0,0,.4))'}}><EditorialIcon kind={card.iconKind} src={card.icon} /></div>}
      </div>
    </div>;
  })}</div>;
};
