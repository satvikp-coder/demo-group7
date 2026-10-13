// Compare only count/digests with the private pre-chat snapshot; no row data leaves PostgreSQL.
import {execFileSync} from "node:child_process";
import {readFileSync,writeFileSync} from "node:fs";
import {localArgs,localRoot,localEnvironment} from "./local-stack.js";
const tables=["destinations","attractions","hotels","restaurants","routes","users","trips","itinerary_stops","budgets"];
const parts=tables.map(table=>"SELECT '"+table+"' AS table,count(*)::int AS count,md5(string_agg(to_jsonb(t)::text,'' ORDER BY id)) AS fingerprint FROM "+table+" t");
const sql="BEGIN READ ONLY; SELECT json_agg(r) FROM ("+parts.join(" UNION ALL ")+") r; COMMIT;";
try{
 const raw=execFileSync("docker",[...localArgs,"exec","-T","postgres","psql","-U","heritage_owner","-d","heritage_planner","-At","-v","ON_ERROR_STOP=1","-c",sql],{cwd:localRoot,env:localEnvironment(),encoding:"utf8",windowsHide:true,stdio:["ignore","pipe","pipe"]});
 const current=JSON.parse(raw.slice(raw.indexOf("["),raw.lastIndexOf("]")+1));
 const before=JSON.parse(readFileSync(new URL("../backups/chat-live-preservation.json",import.meta.url),"utf8").replace(/^\uFEFF/,""));
 const results=current.map(row=>{const original=before.find(r=>r.table===row.table);return {table:row.table,count:row.count,preserved:Boolean(original&&row.count===Number(original.count)&&row.fingerprint===original.fingerprint)};});
 const report={checkedAt:new Date().toISOString(),verified:results.every(r=>r.preserved),readOnly:true,tables:results};
 writeFileSync(new URL("../reports/heritage-guide-preservation.json",import.meta.url),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));if(!report.verified)process.exitCode=1;
}catch{
 console.error("Preservation check could not read the local PostgreSQL digests or private pre-chat snapshot. No records were modified.");process.exitCode=1;
}
