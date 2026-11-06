// Optional landscape helpers. The director supplies all content, timing and assets.
(() => {
  const {stage,overlays,LOOK}=STAGE;
  function picture(sc,{src,x,y,w,t=0,fromX=x,fromY=y,duration=.6,depth=1,cutout=true,show}={}){
    if(!src || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w)) throw Error('picture requires src, x, y and w');
    return sc.add({img:src,w,x:[[t,fromX],[t+duration,x,'out5']],y:[[t,fromY],[t+duration,y,'out5']],depth,filter:cutout?LOOK.CUT:undefined,show});
  }
  function caption(sc,text,{bottom=34,size=39}={}){
    const el=document.createElement('div');el.textContent=String(text);
    Object.assign(el.style,{position:'absolute',left:'0',right:'0',bottom:bottom+'px',textAlign:'center',fontFamily:'CNHeavy',fontWeight:'800',fontSize:size+'px',color:'#fff',textShadow:'3px 3px 0 #171717,-3px -3px 0 #171717',zIndex:'10000'});
    stage.appendChild(el);overlays.push(t=>el.style.display=t>=sc.t0&&t<sc.t1?'block':'none');return el;
  }
  window.STORY_LANDSCAPE={picture,caption};
})();
