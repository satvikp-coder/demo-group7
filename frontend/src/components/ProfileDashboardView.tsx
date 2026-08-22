import React, { useState } from "react";
import { Destination, GUJARAT_DESTINATIONS } from "../data/destinations";
import { ItineraryConfig } from "./ItineraryView";
import { useLanguage } from "../context/LanguageContext";
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
  ShieldCheck,
  Check,
  Edit3,
  ExternalLink,
  Plus,
} from "lucide-react";

export interface SavedTrip {
  id: string;
  title: string;
  dates: string;
  daysCount: number;
  totalCost: number;
  planningProgress: number;
  statusLabel: string;
  sitesCount: number;
  sitesList: string[];
  config: ItineraryConfig;
}

interface ProfileDashboardViewProps {
  currentUser: {
    name: string;
    email: string;
    role: "tourist" | "operator";
  } | null;
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
  const { t } = useLanguage();
  const [role, setRole] = useState<"tourist" | "operator">(
    currentUser?.role || "tourist",
  );

  const [name, setName] = useState<string>(
    currentUser?.name || "Vidyadhar Solanki",
  );
  const [email, setEmail] = useState<string>(
    currentUser?.email || "solanki@heritage.in",
  );
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(
    null,
  );

  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([
    {
      id: "trip-solanki-3d",
      title: "3-Day Solanki & Heritage Stepwell Circuit",
      dates: "OCT 12 - 14, 2026",
      daysCount: 3,
      totalCost: 12800,
      planningProgress: 80,
      statusLabel: "3 of 4 Stays Booked",
      sitesCount: 3,
      sitesList: ["Modhera Sun Temple", "Champaner-Pavagadh", "Adalaj Ni Vav"],
      config: {
        selectedSites: ["modhera", "champaner", "adalaj"],
        tripDays: 3,
        budget: 12000,
      },
    },
    {
      id: "trip-kutch-5d",
      title: "5-Day Great Rann & Kutchi Craft Trail",
      dates: "NOV 04 - 08, 2026",
      daysCount: 5,
      totalCost: 24500,
      planningProgress: 45,
      statusLabel: "In Draft • Permit Pending",
      sitesCount: 4,
      sitesList: [
        "Rann of Kutch",
        "Hodka Crafts",
        "Bhuj Palace",
        "Somnath Temple",
      ],
      config: {
        selectedSites: ["rann-of-kutch", "somnath", "gir"],
        tripDays: 5,
        budget: 25000,
      },
    },
  ]);

