// Read-only unit reproduction using isolated, explicitly synthetic price fixtures.
import {buildPlan} from '../services/tripPlanner.js';
import {writeFileSync} from 'node:fs';
const hotel={id:'fixture-hotel',name:'Unit fixture hotel',lat:23,lng:72,price_per_night:499};
const trip={trip_days:1,budget:500,start_time:'08:00',strategy:'distance-first',wheelchair_accessible_only:false};
const attractions=[.3,.6,.1].map((price,i)=>({id:'fixture-'+i,name:'Decimal fee unit fixture '+i,lat:23,lng:72,entry_fee_numeric:price,duration_hours:.1,rating:4.5,wheelchair_accessible:true}));
const edge=(from,to,distance)=>({source_node_id:from,destination_node_id:to,distance_km:distance,travel_time_minutes:5,transport_mode:'road'});
const routes=[edge(hotel.id,attractions[0].id,1),edge(hotel.id,attractions[1].id,5),edge(hotel.id,attractions[2].id,10),edge(attractions[0].id,attractions[1].id,1),edge(attractions[0].id,attractions[2].id,10),edge(attractions[1].id,attractions[2].id,1)];
const result=buildPlan(trip,{hotel,attractions,restaurants:[],routes});
const evidence={expectedVisits:3,actualVisits:result.stops.filter(stop=>stop.stop_type==='attraction').length,fees:attractions.map(row=>row.entry_fee_numeric),selected:result.stops.filter(stop=>stop.stop_type==='attraction').map(row=>row.cost),exactCostInPaise:49900+30+60+10,steps:result.stops.map(row=>({type:row.stop_type,cost:row.cost})),unscheduled:result.summary.unscheduled_attractions,syntheticUnitFixturesOnly:true,databaseWrites:false};
writeFileSync(new URL('../../reports/currency-boundary-before.json',import.meta.url),JSON.stringify(evidence,null,2));
console.log(JSON.stringify(evidence));
