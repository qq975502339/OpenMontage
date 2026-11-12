import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const [manifestArg,outputArg,...extra]=process.argv.slice(2);
if(!manifestArg || !outputArg || extra.length) throw new Error('用法：node assemble-story.mjs <timeline.json> <新视频.mp4>');
const manifestPath=path.resolve(manifestArg), output=path.resolve(outputArg), base=path.dirname(manifestPath);
const data=JSON.parse((await fs.readFile(manifestPath,'utf8')).replace(/^\uFEFF/,''));
if(!Array.isArray(data.clips)||!data.clips.length||data.clips.some(x=>typeof x!=='string'||!x)) throw new Error('clips 必须是非空文件路径数组');
if(data.audio!==undefined&&!Array.isArray(data.audio)) throw new Error('audio 必须是数组');
const audios=data.audio||[];
for(const a of audios) if(!a||typeof a.file!=='string'||!Number.isFinite(a.start??0)||(a.start??0)<0||!Number.isFinite(a.volume??1)||(a.volume??1)<0) throw new Error('audio 项需包含 file、非负 start 秒和非负 volume');
const clips=data.clips.map(x=>path.resolve(base,x)); const sounds=audios.map(x=>path.resolve(base,x.file));
for(const f of [...clips,...sounds]) await fs.access(f);
try{await fs.access(output);throw new Error('目标已存在，不会覆盖：'+output);}catch(e){if(e.code!=='ENOENT')throw e;}
const args=['-hide_banner','-loglevel','error','-n','-filter_complex_threads','1'];
for(const f of [...clips,...sounds]) args.push('-i',f);
const filters=clips.map((_,i)=>`[${i}:v]scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=24,settb=AVTB,format=yuv420p[v${i}]`);
filters.push(`${clips.map((_,i)=>`[v${i}]`).join('')}concat=n=${clips.length}:v=1:a=0[outv]`);
if(audios.length){audios.forEach((a,i)=>{const ms=Math.round((a.start??0)*1000);filters.push(`[${clips.length+i}:a]aresample=48000,adelay=${ms}|${ms},volume=${a.volume??1}[a${i}]`);});filters.push(`${audios.map((_,i)=>`[a${i}]`).join('')}amix=inputs=${audios.length}:duration=longest:normalize=0,alimiter=limit=0.92,apad[outa]`);}
args.push('-filter_complex',filters.join(';'),'-map','[outv]');
if(audios.length) args.push('-map','[outa]','-c:a','aac','-b:a','192k','-shortest');
args.push('-c:v','libx264','-crf','18','-preset','medium','-movflags','+faststart',output);
const r=spawnSync('ffmpeg',args,{stdio:'inherit'});if(r.error||r.status!==0)throw new Error('合成失败：'+(r.error?.message||r.status));
console.log('已合成 '+output);
