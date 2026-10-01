import {readdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const findings=[], privateFiles=[], assets=[];
let scanned=0;
const uiChanges=[],functionalFrontendChanges=[];
const baseline=JSON.parse(readFileSync(new URL('backend/reports/production-source-baseline.json',root),'utf8'));
function visit(dir,relative='') {
 for(const entry of readdirSync(dir,{withFileTypes:true})) {
  if(['node_modules','dist','.git','__pycache__'].includes(entry.name))continue;
  const path=relative+entry.name,url=new URL(entry.name,dir);
  if(entry.isDirectory()){visit(new URL(entry.name+'/',dir),path+'/');continue;}
  if(/^\.env(?:\.|$)/.test(entry.name)&&!entry.name.endsWith('.example')){privateFiles.push(path);continue;}
  if(path.startsWith('frontend/src/')||path.startsWith('frontend/public/')){
   const hash=createHash('sha256').update(readFileSync(url)).digest('hex');
   if(baseline[path]!==hash) {
    // Permit only this nonvisual PDF font-loading option. Reversing this exact
    // edit must reproduce the original whole-file hash, including every JSX byte.
    const pdfOptionOnly=path==='frontend/src/components/ItineraryView.tsx' && createHash('sha256').update(readFileSync(url,'utf8').replace('{ quality: 0.95, loadExternalStyleSheet: true }','{ quality: 0.95 }')).digest('hex')===baseline[path];
    const guardOnly=['frontend/src/components/AuthView.tsx','frontend/src/components/PlannerModal.tsx'].includes(path) && createHash('sha256').update(readFileSync(url,'utf8')
      .replace('useState, useRef }','useState }').replace('useState, useEffect, useRef }','useState, useEffect }')
      .replace('  const pendingRef = useRef(false);\r\n','')
      .replaceAll('if (pendingRef.current) return;','if (pending) return;').replaceAll('if(pendingRef.current) return;','if(pending) return;')
      .replaceAll('pendingRef.current = true; setPending(true);','setPending(true);')
      .replaceAll('pendingRef.current = false; setPending(false);','setPending(false);')).digest('hex')===baseline[path];
    let profileHandlersOnly=false;
    if(path==='frontend/src/components/ProfileDashboardView.tsx') {
      const before=JSON.parse(readFileSync(new URL('backend/reports/local-profile-before.json',root),'utf8'))[path];
      const current=readFileSync(url,'utf8'),renderStart='  if(request.loading)';
      profileHandlersOnly=createHash('sha256').update(before).digest('hex')===baseline[path]
        &&before.includes(renderStart)&&current.includes(renderStart)
        &&before.slice(before.indexOf(renderStart))===current.slice(current.indexOf(renderStart));
    }
    const authStateOnly=path==='frontend/src/App.tsx'&&createHash('sha256').update(readFileSync(url,'utf8')
      .replace('  const currentUser = authRequest.loading ? optimisticUser : (authRequest.data ?? null);\r\n','')
      .replace('const [optimisticUser, setCurrentUser]','const [currentUser, setCurrentUser]')
      .replace('  const [selectedDestination, setSelectedDestination] =','  useEffect(() => { setCurrentUser(authRequest.data ?? null); }, [authRequest.data]);\r\n  const [selectedDestination, setSelectedDestination] =')).digest('hex')===baseline[path];
    (path === "frontend/src/api/index.ts" || pdfOptionOnly || guardOnly || profileHandlersOnly || authStateOnly ? functionalFrontendChanges : uiChanges).push(path);
   }
  }
  if(/\.(jpg|jpeg|png|gif|ico)$/i.test(path))assets.push(path);
  if(!/\.(js|ts|tsx|json|md|txt|sql|yml|yaml|html|conf)$/.test(path))continue;
  if(path.endsWith('source-audit.js'))continue;
  const text=readFileSync(url,'utf8');scanned++;
  for(const [index,line]of text.split('\n').entries()){
   if(/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|AIza[A-Za-z0-9_-]{35}|eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/.test(line))findings.push({path,line:index+1,type:'secret-pattern'});
   const urls=line.match(/postgres(?:ql)?:\/\/[^\s"'`<>]+/g)??[];
   for(const value of urls){try{const u=new URL(value);if(u.password&&!/PASSWORD|REPLACE|YOUR|URL_ENCODED|\$|\{|\}|^pass$|^test$/i.test(u.password))findings.push({path,line:index+1,type:'database-credential'});}catch{}}
  }
 }
}
visit(root);
const report={checkedAt:new Date().toISOString(),scanned,findings,privateEnvironmentFilesExcluded:privateFiles,uiChanges,binaryAssets:assets,
  functionalFrontendChanges,gitHistoryAvailable:existsSync(new URL('.git',root)),verified:!findings.length&&!uiChanges.length};
writeFileSync(new URL('backend/reports/production-source-audit.json',root),JSON.stringify(report,null,2));
console.log(JSON.stringify({scanned,secretFindings:findings.length,uiChanges:uiChanges.length}));
assert.equal(findings.length,0,'Credential patterns require redacted review');
assert.equal(uiChanges.length,0,'Frontend visual source changed');
