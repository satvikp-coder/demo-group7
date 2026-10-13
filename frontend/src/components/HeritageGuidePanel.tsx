import React,{useState,useRef,useEffect} from "react";
import {X,Send,Trash2} from "lucide-react";
import {api,ApiError,session} from "../api";
import {useLanguage} from "../context/LanguageContext";
import type {Destination} from "../api/types";
const COPY={
 en:{subtitle:"Your Gujarat Tourism Assistant",welcome:"Ask about Gujarat destinations, hotels or your saved itinerary.",privacy:"AI messages and relevant facts are sent to Groq. Chat stays in memory and clears on logout.",login:"Sign in to chat",send:"Send",close:"Close Heritage Guide",clear:"Clear conversation",input:"Ask Heritage Guide",loading:"Looking up information…",retry:"Retry",offline:"Database-only mode (not AI)",ai:"Groq AI",lookup:"Look up",city:"Destination",kind:"Information",unavailable:"AI unavailable. You can use database-only mode.",suggestions:["Tell me about Modhera.","What does Budget mean?","Explain the distance, cost and rating priorities."]},
 hi:{subtitle:"आपका गुजरात पर्यटन सहायक",welcome:"गुजरात के स्थलों, होटलों या अपनी सहेजी गई यात्रा के बारे में पूछें।",privacy:"AI संदेश और संबंधित जानकारी Groq को भेजी जाती है। बातचीत केवल मेमोरी में रहती है और लॉगआउट पर मिट जाती है।",login:"बातचीत के लिए साइन इन करें",send:"भेजें",close:"Heritage Guide बंद करें",clear:"बातचीत मिटाएँ",input:"Heritage Guide से पूछें",loading:"जानकारी खोज रहे हैं…",retry:"फिर कोशिश करें",offline:"केवल डेटाबेस मोड (AI नहीं)",ai:"Groq AI",lookup:"जानकारी देखें",city:"स्थान",kind:"जानकारी",unavailable:"AI उपलब्ध नहीं है। केवल डेटाबेस मोड इस्तेमाल कर सकते हैं।",suggestions:["मोढेरा के बारे में बताओ।","Budget श्रेणी का क्या अर्थ है?","दूरी, लागत और रेटिंग की प्राथमिकताएँ समझाओ।"]},
 gu:{subtitle:"તમારો ગુજરાત પ્રવાસ સહાયક",welcome:"ગુજરાતનાં સ્થળો, હોટેલો અથવા તમારી સાચવેલી મુસાફરી વિશે પૂછો.",privacy:"AI સંદેશા અને સંબંધિત માહિતી Groqને મોકલવામાં આવે છે. વાતચીત માત્ર મેમરીમાં રહે છે અને લૉગઆઉટ પર દૂર થાય છે.",login:"વાતચીત માટે સાઇન ઇન કરો",send:"મોકલો",close:"Heritage Guide બંધ કરો",clear:"વાતચીત દૂર કરો",input:"Heritage Guideને પૂછો",loading:"માહિતી શોધી રહ્યા છીએ…",retry:"ફરી પ્રયાસ કરો",offline:"માત્ર ડેટાબેસ મોડ (AI નથી)",ai:"Groq AI",lookup:"માહિતી જુઓ",city:"સ્થળ",kind:"માહિતી",unavailable:"AI ઉપલબ્ધ નથી. માત્ર ડેટાબેસ મોડ વાપરી શકો છો.",suggestions:["મોઢેરા વિશે જણાવો.","Budget શ્રેણીનો અર્થ શું છે?","અંતર, ખર્ચ અને રેટિંગની પ્રાથમિકતાઓ સમજાવો."]}
};
type Message={role:"user"|"assistant";text:string;database?:boolean};
function databaseText(data:unknown,language:"en"|"hi"|"gu"):string{
 const d=data as Record<string,any>;
 const words={en:{unknown:"Unknown",price:"Nightly room estimate",fee:"Entry fee",duration:"Visit hours",hours:"Opening hours",rating:"Stored rating",meals:"Meal estimate per person",distance:"Approximate straight-line km",hotel:"Accommodation",attractions:"Attractions",total:"Known subtotal",remaining:"Remaining known balance",failed:"Information unavailable. Check the selection and try again."},hi:{unknown:"अज्ञात",price:"अनुमानित प्रति रात कमरे की दर",fee:"प्रवेश शुल्क",duration:"भ्रमण के घंटे",hours:"खुलने का समय",rating:"संग्रहीत रेटिंग",meals:"प्रति व्यक्ति भोजन का अनुमान",distance:"अनुमानित सीधी दूरी किमी",hotel:"आवास",attractions:"दर्शनीय स्थल",total:"ज्ञात उप-योग",remaining:"ज्ञात शेष राशि",failed:"जानकारी उपलब्ध नहीं है। चयन जाँचकर फिर कोशिश करें।"},gu:{unknown:"અજ્ઞાત",price:"રાત્રિ દીઠ રૂમનો અંદાજ",fee:"પ્રવેશ ફી",duration:"મુલાકાતના કલાકો",hours:"ખુલવાનો સમય",rating:"સંગ્રહિત રેટિંગ",meals:"વ્યક્તિ દીઠ ભોજનનો અંદાજ",distance:"અંદાજિત સીધું અંતર કિમી",hotel:"રહેઠાણ",attractions:"જોવાલાયક સ્થળો",total:"જાણીતો પેટા સરવાળો",remaining:"જાણીતી બાકી રકમ",failed:"માહિતી ઉપલબ્ધ નથી. પસંદગી તપાસીને ફરી પ્રયાસ કરો."}}[language];
 if(!d||d.error)return words.failed;
 const value=(v:any)=>v==null?words.unknown:String(v),money=(v:any)=>v==null?words.unknown:"₹"+Number(v).toLocaleString("en-IN");
 if(d.information)return String(d.information);
 if(d.trip)return ["Trip: "+d.trip.id,...(d.stops??[]).map((s:any)=>"Day "+s.day_number+": "+s.name+" · "+s.arrival_time+"–"+s.departure_time+" · "+money(s.cost))].join("\n");
 if("total" in d)return [words.hotel+": "+money(d.hotel),words.attractions+": "+money(d.attractions),words.meals+": "+money(d.meals),words.total+": "+money(d.total),words.remaining+": "+money(d.remaining),d.cost_basis??""].join("\n");
 const rows=d.hotels??d.records??d.destinations??[];
 return [d.destination??"",...rows.map((r:any)=>{
  const lines=[language==="hi"?r.hindi_name??r.name:language==="gu"?r.gujarati_name??r.name:r.name];
  if("price_per_night" in r)lines.push(words.price+": "+money(r.price_per_night),r.price_basis,r.hotel_category??"");
  if("entry_fee_numeric" in r)lines.push(words.fee+": "+(r.entry_fee??money(r.entry_fee_numeric)),words.duration+": "+value(r.duration_hours),words.hours+": "+value(r.opening_time)+"–"+value(r.closing_time));
  if("avg_cost_per_person" in r)lines.push(words.meals+": "+money(r.avg_cost_per_person));
  if("rating" in r)lines.push(words.rating+": "+value(r.rating));
  if("distance_km" in r)lines.push(words.distance+": "+(r.distance_km==null?words.unknown:Number(r.distance_km).toFixed(2)),r.anchor_name??"");
  if(r.description)lines.push(r.description);return lines.filter(Boolean).join("\n");
 }),d.basis??""].filter(Boolean).join("\n\n")||words.failed;
}
function SafeChatText({text}:{text:string}){return <>{text.split(/(\*\*[^*\n]+\*\*)/g).map((part,index)=>part.startsWith("**")&&part.endsWith("**")?<strong key={index}>{part.slice(2,-2)}</strong>:part)}</>;}
interface Props{userId:string|null;destinations:Destination[];tripId?:string;onLogin:()=>void;open:boolean;onClose:()=>void;}
export default function HeritageGuidePanel({userId,destinations,tripId,onLogin,open,onClose}:Props){
 const {language,getName}=useLanguage(),c=COPY[language];
 const [messages,setMessages]=useState<Message[]>([]),[text,setText]=useState(""),[pending,setPending]=useState(false),[error,setError]=useState("");
 const [mode,setMode]=useState<"ai"|"database">("ai"),[city,setCity]=useState(""),[kind,setKind]=useState("get_attractions");
 const [retry,setRetry]=useState<Parameters<typeof api.chat>[0]|null>(null),[height,setHeight]=useState(480);
 const [cooldown,setCooldown]=useState(0);
 const history=useRef<string|undefined>(undefined),busy=useRef(false),controller=useRef<AbortController|null>(null);
 const input=useRef<HTMLTextAreaElement>(null),end=useRef<HTMLDivElement>(null);
 useEffect(()=>()=>{controller.current?.abort();},[]);
 useEffect(()=>{if(cooldown<=0)return;const timer=setTimeout(()=>setCooldown(value=>Math.max(0,value-1)),1000);return()=>clearTimeout(timer);},[cooldown]);
 useEffect(()=>{
  function clear(){controller.current?.abort();history.current=undefined;setMessages([]);setError("");setRetry(null);}
  window.addEventListener("heritage-auth-change",clear);return()=>window.removeEventListener("heritage-auth-change",clear);
 },[]);
 useEffect(()=>{if(open){input.current?.focus();end.current?.scrollIntoView({block:"nearest"});}},[open]);
 useEffect(()=>{if(!open)return;const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();onClose();}};window.addEventListener("keydown",escape);return()=>window.removeEventListener("keydown",escape);},[open,onClose]);
 useEffect(()=>{if(open)end.current?.scrollIntoView({block:"nearest"});},[messages,pending,open]);
 useEffect(()=>{const resize=()=>setHeight(Math.max(180,Math.min(480,(window.visualViewport?.height??window.innerHeight)-105)));resize();window.visualViewport?.addEventListener("resize",resize);return()=>window.visualViewport?.removeEventListener("resize",resize);},[]);
 function clear(){if(busy.current)return;history.current=undefined;setMessages([]);setError("");setRetry(null);input.current?.focus();}
 async function send(payload:Parameters<typeof api.chat>[0],isRetry=false){
  if(busy.current||!userId||!session.token()||(payload.mode!=="database"&&cooldown>0))return;
  busy.current=true;setPending(true);setError("");setRetry(null);
  const token=session.token();controller.current=new AbortController();
  if(!isRetry)setMessages(previous=>[...previous,{role:"user",text:payload.message}].slice(-24));
  setText("");
  try{
   const result=await api.chat({...payload,...(tripId&&payload.mode!=="database"?{context_trip_id:tripId}:{})},controller.current.signal);
   if(session.token()!==token)return;
   history.current=result.history_token??undefined;
   const reply=result.mode==="database"?(language==="en"?result.reply:c.offline)+"\n\n"+databaseText(result.data,language):result.reply;
   setMessages(previous=>[...previous,{role:"assistant",text:reply,database:result.mode==="database"}].slice(-24));
  }catch(e){
   if((e as Error).name==="AbortError"||session.token()!==token)return;
   if(e instanceof ApiError&&e.status===429)setCooldown(e.retryAfter??60);
   setError(e instanceof ApiError&&e.status===401?c.login:(e as Error).message||c.unavailable);setRetry(payload);
  }finally{busy.current=false;setPending(false);}
 }
 function submit(question=text){
  if(!question.trim())return;
  send({message:question.trim(),language,mode:"ai",history_token:history.current});
 }
 function lookup(){
  const args=kind==="get_app_help"?{topic:"categories"}:kind==="get_trip"||kind==="get_budget"?{tripId}:{destinationId:city};
  if((kind==="get_trip"||kind==="get_budget")?!tripId:kind!=="get_app_help"&&!city)return;
  send({message:kind,language,mode:"database",lookup:{tool:kind,arguments:args}});
 }
 return <section id="heritage-guide-panel" hidden={!open} role="dialog" aria-modal="false" aria-label="Heritage Guide"
  onKeyDown={e=>{if(e.key==="Escape"){e.stopPropagation();onClose();}}}
  className="fixed right-4 sm:right-6 z-[45] w-[340px] max-w-[calc(100vw-32px)] rounded-2xl border border-[#d4af37]/40 bg-white shadow-2xl overflow-hidden text-[#0b1f3a]"
  style={{bottom:"max(84px, calc(env(safe-area-inset-bottom) + 70px))",height,display:open?"flex":"none",flexDirection:"column"}}>
  <header className="bg-[#0b1f3a] text-white p-3 flex items-center gap-2">
   <div className="flex-1"><h2 className="font-semibold text-[#d4af37]">Heritage Guide</h2><p className="text-xs">{c.subtitle}</p></div>
   <button aria-label={c.clear} onClick={clear} disabled={pending} className="p-2 rounded hover:bg-white/10 focus-visible:outline-2"><Trash2 size={16}/></button>
   <button aria-label={c.close} onClick={onClose} className="p-2 rounded hover:bg-white/10 focus-visible:outline-2"><X size={18}/></button>
  </header>
  <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3" aria-label="Conversation">
   <p className="text-sm">{c.welcome}</p><p className="text-[11px] text-slate-600">{c.privacy}</p>
   {!userId?<button className="rounded-lg bg-[#0b1f3a] text-white px-3 py-2" onClick={onLogin}>{c.login}</button>:<>
    {!messages.length&&c.suggestions.map(q=><button key={q} disabled={pending} onClick={()=>submit(q)} className="block text-left text-xs border border-[#d4af37]/50 rounded-lg px-3 py-2 hover:bg-amber-50">{q}</button>)}
    <div role="log" aria-live="polite" aria-relevant="additions" className="space-y-2">
     {messages.map((m,i)=><div key={i} data-chat-role={m.role} className={`text-sm rounded-xl p-2 whitespace-pre-wrap break-words ${m.role==="user"?"bg-[#0b1f3a] text-white ml-5":"bg-slate-100 mr-3"}`} style={{overflowWrap:"anywhere"}}><SafeChatText text={m.text}/></div>)}
    </div>
    {pending&&<p role="status" className="text-xs">{c.loading}</p>}
    {error&&<div role="alert" className="text-xs text-red-700"><p>{error}{cooldown>0?` (${cooldown}s)`:""}</p>{retry&&<button disabled={pending||(retry.mode!=="database"&&cooldown>0)} onClick={()=>send(retry,true)} className="underline p-1 disabled:opacity-50">{c.retry}</button>}</div>}
    <div ref={end}/>
   </>}
  </div>
  {userId&&<div className="border-t border-slate-200 p-3 space-y-2">
   <label className="text-xs flex items-center gap-2"><input type="checkbox" checked={mode==="database"} disabled={pending} onChange={e=>setMode(e.target.checked?"database":"ai")}/>{c.offline}</label>
   {mode==="database"?<div className="space-y-2">
    <label className="block text-xs">{c.kind}<select aria-label={c.kind} className="block w-full border rounded p-1" value={kind} onChange={e=>setKind(e.target.value)}>
     <option value="get_attractions">{language==="en"?"Attractions":language==="hi"?"दर्शनीय स्थल":"જોવાલાયક સ્થળો"}</option>
     <option value="get_hotels">{language==="en"?"Hotels":language==="hi"?"होटल":"હોટેલો"}</option>
     <option value="get_restaurants">{language==="en"?"Restaurants":language==="hi"?"रेस्तराँ":"રેસ્ટોરન્ટ"}</option>
     <option value="get_app_help">{language==="en"?"Hotel categories":language==="hi"?"होटल श्रेणियाँ":"હોટેલ શ્રેણીઓ"}</option>
     {tripId&&<><option value="get_trip">{language==="en"?"Current saved trip":language==="hi"?"सहेजी यात्रा":"સાચવેલી મુસાફરી"}</option><option value="get_budget">{language==="en"?"Known budget":language==="hi"?"ज्ञात बजट":"જાણીતું બજેટ"}</option></>}
    </select></label>
    {!["get_app_help","get_trip","get_budget"].includes(kind)&&<label className="block text-xs">{c.city}<select aria-label={c.city} value={city} onChange={e=>setCity(e.target.value)} className="block w-full border rounded p-1"><option value="">—</option>{destinations.map(d=><option key={d.id} value={d.id}>{getName(d)}</option>)}</select></label>}
    <button onClick={lookup} disabled={pending||(!["get_app_help","get_trip","get_budget"].includes(kind)&&!city)} className="rounded bg-[#0b1f3a] text-white px-3 py-1 text-sm disabled:opacity-50">{c.lookup}</button>
   </div>:<form className="flex gap-2 items-end" onSubmit={e=>{e.preventDefault();submit();}}>
    <textarea ref={input} aria-label={c.input} placeholder={c.input} rows={2} maxLength={1500} value={text} disabled={pending} onChange={e=>setText(e.target.value)}
     onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();submit();}}}
     className="resize-none flex-1 min-w-0 border border-slate-300 rounded-lg p-2 text-sm focus:outline-[#d4af37]"/>
    <button type="submit" aria-label={c.send} disabled={pending||cooldown>0||!text.trim()} className="p-2 rounded-lg bg-[#0b1f3a] text-[#d4af37] disabled:opacity-40"><Send size={18}/></button>
   </form>}
  </div>}
 </section>;
}
