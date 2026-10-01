// Only explicit scalar metadata is accepted. Never serialize request/error objects.
const fields = new Set(['requestId','method','path','status','durationMs','code','port','signal','scope','active','idle','waiting']);
export function log(event, metadata = {}, level = 'info') {
  const safe = Object.fromEntries(Object.entries(metadata).filter(([key,value]) => fields.has(key) && ['string','number','boolean'].includes(typeof value)));
  const record = JSON.stringify({time: new Date().toISOString(), level, event, ...safe});
  (level === 'error' ? console.error : console.log)(record);
}
