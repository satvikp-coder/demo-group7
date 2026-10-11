import {readFileSync} from 'node:fs';
import {calendarDay} from '../../dsa/planning/accommodation.ts';

export const operatingPolicies={
 ...JSON.parse(readFileSync(new URL('../../data/phase2/operating-policies.json',import.meta.url),'utf8')),
 ...JSON.parse(readFileSync(new URL('../../data/phase3/operating-policies.json',import.meta.url),'utf8')),
};

/** Policy amounts are explicitly sourced estimates, never live availability. */
export function admissionEstimate(attraction,travelers,startDate,dayNumber=1){
 const policy=operatingPolicies[attraction.slug],stamp=calendarDay(startDate);
 let rate=attraction.entry_fee_numeric;
 let advisory=null;
 if(policy&&(stamp!==null||policy.fee_unit==='vehicle')){
  const weekday=stamp===null?null:new Date((stamp+dayNumber-1)*86400000).getUTCDay();
  rate=[0,6].includes(weekday)?policy.weekend_indian_fee:policy.weekday_indian_fee;
  advisory=policy.limitations;
 }
 if(rate==null)return {cost:null,advisory};
 const quantity=policy?.fee_unit==='vehicle'?Math.ceil(travelers/policy.capacity):travelers;
 return {cost:Math.round(Number(rate)*100)*quantity/100,advisory};
}
