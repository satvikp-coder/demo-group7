"""Final seeded-catalog review on the production preview; cleans its exact account."""
import json,re,secrets,subprocess,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
from cost_assertions import assert_known_budget

ROOT=Path(__file__).resolve().parents[2]
BASE='http://localhost:3000';API=BASE+'/api'
CITIES=[
 ('ahmedabad','Ahmedabad','અમદાવાદ','अहमदाबाद','Ahmdabad'),
 ('somnath','Somnath','સોમનાથ','सोमनाथ','Somanth'),
 ('dwarka','Dwarka','દ્વારકા','द्वारका','Dwraka'),
 ('modhera','Modhera','મોઢેરા','मोढेरा','Modera'),
 ('champaner','Champaner','ચાંપાનેર','चंपानेर','Champner'),
 ('gir-national-park','Gir National Park','ગીર','गिर','Gri National Park'),
 ('rann-of-kutch','Rann of Kutch','કચ્છનું રણ','कच्छ का रण','Ran of Kutch'),
 ('saputara','Saputara','સાપુતારા','सापुतारा','Saputra'),
]
report={'cities':[],'verified':False,'budgets':[5000,15000,30000]}
generation_times=[]
def pace(reserve=1):
 while True:
  now=time.monotonic();generation_times[:]=[t for t in generation_times if now-t<61]
  if len(generation_times)+reserve<=28:return
  time.sleep(min(5,max(.1,61-(now-generation_times[0]))))
def persist():
 (ROOT/'backend/reports/final-city-review.txt').write_text(json.dumps(report,indent=2,ensure_ascii=True),encoding='utf-8')

