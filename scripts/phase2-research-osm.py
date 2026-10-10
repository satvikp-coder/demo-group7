"""Cache public OSM facts for review; this does not import or invent visitor facts."""
import pathlib,json,urllib.request,urllib.parse,datetime,time
root=pathlib.Path(__file__).resolve().parents[1]; directory=root/'data/phase2'; directory.mkdir(exist_ok=True)
catalog=json.loads((root/'reports/phase2-baseline-coverage.json').read_text(encoding='utf-8'))['catalog']
policy=json.loads((root/'dsa/planning/hotel-policy.json').read_text())
for city,slug in policy['anchors'].items():
    file=directory/(city+'-osm.json')
    if file.exists():continue
    anchor=next(a for a in catalog['attractions'] if a['slug']==slug)
    lat,lng=anchor['lat'],anchor['lng']; radius=35000 if city in ['modhera','rann-of-kutch','champaner'] else 18000
    query=f'[out:json][timeout:60];(nwr(around:{radius},{lat},{lng})[tourism~"^(hotel|guest_house|hostel|motel)$"];nwr(around:15000,{lat},{lng})[historic][name];nwr(around:15000,{lat},{lng})[tourism~"^(attraction|museum|viewpoint)$"][name];);out center tags;'
    req=urllib.request.Request('https://overpass-api.de/api/interpreter',data=urllib.parse.urlencode({'data':query}).encode(),headers={'User-Agent':'HeritageUniversityResearch/1.0'})
    try:
        with urllib.request.urlopen(req,timeout=75) as response: data=json.load(response)
        if 'elements' not in data or data.get('remark'):raise ValueError(data.get('remark','No elements'))
        file.write_text(json.dumps({'checked':datetime.datetime.now(datetime.timezone.utc).isoformat(),'query':query,'source':'https://overpass-api.de/api/interpreter','license':'ODbL-1.0 https://www.openstreetmap.org/copyright',**data},ensure_ascii=False,indent=2),encoding='utf-8')
        print(city,len(data['elements']),flush=True)
    except Exception as e: print(city,type(e).__name__,str(e),flush=True)
    time.sleep(3)
