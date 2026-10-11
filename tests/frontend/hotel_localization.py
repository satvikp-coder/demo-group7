"""Real category GETs, language controls and keyboard sorting; no account/data writes."""
import json,os,re
from pathlib import Path
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect

base=os.environ.get('FRONTEND_TEST_URL','http://localhost:8080')
languages=[
 ('en',None,'Start planning','Continue to Logistics','Low Cost','Budget','Order matching hotels','Select Hotel'),
 ('hi','Switch to Hindi','योजना शुरू करें','लॉजिस्टिक्स की ओर बढ़ें','कम लागत','बजट','मिलते-जुलते होटलों का क्रम','होटल चुनें'),
 ('gu','Switch to Gujarati','આયોજન શરૂ કરો','Continue to Logistics','ઓછી કિંમત','બજેટ','મેળ ખાતી હોટેલોનો ક્રમ','હોટેલ પસંદ કરો'),
]
results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  for language,switch,start,continue_label,low,budget,order,select in languages:
   context=browser.new_context(viewport={'width':width,'height':900});page=context.new_page();errors=[];writes=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('request',lambda r:writes.append(r.method) if r.method in ['POST','PUT','PATCH','DELETE'] else None)
   page.goto(base,wait_until='domcontentloaded')
   if switch:page.get_by_role('button',name=switch,exact=True).first.click()
   expect(page.locator('html')).to_have_attribute('lang',language)
   page.get_by_role('button',name=start,exact=True).click()
   page.get_by_role('button',name=re.compile('Modhera|मोढेरा|मोडेरा|મોઢેરા')).click()
   page.get_by_role('button',name=continue_label,exact=True).click()
   traveler_label={'en':'Travelers','hi':'यात्री','gu':'પ્રવાસીઓ'}[language]
   nights_label={'en':'Lodging nights','hi':'ठहरने की रातें','gu':'રોકાણની રાતો'}[language]
   expect(page.get_by_label(traveler_label,exact=True)).to_have_value('1')
   expect(page.get_by_label(nights_label,exact=True)).to_have_value('1')
   def category_response(r,value):
    return '/hotels' in r.url and parse_qs(urlparse(r.url).query).get('category')==[value]
   # New sourced Low Cost hotel can legitimately become the initial category.
   # Move to Budget first so the Low Cost click actually changes request keys.
   if page.get_by_role('button',name=low,exact=True).get_attribute('aria-pressed')=='true':
    with page.expect_response(lambda r:category_response(r,'Budget')):
     page.get_by_role('button',name=budget,exact=True).click()
   with page.expect_response(lambda r:category_response(r,'Low Cost')) as response:
    page.get_by_role('button',name=low,exact=True).click()
   low_rows=response.value.json();assert response.value.status==200
   assert all(h['hotel_category']=='Low Cost' for h in low_rows)
   if low_rows:
    chooser=page.locator('#planner-starting-hotel');expect(chooser).to_be_enabled();chooser.select_option(low_rows[0]['id'])
    assert chooser.input_value()==low_rows[0]['id']
   else:
    expect(page.locator('#planner-starting-hotel')).to_be_disabled()
    expect(page.get_by_role('status').filter(has_text=low)).to_be_visible()
   with page.expect_response(lambda r:category_response(r,'Budget')) as response:
    page.get_by_role('button',name=budget,exact=True).click()
   rows=response.value.json();assert response.value.status==200 and rows
   assert all(h['hotel_category']=='Budget' for h in rows)
   chooser=page.locator('#planner-starting-hotel');expect(chooser).to_be_enabled();chooser.select_option(rows[0]['id'])
   assert chooser.input_value()==rows[0]['id']
   ordering=page.get_by_label(order,exact=True);ordering.focus();ordering.select_option('price')
   expect(page.get_by_role('button',name=budget,exact=True)).to_have_attribute('aria-pressed','true')
   expect(page.locator('label[for="planner-starting-hotel"]').filter(has_text=select)).to_have_text(select)
   assert not errors and not writes
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   page.screenshot(path=f'reports/phase3-hotel-{language}-{width}.png')
   results.append({'language':language,'width':width,'apiCategoriesUnchanged':True,'categoryResultHandling':True,'lowCostChoices':len(low_rows),'emptyStateTested':not bool(low_rows),'selectedDatabaseId':True,'translatedLabels':True,'pageErrors':errors,'writes':writes})
   context.close()
 browser.close()
Path('reports/phase3-hotel-localization.json').write_text(json.dumps({'verified':True,'results':results},indent=2),encoding='utf-8')
print('Hotel localization: 9 real browser language/viewport scenarios PASS')
