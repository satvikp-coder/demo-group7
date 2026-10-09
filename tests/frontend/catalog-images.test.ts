import assert from 'node:assert/strict';
import {test} from 'node:test';
import {catalogImage,destinationFromRow,attractionFromRow,hotelFromRow,restaurantFromRow} from '../../frontend/src/api/index';
import {catalogPhoto, photoCredits} from '../../frontend/src/utils/imageSources';
import {existsSync,readFileSync} from 'node:fs';
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
