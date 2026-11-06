import {spawnSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url'; import os from 'node:os'; import path from 'node:path'; import assert from 'node:assert/strict';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const tempRoot=path.resolve(os.tmpdir());const d=mkdtempSync(path.join(tempRoot,'wallstreet-integration-'));const dest=path.join(d,'film');
try {
 const invoke=(...args)=>spawnSync(process.execPath,[path.join(root,'scripts/create-wallstreet.mjs'),...args],{encoding:'utf8'});
 let r=invoke(dest);assert.equal(r.status,0,r.stderr);
 for(const f of ['index.html','lib/kit.js','lib/scenes.js','lib/scenes_plus.js','lib/host.js','assets/kit/fabric.jpg','film.js','timeline.json'])assert.ok(existsSync(path.join(dest,f)),f);
 const kit=readFileSync(path.join(dest,'lib/kit.js'),'utf8');assert.match(kit,/EDITORIAL_REJECTED_SCENES/);
 const film=readFileSync(path.join(dest,'film.js'),'utf8');assert.doesNotMatch(film,/scene\s*:\s*['"](?:title|equation|flash)['"]/);
 assert.notEqual(invoke(dest).status,0,'must refuse overwrite');
 assert.notEqual(invoke(path.join(root,'vendor/wallstreet-explainer/illegal')).status,0,'must not create inside source');
 console.log('wallstreet project scaffolding checks passed');
} finally {const resolved=path.resolve(d);if(path.dirname(resolved)!==tempRoot||!path.basename(resolved).startsWith('wallstreet-integration-'))throw Error('unsafe temporary directory');rmSync(resolved,{recursive:true,force:true});}
