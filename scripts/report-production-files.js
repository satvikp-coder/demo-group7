// Filesystem evidence, not a fabricated Git diff. Baseline was captured mid-pass;
// explicitly include earlier reviewed production edits as well.
import {readdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),reportRoot=new URL('../backend/reports/',import.meta.url);
const baseline=JSON.parse(readFileSync(new URL('production-source-baseline.json',reportRoot),'utf8'));
const evidence=JSON.parse(readFileSync(new URL('production-prior-evidence-inventory.json',reportRoot),'utf8'));
const previous=new Map(evidence.map(row=>[row.file,row.sha256]));
const earlyEdits=`.gitignore
README.md
backend/.env.example
frontend/.env.example
backend/package.json
backend/package-lock.json
frontend/package.json
frontend/package-lock.json
backend/config/env.js
backend/config/database.js
backend/config/poolOptions.js
backend/server.js
backend/middleware/auth.js
backend/middleware/errorHandler.js
backend/middleware/production.js
backend/controllers/authController.js
backend/controllers/adminController.js
backend/controllers/destinationController.js
backend/models/destinationModel.js
backend/routes/adminRoutes.js
backend/routes/tripRoutes.js
backend/routes/destinationRoutes.js
backend/services/logger.js
backend/services/destinationSearchCache.js
backend/services/tripPlanner.js
backend/scripts/database.js
backend/scripts/seed.js
backend/scripts/seed-research.js
backend/scripts/seed-research-routes.js
backend/scripts/audit-research.js
backend/scripts/audit-seed.js
backend/scripts/seedOwnership.js
backend/tests/trips.test.js
tests/dsa/trie.test.ts
tests/frontend/planner.test.ts
tests/frontend/browser_api.py
tests/frontend/api_client_browser.py
frontend/src/api/index.ts
frontend/vite.config.ts
backend/README.md
frontend/README.md
database/README.md
backend/migrations/README.md
tests/README.md
vercel.json
data/research/pages/5f46644fdb588b10.html
data/research/pages/73f7d3e7111a48e6.html
data/research/pages/b0fdeef2c9c7a17d.html`.split('\n');
const rows=new Map();
const addedOutsideBaseline=new Set(`.dockerignore
.env.production.example
.github/workflows/production.yml
CODEX_HANDOFF.md
compose.yml
compose.staging.yml
compose.tls.yml
deploy/Caddyfile
deploy/postgres-init.sh
docs/PRODUCTION.md
package.json
requirements-tests.txt
scripts/run.js
scripts/test-all.js
scripts/test-production.js
scripts/production-smoke.js
scripts/source-audit.js
scripts/data-audit.js
scripts/upgrade-local.js
scripts/report-production-files.js`.split('\n'));
function reason(path){
 if(path==='CODEX_HANDOFF.md')return 'Canonical current state, verification and external next steps; history preserved.';
 if(path.startsWith('backend/reports/'))return path.includes('provenance')?'Field evidence/review regenerated without promoting unverified records.':'Measured production/test/build/HTTP/browser/security evidence; old final reports remain historical.';
 if(path.startsWith('data/research/pages/'))return 'Redact embedded third-party token/key patterns from archived HTML; retain factual research.';
 if(path.startsWith('data/research/production-provenance'))return 'Primary-source identity review and honest per-field classifications.';
 if(/README|docs\/|requirements-tests/.test(path))return 'Reproducible development/production operations, test setup and data limitations.';
 if(/env\.example|env\.production\.example|gitignore|dockerignore/.test(path))return 'Safe public configuration and exclusions for secrets, archives and build caches.';
 if(/Dockerfile|compose|nginx|deploy\//.test(path))return 'Nonroot production containers, private database/API, SPA/TLS proxy, health checks and bounded sanitized logs.';
 if(path.includes('package'))return 'Production middleware/dependency patch and unified build/test/maintenance commands.';
 if(path.startsWith('.github/'))return 'Isolated PostgreSQL/Docker CI gates and retained sanitized evidence.';
 if(path==='frontend/src/api/index.ts')return 'Functional bulk catalog validation/request reduction and honest dated-quote/routing warnings; no visual source changes.';
 if(path==='frontend/vite.config.ts'||path==='vercel.json')return 'Safe production API build configuration, source-map policy and reproducible static hosting.';
 if(path.startsWith('tests/')||path.startsWith('backend/tests/'))return 'Focused security/directional/API/browser regression coverage and measured assertion banners.';
 if(path.startsWith('backend/migrations/'))return 'Additive seed-ownership, directional-route and field-review schema upgrades.';
 if(path.startsWith('backend/scripts/'))return 'Deterministic guarded migrations/seeding, shared secure pools, backups/restore, operator provisioning and provenance/freshness tools.';
 if(path.startsWith('scripts/'))return 'Sequential isolated full/production gates, recovery/load/source/data audits and file evidence.';
 if(path.startsWith('backend/'))return 'Production security, authorization, bounded DB connections, truthful routing/catalog performance and sanitized operations.';
 return 'Production delivery support; reviewed against filesystem baseline.';
}
function add(path,basis){rows.set(path,{file:path,basis,reason:reason(path)});}
function visit(dir,relative=''){
 for(const entry of readdirSync(dir,{withFileTypes:true})){
  if(['node_modules','dist','.git','.npm-cache','__pycache__','backups'].includes(entry.name))continue;
  const path=relative+entry.name,url=new URL(entry.name,dir);
  if(entry.isDirectory()){visit(new URL(entry.name+'/',dir),path+'/');continue;}
  if(/^\.env(?:\.|$)/.test(entry.name)&&!entry.name.endsWith('.example')||entry.name==='suite.lock')continue;
  if(path.startsWith('backend/reports/')){
   if(['production-files.json','production-files.md'].includes(entry.name))continue;
   if(path.startsWith('backend/reports/production/')||entry.name.startsWith('production-')||entry.name==='PRODUCTION_READINESS.md')add(path,'new production evidence');
   else if(previous.has(path)&&createHash('sha256').update(readFileSync(url)).digest('hex')!==previous.get(path))add(path,'previous evidence regenerated');
   continue;
  }
  const hash=createHash('sha256').update(readFileSync(url)).digest('hex');
  // The snapshot covers these five source roots only; do not mislabel other old
  // research/documentation files as new merely because they were not snapshotted.
  if(!/^(backend|frontend|dsa|tests|database)\//.test(path)&&!earlyEdits.includes(path)&&!addedOutsideBaseline.has(path)&&!path.startsWith('data/research/production-provenance-'))continue;
  if(baseline[path]!==hash)add(path,baseline[path]?'changed since production baseline':'new file');
 }
}
visit(root);
for(const path of earlyEdits)if(existsSync(new URL(path,root)))add(path,'explicit reviewed production edit (baseline captured mid-pass)');
// Screenshots are regenerated by the browser harness, outside the text inventory.
for(const path of ['backend/reports/final-budget-browser.png','backend/reports/final-invalid-destination-browser.png','backend/reports/researched-itinerary-budget-browser.png'])if(existsSync(new URL(path,root)))add(path,'browser verification screenshot regenerated');
for(const path of ['backend/reports/production-files.json','backend/reports/production-files.md'])add(path,'this file inventory');
const files=[...rows.values()].sort((a,b)=>a.file.localeCompare(b.file));
const report={checkedAt:new Date().toISOString(),gitHistoryAvailable:false,note:'No Git metadata/history exists. This inventory combines filesystem hashes, prior-report hashes and explicitly reviewed edits; it is not an upstream commit diff.',files};
writeFileSync(new URL('production-files.json',reportRoot),JSON.stringify(report,null,2)+'\n');
writeFileSync(new URL('production-files.md',reportRoot),'# Production file inventory\n\n'+report.note+'\n\n| File | Why |\n|---|---|\n'+files.map(row=>'| `'+row.file+'` | '+row.reason+' |').join('\n')+'\n');
console.log(JSON.stringify({files:files.length,gitHistoryAvailable:false}));
