import assert from 'node:assert/strict';
import {test} from 'node:test';
import {catalogImage,destinationFromRow,attractionFromRow,hotelFromRow,restaurantFromRow} from '../../frontend/src/api/index';
import {catalogPhoto, photoCredits, imageSource, photoCredit} from '../../frontend/src/utils/imageSources';
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {IncomingMessage,ServerResponse} from 'node:http';
import {PassThrough} from 'node:stream';

test('Vite serves the photograph manifest as a source module without a public-import warning',async()=>{
 const {createServer,createLogger}=await import(new URL('../../frontend/node_modules/vite/dist/node/index.js',import.meta.url).href);
 const warnings:string[]=[];const logger=createLogger('silent');logger.warn=(message:string)=>{warnings.push(message);};
 const server=await createServer({root:fileURLToPath(new URL('../../frontend',import.meta.url)),configFile:false,appType:'custom',customLogger:logger,server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]}});
 const socket=new PassThrough();socket.on('data',()=>{});
 try{
  const module=await server.transformRequest('/src/utils/imageSources.ts');
  const dependency=module.code.match(/import manifest from "([^"]+)"/)?.[1];assert.ok(dependency);
  const request=new IncomingMessage(socket as unknown as import('node:net').Socket);request.method='GET';request.url=dependency;request.headers={host:'localhost:3000'};
  const response=new ServerResponse(request);response.assignSocket(socket as unknown as import('node:net').Socket);
  await new Promise<void>((resolve,reject)=>{response.on('finish',resolve);server.middlewares(request,response,(error?:Error)=>error?reject(error):response.end());});
  assert.equal(response.statusCode,200);assert.doesNotMatch(warnings.join('\n'),/Assets in public directory cannot be imported from JavaScript/);
  const compiled=await server.transformRequest(dependency);assert.match(compiled.code,/export default/);
 }finally{socket.destroy();await server.close();}
});

test('source and public manifests stay identical and preserve every public mapping and credit',()=>{
 assert.deepEqual(readFileSync(new URL('../../frontend/src/assets/photographs/manifest.json',import.meta.url)),readFileSync(new URL('../../frontend/public/assets/photographs/manifest.json',import.meta.url)));
 const publicManifest=JSON.parse(readFileSync(new URL('../../frontend/public/assets/photographs/manifest.json',import.meta.url),'utf8'));
 const sourceManifest=JSON.parse(readFileSync(new URL('../../frontend/src/assets/photographs/manifest.json',import.meta.url),'utf8'));
 assert.deepEqual(sourceManifest,publicManifest);
 const checkAsset=(path:string)=>{assert.match(path,/^\/assets\//);assert.ok(existsSync(new URL('../../frontend/public'+path,import.meta.url)));};
 for(const [alias,path] of Object.entries(publicManifest.aliases) as [string,string][]){assert.equal(imageSource(alias),imageSource(path));checkAsset(imageSource(alias));}
 for(const [key,path] of Object.entries(publicManifest.records) as [string,string][]){const [kind,...slug]=key.split(':');assert.equal(catalogPhoto(kind,{slug:slug.join(':')}),imageSource(path));checkAsset(imageSource(path));}
 for(const [key,path] of Object.entries(publicManifest.names) as [string,string][]){const [kind,...name]=key.split(':');assert.equal(catalogPhoto(kind,{name:name.join(':')}),imageSource(path));checkAsset(imageSource(path));}
 for(const photo of photoCredits){assert.equal(photoCredit(imageSource(photo.path)),photo);checkAsset(imageSource(photo.path));}
});
test('image resolver accepts public assets and safe remote URLs, rejecting unsafe sources',()=>{
 assert.equal(catalogImage('/assets/categories/temple.svg'),'/assets/categories/temple.svg');
 assert.equal(catalogImage(' https://example.test/a b.jpg '),'https://example.test/a%20b.jpg');
 assert.equal(catalogImage('assets/categories/hotel.svg'),'/assets/categories/hotel.svg');
 for(const value of ['//example.test/image.jpg','javascript:alert(1)','/assets/../private.png','/assets/%2e%2e/private.png','https://user:password@example.test/image.jpg','data:image/svg+xml,test',null])assert.equal(catalogImage(value),'');
});
test('all catalog adapters resolve image fields without overwriting source provenance',()=>{
 for(const adapt of [destinationFromRow,attractionFromRow,hotelFromRow,restaurantFromRow]){
  const row={id:'fixture',name:'Fixture',image_url:'https://example.test/image.jpg'};
  assert.equal(adapt(row).imageUrl,'https://example.test/image.jpg');assert.equal(row.image_url,'https://example.test/image.jpg');
 }
});
test('all eight destinations use licensed locally hosted photographs',()=>{
 for(const slug of ['ahmedabad','champaner','dwarka','gir-national-park','modhera','rann-of-kutch','saputara','somnath']){
  const photo=catalogPhoto('destinations',{slug,name:slug});
  assert.match(photo,/\/assets\/photographs\/.+\.webp$/);
  assert.ok(photoCredits.some(credit=>credit.path===photo && credit.author && credit.source && credit.licenseUrl));
  assert.ok(existsSync(new URL('../../frontend/public'+photo,import.meta.url)));
 }
});
test('known missing property photographs are explicit local fallbacks, never unrelated hotels',()=>{
 assert.equal(catalogPhoto('hotels',{slug:'lemon-tree-premier-ahmedabad',name:'Lemon Tree Premier'}),'/assets/categories/hotel.svg');
 assert.equal(catalogPhoto('hotels',{name:'The House of MG'}),'/assets/categories/hotel.svg');
 assert.match(catalogPhoto('hotels',{name:'French Haveli Heritage Stay'}),/french-haveli-ahmedabad\.webp$/);
 assert.equal(catalogPhoto('restaurants',{name:'Toran Dining Hall Somnath'}),'/assets/categories/dining.svg');
 assert.equal(catalogPhoto('hotels',{slug:'lemon-tree-premier-ahmedabad',image_url:'/assets/custom-approved-property.jpg'}),'/assets/custom-approved-property.jpg');
 assert.equal(catalogPhoto('hotels',{slug:'different-property',name:'French Haveli Heritage Stay',image_url:'https://example.test/property.jpg'}),'https://example.test/property.jpg');
});
test('persisted stop names resolve the same photograph as catalog records',()=>{
 assert.equal(catalogPhoto('attractions',{name:'Dwarkadhish Temple'}),catalogPhoto('attractions',{slug:'dwarkadhish-temple-dwarka'}));
 assert.equal(catalogPhoto('hotels',{name:'French Haveli Heritage Stay'}),catalogPhoto('hotels',{slug:'french-haveli-heritage-stay-ahmedabad'}));
});
test('licensed asset manifest and credits ship together',()=>{
 const credits=readFileSync(new URL('../../frontend/public/image-credits.html',import.meta.url),'utf8');
 for(const photo of photoCredits){assert.ok(photo.author);assert.ok(photo.license);assert.ok(credits.includes(photo.path));assert.ok(credits.includes(photo.licenseUrl));}
});
