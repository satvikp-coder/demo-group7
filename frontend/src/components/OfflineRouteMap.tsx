import React, { useState } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  Hotel as HotelIcon,
  Utensils,
  Ticket,
  RotateCcw,
  WifiOff,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { DayRoute, ItineraryStop } from "../utils/itineraryPlanner";

interface OfflineRouteMapProps {
  dayPlans: DayRoute[];
  cityName: string;
  startingHotelName: string;
  totalDistanceKm: number;
  isOffline?: boolean;
}

export const OfflineRouteMap: React.FC<OfflineRouteMapProps> = ({
  dayPlans,
  cityName,
  startingHotelName,
  totalDistanceKm,
  isOffline = false,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const activeDay = dayPlans[selectedDayIndex] || dayPlans[0];

  if (!activeDay) return null;

  return (
    <div className="bg-white border-2 border-gold p-4 sm:p-6 space-y-6 shadow-sm font-mono text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-gold pb-4">
        <div>
          <div className="flex items-center gap-2 text-gold uppercase tracking-widest text-[11px] font-bold">
            <Navigation className="w-4 h-4 text-gold" />
            <span>Intra-City Circular Route Circuit</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl text-ink font-bold mt-1">
            {cityName} Circular Route Map
          </h3>
        </div>

        {/* Offline Badge */}
        <div className="flex items-center gap-2">
          {isOffline ? (
            <div className="bg-gold text-ink font-bold px-3 py-1.5 border border-ink text-xs flex items-center gap-1.5 shadow-xs">
              <WifiOff className="w-3.5 h-3.5 text-ink animate-pulse" />
              <span>Offline Map Mode Active</span>
            </div>
          ) : (
            <div className="bg-salt text-ink font-bold px-3 py-1.5 border border-stone/40 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>Cached Circuit Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Day Selector Tabs if multi-day */}
      {dayPlans.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-stone/30 pb-3">
          <span className="text-stone text-[11px] font-bold uppercase mr-1">
            Select Day:
          </span>
          {dayPlans.map((day, idx) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-3 py-1 text-xs font-bold transition-colors cursor-pointer border ${
                selectedDayIndex === idx
                  ? "bg-ink text-gold border-gold"
                  : "bg-salt hover:bg-gold/10 text-charcoal border-stone/30"
              }`}
            >
              Day {day.dayNumber}: {day.dateLabel}
            </button>
          ))}
        </div>
      )}

      <p className="text-stone font-body text-xs leading-relaxed italic border-l-2 border-gold pl-3">
        "Vector-cached circular route sequence guaranteed to display without
        network coverage inside monument vaults, stepwell corridors, and
        sanctuary reserves."
      </p>

      {/* VECTOR SVG SCHEMATIC CIRCUIT GRAPH */}
      <div className="bg-salt border-2 border-stone/30 p-4 relative overflow-hidden space-y-4">
        <div className="absolute inset-0 bg-stepwell-pattern opacity-10 pointer-events-none" />

        <div className="flex items-center justify-between font-bold text-ink text-xs relative z-10 border-b border-stone/20 pb-2">
          <span className="flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4 text-gold" />
            <span>
              Day {activeDay.dayNumber} Loop Diagram: {activeDay.stops.length}{" "}
              Timed Stops
            </span>
          </span>
          <span className="text-stone text-[11px]">
            Est. Circuit: {activeDay.totalKm} km
          </span>
        </div>

        {/* SVG Circuit Path Diagram */}
        <div className="relative z-10 py-4 overflow-x-auto">
          <div className="min-w-[600px] flex items-center justify-between gap-2 px-2">
            {activeDay.stops.map((stop, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === activeDay.stops.length - 1;
              const isMeal = stop.type === "meal";
              const isHotel = stop.type === "hotel";

              return (
                <React.Fragment key={stop.id}>
                  {/* Stop Node */}
                  <div className="flex flex-col items-center text-center space-y-1.5 group max-w-[110px]">
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-transform  shadow-sm ${
                        isHotel
                          ? "bg-ink text-gold border-gold"
                          : isMeal
                            ? "bg-gold text-ink border-ink"
                            : "bg-white text-ink border-gold"
                      }`}
                    >
                      {isHotel ? (
                        <HotelIcon className="w-4 h-4" />
                      ) : isMeal ? (
                        <Utensils className="w-4 h-4" />
                      ) : (
                        <span>#{idx + 1}</span>
                      )}
                    </div>

                    <span
                      className="font-bold text-[11px] text-ink truncate w-full"
                      title={stop.name}
                    >
                      {stop.name}
                    </span>

                    <span className="bg-ink/10 text-ink px-1.5 py-0.5 text-[9px] font-bold border border-ink/20 uppercase">
                      {stop.arrivalTime}
                    </span>
                  </div>

                  {/* Connecting Arrow/Line */}
                  {!isLast && (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-1 px-1 min-w-[30px]">
                      <span className="text-[9px] text-stone font-bold">
                        {idx === 0 ? "1.2 km" : idx === 1 ? "0.9 km" : "1.5 km"}
                      </span>
                      <div className="w-full h-0.5 bg-gold flex items-center justify-center relative">
                        <ChevronRight className="w-4 h-4 text-gold absolute -right-2 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="p-2 bg-ink text-salt text-[11px] flex items-center justify-between font-bold relative z-10 border border-gold">
          <span className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-gold" />
            <span>
              Circular Loop Complete: Returns to base stay [{startingHotelName}]
            </span>
          </span>
          <span className="text-gold">0 Km Backlog</span>
        </div>
      </div>

      {/* CACHED TURN-BY-TURN STOP LIST */}
      <div className="space-y-3">
        <h4 className="font-display text-base text-ink font-bold border-b border-stone/30 pb-1">
          Turn-by-Turn Offline Stop Ordering (Day {activeDay.dayNumber})
        </h4>

        <div className="space-y-2.5">
          {activeDay.stops.map((stop, idx) => {
            const stopNum = idx + 1;
            const isHotel = stop.type === "hotel";
            const isMeal = stop.type === "meal";

            return (
              <div
                key={stop.id}
                className={`p-3.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isMeal
                    ? "bg-amber-50/80 border-gold"
                    : isHotel
                      ? "bg-salt border-stone/40"
                      : "bg-white border-stone/30"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="bg-gold text-ink font-bold px-2 py-0.5 text-[11px] border border-ink shrink-0">
                    #{stopNum}
                  </span>

                  <div className="bg-ink text-salt px-2 py-0.5 text-[10px] font-bold border border-gold shrink-0">
                    {stop.arrivalTime} - {stop.departureTime}
                  </div>

                  <div>
                    <div className="font-bold text-ink text-sm flex items-center gap-1.5">
                      {isHotel ? (
                        <HotelIcon className="w-4 h-4 text-ink shrink-0" />
                      ) : isMeal ? (
                        <Utensils className="w-4 h-4 text-gold shrink-0" />
                      ) : (
                        <Ticket className="w-4 h-4 text-madder shrink-0" />
                      )}
                      <span>{stop.name}</span>
                    </div>
                    <span className="text-[10px] text-stone uppercase tracking-wider block">
                      {stop.category} • {stop.location}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-bold text-ink text-xs">
                  {stop.cost > 0
                    ? `₹${stop.cost.toLocaleString("en-IN")}`
                    : "Included"}
                  <span className="block text-[10px] font-normal text-stone">
                    {stop.durationMinutes} mins stop
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
