"""Build reviewed factual records from cached public-source coordinates, never guessed fields."""
from pathlib import Path
import json,re,math
root=Path('data/attraction-20261020');facts=json.loads((root/'source-facts.json').read_text(encoding='utf-8'));district=json.loads((root/'district-facts.json').read_text(encoding='utf-8'));existing=json.loads((root/'source-catalog-context.json').read_text(encoding='utf-8'))
chosen={
'ahmedabad':['kocharab-ashram','lalbhai-dalpatbhai-museum'],
'champaner':['citadel','pavagadh-hill---kalika-mata-temple','jambughoda-wildlife-sanctuary'],
'rann-of-kutch':['aina-mahal','prag-mahal','kutch-museum','hamirsar-lake--bhuj','sharad-bagh-palace','nirona','living-and-learning-design-centre-crafts-museum','bharatiya-sanskruti-darshan-museum','vijay-vilas-palace','mandvi-beach','shyamji-krishna-varma-memorial','bhadreshwar','chhari-dhand-wetland-reserve'],
'modhera':['bahuchar-mata-temple-becharaji','kirti-toran--vadnagar','vadnagar','taranga-hill','panchasara-parshwanath-jain-derasar','patan-patola-heritage-museum','rani-ki-vav','sidhpur'],
'gir-national-park':['adi-kadi-vav-and-navghan-kuwo','ashok-edicts','buddhist-caves','damodar-kund','girnar-hill','mahabat-khan-maqbara','uparkot-fort','shri-bai-ashram'],
'somnath':['prabhas-patan-museum','geeta-temple','prachi-tirth','mool-dwarka','jamjir-waterfall','jhoolta-minara','gupt-prayag','sana-caves'],
'saputara':['gira-waterfalls','waghai-botanical-gardens','mahal-campsite'],
'dwarka':['shivrajpur-beach','okha-madhi-beach']}
names={'kocharab-ashram':'Kochrab Ashram','lalbhai-dalpatbhai-museum':'Lalbhai Dalpatbhai Museum','aina-mahal':'Aina Mahal','prag-mahal':'Prag Mahal','hamirsar-lake--bhuj':'Hamirsar Lake','nirona':'Nirona craft village','living-and-learning-design-centre-crafts-museum':'Living and Learning Design Centre, Ajrakhpur','bharatiya-sanskruti-darshan-museum':'Bharatiya Sanskruti Darshan Museum','rani-ki-vav':'Rani Ki Vav, Patan','vadnagar':'Vadnagar heritage precinct','sidhpur':'Bohra Vad, Sidhpur','girnar-hill':'Girnar Hill','citadel':'Champaner Citadel walk','pavagadh-hill---kalika-mata-temple':'Pavagadh Hill and Kalika Mata Temple'}
windows={'aina-mahal':[[540,705],[900,1065]],'prag-mahal':[[570,735],[900,1065]],'sharad-bagh-palace':[[540,720],[900,1065]],'lalbhai-dalpatbhai-museum':[[630,1020]],'kocharab-ashram':[[540,1020]],'citadel':[[480,1080]],'ashok-edicts':[[480,1080]],'patan-patola-heritage-museum':[[600,1080]],'vijay-vilas-palace':[[420,1140]],'prabhas-patan-museum':[[630,1050]]}
closures={'kutch-museum':[3],'prag-mahal':[4],'aina-mahal':[4],'sharad-bagh-palace':[5],'bharatiya-sanskruti-darshan-museum':[3,6],'living-and-learning-design-centre-crafts-museum':[1],'shyamji-krishna-varma-memorial':[4],'lalbhai-dalpatbhai-museum':[1],'prabhas-patan-museum':[3]}
policies=json.loads((root/'planning-policies.json').read_text());records=[];rejected=[]
def hav(a,b):
 lat1,lon1,lat2,lon2=map(math.radians,[float(a.get('lat',a.get('latitude'))),float(a.get('lng',a.get('longitude'))),float(b['lat']),float(b['lng'])]);h=math.sin((lat2-lat1)/2)**2+math.cos(lat1)*math.cos(lat2)*math.sin((lon2-lon1)/2)**2;return 6371*2*math.asin(min(1,math.sqrt(h)))
