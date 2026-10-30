import {HttpError} from "../middleware/errorHandler.js";
import {chatConfig} from "../chat/config.js";

export const FREE_LIMIT_MESSAGE="Heritage Guide has reached its temporary free usage limit. Please try again later.";
export function createNvidiaProvider(config=chatConfig(),fetchImpl=globalThis.fetch){
 return async function askModel(payload,{signal}={}){
  if(!config.apiKey)throw new HttpError(503,"Heritage Guide AI is not configured. Database-only mode remains available.");
  const controller=new AbortController(),abort=()=>controller.abort();
  signal?.addEventListener("abort",abort,{once:true});
  if(signal?.aborted)abort();
  const timeout=setTimeout(abort,Math.min(config.timeoutMs,15000));
  try{
   const response=await fetchImpl("https://integrate.api.nvidia.com/v1/chat/completions",{
    method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${config.apiKey}`},
    body:JSON.stringify({...payload,model:config.model,temperature:0,max_tokens:config.maxOutputTokens,stream:false}),signal:controller.signal,
   });
   if(response.status===429){
    const error=new HttpError(429,FREE_LIMIT_MESSAGE),raw=response.headers.get("retry-after"),n=Number(raw);
    error.retryAfter=raw&&Number.isFinite(n)?Math.min(86400,Math.max(1,Math.ceil(n))):60;
    throw error;
   }
   if(!response.ok)throw new HttpError(503,"Heritage Guide AI is temporarily unavailable. Try database-only mode or retry later.");
   return await response.json();
  }catch(error){
   if(controller.signal.aborted||error.name==="AbortError"||error.name==="TimeoutError")throw new HttpError(504,"Heritage Guide timed out. Please try again later.");
   if(error instanceof HttpError)throw error;
   throw new HttpError(503,"Heritage Guide AI is temporarily unavailable. Try database-only mode or retry later.");
  }finally{clearTimeout(timeout);signal?.removeEventListener("abort",abort);}
 };
}
