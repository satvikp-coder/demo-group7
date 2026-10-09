# Authentication root cause and verified repair

Live fresh-browser reproduction: guest opened planner, reviewed trip, clicked Generate; POST/api/trips sent no Authorization and returned401 Bearer token required. Evidence auth-itinerary-before.json/png. The central client already attached stored tokens correctly; the missing behavior was a guest/expired-session handoff. Authentication must remain required for persisted owner trips.

App/PlannerModal now preserve configuration and redirect to the existing sign-in screen before unauthenticated creation. Successful login reopens the draft. Protected client calls require a session; current-session401 clears token and prompts reauthentication without exposing middleware jargon. Backend JWT verification/roles/ownership remain enforced. The existing install prompt was also hiding the planner action and is suppressed while planning/signing in.

Phase A/B real isolated browser: guest-to-login draft retained; invalid login rejected; real authorized create/generate returns actual attraction stops; persisted trip renders and survives refresh; repeated generation succeeds; validly signed expired token rejected and reauthentication offered; missing/forged requests remain401. itinerary-auth-browser.json and itinerary-auth-runner.json verified=true; disposable database removed. These prove the original existing engine before categories/weights/data additions. Final expanded tests will repeat these paths and logout.

Final expanded production-build replay passed on 2026-10-09 in
`itinerary-demo-runner.json` (`itinerary-auth-final.txt`): all seven authentication
checks repeated successfully after the feature changes. The fresh demo also
verified logout clears the client token and unauthenticated protected requests
return401. Backend authorization was never removed. Logout clears this browser's
session; this existing JWT system does not implement individual token revocation.
