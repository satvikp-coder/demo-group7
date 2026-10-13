// Isolated browser server. Default provider double; live mode explicitly opted in by runner.
import {createApp} from "../server.js";
import {createChatRouter} from "../routes/chatRoutes.js";
import {createChatService} from "../services/chatService.js";
import {chatConfig} from "../chat/config.js";
import {HttpError} from "../middleware/errorHandler.js";
if(process.env.NODE_ENV!=="test"||!/^\/heritage_chat_[a-f0-9]{32}$/.test(new URL(process.env.DATABASE_URL).pathname))throw Error("Isolated test database required");
const provider=async({messages})=>{
 const last=messages.at(-1),question=[...messages].reverse().find(m=>m.role==="user")?.content??"";
 await new Promise(r=>setTimeout(r,150));
 if(question.includes("TEST_RATE_LIMIT")){const error=new HttpError(429,"Heritage Guide has reached its temporary free usage limit. Please try again later.");error.retryAfter=60;throw error;}
 if(question.includes("TEST_PROVIDER_FAILURE"))throw new HttpError(503,"Heritage Guide AI is temporarily unavailable.");
 if(last.role!=="tool")return {choices:[{message:{role:"assistant",content:null,tool_calls:[{id:"test-call",type:"function",function:{name:"search_destinations",arguments:JSON.stringify({query:"Modhera"})}}]},finish_reason:"tool_calls"}]};
 const data=JSON.parse(last.content);return {choices:[{message:{role:"assistant",content:question.includes("TEST_HTML")?'<img src=x onerror="window.chatUnsafe=1">':"TEST PROVIDER — "+data.destinations.map(d=>d.name).join(", ")},finish_reason:"stop"}]};
};
createApp({chatRouter:createChatRouter({chat:createChatService({config:chatConfig(),...(process.env.CHAT_TEST_LIVE_PROVIDER==="true"?{}:{provider})})})}).listen(Number(process.env.PORT),"127.0.0.1");
