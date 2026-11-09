import React from 'react';
import {Img} from 'remotion';
import {clamp, eout, F, img, lerp, prog} from '../lib';

const FormulaIcon: React.FC<{kind?:string;src?:string}> = ({kind,src}) => {
  if(kind==='money') return <svg viewBox="0 0 120 120" width="100%" height="100%"><circle cx="60" cy="60" r="46" fill="#e99a5f" stroke="#ab6750" strokeWidth="5"/><circle cx="60" cy="60" r="35" fill="#ffe6a8"/><text x="60" y="82" textAnchor="middle" fontSize="65" fontWeight="900" fill="#a55f4d">¥</text></svg>;
  if(kind==='bean') return <svg viewBox="0 0 120 120" width="100%" height="100%"><ellipse cx="60" cy="60" rx="35" ry="48" transform="rotate(30 60 60)" fill="#d88457" stroke="#a75a4a" strokeWidth="5"/><path d="M79 22C52 40 76 66 41 98" fill="none" stroke="#ffe3ae" strokeWidth="7" strokeLinecap="round"/></svg>;
  if(kind==='building') return <svg viewBox="0 0 120 120" width="100%" height="100%"><path d="M20 105V25h80v80Z" fill="#f6d494" stroke="#ae6850" strokeWidth="5"/><path d="M13 25h94L98 10H22Z" fill="#d86050"/><path d="M31 40h18v18H31zm40 0h18v18H71zM31 69h18v18H31zm40 0h18v18H71z" fill="#7b9b98"/><path d="M8 106h104" stroke="#e8be86" strokeWidth="7" strokeLinecap="round"/></svg>;
  return src ? <Img src={img(src)} style={{width:'100%',height:'100%',objectFit:'contain'}} /> : null;
};

/** Formula tokens flip down independently at their supplied times. */
export const EditorialFormula: React.FC<{e:any; t:number}> = ({e,t}) => {
  const toks:any[]=e.toks ?? [], w=e.pw ?? 1300, h=e.ph ?? 820, start=e.t ?? 0;
  const margin=w*.055, gap=e.gap ?? 12, units=toks.reduce((sum,k)=>sum+(k.op?.55:1),0) || 1;
  const unit=Math.max(1,(w-margin*2-Math.max(0,toks.length-1)*gap)/units);
  let cur=-1,prev=-1,at=-1e9;
  for(const [time,index] of e.hl ?? []) if(t>=time){prev=cur;cur=index;at=time;}
  const focus=eout(prog(t,at,.35));
  return <div style={{position:'relative',width:w,height:h,overflow:'hidden',background:e.pbg ?? 'radial-gradient(ellipse at 50% 45%,#2e3a55,#0b1019 78%)',boxShadow:'0 30px 70px rgba(0,0,0,.45)'}}>
    <div style={{position:'absolute',inset:0,opacity:.2,backgroundImage:'radial-gradient(#99a7bb 2px,transparent 2px)',backgroundSize:'32px 32px'}} />
    {e.title && <div style={{position:'absolute',left:margin,top:h*.055,right:margin,fontFamily:F.heavy,fontWeight:900,fontSize:Math.min(e.ts ?? 64,h*.085),color:'#f7edce',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.title}</div>}
    {e.en && <div style={{position:'absolute',left:margin,top:h*.16,fontFamily:F.en,fontWeight:700,fontSize:Math.min(21,h*.027),letterSpacing:3,color:'#cfc5b0'}}>{e.en}</div>}
    <div style={{position:'absolute',left:margin,right:margin,top:e.sy ?? h*.26,display:'flex',gap,perspective:`${w}px`,alignItems:'flex-start'}}>
      {toks.map((k,i)=>{
        const cw=unit*(k.op?.55:1), entry=eout(prog(t,k.t ?? start+i*.18,.55));
        const hi=lerp(prev===i?1:0,cur===i?1:0,focus);
        const opacity=cur>=0 && !k.op && e.dimOthers!==false ? .46+.54*hi : 1;
        const size=Math.min((e.fs ?? 128)*(k.fs ?? 1)*(k.op?.72:1),cw*.86/Math.max(1,Array.from(String(k.s ?? '')).length)*1.25);
        const strike=(e.strike ?? []).find((s:any)=>s[1]===i), crossed=strike?eout(prog(t,strike[0],.35)):0;
        return <div key={i} style={{width:cw,flex:`0 0 ${cw}px`,opacity:entry*opacity,transform:`rotateX(${(1-entry)*-88}deg)`,transformOrigin:'center top',backfaceVisibility:'hidden',textAlign:'center'}}>
          <div style={{position:'relative',height:h*.22,display:'flex',alignItems:'center',justifyContent:'center',background:k.op?'transparent':hi>.5?'#e5d4a9':'#f3eee1',clipPath:k.op?undefined:'polygon(0 0,91% 0,100% 15%,100% 100%,0 100%)',boxShadow:k.op?'none':'6px 7px 0 #b49b6a',fontFamily:k.font==='ys'?F.ys:F.heavy,fontWeight:900,fontSize:size,lineHeight:1,color:k.op?'#f7e9c4':'#27374c',whiteSpace:'nowrap'}}>
            {k.s}<div style={{position:'absolute',left:'5%',right:'5%',height:Math.max(4,h*.009),top:'50%',background:'#b49d6e',transform:`rotate(-10deg) scaleX(${crossed})`,transformOrigin:'left center'}} />
          </div>
          {!k.op && (k.icon || k.iconKind || k.l || k.en) && <div style={{position:'relative',marginTop:h*.045,opacity:eout(prog(t,k.it ?? (k.t ?? start)+.25,.4)),fontFamily:F.heavy}}>
            <div style={{width:2,height:h*.07,margin:'0 auto',background:'#d2be8e'}} />
            {(k.icon || k.iconKind) && <div style={{height:Math.min(e.ih ?? 130,h*.16),width:Math.min(e.ih ?? 130,h*.16,cw*.8),margin:'0 auto',filter:'drop-shadow(0 8px 10px rgba(0,0,0,.35))'}}><FormulaIcon kind={k.iconKind} src={k.icon}/></div>}
            {k.l && <div style={{fontSize:Math.min(e.lfs ?? 32,cw*.16),fontWeight:800,color:'#f7edd5',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{k.l}</div>}
            {k.en && <div style={{fontFamily:F.en,fontWeight:700,fontSize:Math.min(18,cw*.09),letterSpacing:1,color:'#cbbfa9',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{k.en}</div>}
          </div>}
        </div>;
      })}
    </div>
    {e.foot && <div style={{position:'absolute',left:margin,right:margin,bottom:h*.045,fontFamily:F.heavy,fontWeight:700,fontSize:Math.min(e.ffs ?? 30,h*.04),color:'#e9e4d6',opacity:eout(prog(t,e.ft ?? start,.4))}}>{e.foot}</div>}
  </div>;
};
