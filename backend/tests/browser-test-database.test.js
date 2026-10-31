import test from 'node:test';
import assert from 'node:assert/strict';
import {assertBrowserCatalog,browserTestDatabase,removeBrowserUsers} from '../scripts/browser-test-database.js';

const records={destinations:[{id:'city'}],hotels:[{id:'hotel'}],attractions:[{id:'site'}],restaurants:[{id:'meal'}]};
const request=async url=>({status:200,json:async()=>records[new URL(url).pathname.split('/').pop()]});
test('browser database preflight accepts matching catalogs using read-only SQL',async()=>{
 const pool={query:async sql=>{assert.match(sql,/^SELECT id FROM \w+ ORDER BY id$/);return {rows:records[sql.split(' ')[3]]};}};
 await assertBrowserCatalog(pool,'http://localhost/api',request);
});
test('browser database preflight rejects a different cleanup database before mutation',async()=>{
 const pool={query:async sql=>({rows:sql.includes('FROM hotels')?[]:records[sql.split(' ')[3]]})};
 await assert.rejects(assertBrowserCatalog(pool,'http://localhost/api',request),/cleanup database hotels differ/);
});
test('browser fixture cleanup verifies deletion and never uses a bulk delete',async()=>{
 const calls=[];
 await removeBrowserUsers({query:async(sql,args)=>{calls.push({sql,args});return {rows:[]};}},['fixture-id']);
 assert.deepEqual(calls,[{sql:'DELETE FROM users WHERE id=$1',args:['fixture-id']},{sql:'SELECT id FROM users WHERE id=$1',args:['fixture-id']}]);
 await assert.rejects(removeBrowserUsers({query:async()=>({rows:[{id:'fixture-id'}]})},['fixture-id']),/cleanup failed/);
});
test('browser database container selection rejects command arguments',async()=>{
 await assert.rejects(browserTestDatabase('--invalid-container'),/Invalid browser test backend container/);
});
