/** Read-only live catalog validation. No build dependency on third-party servers. */
import {writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {catalogPhoto,photoCredits,imageSource} from '../frontend/src/utils/imageSources';
const root=new URL('../',import.meta.url);
const base=(process.env.IMAGE_TEST_URL || 'http://localhost:8080').replace(/\/$/,'');
const remote=process.argv.includes('--remote');
const report:{base:string;records:any[];assets:any[];sourceReferences:any[];errors:any[]}={base,records:[],assets:[],sourceReferences:[],errors:[]};
const cities=await fetch(base+'/api/destinations/catalog?limit=100').then(r=>{if(!r.ok)throw new Error('Catalog HTTP '+r.status);return r.json()});
const resolved=new Set<string>();
for(const city of cities){
 for(const [kind,rows] of Object.entries({destinations:[city],attractions:city.attractions,hotels:city.hotels,restaurants:city.restaurants}) as [string,any[]][]){
  for(const row of rows){
   const source=catalogPhoto(kind,row);resolved.add(source);
   const photo=photoCredits.find(p=>imageSource(p.path)===source);
   report.records.push({kind,id:row.id,slug:row.slug,name:row.name,original:row.image_url,emptyOriginal:!row.image_url,resolved:source,state:photo?'photo':'fallback',credit:photo?.source});
   if(!source)report.errors.push({name:row.name,error:'No image or intentional fallback'});
   // No current API gallery exists; future gallery fields get checked automatically.
   for(const gallery of [row.images,row.gallery,row.image_urls])if(Array.isArray(gallery))for(const image of gallery){
    const url=imageSource(typeof image==='string'?image:image?.url||image?.image_url);
    if(url)resolved.add(url);else report.errors.push({name:row.name,error:'Invalid gallery source',source:image});
   }
  }
 }
}
for(const source of resolved){
 const result:any={source};
 try{
  if(source.startsWith('/')){
   if(!existsSync(new URL('frontend/public'+source,root)))throw new Error('Missing local file');
  }
  const response=await fetch(new URL(source,base),{signal:AbortSignal.timeout(15000)});
  const type=response.headers.get('content-type')||'';
  if(!response.ok||!type.startsWith('image/'))throw new Error('HTTP '+response.status+' '+type);
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(!bytes.length)throw new Error('Empty response');
  Object.assign(result,{status:response.status,type,bytes:bytes.length});
 }catch(e){result.error=String(e);report.errors.push(result)}
 report.assets.push(result);
}
if(remote){
 for(const source of new Set(report.records.map(row=>row.original).filter(value=>typeof value==='string'&&/^https?:/.test(value)))){
  try{
   const response=await fetch(source,{signal:AbortSignal.timeout(12000)});const type=response.headers.get('content-type');
   report.sourceReferences.push({source,status:response.status,type,imageResponse:response.ok&&!!type?.startsWith('image/'),note:'Diagnostic only; accessibility does not establish reuse rights.'});
   await response.body?.cancel();
  }catch(error){report.sourceReferences.push({source,error:String(error)})}
 }
}
const dir=new URL('backend/reports/images/',root);mkdirSync(dir,{recursive:true});
writeFileSync(new URL('catalog-validation.json',dir),JSON.stringify(report,null,2));
console.log(JSON.stringify({records:report.records.length,photos:report.records.filter(row=>row.state==='photo').length,fallbacks:report.records.filter(row=>row.state==='fallback').length,assets:report.assets.length,errors:report.errors.length}));
if(report.errors.length)process.exitCode=1;
