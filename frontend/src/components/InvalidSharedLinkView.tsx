import React from "react";
import { AlertTriangle, Compass, Calendar, ArrowLeft } from "lucide-react";
import { clearSharedUrl } from "../utils/shareUrl";

interface InvalidSharedLinkViewProps {
  errorMessage?: string;
  rawPayload?: string;
  onExplore: () => void;
  onPlanTrip: () => void;
  onGoHome: () => void;
}

export const InvalidSharedLinkView: React.FC<InvalidSharedLinkViewProps> = ({
  errorMessage = "The shared itinerary link is corrupted or malformed.",
  rawPayload,
  onExplore,
  onPlanTrip,
  onGoHome,
}) => {
  const handleClearAndHome = () => {
    clearSharedUrl();
    onGoHome();
  };

  const handleClearAndExplore = () => {
    clearSharedUrl();
    onExplore();
  };

  const handleClearAndPlan = () => {
    clearSharedUrl();
    onPlanTrip();
  };

  return (
    <div className="min-h-[70vh] bg-salt flex items-center justify-center px-4 py-16">
      <div className="max-w-xl w-full bg-ink text-salt border-2 border-gold/60 p-6 sm:p-10 shadow-2xl relative">
        {/* Stepped Corner Accent */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-salt border-b border-l border-gold flex items-center justify-center">
          <div className="w-2 h-2 bg-madder"></div>
        </div>

        {/* Warning Icon Badge */}
        <div className="w-12 h-12 bg-madder/20 border border-madder flex items-center justify-center text-madder mb-6">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="mb-2">
          <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
            400 — Shared Link Error
          </span>
          <h1 className="font-display text-2xl sm:text-3xl text-salt font-semibold">
            Invalid Shared Itinerary Link
          </h1>
        </div>

        <p className="text-stone font-body text-sm leading-relaxed mb-6">
          The link you followed contains a corrupted, incomplete, or malformed
          itinerary configuration. The Gujarat heritage route planner was unable
          to decode the route parameters.
        </p>

        {rawPayload && (
          <div className="bg-salt/5 border border-stone/30 p-3 mb-6 font-mono text-xs text-stone break-all">
            <span className="text-gold block mb-1 uppercase text-[10px] tracking-wider">
              Diagnostic Details:
            </span>
            <span className="text-salt/80 text-[11px] block">{errorMessage}</span>
            <span className="text-stone/60 text-[10px] block mt-1">
              Payload snippet: {rawPayload.slice(0, 64)}
              {rawPayload.length > 64 ? "..." : ""}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleClearAndPlan}
            className="flex-1 bg-madder hover:bg-madder/90 text-salt px-5 py-3 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Plan New Itinerary</span>
          </button>

          <button
            onClick={handleClearAndExplore}
            className="flex-1 bg-transparent hover:bg-gold/10 text-gold border border-gold px-5 py-3 text-xs font-mono font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Browse Destinations</span>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-stone/20 text-center">
          <button
            onClick={handleClearAndHome}
            className="text-stone hover:text-salt text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Return to Home Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
