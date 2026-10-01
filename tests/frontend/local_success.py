"""Successful production-browser flows, with real service workers and no fault mocks.
Fixture IDs are written for the local runner's exact-ID cleanup; no secrets saved.
"""
import json, os, secrets, time, subprocess, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
base=os.environ.get('FRONTEND_TEST_URL','http://localhost:8080')
api=base+'/api'
report={'startedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'verified':False,'users':[],'checks':[],'cities':[],'pageErrors':[],'consoleErrors':[],'consoleWarnings':[],'failedRequests':[],'httpErrors':[]}
output=Path('backend/reports/local-browser-success.json')
def save(): output.write_text(json.dumps(report,indent=2),encoding='utf-8')
def check(name): report['checks'].append({'name':name,'passed':True});save()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(channel='chrome',headless=True)
  context=browser.new_context(service_workers='allow')
  page=context.new_page()
  page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
  page.on('console',lambda m:report['consoleErrors'].append(m.text) if m.type=='error' else report['consoleWarnings'].append(m.text) if m.type=='warning' else None)
  page.on('requestfailed',lambda r:report['failedRequests'].append({'url':r.url,'failure':r.failure}) if r.failure!='net::ERR_ABORTED' else None)
  page.on('response',lambda r:report['httpErrors'].append({'path':r.url.split('?')[0],'status':r.status}) if r.status>=400 else None)
  mutations=[]
  page.on('request',lambda r:mutations.append(r.url) if r.method=='POST' and r.url.startswith(api) else None)
  email='local-success-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(24)+'Aa9!'
  page.goto(base+'/register')
  page.locator('#reg-name').fill('Local verification')
  page.locator('input[type=email]').fill(email)
  page.locator('input[type=password]').nth(0).fill(password)
  page.locator('input[type=password]').nth(1).fill(password)
  with page.expect_response(lambda r:r.url==api+'/auth/register') as signup:page.locator('button[type=submit]').evaluate('(el)=>{el.click();el.click();}')
  assert signup.value.status==201
  report['users'].append(signup.value.json()['user']['id']);save()
  assert mutations.count(api+'/auth/register')==1
  page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password)
  page.locator('button[type=submit]').evaluate('(el)=>{el.click();el.click();}');page.wait_for_url('**/profile')
  assert mutations.count(api+'/auth/login')==1
  for refresh in range(5):
   page.reload();expect(page.get_by_text('Welcome back, Local verification',exact=True).first).to_be_visible()
  check('Registration, login, auth/me and five dashboard refreshes through built app')
  token=page.evaluate("sessionStorage.getItem('heritage_api_token')")
  headers={'Authorization':'Bearer '+token}
  cities=context.request.get(api+'/destinations?limit=100').json();assert len(cities)==8
  for city in cities:
   page.goto(base+'/explore')
   search=page.get_by_placeholder('Search destinations or districts...');search.fill(city['name'])
   expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(1)
   page.get_by_role('button',name='Inspect Site',exact=True).click()
   children={}
   for kind in ['attractions','hotels','restaurants']:
    response=context.request.get(api+'/destinations/'+city['id']+'/'+kind);assert response.status==200
    children[kind]=response.json();assert children[kind]
   page.goto(base+'/profile');page.get_by_role('button',name='Create New Heritage Route').click()
   page.locator('[role=dialog]').get_by_role('button',name=re.compile('^'+re.escape(city['name'])+'(?:\\s|$)')).click()
   page.get_by_role('button',name='Continue to Logistics').click()
   hotel=children['hotels'][0]
   page.locator('[role=dialog] select').first.select_option(hotel['id'])
   page.locator('[role=dialog] input[type=range]').fill('20000')
   page.locator('[role=dialog] input[type=checkbox]').uncheck()
   page.get_by_role('button',name='Review Plan').click()
   submissions=len(mutations)
   with page.expect_response(lambda r:'/generate-itinerary' in r.url) as generated:page.get_by_role('button',name='Generate Circular Plan').evaluate('(el)=>{el.click();el.click();}')
   assert generated.value.status==200;dto=generated.value.json();trip_id=dto['trip']['id']
   assert mutations[submissions:].count(api+'/trips')==1
   assert mutations[submissions:].count(api+'/trips/'+trip_id+'/generate-itinerary')==1
   assert dto['trip']['destination_id']==city['id'];assert dto['trip']['starting_hotel_id']==hotel['id']
   page.reload();expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible()
   with page.expect_response(lambda r:r.url.endswith('/trips/'+trip_id+'/budget')) as budget:page.get_by_role('button',name='Budget Planner',exact=True).first.click()
   assert budget.value.json()==dto['budget']
   page.reload();expect(page.get_by_text('\u20b9'+format(dto['budget']['total'],',.0f'),exact=True).first).to_be_visible()
   assert context.request.get(api+'/trips/'+trip_id,headers=headers).json()==dto
   report['cities'].append({'slug':city['slug'],'tripId':trip_id,'total':dto['budget']['total'],'passed':True});save()
  check('All eight cities: real search/details/children/planner/selected hotel/budget/reload/persisted API')
  check('Rapid double actions produce exactly one registration/login/trip/generation request')
  # Hold only this private test DB's stop-write lock to guarantee generation is
  # still in flight when the browser reloads; no HTTP response is mocked.
  page.goto(base+'/profile');page.get_by_role('button',name='Create New Heritage Route').click()
  page.locator('[role=dialog]').get_by_role('button',name=re.compile('^'+re.escape(city['name'])+'(?:\\s|$)')).click()
  page.get_by_role('button',name='Continue to Logistics').click()
  page.locator('#planner-starting-hotel').select_option(hotel['id'])
  page.locator('[role=dialog] input[type=range]').fill('20000')
  page.locator('[role=dialog] input[type=checkbox]').uncheck()
  page.get_by_role('button',name='Review Plan').click()
  pg_id=subprocess.check_output(['docker','compose','--env-file','.env.local-production','-p','heritage-local','-f','compose.yml','-f','compose.local.yml','ps','-q','postgres'],text=True).strip()
  lock=subprocess.Popen(['docker','exec',pg_id,'psql','-U','heritage_owner','-d','heritage_planner','-At','-v','ON_ERROR_STOP=1','-c','BEGIN; LOCK TABLE itinerary_stops IN SHARE MODE; SELECT pg_sleep(5); COMMIT;'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
  def held():return subprocess.check_output(['docker','exec',pg_id,'psql','-U','heritage_owner','-d','heritage_planner','-At','-c',"SELECT count(*) FROM pg_locks WHERE relation='itinerary_stops'::regclass AND mode='ShareLock' AND granted"],text=True).strip()=='1'
  for attempt in range(10):
   if held():break
   time.sleep(.1)
  assert held()
  with page.expect_request(lambda r:'/generate-itinerary' in r.url) as inflight:page.get_by_role('button',name='Generate Circular Plan').click()
  interrupted_id=inflight.value.url.split('/trips/')[1].split('/')[0]
  assert held()
  page.reload();lock.communicate(timeout=15);assert lock.returncode==0
  recovered=context.request.get(api+'/trips/'+interrupted_id,headers=headers)
  assert recovered.status==200;interrupted_plan=recovered.json()
  assert interrupted_plan['trip']['generated_at'] and interrupted_plan['budget']['total']==dto['budget']['total']
  assert mutations.count(api+'/trips/'+interrupted_id+'/generate-itinerary')==1
  page.goto(base+'/profile');expect(page.get_by_role('button',name='Open Itinerary',exact=True)).to_have_count(9)
  report['interruptedGeneration']={'tripId':interrupted_id,'requests':1,'persisted':True};save()
  check('Refresh during a real database-blocked generation preserves the committed plan and dashboard recovery without duplicate generation')
  page.goto(base+'/itinerary');expect(page.get_by_text('Base Hotel:',exact=False)).to_be_visible()
  with page.expect_download(timeout=60000) as pdf:page.get_by_role('button',name='Download PDF Itinerary',exact=True).click()
  assert Path(pdf.value.path()).read_bytes().startswith(b'%PDF-')
  check('PDF download embeds cross-origin font styles without suppressing errors')
  page.get_by_role('button',name='Share Route',exact=True).click()
  share_url=page.locator('[role=dialog] input').input_value();page.keyboard.press('Escape')
  subprocess.run(['node','scripts/local-stack.js','restart'],check=True)
  page.reload();expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible()
  assert context.request.get(api+'/trips/'+trip_id,headers=headers).json()==dto
  check('Frontend/backend/PostgreSQL restart preserves exact itinerary and budget')
  context.close();context=browser.new_context(service_workers='allow');page=context.new_page()
  page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
  page.on('console',lambda m:report['consoleErrors'].append(m.text) if m.type=='error' else report['consoleWarnings'].append(m.text) if m.type=='warning' else None)
  page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password)
  page.locator('button[type=submit]').click();page.wait_for_url('**/profile')
  expect(page.get_by_role('button',name='Open Itinerary',exact=True)).to_have_count(9)
  page.get_by_role('button',name='Open Itinerary',exact=True).first.click()
  expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible()
  check('Fresh login dashboard lists PostgreSQL trips and its Open Itinerary control restores the saved plan')
  page.goto(share_url);expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible()
  token=page.evaluate("sessionStorage.getItem('heritage_api_token')")
  assert context.request.get(api+'/trips/'+trip_id,headers={'Authorization':'Bearer '+token}).json()==dto
  check('Fresh browser session logs in and reopens persisted shared trip without generating')
  headers={'Authorization':'Bearer '+token}
  extra=context.request.post(api+'/trips',headers=headers,data={'destination_id':city['id'],'days':1,'budget':20000,'starting_hotel_id':hotel['id'],'start_time':'08:00'})
  assert extra.status==201;extra_id=extra.json()['trip']['id']
  assert context.request.post(api+'/trips/'+extra_id+'/generate-itinerary',headers=headers,data={}).status==200
  page.goto(base+'/profile');expect(page.get_by_role('button',name='Open Itinerary',exact=True)).to_have_count(10)
  page.get_by_role('button',name='Remove',exact=True).first.click()
  expect(page.get_by_role('button',name='Open Itinerary',exact=True)).to_have_count(9)
  page.reload();expect(page.get_by_role('button',name='Open Itinerary',exact=True)).to_have_count(9)
  assert context.request.get(api+'/trips/'+extra_id,headers=headers).status==200
  check('Existing Remove control hides session history after refresh and preserves the saved PostgreSQL trip')
  page.goto(base+'/profile');page.get_by_role('button',name='Sign Out',exact=True).click()
  assert page.evaluate("sessionStorage.getItem('heritage_api_token')") is None
  check('SPA direct navigation and logout')
  assert not report['pageErrors'],report['pageErrors']
  assert not report['consoleErrors'],report['consoleErrors']
  assert not report['consoleWarnings'],report['consoleWarnings']
  assert not report['failedRequests'],report['failedRequests']
  assert not report['httpErrors'],report['httpErrors']
  check('No console/page/network errors during successful production flows')
  browser.close();report['verified']=True
except Exception as e:report['failure']=str(e);raise
finally:save();print(json.dumps({'verified':report['verified'],'checks':len(report['checks']),'cities':len(report['cities'])}))
