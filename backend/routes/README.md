# Backend Routes

**Status:** NOT STARTED (Planned Next Phase)

## Planned Route Files
1. `authRoutes.js` — User registration and login (`POST /api/auth/register`, `POST /api/auth/login`)
2. `destinationRoutes.js` — City list & Trie autocomplete search (`GET /api/destinations`, `GET /api/destinations/search`)
3. `attractionRoutes.js` — Intra-city attractions by destination ID (`GET /api/destinations/:id/attractions`)
4. `hotelRoutes.js` — Ranked hotel options by destination ID (`GET /api/destinations/:id/hotels`)
5. `restaurantRoutes.js` — Local dining options (`GET /api/destinations/:id/restaurants`)
6. `tripRoutes.js` — Intra-city trip creation & itinerary generation (`POST /api/trips`, `POST /api/trips/:id/generate-itinerary`)
7. `budgetRoutes.js` — Trip financial breakdown (`GET /api/trips/:id/budget`)
8. `adminRoutes.js` — Tour Operator CMS CRUD endpoints (`POST/PUT/DELETE /api/admin/*`)
