# Team Responsibilities & Task Assignments

**Course:** CSC210 Data Structures & Algorithms — Ahmedabad University  
**Group:** Group 07  
**Project:** Heritage Tourism Planner for Gujarat  

---

## 1. Team Members & Primary Roles

- **Satvik**: Frontend / DSA Integration & UI Architecture
- **Manya**: Data Collection & Project Documentation
- **Aryan**: DSA Implementation & Backend Architecture (Once Started)
- **Sonam**: Research Experimentation, Algorithm Analysis & Testing

---

## 2. Workstream Ownership & Deliverables Matrix

| Task / Workstream | Owner | Deliverable | Dependencies | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend UI/UX & Interactive System** | **Satvik** | React 19 + Vite 6 client application, Stepwell design system, ExploreView, ItineraryView, HotelsView, What-If sliders, StrategyComparisonModal, AlgorithmStatsPanel | None | **Done** |
| **Client-Side Graph & Route Integration** | **Satvik** | Dynamic `routes.csv` parsing, short-code ID mapping (`a101`, `h101`, etc.), Dijkstra road fallback integration in `itineraryPlanner.ts` | OpenRouteService / `routes.csv` | **Done** |
| **Multi-Language Localization (UI & Data)** | **Satvik** | `translations.ts` dictionary (English, Gujarati, Hindi), language switchers, and `translate-content.ts` automation script | Google Translate API Key | **In Progress** *(Script ready; waiting on API Key)* |
| **Core Documentation & Architecture Specs** | **Manya** | Comprehensive project documentation, System Architecture, PRD, Data Collection Plan, and milestone reports | None | **Done** |
| **Attraction, Hotel & Restaurant Data Collection** | **Manya** | Verified datasets in `attractions.csv`, `hotels.csv`, `restaurants.csv`, and `destinations.ts` with honest physical demand and accessibility metadata | Gujarat Tourism, ASI, field research | **In Progress** *(3 of 8 cities complete: Somnath, Dwarka, Ahmedabad)* |
| **Data Provenance & Citation Standards** | **Manya** | Citation logging for all monument entry fees, timings, coordinates, stay types, and restaurant meal costs | Official government & tourism portals | **In Progress** *(Continuous per city)* |
| **DSA Standalone Module Extraction** | **Aryan** | Framework-agnostic TypeScript modules in `dsa/` (`Graph`, `Dijkstra` with boat bypass, `MinHeap`, `budgetAllocator`, `daySplitter`, `routeBuilder`, `Trie`, `HashTable`, `MergeSort`) | Core algorithm logic | **Done** |
| **Relational Database Design & Schema** | **Aryan** | 3NF PostgreSQL DDL, indexing scheme, and graph hydration query pipeline specifications | Data models | **Done** |
| **Express.js Backend & REST API Server** | **Aryan** | Node.js / Express backend endpoints, PostgreSQL connection pool, and server-side itinerary generation endpoints | Full data freeze & client-side baseline | **On Hold** *(Scheduled after frontend & data freeze)* |
| **Research Mode & Experimentation Framework** | **Sonam** | Dev-only `/research` view, programmatic test runner (`run-experiments.ts`), and results reporting in `Research_Experiment_Plan.md` and `experiment_results.json` | Itinerary planner engine | **Done** |
| **Algorithm Diagnostics & Bug Resolution** | **Sonam** | Hard budget cap enforcement, Bet Dwarka ferry transport mode separation, and zero-attraction travel distance fixes | Experiment output data | **Done** |
| **OpenRouteService Real Route Generation** | **Sonam** | Nearest-2-neighbor candidate pairing script (`generate-routes.ts`), boat-exclusion logic, and automated CSV + TS generation | ORS API / simulated cache | **Done** |
| **Automated Testing & Edge Case Verification** | **Sonam** | Unit tests for DSA modules, budget boundary validation, accessibility filter checking, and route continuity testing | `dsa/` modules, test runner | **In Progress** |

---

## 3. Current Project State & Milestones Overview

1. **DSA Extraction:** **Done** — Standalone modules extracted into `dsa/` directory for shared frontend and backend consumption.
2. **Research Experiments:** **Done** — 3 experimental matrices (Duration scaling, Budget scaling, Strategy comparison) completed and logged.
3. **Data Collection:** **In Progress** — 3 of 8 cities completed with verified citations and road routes (Somnath, Dwarka, Ahmedabad). 5 cities pending (Modhera, Champaner, Gir, Rann of Kutch, Saputara).
4. **Localization:** **In Progress** — UI strings catalogued; cloud translation script built and awaiting API key.
5. **Backend Service:** **On Hold** — Client-side engine operating autonomously for rapid iteration; backend planned for subsequent phase.

---

## 4. Data Collection Protocols & Compliance

1. **Validation Protocol:** All collected CSV entries must conform strictly to schema specifications in `docs/foundation/07_Data_Collection_Plan.md`.
2. **Provenance Logging:** Data collectors must log verified primary source URLs and collection timestamps.
3. **No Fabricated Data:** If a value cannot be verified with high confidence, mark it explicitly as `UNVERIFIED` or `NEEDS SOURCING` rather than estimating.
