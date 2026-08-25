import React, { useState } from "react";
import { Destination, GUJARAT_DESTINATIONS, Hotel } from "../data/destinations";
import { mergeSort } from "@dsa/sorting/mergeSort";
import { useLanguage } from "../context/LanguageContext";
import {
  Building2,
  Star,
  Check,
  ArrowRight,
  SlidersHorizontal,
  Award,
  MapPin,
  CheckCircle2,
  Hotel as HotelIcon,
  Info,
} from "lucide-react";

export type HotelData = Hotel;

type SortCriterion = "value" | "rating" | "price";

interface HotelsViewProps {
  selectedCityId?: string;
  preferredHotels?: Record<string, string>;
  onSelectPreferredHotel?: (cityId: string, hotelId: string) => void;
  onSelectDestination?: (dest: Destination) => void;
  onOpenPlanner?: () => void;
}

export const HotelsView: React.FC<HotelsViewProps> = ({
  selectedCityId,
  preferredHotels,
  onSelectPreferredHotel,
  onSelectDestination,
  onOpenPlanner,
}) => {
  const { language, t, getName } = useLanguage();

  const activeDestination =
    GUJARAT_DESTINATIONS.find((d) => d.id === selectedCityId) ||
    GUJARAT_DESTINATIONS[0];
  const cityName = getName(activeDestination);
  const currentHotels: Hotel[] = activeDestination.hotels || [];

  const [sortOrder, setSortOrder] = useState<SortCriterion>("value");
  const [localPreferredMap, setLocalPreferredMap] = useState<
    Record<string, string>
  >({});
  const activePreferredMap = preferredHotels || localPreferredMap;
  const currentPreferredHotelId =
    activePreferredMap[activeDestination.id] || currentHotels[0]?.id;

  const [assignedNotice, setAssignedNotice] = useState<string | null>(null);

  const sortedHotels = mergeSort(currentHotels, (a, b) => {
    if (sortOrder === "value") {
      return b.valueScore - a.valueScore;
    }
    if (sortOrder === "rating") {
      return b.ratingNumeric - a.ratingNumeric;
    }
    if (sortOrder === "price") {
      return a.priceNumeric - b.priceNumeric;
    }
    return 0;
  });

  const handleSelectHotel = (hotel: HotelData) => {
    if (onSelectPreferredHotel) {
      onSelectPreferredHotel(activeDestination.id, hotel.id);
    } else {
      setLocalPreferredMap((prev) => ({
        ...prev,
        [activeDestination.id]: hotel.id,
      }));
    }

    setAssignedNotice(
      `Set "${hotel.name}" as preferred stay for ${cityName}. Saved to itinerary engine.`,
    );
    setTimeout(() => {
      setAssignedNotice(null);
    }, 4000);
  };

  const renderStayBadge = (stayType: HotelData["stayType"]) => {
    switch (stayType) {
      case "Toran Hotel":
        return (
          <span className="inline-flex items-center gap-1 bg-ink text-gold border border-gold font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
            <Building2 className="w-3 h-3 text-gold" />
            TCGL Official Toran Hotel
          </span>
        );
      case "Heritage Hotel":
        return (
          <span className="inline-flex items-center gap-1 bg-madder text-salt border border-gold font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
            <Award className="w-3 h-3 text-gold" />
            Heritage Royal Palace
          </span>
        );
      case "Homestay":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-900 text-emerald-100 border border-emerald-500 font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            Artisan Village Homestay
          </span>
        );
      case "Registered Hotel":
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-salt text-charcoal border border-stone/50 font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
            <HotelIcon className="w-3 h-3 text-ink" />
            Tourism Guild Registered
          </span>
        );
    }
  };

  const totalSelectedCount = Object.keys(activePreferredMap).length;

  return (
    <div className="bg-salt min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-b border-stone/30 animate-fadeIn selection:bg-gold selection:text-ink">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* PAGE HEADER */}
        <div className="bg-ink text-salt p-6 sm:p-8 border-2 border-gold space-y-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-stepwell-pattern opacity-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone/30 pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gold mb-1">
                <Building2 className="w-4 h-4 text-gold" />
                <span>Priority-Queue Stay Audit</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl text-salt font-bold">
                {t("nav.hotels", "Hotels")} - {cityName}
              </h1>
            </div>

            <div className="bg-salt/10 border border-stone/40 p-3 font-mono text-xs text-right">
              <span className="text-stone text-[10px] uppercase block tracking-wider">
                Preferred Stays:
              </span>
              <span className="text-gold font-bold text-base">
                {totalSelectedCount} Configured
              </span>
            </div>
          </div>

          <p className="font-mono text-xs text-stone leading-relaxed max-w-2xl">
            Official TCGL Toran Hotels, registered heritage havelis, and artisan
            homestays in {cityName} ranked using our algorithmic value score
            index.
          </p>
        </div>

        {/* NOTICE TOAST */}
        {assignedNotice && (
          <div className="p-3.5 bg-emerald-900 text-salt border-2 border-emerald-400 text-xs font-mono flex items-center justify-between gap-2 shadow-md animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span className="font-bold">{assignedNotice}</span>
            </div>
            <span className="text-[10px] text-emerald-300 uppercase font-mono">
              Itinerary Engine Synchronized
            </span>
          </div>
        )}

        {/* ================= CITY CONTEXT BANNER ================= */}
        <div className="bg-white border-2 border-stone/40 p-4 font-mono text-xs text-charcoal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-madder shrink-0" />
            <span>
              Showing hotels in{" "}
              <strong className="text-ink font-bold">{cityName}</strong> — part
              of your current trip.
            </span>
          </div>

          {onSelectDestination && (
            <button
              onClick={() => onSelectDestination(activeDestination)}
              className="text-gold hover:text-ink underline text-xs font-mono font-bold cursor-pointer shrink-0"
            >
              View City Overview →
            </button>
          )}
        </div>

        {/* ================= 2. SORT / RE-RANK CONTROL ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border-2 border-stone/40 p-4 shadow-2xs font-mono text-xs">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
            <span className="font-bold text-charcoal uppercase tracking-wider">
              2. Priority-Queue Re-Rank:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-stone text-[11px]">Sort By:</span>

            <button
              onClick={() => setSortOrder("value")}
              className={`px-3 py-1.5 border font-bold transition-all cursor-pointer ${
                sortOrder === "value"
                  ? "bg-gold text-ink border-ink shadow-xs"
                  : "bg-salt hover:bg-stone/20 text-charcoal border-stone/30"
              }`}
            >
              Best Value (Rating/Cost)
            </button>

            <button
              onClick={() => setSortOrder("rating")}
              className={`px-3 py-1.5 border font-bold transition-all cursor-pointer ${
                sortOrder === "rating"
                  ? "bg-gold text-ink border-ink shadow-xs"
                  : "bg-salt hover:bg-stone/20 text-charcoal border-stone/30"
              }`}
            >
              Highest Rated
            </button>

            <button
              onClick={() => setSortOrder("price")}
              className={`px-3 py-1.5 border font-bold transition-all cursor-pointer ${
                sortOrder === "price"
                  ? "bg-gold text-ink border-ink shadow-xs"
                  : "bg-salt hover:bg-stone/20 text-charcoal border-stone/30"
              }`}
            >
              Lowest Price
            </button>
          </div>
        </div>

        {/* ================= 3. RANKED LIST OF HOTELS ================= */}
        <div className="space-y-4">
          {sortedHotels.map((hotel, index) => {
            const rankNumber = index + 1;
            const isChosen = currentPreferredHotelId === hotel.id;

            return (
              <div
                key={hotel.id}
                className={`bg-white border-2 transition-all duration-200 p-4 sm:p-6 shadow-2xs relative ${
                  isChosen
                    ? "border-gold bg-gold/5"
                    : "border-stone/40 hover:border-gold"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="font-display font-bold text-xl sm:text-2xl text-gold bg-ink w-10 h-10 border border-gold flex items-center justify-center shrink-0 shadow-xs">
                      {rankNumber}
                    </div>

                    {hotel.imageUrl && (
                      <img
                        src={hotel.imageUrl}
                        alt={`${hotel.name} ${hotel.stayType} exterior`}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover border border-stone/30 shrink-0"
                      />
                    )}

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="font-display text-lg sm:text-xl font-bold text-charcoal">
                          {hotel.name}
                        </h3>
                        {renderStayBadge(hotel.stayType)}
                        {isChosen && (
                          <span className="inline-flex items-center gap-1 bg-gold text-ink font-mono text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider border border-ink">
                            <CheckCircle2 className="w-3 h-3 text-ink" />
                            Preferred Stay
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-charcoal">
                        <span className="text-stone">{hotel.location}</span>
                        <span className="text-stone/40">•</span>
                        <span className="font-bold text-ink text-sm">
                          {hotel.pricePerNight} / night
                        </span>
                        <span className="text-stone/40">•</span>
                        <span className="font-bold text-gold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                          <span>{hotel.rating}</span>
                        </span>
                      </div>

                      <p className="font-body text-xs text-charcoal/90 leading-relaxed max-w-xl">
                        {hotel.description}
                      </p>

                      <div className="space-y-1 pt-1 max-w-xs font-mono text-[10px]">
                        <div className="flex justify-between text-stone">
                          <span>Rating-Per-Cost Value Index:</span>
                          <span className="font-bold text-ink">
                            {hotel.valueScore}/100
                          </span>
                        </div>
                        <div className="w-full h-2 bg-stone/20 border border-stone/40 overflow-hidden">
                          <div
                            style={{ width: `${hotel.valueScore}%` }}
                            className="h-full bg-gold transition-all duration-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone/20 flex md:flex-col items-center justify-end gap-2">
                    <button
                      onClick={() => handleSelectHotel(hotel)}
                      className={`w-full md:w-auto text-xs font-mono font-bold px-4 py-2.5 border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isChosen
                          ? "bg-ink text-gold border-gold shadow-xs"
                          : "bg-salt text-charcoal border-stone/40 hover:bg-madder hover:text-salt hover:border-madder"
                      }`}
                    >
                      {isChosen ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-gold" />
                          <span>Preferred Stay Selected</span>
                        </>
                      ) : (
                        <span>Set as Preferred Stay</span>
                      )}
                    </button>

                    {isChosen ? (
                      <span className="text-[10px] font-mono text-emerald-800 font-bold uppercase block text-center">
                        ✓ Itinerary Origin Base
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-stone text-center block">
                        Auto-loaded in planner
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM HELPER FOOTER */}
        <div className="p-4 bg-white border border-stone/30 font-mono text-xs text-stone flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gold shrink-0" />
            <span>
              All official TCGL Toran stays offer guaranteed ASI monument access
              permits.
            </span>
          </div>

          <button
            onClick={() => onOpenPlanner && onOpenPlanner()}
            className="text-ink hover:text-gold font-bold underline whitespace-nowrap cursor-pointer"
          >
            Open Circuit Planner →
          </button>
        </div>
      </div>
    </div>
  );
};
