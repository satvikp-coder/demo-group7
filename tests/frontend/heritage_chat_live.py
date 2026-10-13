"""Opt-in actual Groq through browser -> authenticated API -> isolated PostgreSQL."""
import os,json,time,secrets
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL']
assert ':5310/' in api
time.sleep(62)  # Stay within free tokens/minute after preceding live question set.
report={'provider':'LIVE_GROQ','verified':False,'questions':[]}
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(channel='chrome',headless=True)
  ctx=browser.new_context(viewport={'width':1440,'height':950});page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  email='live-chat-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(20)+'Aa9!'
  assert ctx.request.post(api+'/auth/register',data={'name':'Isolated live guide','email':email,'password':password,'role':'tourist'}).status==201
  page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password)
  page.locator('button[type=submit]').click();page.wait_for_url('**/profile')
  assert not page.locator('#heritage-guide-panel').count()
  page.get_by_role('button',name='Open Heritage Guide').click();panel=page.locator('#heritage-guide-panel')
  for index,question in enumerate(['Tell me about Modhera.','What are the attractions there?']):
   if index:time.sleep(62)
   field=panel.get_by_role('textbox',name='Ask Heritage Guide');field.fill(question)
   with page.expect_response(lambda r:r.url.endswith('/api/chat') and r.request.method=='POST',timeout=30000) as received:field.press('Enter')
   response=received.value;assert response.status==200
   payload=response.json();assert payload['mode']=='ai' and payload['history_token']
   expect(panel.locator('[data-chat-role=assistant]').last).to_contain_text('Modhera')
   assert 'TEST PROVIDER' not in payload['reply']
   if index:assert 'Sun Temple' in payload['reply']
   report['questions'].append({'question':question,'reply':payload['reply'],'status':response.status})
  assert not errors;assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  page.screenshot(path='reports/heritage-guide-live-browser.png')
  panel.get_by_role('button',name='Close Heritage Guide').click()
  expect(page.get_by_role('button',name='Open Heritage Guide')).to_be_focused()
  page.goto(base+'/explore');expect(page.get_by_role('button',name='Open Heritage Guide')).to_be_visible()
  assert not page.locator('#heritage-guide-panel').is_visible()
  report.update(verified=True,consoleErrors=errors,viewport=1440)
  browser.close()
finally:
 Path('reports/heritage-guide-live-browser.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
