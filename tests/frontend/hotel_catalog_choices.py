"""Read-only full-destination dropdown/API parity; never invent extra hotel choices."""
import json,os,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRONTEND_TEST_URL','http://localhost:8080');api=os.environ.get('API_TEST_URL',base+'/api')
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True);ctx=browser.new_context(viewport={'width':1440,'height':900});page=ctx.new_page();errors=[];writes=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:writes.append(r.url) if r.method in ['POST','PUT','PATCH','DELETE'] else None)
 cities=ctx.request.get(api+'/destinations').json()
 if isinstance(cities,dict):cities=cities.get('data',cities.get('destinations'))
 for city in cities:
  page.goto(base,wait_until='domcontentloaded');page.get_by_role('button',name='Start planning',exact=True).click();page.get_by_role('button',name=re.compile('^'+re.escape(city['name']))).click();page.get_by_role('button',name='Continue to Logistics').click()
  row={'destination':city['name'],'categories':{}}
  all_hotels=ctx.request.get(api+'/destinations/'+city['id']+'/hotels').json();row['allRecordedHotels']=len(all_hotels);row['unknownPriceHotels']=sum(h['price_per_night'] is None for h in all_hotels)
  for category in ['Low Cost','Budget','Premium']:
   expected=ctx.request.get(api+'/destinations/'+city['id']+'/hotels',params={'category':category}).json()
   page.get_by_role('button',name=category,exact=True).click()
   select=page.locator('#planner-starting-hotel')
   page.wait_for_function('(ids)=>{const s=document.querySelector("#planner-starting-hotel");return s&&JSON.stringify(Array.from(s.options).map(o=>o.value).filter(Boolean).sort())===JSON.stringify(ids.sort())}',arg=[h['id'] for h in expected])
   assert all(h['hotel_category']==category for h in expected)
   if expected:
    expect(select).to_be_enabled();select.select_option(expected[0]['id']);assert select.input_value()==expected[0]['id']
   else:expect(select).to_be_disabled();expect(page.get_by_role('status').filter(has_text='No '+category)).to_be_visible()
   row['categories'][category]=len(expected)
   if city['slug']=='dwarka' and category=='Budget':page.screenshot(path='reports/phase3-dwarka-hotel-options.png')
  results.append(row);page.get_by_role('button',name='Close trip planner',exact=True).click()
 assert not errors and not writes;browser.close()
Path('reports/phase3-hotel-choice-matrix.json').write_text(json.dumps({'verified':True,'results':results,'pageErrors':errors,'writes':writes},indent=2),encoding='utf-8')
print(json.dumps(results))
