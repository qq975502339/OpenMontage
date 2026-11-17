import {spawnSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
const root=mkdtempSync(path.join(os.tmpdir(),'editorial-default-'));
try {
const engine=path.join(root,'engine'), target=path.join(root,'new-film');
for(const dir of ['src/data','public','scripts']) mkdirSync(path.join(engine,dir),{recursive:true});
for(const file of ['src/els.tsx','render.mjs','story_core.py','package.json','tsconfig.json','LICENSE']) writeFileSync(path.join(engine,file),'');
writeFileSync(path.join(engine,'render.mjs'),'const t0 = Date.now();');
writeFileSync(path.join(engine,'src/data/shots.json'),'{"total":10}');
const script=process.argv[2] || path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../scripts/create-project.mjs');
const run=spawnSync(process.execPath,[script,target],{encoding:'utf8',env:{...process.env,EDITORIAL_ENGINE_PATH:engine}});
assert.equal(run.status,0,run.stderr);
assert.equal(JSON.parse(readFileSync(path.join(target,'project.json'),'utf8')).prop_look,'sticker25d');
assert.equal(JSON.parse(readFileSync(path.join(target,'src/data/shots.json'),'utf8')).prop_look,'sticker25d');
assert.equal(JSON.parse(readFileSync(path.join(engine,'src/data/shots.json'),'utf8')).prop_look,undefined);
writeFileSync(path.join(target,'public/prop_styles.json'),JSON.stringify({styles:[{id:'sticker25d'},{id:'papercut'}]}));
const {checkPropLook}=await import(pathToFileURL(path.join(target,'scripts/check-prop-look.mjs')).href);
checkPropLook(target);
writeFileSync(path.join(target,'src/data/shots.json'),JSON.stringify({prop_look:'typo'}));
assert.throws(()=>checkPropLook(target),/Invalid prop_look/);
writeFileSync(path.join(target,'src/data/shots.json'),JSON.stringify({scenes:{s:{els:[{k:'prop',look:'typo'}]}}}));
assert.throws(()=>checkPropLook(target),/Invalid s.prop.look/);
writeFileSync(path.join(target,'src/data/shots.json'),'{}');
checkPropLook(target);
console.log('New project defaults and unchanged source verified');
} finally {
 const resolved=path.resolve(root), tempRoot=path.resolve(os.tmpdir());
 if(path.dirname(resolved)!==tempRoot || !path.basename(resolved).startsWith('editorial-default-')) throw Error('unsafe temporary directory');
 rmSync(resolved,{recursive:true,force:true});
}
