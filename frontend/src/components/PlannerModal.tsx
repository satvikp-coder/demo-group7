import React, { useState, useEffect } from 'react';
import { Destination, GUJARAT_DESTINATIONS, getCityById } from '../data/destinations';
import { X, Calendar, Check, ArrowRight, ArrowLeft, Plus, Minus, MapPin, Hotel, Clock, Compass, ShieldCheck } from 'lucide-react';

export interface PlannerConfigPayload {
  cityId: string;
  tripDays: number;
  budget: number;
  startingHotelId: string;
  startTime: string;
}

interface PlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedDestination?: Destination | null;
  tripList?: Destination[];
  preferredHotels?: Record<string, string>;
  onSelectPreferredHotel?: (cityId: string, hotelId: string) => void;
  onGenerateItinerary: (config: PlannerConfigPayload) => void;
}

export const PlannerModal: React.FC<PlannerModalProps> = ({
  isOpen,
  onClose,
  preselectedDestination,
  preferredHotels,
  onSelectPreferredHotel,
  onGenerateItinerary,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Selected single city ID
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    return preselectedDestination?.id || 'somnath';
  });

  // Step 2: Logistics state
  const [tripDays, setTripDays] = useState<number>(2);
  const [budget, setBudget] = useState<number>(8500);
  const [startingHotelId, setStartingHotelId] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('08:00 AM');

  // Active City
  const activeCity = getCityById(selectedCityId) || GUJARAT_DESTINATIONS[0];

  // Sync selectedCityId and default starting hotel when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const initialCityId = preselectedDestination?.id || selectedCityId || 'somnath';
      setSelectedCityId(initialCityId);
      const cityObj = getCityById(initialCityId) || GUJARAT_DESTINATIONS[0];
      const preferredForCity = preferredHotels?.[initialCityId];
      if (preferredForCity) {
        setStartingHotelId(preferredForCity);
      } else if (cityObj.hotels && cityObj.hotels.length > 0) {
        setStartingHotelId(cityObj.hotels[0].id);
      }
    }
  }, [isOpen, preselectedDestination]);

  // When city changes, load preferred stay or fallback to first hotel
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    const cityObj = getCityById(cityId);
    const preferredForCity = preferredHotels?.[cityId];
    if (preferredForCity) {
      setStartingHotelId(preferredForCity);
    } else if (cityObj && cityObj.hotels.length > 0) {
      setStartingHotelId(cityObj.hotels[0].id);
    }
  };

  const handleStartingHotelChange = (hotelId: string) => {
    setStartingHotelId(hotelId);
    if (onSelectPreferredHotel) {
      onSelectPreferredHotel(selectedCityId, hotelId);
    }
  };

  if (!isOpen) return null;

  const handleGenerate = () => {
    onGenerateItinerary({
      cityId: activeCity.id,
      tripDays,
      budget,
      startingHotelId: startingHotelId || (activeCity.hotels[0]?.id || ''),
      startTime: startTime || '08:00 AM',
    });
    onClose();
  };

  const startingHotelObj = activeCity.hotels.find(h => h.id === startingHotelId) || activeCity.hotels[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/85 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-salt border-2 border-gold max-w-3xl w-full text-charcoal p-5 sm:p-8 relative shadow-2xl my-6 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-stone/30 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-gold uppercase tracking-widest mb-1">
              <Calendar className="w-4 h-4 text-gold" />
              <span>Stepwell Single-City Day Planner</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-ink font-semibold">
              Plan Your {activeCity.name} Experience
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone hover:text-ink hover:bg-stone/20 border border-stone/30 transition-colors cursor-pointer"
            aria-label="Close trip planner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= STEP INDICATOR: ASCENDING STEPWELL TERRACES ================= */}
        
        {/* Desktop & Tablet: Ascending Stepwell Terraced Block Motif */}
        <div className="hidden sm:grid grid-cols-3 gap-2 mb-8 items-end" role="tablist" aria-label="Planner Steps">
          
          {/* STEP 1 BLOCK */}
          <button
            type="button"
            role="tab"
            aria-selected={step === 1}
            aria-current={step === 1 ? 'step' : undefined}
            onClick={() => setStep(1)}
            className={`p-3 border text-left w-full transition-all cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-gold ${
              step === 1
                ? 'bg-ink text-salt border-2 border-gold font-bold shadow-md'
                : step > 1
                ? 'bg-gold text-ink border border-gold font-bold'
                : 'bg-stone/20 text-stone border border-stone/30 font-medium'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
              <span>01. Confirm City</span>
              {step > 1 ? (
                <div className="w-4 h-4 rounded-full bg-ink text-gold flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              ) : (
                <span className="text-[10px] opacity-80">Terrace 1</span>
              )}
            </div>
            <div className="font-display text-sm mt-1 truncate">{activeCity.name}</div>
          </button>

          {/* STEP 2 BLOCK */}
          <button
            type="button"
            role="tab"
            aria-selected={step === 2}
            aria-current={step === 2 ? 'step' : undefined}
            onClick={() => setStep(2)}
            className={`p-3.5 border text-left w-full transition-all cursor-pointer relative translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-gold ${
              step === 2
                ? 'bg-ink text-salt border-2 border-gold font-bold shadow-md'
                : step > 2
                ? 'bg-gold text-ink border border-gold font-bold'
                : 'bg-stone/20 text-stone border border-stone/30 font-medium'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
              <span>02. Logistics</span>
              {step > 2 ? (
                <div className="w-4 h-4 rounded-full bg-ink text-gold flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              ) : (
                <span className="text-[10px] opacity-80">Terrace 2</span>
              )}
            </div>
            <div className="font-display text-sm mt-1 truncate">Hotel & Schedule</div>
          </button>

          {/* STEP 3 BLOCK */}
          <button
            type="button"
            role="tab"
            aria-selected={step === 3}
            aria-current={step === 3 ? 'step' : undefined}
            onClick={() => setStep(3)}
            className={`p-4 border text-left w-full transition-all cursor-pointer relative translate-y-[-4px] focus:outline-none focus:ring-2 focus:ring-gold ${
              step === 3
                ? 'bg-ink text-salt border-2 border-gold font-bold shadow-md'
                : 'bg-stone/20 text-stone border border-stone/30 font-medium'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
              <span>03. Review</span>
              <span className="text-[10px] opacity-80">Terrace 3</span>
            </div>
            <div className="font-display text-sm mt-1 truncate">Generate Itinerary</div>
          </button>

        </div>

        {/* Mobile Compact Step Indicator */}
        <div className="sm:hidden mb-6 p-2.5 bg-ink text-salt border border-stone/40 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-gold text-ink font-bold px-2 py-0.5 text-[10px]">
              STEP {step} OF 3
            </span>
            <span className="font-display text-sm font-semibold">
              {step === 1 ? 'Confirm City' : step === 2 ? 'Hotel & Schedule' : 'Review Plan'}
            </span>
          </div>
          <div className="flex gap-1">
            <span className={`w-2 h-2 rounded-full ${step >= 1 ? 'bg-gold' : 'bg-stone'}`} />
            <span className={`w-2 h-2 rounded-full ${step >= 2 ? 'bg-gold' : 'bg-stone'}`} />
            <span className={`w-2 h-2 rounded-full ${step >= 3 ? 'bg-gold' : 'bg-stone'}`} />
          </div>
        </div>

        {/* ================= STEP CONTENT AREA ================= */}
        <div aria-live="polite">

        {/* STEP 1: CONFIRM CITY */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/20 pb-3">
              <div>
                <h3 className="font-display text-xl text-ink font-bold">
                  Select Target Heritage City
                </h3>
                <p className="text-xs text-stone font-body">
                  Pick one city for a dedicated intra-city day-by-day circular itinerary.
                </p>
              </div>
            </div>

            {/* City Selector Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {GUJARAT_DESTINATIONS.map((c) => {
                const isSelected = c.id === selectedCityId;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleCityChange(c.id)}
                    aria-pressed={isSelected}
                    className={`p-2 border text-left cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-gold ${
                      isSelected
                        ? 'bg-ink text-salt border-2 border-gold font-bold shadow-sm'
                        : 'bg-salt hover:bg-stone/20 text-charcoal border-stone/30'
                    }`}
                  >
                    <div className="font-display text-xs truncate">{c.name}</div>
                    <div className={`text-[10px] font-mono ${isSelected ? 'text-gold' : 'text-stone'}`}>
                      {c.district}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected City Highlight Monograph */}
            <div className="bg-ink text-salt border-2 border-gold p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-center">
              <img
                src={activeCity.imageUrl}
                alt={activeCity.name}
                className="w-full sm:w-40 h-28 object-cover border border-gold shrink-0"
              />
              <div className="space-y-2 text-left w-full">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-gold tracking-widest">
                    {activeCity.officialCategory}
                  </span>
                  <span className="font-mono text-xs bg-gold text-ink font-bold px-2 py-0.5">
                    {activeCity.rating}
                  </span>
                </div>
                <h4 className="font-display text-xl font-bold text-salt">{activeCity.name}</h4>
                <p className="font-mono text-xs text-stone line-clamp-2">
                  {activeCity.description}
                </p>
                <div className="flex items-center gap-4 text-xs font-mono text-gold pt-1 border-t border-stone/30">
                  <span> {activeCity.attractions.length} Attractions</span>
                  <span> {activeCity.hotels.length} Hotel Options</span>
                  <span> {activeCity.restaurants.length} Restaurants</span>
                </div>
              </div>
            </div>

            {/* Next Step Control */}
            <div className="pt-4 border-t border-stone/30 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="bg-gold hover:bg-ink hover:text-gold text-ink border border-gold font-mono text-xs font-bold px-6 py-3 uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <span>Continue to Logistics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LOGISTICS (DAYS, BUDGET, STARTING HOTEL, START TIME) */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-display text-xl text-ink font-bold border-b border-stone/20 pb-2">
                Trip Logistics for {activeCity.name}
              </h3>
              <p className="text-xs text-stone font-body mt-1">
                Configure duration, budget, starting accommodation, and daily morning start time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Trip Length Selector */}
              <div className="bg-white border border-stone/40 p-4 space-y-3">
                <label htmlFor="planner-trip-days" className="font-mono text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gold" />
                  1. Trip Duration
                </label>
                <div className="flex items-center justify-between border border-stone/30 bg-salt p-2">
                  <button
                    type="button"
                    onClick={() => setTripDays(Math.max(1, tripDays - 1))}
                    aria-label="Decrease trip duration"
                    className="w-8 h-8 bg-ink text-gold flex items-center justify-center font-bold hover:bg-stone/40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="text-center">
                    <span id="planner-trip-days" className="font-display text-xl font-bold text-ink">{tripDays}</span>
                    <span className="font-mono text-xs text-stone block">Days</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTripDays(Math.min(7, tripDays + 1))}
                    aria-label="Increase trip duration"
                    className="w-8 h-8 bg-ink text-gold flex items-center justify-center font-bold hover:bg-stone/40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Budget Limit Input */}
              <div className="bg-white border border-stone/40 p-4 space-y-3">
                <label htmlFor="planner-budget-input" className="font-mono text-xs font-bold text-charcoal uppercase tracking-wider flex items-center justify-between">
                  <span>2. Total Budget (₹)</span>
                  <span className="text-gold font-bold text-sm">₹{budget.toLocaleString('en-IN')}</span>
                </label>
                <input
                  id="planner-budget-input"
                  type="range"
                  min="3000"
                  max="30000"
                  step="500"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-gold cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
                />
                <div className="flex justify-between font-mono text-[10px] text-stone">
                  <span>₹3,000 (Economy)</span>
                  <span>₹30,000 (Luxury)</span>
                </div>
              </div>

              {/* Starting Hotel Selection */}
              <div className="bg-white border border-stone/40 p-4 space-y-3">
                <label htmlFor="planner-starting-hotel" className="font-mono text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
                  <Hotel className="w-4 h-4 text-gold" />
                  3. Starting Hotel / Stay
                </label>
                <select
                  id="planner-starting-hotel"
                  value={startingHotelId}
                  onChange={(e) => handleStartingHotelChange(e.target.value)}
                  className="w-full bg-salt text-charcoal font-mono text-xs p-2.5 border border-stone/40 outline-none focus:border-gold focus:ring-1 focus:ring-gold cursor-pointer font-bold"
                >
                  {activeCity.hotels.map((h) => {
                    const isPref = preferredHotels?.[selectedCityId] === h.id;
                    return (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.pricePerNight}/night • {h.tier}) {isPref ? '★ (Preferred Stay)' : ''}
                      </option>
                    );
                  })}
                </select>
                {startingHotelObj && (
                  <div className="font-mono text-[11px] text-stone space-y-1">
                    <p> {startingHotelObj.location} • {startingHotelObj.stayType}</p>
                    {preferredHotels?.[selectedCityId] === startingHotelObj.id ? (
                      <p className="text-emerald-800 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Loaded as your preferred stay for {activeCity.name}.</span>
                      </p>
                    ) : (
                      <p className="text-stone italic text-[10px]">
                        Changing selection sets your new preferred stay for {activeCity.name}.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Morning Start Time */}
              <div className="bg-white border border-stone/40 p-4 space-y-3">
                <label htmlFor="planner-start-time" className="font-mono text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gold" />
                  4. Daily Start Time
                </label>
                <select
                  id="planner-start-time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-salt text-charcoal font-mono text-xs p-2.5 border border-stone/40 outline-none focus:border-gold focus:ring-1 focus:ring-gold cursor-pointer font-bold"
                >
                  <option value="07:00 AM">07:00 AM (Early Departure)</option>
                  <option value="08:00 AM">08:00 AM (Recommended)</option>
                  <option value="09:00 AM">09:00 AM (Standard)</option>
                  <option value="10:00 AM">10:00 AM (Relaxed)</option>
                  <option value="11:00 AM">11:00 AM (Late Start)</option>
                </select>
                <p className="font-mono text-[11px] text-stone">
                  Daily circular route will start & finish at your starting hotel.
                </p>
              </div>

            </div>

            {/* Back / Next Controls */}
            <div className="pt-4 border-t border-stone/30 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="bg-stone/20 hover:bg-stone/30 text-charcoal border border-stone/40 font-mono text-xs font-bold px-4 py-2.5 uppercase tracking-wider flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="bg-gold hover:bg-ink hover:text-gold text-ink border border-gold font-mono text-xs font-bold px-6 py-2.5 uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <span>Review Plan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & GENERATE */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-display text-xl text-ink font-bold border-b border-stone/20 pb-2">
                Review Circular Route Settings
              </h3>
              <p className="text-xs text-stone font-body mt-1">
                Your day-by-day plan will loop starting & ending at your chosen hotel, automatically scheduling meal breaks.
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-ink text-salt border-2 border-gold p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-stone/30 pb-3">
                <div>
                  <span className="font-mono text-[10px] text-gold uppercase tracking-widest block">
                    Target Heritage City
                  </span>
                  <h4 className="font-display text-2xl font-bold text-salt">{activeCity.name}</h4>
                </div>
                <span className="bg-gold text-ink font-mono text-xs font-bold px-3 py-1 uppercase">
                  {tripDays} Days
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="bg-salt/10 p-3 border border-stone/30">
                  <span className="text-stone text-[10px] uppercase block">Starting Hotel</span>
                  <span className="font-bold text-gold truncate block">{startingHotelObj?.name}</span>
                </div>
                <div className="bg-salt/10 p-3 border border-stone/30">
                  <span className="text-stone text-[10px] uppercase block">Daily Start Time</span>
                  <span className="font-bold text-gold block">{startTime}</span>
                </div>
                <div className="bg-salt/10 p-3 border border-stone/30">
                  <span className="text-stone text-[10px] uppercase block">Budget Cap</span>
                  <span className="font-bold text-gold block">₹{budget.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 bg-gold/10 border border-gold/40 font-mono text-xs text-stone space-y-1">
                <p className="text-gold font-bold"> Circular Intra-City Routing Strategy:</p>
                <p className="text-[11px]">
                  Daily sequence: <strong>{startingHotelObj?.name}</strong> → City Attractions → Automatic Lunch/Dinner Stops → <strong>{startingHotelObj?.name}</strong>.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-stone/30 flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="bg-stone/20 hover:bg-stone/30 text-charcoal border border-stone/40 font-mono text-xs font-bold px-4 py-2.5 uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Adjust Logistics</span>
              </button>

              <button
                onClick={handleGenerate}
                className="bg-gold hover:bg-ink hover:text-gold text-ink border border-gold font-mono text-xs font-bold px-8 py-3.5 uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xl transition-all"
              >
                <Compass className="w-5 h-5 text-ink hover:text-gold" />
                <span>Generate Day-by-Day Circular Plan</span>
              </button>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};
