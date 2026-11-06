import React from 'react';
import {AbsoluteFill} from 'remotion';
import {eout, F, prog} from '../lib';

/** Generic title and chapter card with a focus-pull style text reveal. */
export const EditorialTitleCard: React.FC<{e:any; t:number}> = ({e,t}) => {
  const start=e.t ?? 0, headline=String(e.l2 ?? ''), suffix=String(e.l2b ?? ''), question=String(e.q ?? '');
  const p=eout(prog(t,start+(e.slam ?? .55),.9)), intro=eout(prog(t,start,.55)), subtitle=eout(prog(t,start+(e.slam ?? .55)+.55,.55));
  const weighted=Math.max(1,Array.from(headline).length+Array.from(suffix).length*.58+Array.from(question).length*.5);
  const mainSize=Math.min(e.s2 ?? 250,1350/weighted*1.05), secondarySize=Math.min(e.s2b ?? mainSize*.56,mainSize*.7);
  const seed=Number(e.decorSeed ?? Array.from(headline+suffix).reduce((n,c)=>(n*31+c.codePointAt(0)!)>>>0,0))>>>0;
  const positions=[[55,115],[290,105],[540,85],[850,105],[1170,90],[1480,110],[1730,120],[35,420],[1760,410],[65,765],[330,885],[600,865],[930,895],[1250,875],[1540,875],[1760,740]];
  const colors=['#f1d28d','#9fc9c4','#e8a395','#d5c5a6'];
  const paths=[
    'M50 8 L55 35 L75 20 L65 43 L92 50 L65 56 L78 80 L55 65 L50 92 L44 65 L20 80 L35 56 L8 50 L35 43 L20 20 L44 35 Z',
    'M50 22 C32 22 25 34 25 49 C25 65 37 76 50 76 C64 76 76 65 76 49 C76 34 66 22 50 22 Z M50 5v9 M50 84v10 M5 50h10 M85 50h10 M18 18l7 7 M75 75l7 7 M82 18l-7 7 M25 75l-7 7',
    'M10 72 C25 10 40 88 56 37 C70 1 77 54 91 25 M12 82 C28 20 42 98 58 47 C72 11 79 64 93 35',
    'M15 72 C19 34 43 20 80 18 C80 52 66 79 30 82 M23 76 Q50 48 75 25 M42 56 L35 40 M54 46 L69 50',
    'M18 68 Q9 27 47 20 Q84 19 82 55 Q80 79 55 80 Q30 79 32 56 Q33 39 50 39 Q66 39 65 54 Q64 66 53 65',
    'M10 55 Q48 15 90 55 Q48 90 10 55 Z M50 32 A23 23 0 1 0 50 78 A23 23 0 1 0 50 32 M45 49 A6 6 0 1 0 45 61 A6 6 0 1 0 45 49'
  ];
  return <AbsoluteFill style={{overflow:'hidden',background:e.bg ?? 'radial-gradient(ellipse at center,#242327,#111115 78%)',fontFamily:F.heavy}}>
    {positions.map(([x,y],i)=>{
      const offset=((seed >>> ((i%6)*4))&15)-8, variant=((seed >>> ((i%4)*5))+i)%paths.length, color=colors[(seed+i)%colors.length], size=88+((seed >>> ((i%5)*4))&3)*14;
      const motion=Math.sin((t-start)*1.8+i*1.3), sway=Math.sin((t-start)*1.2+i*.8);
      return <svg key={i} viewBox="0 0 100 100" width={size} height={size} style={{position:'absolute',left:x+offset*3,top:y+offset*2,opacity:.73,transform:`translate(${sway*7}px,${motion*12}px) rotate(${offset*2+motion*9}deg) scale(${1+sway*.045})`}}><path d={paths[variant]} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    })}
    {e.l1 && <div style={{position:'absolute',left:180,right:260,top:e.y1 ?? 285,fontFamily:F.heavy,fontWeight:900,fontSize:Math.min(e.s1 ?? 105,1250/Math.max(1,Array.from(String(e.l1)).length)*1.1),color:'#fff1c0',opacity:intro,letterSpacing:3}}>{e.l1}</div>}
    <div style={{position:'absolute',left:175,right:220,top:e.y2 ?? 435,display:'flex',alignItems:'baseline',gap:12,whiteSpace:'nowrap',opacity:p,filter:`blur(${(1-p)*20}px)`,transform:`scale(${1.08-.08*p})`,transformOrigin:'left center',letterSpacing:(1-p)*22}}>
      <span style={{fontFamily:F.heavy,fontWeight:900,fontSize:mainSize,lineHeight:1.15,color:'#fff379',textShadow:'0 10px #856246,0 20px 30px rgba(0,0,0,.4)'}}>{headline}</span>
      {suffix && <span style={{fontFamily:F.heavy,fontWeight:900,fontSize:secondarySize,color:'#fff379'}}>{suffix}</span>}
      {question && <span style={{fontFamily:F.heavy,fontWeight:900,fontSize:secondarySize,color:'#fff379'}}>{question}</span>}
    </div>
    {e.en && <div style={{position:'absolute',left:185,right:250,top:e.ye ?? 760,fontFamily:F.en,fontWeight:700,fontSize:e.se ?? 36,letterSpacing:4,color:'#f2d7b3',opacity:subtitle,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.en}</div>}
  </AbsoluteFill>;
};
