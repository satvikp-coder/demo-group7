import React, { useState } from "react";
import { AlgorithmStats } from "../utils/itineraryPlanner";
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  Zap,
  MapPin,
  Route,
  Layers,
  Clock,
} from "lucide-react";

export interface AlgorithmStatsPanelProps {
  stats: AlgorithmStats;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  title?: string;
  className?: string;
}

export const AlgorithmStatsPanel: React.FC<AlgorithmStatsPanelProps> = ({
  stats,
  collapsible = true,
  defaultExpanded = false,
  title = "Algorithm Execution Stats",
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const summaryText = `Generated in ${stats.executionTimeMs}ms -- ${stats.attractionsVisited} attractions, ${stats.directRoadConnectionsUsed} direct routes, ${stats.dijkstraFallbackCalls} Dijkstra fallbacks.`;

  return (
    <div
      className={`bg-ink text-salt border border-gold/40 shadow-sm transition-all ${className}`}
      id="algorithm-stats-panel"
    >
      {/* Strip Header / Summary Bar */}
      <div className="p-2.5 sm:p-3 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1 bg-gold/20 border border-gold/50 rounded-xs shrink-0">
            <Cpu className="w-3.5 h-3.5 text-gold" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
            <span className="font-mono text-xs font-bold text-gold uppercase tracking-wider shrink-0">
              {title}
            </span>

            {collapsible && !isExpanded && (
              <span className="font-mono text-xs text-stone truncate max-w-full sm:max-w-md">
                Generated in{" "}
                <strong className="font-mono text-salt font-bold">
                  {stats.executionTimeMs}ms
                </strong>{" "}
                --{" "}
                <strong className="font-mono text-salt font-bold">
                  {stats.attractionsVisited}
                </strong>{" "}
                attractions,{" "}
                <strong className="font-mono text-salt font-bold">
                  {stats.directRoadConnectionsUsed}
                </strong>{" "}
                direct routes,{" "}
                <strong className="font-mono text-salt font-bold">
                  {stats.dijkstraFallbackCalls}
                </strong>{" "}
                Dijkstra fallbacks.
              </span>
            )}
          </div>
        </div>

        {collapsible && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="font-mono text-xs font-bold text-gold hover:text-salt bg-gold/10 hover:bg-gold/20 border border-gold/40 px-2.5 py-1 flex items-center gap-1 transition-colors cursor-pointer shrink-0 ml-auto"
            aria-expanded={isExpanded}
            aria-label="Toggle algorithm stats detail"
          >
            <span>
              {isExpanded ? "Hide algorithm stats" : "View algorithm stats"}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-gold" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gold" />
            )}
          </button>
        )}
      </div>

      {/* Expanded Detail Panel */}
      {(!collapsible || isExpanded) && (
        <div className="p-3 border-t border-gold/30 bg-ink/90 grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs animate-fadeIn">
          {/* 1. Generation Time */}
          <div className="bg-salt/10 p-2 border border-stone/30 flex flex-col justify-between">
            <span className="text-[10px] text-gold uppercase tracking-wider block font-bold mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-gold" />
              Exec Time
            </span>
            <span className="font-mono font-bold text-salt text-sm">
              {stats.executionTimeMs} ms
            </span>
          </div>

          {/* 2. Attractions Selection */}
          <div className="bg-salt/10 p-2 border border-stone/30 flex flex-col justify-between">
            <span className="text-[10px] text-gold uppercase tracking-wider block font-bold mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gold" />
              Attractions
            </span>
            <span className="font-mono font-bold text-salt text-sm">
              {stats.attractionsVisited}{" "}
              <span className="text-stone font-normal text-xs">
                / {stats.attractionsConsidered}
              </span>
            </span>
            <span className="text-[9px] text-stone">Selected by Greedy</span>
          </div>

          {/* 3. Direct Routes vs Dijkstra */}
          <div className="bg-salt/10 p-2 border border-stone/30 flex flex-col justify-between">
            <span className="text-[10px] text-gold uppercase tracking-wider block font-bold mb-1 flex items-center gap-1">
              <Route className="w-3 h-3 text-gold" />
              Connections
            </span>
            <span className="font-mono font-bold text-salt text-sm">
              {stats.directRoadConnectionsUsed}{" "}
              <span className="text-stone font-normal text-xs">dir</span> •{" "}
              {stats.dijkstraFallbackCalls}{" "}
              <span className="text-stone font-normal text-xs">Dijkstra</span>
            </span>
            <span className="text-[9px] text-stone">Direct vs Fallbacks</span>
          </div>

          {/* 4. Graph Operations */}
          <div className="bg-salt/10 p-2 border border-stone/30 flex flex-col justify-between">
            <span className="text-[10px] text-gold uppercase tracking-wider block font-bold mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-gold" />
              Graph Ops
            </span>
            <span className="font-mono font-bold text-salt text-sm">
              {stats.nodesVisited}{" "}
              <span className="text-stone font-normal text-xs">nodes</span> /{" "}
              {stats.edgesRelaxed}{" "}
              <span className="text-stone font-normal text-xs">edges</span>
            </span>
            <span className="text-[9px] text-stone">Visited & Relaxed</span>
          </div>
        </div>
      )}
    </div>
  );
};
