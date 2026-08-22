import React from "react";
import { useLanguage } from "../context/LanguageContext";

interface FooterProps {
  onNavigateSection?: (sectionId: string) => void;
  onOpenPlanner?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateSection,
  onOpenPlanner,
}) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-ink text-salt border-t border-stone/30 pt-16 pb-12 relative overflow-hidden">
      {/* Subtle Stepwell Watermark Pattern */}
      <div
        className="absolute inset-0 bg-stepwell-pattern opacity-10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone/30">
          {/* Wordmark Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-gold/60 flex items-center justify-center p-1 bg-ink">
                <div className="w-full h-full bg-gold/80"></div>
              </div>
              <span className="font-display text-2xl text-salt tracking-tight">
                {t("footer.brand", "Heritage Tourism Planner")}
              </span>
            </div>

            <p className="text-xs text-stone font-body leading-relaxed max-w-sm">
              {t(
                "footer.description",
                "An architectural and cultural route ledger for Gujarat’s stepwells, sun temples, salt deserts, and sacred coastlines. Structured for conscious travelers and heritage preservation.",
              )}
            </p>

            <div className="font-mono text-[11px] text-gold/80 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
              <span>Dataset synchronized with ASI & Craft Guilds</span>
            </div>
          </div>

          {/* Link Column 1: Heritage Circuits */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-gold font-semibold">
              Heritage Circuits
            </h4>
            <ul className="space-y-2 text-xs text-salt/80 font-body">
              <li>
                <a
                  href="#explore"
                  className="hover:text-gold transition-colors"
                >
                  Solanki Stepwells
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  className="hover:text-gold transition-colors"
                >
                  White Rann & Kutch
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  className="hover:text-gold transition-colors"
                >
                  Sacred Saurashtra
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  className="hover:text-gold transition-colors"
                >
                  UNESCO Citadel Circuit
                </a>
              </li>
            </ul>
          </div>

          {/* Link Column 2: Route Utilities */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-gold font-semibold">
              Route Utilities
            </h4>
            <ul className="space-y-2 text-xs text-salt/80 font-body">
              <li>
                <button
                  onClick={onOpenPlanner}
                  className="hover:text-gold transition-colors text-left cursor-pointer"
                >
                  Terrace Itinerary Generator
                </button>
              </li>
              <li>
                <a href="#hotels" className="hover:text-gold transition-colors">
                  Heritage Haveli Lodging
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  className="hover:text-gold transition-colors"
                >
                  Ticket Fee Ledgers
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  className="hover:text-gold transition-colors"
                >
                  Craft Village Guild Directory
                </a>
              </li>
            </ul>
          </div>

          {/* Link Column 3: Institutional */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-gold font-semibold">
              Heritage Preservation
            </h4>
            <p className="text-xs text-stone font-body leading-relaxed">
              Supporting sustainable local tourism, heritage conservation, and
              master craftspeople across Gujarat.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenPlanner}
                className="w-full bg-madder hover:bg-madder/90 text-salt py-2 px-3 text-xs uppercase font-mono tracking-wider transition-colors border border-madder cursor-pointer"
              >
                {t("common.plan_trip", "Plan Custom Route")}
              </button>
            </div>
          </div>
        </div>

        {/* Copyright & Technical Stamp */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-stone gap-4">
          <div>
            {t(
              "footer.rights",
              "© 2026 Heritage Tourism Planner. All rights reserved.",
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gold/80">
              Colors: Ink Indigo, Salt White, Madder Red, Stepwell Gold
            </span>
            <span>v2.4 Stepwell System</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
