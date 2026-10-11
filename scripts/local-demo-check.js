// Read-only installed-stack checks: no login, account writes, imports or migrations.
import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {localEnvironment,localArgs,localRoot} from './local-stack.js';

const report={checkedAt:new Date().toISOString(),readOnly:true,ready:false,checks:[]};
async function check(name,recovery,task){
 try{const detail=await task();report.checks.push({name,passed:true,detail});console.log('PASS '+name);}
 catch(error){const message=error.message;report.checks.push({name,passed:false,message,recovery});console.error('FAIL '+name+': '+message+'\n  Recovery: '+recovery);}
}
let env,base;
await check('local configuration','npm run local:up',()=>{
 env=localEnvironment();
 for(const key of ['DATABASE_URL','DATABASE_ADMIN_URL','JWT_SECRET','POSTGRES_PASSWORD','POSTGRES_APP_PASSWORD'])if(!env[key])throw new Error('Missing '+key);
 if(env.JWT_SECRET.length<32)throw new Error('JWT_SECRET must contain at least 32 characters');
 base='http://127.0.0.1:'+env.HTTP_PORT;
 return {origin:env.CORS_ORIGIN,secretsPrinted:false};
});
if(base){
 const get=async path=>fetch(base+path,{signal:AbortSignal.timeout(10000),redirect:'error'});
 await check('frontend and deep-link fallback','npm run local:up',async()=>{
  for(const path of ['/','/explore']){const r=await get(path);if(!r.ok||!r.headers.get('content-type')?.includes('text/html')||!(await r.text()).includes('id="root"'))throw new Error(path+' did not return the application HTML');}
 });
 await check('backend and database readiness','npm run local:status; npm run local:up',async()=>{
  for(const [path,status] of [['/health','ok'],['/ready','ready']]){const r=await get(path);if(!r.ok||(await r.json()).status!==status)throw new Error(path+' is unavailable');}
 });
 await check('catalog availability','npm run local:status (inspect existing data; do not reset)',async()=>{
  const r=await get('/api/destinations/catalog?limit=100');if(!r.ok)throw new Error('Catalog HTTP '+r.status);
  const body=await r.json();const rows=Array.isArray(body)?body:body.destinations??body.data;
  if(!Array.isArray(rows)||rows.length!==8)throw new Error('Expected the eight existing destinations');
  const counts={destinations:rows.length,attractions:0,hotels:0,restaurants:0};
  for(const row of rows)for(const key of ['attractions','hotels','restaurants']){if(!Array.isArray(row[key])||!row[key].length)throw new Error(row.name+' has no '+key);counts[key]+=row[key].length;}
  return counts;
 });
 await check('protected itinerary endpoint','npm run local:up; inspect authentication configuration',async()=>{
  const r=await fetch(base+'/api/trips/00000000-0000-4000-8000-000000000000/generate-itinerary',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(10000)});
  if(r.status!==401)throw new Error('Expected unauthenticated 401, received '+r.status);
  return 'Missing credentials rejected before any trip lookup/write; authenticated generation requires the separate browser suite.';
 });
 await check('installed migration checksums','npm run local:backup -- backups/before-demo-repair.dump; npm run local:up',()=>{
  const sql="BEGIN READ ONLY; SELECT coalesce(json_agg(json_build_object('name',name,'sha256',sha256)), '[]') FROM schema_migrations; COMMIT;";
  let output;
  try{output=execFileSync('docker',[...localArgs,'exec','-T','postgres','psql','-U','heritage_owner','-d','heritage_planner','-At','-v','ON_ERROR_STOP=1','-c',sql],{cwd:localRoot,env,encoding:'utf8',windowsHide:true,timeout:20000,stdio:['ignore','pipe','pipe']});}
  catch{throw new Error('Could not inspect migration ledger through local PostgreSQL container');}
  const rows=JSON.parse(output.split(/\r?\n/).find(line=>line.startsWith('['))??'[]');
  const files=[['000-schema.sql',new URL('../database/schema/schema.sql',import.meta.url)],...readdirSync(new URL('../backend/migrations/',import.meta.url)).filter(n=>/^\d+.*\.sql$/.test(n)).map(n=>[n,new URL('../backend/migrations/'+n,import.meta.url)])];
  for(const [name,url] of files){const hash=createHash('sha256').update(readFileSync(url,'utf8')).digest('hex');if(rows.find(r=>r.name===name)?.sha256!==hash)throw new Error('Missing or mismatched migration: '+name);}
  return {verified:files.length};
 });
 await check('locally served image bytes','npm run local:up; npm run audit:images',async()=>{
  let count=0;
  async function walk(url,path){for(const entry of readdirSync(url,{withFileTypes:true})){const next=new URL(entry.name+(entry.isDirectory()?'/':''),url),relative=path+entry.name;if(entry.isDirectory())await walk(next,relative+'/');else if(/\.(webp|png|jpe?g|svg|ico)$/i.test(entry.name)){
   const r=await get('/'+relative);if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw new Error(relative+' is not served as an image');
   const bytes=Buffer.from(await r.arrayBuffer()),expected=readFileSync(next);if(!bytes.equals(expected))throw new Error(relative+' differs from the source asset; rebuild local stack');count++;
  }}}
  await walk(new URL('../frontend/public/',import.meta.url),'');return {assets:count,scope:'Byte identity and content types; image decoding is covered by browser/image audit tests.'};
 });
}
report.ready=report.checks.length===7&&report.checks.every(c=>c.passed);
writeFileSync(new URL('../reports/phase3-local-demo-check.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(report.ready?'Local environment checks passed. Run the documented authenticated demonstration before presenting.':'Local environment is not ready; repair failed checks above.');
process.exitCode=report.ready?0:1;
