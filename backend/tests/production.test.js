import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {once} from 'node:events';
import express from 'express';
process.env.NODE_ENV='test';
process.env.DATABASE_URL='postgresql://localhost:1/unused_test_database';
process.env.JWT_SECRET=randomBytes(48).toString('hex');
process.env.PORT='5000';
process.env.CORS_ORIGIN='https://frontend.example.test,https://other.example.test';
const {createApp}=await import('../server.js');
const {loadEnv}=await import('../config/env.js');
const {poolOptions}=await import('../config/poolOptions.js');
const {limiter}=await import('../middleware/production.js');
const {verifyAccount}=await import('../middleware/auth.js');
const {pool}=await import('../config/database.js');
const {errorHandler}=await import('../middleware/errorHandler.js');
async function serve(app, action) {
 const server=app.listen(0,'127.0.0.1');await once(server,'listening');
 try{await action('http://127.0.0.1:'+server.address().port);}
 finally{await new Promise(r=>server.close(r));}
}
test('production configuration rejects insecure public origins and privileged signup',()=>{
 assert.throws(()=>loadEnv({...process.env,NODE_ENV:'production',CORS_ORIGIN:'http://public.example.test'}),/HTTPS/);
 assert.throws(()=>loadEnv({...process.env,NODE_ENV:'production',ALLOW_OPERATOR_REGISTRATION:'true'}),/operator/);
 assert.throws(()=>loadEnv({...process.env,NODE_ENV:'production',JWT_SECRET:'a'.repeat(48)}),/random/);
 assert.equal(loadEnv({...process.env,NODE_ENV:'production'}).ALLOW_OPERATOR_REGISTRATION,false);
});
test('database SSL verifies certificates, URL overrides rejected, pooling bounded',()=>{
 const options=poolOptions({...process.env,DATABASE_SSL:'verify-full'});
 assert.equal(options.ssl.rejectUnauthorized,true);assert.equal(options.max,10);assert.equal(options.statement_timeout,15000);
 assert.throws(()=>poolOptions({...process.env,DB_POOL_MAX:'0'}),/DB_POOL_MAX/);
 assert.throws(()=>poolOptions({...process.env,DATABASE_URL:process.env.DATABASE_URL+'?sslmode=no-verify'}),/URL SSL/);
});
test('liveness independent of DB; readiness fails and recovers without exposing details',async()=>{
 let available=true;
 await serve(createApp({checkDatabase:async()=>{if(!available)throw new Error('private connection password');}}),async url=>{
  assert.equal((await fetch(url+'/ready')).status,200);
  available=false;const failed=await fetch(url+'/ready');assert.equal(failed.status,503);assert.deepEqual(await failed.json(),{status:'unavailable'});
  assert.equal((await fetch(url+'/health')).status,200);
  available=true;assert.equal((await fetch(url+'/ready')).status,200);
 });
});
test('security headers, request IDs, restrictive multi-origin CORS and body limits',async()=>{
 await serve(createApp(),async url=>{
  for(const origin of process.env.CORS_ORIGIN.split(',')) {
   const response=await fetch(url+'/health',{headers:{Origin:origin}});
   assert.equal(response.headers.get('access-control-allow-origin'),origin);
   assert.equal(response.headers.get('x-content-type-options'),'nosniff');
   assert.equal(response.headers.get('x-frame-options'),'SAMEORIGIN');
   assert.match(response.headers.get('x-request-id'),/^[a-f0-9-]{36}$/);
   assert.ok(response.headers.get('content-security-policy'));
  }
  const denied=await fetch(url+'/health',{headers:{Origin:'https://evil.example.test'}});assert.equal(denied.status,403);assert.equal(denied.headers.get('access-control-allow-origin'),null);
  assert.equal((await fetch(url+'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'x'.repeat(110000)})})).status,413);
 });
});
test('database DNS, socket and pool failures return sanitized retryable 503',async()=>{
 const app=express();
 app.get('/:code',(req,res,next)=>next(Object.assign(new Error('private connection details'),{code:req.params.code})));
 app.use(errorHandler);
 await serve(app,async url=>{
  for(const code of ['ENOTFOUND','EAI_AGAIN','ECONNRESET','EPIPE','ENETUNREACH','EHOSTUNREACH','ECONNREFUSED','08001','57P01']){
   const response=await fetch(url+'/'+code);assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:{message:'Service temporarily unavailable'}});
  }
  const unexpected=await fetch(url+'/XX000');assert.equal(unexpected.status,500);assert.deepEqual(await unexpected.json(),{error:{message:'Internal server error'}});
 });
});
test('rate limiting returns 429, Retry-After and sanitized JSON',async()=>{
 const app=express();app.use(limiter('test',2));app.get('/',(req,res)=>res.json({ok:true}));
 await serve(app,async url=>{
  assert.equal((await fetch(url)).status,200);assert.equal((await fetch(url)).status,200);
  const blocked=await fetch(url);assert.equal(blocked.status,429);assert.ok(blocked.headers.get('retry-after'));assert.deepEqual(await blocked.json(),{error:{message:'Too many requests. Please try again later.'}});
 });
});
test('code-less pg connection and pool timeouts return 503; unrelated errors stay 500',async()=>{
 const messages=['timeout exceeded when trying to connect','Connection terminated due to connection timeout','Connection terminated unexpectedly','Connection terminated','timeout expired','Query read timeout','Client has encountered a connection error and is not queryable','Client was closed and is not queryable'];
 const app=express();app.get('/:index',(req,res,next)=>next(new Error(messages[Number(req.params.index)]??'Unrelated private application failure')));app.use(errorHandler);
 await serve(app,async url=>{
  for(let index=0;index<messages.length;index++){
   const response=await fetch(url+'/'+index);assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:{message:'Service temporarily unavailable'}});
  }
  const unrelated=await fetch(url+'/99');assert.equal(unrelated.status,500);assert.deepEqual(await unrelated.json(),{error:{message:'Internal server error'}});
 });
});
test('deleted accounts rejected and roles re-read instead of trusting stale JWT',async()=>{
 const original=pool.query;let account={role:'tourist'};
 pool.query=async()=>({rows:account?[account]:[]});
 const app=express();app.use((req,res,next)=>{req.user={id:'existing',role:'tour_operator'};next();});app.get('/',verifyAccount,(req,res)=>res.json(req.user));app.use(errorHandler);
 try{await serve(app,async url=>{assert.equal((await (await fetch(url)).json()).role,'tourist');account=null;assert.equal((await fetch(url)).status,401);});}
 finally{pool.query=original;}
});
