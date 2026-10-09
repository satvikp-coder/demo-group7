"""Real production journeys with exact-ID cleanup; no catalog writes or reseeding."""
import json,re,secrets,subprocess,time,uuid,sys
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'scripts'))
import importlib.util
spec=importlib.util.spec_from_file_location('snapshot',Path(__file__).resolve().parents[2]/'scripts/image-data-snapshot.py');snapshot=importlib.util.module_from_spec(spec);spec.loader.exec_module(snapshot)
base='http://localhost:8080';api=base+'/api';out=Path('backend/reports/images')
report={'verified':False,'checks':[],'cities':[],'images':[],'users':[],'pageErrors':[],'consoleErrors':[],'failedImageRequests':[],'httpErrors':[]}
def save():(out/'functional-browser.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
def images(page,label):
    page.wait_for_timeout(400)
    for y in range(0,page.evaluate('document.body.scrollHeight'),500):page.evaluate('(y)=>scrollTo(0,y)',y);page.wait_for_timeout(60)
    for element in page.locator('img').all():
        if element.is_visible():element.scroll_into_view_if_needed()
    page.wait_for_function("()=>Array.from(document.images).filter(e=>e.getClientRects().length).every(e=>e.complete&&e.naturalWidth>0)")
    rows=page.locator('img').evaluate_all("els=>els.map(e=>({src:e.currentSrc,state:e.dataset.imageState,width:e.naturalWidth,height:e.naturalHeight,alt:e.alt}))")
    report['images'].append({'page':label,'viewport':page.viewport_size,'images':rows});save()
def nav(page,name):
    button=page.get_by_role('button',name=name,exact=True)
    if not any(button.nth(i).is_visible() for i in range(button.count())):
        page.get_by_role('button',name='Toggle navigation menu').click()
    button=page.get_by_role('button',name=name,exact=True)
    for i in range(button.count()):
        if button.nth(i).is_visible():button.nth(i).click();return
    raise AssertionError('Missing navigation '+name)
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='chrome',headless=True)
        for width in [1440,390]:
            context=browser.new_context(viewport={'width':width,'height':1000 if width==1440 else 844},service_workers='allow');page=context.new_page()
            page.on('pageerror',lambda e:report['pageErrors'].append(str(e)))
            page.on('console',lambda m:report['consoleErrors'].append(m.text) if m.type=='error' else None)
            page.on('requestfailed',lambda r:report['failedImageRequests'].append(r.url) if r.resource_type=='image' and r.failure!='net::ERR_ABORTED' else None)
            page.on('response',lambda r:report['httpErrors'].append({'url':r.url,'status':r.status}) if r.status>=400 else None)
            email='image-audit-'+str(time.time_ns())+'@example.test';password=secrets.token_urlsafe(24)+'Aa9!'
            page.goto(base+'/register');page.locator('#reg-name').fill('Image verification');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').nth(0).fill(password);page.locator('input[type=password]').nth(1).fill(password)
            with page.expect_response(lambda r:r.url==api+'/auth/register') as signup:page.locator('button[type=submit]').click()
            assert signup.value.status==201;report['users'].append(signup.value.json()['user']['id']);save()
            page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password);page.locator('button[type=submit]').click();page.wait_for_url('**/profile')
            page.reload();expect(page.get_by_text('Welcome back, Image verification',exact=True).first).to_be_visible()
            token=page.evaluate("sessionStorage.getItem('heritage_api_token')");headers={'Authorization':'Bearer '+token}
            cities=context.request.get(api+'/destinations/catalog?limit=100').json();assert len(cities)==8
            for city in cities:
                page.goto(base+'/explore');page.get_by_placeholder('Search destinations or districts...').fill(city['name']);expect(page.get_by_role('button',name='Inspect Site',exact=True)).to_have_count(1);page.get_by_role('button',name='Inspect Site',exact=True).click()
                expect(page.get_by_role('heading',name=city['name'],exact=True,level=1)).to_be_visible();images(page,'destination/'+city['slug'])
                assert page.locator('img').first.get_attribute('data-image-state')=='photo'
                page.goto(base+'/profile');page.get_by_role('button',name='Create New Heritage Route').click();page.locator('[role=dialog]').get_by_role('button',name=re.compile('^'+re.escape(city['name'])+'(?:\\s|$)')).click();page.get_by_role('button',name='Continue to Logistics').click()
                hotel=city['hotels'][0];page.locator('#planner-starting-hotel').select_option(hotel['id']);page.locator('#planner-budget-input').fill('20000');page.locator('[role=dialog] input[type=checkbox]').uncheck();page.get_by_role('button',name='Review Plan').click()
                images(page,'planner/'+city['slug'])
                with page.expect_response(lambda r:'/generate-itinerary' in r.url) as generation:page.get_by_role('button',name='Generate Circular Plan').click()
                assert generation.value.status==200;dto=generation.value.json();trip_id=dto['trip']['id'];assert dto['trip']['starting_hotel_id']==hotel['id']
                page.reload();expect(page.get_by_text('Base Hotel: '+hotel['name'],exact=False)).to_be_visible();images(page,'itinerary/'+city['slug'])
                nav(page,'Budget Planner');expect(page.get_by_text('\u20b9'+format(dto['budget']['total'],',.0f'),exact=True).first).to_be_visible();images(page,'budget/'+city['slug'])
                assert context.request.get(api+'/trips/'+trip_id,headers=headers).json()==dto
                assert context.request.get(api+'/trips/'+trip_id+'/budget',headers=headers).json()==dto['budget']
                nav(page,'Ranked Stays');expect(page.get_by_role('heading',name=re.compile('^Ranked Stays - '+re.escape(city['name']))).first).to_be_visible();expect(page.locator('img')).to_have_count(len(city['hotels']));images(page,'hotels/'+city['slug'])
                for name,sort in [('Lowest Price','price'),('Highest Rated','rating'),('Best Value (Rating/Cost)','value')]:
                    with page.expect_response(lambda r: '/hotels?sort='+sort in r.url):page.get_by_role('button',name=name,exact=True).click()
                    expect(page.locator('img')).to_have_count(len(city['hotels']));images(page,'hotels/'+city['slug']+'/'+name)
                page.screenshot(path=str(out/('after-hotels-'+city['slug']+'-'+str(width)+'.png')),full_page=True)
                report['cities'].append({'slug':city['slug'],'viewport':width,'hotelCount':len(city['hotels']),'tripId':trip_id,'budget':dto['budget']['total']});save();print(width,city['slug'],'detail/planner/itinerary/budget/hotels passed',flush=True)
            page.goto(base+'/profile');expect(page.get_by_role('button',name='Open Itinerary',exact=True)).to_have_count(8)
            page.get_by_role('button',name='Switch to Hindi').click();assert page.evaluate('document.documentElement.lang')=='hi'
            page.get_by_role('button',name='Switch to English').click();assert page.evaluate('document.documentElement.lang')=='en'
            report['checks'].append({'viewport':width,'name':'Registration/login/session reload/8 cities/all hotel rankings/planner/budget/persisted retrieval/profile/language switch'});save()
            # Only this newly created fixture receives an operator role for read-only UI checks.
            user_id=str(uuid.UUID(report['users'][-1]));snapshot.sql("UPDATE users SET role='tour_operator' WHERE id='"+user_id+"'::uuid")
            page.evaluate('sessionStorage.clear()');page.goto(base+'/login');page.locator('input[type=email]').fill(email);page.locator('input[type=password]').fill(password);page.locator('button[type=submit]').click();page.wait_for_url('**/profile')
            page.goto(base+'/admin');page.wait_for_timeout(900);images(page,'admin/operator');page.screenshot(path=str(out/('after-admin-'+str(width)+'.png')),full_page=True)
            context.close()
        browser.close()
    assert not report['pageErrors'] and not report['consoleErrors'] and not report['failedImageRequests'] and not report['httpErrors'],report
    report['verified']=True
except Exception as error:
    message=re.sub(r'Bearer [A-Za-z0-9_.-]+','Bearer [redacted]',str(error))
    report['failure']=message;print('Functional verification failed: '+message,flush=True)
    raise SystemExit(1) from None
finally:
    for identifier in report['users']:
        identifier=str(uuid.UUID(identifier));snapshot.sql("DELETE FROM users WHERE id='"+identifier+"'::uuid")
    report['cleanupCompleted']=True;save()
print('All successful production image and functional journeys passed; exact-ID fixtures removed.')
