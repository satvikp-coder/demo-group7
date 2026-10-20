// Display-only routing. Never changes the saved planner's paths, times or costs.
const finite = value => typeof value === 'number' && Number.isFinite(value);
export function point(stop) {
  if (!stop || !['string','number'].includes(typeof stop.lat) || !['string','number'].includes(typeof stop.lng) || stop.lat == null || stop.lng == null || String(stop.lat).trim()==='' || String(stop.lng).trim()==='') return null;
  const lat=Number(stop.lat),lng=Number(stop.lng);
  return finite(lat)&&finite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180 ? [lng,lat] : null;
}
export function distanceKm(a,b) {
  const rad=x=>x*Math.PI/180, dlat=rad(b[1]-a[1]),dlng=rad(b[0]-a[0]);
  const h=Math.sin(dlat/2)**2+Math.cos(rad(a[1]))*Math.cos(rad(b[1]))*Math.sin(dlng/2)**2;
  return 6371*2*Math.asin(Math.sqrt(Math.min(1,Math.max(0,h))));
}
export function estimatedLeg(from,to) {
  const a=point(from),b=point(to);
  return {from_stop_id:from.id,to_stop_id:to.id,status:!a||!b?'unavailable':distanceKm(a,b)<0.000001?'same_location':'estimated',
    coordinates:a&&b?[a,b]:[],distance_km:a&&b?distanceKm(a,b):null,duration_minutes:null,
    basis:a&&b?'Straight-line connection; road access and travel time unavailable':'Map location unavailable'};
}
export function validateRoad(data,a,b) {
  const route=data?.routes?.[0],coords=route?.geometry?.coordinates;
  if(data?.code!=='Ok'||route?.geometry?.type!=='LineString'||!Array.isArray(coords)||coords.length<2||coords.length>20000 ||
    !coords.every(p=>Array.isArray(p)&&p.length===2&&finite(p[0])&&finite(p[1])&&Math.abs(p[0])<=180&&Math.abs(p[1])<=90)||
    !finite(route.distance)||route.distance<0||!finite(route.duration)||route.duration<0) return null;
  // Refuse remote snapping: a road endpoint must lie within 200m of the actual stop.
  if(distanceKm(a,coords[0])>.2||distanceKm(b,coords.at(-1))>.2||route.distance/1000+0.4<distanceKm(a,b))return null;
  if(coords.slice(1).reduce((sum,p,i)=>sum+distanceKm(coords[i],p),0)>route.distance/1000*1.1+.4)return null;
  if(!Array.isArray(data.waypoints)||data.waypoints.length!==2||data.waypoints.some(w=>!finite(w.distance)||w.distance>200))return null;
  return {status:'road',coordinates:coords,distance_km:route.distance/1000,duration_minutes:route.duration/60,
    basis:'OSRM driving route estimate; not live traffic or confirmed access',checked_at:new Date().toISOString()};
}
export function createRouter({fetcher=fetch,base=process.env.MAP_ROUTING_URL??'https://routing.openstreetmap.de/routed-car',interval=1100,timeout=3500,ttl=86400000}={}) {
  const cache=new Map();let busy=false,next=0;
  async function leg(from,to,signal) {
    const fallback=estimatedLeg(from,to);
    if(fallback.status!=='estimated'||!base||signal?.aborted)return fallback;
    const a=point(from),b=point(to),key=JSON.stringify([base,'driving',a,b]);
    const hit=cache.get(key);if(hit&&hit.expires>Date.now())return {...fallback,...hit.value};
    // One global provider request at a time, <=1/sec, no unbounded request queue.
    if(busy)return fallback;
    busy=true;
    try {
      const wait=Math.max(0,next-Date.now());
      if(wait)await new Promise(r=>setTimeout(r,wait));
      if(signal?.aborted)return fallback;
      next=Date.now()+interval;
      const url=`${base.replace(/\/$/,'')}/route/v1/driving/${a.join(',')};${b.join(',')}?overview=full&geometries=geojson&steps=false&radiuses=200;200`;
      const response=await fetcher(url,{signal:AbortSignal.any([AbortSignal.timeout(timeout),...(signal?[signal]:[])]),headers:{'User-Agent':'HeritageTourismPlanner/1.0 (+https://github.com/satvikp-coder/demo-group7)'}});
      if(!response.ok)throw new Error('Routing unavailable');
      const body=await response.text();if(body.length>2000000)throw new Error('Routing response too large');
      const road=validateRoad(JSON.parse(body),a,b);
      const value=road?{...road,provider:'OSRM / OpenStreetMap'}:{};
      if(cache.size>=500)cache.delete(cache.keys().next().value);
      cache.set(key,{expires:Date.now()+(road?ttl:60000),value});
      return {...fallback,...value};
    } catch {if(cache.size>=500)cache.delete(cache.keys().next().value);cache.set(key,{expires:Date.now()+60000,value:{}});return fallback;}
    finally {busy=false;}
  }
  return {leg,async day(stops,signal){
    const legs=[];const deadline=AbortSignal.any([AbortSignal.timeout(18000),...(signal?[signal]:[])]);
    for(let i=1;i<stops.length;i++)legs.push(await leg(stops[i-1],stops[i],deadline));
    return {legs,road_legs:legs.filter(l=>l.status==='road').length,estimated_legs:legs.filter(l=>l.status==='estimated').length,
      unavailable_legs:legs.filter(l=>l.status==='unavailable').length,mode:'driving',
      advisory:'Map connections are separate display estimates. Saved itinerary times and distances are unchanged. Dashed lines do not confirm road access.'};
  }};
}
export const mapRouter=createRouter();
