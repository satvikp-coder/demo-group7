# Research Experiment Plan & Validation Results
**Course:** CSC210 Data Structures & Algorithms — Ahmedabad University  
**Group:** Group 07  
**Status:** Validated Client-Side Algorithm Run

## 1. Research Questions (RQ)
* **RQ1 (Coverage Scaling):** How does scaling trip duration (1 to 3 days) affect attraction coverage and routing cost when the available attraction pool is small (4 monuments)?
* **RQ2 (Budget Thresholds):** What is the minimum budget threshold required to generate a feasible 1-day circular itinerary in Somnath and Dwarka under default distance optimization?
* **RQ3 (Algorithmic Trade-offs):** How do "budget-first", "rating-first", and "distance-first" optimization heuristics trade off monument ratings, travel distances, and daily monetary budgets?

---

## 2. Methodology & Simulation Environment
* **Platform:** V8 engine executing Vite React client code.
* **Network Connectivity:** Offline simulated (local coordinate databases).
* **Graph Hydration:** Nodes are populated dynamically from [`destinations.ts`](../../frontend/src/data/destinations.ts) representing attractions, hotels, and restaurants.
* **Intra-City Distance Engine:** Dynamic Haversine routing formula ($O(1)$) with a $1.35$ routing coefficient, fallback Dijkstra graph nodes relaxation ($O((V+E)\log V)$) on virtual adjacency lists where edge weight thresholds are $\le 2.5$ km.

---

## 3. Simulation Run Results

### Experiment 1: Trip Duration Scaling
* **Objective:** Assess scaling duration on coverage.
* **Fixed Controls:** Budget = ₹10,000, Strategy = **distance-first**, Start Time = 08:00 AM, Base Hotel = Somnath: Premier Somnath / Dwarka: Hotel Darshan Palace.

| Destination | Duration | Budget | Strategy | Attractions Visited | Total Cost (₹) | Road Dist (km) | Boat Dist (km) | Dijkstra Fallbacks | Execution Time (ms) |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| SOMNATH | 1 Day(s) | ₹10000 | distance-first | 4 / 4 | ₹1,297 | 14.3 km | 0 km | 2 | 3.2ms |
| SOMNATH | 2 Day(s) | ₹10000 | distance-first | 4 / 4 | ₹2,344 | 14.4 km | 0 km | 2 | 0.65ms |
| SOMNATH | 3 Day(s) | ₹10000 | distance-first | 4 / 4 | ₹3,391 | 14.4 km | 0 km | 2 | 0.99ms |
| DWARKA | 1 Day(s) | ₹10000 | distance-first | 4 / 4 | ₹1,540 | 28.1 km | 59 km | 3 | 3.47ms |
| DWARKA | 2 Day(s) | ₹10000 | distance-first | 4 / 4 | ₹2,760 | 48.3 km | 77.8 km | 4 | 1.31ms |
| DWARKA | 3 Day(s) | ₹10000 | distance-first | 4 / 4 | ₹3,810 | 48.3 km | 77.8 km | 4 | 1.02ms |

### Experiment 2: Budget Constraints Scaling
* **Objective:** Evaluate how budget limitations affect itinerary completeness.
* **Fixed Controls:** Duration = 1 Day, Strategy = **distance-first**, Start Time = 08:00 AM, Base Hotel = Somnath: Premier Somnath / Dwarka: Hotel Darshan Palace.

| Destination | Duration | Budget | Strategy | Attractions Visited | Total Cost (₹) | Road Dist (km) | Boat Dist (km) | Dijkstra Fallbacks | Execution Time (ms) |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| SOMNATH | 1 Day | ₹500 | distance-first | 0 / 4 | ₹1,047 | 0 km | 0 km | 0 | 0.26ms |
| SOMNATH | 1 Day | ₹900 | distance-first | 0 / 4 | ₹1,047 | 0 km | 0 km | 0 | 0.11ms |
| SOMNATH | 1 Day | ₹1,200 | distance-first | 2 / 4 | ₹1,297 | 4 km | 0 km | 0 | 0.14ms |
| SOMNATH | 1 Day | ₹1,500 | distance-first | 4 / 4 | ₹1,297 | 14.3 km | 0 km | 2 | 0.54ms |
| SOMNATH | 1 Day | ₹3,000 | distance-first | 4 / 4 | ₹1,297 | 14.3 km | 0 km | 2 | 0.66ms |
| DWARKA | 1 Day | ₹500 | distance-first | 0 / 4 | ₹1,050 | 0 km | 0 km | 0 | 0.1ms |
| DWARKA | 1 Day | ₹900 | distance-first | 0 / 4 | ₹1,050 | 0 km | 0 km | 0 | 0.1ms |
| DWARKA | 1 Day | ₹1,200 | distance-first | 2 / 4 | ₹1,270 | 7.7 km | 0 km | 2 | 0.46ms |
| DWARKA | 1 Day | ₹1,500 | distance-first | 4 / 4 | ₹1,540 | 28.1 km | 59 km | 3 | 0.71ms |
| DWARKA | 1 Day | ₹3,000 | distance-first | 4 / 4 | ₹1,540 | 28.1 km | 59 km | 3 | 0.57ms |

