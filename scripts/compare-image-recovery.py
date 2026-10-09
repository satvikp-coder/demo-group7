"""Compare frames to document original-image recovery; human review is still required."""
import json
from pathlib import Path
from PIL import Image,ImageOps,ImageChops,ImageStat
ROOT=Path(__file__).resolve().parents[1]
photos=json.loads((ROOT/'frontend/public/assets/photographs/manifest.json').read_text(encoding='utf-8'))['photos']
rows=[]
for f in (ROOT/'frontend/public/assets').rglob('*.jpg'):
    with Image.open(f) as im: original=ImageOps.fit(im.convert('RGB'),(64,64))
    matches=[]
    for photo in photos:
        with Image.open(ROOT/'frontend/public'/photo['path'].lstrip('/')) as im: candidate=ImageOps.fit(im.convert('RGB'),(64,64))
        score=sum(ImageStat.Stat(ImageChops.difference(original,candidate)).mean)/3
        matches.append((score,photo['path']))
    score,path=min(matches)
    rows.append({'original':'/'+str(f.relative_to(ROOT/'frontend/public')).replace('\\','/'),'candidate':path,'meanAbsoluteRgbDifference':round(score,3),'sameFrame':score<8})
(ROOT/'backend/reports/images/original-recovery-comparison.json').write_text(json.dumps(rows,indent=2),encoding='utf-8')
for row in rows:print(row,flush=True)
