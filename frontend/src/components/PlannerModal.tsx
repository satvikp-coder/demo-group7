import React, { useState, useEffect } from "react";
import {
  Destination,
  GUJARAT_DESTINATIONS,
  getCityById,
} from "../data/destinations";
import {
  X,
  Calendar,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Hotel,
  Clock,
  Compass,
  SlidersHorizontal,
  Accessibility,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { StrategyComparisonModal } from "./StrategyComparisonModal";
import {
  OptimizationStrategy,
  PlannerConfigPayload,
} from "../utils/itineraryPlanner";

export type { PlannerConfigPayload };

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
  const { language, t, getName } = useLanguage();

  // Step 1: Selected single city ID
  const [selectedCityId, setSelectedCityId] = useState<string>(() => {
    return preselectedDestination?.id || "somnath";
  });

  // Step 2: Logistics state
  const [tripDays, setTripDays] = useState<number>(2);
  const [budget, setBudget] = useState<number>(8500);
  const [startingHotelId, setStartingHotelId] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("08:00 AM");
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);

  // Step 3: Comparison Modal trigger state
  const [showComparisonModal, setShowComparisonModal] =
    useState<boolean>(false);

  // Active City
  const activeCity = getCityById(selectedCityId) || GUJARAT_DESTINATIONS[0];

  // Sync selectedCityId and default starting hotel when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      const initialCityId =
        preselectedDestination?.id || selectedCityId || "somnath";
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
      startingHotelId: startingHotelId || activeCity.hotels[0]?.id || "",
      startTime: startTime || "08:00 AM",
      wheelchairAccessibleOnly: wheelchairOnly,
    });
    onClose();
  };

  const startingHotelObj =
    activeCity.hotels.find((h) => h.id === startingHotelId) ||
    activeCity.hotels[0];

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
              {language === "gu"
                ? `${getName(activeCity)} પ્રવાસ આયોજન`
                : language === "hi"
                  ? `${getName(activeCity)} यात्रा योजना`
                  : `Plan Your ${getName(activeCity)} Experience`}
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
        <div
          className="hidden sm:grid grid-cols-3 gap-2 mb-8 items-end"
          role="tablist"
          aria-label="Planner Steps"
        >
          {/* STEP 1 BLOCK */}
          <button
            type="button"
            role="tab"
            aria-selected={step === 1}
            aria-current={step === 1 ? "step" : undefined}
            onClick={() => setStep(1)}
            className={`p-3 border text-left w-full transition-all cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-gold ${
              step === 1
                ? "bg-ink text-salt border-2 border-gold font-bold shadow-md"
                : step > 1
                  ? "bg-gold text-ink border border-gold font-bold"
                  : "bg-stone/20 text-stone border border-stone/30 font-medium"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
              <span>
                01.{" "}
                {language === "gu"
                  ? "સ્થળ પસંદગી"
                  : language === "hi"
                    ? "शहर चयन"
                    : "Confirm City"}
              </span>
              {step > 1 ? (
                <div className="w-4 h-4 rounded-full bg-ink text-gold flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              ) : (
                <span className="text-[10px] opacity-80">Terrace 1</span>
              )}
            </div>
            <div className="font-display text-sm mt-1 truncate">
              {getName(activeCity)}
            </div>
          </button>

          {/* STEP 2 BLOCK */}
          <button
            type="button"
            role="tab"
            aria-selected={step === 2}
            aria-current={step === 2 ? "step" : undefined}
            onClick={() => setStep(2)}
            className={`p-3.5 border text-left w-full transition-all cursor-pointer relative translate-y-[-2px] focus:outline-none focus:ring-2 focus:ring-gold ${
              step === 2
                ? "bg-ink text-salt border-2 border-gold font-bold shadow-md"
                : step > 2
                  ? "bg-gold text-ink border border-gold font-bold"
                  : "bg-stone/20 text-stone border border-stone/30 font-medium"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
              <span>
                02.{" "}
                {language === "gu"
                  ? "લોજિસ્ટિક્સ"
                  : language === "hi"
                    ? "लॉजिस्टिक्स"
                    : "Logistics"}
              </span>
              {step > 2 ? (
                <div className="w-4 h-4 rounded-full bg-ink text-gold flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              ) : (
                <span className="text-[10px] opacity-80">Terrace 2</span>
              )}
            </div>
            <div className="font-display text-sm mt-1 truncate">
              {language === "gu"
                ? "હોટેલ અને સમય"
                : language === "hi"
                  ? "होटल और समय"
                  : "Hotel & Schedule"}
            </div>
          </button>

          {/* STEP 3 BLOCK */}
          <button
            type="button"
            role="tab"
            aria-selected={step === 3}
            aria-current={step === 3 ? "step" : undefined}
            onClick={() => setStep(3)}
            className={`p-4 border text-left w-full transition-all cursor-pointer relative translate-y-[-4px] focus:outline-none focus:ring-2 focus:ring-gold ${
              step === 3
                ? "bg-ink text-salt border-2 border-gold font-bold shadow-md"
                : "bg-stone/20 text-stone border border-stone/30 font-medium"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
              <span>
                03.{" "}
                {language === "gu"
                  ? "સમીક્ષા"
                  : language === "hi"
                    ? "समीक्षा"
                    : "Review"}
              </span>
              <span className="text-[10px] opacity-80">Terrace 3</span>
            </div>
            <div className="font-display text-sm mt-1 truncate">
              {language === "gu"
                ? "રૂટ જનરેટ કરો"
                : language === "hi"
                  ? "रूट जनरेट करें"
                  : "Generate Itinerary"}
            </div>
          </button>
        </div>

        {/* Mobile Compact Step Indicator */}
        <div className="sm:hidden mb-6 p-2.5 bg-ink text-salt border border-stone/40 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-gold text-ink font-bold px-2 py-0.5 text-[10px]">
              STEP {step} OF 3
            </span>
            <span className="font-display text-sm font-semibold">
              {step === 1
                ? "Confirm City"
                : step === 2
                  ? "Hotel & Schedule"
                  : "Review Plan"}
            </span>
          </div>
          <div className="flex gap-1">
            <span
              className={`w-2 h-2 rounded-full ${step >= 1 ? "bg-gold" : "bg-stone"}`}
            />
            <span
              className={`w-2 h-2 rounded-full ${step >= 2 ? "bg-gold" : "bg-stone"}`}
            />
            <span
              className={`w-2 h-2 rounded-full ${step >= 3 ? "bg-gold" : "bg-stone"}`}
            />
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
                    {language === "gu"
                      ? "લક્ષ્ય હેરિટેજ શહેર પસંદ કરો"
                      : language === "hi"
                        ? "लक्ष्य हेरिटेज शहर चुनें"
                        : "Select Target Heritage City"}
                  </h3>
                  <p className="text-xs text-stone font-body">
                    {language === "gu"
                      ? "એક શહેર પસંદ કરો જેથી દૈનિક પ્રવાસ યોજના તૈયાર કરી શકાય."
                      : language === "hi"
                        ? "एक शहर चुनें ताकि दैनिक यात्रा योजना तैयार की जा सके।"
                        : "Pick one city for a dedicated intra-city day-by-day circular itinerary."}
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
                          ? "bg-ink text-salt border-2 border-gold font-bold shadow-sm"
                          : "bg-salt hover:bg-stone/20 text-charcoal border-stone/30"
                      }`}
                    >
                      <div className="font-display text-xs truncate">
                        {getName(c)}
                      </div>
                      <div
                        className={`text-[10px] font-mono ${isSelected ? "text-gold" : "text-stone"}`}
                      >
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
                  alt={getName(activeCity)}
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
                  <h4 className="font-display text-xl font-bold text-salt">
                    {getName(activeCity)}
                  </h4>
                  <p className="font-mono text-xs text-stone line-clamp-2">
                    {activeCity.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-gold pt-1 border-t border-stone/30">
                    <span className="flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{activeCity.bestTime}</span>
                    </span>
                    <span className="text-stone/60">•</span>
                    <span>
                      {activeCity.attractions.length}{" "}
                      {language === "gu"
                        ? "આકર્ષણો"
                        : language === "hi"
                          ? "आकर्षण"
                          : "Attractions"}
                    </span>
                    <span className="text-stone/60">•</span>
                    <span>
                      {activeCity.hotels.length}{" "}
                      {language === "gu"
                        ? "હોટેલ્સ"
                        : language === "hi"
                          ? "होटल"
                          : "Hotel Options"}
                    </span>
                    <span className="text-stone/60">•</span>
                    <span>
                      {activeCity.restaurants.length}{" "}
                      {language === "gu"
                        ? "રેસ્ટોરન્ટ્સ"
                        : language === "hi"
                          ? "रेस्तरां"
                          : "Restaurants"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Step Control */}
              <div className="pt-4 border-t border-stone/30 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-gold hover:bg-ink hover:text-gold text-ink border border-gold font-mono text-xs font-bold px-6 py-3 uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <span>
                    {language === "gu"
                      ? "લોજિસ્ટિક્સ તરફ આગળ વધો"
                      : language === "hi"
                        ? "लॉजिस्टिक्स की ओर बढ़ें"
                        : "Continue to Logistics"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: LOGISTICS */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-display text-xl text-ink font-bold border-b border-stone/20 pb-2">
                  {language === "gu"
                    ? `${getName(activeCity)} માટે લોજિસ્ટિક્સ`
                    : language === "hi"
                      ? `${getName(activeCity)} के लिए लॉजिस्टिक्स`
                      : `Trip Logistics for ${getName(activeCity)}`}
                </h3>
                <p className="text-xs text-stone font-body mt-1">
                  Configure duration, budget, starting accommodation, and daily
                  morning start time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trip Length Selector */}
                <div className="bg-white border border-stone/40 p-4 space-y-3">
                  <label
                    htmlFor="planner-trip-days"
                    className="font-mono text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-gold" />
                    1. {t("planner.days", "Trip Duration")}
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
                      <span
                        id="planner-trip-days"
                        className="font-display text-xl font-bold text-ink"
                      >
                        {tripDays}
                      </span>
                      <span className="font-mono text-xs text-stone block">
                        {language === "gu"
                          ? "દિવસો"
                          : language === "hi"
                            ? "दिन"
                            : "Days"}
                      </span>
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
                  <label
                    htmlFor="planner-budget-input"
                    className="font-mono text-xs font-bold text-charcoal uppercase tracking-wider flex items-center justify-between"
                  >
                    <span>2. {t("planner.budget", "Total Budget (₹)")}</span>
                    <span className="text-gold font-bold text-sm">
                      ₹{budget.toLocaleString("en-IN")}
                    </span>
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
                  <label
                    htmlFor="planner-starting-hotel"
                    className="font-mono text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2"
                  >
                    <Hotel className="w-4 h-4 text-gold" />
                    3. {t("planner.startingHotel", "Starting Hotel / Stay")}
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
                          {h.name} ({h.pricePerNight}/night • {h.tier}){" "}
                          {isPref ? "★ (Preferred Stay)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {startingHotelObj && (
                    <div className="font-mono text-[11px] text-stone space-y-1">
                      <p>
                        {startingHotelObj.location} •{" "}
                        {startingHotelObj.stayType}
                      </p>
                    </div>
                  )}
                </div>

                {/* Morning Start Time */}
                <div className="bg-white border border-stone/40 p-4 space-y-3">
                  <label
                    htmlFor="planner-start-time"
                    className="font-mono text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-gold" />
                    4. {t("planner.dailyStartTime", "Daily Start Time")}
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
                </div>

                {/* 5. Accessibility Constraint Toggle */}
                <div className="bg-emerald-50/50 border border-emerald-300 p-4 space-y-2 col-span-1 md:col-span-2">
                  <label className="flex items-start sm:items-center justify-between gap-3 cursor-pointer">
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                        <Accessibility className="w-4 h-4 text-emerald-800" />
                        5. Accessibility Constraint: Wheelchair-Only Route
                      </span>
                      <p className="text-xs text-stone font-body">
                        Filter the Greedy routing algorithm to visit only
                        wheelchair-accessible monuments (ramps, wide plazas,
                        flat ground).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={wheelchairOnly}
                      onChange={(e) => setWheelchairOnly(e.target.checked)}
                      className="w-5 h-5 accent-emerald-800 shrink-0 cursor-pointer mt-1 sm:mt-0"
                    />
                  </label>
                </div>
              </div>

              {/* Back / Next Controls */}
              <div className="pt-4 border-t border-stone/30 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="bg-stone/20 hover:bg-stone/30 text-charcoal border border-stone/40 font-mono text-xs font-bold px-4 py-2.5 uppercase tracking-wider flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    {language === "gu"
                      ? "પાછળ"
                      : language === "hi"
                        ? "पीछे"
                        : "Back"}
                  </span>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="bg-gold hover:bg-ink hover:text-gold text-ink border border-gold font-mono text-xs font-bold px-6 py-2.5 uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  <span>
                    {language === "gu"
                      ? "યોજના સમીક્ષા કરો"
                      : language === "hi"
                        ? "योजना समीक्षा करें"
                        : "Review Plan"}
                  </span>
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
                  {language === "gu"
                    ? "ગોળાકાર રૂટ સેટિંગ્સની સમીક્ષા કરો"
                    : language === "hi"
                      ? "वृत्ताकार मार्ग सेटिंग्स की समीक्षा करें"
                      : "Review Circular Route Settings"}
                </h3>
              </div>

              {/* Summary Card */}
              <div className="bg-ink text-salt border-2 border-gold p-6 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-stone/30 pb-3">
                  <div>
                    <span className="font-mono text-[10px] text-gold uppercase tracking-widest block">
                      Target Heritage City
                    </span>
                    <h4 className="font-display text-2xl font-bold text-salt">
                      {getName(activeCity)}
                    </h4>
                  </div>
                  <span className="bg-gold text-ink font-mono text-xs font-bold px-3 py-1 uppercase">
                    {tripDays}{" "}
                    {language === "gu"
                      ? "દિવસો"
                      : language === "hi"
                        ? "दिन"
                        : "Days"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="bg-salt/10 p-3 border border-stone/30">
                    <span className="text-stone text-[10px] uppercase block">
                      Starting Hotel
                    </span>
                    <span className="font-bold text-gold truncate block">
                      {startingHotelObj?.name}
                    </span>
                  </div>
                  <div className="bg-salt/10 p-3 border border-stone/30">
                    <span className="text-stone text-[10px] uppercase block">
                      Daily Start Time
                    </span>
                    <span className="font-bold text-gold block">
                      {startTime}
                    </span>
                  </div>
                  <div className="bg-salt/10 p-3 border border-stone/30">
                    <span className="text-stone text-[10px] uppercase block">
                      Budget Cap
                    </span>
                    <span className="font-bold text-gold block">
                      ₹{budget.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone/30 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-stone/20 hover:bg-stone/30 text-charcoal border border-stone/40 font-mono text-xs font-bold px-4 py-2.5 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>
                    {language === "gu"
                      ? "લોજિસ્ટિક્સ બદલો"
                      : language === "hi"
                        ? "लॉजिस्टिक्स बदलें"
                        : "Adjust Logistics"}
                  </span>
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComparisonModal(true)}
                    className="bg-salt hover:bg-ink hover:text-salt text-ink border-2 border-gold font-mono text-xs font-bold px-5 py-3 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-gold" />
                    <span>Compare optimization strategies</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="bg-gold hover:bg-ink hover:text-gold text-ink border border-gold font-mono text-xs font-bold px-6 py-3 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-all"
                  >
                    <Compass className="w-4 h-4 text-ink hover:text-gold" />
                    <span>
                      {t("planner.generateItinerary", "Generate Circular Plan")}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strategy Comparison Modal Overlay */}
      {showComparisonModal && (
        <StrategyComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          config={{
            cityId: activeCity.id,
            tripDays,
            budget,
            startingHotelId: startingHotelId || activeCity.hotels[0]?.id || "",
            startTime: startTime || "08:00 AM",
          }}
          onSelectStrategy={(strategy: OptimizationStrategy) => {
            setShowComparisonModal(false);
            onGenerateItinerary({
              cityId: activeCity.id,
              tripDays,
              budget,
              startingHotelId:
                startingHotelId || activeCity.hotels[0]?.id || "",
              startTime: startTime || "08:00 AM",
              strategy,
            });
            onClose();
          }}
        />
      )}
    </div>
  );
};