def add(city,slug,name,coord,sources,locality,category=None,osm=None):
 if not coord or not (20<=coord['lat']<=25 and 68<=coord['lng']<=75):rejected.append({'name':name,'reason':'missing/out-of-region source coordinates'});return
 dest=next(d for d in existing['destinations'] if d['slug']==city);normalized=lambda n:re.sub('[^a-z0-9]','',n.lower())
 old=[a for a in existing['attractions'] if a['destination_id']==dest['id'] and (normalized(a['name'])==normalized(name) or a['slug']==slug or (sources[0].startswith('https://www.gujarattourism.com/') and a.get('source_url')==sources[0]))]
 if old:rejected.append({'name':name,'reason':'Existing UUID preserved','id':old[0]['id']});return
 if any(normalized(r['values']['name'])==normalized(name) for r in records):raise ValueError('Duplicate new name')
 category=category or ('museum' if 'museum' in name.lower() else 'palace' if 'palace' in name.lower() or 'mahal' in name.lower() else 'beach' if 'beach' in name.lower() else 'fort' if 'fort' in name.lower() else 'temple' if any(w in name.lower() for w in ['temple','mandir','tirth','kund','derasar']) else 'nature' if any(w in name.lower() for w in ['wildlife','wetland','waterfall','hill']) else 'craft' if any(w in name.lower() for w in ['craft','nirona']) else 'heritage')
 duration={'museum':90,'palace':90,'beach':60,'fort':120,'temple':60,'nature':120,'craft':90,'heritage':60,'garden':45,'viewpoint':45}[category]
 if slug=='girnar-hill':duration=360
 if slug=='pavagadh-hill---kalika-mata-temple':duration=180
 planning={'duration_minutes':duration,'duration_basis':'Explicit project planning estimate by attraction type; not an official published visit duration','closed_weekdays':closures.get(slug,[]),'access_status':'verify_before_travel'}
 if slug in windows:planning['windows']=windows[slug]
 if slug in ['prabhas-patan-museum','kutch-museum']:planning.update({'closed_month_weeks':[2,4],'closed_month_weekday':6})
 if slug=='bharatiya-sanskruti-darshan-museum':planning['windows']=[[600,780],[870,1050]]
 anchor=(next(h for h in existing['hotels'] if 'Prince Residency' in h['name']) if city=='rann-of-kutch' else next(a for a in existing['attractions'] if a['destination_id']==dest['id']));dist=round(hav(anchor,coord),2);scope='local_area' if dist<=20 else 'nearby_excursion'
 notes=f'{locality}. '+('Nearby regional excursion; road travel must fit a separate day. ' if scope=='nearby_excursion' else '')+'Admission price unavailable; current hours/access must be confirmed. Duration is a planning estimate. No booking or availability claim.'
 if category=='nature':notes+=' Observe local weather, forest/permit and seasonal access restrictions; no swimming or unrestricted wildlife entry is implied.'
 if slug=='girnar-hill':notes+=' Six-hour planning allowance for a strenuous hill visit; ropeway/permits and fitness require confirmation.'
 values={'slug':slug,'name':name,'lat':round(coord['lat'],6),'lng':round(coord['lng'],6),'rating':None,'duration_hours':None,'category':category,'description':f'{name} is a visitor site in {locality}, listed by the referenced tourism or geographic source. '+('It is a regional excursion, not a city-centre attraction.' if scope=='nearby_excursion' else ''),'entry_fee':'Price unavailable','entry_fee_numeric':None,'opening_time':None,'closing_time':None,'image_url':None,'source':'Source-backed identity and approximate mapped location; operational uncertainty retained','source_url':('https://en.wikivoyage.org/wiki/Saputara' if slug in ['echo-point','nageshwar-mahadev','rose-garden'] else sources[0]),'source_date':'2026-10-20','provenance_status':'project_approved','best_time_note':notes,'provenance_review':{'checked':'2026-10-20','sources':sources,'license':'Factual source references only; no photographs copied. OpenStreetMap contributors ODbL-1.0 / Wikivoyage contributors CC BY-SA 4.0 where listed.','planning':planning,'geography':{'scope':scope,'locality':locality,'anchor_name':anchor['name'],'destination_anchor_straight_line_km':dist,'coordinate_basis':'Approximate tourism-authority map reference or explicitly cited community map point; not a surveyed entrance','coordinate_source':sources[-1]},'fee_basis':'Unknown, never free','rating_basis':'Unknown, no invented score','image_basis':'Intentional fallback until licensed exact media is available'}}
 records.append({'table':'attractions','city':city,'key':'exp-20261020-'+slug,'values':values})