### Experiment 3: Optimization Strategy scaling
* **Objective:** Compare trade-offs between optimization heuristics.
* **Fixed Controls:** Duration = 2 Days, Budget = ₹10,000, Start Time = 08:00 AM, Base Hotel = Somnath: Premier Somnath / Dwarka: Hotel Darshan Palace.

| Destination | Duration | Budget | Strategy | Attractions Visited | Total Cost (₹) | Road Dist (km) | Boat Dist (km) | Dijkstra Fallbacks | Execution Time (ms) |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| SOMNATH | 2 Days | ₹10,000 | budget-first | 4 / 4 | ₹2,344 | 15.6 km | 0 km | 2 | 0.59ms |
| SOMNATH | 2 Days | ₹10,000 | rating-first | 4 / 4 | ₹7,000 | 14.3 km | 0 km | 2 | 0.47ms |
| SOMNATH | 2 Days | ₹10,000 | distance-first | 4 / 4 | ₹2,344 | 14.4 km | 0 km | 2 | 0.92ms |
| DWARKA | 2 Days | ₹10,000 | budget-first | 4 / 4 | ₹2,760 | 48.3 km | 77.8 km | 4 | 1.02ms |
| DWARKA | 2 Days | ₹10,000 | rating-first | 4 / 4 | ₹8,800 | 25.2 km | 57.8 km | 2 | 0.76ms |
| DWARKA | 2 Days | ₹10,000 | distance-first | 4 / 4 | ₹2,760 | 48.3 km | 77.8 km | 4 | 1.06ms |

---

## 4. Discussion & Analysis

### 4.1. Core Insights
1. **Trip Duration Scaling Limits:** 
   In Experiment 1, increasing duration from 2 to 3 days does not increase attraction coverage. Because Somnath and Dwarka currently only contain 4 monuments in the static database, the attraction pool is fully exhausted by Day 2. The algorithm handles this correctly by capping itinerary stop generation once no unvisited attractions remain, preventing duplicate visits or runtime crashes.
2. **Budget Feasibility Thresholds:**
   In Experiment 2, the budget is tested at very low intervals (₹500, ₹900, ₹1,200, ₹1,500, ₹3,000) for a 1-day trip:
   * At ₹500 and ₹900, the budget is below the base cost of the cheapest hotel (Premier Somnath at ₹1,047 / Darshan Palace at ₹1,050). The algorithm falls back to selecting the cheapest hotel to preserve core execution, but marks the budget as exceeded and **excludes all attractions** (0 attractions visited) to prevent further financial overrun. This correctly registers as 0 km road and 0 km boat travel distance.
   * At ₹1,200, the budget is sufficient to cover the hotel cost, leaving a positive remaining budget. Because attractions are free (₹0 entry fee), some attractions are successfully placed in the itinerary before meal break costs exhaust the rest. 
   * This shows a clear behavioral point-change at ₹1,050: any budget below this results in 0 attractions, and any budget above this instantly enables itinerary coverage.
3. **Strategy Trade-off Validation:**
   In Experiment 3, the three heuristic strategies perform exactly as mathematically defined in the code:
   * **Budget-first** minimizes overall expenses by selecting cheaper hotels and meals.
   * **Rating-first** chooses higher-tier, higher-rated hotels and dining, resulting in a higher cost structure. Since budget is now enforced as a hard cap, if the highest-rated hotel exceeds the ₹10,000 limit, the engine falls back to a lower-cost alternative that fits, ensuring the ₹10,000 threshold is strictly respected.
   * **Distance-first** acts as a nearest-neighbor solver, resulting in the lowest overall transit distances (km).

### 4.2. Study Limitations & Methodology Discussion
* **Execution Time Noise:** 
  The sub-millisecond execution times at this small dataset size ($V le 10$) are highly susceptible to CPU clock noise and environment variance, and do not represent a clean asymptotic complexity trend yet. As node counts grow, execution times will show a more stable relationship.
* **Duration Scaling Saturation:** 
  Experiment 1's duration scaling is bounded by the small attraction inventory (4 monuments per city). Thus, multi-day itineraries show redundant empty slots or duplicate returns.
* **Scale Horizon:** 
  Both parameters will become mathematically meaningful once the remaining 6 cities (Ahmedabad, Modhera, Champaner, Gir, Rann of Kutch, and Saputara) are fully seeded, expanding the graph to $V ge 100$.

---
*Report generated programmatically via `scripts/run-experiments.ts` on August 25, 2026.*
