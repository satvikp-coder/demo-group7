import {readFileSync} from 'node:fs';
import {calendarDay} from '../../dsa/planning/accommodation.ts';
const policies=JSON.parse(readFileSync(new URL('../../data/phase2/operating-policies.json',import.meta.url),'utf8'));
export function datedOperation(attraction,startDate,dayNumber,earliest,duration){
 const policy=policies[attraction.slug],stamp=calendarDay(startDate);
 if(!policy||stamp===null)return null;
 const date=new Date((stamp+dayNumber-1)*86400000),weekday=date.getUTCDay();
 if(policy.closed_weekdays.includes(weekday))return {closed:true};
 const monthDay=date.toISOString().slice(5,10),summer=monthDay>=policy.summer_from&&monthDay<=policy.summer_through;
 const windows=summer?policy.summer_windows:policy.winter_windows;
 for(const [open,close] of windows){
  const arrival=open+Math.max(0,Math.ceil((earliest-open)/policy.slot_minutes))*policy.slot_minutes;
  if(arrival+duration<=close)return {closed:false,arrival,closing:close,fee:[0,6].includes(weekday)?policy.weekend_indian_fee:policy.weekday_indian_fee,advisory:policy.limitations};
 }
 return {closed:true};
}
