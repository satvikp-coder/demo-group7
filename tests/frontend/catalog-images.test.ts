import assert from 'node:assert/strict';
import {test} from 'node:test';
import {catalogImage,destinationFromRow,attractionFromRow,hotelFromRow,restaurantFromRow} from '../../frontend/src/api/index';
test('catalog imagery uses existing owned assets; external sources remain fallback-only',()=>{
 assert.equal(catalogImage('/assets/categories/temple.svg'),'/assets/categories/temple.svg');
 for(const value of ['https://example.test/image.jpg','//example.test/image.jpg','javascript:alert(1)','/assets/../private.png','data:image/svg+xml,test',null])assert.equal(catalogImage(value),'');
 for(const adapt of [destinationFromRow,attractionFromRow,hotelFromRow,restaurantFromRow]){
  const row={id:'fixture',name:'Fixture',image_url:'https://example.test/image.jpg'};
  assert.equal(adapt(row).imageUrl,'');assert.equal(row.image_url,'https://example.test/image.jpg');
 }
});
