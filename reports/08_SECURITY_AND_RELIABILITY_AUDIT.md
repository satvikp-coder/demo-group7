# Security and reliability

AUD-001: frontend transitive source-map-js 1.2.1 was vulnerable to indexed-source-map event-loop denial of service, GHSA-68fv-2mgg-jv7q / CVE-2026-93749. Updated only that package to patched 1.2.2; lockfile reproducible, current npm audit has zero findings. [GitHub reviewed advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q). Backend audit also zero. A clean audit is not proof that undiscovered vulnerabilities do not exist.

Existing protections verified by code and isolated tests: bcrypt12, one-hour HS256 JWT, expiry/signature validation, current DB account/role verification, owner-scoped trips, production signup cannot grant operator, parameterized SQL, strict schemas, exact-origin CORS, Helmet, body limits/rate limits, sanitized logs, SSL certificate verification, bounded pool/timeouts and graceful shutdown. No secret values are included in reports. Production source scan excludes private env files and checks credential patterns.

Runtime database role is separate from owner/maintenance; database and backend are private in normal local deployment. Production tests exercise role privileges, headers/redaction, outage readiness recovery, load/concurrency, restart persistence and backups. Public HTTPS/deployment/provider-account verification has not occurred. Existing secrets were neither rotated nor printed.

AUD-006 preservation guard pinned old pre-image sources; repaired using an exact reviewed SHA256 allowlist. Any subsequent edit invalidates its hash; no general UI exception introduced. A negative probe verifies unapproved modification fails and restored approved file passes.

No speculative performance rewrite: current small catalog uses indexed relationship queries, catalog response avoids per-card fanout, cache refresh coalesces, images are optimized locally. Real load gate measurements are retained in backend/reports/production; they do not establish a public production SLA.

Initial bounded production smoke (2026-10-08 07:51 UTC): 134 requests across search, destination, trip retrieval, authentication and generation, with zero unexpected failures; p95 values respectively 75,49,67,206 and65 milliseconds on this machine. Indexed hotel relationship query and small persisted-stop query were EXPLAIN ANALYZE inspected. These are local fixture measurements, not a public SLA or evidence for speculative indexing/refactoring.

Latest production load smoke 2026-10-08T08:11:14.179Z: 134 requests, 0 unexpected failures. Measured p95 milliseconds: search=35, destination=29, trip-retrieval=67, authentication=258, itinerary-generation=125. Query plans and all8 city results are retained in production-api-smoke.txt.
