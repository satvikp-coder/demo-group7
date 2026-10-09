# End-to-end integration

Catalog journey: React API client ? public catalog/children ? pg rows ? validated DTO ? destination/hotel views. Image-phase 16 city/viewport journeys cover all eight destinations and all eleven hotel records, plus 130 image/control groups with no final image/console/HTTP errors.

Plan journey: real isolated account ? login ? selected city/hotel/preferences ? POST trips ? POST generate ? snapshot queries/shared solver ? atomic stops/budget ? returned itinerary ? GET reload/profile ? GET budget equality. Owner access, forbidden account, bad inputs, infeasible budget and missing routes are exercised by HTTP/control suites. No paid/external booking action occurs.

Operator journey: isolated role ? validated catalog mutation ? committed SQL ? search cache invalidation ? catalog/search update; cleanup prevents dataset interference. Tests run sequentially. Profile navigation refreshes real owner records; intentional Remove hides locally. Session JWT is not a public shared-plan permission.

AUD-003 before evidence recorded budget 20000 after selecting 20500; after records 20500 in the actual request. AUD-004 confirmation resets on unsaved edits; AUD-005 modal title resolves and sharing explicitly requires owner sign-in. All targeted fixtures are in a newly created database, removed in finally.

Dependency/security scans, API client outage tests, research controls and production restart/outage/backup/restore tests are separate gates. reports/10_FINAL_PRODUCTION_READINESS.md gives current gate results; no older completed report substitutes for the rerun.
