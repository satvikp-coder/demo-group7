import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRONTEND_TEST_URL','http://localhost:3000')
report={'verified':True,'checks':[]}
with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    page=browser.new_page(service_workers='block')
    for slug,name in [('modhera','Modhera Sun Temple'),('gir-national-park','Gir Jungle Safari (Sinh Sadan reporting point)'),('saputara','Saputara Lake'),('rann-of-kutch','Kalo Dungar')]:
        page.goto(base+'/destination/'+slug)
        expect(page.get_by_text(name,exact=True).first).to_be_visible()
        text=page.locator('body').inner_text()
        passed='NaN' not in text and 'Infinity' not in text
        report['checks'].append({'city':slug,'passed':passed,'unknownLabelVisible':'Not available' in text})
        report['verified']=report['verified'] and passed
    browser.close()
Path('backend/reports/completion-display-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
if not report['verified']: raise SystemExit(1)
