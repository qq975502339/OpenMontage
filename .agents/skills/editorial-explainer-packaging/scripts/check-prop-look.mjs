import fs from 'node:fs';
import path from 'node:path';
export function checkPropLook(root) {
  const shots=JSON.parse(fs.readFileSync(path.join(root,'src/data/shots.json'),'utf8'));
  const catalog=JSON.parse(fs.readFileSync(path.join(root,'public/prop_styles.json'),'utf8'));
  const valid=new Set(catalog.styles.map(x=>x.id));
  const values=[];
  if(shots.prop_look != null) values.push(['prop_look',shots.prop_look]);
  for(const [name,scene] of Object.entries(shots.scenes || {})) for(const element of scene.els || []) if(['prop','stack6'].includes(element.k) && element.look != null) values.push([`${name}.${element.k}.look`,element.look]);
  for(const [where,value] of values) if(typeof value!=='string'||!valid.has(value)) throw Error(`Invalid ${where}: ${JSON.stringify(value)}. Choose a style from public/prop_styles.json.`);
  if(shots.prop_look == null) console.warn('No prop_look configured: preserving existing project appearance.');
}
