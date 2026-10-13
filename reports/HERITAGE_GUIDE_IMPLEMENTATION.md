# Heritage Guide implementation
Date: 13 October 2026. Local application only; no public deployment changes.

## Architecture
React launcher -> lazily loaded panel -> existing Bearer API client -> POST /api/chat -> bounded chatService -> official groq-sdk Chat Completions -> allowlisted PostgreSQL tools -> grounded reply.

Read the supplied 14-page PDF from Downloads. Replaced its Anthropic-specific examples and guessed schema with the existing Express routes, PostgreSQL schema and Groq wire protocol. No Anthropic dependency, database migration, reseed, price change or itinerary-algorithm change.

Provider: groq-sdk 1.6.0. Default configurable model openai/gpt-oss-120b; allowed alternative openai/gpt-oss-20b. Official model/Free-plan tables list both, and the supplied account's models endpoint returned both. 20B evaluated for speed but produced an invalid get_app_help enum on the Budget question. 120B correctly selected categories in the same live diagnostic, so 120B was explicitly selected for tool reliability. Both have the same documented Free-plan capacity; no automatic fallback. Account response headers confirmed1000 requests/day and8000 tokens/minute at diagnosis. No automatic model/provider switching, hosted search or code execution.

## Tools
- search_destinations: literal bounded English/Hindi/Gujarati name lookup; actual IDs. If localized names are missing, returns the actual eight supported names separately from matches, so a transliteration can be resolved without pretending an unknown query matched.
- get_attractions: supported descriptions, fees, hours, visit durations and accessibility; null stays unknown.
- get_hotels: existing historical-rate policy, price bands, configured nearby anchors/radii and Merge Sort; optional property-name lookup.
- get_restaurants: actual stored businesses and meal estimates.
- get_trip: owner UUID predicate and at most 40 saved stops; selected hotel/accommodation/weights and coverage advisories.
- get_budget: existing persisted-stop known-cost calculation; unknown fares remain excluded.
- get_app_help: explanations of implemented planning, categories, priorities, persistence, deletion, PDF and private links.

Tools use transaction-level READ ONLY and a 3-second statement timeout, server allowlists, strict Zod inputs and parameterized SQL. No SQL/model code accepted.

## Frontend
52px desktop /48px mobile navy-gold launcher, closed by default; 340px constrained responsive panel. Lazy panel chunk; no request on open. Suggestions, Enter/Shift+Enter, loading, retry, clear, Escape/focus restoration, safe text/bold rendering, screen-reader updates and viewport/safe-area bounds. Hidden while planner/auth/PWA overlay is active.

No chat persistence in browser storage or new tables. Owner-bound authenticated encrypted continuation token remains in component memory. Logout/account changes abort pending requests and clear messages. Guest sign-in uses existing navigation and auth flow.

Database-only mode is explicitly not AI. It performs structured authenticated lookups, rendering returned facts rather than fake answers, with no provider request.

## Configuration
Server-only ignored private .env.local-production passes variables through compose.local.yml; public compose/deployment configuration unchanged.
GROQ_API_KEY, GROQ_MODEL, CHAT_FREE_PLAN_CONFIRMED, CHAT_RATE_LIMIT, CHAT_MAX_HISTORY, CHAT_MAX_OUTPUT_TOKENS, CHAT_DAILY_CALL_LIMIT, CHAT_TIMEOUT_MS, CHAT_MOCK.
Defaults: 6 messages/user/minute, 8 history messages, 700 completion tokens, 60 provider calls/day/process, 18-second operation deadline, 3 model calls and 8 total tool calls/question, concurrency 2. SDK retries zero. CHAT_MOCK cannot produce fake live replies.

## Free-plan boundary
Owner confirmed Free Plan with no paid billing. No account upgrade, subscription, payment method or paid infrastructure configured. App refuses inference until Free-plan confirmation and a key are supplied. Groq account billing is not exposed by the models API: this is owner confirmation, not independent dashboard verification. Keep the account on Free Plan. In-memory counters reset on restart; Groq organization quotas remain authoritative.

Official references checked:
- https://console.groq.com/docs/models
- https://console.groq.com/docs/rate-limits
- https://console.groq.com/docs/tool-use/local-tool-calling
- https://console.groq.com/docs/billing-faqs

## Files
backend/chat/{config,systemPrompt,toolDefinitions,toolHandlers,history}.js; backend/services/{groqService,chatService}.js; backend/routes/chatRoutes.js; backend/server.js; backend/package.json and lockfile; backend/.env.example; compose.local.yml; frontend/src/components/{HeritageGuideChat,HeritageGuidePanel}.tsx; frontend/src/App.tsx; frontend/src/api/index.ts; tests and scripts listed in test report; root package.json, README, source approval evidence and documentation.


Follow-up context retains up to eight server-resolved public destination ID/name handles inside the encrypted token. It does not retain old tool facts; each follow-up retrieves current facts. Current itinerary context is checked for ownership before sending its UUID to Groq. Saved trip tools resolve real destination/hotel names.

Actual live testing found and repaired:20B invalid help enum,120B slug used as UUID on followup, null admission described as free, zero budget categories called unknown fees, and Hindi name search incorrectly reporting Somnath absent. Stricter live assertions test these cases. See final test evidence for acceptance rather than earlier permissive diagnostic flags.

Installed versions: React19 /TypeScript5.8 /Vite6.4.3, Express5 /node-postgres8 /PostgreSQL17, official groq-sdk1.6.0. Current host Node24.12; Docker runtime Node22 satisfies the existing >=22.18 requirement. No ORM or new database tables.

## Final local status
Implemented and installed at http://localhost:8080. Authenticated live browser conversation/follow-up and installed-container Groq/PostgreSQL probe passed. Full18/18, production17/17, backend95/95, chat24/24, grounding71 checks, localreadiness7/7 and original9table preservation passed. See the test report for scoped evidence and known provider/catalog limitations. No new GitHub publication or public deployment.
