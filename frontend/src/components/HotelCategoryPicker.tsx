import React, {useEffect,useState} from 'react';
import {api,useApi} from '../api';
import {ImageWithFallback} from './ImageWithFallback';
import {HOTEL_CATEGORIES,HOTEL_POLICY,type HotelCategory} from '../../../dsa/planning/hotelPolicy';
export function HotelCategoryPicker({destinationId,category,hotelId,onCategory,onHotel}:{destinationId:string;category:HotelCategory;hotelId:string;onCategory:(value:HotelCategory)=>void;onHotel:(id:string)=>void}) {
 const [sort,setSort]=useState('distance');
 const request=useApi(signal=>api.hotels(destinationId,sort,signal,category),[destinationId,category,sort],!!destinationId);
 const hotels=request.data??[];
 useEffect(()=>{if(request.data&&!request.data.some(h=>h.id===hotelId))onHotel('')},[request.data,hotelId]);
 return <div className="space-y-3" aria-label="Choose hotel category and property">
  <div className="flex flex-wrap gap-2" role="group" aria-label="Hotel category">{HOTEL_CATEGORIES.map(value=><button type="button" key={value} aria-pressed={category===value} onClick={()=>{onCategory(value);onHotel('')}} className={`px-3 py-2 border rounded-lg font-mono text-xs ${category===value?'bg-ink text-gold border-gold':'bg-salt text-ink border-stone/40'}`}>{value}</button>)}</div>
  <p className="text-xs text-stone">Nightly estimate bands: Low Cost below ₹{HOTEL_POLICY.bands.lowCostUpperExclusive.toLocaleString('en-IN')}; Budget ₹{HOTEL_POLICY.bands.lowCostUpperExclusive.toLocaleString('en-IN')}–₹{HOTEL_POLICY.bands.budgetUpperInclusive.toLocaleString('en-IN')}; Premium above ₹{HOTEL_POLICY.bands.budgetUpperInclusive.toLocaleString('en-IN')}. Stored prices are indicative, not live quotes or availability.</p>
  <label className="font-mono text-xs">Order hotels <select aria-label="Order matching hotels" value={sort} onChange={e=>setSort(e.target.value)} className="bg-salt border border-stone/40 p-2 rounded-lg"><option value="distance">Distance</option><option value="price">Price</option><option value="rating">Rating</option></select></label>
  {request.loading&&<p role="status">Finding matching hotels...</p>}
  {request.error&&<p role="alert">{request.error} <button type="button" onClick={request.reload}>Retry</button></p>}
  {!request.loading&&!request.error&&!hotels.length&&<p role="status">No {category} properties with a known price and location were found within the expanded {HOTEL_POLICY.expandedRadiusKm} km search area. Choose another category; no other category is substituted.</p>}
  {hotels[0]?.expandedSearch&&<p className="text-xs text-stone">Search expanded to {hotels[0].searchRadiusKm} km from {hotels[0].anchorName} because fewer than {HOTEL_POLICY.minimumChoices} matching properties were recorded nearby.</p>}
  <label htmlFor="planner-starting-hotel" className="text-xs">Select Hotel</label>
  <select id="planner-starting-hotel" value={hotelId} onChange={e=>onHotel(e.target.value)} disabled={request.loading||!hotels.length} className="w-full bg-salt text-charcoal font-mono text-xs p-2.5 border border-stone/40 rounded-lg"><option value="">Choose a matching property</option>{hotels.map(h=><option key={h.id} value={h.id}>{h.name} ({h.pricePerNight}/night)</option>)}</select>
  <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">{hotels.map(h=><article key={h.id} className="bg-white border border-stone/40 p-3 rounded-xl flex gap-3">
   <ImageWithFallback src={h.imageUrl} alt={h.name} category="hotel" className="w-24 h-24 object-cover rounded-lg shrink-0"/>
   <div className="min-w-0 space-y-1"><h4 className="font-display text-ink font-bold">{h.name}</h4><p className="text-xs">{h.pricePerNight}/night · {h.hotelCategory}</p><p className="text-xs text-stone">{h.location}</p><p className="text-xs text-stone">{h.priceBasis}</p><p className="text-xs text-stone">{h.distanceKm==null?'Distance unavailable':`${h.distanceKm.toFixed(1)} km approximate straight-line from ${h.anchorName}`}</p><p className="text-xs text-stone">Rating: {h.rating}{h.sourceUrl&&<> · <a href={h.sourceUrl} target="_blank" rel="noreferrer">Record source</a></>}{h.sourceDate&&` (${h.sourceDate.slice(0,10)})`}</p>{h.facilities?.length? <p className="text-xs">{h.facilities.join(', ')}</p>:null}<button type="button" aria-pressed={hotelId===h.id} onClick={()=>onHotel(h.id)} className="bg-ink text-gold border border-gold px-3 py-1 rounded-lg text-xs">{hotelId===h.id?'Selected Hotel':'Select Hotel'}</button></div>
  </article>)}</div>
 </div>;
}
