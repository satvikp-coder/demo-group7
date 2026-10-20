"""Read-only installed catalog/browser verification; never creates accounts/trips."""
import json,os,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRONTEND_TEST_URL','http://localhost:8080')
manifest=json.loads(Path('data/attraction-20261020/catalog-20261020.json').read_text(encoding='utf-8'))
report={'verified':False,'read_only':True,'cases':[],'page_errors':[],'api_failures':[],'writes':[],'external_failures':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  ctx=browser.new_context(viewport={'width':width,'height':950});ctx.add_init_script("localStorage.setItem('heritage_pwa_prompt_dismissed_v1','1')");page=ctx.new_page()
  page.on('pageerror',lambda e:report['page_errors'].append(str(e)))
  page.on('request',lambda r:report['writes'].append(r.url) if r.method not in ['GET','HEAD','OPTIONS'] and '/api/' in r.url else None)
  page.on('response',lambda r:report['api_failures'].append({'url':r.url,'status':r.status}) if '/api/' in r.url and r.status>=400 else None)
  page.on('requestfailed',lambda r:report['external_failures'].append({'url':r.url,'failure':r.failure}))
  cities=ctx.request.get(base+'/api/destinations').json();assert len(cities)==8
  for city in cities:
   additions=[r for r in manifest['records'] if r['city']==city['slug']]
   response=ctx.request.get(base+'/api/destinations/'+city['id']+'/attractions');assert response.status==200;rows=response.json()
   assert all(any(a['name']==r['values']['name'] and a['entry_fee_numeric'] is None for a in rows) for r in additions)
   page.goto(base+'/destination/'+city['id'],wait_until='domcontentloaded')
   expect(page.get_by_role('heading',name='Key Monuments in and around '+city['name'],exact=True)).to_be_visible()
   for row in additions:expect(page.get_by_role('heading',level=4,name=row['values']['name'],exact=True)).to_have_count(1)
   page.locator('img').evaluate_all('(es)=>es.forEach(e=>e.loading="eager")')
   deadline=time.monotonic()+20
   while time.monotonic()<deadline:
    if page.evaluate('() => Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)'):break
    page.wait_for_timeout(100)
   assert page.evaluate('() => Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)'),city['name']
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),city['name']
   if city['slug']=='rann-of-kutch':
    page.get_by_role('heading',name='Aina Mahal',exact=True).scroll_into_view_if_needed();page.screenshot(path='reports/attraction-installed-'+str(width)+'.png')
    page.locator('button[aria-label="Switch to Hindi"]:visible').first.click()
    expect(page.get_by_text('\u0915\u094d\u0937\u0947\u0924\u094d\u0930 \u0915\u0947 \u0938\u094d\u092e\u093e\u0930\u0915 \u0914\u0930 \u0906\u0915\u0930\u094d\u0937\u0923',exact=True)).to_be_visible()
    page.locator('button[aria-label="Switch to English"]:visible').first.click()
   report['cases'].append({'city':city['name'],'width':width,'records':len(rows),'new_records_rendered':len(additions),'decoded_images':page.locator('img').count(),'passed':True})
  ctx.close()
 browser.close()
assert not report['page_errors'] and not report['api_failures'] and not report['writes'],report
report['verified']=True;Path('reports/attraction-installed-readonly.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
