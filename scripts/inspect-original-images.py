"""Resolve original photographs against Wikipedia/Commons; no runtime catalog imports."""
import json, urllib.parse, runpy, sys
from pathlib import Path
helpers=runpy.run_path(str(Path(__file__).with_name('acquire-images.py')))
titles=sys.argv[1:] or ['Ahmedabad','Jama Mosque, Champaner','Dwarkadhish Temple','Gir National Park','Sun Temple, Modhera','Rann of Kutch','Saputara','Somnath temple','Adalaj Stepwell','Sabarmati Ashram','Sarkhej Roza','Sidi Saiyyed Mosque','Nageshvara Jyotirlinga','Kankaria Lake','Rukmini Devi Temple']
params={'action':'query','format':'json','titles':'|'.join(titles),'prop':'pageimages','piprop':'name|original','redirects':1}
raw,_=helpers['request']('https://en.wikipedia.org/w/api.php?'+urllib.parse.urlencode(params))
data=json.loads(raw)
out=helpers['OUT'];(out/'original-wikipedia-leads.json').write_bytes(raw)
for page in data['query']['pages'].values():print(page['title'],page.get('pageimage'),flush=True)
files=['File:'+p['pageimage'] for p in data['query']['pages'].values() if 'pageimage' in p]
metadata=helpers['metadata'](files)
(out/'original-commons-metadata.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
