# Heritage Guide test results

Verified 13 October 2026 against the installed local application at http://localhost:8080.

## Baseline and preservation

Backend baseline:71 passing tests. Release checkpoint:1999f0251641c65ed97810028e6e6dfc763a88b9; release checkout was clean. Application folder has no Git metadata. A private source ZIP and nine-table count/fingerprint snapshot were saved before implementation. No schema migration, catalog edit, database reset or user-data modification was required.

After local installation, all nine original table fingerprints matched:8 destinations,44 attractions,56 hotels,12 restaurants,497 routes,2 users,5 trips,43 stops,4 budgets. See heritage-guide-preservation.json. Test account/trip writes and imports occurred only in disposable databases. No GitHub push or public deployment was performed.

## Executed checks

| Command | Verified result | Evidence |
|---|---|---|
| npm run test:chat |24/24 security, protocol, quota and timeout tests|backend/tests/chat.test.js|
| npm --prefix backend test |95/95:71 existing plus24 chat|backend/reports/production/backend-unit.txt|
| npm --prefix frontend test; npm --prefix frontend run lint |Existing frontend/reference suites and TypeScript passed|full-suite.json|
| VITE_API_BASE_URL=/api npm --prefix frontend run build |Production build passed; lazy panel15.09KB/5.76KB gzip|frontend build output|
| npm run test:chat:local -- --live |71 real database checks;1440/768/390 browser checks; live Groq and actual widget conversation passed|heritage-guide-{database,browser,integration,live-browser}.json|
| npm run test:all:local |18/18 gates; real browser controls/PDF/API/database checks passed|backend/reports/production/full-suite.json|
| npm run test:production |17/17 gates:original16 plus restricted-runtime read-only chat/provider-isolation gate|backend/reports/production/container-suite.json|
| npm run test:demo:local |17 API assertions,7 auth checks,5 professor-demo journeys across3 cities passed|itinerary-{demo-runner,demo-browser,auth-browser,api-matrix}.json|
| npm run audit:images |120 references:38 photograph associations,82 intentional fallbacks,34 assets,0 errors|image audit output|
| npm run audit:source |0 secret findings;0 unapproved UI changes|backend/reports/production-source-audit.json|
| npm run local:up; npm run local:demo:check |Installed successfully;7/7 environment checks passed|phase3-local-demo-check.json|
| python tests/frontend/heritage_chat_installed.py |Installed guest widget passed at1440/768/390; no JavaScript exceptions, overflow or provider requests on opening|heritage-guide-installed-browser.json|
| node scripts/check-chat-container.js |Real120B inference from installed backend container using actual public PostgreSQL catalog passed|heritage-guide-container-live.json|
| node scripts/check-chat-preservation.js |All9 original table count/digests unchanged after installation and live probe|heritage-guide-preservation.json|

Local adapters execute the existing test:all and test:itinerary demo workflows with generated credentials and isolated databases. Production tests use a separate Docker project/volume. Source files changed are listed in heritage-guide-files.json.

## Live AI accuracy

Owner confirmed Free Plan/no paid billing. Account models API returned GPT-OSS20B and120B; official documentation lists both on Free Plan. Live response headers confirmed1000 requests/day and8000 tokens/minute. Billing status itself is not exposed by this API and was not independently inspected in a logged-in Billing dashboard.

Twelve question scenarios have accepted real Groq evidence:destination, follow-up attractions, cheapest known hotel with straight-line distance, restaurant, Budget band, priorities, owned saved trip, recorded budget, Hindi, Gujarati, no live booking/availability, and historical hotel tariff. First11 passed together after stricter assertions; case12 was separately repaired and retested. Combined evidence in heritage-guide-live-acceptance.json explicitly identifies its source runs. It is not represented as a single uninterrupted final12-case pass.

Actual browser -> existing authenticated client -> API -> PostgreSQL tools -> Groq conversation and follow-up passed at desktop. Responsive behavior at all3 widths was tested with an explicitly isolated provider double; these tests are not claimed as live-model proof. Installed Docker additionally passed a public-catalog live service probe; that internal probe does not claim to exercise HTTP authentication, which was tested separately.

## Failures diagnosed and corrected

- 20B produced an invalid help-topic enum; explicitly selected verified120B. No automatic paid/provider fallback.
- Follow-up supplied a slug instead of UUID; encrypted server-resolved destination handles now preserve identifiers while fresh facts are retrieved each turn.
- Unknown admission was described as free; tightened grounding instructions and null-fee assertions.
- Zero recorded budget categories were called unknown admission; clarified recorded-subtotal semantics and tested excluded unrecorded costs.
- Hindi lookup falsely said Somnath was absent; supported-name discovery handles absent stored translations without mapping unknown cities automatically.
- Reordered Good Night Hotel did not match Hotel Good Night; parameterized all-word search retrieves the actual property and its archived1700/2014 tariff, with current price null.
- Isolated browser registration had ECONNRESET; added lifecycle waits and sanitized server logs. Retest passed.
- Localization test navigated to a protected profile after logout; corrected the fixture to public home, preserving intended auth-page widget hiding.
- Full-suite unit test inherited live local settings; unit configuration is now isolated and inference credentials cleared. Retest18/18 passed.

Earlier permissive diagnostic results were retained and marked rejected during factual review. Assertions were strengthened rather than weakened. No required test remains failing.

## Security and limitations

Tests cover absent/invalid/expired tokens, malformed/oversized/forged history, unknown tools and UUIDs, cross-user trips/budgets, SQL input binding, actual READ ONLY write rejection, secret patterns, bounded rounds/concurrency/history, provider failure/timeouts/429, zero-price/null/historical policy, HTML escaping, duplicate sends, retry cooldown and logout privacy.

Model instructions cannot prove universal hallucination/prompt-injection immunity; backend permissions are independent of model obedience. Free quotas/provider availability can interrupt chat. Counters are process-local and reset on restart. No paid fallback exists. Catalog facts retain their existing limitations. Languages were exercised with real Hindi/Gujarati responses, not professionally certified translation review.

Screenshots remain local:heritage-guide-{1440,768,390}.png, heritage-guide-live-browser.png and heritage-guide-installed-{1440,768,390}.png. The API key is absent from source/reports/frontend; rotate the credential supplied in conversation through Groq account settings.
