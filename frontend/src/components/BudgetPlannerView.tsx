import React, { useState } from 'react';
import { Destination, GUJARAT_DESTINATIONS } from '../data/destinations';
import { ItineraryConfig } from './ItineraryView';
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
  Layers,
  Info,
  Layers3
} from 'lucide-react';

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
  // Use config or worked example fallback (3-day Modhera -> Champaner -> Ahmedabad)
  const defaultWorkedIds = ['modhera', 'champaner', 'adalaj'];
  const userSelected = config?.selectedSites
    ? GUJARAT_DESTINATIONS.filter(d => config.selectedSites.includes(d.id))
    : [];
  
  const displayDestinations = userSelected.length >= 3
    ? userSelected
    : GUJARAT_DESTINATIONS.filter(d => defaultWorkedIds.includes(d.id));

  const tripDays = config?.tripDays || 3;
  
  // Budget allocation state (allow live adjustment slider/input to test over-budget states)
  const [allocatedBudget, setAllocatedBudget] = useState<number>(config?.budget || 12000);

  // Worked expense breakdown based on real Modhera -> Champaner -> Ahmedabad route
  const travelCost = 3850;   // 305 km private AC chauffeur + fuel
  const hotelCost = 6800;    // 2 nights heritage stay
  const entryCost = 750;     // ASI entry tariffs for Modhera, Champaner, Adalaj
  const foodCost = 1400;      // Kathiawadi Thali & culinary stops

  const totalEstimatedCost = travelCost + hotelCost + entryCost + foodCost; // ₹12,800
  const isOverBudget = totalEstimatedCost > allocatedBudget;
  const overAmount = totalEstimatedCost - allocatedBudget;
  const costFillPercent = Math.min(100, Math.round((totalEstimatedCost / allocatedBudget) * 100));

  // Applied tip savings state
  const [appliedTips, setAppliedTips] = useState<string[]>([]);
  const [savedShareNotice, setSavedShareNotice] = useState<boolean>(false);

  // Calculate tip adjusted total
  let tipSavings = 0;
  if (appliedTips.includes('hotel')) tipSavings += 2200;
  if (appliedTips.includes('pass')) tipSavings += 200;
  if (appliedTips.includes('transit')) tipSavings += 1100;

  const currentEffectiveCost = Math.max(0, totalEstimatedCost - tipSavings);
  const currentIsOver = currentEffectiveCost > allocatedBudget;
  const currentOverAmount = currentEffectiveCost - allocatedBudget;
  const currentFillPercent = Math.min(100, Math.round((currentEffectiveCost / allocatedBudget) * 100));

  // Day-by-day cost breakdown data
  const datesList = ['OCT 12, 2026', 'OCT 13, 2026', 'OCT 14, 2026'];
  const dayTitles = [
    'Day 01 • Modhera & Mehsana Stepwell Foundations',
    'Day 02 • Champaner-Pavagadh UNESCO Citadel',
    'Day 03 • Ahmedabad Sabarmati & Subterranean Terraces'
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
      sites: ['Modhera Sun Temple', 'Mehsana Rani Ki Vav']
    },
    {
      dayNum: 2,
      date: datesList[1],
      title: dayTitles[1],
      travel: 1300,
      hotel: 2600,
      entry: 300,
      food: 500,
      sites: ['Champaner-Pavagadh Archeological Park']
    },
    {
      dayNum: 3,
      date: datesList[2],
      title: dayTitles[2],
      travel: 1100,
      hotel: 1000,
      entry: 200,
      food: 450,
      sites: ['Adalaj Ni Vav', 'Sabarmati Ashram']
    }
  ];

  const handlePrint = () => window.print();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Gujarat Solanki Circuit Budget Ledger',
        text: `Financial breakdown for my ${tripDays}-day Gujarat Heritage trip: Total ₹${currentEffectiveCost.toLocaleString()}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSavedShareNotice(true);
      setTimeout(() => setSavedShareNotice(false), 3000);
    }
  };

  const toggleTip = (tipId: string) => {
    setAppliedTips(prev =>
      prev.includes(tipId) ? prev.filter(t => t !== tipId) : [...prev, tipId]
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
              <span>Return to Itinerary View</span>
            </button>

            <button
              onClick={onBackToPlanner}
              className="inline-flex items-center gap-2 bg-stone/20 hover:bg-stone/30 text-charcoal border border-stone/40 text-xs font-mono px-4 py-2 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-ink" />
              <span>Adjust Trip Parameters</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 bg-salt border border-stone/40 hover:border-gold text-charcoal text-xs font-mono px-3 py-2 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-gold" />
              <span>Share Ledger</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 bg-salt border border-stone/40 hover:border-gold text-charcoal text-xs font-mono px-3 py-2 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-gold" />
              <span>Print Ledger</span>
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
                Solanki Heritage Budget Planner
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
                  onChange={(e) => setAllocatedBudget(Number(e.target.value) || 0)}
                  className="bg-salt text-ink font-mono font-bold text-base px-2 py-1 border border-gold outline-none w-28"
                />
                <span className="text-stone text-[10px]">INR</span>
              </div>
            </div>
          </div>

          {/* LEDGER BAR HEADER DISPLAY (IBM Plex Mono) */}
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
                <span className={`font-bold text-lg sm:text-xl ${currentIsOver ? 'text-madder' : 'text-gold'}`}>
                  ₹{currentEffectiveCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* HORIZONTAL PROGRESS BAR: Thin bar with Madder Red fill against Stone Grey track */}
            <div className="space-y-1">
              <div className="w-full h-3 bg-stone/40 border border-stone/60 overflow-hidden relative">
                <div
                  style={{ width: `${currentFillPercent}%` }}
                  className={`h-full transition-all duration-500 ${
                    currentIsOver ? 'bg-madder' : 'bg-gold'
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
                    This plan is Rs.{currentOverAmount.toLocaleString()} over your budget.
                  </span>
                  <span className="text-stone text-[11px] block">
                    Remove a stop or extend your trip to fit it, or apply one of our optimization tips below.
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ================= 2. BREAKDOWN BY CATEGORY ================= */}
        {/* Simple horizontal list of rows (label left, amount right in IBM Plex Mono), NOT a pie chart */}
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
            {/* Travel Row */}
            <div className="p-3.5 bg-salt border border-stone/30 hover:border-gold transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ink text-gold border border-gold shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-charcoal text-sm block">Travel & Inter-District Transit</span>
                  <span className="text-[11px] text-stone">Private AC Chauffeur, Highway Tolls & Fuel (305 km total)</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-ink text-base">₹{travelCost.toLocaleString()}</span>
                <span className="text-[10px] text-stone block">
                  ({Math.round((travelCost / totalEstimatedCost) * 100)}% of total)
                </span>
              </div>
            </div>

            {/* Hotels Row */}
            <div className="p-3.5 bg-salt border border-stone/30 hover:border-gold transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ink text-gold border border-gold shrink-0">
                  <Hotel className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-charcoal text-sm block">Hotels & Heritage Stays</span>
                  <span className="text-[11px] text-stone">House of MG (Ahmedabad) & Champaner Toran Heritage Haven</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-ink text-base">₹{hotelCost.toLocaleString()}</span>
                <span className="text-[10px] text-stone block">
                  ({Math.round((hotelCost / totalEstimatedCost) * 100)}% of total)
                </span>
              </div>
            </div>

            {/* Entry Fees Row */}
            <div className="p-3.5 bg-salt border border-stone/30 hover:border-gold transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ink text-gold border border-gold shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-charcoal text-sm block">ASI Monument Entry Fees</span>
                  <span className="text-[11px] text-stone">Official ASI Tariffs for Modhera, Champaner & Adalaj Ni Vav</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-ink text-base">₹{entryCost.toLocaleString()}</span>
                <span className="text-[10px] text-stone block">
                  ({Math.round((entryCost / totalEstimatedCost) * 100)}% of total)
                </span>
              </div>
            </div>

            {/* Meals & Culinary Row */}
            <div className="p-3.5 bg-salt border border-stone/30 hover:border-gold transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-ink text-gold border border-gold shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-charcoal text-sm block">Kathiawadi Meals & Local Food</span>
                  <span className="text-[11px] text-stone">Traditional Unlimited Gujarati Thalis & Highway Chai Stops</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-ink text-base">₹{foodCost.toLocaleString()}</span>
                <span className="text-[10px] text-stone block">
                  ({Math.round((foodCost / totalEstimatedCost) * 100)}% of total)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. MAIN TWO-COLUMN LAYOUT: DAY-BY-DAY & BUDGET TIPS ASIDE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: BREAKDOWN BY DAY USING TERRACE-STEPPED DAY BLOCKS (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">

            <div className="border-b border-stone/30 pb-3">
              <span className="font-mono text-xs text-gold uppercase tracking-widest block">
                Sequential Daily Ledger
              </span>
              <h2 className="font-display text-2xl text-charcoal font-bold">
                Breakdown by Day
              </h2>
            </div>

            {/* TERRACE GRID PATTERN VERTICALLY REUSED */}
            <div className="space-y-6 relative">
              {dayCosts.map((day, index) => {
                const dayTotal = day.travel + day.hotel + day.entry + day.food;

                // Stepped terrace offset logic for desktop:
                // Day 1 highest (ml-0), Day 2 (sm:ml-8), Day 3 (sm:ml-16)
                // Collapses to plain stacked list on mobile
                const terraceIndentClasses = [
                  'sm:ml-0',
                  'sm:ml-6 lg:ml-8',
                  'sm:ml-12 lg:ml-16',
                ][index % 3];

                return (
                  <div
                    key={day.dayNum}
                    className={`transition-all duration-300 ${terraceIndentClasses} relative group`}
                  >
                    <div className="bg-white border-2 border-stone/40 hover:border-gold transition-all shadow-sm">
                      
                      {/* Day Header Bar */}
                      <div className="p-4 bg-ink text-salt flex flex-wrap items-center justify-between gap-2 border-b border-gold/40">
                        <div className="flex items-center gap-3">
                          <div className="bg-gold text-ink font-mono text-xs font-bold px-3 py-1 uppercase tracking-wider">
                            Day 0{day.dayNum}
                          </div>
                          <div>
                            <span className="font-display text-xs text-gold uppercase tracking-widest block">
                              {day.date}
                            </span>
                            <h3 className="font-display text-base font-bold text-salt">
                              {day.title}
                            </h3>
                          </div>
                        </div>

                        {/* Day Cost Total */}
                        <div className="font-mono text-xs text-gold font-bold bg-salt/10 px-3 py-1 border border-stone/40">
                          Day Total: ₹{dayTotal.toLocaleString()}
                        </div>
                      </div>

                      {/* Day Body: One-line Cost Breakdown */}
                      <div className="p-5 space-y-3 bg-salt/20 font-mono text-xs">
                        <div className="text-stone text-[11px] font-bold uppercase tracking-wider">
                          Monuments & Circuit Stops: {day.sites.join(' • ')}
                        </div>

                        {/* ONE-LINE COST BREAKDOWN (travel / hotel / entry / food) */}
                        <div className="p-3 bg-white border border-stone/30 flex flex-wrap items-center justify-between gap-3 text-charcoal">
                          <div className="flex flex-wrap items-center gap-4 text-[11px]">
                            <span className="flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-gold" />
                              <span>Travel: <strong className="text-ink">₹{day.travel.toLocaleString()}</strong></span>
                            </span>

                            <span className="text-stone/40">•</span>

                            <span className="flex items-center gap-1.5">
                              <Hotel className="w-3.5 h-3.5 text-gold" />
                              <span>Hotel: <strong className="text-ink">₹{day.hotel.toLocaleString()}</strong></span>
                            </span>

                            <span className="text-stone/40">•</span>

                            <span className="flex items-center gap-1.5">
                              <Ticket className="w-3.5 h-3.5 text-gold" />
                              <span>Entry: <strong className="text-ink">₹{day.entry.toLocaleString()}</strong></span>
                            </span>

                            <span className="text-stone/40">•</span>

                            <span className="flex items-center gap-1.5">
                              <Utensils className="w-3.5 h-3.5 text-gold" />
                              <span>Food: <strong className="text-ink">₹{day.food.toLocaleString()}</strong></span>
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: "BUDGET TIPS" ASIDE WITH STEPPED-CHEVRON MOTIF (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">

            <div className="bg-ink text-salt p-5 border-2 border-gold space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-stone/30 pb-3">
                <div className="flex items-center gap-2">
                  {/* Stepped-Chevron Motif Icon */}
                  <div className="flex items-center -space-x-1">
                    <ChevronRight className="w-4 h-4 text-gold" />
                    <ChevronRight className="w-4 h-4 text-gold/70" />
                    <ChevronRight className="w-4 h-4 text-gold/40" />
                  </div>
                  <h3 className="font-display text-lg text-salt font-bold">
                    Budget Tips & Optimization
                  </h3>
                </div>
                <span className="font-mono text-[10px] bg-gold text-ink font-bold px-2 py-0.5 uppercase">
                  ASI Expert
                </span>
              </div>

              <p className="font-mono text-xs text-stone leading-relaxed">
                Plain-language cost reduction options tailored specifically for the Modhera-Champaner-Ahmedabad heritage loop.
              </p>

              {/* 2-3 Plain-Language Suggestions with Stepped-Chevron Motif */}
              <div className="space-y-3 font-mono text-xs">

                {/* Tip 1 */}
                <div
                  onClick={() => toggleTip('hotel')}
                  className={`p-3.5 border transition-all cursor-pointer space-y-2 ${
                    appliedTips.includes('hotel')
                      ? 'bg-gold/20 border-gold text-salt'
                      : 'bg-salt/5 border-stone/40 hover:border-gold text-stone'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-salt">
                      <Layers3 className="w-4 h-4 text-gold shrink-0" />
                      <span>Swap House of MG Hotel</span>
                    </div>
                    <span className="text-gold font-bold shrink-0">Save ~₹2,200</span>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    Swap House of MG for Toran Heritage Guest House near Ahmedabad Old City to save ~₹2,200 on overnight stays.
                  </p>

                  <button className="text-[10px] text-gold uppercase font-bold underline">
                    {appliedTips.includes('hotel') ? '✓ Applied in ledger' : '+ Test option'}
                  </button>
                </div>

                {/* Tip 2 */}
                <div
                  onClick={() => toggleTip('transit')}
                  className={`p-3.5 border transition-all cursor-pointer space-y-2 ${
                    appliedTips.includes('transit')
                      ? 'bg-gold/20 border-gold text-salt'
                      : 'bg-salt/5 border-stone/40 hover:border-gold text-stone'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-salt">
                      <Layers3 className="w-4 h-4 text-gold shrink-0" />
                      <span>Group Transit Sharing</span>
                    </div>
                    <span className="text-gold font-bold shrink-0">Save ~₹1,100</span>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    Share private AC transit costs across 3 co-travelers to lower individual transit expenditure.
                  </p>

                  <button className="text-[10px] text-gold uppercase font-bold underline">
                    {appliedTips.includes('transit') ? '✓ Applied in ledger' : '+ Test option'}
                  </button>
                </div>

                {/* Tip 3 */}
                <div
                  onClick={() => toggleTip('pass')}
                  className={`p-3.5 border transition-all cursor-pointer space-y-2 ${
                    appliedTips.includes('pass')
                      ? 'bg-gold/20 border-gold text-salt'
                      : 'bg-salt/5 border-stone/40 hover:border-gold text-stone'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-salt">
                      <Layers3 className="w-4 h-4 text-gold shrink-0" />
                      <span>Digital ASI Heritage Pass</span>
                    </div>
                    <span className="text-gold font-bold shrink-0">Save ~₹200</span>
                  </div>

                  <p className="text-[11px] leading-relaxed">
                    Pre-book online digital ASI entry tickets for Modhera and Champaner to skip queue surcharges.
                  </p>

                  <button className="text-[10px] text-gold uppercase font-bold underline">
                    {appliedTips.includes('pass') ? '✓ Applied in ledger' : '+ Test option'}
                  </button>
                </div>

              </div>

              {appliedTips.length > 0 && (
                <div className="p-3 bg-gold/10 border border-gold font-mono text-xs flex items-center justify-between text-gold">
                  <span>Total Tip Savings Applied:</span>
                  <span className="font-bold">₹{tipSavings.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Quick Summary Action Card */}
            <div className="bg-white border-2 border-stone/40 p-5 space-y-3 font-mono text-xs shadow-xs">
              <span className="font-bold text-charcoal uppercase block">
                Trip Actions:
              </span>
              <button
                onClick={onBackToItinerary}
                className="w-full bg-ink hover:bg-ink/90 text-salt border border-gold py-2.5 px-3 text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-gold" />
                <span>Return to Itinerary View</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
