"""Reproduce real user-facing contract gaps on the isolated audit database."""
import json,os,secrets,sys,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
phase=sys.argv[1];base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL']
report={'phase':phase,'verified':False,'issues':[],'checks':[]}
output=Path('reports/targeted-'+phase+'-browser.json')
def save():output.write_text(json.dumps(report,indent=2),encoding='utf-8')
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True);context=browser.new_context(viewport={'width':1440,'height':1000},service_workers='block');page=context.new_page()
 email='audit-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(24)+'Aa9!'
 page.goto(base+'/register');page.locator('#reg-name').fill('Audit regression');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').nth(0).fill(password);page.locator('input[type=password]').nth(1).fill(password);page.locator('button[type=submit]').click();page.wait_for_timeout(300)
 page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password);page.locator('button[type=submit]').click();page.wait_for_url('**/profile')
 page.get_by_role('button',name='Create New Heritage Route').click();page.locator('[role=dialog]').get_by_role('button',name=__import__('re').compile('^Modhera')).click();page.get_by_role('button',name='Continue to Logistics').click();page.locator('#planner-budget-input').fill('20000');page.locator('[role=dialog] input[type=checkbox]').uncheck();page.get_by_role('button',name='Review Plan').click();page.get_by_role('button',name='Generate Circular Plan').click();page.wait_for_url('**/itinerary')
 expect(page.get_by_text('Base Hotel:',exact=False)).to_be_visible()
 page.get_by_role('button',name='What if?',exact=True).click();page.wait_for_timeout(400)
 # Move the actual controlled slider and submit inside its old 300ms debounce window.
 slider=page.locator('#whatif-budget-slider');slider.fill('20500')
 with page.expect_request(lambda r:r.url==api+'/trips' and r.method=='POST') as created:
  page.get_by_role('button',name='Save this version instead',exact=True).evaluate('(button)=>button.click()')
 body=created.value.post_data_json;report['rapidSave']={'selectedBudget':20500,'sentBudget':body['budget']};save()
 if phase=='before':
  report['issues'].append({'id':'AUD-003','reproduced':body['budget']!=20500,'description':'Immediate What If save submits the previous debounced budget.'})
 else:assert body['budget']==20500
 page.wait_for_timeout(600);expect(page.get_by_text('Base Hotel:',exact=False)).to_be_visible()
 page.get_by_role('button',name='What if?',exact=True).click()
 panelText=page.locator('body').inner_text();report['oldLiveClaim']='Drag sliders to re-calculate circular greedy route in real time.' in panelText
 if phase=='after':assert not report['oldLiveClaim']
 page.locator('#whatif-budget-slider').fill('20750');report['staleSavedNotice']=page.get_by_role('button',name='Saved Active Plan!',exact=True).count()>0
 if phase=='after':assert not report['staleSavedNotice']
 else:report['issues'].append({'id':'AUD-004','reproduced':report['oldLiveClaim'] or report['staleSavedNotice'],'description':'Claims live recomputation / shows saved status for subsequently unsaved parameters.'})
 page.get_by_role('button',name='What if?',exact=True).click()
 page.get_by_role('button',name='Copy private trip link').click();modal=page.locator('[role=dialog][aria-labelledby=share-itinerary-title]');text=modal.inner_text();report['shareText']=text
 report['shareAccessibleNameValid']=modal.evaluate('(node)=>!!document.getElementById(node.getAttribute("aria-labelledby"))');save()
 if phase=='after':assert 'owner' in text.lower() and 'sign' in text.lower() and report['shareAccessibleNameValid']
 else:report['issues'].append({'id':'AUD-005','reproduced':'owner' not in text.lower(),'description':'Share link copy promises a complete recipient itinerary without stating owner authentication.'})
 report['checks'].append('Actual slider action, real POST payload and existing share dialog reviewed')
 browser.close()
report['verified']=True;save();print(json.dumps(report,indent=2))
