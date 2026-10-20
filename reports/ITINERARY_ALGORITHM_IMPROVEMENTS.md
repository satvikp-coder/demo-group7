# Itinerary algorithm improvements

The existing graph/Dijkstra, bounded multi-start greedy construction and distance/cost/rating model remain. This is not an exact global optimizer. Candidate lists disclose the evaluated search limits and selected normalized score.

## Confirmed defects and repairs

- Missing fee/duration excluded genuine sourced places. `attractionPlanning.js` admits source-backed provisional visits, retains null fees, and uses explicitly labeled category-duration planning allowances without rewriting database facts. Anonymous missing facts remain excluded.
- Disconnected catalog rows inflated daily quotas: eight reachable visits plus two unreachable rows were allocated3/3/2/0 across four days. The same feasibility predicate now controls both the daily quota and actual selection, reserving reachable visits for remaining days. A deterministic failing-before regression proves this repair.
- Unknown fee values could look cheap in legacy cost-first scoring. They receive no artificial cheapness advantage. For weighted candidate comparisons with incomplete costs, cost utility is disabled uniformly; distance/rating and coverage can still rank provisional tours. Known subtotal is not complete-budget feasibility.
- Published split windows and weekly/nth-weekday closures were not modeled by simple opening/closing fields. Additive source metadata now enforces them. The existing unresolved Saputara museum closure remains excluded.
- Long rural transfers need actual time allowance. New evidenced bidirectional OSRM table estimates augment the existing graph; coordinate mismatches abort imports, and hotel return must fit21:00. Unknown-hours visits retain18:00 advisory cutoff.

## Meals and day status

Lunch supports midday sightseeing rather than manufacturing an evening tour. Nearby sourced restaurants must fit route-detour, time and known-budget constraints. Otherwise an unlocated45-minute personal meal break has no fake restaurant UUID, map marker or price. Dinner is scheduled only if the actual day extends into its window; optional post-return dinner/breakfast notes do not claim prices or inclusion. Unsourced legacy restaurant rows are preserved but receive no new route edges or meal selection.

All requested days remain visible. Days with no sightseeing are explicitly unallocated, never completed hotel-only tours. Source-backed unknown-fee visits are provisional. Generic meal breaks have no coordinates; maps preserve real stop ordering and skip nonexistent locations. PDF export retains all requested day cards and status text.

## Limits

Approximate mapped points, planning-duration estimates, unknown admission/access and public-routing availability require confirmation before travel. No permit, booking or availability is guaranteed. Additional catalog rows do not imply all can fit every trip. Coverage-first ranking and deterministic tie-breaking are retained; no randomness or destination-specific demo schedule was introduced.

A fully filled sightseeing day is no longer marked incomplete merely because other catalog alternatives were not selected. Unselected sites remain discoverable in unscheduled_attractions; missing sightseeing days or failed meal scheduling still produce incomplete status. A regression reproduced the prior incorrect label. The existing priority explanation now explicitly identifies neutralized cost utility when admission/meal comparisons have unpriced stops.
