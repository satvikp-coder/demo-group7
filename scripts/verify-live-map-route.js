// One deliberate live request using public catalog locations; never a planner mutation.
import {createRouter} from '../backend/services/mapRouting.js';
import {writeFileSync} from 'node:fs';
const base='http://localhost:8080/api';
const cities=await (await fetch(base+'/destinations')).json();const city=cities.find(c=>c.name==='Modhera');
const hotels=await (await fetch(base+'/destinations/'+city.id+'/hotels')).json();
const attractions=await (await fetch(base+'/destinations/'+city.id+'/attractions')).json();
const a=hotels.find(h=>h.name.includes('Sunrise'))??hotels[0],b=attractions.find(a=>/sun temple/i.test(a.name))??attractions[0];
const route=await createRouter({timeout:10000}).leg(a,b);
const report={checkedAt:new Date().toISOString(),source:'https://routing.openstreetmap.de/routed-car',origin:{id:a.id,name:a.name,lat:a.lat,lng:a.lng},destination:{id:b.id,name:b.name,lat:b.lat,lng:b.lng},route,liveRoadVerified:route.status==='road'};
writeFileSync(new URL('../reports/map-live-routing.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify({...report,route:{...route,coordinates:route.coordinates.length+' coordinate pairs'}}));
