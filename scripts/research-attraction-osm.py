import urllib.request,urllib.parse,json,time
from pathlib import Path
queries={'dwarka':'[out:json][timeout:35];(nwr["tourism"](22.20,68.85,22.50,69.15);nwr["historic"](22.20,68.85,22.50,69.15);nwr["amenity"="place_of_worship"](22.20,68.85,22.50,69.15););out center tags;', 'saputara':'[out:json][timeout:35];(nwr["tourism"](20.53,73.72,20.61,73.80);nwr["leisure"="garden"](20.53,73.72,20.61,73.80);nwr["amenity"="place_of_worship"](20.53,73.72,20.61,73.80););out center tags;'}
for city,q in queries.items():
 p=Path('data/attraction-20261020/osm-'+city+'.json')
 if p.exists():continue
 try:
  req=urllib.request.Request('https://overpass-api.de/api/interpreter',data=urllib.parse.urlencode({'data':q}).encode(),headers={'User-Agent':'HeritageTourismPlanner academic tourism catalog review (+https://github.com/satvikp-coder/demo-group7)'})
  d=json.load(urllib.request.urlopen(req,timeout=45));d['query']=q;d['checked']='2026-10-20';d['source']='https://overpass-api.de/api/interpreter';d['license']='OpenStreetMap contributors ODbL-1.0';p.write_text(json.dumps(d,ensure_ascii=False,indent=2),encoding='utf-8')
  for e in d['elements']:
   t=e.get('tags',{});n=t.get('name:en') or t.get('name')
   if n and t.get('tourism') not in ['hotel','guest_house','hostel','motel','apartment']:print(json.dumps({'city':city,'id':str(e['type'])+'/'+str(e['id']),'name':n,'tags':t,'point':e.get('center',{}) or {k:e.get(k) for k in ['lat','lon']}}),flush=True)
 except Exception as e:print(city,str(e),flush=True)
 time.sleep(1.1)
