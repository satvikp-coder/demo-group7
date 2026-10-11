import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan} from '../services/tripPlanner.js';
import {datedOperation} from '../services/operatingSchedule.js';

const hotel={id:'hotel',name:'Fixture hotel',lat:21,lng:70,price_per_night:100,rating:null};
const attraction={id:'safari',slug:'gir-jungle-safari',name:'Gir Jungle Safari',lat:21.1,lng:70.1,entry_fee_numeric:3200,duration_hours:3,opening_time:'08:30',closing_time:'11:30',rating:null};
const resources={hotel,attractions:[attraction],restaurants:[],routes:[{source_node_id:'hotel',destination_node_id:'safari',distance_km:5,travel_time_minutes:10,reverse_distance_km:5,reverse_travel_time_minutes:10,transport_mode:'road'}]};
const trip={trip_days:1,lodging_nights:0,budget:20000,start_time:'08:00',start_date:'2026-10-19',strategy:'distance-first',weights:{distance:100,cost:0,rating:0}};

test('Gir group admission uses six-seat vehicles, current weekday estimate and fixed departure',()=>{
 for(const [travelers,cost] of [[1,4700],[3,4700],[6,4700],[7,9400]]){
  const result=buildPlan({...trip,travelers},resources);
  const visit=result.stops.find(s=>s.stop_type==='attraction');
  assert.equal(visit.cost,cost);
  assert.equal(visit.arrival_time,'09:00:00');
  assert.match(visit.best_time_note,/six-seat/i);
 }
});

test('Gir annual closure and fixed seasonal departures cannot be treated as flexible hours',()=>{
 for(const date of ['2026-06-16','2026-08-01','2026-10-15'])assert.deepEqual(datedOperation(attraction,date,1,480,180),{closed:true});
 assert.equal(datedOperation(attraction,'2026-10-16',1,480,180).arrival,540);
 assert.equal(datedOperation(attraction,'2026-10-17',1,550,180).arrival,900);
 assert.equal(datedOperation(attraction,'2026-05-04',1,550,180).arrival,960);
 assert.deepEqual(datedOperation(attraction,'2026-10-19',1,901,180),{closed:true});
 assert.throws(()=>buildPlan({...trip,start_date:'2026-10-12'},resources),/No feasible/);
});

test('Gir current group tariff enforces the budget and weekend uplift',()=>{
 assert.throws(()=>buildPlan({...trip,budget:4699,travelers:1},resources),/No feasible/);
 assert.equal(buildPlan({...trip,budget:4700,travelers:3},resources).stops.find(s=>s.stop_type==='attraction').cost,4700);
 assert.equal(buildPlan({...trip,start_date:'2026-10-17',travelers:3},resources).stops.find(s=>s.stop_type==='attraction').cost,4900);
});

test('undated safari is only a common-slot estimate, with access and pricing advisory',()=>{
 const visit=buildPlan({...trip,start_date:undefined,travelers:3},resources).stops.find(s=>s.stop_type==='attraction');
 assert.equal(visit.cost,4700);assert.equal(visit.arrival_time,'09:00:00');
 assert.match(visit.best_time_note,/Without a visit date/);
});
