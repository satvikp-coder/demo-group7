"""Real browser platform behavior; no simulated tourism responses."""
import json,os,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base=os.environ.get('FRONTEND_TEST_URL','http://localhost:3000')
report={'checkedAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'checks':[],'verified':False}
def check(name,**details): report['checks'].append({'name':name,'passed':True,**details})
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        context=browser.new_context(service_workers='allow')
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.goto(base+'/explore')
        expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(8)
        page.evaluate('async () => { await navigator.serviceWorker.ready; }')
        page.reload()
        assert page.evaluate('Boolean(navigator.serviceWorker.controller)')
        check('Production service worker installs and controls the page')
        voice=page.get_by_role('button',name='Search by voice',exact=True)
        if voice.count():
            voice.click()
            expect(page.locator('[aria-live=polite]').filter(has_text='Speech recognition error:')).to_be_visible(timeout=20000)
            expect(page.get_by_role('button',name='Search by voice',exact=True)).to_be_visible()
            check('Real speech permission/network failure exits listening and announces the error',limitation='Successful microphone transcription requires real audio/platform support and was not certified')
        else: check('Unsupported speech capability omits voice control',limitation='Successful microphone transcription not certified')
        context.set_offline(True)
        page.reload()
        expect(page.get_by_text('Gujarat Heritage Directory',exact=True)).to_be_visible()
        expect(page.get_by_role('alert').filter(has_text='Unable to reach the server').first).to_be_visible()
        expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(0)
        check('Cached production shell reloads offline; API failure shows error and no invented catalog')
        context.set_offline(False)
        page.reload()
        expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(8)
        check('Online recovery reloads the real eight-city catalog')
        assert not errors,errors
        report['pageErrors']=errors
        report['verified']=True
        browser.close()
except Exception as e:
    report['failure']=str(e)
    raise
finally:
    Path('backend/reports/completion-platform-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps({'verified':report['verified'],'checks':len(report['checks'])}))
