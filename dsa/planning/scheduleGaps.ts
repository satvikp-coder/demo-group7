interface Stop {day_number:number;stop_order:number;reference_id:string;arrival_time:string;departure_time:string}
interface Leg {day_number:number;from:string;to:string;minutes:number}
const minutes=(v:string)=>Number(v.slice(0,2))*60+Number(v.slice(3,5));
const time=(v:number)=>String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')+':00';
/** Disclose unused evidenced time, also for older saved plans; no booking or invented visit. */
export function scheduleGaps(stops:Stop[],legs:Leg[]){
 const gaps=[];
 for(let i=1;i<stops.length;i++){
  const previous=stops[i-1],next=stops[i];
  if(previous.day_number!==next.day_number)continue;
  const transfer=legs.find(l=>l.day_number===next.day_number&&l.from===previous.reference_id&&l.to===next.reference_id);
  if(previous.reference_id!==next.reference_id&&!transfer)continue;
  const end=minutes(next.arrival_time)-(transfer?.minutes??0),start=minutes(previous.departure_time);
  if(Number.isFinite(start)&&Number.isFinite(end)&&end-start>=60)gaps.push({day_number:next.day_number,before_stop_order:next.stop_order,start_time:time(start),end_time:time(end),duration_minutes:end-start,reason:'Personal time: no additional visit was scheduled within the known data, remaining budget and daily allocation. This is not a booked activity; the following transfer is separate.'});
 }
 return gaps;
}
