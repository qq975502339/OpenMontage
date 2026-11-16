export const looks={sticker25d:'soft',papercut:'paper',chalk:'none',clay:'soft',toy3d:'soft',vintage_ad:'soft',risograph:'paper',flat_editorial:'soft',mono_line:'none',comic_pop:'paper',product_photo:'soft',watercolor:'paper',engraving:'paper',woodcut:'paper',ink_wash:'paper',collage:'paper',lineart_white:'glow',cutaway:'soft',neon:'glow',pixel16:'hard'};
export function getPropShadow(lift=0, look, light=false) {
 const style=looks[look] ?? 'soft';
 if(style==='none') return '';
 if(style==='glow') {const c=look==='neon'?'255,120,200':'255,255,255';return `drop-shadow(0 0 ${6+4*lift}px rgba(${c},.55)) drop-shadow(0 0 ${18+8*lift}px rgba(${c},.28))`;}
 if(style==='hard') return `drop-shadow(${6+4*lift}px ${6+4*lift}px 0 rgba(0,0,0,${light?.28:.55}))`;
 if(style==='paper') return light?`drop-shadow(0 ${2+5*lift}px ${3+6*lift}px rgba(40,30,20,${.3+.06*lift}))`:`drop-shadow(0 ${3+6*lift}px ${4+8*lift}px rgba(0,0,0,${.55+.1*lift}))`;
 return light?`drop-shadow(0 ${8+10*lift}px ${10+12*lift}px rgba(40,30,20,${.26+.06*lift}))`:`drop-shadow(0 ${12+10*lift}px ${16+14*lift}px rgba(0,0,0,${.5+.1*lift}))`;
}
