"""Reproduce the reported House of MG inputs in an isolated account and recover honestly."""
import os,json,secrets,time,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL'];results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  ctx=browser.new_context(viewport={'width':width,'height':900});page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  email='budget-recovery-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(20)+'Aa9!'
  assert ctx.request.post(api+'/auth/register',data={'name':'Isolated budget recovery','email':email,'password':password,'role':'tourist'}).status==201
  page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password);page.locator('button[type=submit]').click();page.wait_for_url('**/profile')
  page.goto(base);page.get_by_role('button',name='Start planning',exact=True).click();page.get_by_role('button',name=re.compile('^Ahmedabad')).click();page.get_by_role('button',name='Continue to Logistics').click()
  page.get_by_role('button',name='Premium',exact=True).click()
  select=page.locator('#planner-starting-hotel');expect(select).to_contain_text('The House of MG')
  hotel=next(o for o in select.locator('option').evaluate_all('(es)=>es.map(e=>({id:e.value,name:e.textContent}))') if 'The House of MG' in o['name'])
  select.select_option(hotel['id']);page.locator('#planner-budget-input').fill('12000');page.get_by_label('Lodging nights',exact=True).fill('2');page.get_by_label('Travelers',exact=True).fill('2');page.get_by_label('Trip start date',exact=True).fill('2026-10-21');page.locator('#priority-distance').fill('82')
  writes=[]
  def record(request):
   if request.method=='POST' and '/trips' in request.url:writes.append(request.url)
  page.on('request',record)
  page.get_by_role('button',name='Review Plan').click();page.get_by_role('button',name='Generate Circular Plan').click()
  expect(page.get_by_role('alert')).to_contain_text('16,938');expect(page.get_by_role('alert')).to_contain_text('4,938')
  assert not writes;expect(select).to_have_value(hotel['id']);expect(page.get_by_label('Lodging nights',exact=True)).to_have_value('2')
  page.screenshot(path=f'reports/phase3-budget-explanation-{width}.png')
  # Explicit user correction, never automatic relaxation or hotel replacement.
  page.get_by_label('Lodging nights',exact=True).fill('1');page.get_by_role('button',name='Review Plan').click()
  with page.expect_response(lambda r:'/generate-itinerary' in r.url) as generated:page.get_by_role('button',name='Generate Circular Plan').click()
  assert generated.value.status==200,generated.value.text();dto=generated.value.json()
  assert dto['trip']['starting_hotel_id']==hotel['id'];assert dto['trip']['generation_summary']['hotel_total']==8469
  assert dto['budget']['total']<=12000;assert any(s['stop_type']=='attraction' for d in dto['days'] for s in d['stops'])
  assert len(writes)==2;page.wait_for_url('**/itinerary');page.reload();expect(page.get_by_text('Hotels (1 Nights)',exact=True)).to_be_visible()
  assert not errors;assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.screenshot(path=f'reports/phase3-budget-recovered-{width}.png',full_page=True)
  results.append({'width':width,'unaffordableTotal':16938,'shortfall':4938,'rejectedBeforeTripWrite':True,'sameHotelRecovered':True,'explicitNights':1,'hotelTotal':8469,'knownTripTotal':dto['budget']['total'],'refresh':True,'pageErrors':errors});ctx.close()
 browser.close()
Path('reports/phase3-budget-recovery.json').write_text(json.dumps({'verified':True,'results':results},indent=2),encoding='utf-8')
print('Reported budget failure and explicit one-night recovery: 3 viewport journeys PASS')
