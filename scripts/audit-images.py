"""Read-only image inventory and browser evidence. Run from the application root."""
import argparse, hashlib, io, json, re, time, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'backend/reports/images'
OUT.mkdir(parents=True, exist_ok=True)

def fetch(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return json.load(r)

def inventory(base,api_base=None):
    records = []
    for city in fetch((api_base or base+'/api') + '/destinations/catalog?limit=100'):
        records.append({'kind':'destinations', **{k:v for k,v in city.items() if k not in ['attractions','hotels','restaurants']}})
        for kind in ['attractions', 'hotels', 'restaurants']:
            records.extend({'kind':kind, 'destination_slug':city['slug'], **row} for row in city[kind])
    refs = []
    for directory in ['frontend/src', 'frontend/public', 'backend', 'database', 'data']:
        for f in (ROOT/directory).rglob('*'):
            if not f.is_file() or any(p in f.parts for p in ['node_modules','reports','dist','pages','maps']): continue
            if f.suffix not in ['.ts','.tsx','.css','.json','.sql','.js','.html','.svg','.csv']: continue
            text = f.read_text(encoding='utf-8', errors='replace')
            for n, line in enumerate(text.splitlines(), 1):
                if re.search(r'<img|ImageWithFallback|\bsrc\s*[=:]|srcSet|<picture|background.?[Ii]mage|\burl\(|image_url|imageUrl|photoUrl|thumbnail|/assets/|images\.unsplash|\.(?:png|jpe?g|webp|svg|ico)[\"\']', line):
                    refs.append({'file':str(f.relative_to(ROOT)).replace('\\','/'),'line':n,'reference':line.strip()})
    assets=[]
    jpgs=list((ROOT/'frontend/public/assets').rglob('*.jpg'))
    sheet=Image.new('RGB',(900,150*((len(jpgs)+3)//4)),'white');draw=ImageDraw.Draw(sheet)
    for i,f in enumerate(jpgs):
        im=Image.open(f);im.thumbnail((220,120));x=(i%4)*225;y=(i//4)*150;sheet.paste(im,(x,y));draw.text((x,y+120),f.name,fill='black')
    sheet.save(OUT/'original-assets.jpg')
    for f in (ROOT/'frontend/public').rglob('*'):
        if f.suffix.lower() not in ['.jpg','.jpeg','.png','.webp','.avif','.svg','.ico']: continue
        row={'path':'/'+str(f.relative_to(ROOT/'frontend/public')).replace('\\','/'),'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
        if f.suffix!='.svg':
            with Image.open(f) as im: row.update(width=im.width,height=im.height,format=im.format)
        assets.append(row)
    (OUT/'inventory.json').write_text(json.dumps({'records':records,'references':refs,'assets':assets},indent=2),encoding='utf-8')
    print(f'Inventory: {len(records)} catalog records, {len(refs)} reference lines, {len(assets)} public image files')
    return records

def validate_assets(base):
    errors=[];checked=[]
    for f in (ROOT/'frontend/public').rglob('*'):
        if not f.is_file() or f.suffix.lower() not in ['.jpg','.jpeg','.png','.webp','.avif','.svg','.ico']:continue
        path='/'+str(f.relative_to(ROOT/'frontend/public')).replace('\\','/')
        try:
            if f.suffix=='.svg':ET.fromstring(f.read_bytes())
            else:
                with Image.open(f) as im:im.verify()
            with urllib.request.urlopen(base+path,timeout=15) as r:
                content=r.read();mime=r.headers.get('Content-Type','')
                assert mime.startswith('image/'),mime
                if f.suffix=='.svg':ET.fromstring(content)
                else:
                    with Image.open(io.BytesIO(content)) as im:im.verify()
            checked.append({'path':path,'mime':mime,'bytes':len(content)})
        except Exception as e:errors.append({'path':path,'error':str(e)})
    manifest=json.loads((ROOT/'frontend/public/assets/photographs/manifest.json').read_text(encoding='utf-8'))
    for key,path in {**manifest['records'],**manifest['names'],**manifest['aliases']}.items():
        if not (ROOT/'frontend/public'/path.lstrip('/')).is_file():errors.append({'record':key,'missing':path})
    result={'base':base,'checked':checked,'errors':errors}
    (OUT/'asset-validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print('Asset validation:',len(checked),'passed,',len(errors),'failed',flush=True)
    return result

def browser(base,phase,records,requested_paths=None,widths=(1440,390)):
    report={'base':base,'phase':phase,'pages':[],'errors':[],'consoleErrors':[],'imageHttpErrors':[],'failedImageRequests':[]}
    cities=[r for r in records if r['kind']=='destinations']
    with sync_playwright() as p:
        b=p.chromium.launch(channel='chrome',headless=True)
        for viewport in [{'width':width,'height':1000 if width>=1000 else 844} for width in widths]:
            ctx=b.new_context(viewport=viewport,service_workers='allow')
            page=ctx.new_page()
            page.on('pageerror',lambda e:report['errors'].append(str(e)))
            page.on('console',lambda m:report['consoleErrors'].append(m.text) if m.type=='error' else None)
            page.on('response',lambda r:report['imageHttpErrors'].append({'url':r.url,'status':r.status}) if r.request.resource_type=='image' and r.status>=400 else None)
            page.on('requestfailed',lambda r:report['failedImageRequests'].append({'url':r.url,'failure':r.failure}) if r.resource_type=='image' and r.failure!='net::ERR_ABORTED' else None)
            paths=requested_paths or ['/','/explore']+['/destination/'+c['slug'] for c in cities]+['/hotels','/itinerary','/budget','/profile','/admin','/login','/register','/research','/missing','/image-credits.html']
            for path in paths:
                page.goto(base+path,wait_until='networkidle',timeout=45000)
                page.wait_for_timeout(700)
                # Trigger lazy images and motion visibility in every card.
                for y in range(0,page.evaluate('document.body.scrollHeight'),500):
                    page.evaluate('(y)=>window.scrollTo(0,y)',y);page.wait_for_timeout(100)
                for element in page.locator('img').all():
                    if element.is_visible():element.scroll_into_view_if_needed()
                # A network-idle page may still have offscreen lazy images/queued decodes.
                page.wait_for_function("()=>Array.from(document.images).filter(e=>e.getClientRects().length).every(e=>e.complete&&e.naturalWidth>0)",timeout=15000)
                images=page.locator('img').evaluate_all("els=>els.map(e=>({src:e.currentSrc||e.src,alt:e.alt,width:e.naturalWidth,height:e.naturalHeight,complete:e.complete,fallback:e.dataset.imageState==='fallback'||e.src.includes('/categories/'),visible:!!e.getClientRects().length}))")
                row={'path':path,'viewport':viewport,'images':images,'broken':[i for i in images if i['visible'] and (not i['complete'] or not i['width'])],'horizontalOverflow':page.evaluate('document.documentElement.scrollWidth>innerWidth')}
                report['pages'].append(row)
                if path in ['/','/explore','/destination/ahmedabad','/destination/dwarka','/hotels']:
                    page.evaluate('window.scrollTo(0,0)');page.wait_for_timeout(300)
                    name=(path.strip('/').replace('/','-') or 'home')+'-'+str(viewport['width'])
                    page.screenshot(path=str(OUT/(phase+'-'+name+'.png')),full_page=True)
                print(phase,path,viewport['width'],len(images),'images',len(row['broken']),'broken')
            ctx.close()
        b.close()
    (OUT/(phase+'-browser.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
    return report

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--base',default='http://localhost:8080');parser.add_argument('--api');parser.add_argument('--phase',default='before');parser.add_argument('--paths',nargs='+');parser.add_argument('--widths',nargs='+',type=int,default=[1440,390]);parser.add_argument('--inventory-only',action='store_true');parser.add_argument('--assets-only',action='store_true');args=parser.parse_args()
    if args.assets_only:raise SystemExit(1 if validate_assets(args.base)['errors'] else 0)
    records=inventory(args.base,args.api)
    (OUT/(args.phase+'-inventory.json')).write_bytes((OUT/'inventory.json').read_bytes())
    if not args.inventory_only:
        report=browser(args.base,args.phase,records,args.paths,args.widths)
        if args.phase!='before' and (report['errors'] or report['imageHttpErrors'] or report['failedImageRequests'] or any(r['broken'] for r in report['pages'])): raise SystemExit(1)
