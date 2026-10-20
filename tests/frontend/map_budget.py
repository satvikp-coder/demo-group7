"""Real API/database itinerary + map tests. OSM tiles intercepted to respect no-bot tile policy."""
import os,json,time,secrets,re,base64
from urllib.parse import quote
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL']
report={'verified':False,'cities':[],'browser':[],'errors':[],'routing':'Configured offline; deterministic provider tests separate'}
pixel=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aV1sAAAAASUVORK5CYII=')
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 ctx=browser.new_context();cities=ctx.request.get(api+'/destinations').json()
 # Public endpoint is an array in the existing contract.
 for city in cities:
  email='map-'+str(time.time_ns())+'@example.test';pw=secrets.token_urlsafe(20)+'Aa9!'
  assert ctx.request.post(api+'/auth/register',data={'name':'Map isolated tester','email':email,'password':pw,'role':'tourist'}).status==201
  login=ctx.request.post(api+'/auth/login',data={'email':email,'password':pw}).json();token=login['token'];headers={'Authorization':'Bearer '+token}
  hotels=ctx.request.get(api+'/destinations/'+city['id']+'/hotels').json();hotel=next(h for h in hotels if h.get('price_per_night') is not None and (h.get('provenance_review') or {}).get('booking_conditions') is None)
  trips=[]
  for days in [1,3]:
   created=ctx.request.post(api+'/trips',headers=headers,data={'destination_id':city['id'],'days':days,'budget':200000,'starting_hotel_id':hotel['id'],'start_time':'08:00','travelers':2,'rooms':2,'lodging_nights':days-1,'weights':{'distance':34,'cost':33,'rating':33},'start_date':'2026-11-10'})
   assert created.status==201,created.text();trip=created.json()['trip'];id=trip['id']
   generated=ctx.request.post(api+'/trips/'+id+'/generate-itinerary',headers=headers,data={});assert generated.status==200,generated.text();dto=generated.json();trips.append(dto)
   before=ctx.request.get(api+'/trips/'+id,headers=headers).json()
   for day in dto['days']:
    response=ctx.request.get(api+'/trips/'+id+'/map/'+str(day['day_number']),headers=headers);assert response.status==200,response.text();route=response.json();assert len(route['legs'])==max(0,len(day['stops'])-1)
    for i,leg in enumerate(route['legs']):
     assert leg['from_stop_id']==day['stops'][i]['id'] and leg['to_stop_id']==day['stops'][i+1]['id'];assert leg['status'] in ['estimated','unavailable','same_location'];assert leg['duration_minutes'] is None
   assert before==ctx.request.get(api+'/trips/'+id,headers=headers).json(),'Map mutated saved itinerary'
   budget=ctx.request.get(api+'/trips/'+id+'/budget',headers=headers).json();assert budget==dto['budget'];d=budget['cost_details'];assert d['final_total'] is None and not d['complete'];assert abs(d['known_subtotal']-sum(float(s['cost']) for day in dto['days'] for s in day['stops']))<.01
   assert d['categories']['hotel']['known_subtotal']==round(float(hotel['price_per_night'])*(days-1)*2,2)
   assert d['categories']['transit']['state']=='UNKNOWN';assert 'Food' in d['unknown_components'] or 'Additional food outside scheduled meals' in d['unknown_components']
   assert ctx.request.get(api+'/trips/'+id+'/map/1').status==401
  report['cities'].append({'name':city['name'],'days':[1,3],'verified':True})
  # All eight cities render actual saved stops; three responsive widths on first city.
  for width in ([1440,768,390] if len(report['cities'])==1 else [1440]):
   bc=browser.new_context(viewport={'width':width,'height':950});bc.add_init_script("localStorage.setItem('heritage_pwa_prompt_dismissed_v1','1')");page=bc.new_page();page.on('pageerror',lambda e:report['errors'].append(str(e)))
   page.route('https://tile.openstreetmap.org/**',lambda route:route.fulfill(status=200,content_type='image/png',body=pixel))
   page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(pw);page.locator('button[type=submit]').click();page.wait_for_url(lambda u:'/login' not in u)
   # Existing owned saved-trip deep-link contract.
   dto=trips[-1];id=dto['trip']['id'];encoded=quote(base64.b64encode(json.dumps({'tripId':id,'cityId':city['id'],'tripDays':3,'budget':200000,'startingHotelId':hotel['id']}).encode()).decode(),safe='')
   page.goto(base+'/itinerary?share='+encoded)
   expect(page.get_by_role('button',name='Open interactive route map')).to_be_visible(timeout=15000)
   assert page.locator('.leaflet-container').count()==0
   page.get_by_role('button',name='Open interactive route map').click();expect(page.locator('.leaflet-container')).to_be_visible()
   expect(page.locator('[data-testid=route-coverage]')).to_contain_text('Solid blue')
   assert page.locator('.leaflet-marker-icon').count()==len(dto['days'][0]['stops'])
   expect(page.locator('.leaflet-control-attribution')).to_contain_text('OpenStreetMap')
   page.get_by_role('button',name='Fit route',exact=True).click();page.locator('.leaflet-control-zoom-in').click();page.locator('.leaflet-control-zoom-out').click()
   page.wait_for_timeout(400);page.get_by_role('button',name='Fit route',exact=True).click();page.locator('.leaflet-container').evaluate('(e)=>e.scrollIntoView({block:"center"})');page.wait_for_timeout(400)
   page.screenshot(path='reports/map-before-marker.png')
   marker=page.locator('.leaflet-marker-icon').nth(1);marker.click();expect(page.locator('.leaflet-popup')).to_be_visible();expect(page.locator('.itinerary-stop-card[data-map-selected=true]')).to_have_count(1)
   # Select an attraction from the actual schedule using keyboard.
   stop=page.locator('.itinerary-day-card').first.locator('.itinerary-stop-card').nth(1);stop.focus();stop.press('Enter');expect(stop).to_have_attribute('data-map-selected','true')
   page.get_by_role('button',name='Day 2',exact=True).click();expect(page.get_by_role('heading',name='Day 2 route map')).to_be_visible();assert page.locator('.itinerary-stop-card[data-map-selected=true]').count()==0
   page.get_by_role('button',name='Day 3',exact=True).click();page.get_by_role('button',name='Day 1',exact=True).click();expect(page.get_by_role('heading',name='Day 1 route map')).to_be_visible()
   expect(page.locator('.budget-summary-card')).to_contain_text('Known subtotal:');expect(page.locator('.budget-summary-card')).to_contain_text('Price unavailable');expect(page.locator('.budget-summary-card')).to_contain_text('Final trip cost: Not fully available')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),city['name']
   page.locator('.heritage-route-map').scroll_into_view_if_needed();page.screenshot(path=f'reports/map-budget-{len(report["cities"])}-{width}.png')
   if len(report['cities'])==1 and width==1440:
    page.evaluate("""() => {window.pdfMapCaptureChecked=false;window.pdfObserver=new MutationObserver(()=>{const root=document.querySelector('#printable-itinerary');const panel=root?.querySelector('[data-itinerary-map-panel]');const days=[...root.querySelectorAll('.itinerary-day-card')];if(panel?.style.display==='none'&&days.length===3&&days.every(d=>d.style.display==='block'))window.pdfMapCaptureChecked=true;});window.pdfObserver.observe(document.querySelector('#printable-itinerary'),{subtree:true,attributes:true,attributeFilter:['style']});}""")
    with page.expect_download(timeout=60000) as download:page.get_by_role('button',name='Download PDF Itinerary',exact=True).click()
    pdf=Path(download.value.path()).read_bytes();assert pdf.startswith(b'%PDF-') and len(pdf)>1000
    assert page.evaluate('window.pdfMapCaptureChecked');page.evaluate('window.pdfObserver.disconnect()')
    expect(page.locator('[data-itinerary-map-panel]')).to_be_visible()
    assert page.locator('.itinerary-day-card:visible').count()==1
    report['pdf']={'bytes':len(pdf),'all_saved_days_captured':True,'map_omitted':True,'map_day_selection_restored':True}
   page.get_by_role('button',name='Close route map').click();assert page.locator('.leaflet-container').count()==0
   if len(report['cities'])==1 and width==1440:
    # Deterministic HTTP response fixtures only; no public tiles/provider requests.
    map_pattern=re.compile(r'/api/trips/'+id+r'/map/1$')
    def failed(route):route.fulfill(status=503,json={'error':'Routing test outage'})
    page.route(map_pattern,failed);page.get_by_role('button',name='Open interactive route map').click()
    expect(page.get_by_text(re.compile('Road routing unavailable. Showing estimated connections'))).to_be_visible()
    expect(page.locator('[data-testid=route-coverage]')).to_contain_text('(0 legs)')
    page.get_by_role('button',name='Close route map').click();page.unroute(map_pattern,failed)
    routed=ctx.request.get(api+'/trips/'+id+'/map/1',headers=headers).json()
    routed['legs'][0].update({'status':'road','basis':'Deterministic routing test fixture','duration_minutes':5})
    routed['road_legs']=1;routed['estimated_legs']-=1
    def mixed(route):route.fulfill(status=200,json=routed)
    page.route(map_pattern,mixed);page.get_by_role('button',name='Open interactive route map').click()
    expect(page.locator('[data-testid=route-coverage]')).to_contain_text('geometry (1 legs)')
    expect(page.locator('path.leaflet-interactive[stroke="#2563eb"]')).to_have_count(1)
    assert page.locator('path.leaflet-interactive[stroke-dasharray]').count()>0
    page.get_by_role('button',name='Close route map').click();page.unroute(map_pattern,mixed)
    # A mismatched regenerated stop response must not be displayed for this snapshot.
    routed['legs'][0]['from_stop_id']='wrong-stop'
    page.route(map_pattern,mixed);page.get_by_role('button',name='Open interactive route map').click()
    expect(page.get_by_text(re.compile('Saved stops changed'))).to_be_visible()
    page.get_by_role('button',name='Close route map').click();page.unroute(map_pattern,mixed)
    trip_pattern=re.compile(r'/api/trips/'+id+r'$');invalid=json.loads(json.dumps(dto))
    invalid['days'][0]['stops'][1]['lat']=None;invalid['days'][1]['stops']=[];invalid['days'][2]['stops']=invalid['days'][2]['stops'][:1]
    def invalid_trip(route):route.fulfill(status=200,json=invalid)
    page.route(trip_pattern,invalid_trip);page.reload();page.get_by_role('button',name='Open interactive route map').click()
    expect(page.get_by_text('Map location unavailable: '+invalid['days'][0]['stops'][1]['name'],exact=True)).to_be_visible()
    assert page.locator('.leaflet-marker-icon').count()==len(invalid['days'][0]['stops'])-1
    page.get_by_role('button',name='Day 2',exact=True).click();expect(page.get_by_text('No valid map locations for this day.',exact=True)).to_be_visible()
    page.get_by_role('button',name='Day 3',exact=True).click();expect(page.locator('.leaflet-marker-icon')).to_have_count(1)
    page.unroute(trip_pattern,invalid_trip)
    report['fixture_checks']=['routing failure fallback','mixed road/estimated styling','stale stop identity rejected','missing coordinates','empty day','single stop']
   page.reload();expect(page.get_by_role('button',name='Open interactive route map')).to_be_visible()
   page.get_by_role('button',name='View budget breakdown',exact=True).click()
   expect(page.get_by_text('Transit & Transport',exact=True).locator('xpath=../../..')).to_contain_text('Price unavailable')
   expect(page.get_by_text('Heritage Stays & Accommodation',exact=True).locator('xpath=../../..')).to_contain_text('2 night(s) x 2 room(s)')
   expect(page.get_by_text('Known subtotal (persisted stops)',exact=True)).to_be_visible()
   expect(page.get_by_role('status').filter(has_text='Final trip cost: Not fully available')).to_be_visible()
   bc.close();report['browser'].append({'city':city['name'],'width':width,'passed':True})
 # Cross-user map ownership and malformed day are checked with last user's trip.
 outsider=browser.new_context();email='other-'+str(time.time_ns())+'@example.test'
 assert outsider.request.post(api+'/auth/register',data={'name':'Other','email':email,'password':pw,'role':'tourist'}).status==201
 other=outsider.request.post(api+'/auth/login',data={'email':email,'password':pw}).json()['token']
 assert outsider.request.get(api+'/trips/'+id+'/map/1',headers={'Authorization':'Bearer '+other}).status==404
 assert ctx.request.get(api+'/trips/'+id+'/map/31',headers=headers).status==400
 assert ctx.request.get(api+'/trips/'+id+'/map/4',headers=headers).status==404
 assert not report['errors'],report['errors'];browser.close()
report['verified']=True;Path('reports/map-budget-browser.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
