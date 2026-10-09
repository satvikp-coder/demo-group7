"""Installed localhost smoke: public reads and guest handoff only; no account/data writes."""
import json,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
report={'verified':False,'writes':[],'pageErrors':[],'checks':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 page=browser.new_page(viewport={'width':1280,'height':720})
 page.on('request',lambda r:report['writes'].append({'method':r.method,'url':r.url}) if r.method in ['POST','PUT','PATCH','DELETE'] else None)
 page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
 page.goto('http://localhost:8080',wait_until='networkidle')
 page.get_by_role('button',name='Plan Itinerary',exact=True).first.click()
 page.get_by_role('button',name=re.compile('^Ahmedabad')).click()
 page.get_by_role('button',name='Continue to Logistics').click()
 page.get_by_role('button',name='Low Cost',exact=True).click()
 select=page.locator('#planner-starting-hotel');expect(select).to_contain_text('Hotel Maruti')
 selected=next(o for o in select.locator('option').evaluate_all('(els)=>els.map(e=>({id:e.value,name:e.textContent}))') if 'Hotel Maruti' in o['name'])
 select.select_option(selected['id']);page.locator('#priority-distance').fill('80')
 assert sum(int(page.locator('#priority-'+k).input_value()) for k in ['distance','cost','rating'])==100
 page.get_by_role('button',name='Decrease trip duration',exact=True).click()
 page.get_by_role('button',name='Review Plan').click()
 page.get_by_role('button',name='Generate Circular Plan').click()
 page.wait_for_url('**/login');expect(page.get_by_text('Sign in to generate your itinerary.',exact=False)).to_be_visible()
 assert not report['writes'] and not report['pageErrors'],report
 page.screenshot(path='reports/itinerary-live-login-handoff.png',full_page=True)
 report['checks']=['Installed production category API exposes added Maruti hotel','720px planner controls and 100% weights work','Guest generation redirects to sign-in without unauthorized POST or database writes']
 report['verified']=True;browser.close()
Path('reports/itinerary-live-readonly.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))
