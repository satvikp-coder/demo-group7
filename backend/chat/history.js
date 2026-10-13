import {createHash,createCipheriv,createDecipheriv,randomBytes} from "node:crypto";
import {HttpError} from "../middleware/errorHandler.js";
export function historyCodec(secret,maxHistory=8,now=()=>Date.now()){
 const key=createHash("sha256").update("heritage-guide-history-v1:"+secret).digest();
 return {
  seal(userId,messages,destinations=[]){const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key,iv);cipher.setAAD(Buffer.from(userId));
   const bounded=messages.slice(-maxHistory);while(bounded.length>2&&Buffer.byteLength(JSON.stringify(bounded),"utf8")>32000)bounded.splice(0,2);
   const bytes=Buffer.concat([cipher.update(JSON.stringify({expires:now()+30*60000,messages:bounded,destinations:destinations.slice(-8)}),"utf8"),cipher.final()]);
   return Buffer.concat([iv,cipher.getAuthTag(),bytes]).toString("base64url");},
  open(userId,token){if(!token)return [];
   try{const b=Buffer.from(token,"base64url");if(b.length<29||b.length>36000)throw Error();const cipher=createDecipheriv("aes-256-gcm",key,b.subarray(0,12));cipher.setAAD(Buffer.from(userId));cipher.setAuthTag(b.subarray(12,28));
    const value=JSON.parse(Buffer.concat([cipher.update(b.subarray(28)),cipher.final()]).toString("utf8"));
    if(value.expires<now()||!Array.isArray(value.messages)||value.messages.length>maxHistory||value.messages.some(m=>!["user","assistant"].includes(m.role)||typeof m.content!=="string"||m.content.length>6000))throw Error();
    const destinations=value.destinations??[];
    if(!Array.isArray(destinations)||destinations.length>8||destinations.some(d=>typeof d.name!=="string"||d.name.length>100||typeof d.id!=="string"||!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(d.id)))throw Error();
    return Object.assign(value.messages,{destinations});
   }catch{throw new HttpError(400,"Conversation expired or invalid. Clear the conversation and try again.");}}
 };
}
