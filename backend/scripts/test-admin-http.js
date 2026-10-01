// Real curl, Step 3 registration/login tokens, and PostgreSQL. Only this run's
// uniquely identified records are created/updated/deleted; original rows are preserved.
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdir, writeFile } from "node:fs/promises";
import { startServer } from "../server.js";
import { pool } from "../config/database.js";
import { destinationSearchCache } from "../services/destinationSearchCache.js";

const resources = ["destinations","attractions","hotels","restaurants"];
const ids = Object.fromEntries(resources.map(resource=>[resource,randomUUID()]));
const userIds = [];
const exchanges = [], roleResults = [];
let server, baseUrl, verified = false, cleanupCompleted = false, originalCatalogPreserved = false;
const jsonValue = value => JSON.parse(JSON.stringify(value));
function redact(value) {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key,item])=>
    [key,["password","token","password_hash"].includes(key)?"[redacted]":redact(item)]));
}
async function request(method,path,body,token,expected,role) {
  const args=["--silent","--show-error","--max-time","30","--request",method,
    "--write-out","\n%{http_code}",baseUrl+path];
  if(body!==undefined) args.push("--header","Content-Type: application/json","--data-binary","@-");
  if(token) args.push("--header","Authorization: Bearer "+token);
  const child=spawn(process.platform==="win32"?"curl.exe":"curl",args,
    {windowsHide:true,stdio:["pipe","pipe","pipe"]});
  let output="",error="";
  child.stdout.on("data",chunk=>{output+=chunk;});
  child.stderr.on("data",chunk=>{error+=chunk;});
  child.stdin.end(body===undefined?undefined:JSON.stringify(body));
  const [code]=await once(child,"close");
  assert.equal(code,0,error);
  const split=output.lastIndexOf("\n"), status=Number(output.slice(split+1));
  const raw=output.slice(0,split), result=raw?JSON.parse(raw):null;
  exchanges.push({request:{method,path,role,body:redact(body),...(token?{authorization:"Bearer [redacted]"}:{})},
    response:{status,body:redact(result)}});
  assert.equal(status,expected,`${method} ${path}: ${JSON.stringify(result)}`);
  if(expected===403) assert.deepEqual(result,{error:{message:"Access denied"}});
  return result;
}
async function login(role) {
  const email=`admin-crud-${randomUUID()}@example.test`, password="Aa1!"+randomBytes(24).toString("hex");
  const registration=await request("POST","/api/auth/register",{name:"Admin CRUD test",email,password,role},undefined,201,role);
  userIds.push(registration.user.id);
  const login=await request("POST","/api/auth/login",{email,password},undefined,200,role);
  assert.equal(login.user.role,role);
  // Confirm the token is accepted by existing middleware and backed by a real account.
  const me=await request("GET","/api/auth/me",undefined,login.token,200,role);
  assert.equal(me.user.role,role);
  return login.token;
}
async function snapshot() {
  const result={};
  for(const table of [...resources,"routes","destination_nearby_attractions","destination_nearby_hotels"])
    result[table]=jsonValue((await pool.query(`SELECT * FROM ${table} ORDER BY to_jsonb(${table})::text`)).rows);
  return result;
}
async function row(resource) {
  return jsonValue((await pool.query(`SELECT * FROM ${resource} WHERE id=$1`,[ids[resource]])).rows[0]??null);
}
const original=await snapshot();
try {
  server=await startServer(0);
  if(!server.listening) await once(server,"listening");
  baseUrl="http://127.0.0.1:"+server.address().port;
  const tourist=await login("tourist"), operator=await login("tour_operator");
  const common={destination_id:ids.destinations,lat:23,lng:72,source:"Temporary synthetic admin CRUD test record"};
  const bodies={
    destinations:{name:"Admin test destination "+ids.destinations,slug:"admin-test-"+ids.destinations},
    attractions:{...common,name:"Admin test attraction",category:"test",duration_hours:1,entry_fee_numeric:25,wheelchair_accessible:true},
    hotels:{...common,name:"Admin test hotel",price_per_night:1000,stay_type:"Registered Hotel"},
    restaurants:{...common,name:"Admin test restaurant",avg_cost_per_person:100},
  };
  for(const resource of resources) {
    const path=`/api/admin/${resource}/${ids[resource]}`;
    await request("POST",path,bodies[resource],tourist,403,"tourist");
    assert.equal(await row(resource),null,"Tourist POST must not insert");
    await request("POST",path,bodies[resource],undefined,401,"unauthenticated");
    const created=await request("POST",path,bodies[resource],operator,201,"tour_operator");
    assert.deepEqual(created,await row(resource));
    assert.equal(created.id,ids[resource]);
    roleResults.push({resource,method:"POST",tourist:403,tour_operator:201,touristChangedDatabase:false});
    await request("POST",path,bodies[resource],operator,409,"tour_operator");
    await request("GET",path,undefined,tourist,403,"tourist");
    assert.deepEqual(await request("GET",path,undefined,operator,200,"tour_operator"),created);
    await request("GET",`/api/admin/${resource}`,undefined,tourist,403,"tourist");
    const list=await request("GET",`/api/admin/${resource}?limit=100`,undefined,operator,200,"tour_operator");
    assert.ok(list.some(item=>item.id===ids[resource]));

    const update={name:created.name+" updated"};
    await request("PUT",path,update,tourist,403,"tourist");
    assert.deepEqual(await row(resource),created,"Tourist PUT must not alter any column");
    await request("PUT",path,update,undefined,401,"unauthenticated");
    const updated=await request("PUT",path,update,operator,200,"tour_operator");
    assert.equal(updated.name,update.name);
    assert.deepEqual(updated,await row(resource));
    roleResults.push({resource,method:"PUT",tourist:403,tour_operator:200,touristChangedDatabase:false});
    await request("PUT",path,{id:randomUUID()},operator,400,"tour_operator");
    await request("PUT",path,{role:"tour_operator"},tourist,403,"tourist");
    await request("PUT",path,{},operator,400,"tour_operator");
    await request("PUT",`/api/admin/${resource}/${randomUUID()}`,update,operator,404,"tour_operator");
    await request("GET",`/api/admin/${resource}/not-a-uuid`,undefined,operator,400,"tour_operator");
    await request("POST",`/api/admin/${resource}/${randomUUID()}`,{},operator,400,"tour_operator");
  }
  // Committed destination/attraction edits must be visible through the cached public search.
  const search=await request("GET","/api/destinations/search?prefix="+encodeURIComponent("Admin test attraction updated"),undefined,undefined,200);
  assert.ok(search.some(d=>d.id===ids.destinations));
  const hotelPath=`/api/admin/hotels/${ids.hotels}`;
  await request("PUT",hotelPath,{price_per_night:-1},operator,400,"tour_operator");
  await request("PUT",hotelPath,{provenance_status:"independently_verified"},operator,400,"tour_operator");
  await request("POST",`/api/admin/hotels/${randomUUID()}`,{...bodies.hotels,destination_id:randomUUID()},operator,422,"tour_operator");

  // Existing trips protect their selected hotel and destination from deletion.
  const trip=await request("POST","/api/trips",{destination_id:ids.destinations,days:1,budget:2000,
    starting_hotel_id:ids.hotels,start_time:"08:00"},tourist,201,"tourist");
  await request("DELETE",hotelPath,undefined,operator,409,"tour_operator");
  await request("DELETE",`/api/admin/destinations/${ids.destinations}`,undefined,operator,409,"tour_operator");
  await pool.query("DELETE FROM trips WHERE id=$1 AND user_id=$2",[trip.trip.id,userIds[0]]);

  // Children first so each DELETE succeeds independently without a parent's cascade.
  for(const resource of ["attractions","hotels","restaurants","destinations"]) {
    const path=`/api/admin/${resource}/${ids[resource]}`, before=await row(resource);
    await request("DELETE",path,undefined,tourist,403,"tourist");
    assert.deepEqual(await row(resource),before,"Tourist DELETE must preserve the record");
    await request("DELETE",path,undefined,undefined,401,"unauthenticated");
    await request("DELETE",path,undefined,operator,204,"tour_operator");
    assert.equal(await row(resource),null);
    roleResults.push({resource,method:"DELETE",tourist:403,tour_operator:204,touristChangedDatabase:false});
    await request("DELETE",path,undefined,operator,404,"tour_operator");
  }
  assert.deepEqual(await request("GET","/api/destinations/search?prefix="+encodeURIComponent(bodies.destinations.name),undefined,undefined,200),[]);
  // Collection POST is also available for clients that want server-generated UUIDs.
  await request("POST","/api/admin/destinations",bodies.destinations,tourist,403,"tourist");
  const generated=await request("POST","/api/admin/destinations",bodies.destinations,operator,201,"tour_operator");
  ids.destinations=generated.id;
  await request("DELETE",`/api/admin/destinations/${generated.id}`,undefined,operator,204,"tour_operator");
  verified=true;
} finally {
  // Remove only test-owned IDs, even on assertion failure. No catalog-wide reset.
  for(const id of userIds) await pool.query("DELETE FROM users WHERE id=$1",[id]);
  for(const resource of ["attractions","hotels","restaurants","destinations"])
    await pool.query(`DELETE FROM ${resource} WHERE id=$1`,[ids[resource]]);
  cleanupCompleted=true;
  originalCatalogPreserved=JSON.stringify(await snapshot())===JSON.stringify(original);
  await destinationSearchCache.stop();
  if(server) await new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()));
  await mkdir(new URL("../reports/",import.meta.url),{recursive:true});
  await writeFile(new URL("../reports/admin-http-report.json",import.meta.url),JSON.stringify({
    verified:verified&&originalCatalogPreserved,generatedAt:new Date().toISOString(),client:"curl",baseUrl,
    authentication:"Real Step 3 registration/login JWTs for tourist and tour_operator; auth/me confirms roles.",
    cleanupCompleted,originalCatalogPreserved,roleResults,exchanges,
  },null,2)+"\n");
  await pool.end();
}
assert.ok(originalCatalogPreserved,"Original catalog must remain byte-for-byte equivalent as JSON rows");
console.log(JSON.stringify({verified,cleanupCompleted,originalCatalogPreserved,roleResults},null,2));
