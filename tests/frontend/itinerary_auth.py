import os,json,time,secrets,re,base64,hmac,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL'];report={'verified':False,'checks':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True);context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block');page=context.new_page()
 email='itinerary-auth-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(20)+'Aa9!'
 registered=context.request.post(api+'/auth/register',data={'name':'Itinerary auth test','email':email,'password':password,'role':'tourist'});assert registered.status==201
 page.goto(base,wait_until="domcontentloaded",timeout=60000);page.get_by_role('button',name='Plan Itinerary',exact=True).first.click();page.get_by_role('button',name=re.compile('^Modhera')).click();page.get_by_role('button',name='Continue to Logistics').click();page.locator('#planner-budget-input').fill('20000');page.get_by_role('button',name='Review Plan').click();page.get_by_role('button',name='Generate Circular Plan').click();page.wait_for_url('**/login');expect(page.get_by_text('Sign in to generate your itinerary.',exact=False)).to_be_visible();report['checks'].append('Guest generation requires sign-in and keeps draft')
 page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill('WrongPassword123!');page.locator('button[type=submit]').click();expect(page.get_by_text('Invalid email or password',exact=False)).to_be_visible();report['checks'].append('Invalid login correctly rejected')
 page.locator('input[type=password]').fill(password);page.locator('button[type=submit]').click();expect(page.locator('#planner-modal-title')).to_contain_text('Modhera');page.get_by_role('button',name='Continue to Logistics').click();assert page.locator('#planner-budget-input').input_value()=='20000';page.get_by_role('button',name='Review Plan').click()
 with page.expect_response(lambda r:'/generate-itinerary' in r.url and r.request.method=='POST') as generated:page.get_by_role('button',name='Generate Circular Plan').click()
 response=generated.value;assert response.status==200;dto=response.json();assert len([s for d in dto['days'] for s in d['stops'] if s['stop_type']=='attraction'])>0;assert 'authorization' in response.request.headers
 page.wait_for_url('**/itinerary');expect(page.get_by_text('Base Hotel:',exact=False)).to_be_visible();report['tripId']=dto['trip']['id'];report['checks'].append('Real authorized create/generate queries and persisted attractions render')
 page.reload();expect(page.get_by_text('Base Hotel:',exact=False)).to_be_visible();report['checks'].append('Refresh restores authenticated persisted trip')
 for _ in range(2):
  status=page.evaluate("async(id)=>{const r=await fetch('"+api+"/trips/'+id+'/generate-itinerary',{method:'POST',headers:{Authorization:'Bearer '+sessionStorage.getItem('heritage_api_token'),'Content-Type':'application/json'},body:'{}'});return r.status}",dto['trip']['id']);assert status==200
 report['checks'].append('Repeated authenticated generations succeed')
 claims={'sub':dto['trip']['user_id'],'role':'tourist','exp':int(time.time())-60};enc=lambda value:base64.urlsafe_b64encode(json.dumps(value,separators=(',',':')).encode()).rstrip(b'=').decode();body=enc({'alg':'HS256','typ':'JWT'})+'.'+enc(claims);expired=body+'.'+base64.urlsafe_b64encode(hmac.new(os.environ['JWT_SECRET'].encode(),body.encode(),hashlib.sha256).digest()).rstrip(b'=').decode()
 page.get_by_role('button',name='Plan Itinerary',exact=True).first.click();page.get_by_role('button',name='Continue to Logistics').click();page.get_by_role('button',name='Review Plan').click();page.evaluate('(token)=>sessionStorage.setItem("heritage_api_token",token)',expired)
 page.get_by_role('button',name='Generate Circular Plan').click();page.wait_for_url('**/login');expect(page.get_by_text('Sign in to generate your itinerary.',exact=False)).to_be_visible();assert page.evaluate('sessionStorage.getItem("heritage_api_token")') is None;report['checks'].append('Expired signed JWT rejected and reauthentication preserves draft')
 assert context.request.post(api+'/trips',data={}).status==401
 assert context.request.post(api+'/trips',headers={'Authorization':'Bearer forged'},data={}).status==401
 report['checks'].append('Missing and forged tokens remain rejected by backend')
 browser.close()
report['verified']=True;Path('reports/itinerary-auth-browser.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
