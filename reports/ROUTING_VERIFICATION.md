# Routing evidence

Existing database routes provide directional distance/time estimates, not road polylines. The map does not draw graph edges and call them roads.

Display routing uses OSRM at https://routing.openstreetmap.de/routed-car, configurable server-side MAP_ROUTING_URL. Empty value disables external routing. Only coordinates are sent, never trip IDs, tokens, usernames or budgets. Requests have a descriptive User-Agent, global serialization and at least 1.1 seconds between starts, 3.5-second provider timeout and 18-second day deadline; no retries. Cache: 500 directional legs, 24 hours positive / 60 seconds unavailable. This is for modest local interactive usage, not unlimited production traffic.

Validation requires OSRM Ok, numeric nonnegative distance/duration, bounded valid GeoJSON LineString, endpoints and snapped waypoints within 200m. Solid blue = validated provider geometry. Dashed gold = Haversine straight-line only, no invented travel time. Invalid coordinates create no connection. Coverage counts distinguish partial routing. A new road estimate may differ from historic saved planning metrics; it does not overwrite them or confirm access/live traffic.

Live check: reports/map-live-routing.json records one actual Modhera Sunrise Resort to Modhera Sun Temple response: 16 coordinate pairs, 0.4609 km, 1.1033 minutes provider estimate. This proves only that connection. Other destinations' tests use explicitly offline routing and deterministic provider fixtures, not claims of live road verification everywhere.

Policies checked 2026-10-19:
- https://routing.openstreetmap.de/about.html (one request/sec maximum, no scraping/heavy use)
- https://operations.osmfoundation.org/policies/tiles/ (attribution, normal HTTP caching/referrer, no bulk or headless harvesting)
- https://project-osrm.org/docs/v5.24.0/api/ (longitude/latitude order and route response)

Run `node scripts/verify-live-map-route.js` only deliberately; it performs one live public-catalog routing request.
