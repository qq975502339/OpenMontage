import assert from 'node:assert/strict';
import fs from 'node:fs';
assert.ok(fs.existsSync('public/fx/editorial-background.png'));
assert.match(fs.readFileSync('src/bg.tsx','utf8'),/editorial-background\.png/);
assert.doesNotMatch(fs.readFileSync('src/components/EditorialTitleCard.tsx','utf8'),/editorial-background\.png/);
assert.doesNotMatch(fs.readFileSync('src/components/EditorialEndCard.tsx','utf8'),/editorial-background\.png/);
console.log('personal background is wired');
