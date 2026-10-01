import React, { useState, useEffect, useRef } from "react";
import { api, useApi, errorMessage } from "../api";
import { HotelData } from "./HotelsView";
import { useLanguage } from "../context/LanguageContext";

import {
  Building2,
  MapPin,
  Compass,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Info,
  ArrowLeft,
  CheckCircle2,
  Layers,
  Utensils,
} from "lucide-react";

export interface AdminDestinationItem {
  id: string;
  name: string;
  district: string;
  category:
    | "UNESCO World Heritage Site"
    | "Heritage Sites"
    | "Religious Sites"
    | "Beaches"
    | "Wildlife & National Parks"
    | "Hill Stations & Ecotourism";
  estimatedCost: number;
  rating: number;
  lastUpdated: string;
}

export interface AdminHotelItem {
  id: string;
  name: string;
  destinationId: string;
  district: string;
  stayType: "Toran Hotel" | "Heritage Hotel" | "Registered Hotel" | "Homestay";
  pricePerNight: number;
  rating: number;
  lastUpdated: string;
}

export interface AdminAttractionItem {
  id: string;
  name: string;
  destinationName: string;
  district: string;
  category: string;
  rating: number;
  visitDurationHours: number;
  lat: number;
  lng: number;
  entryFee: string;
  lastUpdated: string;
}

export interface AdminRestaurantItem {
  id: string;
  name: string;
  city: string;
  location: string;
  rating: number;
  avgCostPerPerson: number;
  cuisine: string;
  lastUpdated: string;
}

export const CATEGORY_TAXONOMY = [
  "UNESCO World Heritage Site",
  "Heritage Sites",
  "Religious Sites",
  "Beaches",
  "Wildlife & National Parks",
  "Hill Stations & Ecotourism",
] as const;

export const STAY_TYPE_TAXONOMY = [
  "Toran Hotel",
  "Heritage Hotel",
  "Registered Hotel",
  "Homestay",
] as const;

interface AdminDashboardViewProps {
  onBackToProfile?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onBackToProfile,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    "destinations" | "hotels" | "attractions" | "restaurants"
  >("destinations");

