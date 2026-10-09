import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(new URL('../frontend/package.json',import.meta.url)),ts=require('typescript');
function attrs(name,text){const ast=ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),rows=[];function visit(n){if(ts.isJsxAttribute(n)&&['className','style'].includes(n.name.getText(ast)))rows.push(n.getText(ast));ts.forEachChild(n,visit)}visit(ast);return rows.sort()}
const baseline=JSON.parse(readFileSync('reports/BASELINE_COMPONENT_SOURCES.json','utf8'));
const itineraryApproved=JSON.parse(readFileSync('reports/ITINERARY_APPROVED_CHANGES.json','utf8')).files;
const rows=Object.entries(baseline).map(([path,text])=>{
 const current=readFileSync(path,'utf8');
 const restored=path==='frontend/src/components/Navbar.tsx' ? current
  .replace('hidden lg:flex items-center space-x-6 text-sm font-medium','hidden md:flex items-center space-x-6 text-sm font-medium')
  .replace('lg:hidden flex items-center gap-2','md:hidden flex items-center gap-2')
  .replace('lg:hidden bg-ink border-t border-stone/30 px-4 pt-4 pb-6 space-y-3','md:hidden bg-ink border-t border-stone/30 px-4 pt-4 pb-6 space-y-3') : current;
 return {path,approvedRequestedFeature:itineraryApproved[path]?.sha256===createHash('sha256').update(readFileSync(path)).digest('hex'),preserved:JSON.stringify(attrs(path,text))===JSON.stringify(attrs(path,current)),approvedBreakpointOnly:path==='frontend/src/components/Navbar.tsx' && JSON.stringify(attrs(path,text))===JSON.stringify(attrs(path,restored))};
});
const report={verified:rows.every(r=>r.preserved||r.approvedBreakpointOnly||r.approvedRequestedFeature),components:rows};writeFileSync('reports/FINAL_STYLE_PRESERVATION.json',JSON.stringify(report,null,2));assert.ok(report.verified,'Existing class/style attributes must remain unchanged');console.log(`${rows.length} component files retain styling, with exact-hash reviewed requested features and verified responsive repairs: PASS`);
