"""Eight deliberate cached OSRM table queries, not a runtime dependency or live-traffic claim."""
import json,urllib.request,time
from pathlib import Path
root=Path('data/attraction-20261020');catalog=json.loads(Path('backups/attraction-catalog-before.json').read_text(encoding='utf-8'));new=json.loads((root/'catalog-20261020.json').read_text(encoding='utf-8'))['records']
for city in catalog['destinations']:
 p=root/('routes-'+city['slug']+'-20261020.json')
 if p.exists():continue
 nodes=[]
 for table,kind in [('hotels','hotel'),('attractions','attraction'),('restaurants','restaurant')]:
  for row in catalog[table]:
   if row['destination_id']==city['id']:nodes.append({'kind':kind,'external_id':row['external_id'],'lat':float(row['lat']),'lng':float(row['lng'])})
 for row in new:
  if row['city']==city['slug']:nodes.append({'kind':'attraction','external_id':row['key'],'lat':row['values']['lat'],'lng':row['values']['lng']})
 if any(n['external_id'] is None for n in nodes):raise ValueError('Missing stable source identity')
 url='https://routing.openstreetmap.de/routed-car/table/v1/driving/'+';'.join(str(n['lng'])+','+str(n['lat']) for n in nodes)+'?annotations=distance,duration'
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'HeritagePlannerCatalog/1.0 (+https://github.com/satvikp-coder/demo-group7)'})
  d=json.load(urllib.request.urlopen(req,timeout=45))
  if d.get('code')!='Ok':raise ValueError(d.get('code'))
  p.write_text(json.dumps({'city':city['slug'],'checked':'2026-10-20','source_url':url,'nodes':nodes,'response':d},indent=2),encoding='utf-8');print(city['slug'],len(nodes),'actual table response cached',flush=True)
 except Exception as e:print(city['slug'],'ROUTING_NOT_VERIFIED',str(e),flush=True)
 time.sleep(1.5)
