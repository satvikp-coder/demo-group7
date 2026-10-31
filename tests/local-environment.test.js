import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,copyFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

test('Docker launcher shares only Groq defaults and preserves local configuration precedence',async()=>{
 const root=mkdtempSync(join(tmpdir(),'heritage-env-test-'));
 const repository=fileURLToPath(new URL('../',import.meta.url));
 try{
  for(const directory of ['scripts','backend'])mkdirSync(join(root,directory));
  for(const file of ['local-stack.js','run.js'])copyFileSync(join(repository,'scripts',file),join(root,'scripts',file));
  writeFileSync(join(root,'package.json'),'{"type":"module"}');
  writeFileSync(join(root,'backend/package.json'),'{}');
  const local='HTTP_PORT=8080\nCORS_ORIGIN=http://localhost:8080\nDATABASE_URL=local-database\n';
  writeFileSync(join(root,'.env.local-production'),local);
  const {localEnvironment}=await import(pathToFileURL(join(root,'scripts/local-stack.js')));
  const saved=Object.fromEntries(['GROQ_API_KEY','GROQ_MODEL'].map(key=>[key,process.env[key]]));
  try{
   for(const key of Object.keys(saved))delete process.env[key];
   assert.equal(localEnvironment().DATABASE_URL,'local-database');
   writeFileSync(join(root,'backend/.env'),'GROQ_API_KEY="test-only-value"\nGROQ_MODEL=test-model\nDATABASE_URL=other-database\nJWT_SECRET=not-imported\n');
   const shared=localEnvironment();
   assert.equal(shared.GROQ_API_KEY,'test-only-value');
   assert.equal(shared.GROQ_MODEL,'test-model');
   assert.equal(shared.DATABASE_URL,'local-database');
   assert.equal(shared.JWT_SECRET,process.env.JWT_SECRET);
   process.env.GROQ_MODEL='shell-model';
   assert.equal(localEnvironment().GROQ_MODEL,'shell-model');
   writeFileSync(join(root,'.env.local-production'),local+'GROQ_MODEL=local-model\n');
   assert.equal(localEnvironment().GROQ_MODEL,'local-model');
  }finally{
   for(const [key,value]of Object.entries(saved))if(value===undefined)delete process.env[key];else process.env[key]=value;
  }
 }finally{
  assert.equal(resolve(root).startsWith(resolve(tmpdir())+'\\heritage-env-test-')||resolve(root).startsWith(resolve(tmpdir())+'/heritage-env-test-'),true);
  rmSync(root,{recursive:true,force:true});
 }
});
