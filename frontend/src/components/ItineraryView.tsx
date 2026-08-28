import React, { useState, useRef, useMemo, useEffect } from "react";
import { DESIGN_TOKENS } from "../data/colors";
import { motion, AnimatePresence } from "motion/react";
import {
  Destination,
  GUJARAT_DESTINATIONS,
  getCityById,
  Attraction,
  Hotel,
  Restaurant,
} from "../data/destinations";
import { DijkstraVisualizer } from "./DijkstraVisualizer";
import { OfflineRouteMap } from "./OfflineRouteMap";
import { saveTripToOfflineCache } from "../utils/offlineStorage";
import { useLanguage } from "../context/LanguageContext";
import {
  OptimizationStrategy,
  generateStrategyItinerary,
  PlannerConfigPayload,
} from "../utils/itineraryPlanner";
import { StrategyComparisonModal } from "./StrategyComparisonModal";
import { AlgorithmStatsPanel } from "./AlgorithmStatsPanel";
import { WhatIfPanel } from "./WhatIfPanel";
import { AccessibilityBadge } from "./AccessibilityBadge";
import { BestTimeNote } from "./BestTimeNote";
import { checkBestTimeConflict } from "../utils/bestTimeChecker";
import { ShareItineraryModal } from "./ShareItineraryModal";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Printer,
  DollarSign,
  Hotel as HotelIcon,
  Ticket,
  Utensils,
  Compass,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Cpu,
  Download,
  Loader2,
  Check,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Hospital,
  Shield,
  Ship,
} from "lucide-react";

export interface ItineraryConfig {
  cityId: string;
  tripDays: number;
  budget: number;
  startingHotelId?: string;
  startTime?: string;
  selectedSites?: string[];
  strategy?: OptimizationStrategy;
}

interface ItineraryViewProps {
  config: ItineraryConfig;
  preferredHotels?: Record<string, string>;
  onSelectPreferredHotel?: (cityId: string, hotelId: string) => void;
  onBackToPlanner: () => void;
  onSelectDestination?: (dest: Destination) => void;
  onOpenBudgetPlanner?: () => void;
  isReadOnly?: boolean;
  onPlanOwnTrip?: () => void;
}

interface ItineraryStop {
  id: string;
  type: "hotel" | "attraction" | "meal" | "transit";
  name: string;
  category: string;
  arrivalTime: string;
  departureTime: string;
  durationMinutes: number;
  cost: number;
  location: string;
  imageUrl?: string;
  description?: string;
  lat?: number;
  lng?: number;
}

interface DayRoute {
  dayNumber: number;
  dateLabel: string;
  title: string;
  stops: ItineraryStop[];
  totalKm: number;
  totalCost: number;
}

function formatTime(minutesFromMidnight: number): string {
  const mins = Math.floor(minutesFromMidnight) % (24 * 60);
  const hours = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMins = m < 10 ? `0${m}` : m;
  return `${displayHours}:${displayMins} ${ampm}`;
}

