import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Cpu,
  CheckCircle,
  Info,
} from "lucide-react";
import { SVG_COLORS } from "../data/colors";
import { api, useApi } from "../api";

export interface GraphNode {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  distanceKm: number;
}

// Graph presentation from persisted journey legs; no synthetic catalog nodes.
export function getIntraCityGraph(dto: any): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const stops = dto?.days?.flatMap((day: any) => day.stops) ?? [];
  const unique = [...new Map<string, any>(stops.map((stop: any) => [stop.reference_id, stop])).values()];
  const nodes = unique.map((stop, index) => ({id:stop.reference_id,name:stop.name,shortName:stop.name.split(" ")[0],
    x:100 + (index % 4) * 110,y:90 + Math.floor(index / 4) * 90}));
  const edges = (dto?.trip?.generation_summary?.legs ?? []).map((leg: any) => ({from:leg.from,to:leg.to,distanceKm:Number(leg.distance_km)}));
  return {nodes,edges};
}

export interface AlgorithmStep {
  stepIndex: number;
  description: string;
  currentNodeId: string | null;
  visitedNodeIds: string[];
  frontierNodeIds: string[];
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  activeEdge: { from: string; to: string } | null;
  relaxedEdge: { from: string; to: string } | null;
  isComplete: boolean;
  finalPath: string[];
  finalDistance: number;
}

