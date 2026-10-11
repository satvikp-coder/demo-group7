"""Isolated real production-preview PDF reproduction; no live accounts or bookings."""
import os,secrets,time,json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ['FRONTEND_TEST_URL'];api=os.environ['API_TEST_URL'];assert api=='http://localhost:5310/api'
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True);ctx=browser.new_context(viewport={'width':1440,'height':900});page=ctx.new_page()
 page.on('console',lambda m:print(json.dumps({'type':m.type,'text':m.text},ensure_ascii=True),flush=True) if 'itinerary-pdf' in m.text or m.type=='error' else None)
 email='pdf-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(24)+'Aa9!'
 assert ctx.request.post(api+'/auth/register',data={'name':'Isolated PDF test','email':email,'password':password,'role':'tourist'}).status==201
 page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password);page.locator('button[type=submit]').click();page.wait_for_url('**/profile');page.goto(base)
 page.get_by_role('button',name='Start planning',exact=True).click();page.get_by_role('button',name=re.compile('^Saputara')).click();page.get_by_role('button',name='Continue to Logistics').click();page.get_by_role('button',name='Premium',exact=True).click()
 select=page.locator('#planner-starting-hotel');expect(select).to_contain_text('Aakar');select.select_option(index=1)
 page.locator('#planner-budget-input').fill('20000');page.get_by_role('button',name='Review Plan').click()
 with page.expect_response(lambda r:'/generate-itinerary' in r.url) as generated:page.get_by_role('button',name='Generate Circular Plan').click()
 assert generated.value.status==200;page.wait_for_url('**/itinerary');page.reload();expect(page.get_by_text('Base Hotel:',exact=False)).to_be_visible()
 page.get_by_role('button',name='Expand Visualizer',exact=True).click()
 with page.expect_download(timeout=60000) as download:page.get_by_role('button',name='Download PDF Itinerary',exact=True).click()
 data=Path(download.value.path()).read_bytes();assert data.startswith(b'%PDF-') and len(data)>1000
 print('Real PDF download PASS, bytes='+str(len(data)));browser.close()
