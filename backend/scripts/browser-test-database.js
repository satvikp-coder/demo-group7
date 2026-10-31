import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

export async function browserTestDatabase(container=process.env.BROWSER_TEST_BACKEND_CONTAINER){
 if(!container)return (await import('../config/database.js')).pool;
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(container))throw new Error('Invalid browser test backend container');
 return {
  async query(text,values=[]){
   const code="import {pool} from './config/database.js';let input='';for await(const chunk of process.stdin)input+=chunk;try{const {text,values}=JSON.parse(input);const r=await pool.query(text,values);console.log(JSON.stringify({rows:r.rows,rowCount:r.rowCount}));}catch{process.exitCode=1;}finally{await pool.end();}";
   const result=spawnSync('docker',['exec','-i',container,'node','--input-type=module','-e',code],{input:JSON.stringify({text,values}),encoding:'utf8',windowsHide:true,maxBuffer:16*1024*1024});
   if(result.status!==0)throw new Error('Browser test database query failed');
   return JSON.parse(result.stdout);
  },
  async end(){}
 };
}

export async function assertBrowserCatalog(pool,api,request=fetch){
 const response=await request(api+'/destinations');
 assert.equal(response.status,200,'Browser API catalog is unavailable');
 const destinations=await response.json();
 assert.deepEqual(destinations.map(row=>row.id).sort(),(await pool.query('SELECT id FROM destinations ORDER BY id')).rows.map(row=>row.id).sort(),'Browser API and cleanup database destinations differ');
 for(const table of ['hotels','attractions','restaurants']){
  const ids=[];
  for(const city of destinations){
   const result=await request(api+'/destinations/'+city.id+'/'+table+'?limit=100');
   assert.equal(result.status,200,'Browser API child catalog is unavailable');
   ids.push(...(await result.json()).map(row=>row.id));
  }
  assert.deepEqual(ids.sort(),(await pool.query(`SELECT id FROM ${table} ORDER BY id`)).rows.map(row=>row.id).sort(),'Browser API and cleanup database '+table+' differ');
 }
}

export async function removeBrowserUsers(pool,ids){
 for(const id of ids){
  await pool.query('DELETE FROM users WHERE id=$1',[id]);
  assert.equal((await pool.query('SELECT id FROM users WHERE id=$1',[id])).rows.length,0,'Browser fixture user cleanup failed');
 }
}