// Dijkstra Algorithm step generator
export function generateDijkstraSteps(
  startId: string = "hotel",
  targetId: string = "resto",
  nodesList: GraphNode[] = [],
  edgesList: GraphEdge[] = [],
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set<string>();

  nodesList.forEach((node) => {
    distances[node.id] = Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });

  const effectiveStart = nodesList.some((n) => n.id === startId)
    ? startId
    : nodesList[0]?.id || "hotel";
  const effectiveTarget = nodesList.some((n) => n.id === targetId)
    ? targetId
    : nodesList[nodesList.length - 1]?.id || "resto";

  distances[effectiveStart] = 0;

  const getNeighbors = (nodeId: string) => {
    const neighbors: { neighborId: string; weight: number }[] = [];
    edgesList.forEach((edge) => {
      if (edge.from === nodeId)
        neighbors.push({ neighborId: edge.to, weight: edge.distanceKm });
      else if (edge.to === nodeId)
        neighbors.push({ neighborId: edge.from, weight: edge.distanceKm });
    });
    return neighbors;
  };

  const visitedNodes: string[] = [];
  let frontierNodes: string[] = [effectiveStart];

  // Initial step
  steps.push({
    stepIndex: 0,
    description: `Initialize Dijkstra search from start node (${nodesList.find((n) => n.id === effectiveStart)?.shortName || effectiveStart}). Distance = 0 km.`,
    currentNodeId: effectiveStart,
    visitedNodeIds: [],
    frontierNodeIds: [effectiveStart],
    distances: { ...distances },
    previous: { ...previous },
    activeEdge: null,
    relaxedEdge: null,
    isComplete: false,
    finalPath: [],
    finalDistance: 0,
  });

  while (unvisited.size > 0) {
    // Select unvisited node with smallest distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach((nodeId) => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentId = nodeId;
      }
    });

    if (currentId === null || minDistance === Infinity) {
      break; // Remaining nodes unreachable
    }

    unvisited.delete(currentId);
    if (!visitedNodes.includes(currentId)) {
      visitedNodes.push(currentId);
    }
    frontierNodes = frontierNodes.filter((id) => id !== currentId);

    const currentNodeObj = nodesList.find((n) => n.id === currentId);

    steps.push({
      stepIndex: steps.length,
      description: `Evaluate node [${currentNodeObj?.shortName || currentId}] (shortest distance so far = ${distances[currentId]} km).`,
      currentNodeId: currentId,
      visitedNodeIds: [...visitedNodes],
      frontierNodeIds: [...frontierNodes],
      distances: { ...distances },
      previous: { ...previous },
      activeEdge: null,
      relaxedEdge: null,
      isComplete: false,
      finalPath: [],
      finalDistance: 0,
    });

    // Check if target reached
    if (currentId === effectiveTarget) {
      break;
    }

    // Examine neighbors
    const neighbors = getNeighbors(currentId);
    for (const { neighborId, weight } of neighbors) {
      if (unvisited.has(neighborId)) {
        if (!frontierNodes.includes(neighborId)) {
          frontierNodes.push(neighborId);
        }

        const alt = distances[currentId] + weight;
        const neighborObj = nodesList.find((n) => n.id === neighborId);

        steps.push({
          stepIndex: steps.length,
          description: `Examine edge (${currentNodeObj?.shortName} → ${neighborObj?.shortName}): distance ${distances[currentId]} + ${weight} = ${alt} km.`,
          currentNodeId: currentId,
          visitedNodeIds: [...visitedNodes],
          frontierNodeIds: [...frontierNodes],
          distances: { ...distances },
          previous: { ...previous },
          activeEdge: { from: currentId, to: neighborId },
          relaxedEdge: null,
          isComplete: false,
          finalPath: [],
          finalDistance: 0,
        });

        if (alt < distances[neighborId]) {
          distances[neighborId] = alt;
          previous[neighborId] = currentId;

          steps.push({
            stepIndex: steps.length,
            description: `Relax edge! New shortest path to [${neighborObj?.shortName}] updated to ${alt} km.`,
            currentNodeId: currentId,
            visitedNodeIds: [...visitedNodes],
            frontierNodeIds: [...frontierNodes],
            distances: { ...distances },
            previous: { ...previous },
            activeEdge: { from: currentId, to: neighborId },
            relaxedEdge: { from: currentId, to: neighborId },
            isComplete: false,
            finalPath: [],
            finalDistance: 0,
          });
        }
      }
    }
  }

  // Construct final path
  const finalPath: string[] = [];
  let curr: string | null = effectiveTarget;
  if (distances[effectiveTarget] !== Infinity) {
    while (curr) {
      finalPath.unshift(curr);
      curr = previous[curr];
    }
  }

  const finalDist =
    distances[effectiveTarget] !== Infinity ? distances[effectiveTarget] : 0;

  steps.push({
    stepIndex: steps.length,
    description: `Dijkstra search complete! Shortest path identified (${finalDist} km).`,
    currentNodeId: null,
    visitedNodeIds: [...visitedNodes],
    frontierNodeIds: [],
    distances: { ...distances },
    previous: { ...previous },
    activeEdge: null,
    relaxedEdge: null,
    isComplete: true,
    finalPath,
    finalDistance: Math.round(finalDist * 10) / 10,
  });

  return steps;
}

interface DijkstraVisualizerProps {
  tripId?: string;
  cityId?: string;
  startNodeId?: string;
  targetNodeId?: string;
}