function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 8 * 60;
  const parts = timeStr.trim().split(" ");
  if (parts.length < 2) return 8 * 60;
  const [hStr, mStr] = parts[0].split(":");
  let hours = parseInt(hStr, 10) || 8;
  const mins = parseInt(mStr, 10) || 0;
  const ampm = parts[1].toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + mins;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  config,
  preferredHotels,
  onSelectPreferredHotel,
  onBackToPlanner,
  onSelectDestination,
  onOpenBudgetPlanner,
  isReadOnly = false,
  onPlanOwnTrip,
}) => {
  const { language, t, getName } = useLanguage();

  const activeCity = getCityById(config.cityId) || GUJARAT_DESTINATIONS[0];
  const cityName = getName(activeCity);

  const preferredHotelId = preferredHotels?.[config.cityId];

  const [tripTitle, setTripTitle] = useState<string>(
    `${cityName} Circular Heritage Circuit`,
  );
  const [showAlgorithm, setShowAlgorithm] = useState<boolean>(false);
  const [savedShareNotice, setSavedShareNotice] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [showComparisonModal, setShowComparisonModal] =
    useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const [activeConfig, setActiveConfig] = useState<ItineraryConfig>(config);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [sliderBudget, setSliderBudget] = useState<number>(
    config.budget || 8500,
  );
  const [sliderDays, setSliderDays] = useState<number>(config.tripDays || 2);
  const [debouncedBudget, setDebouncedBudget] = useState<number>(
    config.budget || 8500,
  );
  const [debouncedDays, setDebouncedDays] = useState<number>(
    config.tripDays || 2,
  );
  const [isSavedWhatIfNotice, setIsSavedWhatIfNotice] =
    useState<boolean>(false);

  useEffect(() => {
    setActiveConfig(config);
    setSliderBudget(config.budget || 8500);
    setSliderDays(config.tripDays || 2);
    setDebouncedBudget(config.budget || 8500);
    setDebouncedDays(config.tripDays || 2);
  }, [config]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBudget(sliderBudget);
      setDebouncedDays(sliderDays);
    }, 300);
    return () => clearTimeout(handler);
  }, [sliderBudget, sliderDays]);

  const activeStrategy =
    activeConfig.strategy || config.strategy || "distance-first";

  // Original Baseline Result (from initial config prop)
  const baselineResult = useMemo(() => {
    return generateStrategyItinerary(
      {
        cityId: config.cityId,
        tripDays: config.tripDays || 2,
        budget: config.budget || 8500,
        startingHotelId:
          config.startingHotelId || activeCity.hotels[0]?.id || "",
        startTime: config.startTime || "08:00 AM",
        strategy: activeStrategy,
      },
      activeStrategy,
      language,
    );
  }, [config, activeStrategy, language, activeCity.hotels]);

  // Active Plan Result (from activeConfig)
  const activeResult = useMemo(() => {
    return generateStrategyItinerary(
      {
        cityId: activeConfig.cityId,
        tripDays: activeConfig.tripDays || 2,
        budget: activeConfig.budget || 8500,
        startingHotelId:
          activeConfig.startingHotelId || activeCity.hotels[0]?.id || "",
        startTime: activeConfig.startTime || "08:00 AM",
        strategy: activeStrategy,
      },
      activeStrategy,
      language,
    );
  }, [activeConfig, activeStrategy, language, activeCity.hotels]);

  // Live Result (reflects debounced What-If sliders)
  const liveResult = useMemo(() => {
    if (!isWhatIfOpen) return activeResult;
    if (
      debouncedBudget === activeConfig.budget &&
      debouncedDays === activeConfig.tripDays
    ) {
      return activeResult;
    }
    return generateStrategyItinerary(
      {
        cityId: activeConfig.cityId,
        tripDays: debouncedDays,
        budget: debouncedBudget,
        startingHotelId:
          activeConfig.startingHotelId || activeCity.hotels[0]?.id || "",
        startTime: activeConfig.startTime || "08:00 AM",
        strategy: activeStrategy,
      },
      activeStrategy,
      language,
    );
  }, [
    isWhatIfOpen,
    activeConfig,
    debouncedBudget,
    debouncedDays,
    activeStrategy,
    language,
    activeCity.hotels,
    activeResult,
  ]);

  const generatedResult = isWhatIfOpen ? liveResult : activeResult;

  // Cache generated itinerary to browser storage (localStorage & ServiceWorker Cache)
  useEffect(() => {
    if (generatedResult) {
      saveTripToOfflineCache(activeConfig, generatedResult);
    }
  }, [activeConfig, generatedResult]);

  const handleSaveWhatIfVersion = () => {
    const updated = {
      ...activeConfig,
      budget: debouncedBudget,
      tripDays: debouncedDays,
    };
    setActiveConfig(updated);
    setIsSavedWhatIfNotice(true);
    setTimeout(() => setIsSavedWhatIfNotice(false), 2500);
  };

  const handleResetWhatIf = () => {
    setActiveConfig(config);
    setSliderBudget(config.budget || 8500);
    setSliderDays(config.tripDays || 2);
    setDebouncedBudget(config.budget || 8500);
    setDebouncedDays(config.tripDays || 2);
  };

  const numDays = Math.max(1, activeConfig.tripDays || 2);
  const dayPlans = generatedResult.dayPlans;
  const startingHotel = generatedResult.startingHotel;
  const totalDistanceKm = generatedResult.totalDistanceKm;
  const estimatedTotalCost = generatedResult.totalCost;

  const totalHotelCost = (startingHotel.priceNumeric || 0) * numDays;
  const totalAttractionCost = dayPlans.reduce(
    (acc, d) =>
      acc +
      d.stops
        .filter((s) => s.type === "attraction")
        .reduce((a, s) => a + s.cost, 0),
    0,
  );
  const totalMealCost = dayPlans.reduce(
    (acc, d) =>
      acc +
      d.stops.filter((s) => s.type === "meal").reduce((a, s) => a + s.cost, 0),
    0,
  );
  const totalTransportCost = dayPlans.reduce(
    (acc, d) =>
      acc +
      d.stops.filter((s) => s.type === "transit").reduce((a, s) => a + s.cost, 0),
    0,
  );

  const handleDownloadPdf = async () => {
    if (!pdfContainerRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const [jspdfModule, html2canvasModule] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const jsPDF = jspdfModule.default;
      const html2canvas = html2canvasModule.default;

      const element = pdfContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#F6F4EF",
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const sanitizeName = tripTitle
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");
      pdf.save(`${sanitizeName || "gujarat-heritage"}-itinerary.pdf`);
    } catch (err) {
      console.error("Error generating itinerary PDF:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isPreferredBase = preferredHotelId === startingHotel.id;

  const handlePrint = () => window.print();
  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="bg-salt min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-b border-stone/30 animate-fadeIn selection:bg-gold selection:text-ink">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Read-Only Shared Itinerary Banner */}
        {isReadOnly && (
          <div className="no-print bg-ink border-2 border-gold p-4 text-salt flex flex-wrap items-center justify-between gap-4 shadow-md font-mono">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2.5 h-2.5 bg-gold rounded-full animate-pulse shrink-0" />
              <div>
                <span className="text-gold font-bold uppercase tracking-wider text-[10px] block">
                  Read-Only View
                </span>
                <span className="text-sm font-sans font-medium text-salt">
                  Shared itinerary for{" "}
                  <strong className="text-gold font-bold">{cityName}</strong> —
                  viewing only
                </span>
              </div>
            </div>
            <button
              onClick={onPlanOwnTrip || onBackToPlanner}
              className="bg-madder hover:bg-madder/90 text-salt border border-madder text-xs font-mono font-bold px-4 py-2 transition-colors shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-salt" />
              <span>Plan your own trip</span>
            </button>
          </div>
        )}

        {/* Top Control Bar: Back / Actions */}
        <div className="no-print flex flex-wrap items-center justify-between gap-4 border-b border-stone/30 pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {!isReadOnly && (
              <>
                <button
                  onClick={onBackToPlanner}
                  className="inline-flex items-center gap-2 bg-stone/20 hover:bg-stone/30 text-charcoal border border-stone/40 text-xs font-mono px-3 sm:px-4 py-2 transition-colors cursor-pointer min-h-[38px]"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-ink" />
                  <span>
                    {language === "gu"
                      ? "યોજનામાં ફેરફાર કરો"
                      : language === "hi"
                        ? "योजना में बदलाव करें"
                        : "Adjust plan"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWhatIfOpen(!isWhatIfOpen)}
                  className={`inline-flex items-center gap-2 border text-xs font-mono font-bold px-3 sm:px-4 py-2 transition-colors cursor-pointer min-h-[38px] ${
                    isWhatIfOpen
                      ? "bg-gold text-ink border-gold shadow-xs"
                      : "bg-salt hover:bg-gold/10 text-charcoal border-gold/70"
                  }`}
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 ${isWhatIfOpen ? "text-ink" : "text-gold"}`}
                  />
                  <span>What if?</span>
                  {isWhatIfOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </>
            )}

            <button
              onClick={() => {
                if (onOpenBudgetPlanner) {
                  onOpenBudgetPlanner();
                }
              }}
              className="inline-flex items-center gap-2 bg-madder hover:bg-madder/90 text-salt border border-madder text-xs font-mono font-bold px-3 sm:px-4 py-2 transition-colors shadow-xs cursor-pointer min-h-[38px]"
            >
              <DollarSign className="w-3.5 h-3.5 text-salt" />
              <span>
                {language === "gu"
                  ? "બજેટ જુઓ"
                  : language === "hi"
                    ? "बजट देखें"
                    : "View budget breakdown"}
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-salt border border-stone/40 hover:border-gold text-charcoal text-xs font-mono px-3 py-2 transition-colors cursor-pointer min-h-[38px]"
            >
              <Share2 className="w-3.5 h-3.5 text-gold" />
              <span>
                {language === "gu"
                  ? "શેર કરો"
                  : language === "hi"
                    ? "शेयर करें"
                    : "Share Route"}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-salt border border-stone/40 hover:border-gold text-charcoal text-xs font-mono px-3 py-2 transition-colors cursor-pointer min-h-[38px]"
            >
              <Printer className="w-3.5 h-3.5 text-gold" />
              <span>
                {language === "gu"
                  ? "પ્રિન્ટ કરો"
                  : language === "hi"
                    ? "प्रिंट करें"
                    : "Print Ledger"}
              </span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              aria-label="Download PDF Itinerary"
              className="inline-flex items-center gap-1.5 bg-ink text-salt border border-gold hover:bg-ink/90 text-xs font-mono font-bold px-3.5 py-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs min-h-[38px]"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-gold animate-spin" />
                  <span>PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-gold" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible "What if?" Live Scenario Panel */}
        {isWhatIfOpen && (
          <div className="no-print">
            <WhatIfPanel
              currentBudget={activeConfig.budget || 8500}
              currentDays={activeConfig.tripDays || 2}
              originalBudget={config.budget || 8500}
              originalDays={config.tripDays || 2}
              sliderBudget={sliderBudget}
              sliderDays={sliderDays}
              onBudgetChange={setSliderBudget}
              onDaysChange={setSliderDays}
              liveAttractionCount={liveResult.attractionCount}
              baselineAttractionCount={baselineResult.attractionCount}
              liveCost={liveResult.totalCost}
              baselineCost={baselineResult.totalCost}
              onReset={handleResetWhatIf}
              onSaveVersion={handleSaveWhatIfVersion}
              isSavedNotice={isSavedWhatIfNotice}
            />
          </div>
        )}

        {savedShareNotice && (
          <div className="no-print p-3 bg-emerald-900 text-salt border border-emerald-500 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Itinerary route link copied to clipboard!</span>
          </div>
        )}

        {/* Printable Container */}
        <div
          ref={pdfContainerRef}
          className="printable-container space-y-8 bg-salt p-2 sm:p-4 border border-stone/20"
        >

          {/* Header Banner */}
          <div className="bg-ink text-salt p-6 sm:p-8 border-2 border-gold space-y-6 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-stepwell-pattern opacity-10 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gold">
                <Compass className="w-4 h-4 text-gold" />
                <span>Intra-City Circular Route Plan • {cityName}</span>
              </div>

              <h1 className="font-display text-2xl sm:text-4xl text-salt font-bold">
                {tripTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone pt-2 border-t border-stone/30">
                <span className="flex items-center gap-1.5 text-salt font-bold">
                  <MapPin className="w-4 h-4 text-gold" />
                  City: {cityName}
                </span>
                <span className="flex items-center gap-1.5">
                  <HotelIcon className="w-4 h-4 text-gold" />
                  <span>
                    Base Hotel: <strong>{startingHotel.name}</strong>
                  </span>
                  {isPreferredBase && (
                    <span className="bg-gold text-ink font-bold text-[10px] px-1.5 py-0.5 border border-gold uppercase">
                      ✓ Preferred Stay
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gold" />
                  Start Time: {config.startTime || "08:00 AM"}
                </span>
                <span className="flex items-center gap-1.5 text-gold font-bold">
                  <RotateCcw className="w-4 h-4 text-gold" />
                  Circular Route (Hotel → Attractions → Meals → Hotel)
                </span>
              </div>
            </div>
          </div>

          {/* Remote & Wildlife Destination Facility Callout */}
          {["gir", "rann-of-kutch", "saputara"].includes(activeCity.id) &&
            (activeCity.nearestHospital || activeCity.nearestPoliceStation) && (
              <div className="bg-salt border border-stone/30 p-4 font-mono text-xs text-stone space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-charcoal font-bold text-[11px] uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-gold shrink-0" />
                  <span>
                    Travel Preparation Note — {cityName} Remote Sector
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone">
                  {activeCity.nearestHospital && (
                    <div className="flex items-center gap-2 bg-white p-2 border border-stone/20">
                      <Hospital className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                      <span>
                        <strong>Nearest hospital:</strong>{" "}
                        {activeCity.nearestHospital} (from your starting hotel)
                      </span>
                    </div>
                  )}
                  {activeCity.nearestPoliceStation && (
                    <div className="flex items-center gap-2 bg-white p-2 border border-stone/20">
                      <Shield className="w-3.5 h-3.5 text-stone shrink-0" />
                      <span>
                        <strong>Nearest police station:</strong>{" "}
                        {activeCity.nearestPoliceStation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Slim Collapsible Algorithm Execution Stats Strip */}
          {generatedResult.stats && (
            <AlgorithmStatsPanel
              stats={generatedResult.stats}
              collapsible={true}
              defaultExpanded={false}
              title="View algorithm stats"
            />
          )}

          {/* Graceful Offline Circular Route Map Circuit */}
          <OfflineRouteMap
            dayPlans={dayPlans}
            cityName={cityName}
            startingHotelName={startingHotel.name}
            totalDistanceKm={totalDistanceKm}
            isOffline={
              typeof navigator !== "undefined" ? !navigator.onLine : false
            }
          />

          {/* Dijkstra Supporting Algorithm Visualizer Accordion */}
          <div className="border-2 border-gold bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-ink font-bold">
                <Cpu className="w-4 h-4 text-gold" />
                <span>Intra-City Shortest Path Visualizer</span>
              </div>
              <button
                onClick={() => setShowAlgorithm(!showAlgorithm)}
                className="bg-salt hover:bg-stone/20 text-charcoal border border-stone/40 font-mono text-xs font-bold px-3 py-1 flex items-center gap-1 cursor-pointer"
              >
                <span>
                  {showAlgorithm ? "Hide Visualizer" : "Expand Visualizer"}
                </span>
                {showAlgorithm ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="font-mono text-xs text-stone italic border-l-2 border-gold pl-2">
              "Dijkstra finds the shortest path between two attractions when
              they aren't directly connected -- most stops in your route are
              direct, this shows what happens when one isn't."
            </p>

            {showAlgorithm && (
              <div className="pt-3 border-t border-stone/30 animate-fadeIn">
                <DijkstraVisualizer cityId={activeCity.id} />
              </div>
            )}
          </div>

          {/* Day-by-Day Circular Itinerary Cards */}
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {dayPlans.map((day, dayIdx) => (
                <motion.div
                  key={`day-${day.dayNumber}`}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, delay: dayIdx * 0.05 }}
                  className="itinerary-day-card print-avoid-break bg-white border-2 border-stone/40 p-4 sm:p-6 space-y-6 shadow-sm"
                >
                  {/* Day Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-gold pb-3">
                    <div>
                      <span className="bg-ink text-gold font-mono text-xs font-bold px-2.5 py-1 uppercase tracking-wider">
                        {day.dateLabel}
                      </span>
                      <h3 className="font-display text-xl sm:text-2xl text-ink font-bold mt-1">
                        {day.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs text-stone">
                      <span>{day.totalKm} km local circuit</span>
                      <span className="font-bold text-ink">
                        Est. Day Cost: ₹{day.totalCost.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Circular Timed Stops List */}
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {day.stops.map((stop, idx) => {
                        const stopNumber = idx + 1;
                        const isFinalStop = idx === day.stops.length - 1;

                        const accessibleLabel =
                          stop.type === "meal"
                            ? `Stop ${stopNumber} of ${day.stops.length}: Lunch break at ${stop.name}, arrive ${stop.arrivalTime}, depart ${stop.departureTime}, duration ${stop.durationMinutes} minutes, estimated cost ₹${stop.cost.toLocaleString("en-IN")}`
                            : stop.type === "hotel"
                              ? isFinalStop
                                ? `Stop ${stopNumber} of ${day.stops.length} (Final Stop): Return to ${stop.name}, arrive ${stop.arrivalTime}, depart ${stop.departureTime}, completing circular route`
                                : `Stop ${stopNumber} of ${day.stops.length} (Start): Depart ${stop.name}, depart at ${stop.departureTime}`
                              : `Stop ${stopNumber} of ${day.stops.length}: ${stop.name}, ${stop.category}, arrive ${stop.arrivalTime}, depart ${stop.departureTime}, duration ${stop.durationMinutes} minutes, cost ${stop.cost > 0 ? "₹" + stop.cost.toLocaleString("en-IN") : "Free"}`;

                        return (
                          <motion.div
                            key={stop.id}
                            layout
                            initial={{ opacity: 0, x: -12, scale: 0.98 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 12, scale: 0.98 }}
                            transition={{ duration: 0.25, delay: idx * 0.03 }}
                            tabIndex={0}
                            aria-label={accessibleLabel}
                            className={`p-4 border text-xs font-mono transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-gold ${
                              stop.type === "meal"
                                ? "bg-amber-50/70 border-gold/80"
                                : stop.type === "hotel"
                                  ? "bg-salt border-stone/40"
                                  : stop.type === "transit"
                                    ? "bg-sky-50 border-sky-300"
                                    : "bg-white border-stone/30 hover:border-gold"
                            }`}
                          >
                            {(() => {
                              const conflict = checkBestTimeConflict(
                                stop.arrivalTime,
                                stop.bestTimeNote,
                              );
                              return (
                                <div className="flex items-start gap-3 w-full sm:w-auto">
                                  {/* Stop Number Badge */}
                                  <div className="bg-gold text-ink font-bold px-2 py-1 text-[11px] border border-ink shrink-0 text-center">
                                    <span>#{stopNumber}</span>
                                  </div>

                                  {/* Timed Badge */}
                                  <div className="bg-ink text-salt px-2.5 py-1 text-[11px] font-bold border border-gold shrink-0 text-center">
                                    <span className="block text-gold text-[10px] uppercase">
                                      Arrival - Depart
                                    </span>
                                    <span>
                                      {stop.arrivalTime} - {stop.departureTime}
                                    </span>
                                  </div>

                                  {/* Stop Icon & Description */}
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2 font-bold text-sm text-ink">
                                      {stop.type === "meal" ? (
                                        <>
                                          <Utensils className="w-4 h-4 text-gold shrink-0" />
                                          <span className="bg-gold/20 text-ink px-1.5 py-0.5 text-[10px] uppercase font-mono border border-gold/40">
                                            Meal Break
                                          </span>
                                        </>
                                      ) : stop.type === "hotel" ? (
                                        <HotelIcon className="w-4 h-4 text-ink shrink-0" />
                                      ) : stop.type === "transit" ? (
                                        <>
                                          <Ship className="w-4 h-4 text-sky-700 shrink-0" />
                                          <span className="bg-sky-100 text-sky-800 px-1.5 py-0.5 text-[10px] uppercase font-mono border border-sky-300">
                                            Ferry Crossing
                                          </span>
                                        </>
                                      ) : (
                                        <Ticket className="w-4 h-4 text-madder shrink-0" />
                                      )}
                                      <span>{stop.name}</span>
                                      {conflict.hasConflict && (
                                        <span
                                          className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 border border-amber-400 px-2 py-0.5 text-[10px] font-mono font-bold shrink-0 cursor-help"
                                          title={conflict.warningMessage}
                                        >
                                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                          <span>Time Mismatch</span>
                                        </span>
                                      )}
                                    </div>

                                    {stop.type === "attraction" &&
                                      stop.bestTimeNote && (
                                        <div className="mt-1">
                                          <BestTimeNote
                                            note={stop.bestTimeNote}
                                          />
                                        </div>
                                      )}

                                    {conflict.hasConflict && (
                                      <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-1 mt-1.5 font-mono flex items-center gap-1.5">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                        <span>{conflict.warningMessage}</span>
                                      </p>
                                    )}

                                    <p className="text-stone text-[11px] mt-1">
                                      {stop.description}
                                    </p>
                                    <span className="text-[10px] text-stone/80 uppercase tracking-wider block mt-1">
                                      {stop.category} • {stop.location}
                                    </span>
                                    {stop.type === "attraction" &&
                                      (stop.wheelchairAccessible !==
                                        undefined ||
                                        stop.physicalDemand) && (
                                        <div className="mt-1.5">
                                          <AccessibilityBadge
                                            wheelchairAccessible={
                                              stop.wheelchairAccessible
                                            }
                                            physicalDemand={stop.physicalDemand}
                                          />
                                        </div>
                                      )}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Cost & Duration */}
                            <div className="text-right shrink-0 self-end sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-stone/20 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                              <span className="font-bold text-ink text-sm">
                                {stop.cost > 0
                                  ? `₹${stop.cost.toLocaleString("en-IN")}`
                                  : "Free / Included"}
                              </span>
                              <span className="text-[10px] text-stone">
                                Duration: {stop.durationMinutes} mins
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {/* Day Summary Loop Banner */}
                  <div className="p-3 bg-salt border border-stone/30 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-stone">
                    <span className="flex items-center gap-1.5 text-ink font-bold">
                      <span>Circular Route Loop:</span>
                      <span className="font-normal text-stone">
                        Start at {startingHotel.name} → {day.stops.length - 2}{" "}
                        Stops → Return to {startingHotel.name}
                      </span>
                    </span>
                    <span className="font-bold text-ink shrink-0">
                      {day.stops.length} Timed Stops Complete
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Overall Budget Summary Card */}
          <div className="budget-summary-card print-avoid-break bg-ink text-salt p-6 border-2 border-gold space-y-4">
            <h4 className="font-display text-xl text-gold font-bold border-b border-stone/30 pb-2">
              {cityName} Circuit Budget Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-3 bg-salt/10 border border-stone/30">
                <span className="text-stone text-[10px] uppercase block">
                  Hotels ({numDays} Nights)
                </span>
                <span className="font-bold text-salt text-sm">
                  ₹{totalHotelCost.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 bg-salt/10 border border-stone/30">
                <span className="text-stone text-[10px] uppercase block">
                  Attraction Entry Fees
                </span>
                <span className="font-bold text-salt text-sm">
                  ₹{totalAttractionCost.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 bg-salt/10 border border-stone/30">
                <span className="text-stone text-[10px] uppercase block">
                  Meals (Restaurants)
                </span>
                <span className="font-bold text-gold text-sm">
                  ₹{totalMealCost.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 bg-salt/10 border border-stone/30">
                <span className="text-stone text-[10px] uppercase block">
                  Local Transport
                </span>
                <span className="font-bold text-salt text-sm">
                  ₹{totalTransportCost.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-stone/30 font-mono text-sm">
              <span className="text-stone">Estimated Total Outlay:</span>
              <span className="font-bold text-gold text-lg">
                ₹{estimatedTotalCost.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Share Itinerary Modal */}
      <ShareItineraryModal
        config={activeConfig}
        cityName={cityName}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
