import React, { useState, useMemo } from "react";
import {
  PlannerConfigPayload,
  OptimizationStrategy,
  GeneratedItineraryResult,
  generateStrategyItinerary,
  generateComparisonTakeaway,
} from "../utils/itineraryPlanner";
import { useLanguage } from "../context/LanguageContext";
import { AlgorithmStatsPanel } from "./AlgorithmStatsPanel";
import {
  X,
  SlidersHorizontal,
  Compass,
  Check,
  Building,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Zap,
  TrendingDown,
  Navigation,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface StrategyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PlannerConfigPayload;
  onSelectStrategy: (strategy: OptimizationStrategy) => void;
}

export const StrategyComparisonModal: React.FC<
  StrategyComparisonModalProps
> = ({ isOpen, onClose, config, onSelectStrategy }) => {
  const { language, t, getName } = useLanguage();
  const [activeMobileTab, setActiveMobileTab] =
    useState<OptimizationStrategy>("budget-first");
  const [expandedDayPlans, setExpandedDayPlans] = useState<Record<string, boolean>>({});

  // Compute all 3 strategy itineraries simultaneously
  const results: GeneratedItineraryResult[] = useMemo(() => {
    if (!isOpen) return [];
    return [
      generateStrategyItinerary(config, "budget-first", language),
      generateStrategyItinerary(config, "rating-first", language),
      generateStrategyItinerary(config, "distance-first", language),
    ];
  }, [isOpen, config, language]);

  if (!isOpen || results.length < 3) return null;

  const budgetResult = results[0];
  const ratingResult = results[1];
  const distanceResult = results[2];

  // Compute winning values for each metric row/column in comparison table
  const winningDistance = Math.min(...results.map((r) => r.totalDistanceKm));
  const winningCost = Math.min(...results.map((r) => r.totalCost));
  const winningAttractions = Math.max(...results.map((r) => r.attractionCount));
  const winningRuntime = Math.min(...results.map((r) => r.totalRuntimeMinutes));

  // Dynamic One-line Takeaway
  const takeawayText = generateComparisonTakeaway(results);

  const strategyMeta: Record<
    OptimizationStrategy,
    {
      title: string;
      subtitle: string;
      icon: React.ReactNode;
      badgeColor: string;
      description: string;
    }
  > = {
    "budget-first": {
      title: "Budget-first",
      subtitle: "Greedy cost & fee minimization",
      icon: <TrendingDown className="w-4 h-4 text-emerald-400" />,
      badgeColor: "border-emerald-600/50 bg-emerald-950/20 text-emerald-300",
      description: "Strictly minimizes hotel tariff, entrance fees, and meal expenses.",
    },
    "rating-first": {
      title: "Rating-first",
      subtitle: "Top-rated heritage quality",
      icon: <Star className="w-4 h-4 text-gold" />,
      badgeColor: "border-gold/50 bg-amber-950/20 text-gold",
      description: "Prioritizes highest-rated monuments (>= 4.6★) and heritage stays.",
    },
    "distance-first": {
      title: "Distance-first",
      subtitle: "Nearest-neighbor distance minimization",
      icon: <Navigation className="w-4 h-4 text-sky-400" />,
      badgeColor: "border-sky-600/50 bg-sky-950/20 text-sky-300",
      description: "Groups geographically proximate stops to reduce drive time.",
    },
  };

  const toggleDayPlan = (strategyKey: string) => {
    setExpandedDayPlans((prev) => ({
      ...prev,
      [strategyKey]: !prev[strategyKey],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-ink/90 backdrop-blur-sm overflow-y-auto">
      <div
        className="bg-salt border-2 border-gold max-w-6xl w-full text-charcoal p-3 sm:p-6 md:p-8 relative shadow-2xl my-2 sm:my-8 animate-fadeIn max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-stone/30 pb-3 mb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-gold uppercase tracking-widest mb-1">
              <SlidersHorizontal className="w-4 h-4 text-gold shrink-0" />
              <span>Stepwell Optimization Comparison</span>
            </div>
            <h2 className="font-display text-xl sm:text-3xl text-ink font-bold leading-tight">
              Compare Optimization Strategies — {getName(budgetResult.activeCity)}
            </h2>
            <p className="font-body text-xs text-stone mt-0.5">
              Evaluating 3 greedy route algorithms for your {config.tripDays}
              -day trip with a budget cap of ₹{config.budget.toLocaleString("en-IN")}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone hover:text-ink hover:bg-stone/20 border border-stone/30 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close strategy comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container for Modal Body */}
        <div className="overflow-y-auto space-y-4 sm:space-y-6 pr-1">
          {/* ================= 1. DYNAMIC ONE-LINE TAKEAWAY BANNER ================= */}
          <div className="bg-ink text-salt border-2 border-gold p-3 sm:p-4 relative shadow-md bg-stepwell-pattern">
            <div className="flex items-start gap-3">
              <div className="p-1.5 sm:p-2 bg-gold/20 border border-gold text-gold rounded-xs shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gold animate-pulse" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-gold uppercase tracking-widest font-bold block mb-0.5">
                  Algorithmic Trade-off Takeaway
                </span>
                <p className="font-display text-sm sm:text-lg text-salt font-medium leading-snug">
                  "{takeawayText}"
                </p>
              </div>
            </div>
          </div>

          {/* ================= 2. DESKTOP METRIC COMPARISON TABLE ================= */}
          <div className="hidden md:block bg-white border border-stone/30 p-4 shadow-sm">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal mb-3 flex items-center justify-between">
              <span>Strategy Metrics Overview</span>
              <span className="text-[10px] font-normal text-stone font-mono">
                <span className="text-gold font-bold">★ Gold</span> = Winning stat per metric
              </span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-salt border-b-2 border-stone/30 text-stone uppercase tracking-wider">
                    <th className="p-2.5 font-bold text-ink">Strategy Name</th>
                    <th className="p-2.5 font-bold text-ink">Total Cost (₹)</th>
                    <th className="p-2.5 font-bold text-ink">Distance (km)</th>
                    <th className="p-2.5 font-bold text-ink">Attractions</th>
                    <th className="p-2.5 font-bold text-ink">Est. Runtime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone/20">
                  {results.map((res) => {
                    const meta = strategyMeta[res.strategy];
                    const isWinningDist = res.totalDistanceKm === winningDistance;
                    const isWinningCost = res.totalCost === winningCost;
                    const isWinningAttr = res.attractionCount === winningAttractions;
                    const isWinningRuntime = res.totalRuntimeMinutes === winningRuntime;

                    return (
                      <tr
                        key={res.strategy}
                        className="hover:bg-salt/60 transition-colors"
                      >
                        <td className="p-2.5 font-bold text-ink flex items-center gap-2">
                          {meta.icon}
                          <span className="font-body text-sm font-semibold">
                            {meta.title}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 border font-mono ${meta.badgeColor}`}
                          >
                            {res.strategy}
                          </span>
                        </td>

                        {/* Cost Cell */}
                        <td className="p-2.5">
                          <span
                            className={`font-mono text-xs px-2 py-1 ${
                              isWinningCost
                                ? "bg-amber-100 text-amber-900 font-bold border border-gold shadow-xs"
                                : "text-charcoal"
                            }`}
                          >
                            {isWinningCost && (
                              <span className="text-gold mr-1">★</span>
                            )}
                            ₹{res.totalCost.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* Distance Cell */}
                        <td className="p-2.5">
                          <span
                            className={`font-mono text-xs px-2 py-1 ${
                              isWinningDist
                                ? "bg-amber-100 text-amber-900 font-bold border border-gold shadow-xs"
                                : "text-charcoal"
                            }`}
                          >
                            {isWinningDist && (
                              <span className="text-gold mr-1">★</span>
                            )}
                            {res.totalDistanceKm} km
                          </span>
                        </td>

                        {/* Attractions Cell */}
                        <td className="p-2.5">
                          <span
                            className={`font-mono text-xs px-2 py-1 ${
                              isWinningAttr
                                ? "bg-amber-100 text-amber-900 font-bold border border-gold shadow-xs"
                                : "text-charcoal"
                            }`}
                          >
                            {isWinningAttr && (
                              <span className="text-gold mr-1">★</span>
                            )}
                            {res.attractionCount} sites
                          </span>
                        </td>

                        {/* Est. Runtime Cell */}
                        <td className="p-2.5">
                          <span
                            className={`font-mono text-xs px-2 py-1 ${
                              isWinningRuntime
                                ? "bg-amber-100 text-amber-900 font-bold border border-gold shadow-xs"
                                : "text-charcoal"
                            }`}
                          >
                            {isWinningRuntime && (
                              <span className="text-gold mr-1">★</span>
                            )}
                            {res.totalRuntimeHours}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= 3. MOBILE TAB SWITCHER ================= */}
          <div className="md:hidden flex border-2 border-stone/30 bg-salt p-1 gap-1">
            {results.map((res) => {
              const isActive = activeMobileTab === res.strategy;
              const meta = strategyMeta[res.strategy];
              return (
                <button
                  key={res.strategy}
                  type="button"
                  onClick={() => setActiveMobileTab(res.strategy)}
                  className={`flex-1 py-2 px-1 text-xs font-mono font-bold flex items-center justify-center gap-1 cursor-pointer transition-all min-h-[44px] ${
                    isActive
                      ? "bg-ink text-gold border border-gold shadow-sm"
                      : "text-stone hover:text-charcoal bg-white border border-stone/20"
                  }`}
                >
                  {meta.icon}
                  <span className="text-[11px] truncate">{meta.title}</span>
                </button>
              );
            })}
          </div>

          {/* ================= 4. THREE TERRACE-OFFSET STRATEGY COLUMNS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-start pb-2">
            {results.map((res, idx) => {
              const meta = strategyMeta[res.strategy];
              const terraceClass =
                idx === 0 ? "mt-0" : idx === 1 ? "md:mt-3" : "md:mt-6";
              const isMobileHidden = activeMobileTab !== res.strategy;
              const isDaysExpanded = expandedDayPlans[res.strategy] ?? true;

              return (
                <div
                  key={res.strategy}
                  className={`bg-white border-2 border-stone/30 shadow-md flex flex-col transition-all ${terraceClass} ${
                    isMobileHidden ? "hidden md:flex" : "flex"
                  }`}
                >
                  {/* Column Terrace Header */}
                  <div className="bg-ink text-salt p-3 sm:p-4 border-b-2 border-gold relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] uppercase text-gold font-bold flex items-center gap-1">
                        {meta.icon}
                        Option 0{idx + 1}
                      </span>
                      <span className="font-mono text-[10px] text-stone text-right">
                        Terrace Step {idx + 1}
                      </span>
                    </div>
                    <h4 className="font-display text-lg sm:text-xl font-bold text-salt">
                      {meta.title}
                    </h4>
                    <p className="font-body text-xs text-stone/90 mt-0.5">
                      {meta.description}
                    </p>
                  </div>

                  {/* Column Key Metrics Cards */}
                  <div className="p-3 bg-salt border-b border-stone/20 grid grid-cols-2 gap-2 font-mono text-xs">
                    <div className="bg-white p-2 border border-stone/30">
                      <span className="text-[10px] text-stone uppercase block">
                        Total Cost
                      </span>
                      <span className="font-bold text-ink text-sm">
                        ₹{res.totalCost.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="bg-white p-2 border border-stone/30">
                      <span className="text-[10px] text-stone uppercase block">
                        Distance
                      </span>
                      <span className="font-bold text-ink text-sm">
                        {res.totalDistanceKm} km
                      </span>
                    </div>
                    <div className="bg-white p-2 border border-stone/30">
                      <span className="text-[10px] text-stone uppercase block">
                        Attractions
                      </span>
                      <span className="font-bold text-ink text-sm">
                        {res.attractionCount} sites
                      </span>
                    </div>
                    <div className="bg-white p-2 border border-stone/30">
                      <span className="text-[10px] text-stone uppercase block">
                        Est. Runtime
                      </span>
                      <span className="font-bold text-ink text-sm">
                        {res.totalRuntimeHours}
                      </span>
                    </div>
                  </div>

                  {/* Column Execution Algorithm Stats Strip */}
                  {res.stats && (
                    <div className="p-2 bg-ink border-b border-stone/30">
                      <AlgorithmStatsPanel
                        stats={res.stats}
                        collapsible={true}
                        defaultExpanded={false}
                        title="Execution Stats"
                      />
                    </div>
                  )}

                  {/* Column Condensed Day-by-Day Schedule */}
                  <div className="p-3 flex-grow space-y-3">
                    <div className="flex items-center justify-between border-b border-stone/30 pb-1">
                      <span className="font-mono text-xs font-bold text-charcoal uppercase">
                        Route Schedule ({res.dayPlans.length} Days)
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleDayPlan(res.strategy)}
                        className="text-[11px] font-mono text-gold hover:text-ink flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isDaysExpanded ? "Collapse" : "Expand"}</span>
                        {isDaysExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {isDaysExpanded && (
                      <div className="space-y-3 max-h-[280px] sm:max-h-[340px] overflow-y-auto pr-1">
                        {res.dayPlans.map((day) => (
                          <div key={day.dayNumber} className="space-y-1.5">
                            <div className="flex items-center justify-between border-b border-stone/20 pb-0.5">
                              <span className="font-mono text-xs font-bold text-gold uppercase">
                                {day.dateLabel}
                              </span>
                              <span className="font-mono text-[10px] text-stone">
                                {day.totalKm} km • ₹{day.totalCost}
                              </span>
                            </div>

                            <div className="space-y-1.5 pl-1.5 border-l-2 border-gold/40">
                              {day.stops.map((stop) => (
                                <div
                                  key={stop.id}
                                  className="bg-salt/80 p-1.5 border border-stone/20 text-xs space-y-0.5 hover:bg-salt transition-colors"
                                >
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="bg-ink/10 text-ink px-1 py-0.2 font-bold">
                                      {stop.arrivalTime}
                                    </span>
                                    <span className="text-stone truncate max-w-[120px]">
                                      {stop.category}
                                    </span>
                                  </div>
                                  <div className="font-body font-medium text-charcoal text-xs leading-tight line-clamp-1">
                                    {stop.name}
                                  </div>
                                  {stop.cost > 0 && (
                                    <div className="font-mono text-[10px] text-stone text-right">
                                      Cost: ₹{stop.cost}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Column Bottom Action: Madder Red "Use this plan" Button */}
                  <div className="p-3 sm:p-4 bg-salt border-t border-stone/20 shrink-0">
                    <button
                      type="button"
                      onClick={() => onSelectStrategy(res.strategy)}
                      className="w-full bg-madder hover:bg-ink text-salt border border-madder font-mono text-xs font-bold py-3 px-4 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-xl transition-all min-h-[44px]"
                    >
                      <Check className="w-4 h-4 text-salt" />
                      <span>Use this plan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
