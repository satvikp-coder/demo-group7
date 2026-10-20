import {readFileSync} from 'node:fs';
import {knownAmount} from './costStatus.js';
import {calendarDay} from '../../dsa/planning/accommodation.ts';
export const planningDefaults={temple:60,mosque:45,stepwell:45,gate:30,museum:90,fort:120,palace:90,beach:60,garden:45,viewpoint:45,craft:90,nature:120,heritage:60};
const policies=JSON.parse(readFileSync(new URL('../../data/attraction-20261020/planning-policies.json',import.meta.url),'utf8'));
export function visitPolicy(a){
 const policy={...policies[a.slug],...a.provenance_review?.planning};
 if(policy.access_status==='temporarily_closed'||policy.access_status==='restricted')return {excluded:policy.access_status};
 const sourced=typeof a.source_url==='string'&&a.source_url.startsWith('https://');
 const fee=knownAmount(a.entry_fee_numeric);
 if(fee===null&&!sourced)return {excluded:'entry_price_unknown'};
 let duration=Number(a.duration_hours)*60;
 const estimated=a.duration_hours==null||!Number.isFinite(duration)||duration<=0;
 if(estimated&&!sourced)return {excluded:'visit_duration_unknown'};
 if(estimated){const category=Object.keys(planningDefaults).find(k=>(a.category??'').toLowerCase().includes(k))??'heritage';duration=policy.duration_minutes??planningDefaults[category];}
 if(!Number.isFinite(duration)||duration<=0||duration>600)return {excluded:'visit_duration_invalid'};
 const notes=[a.best_time_note,estimated?`Visit duration is a planning estimate (${duration} minutes), not published operating information.`:null,fee===null?'Admission price unavailable. Provisional visit; the known subtotal does not guarantee the full budget.':null];
 return {durationMinutes:Math.ceil(duration),feeUnknown:fee===null,notes:notes.filter(Boolean).join(' '),policy};
}
export function isClosed(a,startDate,dayNumber){
 const p={...policies[a.slug],...a.provenance_review?.planning};
 if(['temporarily_closed','restricted'].includes(p.access_status))return true;
 const stamp=calendarDay(startDate);if(stamp==null)return false;
 const date=new Date((stamp+dayNumber-1)*86400000),weekday=date.getUTCDay(),md=date.toISOString().slice(5,10);
 return (p.closed_weekdays??[]).includes(weekday)||(p.closed_from&&md>=p.closed_from&&md<=p.closed_through)||((p.closed_month_weeks??[]).includes(Math.ceil(date.getUTCDate()/7))&&weekday===p.closed_month_weekday);
}

export function visitWindow(a,startDate,dayNumber,earliest,duration){
 if(isClosed(a,startDate,dayNumber))return {closed:true};
 const windows=a.provenance_review?.planning?.windows??policies[a.slug]?.windows;
 if(!windows)return null;
 for(const [open,close] of windows){const arrival=Math.max(earliest,open);if(arrival+duration<=close)return {closed:false,arrival,closing:close,advisory:'Published tourism-source operating window; confirm exceptional closures before travel.'};}
 return {closed:true};
}
