import {utility} from '../../dsa/planning/priorities.ts';
// Additive interpretation of immutable stop snapshots; never reprices saved trips.
export function knownAmount(value) {
  if(value==null||typeof value==='boolean'||String(value).trim()==='')return null;
  const n=Number(value);return Number.isFinite(n)&&n>=0?Math.round(n*100)/100:null;
}
export function costDetails(trip,stops) {
  const summary=trip.generation_summary??{},states=summary.cost_states??{};
  const categories={};const unknown=[];
  const names={hotel:'Accommodation',attractions:'Entry fees',meals:'Food',transit:'Transport'};
  for(const [key,type] of Object.entries({hotel:'hotel',attractions:'attraction',meals:'meal',transit:'transit'})) {
    const rows=stops.filter(s=>s.stop_type===type);
    const values=rows.map(s=>knownAmount(s.cost));
    const subtotal=values.reduce((sum,v)=>sum+(v??0),0);
    let missing=values.some(v=>v===null);
    // Historical explicit zeros have no fee provenance: do not declare free admission.
    if(type==='attraction'||type==='meal')missing ||= rows.some((s,i)=>values[i]===0&&states[`${s.day_number}:${s.stop_order}`]!=='KNOWN_ZERO');
    if(type==='meal')missing ||= rows.length===0;
    if(type==='hotel')missing ||= (trip.lodging_nights??trip.trip_days)!==0 && (!rows.length || subtotal===0 && !Object.keys(states).length);
    if(type==='attraction')missing ||= rows.length===0;
    if(type==='transit')missing ||= summary.transport_cost_known!==true;
    categories[key]={state:missing?'UNKNOWN':subtotal===0?'KNOWN_ZERO':'KNOWN_POSITIVE',known_subtotal:Math.round(subtotal*100)/100,
      amount:missing?null:Math.round(subtotal*100)/100,basis:'Saved catalog estimate; not a live quote'};
    if(missing)unknown.push(names[key]);
  }
  // A scheduled restaurant stop is not a full-trip food allowance; breakfast,
  // personal meals and unscheduled meals are not priced by this application.
  if(!unknown.includes('Food'))unknown.push('Additional food outside scheduled meals');
  if((trip.lodging_nights??trip.trip_days)>0&&summary.lodging_taxes_known!==true)unknown.push('Accommodation taxes and fees');
  return {categories,unknown_components:unknown,complete:unknown.length===0,
    known_subtotal:Math.round(Object.values(categories).reduce((sum,c)=>sum+c.known_subtotal,0)*100)/100,
    final_total:unknown.length?null:Math.round(Object.values(categories).reduce((sum,c)=>sum+c.known_subtotal,0)*100)/100,
    feasibility:'Known subtotal only; unpriced expenses can exceed the remaining budget'};
}

// Missing scheduled meal prices/coverage must never win the cost preference by
// appearing cheaper. Common unpriced extras remain unknown for every candidate.
export function comparableCostUtility(candidate,candidates) {
  const maximum=Math.max(...candidates.map(c=>c.priced_meal_count));
  if(candidate.priced_meal_count!==maximum)return 0;
  return utility(candidate.known_cost,candidates.filter(c=>c.priced_meal_count===maximum).map(c=>c.known_cost),true);
}
