import React from 'react';
import {eout,prog} from '../lib';

/** A rotating four-point sparkle with an orbiting accent. */
export const EditorialSpark:React.FC<{e:any;t:number}>=({e,t})=>{
 const s=e.size ?? 60,p=eout(prog(t,e.t ?? 0,.55)),angle=(t-(e.t ?? 0))*55;
 return <svg width={s} height={s} viewBox="0 0 100 100" style={{opacity:p,transform:`rotate(${angle}deg) scale(${.45+.55*p})`}}><path d="M50 3 Q57 42 97 50 Q57 58 50 97 Q43 58 3 50 Q43 42 50 3Z" fill={e.c ?? '#f6cf8e'}/><circle cx="79" cy="20" r="5" fill="#e77a59"/></svg>;
};
