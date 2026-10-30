"""Production widget through the authenticated backend; --failure requires a mocked upstream 401."""
import json,secrets,subprocess,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect

ROOT=Path(__file__).resolve().parents[2]
BASE='http://localhost:3000'
failure='--failure' in sys.argv
mocked_success='--mocked-success' in sys.argv
report={'mode':'mocked-401' if failure else 'mocked-success' if mocked_success else 'live-route','verified':False}
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 context=browser.new_context(service_workers='block');page=context.new_page();user_id=None;errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("localStorage.setItem('heritage_pwa_prompt_dismissed_v1','true')")
 try:
  email=f'provider-check-{time.time_ns()}@example.com';password=secrets.token_urlsafe(20)+'Aa9!'
  registration=context.request.post(BASE+'/api/auth/register',data={'name':'Browser Verification','email':email,'password':password})
  assert registration.status==201
  user_id=registration.json()['user']['id']
  page.goto(BASE+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password)
  page.locator('button[type=submit]').click();page.wait_for_url('**/profile')
  page.get_by_role('button',name='Open Heritage Guide',exact=True).click()
  panel=page.locator('#heritage-guide-panel');expect(panel).to_be_visible()
  textbox=panel.get_by_role('textbox',name='Ask Heritage Guide',exact=True)
  textbox.fill('What does Budget mean?')
  with page.expect_response(lambda r:r.url==BASE+'/api/chat' and r.request.method=='POST',timeout=25000) as pending:
   textbox.press('Enter')
  response=pending.value;body=response.json()
  print(str(response.status)+' '+body.get('reply','')[:100],flush=True)
  report.update(status=response.status,requestKeys=sorted(response.request.post_data_json),responseKeys=sorted(body))
  if failure:
   assert response.status==503
   expect(panel.get_by_role('alert')).to_contain_text('temporarily unavailable')
   expect(textbox).to_be_enabled()
   report['friendlyError']=True
  else:
   assert response.status==200 and body.get('mode')=='ai' and body.get('reply')
   expect(panel.locator('[data-chat-role=assistant]').last).to_have_text(body['reply'])
  assert not errors
  report.update(verified=True,pageErrors=0)
 finally:
  browser.close()
  if user_id:
   subprocess.run(['node','--input-type=module','-e',"import {pool} from './backend/config/database.js';await pool.query('DELETE FROM users WHERE id=$1',[process.argv[1]]);await pool.end();",user_id],cwd=ROOT,check=True)
  (ROOT/('backend/reports/nvidia-widget-failure.txt' if failure else 'backend/reports/nvidia-widget-mocked.txt' if mocked_success else 'backend/reports/nvidia-widget-live.txt')).write_text(json.dumps(report,indent=2),encoding='utf-8')
