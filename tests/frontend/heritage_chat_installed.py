"""Read-only guest checks of the actual installed local Docker application."""
import json
from datetime import datetime,timezone
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
base='http://localhost:8080';results=[]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 for width in [1440,768,390]:
  ctx=browser.new_context(viewport={'width':width,'height':950});page=ctx.new_page();errors=[];chat_requests=[]
  page.on('pageerror',lambda error:errors.append(str(error)))
  page.on('request',lambda request:chat_requests.append(request.url) if '/api/chat' in request.url else None)
  assert ctx.request.get(base+'/ready').json()['status']=='ready'
  rejected=ctx.request.post(base+'/api/chat',data={'message':'Tell me about Modhera.'})
  assert rejected.status==401
  page.goto(base);launcher=page.get_by_role('button',name='Open Heritage Guide',exact=True)
  expect(launcher).to_be_visible();assert not page.locator('#heritage-guide-panel').count()
  launcher.click();panel=page.locator('#heritage-guide-panel');expect(panel).to_be_visible()
  expect(panel.get_by_role('button',name='Sign in to chat')).to_be_visible()
  assert not chat_requests
  bounds=panel.bounding_box();assert bounds['x']>=0 and bounds['y']>=0 and bounds['x']+bounds['width']<=width
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.screenshot(path=f'reports/heritage-guide-installed-{width}.png')
  panel.get_by_role('button',name='Close Heritage Guide').click();expect(launcher).to_be_focused()
  launcher.click();panel.get_by_role('button',name='Sign in to chat').click();page.wait_for_url('**/login')
  assert not page.locator('button[aria-controls="heritage-guide-panel"]').count()
  assert not errors and not chat_requests
  results.append({'viewport':width,'passed':True,'consoleErrors':errors,'providerRequests':0,'authenticationRequired':True})
  ctx.close()
 browser.close()
Path('reports/heritage-guide-installed-browser.json').write_text(json.dumps({'checkedAt':datetime.now(timezone.utc).isoformat(),'verified':True,'readOnly':True,'results':results},indent=2),encoding='utf-8')
