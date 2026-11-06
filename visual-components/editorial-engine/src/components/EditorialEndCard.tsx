import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {eout, F, img, prog} from '../lib';

/** Reusable ending card, revealed through a circular aperture. */
export const EditorialEndCard: React.FC<{e:any; t:number; brandToon?:string}> = ({e,t,brandToon}) => {
  const start=e.t ?? 0, reveal=eout(prog(t,start,.95)), line=eout(prog(t,start+.45,.8));
  const title=String(e.title ?? '谢谢观看'), sub=String(e.subtitle ?? '我们下期再见'), en=String(e.en ?? 'THANKS FOR WATCHING');
  const size=Math.min(e.titleSize ?? 205,1020/Math.max(1,Array.from(title).length)*1.05);
  const picture=e.image ?? brandToon;
  const palettes=[{base:'#edf8f1',a:'#f5d9c9',b:'#a8d7bd',accent:'#326552'}, {base:'#f5f2fa',a:'#f2d4d7',b:'#c1d3e9',accent:'#565478'}, {base:'#eef8fa',a:'#f8dfbe',b:'#b5dcd5',accent:'#376373'}];
  const hash=Array.from(title+sub).reduce((n,c)=>(n*31+c.codePointAt(0)!)>>>0,0);
  const palette=palettes[((Number(e.bgVariant ?? hash)%palettes.length)+palettes.length)%palettes.length] ?? palettes[0];
  const ink=e.textColor ?? palette.accent, drift=Math.sin((t-start)*.8)*10;
  return <AbsoluteFill style={{overflow:'hidden',background:e.bg ?? `linear-gradient(145deg,#fffef8,${palette.base} 72%)`,fontFamily:F.heavy}}>
    <AbsoluteFill style={{opacity:.10,backgroundImage:`radial-gradient(${palette.accent} 1.5px,transparent 2px)`,backgroundSize:'42px 42px'}} />
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" style={{position:'absolute',inset:0}}>
      <ellipse cx={1690+drift} cy="490" rx="290" ry="315" fill="#fffefa" opacity=".65" />
      <circle cx="1700" cy="155" r="115" fill={palette.a} opacity=".44" />
      <circle cx="115" cy="875" r="155" fill={palette.b} opacity=".25" />
      <g fill="none" stroke={palette.b} strokeWidth="9" strokeLinecap="round" opacity=".9">
        <path d={`M${70+drift} 1050 C160 920 210 800 250 665 M1650 1070 C1720 950 1790 880 1880 800`} />
        <path d="M150 910 C90 875 85 835 100 820 C150 825 170 865 150 910Z M196 815 C155 775 155 740 170 726 C210 737 220 774 196 815Z M1735 950 C1695 905 1700 875 1715 862 C1750 880 1760 918 1735 950Z M1815 865 C1780 825 1785 790 1800 780 C1840 797 1850 830 1815 865Z" fill={palette.b} strokeWidth="3" />
      </g>
      <g fill={palette.a} opacity=".85"><circle cx="300" cy="170" r="12"/><circle cx="1240" cy="135" r="9"/><circle cx="1150" cy="875" r="13"/><circle cx="1770" cy="820" r="10"/></g>
    </svg>
    <div style={{position:'absolute',inset:0,clipPath:`circle(${reveal*150}% at 35% 50%)`}}>
      <div style={{position:'absolute',left:160,top:310,right:550,fontSize:size,lineHeight:1.15,fontWeight:900,color:ink,textShadow:'0 5px 0 rgba(255,255,255,.55)',whiteSpace:'nowrap'}}>{title}</div>
      {en && <div style={{position:'absolute',left:175,top:600,right:560,fontFamily:F.en,fontWeight:700,fontSize:e.enSize ?? 38,letterSpacing:4,color:ink,opacity:.75,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{en}</div>}
      {sub && <div style={{position:'absolute',left:175,top:690,right:560,fontSize:e.subtitleSize ?? 50,fontWeight:800,color:ink,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{sub}</div>}
      {e.label && <div style={{position:'absolute',left:175,top:235,fontFamily:F.en,fontWeight:700,fontSize:30,letterSpacing:3,color:ink,opacity:.75}}>{e.label}</div>}
    </div>
    <svg viewBox="0 0 520 520" width="520" height="520" style={{position:'absolute',left:1390,top:250,opacity:line}}><circle cx="260" cy="260" r="218" fill="rgba(255,255,255,.42)" stroke={palette.b} strokeWidth="6" strokeDasharray="1370" strokeDashoffset={1370*(1-line)}/><circle cx="260" cy="260" r="190" fill="none" stroke={palette.b} opacity=".6" strokeWidth="3" strokeDasharray="4 18" /></svg>
    {picture ? <Img src={img(picture)} style={{position:'absolute',left:1415,top:280,width:470,height:470,objectFit:'contain',opacity:line,filter:'drop-shadow(0 15px 20px rgba(0,0,0,.18))'}} /> : <svg viewBox="0 0 100 100" width="180" height="180" style={{position:'absolute',left:1560,top:420,opacity:line,transform:`rotate(${(1-line)*25}deg)`}}><g fill={palette.a} stroke={palette.b} strokeWidth="2"><ellipse cx="50" cy="27" rx="13" ry="21"/><ellipse cx="50" cy="73" rx="13" ry="21"/><ellipse cx="27" cy="50" rx="21" ry="13"/><ellipse cx="73" cy="50" rx="21" ry="13"/><circle cx="50" cy="50" r="12" fill="#fff8de"/></g></svg>}
  </AbsoluteFill>;
};
