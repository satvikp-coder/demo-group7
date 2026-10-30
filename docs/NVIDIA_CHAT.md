# Heritage Guide provider

The existing authenticated `POST /api/chat` route and request/response schema are unchanged. Questions are grounded through the existing read-only, allowlisted database lookups. Unknown fees/timings remain unknown; `backend/chat/systemPrompt.js` is unchanged.

## Backend setup

In ignored `backend/.env`, set `NVIDIA_API_KEY` and optionally `NVIDIA_MODEL`. Never put the key in frontend environment variables, source, logs or commits. Obtain a key from [NVIDIA's model catalog](https://build.nvidia.com/meta/llama-3_3-70b-instruct). The configurable default is `meta/llama-3.3-70b-instruct`, listed there and in the [official reference](https://docs.api.nvidia.com/nim/reference/meta-llama-3_3-70b-instruct) when checked on 30 October 2026. Availability, quotas and billing depend on the provider account.

Restart the backend with `npm --prefix backend start`. The server uses native fetch to POST `https://integrate.api.nvidia.com/v1/chat/completions`, with a backend-only Bearer header. The Compose backend also accepts the same variables through its protected environment file.

## Bounds and failures

- Whole chat operation and each provider request have a maximum 15-second deadline. No automatic retries or provider fallback.
- Messages are limited to 1,500 characters. IP and user limits default to six requests per minute; existing concurrency, daily-call, tool-call and history limits remain.
- Missing configuration, upstream authentication/network failures, quota exhaustion and timeout return friendly errors using the existing error shape. Database-only mode remains available.
- Provider error bodies, credentials and full user messages are not logged. The existing structured request logger records only allowlisted metadata.
- The widget is unchanged except for the approved provider-name substitution in its existing copy.

## Verification

`npm run test:chat` mocks NVIDIA transport for success, 401, timeout, missing key and quota/network failures, alongside grounding, ownership, history, input and rate-limit tests. Unit tests explicitly blank the provider key and cannot make live inference requests.

Live verification must use the authenticated backend route. Its result is separate from mocked test coverage; no historical provider result establishes NVIDIA availability or answer quality. Native Gujarati quality and complete tourism data coverage remain unverified.

On 30 October 2026, the single live widget/backend-route attempt returned HTTP 503 with no reply; live NVIDIA answers are NOT VERIFIED. No retry was made. With a mocked NVIDIA transport, the production widget rendered the actual app-help lookup result (200), and a mocked upstream 401 became a friendly 503 message without page errors. The normal backend was restored afterward.

## Retained provider history

Runtime/configuration/dependency/current setup references to the previous provider and its inert switch were removed. Historical wording remains in the unchanged `CODEX_HANDOFF.md`, original triage entries of `docs/FINAL_BUG_LOG.md`, and these 16 reports. They describe earlier runs and do not verify the current provider:

- reports/ATTRACTION_ITINERARY_PROGRESS.md
- reports/FINAL_LOCAL_DEMO_READINESS.md
- reports/FULL_REGRESSION_RESULTS.md
- reports/HERITAGE_GUIDE_IMPLEMENTATION.md
- reports/HERITAGE_GUIDE_LOCAL_DEMO.md
- reports/HERITAGE_GUIDE_SECURITY.md
- reports/HERITAGE_GUIDE_TEST_RESULTS.md
- reports/MAP_BUDGET_TEST_RESULTS.md
- reports/heritage-guide-browser.json
- reports/heritage-guide-files.json
- reports/heritage-guide-integration.json
- reports/heritage-guide-live-browser.json
- reports/heritage-guide-live-targeted.json
- reports/heritage-guide-live.json
- reports/heritage-guide-model-evaluation.json
- reports/map-budget-regression.json
