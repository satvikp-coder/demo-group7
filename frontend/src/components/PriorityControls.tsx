import React from 'react';
import {adjustWeight,DEFAULT_WEIGHTS,PRIORITIES,type PriorityWeights} from '../../../dsa/planning/priorities';
export function PriorityControls({value,onChange}:{value:PriorityWeights;onChange:(value:PriorityWeights)=>void}) {
 return <fieldset className="bg-white border border-stone/40 p-4 space-y-3 rounded-xl col-span-1 md:col-span-2"><legend className="font-display text-ink font-bold">Your Priorities · 100%</legend>
 {PRIORITIES.map(key=><label key={key} htmlFor={'priority-'+key} className="block font-mono text-xs capitalize">{key}: <output>{value[key]}%</output><input id={'priority-'+key} aria-label={key+' priority'} type="range" min="0" max="100" step="1" value={value[key]} onChange={e=>onChange(adjustWeight(value,key,Number(e.target.value)))} className="w-full accent-gold cursor-pointer"/></label>)}
 <p className="text-xs text-stone">Changing one priority redistributes the rest in their current ratio, rounded to whole percentages. If both are zero, the remainder is split evenly. Total always stays 100%.</p><button type="button" onClick={()=>onChange({...DEFAULT_WEIGHTS})} className="text-xs border border-gold text-ink px-3 py-1 rounded-lg">Reset priorities (34 / 33 / 33)</button>
 </fieldset>;
}
