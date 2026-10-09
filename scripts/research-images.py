"""Fetch Commons search/license metadata for review, never auto-select photographs."""
import json, urllib.request, urllib.parse, argparse, concurrent.futures, time, re
from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'backend/reports/images/research'
OUT.mkdir(parents=True,exist_ok=True)
def query(term):
    params={'action':'query','format':'json','generator':'search','gsrsearch':term,'gsrnamespace':'6','gsrlimit':'8','prop':'imageinfo','iiprop':'url|extmetadata|size','iiurlwidth':'960'}
    url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)
    req=urllib.request.Request(url,headers={'User-Agent':'HeritagePlannerImageAudit/1.0 (educational local image provenance review)'})
    try:
        with urllib.request.urlopen(req,timeout=40) as r: data=json.load(r)
        (OUT/(re.sub(r'[^a-zA-Z0-9 _-]','',term)+'.json')).write_text(json.dumps(data,indent=2),encoding='utf-8')
        pages=sorted(data.get('query',{}).get('pages',{}).values(),key=lambda p:p.get('index',0))
        print(term,[(p['title'],p.get('imageinfo',[{}])[0].get('extmetadata',{}).get('LicenseShortName',{}).get('value')) for p in pages],flush=True)
    except Exception as e: print(term,str(e),flush=True)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('terms',nargs='*');parser.add_argument('--file');args=parser.parse_args()
    terms=json.loads(Path(args.file).read_text(encoding='utf-8')) if args.file else args.terms
    for term in terms:
        query(term);time.sleep(7)
