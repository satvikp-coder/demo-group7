import React, { useState } from "react";
import { Destination, GUJARAT_DESTINATIONS } from "../data/destinations";
import { ItineraryConfig } from "./ItineraryView";
import { useLanguage } from "../context/LanguageContext";
import { getLatestOfflineTrip } from "../utils/offlineStorage";
import {
  DollarSign,
  ArrowLeft,
  AlertTriangle,
  Hotel,
  Car,
  Ticket,
  Utensils,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Printer,
  Share2,
  Check,
  TrendingDown,
  Info,
} from "lucide-react";

interface BudgetPlannerViewProps {
  config: ItineraryConfig | null;
  onBackToItinerary: () => void;
  onBackToPlanner: () => void;
  onSelectDestination?: (dest: Destination) => void;
}

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
  config,
  onBackToItinerary,
  onBackToPlanner,
  onSelectDestination,
}) => {
  const { language, t, getName } = useLanguage();

  const cachedTrip = getLatestOfflineTrip();
  const activeConfig = config || cachedTrip?.config || null;

  const defaultWorkedIds = ["modhera", "champaner", "adalaj"];
  const userSelected = activeConfig?.selectedSites
    ? GUJARAT_DESTINATIONS.filter((d) =>
        activeConfig.selectedSites.includes(d.id),
      )
    : [];

  const displayDestinations =
    userSelected.length >= 3
      ? userSelected
      : GUJARAT_DESTINATIONS.filter((d) => defaultWorkedIds.includes(d.id));

  const tripDays = activeConfig?.tripDays || 3;
  const [allocatedBudget, setAllocatedBudget] = useState<number>(
    activeConfig?.budget || 12000,
  );

  const travelCost = 3850;
  const hotelCost = 6800;
  const entryCost = 750;
  const foodCost = 1400;

  const totalEstimatedCost = travelCost + hotelCost + entryCost + foodCost;
  const [appliedTips, setAppliedTips] = useState<string[]>([]);
  const [savedShareNotice, setSavedShareNotice] = useState<boolean>(false);

  let tipSavings = 0;
  if (appliedTips.includes("hotel")) tipSavings += 2200;
  if (appliedTips.includes("pass")) tipSavings += 200;
  if (appliedTips.includes("transit")) tipSavings += 1100;

  const currentEffectiveCost = Math.max(0, totalEstimatedCost - tipSavings);
  const currentIsOver = currentEffectiveCost > allocatedBudget;
  const currentOverAmount = currentEffectiveCost - allocatedBudget;
  const currentFillPercent = Math.min(
    100,
    Math.round((currentEffectiveCost / allocatedBudget) * 100),
  );

  const datesList = ["DAY 1", "DAY 2", "DAY 3"];
  const dayTitles = [
    "Day 01 • Modhera & Mehsana Stepwell Foundations",
    "Day 02 • Champaner-Pavagadh UNESCO Citadel",
    "Day 03 • Ahmedabad Sabarmati & Subterranean Terraces",
  ];

  const dayCosts = [
    {
      dayNum: 1,
      date: datesList[0],
      title: dayTitles[0],
      travel: 1450,
      hotel: 3200,
      entry: 250,
      food: 450,
      sites: ["Modhera Sun Temple", "Mehsana Rani Ki Vav"],
    },
    {
      dayNum: 2,
      date: datesList[1],
      title: dayTitles[1],
      travel: 1300,
      hotel: 2600,
      entry: 300,
      food: 500,
      sites: ["Champaner-Pavagadh Archeological Park"],
    },
    {
      dayNum: 3,
      date: datesList[2],
      title: dayTitles[2],
      travel: 1100,
      hotel: 1000,
      entry: 200,
      food: 450,
      sites: ["Adalaj Ni Vav", "Sabarmati Ashram"],
    },
  ];

  const handlePrint = () => window.print();

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Gujarat Solanki Circuit Budget Ledger",
          text: `Financial breakdown for my ${tripDays}-day Gujarat Heritage trip: Total ₹${currentEffectiveCost.toLocaleString()}`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSavedShareNotice(true);
      setTimeout(() => setSavedShareNotice(false), 3000);
    }
  };

  const toggleTip = (tipId: string) => {
    setAppliedTips((prev) =>
      prev.includes(tipId) ? prev.filter((t) => t !== tipId) : [...prev, tipId],
    );
  };

  return (
    <div className="bg-salt min-h-screen py-8 px-4 sm:px-6 lg:px-8 border-b border-stone/30 animate-fadeIn selection:bg-gold selection:text-ink">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone/30 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToItinerary}
              className="inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-salt border border-gold text-xs font-mono px-4 py-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-gold" />
              <span>
                {language === "gu"
                  ? "પ્રવાસ પ્લાનર પર પાછા ફરો"
                  : language === "hi"
                    ? "यात्रा प्लानर पर वापस जाएं"
                    : "Return to Itinerary View"}
              </span>
            </button>

            <button
              onClick={onBackToPlanner}
              className="inline-flex items-center gap-2 bg-stone/20 hover:bg-stone/30 text-charcoal border border-stone/40 text-xs font-mono px-4 py-2 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-ink" />
              <span>
                {language === "gu"
                  ? "મુખ્ય પ્લાનરમાં ફેરફાર કરો"
                  : language === "hi"
                    ? "मुख्य प्लानर में बदलाव करें"
                    : "Adjust Trip Parameters"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-salt border border-stone/40 hover:border-gold text-charcoal text-xs font-mono px-3 py-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-gold" />
              <span>
                {language === "gu"
                  ? "શેર કરો"
                  : language === "hi"
                    ? "શેર કરેં"
                    : "Share Ledger"}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-salt border border-stone/40 hover:border-gold text-charcoal text-xs font-mono px-3 py-2 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-gold" />
              <span>
                {language === "gu"
                  ? "પ્રિન્ટ લેજર"
                  : language === "hi"
                    ? "प्रिंट लेजर"
                    : "Print Ledger"}
              </span>
            </button>
          </div>
        </div>

        {savedShareNotice && (
          <div className="p-3 bg-emerald-900 text-salt border border-emerald-500 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Budget ledger breakdown link copied to clipboard!</span>
          </div>
        )}

        {/* ================= 1. HEADER: BUDGET VS ESTIMATED COST BAR ================= */}
        <div className="bg-ink text-salt p-6 sm:p-8 border-2 border-gold space-y-6 relative shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone/30 pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-gold mb-1">
                <DollarSign className="w-4 h-4 text-gold" />
                <span>Financial Monograph & Circuit Audit</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl text-salt font-bold">
                {t("nav.budget", "Solanki Heritage Budget Planner")}
              </h1>
            </div>

            {/* Interactive Budget Adjustment Control */}
            <div className="bg-salt/10 border border-stone/40 p-3 space-y-1 font-mono text-xs">
              <span className="text-stone text-[10px] uppercase block tracking-wider">
                Simulate Target Budget Cap:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gold font-bold">₹</span>
                <input
                  type="number"
                  step="500"
                  min="5000"
                  max="30000"
                  value={allocatedBudget}
                  onChange={(e) =>
                    setAllocatedBudget(Number(e.target.value) || 0)
                  }
                  className="bg-salt text-ink font-mono font-bold text-base px-2 py-1 border border-gold outline-none w-28"
                />
                <span className="text-stone text-[10px]">INR</span>
              </div>
            </div>
          </div>

          {/* LEDGER BAR HEADER DISPLAY */}
          <div className="space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between text-xs sm:text-sm gap-2">
              <div>
                <span className="text-stone text-[11px] uppercase tracking-wider block">
                  Allocated Budget Cap:
                </span>
                <span className="text-salt font-bold text-lg sm:text-xl">
                  ₹{allocatedBudget.toLocaleString()}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-stone text-[11px] uppercase tracking-wider block">
                  Estimated Total Cost:
                </span>
                <span
                  className={`font-bold text-lg sm:text-xl ${currentIsOver ? "text-madder" : "text-gold"}`}
                >
                  ₹{currentEffectiveCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* HORIZONTAL PROGRESS BAR */}
            <div className="space-y-1">
              <div className="w-full h-3 bg-stone/40 border border-stone/60 overflow-hidden relative">
                <div
                  style={{ width: `${currentFillPercent}%` }}
                  className={`h-full transition-all duration-500 ${
                    currentIsOver ? "bg-madder" : "bg-gold"
                  }`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-stone">
                <span>0%</span>
                <span>{currentFillPercent}% Capacity</span>
                <span>100% (₹{allocatedBudget.toLocaleString()})</span>
              </div>
            </div>

            {/* WARNING LINE BELOW IN ERROR VOICE IF OVER BUDGET */}
            {currentIsOver && (
              <div className="p-3 bg-madder/20 border-2 border-madder text-salt text-xs font-mono flex items-start gap-2.5 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-madder shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-salt block">
                    This plan is Rs.{currentOverAmount.toLocaleString()} over
                    your budget.
                  </span>
                  <span className="text-stone text-[11px] block">
                    Remove a stop or extend your trip to fit it, or apply one of
                    our optimization tips below.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= 2. BREAKDOWN BY CATEGORY ================= */}
        <div className="bg-white border-2 border-stone/40 p-6 space-y-4 shadow-2xs">
          <div className="border-b border-stone/30 pb-3 flex items-center justify-between">
            <div>
              <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                Itemized Cost Distribution
              </span>
              <h2 className="font-display text-xl text-charcoal font-bold">
                Category Breakdown
              </h2>
            </div>
            <span className="font-mono text-xs text-stone">
              IBM Plex Mono Ledger
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Travel */}
            <div className="flex items-center justify-between p-3 bg-salt border border-stone/20">
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">
                    Transit & Transport (AC Chauffeur & Fuel)
                  </span>
                  <span className="text-[10px] text-stone">
                    Inter-city private vehicle & toll charges
                  </span>
                </div>
              </div>
              <span className="font-bold text-charcoal text-sm">
                ₹{travelCost.toLocaleString()}
              </span>
            </div>

            {/* Hotel */}
            <div className="flex items-center justify-between p-3 bg-salt border border-stone/20">
              <div className="flex items-center gap-3">
                <Hotel className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">
                    Heritage Stays & TCGL Toran Accommodations
                  </span>
                  <span className="text-[10px] text-stone">
                    2 nights verified government/heritage room rates
                  </span>
                </div>
              </div>
              <span className="font-bold text-charcoal text-sm">
                ₹
                {(
                  hotelCost - (appliedTips.includes("hotel") ? 2200 : 0)
                ).toLocaleString()}
              </span>
            </div>

            {/* Entry Tariffs */}
            <div className="flex items-center justify-between p-3 bg-salt border border-stone/20">
              <div className="flex items-center gap-3">
                <Ticket className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">
                    ASI Monument Tariffs & Camera Permits
                  </span>
                  <span className="text-[10px] text-stone">
                    Verified entry fees for Modhera, Champaner & Adalaj
                  </span>
                </div>
              </div>
              <span className="font-bold text-charcoal text-sm">
                ₹
                {(
                  entryCost - (appliedTips.includes("pass") ? 200 : 0)
                ).toLocaleString()}
              </span>
            </div>

            {/* Food */}
            <div className="flex items-center justify-between p-3 bg-salt border border-stone/20">
              <div className="flex items-center gap-3">
                <Utensils className="w-4 h-4 text-gold shrink-0" />
                <div>
                  <span className="font-bold text-charcoal block">
                    Authentic Gujarati Thali & Dining
                  </span>
                  <span className="text-[10px] text-stone">
                    Local culinary stops & tea breaks
                  </span>
                </div>
              </div>
              <span className="font-bold text-charcoal text-sm">
                ₹{foodCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ================= 3. OPTIMIZATION TIPS ================= */}
        <div className="bg-ink text-salt p-6 border-2 border-gold space-y-4">
          <div className="border-b border-stone/30 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              <h3 className="font-display text-lg text-salt font-bold">
                Budget Optimization Strategy
              </h3>
            </div>
            <span className="font-mono text-xs text-gold font-bold">
              Tip Savings Available: ₹3,500
            </span>
          </div>

          <p className="text-xs font-mono text-stone">
            Select optimization measures below to dynamically apply cost
            reductions to your active itinerary ledger:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Tip 1 */}
            <button
              onClick={() => toggleTip("hotel")}
              className={`p-4 border text-left transition-all cursor-pointer space-y-2 ${
                appliedTips.includes("hotel")
                  ? "bg-gold text-ink border-gold font-bold shadow-md"
                  : "bg-salt/10 text-salt border-stone/40 hover:border-gold"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-stone">
                  Stay Saver
                </span>
                <span className="font-bold text-madder bg-salt px-1.5 py-0.5 text-[10px]">
                  Save ₹2,200
                </span>
              </div>
              <h4 className="font-display text-sm font-bold">
                Switch to Toran Guest House
              </h4>
              <p className="text-[11px] opacity-90 font-normal">
                Opt for Gujarat Tourism (TCGL) Toran guest houses over private
                heritage stays.
              </p>
              <div className="pt-1 text-[10px] font-bold uppercase flex items-center gap-1">
                {appliedTips.includes("hotel")
                  ? "✓ Applied to Ledger"
                  : "+ Apply Saving"}
              </div>
            </button>

            {/* Tip 2 */}
            <button
              onClick={() => toggleTip("pass")}
              className={`p-4 border text-left transition-all cursor-pointer space-y-2 ${
                appliedTips.includes("pass")
                  ? "bg-gold text-ink border-gold font-bold shadow-md"
                  : "bg-salt/10 text-salt border-stone/40 hover:border-gold"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-stone">
                  ASI Tariff Pass
                </span>
                <span className="font-bold text-madder bg-salt px-1.5 py-0.5 text-[10px]">
                  Save ₹200
                </span>
              </div>
              <h4 className="font-display text-sm font-bold">
                Book Online ASI Combination Ticket
              </h4>
              <p className="text-[11px] opacity-90 font-normal">
                Purchase digital QR tickets online via the ASI portal to receive
                a 10% discount.
              </p>
              <div className="pt-1 text-[10px] font-bold uppercase flex items-center gap-1">
                {appliedTips.includes("pass")
                  ? "✓ Applied to Ledger"
                  : "+ Apply Saving"}
              </div>
            </button>

            {/* Tip 3 */}
            <button
              onClick={() => toggleTip("transit")}
              className={`p-4 border text-left transition-all cursor-pointer space-y-2 ${
                appliedTips.includes("transit")
                  ? "bg-gold text-ink border-gold font-bold shadow-md"
                  : "bg-salt/10 text-salt border-stone/40 hover:border-gold"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-stone">
                  GSRTC Express Transit
                </span>
                <span className="font-bold text-madder bg-salt px-1.5 py-0.5 text-[10px]">
                  Save ₹1,100
                </span>
              </div>
              <h4 className="font-display text-sm font-bold">
                GSRTC Volvo Bus for Inter-City Legs
              </h4>
              <p className="text-[11px] opacity-90 font-normal">
                Use GSRTC Volvo AC coach between Ahmedabad, Mehsana, and
                Vadodara.
              </p>
              <div className="pt-1 text-[10px] font-bold uppercase flex items-center gap-1">
                {appliedTips.includes("transit")
                  ? "✓ Applied to Ledger"
                  : "+ Apply Saving"}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
