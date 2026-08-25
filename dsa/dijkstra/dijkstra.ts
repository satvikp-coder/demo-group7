import { Graph } from "../graph/Graph";
import { MinHeap } from "../priorityQueue/MinHeap";

export interface DijkstraResult {
  path: string[];
  distanceKm: number;
  nodesVisited: number;
  edgesRelaxed: number;
}

export function dijkstra(
  graph: Graph,
  startId: string,
  endId: string
): DijkstraResult {
  const dists: Map<string, number> = new Map();
  const prev: Map<string, string | null> = new Map();
  const allNodes = graph.getAllNodes();

  for (const node of allNodes) {
    dists.set(node, Infinity);
    prev.set(node, null);
  }
  dists.set(startId, 0);

  const minHeap = new MinHeap<{ nodeId: string; dist: number }>(
    (a, b) => a.dist - b.dist
  );
  minHeap.insert({ nodeId: startId, dist: 0 });

  let nodesVisited = 0;
  let edgesRelaxed = 0;
  const visitedSet = new Set<string>();

  while (!minHeap.isEmpty()) {
    const curr = minHeap.extractMin()!;
    const u = curr.nodeId;
    const d = curr.dist;

    if (visitedSet.has(u)) continue;
    visitedSet.add(u);
    nodesVisited++;

    if (u === endId) break;

    const neighbors = graph.getNeighbors(u);
    for (const edge of neighbors) {
      edgesRelaxed++;
      const alt = d + edge.distanceKm;
      const currentBest = dists.get(edge.to) ?? Infinity;
      if (alt < currentBest) {
        dists.set(edge.to, alt);
        prev.set(edge.to, u);
        minHeap.insert({ nodeId: edge.to, dist: alt });
      }
    }
  }

  const path: string[] = [];
  let current: string | null = endId;
  while (current !== null) {
    path.unshift(current);
    current = prev.get(current) ?? null;
  }

  const finalDist = dists.get(endId) ?? Infinity;

  return {
    path: path[0] === startId ? path : [],
    distanceKm: finalDist === Infinity ? 0 : finalDist,
    nodesVisited,
    edgesRelaxed,
  };
}
