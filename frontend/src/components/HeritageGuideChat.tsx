import React,{useState,useRef} from "react";
import {MessageCircle} from "lucide-react";
import type {Destination} from "../api/types";
import {useLanguage} from "../context/LanguageContext";
const Panel=React.lazy(()=>import("./HeritageGuidePanel"));
interface Props {key?:string;userId:string|null;destinations:Destination[];tripId?:string;onLogin:()=>void;}
export function HeritageGuideChat(props:Props){
 const {language}=useLanguage();
 const label={en:"Open Heritage Guide",hi:"Heritage Guide खोलें",gu:"Heritage Guide ખોલો"}[language];
 const [open,setOpen]=useState(false),[opened,setOpened]=useState(false);
 const launcher=useRef<HTMLButtonElement>(null);
 function close(){setOpen(false);requestAnimationFrame(()=>launcher.current?.focus());}
 return <>
  <button ref={launcher} type="button" aria-label={label} aria-expanded={open} aria-controls="heritage-guide-panel"
   onClick={()=>{setOpened(true);setOpen(value=>!value);}}
   className="fixed right-4 bottom-5 sm:right-6 z-[45] w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full bg-[#0b1f3a] text-[#d4af37] shadow-lg border border-[#d4af37]/40 flex items-center justify-center hover:bg-[#142f50] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]" style={{bottom:"max(20px, env(safe-area-inset-bottom))"}}>
   <MessageCircle aria-hidden="true" size={24}/>
  </button>
  {opened&&<React.Suspense fallback={null}><Panel {...props} open={open} onClose={close}/></React.Suspense>}
 </>;
}