  const request = useApi(async signal => {
    const [destinations, hotels, attractions, restaurants] = await Promise.all(
      ["destinations", "hotels", "attractions", "restaurants"].map(resource => api.adminList(resource, signal)));
    const city = (id: string) => destinations.find(d => d.id === id);
    return {
      destinations: destinations.map(d => ({...d,category:d.official_category ?? d.category ?? "",estimatedCost:d.entry_fee_numeric == null ? null : Number(d.entry_fee_numeric),rating:d.rating == null ? null : Number(d.rating),lastUpdated:"Not available"})),
      hotels: hotels.map(h => ({...h,destinationId:h.destination_id,district:city(h.destination_id)?.district ?? "",stayType:h.stay_type,pricePerNight:h.price_per_night,rating:h.rating == null ? null : Number(h.rating),lastUpdated:"Not available"})),
      attractions: attractions.map(a => ({...a,destinationId:a.destination_id,destinationName:city(a.destination_id)?.name ?? "",district:city(a.destination_id)?.district ?? "",visitDurationHours:Number(a.duration_hours),rating:a.rating == null ? null : Number(a.rating),entryFee:a.entry_fee ?? "",entryFeeNumeric:a.entry_fee_numeric == null ? null : Number(a.entry_fee_numeric),lat:Number(a.lat),lng:Number(a.lng),lastUpdated:"Not available"})),
      restaurants: restaurants.map(r => ({...r,destinationId:r.destination_id,city:city(r.destination_id)?.name ?? "",rating:r.rating == null ? null : Number(r.rating),avgCostPerPerson:r.avg_cost_per_person,lastUpdated:"Not available"})),
    };
  }, ["admin"]);
  const destinations = request.data?.destinations ?? [];
  const hotels = request.data?.hotels ?? [];
  const attractions = request.data?.attractions ?? [];
  const restaurants = request.data?.restaurants ?? [];
  const [pending, setPending] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<{
    type: "destinations" | "hotels" | "attractions" | "restaurants";
    id?: string;
    data: any;
  } | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const openedFromProfile = useRef(false);
  useEffect(() => {
    if (!request.data || openedFromProfile.current) return;
    openedFromProfile.current = true;
    const params = new URLSearchParams(window.location.search);
    const hotelId = params.get("hotel");
    if (params.get("new") === "hotel") {
      setActiveTab("hotels");
      setEditingItem({type:"hotels",data:{name:"",destinationId:request.data.destinations[0]?.id ?? "",
        stayType:"Registered Hotel",pricePerNight:0,lat:"",lng:""}});
      setIsDrawerOpen(true);
    } else if (hotelId) {
      const hotel = request.data.hotels.find(h => h.id === hotelId);
      setActiveTab("hotels");
      if (hotel) { setEditingItem({type:"hotels",id:hotel.id,data:{...hotel}}); setIsDrawerOpen(true); }
      else setRequestError("The requested hotel no longer exists.");
    }
  }, [request.data]);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice(null);
    }, 3500);
  };

  const handleOpenAddDrawer = () => {
    setFormError(null);
    setEditingItem({type:activeTab,data:{name:"",district:"",category:"Heritage Sites",
      destinationId:destinations[0]?.id ?? "",stayType:"Registered Hotel",pricePerNight:0,
      lat:"",lng:"",visitDurationHours:1,entryFee:"",entryFeeNumeric:null,avgCostPerPerson:0}});
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (item: any) => {
    setFormError(null);
    setEditingItem({
      type: activeTab,
      id: item.id,
      data: { ...item },
    });
    setIsDrawerOpen(true);
  };

  const handleSaveDrawerItem = async () => {
    if(!editingItem || pending) return;
    const d=editingItem.data;
    if(!d.name?.trim()) { setFormError("Record Name is required."); return; }
    const requiredPrice = editingItem.type === "hotels" ? d.pricePerNight : editingItem.type === "restaurants" ? d.avgCostPerPerson : undefined;
    if ((editingItem.type === "hotels" || editingItem.type === "restaurants") && (requiredPrice == null || String(requiredPrice).trim() === "")) {
      setFormError("Enter a known price. A blank price cannot be saved as zero."); return;
    }
    if(editingItem.type !== "destinations" && (!d.destinationId || d.lat === "" || d.lng === "")) {
      setFormError("Choose a destination and enter verified coordinates."); return;
    }
    const body: Record<string,unknown> = {name:d.name};
    if(editingItem.type === "destinations") {
      Object.assign(body,{district:d.district || null,official_category:d.category});
      if(!editingItem.id) body.slug=d.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || `destination-${crypto.randomUUID()}`;
    } else {
      Object.assign(body,{destination_id:d.destinationId,lat:Number(d.lat),lng:Number(d.lng)});
      if(editingItem.type === "hotels") Object.assign(body,{stay_type:d.stayType,price_per_night:Number(d.pricePerNight)});
      if(editingItem.type === "attractions") Object.assign(body,{category:d.category,duration_hours:Number(d.visitDurationHours),entry_fee:d.entryFee || null,entry_fee_numeric:d.entryFeeNumeric === "" || d.entryFeeNumeric == null ? null : Number(d.entryFeeNumeric)});
      if(editingItem.type === "restaurants") Object.assign(body,{avg_cost_per_person:Number(d.avgCostPerPerson),location:d.location || null,cuisine:d.cuisine || null});
    }
    setPending(true); setRequestError(""); setFormError(null);
    try {
      await api.adminSave(editingItem.type,editingItem.id,body);
      setIsDrawerOpen(false); request.reload(); showToast("Record saved to the server.");
    } catch(error) { setRequestError(errorMessage(error)); }
    finally { setPending(false); }
  };
  const handleConfirmDelete = async (id: string) => {
    if(pending) return;
    setPending(true); setRequestError("");
    try { await api.adminDelete(activeTab,id); setDeletingId(null); request.reload(); showToast("Record deleted from the server."); }
    catch(error) { setRequestError(errorMessage(error)); }
    finally { setPending(false); }
  };
  if(request.loading || pending) return <p role="status">{pending ? "Saving catalog changes..." : "Loading operator catalog..."}</p>;
  if(request.error || requestError) return <p role="alert">{request.error || requestError} <button onClick={() => {setRequestError(""); request.reload();}}>Retry</button> <button onClick={onBackToProfile}>Back to profile</button></p>;

  return (
    <div className="bg-salt min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-b border-stone/30 animate-fadeIn selection:bg-gold selection:text-ink font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-8">
        {onBackToProfile && (
          <div className="flex items-center justify-between border-b border-stone/30 pb-4">
            <button
              onClick={onBackToProfile}
              className="inline-flex items-center gap-2 bg-ink text-salt border border-gold hover:bg-ink/90 px-4 py-2 cursor-pointer font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-gold" />
              <span>Back to Profile Console</span>
            </button>
            <span className="text-stone">Tourism Guild Admin (Demo Mode)</span>
          </div>
        )}

        {/* HEADER */}
        <div className="bg-ink text-salt p-6 sm:p-8 border-2 border-gold space-y-4 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone/30 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gold mb-1">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>ASI & TCGL Dataset Registry</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl text-salt font-bold">
                {t("nav.admin", "Admin Content Dashboard")}
              </h1>
            </div>

            <button
              onClick={handleOpenAddDrawer}
              className="bg-madder hover:bg-madder/90 text-salt border border-madder font-bold px-4 py-2.5 flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 text-salt" />
              <span>Add New Record</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-stone text-[11px]">
            <span>
              Destinations: <strong>{destinations.length}</strong>
            </span>
            <span>•</span>
            <span>
              Hotels: <strong>{hotels.length}</strong>
            </span>
            <span>•</span>
            <span>
              Attractions: <strong>{attractions.length}</strong>
            </span>
            <span>•</span>
            <span>
              Restaurants: <strong>{restaurants.length}</strong>
            </span>
          </div>
        </div>

        {notice && (
          <div className="p-3 bg-emerald-900 text-salt border-2 border-emerald-400 flex items-center gap-2 shadow-md animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-300" />
            <span className="font-bold">{notice}</span>
          </div>
        )}

        {/* TAB CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-gold pb-3">
          <button
            onClick={() => setActiveTab("destinations")}
            className={`px-4 py-2 border font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "destinations"
                ? "bg-gold text-ink border-ink"
                : "bg-white text-charcoal border-stone/30 hover:border-gold"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Destinations ({destinations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("hotels")}
            className={`px-4 py-2 border font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "hotels"
                ? "bg-gold text-ink border-ink"
                : "bg-white text-charcoal border-stone/30 hover:border-gold"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Hotels & Stays ({hotels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("attractions")}
            className={`px-4 py-2 border font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "attractions"
                ? "bg-gold text-ink border-ink"
                : "bg-white text-charcoal border-stone/30 hover:border-gold"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Attractions ({attractions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("restaurants")}
            className={`px-4 py-2 border font-bold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "restaurants"
                ? "bg-gold text-ink border-ink"
                : "bg-white text-charcoal border-stone/30 hover:border-gold"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Restaurants ({restaurants.length})</span>
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white border-2 border-stone/40 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink text-salt uppercase text-[10px] tracking-wider border-b border-stone/40">
                <th className="p-3 border-r border-stone/30">ID / Name</th>
                <th className="p-3 border-r border-stone/30">
                  District / Location
                </th>
                <th className="p-3 border-r border-stone/30">
                  Category / Type
                </th>
                <th className="p-3 border-r border-stone/30">Metrics</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/20">
              {activeTab === "destinations" &&
                destinations.map((d) => (
                  <tr key={d.id} className="hover:bg-salt/60 transition-colors">
                    <td className="p-3 border-r border-stone/20 font-bold text-ink">
                      {d.name}{" "}
                      <span className="text-[10px] text-stone font-normal block">
                        {d.id}
                      </span>
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      {d.district}
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      <span className="bg-salt border border-stone/30 px-2 py-0.5 text-[10px] uppercase">
                        {d.category}
                      </span>
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      ₹{d.estimatedCost} • ★ {d.rating}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditDrawer(d)}
                        className="bg-salt hover:bg-stone/20 text-ink border border-stone/40 px-2.5 py-1 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(d.id)}
                        className="bg-salt hover:bg-madder/10 text-madder border border-stone/40 px-2.5 py-1 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

              {activeTab === "hotels" &&
                hotels.map((h) => (
                  <tr key={h.id} className="hover:bg-salt/60 transition-colors">
                    <td className="p-3 border-r border-stone/20 font-bold text-ink">
                      {h.name}{" "}
                      <span className="text-[10px] text-stone font-normal block">
                        {h.id}
                      </span>
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      {h.district} ({h.destinationId})
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      <span className="bg-gold/20 text-ink border border-gold px-2 py-0.5 text-[10px] uppercase font-bold">
                        {h.stayType}
                      </span>
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      ₹{h.pricePerNight}/night • ★ {h.rating}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditDrawer(h)}
                        className="bg-salt hover:bg-stone/20 text-ink border border-stone/40 px-2.5 py-1 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(h.id)}
                        className="bg-salt hover:bg-madder/10 text-madder border border-stone/40 px-2.5 py-1 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

              {activeTab === "attractions" &&
                attractions.map((a) => (
                  <tr key={a.id} className="hover:bg-salt/60 transition-colors">
                    <td className="p-3 border-r border-stone/20 font-bold text-ink">
                      {a.name}{" "}
                      <span className="text-[10px] text-stone font-normal block">
                        {a.id}
                      </span>
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      {a.destinationName} ({a.district})
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      <span className="bg-salt border border-stone/30 px-2 py-0.5 text-[10px] uppercase">
                        {a.category}
                      </span>
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      {a.entryFee} • {a.visitDurationHours} hrs
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditDrawer(a)}
                        className="bg-salt hover:bg-stone/20 text-ink border border-stone/40 px-2.5 py-1 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(a.id)}
                        className="bg-salt hover:bg-madder/10 text-madder border border-stone/40 px-2.5 py-1 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

              {activeTab === "restaurants" &&
                restaurants.map((r) => (
                  <tr key={r.id} className="hover:bg-salt/60 transition-colors">
                    <td className="p-3 border-r border-stone/20 font-bold text-ink">
                      {r.name}{" "}
                      <span className="text-[10px] text-stone font-normal block">
                        {r.id}
                      </span>
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      {r.location} ({r.city})
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      <span className="bg-salt border border-stone/30 px-2 py-0.5 text-[10px] uppercase">
                        {r.cuisine}
                      </span>
                    </td>
                    <td className="p-3 border-r border-stone/20">
                      ₹{r.avgCostPerPerson}/head • ★ {r.rating}
                    </td>
                    <td className="p-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditDrawer(r)}
                        className="bg-salt hover:bg-stone/20 text-ink border border-stone/40 px-2.5 py-1 cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingId(r.id)}
                        className="bg-salt hover:bg-madder/10 text-madder border border-stone/40 px-2.5 py-1 cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* DRAWER MODAL */}
        {isDrawerOpen && editingItem && (
          <div className="fixed inset-0 bg-ink/70 backdrop-blur-xs z-50 flex justify-end animate-fadeIn">
            <div className="w-full max-w-md bg-salt h-full border-l-2 border-gold p-6 space-y-6 overflow-y-auto shadow-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone/30 pb-3">
                  <h3 className="font-display text-lg text-ink font-bold uppercase">
                    {editingItem.id ? "Edit Record" : "Add New Record"} (
                    {editingItem.type})
                  </h3>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-stone hover:text-charcoal cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="p-3 bg-madder/10 border-l-4 border-madder text-madder text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone mb-1 font-bold">
                      Record Title / Name *
                    </label>
                    <input
                      type="text"
                      value={editingItem.data.name || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          data: { ...editingItem.data, name: e.target.value },
                        })
                      }
                      className="w-full p-2 bg-white border border-stone/40 outline-none focus:border-gold"
                      required
                    />
                  </div>

                  {editingItem.type !== "destinations" && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-stone mb-1 font-bold">Destination *</label>
                        <select value={editingItem.data.destinationId || ""} onChange={e => setEditingItem({...editingItem,data:{...editingItem.data,destinationId:e.target.value}})} className="w-full p-2 bg-white border border-stone/40 outline-none focus:border-gold">
                          <option value="">Select destination</option>
                          {destinations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                      {(["lat", "lng"] as const).map(field => (
                        <div key={field}>
                          <label className="block text-[10px] uppercase tracking-wider text-stone mb-1 font-bold">{field === "lat" ? "Latitude" : "Longitude"} *</label>
                          <input type="number" step="any" value={editingItem.data[field] ?? ""} onChange={e => setEditingItem({...editingItem,data:{...editingItem.data,[field]:e.target.value}})} className="w-full p-2 bg-white border border-stone/40 outline-none focus:border-gold" required />
                        </div>
                      ))}
                    </>
                  )}
                  {editingItem.type === "attractions" && (
                    <>
                      {(["category", "visitDurationHours", "entryFeeNumeric"] as const).map(field => (
                        <div key={field}>
                          <label className="block text-[10px] uppercase tracking-wider text-stone mb-1 font-bold">{field === "category" ? "Category *" : field === "visitDurationHours" ? "Visit duration (hours) *" : "Entry price (leave blank if unknown)"}</label>
                          <input type={field === "category" ? "text" : "number"} step="any" value={editingItem.data[field] ?? ""} onChange={e => setEditingItem({...editingItem,data:{...editingItem.data,[field]:e.target.value}})} className="w-full p-2 bg-white border border-stone/40 outline-none focus:border-gold" />
                        </div>
                      ))}
                    </>
                  )}
                  {editingItem.type === "restaurants" && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-stone mb-1 font-bold">Cost per person *</label>
                      <input type="number" value={editingItem.data.avgCostPerPerson ?? ""} onChange={e => setEditingItem({...editingItem,data:{...editingItem.data,avgCostPerPerson:e.target.value}})} className="w-full p-2 bg-white border border-stone/40 outline-none focus:border-gold" required />
                    </div>
                  )}
                  {editingItem.type === "destinations" && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-stone mb-1 font-bold">
                          District
                        </label>
                        <input
                          type="text"
                          value={editingItem.data.district || ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: {
                                ...editingItem.data,
                                district: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2 bg-white border border-stone/40 outline-none focus:border-gold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-stone mb-1 font-bold">
                          Category
                        </label>
                        <select
                          value={
                            editingItem.data.category || CATEGORY_TAXONOMY[0]
                          }
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: {
                                ...editingItem.data,
                                category: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2 bg-white border border-stone/40 outline-none focus:border-gold"
                        >
                          {CATEGORY_TAXONOMY.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {editingItem.type === "hotels" && (
                    <>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-stone mb-1 font-bold">
                          Stay Type Taxonomy
                        </label>
                        <select
                          value={
                            editingItem.data.stayType || STAY_TYPE_TAXONOMY[0]
                          }
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: {
                                ...editingItem.data,
                                stayType: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2 bg-white border border-stone/40 outline-none focus:border-gold"
                        >
                          {STAY_TYPE_TAXONOMY.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-stone mb-1 font-bold">
                          Price Per Night (₹)
                        </label>
                        <input
                          type="number"
                          value={editingItem.data.pricePerNight ?? ""}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              data: {
                                ...editingItem.data,
                                pricePerNight: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2 bg-white border border-stone/40 outline-none focus:border-gold"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-stone/30 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2 bg-salt border border-stone/40 text-charcoal hover:bg-stone/20 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDrawerItem}
                  className="px-4 py-2 bg-gold text-ink font-bold border border-ink hover:bg-gold/90 cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION DIALOG */}
        {deletingId && (
          <div className="fixed inset-0 bg-ink/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-salt border-2 border-madder p-6 max-w-sm w-full space-y-4 shadow-2xl">
              <h4 className="font-display text-lg text-madder font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-madder" />
                <span>Confirm Record Deletion</span>
              </h4>
              <p className="text-stone leading-relaxed">
                Are you sure you want to delete this entry from the dataset?
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="px-3 py-1.5 bg-salt border border-stone/40 text-charcoal cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(deletingId)}
                  className="px-3 py-1.5 bg-madder text-salt font-bold border border-madder cursor-pointer"
                >
                  Delete Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
