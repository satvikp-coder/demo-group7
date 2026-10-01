"""Archive a public source page and show coordinate/map metadata for manual review."""
import urllib.request,sys,pathlib,re,json,hashlib,datetime
url=sys.argv[1]
request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0 HeritageTourismResearch/1.0'})
with urllib.request.urlopen(request,timeout=45) as r: text=r.read().decode('utf-8','replace')
folder=pathlib.Path(__file__).resolve().parents[2]/'data/research/pages';folder.mkdir(exist_ok=True)
key=hashlib.sha256(url.encode()).hexdigest()[:16]
(folder/(key+'.html')).write_text(text,encoding='utf-8')
(folder/(key+'.json')).write_text(json.dumps({'url':url,'checked':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sha256':hashlib.sha256(text.encode()).hexdigest()}))
print('Saved',key,len(text))
for match in list(re.finditer(r'latitude|longitude|maps\.google|google\.com/maps|"geo"|data-lat|data-lng|data-long|[?!&]ll=|!3d|!4d',text,re.I))[:30]:print(text[max(0,match.start()-70):match.end()+180])
