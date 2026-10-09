# Bug-fix log

| ID | Severity | Feature | Root Cause | Files Changed | Fix | Test Evidence | Status |
|---|---|---|---|---|---|---|---|
| AUD-001 | P1 | Build dependency | source-map-js 1.2.1 CVE | frontend/package-lock.json | Patch 1.2.2 | npm audit zero | FIXED_VERIFIED |
| AUD-002 | P1 | Planner budget | Floating-point residual excluded exact-fit admission | backend/services/tripPlanner.js; backend/tests/trips.test.js | Round remaining to paise | before JSON; exact-fit/one-paisa-over tests | FIXED_VERIFIED |
| AUD-003 | P1 | What If integration | Save read debounced old inputs | ItineraryView.tsx | Submit current slider values | real before/after POST capture | FIXED_VERIFIED |
| AUD-004 | P2 | What If truthfulness | Live claim and stale saved confirmation | WhatIfPanel.tsx | Describe Save generation; confirmation conditional on unchanged inputs | targeted before/after browser | FIXED_VERIFIED |
| AUD-005 | P2 | Private sharing/accessibility | Public-looking promise; unresolved dialog title | ShareItineraryModal.tsx; shareUrl.ts | Explain owner authentication; title id | targeted browser | FIXED_VERIFIED |
| AUD-006 | P2 | Preservation test tooling | Old baseline rejected authorized photo repairs | scripts/source-audit.js; APPROVED_FRONTEND_REPAIRS.json | Exact reviewed hashes | strict negative probe + source audit | FIXED_VERIFIED |
| AUD-007 | P1 | Rating-first scoring | Missing or zero rating became fabricated 4.5 | dsa/greedy/routeBuilder.ts; trips.test.js | Finite actual rating or neutral unknown | before JSON; regression unit | FIXED_VERIFIED |
| AUD-008 | P2 | Route visualizer | Undirected reverse and false zero unreachable path | DijkstraVisualizer.tsx; visualizer.test.ts | Directed saved legs and explicit unreachable | before JSON; 2 regression cases | FIXED_VERIFIED |
| AUD-009 | P2 | Tablet navigation | Desktop navigation enabled at768px exceeds available width; Plan button clipped | Navbar.tsx; audit_responsive_nav.py | Existing compact menu below1024px; three md-to-lg breakpoint tokens only | Before button right852.59 in768 viewport; after all five widths fit and compact links work | FIXED_VERIFIED |

Image defects IMG-001/002/003 and all asset replacements are canonically documented in backend/reports/images/IMAGE_REPAIR_REPORT.md. They are verified, with 12 original photographs recovered, 15 new/replacement photographs and 22 honest catalog fallbacks. All 8 destinations have real photos. French Haveli and Champaner Heritage Resort have licensed property photos; the other 9 hotels (including Lemon Tree Premier and House of MG) retain identified generic fallbacks.

Absent Gujarati UI, live bookings/availability, account mutations and public recipient sharing are product limitations, not simulated fixes. Native OS/device and public deployment checks remain BLOCKED_UNVERIFIED.

## Itinerary extension regression log (2026-10-09)

Requested category/priority/data additions are features, not retroactively classified as original bugs. Current acceptance is in FINAL_DEMO_READINESS.md.

| ID | Severity | Feature | Root Cause | Files Changed | Fix | Test Evidence | Status |
|---|---|---|---|---|---|---|---|
| IT-001 | P0 | Guest generation | Protected trip creation lacked sign-in handoff | App,PlannerModal,AuthView,api/index | Preserve draft, authenticate, resume; keep backend protection | Live before401; production-build auth replay | FIXED_VERIFIED |
| IT-002 | P2 | Planner actions | Install prompt covered Generate | App | Suppress existing prompt during planner/auth | Auth/browser journeys | FIXED_VERIFIED |
| IT-003 | P1 | Calendar date | PostgreSQL DATE became timezone-shifted JS date | backend/config/database.js;api/index | Preserve calendar string and day labels | Saved date/group browser tests | FIXED_VERIFIED |
| IT-004 | P2 | Mobile itinerary | Fixed badges and unrestricted note width squeezed/overflowed text | ItineraryView;BestTimeNote | Responsive wrapping/minimum widths | 390px no-overflow checks/screenshots | FIXED_VERIFIED |
| IT-005 | P1 | Expanded data | NOT NULL required inventing unknown prices/durations | migration007 | Permit unknowns; exclude unsupported scheduling/category use | Import rollback/repeat; unknown-price422 | FIXED_VERIFIED |
| IT-006 | P2 | Tall planner | Vertical centering placed tall form above scrollable viewport | PlannerModal | Overflow-safe alignment | Native duration clicks;720px demo | FIXED_VERIFIED |
| IT-007 | P1 | Research console | Strategy override implicitly activated weighted infeasibility | api/index | Preserve unweighted legacy contract | 22 persisted research trips,18-gate suite | FIXED_VERIFIED |
| IT-008 | P1 | Route coordinates | Hotel edits reused old archived OSRM endpoint distances | tripPlanner | Exclude mismatched endpoint evidence | Unit/API coordinate-change422 | FIXED_VERIFIED |
| IT-009 | P3 | Distance display | Binary sum tails exposed as long decimals | api/index | Round display aggregates to stored route precision | Type/build and full browser | FIXED_VERIFIED |

Test-only repairs retain stronger assertions: await asynchronous hotel options; validate exact malformed-response errors behind auth preflight; preserve original hotel-field equality while checking added category/distance metadata; scroll lazy images before decoding. No production success response is mocked.
