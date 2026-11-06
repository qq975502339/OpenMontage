import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';

// Run from the engine directory. Pass component IDs to render only those previews.
const all='concept panel chart bars bubble comment stamp meme slider ruler arrow scribble icon people photo toon doc pillar roof formula flag entity txt spark box tag coin note stack coinflow paperbarh'.split(' ');
const ids=process.argv.slice(2).length?process.argv.slice(2):all;
const chrome=process.env.CHROME_PATH || (process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined);
const browserExecutable=chrome && fs.existsSync(chrome)?chrome:undefined;
const serveUrl=await bundle({entryPoint:path.resolve('preview/batch-preview.tsx'),publicDir:path.resolve('public')});
const out=path.resolve('previews'); fs.mkdirSync(out,{recursive:true});
for(const id of ids){
 if(!all.includes(id)) throw new Error(`Unknown preview: ${id}`);
 const composition=await selectComposition({serveUrl,id,browserExecutable,chromiumOptions:{gl:'swangle'}});
 await renderMedia({serveUrl,composition,browserExecutable,codec:'h264',outputLocation:path.join(out,`${id}.mp4`),chromiumOptions:{gl:'swangle'},concurrency:2});
 console.log(`Rendered ${id}`);
}
