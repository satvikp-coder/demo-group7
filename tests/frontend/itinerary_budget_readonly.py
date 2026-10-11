"""Reproduce the reported House of MG inputs in an isolated account and recover honestly."""
import os,json,secrets,time,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base='http://localhost:8080';results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  ctx=browser.new_context(viewport={'width':width,'height':900});page=ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
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
  page.screenshot(path=f'reports/phase3-installed-budget-explanation-{width}.png')
  # Explicit user correction, never automatic relaxation or hotel replacement.
  page.get_by_label('Lodging nights',exact=True).fill('1');page.get_by_role('button',name='Review Plan').click()
  page.get_by_role('button',name='Generate Circular Plan').click();page.wait_for_url('**/login*')
  assert not writes and not errors
  results.append({'width':width,'installedPreflight':True,'rejectedBeforeWrite':True,'correctedGuestHandoff':True});ctx.close()
 browser.close()
Path('reports/phase3-installed-budget-check.json').write_text(json.dumps({'verified':True,'results':results},indent=2),encoding='utf-8')
print('Installed read-only budget rejection and guest handoff: 3 viewport journeys PASS')
