import {spawnSync} from 'node:child_process'; import {mkdtempSync,readFileSync,existsSync,rmSync,writeFileSync,mkdirSync} from 'node:fs'; import os from 'node:os';import path from 'node:path';import {fileURLToPath} from 'node:url';import assert from 'node:assert/strict';
const base=path.resolve(os.tmpdir()),d=mkdtempSync(path.join(base,'wallstreet-clip-'));try{
 const clip=path.join(d,'sample.mp4'),film=path.join(d,'film');mkdirSync(film);
 const run=(cmd,args)=>spawnSync(cmd,args,{encoding:'utf8'});
 assert.equal(run('ffmpeg',['-v','error','-f','lavfi','-i','color=c=red:s=320x180:r=24:d=1','-c:v','libx264','-y',clip]).status,0);
 const script=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../scripts/prepare-wallstreet-clip.mjs');let r=run(process.execPath,[script,film,'sample',clip]);assert.equal(r.status,0,r.stderr);
 const n=JSON.parse(readFileSync(path.join(film,'assets/clips/counts.json'),'utf8')).sample;assert.ok(n>=29&&n<=31);assert.ok(existsSync(path.join(film,'assets/clips/sample/0001.jpg')));
 assert.notEqual(run(process.execPath,[script,film,'sample',clip]).status,0);assert.notEqual(run(process.execPath,[script,film,'../escape',clip]).status,0);console.log('frame preparation checks passed');
}finally{const q=path.resolve(d);if(path.dirname(q)!==base||!path.basename(q).startsWith('wallstreet-clip-'))throw Error('unsafe temporary directory');rmSync(q,{recursive:true,force:true});}
