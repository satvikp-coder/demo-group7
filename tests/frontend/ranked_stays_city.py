"""Read-only Ranked Stays city switching against real catalog and hotel APIs."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRONTEND_TEST_URL','http://localhost:8080')
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  context=browser.new_context(viewport={'width':width,'height':900});page=context.new_page();errors=[];writes=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:writes.append(r.method) if r.method in ['POST','PUT','PATCH','DELETE'] else None)
  page.goto(base+'/hotels',wait_until='domcontentloaded')
  selector=page.get_by_label('Select city',exact=True);expect(selector).to_be_visible()
  options=selector.locator('option').evaluate_all('(els)=>els.map(e=>({id:e.value,name:e.textContent}))');assert len(options)==8
  # Select every city, comparing rendered property identities against actual API rows.
  for city in options:
   selector.select_option(city['id'])
   expect(page.get_by_role('heading',level=1)).to_contain_text(city['name'])
   response=page.request.get(base+'/api/destinations/'+city['id']+'/hotels?sort=value');assert response.ok
   rows=response.json()
   expect(page.locator('h3')).to_have_count(len(rows))
   assert sorted(page.locator('h3').all_text_contents())==sorted(r['name'] for r in rows)
   for category in ['Low Cost','Budget','Premium']:
    page.get_by_role('button',name=category,exact=True).click()
    response=page.request.get(base+'/api/destinations/'+city['id']+'/hotels?sort=value&category='+category.replace(' ','%20'));assert response.ok
    matching=response.json();expect(page.locator('h3')).to_have_count(len(matching))
    assert sorted(page.locator('h3').all_text_contents())==sorted(r['name'] for r in matching)
   page.get_by_role('button',name='All categories',exact=True).click()
   expect(page.locator('h3')).to_have_count(len(rows))
   results.append({'width':width,'city':city['name'],'allHotels':len(rows),'categoriesVerified':3})
  # Controlled request failure: selector stays usable and another city recovers
  # using its real backend response, rather than cached previous-city cards.
  page.route('**/api/destinations/*/hotels?**',lambda route:route.fulfill(status=503,content_type='application/json',body='{"error":"Test-only service unavailable"}'),times=1)
  selector.select_option(options[0]['id'])
  expect(page.get_by_role('alert')).to_be_visible()
  expect(selector).to_be_visible()
  expect(page.locator('h3')).to_have_count(0)
  selector.select_option(options[1]['id'])
  expect(page.locator('h3').first).to_be_visible()
  expect(page.get_by_role('alert')).to_have_count(0)
  assert not errors and not writes
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.screenshot(path=f'reports/ranked-stays-city-{width}.png')
  context.close()
 browser.close()
Path('reports/ranked-stays-city-tests.json').write_text(json.dumps({'passed':True,'cases':results,'databaseWrites':0},indent=2),encoding='utf-8')
print('PASS: 24 city/viewport cases and 72 category comparisons; no database writes')
