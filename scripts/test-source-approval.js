import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const path='frontend/src/utils/shareUrl.ts',original=readFileSync(path);
try {
 writeFileSync(path,Buffer.concat([original,Buffer.from('\n// unapproved guard regression probe\n')]));
 const result=spawnSync(process.execPath,['scripts/source-audit.js'],{encoding:'utf8'});
 assert.notEqual(result.status,0,'unapproved edit must fail preservation guard');
} finally {writeFileSync(path,original);}
const result=spawnSync(process.execPath,['scripts/source-audit.js'],{encoding:'utf8'});
assert.equal(result.status,0,result.stderr);console.log('Exact approved hashes accept reviewed repairs and reject subsequent edits: PASS');
