# Backend-driven experiment verification

Run: 2026-09-29T16:21:04.053Z

Original 22 Somnath/Dwarka duration, budget and strategy scenarios retained, with the same named base hotels and 08:00 start. Uses registration/login, POST trips, POST generation, fresh GET trip and GET budget. Real database records only. No client planner imports. Prior report preserved in Research_Experiment_Plan.previous-client.md.

Historical baseline is retained client output, not independently reverified tourism facts.

Road/boat split and algorithm-only execution time unavailable in backend contract; null, not zero.

HTTP generation latency includes network/database persistence and is not comparable to old CPU time.

No accepted route rows; successful HTTP generation is not a complete tourism itinerary.

| Run | Scenarios | Generated | Failed | Within budget | Attraction visits | Total cost |
|---|---:|---:|---:|---:|---:|---:|
| Previous client | 22 | 22 | 0 | 15 | 68 | 53585 |
| Current backend | 22 | 11 | 11 | 7 | 0 | 47600 |

Detailed per-scenario values, flags and persisted IDs are in experiment_results.json. All temporary experiment records cleaned: true.
