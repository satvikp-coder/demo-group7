import {randomBytes} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve} from 'node:path';
import {run,waitFor} from './run.js';
export const localRoot=fileURLToPath(new URL('../',import.meta.url));
const envFile=new URL('../.env.local-production',import.meta.url);
export function localEnvironment(create=false){
 if(!existsSync(envFile)){
  if(!create)throw new Error('Run npm run local:up first.');
  const port=Number(process.env.LOCAL_HTTP_PORT??8080);
  if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('LOCAL_HTTP_PORT must be1024–65535');
  const owner=randomBytes(24).toString('hex'),app=randomBytes(24).toString('hex');
  writeFileSync(envFile,[
   '# Generated private LOCAL settings. Preserve this file with its Docker volume.',
   'POSTGRES_PASSWORD='+owner,'POSTGRES_APP_PASSWORD='+app,
   'DATABASE_URL=postgresql://heritage_app:'+app+'@postgres:5432/heritage_planner',
   'DATABASE_ADMIN_URL=postgresql://heritage_owner:'+owner+'@postgres:5432/heritage_planner',
   'JWT_SECRET='+randomBytes(48).toString('hex'),'HTTP_PORT='+port,'CORS_ORIGIN=http://localhost:'+port,'',
  ].join('\n'),{flag:'wx',mode:0o600});
 }
 const values=Object.fromEntries(readFileSync(envFile,'utf8').split(/\r?\n/).filter(line=>line&&!line.startsWith('#')).map(line=>{const i=line.indexOf('=');if(i<1)throw new Error('Invalid local environment file');return [line.slice(0,i),line.slice(i+1)];}));
 if(values.CORS_ORIGIN!=='http://localhost:'+values.HTTP_PORT)throw new Error('Local origin must match HTTP_PORT at localhost');
 return {...process.env,...values};
}
export const localArgs=['compose','--env-file',fileURLToPath(envFile),'-p','heritage-local','-f','compose.yml','-f','compose.local.yml'];
export const localCompose=(args,name,env=localEnvironment())=>run('docker',[...localArgs,...args],{cwd:localRoot,env,name});
export async function localAction(action,args=[]){
 const env=localEnvironment(action==='up'),origin=env.CORS_ORIGIN;
 if(action==='up'){
  await localCompose(['up','-d','--build','--wait','--wait-timeout','120'],'local-up',env);
  // Static nginx can retain a replaced upstream IP; re-resolve after a rebuild.
  await localCompose(['restart','frontend'],'local-edge-refresh',env);
  await waitFor(origin+'/ready');console.log('Production-like local application: '+origin);
 }else if(action==='stop')await localCompose(['stop'],'local-stop',env);
 else if(action==='status')await localCompose(['ps'],'local-status',env);
 else if(action==='restart'){
  await localCompose(['restart','postgres','backend','frontend'],'local-restart',env);
  await waitFor(origin+'/ready');console.log('Restart complete; saved PostgreSQL data preserved.');
 }else if(action==='seed'||action==='verify')await localCompose(['run','--rm','maintenance','npm','run',action==='seed'?'db:seed':'db:verify'],'local-'+action,env);
 else if(action==='operator'){
  if(args.length!==1||!/^\S+@\S+\.\S+$/.test(args[0]))throw new Error('Usage: npm run local:operator -- EMAIL');
  await localCompose(['run','--rm','maintenance','npm','run','operator:approve','--',args[0]],'local-operator',env);
 }else if(action==='backup'||action==='restore'){
  const {databaseArchive}=await import('../backend/scripts/backup.js');
  const id=(await localCompose(['ps','-q','postgres'],'local-postgres-id',env)).output.trim();
  const filename=resolve(localRoot,args[0]??'backups/local-'+Date.now()+'.dump');
  if(!filename.endsWith('.dump'))throw new Error('Archive filename must end in .dump');
  mkdirSync(dirname(filename),{recursive:true});
  let databaseUrl=env.DATABASE_ADMIN_URL;
  if(action==='restore'){
   if(!existsSync(filename))throw new Error('Backup archive does not exist');
   const name=args[1];
   if(!name||!/^local_restore_[a-z0-9_]{1,40}$/.test(name))throw new Error('Restore requires a NEW name: local_restore_<suffix>');
   await run('docker',['exec',id,'psql','-U','heritage_owner','-d','postgres','-v','ON_ERROR_STOP=1','-c','CREATE DATABASE '+name],{env,name:'local-create-restore-target'});
   const url=new URL(databaseUrl);url.pathname='/'+name;databaseUrl=url.href;
  }
  await databaseArchive(action,filename,{...env,DATABASE_URL:databaseUrl,PG_TOOLS_CONTAINER:id});
  if(action==='restore')await localCompose(['run','--rm','maintenance','npm','run','db:migrate'],'local-restored-runtime-grants',{...env,DATABASE_ADMIN_URL:databaseUrl});
  console.log(action==='backup'?'Backup created: '+filename:'Restored into '+args[1]+'. Active application database was preserved.');
 }else throw new Error('Unknown local action');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{await localAction(process.argv[2],process.argv.slice(3));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
