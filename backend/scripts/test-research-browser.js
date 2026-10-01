import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createPool} from './database.js';
const root=fileURLToPath(new URL('../../',import.meta.url)),out=new URL('../reports/completion-research-browser-report.json',import.meta.url);
writeFileSync(out,JSON.stringify({verified:false,users:[],checks:[]}));
const pool=createPool();let result;
try {result=spawnSync('python',['tests/frontend/completion_research.py'],{cwd:root,stdio:'inherit'});}
finally {
 const report=JSON.parse(readFileSync(out,'utf8'));
 for(const id of report.users) await pool.query("DELETE FROM users WHERE id=$1 AND email LIKE 'completion-research-%@example.com'",[id]);
 report.cleanupCompleted=true;writeFileSync(out,JSON.stringify(report,null,2));await pool.end();
 console.log(JSON.stringify({verified:report.verified,checks:report.checks.length,cleanupCompleted:true}));
 if(!report.verified||result?.status!==0)process.exitCode=1;
}
