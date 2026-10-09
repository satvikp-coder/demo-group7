# Weighted planner

Extends `backend/services/tripPlanner.js` using the existing Graph, Dijkstra, MinHeap, HashTable and greedy scheduler. No parallel engine.

`dsa/planning/priorities.ts`: integer percentages total100, default34/33/33. Moving one slider preserves the other two's ratio with deterministic rounding; zero remainder splits evenly. API/database validation rejects invalid allocations.

Evaluate up to8 deterministic guidance runs: requested/default/three presets/three pure priorities. Deduplicate schedules, exclude no-attraction and over-budget candidates. Final score is the sum of each utility times its percentage divided by100. Distance and known-cost utilities use reversed candidate-relative min-max; constant values receive equal1. Rating utility is known hotel/attraction mean divided by5 times known-rating coverage. Missing ratings remain null and receive no invented utility. Stable schedule hashes break ties.

Costs include selected hotel times days times rooms and per-person admission/meals times travelers. Unknown fares remain excluded and warned. The selected hotel never changes. Summary exposes every evaluated candidate's metrics, utilities, score/rank and selected ID. UI says best evaluated candidate, not global optimum. Legacy requests without weights retain strategy-only behavior; weighted infeasibility returns422.

Tests independently recompute scores and prove different choices on controlled trade-offs, all extremes, missing values, deterministic repetition and group costs. Real-browser seven-scenario tests verify persisted weights/dates/group inputs, ledger sums and desktop/mobile results. In the two-day Ahmedabad example all6known attractions fit, so equal cost/rating allows the shortest candidate to remain preferred across80% presets. This is expected dominance, not ignored weights.

Existing DATE column is reused; calendar-day parsing prevents timezone shifts. Weekday closures, reservations and seasonal availability are not fully modeled; site advisories remain essential. Archived OSRM routes are excluded after endpoint coordinate edits until new evidence is supplied.

Fresh production-build demo passed 2026-10-09T09:03:47Z (`itinerary-demo-runner.json`,
`itinerary-demo-browser.json`). Same French Haveli hotel, Ahmedabad, one day,
one traveler/room and ₹30,000 limit:

| Distance/cost/rating weights | Selected distance km | Known estimate INR | Rating mean | Score | Evaluated candidates |
|---|---:|---:|---:|---:|---:|
| 80/10/10 | 30.43 | 5525 | 4.64 | 0.942800 | 6 |
| 10/80/10 | 44.09 | 5500 | 4.66 | 0.949488 | 6 |
| 10/10/80 | 44.09 | 5500 | 4.66 | 0.901888 | 6 |

Each selected candidate has the highest independently checked score for its request.
Cost and rating correctly select the same candidate here; scores under different
weights are not directly comparable. Four attractions are scheduled in each.
Somnath/Lilavati mobile run evaluates four candidates and selects 18.77km,
₹1350 known cost and four attractions. Unknown transport fares are excluded.

Legacy research-console requests omit weights and retain their original strategy
semantics, including honest incomplete over-budget results. New weighted requests
enforce feasibility and never silently fall back to those legacy results.

Latest replay (itinerary-demo-runner.json) uses a fresh isolated database; stable UUID tie-breaking applies within each persisted catalog. Latest measured winners:

| City / priority | Distance km | Known INR | Score |
|---|---:|---:|---:|
| Ahmedabad / distance | 30.43 | 5525 | 0.942800 |
| Ahmedabad / cost | 44.09 | 5500 | 0.946958 |
| Ahmedabad / rating | 44.09 | 5500 | 0.899358 |
| Somnath / cost | 19.26 | 1350 | 0.973600 |
