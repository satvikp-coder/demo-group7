import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from '../../frontend/node_modules/typescript/lib/typescript.js';
const root=path.resolve(import.meta.dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,'');
const original=JSON.parse(read('backend/reports/completion-functionality-before.json'));
function jsx(source,file){
 const parsed=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const attributes=[],tags=[],controls=[];
 function walk(n){
  if(ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n))tags.push(n.tagName.getText(parsed));
  if(ts.isJsxAttribute(n)){
   const name=n.name.getText(parsed);
   if(['className','style'].includes(name))attributes.push(n.getText(parsed));
   if(['onClick','onChange','onSubmit','href'].includes(name))controls.push({line:parsed.getLineAndCharacterOfPosition(n.getStart()).line+1,attribute:name,handler:n.initializer?.getText(parsed)});
  }
  ts.forEachChild(n,walk);
 }walk(parsed);return {attributes,tags,controls};
}
const styleChecks=Object.entries(original).filter(([f])=>f.endsWith('.tsx')).map(([file,before])=>{
 const a=jsx(before,file),b=jsx(read(file),file);
 return {file,stylesUnchanged:JSON.stringify(a.attributes)===JSON.stringify(b.attributes),jsxElementSequenceUnchanged:JSON.stringify(a.tags)===JSON.stringify(b.tags),attributesChecked:a.attributes.length};
});
const baseline=JSON.parse(read('backend/reports/completion-source-baseline.json'));
const changes=[];
for(const [relative,hash]of Object.entries(baseline)){
 const absolute=path.join(root,relative);
 const current=crypto.createHash('sha256').update(fs.readFileSync(absolute)).digest('hex').toUpperCase();
 if(current!==hash)changes.push(path.relative(root,absolute).replaceAll('\\','/'));
}
const inventory=[];
for(const file of fs.readdirSync(path.join(root,'frontend/src/components')).filter(f=>f.endsWith('.tsx'))){
 const relative='frontend/src/components/'+file;
 inventory.push({file:relative,controls:jsx(read(relative),relative).controls});
}
const report={checkedAt:new Date().toISOString(),baselineFiles:Object.keys(baseline).length,changedFiles:changes,styleChecks,sourceControls:inventory,verified:styleChecks.every(c=>c.stylesUnchanged&&c.jsxElementSequenceUnchanged),limits:'Source preservation proof, not pixel-diff certification. Existing dynamic transit text now says Unknown (excluded) when the API says fares are unknown.'};
fs.writeFileSync(path.join(root,'backend/reports/completion-frontend-preservation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({verified:report.verified,changedFiles:changes,styleChecks,controlCount:inventory.reduce((n,f)=>n+f.controls.length,0)}));
if(!report.verified)process.exitCode=1;
