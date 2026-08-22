// NOTE: Once a backend exists, this client-side URL encoding approach should be replaced with a database-backed share link (e.g. /trips/:id/share/:token) to avoid long URLs for complex itineraries -- this client-only version is a reasonable interim approach given no backend yet.

import React, { useState } from "react";
import { X, Copy, Check, Share2, Link, Sparkles } from "lucide-react";
import { ItineraryConfig } from "./ItineraryView";
import { getShareableUrl } from "../utils/shareUrl";

interface ShareItineraryModalProps {
  config: ItineraryConfig;
  cityName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareItineraryModal: React.FC<ShareItineraryModalProps> = ({
  config,
  cityName,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const shareUrl = getShareableUrl(config);
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: `Shared Itinerary for ${cityName}`,
        text: `Check out this circular ${config.tripDays || 2}-day heritage itinerary for ${cityName}!`,
        url: shareUrl,
      });
    } catch (err) {
      console.log("Native share closed or failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-salt border-2 border-gold max-w-lg w-full p-6 shadow-2xl relative font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone hover:text-charcoal p-1 transition-colors cursor-pointer"
          aria-label="Close Share Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-stone/30 pb-4 mb-4">
          <div className="p-2.5 bg-gold/20 border border-gold text-ink">
            <Share2 className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-ink">
              Share Itinerary
            </h3>
            <p className="text-xs text-stone font-mono">
              {cityName} • {config.tripDays || 2}-Day Circular Route
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <p className="text-xs text-charcoal bg-white border border-stone/30 p-3 mb-4 font-mono leading-relaxed">
          Generates a read-only shareable link containing the complete itinerary
          routing, timed stops, and daily breakdown.
        </p>

        {/* Link Input + Copy Button */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-mono font-bold text-stone uppercase tracking-wider">
            Shareable Link
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-white border border-stone/40 px-3 py-2 text-xs font-mono text-charcoal select-all focus:outline-none focus:border-gold"
              />
              <Link className="w-3.5 h-3.5 text-stone absolute right-3 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold border transition-colors cursor-pointer shrink-0 ${
                copied
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                  : "bg-gold hover:bg-gold/90 text-ink border-ink shadow-xs"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-ink" />
                  <span>Copy link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons: Native Share Sheet (if supported on mobile) */}
        {canNativeShare && (
          <div className="mb-4">
            <button
              onClick={handleNativeShare}
              className="w-full bg-ink hover:bg-ink/90 text-salt border border-gold px-4 py-2.5 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-4 h-4 text-gold" />
              <span>Open Native Share Sheet</span>
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="pt-3 border-t border-stone/20 flex items-center justify-between text-[11px] font-mono text-stone">
          <span>Read-only preview</span>
          <button
            onClick={onClose}
            className="text-stone hover:text-charcoal underline cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
