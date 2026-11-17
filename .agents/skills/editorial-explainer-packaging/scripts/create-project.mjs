import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ancestors=(start)=>{const dirs=[];let p=path.resolve(start);while(true){dirs.push(p);const parent=path.dirname(p);if(parent===p)return dirs;p=parent;}};
const roots=[...ancestors(process.cwd()),...ancestors(path.dirname(fileURLToPath(import.meta.url)))];
const candidates=process.env.EDITORIAL_ENGINE_PATH?[path.resolve(process.env.EDITORIAL_ENGINE_PATH)]:roots.flatMap(root=>[path.join(root,'visual-components','editorial-engine'),path.join(root,'editorial-engine')]);
let source;
for (const candidate of candidates) {try {await fs.access(path.join(candidate,'src','els.tsx'));source=candidate;break;} catch {}}
if(!source) throw new Error('Personal engine not found. Run from the repository or set EDITORIAL_ENGINE_PATH.');
const arg=process.argv[2];
if (!arg) throw new Error('Usage: node create-project.mjs <new-project-directory>');
const target=path.resolve(arg);
const relative=path.relative(source,target);
if (!relative || (!relative.startsWith('..') && !path.isAbsolute(relative))) throw new Error('Project directory must be outside the source engine.');
try {await fs.access(target); throw new Error(`Target already exists: ${target}`);} catch (err) {if (err.code!=='ENOENT') throw err;}
await fs.access(path.join(source,'src','els.tsx'));
await fs.mkdir(target,{recursive:true});
const demoAssets=new Set(['shots/example-source.html','shots/example-source.png','shots/example-source.png.boxes.json','shots/example-real.png','shots/example-real.png.boxes.json','logos/example-mark.svg','logos/wikipedia.png','logos/CREDITS.txt']);
for (const item of ['src','public','scripts','render.mjs','story_core.py','package.json','tsconfig.json','LICENSE']) {
 const base=path.join(source,item);
 const options={recursive:true};
 if(item==='public') options.filter=(src)=>{const rel=path.relative(base,src).split(path.sep).join('/');return !demoAssets.has(rel) && !/^plates\/tech_/.test(rel);};
 await fs.cp(base,path.join(target,item),options);
}
const shotsPath=path.join(target,'src','data','shots.json');
const shots=JSON.parse(await fs.readFile(shotsPath,'utf8'));
shots.prop_look='sticker25d';
await fs.writeFile(shotsPath,JSON.stringify(shots,null,2)+'\n');
await fs.writeFile(path.join(target,'project.json'),JSON.stringify({prop_look:'sticker25d'},null,2)+'\n');
await fs.copyFile(path.join(path.dirname(fileURLToPath(import.meta.url)),'check-prop-look.mjs'),path.join(target,'scripts','check-prop-look.mjs'));
const renderPath=path.join(target,'render.mjs');
let render=await fs.readFile(renderPath,'utf8');
const anchor="const t0 = Date.now();";
if(!render.includes(anchor)) throw new Error('Unsupported engine render.mjs: cannot add prop validation');
render=render.replace(anchor,"const t0 = Date.now();\nconst {checkPropLook}=await import('./scripts/check-prop-look.mjs');\ncheckPropLook(process.cwd());");
await fs.writeFile(renderPath,render);
console.log(`Created ${target}. Install the package.json dependencies before rendering.`);
