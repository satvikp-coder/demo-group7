"""Four teammate defects against isolated real APIs; no real user deletion."""
import os,json,time,secrets,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL'];assert ':5310/' in api
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  ctx=browser.new_context(viewport={'width':width,'height':950});page=ctx.new_page();errors=[];trip_writes=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  email='teammate-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(20)+'Aa9!'
  assert ctx.request.post(api+'/auth/register',data={'name':'Isolated teammate checks','email':email,'password':password,'role':'tourist'}).status==201
  page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password);page.locator('button[type=submit]').click();page.wait_for_url('**/profile')
  expect(page.get_by_role('heading',name='My Saved Heritage Trips',exact=True)).to_be_visible()
  assert not page.get_by_role('button',name='Admin Panel',exact=True).count()
  token=page.evaluate('sessionStorage.getItem("heritage_api_token")');headers={'Authorization':'Bearer '+token}
  assert ctx.request.get(api+'/admin/status',headers=headers).status==403
  page.goto(base+'/admin');page.wait_for_url('**/profile');assert not page.get_by_role('button',name='Admin Panel',exact=True).count()
  # Test-only inconsistent catalog snapshot: category endpoint remains real/priced.
  def unpriced_snapshot(route):
   response=route.fetch();body=response.json();rows=body if isinstance(body,list) else body['data']
   for city in rows:
    for hotel in city['hotels']:
     if hotel['name']=='The House of MG':hotel['price_per_night']=None
   route.fulfill(response=response,json=body)
  page.route('**/api/destinations/catalog*',unpriced_snapshot)
  page.goto(base);page.get_by_role('button',name='Start planning',exact=True).click();page.get_by_role('button',name=re.compile('^Ahmedabad')).click();page.get_by_role('button',name='Continue to Logistics').click();page.get_by_role('button',name='Premium',exact=True).click()
  chooser=page.locator('#planner-starting-hotel');expect(chooser).to_contain_text('The House of MG');hotel=next(o for o in chooser.locator('option').evaluate_all('(es)=>es.map(e=>({id:e.value,name:e.textContent}))') if 'The House of MG' in o['name']);chooser.select_option(hotel['id']);page.locator('#planner-budget-input').fill('30000')
  page.on('request',lambda r:trip_writes.append(r.method) if '/trips' in r.url and r.method=='POST' else None)
  page.get_by_role('button',name='Review Plan').click();page.get_by_role('button',name='Generate Circular Plan').click();expect(page.get_by_role('alert')).to_contain_text('No usable room price');assert not trip_writes
  page.unroute('**/api/destinations/catalog*',unpriced_snapshot)
  page.goto(base);page.get_by_role('button',name='Start planning',exact=True).click();page.get_by_role('button',name=re.compile('^Modhera')).click();page.get_by_role('button',name='Continue to Logistics').click();page.get_by_role('button',name='Budget',exact=True).click();chooser=page.locator('#planner-starting-hotel');expect(chooser.locator('option')).not_to_have_count(1);chooser.select_option(index=1);page.locator('#planner-budget-input').fill('30000');page.get_by_role('button',name='Review Plan').click()
  with page.expect_response(lambda r:'/generate-itinerary' in r.url) as generated:page.get_by_role('button',name='Generate Circular Plan').click()
  assert generated.value.status==200;dto=generated.value.json();trip_id=dto['trip']['id'];page.wait_for_url('**/itinerary')
  page.get_by_role('button',name='Copy private trip link',exact=True).click();modal=page.locator('[aria-labelledby=share-itinerary-title]');expect(modal).to_contain_text('does not grant public access');link=modal.locator('input').input_value();assert token not in link;page.keyboard.press('Escape')
  other_email='other-'+str(time.time_ns())+'@example.test';other_password=secrets.token_urlsafe(20)+'Aa9!';assert ctx.request.post(api+'/auth/register',data={'name':'Other isolated owner','email':other_email,'password':other_password,'role':'tourist'}).status==201
  other_token=ctx.request.post(api+'/auth/login',data={'email':other_email,'password':other_password}).json()['token'];other_headers={'Authorization':'Bearer '+other_token}
  assert ctx.request.get(api+'/trips/'+trip_id,headers=other_headers).status==404
  assert ctx.request.delete(api+'/trips/'+trip_id,headers=other_headers).status==404
  assert ctx.request.get(api+'/trips/'+trip_id).status==401
  page.goto(link);expect(page.get_by_text('Base Hotel:',exact=False)).to_be_visible()
  page.goto(base+'/profile');delete=page.get_by_role('button',name='Delete Trip',exact=True);expect(delete).to_have_count(1)
  page.once('dialog',lambda d:d.dismiss());delete.click();assert ctx.request.get(api+'/trips/'+trip_id,headers=headers).status==200
  # A failed server mutation must retain the row and display the failure.
  page.route('**/api/trips/'+trip_id,lambda route:route.fulfill(status=503,content_type='application/json',body='{"error":{"message":"Test-only deletion outage"}}') if route.request.method=='DELETE' else route.continue_())
  page.once('dialog',lambda d:d.accept());delete.click();expect(page.get_by_role('alert')).to_contain_text('Test-only deletion outage');expect(delete).to_have_count(1)
  assert ctx.request.get(api+'/trips/'+trip_id,headers=headers).status==200
  page.unroute('**/api/trips/'+trip_id)
  page.once('dialog',lambda d:d.accept())
  with page.expect_response(lambda r:r.request.method=='DELETE' and '/trips/' in r.url) as removed:delete.click()
  assert removed.value.status==204;expect(page.get_by_role('button',name='Delete Trip',exact=True)).to_have_count(0)
  page.reload();expect(page.get_by_role('button',name='Delete Trip',exact=True)).to_have_count(0);assert ctx.request.get(api+'/trips/'+trip_id,headers=headers).status==404
  assert page.evaluate('Object.values(JSON.parse(localStorage.getItem("heritage_pwa_cached_trips")||"{}")).every(c=>c.config.tripId!=='+json.dumps(trip_id)+')')
  assert not errors and page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.screenshot(path=f'reports/teammate-fixes-{width}.png');results.append({'width':width,'unknownPriceRejectedBeforeTripWrite':True,'touristAdminHiddenAndForbidden':True,'privateLinkOwnerOnly':True,'deletionCancelledAndFailurePreservesTrip':True,'ownerDelete204AndRefresh404':True,'offlineSnapshotRemoved':True,'pageErrors':errors});ctx.close()
 browser.close()
Path('reports/teammate-browser-tests.json').write_text(json.dumps({'verified':True,'results':results},indent=2),encoding='utf-8');print('Four teammate fixes: 3 isolated real-browser journeys PASS')
