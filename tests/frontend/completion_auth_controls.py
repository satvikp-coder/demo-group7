import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
report={'verified':False,'checks':[]}
with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    page=browser.new_page(service_workers='block')
    page.goto('http://localhost:3000/login')
    page.get_by_role('button',name='Show password',exact=True).click()
    expect(page.locator('#login-password')).to_have_attribute('type','text')
    page.get_by_role('button',name='Hide password',exact=True).click()
    expect(page.locator('#login-password')).to_have_attribute('type','password')
    report['checks'].append({'name':'Login password visibility','passed':True})
    page.get_by_role('button',name='Forgot password?',exact=True).click()
    expect(page.get_by_text('Password Reset Unavailable',exact=True)).to_be_visible()
    page.get_by_role('button',name='Dismiss notice',exact=True).click()
    expect(page.get_by_text('Password Reset Unavailable',exact=True)).to_have_count(0)
    report['checks'].append({'name':'Recovery control honestly explains missing reset/email endpoints; dismiss works','passed':True})
    page.get_by_role('button',name='Register here',exact=True).click()
    operator=page.get_by_role('button',name=re.compile('^Tour operator'))
    operator.click()
    expect(operator).to_have_class(re.compile('.*border-gold.*'))
    tourist=page.get_by_role('button',name=re.compile('^Tourist'))
    tourist.click()
    expect(tourist).to_have_class(re.compile('.*border-gold.*'))
    page.get_by_role('button',name='Log in here',exact=True).click()
    expect(page.locator('#login-password')).to_be_visible()
    page.get_by_role('button',name='Register',exact=True).click()
    expect(page.locator('#reg-name')).to_be_visible()
    page.get_by_role('button',name='Log In',exact=True).click()
    expect(page.locator('#login-password')).to_be_visible()
    report['checks'].append({'name':'Both auth modes and role selections','passed':True})
    for name in ['Back to Destinations','Continue as guest']:
        page.goto('http://localhost:3000/login')
        page.get_by_role('button',name=name,exact=True).click()
        assert '/login' not in page.url
    page.goto('http://localhost:3000/login')
    page.get_by_role('button',name=re.compile('^Continue as guest')).last.click()
    assert '/login' not in page.url
    report['checks'].append({'name':'All guest/back actions','passed':True})
    report['verified']=True
    browser.close()
Path('backend/reports/completion-auth-controls.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
