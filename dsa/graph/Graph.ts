export interface GraphEdge {
  to: string;
  distanceKm: number;
  travelTimeMinutes: number;
  transportMode: "road" | "boat" | "other";
}

export interface GraphNode {
  id: string;
  lat: number;
  lng: number;
  transportMode?: "road" | "boat" | "other";
}

export class Graph {
  private adjacencyList: Map<string, GraphEdge[]> = new Map();
  private nodes: Map<string, GraphNode> = new Map();

  public addNode(id: string, lat: number, lng: number, transportMode?: "road" | "boat" | "other"): void {
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
    this.nodes.set(id, { id, lat, lng, transportMode });
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  public addEdge(
    from: string,
    to: string,
    distanceKm: number,
    travelTimeMinutes: number,
    transportMode: "road" | "boat" | "other" = "road"
  ): void {
    if (!this.adjacencyList.has(from)) {
      this.addNode(from, 0, 0);
    }
    if (!this.adjacencyList.has(to)) {
      this.addNode(to, 0, 0);
    }

    // Check if edge already exists to prevent duplicates
    const edges = this.adjacencyList.get(from)!;
    const exists = edges.some(e => e.to === to && e.transportMode === transportMode);
    if (!exists) {
      edges.push({
        to,
        distanceKm,
        travelTimeMinutes,
        transportMode
      });
    }
  }

  public getNeighbors(id: string): GraphEdge[] {
    return this.adjacencyList.get(id) || [];
  }

  public getAllNodes(): string[] {
    return Array.from(this.nodes.keys());
  }

  public getAdjacencyList(): Map<string, GraphEdge[]> {
    return this.adjacencyList;
  }
}

export interface RouteRow {
  source_attraction_id: string;
  destination_attraction_id: string;
  distance_km: number;
  travel_time_minutes: number;
  transport_mode?: "road" | "boat" | "other";
}

export function loadGraphFromRoutes(rows: RouteRow[]): Graph {
  const graph = new Graph();
  for (const row of rows) {
    const transport = row.transport_mode || "road";
    graph.addEdge(
      row.source_attraction_id,
      row.destination_attraction_id,
      row.distance_km,
      row.travel_time_minutes,
      transport
    );
    // Add reverse edge for undirected routes
    graph.addEdge(
      row.destination_attraction_id,
      row.source_attraction_id,
      row.distance_km,
      row.travel_time_minutes,
      transport
    );
  }
  return graph;
}
