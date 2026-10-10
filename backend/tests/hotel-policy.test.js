import assert from 'node:assert/strict';
import {test} from 'node:test';
import {hotelCategory,haversineKm,nearbyHotels,hotelPriceView,usableHotelPrice} from '../../dsa/planning/hotelPolicy.ts';
import {sortHotels} from '../services/hotelRanking.js';
test('hotel price bands have explicit INR boundaries and unknown stays unknown',()=>{
 for(const [price,category] of [[1499,'Low Cost'],[1500,'Budget'],[4000,'Budget'],[4001,'Premium'],[null,null],['',null],[NaN,null],[-1,null]])assert.equal(hotelCategory(price),category);
});
test('Haversine validates coordinates, identical points and known quarter equator',()=>{
 assert.equal(haversineKm(23,72,23,72),0);assert.ok(Math.abs(haversineKm(0,0,0,90)-10007.557221)<.001);
 assert.ok(haversineKm(23.027,72.58,23.028,72.58)<.2);
 for(const point of [[null,0,0,0],[91,0,0,0],[0,181,0,0],['',0,0,0]])assert.equal(haversineKm(...point),null);
});
test('nearby filtering never substitutes category and expands only its recorded radius',()=>{
 const anchor={name:'Synthetic test origin',lat:0,lng:0};const hotels=[{id:'near',price_per_night:1000,lat:0,lng:.01},{id:'expanded',price_per_night:1000,lat:0,lng:.4},{id:'far',price_per_night:1000,lat:0,lng:2},{id:'premium',price_per_night:8000,lat:0,lng:.01},{id:'unknown',price_per_night:null,lat:0,lng:.01}];
 const rows=nearbyHotels(hotels,anchor,'Low Cost');assert.deepEqual(rows.map(x=>x.id),['near','expanded']);assert.ok(rows.every(x=>x.expanded_search&&x.hotel_category==='Low Cost'));assert.deepEqual(nearbyHotels(hotels,null,'Budget'),[]);
 assert.notEqual(nearbyHotels(hotels,anchor)[0].distance_km,nearbyHotels([{...hotels[0],lng:1}],anchor)[0].distance_km);
});
test('unknown prices and distances sort last rather than free or zero kilometres',()=>{
 const records=[{id:'a',name:'Unknown',price_per_night:null,distance_km:null},{id:'b',name:'Known',price_per_night:2000,distance_km:2}];
 assert.equal(sortHotels(records,'price')[0].id,'b');assert.equal(sortHotels(records,'distance')[0].id,'b');
});

test('historical and expired rates remain unavailable without losing archived values',()=>{
 const historical={id:'history',lat:23,lng:72,price_per_night:1700,provenance_review:{price_basis:'Historical 2014 tariff'}};
 const once=hotelPriceView(historical);
 assert.equal(once.price_per_night,null);assert.equal(once.historical_price_per_night,1700);
 assert.deepEqual(hotelPriceView(once),once);assert.equal(historical.price_per_night,1700);
 assert.deepEqual(nearbyHotels([historical],{name:'Anchor',lat:23,lng:72},'Budget'),[]);
 assert.equal(usableHotelPrice({price_per_night:2000,provenance_review:{valid_until:'2026-10-09'}},'2026-10-10'),null);
 assert.equal(usableHotelPrice({price_per_night:2000,provenance_review:{valid_until:'2026-10-10'}},'2026-10-10'),2000);
});
