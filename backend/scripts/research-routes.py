"""Collect OSRM road-network matrix snapshots for a reviewed city; no synthetic fallback."""
import json,pathlib,sys,urllib.request,time
root=pathlib.Path(__file__).resolve().parents[2]
city=sys.argv[1]
coverage=json.loads((root/'backend/reports/final-data-coverage.json').read_text())
c=next(c for c in coverage['cities'] if c['destination']['slug']==city)
excluded={'somnath':['r101'],'dwarka':['r201']}.get(city,[])
nodes=[dict(r,kind=t[:-1]) for t in ['attractions','hotels','restaurants'] for r in c['resources'][t]['rows'] if r['external_id'] not in excluded]
coords=';'.join(str(r['lng'])+','+str(r['lat']) for r in nodes)
url='https://router.project-osrm.org/table/v1/driving/'+coords+'?annotations=distance,duration'
req=urllib.request.Request(url,headers={'User-Agent':'HeritageTourismAcademicDataResearch/1.0'})
with urllib.request.urlopen(req,timeout=55) as response: result=json.load(response)
if result.get('code')!='Ok': raise ValueError('Routing service did not return valid matrix')
snapshot={'city':city,'checked':time.strftime('%Y-%m-%d'),'source_url':url,'nodes':nodes,'response':result,'notes':'OSRM driving profile over OpenStreetMap roads; modelled travel time, not live traffic. Coordinates are representative mapped points, snapped to roads. Backend currently treats route rows as bidirectional; directional asymmetry remains a planner limitation. No fare is supplied.'}
(root/'data/research'/('routes-'+city+'.json')).write_text(json.dumps(snapshot,indent=2))
print(json.dumps({'city':city,'nodes':len(nodes),'snapDistancesMetres':[{'id':n['external_id'],'metres':w['distance'],'roadPoint':w['location']} for n,w in zip(nodes,result['sources'])]}))
