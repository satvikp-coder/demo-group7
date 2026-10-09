# Backend/API audit

42 registered method/path combinations: auth 3; destination/catalog/search/detail/children 7; trips 5; admin 25; health/readiness 2. nginx static-health is a separate edge probe. Routes/controllers/services/models were traced. Legacy unmounted budget route is not falsely counted as a live endpoint; protected trip budget is authoritative.

Request validation uses Zod and rejects extra/protected fields; parameterized SQL; owner scope on every trip read/generate/budget; operator role database recheck on catalog writes. Unknown records, bad payloads, forbidden users and database errors have meaningful sanitized status codes. Public hotel listing applies numeric Merge Sort with deterministic ties/unknown last. Search Trie cache refresh is coalesced and retains previous real snapshot on failure.

Generation obtains repeatable-read snapshots and atomically writes stops/budget; serialization/deadlock retry bounded at five attempts. AUD-002 fixes paise balance without rewriting greedy strategy; AUD-007 removes fabricated default rating without changing weighting. Direct route/reverse evidence, wheelchair intermediate-node exclusion and explicit missing-route behavior have backend regression tests.

HTTP suites exercise auth (17), destinations (106), trips (45), admin (101) assertions and database constraints against isolated fixtures. Current 31 backend unit cases include readiness/security/validation/cache/ranking/solver. Exact final commands/gates are in 10. External commercial/provider integrations do not exist; do not interpret a local HTTP 200 as provider confirmation.
