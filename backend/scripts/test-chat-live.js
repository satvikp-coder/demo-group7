// Opt-in live Groq verification. Requires owner-confirmed Free Plan. No upgrades/fallbacks.
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {writeFileSync} from "node:fs";
import {pool} from "../config/database.js";
import {runTool} from "../chat/toolHandlers.js";
import {createChatService} from "../services/chatService.js";
import {createGroqProvider} from "../services/groqService.js";
import {chatConfig} from "../chat/config.js";
if(process.env.CHAT_FREE_PLAN_CONFIRMED!=="true"||!process.env.GROQ_API_KEY||!/^\/heritage_chat_[a-f0-9]{32}$/.test(new URL(process.env.DATABASE_URL).pathname))throw Error("Confirmed Free Plan and isolated database required");
const config=chatConfig(),owner=randomUUID(),report={startedAt:new Date().toISOString(),provider:"Groq",model:config.model,plan:"Free Plan confirmed by owner; API does not expose billing plan",verified:false,questions:[],calls:0,tokens:0};
const provider=createGroqProvider(config),toolEvents=[];
const service=createChatService({config,provider:async(payload,options)=>{const response=await provider(payload,options);report.calls++;report.tokens+=response.usage?.total_tokens??0;report.freeLimitHeaders=response.freeLimitHeaders??report.freeLimitHeaders;return response;},tool:async(name,args,context)=>{const data=await runTool(name,args,context);toolEvents.push({name,args,result:data});return data;}});
try{
 const cities=await runTool("search_destinations",{query:"Modhera"},{userId:owner}),city=cities.destinations[0];assert(city);
 const hotel=(await pool.query("SELECT id FROM hotels WHERE destination_id=$1 AND price_per_night IS NOT NULL ORDER BY price_per_night,id LIMIT 1",[city.id])).rows[0];
 await pool.query("INSERT INTO users(id,name,email,password_hash,role) VALUES($1,'Live isolated guide fixture',$2,'not-a-login-hash','tourist')",[owner,owner+"@example.test"]);
 const trip=(await pool.query("INSERT INTO trips(user_id,destination_id,trip_days,budget,starting_hotel_id,start_time,strategy,wheelchair_accessible_only) VALUES($1,$2,1,5000,$3,'09:00','distance-first',false) RETURNING id",[owner,city.id,hotel.id])).rows[0];
 await pool.query("INSERT INTO itinerary_stops(trip_id,day_number,stop_order,stop_type,reference_id,name,arrival_time,departure_time,duration_minutes,cost) VALUES($1,1,1,'hotel',$2,'Isolated hotel ledger','09:00','09:15',15,500)",[trip.id,hotel.id]);
 const questions=[
  ["en","Tell me about Modhera."],
  ["en","What are the attractions there?"],
  ["en","Which hotel has the lowest known price near Modhera?"],
  ["en","Where can I eat in Saputara?"],
  ["en","What does Budget mean?"],
  ["en","Explain the distance, cost and rating priorities."],
  ["en","Summarize my saved trip "+trip.id],
  ["en","What is the known budget breakdown for my trip "+trip.id+"?"],
  ["hi","सोमनाथ में घूमने की जगहें बताओ।"],
  ["gu","સોમનાથમાં જોવા લાયક સ્થળો કયા છે?"],
  ["en","Is a room currently available tonight in Modhera? Can you book it?"],
  ["en","Why does Good Night Hotel in Ahmedabad have no usable current price?"]
 ];
 let history;
 for(let i=0;i<questions.length;i++){
  if(process.env.CHAT_LIVE_CASES&&!process.env.CHAT_LIVE_CASES.split(",").map(Number).includes(i+1))continue;
  if(report.questions.length)await new Promise(r=>setTimeout(r,62000)); // No quota retries; conservative separation between live questions.
  const [language,message]=questions[i],start=Date.now();toolEvents.length=0;
  let inspectedReply=null;
  try{
   const result=await service(owner,{message,language,...(i===1?{history_token:history}:{})});
   inspectedReply=result.reply;
   // Verify that null admission data is not verbalized as free/no fee.
   const plain=result.reply.normalize("NFKC").replace(/\*+/g,"").replace(/\s+/g," ");
   const attractions=toolEvents.filter(e=>e.name==="get_attractions").flatMap(e=>e.result.records??[]);
   for(const attraction of attractions.filter(a=>a.entry_fee_numeric==null)){
    const name=attraction.name.normalize("NFKC"),index=plain.indexOf(name);
    if(index<0)continue;
    const other=attractions.map(a=>plain.indexOf(a.name.normalize("NFKC"),index+name.length)).filter(i=>i>index);
    const segment=plain.slice(index,other.length?Math.min(...other):plain.length).replace(/no fee (information|details|data)/gi,"unknown admission information");
    assert(!/\bfree\b|\bno (entry )?fee\b|मुफ्त|મફત/i.test(segment),"Unknown admission was incorrectly described as free: "+name);
   }
   if(i===0)history=result.history_token;
   assert(toolEvents.length>0);assert(!toolEvents.some(e=>e.result.error));
   if(i===0)assert.match(result.reply,/Modhera|મોઢેરા/i);
   if(i===1)assert(toolEvents.some(e=>e.name==="get_attractions"));
   if(i===2){const actual=toolEvents.find(e=>e.name==="get_hotels")?.result;assert(actual?.hotels.length);const normalized=text=>text.normalize("NFKC").replace(/\s+/g," ");assert(normalized(result.reply).includes(normalized(actual.hotels[0].name)));assert(result.reply.replaceAll(",","").includes(String(actual.hotels[0].price_per_night)));assert.match(result.reply,/straight.line/i);}
   if(i===3)assert(toolEvents.some(e=>e.name==="get_restaurants"));
   if(i===6)assert(toolEvents.some(e=>e.name==="get_trip"));
   if(i===7){assert(toolEvents.some(e=>e.name==="get_budget"));assert.match(result.reply,/500/);assert.match(result.reply,/subtotal|recorded|known/i);assert.match(result.reply,/unknown|unrecorded|exclud|not includ/i);assert(!/entry fee unknown/i.test(result.reply));}
   if(language==="hi"||language==="gu")assert(toolEvents.some(e=>e.name==="get_attractions"&&e.result.destination==="Somnath"&&e.result.records.length>0));
   if(language==="hi")assert(/[\u0900-\u097f]/.test(result.reply));
   if(language==="gu")assert(/[\u0a80-\u0aff]/.test(result.reply));
   if(i===10)assert.match(result.reply,/no live|cannot|can't|not.*(available|booking|book)|don.t have/i);
   if(i===11){const property=toolEvents.find(e=>e.name==="get_hotels")?.result.hotels?.find(h=>h.name==="Hotel Good Night");assert(property&&property.price_per_night===null&&property.historical_price_per_night===1700);assert.match(result.reply,/2014/);assert.match(result.reply,/historical|old|outdated|not.*current/i);}
   report.questions.push({index:i+1,language,question:message.replace(trip.id,"[isolated-trip]"),reply:result.reply.replaceAll(trip.id,"[isolated-trip]"),tools:toolEvents.map(e=>e.name),passed:true,durationMs:Date.now()-start});
  }catch(error){report.questions.push({index:i+1,language,passed:false,status:error.status??null,providerStatus:error.providerStatus??null,providerCode:error.providerCode??null,testDiagnostic:error.testDiagnostic??null,error:error.message,reply:inspectedReply,tools:toolEvents.map(e=>({name:e.name,result:e.result}))});break;}
  writeFileSync(new URL(process.env.CHAT_LIVE_CASES?"../../reports/heritage-guide-live-targeted.json":"../../reports/heritage-guide-live.json",import.meta.url),JSON.stringify(report,null,2));console.log("Live question "+(i+1)+" grounded: PASS");
 }
 report.expectedQuestions=process.env.CHAT_LIVE_CASES?process.env.CHAT_LIVE_CASES.split(",").length:questions.length;
 report.verified=report.questions.length===report.expectedQuestions&&report.questions.every(q=>q.passed);
 if(!report.verified)process.exitCode=1;
}finally{await pool.end();report.finishedAt=new Date().toISOString();writeFileSync(new URL(process.env.CHAT_LIVE_CASES?"../../reports/heritage-guide-live-targeted.json":"../../reports/heritage-guide-live.json",import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify({verified:report.verified,questions:report.questions.length,calls:report.calls,tokens:report.tokens}));}
