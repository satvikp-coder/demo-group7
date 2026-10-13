import {Router} from "express";
import {verifyJwt,verifyAccount} from "../middleware/auth.js";
import {limiter} from "../middleware/production.js";
import {HttpError} from "../middleware/errorHandler.js";
import {chat as defaultChat} from "../services/chatService.js";
import {chatConfig} from "../chat/config.js";
export function createChatRouter({chat=defaultChat,auth=[verifyJwt,verifyAccount],rateLimit=chatConfig().rateLimit}={}){
 const router=Router();
 router.post("/",...auth,limiter("chat",rateLimit,60000,true),async(req,res,next)=>{
  if(!req.is("application/json"))throw new HttpError(415,"Chat requires application/json.");
  const controller=new AbortController(),abort=()=>controller.abort();
  res.once("close",abort);
  try{res.json(await chat(req.user.id,req.body,{signal:controller.signal}));}
  catch(error){if(error.retryAfter)res.set("Retry-After",String(error.retryAfter));next(error);}
  finally{res.removeListener("close",abort);}
 });
 return router;
}
export default createChatRouter();
