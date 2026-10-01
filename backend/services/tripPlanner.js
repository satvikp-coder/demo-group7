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
export function buildPlan(trip, { hotel, attractions, restaurants, routes }) {
  const excluded = [];
  const eligible = attractions.filter((a) => {
    let reason;
    if (trip.wheelchair_accessible_only && a.wheelchair_accessible !== true)
      reason = a.wheelchair_accessible === false ? "not_wheelchair_accessible" : "accessibility_unknown";
    else if (a.entry_fee_numeric === null) reason = "entry_price_unknown";
    else if (a.duration_hours === null) reason = "visit_duration_unknown";
    if (reason) excluded.push({id:a.id,name:a.name,reason});
    return !reason;
  }).map(a => ({...a,entryFeeNumeric:Number(a.entry_fee_numeric),durationHours:Number(a.duration_hours),rating:Number(a.rating),lat:Number(a.lat),lng:Number(a.lng)}));
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
  for (const r of routes) {
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
  const hotelCost=Number(hotel.price_per_night)*trip.trip_days;
  let remaining=trip.budget-hotelCost;
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
        if(restaurant.avg_cost_per_person===null || Number(restaurant.avg_cost_per_person)>remaining) continue;
        const route=leg(current.id,restaurant.id), back=leg(restaurant.id,hotel.id);
        if(!route || !back) continue;
        const arrival=Math.max(clock+route.minutes,earliest);
        if(arrival+60>latest || arrival+60+back.minutes+15>1439) continue;
        move(restaurant,route);
        stop("meal",restaurant,arrival,60,Number(restaurant.avg_cost_per_person),kind);
        remaining-=Number(restaurant.avg_cost_per_person);
        return true;
      }
      skippedMeals.push({day_number:day,meal:kind,reason:"No affordable restaurant with known routes fitting the meal window and hotel return"});
      return false;
    }
    stop("hotel",hotel,clock,15,Number(hotel.price_per_night),"departure");
    const quota=getMaxAttractionsPerDay(filterAttractionsByBudget(eligible,remaining,visited).length,trip.trip_days-day+1,trip.strategy);
    let count=0;
    while(count<quota) {
      if(isLunchTime(clock,lunch)) { meal("lunch",750,870); lunch=true; }
      const queue=new MinHeap((a,b)=>b.score-a.score || a.attraction.id.localeCompare(b.attraction.id));
      for(const a of filterAttractionsByBudget(eligible,remaining,visited)) {
        const route=leg(current.id,a.id),back=leg(a.id,hotel.id);
        if(!route || !back) continue;
        let arrival=clock+route.minutes;
        if(a.opening_time) arrival=Math.max(arrival,minutes(a.opening_time));
        const duration=Math.ceil(a.durationHours*60);
        const closing=a.closing_time ? minutes(a.closing_time) : 1439;
        if(arrival+duration>closing || arrival+duration+back.minutes+15>1439) continue;
        queue.insert({attraction:a,route,arrival,duration,
          score:scoreAttraction(a,current,remaining,trip.strategy,()=>route.distance_km)});
      }
      const candidate=queue.extractMin();
      if(!candidate) break;
      move(candidate.attraction,candidate.route);
      stop("attraction",candidate.attraction,candidate.arrival,candidate.duration,candidate.attraction.entryFeeNumeric);
      remaining-=candidate.attraction.entryFeeNumeric;
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
