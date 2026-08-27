import React, { useState } from "react";
import { generateStrategyItinerary, OptimizationStrategy } from "../utils/itineraryPlanner";
import { GUJARAT_DESTINATIONS } from "../data/destinations";
import { Cpu, ArrowLeft, Play, Database, Download, Copy, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface ResearchViewProps {
  onBack: () => void;
}

interface RunRow {
  cityId: string;
  days: number;
  budget: number;
  strategy: OptimizationStrategy;
  attractions: number;
  cost: number;
  distance: number;
  dijkstraCalls: number;
  runtimeMs: number;
}

export const ResearchView: React.FC<ResearchViewProps> = ({ onBack }) => {
  const [results, setResults] = useState<RunRow[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const runSimulationMatrix = () => {
    setIsRunning(true);
    setTimeout(() => {
      const runs: RunRow[] = [];
      const testCities = [
        { id: "somnath", hotelId: "premier-somnath" },
        { id: "dwarka", hotelId: "darshan-palace" }
      ];

      // 1. Duration Experiment
      for (const city of testCities) {
        for (const days of [1, 2, 3]) {
          const res = generateStrategyItinerary({
            cityId: city.id,
            tripDays: days,
            budget: 10000,
            startingHotelId: city.hotelId,
            startTime: "08:00 AM",
            strategy: "distance-first"
          }, "distance-first");
          runs.push({
            cityId: city.id,
            days,
            budget: 10000,
            strategy: "distance-first",
            attractions: res.attractionCount,
            cost: res.totalCost,
            distance: res.totalDistanceKm,
            dijkstraCalls: res.stats.dijkstraFallbackCalls,
            runtimeMs: res.stats.executionTimeMs
          });
        }
      }

      // 2. Budget Experiment
      for (const city of testCities) {
        for (const budget of [500, 900, 1200, 1500, 3000]) {
          const res = generateStrategyItinerary({
            cityId: city.id,
            tripDays: 1,
            budget,
            startingHotelId: city.hotelId,
            startTime: "08:00 AM",
            strategy: "distance-first"
          }, "distance-first");
          runs.push({
            cityId: city.id,
            days: 1,
            budget,
            strategy: "distance-first",
            attractions: res.attractionCount,
            cost: res.totalCost,
            distance: res.totalDistanceKm,
            dijkstraCalls: res.stats.dijkstraFallbackCalls,
            runtimeMs: res.stats.executionTimeMs
          });
        }
      }

      // 3. Strategy Experiment
      const strategies: OptimizationStrategy[] = ["budget-first", "rating-first", "distance-first"];
      for (const city of testCities) {
        for (const strategy of strategies) {
          const res = generateStrategyItinerary({
            cityId: city.id,
            tripDays: 2,
            budget: 10000,
            startingHotelId: city.hotelId,
            startTime: "08:00 AM",
            strategy
          }, strategy);
          runs.push({
            cityId: city.id,
            days: 2,
            budget: 10000,
            strategy,
            attractions: res.attractionCount,
            cost: res.totalCost,
            distance: res.totalDistanceKm,
            dijkstraCalls: res.stats.dijkstraFallbackCalls,
            runtimeMs: res.stats.executionTimeMs
          });
        }
      }

      setResults(runs);
      setIsRunning(false);
    }, 300);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(results, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-8 animate-fadeIn text-charcoal">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone/30 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-stone/30 hover:bg-stone/10 transition-colors cursor-pointer"
            aria-label="Back to main app"
          >
            <ArrowLeft className="w-5 h-5 text-stone" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-gold uppercase tracking-widest font-bold">
              <Cpu className="w-4 h-4 text-gold" />
              <span>Academic Validation Suite</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-ink mt-1">Research Simulation Console</h1>
          </div>
        </div>

        <button
          onClick={runSimulationMatrix}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-ink text-salt hover:bg-gold hover:text-ink font-mono text-sm border-2 border-gold transition-colors font-bold disabled:opacity-50 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          {isRunning ? "Executing..." : "Run Simulation Matrix"}
        </button>
      </div>

      {/* Intro Banner */}
      <div className="bg-salt border border-stone/30 p-4 font-mono text-xs leading-relaxed max-w-4xl">
        <p className="font-bold mb-2 text-ink">🔬 STUDY DESCRIPTION & METHODOLOGY</p>
        <p className="text-stone">
          This Console evaluates the client-side <strong>Stepwell Routing Engine</strong>. 
          By executing multiple itineraries programmatically across various limits (Duration, Budget, and Optimization Strategy), we validate that heuristic constraint handling, Dijkstra graph nodes relaxation, and edge weight calculations behave predictably on limited data spaces ($V \le 10$).
        </p>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex justify-end gap-2.5">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-stone/30 hover:bg-stone/10 font-mono text-xs cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone" />}
              <span>{copied ? "Copied JSON!" : "Copy JSON"}</span>
            </button>
          </div>

          {/* Results Tables */}
          <div className="bg-white border border-stone/30 shadow-sm overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-ink text-salt border-b border-gold">
                  <th className="p-3 font-mono font-bold uppercase">City</th>
                  <th className="p-3 font-mono font-bold uppercase text-center">Days</th>
                  <th className="p-3 font-mono font-bold uppercase text-right">Budget Limit</th>
                  <th className="p-3 font-mono font-bold uppercase">Strategy</th>
                  <th className="p-3 font-mono font-bold uppercase text-center">Attractions</th>
                  <th className="p-3 font-mono font-bold uppercase text-right">Total Cost</th>
                  <th className="p-3 font-mono font-bold uppercase text-right">Distance</th>
                  <th className="p-3 font-mono font-bold uppercase text-center">Dijkstra Fallbacks</th>
                  <th className="p-3 font-mono font-bold uppercase text-right">Runtime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20">
                {results.map((row, idx) => (
                  <tr key={idx} className="hover:bg-salt/40 transition-colors">
                    <td className="p-3 font-bold text-ink">{row.cityId.toUpperCase()}</td>
                    <td className="p-3 text-center">{row.days}</td>
                    <td className="p-3 text-right">₹{row.budget.toLocaleString("en-IN")}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 border text-[10px] uppercase font-bold ${
                        row.strategy === "budget-first" ? "bg-emerald-50 border-emerald-300 text-emerald-800" :
                        row.strategy === "rating-first" ? "bg-amber-50 border-amber-300 text-amber-800" :
                        "bg-sky-50 border-sky-300 text-sky-800"
                      }`}>
                        {row.strategy.replace("-first", "")}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold">{row.attractions} / 4</td>
                    <td className="p-3 text-right text-emerald-700 font-bold">₹{row.cost.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right">{row.distance} km</td>
                    <td className="p-3 text-center">{row.dijkstraCalls}</td>
                    <td className="p-3 text-right text-stone">{row.runtimeMs} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
