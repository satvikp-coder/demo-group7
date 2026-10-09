export type PriorityWeights={distance:number;cost:number;rating:number};
export const DEFAULT_WEIGHTS:PriorityWeights={distance:34,cost:33,rating:33};
export const STRATEGY_WEIGHTS:Record<string,PriorityWeights>={"distance-first":{distance:80,cost:10,rating:10},"budget-first":{distance:10,cost:80,rating:10},"rating-first":{distance:10,cost:10,rating:80}};
export const PRIORITIES=['distance','cost','rating'] as const;
export function validWeights(value:unknown):value is PriorityWeights {
 if(!value||typeof value!=='object')return false;
 const row=value as Record<string,unknown>;
 return Object.keys(row).length===3&&PRIORITIES.every(k=>typeof row[k]==='number'&&Number.isInteger(row[k])&&Number(row[k])>=0&&Number(row[k])<=100)&&PRIORITIES.reduce((s,k)=>s+Number(row[k]),0)===100;
}
// The other priorities preserve their ratio. Integer rounding is assigned in stable key order.
export function adjustWeight(weights:PriorityWeights,key:keyof PriorityWeights,value:number):PriorityWeights {
 if(!validWeights(weights)||!Number.isFinite(value))throw new Error('Invalid priority weights');
 const next=Math.max(0,Math.min(100,Math.round(value))),others=PRIORITIES.filter(k=>k!==key),remaining=100-next,total=weights[others[0]]+weights[others[1]];
 const first=total?Math.round(remaining*weights[others[0]]/total):Math.floor(remaining/2);
 return {...weights,[key]:next,[others[0]]:first,[others[1]]:remaining-first};
}
export function utility(value:number|null,values:(number|null)[],lowerIsBetter:boolean):number {
 if(value===null||!Number.isFinite(value))return 0;
 const known=values.filter((x):x is number=>x!==null&&Number.isFinite(x));if(!known.length)return 0;
 const min=Math.min(...known),max=Math.max(...known);if(min===max)return 1;
 const scaled=Math.max(0,Math.min(1,(value-min)/(max-min)));return lowerIsBetter?1-scaled:scaled;
}
export function weightedScore(utilities:PriorityWeights,weights:PriorityWeights):number {
 if(!validWeights(weights)||!PRIORITIES.every(k=>Number.isFinite(utilities[k])&&utilities[k]>=0&&utilities[k]<=1))throw new Error('Invalid utilities or weights');
 return PRIORITIES.reduce((total,key)=>total+weights[key]*utilities[key]/100,0);
}
