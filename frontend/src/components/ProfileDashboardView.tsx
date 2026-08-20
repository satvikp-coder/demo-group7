import React, { useState } from 'react';
import { Destination, GUJARAT_DESTINATIONS } from '../data/destinations';
import { ItineraryConfig } from './ItineraryView';
import {
  User,
  Mail,
  Lock,
  Calendar,
  DollarSign,
  ChevronRight,
  ArrowRight,
  Building2,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  LogOut,
  Sparkles,
  MapPin,
  Layers3,
  ShieldCheck,
  Check,
  Edit3,
  ExternalLink,
  Plus
} from 'lucide-react';

export interface SavedTrip {
  id: string;
  title: string;
  dates: string;
  daysCount: number;
  totalCost: number;
  planningProgress: number; // Percentage, e.g., 80%
  statusLabel: string;
  sitesCount: number;
  sitesList: string[];
  config: ItineraryConfig;
}

interface ProfileDashboardViewProps {
  currentUser: { name: string; email: string; role: 'tourist' | 'operator' } | null;
  onOpenItinerary: (config: ItineraryConfig) => void;
  onOpenExplore: () => void;
  onOpenPlanner: () => void;
  onOpenAdminDashboard?: () => void;
  onLogout: () => void;
}

export const ProfileDashboardView: React.FC<ProfileDashboardViewProps> = ({
  currentUser,
  onOpenItinerary,
  onOpenExplore,
  onOpenPlanner,
  onOpenAdminDashboard,
  onLogout,
}) => {
  // Local role state (allows toggling role between Tourist and Tour Operator to test both views)
  const [role, setRole] = useState<'tourist' | 'operator'>(currentUser?.role || 'tourist');

  // Account Settings Form state
  const [name, setName] = useState<string>(currentUser?.name || 'Vidyadhar Solanki');
  const [email, setEmail] = useState<string>(currentUser?.email || 'solanki@heritage.in');
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Saved Trips Mock Data (2 saved trips for Tourist account)
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([
    {
      id: 'trip-solanki-3d',
      title: '3-Day Solanki & Heritage Stepwell Circuit',
      dates: 'OCT 12 - 14, 2026',
      daysCount: 3,
      totalCost: 12800,
      planningProgress: 80,
      statusLabel: '3 of 4 Stays Booked',
      sitesCount: 3,
      sitesList: ['Modhera Sun Temple', 'Champaner-Pavagadh', 'Adalaj Ni Vav'],
      config: {
        selectedSites: ['modhera', 'champaner', 'adalaj'],
        tripDays: 3,
        budget: 12000
      }
    },
    {
      id: 'trip-kutch-5d',
      title: '5-Day Great Rann & Kutchi Craft Trail',
      dates: 'NOV 04 - 08, 2026',
      daysCount: 5,
      totalCost: 24500,
      planningProgress: 45,
      statusLabel: 'In Draft • Permit Pending',
      sitesCount: 4,
      sitesList: ['Rann of Kutch', 'Hodka Crafts', 'Bhuj Palace', 'Somnath Temple'],
      config: {
        selectedSites: ['rann-of-kutch', 'somnath', 'gir'],
        tripDays: 5,
        budget: 25000
      }
    }
  ]);

  // Tour Operator Listings Mock Data
  const [operatorListings, setOperatorListings] = useState([
    {
      id: 'op-1',
      name: 'Champaner Toran Heritage Haven',
      type: 'Toran Hotel',
      destination: 'Champaner-Pavagadh',
      status: 'Verified & Active',
      lastUpdated: '2 days ago',
      price: '₹2,000 / night'
    },
    {
      id: 'op-2',
      name: 'Modhera Sun Temple Heritage Lodge',
      type: 'Registered Hotel',
      destination: 'Modhera',
      status: 'Under ASI Audit',
      lastUpdated: 'Oct 1, 2026',
      price: '₹3,200 / night'
    },
    {
      id: 'op-3',
      name: 'Hodka Artisans Homestay',
      type: 'Homestay',
      destination: 'Rann of Kutch',
      status: 'Verified & Active',
      lastUpdated: 'Sep 28, 2026',
      price: '₹2,200 / night'
    }
  ]);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessNotice('Account details updated successfully in heritage ledger!');
    setTimeout(() => {
      setSaveSuccessNotice(null);
    }, 4000);
  };

  const handleDeleteTrip = (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTrips(prev => prev.filter(t => t.id !== tripId));
  };

  return (
    <div className="bg-salt min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-b border-stone/30 animate-fadeIn selection:bg-gold selection:text-ink">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ================= 1. HEADER: WELCOME BACK & ROLE TAG ================= */}
        <div className="bg-ink text-salt p-6 sm:p-8 border-2 border-gold space-y-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-stepwell-pattern opacity-10 pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone/30 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {/* Account Type Stepwell Gold Tag */}
                <span className="bg-gold text-ink font-mono text-[11px] uppercase font-bold px-2.5 py-0.5 tracking-wider border border-ink">
                  {role === 'operator' ? 'Registered Tour Operator' : 'Heritage Tourist'}
                </span>
                <span className="font-mono text-[10px] text-stone">
                  • Verified Account
                </span>
              </div>

              {/* Header: Welcome back, [name] in Fraunces */}
              <h1 className="font-display text-2xl sm:text-4xl text-salt font-bold">
                Welcome back, {name || 'Traveler'}
              </h1>
            </div>

            {/* Quick Actions & Role Switcher */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <button
                onClick={() => setRole(role === 'tourist' ? 'operator' : 'tourist')}
                className="bg-salt/10 hover:bg-salt/20 text-gold border border-gold/40 px-3 py-1.5 transition-colors cursor-pointer text-[11px] flex items-center gap-1.5"
                title="Toggle between Tourist and Tour Operator mode to test both layouts"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
                <span>Switch Role View ({role === 'tourist' ? 'Show Operator View' : 'Show Tourist View'})</span>
              </button>

              <button
                onClick={onLogout}
                className="bg-madder/20 hover:bg-madder text-salt border border-madder px-3 py-1.5 transition-colors cursor-pointer text-[11px] flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-salt" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <p className="font-mono text-xs text-stone leading-relaxed max-w-2xl">
            Manage your saved Gujarat heritage itineraries, itemized budget ledgers, personal account credentials, and tourism operator listings.
          </p>
        </div>

        {/* ================= 2. TOUR OPERATOR SECTION: "YOUR LISTINGS" (IF OPERATOR) ================= */}
        {role === 'operator' && (
          <div className="bg-white border-2 border-stone/40 p-6 space-y-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone/30 pb-3">
              <div>
                <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                  Tourism Guild Directory
                </span>
                <h2 className="font-display text-xl text-charcoal font-bold">
                  Your Registered Listings
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAdminDashboard && onOpenAdminDashboard()}
                  className="inline-flex items-center gap-1.5 bg-madder text-salt border border-madder text-xs font-mono font-bold px-3 py-1.5 hover:bg-madder/90 transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-salt" />
                  <span>Manage Listings (Admin Dashboard)</span>
                </button>
                <button
                  onClick={onOpenExplore}
                  className="inline-flex items-center gap-1.5 bg-ink text-gold border border-gold text-xs font-mono font-bold px-3 py-1.5 hover:bg-ink/90 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-gold" />
                  <span>Register New Stay</span>
                </button>
              </div>
            </div>

            {/* COMPACT TABLE FOR TOUR OPERATOR LISTINGS */}
            <div className="overflow-x-auto border border-stone/30">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-ink text-salt uppercase text-[10px] tracking-wider border-b border-gold">
                    <th className="p-3">Stay Name</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Circuit Stop</th>
                    <th className="p-3">Tariff</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/20 bg-salt/30">
                  {operatorListings.map((item) => (
                    <tr key={item.id} className="hover:bg-salt/80 transition-colors">
                      <td className="p-3 font-bold text-charcoal">{item.name}</td>
                      <td className="p-3">
                        <span className="bg-gold/20 text-ink border border-gold px-2 py-0.5 text-[10px]">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 text-stone">{item.destination}</td>
                      <td className="p-3 text-ink font-bold">{item.price}</td>
                      <td className="p-3">
                        {item.status.includes('Active') ? (
                          <span className="text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {item.status}
                          </span>
                        ) : (
                          <span className="text-amber-800 font-bold text-[10px] flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onOpenAdminDashboard && onOpenAdminDashboard()}
                          className="text-gold hover:text-ink font-bold underline text-[11px] cursor-pointer"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= 3. "YOUR SAVED TRIPS" SECTION ================= */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone/30 pb-3">
            <div>
              <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                Heritage Circuit Vault
              </span>
              <h2 className="font-display text-2xl text-charcoal font-bold">
                Your Saved Trips
              </h2>
            </div>

            <button
              onClick={onOpenPlanner}
              className="inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-salt border border-gold text-xs font-mono font-bold px-4 py-2 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-gold" />
              <span>Plan New Itinerary</span>
            </button>
          </div>

          {/* TERRACE GRID OF TRIP CARDS OR EMPTY STATE */}
          {savedTrips.length === 0 ? (
            /* EMPTY STATE: Stepped-Chevron watermark + Madder Red button */
            <div className="bg-white border-2 border-stone/40 p-10 text-center space-y-6 relative overflow-hidden shadow-xs">
              
              {/* Stepped-Chevron Watermark */}
              <div className="flex justify-center items-center opacity-15 pointer-events-none">
                <div className="flex items-center -space-x-3">
                  <ChevronRight className="w-16 h-16 text-charcoal" />
                  <ChevronRight className="w-16 h-16 text-charcoal" />
                  <ChevronRight className="w-16 h-16 text-charcoal" />
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-3 font-mono">
                <h3 className="font-display text-xl font-bold text-charcoal">
                  No Saved Heritage Trips
                </h3>
                <p className="text-xs text-stone leading-relaxed">
                  You haven't planned a trip yet. Explore Gujarat's 10 heritage destinations to build your personalized stepwell itinerary.
                </p>
              </div>

              {/* Madder Red Button linking to Explore */}
              <button
                onClick={onOpenExplore}
                className="inline-flex items-center gap-2 bg-madder hover:bg-madder/90 text-salt border border-madder text-xs font-mono font-bold px-6 py-3 transition-colors cursor-pointer shadow-xs"
              >
                <span>Explore Gujarat Destinations</span>
                <ArrowRight className="w-4 h-4 text-salt" />
              </button>

            </div>
          ) : (
            /* TERRACE GRID PATTERN REUSED FOR TRIP CARDS */
            <div className="space-y-6">
              {savedTrips.map((trip, index) => {
                // Stepped terrace offset for desktop
                const terraceIndentClasses = [
                  'sm:ml-0',
                  'sm:ml-6 lg:ml-8',
                  'sm:ml-12 lg:ml-16'
                ][index % 3];

                return (
                  <div
                    key={trip.id}
                    onClick={() => onOpenItinerary(trip.config)}
                    className={`transition-all duration-300 ${terraceIndentClasses} relative group cursor-pointer`}
                  >
                    <div className="bg-white border-2 border-stone/40 hover:border-gold transition-all shadow-sm group-hover:shadow-md p-5 space-y-4">
                      
                      {/* Trip Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/20 pb-3">
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] text-gold uppercase tracking-widest font-bold block">
                            {trip.dates} • {trip.daysCount} Days
                          </span>
                          <h3 className="font-display text-lg sm:text-xl font-bold text-charcoal group-hover:text-ink">
                            {trip.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-ink bg-gold/20 px-2.5 py-1 border border-gold">
                            ₹{trip.totalCost.toLocaleString()}
                          </span>

                          <button
                            onClick={(e) => handleDeleteTrip(trip.id, e)}
                            className="text-stone hover:text-madder text-xs font-mono px-2 py-1 border border-stone/30 hover:border-madder"
                            title="Remove trip from ledger"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Included Circuit Stops */}
                      <div className="font-mono text-xs text-stone space-y-1">
                        <span className="text-[10px] text-charcoal font-bold uppercase block">
                          Included Stops:
                        </span>
                        <p className="text-charcoal/80">
                          {trip.sitesList.join(' • ')}
                        </p>
                      </div>

                      {/* Progress Indicator if still being planned */}
                      <div className="space-y-1 pt-1 font-mono text-xs">
                        <div className="flex justify-between text-[11px] text-stone">
                          <span>Planning Progress: {trip.statusLabel}</span>
                          <span className="font-bold text-ink">{trip.planningProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-stone/20 border border-stone/30 overflow-hidden">
                          <div
                            style={{ width: `${trip.planningProgress}%` }}
                            className={`h-full ${
                              trip.planningProgress >= 80 ? 'bg-emerald-600' : 'bg-gold'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-gold font-bold pt-2 border-t border-stone/20">
                        <span>Open Complete Circuit Monograph</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= 4. ACCOUNT SETTINGS SECTION BELOW ================= */}
        {/* Simple form fields, no heavy card/shadow treatment, matching Auth page style */}
        <div className="space-y-6 pt-4 border-t-2 border-stone/30">
          
          <div className="border-b border-stone/30 pb-3">
            <span className="font-mono text-xs text-gold uppercase tracking-widest block">
              Security & Credentials
            </span>
            <h2 className="font-display text-2xl text-charcoal font-bold">
              Account Settings
            </h2>
          </div>

          {saveSuccessNotice && (
            <div className="p-3.5 bg-emerald-900 text-salt border-2 border-emerald-400 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}

          {/* Clean labeled inputs, no card/shadow treatment */}
          <form onSubmit={handleSettingsSubmit} className="space-y-6 max-w-2xl font-mono text-xs">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-charcoal font-bold uppercase tracking-wider block">
                Traveler Name / Title:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white text-charcoal border-2 border-stone/40 focus:border-gold outline-none py-2.5 pl-10 pr-3 font-mono"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-charcoal font-bold uppercase tracking-wider block">
                Registered Email Address:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-charcoal border-2 border-stone/40 focus:border-gold outline-none py-2.5 pl-10 pr-3 font-mono"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Change */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-charcoal font-bold uppercase tracking-wider block">
                  Current Password:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white text-charcoal border-2 border-stone/40 focus:border-gold outline-none py-2.5 pl-10 pr-3 font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-charcoal font-bold uppercase tracking-wider block">
                  New Password:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white text-charcoal border-2 border-stone/40 focus:border-gold outline-none py-2.5 pl-10 pr-3 font-mono"
                    placeholder="New password (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="bg-ink hover:bg-ink/90 text-salt border border-gold font-bold py-3 px-6 text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Save Account Changes
            </button>

          </form>

        </div>

      </div>
    </div>
  );
};
