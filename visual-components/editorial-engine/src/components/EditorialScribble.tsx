import React from 'react';
import {eout,prog} from '../lib';

/** Editorial emphasis snaps into place as a dashed, hand-drawn annotation. */
export const EditorialScribble:React.FC<{e:any;t:number}>=({e,t})=>{
 const {x=0,y=0,w=100,h=60}=e,p=eout(prog(t,e.t ?? 0,e.d ?? .5)),c=e.c ?? '#e87559',sw=e.sw ?? 6;
 let d='';
 if(e.shape==='circle')d=`M${x-w/2} ${y} a${w/2} ${h/2} 0 1 0 ${w} 0 a${w/2} ${h/2} 0 1 0 ${-w} 0`;
 else if(e.shape==='under')d=`M${x-w/2} ${y} Q${x} ${y+8} ${x+w/2} ${y-3}`;
 else if(e.shape==='strike')d=`M${x-w/2} ${y+4} L${x+w/2} ${y-6}`;
 else if(e.shape==='cross')d=`M${x-w/2} ${y-h/2} L${x+w/2} ${y+h/2} M${x+w/2} ${y-h/2} L${x-w/2} ${y+h/2}`;
 else if(e.shape==='box')d=`M${x-w/2} ${y-h/2} H${x+w/2} V${y+h/2} H${x-w/2} Z`;
 return <svg width="10" height="10" style={{position:'absolute',left:0,top:0,overflow:'visible',opacity:p,transform:`translate(${(1-p)*12}px,${(1-p)*-8}px)`}}><path d={d} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20 8"/></svg>;
};
