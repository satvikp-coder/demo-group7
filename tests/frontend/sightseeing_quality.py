"""Actual reported Champaner flow; isolated test service only."""
import os,json,secrets,time,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL'];assert ':5310/' in api
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  ctx=browser.new_context(viewport={'width':width,'height':900});page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  email='sightseeing-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(20)+'Aa9!'
  assert ctx.request.post(api+'/auth/register',data={'name':'Isolated sightseeing regression','email':email,'password':password,'role':'tourist'}).status==201
  page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password);page.locator('button[type=submit]').click();page.wait_for_url('**/profile')
  page.goto(base);page.get_by_role('button',name='Start planning',exact=True).click();page.get_by_role('button',name=re.compile('^Champaner')).click();page.get_by_role('button',name='Continue to Logistics').click()
  page.get_by_role('button',name='Low Cost',exact=True).click()
  chooser=page.locator('#planner-starting-hotel');expect(chooser).to_contain_text('Hotel Rajdhani')
  hotel=next(o for o in chooser.locator('option').evaluate_all('(es)=>es.map(e=>({id:e.value,name:e.textContent}))') if 'Hotel Rajdhani' in o['name'])
  chooser.select_option(hotel['id']);page.locator('#planner-budget-input').fill('8500');page.get_by_label('Lodging nights',exact=True).fill('2');page.get_by_label('Travelers',exact=True).fill('4');page.get_by_label('Rooms',exact=True).fill('2');page.locator('#priority-cost').fill('100')
  page.get_by_role('button',name='Review Plan').click()
  with page.expect_response(lambda r:'/generate-itinerary' in r.url) as generated:page.get_by_role('button',name='Generate Circular Plan').click()
  assert generated.value.status==200,generated.value.text();dto=generated.value.json();summary=dto['trip']['generation_summary']
  assert summary['optimization']['weights']=={'distance':0,'cost':100,'rating':0}
  assert not any(s['stop_type']=='meal' for d in dto['days'] for s in d['stops'])
  assert dto['days'][0]['stops'][-1]['arrival_time']<'11:00:00'
  assert summary['day_coverage'][1]['attraction_count']==0
  assert dto['budget']['total']==3340
  page.wait_for_url('**/itinerary');expect(page.get_by_test_id('itinerary-day-coverage')).to_contain_text('Shorten the sightseeing trip')
  page.reload();expect(page.get_by_test_id('itinerary-day-coverage')).to_contain_text('Shorten the sightseeing trip')
  assert not errors and page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.locator('img').evaluate_all('(images)=>images.forEach(i=>i.loading="eager")');page.wait_for_timeout(700)
  assert page.locator('img').evaluate_all('(images)=>images.every(i=>i.complete&&i.naturalWidth>0)')
  page.screenshot(path=f'reports/sightseeing-champaner-{width}.png',full_page=True)
  results.append({'width':width,'hotelPreserved':dto['trip']['starting_hotel_id']==hotel['id'],'noForcedMealWait':True,'knownTotal':dto['budget']['total'],'promptHotelReturn':True,'unsupportedDayDisclosed':True,'refresh':True,'imagesDecode':True,'pageErrors':errors});ctx.close()
 browser.close()
Path('reports/sightseeing-browser-tests.json').write_text(json.dumps({'verified':True,'results':results},indent=2),encoding='utf-8')
print('Reported Champaner sightseeing quality: 3 actual browser journeys PASS')
