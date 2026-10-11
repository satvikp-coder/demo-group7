"""Sourced occupancy validation in real planner, no accounts or database writes."""
import os,json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRONTEND_TEST_URL','http://localhost:8080');results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  ctx=browser.new_context(viewport={'width':width,'height':900});page=ctx.new_page();errors=[];writes=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:writes.append(r.url) if r.method in ['POST','PUT','PATCH','DELETE'] else None)
  page.goto(base);page.get_by_role('button',name='Start planning',exact=True).click()
  page.get_by_role('button',name=re.compile('^Champaner')).click();page.get_by_role('button',name='Continue to Logistics').click()
  page.get_by_role('button',name='Low Cost',exact=True).click()
  chooser=page.locator('#planner-starting-hotel');expect(chooser).to_contain_text('Hotel Rajdhani')
  hotel=next(o for o in chooser.locator('option').evaluate_all('(es)=>es.map(e=>({id:e.value,name:e.textContent}))') if 'Hotel Rajdhani' in o['name'])
  chooser.select_option(hotel['id']);page.locator('#planner-budget-input').fill('30000')
  page.get_by_role('button',name='Review Plan').click();page.get_by_role('button',name='Generate Circular Plan').click()
  expect(page.get_by_role('alert')).to_contain_text('at least 2 guests');assert not writes
  page.get_by_label('Travelers',exact=True).fill('3')
  page.get_by_role('button',name='Review Plan').click();page.get_by_role('button',name='Generate Circular Plan').click()
  expect(page.get_by_role('alert')).to_contain_text('at least 2 rooms');assert not writes
  page.get_by_label('Rooms',exact=True).fill('2')
  page.get_by_role('button',name='Review Plan').click();page.get_by_role('button',name='Generate Circular Plan').click()
  page.wait_for_url('**/login');assert not writes and not errors
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  results.append({'width':width,'minimumGuestsChecked':True,'roomCapacityChecked':True,'validGuestLoginHandoff':True,'writes':writes,'errors':errors});ctx.close()
 browser.close()
Path('reports/hotel-guest-browser-tests.json').write_text(json.dumps({'verified':True,'results':results},indent=2),encoding='utf-8')
print('Sourced hotel guest/room preflight and login handoff: 3 viewport cases PASS')
