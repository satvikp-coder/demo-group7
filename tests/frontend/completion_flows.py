"""Additional real-browser coverage for the existing controls and all cities."""
import re
from pathlib import Path
from playwright.sync_api import expect

def run(page, context, base, api, check):
    page.goto(base + '/explore')
    expect(page.get_by_role('button', name='Inspect Site')).to_have_count(8)
    for category, count in [('UNESCO World Heritage Site',2),('Religious Sites',2),('Heritage Sites',1),('Beaches',0),('Bird Watching Sites',0),('Museums',0),('Weekend Get-aways',0)]:
        page.get_by_role('button', name=category, exact=True).click()
        expect(page.get_by_role('button', name='Inspect Site')).to_have_count(count)
    page.get_by_role('button', name='All Categories', exact=True).click()
    for sort in ['alphabetical','fee','distance','demand','rating']:
        page.locator('#sort-dropdown').select_option(sort)
        expect(page.get_by_role('button', name='Inspect Site')).to_have_count(8)
    page.get_by_role('button', name='Wheelchair Accessible', exact=True).click()
    expect(page.get_by_role('button', name='Inspect Site')).to_have_count(1)
    page.get_by_role('button', name='Clear Accessibility', exact=True).click()
    for demand in ['low','moderate','high']:
        page.get_by_role('button', name=demand, exact=True).click()
        expect(page.get_by_role('button', name='Inspect Site')).to_have_count(0)
        page.get_by_role('button', name='Clear Accessibility', exact=True).click()
    check('All discovery categories, sorts, known-accessibility and unknown-demand filters')
    for slug, name in [('ahmedabad','Ahmedabad'),('somnath','Somnath'),('dwarka','Dwarka'),('modhera','Modhera'),('champaner','Champaner'),('gir-national-park','Gir National Park'),('rann-of-kutch','Rann of Kutch'),('saputara','Saputara')]:
        city = context.request.get(api + '/destinations/' + slug).json()
        children = {kind: context.request.get(api + '/destinations/' + city['id'] + '/' + kind).json() for kind in ['attractions','hotels','restaurants']}
        assert all(row['destination_id'] == city['id'] for rows in children.values() for row in rows)
        page.goto(base + '/explore')
        page.get_by_placeholder('Search destinations or districts...').fill(name)
        expect(page.get_by_role('button', name='Inspect Site')).to_have_count(1)
        page.get_by_role('button', name='Inspect Site').click()
        expect(page.get_by_text(children['attractions'][0]['name'], exact=True).first).to_be_visible()
        page.get_by_role('button', name='Plan', exact=True).click()
        expect(page.get_by_role('button', name='Added to Trip Plan', exact=True)).to_be_visible()
        page.get_by_role('button', name='Added to Trip Plan', exact=True).click()
        page.get_by_role('button', name='Build Custom Itinerary', exact=True).click()
        # The clicked destination must win over a previously active itinerary.
        expect(page.locator('[role=dialog]')).to_contain_text(name)
        page.get_by_role('button', name='Continue to Logistics').click()
        hotels = page.locator('#planner-starting-hotel')
        hotel = min(children['hotels'], key=lambda h: h['price_per_night'])
        hotels.select_option(hotel['id'])
        page.locator('[role=dialog] input[type=range]').fill('20000')
        page.locator('[role=dialog] input[type=checkbox]').uncheck()
        page.get_by_role('button', name='Review Plan').click()
        with page.expect_response(lambda r: '/generate-itinerary' in r.url) as response:
            page.get_by_role('button', name='Generate Circular Plan').click()
        dto = response.value.json()
        assert dto['trip']['destination_id'] == city['id']
        assert dto['trip']['starting_hotel_id'] == hotel['id']
        allowed = {r['id'] for rows in children.values() for r in rows}
        for day in dto['days']:
            assert day['stops'][0]['reference_id'] == day['stops'][-1]['reference_id'] == hotel['id']
            assert all(s['reference_id'] in allowed for s in day['stops'])
            assert all(s['arrival_time'] <= s['departure_time'] for s in day['stops'])
            assert all(a['departure_time'] <= b['arrival_time'] for a,b in zip(day['stops'],day['stops'][1:]))
        assert sum(float(s['cost']) for d in dto['days'] for s in d['stops']) == dto['budget']['total']
        page.reload()
        expect(page.get_by_text('Base Hotel: ' + hotel['name'], exact=False)).to_be_visible()
        page.get_by_role('button', name='View budget breakdown', exact=True).click()
        expect(page.get_by_role('button', name='Print Ledger', exact=True)).to_be_visible()
        check('Complete browser city journey: ' + name, attractionVisits=sum(s['stop_type']=='attraction' for d in dto['days'] for s in d['stops']), budget=dto['budget'])
    page.goto(base + '/itinerary')
    page.get_by_role('button', name='Expand Visualizer', exact=True).click()
    expect(page.get_by_role('button', name='Step forward to next step', exact=True)).to_be_visible()
    for label in ['Select start node for route calculation','Select target node for route calculation']:
        select=page.get_by_role('combobox',name=label,exact=True)
        options=select.locator('option').evaluate_all('(els)=>els.map(e=>e.value)')
        select.select_option(options[0])
        select.select_option(options[-1])
    page.get_by_role('button', name='Step forward to next step', exact=True).click()
    page.get_by_role('button', name='Reset algorithm to step 1', exact=True).click()
    page.get_by_role('button', name='Play algorithm execution', exact=True).click()
    page.get_by_role('button', name='Pause algorithm execution', exact=True).click()
    check('Dijkstra visualizer loads persisted legs and supports step/reset/play/pause')
    page.evaluate('() => { window.printCalls=0; window.print=()=>{window.printCalls++}; }')
    page.get_by_role('button', name='Print Ledger', exact=True).click()
    assert page.evaluate('window.printCalls') == 1
    with page.expect_download(timeout=60000) as download:
        page.get_by_role('button', name='Download PDF Itinerary', exact=True).click()
    assert download.value.suggested_filename.endswith('.pdf')
    pdf=Path(download.value.path()).read_bytes()
    assert pdf.startswith(b'%PDF-') and len(pdf)>1000
    check('Print action and actual PDF download')
    page.get_by_role('button', name='What if?', exact=True).click()
    page.locator('#whatif-budget-slider').fill('19000')
    page.get_by_role('button', name='Reset to original', exact=True).click()
    expect(page.locator('#whatif-budget-slider')).to_have_value('20000')
    page.locator('#whatif-budget-slider').fill('19000')
    page.wait_for_timeout(350)
    with page.expect_response(lambda r: '/generate-itinerary' in r.url) as changed:
        page.get_by_role('button', name='Save this version instead', exact=True).click()
    assert changed.value.json()['trip']['budget'] == 19000
    check('What If reset and saved server version')
    page.get_by_role('button', name='Share Route', exact=True).click()
    share_url = page.locator('[role=dialog] input').input_value()
    page.evaluate("() => { window.originalCopy=navigator.clipboard.writeText.bind(navigator.clipboard); navigator.clipboard.writeText=async()=>{throw new Error('Clipboard denied test')}; }")
    messages=[]
    def dismiss(dialog):
        messages.append(dialog.message)
        dialog.accept()
    page.once('dialog',dismiss)
    page.get_by_role('button', name='Copy link', exact=True).click()
    assert messages and 'Unable to copy' in messages[0]
    page.evaluate('() => { navigator.clipboard.writeText=window.originalCopy; }')
    context.grant_permissions(['clipboard-read','clipboard-write'])
    page.get_by_role('button', name='Copy link', exact=True).click()
    expect(page.get_by_role('button', name='Copied!', exact=True)).to_be_visible()
    check('Share link copy succeeds and clipboard rejection is visible')
    page.keyboard.press('Escape')
    page.goto(share_url)
    expect(page.get_by_text('Base Hotel:', exact=False).first).to_be_visible()
    page.get_by_role('button', name='Ranked Stays', exact=True).first.click()
    expect(page.get_by_role('button', name='Lowest Price', exact=False)).to_be_visible()
    check('Owner shared link retrieves persisted trip and navigation remains subscribed')
    page.get_by_role('button', name=re.compile(r'^Browser Tourist')).first.click()
    expect(page.get_by_role('button', name='Open Itinerary', exact=True).first).to_be_visible()
    page.get_by_role('button', name='Open Itinerary', exact=True).first.click()
    expect(page.get_by_role('button', name='What if?', exact=True)).to_be_visible()
    check('Opening an owned profile trip restores editable itinerary controls')
    page.get_by_role('button', name=re.compile(r'^Browser Tourist')).first.click()
    from completion_auxiliary import run as run_auxiliary
    run_auxiliary(page, context, base, api, check)