for city,slugs in chosen.items():
 for slug in slugs:
  matches=[r for r in facts+district if re.search('/'+re.escape(slug)+r'(?:\.html|/)$',r['url'])]
  if not matches:rejected.append({'name':slug,'reason':'source not obtained'});continue
  r=matches[0];name=names.get(slug,re.sub(r' (Ahmedabad|Kutch|Mehsana|Patan|Junagadh|Gir Somnath|Dang|Panchmahal|Devbhoomi Dwarka)$','',r.get('title') or slug))
  locality='Bhuj/Kutch region' if city=='rann-of-kutch' else 'Junagadh/Sasan Gir region' if city=='gir-national-park' else 'Modhera-Patan-Mehsana region' if city=='modhera' else 'Champaner-Pavagadh region' if city=='champaner' else 'Saputara/Dang region' if city=='saputara' else city.title()+' region'
  add(city,slug,name,r.get('map_coordinates'),[r['url']],locality)
# Community map facts cross-referenced with Navsari Agricultural University tourist-site list.
for point in json.loads((root/'wikivoyage-saputara-points.json').read_text(encoding='utf-8')):
 name=point['name']
 add('saputara',re.sub('[^a-z0-9]+','-',name.lower()).strip('-'),name+' (Saputara)' if name!='Hatgadh Fort' else name,{'lat':point['lat'],'lng':point['lng']},['https://nau.in/assets/uploads/76034-national-conference-12-14-oct-2023-saputara-dangs.pdf','https://en.wikivoyage.org/wiki/Saputara'],'Hatgadh, Maharashtra border excursion' if name=='Hatgadh Fort' else 'Saputara hill town',category='fort' if name=='Hatgadh Fort' else 'temple' if name=='Nageshwar Mahadev' else 'viewpoint' if name=='Echo Point' else 'garden')
# Four deliberate one-time, cached geocoder searches. No runtime geocoding service.
for r in json.loads((root/'dwarka-geocodes.json').read_text(encoding='utf-8')):
 if not r['results']:continue
 p=r['results'][0];name='Gopi Talav temple precinct' if r['query'].startswith('Gopi') else 'Gomti Ghat';slug='gopi-talav-dwarka' if r['query'].startswith('Gopi') else 'gomti-ghat-dwarka'
 add('dwarka',slug,name,{'lat':float(p['lat']),'lng':float(p['lon'])},['https://devbhumidwarka.nic.in/places-of-interest/',f'https://www.openstreetmap.org/{p["osm_type"]}/{p["osm_id"]}'],'Dwarka/Okhamandal region',category='temple')
add('dwarka','dwarka-lighthouse-viewpoint','Dwarka Lighthouse viewpoint',{'lat':22.238079677,'lng':68.958452502},['https://chanceht.org/lighthouse/dwarka-point/'],'Dwarka coast',category='viewpoint')
add('dwarka','dwarka-beach','Dwarka Beach',{'lat':22.23464,'lng':68.9664},['https://devbhumidwarka.nic.in/places-of-interest/','https://www.openstreetmap.org/node/12413875829'],'Dwarka coast',category='beach')
# Curated corrections preserve explicit sources; no numeric geography is guessed.
for r in records:
 override=json.loads((root/'curated-overrides.json').read_text(encoding='utf-8')).get(r['values']['slug'])
 if override:r['values'].update(override)
 v=r['values'];g=v['provenance_review']['geography'];anchor=next(a for a in existing['attractions']+existing['hotels'] if a['name']==g['anchor_name'])
 g['destination_anchor_straight_line_km']=round(hav(anchor,v),2);g['scope']='local_area' if g['destination_anchor_straight_line_km']<=20 else 'nearby_excursion'
# Keep the release factual and reviewable; no estimated monetary amounts or ratings.
manifest={'version':1,'release':'20261020','checked':'2026-10-20','attribution':'OpenStreetMap contributors ODbL-1.0 https://www.openstreetmap.org/copyright; Wikivoyage contributors CC BY-SA 4.0 https://en.wikivoyage.org/wiki/Saputara; cited tourism authorities, factual references only. No copied media.','records':records}
(root/'catalog-20261020.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8');(root/'research-exclusions.json').write_text(json.dumps(rejected,indent=2),encoding='utf-8')
# Remove JavaScript boilerplate from short operating evidence excerpts.
for r in facts:
 r['operating_excerpt']=[' '.join(v.split('Location')[0].split('Photo Gallery')[0].split()[:15]) for v in r.get('operating_excerpt',[])]
(root/'source-facts.json').write_text(json.dumps(facts,ensure_ascii=False,indent=2),encoding='utf-8')
print({c:sum(r['city']==c for r in records) for c in chosen});print('records',len(records),'rejected',len(rejected))
