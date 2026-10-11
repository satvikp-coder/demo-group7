"""Validate installed category coverage with real read-only API requests."""
import json,os,datetime,math,uuid
from urllib.request import urlopen
from urllib.parse import quote
from pathlib import Path
root=Path(__file__).resolve().parents[1]
base=os.environ.get('API_TEST_URL','http://127.0.0.1:8080/api')
def get(path):
 with urlopen(base+path,timeout=15) as response:
  assert response.status==200;return json.load(response)
report={'verified':False,'readOnly':True,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'destinations':[]}
manifest=json.loads((root/'data/hotel-coverage/catalog-20261011.json').read_text(encoding='utf-8'));added={r['values']['slug'] for r in manifest['records']};found=set()
cities=get('/destinations');assert len(cities)==8
for city in cities:
 hotels=get('/destinations/'+city['id']+'/hotels');row={'destination':city['name'],'slug':city['slug'],'recorded':len(hotels),'unknownPrices':sum(h['price_per_night'] is None for h in hotels),'categories':{}}
 for h in hotels:
  uuid.UUID(h['id']);assert -90<=float(h['lat'])<=90 and -180<=float(h['lng'])<=180
  if h['slug'] in added:
   found.add(h['slug']);assert h['source_url'].startswith('https://') and h['source_date'] and h['rating'] is None
   assert h['provenance_review']['price_kind']=='published_estimate'
 for category in ['Low Cost','Budget','Premium']:
  matching=get('/destinations/'+city['id']+'/hotels?category='+quote(category));assert matching,city['name']+' '+category
  for h in matching:
   assert h['hotel_category']==category and h['price_per_night']>0
   assert math.isfinite(h['distance_km']) and 0<=h['distance_km']<=h['search_radius_km']
   assert h['distance_type']=='approximate straight-line'
  row['categories'][category]={'choices':len(matching),'hotels':[{'name':h['name'],'id':h['id'],'nightlyEstimate':h['price_per_night'],'distanceKm':round(h['distance_km'],2),'locality':h['location']} for h in matching]}
 report['destinations'].append(row)
assert found==added
report['verified']=True;report['hotels']=sum(r['recorded'] for r in report['destinations']);report['newSourcedHotels']=len(found);report['knownPrices']=sum(r['recorded']-r['unknownPrices'] for r in report['destinations'])
(root/'reports/hotel-tier-installed.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps({'verified':True,'destinations':len(cities),'categorySlots':24,'hotels':report['hotels'],'newSourcedHotels':len(found),'knownPrices':report['knownPrices']}))
