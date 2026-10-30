import React from "react";
import { WifiOff, ShieldCheck } from "lucide-react";

interface OfflineBannerProps {
  cityName?: string;
  hasCachedItinerary?: boolean;
  /** ISO time the stored itinerary was saved; set while an offline copy is being shown. */
  offlineCopySavedAt?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  cityName,
  hasCachedItinerary = true,
  offlineCopySavedAt,
}) => {
  const savedLabel = offlineCopySavedAt ? new Date(offlineCopySavedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-gold text-ink border-b-2 border-ink px-4 py-2.5 font-mono text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm relative z-50 animate-fadeIn"
    >
      <div className="flex items-center gap-2 font-bold">
        <WifiOff className="w-4 h-4 text-ink shrink-0 animate-pulse" />
        {offlineCopySavedAt ? (
          <span>
            Offline copy -- showing your itinerary saved on {savedLabel}. Reconnect for the latest prices and availability.
          </span>
        ) : (
          <span>
            You're offline -- reconnect to load your saved itinerary
            {cityName ? ` for ${cityName}` : ""}.
            <span className="font-normal ml-1 hidden sm:inline">
              City browsing & search require connectivity.
            </span>
          </span>
        )}
      </div>

      {hasCachedItinerary && (
        <div className="flex items-center gap-1.5 text-[11px] bg-ink/10 text-ink px-2 py-0.5 border border-ink/20 font-bold shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-ink" />
          <span>App Shell Available Offline</span>
        </div>
      )}
    </div>
  );
};