  const [operatorListings, setOperatorListings] = useState([
    {
      id: "op-1",
      name: "Champaner Toran Heritage Haven",
      type: "Toran Hotel",
      destination: "Champaner-Pavagadh",
      status: "Verified & Active",
      lastUpdated: "2 days ago",
      price: "₹2,000 / night",
    },
    {
      id: "op-2",
      name: "Modhera Sun Temple Heritage Lodge",
      type: "Registered Hotel",
      destination: "Modhera",
      status: "Under ASI Audit",
      lastUpdated: "Oct 1, 2026",
      price: "₹3,200 / night",
    },
    {
      id: "op-3",
      name: "Hodka Artisans Homestay",
      type: "Homestay",
      destination: "Rann of Kutch",
      status: "Verified & Active",
      lastUpdated: "Sep 28, 2026",
      price: "₹2,200 / night",
    },
  ]);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccessNotice(
      "Account details updated successfully in heritage ledger!",
    );
    setTimeout(() => {
      setSaveSuccessNotice(null);
    }, 4000);
  };

  const handleDeleteTrip = (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  return (
    <div className="bg-salt min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-b border-stone/30 animate-fadeIn selection:bg-gold selection:text-ink">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* HEADER */}
        <div className="bg-ink text-salt p-6 sm:p-8 border-2 border-gold space-y-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-stepwell-pattern opacity-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone/30 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-gold text-ink font-mono text-[11px] uppercase font-bold px-2.5 py-0.5 tracking-wider border border-ink">
                  {role === "operator"
                    ? "Registered Tour Operator"
                    : "Heritage Tourist"}
                </span>
                <span className="font-mono text-[10px] text-stone">
                  • Verified Account
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl text-salt font-bold">
                Welcome back, {name || "Traveler"}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <button
                onClick={() =>
                  setRole(role === "tourist" ? "operator" : "tourist")
                }
                className="bg-salt/10 hover:bg-salt/20 text-gold border border-gold/40 px-3 py-1.5 transition-colors cursor-pointer text-[11px] flex items-center gap-1.5"
                title="Toggle between Tourist and Tour Operator mode to test both layouts"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-gold" />
                <span>
                  View Mode: {role === "tourist" ? "Tourist" : "Operator"}
                </span>
              </button>

              {onOpenAdminDashboard && (
                <button
                  onClick={onOpenAdminDashboard}
                  className="bg-gold text-ink hover:bg-gold/90 border border-gold font-bold px-3 py-1.5 transition-colors cursor-pointer text-[11px] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-ink" />
                  <span>Admin Panel</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="bg-madder hover:bg-madder/90 text-salt border border-madder px-3 py-1.5 transition-colors cursor-pointer text-[11px] flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-salt" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-mono text-xs text-stone">
            <span className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-gold" />
              <span>{email}</span>
            </span>
            <span>•</span>
            <span>Saved Routes: {savedTrips.length}</span>
            <span>•</span>
            <span>Active Ledger ID: #GL-8802</span>
          </div>
        </div>

        {saveSuccessNotice && (
          <div className="p-3.5 bg-emerald-900 text-salt border-2 border-emerald-400 text-xs font-mono flex items-center gap-2 shadow-md animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-300" />
            <span className="font-bold">{saveSuccessNotice}</span>
          </div>
        )}

        {/* ROLE BASED MAIN VIEW */}
        {role === "tourist" ? (
          <div className="space-y-6">
            <div className="border-b-2 border-gold pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                  Itinerary Vault
                </span>
                <h2 className="font-display text-xl sm:text-2xl text-charcoal font-bold">
                  My Saved Heritage Trips
                </h2>
              </div>

              <button
                onClick={onOpenPlanner}
                className="inline-flex items-center gap-2 bg-madder hover:bg-madder/90 text-salt text-xs font-mono font-bold px-4 py-2 border border-madder shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-salt" />
                <span>Create New Heritage Route</span>
              </button>
            </div>

            {savedTrips.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-stone/40 p-8 text-center space-y-4">
                <p className="font-mono text-xs text-stone">
                  No saved trips in your heritage ledger.
                </p>
                <button
                  onClick={onOpenPlanner}
                  className="bg-gold text-ink font-mono text-xs font-bold px-4 py-2 border border-ink cursor-pointer"
                >
                  Build Your First Trip
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {savedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white border-2 border-stone/40 hover:border-gold p-6 transition-all shadow-2xs space-y-4 group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/20 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-ink text-gold font-mono text-[10px] font-bold px-2 py-0.5 uppercase">
                            {trip.dates}
                          </span>
                          <span className="font-mono text-xs text-stone">
                            {trip.daysCount} Days • {trip.sitesCount}{" "}
                            Destinations
                          </span>
                        </div>
                        <h3 className="font-display text-xl text-charcoal font-bold mt-1 group-hover:text-ink transition-colors">
                          {trip.title}
                        </h3>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className="text-[10px] text-stone uppercase block">
                          Est. Total Outlay
                        </span>
                        <span className="text-lg font-bold text-ink">
                          ₹{trip.totalCost.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                      <div className="space-y-1 max-w-lg">
                        <span className="text-stone text-[10px] uppercase block">
                          Circuit Destinations:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {trip.sitesList.map((site, i) => (
                            <span
                              key={i}
                              className="bg-salt border border-stone/30 text-charcoal px-2 py-0.5 text-[11px]"
                            >
                              {site}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                        <button
                          onClick={() => onOpenItinerary(trip.config)}
                          className="bg-ink hover:bg-ink/90 text-salt border border-gold px-4 py-2 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>Open Itinerary</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gold" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteTrip(trip.id, e)}
                          className="bg-salt hover:bg-madder/10 text-stone hover:text-madder border border-stone/30 px-3 py-2 text-xs transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TOUR OPERATOR DASHBOARD VIEW */
          <div className="space-y-6">
            <div className="border-b-2 border-gold pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                  Tour Operator Console
                </span>
                <h2 className="font-display text-xl sm:text-2xl text-charcoal font-bold">
                  My Registered Heritage Properties & Stays
                </h2>
              </div>

              <button
                onClick={() =>
                  alert(
                    "New listing application initialized. Tourism guild form submitted.",
                  )
                }
                className="inline-flex items-center gap-2 bg-madder hover:bg-madder/90 text-salt text-xs font-mono font-bold px-4 py-2 border border-madder shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-salt" />
                <span>Submit New Property for Audit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {operatorListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border-2 border-stone/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gold shrink-0" />
                      <span className="font-bold text-charcoal text-sm">
                        {item.name}
                      </span>
                      <span className="bg-salt text-charcoal border border-stone/40 text-[10px] px-2 py-0.5 uppercase">
                        {item.type}
                      </span>
                    </div>
                    <p className="text-stone text-[11px]">
                      Destination: {item.destination} • Status:{" "}
                      <strong className="text-emerald-800">
                        {item.status}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <span className="font-bold text-ink text-sm">
                      {item.price}
                    </span>
                    <button
                      onClick={() => alert(`Editing listing "${item.name}"...`)}
                      className="bg-salt hover:bg-stone/20 text-charcoal border border-stone/40 px-3 py-1.5 cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-ink" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCOUNT SETTINGS FORM */}
        <div className="bg-white border-2 border-stone/40 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-stone/30 pb-3">
            <span className="font-mono text-xs text-gold uppercase tracking-widest block">
              Security & Credentials
            </span>
            <h2 className="font-display text-xl text-charcoal font-bold">
              Account Preferences
            </h2>
          </div>

          <form
            onSubmit={handleSettingsSubmit}
            className="space-y-5 max-w-2xl font-mono text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-charcoal uppercase tracking-wider text-[11px] font-bold">
                  Full Name / Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-salt border border-stone/40 text-charcoal text-sm outline-none focus:border-gold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-charcoal uppercase tracking-wider text-[11px] font-bold">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-salt border border-stone/40 text-charcoal text-sm outline-none focus:border-gold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="block text-charcoal uppercase tracking-wider text-[11px] font-bold">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2.5 bg-salt border border-stone/40 text-charcoal text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-charcoal uppercase tracking-wider text-[11px] font-bold">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 bg-salt border border-stone/40 text-charcoal text-sm outline-none focus:border-gold"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-ink hover:bg-ink/90 text-salt border border-gold text-xs font-mono font-bold px-6 py-2.5 transition-colors cursor-pointer shadow-xs"
              >
                Save Account Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
