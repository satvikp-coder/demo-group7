import { useEffect, useRef, useState } from "react";
import type { Destination, Attraction, Hotel, Restaurant } from "./types";
import type { GeneratedItineraryResult, PlannerConfigPayload, OptimizationStrategy } from "../utils/itineraryPlanner";

type Row = Record<string, any>;
export interface SessionUser { id: string; name: string; email: string; role: "tourist" | "operator" }
const BASE_URL = (import.meta.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "heritage_api_token";
export const session = {
  token: () => sessionStorage.getItem(TOKEN_KEY),
  clear: () => { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem("heritage_api_trip_ids"); sessionStorage.removeItem("heritage_api_hidden_trip_ids"); window.dispatchEvent(new Event("heritage-auth-change")); },
};
export class ApiError extends Error { constructor(message: string, public status = 0) { super(message); } }
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Request failed";
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!BASE_URL) throw new ApiError("Set VITE_API_BASE_URL to the backend API URL.");
  const token = session.token();
  let response: Response;
  try {
    response = await fetch(BASE_URL + path, { ...options, cache: "no-store", headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers,
    }});
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new ApiError("Unable to reach the server. Please try again.");
  }
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // A response started by an old session must not sign out a newer login.
    if (response.status === 401 && token && session.token() === token) session.clear();
    const issues = body?.error?.issues?.map((issue: Row) => `${issue.path}: ${issue.message}`).join("; ");
    throw new ApiError(issues || body?.error?.message || `Request failed (${response.status})`, response.status);
  }
  if (body === null || typeof body !== "object") {
    throw new ApiError("Server returned an invalid response.", response.status);
  }
  return body as T;
}
function sessionUserFromResponse(user: Row): SessionUser {
  if (!user || !["id", "name", "email"].every(key => typeof user[key] === "string" && user[key].length > 0)
    || !["tourist", "tour_operator"].includes(user.role)) {
    throw new ApiError("Server returned an invalid account response.");
  }
  return {...user, role:user.role === "tour_operator" ? "operator" : "tourist"} as SessionUser;
}
function budgetFromResponse(budget: Row): Row {
  if (!budget || typeof budget.trip_id !== "string"
    || !["budget", "hotel", "attractions", "meals", "transit", "total", "remaining"].every(key => typeof budget[key] === "number" && Number.isFinite(budget[key]))) {
    throw new ApiError("Server returned an invalid budget response.");
  }
  return budget;
}
function snapshotFromResponse(dto: Row): Row {
  if (!dto.trip || typeof dto.trip.id !== "string" || !Array.isArray(dto.days)
    || !dto.days.every((day: Row) => day && Array.isArray(day.stops))) {
    throw new ApiError("Server returned an invalid itinerary response.");
  }
  budgetFromResponse(dto.budget);
  if (dto.budget.trip_id !== dto.trip.id) throw new ApiError("Server returned a budget for a different trip.");
  return dto;
}
const idPath = (id: string) => encodeURIComponent(id);
function catalogRecordFromResponse(row: Row): Row {
  if (!row || Array.isArray(row) || !["id", "name"].every(key => typeof row[key] === "string" && row[key].trim().length > 0)) {
    throw new ApiError("Server returned an invalid catalog record.");
  }
  return row;
}
async function all(path: string, signal?: AbortSignal): Promise<Row[]> {
  const rows: Row[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await request<Row[]>(`${path}${path.includes("?") ? "&" : "?"}limit=100&offset=${offset}`, { signal });
    if (!Array.isArray(page)) throw new ApiError("Server returned an invalid collection response.");
    rows.push(...page.map(catalogRecordFromResponse));
    if (page.length < 100) return rows;
  }
}
export const displayNumber = (value: number, digits?: number) => Number.isFinite(value) ? (digits == null ? value.toLocaleString("en-IN") : value.toFixed(digits)) : "Not available";
const number = (value: any) => value == null ? Number.NaN : Number(value);
const label = (value: any) => value == null ? "Not available" : String(value);
const money = (value: any) => value == null ? "Not available" : `₹${Number(value).toLocaleString("en-IN")}`;
// External catalog imagery has no established redistribution/hotlink permission
// and currently fails at its source. Preserve source URLs in DB provenance; render
// only project-owned assets through the existing category fallback component.
export const catalogImage = (value: unknown): string => typeof value === "string" && /^\/assets\/[a-z0-9/_-]+\.(?:svg|png|jpe?g|webp)$/i.test(value) ? value : "";
function camel(row: Row): Row {
  return Object.fromEntries(Object.entries(row).map(([key,value]) => [key.replace(/_([a-z])/g, (_,c)=>c.toUpperCase()),value]));
}
export function attractionFromRow(row: Row): Attraction {
  return { ...camel(row), id:row.id,name:row.name,lat:number(row.lat),lng:number(row.lng),
    imageUrl:catalogImage(row.image_url),durationHours:number(row.duration_hours),rating:number(row.rating),category:label(row.category),
    entryFee:row.entry_fee ?? money(row.entry_fee_numeric),entryFeeNumeric:number(row.entry_fee_numeric),
    wheelchairAccessible:row.wheelchair_accessible ?? undefined,physicalDemand:row.physical_demand ?? undefined } as Attraction;
}
export function hotelFromRow(row: Row): Hotel {
  return { ...camel(row),id:row.id,name:row.name,lat:number(row.lat),lng:number(row.lng),
    pricePerNight:money(row.price_per_night),priceNumeric:number(row.price_per_night),
    rating:label(row.rating),ratingNumeric:number(row.rating),tier:row.tier ?? "Not available",
    stayType:row.stay_type,location:label(row.location),description:[row.description, row.source_date ? `Published room estimate checked ${String(row.source_date).slice(0,10)}; confirm current rates and availability.` : "Catalog room estimate; confirm current rates and availability."].filter(Boolean).join(" "),
    valueScore:number(row.value_score),imageUrl:catalogImage(row.image_url) } as Hotel;
}
export function restaurantFromRow(row: Row): Restaurant {
  return { ...camel(row),id:row.id,name:row.name,lat:number(row.lat),lng:number(row.lng),
    imageUrl:catalogImage(row.image_url),rating:number(row.rating),avgCostPerPerson:number(row.avg_cost_per_person),location:label(row.location) } as Restaurant;
}
export function destinationFromRow(row: Row): Destination {
  return { ...camel(row), id:row.id,name:row.name,district:label(row.district),location:label(row.location),
    category:label(row.category),officialCategory:row.official_category ?? "Not available",tag:row.tag ?? "",
    rating:label(row.rating),ratingValue:number(row.rating),entryFee:row.entry_fee ?? money(row.entry_fee_numeric),
    entryFeeNumeric:number(row.entry_fee_numeric),bestTime:label(row.best_time),
    distanceFromAhmedabad:label(row.distance_from_ahmedabad),distanceNumeric:number(row.distance_numeric),
    duration:label(row.duration),avgVisitTime:label(row.avg_visit_time),imageUrl:catalogImage(row.image_url),
    imageAlt:row.image_alt ?? row.name,description:row.description ?? "",highlights:row.highlights ?? [],
    attractions:[],hotels:[],restaurants:[],nearbyAttractions:[],nearbyHotels:[],
    seasonalAdvisory:row.seasonal_note ? {note:row.seasonal_note,activeMonths:row.seasonal_active_months ?? [],
      gujaratiNote:row.seasonal_gujarati_note,hindiNote:row.seasonal_hindi_note,peakWindowLabel:row.seasonal_peak_window_label} : undefined,
  } as Destination;
}
// Internal empty shape prevents render-time property errors; loading/error guards never display it as catalog data.
export const EMPTY_DESTINATION = destinationFromRow({id:"",name:""});
export const api = {
  async destinations(signal?: AbortSignal) { return (await all("/destinations",signal)).map(destinationFromRow); },
  async search(prefix: string, signal?: AbortSignal) {
    if (!prefix.trim()) return api.catalog(signal);
    const rows = await all(`/destinations/search?prefix=${encodeURIComponent(prefix.trim())}`,signal);
    return Promise.all(rows.map(row=>api.destination(row.id,signal)));
  },
  async destination(id: string, signal?: AbortSignal): Promise<Destination> {
    const base = `/destinations/${idPath(id)}`;
    const [row,attractions,hotels,restaurants] = await Promise.all([
      request<Row>(base,{signal}),all(base+"/attractions",signal),all(base+"/hotels",signal),all(base+"/restaurants",signal),
    ]);
    return {...destinationFromRow(catalogRecordFromResponse(row)),attractions:attractions.map(attractionFromRow),hotels:hotels.map(hotelFromRow),restaurants:restaurants.map(restaurantFromRow)};
  },
  async catalog(signal?: AbortSignal): Promise<Destination[]> {
    return (await all("/destinations/catalog",signal)).map(row => {
      for (const resource of ["attractions","hotels","restaurants"]) {
        if (!Array.isArray(row[resource])) throw new ApiError("Server returned an invalid catalog collection.");
        row[resource].forEach((child: Row) => {
          catalogRecordFromResponse(child);
          if (child.destination_id !== row.id) throw new ApiError("Server returned a catalog record for a different destination.");
        });
      }
      return {...destinationFromRow(row),attractions:row.attractions.map(attractionFromRow),hotels:row.hotels.map(hotelFromRow),restaurants:row.restaurants.map(restaurantFromRow)};
    });
  },
  async hotels(id: string, sort: string, signal?: AbortSignal) {
    return (await all(`/destinations/${idPath(id)}/hotels?sort=${encodeURIComponent(sort)}`,signal)).map(hotelFromRow);
  },
  async login(email: string,password: string): Promise<SessionUser> {
    const result=await request<Row>("/auth/login",{method:"POST",body:JSON.stringify({email,password})});
    const user = sessionUserFromResponse(result.user);
    if (typeof result.token !== "string" || !result.token.trim()) throw new ApiError("Server returned an invalid authentication token.");
    sessionStorage.setItem(TOKEN_KEY,result.token);
    window.dispatchEvent(new Event("heritage-auth-change"));
    return user;
  },
  register: (name:string,email:string,password:string,role:string) => request("/auth/register",{method:"POST",body:JSON.stringify({name,email,password,role:role==="operator"?"tour_operator":"tourist"})}),
  async me(signal?:AbortSignal): Promise<SessionUser|null> {
    if(!session.token()) return null;
    const {user}=await request<Row>("/auth/me",{signal});
    return sessionUserFromResponse(user);
  },
  async createTrip(config: PlannerConfigPayload) {
    const start = config.startTime.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if(!start) throw new ApiError("Enter a valid starting time.");
    let hour=Number(start[1]);
    if(start[3]) hour=hour%12+(start[3].toUpperCase()==="PM"?12:0);
    const created = await request<Row>("/trips",{method:"POST",body:JSON.stringify({destination_id:config.cityId,days:config.tripDays,
      budget:config.budget,starting_hotel_id:config.startingHotelId,start_time:`${String(hour).padStart(2,"0")}:${start[2]}`,
      strategy:config.strategy ?? "distance-first",wheelchair_accessible_only:config.wheelchairAccessibleOnly ?? false})});
    const ids = JSON.parse(sessionStorage.getItem("heritage_api_trip_ids") || "[]");
    sessionStorage.setItem("heritage_api_trip_ids", JSON.stringify([...new Set([...ids,created.trip.id])]));
    return created;
  },
  generate: (id:string,preferences:Row={}) => request<Row>(`/trips/${idPath(id)}/generate-itinerary`,{method:"POST",body:JSON.stringify(preferences)}).then(snapshotFromResponse),
  savedTrips: (signal?:AbortSignal) => all('/trips',signal),
  trip: (id:string,signal?:AbortSignal) => id ? request<Row>(`/trips/${idPath(id)}`,{signal}).then(snapshotFromResponse) : Promise.reject(new ApiError("Generate a persisted trip first.")),
  budget: (id:string,signal?:AbortSignal) => id ? request<Row>(`/trips/${idPath(id)}/budget`,{signal}).then(budgetFromResponse) : Promise.reject(new ApiError("Generate a persisted trip first.")),
  adminList: (resource:string,signal?:AbortSignal) => all(`/admin/${idPath(resource)}`,signal),
  adminSave: async (resource:string,id:string|undefined,body:Row) => catalogMutation(request<Row>(`/admin/${idPath(resource)}${id?`/${idPath(id)}`:""}`,{method:id?"PUT":"POST",body:JSON.stringify(body)})),
  adminDelete: async (resource:string,id:string) => catalogMutation(request<void>(`/admin/${idPath(resource)}/${idPath(id)}`,{method:"DELETE"})),
};

