import React from 'react';
import {Img} from 'remotion';
import {eout, F, img, prog} from '../lib';
import {FlagSvg} from '../els';

/** Reusable subject card: the plate unfolds from its center and its badge turns into place. */
export const EditorialEntityCard: React.FC<{e:any; t:number}> = ({e,t}) => {
  const w=e.w ?? 330,h=e.h ?? 470, badge=w*.36, start=e.t ?? 0;
  const unfold=eout(prog(t,start,.8)), seal=eout(prog(t,start+.4,.65));
  const name=String(e.name ?? ''), strip=String(e.strip ?? '');
  const nameSize=Math.min(e.ns ?? w*.24,w*.82/Math.max(1,Array.from(name).length)*1.05);
  const stripSize=Math.min(e.ss ?? h*.12,w*.72/Math.max(1,Array.from(strip).length)*1.05);
  return <div style={{position:'relative',width:w,height:h+badge/2}}>
    <div style={{position:'absolute',left:0,top:badge/2,width:w,height:h,transform:`scaleX(${Math.max(.001,unfold)})`,transformOrigin:'center',filter:'drop-shadow(0 22px 24px rgba(0,0,0,.45))'}}>
      <div style={{position:'absolute',inset:0,overflow:'hidden',clipPath:'polygon(0 0,88% 0,100% 9%,100% 100%,0 100%)',background:e.bg ?? '#fff5d5',boxSizing:'border-box'}}>
        <div style={{position:'absolute',left:w*.08,right:w*.08,top:h*.27,height:2,background:'rgba(75,69,59,.22)'}} />
        {e.en && <div style={{position:'absolute',left:w*.08,right:w*.08,top:h*.31,fontFamily:F.en,fontWeight:700,fontSize:Math.min(w*.055,24),letterSpacing:2,color:e.enColor ?? '#98705a',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.en}</div>}
        <div style={{position:'absolute',left:w*.08,right:w*.08,top:h*.39,fontFamily:F.ys,fontWeight:900,fontSize:nameSize,lineHeight:1.1,color:e.nameColor ?? '#332b2b',whiteSpace:'nowrap',textShadow:'0 3px rgba(255,255,255,.45),0 7px 10px rgba(81,54,38,.2)'}}>{name}</div>
        {e.strip && <div style={{position:'absolute',left:w*.08,right:w*.08,bottom:h*.1,minHeight:h*.17,padding:`${h*.035}px ${w*.035}px`,boxSizing:'border-box',background:e.stripBg ?? '#db6851',display:'flex',alignItems:'center',fontFamily:e.sf==='num'?F.num:F.heavy,fontWeight:900,fontSize:stripSize,color:e.sc ?? '#fff5d5',lineHeight:1.1,overflowWrap:'anywhere'}}>{strip}</div>}
      </div>
    </div>
    {(e.c || e.icon) && <div style={{position:'absolute',left:w/2-badge/2,top:0,width:badge,height:badge,borderRadius:'50%',background:'#f6f0df',border:`${Math.max(3,w*.012)}px solid #aaa397`,boxSizing:'border-box',boxShadow:'0 8px 18px rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',opacity:seal,transform:`rotate(${(1-seal)*-120}deg) scale(${.65+.35*seal})`}}>
      {e.icon ? <Img src={img(e.icon)} style={{width:'75%',height:'75%',objectFit:'contain'}} /> : <div style={{width:'80%',height:'80%',borderRadius:'50%',overflow:'hidden',display:'flex',justifyContent:'center',alignItems:'center'}}><FlagSvg c={e.c} w={badge*1.2} /></div>}
    </div>}
    {e.tag && <div style={{position:'absolute',left:w*.14,right:w*.14,top:h+badge/2-w*.035,textAlign:'center',fontFamily:F.en,fontWeight:700,fontSize:Math.min(22,w*.06),color:'#332b2b',background:'#f6f0df',padding:'4px 8px',opacity:seal}}>{e.tag}</div>}
  </div>;
};
