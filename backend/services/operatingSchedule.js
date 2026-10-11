import {operatingPolicies as policies} from './admissionPolicy.js';
import {calendarDay} from '../../dsa/planning/accommodation.ts';
export function datedOperation(attraction,startDate,dayNumber,earliest,duration){
 const policy=policies[attraction.slug],stamp=calendarDay(startDate);
 if(!policy||(stamp===null&&!policy.undated_windows))return null;
 const date=stamp===null?null:new Date((stamp+dayNumber-1)*86400000),weekday=date?.getUTCDay();
 if(policy.closed_weekdays.includes(weekday))return {closed:true};
 const monthDay=date?.toISOString().slice(5,10),summer=monthDay>=policy.summer_from&&monthDay<=policy.summer_through;
 if(policy.closed_from&&monthDay>=policy.closed_from&&monthDay<=policy.closed_through)return {closed:true};
 const windows=stamp===null?policy.undated_windows:summer?policy.summer_windows:policy.winter_windows;
 for(const [open,close] of windows){
  if(policy.fixed_departures&&earliest>open)continue;
  const arrival=policy.fixed_departures?open:open+Math.max(0,Math.ceil((earliest-open)/policy.slot_minutes))*policy.slot_minutes;
  if(arrival+duration<=close)return {closed:false,arrival,closing:close,fee:[0,6].includes(weekday)?policy.weekend_indian_fee:policy.weekday_indian_fee,advisory:policy.limitations};
 }
 return {closed:true};
}
