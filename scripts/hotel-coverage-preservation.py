"""Private fingerprints for additive hotel imports and restored backup validation."""
import json,re,subprocess,sys,datetime
from pathlib import Path
root=Path(__file__).resolve().parents[1]
tables=['destinations','attractions','hotels','restaurants','routes','users','trips','itinerary_stops','budgets']
private=root/'backups/hotel-coverage-fingerprints.json'
def snapshot(database='heritage_planner'):
 if database!='heritage_planner' and not re.fullmatch('local_restore_hotel_[a-z0-9_]+',database):raise ValueError('Invalid restore target')
 return {table:json.loads(subprocess.check_output(['docker','exec','heritage-local-postgres-1','psql','-U','heritage_owner','-d',database,'-At','-v','ON_ERROR_STOP=1','-c',"SELECT coalesce(jsonb_object_agg(id,md5(to_jsonb(t)::text)),'{}') FROM "+table+' t'],encoding='utf-8')) for table in tables}
if sys.argv[1:]==['--before']:
 with private.open('x',encoding='utf-8') as f:json.dump(snapshot(),f)
 print('Private all-nine-table pre-import fingerprints saved')
elif sys.argv[1:]==['--verify']:
 before=json.loads(private.read_text(encoding='utf-8'));after=snapshot()
 checks={t:{'originalCount':len(before[t]),'finalCount':len(after[t]),'originalRowsUnchanged':all(after[t].get(id)==value for id,value in before[t].items())} for t in tables}
 report={'verified':all(c['originalRowsUnchanged'] for c in checks.values()),'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'tables':checks}
 (root/'reports/hotel-coverage-live-preservation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');assert report['verified'],report
 print(json.dumps(report))
elif len(sys.argv)==3 and sys.argv[1]=='--verify-backup':
 assert snapshot(sys.argv[2])==json.loads(private.read_text(encoding='utf-8'))
 print('Restored backup matches all nine pre-import table fingerprints')
else:raise SystemExit('Use --before, --verify, or --verify-backup local_restore_hotel_NAME')
