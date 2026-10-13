import Groq from "groq-sdk";
import {HttpError} from "../middleware/errorHandler.js";
import {chatConfig} from "../chat/config.js";
export const FREE_LIMIT_MESSAGE="Heritage Guide has reached its temporary free usage limit. Please try again later.";
export function createGroqProvider(config=chatConfig(),client){
 let groq=client;
 return async function askModel(payload,{signal}={}){
  if(config.mock)throw new HttpError(503,"Test mock mode is not a live AI provider.");
  if(!config.apiKey||!config.freeConfirmed)throw new HttpError(503,"Heritage Guide AI is disabled until a Groq Free-plan key and Free-plan confirmation are configured. Database-only mode remains available.");
  groq??=new Groq({apiKey:config.apiKey,maxRetries:0,timeout:config.timeoutMs});
  try{
   const pending=groq.chat.completions.create({model:config.model,temperature:0,reasoning_effort:"low",max_completion_tokens:config.maxOutputTokens,...payload},{signal,timeout:config.timeoutMs,maxRetries:0});
   if(typeof pending.withResponse!=="function")return await pending;
   const {data,response}=await pending.withResponse();
   return {...data,freeLimitHeaders:Object.fromEntries(["x-ratelimit-limit-requests","x-ratelimit-limit-tokens","x-ratelimit-remaining-requests","x-ratelimit-remaining-tokens"].map(key=>[key,response.headers.get(key)]))};
  }
  catch(error){
   if(error.status===429){const e=new HttpError(429,FREE_LIMIT_MESSAGE);const raw=error.headers?.get?.("retry-after");const n=Number(raw);e.retryAfter=raw&&Number.isFinite(n)?Math.min(86400,Math.max(1,Math.ceil(n))):60;throw e;}
   if(error.name==="AbortError"||/timeout/i.test(error.name??""))throw new HttpError(504,"Heritage Guide timed out. Please try again later.");
   const failure=new HttpError(503,"Heritage Guide AI is temporarily unavailable. Try database-only mode or retry later.");
   failure.providerStatus=error.status??null;
   failure.providerCode=error.error?.error?.code??error.error?.code??null;
   if(process.env.NODE_ENV==="test"&&/^\/heritage_chat_[a-f0-9]{32}$/.test(new URL(process.env.DATABASE_URL).pathname))failure.testDiagnostic=String(error.error?.error?.failed_generation??error.error?.failed_generation??error.error?.error?.message??error.error?.message??"").slice(0,2000).replaceAll(config.apiKey,"[redacted]");
   throw failure;
  }
 };
}
