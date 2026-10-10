"""Reproducible reviewed selection from cached OSM facts, not automatic bulk ingestion."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]; folder=root/'data/phase2'
selections={
 'champaner':[(6976899085,'Hotel Sarvottam, Baska', 'hotels','https://hotelsarvottam.com/rooms-3/'),(186046398,'Sahar ki Masjid','attractions',None),(272040337,'Octagonal Stepwell','attractions',None),(718499923,'Helical Stepwell','attractions','https://gujarattourism.com/central-zone/panchmahal/helical-stepwell.html'),(718548502,'Ek Minar ki Masjid','attractions',None),(718548504,'Maqbara Mandvi','attractions',None),(718548509,'South Bhadra Gate','attractions',None),(718548512,'East Bhadra Gate','attractions',None)],
 'modhera':[(1335317144,'Hotel Shivalik, Mehsana','hotels','https://shivalikhotel.in/shivalik-hotel-rooms/'),(2525219676,'Hotel Sunshine, Mehsana','hotels','https://indianembassy-moscow.gov.in/pdf/ahmedabad.pdf'),(7661050654,'The Grand Raveta, Patan','hotels',None),(911907267,'Sun Temple Museum, Modhera','attractions',None),(911907271,'Modhera Vav','attractions',None)],
 'gir-national-park':[(643400662,'Lion Safari Camp, Sasan Gir','hotels',None),(643583374,'Gir Birding Lodge','hotels','https://www.girbirdinglodge.com/'),(2757814663,'Sinh Sadan Guest House','hotels','https://girlion.gujarat.gov.in/Documents/Uploads/NewsUpdates/Hotels.pdf'),(13509759401,'Gokul Farmhouse, Sasan Gir','hotels','https://www.girgokulfarm.in/')],
 'saputara':[(2562424815,'Toran Hill Resort','hotels','https://gujarattourism.com/accommodation/toran-hotel/toran-hill-resort.html'),(250492076,'Hotel Purohit, Saputara','hotels',None),(491098304,'Hotel Lake View, Saputara','hotels','https://lakeview.co.in/'),(491098487,'Shilpi Hill Resort','hotels','https://www.shilpihillresort.com/'),(549543763,'Hotel Sejal Inn','hotels',None),(1204951620,'Patang Residency','hotels',None),(2562424817,'Table Point, Saputara','attractions','https://nau.in/assets/uploads/76034-national-conference-12-14-oct-2023-saputara-dangs.pdf'),(4832558992,'Sunrise Point, Saputara','attractions',None)]}
selections['dwarka']=[
 (1341926552,'Ginger Dwarka','hotels','https://www.gingerhotels.com/hotels/ginger-dwarka'),
 (1341926489,'The Fern Sattva Resort Dwarka','hotels','https://www.fernhotels.com/temple-towns/the-fern-sattva-resort-dwarka'),
 (1344373865,'Hawthorn Suites by Wyndham Dwarka','hotels','https://hawthorndwarka.com/'),
 (1486403315,'Lemon Tree Premier, Dwarka','hotels','https://www.lemontreehotels.com/lemon-tree-premier/dwarka/hotel-dwarka/contact-us'),
 (1436240310,'VITS Devbhumi, Dwarka','hotels','https://www.vitshotels.com/devbhumi-dwarka/')]
selections['rann-of-kutch']=[(4002822856,'Shaam-e-Sarhad Village Resort, Hodka','hotels','https://www.hodka.in/home/')]
records=[]
for city,choices in selections.items():
 elements={e['id']:e for e in json.loads((folder/(city+('-hotels-osm.json' if city=='rann-of-kutch' else '-osm.json'))).read_text(encoding='utf-8'))['elements']}
 for identity,name,table,official in choices:
  e=elements[identity]; c=e.get('center',e); osm=f"https://www.openstreetmap.org/{e['type']}/{identity}"; slug=re.sub('[^a-z0-9]+','-',name.lower()).strip('-')
  if not slug.endswith(city):slug+='-'+city
  notes='Mapped identity and coordinates; current visitor access, prices, guest ratings and live availability are not independently certified.'
  review={'checked':'2026-10-10','sources':[osm]+([official] if official else []),'license':'OpenStreetMap contributors, ODbL-1.0; factual property references, no media copied','notes':notes,'osm_identity':f"{e['type']}/{identity}"}
  v={'slug':slug,'name':name,'lat':round(c['lat'],7),'lng':round(c['lon'],7),'rating':None,'source':'Reviewed mapped identity/location; field-specific sources retained','source_url':official or osm,'source_date':'2026-10-10','provenance_status':'project_approved','image_url':None,'provenance_review':review}
  if table=='hotels':
   v.update(stay_type='Registered Hotel',price_per_night=None,location=('Baska, near Halol' if city=='champaner' else 'Mehsana' if 'Mehsana' in name else 'Patan' if 'Patan' in name else 'Sasan Gir' if city=='gir-national-park' else 'Dwarka' if city=='dwarka' else 'Hodka, Kutch' if city=='rann-of-kutch' else 'Saputara')+', Gujarat',description=notes)
   review['notes']+=' Existing schema stay type does not certify tourism registration.'
   review['price_basis']='Price unavailable — check current rates'
   if identity==6976899085:
    v['price_per_night']=2000;review['price_basis']='Official undated Silver double-room tariff INR2000; indicative room estimate, tax/fees and current rates must be confirmed. Not live availability.';review['facilities']=['Air conditioning','Wi-Fi','Restaurant'];review['price_kind']='published_estimate'
  else:
   v.update(category='Museum' if 'Museum' in name else 'Viewpoint' if 'Point' in name else 'Stepwell' if 'well' in name or 'Vav' in name else 'Heritage',entry_fee=None,entry_fee_numeric=None,duration_hours=None,opening_time=None,closing_time=None,description=notes,best_time_note='Admission fee and visit duration unknown; confirm access before planning. This entry is discovery-only until required scheduling facts are available.')
   if identity==718499923:
    v.update(opening_time='08:00',closing_time='18:00');review['hours_basis']='Gujarat Tourism published 08:00–18:00; checked2026-10-10'
  records.append({'table':table,'city':city,'key':'exp-20261010-'+slug,'values':v})
manifest={'version':1,'release':'20261010','checked':'2026-10-10','attribution':'OpenStreetMap contributors, ODbL-1.0 https://www.openstreetmap.org/copyright','records':records,'limitations':['Narrowed geographic queries recovered Dwarka and Hodka identities after earlier endpoint failures. Current tariffs remain unknown.','Unknown prices do not classify into a price band.','Unknown attraction admissions/durations remain discovery-only.','No independently sourced new guest ratings or licensed property media.','Duplicate Maneland OSM nodes disagree; not imported.','Student hostels, restaurants tagged hotels, unnamed and generic duplicate identities excluded.']}
(folder/'catalog-20261010.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'frontend/public/catalog-phase2.json').write_bytes((folder/'catalog-20261010.json').read_bytes())
print('Reviewed records:',len(records))
