import React, { useState } from "react";
import { Destination } from "../data/destinations";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Ticket,
  Calendar,
  ShieldCheck,
  Hotel,
  PlusCircle,
  CheckCircle2,
  ChevronRight,
  Compass,
  Accessibility,
  Hospital,
  Shield,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { AccessibilityBadge } from "./AccessibilityBadge";
import { BestTimeNote } from "./BestTimeNote";

interface DestinationDetailViewProps {
  destination: Destination;
  preferredHotels?: Record<string, string>;
  onSelectPreferredHotel?: (cityId: string, hotelId: string) => void;
  onBack: () => void;
  onAddToTrip: (dest: Destination) => void;
  isAddedToTrip: boolean;
  onSelectNearbyDestination?: (destId: string) => void;
  onOpenPlannerWithSite?: (dest: Destination) => void;
}

// Note: Full content translation of long narrative descriptions, hotel bios, and attraction details
// is reserved for a follow-up content pass. Core UI labels, headings, buttons, and site/attraction names use active localization.

export const DestinationDetailView: React.FC<DestinationDetailViewProps> = ({
  destination,
  preferredHotels,
  onSelectPreferredHotel,
  onBack,
  onAddToTrip,
  isAddedToTrip,
  onSelectNearbyDestination,
  onOpenPlannerWithSite,
}) => {
  const { language, t, getName } = useLanguage();
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);
  const [selectedDemands, setSelectedDemands] = useState<
    ("low" | "moderate" | "high")[]
  >([]);

  const toggleDemandFilter = (level: "low" | "moderate" | "high") => {
    setSelectedDemands((prev) =>
      prev.includes(level) ? prev.filter((d) => d !== level) : [...prev, level],
    );
  };

  const filteredAttractions = (destination.attractions || []).filter((attr) => {
    if (wheelchairOnly && !attr.wheelchairAccessible) return false;
    if (
      selectedDemands.length > 0 &&
      !selectedDemands.includes(attr.physicalDemand)
    )
      return false;
    return true;
  });

  return (
    <div className="bg-salt min-h-screen border-b border-stone/30 animate-fadeIn">
      {/* 1. FULL-WIDTH HERO IMAGE BAND */}
      <div className="relative h-80 sm:h-96 md:h-[480px] w-full bg-ink overflow-hidden">
        {/* Background Image */}
        <img
          src={destination.imageUrl}
          alt={destination.imageAlt || getName(destination)}
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
        />

        {/* Ink Indigo Gradient Overlay at bottom edge for crisp text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-transparent" />

        {/* Top Floating Back Breadcrumb */}
        <div className="absolute top-6 left-4 sm:left-8 z-10">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 bg-ink/80 hover:bg-ink text-salt border border-stone/40 hover:border-gold text-xs font-mono px-3.5 py-1.5 backdrop-blur-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-gold" />
            <span>
              {language === "gu"
                ? "બધા સ્થળો પર પાછા જાઓ"
                : language === "hi"
                  ? "सभी स्थलों पर वापस जाएं"
                  : "Back to All Destinations"}
            </span>
          </button>
        </div>

        {/* Overlaid Hero Content */}
        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gold text-ink font-mono text-[11px] font-bold px-3 py-1 uppercase tracking-wider">
              {destination.officialCategory}
            </span>
            <span className="bg-ink/80 text-salt font-mono text-[11px] px-3 py-1 border border-stone/40 uppercase">
              {destination.district}{" "}
              {language === "gu"
                ? "જિલ્લો"
                : language === "hi"
                  ? "ज़िला"
                  : "District"}
            </span>
            <span className="text-gold font-mono text-sm font-bold flex items-center gap-1 bg-ink/80 px-2.5 py-0.5 border border-gold/40">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              {destination.rating}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl text-salt font-bold tracking-tight leading-tight">
            {getName(destination)}
          </h1>

          <p className="font-mono text-xs text-stone/90 max-w-2xl flex items-center gap-2">
            <Compass className="w-4 h-4 text-gold shrink-0" />
            <span>
              {destination.tag} • {destination.distanceFromAhmedabad}{" "}
              {language === "gu"
                ? "અમદાવાદથી"
                : language === "hi"
                  ? "अहमदाबाद से"
                  : "from Ahmedabad"}
            </span>
          </p>
        </div>
      </div>

      {/* 1.5 SEASONAL ADVISORY BANNER */}
      {destination.seasonalAdvisory &&
        (() => {
          const nowMonth = new Date().getMonth() + 1; // 1..12
          const isActive = destination.seasonalAdvisory.activeMonths.some(
            (m) => {
              const diff = Math.abs(m - nowMonth);
              return diff === 0 || diff === 1 || diff === 11;
            },
          );
          if (!isActive) return null;

          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 -mb-4">
              <div className="bg-white border-l-4 border-gold border-y border-r border-stone/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gold uppercase tracking-wider">
                        {language === "gu"
                          ? "મોસમી મુસાફરી સલાહ"
                          : language === "hi"
                            ? "मौसमी यात्रा सलाह"
                            : "Seasonal Travel Advisory"}
                      </span>
                      {destination.seasonalAdvisory.peakWindowLabel && (
                        <span className="bg-gold/10 text-gold border border-gold/30 font-mono text-[10px] px-2 py-0.5 rounded-none font-medium">
                          {destination.seasonalAdvisory.peakWindowLabel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-charcoal/90 font-body leading-relaxed">
                      {destination.seasonalAdvisory.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* 2. TWO-COLUMN MAIN CONTENT LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* LEFT COLUMN (WIDER - lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Detailed Description Section */}
            <div className="bg-white p-6 sm:p-8 border border-stone/30 space-y-6 shadow-sm">
              <div>
                <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
                  {language === "gu"
                    ? "ઐતિહાસિક વિવરણ અને સ્થાપત્ય સમીક્ષા"
                    : language === "hi"
                      ? "ऐतिहासिक विवरण और वास्तुकला समीक्षा"
                      : "Heritage Monograph & Architectural Overview"}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-charcoal font-bold">
                  {language === "gu"
                    ? `${getName(destination)} વિશે`
                    : language === "hi"
                      ? `${getName(destination)} के बारे में`
                      : `About ${getName(destination)}`}
                </h2>
              </div>

              <p className="text-stone/90 text-sm sm:text-base leading-relaxed font-body">
                {destination.description}
              </p>

              {/* Highlights List */}
              {destination.highlights && destination.highlights.length > 0 && (
                <div className="pt-4 border-t border-stone/20 space-y-3">
                  <h3 className="font-mono text-xs text-charcoal uppercase tracking-wider font-semibold">
                    {language === "gu"
                      ? "મુખ્ય ઐતિહાસિક અને સ્થાપત્ય વિશેષતાઓ:"
                      : language === "hi"
                        ? "प्रमुख ऐतिहासिक और वास्तुशिल्प विशेषताएं:"
                        : "Key Historical & Architectural Highlights:"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {destination.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-mono text-stone bg-salt/60 p-2.5 border border-stone/20"
                      >
                        <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Visiting Information Panel */}
            <div className="bg-ink text-salt p-6 sm:p-8 border border-stone/40 space-y-6">
              <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                {language === "gu"
                  ? "મુલાકાતી અનુભવ અને સમયપત્રક"
                  : language === "hi"
                    ? "सैलानी अनुभव और समय सारिणी"
                    : "Visitor Experience & Timing Parameters"}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
                <div className="space-y-1 border-l-2 border-gold pl-3">
                  <span className="text-stone uppercase text-[10px]">
                    {language === "gu"
                      ? "ઉત્તમ સમય"
                      : language === "hi"
                        ? "उत्तम समय"
                        : "Best Season"}
                  </span>
                  <div className="font-bold text-salt text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gold shrink-0" />
                    <span>{destination.bestTime}</span>
                  </div>
                  <p className="text-[11px] text-stone/80">
                    {language === "gu"
                      ? "અનુકૂળ હવામાન"
                      : language === "hi"
                        ? "अनुकूल मौसम"
                        : "Optimal climate for heritage walks"}
                  </p>
                </div>

                <div className="space-y-1 border-l-2 border-gold pl-3">
                  <span className="text-stone uppercase text-[10px]">
                    {language === "gu"
                      ? "સરેરાશ સમય"
                      : language === "hi"
                        ? "औसत समय"
                        : "Avg Visit Time"}
                  </span>
                  <div className="font-bold text-salt text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gold shrink-0" />
                    <span>{destination.avgVisitTime}</span>
                  </div>
                  <p className="text-[11px] text-stone/80">
                    {language === "gu"
                      ? "ભલામણ કરેલ સમયગાળો"
                      : language === "hi"
                        ? "अनुशंसित समय अवधि"
                        : "Recommended exploration duration"}
                  </p>
                </div>

                <div className="space-y-1 border-l-2 border-gold pl-3">
                  <span className="text-stone uppercase text-[10px]">
                    {language === "gu"
                      ? "પ્રવેશ ટિકિટ"
                      : language === "hi"
                        ? "प्रवेश टिकट"
                        : "Entry Ticket"}
                  </span>
                  <div className="font-bold text-gold text-sm flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-gold shrink-0" />
                    <span>{destination.entryFee}</span>
                  </div>
                  <p className="text-[11px] text-stone/80">
                    Official ASI / TCGL tariff
                  </p>
                </div>
              </div>

              {/* Safety & Essential Services Block */}
              {(destination.nearestHospital ||
                destination.nearestPoliceStation) && (
                <div className="pt-4 border-t border-stone/30 font-mono text-xs text-stone space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone/90 block">
                    Good to know.
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone/90 text-[11px]">
                    {destination.nearestHospital && (
                      <div className="flex items-center gap-1.5">
                        <Hospital className="w-3.5 h-3.5 text-stone shrink-0" />
                        <span>
                          Nearest hospital: {destination.nearestHospital}
                        </span>
                      </div>
                    )}
                    {destination.nearestPoliceStation && (
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-stone shrink-0" />
                        <span>
                          Nearest police: {destination.nearestPoliceStation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* INTRA-CITY MONUMENTS & ATTRACTIONS WITH ACCESSIBILITY FILTERS */}
            {destination.attractions && destination.attractions.length > 0 && (
              <div className="bg-white p-6 sm:p-8 border border-stone/30 space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone/20 pb-4">
                  <div>
                    <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
                      {language === "gu"
                        ? "શહેરના સ્મારકો અને આકર્ષણો"
                        : language === "hi"
                          ? "शहर के स्मारक और आकर्षण"
                          : "Monuments & Intra-City Heritage Attractions"}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl text-charcoal font-bold">
                      {language === "gu"
                        ? `${getName(destination)} મુખ્ય આકર્ષણો`
                        : language === "hi"
                          ? `${getName(destination)} मुख्य आकर्षण`
                          : `Key Monuments in ${getName(destination)}`}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-stone">
                    Showing {filteredAttractions.length} of{" "}
                    {destination.attractions.length} sites
                  </span>
                </div>

                {/* Accessibility Filter Chips Toolbar */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-salt border border-stone/20 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setWheelchairOnly(!wheelchairOnly)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border transition-all cursor-pointer font-semibold ${
                      wheelchairOnly
                        ? "bg-emerald-800 text-salt border-emerald-900 shadow-xs"
                        : "bg-white text-emerald-950 border-emerald-400 hover:bg-emerald-50"
                    }`}
                  >
                    <Accessibility
                      className={`w-4 h-4 ${wheelchairOnly ? "text-emerald-300" : "text-emerald-700"}`}
                    />
                    <span>Wheelchair Accessible</span>
                    {wheelchairOnly && (
                      <span className="text-[10px] bg-emerald-950 text-salt px-1">
                        ACTIVE
                      </span>
                    )}
                  </button>

                  <span className="text-stone/40 hidden sm:inline">|</span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-stone font-semibold uppercase text-[10px]">
                      Physical Demand:
                    </span>
                    {(["low", "moderate", "high"] as const).map((level) => {
                      const isSelected = selectedDemands.includes(level);
                      const badgeStyle =
                        level === "low"
                          ? isSelected
                            ? "bg-emerald-800 text-salt border-emerald-900"
                            : "bg-white text-emerald-900 border-stone/30 hover:border-emerald-500"
                          : level === "moderate"
                            ? isSelected
                              ? "bg-amber-800 text-salt border-amber-900"
                              : "bg-white text-amber-900 border-stone/30 hover:border-amber-500"
                            : isSelected
                              ? "bg-madder text-salt border-red-900"
                              : "bg-white text-madder border-stone/30 hover:border-red-500";

                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => toggleDemandFilter(level)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 border text-[10px] uppercase transition-all cursor-pointer font-bold ${badgeStyle}`}
                        >
                          <span>{level}</span>
                        </button>
                      );
                    })}
                  </div>

                  {(wheelchairOnly || selectedDemands.length > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setWheelchairOnly(false);
                        setSelectedDemands([]);
                      }}
                      className="text-stone hover:text-madder text-[10px] underline ml-auto uppercase font-semibold cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>

                {/* Attraction Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredAttractions.map((attr) => (
                    <div
                      key={attr.id}
                      className="bg-salt border border-stone/30 p-4 space-y-3 hover:border-gold transition-colors flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-gold uppercase font-bold tracking-wider">
                            {attr.category}
                          </span>
                          <span className="font-mono text-xs text-gold font-bold flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                            {attr.rating}
                          </span>
                        </div>

                        <h4 className="font-display text-base font-bold text-charcoal">
                          {getName(attr)}
                        </h4>
                        <BestTimeNote note={attr.bestTimeNote} />

                        <p className="text-xs text-stone line-clamp-2">
                          {attr.description}
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-2 border-t border-stone/20">
                        {/* Accessibility Badges */}
                        <AccessibilityBadge
                          wheelchairAccessible={attr.wheelchairAccessible}
                          physicalDemand={attr.physicalDemand}
                        />

                        <div className="flex items-center justify-between font-mono text-[11px] text-stone">
                          <span>
                            Fee:{" "}
                            <strong className="text-charcoal">
                              {attr.entryFee}
                            </strong>
                          </span>
                          <span>
                            Time:{" "}
                            <strong className="text-charcoal">
                              {attr.durationHours}h
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NEARBY ATTRACTIONS TERRACE-MINI-GRID */}
            {destination.nearbyAttractions &&
              destination.nearbyAttractions.length > 0 && (
                <div className="space-y-4">
                  <div className="border-l-2 border-gold pl-3">
                    <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                      {language === "gu"
                        ? "પ્રાદેશિક સર્કિટ"
                        : language === "hi"
                          ? "क्षेत्रीय सर्किट"
                          : "Regional Circuit"}
                    </span>
                    <h3 className="font-display text-2xl text-charcoal font-bold">
                      {language === "gu"
                        ? "નજીકના સ્મારકો અને આકર્ષણો"
                        : language === "hi"
                          ? "निकटतम स्मारक और आकर्षण"
                          : "Nearby Monuments & Heritage Attractions"}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {destination.nearbyAttractions.map((attraction) => (
                      <div
                        key={attraction.id}
                        onClick={() =>
                          onSelectNearbyDestination &&
                          onSelectNearbyDestination(attraction.id)
                        }
                        className="group bg-white p-3.5 border border-stone/30 hover:border-gold transition-all duration-200 cursor-pointer flex gap-3 items-center"
                      >
                        <img
                          src={attraction.imageUrl}
                          alt={getName(attraction)}
                          className="w-20 h-20 object-cover grayscale group-hover:grayscale-0 transition-all shrink-0 border border-stone/20"
                        />
                        <div className="space-y-1 flex-1 min-w-0">
                          <span className="text-[10px] font-mono text-gold uppercase block truncate">
                            {attraction.category}
                          </span>
                          <h4 className="font-display text-base font-bold text-charcoal group-hover:text-gold transition-colors truncate">
                            {getName(attraction)}
                          </h4>
                          <span className="text-xs font-mono text-stone flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gold" />
                            {attraction.distance}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* RIGHT COLUMN (NARROWER - lg:col-span-4, STICKY ON DESKTOP) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-ink text-salt p-6 border-2 border-gold/60 space-y-6 shadow-md">
              <div className="border-b border-stone/30 pb-4">
                <span className="font-mono text-xs text-gold uppercase tracking-wider block mb-1">
                  {language === "gu"
                    ? "સત્તાવાર સંક્ષેપ"
                    : language === "hi"
                      ? "आधिकारिक सारांश"
                      : "Official Heritage Summary"}
                </span>
                <h3 className="font-display text-2xl font-bold text-salt">
                  {getName(destination)}
                </h3>
              </div>

              {/* IBM Plex Mono Logistical Specs Panel */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">
                    {language === "gu"
                      ? "શ્રેષ્ઠ સમય"
                      : language === "hi"
                        ? "सर्वोत्तम समय"
                        : "Best Time to Visit"}
                  </span>
                  <span className="text-gold font-bold">
                    {destination.bestTime}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">
                    {language === "gu"
                      ? "પ્રવેશ ફી"
                      : language === "hi"
                        ? "प्रवेश शुल्क"
                        : "Entry Fee"}
                  </span>
                  <span className="text-gold font-bold">
                    {destination.entryFee}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">
                    {language === "gu"
                      ? "સરેરાશ સમય"
                      : language === "hi"
                        ? "औसत समय"
                        : "Avg Visit Time"}
                  </span>
                  <span className="text-salt font-semibold">
                    {destination.avgVisitTime}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">
                    {language === "gu"
                      ? "જિલ્લો"
                      : language === "hi"
                        ? "ज़िला"
                        : "District"}
                  </span>
                  <span className="text-salt font-semibold">
                    {destination.district}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">
                    {language === "gu"
                      ? "શ્રેણી"
                      : language === "hi"
                        ? "श्रेणी"
                        : "Category"}
                  </span>
                  <span className="text-salt font-semibold text-[11px] truncate max-w-[150px]">
                    {destination.officialCategory}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-stone/30">
                  <span className="text-stone uppercase">
                    {language === "gu"
                      ? "અમદાવાદથી"
                      : language === "hi"
                        ? "अहमदाबाद से"
                        : "From Ahmedabad"}
                  </span>
                  <span className="text-salt font-semibold">
                    {destination.distanceFromAhmedabad}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-stone uppercase">
                    {language === "gu"
                      ? "રેટિંગ"
                      : language === "hi"
                        ? "रेटिंग"
                        : "Visitor Rating"}
                  </span>
                  <span className="text-gold font-bold">
                    {destination.rating}
                  </span>
                </div>
              </div>

              {/* MADDER RED ACTION BUTTON: "Add to Trip Plan" */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => onAddToTrip(destination)}
                  className={`w-full py-3.5 px-4 text-xs font-mono uppercase tracking-wider font-bold transition-all duration-200 flex items-center justify-center gap-2 border cursor-pointer ${
                    isAddedToTrip
                      ? "bg-emerald-800 text-salt border-emerald-600"
                      : "bg-madder hover:bg-madder/90 text-salt border-madder"
                  }`}
                >
                  {isAddedToTrip ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>
                        {language === "gu"
                          ? "યોજનામાં ઉમેરાયેલ"
                          : language === "hi"
                            ? "योजना में जोड़ा गया"
                            : "Added to Trip Plan"}
                      </span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-salt" />
                      <span>{t("explore.plan", "Add to Trip Plan")}</span>
                    </>
                  )}
                </button>

                {onOpenPlannerWithSite && (
                  <button
                    onClick={() => onOpenPlannerWithSite(destination)}
                    className="w-full py-2.5 px-4 bg-transparent hover:bg-salt/10 text-gold hover:text-salt border border-gold/40 text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>
                      {language === "gu"
                        ? "કસ્ટમ યાત્રા પ્લાન કરો"
                        : language === "hi"
                          ? "कस्टम यात्रा प्लान करें"
                          : "Build Custom Itinerary"}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <p className="text-[10px] font-mono text-stone text-center">
                {language === "gu"
                  ? "સાઇટને સીધા તમારા સક્રિય રૂટ પ્લાનરમાં ઉમેરે છે."
                  : language === "hi"
                    ? "साइट को सीधे आपके सक्रिय रूट प्लानर में जोड़ता है।"
                    : "Adds site directly to your active route builder in the navigation bar."}
              </p>
            </div>
          </div>
        </div>

        {/* 3. SUGGESTED HOTELS NEAR HERE STRIP */}
        {destination.nearbyHotels && destination.nearbyHotels.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone/30 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-l-2 border-gold pl-3">
              <div>
                <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                  {language === "gu"
                    ? "હેરિટેજ સ્ટે રોકાણ"
                    : language === "hi"
                      ? "हेरिटेज स्टे निवास"
                      : "Heritage Stay Accommodations"}
                </span>
                <h3 className="font-display text-2xl text-charcoal font-bold">
                  {language === "gu"
                    ? `${getName(destination)} નજીકની હોટલો`
                    : language === "hi"
                      ? `${getName(destination)} के निकटतम होटल`
                      : `Suggested Hotels Near ${getName(destination)}`}
                </h3>
              </div>
              <span className="font-mono text-xs text-stone">
                Toran TCGL Bungalows & Restored Haveli Stays
              </span>
            </div>

            {/* Horizontally Scrollable Row of Hotel Cards */}
            <div className="flex items-stretch gap-6 overflow-x-auto pb-4 scrollbar-none">
              {destination.nearbyHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-ink text-salt border border-stone/40 min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 flex flex-col justify-between p-4 space-y-4"
                >
                  <div className="relative h-40 overflow-hidden border border-stone/30 bg-charcoal">
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    />

                    {/* Official Stay Type Badge */}
                    <span className="absolute top-2 left-2 bg-salt text-ink font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                      {hotel.stayType}
                    </span>

                    {/* Rating Badge */}
                    <span className="absolute bottom-2 right-2 bg-ink/90 text-gold font-mono text-[10px] font-bold px-2 py-0.5 border border-gold/40">
                      {hotel.rating}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-display text-lg font-bold text-salt leading-tight">
                      {hotel.name}
                    </h4>
                    <p className="text-xs font-mono text-stone flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span>{hotel.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone/30 text-xs font-mono">
                    <span className="text-stone">
                      {language === "gu"
                        ? "ભાડું:"
                        : language === "hi"
                          ? "किराया:"
                          : "Tariff:"}
                    </span>
                    <span className="text-gold font-bold">
                      {hotel.pricePerNight}
                    </span>
                  </div>

                  {onSelectPreferredHotel && (
                    <button
                      onClick={() =>
                        onSelectPreferredHotel(destination.id, hotel.id)
                      }
                      className={`w-full py-2 px-3 text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                        preferredHotels?.[destination.id] === hotel.id
                          ? "bg-gold text-ink border-gold shadow-xs"
                          : "bg-salt/10 hover:bg-gold hover:text-ink text-salt border-stone/40"
                      }`}
                    >
                      {preferredHotels?.[destination.id] === hotel.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-ink shrink-0" />
                          <span>
                            {language === "gu"
                              ? "પસંદ કરેલ સ્થાન"
                              : language === "hi"
                                ? "चयनित स्थान"
                                : "Preferred Stay Selected"}
                          </span>
                        </>
                      ) : (
                        <span>
                          {language === "gu"
                            ? "પસંદગી સ્થાપિત કરો"
                            : language === "hi"
                              ? "पसंदीदा स्थान चुनें"
                              : "Set as Preferred Stay"}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
