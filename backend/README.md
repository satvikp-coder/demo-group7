# Backend Service — Heritage Tourism Planner for Gujarat

**Status:** NOT STARTED (Planned Next Phase)  
**Tech Stack:** Node.js, Express.js, PostgreSQL (`pg` pool), JWT Authentication

## Architecture Overview
The backend service exposes a RESTful API powering city lookups, authentication, and intra-city trip generation. It communicates with PostgreSQL for database persistence and invokes the standalone `dsa/` engine for in-memory algorithm calculations.

## Folder Structure & Module Breakdown
- `routes/` — Endpoint definitions (`authRoutes.js`, `destinationRoutes.js`, `attractionRoutes.js`, `hotelRoutes.js`, `restaurantRoutes.js`, `tripRoutes.js`, `budgetRoutes.js`, `adminRoutes.js`)
- `controllers/` — Request handling logic & HTTP status responses
- `services/` — Business logic (`itineraryService.js`, `searchService.js`, `lookupService.js`)
- `models/` — Data access objects & SQL query interface
- `middleware/` — JWT authentication, role verification (Tourist vs. Tour Operator), and error handling
- `config/` — Environment variables & PostgreSQL database connection pool configuration
