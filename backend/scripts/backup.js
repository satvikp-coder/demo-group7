import dotenv from 'dotenv';
import {spawn} from 'node:child_process';
import {createWriteStream,createReadStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import {once} from 'node:events';
import {pathToFileURL} from 'node:url';
dotenv.config({path:new URL('../.env',import.meta.url),quiet:true});
export async function databaseArchive(mode, filename, source=process.env) {
  if (!['backup','restore'].includes(mode) || !filename) throw new Error('Usage: backup.js backup|restore FILE [--container NAME]');
  const url=new URL(source.DATABASE_URL);
  const db=decodeURIComponent(url.pathname.slice(1)), user=decodeURIComponent(url.username);
  const env={...process.env,PGHOST:url.hostname,PGPORT:url.port||'5432',PGDATABASE:db,PGUSER:user,PGPASSWORD:decodeURIComponent(url.password),
    PGSSLMODE:source.DATABASE_SSL==='verify-full'?'verify-full':'disable', ...(source.DATABASE_SSL_CA_FILE?{PGSSLROOTCERT:source.DATABASE_SSL_CA_FILE}:{})};
  const container=source.PG_TOOLS_CONTAINER;
  const tool=mode==='backup'?'pg_dump':'pg_restore';
  const args=mode==='backup'?['--format=custom','--no-owner','--no-acl']:['--exit-on-error','--single-transaction','--no-owner','--no-acl','--dbname',db];
  if(mode==='restore') {
    // Restore only into an empty DB. No --clean, DROP or destructive rollback option.
    if(container){
      const check=spawn('docker',['exec',container,'psql','-U',user,'-d',db,'-At','-v','ON_ERROR_STOP=1','-c',"SELECT count(*) FROM information_schema.tables WHERE table_schema='public'"],{env,windowsHide:true,stdio:['ignore','pipe','ignore']});
      let count='';check.stdout.on('data',chunk=>{count+=chunk;});
      const [status]=await once(check,'close');
      if(status!==0||count.trim()!=='0')throw new Error('Restore requires an accessible empty database');
    }else{
    const {createPool}=await import('./database.js');
    const old=process.env.DATABASE_URL;process.env.DATABASE_URL=source.DATABASE_URL;
    const pool=createPool();
    try {if((await pool.query("SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public'")).rows[0].n) throw new Error('Restore requires an empty database');}
    finally{await pool.end();process.env.DATABASE_URL=old;}
    }
  }
  const command=container?'docker':tool;
  const toolArgs=container?['exec','-i',container,tool,'-U',user,...(mode==='backup'?['-d',db]:[]),...args]:args;
  const child=spawn(command,toolArgs,{env,windowsHide:true,stdio:['pipe','pipe','pipe']});
  const completion=once(child,'close');
  // Tool stderr may contain connection details: consume but never print it.
  child.stderr.resume();
  if(mode==='backup') {child.stdin.end();await pipeline(child.stdout,createWriteStream(filename,{flags:'wx',mode:0o600}));}
  else {child.stdout.resume();await pipeline(createReadStream(filename),child.stdin);}
  const [code]=await completion;if(code!==0)throw new Error('Database archive operation failed; check tool access/version');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{await databaseArchive(process.argv[2],process.argv[3]);console.log('Database archive operation complete.');}
  catch{console.error('Database archive operation failed. Restore target must be empty; verify PostgreSQL tools, access, TLS and file path.');process.exitCode=1;}
}
