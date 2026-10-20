"""Actual reported Champaner flow; isolated test service only."""
import os,json,secrets,time,re
from pathlib import Path
from decimal import Decimal
from cost_assertions import assert_known_budget
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
  visits=[s for d in dto['days'] for s in d['stops'] if s['stop_type']=='attraction']
  assert len(visits)>1 and len({s['reference_id'] for s in visits})==len(visits)
  assert all(d['attraction_count']>0 for d in summary['day_coverage'])
  for day in dto['days']:
   stops=day['stops'];assert stops[0]['reference_id']==stops[-1]['reference_id']==hotel['id']
   assert all(a['departure_time']<=b['arrival_time'] for a,b in zip(stops,stops[1:]))
   assert stops[-1]['departure_time']<='21:00:00'
   for i,stop in enumerate(stops):
    if stop['stop_type']!='meal':continue
    if stop['category']=='lunch':assert '12:00:00'<=stop['arrival_time']<=stop['departure_time']<='14:00:00'
    if stop['category']=='dinner':assert '19:00:00'<=stop['arrival_time']<=stop['departure_time']<='21:00:00'
    if stop['reference_id'] is None:assert stop['cost'] is None and stop['lat'] is None and stop['lng'] is None
    prior=[v for v in stops[:i] if v['stop_type']=='attraction'];later=[v for v in stops[i+1:] if v['stop_type']=='attraction']
    def minute(value):return int(value[:2])*60+int(value[3:5])
    # A meal cannot manufacture a late tour hours after the last sightseeing stop.
    assert not (prior and not later and minute(stop['arrival_time'])-minute(prior[-1]['departure_time'])>120)
  assert_known_budget(dto);assert dto['budget']['total']<=8500
  hotels=ctx.request.get(api+'/destinations/'+dto['trip']['destination_id']+'/hotels').json()
  selected=next(h for h in hotels if h['id']==hotel['id'])
  assert Decimal(str(dto['budget']['hotel']))==Decimal(str(selected['price_per_night']))*2*2
  assert dto['budget']['cost_details']['final_total'] is None
  def check_notes():
   expect(page.get_by_test_id('itinerary-day-coverage')).to_have_count(len(summary['day_coverage']))
   assert not page.get_by_test_id('itinerary-day-coverage').filter(has_text='Unallocated sightseeing day.').count()
   expect(page.get_by_role('region',name='Your Priorities')).to_contain_text('Cost utility is neutralized')
  page.wait_for_url('**/itinerary');check_notes();page.reload();check_notes()
  assert not errors and page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.locator('img').evaluate_all('(images)=>images.forEach(i=>i.loading="eager")');page.wait_for_function('Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)')
  assert page.locator('img').evaluate_all('(images)=>images.every(i=>i.complete&&i.naturalWidth>0)')
  page.screenshot(path=f'reports/sightseeing-champaner-{width}.png',full_page=True)
  results.append({'width':width,'hotelPreserved':dto['trip']['starting_hotel_id']==hotel['id'],'noForcedMealWait':True,'knownSubtotal':dto['budget']['total'],'sightseeingDays':len(summary['day_coverage']),'distinctVisits':len(visits),'noEmptyTour':True,'unknownCostsDisclosed':True,'refresh':True,'imagesDecode':True,'pageErrors':errors});ctx.close()
 browser.close()
Path('reports/sightseeing-browser-tests.json').write_text(json.dumps({'verified':True,'results':results},indent=2),encoding='utf-8')
print('Reported Champaner sightseeing quality: 3 actual browser journeys PASS')
