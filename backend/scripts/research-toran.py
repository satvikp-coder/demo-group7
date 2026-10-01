import json,pathlib
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True);page=b.new_page();page.goto('https://booking.gujarattourism.com/',wait_until='domcontentloaded');page.wait_for_timeout(5000)
 page.get_by_text('Tourist Bungalow, Dwarka',exact=True).click();page.wait_for_timeout(6000)
 result={'url':page.url,'checked':'2026-09-30','text':page.locator('body').inner_text()}
 pathlib.Path('data/research/pages/toran-dwarka-room.json').write_text(json.dumps(result,ensure_ascii=True,indent=2));print(json.dumps(result))
 b.close()
