# Itinerary route map

Scope: additive map panel in existing itinerary results; no second planner, catalog edit or schema migration. Saved stop UUIDs, order, day, coordinates and schedule are authoritative.

Open interactive route map loads React-Leaflet 5 / Leaflet 1.9.4 lazily (React 19 compatible). One day selector controls both map and visible schedule. Existing all-day schedule returns on close and prints all days. Numbered landmark/bed/restaurant markers and schedule cards share selected stop ID. Co-located stops retain their real coordinates; numbered selection buttons disambiguate overlaps. Missing coordinates produce a notice, not a false location.

Owner-protected GET /api/trips/:id/map/:day reads saved stops in a read-only transaction, then requests display geometry outside the DB transaction. It never changes saved routes, times or costs. The existing auth middleware is reused. Day limits and request rate limits apply.

The map is not fetched until opened; day responses are identity checked and cancelled on change/unmount. Provider geometry cache is directional and includes exact endpoints, mode and provider. Tile failures leave markers and textual itinerary accessible. A local map error boundary protects the schedule. OSM tiles use normal browser HTTP caching, visible attribution and no prefetch/offline download. Automated browser tests intercept tiles to avoid prohibited headless tile harvesting.

Files: backend/services/mapRouting.js, backend/routes/tripRoutes.js, backend/controllers/tripController.js, frontend/src/components/ItineraryRouteMap.tsx and .css, frontend/src/components/ItineraryView.tsx, frontend/src/api/index.ts, frontend/public/sw.js, frontend package/lock, backend/.env.example, compose.local.yml.

Limitations: public routing/tiles are best-effort external services. Co-located start/return hotel markers overlap geographically; the numbered buttons or timeline select either. PDF capture temporarily shows every saved day and omits the interactive map, then restores the selected-day view. Map tiles are not bundled into PDF/offline export; the textual itinerary and honest budget remain exportable.

## Local demonstration

1. Run `npm run local:up`, open http://localhost:8080 and sign in.
2. Generate a one- or multi-day itinerary with an eligible hotel and budget, or open an owned saved trip.
3. Select **Open interactive route map**. Change day; the map and schedule follow the same selector.
4. Click an attraction marker, then use Enter on a schedule stop. The matching marker/popup and schedule highlight follow the selection. Use numbered stop buttons for co-located hotel departure/return.
5. Inspect the legend: only validated provider legs are solid blue. Dashed lines explicitly represent straight-line connections; they do not show invented road travel times.
6. Inspect **Known subtotal** and unpriced expenses in both the itinerary and **View budget breakdown**.
7. Download the PDF while the map is open. Every saved day is included; interactive tiles are omitted. Closing the map restores the all-day schedule.

No map request occurs before opening. If the external provider is unavailable, continue the same demonstration with clearly labeled estimated connections; itinerary generation does not depend on this display provider.
