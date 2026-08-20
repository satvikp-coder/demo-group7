import React, { useState } from 'react';
import { GUJARAT_DESTINATIONS, Destination, Attraction, Restaurant } from '../data/destinations';
import { HotelData } from './HotelsView';
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
  Utensils
} from 'lucide-react';

export interface AdminDestinationItem {
  id: string;
  name: string;
  district: string;
  category: 'UNESCO World Heritage Site' | 'Heritage Sites' | 'Religious Sites' | 'Beaches' | 'Wildlife & National Parks' | 'Hill Stations & Ecotourism';
  estimatedCost: number;
  rating: number;
  lastUpdated: string;
}

export interface AdminHotelItem {
  id: string;
  name: string;
  destinationId: string;
  district: string;
  stayType: 'Toran Hotel' | 'Heritage Hotel' | 'Registered Hotel' | 'Homestay';
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

// Initial Data
const INITIAL_DESTINATIONS: AdminDestinationItem[] = GUJARAT_DESTINATIONS.map(d => ({
  id: d.id,
  name: d.name,
  district: d.district,
  category: (d.officialCategory || d.category) as AdminDestinationItem['category'],
  estimatedCost: d.entryFeeNumeric || 3500,
  rating: parseFloat(d.rating) || 4.7,
  lastUpdated: '2026-10-04'
}));

const flattenHotels = (): AdminHotelItem[] => {
  const items: AdminHotelItem[] = [];
  GUJARAT_DESTINATIONS.forEach(dest => {
    (dest.hotels || []).forEach(h => {
      items.push({
        id: h.id,
        name: h.name,
        destinationId: dest.id,
        district: dest.district,
        stayType: h.stayType,
        pricePerNight: h.priceNumeric,
        rating: h.ratingNumeric,
        lastUpdated: '2026-10-02'
      });
    });
  });
  return items;
};

const INITIAL_HOTELS: AdminHotelItem[] = flattenHotels();

const INITIAL_ATTRACTIONS: AdminAttractionItem[] = GUJARAT_DESTINATIONS.flatMap(c => 
  (c.attractions || []).map(a => ({
    id: a.id,
    name: a.name,
    destinationName: c.name,
    district: c.district,
    category: a.category,
    rating: a.rating,
    visitDurationHours: a.durationHours,
    lat: a.lat,
    lng: a.lng,
    entryFee: a.entryFee,
    lastUpdated: '2026-10-05'
  }))
);

const INITIAL_RESTAURANTS: AdminRestaurantItem[] = GUJARAT_DESTINATIONS.flatMap(c =>
  (c.restaurants || []).map(r => ({
    id: r.id,
    name: r.name,
    city: c.name,
    location: r.location,
    rating: r.rating,
    avgCostPerPerson: r.avgCostPerPerson,
    cuisine: r.cuisine || 'Gujarati Thali',
    lastUpdated: '2026-10-05'
  }))
);

export const CATEGORY_TAXONOMY = [
  'UNESCO World Heritage Site',
  'Heritage Sites',
  'Religious Sites',
  'Beaches',
  'Wildlife & National Parks',
  'Hill Stations & Ecotourism'
] as const;

export const STAY_TYPE_TAXONOMY = [
  'Toran Hotel',
  'Heritage Hotel',
  'Registered Hotel',
  'Homestay'
] as const;

interface AdminDashboardViewProps {
  onBackToProfile?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onBackToProfile
}) => {
  // Navigation tab state: 'destinations' | 'hotels' | 'attractions' | 'restaurants'
  const [activeTab, setActiveTab] = useState<'destinations' | 'hotels' | 'attractions' | 'restaurants'>('destinations');

  // Datasets state
  const [destinations, setDestinations] = useState<AdminDestinationItem[]>(INITIAL_DESTINATIONS);
  const [hotels, setHotels] = useState<AdminHotelItem[]>(INITIAL_HOTELS);
  const [attractions, setAttractions] = useState<AdminAttractionItem[]>(INITIAL_ATTRACTIONS);
  const [restaurants, setRestaurants] = useState<AdminRestaurantItem[]>(INITIAL_RESTAURANTS);

  // Side Panel / Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<{
    type: 'destinations' | 'hotels' | 'attractions' | 'restaurants';
    id?: string;
    data: any;
  } | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice(null);
    }, 3500);
  };

  const handleOpenAddDrawer = () => {
    setFormError(null);
    if (activeTab === 'destinations') {
      setEditingItem({
        type: 'destinations',
        data: { name: '', district: 'Mehsana District', category: 'Heritage Sites', estimatedCost: 3500, rating: 4.7 }
      });
    } else if (activeTab === 'hotels') {
      setEditingItem({
        type: 'hotels',
        data: { name: '', destinationId: 'somnath', district: 'Gir Somnath', stayType: 'Toran Hotel', pricePerNight: 2400, rating: 4.6 }
      });
    } else if (activeTab === 'attractions') {
      setEditingItem({
        type: 'attractions',
        data: { name: '', destinationName: 'Somnath', district: 'Gir Somnath', category: 'Spiritual/Heritage', rating: 4.6, visitDurationHours: 2.0, lat: 20.8880, lng: 70.4012, entryFee: 'Free' }
      });
    } else {
      setEditingItem({
        type: 'restaurants',
        data: { name: '', city: 'Somnath', location: 'Temple Road', rating: 4.5, avgCostPerPerson: 250, cuisine: 'Gujarati Thali' }
      });
    }
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (item: any) => {
    setFormError(null);
    setEditingItem({
      type: activeTab,
      id: item.id,
      data: { ...item }
    });
    setIsDrawerOpen(true);
  };

  const handleSaveDrawerItem = () => {
    if (!editingItem) return;

    if (!editingItem.data.name || editingItem.data.name.trim() === '') {
      setFormError('Record Name is required and cannot be empty.');
      return;
    }

    setFormError(null);
    const today = new Date().toISOString().split('T')[0];

    if (editingItem.type === 'destinations') {
      if (editingItem.id) {
        setDestinations(prev => prev.map(d => d.id === editingItem.id ? { ...editingItem.data, lastUpdated: today } : d));
        showToast(`Updated destination "${editingItem.data.name}"`);
      } else {
        const newItem = { ...editingItem.data, id: `dest-${Date.now()}`, lastUpdated: today };
        setDestinations(prev => [newItem, ...prev]);
        showToast(`Added new destination "${newItem.name}"`);
      }
    } else if (editingItem.type === 'hotels') {
      if (editingItem.id) {
        setHotels(prev => prev.map(h => h.id === editingItem.id ? { ...editingItem.data, lastUpdated: today } : h));
        showToast(`Updated hotel "${editingItem.data.name}"`);
      } else {
        const newItem = { ...editingItem.data, id: `hotel-${Date.now()}`, lastUpdated: today };
        setHotels(prev => [newItem, ...prev]);
        showToast(`Added new hotel "${newItem.name}"`);
      }
    } else if (editingItem.type === 'attractions') {
      if (editingItem.id) {
        setAttractions(prev => prev.map(a => a.id === editingItem.id ? { ...editingItem.data, lastUpdated: today } : a));
        showToast(`Updated attraction "${editingItem.data.name}"`);
      } else {
        const newItem = { ...editingItem.data, id: `attr-${Date.now()}`, lastUpdated: today };
        setAttractions(prev => [newItem, ...prev]);
        showToast(`Added new attraction "${newItem.name}"`);
      }
    } else if (editingItem.type === 'restaurants') {
      if (editingItem.id) {
        setRestaurants(prev => prev.map(r => r.id === editingItem.id ? { ...editingItem.data, lastUpdated: today } : r));
        showToast(`Updated restaurant "${editingItem.data.name}"`);
      } else {
        const newItem = { ...editingItem.data, id: `resto-${Date.now()}`, lastUpdated: today };
        setRestaurants(prev => [newItem, ...prev]);
        showToast(`Added new restaurant "${newItem.name}"`);
      }
    }

    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleConfirmDelete = (id: string) => {
    if (activeTab === 'destinations') {
      const target = destinations.find(d => d.id === id);
      setDestinations(prev => prev.filter(d => d.id !== id));
      showToast(`Deleted destination "${target?.name || id}"`);
    } else if (activeTab === 'hotels') {
      const target = hotels.find(h => h.id === id);
      setHotels(prev => prev.filter(h => h.id !== id));
      showToast(`Deleted hotel "${target?.name || id}"`);
    } else if (activeTab === 'attractions') {
      const target = attractions.find(a => a.id === id);
      setAttractions(prev => prev.filter(a => a.id !== id));
      showToast(`Deleted attraction "${target?.name || id}"`);
    } else {
      const target = restaurants.find(r => r.id === id);
      setRestaurants(prev => prev.filter(r => r.id !== id));
      showToast(`Deleted restaurant "${target?.name || id}"`);
    }
    setDeletingId(null);
  };

  return (
    <div className="bg-salt min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-b border-stone/30 animate-fadeIn selection:bg-gold selection:text-ink font-mono text-xs">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Back to Profile */}
        {onBackToProfile && (
          <div className="flex items-center justify-between border-b border-stone/30 pb-4">
            <button
              onClick={onBackToProfile}
              className="inline-flex items-center gap-2 bg-stone/20 hover:bg-stone/30 text-charcoal border border-stone/40 text-xs font-mono px-4 py-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-ink" />
              <span>Back to Officer Dashboard</span>
            </button>
            <span className="text-stone text-[11px] uppercase tracking-wider">
              Tourism Administrative Ledger
            </span>
          </div>
        )}

        {/* Header Banner */}
        <div className="bg-ink text-salt p-6 sm:p-8 border-2 border-gold space-y-4 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone/30 pb-4">
            <div>
              <div className="flex items-center gap-2 text-gold uppercase tracking-widest text-[11px] mb-1">
                <Building2 className="w-4 h-4 text-gold" />
                <span>State Tourism Registry Management</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl text-salt font-bold">
                Gujarat Tourism Admin Ledger
              </h1>
            </div>

            <button
              onClick={handleOpenAddDrawer}
              aria-label={`Add new ${activeTab.slice(0, -1)}`}
              className="bg-gold hover:bg-ink hover:text-gold text-ink border-2 border-gold font-mono text-xs font-bold px-5 py-2.5 uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-md self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New {activeTab === 'destinations' ? 'City' : activeTab === 'hotels' ? 'Hotel' : activeTab === 'attractions' ? 'Attraction' : 'Restaurant'}</span>
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3 bg-emerald-900 text-salt border-2 border-emerald-400 text-xs font-mono flex items-center gap-2 shadow-md animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span className="font-bold">{notice}</span>
          </div>
        )}

        {/* TABS HEADER */}
        <div className="flex items-center gap-2 border-b-2 border-stone/30 pb-0 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold border-t-2 border-x-2 transition-all cursor-pointer ${
              activeTab === 'destinations'
                ? 'bg-ink text-gold border-gold -mb-[2px] shadow-sm'
                : 'bg-salt text-stone border-transparent hover:text-charcoal'
            }`}
          >
            Cities ({destinations.length})
          </button>

          <button
            onClick={() => setActiveTab('hotels')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold border-t-2 border-x-2 transition-all cursor-pointer ${
              activeTab === 'hotels'
                ? 'bg-ink text-gold border-gold -mb-[2px] shadow-sm'
                : 'bg-salt text-stone border-transparent hover:text-charcoal'
            }`}
          >
            Hotels ({hotels.length})
          </button>

          <button
            onClick={() => setActiveTab('attractions')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold border-t-2 border-x-2 transition-all cursor-pointer ${
              activeTab === 'attractions'
                ? 'bg-ink text-gold border-gold -mb-[2px] shadow-sm'
                : 'bg-salt text-stone border-transparent hover:text-charcoal'
            }`}
          >
            Attractions ({attractions.length})
          </button>

          <button
            onClick={() => setActiveTab('restaurants')}
            className={`px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold border-t-2 border-x-2 transition-all cursor-pointer ${
              activeTab === 'restaurants'
                ? 'bg-ink text-gold border-gold -mb-[2px] shadow-sm'
                : 'bg-salt text-stone border-transparent hover:text-charcoal'
            }`}
          >
            Restaurants ({restaurants.length})
          </button>
        </div>

        {/* DATA TABLE AREA */}
        <div className="bg-white border-2 border-stone/40 p-4 sm:p-6 shadow-sm overflow-x-auto">
          
          {/* 1. CITIES TAB */}
          {activeTab === 'destinations' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-stone/30 text-stone text-[11px] uppercase tracking-wider bg-salt">
                  <th className="p-3">City Name</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20">
                {destinations.map(d => (
                  <tr key={d.id} className="hover:bg-salt/50 transition-colors">
                    <td className="p-3 font-bold text-ink text-sm">{d.name}</td>
                    <td className="p-3 text-charcoal">{d.district}</td>
                    <td className="p-3 text-stone">{d.category}</td>
                    <td className="p-3 text-gold font-bold">{d.rating} ★</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditDrawer(d)}
                        title="Edit Destination"
                        aria-label="Edit Destination"
                        className="p-1.5 bg-salt hover:bg-stone/30 border border-stone/40 text-charcoal cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink" />
                      </button>
                      <button
                        onClick={() => setDeletingId(d.id)}
                        title="Delete Destination"
                        aria-label="Delete Destination"
                        className="p-1.5 bg-madder/10 hover:bg-madder text-madder hover:text-salt border border-madder cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 2. HOTELS TAB */}
          {activeTab === 'hotels' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-stone/30 text-stone text-[11px] uppercase tracking-wider bg-salt">
                  <th className="p-3">Hotel Name</th>
                  <th className="p-3">District</th>
                  <th className="p-3">Stay Type</th>
                  <th className="p-3">Rate / Night</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20">
                {hotels.map(h => (
                  <tr key={h.id} className="hover:bg-salt/50 transition-colors">
                    <td className="p-3 font-bold text-ink text-sm">{h.name}</td>
                    <td className="p-3 text-charcoal">{h.district}</td>
                    <td className="p-3 text-stone">{h.stayType}</td>
                    <td className="p-3 font-bold text-ink">₹{h.pricePerNight.toLocaleString()}</td>
                    <td className="p-3 text-gold font-bold">{h.rating} ★</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditDrawer(h)}
                        title="Edit Hotel"
                        aria-label="Edit Hotel"
                        className="p-1.5 bg-salt hover:bg-stone/30 border border-stone/40 text-charcoal cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink" />
                      </button>
                      <button
                        onClick={() => setDeletingId(h.id)}
                        title="Delete Hotel"
                        aria-label="Delete Hotel"
                        className="p-1.5 bg-madder/10 hover:bg-madder text-madder hover:text-salt border border-madder cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 3. ATTRACTIONS TAB */}
          {activeTab === 'attractions' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-stone/30 text-stone text-[11px] uppercase tracking-wider bg-salt">
                  <th className="p-3">Attraction</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Entry Fee</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20">
                {attractions.map(a => (
                  <tr key={a.id} className="hover:bg-salt/50 transition-colors">
                    <td className="p-3 font-bold text-ink text-sm">{a.name}</td>
                    <td className="p-3 text-charcoal">{a.destinationName}</td>
                    <td className="p-3 text-stone">{a.category}</td>
                    <td className="p-3 text-charcoal">{a.visitDurationHours} hrs</td>
                    <td className="p-3 font-bold text-ink">{a.entryFee}</td>
                    <td className="p-3 text-gold font-bold">{a.rating} ★</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditDrawer(a)}
                        title="Edit Attraction"
                        aria-label="Edit Attraction"
                        className="p-1.5 bg-salt hover:bg-stone/30 border border-stone/40 text-charcoal cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink" />
                      </button>
                      <button
                        onClick={() => setDeletingId(a.id)}
                        title="Delete Attraction"
                        aria-label="Delete Attraction"
                        className="p-1.5 bg-madder/10 hover:bg-madder text-madder hover:text-salt border border-madder cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* 4. RESTAURANTS TAB */}
          {activeTab === 'restaurants' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-stone/30 text-stone text-[11px] uppercase tracking-wider bg-salt">
                  <th className="p-3">Restaurant</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Cuisine</th>
                  <th className="p-3">Avg Cost / Person</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20">
                {restaurants.map(r => (
                  <tr key={r.id} className="hover:bg-salt/50 transition-colors">
                    <td className="p-3 font-bold text-ink text-sm">{r.name}</td>
                    <td className="p-3 text-charcoal">{r.city}</td>
                    <td className="p-3 text-stone">{r.location}</td>
                    <td className="p-3 text-stone">{r.cuisine}</td>
                    <td className="p-3 font-bold text-ink">₹{r.avgCostPerPerson.toLocaleString()}</td>
                    <td className="p-3 text-gold font-bold">{r.rating} ★</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditDrawer(r)}
                        title="Edit Restaurant"
                        aria-label="Edit Restaurant"
                        className="p-1.5 bg-salt hover:bg-stone/30 border border-stone/40 text-charcoal cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ink" />
                      </button>
                      <button
                        onClick={() => setDeletingId(r.id)}
                        title="Delete Restaurant"
                        aria-label="Delete Restaurant"
                        className="p-1.5 bg-madder/10 hover:bg-madder text-madder hover:text-salt border border-madder cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>

        {/* DELETE CONFIRM BAR */}
        {deletingId && (
          <div className="p-4 bg-madder text-salt border-2 border-gold flex items-center justify-between gap-4 font-mono text-xs animate-fadeIn shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gold shrink-0" />
              <span className="font-bold">Are you sure you want to delete this record?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleConfirmDelete(deletingId)}
                aria-label="Confirm delete"
                className="bg-salt text-madder hover:bg-salt/90 font-bold px-3 py-1.5 uppercase cursor-pointer"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setDeletingId(null)}
                aria-label="Cancel delete"
                className="bg-ink text-salt hover:bg-ink/90 border border-salt font-bold px-3 py-1.5 uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* DRAWER / SIDE MODAL FOR ADD / EDIT */}
        {isDrawerOpen && editingItem && (
          <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-xs flex justify-end">
            <div className="bg-salt border-l-2 border-gold max-w-md w-full h-full p-6 space-y-6 overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-stone/30 pb-3">
                <h3 className="font-display text-xl font-bold text-ink">
                  {editingItem.id ? 'Edit' : 'Add New'} {editingItem.type.slice(0, -1)}
                </h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-stone hover:text-ink cursor-pointer"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-madder/10 border border-madder text-madder font-mono text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label htmlFor="admin-drawer-name" className="block text-stone uppercase mb-1">Name</label>
                  <input
                    id="admin-drawer-name"
                    type="text"
                    value={editingItem.data.name || ''}
                    onChange={(e) => {
                      setFormError(null);
                      setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } });
                    }}
                    className="w-full bg-white border border-stone/40 p-2 text-ink font-bold outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>

                {/* ATTRACTION SPECIFIC REAL FIELDS */}
                {editingItem.type === 'attractions' && (
                  <>
                    <div>
                      <label htmlFor="admin-drawer-category" className="block text-stone uppercase mb-1">Category</label>
                      <input
                        id="admin-drawer-category"
                        type="text"
                        value={editingItem.data.category || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                        className="w-full bg-white border border-stone/40 p-2 text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>
                    <div>
                      <label htmlFor="admin-drawer-visit-duration" className="block text-stone uppercase mb-1">Visit Duration (Hours)</label>
                      <input
                        id="admin-drawer-visit-duration"
                        type="number"
                        step="0.5"
                        value={editingItem.data.visitDurationHours || 1.5}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, visitDurationHours: Number(e.target.value) } })}
                        className="w-full bg-white border border-stone/40 p-2 text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="admin-drawer-lat" className="block text-stone uppercase mb-1">Latitude</label>
                        <input
                          id="admin-drawer-lat"
                          type="number"
                          step="0.0001"
                          value={editingItem.data.lat || 20.888}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, lat: Number(e.target.value) } })}
                          className="w-full bg-white border border-stone/40 p-2 text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                        />
                      </div>
                      <div>
                        <label htmlFor="admin-drawer-lng" className="block text-stone uppercase mb-1">Longitude</label>
                        <input
                          id="admin-drawer-lng"
                          type="number"
                          step="0.0001"
                          value={editingItem.data.lng || 70.4012}
                          onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, lng: Number(e.target.value) } })}
                          className="w-full bg-white border border-stone/40 p-2 text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="admin-drawer-entry-fee" className="block text-stone uppercase mb-1">Entry Fee</label>
                      <input
                        id="admin-drawer-entry-fee"
                        type="text"
                        value={editingItem.data.entryFee || 'Free'}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, entryFee: e.target.value } })}
                        className="w-full bg-white border border-stone/40 p-2 text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>
                  </>
                )}

                {/* RESTAURANT SPECIFIC FIELDS */}
                {editingItem.type === 'restaurants' && (
                  <>
                    <div>
                      <label htmlFor="admin-drawer-city" className="block text-stone uppercase mb-1">City</label>
                      <input
                        id="admin-drawer-city"
                        type="text"
                        value={editingItem.data.city || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, city: e.target.value } })}
                        className="w-full bg-white border border-stone/40 p-2 text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>
                    <div>
                      <label htmlFor="admin-drawer-location" className="block text-stone uppercase mb-1">Location</label>
                      <input
                        id="admin-drawer-location"
                        type="text"
                        value={editingItem.data.location || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, location: e.target.value } })}
                        className="w-full bg-white border border-stone/40 p-2 text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>
                    <div>
                      <label htmlFor="admin-drawer-avg-cost" className="block text-stone uppercase mb-1">Avg Cost / Person (₹)</label>
                      <input
                        id="admin-drawer-avg-cost"
                        type="number"
                        value={editingItem.data.avgCostPerPerson || 250}
                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, avgCostPerPerson: Number(e.target.value) } })}
                        className="w-full bg-white border border-stone/40 p-2 text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="admin-drawer-rating" className="block text-stone uppercase mb-1">Rating</label>
                  <input
                    id="admin-drawer-rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingItem.data.rating || 4.5}
                    onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, rating: Number(e.target.value) } })}
                    className="w-full bg-white border border-stone/40 p-2 text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone/30 flex justify-end gap-2">
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="bg-stone/20 text-charcoal px-4 py-2 font-mono uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDrawerItem}
                  className="bg-gold text-ink font-bold px-5 py-2 font-mono uppercase cursor-pointer"
                >
                  Save Record
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
