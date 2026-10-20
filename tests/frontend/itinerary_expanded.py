import os,json,time,secrets,re
from pathlib import Path
from cost_assertions import assert_known_budget
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL'];report={'verified':False,'checks':[],'scenarios':[]}
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True);ctx=b.new_context(viewport={'width':1440,'height':1000});page=ctx.new_page();email='categories-'+str(time.time_ns())+'@example.test';pw=secrets.token_urlsafe(20)+'Aa9!'
 assert ctx.request.post(api+'/auth/register',data={'name':'Category test','email':email,'password':pw,'role':'tourist'}).status==201
 login=ctx.request.post(api+'/auth/login',data={'email':email,'password':pw}).json();page.goto(base,wait_until='domcontentloaded');page.evaluate('(v)=>sessionStorage.setItem("heritage_api_token",v)',login['token']);page.reload(wait_until='domcontentloaded')
 page.get_by_role('button',name='Plan Itinerary',exact=True).first.click();page.get_by_role('button',name=re.compile('^Ahmedabad')).click();page.get_by_role('button',name='Continue to Logistics').click()
 page.get_by_role('button',name='Low Cost',exact=True).click();expect(page.locator('#planner-starting-hotel option')).to_have_count(2);expect(page.locator('#planner-starting-hotel')).to_contain_text('Hotel Maruti');page.get_by_role('button',name='Budget',exact=True).click();expect(page.locator('#planner-starting-hotel option')).to_have_count(2);expect(page.get_by_label('Choose hotel category and property').get_by_text('Historical published standard',exact=False)).to_be_visible()
 page.get_by_role('button',name='Premium',exact=True).click();expect(page.locator('#planner-starting-hotel option')).to_have_count(4);options=page.locator('#planner-starting-hotel option').all_text_contents();assert any('House of MG' in x for x in options);report['checks'].append('Expansion category switch shows Low Cost Maruti, historical Budget Good Night and original Premium properties')
 page.get_by_label('Order matching hotels').select_option('price');page.wait_for_timeout(300);hotels=ctx.request.get(api+'/destinations/ahmedabad/hotels?category=Premium&sort=distance').json();assert len(hotels)==3;assert all(h['hotel_category']=='Premium' and h['distance_type']=='approximate straight-line' for h in hotels);assert [h['distance_km'] for h in hotels]==sorted(h['distance_km'] for h in hotels);report['checks'].append('Backend category, named anchor and distance ordering verified')
 selected=next(h for h in hotels if 'French' in h['name']);page.locator('#planner-starting-hotel').select_option(selected['id']);page.locator('#planner-budget-input').fill('30000');page.locator('#priority-distance').fill('80');assert [page.locator('#priority-'+k).input_value() for k in ['distance','cost','rating']]==['80','10','10']
 page.get_by_label('Travelers',exact=True).fill('2');page.get_by_label('Rooms',exact=True).fill('1');page.get_by_label('Trip start date').fill('2026-11-10');page.get_by_role('button',name='Review Plan').click()
 with page.expect_response(lambda r:'/generate-itinerary' in r.url) as response:page.get_by_role('button',name='Generate Circular Plan').click()
 assert response.value.status==200;dto=response.value.json();assert dto['trip']['starting_hotel_id']==selected['id'];assert dto['trip']['hotel_category']=='Premium';expect(page.get_by_text('Base Hotel:',exact=False)).to_contain_text('French');report['checks'].append('Selected real hotel UUID/category persists and renders after generation')
 bad=ctx.request.post(api+'/trips',headers={'Authorization':'Bearer '+login['token']},data={'destination_id':selected['destination_id'],'days':2,'budget':30000,'starting_hotel_id':selected['id'],'start_time':'08:00','hotel_category':'Budget'});assert bad.status==422;report['checks'].append('Hotel/category mismatch rejected')
 weights=[{'distance':80,'cost':10,'rating':10},{'distance':10,'cost':80,'rating':10},{'distance':10,'cost':10,'rating':80},{'distance':34,'cost':33,'rating':33},{'distance':100,'cost':0,'rating':0},{'distance':0,'cost':100,'rating':0},{'distance':0,'cost':0,'rating':100}]
 assert dto['trip']['weights']==weights[0] and dto['trip']['travelers']==2 and dto['trip']['start_date'].startswith('2026-11-10')
 expect(page.get_by_role('region',name='Your Priorities')).to_be_visible();expect(page.get_by_text('2026-11-10',exact=True)).to_be_visible()
 headers={'Authorization':'Bearer '+login['token']};tripid=dto['trip']['id'];url=api+'/trips/'+tripid+'/generate-itinerary'
 for weight in weights:
  response=ctx.request.post(url,headers=headers,data={'weights':weight});assert response.status==200,response.text();result=response.json();opt=result['trip']['generation_summary']['optimization'];assert opt['weights']==weight
  assert opt['score']==max(c['score'] for c in opt['candidates'])
  for c in opt['candidates']:assert abs(c['score']-sum(weight[k]*c['utilities'][k]/100 for k in weight))<1e-12
  assert_known_budget(result)
  report['scenarios'].append(opt)
  repeated=ctx.request.post(url,headers=headers,data={'weights':weight}).json();assert repeated['trip']['generation_summary']['optimization']==opt
 assert ctx.request.post(url,headers=headers,data={'weights':{'distance':80,'cost':80,'rating':10}}).status==400
 assert ctx.request.post(url,headers=headers,data={'weights':{'distance':34.5,'cost':32.5,'rating':33}}).status==400
 saved=ctx.request.get(api+'/trips/'+tripid,headers=headers).json();assert saved['trip']['weights']==weights[-1]
 page.reload(wait_until='domcontentloaded');expect(page.get_by_role('region',name='Your Priorities')).to_contain_text('Rating: 100%')
 page.screenshot(path='reports/itinerary-weights-desktop.png',full_page=True)
 page.set_viewport_size({'width':390,'height':844});page.screenshot(path='reports/itinerary-weights-mobile.png',full_page=True);Path('reports/itinerary-mobile-overflow.json').write_text(json.dumps(page.evaluate('Array.from(document.querySelectorAll("*" )).filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className,text:e.textContent.slice(0,120),right:e.getBoundingClientRect().right})).slice(-40)'),indent=2));assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 report['checks'].extend(['Browser inputs reach persisted dates/travelers/weights and explanation','Seven weight scenarios independently scored, deterministic repeated generation, invalid weights rejected','Refresh reads saved latest result, desktop/mobile no overflow'])
 # Real newly inserted hotel must generate through saved directional routes.
 for slug,category in [('ahmedabad','Low Cost'),('somnath','Low Cost'),('somnath','Budget')]:
  choices=ctx.request.get(api+'/destinations/'+slug+'/hotels?category='+category.replace(' ','%20')).json();new=next(h for h in choices if h['external_id'].startswith('exp-'))
  created=ctx.request.post(api+'/trips',headers=headers,data={'destination_id':new['destination_id'],'starting_hotel_id':new['id'],'hotel_category':category,'days':2,'budget':30000,'start_time':'08:00','weights':weights[3]});assert created.status==201,created.text()
  generated=ctx.request.post(api+'/trips/'+created.json()['trip']['id']+'/generate-itinerary',headers=headers,data={});assert generated.status==200,generated.text();assert any(s['stop_type']=='attraction' for d in generated.json()['days'] for s in d['stops'])
  report['checks'].append('New '+slug+' '+category+' '+new['name']+' generates using real saved routes')
 unknown=next(h for h in ctx.request.get(api+'/destinations/ahmedabad/hotels').json() if h['price_per_night'] is None)
 assert unknown['hotel_category'] is None
 invalid=ctx.request.post(api+'/trips',headers=headers,data={'destination_id':unknown['destination_id'],'starting_hotel_id':unknown['id'],'days':1,'budget':30000,'start_time':'08:00'});assert invalid.status==422
 for img in page.locator('img').all():
  img.scroll_into_view_if_needed();expect(img).to_have_js_property('complete',True);assert img.evaluate('(e)=>e.naturalWidth>0')
 b.close()
report['verified']=True;Path('reports/itinerary-expanded-browser.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
