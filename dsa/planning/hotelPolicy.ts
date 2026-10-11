import policy from './hotel-policy.json';
export const HOTEL_POLICY = policy;
export const HOTEL_CATEGORIES = ['Low Cost','Budget','Premium'] as const;
export type HotelCategory = typeof HOTEL_CATEGORIES[number];
export function usableHotelPrice(hotel:{price_per_night:unknown;provenance_review?:{price_basis?:string;price_kind?:string;valid_until?:string}},today=new Date().toISOString().slice(0,10)):number|null {
 const review=hotel.provenance_review;
 if(review?.price_kind==='historical'||/historical/i.test(review?.price_basis??'')||(review?.valid_until&&review.valid_until<today))return null;
 const price=hotel.price_per_night;
 return price==null||price===''||!Number.isFinite(Number(price))||Number(price)<0?null:Number(price);
}
export function hotelPriceView<T extends {price_per_night:unknown;provenance_review?:{price_basis?:string};historical_price_per_night?:unknown}>(hotel:T) {
 const price=usableHotelPrice(hotel);
 return {...hotel,price_per_night:price,...(price==null&&(hotel.historical_price_per_night??hotel.price_per_night)!=null?{historical_price_per_night:hotel.historical_price_per_night??hotel.price_per_night}:{}),price_basis:price==null?'Price unavailable — check current rates':hotel.provenance_review?.price_basis??'Stored indicative nightly price; not live availability'};
}
export function hotelCategory(price: unknown): HotelCategory | null {
 if(price==null || price==='' || !Number.isFinite(Number(price)) || Number(price)<0) return null;
 const amount=Number(price);
 return amount<policy.bands.lowCostUpperExclusive?'Low Cost':amount<=policy.bands.budgetUpperInclusive?'Budget':'Premium';
}
export function haversineKm(lat1: unknown,lng1: unknown,lat2: unknown,lng2: unknown): number | null {
 const values=[lat1,lng1,lat2,lng2];
 if(values.some(x=>x==null||x===''||!Number.isFinite(Number(x)))) return null;
 const [a,b,c,d]=values.map(Number);
 if(Math.abs(a)>90||Math.abs(c)>90||Math.abs(b)>180||Math.abs(d)>180) return null;
 const rad=Math.PI/180,dl=(c-a)*rad,dn=(d-b)*rad;
 const h=Math.sin(dl/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(dn/2)**2;
 return 6371.0088*2*Math.atan2(Math.sqrt(Math.min(1,h)),Math.sqrt(Math.max(0,1-h)));
}
export function nearbyHotels<T extends {id:string;price_per_night:unknown;lat:unknown;lng:unknown;provenance_review?:{price_basis?:string}}>(hotels:T[],anchor:{name:string;lat:unknown;lng:unknown}|null,category?:HotelCategory) {
 const rows=hotels.map(hotelPriceView).map(h=>({...h,hotel_category:hotelCategory(h.price_per_night),distance_km:anchor?haversineKm(anchor.lat,anchor.lng,h.lat,h.lng):null,distance_type:'approximate straight-line',anchor_name:anchor?.name??null,price_basis:h.price_basis}));
 if(!category) return rows;
 const matching=rows.filter(h=>h.hotel_category===category&&h.distance_km!==null);
 const expanded=matching.filter(h=>h.distance_km!<=policy.radiusKm).length<policy.minimumChoices;
 const radius=expanded?policy.expandedRadiusKm:policy.radiusKm;
 return matching.filter(h=>h.distance_km!<=radius).map(h=>({...h,search_radius_km:radius,expanded_search:expanded}));
}
