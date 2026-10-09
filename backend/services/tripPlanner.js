import {createHash} from 'node:crypto';
import {utility,weightedScore,validWeights,DEFAULT_WEIGHTS,STRATEGY_WEIGHTS} from '../../dsa/planning/priorities.ts';
import {HttpError} from '../middleware/errorHandler.js';
import { Graph } from "../../dsa/graph/Graph.ts";
import { dijkstra } from "../../dsa/dijkstra/dijkstra.ts";
import { MinHeap } from "../../dsa/priorityQueue/MinHeap.ts";
import { HashTable } from "../../dsa/hashTable/HashTable.ts";
import { filterAttractionsByBudget } from "../../dsa/greedy/budgetAllocator.ts";
import { scoreAttraction } from "../../dsa/greedy/routeBuilder.ts";
import { getMaxAttractionsPerDay, isLunchTime, isDinnerTime } from "../../dsa/greedy/daySplitter.ts";

const minutes = (value) => Number(value.slice(0,2))*60+Number(value.slice(3,5));
const time = (value) => String(Math.floor(value/60)).padStart(2,"0")+":"+String(value%60).padStart(2,"0")+":00";

// Scheduling adapter around the existing DSA. Routes/prices/accessibility come only from PostgreSQL.
function buildGreedyPlan(trip, { hotel, attractions, restaurants, routes }) {
  const travelers=trip.travelers??1,rooms=trip.rooms??1;
  const excluded = [];
  const eligible = attractions.filter((a) => {
    let reason;
    if (trip.wheelchair_accessible_only && a.wheelchair_accessible !== true)
      reason = a.wheelchair_accessible === false ? "not_wheelchair_accessible" : "accessibility_unknown";
    else if (a.entry_fee_numeric === null) reason = "entry_price_unknown";
    else if (a.duration_hours === null) reason = "visit_duration_unknown";
    if (reason) excluded.push({id:a.id,name:a.name,reason});
    return !reason;
  }).map(a => ({...a,entryFeeNumeric:Number(a.entry_fee_numeric)*travelers,durationHours:Number(a.duration_hours),rating:a.rating==null?null:Number(a.rating),lat:Number(a.lat),lng:Number(a.lng)}));
  const graph = new Graph();
  const attractionIds = new HashTable();
  // Filter inaccessible intermediate attraction nodes too, not only final candidates.
  for (const a of attractions) {
    if (trip.wheelchair_accessible_only && a.wheelchair_accessible !== true) continue;
    graph.addNode(a.id,Number(a.lat),Number(a.lng));
    attractionIds.set(a.id,true);
  }
  graph.addNode(hotel.id,Number(hotel.lat),Number(hotel.lng));
  for (const r of restaurants) graph.addNode(r.id,Number(r.lat),Number(r.lng));
  const nodeCoordinates=new Map([hotel,...attractions,...restaurants].map(n=>[n.id,[Number(n.lng),Number(n.lat)]]));
  const staleRoutes=[];
  for (const r of routes) {
    // An archived OSRM matrix is valid only at its recorded endpoint coordinates.
    // Coordinate edits must not silently reuse road estimates from the old hotel location.
    if(r.source_url?.includes('router.project-osrm.org/table/v1/driving/')) {
      const points=r.source_url.split('/driving/')[1]?.split('?')[0].split(';').map(pair=>pair.split(',').map(Number))??[];
      const current=[nodeCoordinates.get(r.source_node_id),nodeCoordinates.get(r.destination_node_id)];
      if(current.some(c=>!c||!points.some(p=>Math.abs(p[0]-c[0])<.000001&&Math.abs(p[1]-c[1])<.000001))) {staleRoutes.push(r.id);continue;}
    }
    if (!graph.hasNode(r.source_node_id) || !graph.hasNode(r.destination_node_id)) continue;
    graph.addEdge(r.source_node_id,r.destination_node_id,Number(r.distance_km),r.travel_time_minutes,r.transport_mode);
    graph.addEdge(r.destination_node_id,r.source_node_id,Number(r.reverse_distance_km ?? r.distance_km),r.reverse_travel_time_minutes ?? r.travel_time_minutes,r.transport_mode);
  }
  const stats = {direct_route_hits:0,dijkstra_calls:0,unreachable_pairs:0};
  const cache = new HashTable();
  function edge(from,to) {
    const heap = new MinHeap((a,b) => a.distanceKm-b.distanceKm || a.travelTimeMinutes-b.travelTimeMinutes);
    for (const e of graph.getNeighbors(from)) if (e.to === to) heap.insert(e);
    return heap.extractMin();
  }
  function leg(from,to) {
    if (from===to) return {path:[from],distance_km:0,minutes:0,method:"same_location"};
    const key=from+":"+to;
    if (cache.has(key)) return cache.get(key);
    const direct=edge(from,to);
    let result=null;
    if (direct) {
      stats.direct_route_hits++;
      result={path:[from,to],distance_km:direct.distanceKm,minutes:direct.travelTimeMinutes,method:"direct"};
    } else if (attractionIds.has(from) && attractionIds.has(to)) {
      // Only missing direct attraction pairs invoke the existing Dijkstra implementation.
      stats.dijkstra_calls++;
      const route=dijkstra(graph,from,to);
      if (route.path.length>1) {
        let duration=0;
        for (let i=1;i<route.path.length;i++) duration+=edge(route.path[i-1],route.path[i]).travelTimeMinutes;
        result={path:route.path,distance_km:route.distanceKm,minutes:duration,method:"dijkstra"};
      }
    }
    if (!result) stats.unreachable_pairs++;
    cache.set(key,result);
    return result;
  }
  const hotelCost=Number(hotel.price_per_night)*trip.trip_days*rooms;
  let remaining=trip.budget-hotelCost;
  // Catalog fees use two decimal places. Keep the available balance in paise
  // precision so e.g. 1 - .30 - .60 still affords the final .10 admission.
  const spend = amount => { remaining = Math.round((remaining-amount)*100)/100; };
  const visited=new HashTable();
  const stops=[];
  const legs=[];
  const skippedMeals=[];
  for (let day=1;day<=trip.trip_days;day++) {
    let clock=minutes(trip.start_time);
    let current=hotel;
    let order=0;
    let lunch=false;
    function stop(type,record,arrival,duration,cost,category=record.category ?? null) {
      stops.push({day_number:day,stop_order:++order,stop_type:type,reference_id:record.id,name:record.name,
        category,arrival_time:time(arrival),departure_time:time(arrival+duration),duration_minutes:duration,cost,
        lat:record.lat,lng:record.lng,wheelchair_accessible:record.wheelchair_accessible ?? null,
        physical_demand:record.physical_demand ?? null,best_time_note:record.best_time_note ?? null});
      clock=arrival+duration;
      current=record;
    }
    function move(next,route) {
      if(route.path.length>1) legs.push({day_number:day,from:current.id,to:next.id,...route});
    }
    function meal(kind,earliest,latest) {
      for(const restaurant of restaurants) {
        if(restaurant.avg_cost_per_person===null || (Number(restaurant.avg_cost_per_person)*travelers)>remaining) continue;
        const route=leg(current.id,restaurant.id), back=leg(restaurant.id,hotel.id);
        if(!route || !back) continue;
        const arrival=Math.max(clock+route.minutes,earliest);
        if(arrival+60>latest || arrival+60+back.minutes+15>1439) continue;
        move(restaurant,route);
        stop("meal",restaurant,arrival,60,(Number(restaurant.avg_cost_per_person)*travelers),kind);
        spend((Number(restaurant.avg_cost_per_person)*travelers));
        return true;
      }
      skippedMeals.push({day_number:day,meal:kind,reason:"No affordable restaurant with known routes fitting the meal window and hotel return"});
      return false;
    }
    stop("hotel",hotel,clock,15,Number(hotel.price_per_night)*rooms,"departure");
    const quota=getMaxAttractionsPerDay(filterAttractionsByBudget(eligible,remaining,visited).length,trip.trip_days-day+1,trip.strategy);
    let count=0;
    while(count<quota) {
      if(isLunchTime(clock,lunch)) { meal("lunch",750,870); lunch=true; }
      const queue=new MinHeap((a,b)=>b.score-a.score || a.attraction.id.localeCompare(b.attraction.id));
      const choices=[];
      for(const a of filterAttractionsByBudget(eligible,remaining,visited)) {
        const route=leg(current.id,a.id),back=leg(a.id,hotel.id);
        if(!route || !back) continue;
        let arrival=clock+route.minutes;
        if(a.opening_time) arrival=Math.max(arrival,minutes(a.opening_time));
        const duration=Math.ceil(a.durationHours*60);
        const closing=a.closing_time ? minutes(a.closing_time) : 1439;
        if(arrival+duration>closing || arrival+duration+back.minutes+15>1439) continue;
        choices.push({attraction:a,route,arrival,duration,distance:route.distance_km+back.distance_km,cost:a.entryFeeNumeric,rating:a.rating});
      }
      for(const choice of choices) {
        choice.score=trip.weights?weightedScore({distance:utility(choice.distance,choices.map(c=>c.distance),true),cost:utility(choice.cost,choices.map(c=>c.cost),true),rating:choice.rating==null?0:Math.max(0,Math.min(1,choice.rating/5))},trip.weights)
          :scoreAttraction(choice.attraction,current,remaining,trip.strategy,()=>choice.route.distance_km);
        queue.insert(choice);
      }
      const candidate=queue.extractMin();
      if(!candidate) break;
      move(candidate.attraction,candidate.route);
      stop("attraction",candidate.attraction,candidate.arrival,candidate.duration,candidate.attraction.entryFeeNumeric);
      spend(candidate.attraction.entryFeeNumeric);
      visited.set(candidate.attraction.id,true);
      count++;
    }
    // Do not invent a meal/transfer when no route or affordable restaurant exists.
    if(!lunch) { meal("lunch",750,870); lunch=true; }
    if(isDinnerTime(Math.max(clock,1170))) meal("dinner",1170,1290);
    const back=leg(current.id,hotel.id);
    if(back) { move(hotel,back); stop("hotel",hotel,clock+back.minutes,15,0,"return"); }
  }
  const unvisited=eligible.filter(a=>!visited.has(a.id)).map(a=>({id:a.id,name:a.name,reason:"Not scheduled within available routes, time and budget"}));
  const warnings=[];
  if(!routes.length) warnings.push("no_route_data");
  if(staleRoutes.length) warnings.push("stale_route_coordinates_excluded");
  if(hotelCost>trip.budget) warnings.push("starting_hotel_over_budget");
  if(excluded.some(a=>a.reason==="accessibility_unknown")) warnings.push("unknown_accessibility_excluded");
  if(skippedMeals.length) warnings.push("meals_not_scheduled");
  if(legs.length) warnings.push("transport_fares_unknown");
  if(legs.some(l => routes.some(r => r.destination_node_id===l.from && r.source_node_id===l.to && r.reverse_distance_km==null))) warnings.push("reverse_route_estimate_unverified");
  return {stops,summary:{
    status:!visited.size() || skippedMeals.length || unvisited.length ? "incomplete" : "scheduled",
    starting_hotel_id:hotel.id,hotel_replaced:false,hotel_total:hotelCost,
    hotel_over_budget:hotelCost>trip.budget,hotel_budget_shortfall:Math.max(0,hotelCost-trip.budget),
    lodging_nights:trip.trip_days,transport_cost_known:legs.length===0,
    excluded_attractions:excluded,unscheduled_attractions:unvisited,skipped_meals:skippedMeals,
    warnings,route_rows:routes.length,routing:stats,legs,
  }};
}

