"""Distinguish bounded overlapping catalog reads from runtime request loops."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRONTEND_TEST_URL','http://localhost:3000')
api=os.environ.get('API_TEST_URL','http://localhost:5000/api')
report={'verified':False,'checks':[]}
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        page=browser.new_page(service_workers='block')
        calls=[]
        page.on('request',lambda r:calls.append(r.url) if r.url.startswith(api) else None)
        for route in ['/explore','/destination/ahmedabad','/hotels']:
            start=len(calls)
            page.goto(base+route)
            if route=='/explore': expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(8)
            elif route=='/hotels': expect(page.get_by_role('button',name='Lowest Price',exact=True)).to_be_visible()
            else: expect(page.get_by_text('Sabarmati Ashram',exact=True).first).to_be_visible()
            page.wait_for_timeout(1500)
            settled=len(calls)
            page.wait_for_timeout(3000)
            idle=len(calls)-settled
            report['checks'].append({'route':route,'initialApiReads':settled-start,'requestsWhileIdle':idle,'passed':idle==0})
            assert idle==0,'Unexpected runtime request loop: '+route
        report['verified']=True
        browser.close()
finally:
    Path('backend/reports/completion-idle-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report))
