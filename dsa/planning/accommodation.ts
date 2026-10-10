/** Calendar-day arithmetic: UTC avoids timezone/DST changes to room-night counts. */
export function calendarDay(value: unknown): number | null {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const stamp=Date.parse(value+'T00:00:00Z');
 return Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===value?stamp/86400000:null;
}
export function accommodationNights(input:{days:number;lodging_nights?:number|null;arrival_date?:string|null;departure_date?:string|null}):number {
 const {days,lodging_nights:nights,arrival_date:arrival,departure_date:departure}=input;
 if(!Number.isInteger(days)||days<1||days>30)throw new Error('Trip days must be between 1 and 30');
 if(Boolean(arrival)!==Boolean(departure))throw new Error('Supply both accommodation arrival and departure dates');
 let result=nights??days; // Older requests/records retain their original convention.
 if(arrival&&departure){
  const start=calendarDay(arrival),end=calendarDay(departure);
  if(start===null||end===null||end<start)throw new Error('Accommodation departure must not precede arrival');
  result=end-start;
  if(nights!=null&&nights!==result)throw new Error('Accommodation dates and nights must agree');
 }
 if(!Number.isInteger(result)||result<0||result>days+1)throw new Error('Lodging nights must be between zero and trip days plus one');
 return result;
}
export function lodgingSubtotal(rate:unknown,nights:number,rooms:number):number|null {
 if(!Number.isInteger(nights)||nights<0||!Number.isInteger(rooms)||rooms<1||rooms>20)throw new Error('Invalid lodging quantities');
 if(nights===0)return 0; // No room purchased; does not represent a free room rate.
 if(rate==null||rate===''||!Number.isFinite(Number(rate))||Number(rate)<0)return null;
 return Math.round(Number(rate)*100)*nights*rooms/100;
}
