import json,sys,re
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
phase=sys.argv[1];base=sys.argv[2] if len(sys.argv)>2 else 'http://localhost:8080';result={'phase':phase,'verified':False,'viewports':[]}
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [390,768,1024,1280,1440]:
  context=browser.new_context(viewport={'width':width,'height':1000});page=context.new_page();page.goto(base+'/destination/dwarka',wait_until='networkidle')
  clipped=page.locator('nav button').evaluate_all("els=>els.filter(e=>e.getClientRects().length).map(e=>({text:e.innerText,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left<0||e.right>innerWidth)")
  row={'width':width,'clippedButtons':clipped}
  if phase=='after':
   assert not clipped,row
   page.get_by_role('button',name='Switch to Hindi',exact=True).click()
   expect(page.get_by_role('button',name='Switch to Hindi',exact=True)).to_have_attribute('aria-pressed','true')
   hindi_clipped=page.locator('nav button').evaluate_all("els=>els.filter(e=>e.getClientRects().length).map(e=>({text:e.innerText,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.left<0||e.right>innerWidth)")
   assert not hindi_clipped,hindi_clipped
   page.get_by_role('button',name='Switch to English',exact=True).click();row['hindiNavigationFit']='passed'
   toggle=page.get_by_role('button',name='Toggle navigation menu',exact=True)
   if width<1024:
    expect(toggle).to_be_visible();toggle.click();page.locator('nav').get_by_role('button',name='Ranked Stays',exact=True).click();expect(page.get_by_role('button',name='Lowest Price',exact=False)).to_be_visible();row['compactNavigation']='passed'
    toggle.click();page.locator('nav').get_by_role('button',name='Plan Itinerary',exact=True).first.click();expect(page.locator('[role=dialog]').last).to_be_visible();row['planButton']='passed'
   else:expect(toggle).not_to_be_visible()
  result['viewports'].append(row);context.close()
 browser.close()
result['verified']=True
Path('reports/responsive-nav-'+phase+'.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
