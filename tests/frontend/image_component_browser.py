"""Real shared-component fault regressions on Vite; failures are deliberate fixtures."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
report={'checks':[],'verified':False}
with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    page=browser.new_page()
    page.goto('http://localhost:4310/')
    page.evaluate("async()=>{window.imageHarness=await import('/scripts/image-component-harness.tsx')}")
    image=page.locator('#image-regression-harness img')
    good='/assets/photographs/dwarka-dwarkadhish-temple.webp'
    def render(props):page.evaluate('async(props)=>{window.imageHarness.render(props);await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)}',props)
    def loaded():page.wait_for_function("()=>{const e=document.querySelector('#image-regression-harness img');return e&&e.complete&&e.naturalWidth>0}")
    render({'src':'/assets/missing-fixture.webp','alt':'Fixture','category':'hotel'})
    loaded();expect(image).to_have_attribute('data-image-state','fallback')
    assert '/categories/hotel.svg' in image.get_attribute('src')
    report['checks'].append('Missing primary displays a decoded, explicitly identified category illustration')
    render({'src':good,'alt':'Dwarka','category':'hotel'})
    loaded();expect(image).to_have_attribute('data-image-state','photo')
    report['checks'].append('Same mounted component recovers a valid new source after a previous error')
    page.route('**/html-fixture.webp',lambda route:route.fulfill(status=200,content_type='text/html',body='<html>SPA fallback</html>'))
    render({'src':'/assets/html-fixture.webp','alt':'Fixture'})
    loaded();expect(image).to_have_attribute('data-image-state','fallback')
    report['checks'].append('HTTP 200 HTML is rejected by the browser decoder and falls back')
    page.route('**/assets/categories/*.svg',lambda route:route.abort())
    render({'src':'/assets/missing-fixture.webp','fallbackSrc':'/assets/also-missing.svg','alt':'Fixture','category':'wildlife'})
    expect(image).to_have_attribute('src',__import__('re').compile('^data:image/svg\\+xml,'));loaded();expect(image).to_have_attribute('data-image-state','fallback')
    assert image.get_attribute('src').startswith('data:image/svg+xml,')
    report['checks'].append('Missing custom and category fallbacks reach a self-contained decoded terminal SVG')
    page.unroute('**/assets/categories/*.svg')
    render({'src':good,'srcSet':'/assets/missing-srcset.webp 1x','alt':'Fixture'})
    loaded();expect(image).to_have_attribute('data-image-state','fallback')
    assert image.get_attribute('srcset') is None
    report['checks'].append('Failed srcSet is cleared when rendering a fallback')
    render({'src':good,'alt':'Dwarka'})
    loaded();expect(image).to_have_attribute('data-image-state','photo')
    expect(image).to_have_attribute('data-image-credit','https://commons.wikimedia.org/wiki/File:Dwarakadheesh_Temple,_2014.jpg')
    report['checks'].append('Real photograph state and attribution recover after multiple failure modes')
    page.evaluate('window.imageHarness.dispose()');browser.close()
report['verified']=True
Path('backend/reports/images/component-browser.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
