import json
from pathlib import Path
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True);page=b.new_page();page.goto('http://localhost:8080');page.get_by_role('button',name='Plan Itinerary',exact=True).first.click();page.get_by_role('button',name='Continue to Logistics').click();page.get_by_role('button',name='Review Plan').click()
 with page.expect_response(lambda r:r.url.endswith('/api/trips') and r.request.method=='POST') as response:page.get_by_role('button',name='Generate Circular Plan').click()
 r=response.value;result={'status':r.status,'authorizationPresent':'authorization' in r.request.headers,'response':r.json(),'visibleError':page.get_by_role('alert').inner_text()};Path('reports/auth-itinerary-before.json').write_text(json.dumps(result,indent=2));page.screenshot(path='reports/auth-itinerary-before.png');print(result);b.close()
