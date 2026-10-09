import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const baseline=path.resolve(root,'../demo-group7-release');
if(!existsSync(baseline))throw new Error('This local preservation review requires the preserved release checkout.');
const require=createRequire(new URL('../frontend/package.json',import.meta.url));const ts=require('typescript');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const sha=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
function attributes(file){
 const ast=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),rows=[];
 function visit(node){if(ts.isJsxAttribute(node)&&['className','style'].includes(node.name.getText(ast)))rows.push(node.getText(ast));ts.forEachChild(node,visit)}visit(ast);return rows;
}
const report={sourceChanges:[],removedStyleAttributes:[],protectedFiles:[],errors:[]};
for(const rel of ['frontend/src','frontend/public','dsa','backend/controllers','backend/models','backend/services']){
 for(const before of walk(path.join(baseline,rel))){
  const name=path.relative(baseline,before),after=path.join(root,name);if(!existsSync(after)){report.errors.push('Missing '+name);continue}
  if(sha(before)===sha(after)){report.protectedFiles.push(name);continue}
  report.sourceChanges.push(name);
  if(before.endsWith('.tsx')){
   const remaining=attributes(after);
   for(const attr of attributes(before)){const index=remaining.indexOf(attr);if(index>=0)remaining.splice(index,1);else report.removedStyleAttributes.push({file:name,attribute:attr})}
  }
  if(name.startsWith('dsa')||name.startsWith('backend')||name.endsWith('.css'))report.errors.push('Unexpected protected runtime/style edit '+name);
 }
}
writeFileSync(new URL('../backend/reports/images/preservation.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify({unchanged:report.protectedFiles.length,changes:report.sourceChanges,removedExistingStyleAttributes:report.removedStyleAttributes.length,errors:report.errors.length}));
if(report.errors.length||report.removedStyleAttributes.length)process.exitCode=1;
