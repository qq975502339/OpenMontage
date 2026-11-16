import assert from 'node:assert/strict';
import {getPropShadow, looks} from '../src/prop-looks.mjs';
assert.equal(Object.keys(looks).length,20);
assert.match(getPropShadow(0), /0 12px 16px/);
assert.equal(getPropShadow(0,'chalk'),'');
assert.match(getPropShadow(0,'papercut'), /0 3px 4px/);
assert.match(getPropShadow(0,'pixel16'), /6px 6px 0/);
assert.match(getPropShadow(0,'neon'), /255,120,200/);
console.log('prop styles and legacy fallback pass');
