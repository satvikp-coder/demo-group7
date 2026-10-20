import os,json,time,secrets,re
from pathlib import Path
from cost_assertions import assert_known_budget
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL'];report={'verified':False,'checks':[],'runs':[],'pageErrors':[],'consoleErrors':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True);context=browser.new_context(viewport={'width':1440,'height':1000});page=context.new_page()
 page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
 page.on('console',lambda m:report['consoleErrors'].append(m.text) if m.type=='error' else None)
 email='professor-demo-'+str(time.time_ns())+'@example.test';pw=secrets.token_urlsafe(20)+'Aa9!'
 assert context.request.post(api+'/auth/register',data={'name':'Professor demo','email':email,'password':pw,'role':'tourist'}).status==201
 page.goto(base+'/login',wait_until='domcontentloaded');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(pw);page.locator('button[type=submit]').click();page.wait_for_url(lambda u:'/login' not in u)
 for index,(city,category,hotel_name,priority,width) in enumerate([('Ahmedabad','Premium','French','distance',1440),('Ahmedabad','Premium','French','cost',1440),('Ahmedabad','Premium','French','rating',1440),('Somnath','Low Cost','Lilavati','cost',390),('Modhera','Budget','Modhera Sunrise','distance',768)]):
  page.set_viewport_size({'width':width,'height':720 if width==1440 else 844})
  if width<1024:
   page.goto(base+'/profile',wait_until='domcontentloaded');page.get_by_role('button',name='Create New Heritage Route',exact=True).click()
  else:page.get_by_role('button',name='Plan Itinerary',exact=True).first.click()
  page.get_by_role('button',name=re.compile('^'+city)).click();page.get_by_role('button',name='Continue to Logistics').click()
  if index==0:
   page.get_by_role('button',name='Low Cost',exact=True).click();expect(page.locator('#planner-starting-hotel')).to_contain_text('Hotel Maruti')
   with page.expect_response(lambda r:'/hotels' in r.url and 'category=Budget' in r.url) as budget_hotels:page.get_by_role('button',name='Budget',exact=True).click()
   assert budget_hotels.value.status==200
   assert all(h['name']!='Hotel Good Night' for h in budget_hotels.value.json())
   expect(page.locator('#planner-starting-hotel')).not_to_contain_text('Hotel Good Night')
  page.get_by_role('button',name=category,exact=True).click()
  page.wait_for_function('(name)=>Array.from(document.querySelectorAll("#planner-starting-hotel option")).some(e=>e.textContent.includes(name))',arg=hotel_name)
  selected=next(o for o in page.locator('#planner-starting-hotel option').evaluate_all('(els)=>els.map(e=>({id:e.value,name:e.textContent}))') if hotel_name in o['name'])
  page.locator('#planner-starting-hotel').select_option(selected['id'])
  for _ in range(6):
   if page.locator('#planner-trip-days').inner_text().strip()=='1':break
   page.get_by_role('button',name='Decrease trip duration',exact=True).click()
  expect(page.locator('#planner-trip-days')).to_have_text('1')
  page.locator('#planner-budget-input').fill('30000');page.get_by_label('Trip start date',exact=True).fill('2026-11-10');page.get_by_label('Travelers',exact=True).fill('1');page.get_by_label('Rooms',exact=True).fill('1')
  page.get_by_role('button',name='Reset priorities (34 / 33 / 33)').click();page.locator('#priority-'+priority).fill('80')
  weights={k:int(page.locator('#priority-'+k).input_value()) for k in ['distance','cost','rating']};assert sum(weights.values())==100
  for img in page.get_by_label('Choose hotel category and property').locator('img').all():
   img.scroll_into_view_if_needed();expect(img).to_have_js_property('complete',True);assert img.evaluate('(e)=>e.naturalWidth>0')
  page.get_by_role('button',name='Review Plan').click()
  submitted=[]
  def capture(request):
   if request.method=='POST' and (request.url.endswith('/trips') or '/generate-itinerary' in request.url):submitted.append(request.url)
  page.on('request',capture)
  def delayed_create(route):
   expect(page.get_by_role('status').filter(has_text='Saving and generating')).to_be_visible()
   expect(page.get_by_role('button',name='Generate Circular Plan')).to_be_disabled()
   time.sleep(.3)
   route.continue_()
  page.route(re.compile(r'/api/trips$'),delayed_create)
  with page.expect_response(lambda r:'/generate-itinerary' in r.url) as response:page.get_by_role('button',name='Generate Circular Plan').evaluate('(e)=>{e.click();e.click();}')
  page.unroute(re.compile(r'/api/trips$'),delayed_create);page.remove_listener('request',capture)
  assert len(submitted)==2,submitted
  assert response.value.status==200,response.value.text();dto=response.value.json();assert dto['trip']['weights']==weights;assert dto['trip']['starting_hotel_id']==selected['id'];assert 'authorization' in response.value.request.headers
  opt=dto['trip']['generation_summary']['optimization'];assert opt['score']==max(c['score'] for c in opt['candidates'])
  assert_known_budget(dto)
  expect(page.get_by_role('region',name='Your Priorities')).to_be_visible();page.reload(wait_until='domcontentloaded');expect(page.get_by_role('region',name='Your Priorities')).to_contain_text(priority.capitalize()+': 80%')
  prompt=page.get_by_role('dialog',name='Add Heritage Tourism Planner to Home Screen',exact=True)
  if prompt.count():prompt.get_by_role('button',name='Maybe Later',exact=True).click()
  for img in page.locator('img').all():
   if img.is_visible():
    img.scroll_into_view_if_needed();expect(img).to_have_js_property('complete',True);assert img.evaluate('(e)=>e.naturalWidth>0')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(350)
  page.screenshot(path='reports/demo-'+str(index+1)+'.png',full_page=True)
  report['runs'].append({'city':city,'hotel':selected['name'],'width':width,'weights':weights,'optimization':opt,'budget':dto['budget']})
  report['checks'].append(city+' '+priority+' UI/API/database/optimizer/persisted result/refresh')
 page.set_viewport_size({'width':1440,'height':1000});page.get_by_role('button',name='Sign Out',exact=True).click()
 assert page.evaluate('sessionStorage.getItem("heritage_api_token")') is None;assert context.request.get(api+'/trips').status==401
 report['checks'].append('Logout clears client token; protected request without credentials is401')
 assert not report['pageErrors'] and not report['consoleErrors'],report
 browser.close()
report['verified']=True;Path('reports/itinerary-demo-browser.json').write_text(json.dumps(report,indent=2));print(json.dumps({'verified':True,'checks':report['checks'],'runs':len(report['runs'])}))
