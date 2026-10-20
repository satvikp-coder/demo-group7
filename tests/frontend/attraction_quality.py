"""Actual HTTP/PostgreSQL quality matrix on a disposable database, never production users."""
import os,json,time,secrets,base64,re,runpy
from pathlib import Path
from urllib.parse import quote
from playwright.sync_api import sync_playwright,expect
api=os.environ['API_TEST_URL'];base=os.environ['FRONTEND_TEST_URL'];report={'verified':False,'cities':[],'cases':[],'browser':[],'errors':[]}
weights=[{'distance':80,'cost':10,'rating':10},{'distance':10,'cost':80,'rating':10},{'distance':10,'cost':10,'rating':80},{'distance':34,'cost':33,'rating':33},{'distance':100,'cost':0,'rating':0},{'distance':0,'cost':100,'rating':0},{'distance':0,'cost':0,'rating':100}]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True);ctx=browser.new_context();cities=ctx.request.get(api+'/destinations').json();rann=None
 for city in cities:
  email='quality-'+str(time.time_ns())+'@example.test';pw=secrets.token_urlsafe(20)+'Aa9!';assert ctx.request.post(api+'/auth/register',data={'name':'Isolated attraction quality','email':email,'password':pw,'role':'tourist'}).status==201
  token=ctx.request.post(api+'/auth/login',data={'email':email,'password':pw}).json()['token'];headers={'Authorization':'Bearer '+token}
  attractions=ctx.request.get(api+'/destinations/'+city['id']+'/attractions').json();hotels=ctx.request.get(api+'/destinations/'+city['id']+'/hotels').json();hotels=[h for h in hotels if h.get('price_per_night') is not None and (h.get('provenance_review') or {}).get('booking_conditions',{}).get('minimum_guests',1)<=2]
  chosen=hotels[:2];prince=next((h for h in hotels if 'Prince Residency' in h['name']),None)
  if prince:chosen=[prince,next(h for h in hotels if h['id']!=prince['id'])]
  report['cities'].append({'name':city['name'],'attractions':len(attractions),'hotels_tested':[h['name'] for h in chosen]})
  for hotel in chosen:
   for days in [1,2,3,4]:
    for w in weights:
     inp={'destination_id':city['id'],'days':days,'budget':100000,'starting_hotel_id':hotel['id'],'start_time':'08:00','travelers':2,'rooms':1,'lodging_nights':days-1,'weights':w,'start_date':'2026-11-10'}
     created=ctx.request.post(api+'/trips',headers=headers,data=inp);assert created.status==201,created.text();id=created.json()['trip']['id'];r=ctx.request.post(api+'/trips/'+id+'/generate-itinerary',headers=headers,data={});assert r.status==200,(city['name'],hotel['name'],r.text());dto=r.json();s=dto['trip']['generation_summary'];all_stops=[stop for day in dto['days'] for stop in day['stops']];visits=[v for v in all_stops if v['stop_type']=='attraction'];assert visits,(city['name'],days);assert len({v['reference_id'] for v in visits})==len(visits)
     for day in dto['days']:
      stops=day['stops'];count=sum(v['stop_type']=='attraction' for v in stops);coverage=next(d for d in s['day_coverage'] if d['day_number']==day['day_number']);assert coverage['attraction_count']==count
      assert count>0,(city['name'],hotel['name'],days,'Empty day despite sufficient feasible catalog')
      if not count:assert coverage['status']=='no_sightseeing_available'
      for first,second in zip(stops,stops[1:]):assert first['departure_time']<=second['arrival_time'],(city['name'],'overlap')
      assert stops[-1]['departure_time']<='21:00:00'
      for stop in stops:
       if stop['reference_id'] is None:assert stop['stop_type']=='meal' and stop['cost'] is None and stop['lat'] is None and stop['lng'] is None
       if stop['cost'] is None:assert s['cost_states'][str(stop['day_number'])+':'+str(stop['stop_order'])]=='UNKNOWN'
       if stop['category']=='lunch':assert stop['arrival_time']>='12:00:00' and stop['departure_time']<='14:00:00'
     budget=dto['budget'];subtotal=sum(float(v['cost']) for v in all_stops if v['cost'] is not None);assert abs(subtotal-budget['cost_details']['known_subtotal'])<.01;assert subtotal<=inp['budget'];assert budget['cost_details']['final_total'] is None
     assert abs(budget['hotel']-float(hotel['price_per_night'])*(days-1))<.01
     opt=s['optimization'];assert opt['weights']==w;assert abs(opt['score']-max(c['score'] for c in opt['candidates']))<1e-9
     if any(v['cost'] is None for v in visits):assert all(c['utilities']['cost']==0 for c in opt['candidates'])
     assert ctx.request.get(api+'/trips/'+id,headers=headers).json()==dto
     report['cases'].append({'city':city['name'],'hotel':hotel['name'],'days':days,'weights':w,'attractions':len(visits),'sightseeing_days':sum(d['attraction_count']>0 for d in s['day_coverage']),'candidates':opt['evaluated_count'],'distance_km':sum(l['distance_km'] for l in s['legs']),'meal_breaks':sum(v['stop_type']=='meal' for v in all_stops),'unknown_costs':sum(v['cost'] is None for v in all_stops),'known_subtotal':subtotal,'passed':True})
     if prince and hotel['id']==prince['id'] and days==4 and w==weights[3]:
      assert all(d['attraction_count']>0 for d in s['day_coverage']),s['day_coverage'];rann=(dto,email,pw,headers,city,hotel)
  # Honest accommodation infeasibility, no substitution or invented prices.
  h=chosen[0];low=ctx.request.post(api+'/trips',headers=headers,data={'destination_id':city['id'],'days':4,'budget':max(1,int(float(h['price_per_night'])*3)-1),'starting_hotel_id':h['id'],'lodging_nights':3,'start_time':'08:00','travelers':2,'rooms':1});assert low.status==201,low.text();bad=ctx.request.post(api+'/trips/'+low.json()['trip']['id']+'/generate-itinerary',headers=headers,data={'weights':weights[-1]});assert bad.status==422
 report['api_verified']=True;Path('reports/attraction-quality-matrix.json').write_text(json.dumps(report,indent=2))
 assert rann is not None,'Actual Prince Residency record required for regression'
 dto,email,pw,headers,city,hotel=rann
 # Repeated identical inputs compare substantive stops, not regenerated UUIDs.
 repeat=ctx.request.post(api+'/trips/'+dto['trip']['id']+'/generate-itinerary',headers=headers,data={});assert repeat.status==200
 def signature(d):return [[(s['reference_id'],s['arrival_time'],s['departure_time'],s['cost']) for s in day['stops']] for day in d['days']]
 assert signature(dto)==signature(repeat.json());dto=repeat.json()
 pixel=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=')
 for width in [1440,768,390]:
  bc=browser.new_context(viewport={'width':width,'height':950});bc.add_init_script("localStorage.setItem('heritage_pwa_prompt_dismissed_v1','1')");page=bc.new_page();page.on('pageerror',lambda e:report['errors'].append(str(e)));page.route('https://tile.openstreetmap.org/**',lambda r:r.fulfill(status=200,content_type='image/png',body=pixel))
  page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(pw);page.locator('button[type=submit]').click();page.wait_for_url(lambda u:'/login' not in u)
  encoded=quote(base64.b64encode(json.dumps({'tripId':dto['trip']['id'],'cityId':city['id'],'tripDays':4,'budget':100000,'startingHotelId':hotel['id']}).encode()).decode(),safe='');page.goto(base+'/itinerary?share='+encoded)
  expect(page.locator('.itinerary-day-card')).to_have_count(4);expect(page.get_by_text('Hotel Prince Residency, Bhuj',exact=True).first).to_be_visible();page.get_by_role('button',name='Open interactive route map').click()
  for day in range(1,5):
   page.get_by_role('button',name='Day '+str(day),exact=True).click();expect(page.get_by_role('heading',name='Day '+str(day)+' route map')).to_be_visible();expect(page.locator('.itinerary-day-card:visible [data-testid=itinerary-day-coverage]')).to_contain_text('sightseeing')
   expected=sum(s['lat'] is not None and s['lng'] is not None for s in dto['days'][day-1]['stops']);expect(page.locator('.leaflet-marker-icon')).to_have_count(expected)
  page.screenshot(path='reports/attraction-rann-'+str(width)+'.png');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.evaluate("""() => {window.attractionPdfCapture=false;const root=document.querySelector('#printable-itinerary');window.attractionPdfObserver=new MutationObserver(()=>{const panel=root.querySelector('[data-itinerary-map-panel]');const days=[...root.querySelectorAll('.itinerary-day-card')];if(panel?.style.display==='none'&&days.length===4&&days.every(d=>d.style.display==='block'))window.attractionPdfCapture=true;});window.attractionPdfObserver.observe(root,{subtree:true,attributes:true,attributeFilter:['style']});}""")
  with page.expect_download(timeout=60000) as download:page.get_by_role('button',name='Download PDF Itinerary',exact=True).click()
  pdf=Path(download.value.path()).read_bytes();assert pdf.startswith(b'%PDF-') and len(pdf)>1000;assert page.evaluate('window.attractionPdfCapture');page.evaluate('window.attractionPdfObserver.disconnect()')
  page.reload();expect(page.locator('.itinerary-day-card')).to_have_count(4);report['browser'].append({'width':width,'four_days':True,'actual_selected_hotel':hotel['name'],'pdf_bytes':len(pdf),'all_requested_days_captured':True,'map_omitted':True,'passed':True});bc.close()
 browser.close()
assert not report['errors'],report['errors'];report['verified']=True;Path('reports/attraction-quality-matrix.json').write_text(json.dumps(report,indent=2));print(json.dumps({'verified':True,'api_cases':len(report['cases']),'browser':report['browser']}))
# Reuse the existing real all-eight-city map/budget suite; no substitute production data.
runpy.run_path('tests/frontend/map_budget.py',run_name='__main__')
