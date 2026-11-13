import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const main=readFileSync('src/Main.tsx','utf8');
const source=readFileSync('src/els7.tsx','utf8');
for(const k of ['timeline6','pie6','flow6','tree6','map6','vs6','graph6']) assert.match(source,new RegExp('\\b'+k+'\\b'));
assert.match(main,/\.\.\.ELS7/);
assert.doesNotMatch(source,/ELS7[^\n]*\bline6\s*:/);
console.log('Seven layouts registered without line6');
