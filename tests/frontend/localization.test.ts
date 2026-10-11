import test from 'node:test';
import assert from 'node:assert/strict';
import {TRANSLATIONS} from '../../frontend/src/data/translations.ts';
import {HOTEL_TRANSLATIONS} from '../../frontend/src/data/hotelTranslations.ts';
test('Gujarati covers every existing dictionary key while English and Hindi remain available',()=>{
 assert.deepEqual(Object.keys(TRANSLATIONS.gu).sort(),Object.keys(TRANSLATIONS.en).sort());
 assert.ok(TRANSLATIONS.hi['nav.planItinerary']);
 for(const value of Object.values(TRANSLATIONS.gu)){assert.ok(value.trim());assert.match(value,/[\u0A80-\u0AFF]/);}
});
test('hotel translations retain all policy placeholders and API category labels',()=>{
 const keys=Object.keys(HOTEL_TRANSLATIONS.en).sort();
 const placeholders=(text:string)=>[...text.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
 for(const language of ['hi','gu'] as const){
  assert.deepEqual(Object.keys(HOTEL_TRANSLATIONS[language]).sort(),keys);
  for(const key of keys){
   const id=key as keyof typeof HOTEL_TRANSLATIONS.en;
   assert.deepEqual(placeholders(HOTEL_TRANSLATIONS[language][id]),placeholders(HOTEL_TRANSLATIONS.en[id]),language+' '+key);
  }
 }
 for(const category of ['Low Cost','Budget','Premium'])assert.equal(TRANSLATIONS.en['hotel.'+category],category);
});
