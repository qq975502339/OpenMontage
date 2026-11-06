import fs from 'node:fs/promises'; import path from 'node:path';
import {fileURLToPath} from 'node:url'; import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const src=path.resolve(process.env.WALLSTREET_SKILL_PATH || path.join(root,'vendor','wallstreet-explainer'));
if(process.argv.length!==3)throw new Error('用法：node create-wallstreet.mjs <尚不存在的工程目录>');
const dst=path.resolve(process.argv[2]);const rel=path.relative(src,dst);
if(!rel||(!rel.startsWith('..')&&!path.isAbsolute(rel)))throw new Error('不能在原项目目录内建立工程');
try{await fs.access(dst);throw new Error('目标已存在，不会覆盖：'+dst);}catch(e){if(e.code!=='ENOENT')throw e;}
for(const f of ['scripts/new_film.mjs','scripts/timeline_stub.mjs','kit/kit.js','kit/scenes.js','kit/scenes_plus.js','kit/host.js','kit/assets/fabric.jpg','kit/assets/grain.png','kit/assets/worldmap.png','starter/film.js','LICENSE'])await fs.access(path.join(src,f));
const r=spawnSync(process.execPath,[path.join(src,'scripts','new_film.mjs'),dst],{stdio:'inherit'});
if(r.error||r.status!==0)throw new Error('创建失败：'+(r.error?.message||r.status));
const kitPath=path.join(dst,'lib','kit.js');let kit=await fs.readFile(kitPath,'utf8');
const original='const scene=(name,def)=>{SCENES[name]=def;return def;};';
if(!kit.includes(original))throw new Error('不支持的原项目版本：无法验证场景过滤规则');
kit=kit.replace(original,"const EDITORIAL_REJECTED_SCENES=new Set(['equation','title','flash']);\nconst scene=(name,def)=>{if(!EDITORIAL_REJECTED_SCENES.has(name))SCENES[name]=def;return def;};");
await fs.writeFile(kitPath,kit);
await fs.writeFile(path.join(dst,'film.js'),`// 起始示例：全部内容和素材均需按项目替换。\nwindow.ready=(async()=>{\n const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS});\n const K=await KIT.use(F);\n await K.film([{scene:'number',says:'示例数字，请替换为经核实的数据',value:'100',brow:'示例数据'}]);\n return K.go();\n})();\n`);
await fs.copyFile(path.join(src,'LICENSE'),path.join(dst,'WALLSTREET_LICENSE.txt'));
console.log('已创建华尔街财经工程；公式 equation、标题 title、开场 flash 不在可用场景中。');
