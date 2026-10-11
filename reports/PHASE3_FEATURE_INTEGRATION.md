# Phase 3 local feature integration

Baseline executed2026-10-10: `npm run test:all:local`,18/18 gates,64 browser control groups. Evidence: `phase3-baseline-tests.json`, `backend/reports/production/browser-development.txt`, HTTP auth/destinations/trips/admin/db outputs. This baseline precedes Phase3 fixes; it is not final acceptance of those changes.

| Feature | Frontend action | API / service | Database | Current evidence/status |
|---|---|---|---|---|
| Home, featured cards, Explore | App/Hero/ExploreView navigation, search and filters | destination catalog/search; destinationSearchCache | destinations and children | Baseline verified |
| Destination/attraction information | DestinationDetailView selected entity and tabs | destination and child GET routes | destinations/attractions | Baseline verified; missing metadata remains explicit |
| Hotel categories and sorting | HotelCategoryPicker/HotelsView category, distance/price/rating | destination hotel endpoint; hotelPolicy | hotels | Baseline verified; fresh8-city category/32-scenario matrix PASS |
| Hotel selection | PlannerModal selected UUID | trip create; selectedHotel | trips/hotels | Baseline verified, no live availability provider |
| Restaurants | DestinationDetailView; planned meal stops | destination restaurants; tripPlanner | restaurants/stops | Baseline verified; known-price/route constraints |
| Registration/login/logout | AuthView/central session client | register/login/me; JWT/account middleware | users | Baseline verified incl invalid/expired credentials and protected routes |
| Guest draft/login handoff | PlannerModal/App | authenticated create after login | trips | Baseline verified; generation remains protected |
| Trip inputs and priorities | PlannerModal sliders and review | create/generate; weighted existing planner | trips/routes/catalog | Baseline verified; scores use supplied weights |
| Itinerary result/refresh | ItineraryView load | owned trip GET; saved generation snapshot | trips/stops/budgets | Baseline verified |
| What If duration/budget | WhatIfPanel explicit Save | new create/generate | new trip/stops/budget | P3-002 repair verified at1440/768/390; old record preserved |
| Budget planner | BudgetPlannerView | owned budget/read | budgets/stops | Baseline verified; P3-001 vehicle charge verified by4 actual API/persistence cases |
| Strategy comparison | StrategyComparisonModal | three real create/generate requests | trips/stops | Baseline verified; bounded heuristic, no global-optimum claim |
| Profile/history | ProfileDashboardView open/hide | owned trip list/read | trips | Baseline verified; Remove deliberately hides in session only |
| Account edits | Profile controls | no account-update API exists | none | Honest unavailable notice; no fabricated save |
| Route/map/DSA display | OfflineRouteMap/DijkstraVisualizer | saved route legs | routes/generation snapshot | Baseline verified; provenance limitations retained |
| Sharing | ShareItineraryModal | owner-authenticated trip read | trips | Baseline verified; private link, not public recipient access |
| PDF/print | ItineraryView | loaded real trip | saved snapshot | Baseline browser checks; native print dialog depends on OS |
| Admin CRUD | AdminDashboardView forms | role-protected admin controllers/models | catalog tables | Baseline API/browser verified in isolated DB |
| Images | ImageWithFallback/gallery/cards | catalog image fields and local manifest | catalog | Installed70-asset decoding and107-record validation PASS; 60 installed browser page/viewport states PASS |
| EN/HI/GU | Navbar/LanguageContext | frontend dictionaries, localized catalog fields | existing localized text | Persistence tested historically;121-key parity passes; many hardcoded controls remain |
| Offline/install/speech | service worker/PWA/voice controls | network required for authenticated APIs | none | Capability-dependent; no offline-generation claim |
| Readiness | local:demo:check | health/ready/catalog/protected endpoint + read-only SQL | migration ledger/catalog |7 checks executed and passed; no authenticated demo claim |

No standalone public attraction/hotel/restaurant detail route, bookings/payments, live room inventory, public sharing or account-update endpoint exists. Existing embedded information is preserved. Frontend-only language/theme/modal interactions are intentional. Runtime production graph excludes legacy demonstration catalogs; confirmed by baseline build audit. No new mock success responses were added.


Final installed regression: 24 hotel category/destination selections match actual API UUID sets; 9 hotel language/viewport scenarios and 3 read-only reported-budget rejection/guest handoff scenarios pass. Authenticated recovery is tested separately against an isolated database (phase3-budget-recovery.json). No live account or trip is created by installed verification.
