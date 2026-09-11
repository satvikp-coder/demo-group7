import React, { useState, useEffect, useCallback } from "react";
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
import {
  navigate,
  getCurrentRoute,
  subscribeToRoute,
  RouteState,
} from "./utils/router";

const LazyResearchView = React.lazy(() =>
  import.meta.env.DEV
    ? import("./components/ResearchView").then((m) => ({ default: m.ResearchView }))
    : Promise.resolve({ default: () => null as any })
);
import { getSharedFromUrl, clearSharedUrl } from "./utils/shareUrl";
import { Destination, GUJARAT_DESTINATIONS, getCityById } from "./data/destinations";
import { MapPin } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Session-storage helpers for itinerary persistence across refresh ───────
const ITINERARY_SESSION_KEY = "heritage_active_itinerary_v1";
const AUTH_LOCAL_KEY = "heritage_current_user_v1";

function saveItineraryToSession(cfg: ItineraryConfig | null) {
  if (cfg) {
    sessionStorage.setItem(ITINERARY_SESSION_KEY, JSON.stringify(cfg));
  } else {
    sessionStorage.removeItem(ITINERARY_SESSION_KEY);
  }
}

function restoreItineraryFromSession(): ItineraryConfig | null {
  try {
    const raw = sessionStorage.getItem(ITINERARY_SESSION_KEY);
    return raw ? (JSON.parse(raw) as ItineraryConfig) : null;
  } catch {
    return null;
  }
}

function saveUserToLocal(user: { name: string; email: string; role: "tourist" | "operator" } | null) {
  if (user) {
    localStorage.setItem(AUTH_LOCAL_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_LOCAL_KEY);
  }
}

