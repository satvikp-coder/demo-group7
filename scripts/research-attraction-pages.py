"""Deliberate public tourism-source research; caches parsed factual map references, never photos."""
import urllib.request,urllib.parse,re,json,time,hashlib,html
from pathlib import Path
root=Path('data/attraction-20261020');root.mkdir(exist_ok=True)
indices=['kutch-zone/kutch','north-zone/mehsana','north-zone/patan','central-zone/panchmahal','south-zone/dang','saurashtra/gir-somnath','saurashtra/junagadh','saurashtra/devbhoomi-dwarka','central-zone/ahmedabad']
records=[]
for index in indices:
 url='https://www.gujarattourism.com/'+index+'.html'
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'HeritageTourismPlanner academic catalog review (+https://github.com/satvikp-coder/demo-group7)'})
  s=urllib.request.urlopen(req,timeout=25).read().decode('utf-8')
  links=sorted(set(urllib.parse.urljoin(url,html.unescape(u)) for u in re.findall(r'href=["\']([^"\']+)["\']',s) if u.startswith('/'+index+'/') and '.html' in u))
  records.append({'index':index,'url':url,'links':links});print(index,links)
 except Exception as e:records.append({'index':index,'error':str(e)});print(index,str(e))
 time.sleep(.5)
(root/'index-links.json').write_text(json.dumps(records,indent=2),encoding='utf-8')

for page in ['beaches','museums','heritage-sites','religious-site','art-craft']:
 url='https://www.gujarattourism.com/'+page+'.html'
 try:
  s=urllib.request.urlopen(url,timeout=25).read().decode('utf-8')
  links=sorted(set(urllib.parse.urljoin(url,html.unescape(u)) for u in re.findall(r'href=["\']([^"\']+)["\']',s) if re.search(r'/(?:kutch|mehsana|patan|panchmahal|dang|gir-somnath|junagadh|devbhoomi-dwarka)/[^/]+\.html',u)))
  records.append({'index':page,'url':url,'links':links});print(page,links)
 except Exception as e:print(page,str(e))
 time.sleep(.5)
(root/'index-links.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
