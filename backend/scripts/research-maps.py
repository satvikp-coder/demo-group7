"""Read-only external map research; never writes database or fabricates fallback results."""
import json, pathlib, sys, time, urllib.parse, urllib.request
root = pathlib.Path(__file__).resolve().parents[2]
out = root / 'data' / 'research' / 'maps'
out.mkdir(exist_ok=True)
for query in sys.argv[1:]:
    path = out / (''.join(c if c.isalnum() else '-' for c in query).lower() + '.json')
    if path.exists():
        result = json.loads(path.read_text(encoding='utf-8'))
    else:
        url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q':query,'format':'jsonv2','limit':3,'extratags':1})
        try:
            request = urllib.request.Request(url,headers={'User-Agent':'HeritageTourismAcademicDataResearch/1.0'})
            with urllib.request.urlopen(request,timeout=30) as response:
                result={'url':url,'checked':time.strftime('%Y-%m-%d'),'results':json.load(response)}
            path.write_text(json.dumps(result,indent=2),encoding='utf-8')
        except Exception as error:
            print(query, type(error).__name__, str(error)); continue
        time.sleep(1.1)
    print(json.dumps({'query':query,'results':result['results']},ensure_ascii=True))
