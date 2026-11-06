import {spawnSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,existsSync,rmSync,readdirSync,rmdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url'; import os from 'node:os'; import path from 'node:path'; import assert from 'node:assert/strict';
const d=mkdtempSync(path.join(os.tmpdir(),'story-assemble-'));
try {
 const run=(cmd,args)=>spawnSync(cmd,args,{encoding:'utf8'});
 for(const [i,color] of ['red','blue'].entries()) assert.equal(run('ffmpeg',['-v','error','-f','lavfi','-i',`color=c=${color}:s=320x180:r=24:d=1`,'-c:v','libx264','-y',path.join(d,`${i}.mp4`)]).status,0);
 const mf=path.join(d,'manifest.json'); writeFileSync(mf,JSON.stringify({clips:['0.mp4','1.mp4']}));
 const script=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../scripts/assemble-story.mjs'); const out=path.join(d,'out.mp4');
 let r=run(process.execPath,[script,mf,out]); assert.equal(r.status,0,r.stderr); assert.ok(existsSync(out));
 r=run('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',out]); assert.ok(Number(r.stdout)>1.9);
 assert.equal(run('ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=440:duration=0.5','-y',path.join(d,'voice.wav')]).status,0);
 writeFileSync(mf,JSON.stringify({clips:['0.mp4','1.mp4'],audio:[{file:'voice.wav',start:.2,volume:.5}]}));
 const audioOut=path.join(d,'with audio.mp4'); r=run(process.execPath,[script,mf,audioOut]); assert.equal(r.status,0,r.stderr);
 r=run('ffprobe',['-v','error','-select_streams','a:0','-show_entries','stream=codec_type','-of','csv=p=0',audioOut]); assert.match(r.stdout,/audio/);
 assert.notEqual(run(process.execPath,[script,mf,out]).status,0,'must refuse overwrite');
 writeFileSync(mf,JSON.stringify({clips:['0.mp4','missing.mp4']})); assert.notEqual(run(process.execPath,[script,mf,path.join(d,'missing.mp4')]).status,0);
 console.log('assemble integration checks passed');
} finally {for (const name of readdirSync(d)) rmSync(path.join(d,name),{force:true}); rmdirSync(d);}
