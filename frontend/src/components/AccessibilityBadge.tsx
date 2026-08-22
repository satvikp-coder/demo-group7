import React from "react";
import { Accessibility } from "lucide-react";

interface AccessibilityBadgeProps {
  wheelchairAccessible?: boolean;
  physicalDemand?: "low" | "moderate" | "high";
  compact?: boolean;
}

export const AccessibilityBadge: React.FC<AccessibilityBadgeProps> = ({
  wheelchairAccessible,
  physicalDemand,
  compact = false,
}) => {
  if (wheelchairAccessible === undefined && !physicalDemand) return null;

  const filledSteps =
    physicalDemand === "low" ? 1 : physicalDemand === "moderate" ? 2 : 3;

  const demandStyles =
    physicalDemand === "low"
      ? "text-emerald-800 bg-emerald-50 border-emerald-300"
      : physicalDemand === "moderate"
        ? "text-amber-800 bg-amber-50 border-amber-300"
        : "text-madder bg-red-50 border-red-300";

  return (
    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] uppercase font-bold">
      {wheelchairAccessible !== undefined && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 border ${
            wheelchairAccessible
              ? "bg-emerald-100/90 text-emerald-950 border-emerald-400"
              : "bg-stone/10 text-stone border-stone/30"
          }`}
          title={
            wheelchairAccessible
              ? "Wheelchair accessible"
              : "Not wheelchair accessible"
          }
        >
          <Accessibility
            className={`w-3.5 h-3.5 ${
              wheelchairAccessible
                ? "text-emerald-700 font-bold"
                : "text-stone/60"
            }`}
          />
          {!compact && (
            <span>
              {wheelchairAccessible
                ? "Wheelchair Accessible"
                : "Not Wheelchair Accessible"}
            </span>
          )}
        </span>
      )}

      {physicalDemand && (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${demandStyles}`}
        >
          <div
            className="inline-flex items-end gap-0.5 h-3 shrink-0"
            aria-label={`Physical demand level: ${physicalDemand}`}
            title={`Physical Demand: ${physicalDemand}`}
          >
            <span
              className={`w-1 rounded-2xs ${
                filledSteps >= 1 ? "h-1.5 bg-current" : "h-1.5 bg-stone/30"
              }`}
            />
            <span
              className={`w-1 rounded-2xs ${
                filledSteps >= 2 ? "h-2.5 bg-current" : "h-2.5 bg-stone/30"
              }`}
            />
            <span
              className={`w-1 rounded-2xs ${
                filledSteps >= 3 ? "h-3.5 bg-current" : "h-3.5 bg-stone/30"
              }`}
            />
          </div>
          <span>{physicalDemand} Demand</span>
        </span>
      )}
    </div>
  );
};
