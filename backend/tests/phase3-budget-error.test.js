import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan} from '../services/tripPlanner.js';

const hotel={id:'hotel',name:'Budget regression fixture',price_per_night:8469,lat:23,lng:72};
const site={id:'site',name:'Fixture visit',lat:23,lng:72,entry_fee_numeric:100,duration_hours:1,opening_time:'08:00',closing_time:'18:00'};
const resources={hotel,attractions:[site],restaurants:[],routes:[{source_node_id:'hotel',destination_node_id:'site',distance_km:1,travel_time_minutes:5,reverse_distance_km:1,reverse_travel_time_minutes:5,transport_mode:'road'}]};
const trip={trip_days:2,lodging_nights:2,rooms:1,travelers:2,budget:12000,start_date:'2026-10-21',start_time:'08:00',strategy:'distance-first',weights:{distance:82,cost:9,rating:9}};
test('reported two-night budget failure gives precise accommodation total and shortfall',()=>{
 assert.throws(()=>buildPlan(trip,resources),error=>error.status===422&&/16,938/.test(error.message)&&/4,938/.test(error.message)&&/2 night/.test(error.message));
});
test('same hotel and budget with one explicit night produces a real affordable plan',()=>{
 const result=buildPlan({...trip,lodging_nights:1},resources);
 assert.equal(result.summary.hotel_total,8469);
 assert.equal(result.stops.filter(s=>s.stop_type==='attraction').length,1);
 assert.equal(result.stops.reduce((sum,s)=>sum+s.cost,0),8669);
 assert.equal(result.summary.starting_hotel_id,hotel.id);
});
