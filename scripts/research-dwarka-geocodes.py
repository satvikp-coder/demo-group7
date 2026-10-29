import urllib.request,urllib.parse,json,time
from pathlib import Path
cache=Path('data/attraction-20261020/dwarka-geocodes.json')
if cache.exists():
 print('Using previously cached one-time geocodes');raise SystemExit(0)
out=[]
for q in ['Bhadkeshwar Mahadev Temple Dwarka','Gopi Talav Dwarka','Gomti Ghat Dwarka','Hanuman Dandi Bet Dwarka']:
 url='https://nominatim.openstreetmap.org/search?'+urllib.parse.urlencode({'q':q,'format':'jsonv2','countrycodes':'in','viewbox':'68.85,22.52,69.2,22.15','bounded':1,'limit':2})
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'HeritageTourismPlannerAcademic/1.0 (+https://github.com/satvikp-coder/demo-group7)'})
  data=json.load(urllib.request.urlopen(req,timeout=20));out.append({'query':q,'source_url':url,'checked':'2026-10-20','license':'OpenStreetMap contributors ODbL-1.0','results':data});print(json.dumps(out[-1]),flush=True)
 except Exception as e:print(q,str(e),flush=True)
 time.sleep(1.5)
Path('data/attraction-20261020/dwarka-geocodes.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8')
