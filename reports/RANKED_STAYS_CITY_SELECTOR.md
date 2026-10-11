# Ranked Stays city selection

Root cause: HotelsView resolved only selectedCityId or the first catalog row, with no city-changing control. Hotel-loading and errors also replaced the entire page.

Fix: accessible catalog-backed Select city dropdown, all eight real UUIDs and localized entity names. Initial itinerary context preserved; manual browsing does not modify saved itineraries. Category, sort and preferred-hotel mapping remain intact. Loading/error states now appear inside the list, so city switching stays available; keyed API state hides stale cards and cancels obsolete requests.

Validation executed: frontend TypeScript lint PASS; source audit zero secrets/unapproved UI changes; local:up PASS; local:demo:check7/7 PASS; read-only actual Chrome test24 city/viewport cases and72category/API identity comparisons PASS at1440/768/390. No database writes. Screenshots: ranked-stays-city-{width}.png; repeat: python tests/frontend/ranked_stays_city.py. Additional three-viewport error-recovery regression PASS: test-only503 hides stale cards while retaining selector; changing city restores real API records.

Scope: existing local application, no catalog/data/API changes or UI redesign. Publication authorized; included in the city-selector fix commit.
