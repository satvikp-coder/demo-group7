# Local university demonstration

Use the existing local application, not a hosted demo or presentation-only data.
Run commands from the repository folder containing package.json and compose.yml.

## Before presenting

1. Start Docker Desktop with Linux containers.
2. Run `npm run local:up`, then `npm run local:demo:check`.
3. Open http://localhost:8080 and register/sign in normally. There are no fixed
   demo passwords. Do not reset the database or alter someone else's account.
4. For an automated rehearsal, install the documented test dependencies and run
   `npm run test:demo:local` sequentially. It uses a disposable database.

The read-only readiness command checks configuration, frontend/deep links,
backend/database health, all-eight-city catalog availability, protected generation,
migration checksums and local image bytes. Follow its specific recovery output
if a check fails; readiness does not itself generate an authenticated itinerary.

## Main user journey

1. Explore Ahmedabad and open its actual destination details.
2. Open Ranked Stays and use Select city to inspect Ahmedabad, Somnath and another
   destination. Change category and ordering; distances are approximate straight-line
   proximity, while available room prices are source estimates.
3. Open the circuit planner, choose Ahmedabad and a known-price property. Select
   a budget sufficient for the displayed accommodation subtotal and other known
   costs. Set travelers, rooms and explicit nights; check that days and nights
   describe the intended trip rather than assuming they are identical.
4. Use34/33/33priorities and generate. Inspect actual hotel, visit sequence,
   persisted costs, route estimates and scoring explanation.
5. Keep other inputs fixed, compare80/10/10,10/80/10 and10/10/80priorities, and
   explain the evaluated scores. Results may remain the same when the best candidate
   dominates the alternatives; the planner is bounded/heuristic, not globally proven.
6. Refresh and open the same trip from the profile. It is stored in PostgreSQL,
   not merely frontend state. What If creates a new saved version.
7. Repeat with Somnath and Modhera. For Gir, choose an appropriate date outside
   its sourced seasonal closure and respect the displayed safari slot advisories.
8. Repeat core selection/generation at390px. Image fallback illustrations are
   intentionally marked and should not be described as actual property photos.

## Honest limits and failure handling

- Select an unknown-price property only for inspecting its details; it is not a
  priced starting-hotel option. Submission validates stale/invalid price selections.
- Try an accommodation budget below the displayed room-night subtotal. The form
  explains the shortfall before creating a trip; it does not silently substitute
  another hotel or create a fake success result.
- Champaner currently supports one fully costed/timed attraction. Longer requested
  tours disclose unsupported extra sightseeing days rather than inventing visits
  or placing lunch directly before a six-hour dinner wait. Use a shorter visit or
  another populated destination for showing itinerary variety.
- Known-cost totals exclude unsupported transport fares/taxes. Ratings and opening
  facts are used only where recorded; unknown closing information uses a qualified
  18:00 planning cutoff, not a claim that a site closes then.

## Demonstrating the four teammate fixes

1. Sign in as a tourist: Admin Panel is absent. Direct /admin returns to the profile;
   backend admin requests are independently rejected403. Operator approval is a
   separate local owner action; do not self-assign it in registration.
2. Use Copy private trip link. The modal explains that owner sign-in is required.
   Open it in the same owner's session to retrieve the saved trip. A different
   account cannot read it; there is no public recipient-sharing claim.
3. To demonstrate deletion, create a **new disposable demo trip**, not an important
   saved record. On the profile, click Delete Trip and cancel once; it remains.
4. Confirm deletion of that same disposable trip. The API deletes its stops/budget,
   the profile refreshes, and the trip remains absent after page refresh. If the
   server fails, the card stays and an error is shown. Do not delete someone else's
   trip or manually remove database rows during a presentation.

## Reproducible automated evidence

Run sequentially: `npm run test:all:local`, then `npm run test:scheduling:local`.
Both use isolated databases. The second includes192all-eight-city planning cases
and the focused teammate browser checks at1440/768/390, including cancellation,
simulated API failure, ownership, price preflight, persistence and cache cleanup.
Do not use the active-stack maintenance `test:local` against real user data.

See [latest verified fixes](../reports/TEAMMATE_FIXES.md),
[scheduling](../reports/SIGHTSEEING_QUALITY_REPAIR.md),
[local operations](LOCAL_PRODUCTION.md) and [test instructions](../tests/README.md).
