import {z} from "zod";
const integer=(value,fallback,min,max)=>{const n=Number(value??fallback);return Number.isInteger(n)&&n>=min&&n<=max?n:fallback;};
export function chatConfig(source=process.env) {
 return Object.freeze({
  apiKey:source.GROQ_API_KEY??"",model:["openai/gpt-oss-20b","openai/gpt-oss-120b"].includes(source.GROQ_MODEL)?source.GROQ_MODEL:"openai/gpt-oss-120b",
  freeConfirmed:source.CHAT_FREE_PLAN_CONFIRMED==="true",mock:source.CHAT_MOCK==="true"||source.CHAT_MOCK==="1",
  rateLimit:integer(source.CHAT_RATE_LIMIT,6,1,20),maxHistory:2*Math.floor(integer(source.CHAT_MAX_HISTORY,8,2,12)/2),
  maxOutputTokens:integer(source.CHAT_MAX_OUTPUT_TOKENS,700,128,1200),dailyCalls:integer(source.CHAT_DAILY_CALL_LIMIT,60,1,100),
  timeoutMs:integer(source.CHAT_TIMEOUT_MS,18000,1000,25000),maxRounds:3,maxTools:8,concurrency:2
 });
}
export const chatBodySchema=z.object({
 message:z.string().trim().min(1).max(1500),
 history_token:z.string().max(50000).optional(),
 language:z.enum(["en","hi","gu"]).default("en"),
 context_trip_id:z.string().uuid().optional(),
 mode:z.enum(["ai","database"]).default("ai"),
 lookup:z.object({tool:z.enum(["search_destinations","get_attractions","get_hotels","get_restaurants","get_trip","get_budget","get_app_help"]),arguments:z.record(z.string(),z.unknown())}).strict().optional()
}).strict().superRefine((body,ctx)=>{
 if(body.mode==="database"&&!body.lookup)ctx.addIssue({code:"custom",message:"Choose a database lookup",path:["lookup"]});
 if(body.mode==="ai"&&body.lookup)ctx.addIssue({code:"custom",message:"AI requests cannot inject tool calls",path:["lookup"]});
});
