"""Hash database rows without exporting private accounts. Only exact audit users may be cleaned."""
import json, subprocess, sys
from pathlib import Path
TABLES=['destinations','attractions','hotels','restaurants','routes','users','trips','itinerary_stops','budgets','seed_managed_rows','schema_migrations']
OUT=Path(__file__).resolve().parents[1]/'backend/reports/images'
def sql(query,database='heritage_planner'):
    return subprocess.check_output(['docker','exec','heritage-local-postgres-1','psql','-U','heritage_owner','-d',database,'-At','-v','ON_ERROR_STOP=1','-c',query],text=True).strip()
def snapshot(database='heritage_planner'):
    result={}
    for table in TABLES:
        result[table]=json.loads(sql("SELECT json_build_object('count',count(*),'digest',md5(coalesce(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text)::text,'[]'))) FROM "+table+' t',database))
    return result
if __name__=='__main__':
    phase=sys.argv[1];database=sys.argv[2] if len(sys.argv)>2 else 'heritage_planner';result=snapshot(database);(OUT/('database-'+phase+'.json')).write_text(json.dumps(result,indent=2),encoding='utf-8')
    print({table:row['count'] for table,row in result.items()})
    if phase in ['after','restored']:
        before=json.loads((OUT/'database-before.json').read_text(encoding='utf-8'))
        assert before==result,'Database changed beyond cleaned verification fixtures'
        print('All original catalog, account, trip, budget and migration rows preserved exactly.')
