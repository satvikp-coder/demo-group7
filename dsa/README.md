# Data Structures & Algorithms (DSA) Engine

**Status:** SPECIFIED (See `docs/foundation/04_DSA_Architecture.md`)

This directory contains standalone, pure TypeScript Data Structures and Algorithm implementations powering the intra-city trip planner. Decoupled from backend routes for independent testing and academic evaluation.

## Modules Breakdown
- `graph/` — Weighted Adjacency List for intra-city road networks
- `dijkstra/` — Fallback shortest path algorithm (intra-city only)
- `priorityQueue/` — Shared Min-Heap powering Dijkstra and recommendation ranking
- `trie/` — Unified Prefix Trie for city & attraction search autocomplete
- `hashTable/` — Application-level Entity Hash Table for $O(1)$ city data caching
- `greedy/` — Nearest-neighbor circular route, time-budget day split, and budget allocation
- `sorting/` — Manual Merge Sort implementation for display rankings