with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 context=browser.new_context(service_workers='block',viewport={'width':1280,'height':950},reduced_motion='reduce')
 page=context.new_page();user_id=None;current=None
 page.add_init_script("localStorage.setItem('heritage_pwa_prompt_dismissed_v1','true')")
 def on_response(response):
  if '/generate-itinerary' in response.url and response.request.method=='POST':generation_times.append(time.monotonic())
  if current is not None and response.status>=400:current['httpErrors'].append({'status':response.status,'path':response.url.split('?')[0]})
 page.on('response',on_response)
 page.on('pageerror',lambda e:current['pageErrors'].append(str(e)) if current is not None else None)
 page.on('console',lambda m:current['consoleErrors'].append(m.text) if current is not None and m.type=='error' else None)
 page.on('requestfailed',lambda r:current['failedRequests'].append({'path':r.url.split('?')[0],'failure':r.failure}) if current is not None else None)
 def settled():page.wait_for_load_state('networkidle')
 def login():
  page.goto(BASE+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password)
  page.locator('button[type=submit]').click();page.wait_for_url('**/profile');expect(page.get_by_role('button',name='Sign Out',exact=True)).to_be_visible();settled()
 def review_plan(city,hotel,days,budget,wheelchair=False):
  current['stage']='open planner'
  page.goto(BASE+'/destination/'+city['slug']);expect(page.get_by_role('button',name='Build Custom Itinerary',exact=True)).to_be_visible();settled()
  page.get_by_role('button',name='Build Custom Itinerary',exact=True).click();page.get_by_role('button',name='Continue to Logistics',exact=True).click()
  while int(page.locator('#planner-trip-days').inner_text())>days:page.get_by_role('button',name='Decrease trip duration',exact=True).click()
  while int(page.locator('#planner-trip-days').inner_text())<days:page.get_by_role('button',name='Increase trip duration',exact=True).click()
  page.locator('#planner-starting-hotel').select_option(hotel['id'])
  page.get_by_label('Lodging nights',exact=True).fill(str(days-1))
  page.locator('#planner-budget-input').fill(str(budget))
  page.locator('[role=dialog] input[type=checkbox]').set_checked(wheelchair)
  page.get_by_role('button',name='Review Plan',exact=True).click()
  current['stage']='planner review'
 def generate(city,hotel,days,budget,wheelchair=False):
  review_plan(city,hotel,days,budget,wheelchair)
  if float(hotel['price_per_night'])*(days-1)>budget:
   writes=[]
   def record(r):
    if r.method=='POST' and '/api/trips' in r.url:writes.append(r.url)
   page.on('request',record);page.get_by_role('button',name='Generate Circular Plan',exact=True).click()
   expect(page.get_by_role('alert')).to_contain_text('Accommodation alone is')
   page.remove_listener('request',record);assert not writes
   page.get_by_role('button',name='Close trip planner',exact=True).click()
   return None
  pace()
  current['stage']='wait for generation response'
  try:
   with page.expect_response(lambda r:'/generate-itinerary' in r.url) as result:page.get_by_role('button',name='Generate Circular Plan',exact=True).click()
  except Exception:
   current['uiAlerts']=page.get_by_role('alert').all_text_contents()
   raise
  assert result.value.status==200
  dto=result.value.json();assert dto['trip']['destination_id']==city['id'] and dto['trip']['starting_hotel_id']==hotel['id']
  assert dto['trip']['trip_days']==days and len(dto['days'])==days and dto['budget']['hotel']==float(hotel['price_per_night'])*(days-1)
  assert_known_budget(dto)
  page.wait_for_url('**/itinerary');expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible();settled()
  return dto
 try:
  email=f'final-review-{time.time_ns()}@example.com';password=secrets.token_urlsafe(20)+'Aa9!'
  registration=context.request.post(API+'/auth/register',data={'name':'Final Browser Review','email':email,'password':password});assert registration.status==201
  user_id=registration.json()['user']['id'];login()
  for slug,name,gu,hi,typo in CITIES:
   current={'city':name,'cases':[],'search':{},'pageErrors':[],'consoleErrors':[],'failedRequests':[],'httpErrors':[],'passed':False}
   report['cities'].append(current)
   try:
    city=context.request.get(API+'/destinations/'+slug).json()
    hotels=context.request.get(API+'/destinations/'+slug+'/hotels').json();hotel=min(hotels,key=lambda h:float(h['price_per_night']))
    attractions=context.request.get(API+'/destinations/'+slug+'/attractions').json()
    page.goto(BASE+'/explore');expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(8);settled()
    for language,term in [('en',name),('gu',gu),('hi',hi),('typo',typo)]:
     with page.expect_response(lambda r:'/destinations/search?' in r.url) as found:page.get_by_role('textbox',name='Search destinations or districts...',exact=True).fill(term)
     assert found.value.status==200
     rows=found.value.json();expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(len(rows));settled()
     current['search'][language]=any(d['id']==city['id'] for d in rows)
     if language!='typo':assert current['search'][language]
    for days in [1,2,3]:
     for budget in report['budgets']:
      dto=generate(city,hotel,days,budget)
      current['cases'].append({'days':days,'budget':budget,'result':'generated' if dto else 'correctly blocked before write'})
    review_plan(city,hotel,3,30000);pace(3)
    page.get_by_role('button',name='Compare optimization strategies',exact=True).click()
    expect(page.get_by_role('button',name='Use this plan',exact=True)).to_have_count(3,timeout=30000)
    page.get_by_role('button',name='Use this plan',exact=True).first.click()
    expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible();settled();current['comparison']=True
    page.get_by_role('button',name='View budget breakdown',exact=True).click();page.wait_for_url('**/budget')
    expect(page.get_by_role('button',name='Print Ledger',exact=True)).to_be_visible();settled();current['budget']=True
    page.goto(BASE+'/profile');expect(page.get_by_role('button',name='Open Itinerary',exact=True).first).to_be_visible();settled()
    page.get_by_role('button',name='Open Itinerary',exact=True).first.click()
    expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible();settled();current['savedReopened']=True
    page.get_by_role('button',name='Copy private trip link',exact=True).click()
    share=page.locator('[role=dialog] input').input_value();page.keyboard.press('Escape');page.goto(share)
    expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible();settled();current['ownerLink']=True
    with page.expect_download(timeout=90000) as download:page.get_by_role('button',name='Download PDF Itinerary',exact=True).click()
    pdf=Path(download.value.path()).read_bytes();assert pdf.startswith(b'%PDF-') and len(pdf)>1000;current['pdfBytes']=len(pdf);expect(page.get_by_role('button',name='Download PDF Itinerary',exact=True)).to_be_enabled(timeout=30000)
    current['stage']='wheelchair filter'
    allowed={a['id'] for a in attractions if a['wheelchair_accessible'] is True}
    page.goto(BASE+'/explore');expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(8);settled()
    with page.expect_response(lambda r:'/destinations/search?' in r.url):page.get_by_role('textbox',name='Search destinations or districts...',exact=True).fill(name)
    expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(1);settled()
    page.get_by_role('button',name='Wheelchair Accessible',exact=True).click()
    expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(1 if allowed else 0);settled()
    current['wheelchair']={'eligible':len(allowed),'filterCards':1 if allowed else 0,'unknownsExcluded':True,'generated':False}
    if allowed:
     wc=generate(city,hotel,1,30000,True);assert wc is not None
     visited=[s for d in wc['days'] for s in d['stops'] if s['stop_type']=='attraction']
     assert visited and all(s['reference_id'] in allowed for s in visited)
     current['wheelchair'].update(generated=True,visited=len(visited))
    current['stage']='logout and login'
    page.goto(BASE+'/profile');expect(page.get_by_role('button',name='Sign Out',exact=True)).to_be_visible();settled()
    page.get_by_role('button',name='Sign Out',exact=True).click();expect(page.get_by_role('button',name='Sign In',exact=True).first).to_be_visible();settled();login();current['logoutLogin']=True
    page.get_by_role('button',name='Open Itinerary',exact=True).first.click();expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible();settled();current['reopenedAfterLogin']=True
    current['passed']=not current['pageErrors'] and not current['consoleErrors'] and not current['failedRequests'] and not current['httpErrors']
   except Exception as error:current['failure']=str(error);current['failureStage']=current.get('stage','city journey')
   persist();print(json.dumps({'city':name,'passed':current['passed'],'search':current['search'],'cases':len(current['cases']),'pageErrors':len(current['pageErrors']),'consoleErrors':len(current['consoleErrors']),'failedRequests':len(current['failedRequests']),'failure':current.get('failure')}),flush=True)
   current=None
  report['verified']=len(report['cities'])==8 and all(c['passed'] for c in report['cities'])
  report['typoSearchSupported']=all(c['search'].get('typo') for c in report['cities'])
  assert report['verified']
 finally:
  browser.close()
  if user_id:subprocess.run(['node','--input-type=module','-e',"import{pool}from'./backend/config/database.js';await pool.query('DELETE FROM users WHERE id=$1',[process.argv[1]]);await pool.end();",user_id],cwd=ROOT,check=True)
  persist()
