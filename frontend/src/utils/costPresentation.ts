export type CostCategory = {state: 'KNOWN_ZERO'|'KNOWN_POSITIVE'|'UNKNOWN'; known_subtotal: number; amount: number|null};
export function costLabel(category?: CostCategory): string {
  if(!category || category.state==='UNKNOWN')return category && category.known_subtotal>0 ? `\u20b9${category.known_subtotal.toLocaleString('en-IN')} known; additional price unavailable` : 'Price unavailable';
  return `\u20b9${category.amount!.toLocaleString('en-IN')}`;
}
export function stopCostLabel(cost:number,type:string,state?:string):string {
  if(!Number.isFinite(cost)||cost<0||state==='UNKNOWN')return 'Price unavailable';
  if(cost>0)return `\u20b9${cost.toLocaleString('en-IN')}`;
  if(type==='hotel')return 'No room charge at this stop';
  return state==='KNOWN_ZERO'?'\u20b90 (recorded zero charge)':'Price unavailable';
}