// Bounded multi-start evaluation extends the same graph/greedy scheduler. No parallel engine.
export function buildPlan(trip,resources) {
 if(!trip.weights)return buildGreedyPlan(trip,resources); // Existing stored/API strategy-only plans remain compatible.
 if(!validWeights(trip.weights))throw new HttpError(400,'Priorities must be whole percentages totaling exactly 100');
 const guidance=[trip.weights,DEFAULT_WEIGHTS,...Object.values(STRATEGY_WEIGHTS),{distance:100,cost:0,rating:0},{distance:0,cost:100,rating:0},{distance:0,cost:0,rating:100}];
 const unique=new Map();
 for(const weights of guidance) {
  const plan=buildGreedyPlan({...trip,weights},resources);
  const visits=plan.stops.filter(s=>s.stop_type==='attraction');
  const cost=Math.round(plan.stops.reduce((sum,s)=>sum+s.cost,0)*100)/100;
  if(!visits.length||cost>trip.budget)continue;
  const signature=JSON.stringify(plan.stops.map(s=>[s.day_number,s.reference_id,s.stop_type,s.arrival_time]));
  if(unique.has(signature))continue;
  const rated=[resources.hotel,...visits.map(s=>resources.attractions.find(a=>a.id===s.reference_id))];
  const known=rated.filter(r=>r?.rating!=null&&Number.isFinite(Number(r.rating)));
  const mean=known.length?known.reduce((sum,r)=>sum+Number(r.rating),0)/known.length:null;
  unique.set(signature,{id:createHash('sha256').update(signature).digest('hex').slice(0,16),plan,distance_km:plan.summary.legs.reduce((sum,l)=>sum+l.distance_km,0),known_cost:cost,rating_mean:mean,rating_coverage:known.length/rated.length,attraction_count:visits.length});
 }
 const candidates=[...unique.values()];
 if(!candidates.length)throw new HttpError(422,'No feasible itinerary with this hotel, budget and known route/visit data. Increase the budget, choose another hotel, or relax supported filters. Unknown costs and routes are not invented.');
 for(const c of candidates) {
  c.utilities={distance:utility(c.distance_km,candidates.map(p=>p.distance_km),true),cost:utility(c.known_cost,candidates.map(p=>p.known_cost),true),rating:c.rating_mean==null?0:Math.max(0,Math.min(1,c.rating_mean/5*c.rating_coverage))};
  c.score=weightedScore(c.utilities,trip.weights);
 }
 candidates.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 const selected=candidates[0];
 selected.plan.summary.optimization={method:'bounded_multi_start_greedy',weights:trip.weights,selected_candidate_id:selected.id,score:selected.score,evaluated_count:candidates.length,
  distance_basis:'Sum of saved route legs; return estimates retain provenance warnings',cost_basis:'Known hotel room-night, per-traveler admission and meal estimates only; unknown transport fares excluded',rating_basis:'Known hotel/attraction mean divided by 5 and multiplied by known-rating coverage; missing ratings receive no invented value',
  normalization:'Candidate-relative min-max distance/cost utilities (constant values give equal utility 1); rating uses the documented 0-5 scale with coverage',
  optimality:'Highest score among feasible evaluated greedy candidates; global optimality is not guaranteed',
  candidates:candidates.map(({plan,...metrics},index)=>({...metrics,rank:index+1,feasible:true})),travelers:trip.travelers??1,rooms:trip.rooms??1};
 return selected.plan;
}
