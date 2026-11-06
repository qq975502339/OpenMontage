import React from 'react';
import {eout,prog} from '../lib';
import {EditorialNote} from './EditorialNote';

/** An item stack assembles in alternating layers, retaining the supplied count. */
export const EditorialStack:React.FC<{e:any;t:number}>=({e,t})=>{
 const n=Math.max(0,Math.floor(Number(e.n)||0)),duration=e.d ?? 1.4,w=e.nw ?? 300,gap=e.gap ?? 13;
 return <div style={{position:'relative',width:w+40,height:n*gap+w*.52+50}}>{Array.from({length:n}).map((_,i)=>{
  const p=eout(prog(t,(e.t ?? 0)+i/Math.max(1,n)*duration,.35));
  return <div key={i} style={{position:'absolute',left:20+(1-p)*(i%2?80:-80),bottom:i*gap,width:w,height:gap+4,background:i%2?'#d1785d':'#e8a577',border:'1px solid #aa6650',boxSizing:'border-box',opacity:p}}/>;
 })}{n>0 && <div style={{position:'absolute',left:20,bottom:n*gap,transform:'perspective(600px) rotateX(58deg)',transformOrigin:'bottom'}}><EditorialNote e={{w,symbol:e.symbol,t:e.t ?? 0,variant:'editorial'}} t={t}/></div>}</div>;
};
