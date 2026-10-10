"""Archive OSRM estimates for reviewed nodes; importer validates snaps and preserves old edges."""
from decimal import Decimal, ROUND_HALF_UP
import json,pathlib,urllib.request,datetime,time,sys
root=pathlib.Path(__file__).resolve().parents[1]
catalog=json.loads((root/'reports/phase2-baseline-coverage.json').read_text(encoding='utf-8'))['catalog']
added=json.loads((root/'data/phase2/catalog-20261010.json').read_text(encoding='utf-8'))['records']
for city in sorted({r['city'] for r in added}):
    target=root/f'data/phase2/routes-{city}-20261010.json'
    if target.exists() and '--refresh' not in sys.argv:continue
    destination=next(d for d in catalog['destinations'] if d['slug']==city)
    nodes=[]
    for table,kind in [('hotels','hotel'),('attractions','attraction'),('restaurants','restaurant')]:
        for r in catalog[table]:
            if r['destination_id']==destination['id']:
                nodes.append(dict(kind=kind,external_id=r['external_id'],lat=float(r['lat']),lng=float(r['lng'])))
        for r in added:
            if r['city']==city and r['table']==table:
                nodes.append(dict(kind=kind,external_id=r['key'],lat=float(Decimal(str(r['values']['lat'])).quantize(Decimal('.000001'),rounding=ROUND_HALF_UP)),lng=float(Decimal(str(r['values']['lng'])).quantize(Decimal('.000001'),rounding=ROUND_HALF_UP))))
    coordinates=';'.join(str(n['lng'])+','+str(n['lat']) for n in nodes)
    url='https://router.project-osrm.org/table/v1/driving/'+coordinates+'?annotations=distance,duration'
    try:
        request=urllib.request.Request(url,headers={'User-Agent':'HeritageUniversityCatalog/1.0'})
        with urllib.request.urlopen(request,timeout=45) as response:data=json.load(response)
        if data.get('code')!='Ok':raise ValueError(data.get('code'))
        target.write_text(json.dumps(dict(city=city,checked=datetime.date.today().isoformat(),source_url=url,nodes=nodes,response=data),indent=2),encoding='utf-8')
        print(city,len(nodes),'nodes archived',flush=True)
    except Exception as error:print(city,type(error).__name__,str(error),flush=True)
    time.sleep(2)
