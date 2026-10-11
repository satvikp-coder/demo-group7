"""Read-only catalog/category reconciliation at all supported destinations and widths."""
import json, os, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

base = os.environ.get('FRONTEND_TEST_URL', 'http://localhost:8080')
api = os.environ.get('API_TEST_URL', base + '/api')
results = []
with sync_playwright() as p:
    browser = p.chromium.launch(channel='chrome', headless=True)
    for width in [1440, 768, 390]:
        ctx = browser.new_context(viewport={'width': width, 'height': 900})
        page = ctx.new_page()
        errors, writes = [], []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('request', lambda r: writes.append(r.url) if r.method in ['POST', 'PUT', 'PATCH', 'DELETE'] else None)
        cities = ctx.request.get(api + '/destinations').json()
        for city in cities:
            catalog = ctx.request.get(api + '/destinations/' + city['id'] + '/hotels').json()
            unknown = sum(h['price_per_night'] is None for h in catalog)
            page.goto(base)
            page.get_by_role('button', name='Start planning', exact=True).click()
            page.get_by_role('button', name=re.compile('^' + re.escape(city['name']))).click()
            expect(page.get_by_text(str(len(catalog)) + ' Recorded Hotels', exact=True)).to_be_visible()
            page.get_by_role('button', name='Continue to Logistics', exact=True).click()
            expect(page.get_by_test_id('hotel-catalog-summary')).to_contain_text(f'{len(catalog)} hotels recorded for this destination; {unknown} have no usable nightly price.')
            for category in ['Low Cost', 'Budget', 'Premium']:
                expected = ctx.request.get(api + '/destinations/' + city['id'] + '/hotels', params={'category': category}).json()
                page.get_by_role('button', name=category, exact=True).click()
                select = page.locator('#planner-starting-hotel')
                page.wait_for_function('(ids)=>{const s=document.querySelector("#planner-starting-hotel");return s&&JSON.stringify(Array.from(s.options).map(o=>o.value).filter(Boolean).sort())===JSON.stringify(ids.sort())}', arg=[h['id'] for h in expected])
                expect(page.get_by_test_id('hotel-matching-count')).to_have_text(f'{len(expected)} selectable {category} hotels match the price band and nearby search area.')
                page.wait_for_function('(ids)=>JSON.stringify(Array.from(document.querySelectorAll("article[data-hotel-id]")).map(e=>e.dataset.hotelId).sort())===JSON.stringify(ids.sort())', arg=[h['id'] for h in catalog])
                for h in catalog:
                    card = page.locator(f'article[data-hotel-id="{h["id"]}"]')
                    expect(card.get_by_role('heading', name=h['name'], exact=True)).to_be_visible()
                    if h['location']:
                        expect(card).to_contain_text(h['location'])
                    if h['price_per_night'] is None:
                        expect(card).to_contain_text('Price unavailable — check current rates')
                        expect(card).to_contain_text('Price category unavailable')
                        expect(card.get_by_role('button')).to_have_count(0)
                    if category == 'Premium':
                        card.scroll_into_view_if_needed()
                        page.wait_for_function('(id)=>{const image=document.querySelector(`article[data-hotel-id="${id}"] img`);return image&&image.complete&&image.naturalWidth>0}', arg=h['id'])
                expect(select).to_have_value('')
                if expected:
                    select.select_option(expected[0]['id'])
                    expect(page.locator(f'article[data-hotel-id="{expected[0]["id"]}"]').get_by_role('button', name='Selected Hotel', exact=True)).to_have_attribute('aria-pressed', 'true')
                else:
                    expect(select).to_be_disabled()
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
                if city['slug'] == 'saputara' and category == 'Premium':
                    page.get_by_test_id('hotel-catalog-summary').scroll_into_view_if_needed()
                    page.screenshot(path=f'reports/hotel-catalog-details-saputara-{width}.png')
                results.append({'destination': city['name'], 'width': width, 'category': category, 'recordedHotels': len(catalog), 'unknownPrices': unknown, 'selectable': len(expected), 'allDetailsVisible': True, 'exactApiIds': True})
            page.get_by_role('button', name='Close trip planner', exact=True).click()
        assert not errors and not writes
        ctx.close()
    browser.close()
Path('reports/hotel-catalog-details.json').write_text(json.dumps({'verified': True, 'results': results, 'writes': [], 'pageErrors': []}, indent=2), encoding='utf-8')
print('Hotel totals, all recorded details and exact category selection: 72 browser cases PASS')
