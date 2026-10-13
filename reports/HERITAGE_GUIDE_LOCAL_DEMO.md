# Heritage Guide local demonstration
13 October 2026.

## Start
From application root:
```powershell
npm run local:up
npm run local:demo:check
```
Open http://localhost:8080 and sign in with your existing account. No demo password or reset is needed.

## Server-only configuration
Keep these in ignored .env.local-production:
```dotenv
GROQ_API_KEY=
GROQ_MODEL=openai/gpt-oss-120b
CHAT_FREE_PLAN_CONFIRMED=false
CHAT_RATE_LIMIT=6
CHAT_MAX_HISTORY=8
CHAT_MAX_OUTPUT_TOKENS=700
CHAT_DAILY_CALL_LIMIT=60
CHAT_TIMEOUT_MS=18000
CHAT_MOCK=false
```
Use a fresh key after rotating the one pasted into conversation. Set confirmation true only when Groq Billing shows Free Plan/no paid billing. Never upgrade or add payment details for this feature. Never use VITE_GROQ_API_KEY. Rebuild/recreate using local:up after changing container environment; local:restart alone does not apply new environment values.

## Rehearsal
1. Open a destination page; click the bottom-right launcher.
2. Ask Tell me about Modhera.
3. Follow up What are the attractions there?
4. Ask Which hotel has the lowest known price near Modhera?
5. Ask What does Budget mean?
6. Ask Explain the distance, cost and rating priorities.
7. Open your saved itinerary, then ask about the current trip and its known budget. The widget supplies its UUID and the server verifies ownership. Alternatively include your own trip UUID from its private link.
8. Ask a Hindi question and a Gujarati question.
9. Ask about booking/live availability; expect the honest limitation.
10. Close the panel and generate a normal itinerary.
11. Switch to database-only mode to select an actual destination and structured catalog lookup when offline/quota-limited. This is not an AI demonstration.

## Troubleshooting
- 401: sign in again; expired sessions use the existing client handling.
- AI disabled: missing key or Free-plan confirmation; database mode remains available.
- 429: temporary free usage limit; wait as indicated. Never upgrade or auto-retry.
- 503: provider/key/model/network or database unavailable. Verify local readiness; check configuration without printing secrets.
- 504: operation timed out; ask a smaller question or retry later.
- Invalid/expired conversation: clear conversation.
- Unknown price/hours/fees: a real data limitation, not a free service or 24-hour opening claim.
- No private trip data: verify the UUID belongs to the currently signed-in account.

## Repeatable checks
npm run test:chat — deterministic provider-protocol/security tests.
npm run test:chat:local — isolated real PostgreSQL/API/auth/browser checks, no live AI.
npm run test:chat:local -- --live — opt-in bounded live questions on isolated data using owner-confirmed Free Plan; conservative spacing, no quota retries.
Never present a test-double answer as live Groq evidence.

## Installed acceptance
The application is running at http://localhost:8080 with the backend-only Free-plan configuration. Installed widget checks passed at1440/768/390; opening generated no provider traffic. Real Groq inference from the installed backend container passed, and all nine original table fingerprints remained unchanged. Full18/18, production17/17, backend95/95 and professor-demo regression passed. See HERITAGE_GUIDE_TEST_RESULTS.md for exact evidence and limitations.

Optional read-only checks: `python tests/frontend/heritage_chat_installed.py` and `node scripts/check-chat-preservation.js` (requires the private pre-change snapshot). `node scripts/check-chat-container.js` explicitly sends one live public-catalog question and consumes Free-plan quota; it is not a startup/background check.

Keep a minute between longer demonstration questions if needed for the8000-token/minute Free quota. No paid fallback is configured. Database-only mode remains available for structured catalog/current-trip/budget information without AI. No database reset, new demo account or credential disclosure is needed.
