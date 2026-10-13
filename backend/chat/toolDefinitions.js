const uuid={type:"string",format:"uuid",description:"Actual UUID returned by application tools, not an invented ID"};
const destination={destinationId:uuid};
const definitions=[
 ["search_destinations","Find supported destinations by English/Hindi/Gujarati name or partial name. Empty query lists supported destinations.",{query:{type:"string",maxLength:60}},["query"]],
 ["get_attractions","Read destination attractions: fees, duration, hours, accessibility and stored descriptions. Null means unknown.",destination,["destinationId"]],
 ["get_hotels","Read real hotels with usable indicative prices, unknown/historical prices, categories and straight-line proximity. Use hotelName for questions about a specific property. Never live availability.",{...destination,hotelName:{type:"string",maxLength:80},tier:{type:"string",enum:["Low Cost","Budget","Premium"]},sortBy:{type:"string",enum:["price","rating","distance"]}},["destinationId"]],
 ["get_restaurants","Read real destination restaurants and known indicative meal costs.",destination,["destinationId"]],
 ["get_trip","Read only the authenticated owner's saved trip, limited scheduled stops and advisories.",{tripId:uuid},["tripId"]],
 ["get_budget","Read only the authenticated owner's saved known-cost budget, excluding unknown fares.",{tripId:uuid},["tripId"]],
 ["get_app_help","Explain implemented categories, priorities, planning, private links, deletion, PDF or cost limitations.",{topic:{type:"string",enum:["planning","categories","priorities","saving","deletion","pdf","private_links","costs"]}},["topic"]]
];
export const TOOL_DEFINITIONS=definitions.map(([name,description,properties,required])=>({type:"function",function:{name,description,parameters:{type:"object",properties,required,additionalProperties:false}}}));
