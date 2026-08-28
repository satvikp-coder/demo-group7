import React, { useState, useEffect } from "react";
import { LanguageProvider } from "./context/LanguageContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { ValueProps } from "./components/ValueProps";
import { ExploreView } from "./components/ExploreView";
import { DestinationDetailView } from "./components/DestinationDetailView";
import { ItineraryView, ItineraryConfig } from "./components/ItineraryView";
import { BudgetPlannerView } from "./components/BudgetPlannerView";
import { HotelsView } from "./components/HotelsView";
import { ProfileDashboardView } from "./components/ProfileDashboardView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { Footer } from "./components/Footer";
import { PlannerModal } from "./components/PlannerModal";
import { AuthView } from "./components/AuthView";
import { HomeTransitionOverlay } from "./components/HomeTransitionOverlay";
import { OfflineBanner } from "./components/OfflineBanner";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";
import { getLatestOfflineTrip } from "./utils/offlineStorage";

const LazyResearchView = React.lazy(() =>
  import.meta.env.DEV
    ? import("./components/ResearchView").then((m) => ({ default: m.ResearchView }))
    : Promise.resolve({ default: () => null as any })
);
import { getSharedFromUrl, clearSharedUrl } from "./utils/shareUrl";
import { Destination, GUJARAT_DESTINATIONS } from "./data/destinations";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [plannerOpen, setPlannerOpen] = useState<boolean>(false);
  const [preselectedForPlanner, setPreselectedForPlanner] =
    useState<Destination | null>(null);

  // Active Generated Itinerary Config & View Mode
  const [activeItinerary, setActiveItinerary] =
    useState<ItineraryConfig | null>(null);
  const [isReadOnlyItinerary, setIsReadOnlyItinerary] =
    useState<boolean>(false);
  const [showBudgetPlanner, setShowBudgetPlanner] = useState<boolean>(false);
  const [showHotels, setShowHotels] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);

  // Dev-only Research Simulation Mode
  const [showResearchMode, setShowResearchMode] = useState<boolean>(() => {
    if (typeof window !== "undefined" && import.meta.env.DEV) {
      return window.location.pathname === "/research";
    }
    return false;
  });

  // Parse URL for shared read-only itinerary on mount
  useEffect(() => {
    const sharedData = getSharedFromUrl();
    if (sharedData) {
      setActiveItinerary(sharedData.config);
      setIsReadOnlyItinerary(true);
      setSelectedDestination(null);
      setShowHotels(false);
      setShowProfile(false);
      setShowAdminDashboard(false);
      setShowBudgetPlanner(false);
    }
  }, []);

  // Offline & PWA Install State
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );
  const [offlineCityName, setOfflineCityName] = useState<string>("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaPrompt, setShowPwaPrompt] = useState<boolean>(false);

  // 1. Offline detection and auto-routing to cached itinerary
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      const cached = getLatestOfflineTrip();
      if (cached) {
        setOfflineCityName(cached.cityName);
        setActiveItinerary(cached.config);
        setSelectedDestination(null);
        setShowHotels(false);
        setShowProfile(false);
        setShowAdminDashboard(false);
        setAuthMode(null);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 2. Capture native beforeinstallprompt PWA event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  // 3. Surface PWA prompt ONCE non-intrusively AFTER user views a generated itinerary
  useEffect(() => {
    if (activeItinerary) {
      const isDismissed = localStorage.getItem(
        "heritage_pwa_prompt_dismissed_v1",
      );
      if (!isDismissed) {
        const timer = setTimeout(() => {
          setShowPwaPrompt(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [activeItinerary]);

  // In-memory Trip Builder list state
  const [tripList, setTripList] = useState<Destination[]>([]);

  // Preferred stay selection mapping: cityId -> hotelId
  const [preferredHotels, setPreferredHotels] = useState<
    Record<string, string>
  >({
    somnath: "premier-somnath",
    dwarka: "toran-dwarka",
    "rann-of-kutch": "toran-rann",
    gir: "gir-bird-homestay",
    modhera: "toran-modhera",
    champaner: "champaner-heritage-resort",
    saputara: "toran-hill-resort",
    ahmedabad: "house-of-mg",
  });

  const handleSetPreferredHotel = (cityId: string, hotelId: string) => {
    setPreferredHotels((prev) => ({
      ...prev,
      [cityId]: hotelId,
    }));
  };

  // Auth State
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: "tourist" | "operator";
  } | null>(null);

  const handleToggleTripItem = (dest: Destination) => {
    setTripList((prev) => {
      const exists = prev.some((item) => item.id === dest.id);
      if (exists) {
        return prev.filter((item) => item.id !== dest.id);
      } else {
        return [...prev, dest];
      }
    });
  };

  const handleOpenPlannerWithSite = (dest: Destination) => {
    setPreselectedForPlanner(dest);
    setPlannerOpen(true);
  };

  const handleNavigateSection = (sectionId: string) => {
    setSelectedDestination(null);
    if (sectionId === "admin") {
      if (!currentUser) {
        setCurrentUser({
          name: "Vidyadhar Solanki",
          email: "solanki@heritage.in",
          role: "operator",
        });
      }
      setShowAdminDashboard(true);
      setShowProfile(false);
      setShowBudgetPlanner(false);
      setShowHotels(false);
      setAuthMode(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (sectionId === "profile" || sectionId === "dashboard") {
      if (!currentUser) {
        // Set default demo user when accessing profile directly
        setCurrentUser({
          name: "Vidyadhar Solanki",
          email: "solanki@heritage.in",
          role: "tourist",
        });
      }
      setShowProfile(true);
      setShowAdminDashboard(false);
      setShowBudgetPlanner(false);
      setShowHotels(false);
      setAuthMode(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (sectionId === "budget") {
      setShowBudgetPlanner(true);
      setShowHotels(false);
      setShowProfile(false);
      setShowAdminDashboard(false);
      setAuthMode(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (sectionId === "hotels") {
      setShowHotels(true);
      setShowBudgetPlanner(false);
      setShowProfile(false);
      setShowAdminDashboard(false);
      setAuthMode(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setActiveItinerary(null);
    setShowBudgetPlanner(false);
    setShowHotels(false);
    setShowProfile(false);
    setShowAdminDashboard(false);
    if (sectionId === "account") {
      if (currentUser) {
        setShowProfile(true);
      } else {
        setAuthMode("login");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setAuthMode(null);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 50);
  };

  const handleSelectNearby = (destId: string) => {
    const found = GUJARAT_DESTINATIONS.find((d) => d.id === destId);
    if (found) {
      setSelectedDestination(found);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-salt text-charcoal font-body flex flex-col selection:bg-gold selection:text-ink">
          {/* Persistent Offline Banner */}
          {isOffline && (
            <OfflineBanner
              cityName={offlineCityName || activeItinerary?.cityId}
              hasCachedItinerary={!!getLatestOfflineTrip()}
            />
          )}

          {/* 1. Nav bar */}
          <Navbar
            onOpenPlanner={() => {
              setPreselectedForPlanner(null);
              setPlannerOpen(true);
            }}
            onNavigateSection={handleNavigateSection}
            onOpenAuth={(mode) => {
              setSelectedDestination(null);
              setActiveItinerary(null);
              setAuthMode(mode);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            user={currentUser}
            onLogout={() => setCurrentUser(null)}
            tripCount={tripList.length}
          />

          {/* Main Content Area */}
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              {showResearchMode && import.meta.env.DEV ? (
                <motion.div
                  key="research-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                >
                  <React.Suspense fallback={<div className="font-mono text-center p-8">Loading Research Matrix...</div>}>
                    <LazyResearchView
                      onBack={() => {
                        setShowResearchMode(false);
                        if (typeof window !== "undefined") {
                          window.history.pushState({}, "", "/");
                        }
                      }}
                    />
                  </React.Suspense>
                </motion.div>
              ) : selectedDestination ? (
                <motion.div
                  key="destination-detail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <DestinationDetailView
                    destination={selectedDestination}
                    preferredHotels={preferredHotels}
                    onSelectPreferredHotel={handleSetPreferredHotel}
                    onBack={() => {
                      setSelectedDestination(null);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onAddToTrip={handleToggleTripItem}
                    isAddedToTrip={tripList.some(
                      (d) => d.id === selectedDestination.id,
                    )}
                    onSelectNearbyDestination={handleSelectNearby}
                    onOpenPlannerWithSite={handleOpenPlannerWithSite}
                  />
                </motion.div>
              ) : authMode ? (
                /* If Auth Mode active, display full Auth View */
                <motion.div
                  key="auth-view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <AuthView
                    initialMode={authMode}
                    onCloseOrGuest={() => setAuthMode(null)}
                    onAuthSuccess={(user) => {
                      setCurrentUser(user);
                      setAuthMode(null);
                      setShowProfile(true);
                    }}
                  />
                </motion.div>
              ) : showAdminDashboard ? (
                /* Display Admin Dashboard View */
                <motion.div
                  key="admin-dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                >
                  <AdminDashboardView
                    onBackToProfile={() => {
                      setShowAdminDashboard(false);
                      setShowProfile(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </motion.div>
              ) : showProfile ? (
                /* Display Profile & Dashboard View */
                <motion.div
                  key="profile-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                >
                  <ProfileDashboardView
                    currentUser={currentUser}
                    onOpenItinerary={(config) => {
                      setActiveItinerary(config);
                      setShowProfile(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onOpenExplore={() => {
                      setShowProfile(false);
                      handleNavigateSection("explore");
                    }}
                    onOpenPlanner={() => {
                      setShowProfile(false);
                      setPlannerOpen(true);
                    }}
                    onOpenAdminDashboard={() => {
                      setShowProfile(false);
                      setShowAdminDashboard(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onLogout={() => {
                      setCurrentUser(null);
                      setShowProfile(false);
                    }}
                  />
                </motion.div>
              ) : showHotels ? (
                /* Display Ranked Hotels Page */
                <motion.div
                  key="hotels-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                >
                  <HotelsView
                    preferredHotels={preferredHotels}
                    onSelectPreferredHotel={handleSetPreferredHotel}
                    onSelectDestination={(dest) => {
                      setSelectedDestination(dest);
                      setShowHotels(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onOpenPlanner={() => {
                      setShowHotels(false);
                      setPlannerOpen(true);
                    }}
                  />
                </motion.div>
              ) : showBudgetPlanner ? (
                /* Display Budget Planner Page */
                <motion.div
                  key="budget-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                >
                  <BudgetPlannerView
                    config={activeItinerary}
                    onBackToItinerary={() => {
                      if (!activeItinerary) {
                        // If no active itinerary config yet, create default worked example config
                        setActiveItinerary({
                          cityId: "somnath",
                          tripDays: 2,
                          budget: 8500,
                          startingHotelId:
                            preferredHotels["somnath"] || "premier-somnath",
                          startTime: "08:00 AM",
                        });
                      }
                      setShowBudgetPlanner(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onBackToPlanner={() => {
                      setShowBudgetPlanner(false);
                      setPlannerOpen(true);
                    }}
                    onSelectDestination={(dest) => {
                      setSelectedDestination(dest);
                      setShowBudgetPlanner(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </motion.div>
              ) : activeItinerary ? (
                /* Display Generated Itinerary View */
                <motion.div
                  key="itinerary-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                >
                  <ItineraryView
                    config={activeItinerary}
                    preferredHotels={preferredHotels}
                    onSelectPreferredHotel={handleSetPreferredHotel}
                    onBackToPlanner={() => setPlannerOpen(true)}
                    onSelectDestination={(dest) => {
                      setSelectedDestination(dest);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onOpenBudgetPlanner={() => {
                      setShowBudgetPlanner(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    isReadOnly={isReadOnlyItinerary}
                    onPlanOwnTrip={() => {
                      clearSharedUrl();
                      setIsReadOnlyItinerary(false);
                      setActiveItinerary(null);
                      setSelectedDestination(null);
                      setPlannerOpen(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </motion.div>
              ) : (
                /* Landing Page & Explore Views (Home Screen) */
                <motion.div
                  key="home-screen"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Home Screen Entrance Transition Overlay & Gold Sweep */}
                  <HomeTransitionOverlay />

                  {/* 2. Hero Section */}
                  <Hero
                    onStartPlanning={() => {
                      setPreselectedForPlanner(null);
                      setPlannerOpen(true);
                    }}
                    onExploreClick={() => handleNavigateSection("explore")}
                    onSelectSite={(siteId) => handleSelectNearby(siteId)}
                  />

                  {/* 3. "Why this exists" Section */}
                  <ValueProps />

                  {/* 4. Full Explore & Search Page (Main Terrace Grid Search & Browse) */}
                  <ExploreView
                    onSelectDestination={(dest) => {
                      setSelectedDestination(dest);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onStartTripWithDestination={handleOpenPlannerWithSite}
                  />

                  {/* Heritage Haveli & Stays Section (For "Hotels" link) */}
                  <section
                    id="hotels"
                    className="bg-salt py-16 border-b border-stone/30"
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="border-l-2 border-gold pl-4 mb-8">
                        <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
                          Preserved Heritage Accommodations
                        </span>
                        <h2 className="font-display text-2xl sm:text-3xl text-charcoal tracking-tight">
                          Heritage Havelis & Royal Palaces
                        </h2>
                        <p className="text-xs text-stone font-mono mt-1">
                          Authentic heritage homestays and restored royal guest
                          palaces near Gujarat’s monuments.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            name: "House of MG",
                            location: "Old City, Ahmedabad",
                            type: "1924 Textile Merchant Mansion",
                            rate: "₹6,200 / night",
                            dist: "Opposite Sidi Saiyyed Mosque",
                            img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
                          },
                          {
                            name: "Royal Oasis Palace",
                            location: "Wankaner, Morbi",
                            type: "Indo-Gothic Royal Estate",
                            rate: "₹7,800 / night",
                            dist: "Near Modhera & Sun Temple Circuit",
                            img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800",
                          },
                          {
                            name: "Rann Riders Safari Resort",
                            location: "Dasada, Little Rann",
                            type: "Traditional Bhunga Cottages",
                            rate: "₹5,500 / night",
                            dist: "Wild Ass Sanctuary & Salt Flats",
                            img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800",
                          },
                        ].map((hotel, idx) => (
                          <div
                            key={idx}
                            className="bg-ink text-salt p-4 border border-stone/40 space-y-3"
                          >
                            <div className="relative h-44 overflow-hidden border border-stone/30">
                              <img
                                src={hotel.img}
                                alt={hotel.name}
                                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                              />
                              <span className="absolute top-2 left-2 bg-salt text-ink font-mono text-[10px] px-2 py-0.5 uppercase">
                                {hotel.type}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-display text-lg font-semibold text-salt">
                                {hotel.name}
                              </h3>
                              <span className="text-xs font-mono text-stone flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gold" />
                                {hotel.location}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-stone/30">
                              <span className="text-stone">{hotel.dist}</span>
                              <span className="text-gold font-semibold">
                                {hotel.rate}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* 5. Footer */}
          <Footer
            onNavigateSection={handleNavigateSection}
            onOpenPlanner={() => {
              setPreselectedForPlanner(null);
              setPlannerOpen(true);
            }}
          />

          {/* Trip Planner Modal */}
          <PlannerModal
            isOpen={plannerOpen}
            onClose={() => setPlannerOpen(false)}
            preselectedDestination={preselectedForPlanner}
            tripList={tripList}
            preferredHotels={preferredHotels}
            onSelectPreferredHotel={handleSetPreferredHotel}
            onGenerateItinerary={(config) => {
              setSelectedDestination(null);
              setAuthMode(null);
              setActiveItinerary(config);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />

          {/* Non-intrusive PWA Add to Home Screen Prompt */}
          {showPwaPrompt && (
            <PwaInstallPrompt
              deferredPrompt={deferredPrompt}
              onDismiss={() => {
                localStorage.setItem(
                  "heritage_pwa_prompt_dismissed_v1",
                  "true",
                );
                setShowPwaPrompt(false);
              }}
              onInstalled={() => {
                localStorage.setItem(
                  "heritage_pwa_prompt_dismissed_v1",
                  "true",
                );
                setShowPwaPrompt(false);
              }}
            />
          )}
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}
