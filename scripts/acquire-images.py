"""Maintainer-only acquisition; reviewed choices live in data/images/photograph-sources.json.
License metadata is saved locally; normal builds and runtime never contact Commons.
"""
import hashlib, html, io, json, re, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'backend/reports/images'
DEST=ROOT/'frontend/public/assets/photographs'
OUT.mkdir(parents=True,exist_ok=True)
DEST.mkdir(parents=True,exist_ok=True)
UA={'User-Agent':'HeritagePlannerImageAudit/1.0 (local academic tourism directory; license attribution preservation)'}

def request(url):
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=40) as r:
                return r.read(),r.headers.get('Content-Type','')
        except Exception:
            if attempt==2:raise
            time.sleep(5*(attempt+1))

def metadata(titles):
    params={'action':'query','format':'json','titles':'|'.join(titles),'prop':'imageinfo','iiprop':'url|extmetadata|size|sha1','iiurlwidth':960}
    raw,_=request('https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params))
    data=json.loads(raw);(OUT/'commons-selected-metadata.json').write_bytes(raw)
    return {page['title']:page for page in data['query']['pages'].values()}

def plain(value):return html.unescape(re.sub('<[^>]+>','',value)).strip()

if __name__=='__main__':
    choices=json.loads((ROOT/'data/images/photograph-sources.json').read_text(encoding='utf-8'))
    previous=json.loads((DEST/'manifest.json').read_text(encoding='utf-8')) if (DEST/'manifest.json').exists() else {}
    pages=metadata([row['file'] for row in choices])
    fallback=lambda key:'/assets/categories/'+({'hotels':'hotel','restaurants':'dining'}.get(key.split(':')[0],'monument'))+'.svg'
    photos=[];records={key:(value if '/categories/' in value else fallback(key)) for key,value in previous.get('records',{}).items()};names={key:(value if '/categories/' in value else fallback(key)) for key,value in previous.get('names',{}).items()};aliases={}
    for choice in choices:
        page=pages[choice['file']];info=page['imageinfo'][0];ext=info['extmetadata']
        value=lambda key:plain(ext.get(key,{}).get('value',''))
        license=value('LicenseShortName')
        if license not in ['CC0','Public domain','CC BY 2.0','CC BY 3.0','CC BY 4.0','CC BY-SA 2.0','CC BY-SA 3.0','CC BY-SA 4.0']:raise ValueError('Unapproved license '+license)
        artist=value('Artist');licenseUrl=value('LicenseUrl')
        if not artist or (license not in ['CC0','Public domain'] and not licenseUrl):raise ValueError('Incomplete credit '+choice['file'])
        target=DEST/(choice['key']+'.webp')
        old=next((photo for photo in previous.get('photos',[]) if photo['path']=='/assets/photographs/'+target.name),{})
        if target.exists() and old.get('commonsFile')!=choice['file']:
            raise ValueError('Changed photo sources require a new descriptive key/filename to avoid stale browser/CDN caches: '+choice['key'])
        if not target.exists():
            url=info.get('thumburl',info['url']).split('?')[0]
            raw,contentType=request(url)
            if not contentType.startswith('image/'):raise ValueError('Nonimage '+url)
            with Image.open(io.BytesIO(raw)) as original:
                im=ImageOps.exif_transpose(original).convert('RGB');im.thumbnail((1280,960));im.save(target,'WEBP',quality=86,method=6)
        with Image.open(target) as im:width,height=im.size
        photo={'path':'/assets/photographs/'+target.name,'title':choice['title'],'author':artist,'source':info['descriptionurl'],'license':license,'licenseUrl':licenseUrl or ('https://creativecommons.org/publicdomain/mark/1.0/' if license=='Public domain' else 'https://creativecommons.org/publicdomain/zero/1.0/'),'changes':'Resized and converted to WebP; responsive display may crop the image.','description':value('ImageDescription'),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size,'width':width,'height':height,'commonsFile':choice['file'],'recovered':choice.get('recovered',False)}
        photos.append(photo)
        for record in choice.get('records',[]):records[record]=photo['path']
        for name in choice.get('names',[]):names[name]=photo['path']
        for alias in choice.get('aliases',[]):aliases[alias]=photo['path']
        print(choice['key'],license,target.stat().st_size,flush=True)
    # Explicit audited fallbacks ensure uncleared historical hotlinks aren't revived.
    inventory=json.loads((OUT/'inventory.json').read_text(encoding='utf-8')) if (OUT/'inventory.json').exists() else {'records':[]}
    for row in inventory['records']:
        if not row.get('slug'):continue
        key=row['kind']+':'+row['slug']
        if key not in records:
            cat='hotel' if row['kind']=='hotels' else 'dining' if row['kind']=='restaurants' else 'temple' if any(t in (row.get('category') or '').lower() for t in ['temple','religious','jyotirlinga']) else 'wildlife' if 'safari' in row['name'].lower() else 'monument'
            records[key]='/assets/categories/'+cat+'.svg'
        names[row['kind']+':'+row['name']]=records[key]
    manifest={'photos':photos,'records':records,'names':names,'aliases':aliases}
    (DEST/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    cards=[]
    for photo in photos:
        e=lambda value:html.escape(value,quote=True)
        cards.append('<article><img loading="lazy" src="'+e(photo['path'])+'" alt="'+e(photo['title'])+'"><h2>'+e(photo['title'])+'</h2><p>Photograph: '+e(photo['author'])+'. <a href="'+e(photo['source'])+'">Source and original file</a>. <a href="'+e(photo['licenseUrl'])+'">'+e(photo['license'])+'</a>.</p><p>'+e(photo['changes'])+'</p></article>')
    page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Photograph credits — Gujarat Heritage Directory</title><style>body{font:16px/1.6 system-ui;background:#F6F4EF;color:#141E34;max-width:1000px;margin:auto;padding:24px}a{color:#815c14}article{border-top:1px solid #C99A3B;padding:24px 0}img{width:240px;height:160px;object-fit:cover;float:right;margin:0 0 16px 24px}article:after{content:"";display:block;clear:both}@media(max-width:500px){img{float:none;margin:0;width:100%}}</style><h1>Photograph credits</h1><p><a href="./">Return to the directory</a></p><p>These photographs depict the named locations and properties. Their individual licenses remain applicable independently of the application license. Responsive display may crop images. Illustrations labeled “Photograph unavailable” are intentional generic fallbacks, not photographs of a property.</p>'+''.join(cards)+'</html>'
    (ROOT/'frontend/public/image-credits.html').write_text(page,encoding='utf-8')
    sheet=Image.new('RGB',(900,170*((len(photos)+3)//4)),'white');draw=ImageDraw.Draw(sheet)
    for i,photo in enumerate(photos):
        with Image.open(ROOT/'frontend/public'/photo['path'].lstrip('/')) as im:
            im.thumbnail((220,130));x=(i%4)*225;y=(i//4)*170;sheet.paste(im,(x,y));draw.text((x,y+132),photo['title'][:29],fill='black')
    sheet.save(OUT/'verified-photos.jpg')
