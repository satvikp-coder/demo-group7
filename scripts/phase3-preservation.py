"""Read-only fingerprints. Only the six explicitly reviewed attraction fields may change."""
import datetime,json,pathlib,subprocess,sys,re
root=pathlib.Path(__file__).resolve().parents[1]
tables=['destinations','attractions','hotels','restaurants','routes','users','trips','itinerary_stops','budgets']
manifest=json.loads((root/'data/phase3/enrichment-20261011.json').read_text(encoding='utf-8'))
private=root/'backups/phase3-before-live-fingerprints.json'

def query(sql,database='heritage_planner'):
    if database!='heritage_planner' and not re.fullmatch(r'local_restore_phase3_[a-z0-9_]+',database):raise ValueError('Invalid restore database')
    return json.loads(subprocess.check_output(['docker','exec','heritage-local-postgres-1','psql','-U','heritage_owner','-d',database,'-At','-v','ON_ERROR_STOP=1','-c',sql],encoding='utf-8'))

def snapshot(database='heritage_planner'):
    return {t:query("SELECT coalesce(jsonb_object_agg(id,md5(to_jsonb(t)::text)),'{}') FROM "+t+' t',database) for t in tables}

def approved_rows():
    rows=query("SELECT jsonb_agg(to_jsonb(a)) FROM attractions a")
    result={}
    for patch in manifest['records']:
        row=next(r for r in rows if r['slug']==patch['slug'])
        result[row['id']]={'slug':patch['slug'],'unmodified':{k:v for k,v in row.items() if k not in patch['values'] and k!='provenance_review'},'provenance':row.get('provenance_review')}
    return result

if sys.argv[1:]==['--before']:
    with private.open('x',encoding='utf-8') as f:json.dump({'hashes':snapshot(),'approved':approved_rows()},f)
    print('Private Phase3 fingerprints saved; no accounts exported')
elif sys.argv[1:]==['--verify']:
    before=json.loads(private.read_text(encoding='utf-8'));after=snapshot();current=approved_rows()
    for id,row in before['approved'].items():
        assert current[id]['unmodified']==row['unmodified'],row['slug']+' unrelated field changed'
        old=row['provenance'] or {};new=current[id]['provenance']
        for key,value in old.items():assert new[key]==value,'Prior provenance lost'
        assert new['enrichments'][manifest['release']]['before']
    checks={}
    for t in tables:
        exempt=set(before['approved']) if t=='attractions' else set()
        valid=all(id in after[t] and (id in exempt or after[t][id]==value) for id,value in before['hashes'][t].items())
        checks[t]={'originalCount':len(before['hashes'][t]),'finalCount':len(after[t]),'originalRowsPreservedExceptReviewedFields':valid}
    report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verified':all(c['originalRowsPreservedExceptReviewedFields'] for c in checks.values()),'tables':checks,'reviewedAttractions':len(current)}
    (root/'reports/phase3-live-preservation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report));assert report['verified']
elif len(sys.argv)==3 and sys.argv[1]=='--verify-backup':
    before=json.loads(private.read_text(encoding='utf-8'))['hashes'];assert snapshot(sys.argv[2])==before
    print('Restored backup matches all nine original-table fingerprints')
else:raise SystemExit('Use --before, --verify, or --verify-backup local_restore_phase3_NAME')
