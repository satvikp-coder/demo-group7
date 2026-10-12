import os,json,time,secrets,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL'];results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  context=browser.new_context(viewport={'width':width,'height':1000},service_workers='block');page=context.new_page();errors=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  email='phase3-whatif-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(20)+'Aa9!'
  assert context.request.post(api+'/auth/register',data={'name':'Phase3 isolated browser','email':email,'password':password,'role':'tourist'}).status==201
  page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password);page.locator('button[type=submit]').click();page.wait_for_url(base+'/profile');page.goto(base,wait_until='domcontentloaded')
  page.get_by_role('button',name='Start planning',exact=True).click();page.get_by_role('button',name=re.compile('^Modhera')).click();page.get_by_role('button',name='Continue to Logistics').click()
  page.locator('#planner-budget-input').fill('30000');expect(page.get_by_label('Lodging nights',exact=True)).to_have_value('1')

  for _ in range(5):page.get_by_role('button',name='Increase trip duration',exact=True).click()
  page.get_by_label('Lodging nights',exact=True).fill('6')
  page.get_by_label('Accommodation arrival',exact=True).fill('2026-10-19');page.get_by_label('Accommodation departure',exact=True).fill('2026-10-25')
  page.get_by_role('button',name='Review Plan').click()
  with page.expect_response(lambda r:'/generate-itinerary' in r.url and r.request.method=='POST') as generated:page.get_by_role('button',name='Generate Circular Plan').click()
  response=generated.value;assert response.status==200;dto=response.json();assert dto['trip']['lodging_nights']==6
  assert dto['trip']['generation_summary']['hotel_total']>0;assert any(s['stop_type']=='attraction' for d in dto['days'] for s in d['stops'])
  page.wait_for_url('**/itinerary');expect(page.get_by_text('Base Hotel:',exact=False)).to_be_visible();page.reload();expect(page.get_by_text('Base Hotel:',exact=False)).to_be_visible();expect(page.get_by_text('Hotels (6 Nights)',exact=True)).to_be_visible()
  coverage=dto['trip']['generation_summary']['day_coverage']
  sparse=[d for d in coverage if not d['attraction_count']]
  assert sparse
  expect(page.get_by_test_id('itinerary-day-coverage')).to_have_count(len(sparse))
  expect(page.get_by_test_id('itinerary-day-coverage').first).to_contain_text('Shorten the sightseeing trip')
  for day in dto['days']:
   if not any(s['stop_type']=='attraction' for s in day['stops']):
    assert not any(s['stop_type']=='meal' for s in day['stops'])
  # Old response contracts continue to render: never rewrite stored itinerary stops.
  def legacy_response(route):
   response=route.fetch();body=response.json();body['trip']['generation_summary'].pop('free_time',None)
   route.fulfill(response=response,json=body)
  legacy_url='**/api/trips/'+dto['trip']['id'];page.route(legacy_url,legacy_response)
  page.reload();expect(page.get_by_test_id('itinerary-day-coverage')).to_have_count(len(sparse))
  page.unroute(legacy_url,legacy_response)
  page.get_by_role('button',name='What if?',exact=True).click()
  page.locator('#whatif-days-slider').fill('1')
  expect(page.get_by_text('Nights in the new version: 0.',exact=False)).to_be_visible()
  with page.expect_response(lambda r:'/generate-itinerary' in r.url and r.request.method=='POST') as changed:page.get_by_role('button',name='Save this version instead',exact=True).click()
  revised=changed.value.json();assert changed.value.status==200
  assert revised['trip']['id']!=dto['trip']['id'];assert revised['trip']['trip_days']==1
  assert revised['trip']['lodging_nights']==0;assert revised['trip']['generation_summary']['hotel_total']==0
  assert revised['trip']['departure_date'][:10]=='2026-10-19'
  expect(page.get_by_text('Hotels (0 Nights)',exact=True)).to_be_visible()
  page.reload();expect(page.get_by_text('Hotels (0 Nights)',exact=True)).to_be_visible()
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
  page.locator('img').evaluate_all('(images)=>images.forEach(i=>i.loading="eager")');page.wait_for_timeout(700)
  assert page.locator('img').evaluate_all('(images)=>images.every(i=>i.complete&&i.naturalWidth>0)')
  assert not errors,errors
  page.screenshot(path=f'reports/phase3-whatif-browser-{width}.png',full_page=True)
  results.append({'width':width,'authenticatedGeneration':True,'whatIfSevenToOneDays':True,'checkoutUpdated':True,'newTripId':True,'persistedRefresh':True,'imagesDecoded':True,'noOverflow':True,'pageErrors':errors})
  page.goto(base,wait_until='domcontentloaded');page.get_by_role('button',name='Switch to Gujarati',exact=True).first.click()
  expect(page.locator('html')).to_have_attribute('lang','gu');assert page.evaluate('localStorage.getItem("app_language")')=='gu'
  page.reload();expect(page.locator('html')).to_have_attribute('lang','gu');assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1')
  assert page.get_by_role('button',name='Start planning',exact=True).count()==0
  page.screenshot(path=f'reports/phase3-whatif-gujarati-{width}.png',full_page=True)
  results[-1]['gujaratiPersists']=True
  page.get_by_role('button',name='આયોજન શરૂ કરો',exact=True).click()
  page.get_by_role('button',name=re.compile('Modhera|મોઢેરા')).click();page.get_by_role('button',name='Continue to Logistics',exact=True).click()
  slider=page.get_by_label('અંતરની પ્રાથમિકતા',exact=True);expect(slider).to_be_visible();slider.fill('100');slider.focus();slider.press('ArrowLeft')
  assert sum(int(page.locator('#priority-'+key).input_value()) for key in ['distance','cost','rating'])==100
  assert int(slider.input_value())==99
  page.screenshot(path=f'reports/phase3-gujarati-priorities-{width}.png',full_page=True)
  results[-1]['gujaratiKeyboardPriorities']=True
  context.close()
 browser.close()
Path('reports/phase3-whatif-browser-tests.json').write_text(json.dumps({'verified':True,'results':results},indent=2));print(json.dumps(results))
