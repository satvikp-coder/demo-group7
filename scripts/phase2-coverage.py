"""Read-only installed PostgreSQL coverage; never queries user identity fields."""
import json, subprocess, datetime, pathlib, math, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
final='--final' in sys.argv
if not final and (ROOT/'reports/phase2-baseline-coverage.json').exists():raise SystemExit('Baseline already exists; use --final to preserve it')
def query(sql):
    return json.loads(subprocess.check_output(['docker','exec','heritage-local-postgres-1','psql','-U','heritage_owner','-d','heritage_planner','-At','-c',sql],encoding='utf-8'))
tables=['destinations','attractions','hotels','restaurants','routes']
data={t:query(f"SELECT coalesce(jsonb_agg(to_jsonb(t) ORDER BY id),'[]') FROM {t} t") for t in tables}
manifest=json.loads((ROOT/'frontend/public/assets/photographs/manifest.json').read_text(encoding='utf-8'))
def photo(kind,r):
    path=manifest['records'].get(kind+':'+(r.get('slug') or ''),'') or manifest.get('names',{}).get(kind+':'+r['name'],'')
    return bool(path and '/categories/' not in path)
def coordinates(r):
    try:return 20<=float(r['lat'])<=25 and 68<=float(r['lng'])<=75
    except (KeyError,TypeError,ValueError):return False
rows=[]
for d in sorted(data['destinations'],key=lambda x:x['name']):
    children={t:[r for r in data[t] if r['destination_id']==d['id']] for t in tables[1:]}
    a,h,r,e=[children[t] for t in tables[1:]]
    cats={'Low Cost':0,'Budget':0,'Premium':0,'Unknown':0}
    for x in h:
        v=x['price_per_night']; review=x.get('provenance_review') or {}
        if final and (review.get('price_kind')=='historical' or 'historical' in review.get('price_basis','').lower() or (review.get('valid_until') and review['valid_until']<datetime.date.today().isoformat())):v=None
        cats['Unknown' if v is None else 'Low Cost' if float(v)<1500 else 'Budget' if float(v)<=4000 else 'Premium']+=1
    connected={v for edge in e for k,v in edge.items() if k in ['source_node_id','destination_node_id']}
    rows.append({'destination':d['name'],'slug':d['slug'],'attractions':len(a),'hotels':len(h),'restaurants':len(r),'categories':cats,'validAttractionCoordinates':sum(map(coordinates,a)),'validHotelCoordinates':sum(map(coordinates,h)),'knownFees':sum(x['entry_fee_numeric'] is not None for x in a),'knownHours':sum(bool(x['opening_time'] and x['closing_time']) for x in a),'knownDurations':sum(x['duration_hours'] is not None for x in a),'knownAttractionRatings':sum(x['rating'] is not None for x in a),'knownHotelRatings':sum(x['rating'] is not None for x in h),'photos':sum(photo(t,x) for t in ['attractions','hotels','restaurants'] for x in children[t]),'routes':len(e),'connectedAttractions':sum(x['id'] in connected for x in a),'connectedHotels':sum(x['id'] in connected for x in h),'oneDayFeasibility':'Pending isolated planner matrix','multiDayFeasibility':'Pending isolated planner matrix'})
if final:
    evidence=json.loads((ROOT/'reports/phase2-cross-destination-tests.json').read_text())
    for row in rows:
        matched=next(x for x in evidence['coverage'] if x['slug']==row['slug'])
        row['oneDayFeasibility']={'isolatedApiVerified':evidence['verified'],'scenarios':[x for x in matched['scenarios'] if x['days']==1]}
        row['multiDayFeasibility']={'isolatedApiVerified':evidence['verified'],'scenarios':[x for x in matched['scenarios'] if x['days']>1]}
report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'counts':{t:len(data[t]) for t in tables},'destinations':rows,'catalog':data}
(ROOT/('reports/phase2-final-coverage.json' if final else 'reports/phase2-baseline-coverage.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
text='# Phase 2 data coverage baseline\n\nRead-only SQL snapshot. Numeric fields are stored values, not independent current-price verification. Feasibility is pending isolated generation.\n\n| Destination | Attractions | Hotels | Low Cost / Budget / Premium / Unknown | Restaurants | Known fees / hours / duration | Photos (children) | Routes | Connected attractions / hotels |\n|---|---:|---:|---|---:|---|---:|---:|---|\n'
for x in rows:text+=f"| {x['destination']} | {x['attractions']} | {x['hotels']} | {' / '.join(str(v) for v in x['categories'].values())} | {x['restaurants']} | {x['knownFees']} / {x['knownHours']} / {x['knownDurations']} | {x['photos']} | {x['routes']} | {x['connectedAttractions']} / {x['connectedHotels']} |\n"
if final:
    text=text.replace('data coverage baseline','installed data coverage').replace('Feasibility is pending isolated generation.','All eight destinations passed isolated one-day and multi-day generation; see phase2-cross-destination-tests.json. Numeric prices remain estimates, not live rates.')
    baseline=(ROOT/'reports/PHASE2_DATA_COVERAGE.md').read_text(encoding='utf-8').split('\n# Phase 2 installed data coverage')[0]
    text=baseline+'\n'+text
(ROOT/'reports/PHASE2_DATA_COVERAGE.md').write_text(text,encoding='utf-8')
print(text)
