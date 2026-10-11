import React, {useEffect,useState} from 'react';
import {api,useApi} from '../api';
import {ImageWithFallback} from './ImageWithFallback';
import {useLanguage} from '../context/LanguageContext';
import {HOTEL_CATEGORIES,HOTEL_POLICY,type HotelCategory} from '../../../dsa/planning/hotelPolicy';
export function HotelCategoryPicker({destinationId,category,hotelId,onCategory,onHotel}:{destinationId:string;category:HotelCategory;hotelId:string;onCategory:(value:HotelCategory)=>void;onHotel:(id:string)=>void}) {
 const {t}=useLanguage();
 const text=(key:string,values:Record<string,string|number>={})=>t(key).replace(/\{(\w+)\}/g,(match,name)=>String(values[name]??match));
 const [sort,setSort]=useState('distance');
 const request=useApi(signal=>api.hotels(destinationId,sort,signal,category),[destinationId,category,sort],!!destinationId);
 const hotels=request.data??[];
 useEffect(()=>{if(request.data&&!request.data.some(h=>h.id===hotelId))onHotel('')},[request.data,hotelId]);
 return <div className="space-y-3" aria-label={t('hotel.choose')}>
  <div className="flex flex-wrap gap-2" role="group" aria-label={t('hotel.category')}>{HOTEL_CATEGORIES.map(value=><button type="button" key={value} aria-pressed={category===value} onClick={()=>{onCategory(value);onHotel('')}} className={`px-3 py-2 border rounded-lg font-mono text-xs ${category===value?'bg-ink text-gold border-gold':'bg-salt text-ink border-stone/40'}`}>{t('hotel.'+value)}</button>)}</div>
  <p className="text-xs text-stone">{text('hotel.bands',{low:HOTEL_POLICY.bands.lowCostUpperExclusive.toLocaleString('en-IN'),high:HOTEL_POLICY.bands.budgetUpperInclusive.toLocaleString('en-IN')})}</p>
  <label className="font-mono text-xs">{t('hotel.order')} <select aria-label={t('hotel.orderAria')} value={sort} onChange={e=>setSort(e.target.value)} className="bg-salt border border-stone/40 p-2 rounded-lg"><option value="distance">{t('hotel.distance')}</option><option value="price">{t('hotel.price')}</option><option value="rating">{t('hotel.rating')}</option></select></label>
  {request.loading&&<p role="status">{t('hotel.loading')}</p>}
  {request.error&&<p role="alert">{request.error} <button type="button" onClick={request.reload}>{t('hotel.retry')}</button></p>}
  {!request.loading&&!request.error&&!hotels.length&&<p role="status">{text('hotel.empty',{category:t('hotel.'+category),radius:HOTEL_POLICY.expandedRadiusKm})}</p>}
  {hotels[0]?.expandedSearch&&<p className="text-xs text-stone">{text('hotel.expanded',{radius:hotels[0].searchRadiusKm,anchor:hotels[0].anchorName,minimum:HOTEL_POLICY.minimumChoices})}</p>}
  <label htmlFor="planner-starting-hotel" className="text-xs">{t('hotel.select')}</label>
  <select id="planner-starting-hotel" value={hotelId} onChange={e=>onHotel(e.target.value)} disabled={request.loading||!hotels.length} className="w-full bg-salt text-charcoal font-mono text-xs p-2.5 border border-stone/40 rounded-lg"><option value="">{t('hotel.prompt')}</option>{hotels.map(h=><option key={h.id} value={h.id}>{h.name} ({h.pricePerNight}/{t('hotel.night')})</option>)}</select>
  <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto">{hotels.map(h=><article key={h.id} className="bg-white border border-stone/40 p-3 rounded-xl flex gap-3">
   <ImageWithFallback src={h.imageUrl} alt={h.name} category="hotel" className="w-24 h-24 object-cover rounded-lg shrink-0"/>
   <div className="min-w-0 space-y-1"><h4 className="font-display text-ink font-bold">{h.name}</h4><p className="text-xs">{h.pricePerNight}/{t('hotel.night')} · {h.hotelCategory?t('hotel.'+h.hotelCategory):''}</p><p className="text-xs text-stone">{h.location}</p><p className="text-xs text-stone">{h.priceBasis}</p><p className="text-xs text-stone">{h.distanceKm==null?t('hotel.distanceUnknown'):text('hotel.straightLine',{distance:h.distanceKm.toFixed(1),anchor:h.anchorName})}</p><p className="text-xs text-stone">{t('hotel.rating')}: {h.rating}{h.sourceUrl&&<> · <a href={h.sourceUrl} target="_blank" rel="noreferrer">{t('hotel.source')}</a></>}{h.sourceDate&&` (${h.sourceDate.slice(0,10)})`}</p>{h.facilities?.length? <p className="text-xs">{h.facilities.join(', ')}</p>:null}<button type="button" aria-pressed={hotelId===h.id} onClick={()=>onHotel(h.id)} className="bg-ink text-gold border border-gold px-3 py-1 rounded-lg text-xs">{hotelId===h.id?t('hotel.selected'):t('hotel.select')}</button></div>
  </article>)}</div>
 </div>;
}
