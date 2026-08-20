import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ValueProps } from './components/ValueProps';
import { ExploreView } from './components/ExploreView';
import { DestinationDetailView } from './components/DestinationDetailView';
import { ItineraryView, ItineraryConfig } from './components/ItineraryView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { HotelsView } from './components/HotelsView';
import { ProfileDashboardView } from './components/ProfileDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { Footer } from './components/Footer';
import { PlannerModal } from './components/PlannerModal';
import { AuthView } from './components/AuthView';
import { Destination, GUJARAT_DESTINATIONS } from './data/destinations';
import { MapPin } from 'lucide-react';

export default function App() {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [plannerOpen, setPlannerOpen] = useState<boolean>(false);
  const [preselectedForPlanner, setPreselectedForPlanner] = useState<Destination | null>(null);
  
  // Active Generated Itinerary Config & View Mode
  const [activeItinerary, setActiveItinerary] = useState<ItineraryConfig | null>(null);
  const [showBudgetPlanner, setShowBudgetPlanner] = useState<boolean>(false);
  const [showHotels, setShowHotels] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);

  // In-memory Trip Builder list state
  const [tripList, setTripList] = useState<Destination[]>([]);

  // Preferred stay selection mapping: cityId -> hotelId
  const [preferredHotels, setPreferredHotels] = useState<Record<string, string>>({
    somnath: 'premier-somnath',
    dwarka: 'toran-dwarka',
    'rann-of-kutch': 'toran-rann',
    gir: 'gir-bird-homestay',
    modhera: 'toran-modhera',
    champaner: 'champaner-heritage-resort',
    saputara: 'toran-hill-resort',
    ahmedabad: 'house-of-mg'
  });

  const handleSetPreferredHotel = (cityId: string, hotelId: string) => {
    setPreferredHotels(prev => ({
      ...prev,
      [cityId]: hotelId
    }));
  };

  // Auth State
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: 'tourist' | 'operator' } | null>(null);

  const handleToggleTripItem = (dest: Destination) => {
    setTripList(prev => {
      const exists = prev.some(item => item.id === dest.id);
      if (exists) {
        return prev.filter(item => item.id !== dest.id);
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
    if (sectionId === 'admin') {
      if (!currentUser) {
        setCurrentUser({ name: 'Vidyadhar Solanki', email: 'solanki@heritage.in', role: 'operator' });
      }
      setShowAdminDashboard(true);
      setShowProfile(false);
      setShowBudgetPlanner(false);
      setShowHotels(false);
      setAuthMode(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'profile' || sectionId === 'dashboard') {
      if (!currentUser) {
        // Set default demo user when accessing profile directly
        setCurrentUser({ name: 'Vidyadhar Solanki', email: 'solanki@heritage.in', role: 'tourist' });
      }
      setShowProfile(true);
      setShowAdminDashboard(false);
      setShowBudgetPlanner(false);
      setShowHotels(false);
      setAuthMode(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'budget') {
      setShowBudgetPlanner(true);
      setShowHotels(false);
      setShowProfile(false);
      setShowAdminDashboard(false);
      setAuthMode(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (sectionId === 'hotels') {
      setShowHotels(true);
      setShowBudgetPlanner(false);
      setShowProfile(false);
      setShowAdminDashboard(false);
      setAuthMode(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveItinerary(null);
    setShowBudgetPlanner(false);
    setShowHotels(false);
    setShowProfile(false);
    setShowAdminDashboard(false);
    if (sectionId === 'account') {
      if (currentUser) {
        setShowProfile(true);
      } else {
        setAuthMode('login');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setAuthMode(null);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleSelectNearby = (destId: string) => {
    const found = GUJARAT_DESTINATIONS.find(d => d.id === destId);
    if (found) {
      setSelectedDestination(found);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-salt text-charcoal font-body flex flex-col selection:bg-gold selection:text-ink">
      
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
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        user={currentUser}
        onLogout={() => setCurrentUser(null)}
        tripCount={tripList.length}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* If a single Destination is selected, display the full Destination Details View */}
        {selectedDestination ? (
          <DestinationDetailView
            destination={selectedDestination}
            preferredHotels={preferredHotels}
            onSelectPreferredHotel={handleSetPreferredHotel}
            onBack={() => {
              setSelectedDestination(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddToTrip={handleToggleTripItem}
            isAddedToTrip={tripList.some(d => d.id === selectedDestination.id)}
            onSelectNearbyDestination={handleSelectNearby}
            onOpenPlannerWithSite={handleOpenPlannerWithSite}
          />
        ) : authMode ? (
          /* If Auth Mode active, display full Auth View */
          <AuthView
            initialMode={authMode}
            onCloseOrGuest={() => setAuthMode(null)}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              setAuthMode(null);
              setShowProfile(true);
            }}
          />
        ) : showAdminDashboard ? (
          /* Display Admin Dashboard View */
          <AdminDashboardView
            onBackToProfile={() => {
              setShowAdminDashboard(false);
              setShowProfile(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : showProfile ? (
          /* Display Profile & Dashboard View */
          <ProfileDashboardView
            currentUser={currentUser}
            onOpenItinerary={(config) => {
              setActiveItinerary(config);
              setShowProfile(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenExplore={() => {
              setShowProfile(false);
              handleNavigateSection('explore');
            }}
            onOpenPlanner={() => {
              setShowProfile(false);
              setPlannerOpen(true);
            }}
            onOpenAdminDashboard={() => {
              setShowProfile(false);
              setShowAdminDashboard(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLogout={() => {
              setCurrentUser(null);
              setShowProfile(false);
            }}
          />
        ) : showHotels ? (
          /* Display Ranked Hotels Page */
          <HotelsView
            preferredHotels={preferredHotels}
            onSelectPreferredHotel={handleSetPreferredHotel}
            onSelectDestination={(dest) => {
              setSelectedDestination(dest);
              setShowHotels(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenPlanner={() => {
              setShowHotels(false);
              setPlannerOpen(true);
            }}
          />
        ) : showBudgetPlanner ? (
          /* Display Budget Planner Page */
          <BudgetPlannerView
            config={activeItinerary}
            onBackToItinerary={() => {
              if (!activeItinerary) {
                // If no active itinerary config yet, create default worked example config
                setActiveItinerary({
                  cityId: 'somnath',
                  tripDays: 2,
                  budget: 8500,
                  startingHotelId: preferredHotels['somnath'] || 'premier-somnath',
                  startTime: '08:00 AM'
                });
              }
              setShowBudgetPlanner(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToPlanner={() => {
              setShowBudgetPlanner(false);
              setPlannerOpen(true);
            }}
            onSelectDestination={(dest) => {
              setSelectedDestination(dest);
              setShowBudgetPlanner(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : activeItinerary ? (
          /* Display Generated Itinerary View */
          <ItineraryView
            config={activeItinerary}
            preferredHotels={preferredHotels}
            onSelectPreferredHotel={handleSetPreferredHotel}
            onBackToPlanner={() => setPlannerOpen(true)}
            onSelectDestination={(dest) => {
              setSelectedDestination(dest);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenBudgetPlanner={() => {
              setShowBudgetPlanner(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* Landing Page & Explore Views */
          <>
            {/* 2. Hero Section */}
            <Hero
              onStartPlanning={() => {
                setPreselectedForPlanner(null);
                setPlannerOpen(true);
              }}
              onExploreClick={() => handleNavigateSection('explore')}
            />

            {/* 3. "Why this exists" Section */}
            <ValueProps />

            {/* 4. Full Explore & Search Page (Main Terrace Grid Search & Browse) */}
            <ExploreView
              onSelectDestination={(dest) => {
                setSelectedDestination(dest);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStartTripWithDestination={handleOpenPlannerWithSite}
            />

            {/* Heritage Haveli & Stays Section (For "Hotels" link) */}
            <section id="hotels" className="bg-salt py-16 border-b border-stone/30">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="border-l-2 border-gold pl-4 mb-8">
                  <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
                    Preserved Heritage Accommodations
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl text-charcoal tracking-tight">
                    Heritage Havelis & Royal Palaces
                  </h2>
                  <p className="text-xs text-stone font-mono mt-1">
                    Authentic heritage homestays and restored royal guest palaces near Gujarat’s monuments.
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
                      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"
                    },
                    {
                      name: "Royal Oasis Palace",
                      location: "Wankaner, Morbi",
                      type: "Indo-Gothic Royal Estate",
                      rate: "₹7,800 / night",
                      dist: "Near Modhera & Sun Temple Circuit",
                      img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800"
                    },
                    {
                      name: "Rann Riders Safari Resort",
                      location: "Dasada, Little Rann",
                      type: "Traditional Bhunga Cottages",
                      rate: "₹5,500 / night",
                      dist: "Wild Ass Sanctuary & Salt Flats",
                      img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800"
                    }
                  ].map((hotel, idx) => (
                    <div key={idx} className="bg-ink text-salt p-4 border border-stone/40 space-y-3">
                      <div className="relative h-44 overflow-hidden border border-stone/30">
                        <img src={hotel.img} alt={hotel.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300" />
                        <span className="absolute top-2 left-2 bg-salt text-ink font-mono text-[10px] px-2 py-0.5 uppercase">
                          {hotel.type}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-salt">{hotel.name}</h3>
                        <span className="text-xs font-mono text-stone flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gold" />
                          {hotel.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-stone/30">
                        <span className="text-stone">{hotel.dist}</span>
                        <span className="text-gold font-semibold">{hotel.rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

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
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}



