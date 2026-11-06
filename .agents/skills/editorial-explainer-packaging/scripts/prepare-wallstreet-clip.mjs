import fs from 'node:fs/promises'; import path from 'node:path'; import {spawnSync} from 'node:child_process';
const [filmArg,name,inputArg,...extra]=process.argv.slice(2);
if(!filmArg||!name||!inputArg||extra.length)throw Error('用法：node prepare-wallstreet-clip.mjs <工程目录> <素材名> <视频文件>');
if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(name))throw Error('素材名只能包含字母、数字、下划线、短横线');
const film=path.resolve(filmArg),input=path.resolve(inputArg),dir=path.join(film,'assets','clips'),target=path.join(dir,name),countsPath=path.join(dir,'counts.json');
await fs.access(film);await fs.access(input);let counts={};try{counts=JSON.parse(await fs.readFile(countsPath,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
if(!counts||Array.isArray(counts)||typeof counts!=='object')throw Error('counts.json 格式无效');
if(Object.hasOwn(counts,name))throw Error('此素材名已经登记，不会覆盖：'+name);
try{await fs.access(target);throw Error('素材目录已存在，不会覆盖：'+target);}catch(e){if(e.code!=='ENOENT')throw e;}
await fs.mkdir(dir,{recursive:true});await fs.mkdir(target);
const r=spawnSync('ffmpeg',['-v','error','-n','-i',input,'-vf','fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black','-q:v','3',path.join(target,'%04d.jpg')],{stdio:'inherit'});
if(r.error||r.status!==0)throw Error('帧提取失败；请检查输入和 ffmpeg。未登记目录：'+target);
const frames=(await fs.readdir(target)).filter(n=>/^\d{4,}\.jpg$/.test(n)).length;if(!frames)throw Error('没有提取到帧：'+target);
counts[name]=frames;await fs.writeFile(countsPath,JSON.stringify(counts,null,2)+'\n');console.log(`已准备 ${name}：${frames} 帧，视频原音频未包含`);
