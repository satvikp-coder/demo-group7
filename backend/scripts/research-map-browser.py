import sys,json,pathlib,datetime
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 browser=p.chromium.launch(channel='chrome',headless=True)
 page=browser.new_page()
 page.goto(sys.argv[1],wait_until='domcontentloaded',timeout=45000)
 page.wait_for_timeout(6000)
 if len(sys.argv)>3:
  page.get_by_role('link',name=sys.argv[3],exact=True).first.click()
  page.wait_for_timeout(3000)
 result={'requested':sys.argv[1],'url':page.url,'checked':datetime.datetime.now(datetime.timezone.utc).isoformat(),'text':page.locator('body').inner_text()[:18000]}
 folder=pathlib.Path(__file__).resolve().parents[2]/'data/research/pages'
 path=folder/(sys.argv[2]+'.json');path.write_text(json.dumps(result,indent=2),encoding='utf-8')
 print(json.dumps(result,ensure_ascii=True)[:14000]);browser.close()
