import {accommodationNights,calendarDay} from './accommodation';

/** A new What If version preserves the original arrival/extra-night convention.
 * Existing saved records are never changed; explicit zero-night visits stay zero.
 */
export function resizeAccommodation<T extends {tripDays:number;lodgingNights?:number;arrivalDate?:string;departureDate?:string}>(config:T,days:number):T {
 const previous=accommodationNights({days:config.tripDays,lodging_nights:config.lodgingNights,arrival_date:config.arrivalDate,departure_date:config.departureDate});
 const next={...config,tripDays:days};
 if(config.lodgingNights!=null||config.arrivalDate){
  next.lodgingNights=previous===0?0:Math.max(0,previous+days-config.tripDays);
  if(config.arrivalDate)next.departureDate=new Date((calendarDay(config.arrivalDate)!+next.lodgingNights)*86400000).toISOString().slice(0,10);
 }
 accommodationNights({days,lodging_nights:next.lodgingNights,arrival_date:next.arrivalDate,departure_date:next.departureDate});
 return next;
}