export const DijkstraVisualizer: React.FC<DijkstraVisualizerProps> = ({
  cityId,
  tripId,
  startNodeId,
  targetNodeId,
}) => {
  const request = useApi(signal => api.trip(tripId ?? "", signal), [tripId]);
  const intraGraph = getIntraCityGraph(request.data);
  const activeNodes = intraGraph.nodes;
  const activeEdges = intraGraph.edges;

  const [startId, setStartId] = useState<string>(
    startNodeId || activeNodes[0]?.id || "hotel",
  );
  const [targetId, setTargetId] = useState<string>(
    targetNodeId || activeNodes[activeNodes.length - 1]?.id || "resto",
  );

  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasReducedMotion, setHasReducedMotion] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setHasReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHasReducedMotion(e.matches);
    };

    mediaQuery.addEventListener?.("change", handleChange);
    return () => mediaQuery.removeEventListener?.("change", handleChange);
  }, []);

  useEffect(() => {
    setStartId(startNodeId || activeNodes[0]?.id || "");
    setTargetId(targetNodeId || activeNodes.at(-1)?.id || "");
  }, [request.data]);
  // Regenerate steps when start, target or city changes
  useEffect(() => {
    if(!activeNodes.length || !activeEdges.length) { setSteps([]); return; }
    const generated = generateDijkstraSteps(
      startId,
      targetId,
      activeNodes,
      activeEdges,
    );
    setSteps(generated);

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      // If reduced motion, jump straight to final step
      setCurrentStepIndex(generated.length - 1);
      setIsPlaying(false);
    } else {
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [startId, targetId, cityId, request.data]);

  // Handle Playback Timer
  useEffect(() => {
    if (isPlaying && steps.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prevIndex) => {
          if (prevIndex >= steps.length - 1) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return prevIndex;
          }
          return prevIndex + 1;
        });
      }, 700);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps]);

  const currentStep = steps[currentStepIndex] || steps[0];

  const handlePlayPause = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (hasReducedMotion) {
      setCurrentStepIndex(steps.length - 1);
    } else {
      setCurrentStepIndex(0);
    }
  };

  if(request.loading) return <p role="status">Loading saved route legs...</p>;
  if(request.error) return <p role="alert">{request.error} <button onClick={request.reload}>Retry</button></p>;
  if (!currentStep) return <p role="status">No persisted travel legs are available to visualize.</p>;

  // Format final path display names
  const pathNames = currentStep.finalPath.map((id) => {
    const n = activeNodes.find((node) => node.id === id);
    return n ? n.shortName : id;
  });

  return (
    <div className="bg-white border-2 border-gold p-4 sm:p-5 space-y-4 shadow-sm relative font-mono text-xs">
      {/* Top Header & Framing Caption */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone/30 pb-3">
        <div>
          <div className="flex items-center gap-2 text-gold uppercase tracking-wider text-[11px] font-bold">
            <Cpu className="w-4 h-4 text-gold" />
            <span>Dijkstra Shortest-Path Algorithm Engine</span>
          </div>
          <h4 className="font-display text-lg text-ink font-bold">
            Live Graph Execution Matrix
          </h4>
        </div>

        {/* Start / Target Selector */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-stone font-bold uppercase">Route:</span>
          <select
            value={startId}
            onChange={(e) => setStartId(e.target.value)}
            aria-label="Select start node for route calculation"
            className="bg-salt border border-stone/40 text-charcoal font-mono px-2 py-1 text-[11px] outline-none"
          >
            {activeNodes.map((n) => (
              <option key={n.id} value={n.id}>
                Start: {n.shortName}
              </option>
            ))}
          </select>
          <span className="text-madder font-bold">→</span>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            aria-label="Select target node for route calculation"
            className="bg-salt border border-stone/40 text-charcoal font-mono px-2 py-1 text-[11px] outline-none"
          >
            {activeNodes.map((n) => (
              <option key={n.id} value={n.id}>
                Target: {n.shortName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-[11px] font-body text-stone italic border-l-2 border-gold pl-2">
        "Dijkstra finds the shortest path between two attractions when they
        aren't directly connected -- most stops in your route are direct, this
        shows what happens when one isn't."
      </p>

      {/* Reduced Motion Warning Note */}
      {hasReducedMotion && (
        <div className="p-2.5 bg-ink text-salt border border-stone/40 text-[11px] flex items-center gap-2">
          <Info className="w-4 h-4 text-gold shrink-0" />
          <span>
            Animation reduced per your system settings. Displaying computed
            final shortest path directly.
          </span>
        </div>
      )}

      {/* SVG GRAPH CANVAS */}
      <div className="bg-salt/90 border-2 border-stone/30 relative h-[320px] sm:h-[350px] w-full overflow-auto p-2 shadow-inner">
        <div className="absolute inset-0 bg-stepwell-pattern opacity-10 pointer-events-none" />

        <svg
          className="w-full h-full"
          viewBox="0 0 500 360"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Interactive Dijkstra Graph Visualization"
        >
          {/* 1. DRAW ALL GRAPH EDGES */}
          {activeEdges.map((edge, edgeIndex) => {
            const fromNode = activeNodes.find((n) => n.id === edge.from);
            const toNode = activeNodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            // Check if this edge is part of the final shortest path
            const isInFinalPath =
              currentStep.isComplete &&
              currentStep.finalPath.some((id, idx) => {
                if (idx === currentStep.finalPath.length - 1) return false;
                const nextId = currentStep.finalPath[idx + 1];
                return (
                  (id === edge.from && nextId === edge.to) ||
                  (id === edge.to && nextId === edge.from)
                );
              });

            // Check if edge is currently active/relaxed
            const isActive =
              currentStep.activeEdge &&
              ((currentStep.activeEdge.from === edge.from &&
                currentStep.activeEdge.to === edge.to) ||
                (currentStep.activeEdge.from === edge.to &&
                  currentStep.activeEdge.to === edge.from));

            const isRelaxed =
              currentStep.relaxedEdge &&
              ((currentStep.relaxedEdge.from === edge.from &&
                currentStep.relaxedEdge.to === edge.to) ||
                (currentStep.relaxedEdge.from === edge.to &&
                  currentStep.relaxedEdge.to === edge.from));

            let strokeColor: string = SVG_COLORS.stone; // default neutral stone
            let strokeWidth = 1.5;
            let strokeDash = "4 3";

            if (isInFinalPath) {
              strokeColor = SVG_COLORS.madder; // Madder Red solid
              strokeWidth = 3.5;
              strokeDash = "none";
            } else if (isRelaxed || isActive) {
              strokeColor = SVG_COLORS.madder; // Highlight edge in Madder Red
              strokeWidth = 3;
              strokeDash = "none";
            }

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            return (
              <g key={`${edge.from}-${edge.to}-${edgeIndex}`}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                  className="transition-all duration-300"
                />

                {/* Distance Label Badge */}
                <rect
                  x={midX - 14}
                  y={midY - 8}
                  width="28"
                  height="14"
                  fill={SVG_COLORS.salt}
                  stroke={SVG_COLORS.stone}
                  rx="2"
                />
                <text
                  x={midX}
                  y={midY + 3}
                  textAnchor="middle"
                  fill={SVG_COLORS.charcoal}
                  fontSize="8"
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight="600"
                >
                  {edge.distanceKm}k
                </text>
              </g>
            );
          })}

          {/* 2. DRAW GRAPH NODES */}
          {activeNodes.map((node) => {
            const isStart = node.id === startId;

            const isCurrent = currentStep.currentNodeId === node.id;
            const isVisited = currentStep.visitedNodeIds.includes(node.id);
            const isFrontier = currentStep.frontierNodeIds.includes(node.id);
            const isInFinalPath =
              currentStep.isComplete && currentStep.finalPath.includes(node.id);

            let fillColor: string = SVG_COLORS.white; // default
            let strokeColor: string = SVG_COLORS.stone;
            let textColor: string = SVG_COLORS.charcoal;
            let isPulsing = false;

            if (isCurrent) {
              fillColor = SVG_COLORS.gold; // Stepwell Gold highlight for active node
              strokeColor = SVG_COLORS.ink;
              textColor = SVG_COLORS.ink;
            } else if (isInFinalPath) {
              fillColor = SVG_COLORS.madder; // Madder Red for path
              strokeColor = SVG_COLORS.gold;
              textColor = SVG_COLORS.white;
            } else if (isVisited) {
              fillColor = SVG_COLORS.ink; // Ink Indigo for visited
              strokeColor = SVG_COLORS.gold;
              textColor = SVG_COLORS.salt;
            } else if (isFrontier) {
              fillColor = SVG_COLORS.stone; // Stone Grey for frontier
              strokeColor = SVG_COLORS.gold;
              textColor = SVG_COLORS.charcoal;
              isPulsing = true;
            } else if (isStart) {
              fillColor = SVG_COLORS.gold;
              strokeColor = SVG_COLORS.ink;
            }

            const distVal = currentStep.distances[node.id];
            const distLabel = distVal === Infinity ? "∞" : `${distVal}k`;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="transition-all duration-300 cursor-pointer"
              >
                {/* Outer Pulse Circle if Frontier */}
                {isPulsing && !hasReducedMotion && (
                  <circle
                    r="18"
                    fill="none"
                    stroke={SVG_COLORS.gold}
                    strokeWidth="1.5"
                    className="animate-ping opacity-60"
                  />
                )}

                {/* Node Circle */}
                <circle
                  r="14"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isCurrent || isInFinalPath ? "3" : "2"}
                  className="transition-colors duration-300 shadow-md"
                />

                {/* Node Label Text */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill={textColor}
                  fontSize="9"
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight="bold"
                >
                  {node.shortName.substring(0, 3).toUpperCase()}
                </text>

                {/* Node Title & Distance Subtitle */}
                <text
                  textAnchor="middle"
                  y="26"
                  fill={SVG_COLORS.charcoal}
                  fontSize="9"
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight="bold"
                >
                  {node.shortName}
                </text>
                <text
                  textAnchor="middle"
                  y="36"
                  fill={SVG_COLORS.madder}
                  fontSize="8"
                  fontFamily="IBM Plex Mono, monospace"
                  fontWeight="600"
                >
                  [{distLabel}]
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Step Description Line */}
      <div
        aria-live="polite"
        className="p-3 bg-ink text-salt border border-gold text-xs flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="bg-gold text-ink font-bold px-2 py-0.5 text-[10px] uppercase shrink-0">
            Step {currentStepIndex + 1}/{steps.length}
          </span>
          <span className="truncate text-stone text-[11px]">
            {currentStep.description}
          </span>
        </div>
        {currentStep.isComplete && (
          <span className="text-gold font-bold flex items-center gap-1 shrink-0 text-[11px]">
            <CheckCircle className="w-3.5 h-3.5 text-gold" />
            <span>Path Found</span>
          </span>
        )}
      </div>

      {/* Final Shortest Path Summary Line */}
      {currentStep.isComplete && currentStep.finalPath.length > 0 && (
        <div className="p-3 bg-madder/10 border border-madder text-ink font-mono text-xs font-bold flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-madder uppercase font-bold text-[10px] bg-madder text-salt px-2 py-0.5">
              Shortest Path
            </span>
            <span>{pathNames.join(" → ")}</span>
          </div>
          <div className="text-madder text-sm">
            · {currentStep.finalDistance} km
          </div>
        </div>
      )}

      {/* PLAYBACK CONTROLS: Play, Pause, Step Forward, Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone/30">
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            aria-label={
              isPlaying
                ? "Pause algorithm execution"
                : "Play algorithm execution"
            }
            className="bg-ink hover:bg-ink/90 text-salt border border-gold px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-gold" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-gold" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Step Forward Button */}
          <button
            onClick={handleStepForward}
            disabled={currentStepIndex >= steps.length - 1}
            aria-label="Step forward to next step"
            className="bg-salt hover:bg-stone/20 text-charcoal border border-stone/40 px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
          >
            <SkipForward className="w-3.5 h-3.5 text-ink" />
            <span>Step forward</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            aria-label="Reset algorithm to step 1"
            className="bg-salt hover:bg-stone/20 text-charcoal border border-stone/40 px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone" />
            <span>Reset</span>
          </button>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block border border-ink" />{" "}
            Start/Current
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-stone/50 inline-block border border-gold" />{" "}
            Frontier
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-ink inline-block border border-gold" />{" "}
            Visited
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-madder inline-block border border-gold" />{" "}
            Path
          </span>
        </div>
      </div>
    </div>
  );
};
