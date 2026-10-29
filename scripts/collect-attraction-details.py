import urllib.request,re,json,time,html,hashlib
from pathlib import Path
root=Path('data/attraction-20261020');indices=json.loads((root/'index-links.json').read_text(encoding='utf-8'));urls=sorted(set(u for r in indices for u in r.get('links',[])))
exclude=['glade-one','kensville','dekho-amdavad','shankus-natural','junagadh-heritage-walk','buddhist-caves1','kuwo1','lyari-riverbed']
urls=[u for u in urls if not any(e in u for e in exclude)]
cache=root/'source-facts.json';records=json.loads(cache.read_text(encoding='utf-8')) if cache.exists() else []
for url in urls:
 if any(r['url']==url and 'error' not in r for r in records):continue
 try:
  raw=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'HeritageTourismPlanner academic catalog review (+https://github.com/satvikp-coder/demo-group7)'}),timeout=25).read();s=raw.decode('utf-8')
  title=html.unescape(re.sub('<[^>]+>',' ',re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S).group(1))).strip();title=' '.join(title.split())
  iframe=re.search(r'<iframe[^>]+src="([^"]+)',s);embed=html.unescape(iframe.group(1)) if iframe else None
  coords=re.search(r'!2d(-?[0-9.]+)!3d(-?[0-9.]+)',embed or '')
  if not coords:coords=re.search(r'[?&]q=(-?[0-9.]+),(-?[0-9.]+)',embed or '')
  text=re.sub('<[^>]+>',' ',s);text=' '.join(html.unescape(text).split());hours=[]
  for label in ['Visiting Hours','Entry fee','Entry Fee','Closed on','closed on']:
   at=text.find(label)
   if at>=0:hours.append(text[at:at+250])
  r={'url':url,'checked':'2026-10-20','title':title,'map_embed':embed,'map_coordinates':{'lat':float(coords.group(2)),'lng':float(coords.group(1))} if coords and '!2d' in (embed or '') else None,'source_sha256':hashlib.sha256(raw).hexdigest(),'operating_excerpt':hours[:2]}
  records=[old for old in records if old['url']!=url];records.append(r);print(title,r['map_coordinates'],flush=True)
 except Exception as e:records.append({'url':url,'error':str(e)});print('FAILED',url,str(e),flush=True)
 cache.write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8');time.sleep(.65)
