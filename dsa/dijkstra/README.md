# Dijkstra Shortest Path Module (`dsa/dijkstra/`)

**Implementation:** `DijkstraSolver.ts`  
**Description:** Fallback shortest-path solver ($O((V+E)\log V)$). Operates **strictly within a single city** to compute the shortest road path between non-adjacent attractions.

> [!IMPORTANT]
> **Role Note:** Dijkstra does **NOT** build the overall itinerary or decide attraction visiting order. It is a supporting utility function invoked by the Greedy route builder when direct road connections are missing.