async function catalogMutation<T>(mutation: Promise<T>) {
  const result = await mutation;
  window.dispatchEvent(new Event("heritage-catalog-change"));
  return result;
}

// Request state is keyed to input identity: old data is hidden immediately on a key
// change, not one effect later. Aborted/out-of-order responses never replace new data.
export function useApi<T>(load:(signal:AbortSignal)=>Promise<T>, keys: unknown[], enabled=true, debounceMs=0) {
  const key=JSON.stringify([enabled,...keys]), loader=useRef(load); loader.current=load;
  const [revision,setRevision]=useState(0);
  const [state,setState]=useState<{key:string;revision:number;data?:T;error?:string;loading:boolean}>({key:"",revision:-1,loading:true});
  useEffect(()=>{
    if(!enabled) { setState({key,revision,loading:false}); return; }
    const controller=new AbortController();
    setState({key,revision,loading:true});
    const timer=setTimeout(()=>{
      loader.current(controller.signal).then(data=>{
        if(!controller.signal.aborted) setState({key,revision,data,loading:false});
      }).catch(error=>{
        if(!controller.signal.aborted) setState({key,revision,error:errorMessage(error),loading:false});
      });
    },debounceMs);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[key,revision,enabled,debounceMs]);
  const current=enabled && state.key===key && state.revision===revision ? state : {loading:enabled,data:undefined,error:undefined};
  return {...current,reload:()=>setRevision(value=>value+1)};
}
export function useCatalog(enabled=true) {
  const [catalogRevision,setCatalogRevision]=useState(0);
  useEffect(()=>{
    const refresh=()=>setCatalogRevision(value=>value+1);
    window.addEventListener("heritage-catalog-change",refresh);
    return ()=>window.removeEventListener("heritage-catalog-change",refresh);
  },[]);
  return useApi(signal=>api.catalog(signal),["catalog",catalogRevision],enabled);
}

export function configFromTrip(trip:Row): PlannerConfigPayload & {tripId:string} {
  const hour=Number(trip.start_time.slice(0,2));
  const startTime=`${String(hour%12 || 12).padStart(2,"0")}:${trip.start_time.slice(3,5)} ${hour>=12 ? "PM" : "AM"}`;
  return {tripId:trip.id,cityId:trip.destination_id,tripDays:trip.trip_days,budget:trip.budget,
    startingHotelId:trip.starting_hotel_id,startTime,strategy:trip.strategy,
    wheelchairAccessibleOnly:trip.wheelchair_accessible_only};
}
// Presentation-only adaptation of persisted rows. No route selection or itinerary generation.
export function persistedItinerary(dto:Row,city:Destination): GeneratedItineraryResult & {tripId:string;warning?:string} {
  const summary=dto.trip.generation_summary ?? {}, legs=summary.legs ?? [];
  const dayPlans=dto.days.map((day:Row)=>{
    const stops=day.stops.map((s:Row,index:number)=>({id:s.id,referenceId:s.reference_id,
      legDistanceKm: s.reference_id === day.stops[index+1]?.reference_id ? 0 : legs.find((l:Row)=>l.day_number===day.day_number && l.from===s.reference_id && l.to===day.stops[index+1]?.reference_id)?.distance_km,type:s.stop_type,name:s.name,
      category:s.category ?? "",arrivalTime:s.arrival_time,departureTime:s.departure_time,durationMinutes:s.duration_minutes,
      cost:number(s.cost),location:s.location ?? "",lat:number(s.lat),lng:number(s.lng),imageUrl:catalogImage(s.image_url),
      description:s.description ?? "",wheelchairAccessible:s.wheelchair_accessible ?? undefined,
      physicalDemand:s.physical_demand ?? undefined,bestTimeNote:s.best_time_note ?? undefined}));
    const sum=(type:string)=>stops.filter((s:Row)=>s.type===type).reduce((n:number,s:Row)=>n+s.cost,0);
    const km=legs.filter((l:Row)=>l.day_number===day.day_number).reduce((n:number,l:Row)=>n+Number(l.distance_km),0);
    return {dayNumber:day.day_number,dateLabel:`DAY ${day.day_number}`,title:city.name,stops,totalKm:km,
      roadKm:legs.length ? Number.NaN : 0,boatKm:legs.length ? Number.NaN : 0,totalCost:stops.reduce((n:number,s:Row)=>n+s.cost,0),hotelCost:sum("hotel"),
      attractionCost:sum("attraction"),mealCost:sum("meal"),transitCost:sum("transit")};
  });
  const allStops=dayPlans.flatMap((d:Row)=>d.stops);
  const hotelStop=allStops.find((s:Row)=>s.type==="hotel");
  const hotel=hotelFromRow({id:dto.trip.starting_hotel_id,name:hotelStop?.name ?? "Not available",
    lat:hotelStop?.lat,lng:hotelStop?.lng,price_per_night:hotelStop?.cost});
  const minutes=allStops.reduce((n:number,s:Row)=>n+Number(s.durationMinutes ?? 0),0)+legs.reduce((n:number,l:Row)=>n+Number(l.minutes),0);
  const warnings:string[]=["Costs use catalog price snapshots, not live quotes. Confirm current tariffs, opening hours and availability before travel."];
  if(summary.warnings?.includes("reverse_route_estimate_unverified")) warnings.push("Some return-road estimates reuse forward evidence; reverse routing is unverified for those legs.");
  if(summary.status==="incomplete") warnings.push("The saved itinerary is incomplete: routes, accessible attractions, time or budget may be unavailable.");
  if(summary.hotel_over_budget) warnings.push("Your selected hotel exceeds the budget and has been retained.");
  if(dto.budget.transport_cost_known===false) warnings.push("Transport fares are unknown and excluded from the saved total.");
  return {tripId:dto.trip.id,strategy:dto.trip.strategy,strategyName:dto.trip.strategy,strategyTagline:"",
    activeCity:city,startingHotel:hotel,dayPlans,totalCost:dto.budget.total,hotelTotalCost:dto.budget.hotel,
    attractionTotalCost:dto.budget.attractions,mealTotalCost:dto.budget.meals,transitTotalCost:dto.budget.transit,
    totalDistanceKm:dayPlans.reduce((n:number,d:Row)=>n+d.totalKm,0),roadDistanceKm:dayPlans.reduce((n:number,d:Row)=>n+d.roadKm,0),boatDistanceKm:legs.length ? Number.NaN : 0,
    attractionCount:allStops.filter((s:Row)=>s.type==="attraction").length,totalRuntimeMinutes:minutes,totalRuntimeHours:`${(minutes/60).toFixed(1)} hrs`,
    stats:{attractionsConsidered:city.attractions.length,attractionsVisited:allStops.filter((s:Row)=>s.type==="attraction").length,
      directRoadConnectionsUsed:summary.routing?.direct_route_hits ?? 0,dijkstraFallbackCalls:summary.routing?.dijkstra_calls ?? 0,
      nodesVisited:Number.NaN,edgesRelaxed:Number.NaN,executionTimeMs:Number.NaN},warning:warnings.join(" "),
  };
}
export async function loadItinerary(id:string,signal?:AbortSignal) {
  const dto=await api.trip(id,signal);
  const city=await api.destination(dto.trip.destination_id,signal);
  return {dto,config:configFromTrip(dto.trip),result:persistedItinerary(dto,city)};
}
export async function createItinerary(config:PlannerConfigPayload,strategy:OptimizationStrategy=config.strategy ?? "distance-first") {
  const {trip}=await api.createTrip({...config,strategy});
  await api.generate(trip.id);
  return loadItinerary(trip.id);
}

export function generateComparisonTakeaway(
  results: GeneratedItineraryResult[],
): string {
  const bRes = results.find((r) => r.strategy === "budget-first");
  const rRes = results.find((r) => r.strategy === "rating-first");
  const dRes = results.find((r) => r.strategy === "distance-first");

  if (!bRes || !rRes || !dRes) {
    return "Comparison generated across budget, rating, and distance optimization strategies.";
  }

  const costDiff = rRes.totalCost - bRes.totalCost;
  const attrDiff = rRes.attractionCount - bRes.attractionCount;

  // Highest distance strategy minus distance-first strategy
  const maxDist = Math.max(rRes.totalDistanceKm, bRes.totalDistanceKm);
  const distSaved = Math.max(
    0,
    Math.round((maxDist - dRes.totalDistanceKm) * 10) / 10,
  );

  let statement = "";

  if (costDiff > 0) {
    statement = `Budget-first saves ₹${costDiff.toLocaleString("en-IN")} compared to Rating-first`;
  } else if (costDiff < 0) {
    statement = `Rating-first achieves ₹${Math.abs(costDiff).toLocaleString("en-IN")} lower expenditure`;
  } else {
    statement = `Budget-first and Rating-first both operate at ₹${bRes.totalCost.toLocaleString("en-IN")}`;
  }

  if (distSaved > 0) {
    statement += `, while Distance-first reduces total transit by ${distSaved} km.`;
  } else {
    statement += `, while Distance-first minimizes intra-city transit times.`;
  }

  return statement;
}
