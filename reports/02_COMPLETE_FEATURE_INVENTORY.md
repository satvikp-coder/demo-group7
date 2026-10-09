# Complete feature inventory

Evidence: current isolated HTTP/control suites, image city journeys and targeted before/after regressions. Static trace alone does not verify native OS behavior or public deployment. Individual controls are enumerated in tests/frontend/completion_*.py and backend HTTP suites.

| Feature | Frontend | Backend | Database | Expected Behavior | Verification Status | Issue |
|---|---|---|---|---|---|---|
| Home / Explore / featured cards | App,Hero,ExploreView,FeaturedDestinations | GET destinations/catalog | destinations + child catalog | Render real catalog, search/filter and navigate | VERIFIED_WORKING | See test evidence and scope limitations |
| Destination details / attraction information | DestinationDetailView | GET destinations/:id and children | destinations,attractions | Correct selected entity and associated records | VERIFIED_WORKING | See test evidence and scope limitations |
| Ranked stays / sorting / selection | HotelsView | GET destinations/:id/hotels | hotels | Price/rating/value ranking and intended hotel selection | VERIFIED_WORKING | See test evidence and scope limitations |
| Restaurants / itinerary meal cards | DestinationDetailView,ItineraryView | destination restaurants; trip generate/read | restaurants,itinerary_stops | Actual associated meals and known price snapshots | VERIFIED_WORKING | See test evidence and scope limitations |
| Registration / login / logout / refresh | AuthView,api,App | auth register/login/me | users | Validated account, JWT session, logout clears session | VERIFIED_WORKING | See test evidence and scope limitations |
| Create / generate / reload itinerary | PlannerModal,ItineraryView | POST trips; POST trips/:id/generate; GET trips/:id | trips,itinerary_stops,budgets,routes | Owner-scoped persisted plan reflecting inputs | VERIFIED_WORKING | See test evidence and scope limitations |
| Budget breakdown / changed settings | BudgetPlannerView,WhatIfPanel | GET trips/:id/budget; create/generate | trips,budgets,itinerary_stops | Database totals and current saved inputs | VERIFIED_WORKING | See test evidence and scope limitations |
| Three strategy comparison | StrategyComparisonModal | create/generate three trips | trips,itinerary_stops | Compare actual weighted greedy outputs, selected hotel retained | VERIFIED_WORKING | See test evidence and scope limitations |
| Saved profile plans / opening / session hiding | ProfileDashboardView | GET trips; GET trips/:id | trips | Owner plans persist; Remove hides in session only | VERIFIED_WORKING | See test evidence and scope limitations |
| Account name / password editing | ProfileDashboardView | none | none | Explicit API-unavailable notice, no fake save | NOT_APPLICABLE | No account mutation endpoint; truthful notice |
| Private route link | ShareItineraryModal,shareUrl | GET trips/:id requires owner | trips | Link carries ID/preferences; owner sign-in required | VERIFIED_WORKING | See test evidence and scope limitations |
| Operator catalog CRUD / previews | AdminDashboardView | 25 admin method/path combinations | destinations,attractions,hotels,restaurants | Role-protected transactional validation and search invalidation | VERIFIED_WORKING | See test evidence and scope limitations |
| Routing graph / algorithm visualization | DijkstraVisualizer,OfflineRouteMap | saved trip response | routes + persisted generation legs | Directional evidence and explicit unreachable paths | VERIFIED_WORKING | See test evidence and scope limitations |
| Image loading / galleries / attribution | ImageWithFallback,imageSources,Hero | catalog image fields | unmodified image provenance | Correct licensed photo or identified fallback, no broken icons | VERIFIED_WORKING | See test evidence and scope limitations |
| EN / HI switching and persistence | LanguageContext,Navbar | none | none | Supported dictionary switching; Gujarati UI absent | VERIFIED_WORKING | See 09 for repaired defects; supported EN/HI only |
| Research view / architecture explanations | ResearchView | real API where displayed | catalog/trips as applicable | Academic presentation distinguished from live solver | VERIFIED_WORKING | See test evidence and scope limitations |
| PDF export / print / responsive navigation | ItineraryView,Navbar,App | read existing trip | persisted plan | Export current plan and functional navigation | VERIFIED_WORKING | See test evidence and scope limitations |
| Offline shell / install prompt / speech | service worker,PwaInstallPrompt,Hero | authenticated API network only | none | Cached shell; OS capabilities conditional, no offline trip guarantee | BLOCKED_UNVERIFIED | Native install/microphone remains environment dependent |
| Health / readiness / shutdown | none | GET health; GET ready | readiness query | Liveness independent of DB, readiness 503 on outage | VERIFIED_WORKING | See test evidence and scope limitations |

No distinct public hotel/attraction/restaurant detail route or booking/payment workflow exists; entity information and selection are embedded in the existing views. No route/user management admin API exists. These absent capabilities are NOT_APPLICABLE, rather than fabricated integrations. Gujarati language support is BLOCKED_UNVERIFIED for the requested language; actual supported EN/HI was exercised. Full final gate outcomes are recorded in 10; historical image tests are separately timestamped.
