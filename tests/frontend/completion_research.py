import json,os,secrets,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRONTEND_TEST_URL','http://localhost:3000')
api=os.environ.get('API_TEST_URL','http://localhost:5000/api')
out=Path('backend/reports/completion-research-browser-report.json')
report={'verified':False,'users':[],'checks':[],'pageErrors':[]}
def save(): out.write_text(json.dumps(report,indent=2),encoding='utf-8')
save()
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        context=browser.new_context(service_workers='block')
        page=context.new_page()
        page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
        email='completion-research-'+str(time.time_ns())+'@example.com'
        password=secrets.token_urlsafe(20)+'Aa9!'
        created=context.request.post(api+'/auth/register',data={'name':'Research fixture','email':email,'password':password,'role':'tourist'})
        assert created.status==201
        report['users'].append(created.json()['user']['id']);save()
        page.goto(base+'/login')
        page.locator('input[type=email]').fill(email)
        page.locator('input[type=password]').fill(password)
        page.locator('button[type=submit]').click()
        page.wait_for_url('**/profile')
        page.goto(base+'/research')
        page.get_by_role('button',name='Run Simulation Matrix',exact=True).click()
        expect(page.locator('tbody tr')).to_have_count(22,timeout=60000)
        assert len(page.evaluate("JSON.parse(sessionStorage.getItem('heritage_api_trip_ids'))"))==22
        report['checks'].append({'name':'Research UI creates and displays 22 actual persisted server plans','passed':True})
        prompt=page.get_by_role('dialog',name='Add Heritage Tourism Planner to Home Screen',exact=True)
        if prompt.count(): prompt.get_by_role('button',name='Maybe Later',exact=True).click()
        context.grant_permissions(['clipboard-read','clipboard-write'])
        page.get_by_role('button',name='Copy JSON',exact=True).click()
        expect(page.get_by_role('button',name='Copied JSON!',exact=True)).to_be_visible()
        page.wait_for_timeout(2200)
        page.evaluate("() => { navigator.clipboard.writeText=async()=>{throw Error('Clipboard denied test')}; }")
        messages=[]
        def dismiss(d): messages.append(d.message);d.accept()
        page.once('dialog',dismiss)
        page.get_by_role('button',name='Copy JSON',exact=True).click()
        assert messages and 'Unable to copy' in messages[0]
        report['checks'].append({'name':'Research copy succeeds and denied copy reports failure','passed':True})
        page.get_by_role('button',name='Back to main app',exact=True).click()
        assert '/research' not in page.url
        report['checks'].append({'name':'Research Back navigation','passed':True})
        assert not report['pageErrors'],report['pageErrors']
        report['verified']=True
        browser.close()
except Exception as e: report['failure']=str(e);raise
finally: save()
