import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const skillRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const bighead=path.resolve(process.env.BIGHEAD_SKILL_PATH || path.join(skillRoot,'vendor','bighead-collage'));
if(!process.argv[2]) throw new Error('用法：node scripts/create-story.mjs <尚不存在的工程目录> [--landscape]');
const landscape=process.argv.includes('--landscape');
if(process.argv.slice(3).some(a=>a!=='--landscape')) throw new Error('未知参数');
const target=path.resolve(process.argv[2]);
const relative=path.relative(bighead,target);
if(!relative || (!relative.startsWith('..')&&!path.isAbsolute(relative))) throw new Error('工程不能建在故事引擎内部。');
try {await fs.access(target);throw new Error('目标已存在，不会覆盖：'+target);} catch(e) {if(e.code!=='ENOENT') throw e;}
for(const f of ['scripts/new_film.py','scripts/stage.js','scripts/acts.js','scripts/look.css','LICENSE','scripts/fonts/OFL-Anton.txt','scripts/fonts/OFL-NotoSansSC.txt','scripts/fonts/OFL-SmileySans.txt']) await fs.access(path.join(bighead,f));
if(landscape) await fs.access(path.join(skillRoot,'assets','story-landscape.js'));
const run=spawnSync(process.env.PYTHON || 'python',['-X','utf8',path.join(bighead,'scripts','new_film.py'),target],{stdio:'inherit'});
if(run.error || run.status!==0) throw new Error('创建故事工程失败：'+(run.error?.message || run.status));
if(landscape) {
  const stagePath=path.join(target,'a','stage.js');
  let stage=await fs.readFile(stagePath,'utf8');
  if(!stage.includes('const W = 1080, H = 1920;')) throw new Error('未识别原版舞台尺寸，不能自动切换横屏。');
  stage=stage.replace('const W = 1080, H = 1920;', 'const W = 1920, H = 1080;');
  await fs.writeFile(stagePath,stage);
  const scriptPath=path.join(target,'script.json');
  const script=JSON.parse(await fs.readFile(scriptPath,'utf8')); script.aspect='16:9';
  await fs.writeFile(scriptPath,JSON.stringify(script,null,2)+'\n');
  await fs.appendFile(path.join(target,'scene.js'),'\n// 横屏需要重新编排场景位置；captions() 应显式指定适合 1080 高画面的 y。\n');
  await fs.copyFile(path.join(skillRoot,'assets','story-landscape.js'),path.join(target,'a','story-landscape.js'));
  const htmlPath=path.join(target,'index.html'); const html=await fs.readFile(htmlPath,'utf8');
  await fs.writeFile(htmlPath,html.replace('<script src="scene.js">','<script src="a/story-landscape.js"></script><script src="scene.js">'));
}
await fs.copyFile(path.join(bighead,'LICENSE'),path.join(target,'a','BIGHEAD_LICENSE.txt'));
for(const f of ['OFL-Anton.txt','OFL-NotoSansSC.txt','OFL-SmileySans.txt']) await fs.copyFile(path.join(bighead,'scripts','fonts',f),path.join(target,'a',f));
console.log('已创建原版大头剪贴故事工程：'+target+'；接下来按个人技能故事模式完成文案、配音、导演表和制作。');
