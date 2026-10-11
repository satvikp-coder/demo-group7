"""Fingerprint existing installed rows privately before additive maintenance; never writes SQL."""
import json,pathlib,subprocess,sys,datetime
root=pathlib.Path(__file__).resolve().parents[1]
tables=['destinations','attractions','hotels','restaurants','routes','users','trips','itinerary_stops','budgets']
def snapshot():
    result={}
    for table in tables:
        expression="to_jsonb(t)-'lodging_nights'-'arrival_date'-'departure_date'" if table=='trips' else 'to_jsonb(t)'
        sql=f"SELECT coalesce(jsonb_object_agg(id,md5(({expression})::text)),'{{}}') FROM {table} t"
        result[table]=json.loads(subprocess.check_output(['docker','exec','heritage-local-postgres-1','psql','-U','heritage_owner','-d','heritage_planner','-At','-c',sql],encoding='utf-8'))
    return result
private=root/'backups/phase2-before-live-fingerprints.json'
if sys.argv[1:] == ['--before']:
    with private.open('x',encoding='utf-8') as f:json.dump(snapshot(),f)
    print('Private pre-maintenance fingerprints saved; no row values exported')
elif sys.argv[1:] == ['--verify']:
    before=json.loads(private.read_text());after=snapshot()
    rows={table:{'originalCount':len(before[table]),'finalCount':len(after[table]),'allOriginalRowsPreserved':all(after[table].get(i)==value for i,value in before[table].items())} for table in tables}
    report={'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'verified':all(r['allOriginalRowsPreserved'] for r in rows.values()),'tables':rows,'tripCompatibility':'New nullable lodging columns excluded from old-row fingerprints; all previously stored trip fields compared'}
    (root/'reports/phase2-live-preservation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report));assert report['verified']
else:raise SystemExit('Use --before or --verify')
