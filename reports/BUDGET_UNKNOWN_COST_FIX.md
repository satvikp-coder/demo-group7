# Unknown-cost correctness

Before: SQL COALESCE sums erased the distinction between no meal records and free food; the itinerary and comparison labelled partial sums as totals. Legacy zero stop values could be labelled Free / Included. Budget accommodation text used trip days rather than purchased nights.

After: existing numeric ledger fields remain backward compatible. Additive `cost_details` reports category KNOWN_ZERO / KNOWN_POSITIVE / UNKNOWN, nullable category amount, known subtotal, unknown components, nullable final total and explicit limited-budget feasibility. No existing record is rewritten. Positive and valid zero snapshots contribute to arithmetic; null, blank, invalid and negative input is never a known amount. Historical zero fees without snapshot evidence remain unknown. Zero-night lodging remains zero; purchased lodging uses nights x rooms, not days.

Scheduled meals do not represent a complete trip food allowance. No scheduled meals = Food price unavailable; priced meals retain their known subtotal with additional food unpriced. Unknown transport, taxes and fees are identified. Unknown admission remains excluded by the existing planner; no fabricated fee is introduced. New generation summaries carry per-stop cost states using existing JSON metadata, not a migration. Legacy records stay readable without re-pricing against today's catalog.

Targeted optimizer correction: otherwise comparable candidates with fewer priced meal stops receive no cost-utility advantage over candidates with fuller meal coverage. Candidates with equal coverage retain existing min-max cost utility. Common unpriced food/transport/taxes remain outside complete-budget feasibility; no fare is invented and scoring architecture/weights are preserved. Regression fixtures cover this precise condition.

Budget page, itinerary/PDF, profile and comparison use known-subtotal wording. Existing chatbot get_budget consumes the additive details through the existing budget service; no chatbot/auth behavior changed.

Files: backend/services/costStatus.js, backend/models/budgetModel.js, backend/services/tripPlanner.js; frontend/src/utils/costPresentation.ts, api/index.ts, utils/itineraryPlanner.ts; ItineraryView, BudgetPlannerView, ProfileDashboardView, StrategyComparisonModal and WhatIfPanel. Adjacent label changes are necessary to avoid contradictory totals across views.

The exact scoped source/test inventory is `map-budget-files.json`. Existing legacy numeric budget fields remain sums of persisted snapshots for API compatibility; new consumers should read `cost_details` for completeness and category states. A stored zero is described as a recorded zero charge only with generation evidence, never promoted to a current verified tariff.
