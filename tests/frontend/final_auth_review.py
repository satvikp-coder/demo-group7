"""Real curl auth/ownership/CRUD matrix on the configured default API."""
import json,secrets,subprocess,time,uuid
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2];BASE='http://localhost:5000/api'
report={'checks':[],'verified':False};users=[];fixtures={r:[] for r in ['destinations','attractions','hotels','restaurants']}
def sql(script,*args):
 return subprocess.check_output(['node','--input-type=module','-e',"import{pool}from'./backend/config/database.js';try{"+script+"}finally{await pool.end();}",*args],cwd=ROOT,text=True,encoding='utf-8').strip()
def snapshot():
 return json.loads(sql("const result={};for(const table of ['destinations','attractions','hotels','restaurants','routes','destination_nearby_attractions','destination_nearby_hotels'])result[table]=(await pool.query('SELECT md5(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text)::text) hash FROM '+table+' t')).rows[0].hash;console.log(JSON.stringify(result));"))
def request(name,method,path,expected,body=None,token=None):
 lines=['url = '+json.dumps(BASE+path),'request = '+json.dumps(method)]
 if token:lines.append('header = '+json.dumps('Authorization: Bearer '+token))
 if body is not None:lines+=['header = "Content-Type: application/json"','data = '+json.dumps(json.dumps(body))]
 result=subprocess.run(['curl.exe','--silent','--show-error','--max-time','30','--config','-','--write-out','\n%{http_code}'],input='\n'.join(lines)+'\n',capture_output=True,text=True,encoding='utf-8')
 assert result.returncode==0,'curl process failed'
 raw,status=result.stdout.rsplit('\n',1);status=int(status)
 report['checks'].append({'check':name,'expected':expected,'actual':status,'passed':status==expected})
 assert status==expected,name+' returned '+str(status)
 return json.loads(raw) if raw else None
def account(role):
 email=f'auth-final-{time.time_ns()}@example.com';password=secrets.token_urlsafe(20)+'Aa9!'
 registered=request(role+' register','POST','/auth/register',201,{'name':'Temporary auth verification','email':email,'password':password,'role':'tourist'})
 users.append(registered['user']['id'])
 if role=='operator':sql("await pool.query(\"UPDATE users SET role='tour_operator' WHERE id=$1\",[process.argv[1]]);",users[-1])
 return request(role+' login','POST','/auth/login',200,{'email':email,'password':password})['token']

before=snapshot()
try:
 for path in ['/admin/status','/trips']:
  request('no token '+path,'GET',path,401)
  request('bad token '+path,'GET',path,401,token='invalid-token')
 owner=account('tourist');other=account('another tourist');operator=account('operator')
 for resource in fixtures:
  request('tourist read '+resource,'GET','/admin/'+resource,403,token=owner)
  request('tourist create '+resource,'POST','/admin/'+resource,403,{},owner)
 city=request('public Somnath','GET','/destinations/somnath',200)
 hotel=request('public Somnath hotels','GET','/destinations/somnath/hotels',200)[0]
 attraction=request('public Somnath attractions','GET','/destinations/somnath/attractions',200)[0]
 restaurant=request('public Somnath restaurants','GET','/destinations/somnath/restaurants',200)[0]
 created=request('owner create trip','POST','/trips',201,{'destination_id':city['id'],'starting_hotel_id':hotel['id'],'days':1,'lodging_nights':0,'budget':30000,'start_time':'08:00'},owner)
 trip=created['trip']['id']
 request('owner reads own trip','GET','/trips/'+trip,200,token=owner)
 request('another user cannot read trip','GET','/trips/'+trip,404,token=other)
 request('another user cannot read budget','GET','/trips/'+trip+'/budget',404,token=other)
 request('tourist cannot update hotel','PUT','/admin/hotels/'+hotel['id'],403,{'name':hotel['name']},owner)
 request('tourist cannot delete hotel','DELETE','/admin/hotels/'+hotel['id'],403,token=owner)
 suffix=uuid.uuid4().hex
 destination=request('operator create destinations','POST','/admin/destinations',201,{'name':'Temporary auth verification','slug':'auth-verification-'+suffix},operator)
 fixtures['destinations'].append(destination['id'])
 bodies={
  'hotels':{'destination_id':destination['id'],'name':'Temporary auth verification','lat':float(hotel['lat']),'lng':float(hotel['lng']),'price_per_night':hotel['price_per_night'],'stay_type':hotel['stay_type']},
  'attractions':{'destination_id':destination['id'],'name':'Temporary auth verification','lat':float(attraction['lat']),'lng':float(attraction['lng']),'duration_hours':float(attraction['duration_hours']),'category':attraction['category'],'entry_fee_numeric':float(attraction['entry_fee_numeric']) if attraction['entry_fee_numeric'] is not None else None},
  'restaurants':{'destination_id':destination['id'],'name':'Temporary auth verification','lat':float(restaurant['lat']),'lng':float(restaurant['lng']),'avg_cost_per_person':restaurant['avg_cost_per_person']},
 }
 for resource,body in bodies.items():fixtures[resource].append(request('operator create '+resource,'POST','/admin/'+resource,201,body,operator)['id'])
 for resource in fixtures:
  identifier=fixtures[resource][0]
  request('operator read '+resource,'GET','/admin/'+resource+'/'+identifier,200,token=operator)
  request('operator update '+resource,'PUT','/admin/'+resource+'/'+identifier,200,{'name':'Temporary auth verification updated'},operator)
 for resource in ['attractions','restaurants','hotels','destinations']:
  identifier=fixtures[resource][0];request('operator delete '+resource,'DELETE','/admin/'+resource+'/'+identifier,204,token=operator)
  request('deleted '+resource+' unavailable','GET','/admin/'+resource+'/'+identifier,404,token=operator)
 report['verified']=True
finally:
 sql("const fixtures=JSON.parse(process.argv[1]);for(const table of ['attractions','restaurants','hotels','destinations'])if(fixtures[table].length)await pool.query('DELETE FROM '+table+' WHERE id=ANY($1::uuid[])',[fixtures[table]]);await pool.query('DELETE FROM users WHERE id=ANY($1::uuid[])',[JSON.parse(process.argv[2])]);",json.dumps(fixtures),json.dumps(users))
 report['catalogPreserved']=before==snapshot()
 assert report['catalogPreserved']
 (ROOT/'backend/reports/final-auth-review.txt').write_text(json.dumps(report,indent=2),encoding='utf-8')
 print(json.dumps(report))
