# Repository Structure & Development Roadmap

**Course:** CSC210 Data Structures & Algorithms — Ahmedabad University  
**Group:** Group 07  
**Status:** Target Architectural Layout & Implementation Status Tracker

---

## Repository Layout & Status Markers

```
group-07-heritage-tourism-planner/
│
├── frontend/                          [BUILT — see 05_Frontend_Documentation.md]
│   ├── src/
│   │   ├── components/                # React components (Navbar, Hero, ExploreView, PlannerModal,
│   │   │                               # ItineraryView, DijkstraVisualizer, BudgetPlannerView,
│   │   │                               # HotelsView, AdminDashboardView, etc.)
│   │   ├── data/
│   │   │   ├── destinations.ts        # 8 cities, mock/real data, single source of truth
│   │   │   └── colors.ts              # DESIGN_TOKENS / SVG_COLORS — Stepwell palette
│   │   ├── App.tsx                    # Main app state & routing
│   │   └── main.tsx                   # React entry point
│   ├── index.html
│   ├── package.json                   # Verified package dependencies (React 19, Vite 6, Tailwind v4)
│   └── vite.config.ts                 # Clean Vite 6 configuration
│
├── backend/                           [PLANNED NEXT PHASE]
│   ├── routes/
│   │   ├── authRoutes.js              # Authentication endpoints
│   │   ├── destinationRoutes.js       # City lookups
│   │   ├── attractionRoutes.js        # Attraction lookups
│   │   ├── hotelRoutes.js             # Hotel recommendations
│   │   ├── restaurantRoutes.js        # Restaurant options
│   │   ├── tripRoutes.js              # Itinerary generation API
│   │   ├── budgetRoutes.js            # Financial tracking
│   │   └── adminRoutes.js             # Tour Operator CMS endpoints
│   ├── controllers/
│   ├── services/
│   │   ├── itineraryService.js        # Calls dsa/greedy + dsa/dijkstra
│   │   ├── searchService.js           # Calls dsa/trie
│   │   └── lookupService.js           # Calls dsa/hashTable
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── package.json
│   └── server.js
│
├── dsa/                                [SPECIFIED — see 04_DSA_Architecture.md]
│   ├── graph/                          # AdjacencyListGraph (built per-city per-request)
│   ├── dijkstra/                       # Fallback DijkstraSolver (intra-city only)
│   ├── priorityQueue/                  # Shared MinHeap: Dijkstra + recommendation ranking
│   ├── trie/                           # Unified PrefixTrie (city + attraction search)
│   ├── hashTable/                      # EntityHashTable (confirmed-city lookup cache)
│   ├── greedy/                         # GreedyRouteBuilder, TimeBudgetSplitter, BudgetAllocator
│   └── sorting/                        # Manual MergeSorter implementation
│
├── database/                           [SCHEMA DESIGNED — see 06_Database_Design.md]
│   ├── schema/
│   │   └── schema.sql                  # Production 3NF PostgreSQL DDL
│   ├── seeds/
│   │   └── somnath_dwarka_seed.sql     # Real verified seed data for Somnath & Dwarka
│   └── migrations/                     # Database migrations
│
├── data/                               [PARTIAL — Somnath/Dwarka verified, 6 cities pending]
│   ├── raw/                            # Unprocessed data source files
│   ├── cleaned/                        # Standardized data files
│   ├── attractions.csv                 # Somnath + Dwarka verified; 6 cities pending
│   ├── hotels.csv                      # Somnath + Dwarka verified; 6 cities pending
│   ├── restaurants.csv                 # Target 2-4 per city
│ ├── routes.csv # INTRA-CITY ONLY (attraction-to-attraction pairs within city)
│   └── CHANGELOG.md                    # Dataset versioning log (see 07_Data_Collection_Plan.md)
│
├── docs/                               [COMPLETE — Foundation Suite 00-07]
│   ├── foundation/
│   │   ├── 00_Foundation_Audit.md      [DONE]
│   │   ├── 01_Project_Proposal.md      [DONE — 20 sections + RQs]
│   │   ├── 02_Requirements_Specification.md [DONE — SRS + 22 FRs + NFRs]
│   │   ├── 03_System_Architecture.md   [DONE — Mermaid architecture & ERD]
│   │   ├── 04_DSA_Architecture.md      [DONE — Algorithmic specifications & proofs]
│   │   ├── 05_Frontend_Documentation.md [DONE — React 19 + Stepwell design system]
│   │   ├── 06_Database_Design.md       [DONE — PostgreSQL 3NF DDL & indexes]
│   │   └── 07_Data_Collection_Plan.md  [DONE — CSV schemas & collection phases]
│   ├── diagrams/                       # Standalone Mermaid diagrams (.mmd)
│   └── TEAM_RESPONSIBILITIES.md        [DONE — Workstream ownership matrix]
│
├── tests/                               [PLANNED]
│   ├── frontend/                       # React component & unit tests
│   ├── backend/                        # API & service integration tests
│   └── dsa/                            # DSA correctness & performance benchmarks
│
├── .gitignore
├── LICENSE                             # MIT License
└── README.md                           # Master Project Documentation
```

---

## Git Branching Strategy

For efficient group collaboration:
- **`main`**: Production-ready, demo-capable baseline codebase.
- **`frontend`**: Frontend UI enhancements, component updates, and future API integration.
- **`backend`**: Express.js REST API, database connection pool, and controller logic.
- **`dsa`**: Standalone TypeScript DSA module implementations and benchmark tests.
- **`docs`**: Documentation updates and data collection maintenance.

---

## Key Structural Rules

1. **Standalone `dsa/` Directory:** The `dsa/` folder is decoupled from `backend/services/`. This architecture proves to evaluators that DSA modules are real, standalone, independently testable algorithms rather than logic hidden inside route handlers.
2. **`data/routes.csv` Priority Gap:** The `data/routes.csv` file records intra-city road distances between attraction pairs within each destination city. It is explicitly tracked as the top data collection priority in `07_Data_Collection_Plan.md`.
3. **Foundation Documentation:** All core academic documentation resides cleanly under `docs/foundation/` with sequential numbering (00–07).
