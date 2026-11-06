import React from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame} from 'remotion';
import * as Original from '../../../.agents/skills/xiaolin-explainer-packaging/templates/engine/src/els';
import * as OriginalV6 from '../../../.agents/skills/xiaolin-explainer-packaging/templates/engine/src/els6';
import * as Editorial from '../src/els';
import * as EditorialV6 from '../src/els6';
import {BG as OriginalBG} from '../../../.agents/skills/xiaolin-explainer-packaging/templates/engine/src/bg';
import {BG as EditorialBG} from '../src/bg';
import {loadFonts} from '../src/lib';
loadFonts();
const configs:any={
 concept:{name:'Concept',x:270,y:250,e:{t:0,w:1380,h:520,word:'复利',en:'COMPOUND GROWTH',sub:'时间让变化积累',icon:'coins',iconKind:'money',size:190,iconh:260}},
 panel:{name:'Panel',x:210,y:140,e:{t:0,w:1500,h:800,title:'三个影响因素',en:'THREE KEY FACTORS',inner:250}},
 chart:{name:'Chart',x:210,y:160,e:{t:0,w:1500,h:740,title:'价格变化',en:'PRICE TREND',pts:[['2022',20],['2023',35],['2024',30],['2025',60],['2026',85]],labels:[0,2,4],min:0,max:100,unit:'',d:2.2}},
 bars:{name:'Bars',x:210,y:270,e:{t:0,w:1500,bh:110,gap:65,lw:300,max:100,rows:[{label:'原料',v:75,txt:'75%'},{label:'房租',v:52,txt:'52%'},{label:'人工',v:35,txt:'35%'}]}},
 bubble:{name:'Bubble',x:500,y:380,e:{t:0,txt:'这个问题很重要',size:85,side:'r'}},
 comment:{name:'Comment',x:380,y:350,e:{t:0,w:1200,name:'观众',txt:'原来还可以这样理解！',meta:'今天 · 128 赞',av:'观'}},
 stamp:{name:'Stamp',x:590,y:380,e:{t:0,txt:'已核对',size:160}},
 meme:{name:'Meme',x:600,y:410,e:{t:0,txt:'居然如此',size:190,burst:true}},
 slider:{name:'Slider',x:230,y:380,e:{t:0,w:1100,lw:300,min:0,max:10,a:2,b:8,unit:'年',label:'累计时间',sub:'示例',delta:'+6'}},
 ruler:{name:'Ruler',x:0,y:0,e:{t:0,from:2000,to:2030,prev:2005,mark:2025,y:800}},
 arrow:{name:'Arrow',x:0,y:0,e:{t:0,from:[300,740],to:[1620,300],bend:-120,sw:10}},
 scribble:{name:'Scribble',x:0,y:0,e:{t:0,shape:'circle',x:960,y:520,w:950,h:460,sw:12}},
 icon:{name:'Icon',x:690,y:230,e:{t:0,src:'coins',iconKind:'money',size:420,label:'储蓄',en:'SAVINGS'}},
 people:{name:'People',x:300,y:400,e:{t:0,src:'young_worker',n:6,litn:4,lt:2,size:300,gap:20}},
 photo:{name:'Photo',x:625,y:140,e:{t:0,src:'icons/city.png',w:600,h:650,cap:'城市观察',en:'CITY VIEW',credit:'示例素材'}},
 toon:{name:'Toon',x:640,y:150,e:{t:0,src:'preview',size:700,wig:3}},
 doc:{name:'Doc',x:260,y:170,e:{t:0,w:1400,h:720,org:'示例资料',seal:'例',font:'cn',lines:[{st:'h1',txt:'一份示例报告'},{st:'meta',txt:'以下内容仅用于演示'},{st:'p',txt:'研究显示，相关成本出现变化。',hls:[{s:'相关成本',t:1.3}]}]}},
 pillar:{name:'Pillar',x:770,y:180,e:{t:0,w:380,h:670,n:1,title:'住房',sub:'支出类别',icon:'office'}},
 roof:{name:'Roof',x:300,y:370,e:{t:0,w:1320,h:250,txt:'三个支柱'}},
 formula:{name:'Formula',x:260,y:300,e:{t:0,size:150,items:[{s:'收入',t:0,lab:'收入来源',icon:'salary'},{s:'−',op:true,t:.3},{s:'支出',t:.6,lab:'日常消费',icon:'shopping'},{s:'=',op:true,t:.9},{s:'结余',t:1.2,lab:'可用资金',icon:'piggy'}],focus:[[2,3,2]]}},
 flag:{name:'Flag',x:650,y:250,e:{t:0,c:'fr',shape:'rect',size:420}},
 entity:{name:'Entity',x:600,y:380,e:{t:0,c:'jp',fs:160,name:'日本',en:'JAPAN',size:90}},
 txt:{name:'Txt',x:600,y:350,e:{t:0,txt:'长期主义',size:170,en:'LONG TERM'}},
 spark:{name:'Spark',x:770,y:310,e:{t:0,size:380}},
 box:{name:'Box',x:480,y:300,e:{t:0,w:960,h:480,bg:'#e6bd86',bd:'3px solid #e8d7aa'}},
 tag:{registry:'tag',x:690,y:400,e:{t:0,txt:'关键结论',size:80,c:'gold',en:'KEY POINT'}},
 coin:{registry:'coin',x:760,y:280,e:{t:0,size:400}},
 note:{registry:'note',x:620,y:340,e:{t:0,size:680}},
 stack:{name:'Stack',x:690,y:240,e:{t:0,n:10,nw:520,gap:24,d:1.4}},
 coinflow:{name:'CoinFlow',x:0,y:0,e:{t:0,from:[300,720],to:[1620,350],bend:-130,n:12,d:2.4,tr:1.1,s:95}},
 paperbarh:{v6:true,name:'Paper',x:210,y:140,e:{t:0,w:1500,h:800,kind:'barh',title:'费用比较',en:'COST COMPARISON',rows:[{l:'原料',v:75},{l:'房租',v:52},{l:'人工',v:35}],max:100,ls:40,vs:44}}
};
const Demo:React.FC<{id:string}>=({id})=>{const t=useCurrentFrame()/24,c=configs[id];return <AbsoluteFill style={{display:'flex',flexDirection:'row',background:'#101820'}}>{[0,1].map(i=>{const mod:any=c.v6?(i?EditorialV6:OriginalV6):(i?Editorial:Original),C=(c.registry?mod.ELS[c.registry]:mod[c.name]) as React.FC<any>;return <div key={i} style={{width:960,height:540,position:'relative',overflow:'hidden'}}><div style={{position:'absolute',width:1920,height:1080,transform:'scale(.5)',transformOrigin:'top left'}}><AbsoluteFill style={{background:'#000'}}/><div style={{position:'absolute',left:c.x,top:c.y}}><C e={c.e} t={t} v={{litv:0}}/></div></div><div style={{position:'absolute',top:18,left:24,zIndex:10,fontFamily:'sans-serif',fontSize:24,color:'white',textShadow:'0 1px 5px #000'}}>{i?'新版 · 独立组件':'原版 · 真实组件'}</div></div>})}</AbsoluteFill>};
registerRoot(()=><>{Object.keys(configs).map(id=><Composition key={id} id={id} component={Demo} defaultProps={{id}} durationInFrames={96} fps={24} width={1920} height={540}/>)}</>);
