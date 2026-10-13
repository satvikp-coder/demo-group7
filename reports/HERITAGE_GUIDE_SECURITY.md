# Heritage Guide security
13 October 2026. See machine-readable test reports for actual executions.

- Existing verifyJwt + verifyAccount; user ID always comes from the verified request.
- Tourist/operator may ask questions; neither may access another user's saved trips.
- Strict message contract accepts one user message, not arbitrary system/assistant/tool history. Server-produced history is AES-256-GCM authenticated, owner-bound, expiring after 30 minutes and bounded by messages/bytes. Forged or cross-user tokens fail.
- All tool inputs are strict allowlisted schemas. Unknown tools, invalid UUIDs, forged user IDs and SQL strings are rejected. No model-generated SQL, code or writes.
- PostgreSQL READ ONLY transaction is a second independent write barrier; actual attempted UPDATE is rejected in isolated tests. Statements timed out after 3 seconds.
- Minimal projected provider outputs exclude account profiles, emails, hashes and auth tokens. Trip reads use the existing ownership predicate; missing/foreign trips are indistinguishable.
- Input API-key/access-token patterns rejected; credential-like output removed. Provider/system secrets are not included in tool context or logs.
- Frontend renders escaped React text and limited bold; never raw HTML, executable Markdown or model links.
- Conversations remain in memory, discarded on refresh/logout/account change. Pending requests aborted; stale session responses do not enter a new user chat.
- External-provider disclosure appears before chat submission. Groq receives question/history and minimal relevant facts, including authorized trip details only when requested.
- Per-user rate limits, local daily provider-call ceiling, concurrency, output/history/row/tool/round caps and whole-operation deadlines (including database-only mode). No automatic provider retries. HTTP429 retains retry-after and a clear temporary free-limit message. The central client reads Retry-After; the widget blocks AI retry/send during that cooldown. CORS exposes only the safe retry header in addition to the existing request ID.
- Shared answer cache is limited to exact nonprivate app-help questions, versioned by help/prompt/model. Catalog and private-trip answers are never shared-cached. Catalog tools query current PostgreSQL; per-request repeated tool calls reuse only that request's result.
- Missing key, unconfirmed Free Plan or mock flag disables AI without affecting other routes. Database-only mode is read-only and clearly not AI.
- Key exists only in ignored private backend runtime configuration. It was supplied in the conversation and should be rotated; it is never written to public reports/source or frontend bundles.

Limitations: prompt instructions reduce but cannot eliminate model hallucination or prompt injection. Server permissions do not depend on model obedience. Billing status cannot be attested from a normal inference/models key; the owner must keep Free Plan/no paid billing. Rate counters are instance-local and reset at restart. Existing JWT expiration/logout behavior is preserved; no new revocation system.


Final installed scan: all11 served JavaScript assets were downloaded and checked against the configured server key; no key was present (heritage-guide-public-key-scan.json). All9 live table digests stayed unchanged after actual container inference (heritage-guide-preservation.json).
