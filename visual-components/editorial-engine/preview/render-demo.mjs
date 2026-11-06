import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

// Bundle a temporary copy so the sample never overwrites the user's storyboard.
const root=process.cwd();
const temporary=await fs.mkdtemp(path.join(root,'preview','demo-runtime-'));
try {
  await fs.cp(path.join(root,'src'),path.join(temporary,'src'),{recursive:true});
  await fs.copyFile(path.join(root,'preview','demo-shots.json'),path.join(temporary,'src','data','shots.json'));
  const serveUrl=await bundle({entryPoint:path.join(temporary,'src','index.ts'),publicDir:path.join(root,'public')});
  const chrome=process.env.CHROME_PATH || (process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':undefined);
  const browserExecutable=chrome && fsSync.existsSync(chrome)?chrome:undefined;
  const composition=await selectComposition({serveUrl,id:'Main',browserExecutable,chromiumOptions:{gl:'swangle'}});
  await renderMedia({serveUrl,composition,browserExecutable,codec:'h264',outputLocation:path.join(root,'previews','personal-style-demo.mp4'),chromiumOptions:{gl:'swangle'},concurrency:2});
  console.log('Rendered previews/personal-style-demo.mp4');
} finally {
  await fs.rm(temporary,{recursive:true,force:true});
}
