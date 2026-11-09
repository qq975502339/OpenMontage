import React from 'react';
import {eout,prog} from '../lib';

/** Generic colored block reveals diagonally, retaining supplied dimensions and fill. */
export const EditorialBox:React.FC<{e:any;t:number}>=({e,t})=>{
 const p=eout(prog(t,e.t ?? 0,.65));
 return <div style={{width:e.w,height:e.h,background:e.bg ?? 'rgba(43,61,82,.72)',border:e.bd ?? '2px solid rgba(220,204,160,.42)',boxShadow:e.sh,borderRadius:e.r ?? 4,clipPath:`polygon(0 0,${Math.min(100,p*130)}% 0,${Math.max(0,p*130-30)}% 100%,0 100%)`}}/>;
};