function restoreUserFromLocal(): { name: string; email: string; role: "tourist" | "operator" } | null {
  try {
    const raw = localStorage.getItem(AUTH_LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

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
  const [showResearchMode, setShowResearchMode] = useState<boolean>(false);

  // ─── Auth State (restored from localStorage) ───────────────────────────────
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: "tourist" | "operator";
  } | null>(() => restoreUserFromLocal());

  // ─── Sync state from a parsed route ─────────────────────────────────────────
  const syncStateFromRoute = useCallback(
    (route: RouteState) => {
      // Helper: reset all overlay views
      const clearOverlays = () => {
        setShowHotels(false);
        setShowBudgetPlanner(false);
        setShowProfile(false);
        setShowAdminDashboard(false);
        setShowResearchMode(false);
        setAuthMode(null);
      };

      switch (route.type) {
        case "home":
        case "explore":
          clearOverlays();
          setSelectedDestination(null);
          setActiveItinerary(null);
          saveItineraryToSession(null);
          break;

        case "destination": {
          const dest = GUJARAT_DESTINATIONS.find(
            (d) => d.id.toLowerCase() === (route.destinationId ?? "").toLowerCase()
          );
          if (dest) {
            clearOverlays();
            setSelectedDestination(dest);
            setActiveItinerary(null);
            saveItineraryToSession(null);
          } else {
            // Unknown destination id → go home
            navigate("/", { replace: true });
          }
          break;
        }

        case "hotels":
          clearOverlays();
          setSelectedDestination(null);
          setShowHotels(true);
          break;

        case "budget":
          clearOverlays();
          setSelectedDestination(null);
          setShowBudgetPlanner(true);
          break;

        case "itinerary": {
          // Restore from sessionStorage if no in-memory itinerary yet
          const stored = restoreItineraryFromSession();
          if (stored) {
            clearOverlays();
            setSelectedDestination(null);
            setActiveItinerary(stored);
          } else {
            // No itinerary to show → redirect home
            navigate("/", { replace: true });
          }
          break;
        }

        case "profile":
          clearOverlays();
          setSelectedDestination(null);
          setShowProfile(true);
          break;

        case "admin":
          clearOverlays();
          setSelectedDestination(null);
          setShowAdminDashboard(true);
          break;

        case "auth":
          clearOverlays();
          setSelectedDestination(null);
          setActiveItinerary(null);
          saveItineraryToSession(null);
          setAuthMode(route.authMode ?? "login");
          break;

        case "research":
          if (import.meta.env.DEV) {
            clearOverlays();
            setSelectedDestination(null);
            setShowResearchMode(true);
          } else {
            navigate("/", { replace: true });
          }
          break;

        case "not-found":
        default:
          // Soft-redirect home; no 404 page needed for this SPA
          navigate("/", { replace: true });
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ─── Mount: parse URL + subscribe to future route changes (popstate) ─────────
  useEffect(() => {
    // 1. Check for a shared-link itinerary first (takes precedence)
    const sharedData = getSharedFromUrl();
    if (sharedData) {
      setActiveItinerary(sharedData.config);
      saveItineraryToSession(sharedData.config);
      setIsReadOnlyItinerary(true);
      navigate("/itinerary", { replace: true });
      return;
    }

    // 2. Sync state from current URL
    syncStateFromRoute(getCurrentRoute());

    // 3. Subscribe so browser Back/Forward updates state
    const unsubscribe = subscribeToRoute(syncStateFromRoute);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ─── Persist activeItinerary to sessionStorage on every change ───────────────
  useEffect(() => {
    saveItineraryToSession(activeItinerary);
  }, [activeItinerary]);

  // ─── Persist currentUser to localStorage on every change ─────────────────────
  useEffect(() => {
    saveUserToLocal(currentUser);
  }, [currentUser]);

  const handleNavigateSection = (sectionId: string) => {
    switch (sectionId) {
      case "admin":
        navigate("/admin");
        return;

      case "profile":
      case "dashboard":
        navigate("/profile");
        return;

      case "budget":
        navigate("/budget");
        return;

      case "hotels":
        navigate("/hotels");
        return;

      case "account":
        if (currentUser) {
          navigate("/profile");
        } else {
          navigate("/login");
        }
        return;

      case "home":
        navigate("/");
        return;

      default:
        // For hash-scroll targets (explore, about, etc.) go home first then scroll
        navigate("/", { preserveScroll: true });
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 80);
    }
  };

  const handleSelectNearby = (destId: string) => {
    const found = GUJARAT_DESTINATIONS.find((d) => d.id === destId);
    if (found) {
      navigate(`/destination/${found.id}`);
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
              navigate(mode === "register" ? "/register" : "/login");
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
                      onBack={() => navigate("/")}
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
                    onBack={() => navigate("/")}
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
                    onCloseOrGuest={() => navigate("/")}
                    onAuthSuccess={(user) => {
                      setCurrentUser(user);
                      navigate("/profile");
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
                    onBackToProfile={() => navigate("/profile")}
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
                      navigate("/itinerary");
                    }}
                    onOpenExplore={() => {
                      navigate("/", { preserveScroll: true });
                      setTimeout(() => {
                        document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
                      }, 80);
                    }}
                    onOpenPlanner={() => {
                      setShowProfile(false);
                      setPlannerOpen(true);
                    }}
                    onOpenAdminDashboard={() => navigate("/admin")}
                    onLogout={() => {
                      setCurrentUser(null);
                      navigate("/");
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
                      navigate(`/destination/${dest.id}`);
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
                        const demo: ItineraryConfig = {
                          cityId: "somnath",
                          tripDays: 2,
                          budget: 8500,
                          startingHotelId:
                            preferredHotels["somnath"] || "premier-somnath",
                          startTime: "08:00 AM",
                        };
                        setActiveItinerary(demo);
                      }
                      navigate("/itinerary");
                    }}
                    onBackToPlanner={() => {
                      setShowBudgetPlanner(false);
                      setPlannerOpen(true);
                    }}
                    onSelectDestination={(dest) => {
                      navigate(`/destination/${dest.id}`);
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
                    onBackToPlanner={() => {
                      if (activeItinerary?.cityId) {
                        setPreselectedForPlanner(
                          getCityById(activeItinerary.cityId) || null,
                        );
                      }
                      setPlannerOpen(true);
                    }}
                    onSelectDestination={(dest) => {
                      navigate(`/destination/${dest.id}`);
                    }}
                    onOpenBudgetPlanner={() => navigate("/budget")}
                    isReadOnly={isReadOnlyItinerary}
                    onPlanOwnTrip={() => {
                      clearSharedUrl();
                      setIsReadOnlyItinerary(false);
                      setActiveItinerary(null);
                      navigate("/");
                      setTimeout(() => setPlannerOpen(true), 100);
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
                  />

                  {/* 3. "Why this exists" Section */}
                  <ValueProps />

                  {/* 4. Full Explore & Search Page (Main Terrace Grid Search & Browse) */}
                  <ExploreView
                    onSelectDestination={(dest) => {
                      navigate(`/destination/${dest.id}`);
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
            initialConfig={activeItinerary}
            tripList={tripList}
            preferredHotels={preferredHotels}
            onSelectPreferredHotel={handleSetPreferredHotel}
            onGenerateItinerary={(config) => {
              setActiveItinerary(config);
              setPlannerOpen(false);
              navigate("/itinerary");
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
