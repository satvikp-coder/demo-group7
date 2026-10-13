// Opt-in live inference through the installed backend. Public catalog only; no account writes.
import {execFileSync} from "node:child_process";
import {writeFileSync} from "node:fs";
import {localArgs,localRoot,localEnvironment} from "./local-stack.js";
const code=`import {randomUUID} from 'node:crypto';
import {chat} from './services/chatService.js';
import {chatConfig} from './chat/config.js';
import {pool} from './config/database.js';
try{
 const config=chatConfig();if(!config.freeConfirmed||!config.apiKey||config.mock)throw Error('Owner-confirmed live Free-plan configuration required');
 const result=await chat(randomUUID(),{message:'Tell me about Modhera.',language:'en'});
 if(result.mode!=='ai'||!/Modhera/i.test(result.reply))throw Error('Expected a database-grounded Modhera response');
 console.log(JSON.stringify({checkedAt:new Date().toISOString(),verified:true,model:config.model,mode:result.mode,reply:result.reply,scope:'Internal container service, public catalog only; authenticated HTTP/browser tested separately'}));
}finally{await pool.end();}`;
try{
 const output=execFileSync("docker",[...localArgs,"exec","-T","backend","node","--import","tsx","--input-type=module","-e",code],{cwd:localRoot,env:localEnvironment(),encoding:"utf8",windowsHide:true,timeout:35000,stdio:["ignore","pipe","pipe"]});
 const report=JSON.parse(output.trim());
 writeFileSync(new URL("../reports/heritage-guide-container-live.json",import.meta.url),JSON.stringify(report,null,2));
 console.log(JSON.stringify({verified:report.verified,model:report.model,scope:report.scope}));
}catch{
 console.error("Installed live chat check failed. Inspect backend readiness, Free-plan configuration and provider quota without printing credentials.");process.exitCode=1;
}
