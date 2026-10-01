import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,openSync,closeSync,readFileSync,unlinkSync} from 'node:fs';
export const reportDir=new URL('../backend/reports/production/',import.meta.url);
mkdirSync(reportDir,{recursive:true});
export async function run(command,args,{env=process.env,cwd=process.cwd(),name='command',quiet=false,allowFailure=false}={}) {
  const child=spawn(command,args,{env,cwd,windowsHide:true,stdio:['ignore','pipe','pipe']});
  let output='';
  for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{output+=chunk;});
  const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});
  for(const key of ['DATABASE_URL','DATABASE_ADMIN_URL','JWT_SECRET','POSTGRES_PASSWORD','POSTGRES_APP_PASSWORD','PGPASSWORD'])if(env[key])output=output.replaceAll(env[key],'[redacted]');
  writeFileSync(new URL(name+'.txt',reportDir),output);
  if(!quiet)console.log(name+': '+(code===0?'PASS':'FAIL ('+code+')'));
  if(code!==0&&!allowFailure)throw new Error(name+' failed; see production/'+name+'.txt');
  return {code,output};
}
export function npm(args,options={}) {
  if(!process.env.npm_execpath)throw new Error('Run this script through npm');
  return run(process.execPath,[process.env.npm_execpath,...args],options);
}
export async function waitFor(url,timeout=60000) {
  const end=Date.now()+timeout;
  while(Date.now()<end) {try{if((await fetch(url,{signal:AbortSignal.timeout(3000)})).ok)return;}catch{}await new Promise(r=>setTimeout(r,500));}
  throw new Error('Service did not become ready');
}

export function suiteLock() {
  const file=new URL('suite.lock',reportDir);
  try { const fd=openSync(file,'wx');writeFileSync(fd,String(process.pid));closeSync(fd); }
  catch(error) {
    if(error.code!=='EEXIST')throw error;
    const pid=Number(readFileSync(file,'utf8'));
    let alive=true;try{process.kill(pid,0);}catch{alive=false;}
    if(alive)throw new Error('Another full/production suite is active; shared evidence writers must run sequentially');
    unlinkSync(file);return suiteLock();
  }
  return ()=>unlinkSync(file);
}
