import React from "react";
import {
  Sparkles,
  RotateCcw,
  Check,
  DollarSign,
  Calendar,
  AlertCircle,
} from "lucide-react";

export interface WhatIfPanelProps {
  currentBudget: number;
  currentDays: number;
  originalBudget: number;
  originalDays: number;
  sliderBudget: number;
  sliderDays: number;
  onBudgetChange: (value: number) => void;
  onDaysChange: (value: number) => void;
  liveAttractionCount: number;
  baselineAttractionCount: number;
  liveCost: number;
  baselineCost: number;
  onReset: () => void;
  onSaveVersion: () => void;
  isSavedNotice?: boolean;
}

export const WhatIfPanel: React.FC<WhatIfPanelProps> = ({
  currentBudget,
  currentDays,
  originalBudget,
  originalDays,
  sliderBudget,
  sliderDays,
  onBudgetChange,
  onDaysChange,
  liveAttractionCount,
  baselineAttractionCount,
  liveCost,
  baselineCost,
  onReset,
  onSaveVersion,
  isSavedNotice,
}) => {
  const minBudget = Math.max(500, originalBudget - 2000);
  const maxBudget = originalBudget + 5000;

  // Running Deltas
  const attractionDiff = liveAttractionCount - baselineAttractionCount;
  const costDiff = liveCost - baselineCost;
  const isBudgetOverage = liveCost > sliderBudget;

  // Formatting attraction delta
  let attractionDeltaText = "0 attractions";
  if (attractionDiff > 0) {
    attractionDeltaText = `+${attractionDiff} attraction${attractionDiff > 1 ? "s" : ""}`;
  } else if (attractionDiff < 0) {
    attractionDeltaText = `${attractionDiff} attraction${attractionDiff < -1 ? "s" : ""}`;
  }

  // Formatting cost delta
  let costDeltaText = "₹0 spent";
  if (isBudgetOverage) {
    const overage = liveCost - sliderBudget;
    costDeltaText = `Over budget (+₹${overage.toLocaleString("en-IN")})`;
  } else if (costDiff < 0) {
    costDeltaText = `-₹${Math.abs(costDiff).toLocaleString("en-IN")} spent`;
  } else if (costDiff > 0) {
    costDeltaText = `+₹${costDiff.toLocaleString("en-IN")} spent`;
  }

  // Days delta
  const daysDiff = sliderDays - originalDays;
  let daysDeltaText = `${sliderDays} ${sliderDays === 1 ? "day" : "days"}`;
  if (daysDiff > 0) {
    daysDeltaText += ` (+${daysDiff} d)`;
  } else if (daysDiff < 0) {
    daysDeltaText += ` (${daysDiff} d)`;
  }

  const isModified =
    sliderBudget !== currentBudget || sliderDays !== currentDays;
  const isDifferentFromOriginal =
    sliderBudget !== originalBudget || sliderDays !== originalDays;

  return (
    <div className="bg-ink text-salt border-2 border-gold p-4 sm:p-5 shadow-lg space-y-4 font-mono animate-fadeIn">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-stone/30 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gold/20 border border-gold rounded-xs">
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-gold uppercase tracking-wider">
              Live "What If?" Scenario Explorer
            </h3>
            <p className="text-[11px] text-stone">
              Drag sliders to re-calculate circular greedy route in real time.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isDifferentFromOriginal && (
            <button
              type="button"
              onClick={onReset}
              className="text-stone hover:text-gold text-xs underline font-mono cursor-pointer flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-gold" />
              <span>Reset to original</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSaveVersion}
            className="bg-madder hover:bg-madder/90 text-salt border border-madder text-xs font-mono font-bold px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            {isSavedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-salt" />
                <span>Saved Active Plan!</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-salt" />
                <span>Save this version instead</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Slider 1: Budget Slider */}
        <div className="space-y-2 bg-salt/5 p-3.5 border border-stone/30">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="whatif-budget-slider"
              className="font-bold text-gold flex items-center gap-1.5"
            >
              <DollarSign className="w-3.5 h-3.5 text-gold" />
              <span>Trip Budget Limit</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-salt font-bold text-sm">
                ₹{sliderBudget.toLocaleString("en-IN")}
              </span>

              {/* Running Cost Delta Badge */}
              <span
                className={`text-[10px] px-2 py-0.5 border font-mono font-bold ${
                  isBudgetOverage
                    ? "bg-madder/20 text-madder border-madder"
                    : costDiff <= 0
                      ? "bg-gold/20 text-gold border-gold/50"
                      : "bg-salt/20 text-salt border-stone/40"
                }`}
              >
                {costDeltaText}
              </span>
            </div>
          </div>

          <input
            id="whatif-budget-slider"
            type="range"
            min={minBudget}
            max={maxBudget}
            step={250}
            value={sliderBudget}
            onChange={(e) => onBudgetChange(Number(e.target.value))}
            className="w-full accent-gold bg-stone/40 h-1.5 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-stone">
            <span>Min: ₹{minBudget.toLocaleString("en-IN")}</span>
            <span>Orig: ₹{originalBudget.toLocaleString("en-IN")}</span>
            <span>Max: ₹{maxBudget.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Slider 2: Trip Days Slider */}
        <div className="space-y-2 bg-salt/5 p-3.5 border border-stone/30">
          <div className="flex items-center justify-between text-xs">
            <label
              htmlFor="whatif-days-slider"
              className="font-bold text-gold flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-gold" />
              <span>Trip Duration (Days)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="font-mono text-salt font-bold text-sm">
                {daysDeltaText}
              </span>

              {/* Running Attraction Delta Badge */}
              <span
                className={`text-[10px] px-2 py-0.5 border font-mono font-bold ${
                  attractionDiff >= 0
                    ? "bg-gold/20 text-gold border-gold/50"
                    : "bg-madder/20 text-madder border-madder"
                }`}
              >
                {attractionDeltaText}
              </span>
            </div>
          </div>

          <input
            id="whatif-days-slider"
            type="range"
            min={1}
            max={7}
            step={1}
            value={sliderDays}
            onChange={(e) => onDaysChange(Number(e.target.value))}
            className="w-full accent-gold bg-stone/40 h-1.5 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-stone">
            <span>1 Day</span>
            <span>Orig: {originalDays} Days</span>
            <span>7 Days</span>
          </div>
        </div>
      </div>

      {/* Live Impact Summary Bar */}
      <div className="p-2.5 bg-salt/10 border border-gold/30 flex flex-wrap items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-3">
          <span className="text-stone">Live greedy route:</span>
          <span className="text-salt font-bold">
            ₹{liveCost.toLocaleString("en-IN")} total cost
          </span>
          <span className="text-stone">•</span>
          <span className="text-gold font-bold">
            {liveAttractionCount} attractions visited
          </span>
        </div>

        {isBudgetOverage && (
          <div className="flex items-center gap-1 text-madder text-[11px] font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-madder shrink-0" />
            <span>
              Target budget exceeded by ₹
              {(liveCost - sliderBudget).toLocaleString("en-IN")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
