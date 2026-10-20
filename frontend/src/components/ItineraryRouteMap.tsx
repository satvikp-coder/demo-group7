import {haversineKm} from '../../../dsa/planning/hotelPolicy';
import React, {useEffect,useMemo,useRef,useState} from 'react';
import {MapContainer,TileLayer,Marker,Popup,Polyline,useMap} from 'react-leaflet';
import {divIcon,Marker as LeafletMarker,LatLngTuple} from 'leaflet';
import {renderToStaticMarkup} from 'react-dom/server';
import {BedDouble,Landmark,Utensils,MapPin} from 'lucide-react';
import {api,errorMessage} from '../api';
import 'leaflet/dist/leaflet.css';
import './ItineraryRouteMap.css';

type Stop={id:string;name:string;type:string;lat?:number;lng?:number;arrivalTime?:string;departureTime?:string;durationMinutes?:number};
type Leg={from_stop_id:string;to_stop_id:string;status:string;coordinates:[number,number][];distance_km:number|null;duration_minutes:number|null;basis:string};
type Route={legs:Leg[];road_legs:number;estimated_legs:number;unavailable_legs:number};
export function location(s:Stop):LatLngTuple|null {
  return typeof s.lat==='number'&&Number.isFinite(s.lat)&&Math.abs(s.lat)<=90&&typeof s.lng==='number'&&Number.isFinite(s.lng)&&Math.abs(s.lng)<=180?[s.lat,s.lng]:null;
}
function View({stops,selected,fit}:{stops:Stop[];selected:string|null;fit:number}) {
  const map=useMap();
  useEffect(()=>{const points=stops.map(location).filter((p):p is LatLngTuple=>p!==null);map.invalidateSize();if(points.length)map.fitBounds(points,{padding:[35,35],maxZoom:15,animate:false});},[map,stops,fit]);
  useEffect(()=>{const point=location(stops.find(s=>s.id===selected)??{id:'',name:'',type:''});if(point)map.panTo(point);},[map,stops,selected]);
  return null;
}
const StopMarker: React.FC<{stop:Stop;index:number;selected:boolean;onSelect:(id:string)=>void}> = ({stop,index,selected,onSelect}) => {
  const ref=useRef<LeafletMarker>(null),position=location(stop);
  const Icon=stop.type==='hotel'?BedDouble:stop.type==='meal'?Utensils:stop.type==='attraction'?Landmark:MapPin;
  const icon=useMemo(()=>divIcon({className:'heritage-map-marker',html:renderToStaticMarkup(<span className={`heritage-marker-body ${selected?'is-selected':''}`}><Icon size={15}/><b>{index+1}</b></span>),iconSize:[42,30],iconAnchor:[21,30]}),[index,selected,stop.type]);
  useEffect(()=>{if(!selected){ref.current?.closePopup();return;}const timer=setTimeout(()=>ref.current?.openPopup(),0);return ()=>clearTimeout(timer);},[selected]);
  if(!position)return null;
  return <Marker ref={ref} position={position} icon={icon} title={`Stop ${index+1}: ${stop.name}`} alt={`Stop ${index+1}: ${stop.type}`} zIndexOffset={selected?1000:index} eventHandlers={{click:()=>onSelect(stop.id)}}>
    <Popup><strong>{index+1}. {stop.name}</strong><p>{stop.type==='meal'?'Restaurant':stop.type}</p><p>{stop.arrivalTime??'Arrival unavailable'} - {stop.departureTime??'Departure unavailable'}</p><p>{stop.durationMinutes==null?'Visit duration unavailable':`${stop.durationMinutes} minutes at stop`}</p></Popup>
  </Marker>;
}
export default function ItineraryRouteMap({tripId,dayNumber,stops,selected,onSelect}:{tripId:string;dayNumber:number;stops:Stop[];selected:string|null;onSelect:(id:string)=>void}) {
  const [routeResult,setRoute]=useState<{key:string;data:Route}|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[fit,setFit]=useState(0),[tileError,setTileError]=useState(false);
  // Component-scoped cache is discarded on trip/account unmount. Keys include exact stops.
  const cache=useRef(new Map<string,Route>());
  const key=JSON.stringify([tripId,dayNumber,stops.map(s=>[s.id,s.lat,s.lng])]);
  const route=routeResult?.key===key?routeResult.data:null;
  useEffect(()=>{
    const controller=new AbortController();setRoute(null);setError('');setTileError(false);
    const hit=cache.current.get(key);if(hit){setRoute({key,data:hit});setLoading(false);return;}
    setLoading(true);
    api.tripMap(tripId,dayNumber,controller.signal).then(value=>{if(value.legs.length!==Math.max(0,stops.length-1)||value.legs.some((l:Leg,i:number)=>l.from_stop_id!==stops[i].id||l.to_stop_id!==stops[i+1].id))throw new Error('Saved stops changed; refresh the itinerary.');if(!controller.signal.aborted){cache.current.set(key,value as Route);setRoute({key,data:value as Route});}}).catch(e=>{if(!controller.signal.aborted)setError(errorMessage(e));}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return ()=>controller.abort();
  },[key,tripId,dayNumber]);
  const valid=stops.filter(s=>location(s));
  const fallback:Leg[]=stops.slice(1).map((s,i)=>({from_stop_id:stops[i].id,to_stop_id:s.id,status:'estimated',coordinates:location(stops[i])&&location(s)?[[stops[i].lng!,stops[i].lat!],[s.lng!,s.lat!]]:[],distance_km:haversineKm(stops[i].lat,stops[i].lng,s.lat,s.lng),duration_minutes:null,basis:'Straight-line connection; routing unavailable'}));
  const legs=route?.legs??fallback;
  return <section className="heritage-route-map" aria-label="Interactive itinerary route map">
    <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><h3 className="font-display text-xl">Day {dayNumber} route map</h3><button className="border border-gold px-3 py-1 rounded" onClick={()=>setFit(x=>x+1)}>Fit route</button></div>
    {loading&&<p role="status">Loading road connections...</p>}
    {error&&<p role="status">Road routing unavailable. Showing estimated connections. {error}</p>}
    {tileError&&<p role="status">Map tiles unavailable. Stop markers and the itinerary remain available.</p>}
    {!valid.length?<p>No valid map locations for this day.</p>:<MapContainer center={location(valid[0])!} zoom={12} scrollWheelZoom={false} className="heritage-leaflet" aria-label="Map of saved itinerary stops">
      <TileLayer url={import.meta.env.VITE_MAP_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png'} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' eventHandlers={{tileerror:()=>setTileError(true)}}/>
      <View stops={stops} selected={selected} fit={fit}/>
      {legs.filter(l=>l.coordinates.length>=2&&location(stops.find(s=>s.id===l.from_stop_id)!)&&location(stops.find(s=>s.id===l.to_stop_id)!)).map((leg,i)=><Polyline key={`${key}-${i}`} positions={leg.coordinates.map(([lng,lat])=>[lat,lng] as LatLngTuple)} pathOptions={{color:leg.status==='road'?'#2563eb':'#9a6700',weight:4,dashArray:leg.status==='road'?undefined:'7 7'}}><Popup>{leg.basis}{leg.distance_km!=null&&<p>{leg.distance_km.toFixed(2)} km {leg.status==='road'?'routed':'straight-line'}</p>}{leg.duration_minutes!=null&&<p>{Math.round(leg.duration_minutes)} minutes routing estimate, not live traffic</p>}</Popup></Polyline>)}
      {stops.map((s,i)=><StopMarker key={s.id} stop={s} index={i} selected={selected===s.id} onSelect={onSelect}/>)}
    </MapContainer>}
    <p className="text-xs mt-3" data-testid="route-coverage">Solid blue: routed road geometry ({route?.road_legs??0} legs). Dashed gold: straight-line estimates ({route?.estimated_legs??fallback.filter(l=>l.coordinates.length).length} legs). Missing connections: {route?.unavailable_legs??fallback.filter(l=>!l.coordinates.length).length}.</p>
    <p className="text-xs">Map distance: {legs.filter(l=>l.status==='road').reduce((n,l)=>n+(l.distance_km??0),0).toFixed(2)} km routed; {legs.filter(l=>l.status==='estimated').reduce((n,l)=>n+(l.distance_km??0),0).toFixed(2)} km straight-line. </p>
    <p className="text-xs">Map routing estimates may differ from saved planning distances and times. They do not confirm access, traffic or fares. Routing: <a href="https://routing.openstreetmap.de/about.html">OSRM / FOSSGIS</a> | <a href="https://www.openstreetmap.org/fixthemap">Report a map issue</a>.</p>
    {stops.filter(s=>!location(s)).map(s=><p key={s.id}>Map location unavailable: {s.name}</p>)}
    <ol className="flex flex-wrap gap-2 mt-3" aria-label="Map stop selection">{stops.map((s,i)=><li key={s.id}><button className="border border-gold rounded px-2 py-1 text-xs" aria-pressed={selected===s.id} onClick={()=>onSelect(s.id)}>{i+1}. {s.name}</button></li>)}</ol>
  </section>;
}
